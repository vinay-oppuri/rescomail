import { describe, expect, it } from "vitest";
import { resumeDataFromParsedJson, ResumeSkillGroup } from "@/modules/resumes/ui/pdf/resume-pdf";

describe("resumeDataFromParsedJson skills parsing", () => {
  it("parses categorized skills array correctly", () => {
    const parsedJson = {
      personalInfo: {
        name: "Jane Doe",
        email: "jane@example.com",
      },
      skills: [
        {
          category: "Languages",
          skills: ["Python", "TypeScript", "Go"],
        },
        {
          category: "Frameworks & Tools",
          skills: ["React", "FastAPI", "Docker"],
        },
      ],
    };

    const resumeData = resumeDataFromParsedJson(parsedJson);

    expect(resumeData.skills).toEqual([
      {
        category: "Languages",
        skills: ["Python", "TypeScript", "Go"],
      },
      {
        category: "Frameworks & Tools",
        skills: ["React", "FastAPI", "Docker"],
      },
    ]);
  });

  it("handles legacy flat string skills array", () => {
    const parsedJson = {
      skills: ["Python", "FastAPI", "React"],
    };

    const resumeData = resumeDataFromParsedJson(parsedJson);

    expect(resumeData.skills).toEqual(["Python", "FastAPI", "React"]);
  });

  it("handles object map of categories to skills", () => {
    const parsedJson = {
      skills: {
        Languages: ["Python", "JavaScript"],
        Databases: ["PostgreSQL", "Redis"],
      },
    };

    const resumeData = resumeDataFromParsedJson(parsedJson);

    expect(resumeData.skills).toEqual([
      {
        category: "Languages",
        skills: ["Python", "JavaScript"],
      },
      {
        category: "Databases",
        skills: ["PostgreSQL", "Redis"],
      },
    ]);
  });

  it("handles comma-separated skill string inside group", () => {
    const parsedJson = {
      skills: [
        {
          category: "Languages",
          skills: "Python, TypeScript, SQL",
        },
      ],
    };

    const resumeData = resumeDataFromParsedJson(parsedJson);

    expect(resumeData.skills).toEqual([
      {
        category: "Languages",
        skills: ["Python", "TypeScript", "SQL"],
      },
    ]);
  });

  it("filters out invalid skill entries and empty strings", () => {
    const parsedJson = {
      skills: [
        "",
        null,
        123,
        { category: "", skills: [] },
        { category: "Cloud", skills: ["AWS", "  ", "GCP"] },
      ],
    };

    const resumeData = resumeDataFromParsedJson(parsedJson);

    expect(resumeData.skills).toEqual([
      {
        category: "Cloud",
        skills: ["AWS", "GCP"],
      },
    ]);
  });
});
