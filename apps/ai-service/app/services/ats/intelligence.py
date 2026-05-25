import json
import math
from functools import lru_cache
from pathlib import Path

from app.embeddings.semantic import (
    embedding_backend,
    embedding_model_name,
    semantic_similarity_score,
    shared_concepts,
)
from app.embeddings.reranker import (
    cross_encoder_relevance_score,
    reranker_backend,
    reranker_model_name,
)
from app.schemas.ats import (
    AtsCompatibilityPrediction,
    AtsGroundedSuggestion,
    AtsIntelligence,
    AtsJobProfile,
    AtsKeywordEvidence,
    AtsModelSignal,
    AtsRetrievalCitation,
    AtsScoreBreakdown,
    AtsSemanticMatch,
    AtsSkillGap,
)
from app.services.ats.helpers import display_keyword, max_years
from app.services.ats.knowledge_base import KnowledgeDocument, retrieve_guidance
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
    gaps = _skill_gaps(evidence, job_profile)

    return AtsIntelligence(
        semanticMatch=semantic_match,
        compatibilityPrediction=prediction,
        skillGaps=gaps,
        recruiterGuidance=_grounded_guidance(
            job_profile,
            gaps,
            category_scores,
            semantic_match,
        ),
    )


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
    cross_encoder_relevance = cross_encoder_relevance_score(
        job_description,
        resume_text,
    )
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


def _skill_gaps(
    evidence: list[AtsKeywordEvidence],
    job_profile: AtsJobProfile,
) -> list[AtsSkillGap]:
    required = {normalize_keyword(keyword) for keyword in job_profile.requiredKeywords}
    gaps: list[AtsSkillGap] = []

    for item in evidence:
        normalized = normalize_keyword(item.keyword)
        is_required = normalized in required

        if item.status == "exact" and item.strength >= 70:
            continue

        if item.status == "semantic" and item.strength >= 78 and not is_required:
            continue

        severity = (
            "critical"
            if is_required and item.status == "missing"
            else "important"
            if is_required
            else "optional"
        )
        current_evidence = (
            "missing"
            if item.status == "missing"
            else "semantic"
            if item.status == "semantic"
            else "weak"
        )

        gaps.append(
            AtsSkillGap(
                skill=item.keyword,
                severity=severity,
                currentEvidence=current_evidence,
                recommendation=_gap_recommendation(item.keyword, severity),
                learningFocus=_learning_focus(item.keyword),
            )
        )

        if len(gaps) >= 8:
            break

    return gaps


def _grounded_guidance(
    job_profile: AtsJobProfile,
    gaps: list[AtsSkillGap],
    category_scores: AtsScoreBreakdown,
    semantic_match: AtsSemanticMatch,
) -> list[AtsGroundedSuggestion]:
    query = " ".join(
        [
            job_profile.title,
            " ".join(job_profile.requiredKeywords),
            " ".join(gap.skill for gap in gaps[:5]),
            f"impact score {category_scores.impact}",
            f"formatting score {category_scores.formatting}",
            f"semantic score {semantic_match.resumeToJob}",
        ]
    )
    retrieved = retrieve_guidance(query, limit=3)
    suggestions: list[AtsGroundedSuggestion] = []

    for document, relevance in retrieved:
        suggestions.append(
            AtsGroundedSuggestion(
                title=_guidance_title(document),
                detail=_guidance_detail(document, gaps, category_scores),
                citations=[_citation(document, relevance)],
            )
        )

    return suggestions


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


def _gap_recommendation(skill: str, severity: str) -> str:
    if severity == "critical":
        return (
            f"Add a recent bullet or project that uses {skill} and ties it to a "
            "measurable result."
        )

    if severity == "important":
        return (
            f"Make the existing {skill} evidence more explicit with the same language "
            "used in the job description."
        )

    return f"Add {skill} to the skills section only if you can support it in experience."


def _learning_focus(skill: str) -> str:
    normalized = normalize_keyword(skill)

    if any(term in normalized for term in {"model", "machine learning", "ml", "ai"}):
        return "Show data, model choice, evaluation metric, and deployment context."

    if any(term in normalized for term in {"cloud", "aws", "azure", "gcp", "kubernetes"}):
        return "Show a deployed system, infrastructure ownership, and reliability impact."

    if any(term in normalized for term in {"sql", "data", "analytics", "dashboard"}):
        return "Show data source, analysis method, stakeholder decision, and outcome."

    if any(term in normalized for term in {"react", "frontend", "ui", "ux"}):
        return "Show user workflow, component ownership, accessibility, and performance."

    return "Show where you used it, how deeply, and what changed because of it."


def _guidance_title(document: KnowledgeDocument) -> str:
    if document.id == "recruiter-screen-001":
        return "Optimize the first recruiter scan"

    if document.id == "resume-pattern-ml-001":
        return "Turn ML work into evidence"

    if document.id == "ats-formatting-001":
        return "Protect parser quality"

    if document.id == "domain-gap-001":
        return "Close skill gaps with proof"

    return document.title


def _guidance_detail(
    document: KnowledgeDocument,
    gaps: list[AtsSkillGap],
    category_scores: AtsScoreBreakdown,
) -> str:
    critical_gaps = [gap.skill for gap in gaps if gap.severity == "critical"]

    if document.id == "recruiter-screen-001":
        required = ", ".join(critical_gaps[:3]) or "the most important role skills"
        return (
            f"Put {required} near the top of the resume and attach each one to a "
            "specific role, project, or result."
        )

    if document.id == "resume-pattern-ml-001":
        return (
            "For AI/ML roles, add bullets that name the dataset, model family, "
            "evaluation metric, and production or experiment-tracking outcome."
        )

    if document.id == "ats-formatting-001":
        return (
            "Use standard headings and plain-text bullets so the parser can recover "
            f"skills and experience consistently. Current formatting score: "
            f"{category_scores.formatting}/100."
        )

    if document.id == "domain-gap-001":
        target = critical_gaps[0] if critical_gaps else "the highest-value missing skill"
        return (
            f"Create proof for {target} through a project, certification, or adjacent "
            "experience rather than only adding it to a keyword list."
        )

    return document.content


def _citation(document: KnowledgeDocument, relevance: int) -> AtsRetrievalCitation:
    return AtsRetrievalCitation(
        id=document.id,
        title=document.title,
        sourceType=document.source_type,
        relevance=relevance,
    )


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
