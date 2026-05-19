from app.models.ats import SCORING_WEIGHTS
from app.schemas.ats import AtsJobProfile, AtsKeywordEvidence, AtsScoreBreakdown
from app.schemas.resume import StructuredResume

from .score_categories import (
    score_experience,
    score_formatting,
    score_impact,
    score_keyword_evidence,
    score_semantic_depth,
    score_skills,
)


def build_score_breakdown(
    evidence: list[AtsKeywordEvidence],
    normalized_resume: str,
    normalized_job: str,
    job_profile: AtsJobProfile,
    structured_resume: StructuredResume | None,
) -> AtsScoreBreakdown:
    keyword_score = score_keyword_evidence(evidence, job_profile.requiredKeywords)

    return AtsScoreBreakdown(
        keywords=keyword_score,
        semantic=score_semantic_depth(evidence),
        skills=score_skills(evidence, normalized_resume, structured_resume),
        experience=score_experience(
            normalized_resume,
            normalized_job,
            job_profile,
            keyword_score,
        ),
        impact=score_impact(normalized_resume),
        formatting=score_formatting(normalized_resume, structured_resume),
    )


def weighted_score(scores: AtsScoreBreakdown) -> int:
    weighted_total = (
        scores.keywords * SCORING_WEIGHTS["keywords"]
        + scores.semantic * SCORING_WEIGHTS["semantic"]
        + scores.skills * SCORING_WEIGHTS["skills"]
        + scores.experience * SCORING_WEIGHTS["experience"]
        + scores.impact * SCORING_WEIGHTS["impact"]
        + scores.formatting * SCORING_WEIGHTS["formatting"]
    )
    return round(weighted_total / sum(SCORING_WEIGHTS.values()))
