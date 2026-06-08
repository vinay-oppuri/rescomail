import hashlib
import math
from collections import Counter
from collections.abc import Iterable
from functools import lru_cache
from typing import Any

from app.core.config import settings

from app.models.ats_semantics import SEMANTIC_ALIASES
from app.utils.text import normalize_keyword, tokenize

DEFAULT_EMBEDDING_MODEL = "BAAI/bge-base-en-v1.5"
EMBEDDING_MODEL_ENV = "RESCOMAIL_EMBEDDING_MODEL"
FALLBACK_ENV = "RESCOMAIL_ALLOW_HASHED_EMBEDDING_FALLBACK"
DEFAULT_DIMENSIONS = 256
BGE_QUERY_INSTRUCTION = "Represent this sentence for searching relevant passages: "


def embedding_model_name() -> str:
    if _should_use_hashed_fallback():
        return "rescomail-hashed-semantic-dev-fallback"

    return settings.rescomail_embedding_model


def embedding_backend() -> str:
    return "hashed-dev-fallback" if _should_use_hashed_fallback() else "sentence-transformers"


def embed_text(text: str, dimensions: int = DEFAULT_DIMENSIONS) -> list[float]:
    if not _should_use_hashed_fallback():
        return _encode_sentence_transformer([text], input_type="document")[0]

    return _embed_hashed_text(text, dimensions)


def semantic_search_scores(query: str, documents: list[str]) -> list[int]:
    if not documents:
        return []

    if _should_use_hashed_fallback():
        return [semantic_similarity_score(query, document) for document in documents]

    query_embedding = _encode_sentence_transformer([query], input_type="query")[0]
    document_embeddings = _encode_sentence_transformer(documents, input_type="document")
    return [
        _calibrate_transformer_similarity(cosine_similarity(query_embedding, embedding))
        for embedding in document_embeddings
    ]


def semantic_similarity_score(left: str, right: str) -> int:
    if not _should_use_hashed_fallback():
        embeddings = _encode_sentence_transformer([left, right], input_type="document")
        return _calibrate_transformer_similarity(
            cosine_similarity(embeddings[0], embeddings[1])
        )

    similarity = cosine_similarity(_embed_hashed_text(left), _embed_hashed_text(right))
    calibrated_vector = max(0.0, min(1.0, (similarity + 0.12) / 0.82))
    lexical_overlap = _lexical_overlap(left, right)
    blended = calibrated_vector * 0.72 + lexical_overlap * 0.28
    return round(100 * blended)


def shared_concepts(left: str, right: str, limit: int = 10) -> list[str]:
    left_features = _weighted_features(left)
    right_features = _weighted_features(right)
    shared = []

    for feature in left_features.keys() & right_features.keys():
        if feature.startswith(("token:", "phrase:", "alias:")):
            score = left_features[feature] + right_features[feature]
            shared.append((score, feature.split(":", 1)[1]))

    shared.sort(key=lambda item: (-item[0], item[1]))
    concepts = []
    seen: set[str] = set()

    for _, concept in shared:
        normalized = normalize_keyword(concept)

        if not normalized or normalized in seen or len(normalized) <= 2:
            continue

        seen.add(normalized)
        concepts.append(normalized)

        if len(concepts) >= limit:
            break

    return concepts


def _embed_hashed_text(text: str, dimensions: int = DEFAULT_DIMENSIONS) -> list[float]:
    vector = [0.0] * dimensions
    features = _weighted_features(text)

    for feature, weight in features.items():
        index = _feature_index(feature, dimensions)
        sign = 1 if _feature_index(f"{feature}:sign", 2) == 0 else -1
        vector[index] += sign * weight

    norm = math.sqrt(sum(value * value for value in vector))

    if norm == 0:
        return vector

    return [value / norm for value in vector]


def _encode_sentence_transformer(
    texts: list[str],
    input_type: str,
) -> list[list[float]]:
    model = _load_sentence_transformer()
    prepared_texts = [
        _prepare_text_for_model(text, input_type=input_type) for text in texts
    ]
    embeddings = model.encode(
        prepared_texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return embeddings.tolist()


def cosine_similarity(left: Iterable[float], right: Iterable[float]) -> float:
    left_values = list(left)
    right_values = list(right)

    if not left_values or not right_values:
        return 0.0

    length = min(len(left_values), len(right_values))
    return sum(left_values[index] * right_values[index] for index in range(length))


def _calibrate_transformer_similarity(similarity: float) -> int:
    calibrated = (similarity + 1.0) / 2.0
    return round(100 * max(0.0, min(1.0, calibrated)))


def _prepare_text_for_model(text: str, input_type: str) -> str:
    value = (text or "").strip()

    if input_type == "query":
        return f"{BGE_QUERY_INSTRUCTION}{value}"

    return value


@lru_cache(maxsize=1)
def _load_sentence_transformer() -> Any:
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError as error:
        raise RuntimeError(
            "sentence-transformers is required for production embeddings. "
            "Install apps/ai-service/requirements.txt or set "
            "RESCOMAIL_ALLOW_HASHED_EMBEDDING_FALLBACK=1 only for local development."
        ) from error

    return SentenceTransformer(settings.rescomail_embedding_model)


def _should_use_hashed_fallback() -> bool:
    return settings.rescomail_allow_hashed_embedding_fallback


def _weighted_features(text: str) -> Counter[str]:
    tokens = [token for token in tokenize(text) if len(token) > 1]
    features: Counter[str] = Counter()

    for token in tokens:
        features[f"token:{token}"] += 1.0

        if len(token) >= 5:
            for ngram in _character_ngrams(token):
                features[f"ngram:{ngram}"] += 0.25

        for alias in SEMANTIC_ALIASES.get(normalize_keyword(token), set()):
            features[f"alias:{normalize_keyword(alias)}"] += 0.55

    for first, second in zip(tokens, tokens[1:]):
        phrase = normalize_keyword(f"{first} {second}")
        features[f"phrase:{phrase}"] += 1.4

        for alias in SEMANTIC_ALIASES.get(phrase, set()):
            features[f"alias:{normalize_keyword(alias)}"] += 0.7

    return features


def _character_ngrams(token: str) -> list[str]:
    padded = f"_{token}_"
    return [padded[index : index + 3] for index in range(len(padded) - 2)]


def _lexical_overlap(left: str, right: str) -> float:
    left_tokens = {token for token in tokenize(left) if len(token) > 2}
    right_tokens = {token for token in tokenize(right) if len(token) > 2}

    if not left_tokens or not right_tokens:
        return 0.0

    overlap = len(left_tokens & right_tokens) / math.sqrt(
        len(left_tokens) * len(right_tokens)
    )
    return max(0.0, min(1.0, overlap * 2.2))


def _feature_index(feature: str, dimensions: int) -> int:
    digest = hashlib.blake2b(feature.encode("utf-8"), digest_size=8).digest()
    return int.from_bytes(digest, "big") % dimensions
