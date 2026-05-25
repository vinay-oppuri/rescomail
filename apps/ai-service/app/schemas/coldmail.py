from typing import Literal

from pydantic import BaseModel, Field, model_validator

from .resume import StructuredResume


ColdEmailTone = Literal["warm", "confident", "direct", "friendly"]
ColdEmailLength = Literal["concise", "standard", "detailed"]
ColdEmailCallToAction = Literal["conversation", "referral", "interview", "feedback"]


class ColdEmailGenerateRequest(BaseModel):
    resumeId: str | None = None
    fileUrl: str | None = None
    fileName: str | None = None
    resumeText: str | None = Field(default=None, max_length=100_000)
    structuredResume: StructuredResume | None = None
    jobTitle: str = Field(default="", max_length=200)
    companyName: str = Field(default="", max_length=200)
    companyWebsiteUrl: str = Field(default="", max_length=500)
    recipientName: str = Field(default="", max_length=120)
    recipientRole: str = Field(default="", max_length=160)
    jobDescription: str = Field(min_length=20, max_length=100_000)
    companyContext: str = Field(default="", max_length=2_000)
    personalNote: str = Field(default="", max_length=1_000)
    tone: ColdEmailTone = "warm"
    length: ColdEmailLength = "standard"
    callToAction: ColdEmailCallToAction = "conversation"

    @model_validator(mode="after")
    def clean_and_require_resume_source(self):
        has_resume_text = bool(self.resumeText and self.resumeText.strip())
        has_structured_resume = self.structuredResume is not None
        has_file = bool(self.fileUrl)

        if not (has_resume_text or has_structured_resume or has_file):
            raise ValueError("Provide resumeText, structuredResume, or fileUrl.")

        self.jobTitle = self.jobTitle.strip()
        self.companyName = self.companyName.strip()
        self.companyWebsiteUrl = self.companyWebsiteUrl.strip()
        self.recipientName = self.recipientName.strip()
        self.recipientRole = self.recipientRole.strip()
        self.jobDescription = self.jobDescription.strip()
        self.companyContext = self.companyContext.strip()
        self.personalNote = self.personalNote.strip()

        return self


class ColdEmailResponse(BaseModel):
    resumeId: str | None = None
    subject: str = Field(min_length=1, max_length=160)
    previewText: str = Field(min_length=1, max_length=240)
    body: str = Field(min_length=20, max_length=8_000)
    followUpSubject: str = Field(min_length=1, max_length=160)
    followUpBody: str = Field(min_length=20, max_length=8_000)
    personalizationNotes: list[str] = Field(default_factory=list, max_length=6)
    qualityScore: int = Field(ge=0, le=100)
    estimatedReadTimeSeconds: int = Field(ge=10, le=300)
    companyContext: str | None = Field(default=None, max_length=2_000)
