import { NextResponse } from "next/server";
import { db, resumes } from "@repo/db";
import { eq } from "drizzle-orm";

import { extractTextFromPdf } from "./text-extractor";
import { cleanAndNormalizeText } from "./cleaner";
import { preprocessWithHeuristics } from "./heuristics";
import { structureResume } from "./ai-structurer";
import { validateStructuredResume } from "./validator";

export async function POST(req: Request) {
  try {
    // 1. Verify API Key
    const authHeader = req.headers.get("Authorization");
    const expectedToken = process.env.RESUME_PARSER_API_KEY;

    if (expectedToken) {
      if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 2. Parse payload body
    const body = await req.json();
    const { resumeId, fileUrl, fileName } = body;

    if (!resumeId || !fileUrl) {
      return NextResponse.json(
        { error: "Missing resumeId or fileUrl" },
        { status: 400 }
      );
    }

    console.log(`\n=== [PIPELINE START] Parsing Resume ID: ${resumeId} ===`);

    // Step 1: Text Extraction (pdf-parse)
    const rawText = await extractTextFromPdf(fileUrl);
    console.log(`[Pipeline] Text extraction completed, length: ${rawText.length}`);

    // Step 2: Cleaning & Normalization
    const cleanedText = cleanAndNormalizeText(rawText);
    console.log(`[Pipeline] Cleaning completed, length: ${cleanedText.length}`);

    // Step 3: Heuristic & Regex Preprocessing
    const preprocessed = preprocessWithHeuristics(cleanedText, fileName);
    console.log(`[Pipeline] Preprocessing completed. Extracted Name: "${preprocessed.name}", Email: "${preprocessed.email}"`);

    // Step 4: AI Structuring (Gemini with schema or robust local fallback)
    const structuredRaw = await structureResume(preprocessed);
    console.log(`[Pipeline] AI / Heuristics structuring completed.`);

    // Step 5: Zod Schema Validation
    const validatedJson = validateStructuredResume(structuredRaw);
    console.log(`[Pipeline] Structure validation passed successfully.`);

    // Step 6: Direct DB Update (Neon Postgres via Drizzle)
    await db
      .update(resumes)
      .set({
        status: "parsed",
        parsedText: cleanedText,
        parsedJson: validatedJson,
        parsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, resumeId));

    console.log(`=== [PIPELINE SUCCESS] Saved Database Record for Resume ID: ${resumeId} ===\n`);

    return NextResponse.json({
      success: true,
      message: "Resume parsed successfully through modular pipeline",
      resumeId,
    });
  } catch (error) {
    console.error("Parser pipeline execution failed:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
