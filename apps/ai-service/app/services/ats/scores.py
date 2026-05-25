from app.models.ats import SCORING_WEIGHTS
from app.schemas.ats import AtsJobProfile, AtsKeywordEvidence, AtsScoreBreakdown
from app.schemas.resume import StructuredResume

from .score_categories import (
    clamp_score,
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
    semantic_match_score: int | None = None,
) -> AtsScoreBreakdown:
    keyword_score = score_keyword_evidence(evidence, job_profile.requiredKeywords)
    evidence_semantic_score = score_semantic_depth(evidence)
    semantic_score = (
        clamp_score(evidence_semantic_score * 0.55 + semantic_match_score * 0.45)
        if semantic_match_score is not None
        else evidence_semantic_score
    )

    return AtsScoreBreakdown(
        keywords=keyword_score,
        semantic=semantic_score,
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
