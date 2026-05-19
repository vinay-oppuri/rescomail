from app.schemas.ats import AtsJobProfile, AtsKeywordEvidence, AtsScoreBreakdown
from app.services.ats.evidence import matched_keywords, missing_keywords
from app.services.ats.helpers import join_keywords
from app.utils.text import normalize_keyword


def build_strengths(
    scores: AtsScoreBreakdown,
    evidence: list[AtsKeywordEvidence],
) -> list[str]:
    matched = [item for item in evidence if item.status in {"exact", "semantic"}]
    exact = [item for item in evidence if item.status == "exact"]
    strengths: list[str] = []

    if matched:
        strengths.append(
            f"Matches {len(matched)} job terms, including "
            f"{join_keywords([item.keyword for item in matched[:5]])}."
        )

    if exact:
        strengths.append(f"{len(exact)} terms appear as direct ATS-visible matches.")

    if scores.skills >= 75:
        strengths.append("Skill coverage is strong for the target role.")

    if scores.impact >= 70:
        strengths.append("Resume includes measurable outcomes and action-oriented language.")

    if scores.formatting >= 70:
        strengths.append("Resume structure is easy for ATS systems to parse.")

    return strengths or ["Resume has enough signal to start an ATS comparison."]


def build_risks(
    scores: AtsScoreBreakdown,
    evidence: list[AtsKeywordEvidence],
    job_profile: AtsJobProfile,
) -> list[str]:
    missing = missing_keywords(evidence)
    semantic_only = [item.keyword for item in evidence if item.status == "semantic"]
    risks: list[str] = []

    if missing:
        risks.append(f"Missing visible terms: {join_keywords(missing[:8])}.")

    if semantic_only:
        risks.append(
            "Some matches are semantic rather than exact ATS wording: "
            f"{join_keywords(semantic_only[:6])}."
        )

    risks.extend(_certification_risks(job_profile, evidence))

    if scores.impact < 55:
        risks.append("Impact bullets may be too task-focused or light on metrics.")

    if scores.formatting < 55:
        risks.append("ATS readability may suffer without clear contact, skills, experience, and education sections.")

    if scores.experience < 55:
        risks.append("Experience does not clearly mirror the target title or seniority requirements.")

    return risks or ["No major ATS risks detected by the scorer."]


def build_summary(
    overall_score: int,
    job_profile: AtsJobProfile,
    evidence: list[AtsKeywordEvidence],
) -> str:
    matched = len(matched_keywords(evidence))
    exact = sum(1 for item in evidence if item.status == "exact")
    missing = len(missing_keywords(evidence))

    return (
        f"ATS match for {job_profile.title} is {overall_score}/100, with "
        f"{matched} total keyword matches, {exact} exact ATS-visible matches, "
        f"and {missing} gaps."
    )


def verdict(score: int) -> str:
    if score >= 85:
        return "strong_match"
    if score >= 70:
        return "good_match"
    if score >= 55:
        return "partial_match"
    return "needs_work"


def _certification_risks(
    job_profile: AtsJobProfile,
    evidence: list[AtsKeywordEvidence],
) -> list[str]:
    missing_terms = {
        normalize_keyword(item.keyword)
        for item in evidence
        if item.status == "missing"
    }
    cert_missing = [
        certification
        for certification in job_profile.certifications
        if normalize_keyword(certification) in missing_terms
    ]

    if cert_missing:
        return [f"Certification gap detected: {join_keywords(cert_missing)}."]

    return []
