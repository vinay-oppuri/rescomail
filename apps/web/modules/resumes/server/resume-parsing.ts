import { db, resumes } from "@repo/db";
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

export const triggerResumeParsing = async (
  input: TriggerResumeParsingInput,
): Promise<ParsingTriggerResult> => {
  const parserWebhookUrl = process.env.RESUME_PARSER_WEBHOOK_URL?.trim();

  if (!parserWebhookUrl) {
    await markResumeStatus(input.resumeId, "queued", null);

    return {
      status: "queued",
      triggered: false,
      reason: "missing_webhook",
    };
  }

  try {
    await markResumeStatus(input.resumeId, "processing", null);

    const response = await fetch(parserWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.RESUME_PARSER_API_KEY
          ? { Authorization: `Bearer ${process.env.RESUME_PARSER_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Parser webhook failed with ${response.status}`);
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
