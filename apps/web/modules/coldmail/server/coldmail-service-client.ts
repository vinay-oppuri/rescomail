import {
  coldEmailResponseSchema,
  type ColdEmailGenerateInput,
  type ColdEmailResponse,
} from "@repo/validations";
import { resumes } from "@repo/db";
import { serverEnv } from "@repo/env/server";

import { ColdmailError } from "./coldmail-errors";

const AI_SERVICE_TIMEOUT_MS = 60_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export type AiColdmailInput = ColdEmailGenerateInput & {
  companyContext: string;
};

export const buildAiColdmailPayload = (
  input: AiColdmailInput,
  resume: typeof resumes.$inferSelect,
  geminiApiKey?: string,
) => {
  const payload: Record<string, unknown> = {
    resumeId: input.resumeId,
    jobTitle: input.jobTitle,
    companyName: input.companyName,
    companyWebsiteUrl: input.companyWebsiteUrl,
    recipientName: input.recipientName,
    recipientRole: input.recipientRole,
    jobDescription: input.jobDescription,
    companyContext: input.companyContext,
    tone: input.tone,
    length: input.length,
    callToAction: input.callToAction,
  };

  if (geminiApiKey) {
    payload.geminiApiKey = geminiApiKey;
  }

  if (isRecord(resume.parsedJson)) {
    payload.structuredResume = resume.parsedJson;
    return payload;
  }

  if (resume.parsedText?.trim()) {
    payload.resumeText = resume.parsedText;
    return payload;
  }

  payload.fileUrl = resume.fileUrl;
  payload.fileName = resume.fileName;
  return payload;
};

export const runAiColdmailGeneration = async (
  input: AiColdmailInput,
  resume: typeof resumes.$inferSelect,
  userId: string,
  geminiApiKey?: string,
): Promise<ColdEmailResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_SERVICE_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${serverEnv.AI_SERVICE_URL}/coldmail/generate`,
      {
        method: "POST",
        headers: aiServiceHeaders(userId),
        body: JSON.stringify(
          buildAiColdmailPayload(input, resume, geminiApiKey),
        ),
        signal: controller.signal,
      },
    ).catch((err: unknown) => {
      if (err instanceof Error && err.name === "AbortError") {
        throw new ColdmailError("AI service request timed out.", 504);
      }
      throw err;
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      let detail =
        isRecord(data) && "detail" in data ? data.detail : "Unknown AI error";

      // Do not leak internal Python errors (500) to the client
      if (response.status >= 500) {
        detail = "Internal AI service error";
      }

      throw new ColdmailError(
        `Cold email generation failed: ${String(detail)}`,
        response.status >= 400 && response.status < 500 ? response.status : 502,
      );
    }

    const parsed = coldEmailResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ColdmailError(
        "AI service returned an invalid cold email payload.",
        502,
      );
    }

    return parsed.data;
  } finally {
    clearTimeout(timeout);
  }
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
