from app.schemas.ats import (
    AtsAnalysisResponse,
    AtsAnalyzeRequest,
    AtsCompatibilityPrediction,
    AtsGroundedSuggestion,
    AtsIntelligence,
    AtsJobProfile,
    AtsScoreBreakdown,
    AtsSemanticMatch,
    AtsSuggestion,
)
from app.utils.text import normalize_text
from .parsers import _clamp


def _fallback_response(resume_text: str, request: AtsAnalyzeRequest) -> AtsAnalysisResponse:
    text = normalize_text(resume_text)
    word_count = len(text.split())
    sections = sum(1 for m in {"skills", "experience", "education"} if m in text)
    formatting_score = _clamp(sections * 20 + (15 if 250 <= word_count <= 1200 else 5))

    return AtsAnalysisResponse(
        resumeId=request.resumeId,
        overallScore=40,
        verdict="needs_work",
        categoryScores=AtsScoreBreakdown(
            keywords=40, semantic=40, skills=40, experience=40, impact=30,
            formatting=formatting_score,
        ),
        jobProfile=AtsJobProfile(
            title=request.jobTitle or "Target role",
            seniority="mid",
            yearsRequired=0,
            requiredKeywords=request.targetKeywords or [],
            preferredKeywords=[],
            responsibilities=[],
            certifications=[],
        ),
        evidence=[],
        matchedKeywords=[],
        missingKeywords=request.targetKeywords or [],
        strengths=["Resume text was extracted and is ready for analysis."],
        risks=["AI analysis unavailable \u2014 showing basic structure check."],
        suggestions=[
            AtsSuggestion(
                priority="high",
                title="Retry ATS analysis",
                detail="The AI-powered analysis was temporarily unavailable. Please try again.",
                example=None,
            )
        ],
        rewriteSuggestions=[],
        intelligence=AtsIntelligence(
            semanticMatch=AtsSemanticMatch(
                resumeToJob=0, titleAlignment=0, requiredSkillCoverage=0,
                embeddingModel="fallback-template-v1", matchedConcepts=[],
            ),
            compatibilityPrediction=AtsCompatibilityPrediction(
                modelVersion="fallback-template-v1", modelType="template-fallback",
                probability=30, confidence="low", signals=[],
            ),
            skillGaps=[],
            recruiterGuidance=[
                AtsGroundedSuggestion(
                    title="Improve resume structure",
                    detail="Ensure your resume has clear sections for Contact, Skills, Experience, and Education with standard headings.",
                    citations=[],
                )
            ],
        ),
        summary=(
            f"ATS analysis is currently in fallback mode. "
            f"Your resume has {word_count} words and "
            f"{'appears to have' if sections > 0 else 'may be missing'} "
            f"standard ATS sections."
        ),
    )
