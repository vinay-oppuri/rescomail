import { PreprocessedResume } from "./heuristics";

export interface StructuredResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
  };
  skills: string[];
  experience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
}

// Local fallback heuristics if Gemini is not available
function parseLocalHeuristics(preprocessed: PreprocessedResume): StructuredResume {
  console.log("[AI Structurer] No AI keys or error occurred, using local heuristics fallback...");

  // Skills
  const commonSkills = [
    "React", "TypeScript", "JavaScript", "Next.js", "Node.js", "Python", 
    "Java", "C++", "C#", "Go", "Ruby", "PHP", "HTML", "CSS", "Tailwind", 
    "PostgreSQL", "MongoDB", "MySQL", "SQLite", "SQL", "Git", "Docker", 
    "Kubernetes", "AWS", "REST APIs", "GraphQL", "Redux", "Linux"
  ];
  
  const skills: string[] = [];
  const fullRawText = `${preprocessed.skillsRaw}\n${preprocessed.experienceRaw}\n${preprocessed.otherRaw}`;
  for (const skill of commonSkills) {
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const skillRegex = new RegExp(`\\b${escapedSkill}\\b`, "i");
    if (skillRegex.test(fullRawText)) {
      skills.push(skill);
    }
  }

  // Experience
  const experience: any[] = [];
  const expLines = preprocessed.experienceRaw.split("\n").filter(Boolean);
  
  for (const line of expLines) {
    const dateMatch = line.match(/(?:19|20)\d{2}\s*[-–—]\s*(?:Present|(?:19|20)\d{2})/i);
    if (dateMatch) {
      const duration = dateMatch[0];
      const splitParts = line.split(duration);
      const rolePart = splitParts[0] || "";
      const role = rolePart.trim().replace(/[,|;]\s*$/, "");
      experience.push({
        role: role || "Software Engineer",
        company: "Company / Organization",
        duration: duration,
        description: "",
      });
    } else if (experience.length > 0) {
      const lastExp = experience[experience.length - 1];
      if (lastExp) {
        lastExp.description += (lastExp.description ? "\n" : "") + line;
      }
    }
  }

  // Education
  const education: any[] = [];
  const eduLines = preprocessed.educationRaw.split("\n").filter(Boolean);
  
  for (const line of eduLines) {
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? yearMatch[0] : "";
    const degree = line.replace(year, "").trim().replace(/[,|-]\s*$/, "");
    education.push({
      degree: degree || "Degree Certificate",
      school: "College / University",
      year: year,
    });
  }

  // Fallbacks if empty
  if (experience.length === 0) {
    experience.push({
      role: "Software Developer",
      company: "Company",
      duration: "Present",
      description: "Extracted work history details: " + preprocessed.experienceRaw.slice(0, 200)
    });
  }
  if (education.length === 0) {
    education.push({
      degree: "Professional Education",
      school: "Institution",
      year: "",
    });
  }

  return {
    personalInfo: {
      name: preprocessed.name,
      email: preprocessed.email,
      phone: preprocessed.phone,
    },
    skills: skills.length > 0 ? skills : ["General Professional Skills"],
    experience,
    education,
  };
}

export async function structureResume(preprocessed: PreprocessedResume): Promise<StructuredResume> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!geminiApiKey) {
    return parseLocalHeuristics(preprocessed);
  }

  try {
    console.log("[AI Structurer] Sending preprocessed sections to Gemini for structuring...");
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: `You are an ATS parser. 
Convert the following isolated resume sections into a clean, fully structured JSON matching the schema.

Contact Information:
Name: ${preprocessed.name}
Email: ${preprocessed.email}
Phone: ${preprocessed.phone}

Skills Section:
${preprocessed.skillsRaw}

Work Experience Section:
${preprocessed.experienceRaw}

Projects Section:
${preprocessed.projectsRaw}

Education Section:
${preprocessed.educationRaw}

Additional Information Section:
${preprocessed.otherRaw}

Rules:
1. Infer exact company names and roles from the Work Experience Section. If only projects exist, treat each project as an experience entry.
2. Under "experience", "description" must contain a detailed summary or bulleted points of achievements.
3. For the Projects Section, add each project as an experience entry with the project name as the role and the tech stack as part of the description.
4. Make sure skills is a clean flat string array extracted from all sections.
5. Conforms exactly to the specified JSON schema structure.`,
            }
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            personalInfo: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                email: { type: "STRING" },
                phone: { type: "STRING" },
              },
              required: ["name", "email", "phone"],
            },
            skills: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
            experience: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  role: { type: "STRING" },
                  company: { type: "STRING" },
                  duration: { type: "STRING" },
                  description: { type: "STRING" },
                },
                required: ["role", "company", "duration", "description"],
              },
            },
            education: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  degree: { type: "STRING" },
                  school: { type: "STRING" },
                  year: { type: "STRING" },
                },
                required: ["degree", "school", "year"],
              },
            },
          },
          required: ["personalInfo", "skills", "experience", "education"],
        },
      },
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    return JSON.parse(responseText) as StructuredResume;
  } catch (error) {
    console.error("[AI Structurer] AI parsing failed, falling back to heuristics:", error);
    return parseLocalHeuristics(preprocessed);
  }
}
