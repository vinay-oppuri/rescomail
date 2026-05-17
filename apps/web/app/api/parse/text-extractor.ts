import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");

// Disable worker for Node.js server-side usage
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = "";
}

// Resolve the getDocument function defensively
const getDocument: typeof pdfjs.getDocument =
  pdfjs.getDocument ?? pdfjs.default?.getDocument;

if (typeof getDocument !== "function") {
  throw new Error("[Text Extractor] pdfjs-dist: getDocument is not a function");
}

export async function extractTextFromPdf(fileUrl: string): Promise<string> {
  try {
    console.log("[Text Extractor] Fetching PDF from:", fileUrl);

    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(
        `[Text Extractor] Failed to fetch PDF: HTTP ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log(
      "[Text Extractor] Downloaded",
      arrayBuffer.byteLength,
      "bytes. Parsing..."
    );

    const loadingTask = getDocument({
      data: new Uint8Array(arrayBuffer),
      disableFontFace: true,
      useWorkerFetch: false,
    });

    const pdf = await loadingTask.promise;
    console.log(`[Text Extractor] PDF loaded. Pages: ${pdf.numPages}`);

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Use hasEOL to reconstruct proper line breaks.
      // pdfjs items with hasEOL=true signal the end of a rendered text line.
      let pageText = "";
      for (const item of textContent.items as any[]) {
        if (!("str" in item)) continue;
        pageText += item.str;
        if (item.hasEOL) {
          pageText += "\n";
        }
      }

      fullText += pageText + "\n";
    }

    const trimmed = fullText.trim();
    console.log(
      `[Text Extractor] Extraction complete. Characters: ${trimmed.length}`
    );

    if (trimmed.length < 50) {
      throw new Error(
        "[Text Extractor] Extracted text is too short — the PDF may be image-based or corrupted."
      );
    }

    return trimmed;
  } catch (error) {
    console.error("[Text Extractor] PDF parsing failed:", error);
    throw error;
  }
}