import re

from app.embeddings.lexical import coverage_score
from app.models.ats import ACTION_VERBS, SECTION_MARKERS
from app.schemas.ats import AtsJobProfile, AtsKeywordEvidence
from app.schemas.resume import StructuredResume
from app.services.ats.constants import NORMALIZED_HINTS
from app.services.ats.helpers import clamp_score, is_keyword_token, max_years
from app.utils.text import compact_unique, contains_term, normalize_keyword, tokenize


def score_keyword_evidence(
    evidence: list[AtsKeywordEvidence],
    required_keywords: list[str],
) -> int:
    if not evidence:
        return 75

    required = {normalize_keyword(keyword) for keyword in required_keywords}
    weighted_total = 0.0
    possible_total = 0.0

    for item in evidence:
        weight = 1.35 if normalize_keyword(item.keyword) in required else 0.75
        weighted_total += item.strength * weight
        possible_total += 100 * weight

    return clamp_score(100 * weighted_total / possible_total)


def score_semantic_depth(evidence: list[AtsKeywordEvidence]) -> int:
    if not evidence:
        return 75

    exact_count = sum(1 for item in evidence if item.status == "exact")
    semantic_count = sum(1 for item in evidence if item.status == "semantic")
    average_strength = sum(item.strength for item in evidence) / len(evidence)

    return clamp_score(average_strength + exact_count * 2 + semantic_count * 1.5)


def score_skills(
    evidence: list[AtsKeywordEvidence],
    normalized_resume: str,
    structured_resume: StructuredResume | None,
) -> int:
    resume_skills = _extract_resume_skills(normalized_resume, structured_resume)
    skill_evidence = [
        item
        for item in evidence
        if normalize_keyword(item.keyword) in NORMALIZED_HINTS
    ]

    if not skill_evidence:
        return coverage_score([item.keyword for item in evidence[:20]], resume_skills)

    return clamp_score(sum(item.strength for item in skill_evidence) / len(skill_evidence))


def score_experience(
    normalized_resume: str,
    normalized_job: str,
    job_profile: AtsJobProfile,
    keyword_score: int,
) -> int:
    title_terms = [
        token for token in tokenize(job_profile.title) if is_keyword_token(token)
    ]
    title_score = (
        coverage_score(title_terms, tokenize(normalized_resume))
        if title_terms
        else 70
    )
    responsibility_terms = tokenize(" ".join(job_profile.responsibilities))
    responsibility_score = (
        coverage_score(responsibility_terms[:40], tokenize(normalized_resume))
        if responsibility_terms
        else keyword_score
    )
    required_years = job_profile.yearsRequired or max_years(normalized_job)
    years_score = _years_score(required_years, max_years(normalized_resume))

    return clamp_score(
        keyword_score * 0.35
        + title_score * 0.25
        + responsibility_score * 0.25
        + years_score * 0.15
    )


def score_impact(normalized_resume: str) -> int:
    metric_count = len(
        re.findall(
            r"(?:\b\d+(?:\.\d+)?%|\$\s?\d+|\b\d+\+?\s?(?:x|k|m|million|users|customers|revenue|hours|days|weeks|projects|people))",
            normalized_resume,
        )
    )
    numeric_count = len(re.findall(r"\b\d+(?:\.\d+)?%?\b", normalized_resume))
    action_verb_count = sum(
        1 for verb in ACTION_VERBS if contains_term(normalized_resume, verb)
    )
    has_experience = any(
        contains_term(normalized_resume, marker)
        for marker in SECTION_MARKERS["experience"]
    )
    base = 25 if has_experience else 10

    return clamp_score(
        base
        + min(metric_count, 5) * 14
        + min(numeric_count, 8) * 3
        + min(action_verb_count, 8) * 5
    )


def score_formatting(
    normalized_resume: str,
    structured_resume: StructuredResume | None,
) -> int:
    sections_found = 0

    for markers in SECTION_MARKERS.values():
        if any(contains_term(normalized_resume, marker) for marker in markers):
            sections_found += 1

    word_count = len(tokenize(normalized_resume))
    length_score = 20 if 250 <= word_count <= 1200 else 10 if word_count >= 150 else 0
    structured_bonus = 15 if structured_resume else 0

    return clamp_score(sections_found * 16 + length_score + structured_bonus)


def _extract_resume_skills(
    normalized_resume: str,
    structured_resume: StructuredResume | None,
) -> list[str]:
    skills: list[str] = []

    if structured_resume:
        skills.extend(structured_resume.skills)

    for hint in NORMALIZED_HINTS:
        if contains_term(normalized_resume, hint):
            skills.append(hint)

    return compact_unique(skills)


def _years_score(required_years: int, resume_years: int) -> int:
    if required_years == 0:
        return 78

    if resume_years == 0:
        return 45

    return min(100, round(100 * resume_years / required_years))
