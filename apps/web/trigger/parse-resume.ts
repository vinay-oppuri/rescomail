import { logger, task } from "@trigger.dev/sdk/v3";
import { db, resumes, userPreferences } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { serverEnv } from "@repo/env/server";
import { decryptSecret } from "@/lib/server/secrets";
import { consumeUsage, releaseUsage } from "@/modules/dashboard/server/usage-limits";

const AI_SERVICE_TIMEOUT_MS = 120_000;

type ParseResumePayload = {
  resumeId: string;
  userId: string;
  fileUrl: string;
  fileName: string;
};

const aiServiceHeaders = (userId: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Rescomail-User-Id": userId,
  };

  if (serverEnv.AI_SERVICE_API_KEY) {
    headers.Authorization = `Bearer ${serverEnv.AI_SERVICE_API_KEY}`;
  }

  return headers;
};

const getFailureMessage = (error: unknown) => {
  if (
    error instanceof Error &&
    error.message.startsWith("Resume parsing failed:")
  ) {
    return error.message;
  }

  return "Resume parsing failed after retries.";
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

export const parseResumeTask = task({
  id: "parse-resume",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5000,
  },
  run: async (payload: ParseResumePayload) => {
    const { resumeId, userId, fileUrl, fileName } = payload;

    logger.log(`Starting parse job for resume: ${resumeId}`);

    const resume = await db.query.resumes.findFirst({
      where: and(eq(resumes.id, resumeId), eq(resumes.userId, userId)),
    });

    if (!resume) {
      throw new Error(`Resume not found: ${resumeId}`);
    }

    if (resume.status === "parsed") {
      await consumeUsage(resumeId);
      logger.log("Resume already parsed - skipping duplicate run.");
      return { success: true, alreadyParsed: true };
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
    const timeout = setTimeout(() => controller.abort(), AI_SERVICE_TIMEOUT_MS);

    try {
      const prefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      const response = await fetch(`${serverEnv.AI_SERVICE_URL}/parse`, {
        method: "POST",
        headers: aiServiceHeaders(userId),
        body: JSON.stringify({
          resumeId,
          fileUrl,
          fileName,
          geminiApiKey: decryptSecret(prefs?.geminiApiKey, payload.userId, "gemini") ?? undefined,
        }),
        signal: controller.signal,
      }).catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error(
            "Resume parsing failed: AI service request timed out.",
          );
        }

        throw error;
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        const details =
          data && typeof data === "object" && "detail" in data
            ? data.detail
            : "Unknown parser service error";
        const message =
          response.status >= 500
            ? "Internal AI service error"
            : String(details);

        logger.error(
          `AI parser service error (${response.status}): ${String(details)}`,
        );
        throw new Error(`Resume parsing failed: ${message}`);
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

      await consumeUsage(resumeId, { fileSize: resume.fileSize });

      logger.log(`Successfully parsed resume: ${resumeId}`);

      return { success: true };
    } finally {
      clearTimeout(timeout);
    }
  },
  onFailure: async ({ payload, error }) => {
    const reason = getFailureMessage(error);

    logger.error(`Resume parse failed permanently: ${reason}`);

    await releaseUsage(payload.resumeId);

    await db
      .update(resumes)
      .set({
        status: "parse_failed",
        parsingError: reason,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(resumes.id, payload.resumeId),
          eq(resumes.userId, payload.userId),
        ),
      );
  },
});
