"""
ats/guidance.py
---------------
RAG-grounded recruiter guidance for ATS analysis results.

Retrieves the most relevant guidance documents from the internal knowledge
base and turns each one into a personalised, actionable suggestion using
the candidate's specific skill gaps and category scores.
"""
from app.schemas.ats import (
    AtsGroundedSuggestion,
    AtsJobProfile,
    AtsRetrievalCitation,
    AtsScoreBreakdown,
    AtsSkillGap,
)
from app.services.ats.knowledge_base import KnowledgeDocument, retrieve_guidance


def build_grounded_guidance(
    job_profile: AtsJobProfile,
    gaps: list[AtsSkillGap],
    category_scores: AtsScoreBreakdown,
    semantic_resume_job: int,
) -> list[AtsGroundedSuggestion]:
    """Retrieve top-3 guidance docs and personalise each into a suggestion."""
    query = " ".join(
        [
            job_profile.title,
            " ".join(job_profile.requiredKeywords),
            " ".join(gap.skill for gap in gaps[:5]),
            f"impact score {category_scores.impact}",
            f"formatting score {category_scores.formatting}",
            f"semantic score {semantic_resume_job}",
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


def _guidance_title(document: KnowledgeDocument) -> str:
    titles = {
        "recruiter-screen-001": "Optimize the first recruiter scan",
        "resume-pattern-ml-001": "Turn ML work into evidence",
        "ats-formatting-001": "Protect parser quality",
        "domain-gap-001": "Close skill gaps with proof",
    }
    return titles.get(document.id, document.title)


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
