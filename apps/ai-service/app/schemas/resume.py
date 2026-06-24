from pydantic import BaseModel, Field


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
    description: str


class Education(BaseModel):
    degree: str
    school: str
    year: str


class Project(BaseModel):
    title: str
    description: str
    technologies: list[str]


class StructuredResume(BaseModel):
    personalInfo: PersonalInfo
    skills: list[str]
    experience: list[Experience]
    education: list[Education]
    projects: list[Project] = Field(default_factory=list)

