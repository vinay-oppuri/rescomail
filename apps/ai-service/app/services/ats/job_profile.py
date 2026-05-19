from collections import Counter

from app.schemas.ats import AtsAnalyzeRequest, AtsJobProfile
from app.services.ats.constants import (
    CERTIFICATION_TERMS,
    NORMALIZED_HINTS,
    PREFERRED_MARKERS,
    REQUIRED_MARKERS,
    RESPONSIBILITY_MARKERS,
)
from app.services.ats.helpers import (
    clean_sentence,
    display_keyword,
    infer_seniority,
    infer_title,
    is_keyword_token,
    max_years,
    split_sentences,
)
from app.utils.text import compact_unique, contains_term, normalize_text, tokenize


def extract_job_profile(request: AtsAnalyzeRequest) -> AtsJobProfile:
    job_description = request.jobDescription
    normalized_job = normalize_text(job_description)
    sentences = split_sentences(job_description)
    job_keywords = extract_job_keywords(job_description, request.targetKeywords)

    required_sentences = _sentences_with_markers(sentences, REQUIRED_MARKERS)
    preferred_sentences = _sentences_with_markers(sentences, PREFERRED_MARKERS)
    required_keywords = _keywords_in_text("\n".join(required_sentences), job_keywords)
    preferred_keywords = _keywords_in_text("\n".join(preferred_sentences), job_keywords)
    required_keywords = compact_unique(
        request.targetKeywords + required_keywords + job_keywords[:12],
        limit=24,
    )
    preferred_keywords = compact_unique(
        [
            keyword
            for keyword in preferred_keywords + job_keywords
            if keyword not in required_keywords
        ],
        limit=18,
    )
    responsibilities = [
        clean_sentence(sentence)
        for sentence in sentences
        if _has_marker(sentence, RESPONSIBILITY_MARKERS)
        and not _has_marker(sentence, REQUIRED_MARKERS | PREFERRED_MARKERS)
    ][:6]
    certifications = [
        display_keyword(term)
        for term in CERTIFICATION_TERMS
        if contains_term(normalized_job, term)
    ]
    title = request.jobTitle.strip() or infer_title(job_description)

    return AtsJobProfile(
        title=title or "Target role",
        seniority=infer_seniority(f"{title} {job_description}"),
        yearsRequired=max_years(normalized_job),
        requiredKeywords=[display_keyword(keyword) for keyword in required_keywords],
        preferredKeywords=[display_keyword(keyword) for keyword in preferred_keywords],
        responsibilities=responsibilities,
        certifications=certifications,
    )


def extract_job_keywords(
    job_description: str,
    target_keywords: list[str],
) -> list[str]:
    normalized_job = normalize_text(job_description)
    keywords: list[str] = []
    keywords.extend(target_keywords)

    for hint in sorted(NORMALIZED_HINTS, key=lambda term: (-len(term), term)):
        if contains_term(normalized_job, hint):
            keywords.append(hint)

    tokens = [token for token in tokenize(job_description) if is_keyword_token(token)]
    counts = Counter(tokens)

    for token, count in counts.most_common(35):
        if count >= 2 or token in NORMALIZED_HINTS:
            keywords.append(token)

    bigrams = Counter(
        " ".join(pair)
        for pair in zip(tokens, tokens[1:])
        if pair[0] != pair[1]
    )

    for phrase, count in bigrams.most_common(15):
        if count >= 2 or phrase in NORMALIZED_HINTS:
            keywords.append(phrase)

    return compact_unique(keywords, limit=45)


def _sentences_with_markers(sentences: list[str], markers: set[str]) -> list[str]:
    return [sentence for sentence in sentences if _has_marker(sentence, markers)]


def _has_marker(sentence: str, markers: set[str]) -> bool:
    normalized_sentence = normalize_text(sentence)
    return any(contains_term(normalized_sentence, marker) for marker in markers)


def _keywords_in_text(text: str, keywords: list[str]) -> list[str]:
    normalized = normalize_text(text)
    return [keyword for keyword in keywords if contains_term(normalized, keyword)]
