import { describe, expect, it } from "vitest";

import {
  extractJobDescription,
  JobDescriptionFileError,
} from "@/modules/ats/server/job-description-extraction";

const expectFileError = async (
  operation: Promise<string>,
  statusCode: number,
  message?: string,
) => {
  try {
    await operation;
    expect.fail("Expected job-description extraction to fail.");
  } catch (error) {
    expect(error).toBeInstanceOf(JobDescriptionFileError);
    expect((error as JobDescriptionFileError).statusCode).toBe(statusCode);
    if (message) expect((error as Error).message).toBe(message);
  }
};

describe("job description file extraction", () => {
  it("reads and normalizes Markdown files", async () => {
    const file = new File(
      ["# Backend Engineer\n\nBuild APIs   with TypeScript and PostgreSQL."],
      "job.md",
      { type: "text/markdown" },
    );

    await expect(extractJobDescription(file)).resolves.toBe(
      "# Backend Engineer\n\nBuild APIs with TypeScript and PostgreSQL.",
    );
  });

  it("rejects unsupported file formats", async () => {
    const file = new File(["This is a job description document."], "job.txt", {
      type: "text/plain",
    });

    await expectFileError(
      extractJobDescription(file),
      400,
      "Upload a PDF or Markdown file.",
    );
  });

  it("rejects files without enough readable text", async () => {
    const file = new File(["Too short"], "job.md", {
      type: "text/markdown",
    });

    await expectFileError(extractJobDescription(file), 422);
  });
});
