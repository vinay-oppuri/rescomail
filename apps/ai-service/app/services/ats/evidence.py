from app.models.ats import SEMANTIC_ALIASES
from app.schemas.ats import AtsKeywordEvidence
from app.services.ats.helpers import (
    display_keyword,
    find_snippets,
    infer_source_section,
    token_overlap_score,
)
from app.utils.text import compact_unique, normalize_keyword


def build_keyword_evidence(
    resume_text: str,
    normalized_resume: str,
    keywords: list[str],
) -> list[AtsKeywordEvidence]:
    evidence: list[AtsKeywordEvidence] = []

    for display_term in compact_unique(keywords, limit=50):
        keyword = normalize_keyword(display_term)
        exact_snippets = find_snippets(resume_text, [keyword])

        if exact_snippets:
            evidence.append(_evidence(keyword, "exact", 100, exact_snippets))
            continue

        alias_snippets = find_snippets(
            resume_text,
            sorted(SEMANTIC_ALIASES.get(keyword, set())),
        )

        if alias_snippets:
            evidence.append(_evidence(keyword, "semantic", 72, alias_snippets))
            continue

        overlap = token_overlap_score(keyword, normalized_resume)

        if overlap >= 55:
            evidence.append(
                AtsKeywordEvidence(
                    keyword=display_keyword(keyword),
                    status="semantic",
                    strength=overlap,
                    sourceSection="resume",
                    snippets=[],
                )
            )
            continue

        evidence.append(
            AtsKeywordEvidence(
                keyword=display_keyword(keyword),
                status="missing",
                strength=0,
                sourceSection="none",
                snippets=[],
            )
        )

    return evidence


def matched_keywords(evidence: list[AtsKeywordEvidence]) -> list[str]:
    return [item.keyword for item in evidence if item.status in {"exact", "semantic"}]


def missing_keywords(evidence: list[AtsKeywordEvidence]) -> list[str]:
    return [item.keyword for item in evidence if item.status == "missing"]


def _evidence(
    keyword: str,
    status: str,
    strength: int,
    snippets: list[str],
) -> AtsKeywordEvidence:
    return AtsKeywordEvidence(
        keyword=display_keyword(keyword),
        status=status,
        strength=strength,
        sourceSection=infer_source_section(snippets[0]),
        snippets=snippets,
    )
