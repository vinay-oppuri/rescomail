import { NextResponse } from "next/server";
import { db, resumes } from "@repo/db";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    // 1. Verify API Key locally before forwarding
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

    // Proxy request to the Python FastAPI Microservice
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    
    console.log(`[Next.js API] Proxying parse request to ${aiServiceUrl}/parse`);
    
    const response = await fetch(`${aiServiceUrl}/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(expectedToken && { "Authorization": `Bearer ${expectedToken}` }),
      },
      body: JSON.stringify({ resumeId, fileUrl, fileName }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "AI Service Error", details: data.error || data.detail || "Unknown error" },
        { status: response.status }
      );
    }

    // 3. Save parsed JSON to Database
    await db
      .update(resumes)
      .set({
        status: "parsed",
        parsedJson: data,
        parsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, resumeId));

    console.log(`=== [PIPELINE SUCCESS] Saved Database Record for Resume ID: ${resumeId} ===\n`);

    return NextResponse.json({
      success: true,
      message: "Resume parsed successfully by Python AI Service",
      resumeId,
    });
  } catch (error) {
    console.error("Parser proxy execution failed:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
