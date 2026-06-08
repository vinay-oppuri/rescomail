import math
from functools import lru_cache
from typing import Any

from app.core.config import settings

from app.embeddings.semantic import (
    FALLBACK_ENV,
    semantic_similarity_score,
)

DEFAULT_RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L12-v2"
RERANKER_MODEL_ENV = "RESCOMAIL_RERANKER_MODEL"


def reranker_model_name() -> str:
    if _should_use_fallback():
        return "semantic-similarity-dev-fallback"

    return settings.rescomail_reranker_model


def reranker_backend() -> str:
    return "semantic-dev-fallback" if _should_use_fallback() else "sentence-transformers"


def cross_encoder_relevance_score(query: str, document: str) -> int:
    if _should_use_fallback():
        return semantic_similarity_score(query, document)

    model = _load_cross_encoder()
    raw_score = float(model.predict([(query, document)], show_progress_bar=False)[0])
    return round(100 * _sigmoid(raw_score))


@lru_cache(maxsize=1)
def _load_cross_encoder() -> Any:
    try:
        from sentence_transformers import CrossEncoder
    except ImportError as error:
        raise RuntimeError(
            "sentence-transformers is required for the production reranker. "
            "Install apps/ai-service/requirements.txt or set "
            "RESCOMAIL_ALLOW_HASHED_EMBEDDING_FALLBACK=1 only for local development."
        ) from error

    return CrossEncoder(settings.rescomail_reranker_model)


def _sigmoid(value: float) -> float:
    if value >= 0:
        z = math.exp(-value)
        return 1 / (1 + z)

    z = math.exp(value)
    return z / (1 + z)


def _should_use_fallback() -> bool:
    return settings.rescomail_allow_hashed_embedding_fallback
