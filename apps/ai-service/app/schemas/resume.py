from pydantic import BaseModel


class ParseRequest(BaseModel):
    resumeId: str
    fileUrl: str
    fileName: str


class PersonalInfo(BaseModel):
    name: str
    email: str
    phone: str


class Experience(BaseModel):
    role: str
    company: str
    duration: str
    description: str


class Education(BaseModel):
    degree: str
    school: str
    year: str


class StructuredResume(BaseModel):
    personalInfo: PersonalInfo
    skills: list[str]
    experience: list[Experience]
    education: list[Education]
