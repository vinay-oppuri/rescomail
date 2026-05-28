"""
ats/gaps.py
-----------
Skill-gap analysis for ATS scoring.

Computes which required and preferred skills are missing or weakly evidenced
in the candidate's resume, assigns severity levels, and generates targeted
recommendations and learning focus hints.
"""
from app.schemas.ats import AtsKeywordEvidence, AtsJobProfile, AtsSkillGap
from app.utils.text import normalize_keyword


def build_skill_gaps(
    evidence: list[AtsKeywordEvidence],
    job_profile: AtsJobProfile,
) -> list[AtsSkillGap]:
    """Return up to 8 skill gaps ranked by severity."""
    required = {normalize_keyword(keyword) for keyword in job_profile.requiredKeywords}
    gaps: list[AtsSkillGap] = []

    for item in evidence:
        normalized = normalize_keyword(item.keyword)
        is_required = normalized in required

        # Skip well-evidenced skills.
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
