export interface PreprocessedResume {
  name: string;
  email: string;
  phone: string;
  skillsRaw: string;
  experienceRaw: string;
  educationRaw: string;
  projectsRaw: string;
  otherRaw: string;
}

export function preprocessWithHeuristics(
  rawText: string,
  fileName?: string
): PreprocessedResume {
  console.log("[Heuristics] Splitting resume into preprocessed sections...");

  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  // 1. Extract Email
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/i;
  let email = "";
  for (const line of lines) {
    const match = line.match(emailRegex);
    if (match) {
      email = match[0];
      break;
    }
  }

  // 2. Extract Phone
  const phoneRegex =
    /(?:\+?\d{1,3}[.\s-]?)?\(?\d{3}\)?[.\s-]?\d{3}[.\s-]?\d{4}/;
  let phone = "";
  for (const line of lines) {
    const match = line.match(phoneRegex);
    if (match) {
      phone = match[0];
      break;
    }
  }

  // 3. Extract Name — first line that isn't a contact detail or URL
  let name = "";
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line &&
      line.length > 2 &&
      !line.includes("@") &&
      !line.match(phoneRegex) &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("curriculum vitae") &&
      !line.toLowerCase().includes("cv") &&
      !line.toLowerCase().startsWith("http")
    ) {
      name = line;
      break;
    }
  }
  if (!name && fileName) {
    name = fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]/g, " ")
      .trim();
  }
  if (!name) name = "John Doe";

  // 4. Section-aware line splitting
  // Matches exact section header lines (case-insensitive)
  const SECTION_PATTERNS: Record<
    "skills" | "experience" | "education" | "projects" | "other",
    RegExp
  > = {
    skills: /^(technical\s+)?skills$|^expertise$|^core\s+competencies$/i,
    experience:
      /^(work\s+)?(experience|history)$|^employment(\s+history)?$|^professional\s+history$/i,
    education: /^education(al\s+background)?$|^academic(\s+background)?$|^credentials?$/i,
    projects: /^projects?$|^personal\s+projects?$|^key\s+projects?$/i,
    other:
      /^(summary|objective|profile|certifications?|awards?|honors?|languages?|publications?|references?|volunteering|activities)$/i,
  };

  // Lines to skip entirely (noise at end of PDF)
  const JUNK_PATTERNS = /^(\d{1,2}|references?\s+available.*)$/i;

  let currentSection: keyof typeof SECTION_PATTERNS = "other";
  const sectionsContent: Record<keyof typeof SECTION_PATTERNS, string[]> = {
    skills: [],
    experience: [],
    education: [],
    projects: [],
    other: [],
  };

  for (const line of lines) {
    // Skip junk lines (page numbers, "References available upon request")
    if (JUNK_PATTERNS.test(line)) continue;

    let matched = false;
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS) as [
      keyof typeof SECTION_PATTERNS,
      RegExp,
    ][]) {
      if (pattern.test(line)) {
        currentSection = section;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    sectionsContent[currentSection].push(line);
  }

  // Merge projects into experienceRaw so the AI structurer gets the full picture
  const combinedExperience = [
    ...sectionsContent.experience,
    ...(sectionsContent.projects.length > 0
      ? ["--- Projects ---", ...sectionsContent.projects]
      : []),
  ];

  return {
    name,
    email: email || "email@example.com",
    phone: phone || "Not Provided",
    skillsRaw: sectionsContent.skills.join("\n"),
    experienceRaw: combinedExperience.join("\n"),
    educationRaw: sectionsContent.education.join("\n"),
    projectsRaw: sectionsContent.projects.join("\n"),
    otherRaw: sectionsContent.other.join("\n"),
  };
}
