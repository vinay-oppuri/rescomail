export function cleanAndNormalizeText(text: string): string {
  if (!text) return "";
  
  console.log("[Cleaner] Cleaning and normalizing text...");

  let cleaned = text
    // Normalize Unicode bullet points and dashes
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, "-") // Standardize bullets to dash
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, "-") // Normalize hyphens and dashes
    // Remove null bytes
    .replace(/\u0000/g, "")
    // Normalize line endings to standard LF
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // Split lines, trim them, and filter out multiple consecutive blank lines
  const lines = cleaned.split("\n").map(line => line.trim());
  
  const finalLines: string[] = [];
  let consecutiveBlanks = 0;

  for (const line of lines) {
    if (line === "") {
      consecutiveBlanks++;
      // Limit blank lines to at most 1 consecutive blank line
      if (consecutiveBlanks <= 1) {
        finalLines.push("");
      }
    } else {
      consecutiveBlanks = 0;
      // Collapse multiple consecutive internal whitespace into single space
      finalLines.push(line.replace(/\s+/g, " "));
    }
  }

  return finalLines.join("\n").trim();
}
