import { serverEnv } from "@repo/env/server";

import { ColdmailError } from "./coldmail-errors";

const TAVILY_EXTRACT_ENDPOINT = "https://api.tavily.com/extract";
const TAVILY_TIMEOUT_MS = 20_000;
const MAX_COMPANY_CONTEXT_LENGTH = 2_000;

interface CompanyContextInput {
  companyWebsiteUrl: string;
  companyName: string;
  jobTitle: string;
}

interface TavilyExtractResponse {
  results?: Array<{
    url?: string;
    raw_content?: unknown;
  }>;
  failed_results?: Array<{
    url?: string;
    error?: string;
  }>;
  request_id?: string;
}

export const getCompanyContextFromWebsite = async ({
  companyWebsiteUrl,
  companyName,
  jobTitle,
}: CompanyContextInput) => {
  if (!serverEnv.TAVILY_API_KEY) {
    throw new ColdmailError("TAVILY_API_KEY is not configured.", 503);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TAVILY_TIMEOUT_MS);

  try {
    const response = await fetch(TAVILY_EXTRACT_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverEnv.TAVILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls: companyWebsiteUrl,
        query: buildCompanyContextQuery(companyName, jobTitle),
        chunks_per_source: 5,
        extract_depth: "basic",
        format: "text",
        include_images: false,
        include_favicon: false,
        timeout: 12,
        include_usage: true,
      }),
      signal: controller.signal,
    });
    const data = await readJsonResponse<TavilyExtractResponse>(response);

    if (!response.ok) {
      throw new ColdmailError(
        `Company context extraction failed: ${extractTavilyError(data)}`,
        response.status >= 400 && response.status < 500 ? response.status : 502,
      );
    }

    const context = buildCompanyContext(data, companyWebsiteUrl);

    if (!context) {
      throw new ColdmailError(
        "Unable to extract useful company context from that website.",
        422,
      );
    }

    return context;
  } finally {
    clearTimeout(timeout);
  }
};

const buildCompanyContextQuery = (companyName: string, jobTitle: string) =>
  [
    companyName,
    jobTitle,
    "company overview products mission customers values hiring team recent launches",
  ]
    .filter(Boolean)
    .join(" ");

const buildCompanyContext = (
  data: TavilyExtractResponse | null,
  companyWebsiteUrl: string,
) => {
  const rawContent =
    data?.results
      ?.map((result) =>
        typeof result.raw_content === "string" ? result.raw_content : "",
      )
      .filter(Boolean)
      .join("\n\n") ?? "";

  const normalized = normalizeExtractedText(rawContent);

  if (!normalized) {
    return "";
  }

  return clampText(
    `Company website: ${companyWebsiteUrl}\nExtracted company context: ${normalized}`,
    MAX_COMPANY_CONTEXT_LENGTH,
  );
};

const normalizeExtractedText = (value: string) =>
  value
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const clampText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trim()}...`;
};

const extractTavilyError = (data: unknown) => {
  if (data && typeof data === "object") {
    if ("error" in data) {
      return String(data.error);
    }

    if ("detail" in data) {
      return String(data.detail);
    }

    if ("failed_results" in data) {
      return "The website could not be extracted.";
    }
  }

  return "Unknown Tavily error";
};

const readJsonResponse = async <T>(response: Response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: text } as T;
  }
};
