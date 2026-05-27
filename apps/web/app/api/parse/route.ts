import { NextResponse } from "next/server";
import { serverEnv } from "@repo/env/server";
import { db, resumes } from "@repo/db";
import { resumeParserWebhookSchema } from "@repo/validations";
import { and, eq } from "drizzle-orm";

const PARSER_TIMEOUT_MS = 60_000;

const parseRequestJson = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
};

const readJsonResponse = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { error: text };
  }
};

export async function POST(req: Request) {
  let resumeContext: {
    resumeId: string;
    userId: string;
  } | null = null;

  try {
    const authHeader = req.headers.get("Authorization");
    const expectedToken = serverEnv.RESUME_PARSER_API_KEY;

    if (!expectedToken) {
      return NextResponse.json(
        { error: "Resume parser API key is not configured." },
        { status: 503 },
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = resumeParserWebhookSchema.safeParse(
      await parseRequestJson(req),
    );

    if (!payload.success) {
      return NextResponse.json(
        { error: "Invalid parser payload", details: payload.error.flatten() },
        { status: 400 },
      );
    }

    const { resumeId, userId, fileUrl, fileKey, fileName } = payload.data;
    resumeContext = { resumeId, userId };

    const resume = await db.query.resumes.findFirst({
      where: and(eq(resumes.id, resumeId), eq(resumes.userId, userId)),
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Idempotency guard: if already parsed, return success without re-processing.
    // This handles AI service retries after transient failures on the webhook callback.
    if (resume.status === "parsed") {
      return NextResponse.json({
        success: true,
        message: "Resume already parsed — skipping duplicate webhook.",
        resumeId,
      });
    }

    if (
      resume.fileUrl !== fileUrl ||
      resume.fileKey !== fileKey ||
      resume.fileName !== fileName
    ) {
      return NextResponse.json(
        { error: "Parser payload does not match the stored resume." },
        { status: 409 },
      );
    }

    await db
      .update(resumes)
      .set({
        status: "processing",
        parsingError: null,
        updatedAt: new Date(),
      })
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PARSER_TIMEOUT_MS);

    const response = await fetch(`${serverEnv.AI_SERVICE_URL}/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${expectedToken}`,
      },
      body: JSON.stringify({
        resumeId,
        fileUrl: resume.fileUrl,
        fileName: resume.fileName,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await readJsonResponse(response);

    if (!response.ok) {
      const details =
        data && typeof data === "object" && "detail" in data
          ? data.detail
          : "Unknown parser service error";

      await db
        .update(resumes)
        .set({
          status: "parse_failed",
          parsingError: String(details),
          updatedAt: new Date(),
        })
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

      return NextResponse.json(
        { error: "AI Service Error", details },
        { status: response.status },
      );
    }

    await db
      .update(resumes)
      .set({
        status: "parsed",
        parsedJson: data,
        parsingError: null,
        parsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

    return NextResponse.json({
      success: true,
      message: "Resume parsed successfully by Python AI Service",
      resumeId,
    });
  } catch (error) {
    if (resumeContext) {
      const reason =
        error instanceof Error ? error.message : "Unknown parser proxy error";

      await db
        .update(resumes)
        .set({
          status: "parse_failed",
          parsingError: reason,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(resumes.id, resumeContext.resumeId),
            eq(resumes.userId, resumeContext.userId),
          ),
        );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
