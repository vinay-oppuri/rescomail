import { db, resumes } from "@repo/db";
import { serverEnv } from "@repo/env/server";
import { eq } from "drizzle-orm";

export type TriggerResumeParsingInput = {
  resumeId: string;
  userId: string;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
};

type ParsingTriggerResult =
  | {
      status: "queued";
      triggered: false;
      reason: "missing_webhook";
    }
  | {
      status: "processing";
      triggered: true;
    }
  | {
      status: "parse_failed";
      triggered: false;
      reason: string;
    };

const markResumeStatus = async (
  resumeId: string,
  status: string,
  parsingError?: string | null,
) => {
  await db
    .update(resumes)
    .set({
      status,
      parsingError,
      updatedAt: new Date(),
    })
    .where(eq(resumes.id, resumeId));
};

const PARSER_TRIGGER_TIMEOUT_MS = 10_000;

export const triggerResumeParsing = async (
  input: TriggerResumeParsingInput,
): Promise<ParsingTriggerResult> => {
  const parserWebhookUrl = serverEnv.RESUME_PARSER_WEBHOOK_URL;

  if (!parserWebhookUrl) {
    await markResumeStatus(input.resumeId, "queued", null);

    return {
      status: "queued",
      triggered: false,
      reason: "missing_webhook",
    };
  }

  if (!serverEnv.RESUME_PARSER_API_KEY) {
    await markResumeStatus(
      input.resumeId,
      "parse_failed",
      "Resume parser API key is not configured.",
    );

    return {
      status: "parse_failed",
      triggered: false,
      reason: "missing_parser_api_key",
    };
  }

  try {
    await markResumeStatus(input.resumeId, "processing", null);

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      PARSER_TRIGGER_TIMEOUT_MS,
    );

    const response = await fetch(parserWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serverEnv.RESUME_PARSER_API_KEY}`,
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const details = await response.text();

      throw new Error(
        details
          ? `Parser webhook failed with ${response.status}: ${details}`
          : `Parser webhook failed with ${response.status}`,
      );
    }

    return {
      status: "processing",
      triggered: true,
    };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Unknown parser trigger error";

    await markResumeStatus(input.resumeId, "parse_failed", reason);

    return {
      status: "parse_failed",
      triggered: false,
      reason,
    };
  }
};
