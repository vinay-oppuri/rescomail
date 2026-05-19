import re

from app.models.ats import DISPLAY_OVERRIDES, SECTION_MARKERS
from app.services.ats.constants import NOISE_WORDS
from app.utils.text import contains_term, normalize_keyword, normalize_text, tokenize


def clean_sentence(sentence: str) -> str:
    return re.sub(r"\s+", " ", sentence).strip(" -•\t")


def split_sentences(text: str) -> list[str]:
    chunks = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [clean_sentence(chunk) for chunk in chunks if clean_sentence(chunk)]


def find_snippets(text: str, terms: list[str]) -> list[str]:
    snippets: list[str] = []

    for sentence in split_sentences(text):
        normalized_sentence = normalize_text(sentence)
        if any(contains_term(normalized_sentence, term) for term in terms if term):
            snippets.append(sentence[:220])

        if len(snippets) >= 3:
            break

    return snippets


def infer_source_section(snippet: str) -> str:
    normalized = normalize_text(snippet)

    for section, markers in SECTION_MARKERS.items():
        if any(contains_term(normalized, marker) for marker in markers):
            return section

    if re.search(r"\b\d+(?:\.\d+)?%?\b", normalized):
        return "experience"

    return "resume"


def infer_title(job_description: str) -> str:
    for line in job_description.splitlines():
        cleaned = clean_sentence(line)
        if 3 <= len(cleaned) <= 80:
            return cleaned

    return ""


def infer_seniority(text: str) -> str:
    normalized = normalize_text(text)

    if any(contains_term(normalized, term) for term in {"principal", "staff"}):
        return "staff"

    if any(contains_term(normalized, term) for term in {"lead", "manager"}):
        return "lead"

    if any(contains_term(normalized, term) for term in {"senior", "sr"}):
        return "senior"

    if any(contains_term(normalized, term) for term in {"junior", "entry", "intern"}):
        return "entry"

    return "mid"


def token_overlap_score(keyword: str, normalized_resume: str) -> int:
    keyword_tokens = [token for token in tokenize(keyword) if is_keyword_token(token)]

    if len(keyword_tokens) < 2:
        return 0

    matched = sum(
        1 for token in keyword_tokens if contains_term(normalized_resume, token)
    )
    return round(100 * matched / len(keyword_tokens))


def is_keyword_token(token: str) -> bool:
    normalized = normalize_keyword(token)
    return (
        len(normalized) > 2
        and not normalized.isnumeric()
        and normalized not in NOISE_WORDS
    )


def max_years(text: str) -> int:
    matches = re.findall(r"\b(\d{1,2})\+?\s*(?:years|yrs)\b", text)
    return max((int(match) for match in matches), default=0)


def join_keywords(keywords: list[str]) -> str:
    return ", ".join(display_keyword(keyword) for keyword in keywords)


def display_keyword(keyword: str) -> str:
    normalized = normalize_keyword(keyword)

    if normalized in DISPLAY_OVERRIDES:
        return DISPLAY_OVERRIDES[normalized]

    return " ".join(
        DISPLAY_OVERRIDES.get(part, part.capitalize())
        for part in normalized.split()
    )


def clamp_score(score: float) -> int:
    return max(0, min(100, round(score)))
