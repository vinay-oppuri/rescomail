from app.schemas.ats import (
    AtsJobProfile,
    AtsKeywordEvidence,
    AtsRewriteSuggestion,
    AtsScoreBreakdown,
    AtsSuggestion,
)
from app.services.ats.evidence import missing_keywords
from app.services.ats.helpers import join_keywords


def build_suggestions(
    scores: AtsScoreBreakdown,
    evidence: list[AtsKeywordEvidence],
    job_profile: AtsJobProfile,
) -> list[AtsSuggestion]:
    missing = missing_keywords(evidence)
    semantic_only = [item.keyword for item in evidence if item.status == "semantic"]
    suggestions: list[AtsSuggestion] = []

    if missing:
        suggestions.append(
            AtsSuggestion(
                priority="high",
                title="Add missing role keywords where truthful",
                detail=f"Work the strongest missing terms into skills or experience bullets: {join_keywords(missing[:8])}.",
                example="Match the job description wording while keeping each claim evidence-based.",
            )
        )

    if semantic_only:
        suggestions.append(
            AtsSuggestion(
                priority="medium",
                title="Convert semantic matches into exact ATS wording",
                detail=f"Use the employer's phrasing for terms like {join_keywords(semantic_only[:6])}.",
                example="If your resume says database work, add the exact tool or concept named in the job description.",
            )
        )

    if scores.experience < 70 and job_profile.title.strip():
        suggestions.append(
            AtsSuggestion(
                priority="high",
                title="Mirror the target role more directly",
                detail=f"Add a headline or recent bullet that clearly connects your work to {job_profile.title.strip()}.",
                example=f"Example headline: {job_profile.title.strip()} with experience in the job's core tools and outcomes.",
            )
        )

    if scores.impact < 70:
        suggestions.append(
            AtsSuggestion(
                priority="medium",
                title="Quantify more achievements",
                detail="Add numbers for scope, revenue, users, latency, time saved, conversion, cost reduction, or delivery speed.",
                example="Improved onboarding completion by 18% by redesigning the activation flow.",
            )
        )

    if scores.formatting < 70:
        suggestions.append(
            AtsSuggestion(
                priority="medium",
                title="Use standard ATS section labels",
                detail="Make sure the resume has clear sections for Skills, Experience, Projects, Education, and contact details.",
                example=None,
            )
        )

    return suggestions[:7]


def build_rewrite_suggestions(
    evidence: list[AtsKeywordEvidence],
    job_profile: AtsJobProfile,
) -> list[AtsRewriteSuggestion]:
    missing = missing_keywords(evidence)
    semantic_only = [item.keyword for item in evidence if item.status == "semantic"]
    rewrites: list[AtsRewriteSuggestion] = []

    if missing:
        rewrites.append(
            AtsRewriteSuggestion(
                target="Skills section",
                reason="ATS ranking improves when must-have terms are explicitly visible.",
                after=f"Skills: {join_keywords(missing[:6])}, plus your existing truthful tools and domains.",
            )
        )

    if semantic_only:
        rewrites.append(
            AtsRewriteSuggestion(
                target="Experience bullets",
                reason="Semantic matches may be missed by strict keyword filters.",
                after=f"Add employer wording such as {join_keywords(semantic_only[:4])} to bullets that already prove those skills.",
            )
        )

    if job_profile.responsibilities:
        rewrites.append(
            AtsRewriteSuggestion(
                target="Role summary",
                reason="A concise role summary helps recruiters and scanners connect your resume to the job quickly.",
                after=f"{job_profile.title} with experience delivering {job_profile.responsibilities[0].rstrip('.').lower()}.",
            )
        )

    return rewrites[:4]
