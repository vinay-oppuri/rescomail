import re
import unicodedata
from collections.abc import Iterable

WORD_RE = re.compile(r"[a-z0-9][a-z0-9+#./-]*")
WHITESPACE_RE = re.compile(r"\s+")


def normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text or "")
    normalized = normalized.lower().replace("&", " and ")
    normalized = WHITESPACE_RE.sub(" ", normalized)
    return normalized.strip()


def tokenize(text: str) -> list[str]:
    return WORD_RE.findall(normalize_text(text))


def normalize_keyword(keyword: str) -> str:
    normalized = normalize_text(keyword)
    normalized = normalized.strip(" .,:;|/\\()[]{}")
    return WHITESPACE_RE.sub(" ", normalized)


def contains_term(normalized_text: str, normalized_term: str) -> bool:
    if not normalized_term:
        return False

    if re.fullmatch(r"[a-z0-9]+", normalized_term):
        pattern = rf"(?<![a-z0-9]){re.escape(normalized_term)}(?:s|es)?(?![a-z0-9])"
        return re.search(pattern, normalized_text) is not None

    pattern = rf"(?<![a-z0-9]){re.escape(normalized_term)}(?![a-z0-9])"
    return re.search(pattern, normalized_text) is not None


def compact_unique(items: Iterable[str], limit: int | None = None) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []

    for item in items:
        normalized = normalize_keyword(item)

        if not normalized or normalized in seen:
            continue

        seen.add(normalized)
        unique.append(normalized)

        if limit is not None and len(unique) >= limit:
            break

    return unique
