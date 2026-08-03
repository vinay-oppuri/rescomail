import "server-only";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_JOB_DESCRIPTION_CHARACTERS = 100_000;
const MAX_PDF_PAGES = 30;
const PDF_EXTRACTION_TIMEOUT_MS = 15_000;

const PDF_MIME_TYPE = "application/pdf";
const MARKDOWN_EXTENSIONS = [".md", ".markdown"];

export class JobDescriptionFileError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
    this.name = "JobDescriptionFileError";
  }
}

const hasExtension = (fileName: string, extensions: string[]) => {
  const normalizedName = fileName.toLowerCase();
  return extensions.some((extension) => normalizedName.endsWith(extension));
};

const isPdf = (file: File) =>
  file.type === PDF_MIME_TYPE || hasExtension(file.name, [".pdf"]);

const isMarkdown = (file: File) =>
  file.type === "text/markdown" || hasExtension(file.name, MARKDOWN_EXTENSIONS);

const withTimeout = async <Result>(promise: Promise<Result>) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("PDF extraction timed out.")),
      PDF_EXTRACTION_TIMEOUT_MS,
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const extractPdfText = async (file: File) => {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const data = new Uint8Array(await file.arrayBuffer());
  const document = await getDocumentProxy(data, {
    maxImageSize: 16_777_216,
  });

  try {
    if (document.numPages > MAX_PDF_PAGES) {
      throw new JobDescriptionFileError(
        `PDF must have ${MAX_PDF_PAGES} pages or fewer.`,
        413,
      );
    }

    const result = await withTimeout(
      extractText(document, { mergePages: true }),
    );
    return result.text;
  } finally {
    await document.cleanup();
  }
};

const normalizeText = (text: string) =>
  text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const extractJobDescription = async (file: File) => {
  if (file.size === 0) {
    throw new JobDescriptionFileError("The selected file is empty.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new JobDescriptionFileError("File must be 5 MB or smaller.", 413);
  }
  if (!isPdf(file) && !isMarkdown(file)) {
    throw new JobDescriptionFileError("Upload a PDF or Markdown file.");
  }

  let rawText: string;
  try {
    rawText = isPdf(file) ? await extractPdfText(file) : await file.text();
  } catch (error) {
    if (error instanceof JobDescriptionFileError) throw error;
    throw new JobDescriptionFileError(
      "The PDF could not be read. Try another PDF or paste the job description.",
      422,
    );
  }

  const text = normalizeText(rawText);

  if (text.length < 20) {
    throw new JobDescriptionFileError(
      "The file does not contain enough readable job-description text.",
      422,
    );
  }
  if (text.length > MAX_JOB_DESCRIPTION_CHARACTERS) {
    throw new JobDescriptionFileError(
      "The extracted job description is longer than 100,000 characters.",
      413,
    );
  }

  return text;
};
