from typing import Literal

from pydantic import BaseModel, Field, model_validator

from .resume import StructuredResume


class AtsAnalyzeRequest(BaseModel):
    geminiApiKey: str | None = None
    resumeId: str | None = None
    fileUrl: str | None = None
    fileName: str | None = None
    resumeText: str | None = Field(default=None, max_length=100_000)
    structuredResume: StructuredResume | None = None
    jobTitle: str = Field(default="", max_length=200)
    companyName: str = Field(default="", max_length=200)
    jobDescription: str = Field(min_length=20, max_length=100_000)
    targetKeywords: list[str] = Field(default_factory=list, max_length=80)

    @model_validator(mode="after")
    def require_resume_source(self):
        has_resume_text = bool(self.resumeText and self.resumeText.strip())
        has_structured_resume = self.structuredResume is not None
        has_file = bool(self.fileUrl)

        if not (has_resume_text or has_structured_resume or has_file):
            raise ValueError(
                "Provide resumeText, structuredResume, or fileUrl."
            )

        self.targetKeywords = [
            keyword.strip()
            for keyword in self.targetKeywords
            if keyword and keyword.strip()
        ]

        return self


class AtsScoreBreakdown(BaseModel):
    keywords: int = Field(ge=0, le=100)
    semantic: int = Field(ge=0, le=100)
    skills: int = Field(ge=0, le=100)
    experience: int = Field(ge=0, le=100)
    impact: int = Field(ge=0, le=100)
    formatting: int = Field(ge=0, le=100)


class AtsSuggestion(BaseModel):
    priority: Literal["high", "medium", "low"]
    title: str
    detail: str
    example: str | None = None


class AtsJobProfile(BaseModel):
    title: str
    seniority: str
    yearsRequired: int
    requiredKeywords: list[str]
    preferredKeywords: list[str]
    responsibilities: list[str]
    certifications: list[str]


class AtsKeywordEvidence(BaseModel):
    keyword: str
    status: Literal["exact", "semantic", "missing"]
    strength: int = Field(ge=0, le=100)
    sourceSection: str
    snippets: list[str]


class AtsRewriteSuggestion(BaseModel):
    target: str
    reason: str
    before: str | None = None
    after: str


class AtsSemanticMatch(BaseModel):
    resumeToJob: int = Field(ge=0, le=100)
    titleAlignment: int = Field(ge=0, le=100)
    requiredSkillCoverage: int = Field(ge=0, le=100)
    embeddingModel: str
    matchedConcepts: list[str]


class AtsModelSignal(BaseModel):
    label: str
    impact: int = Field(ge=-100, le=100)
    direction: Literal["positive", "negative"]


class AtsCompatibilityPrediction(BaseModel):
    modelVersion: str
    modelType: str
    probability: int = Field(ge=0, le=100)
    confidence: Literal["low", "medium", "high"]
    signals: list[AtsModelSignal]


class AtsSkillGap(BaseModel):
    skill: str
    severity: Literal["critical", "important", "optional"]
    currentEvidence: Literal["missing", "weak", "semantic"]
    recommendation: str
    learningFocus: str


class AtsRetrievalCitation(BaseModel):
    id: str
    title: str
    sourceType: Literal["recruiter_guideline", "resume_pattern", "domain_knowledge"]
    relevance: int = Field(ge=0, le=100)


class AtsGroundedSuggestion(BaseModel):
    title: str
    detail: str
    citations: list[AtsRetrievalCitation]


class AtsIntelligence(BaseModel):
    semanticMatch: AtsSemanticMatch
    compatibilityPrediction: AtsCompatibilityPrediction
    skillGaps: list[AtsSkillGap]
    recruiterGuidance: list[AtsGroundedSuggestion]


class AtsAnalysisResponse(BaseModel):
    resumeId: str | None = None
    overallScore: int = Field(ge=0, le=100)
    verdict: Literal["strong_match", "good_match", "partial_match", "needs_work"]
    categoryScores: AtsScoreBreakdown
    jobProfile: AtsJobProfile
    evidence: list[AtsKeywordEvidence]
    matchedKeywords: list[str]
    missingKeywords: list[str]
    strengths: list[str]
    risks: list[str]
    suggestions: list[AtsSuggestion]
    rewriteSuggestions: list[AtsRewriteSuggestion]
    intelligence: AtsIntelligence
    summary: str
