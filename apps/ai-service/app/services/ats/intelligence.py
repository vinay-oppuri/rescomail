"""
ats/intelligence.py
-------------------
Orchestrates the ATS intelligence layer.

Coordinates:
  - Semantic match scoring         (embedding + concept extraction)
  - Compatibility prediction       (trained logistic model + cross-encoder)
  - Skill-gap analysis             → ats/gaps.py
  - RAG-grounded recruiter guidance → ats/guidance.py

All heavy logic lives in dedicated sub-modules for easy debugging.
"""
import json
import math
from functools import lru_cache
from pathlib import Path

from app.embeddings.reranker import (
    cross_encoder_relevance_score,
    reranker_backend,
    reranker_model_name,
)
from app.embeddings.semantic import (
    embedding_backend,
    embedding_model_name,
    semantic_similarity_score,
    shared_concepts,
)
from app.schemas.ats import (
    AtsCompatibilityPrediction,
    AtsIntelligence,
    AtsJobProfile,
    AtsKeywordEvidence,
    AtsModelSignal,
    AtsScoreBreakdown,
    AtsSemanticMatch,
    AtsSkillGap,
)
from app.services.ats.gaps import build_skill_gaps
from app.services.ats.guidance import build_grounded_guidance
from app.services.ats.helpers import display_keyword, max_years
from app.utils.text import normalize_keyword, tokenize

MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "models"
    / "artifacts"
    / "ats_compatibility_v1.json"
)

SIGNAL_LABELS = {
    "keywordEvidence": "Keyword evidence",
    "semanticMatch": "Resume/job semantic match",
    "crossEncoderRelevance": "Trained cross-encoder relevance",
    "skillCoverage": "Required skill coverage",
    "experienceFit": "Experience fit",
    "impactEvidence": "Measurable impact",
    "formattingQuality": "ATS parse quality",
    "seniorityAlignment": "Seniority alignment",
}


def build_intelligence(
    resume_text: str,
    job_description: str,
    normalized_resume: str,
    job_profile: AtsJobProfile,
    evidence: list[AtsKeywordEvidence],
    category_scores: AtsScoreBreakdown,
    semantic_resume_job: int,
) -> AtsIntelligence:
    semantic_match = _semantic_match(
        resume_text,
        job_description,
        job_profile,
        evidence,
        semantic_resume_job,
    )
    prediction = _compatibility_prediction(
        resume_text,
        job_description,
        normalized_resume,
        job_profile,
        category_scores,
        semantic_match,
        len(evidence),
    )
    gaps = build_skill_gaps(evidence, job_profile)

    return AtsIntelligence(
        semanticMatch=semantic_match,
        compatibilityPrediction=prediction,
        skillGaps=gaps,
        recruiterGuidance=build_grounded_guidance(
            job_profile,
            gaps,
            category_scores,
            semantic_match.resumeToJob,
        ),
    )


# ---------------------------------------------------------------------------
# Semantic match
# ---------------------------------------------------------------------------

def _semantic_match(
    resume_text: str,
    job_description: str,
    job_profile: AtsJobProfile,
    evidence: list[AtsKeywordEvidence],
    semantic_resume_job: int,
) -> AtsSemanticMatch:
    title_alignment = (
        semantic_similarity_score(job_profile.title, resume_text)
        if job_profile.title
        else 65
    )
    required_terms = {normalize_keyword(keyword) for keyword in job_profile.requiredKeywords}
    required_evidence = [
        item for item in evidence if normalize_keyword(item.keyword) in required_terms
    ]
    required_coverage = _average_strength(required_evidence)
    concepts = [
        display_keyword(concept)
        for concept in shared_concepts(resume_text, job_description, limit=10)
    ]

    return AtsSemanticMatch(
        resumeToJob=semantic_resume_job,
        titleAlignment=title_alignment,
        requiredSkillCoverage=required_coverage,
        embeddingModel=f"{embedding_model_name()} ({embedding_backend()})",
        matchedConcepts=concepts,
    )


# ---------------------------------------------------------------------------
# Compatibility prediction
# ---------------------------------------------------------------------------

def _compatibility_prediction(
    resume_text: str,
    job_description: str,
    normalized_resume: str,
    job_profile: AtsJobProfile,
    category_scores: AtsScoreBreakdown,
    semantic_match: AtsSemanticMatch,
    evidence_count: int,
) -> AtsCompatibilityPrediction:
    model = _load_prediction_model()
    cross_encoder_relevance = cross_encoder_relevance_score(job_description, resume_text)
    features = {
        "keywordEvidence": category_scores.keywords / 100,
        "semanticMatch": semantic_match.resumeToJob / 100,
        "crossEncoderRelevance": cross_encoder_relevance / 100,
        "skillCoverage": semantic_match.requiredSkillCoverage / 100,
        "experienceFit": category_scores.experience / 100,
        "impactEvidence": category_scores.impact / 100,
        "formattingQuality": category_scores.formatting / 100,
        "seniorityAlignment": _seniority_alignment(normalized_resume, job_profile),
    }
    weights: dict[str, float] = model["weights"]
    logit = model["intercept"] + sum(
        weights[name] * value for name, value in features.items()
    )
    probability = round(100 / (1 + math.exp(-logit)))

    return AtsCompatibilityPrediction(
        modelVersion=model["modelVersion"],
        modelType=(
            f"{model['modelType']} + {reranker_model_name()} "
            f"({reranker_backend()})"
        ),
        probability=probability,
        confidence=_prediction_confidence(
            normalized_resume,
            job_profile,
            evidence_count,
            probability,
        ),
        signals=_model_signals(features, weights),
    )


def _model_signals(
    features: dict[str, float],
    weights: dict[str, float],
) -> list[AtsModelSignal]:
    signals: list[AtsModelSignal] = []

    for name, value in features.items():
        weight = weights[name]

        if value >= 0.68:
            signals.append(
                AtsModelSignal(
                    label=SIGNAL_LABELS[name],
                    impact=round(weight * value * 18),
                    direction="positive",
                )
            )
        elif value < 0.58:
            signals.append(
                AtsModelSignal(
                    label=SIGNAL_LABELS[name],
                    impact=round(-weight * (1 - value) * 18),
                    direction="negative",
                )
            )

    signals.sort(key=lambda signal: (-abs(signal.impact), signal.label))
    return signals[:6]


def _average_strength(evidence: list[AtsKeywordEvidence]) -> int:
    if not evidence:
        return 70
    return round(sum(item.strength for item in evidence) / len(evidence))


def _seniority_alignment(
    normalized_resume: str,
    job_profile: AtsJobProfile,
) -> float:
    required_years = job_profile.yearsRequired

    if required_years == 0:
        return 0.72

    resume_years = max_years(normalized_resume)

    if resume_years == 0:
        return 0.42

    return min(1.0, resume_years / required_years)


def _prediction_confidence(
    normalized_resume: str,
    job_profile: AtsJobProfile,
    evidence_count: int,
    probability: int,
) -> str:
    resume_depth = min(1.0, len(tokenize(normalized_resume)) / 350)
    profile_depth = min(1.0, len(job_profile.requiredKeywords) / 12)
    evidence_depth = min(1.0, evidence_count / 18)
    margin = abs(probability - 50) / 50
    confidence_score = (
        resume_depth * 30
        + profile_depth * 25
        + evidence_depth * 25
        + margin * 20
    )

    if confidence_score >= 75:
        return "high"
    if confidence_score >= 50:
        return "medium"
    return "low"


@lru_cache(maxsize=1)
def _load_prediction_model() -> dict:
    with MODEL_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)
