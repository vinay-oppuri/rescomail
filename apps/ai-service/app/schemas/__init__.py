"""Pydantic API schemas."""

from .resume import (
    Education,
    Experience,
    ParseRequest,
    PersonalInfo,
    SkillGroup,
    StructuredResume,
)
from .ats import (
    AtsAnalysisResponse,
    AtsAnalyzeRequest,
    AtsJobProfile,
    AtsKeywordEvidence,
    AtsRewriteSuggestion,
    AtsScoreBreakdown,
    AtsSuggestion,
)
from .coldmail import ColdEmailGenerateRequest, ColdEmailResponse

__all__ = [
    "AtsAnalysisResponse",
    "AtsAnalyzeRequest",
    "AtsJobProfile",
    "AtsKeywordEvidence",
    "AtsRewriteSuggestion",
    "AtsScoreBreakdown",
    "AtsSuggestion",
    "ColdEmailGenerateRequest",
    "ColdEmailResponse",
    "Education",
    "Experience",
    "ParseRequest",
    "PersonalInfo",
    "SkillGroup",
    "StructuredResume",
]
