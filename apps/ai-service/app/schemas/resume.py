from typing import Any
from pydantic import BaseModel, Field, field_validator


class ParseRequest(BaseModel):
    geminiApiKey: str | None = None
    resumeId: str
    fileUrl: str
    fileName: str


class PersonalInfo(BaseModel):
    name: str
    email: str
    phone: str
    portfolioUrl: str | None = None
    githubUrl: str | None = None
    linkedinUrl: str | None = None


class Experience(BaseModel):
    role: str
    company: str
    duration: str
    description: list[str]


class Education(BaseModel):
    degree: str
    school: str
    year: str


class Project(BaseModel):
    title: str
    description: list[str]
    technologies: list[str]
    githubUrl: str | None = None
    liveUrl: str | None = None


class SkillGroup(BaseModel):
    category: str = ""
    skills: list[str] = Field(default_factory=list)

    @field_validator("skills", mode="before")
    @classmethod
    def _coerce_skills(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        if isinstance(v, list):
            return [str(s).strip() for s in v if str(s).strip()]
        return []


class StructuredResume(BaseModel):
    personalInfo: PersonalInfo
    summary: str | None = None
    skills: list[SkillGroup | str] = Field(default_factory=list)
    experience: list[Experience]
    education: list[Education]
    projects: list[Project] = Field(default_factory=list)

    @field_validator("skills", mode="before")
    @classmethod
    def _coerce_skills_list(cls, v: Any) -> list[Any]:
        if isinstance(v, dict):
            return [{"category": k, "skills": val} for k, val in v.items()]
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return []


