import {
  atsAnalysisResponseSchema,
  type AtsAnalysisResponse,
  type AtsAnalyzeInput,
} from "@repo/validations";
import { resumes } from "@repo/db";
import { serverEnv } from "@repo/env/server";

import { AtsAnalysisError } from "./ats-errors";

const AI_SERVICE_TIMEOUT_MS = 60_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const buildAiPayload = (
  input: AtsAnalyzeInput,
  resume: typeof resumes.$inferSelect,
) => {
  const payload: Record<string, unknown> = {
    resumeId: input.resumeId,
    jobTitle: input.jobTitle,
    companyName: input.companyName,
    jobDescription: input.jobDescription,
    targetKeywords: input.targetKeywords,
  };

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

export const runAiAtsAnalysis = async (
  input: AtsAnalyzeInput,
  resume: typeof resumes.$inferSelect,
): Promise<AtsAnalysisResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_SERVICE_TIMEOUT_MS);

  try {
    const response = await fetch(`${serverEnv.AI_SERVICE_URL}/ats/analyze`, {
      method: "POST",
      headers: aiServiceHeaders(),
      body: JSON.stringify(buildAiPayload(input, resume)),
      signal: controller.signal,
    });
    const data = await readJsonResponse(response);

    if (!response.ok) {
      const detail =
        isRecord(data) && "detail" in data ? data.detail : "Unknown AI error";

      throw new AtsAnalysisError(
        `ATS analysis failed: ${String(detail)}`,
        response.status >= 400 && response.status < 500 ? response.status : 502,
      );
    }

    const parsed = atsAnalysisResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new AtsAnalysisError(
        "AI service returned an invalid ATS analysis payload.",
        502,
      );
    }

    return parsed.data;
  } finally {
    clearTimeout(timeout);
  }
};

const aiServiceHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (serverEnv.RESUME_PARSER_API_KEY) {
    headers.Authorization = `Bearer ${serverEnv.RESUME_PARSER_API_KEY}`;
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
