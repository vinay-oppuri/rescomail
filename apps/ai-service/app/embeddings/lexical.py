from collections.abc import Iterable

from app.utils.text import normalize_keyword


def jaccard_similarity(left: Iterable[str], right: Iterable[str]) -> float:
    left_terms = {normalize_keyword(term) for term in left if normalize_keyword(term)}
    right_terms = {normalize_keyword(term) for term in right if normalize_keyword(term)}

    if not left_terms and not right_terms:
        return 1.0

    if not left_terms or not right_terms:
        return 0.0

    return len(left_terms & right_terms) / len(left_terms | right_terms)


def coverage_score(required: Iterable[str], available: Iterable[str]) -> int:
    required_terms = {normalize_keyword(term) for term in required if normalize_keyword(term)}
    available_terms = {normalize_keyword(term) for term in available if normalize_keyword(term)}

    if not required_terms:
        return 75

    return round(100 * len(required_terms & available_terms) / len(required_terms))
