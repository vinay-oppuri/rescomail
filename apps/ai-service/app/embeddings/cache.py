"""
app/embeddings/cache.py — In-memory LRU cache for Gemini embedding calls.

Same text embedded with the same task type returns the cached vector
without hitting the Gemini API again. Uses functools.lru_cache with a
SHA-256 key so the (large) text strings aren't stored in the cache key.

The sha256_key utility was already built in app/utils/hashing.py for
exactly this purpose but was never connected.

Cache is process-scoped (resets on server restart). For a persistent cache,
replace with Redis using the same sha256_key pattern.
"""

import hashlib
import logging
from functools import lru_cache
from typing import Literal

logger = logging.getLogger("rescomail.ai-service.embeddings.cache")

TaskType = Literal["RETRIEVAL_DOCUMENT", "RETRIEVAL_QUERY", "SEMANTIC_SIMILARITY"]

# Maps hash → original text so _cached_embed can call the real API.
# Only holds entries that are currently live in the lru_cache.
_hash_to_text: dict[str, str] = {}


@lru_cache(maxsize=512)
def _cached_embed_inner(text_hash: str, task_type: str) -> tuple[float, ...]:
    """Inner cached function — keyed on SHA256 hash + task type."""
    from app.embeddings.semantic import embed_text as _embed_text
    text = _hash_to_text[text_hash]
    result = _embed_text(text, task_type=task_type)  # type: ignore[arg-type]
    logger.debug("Cache MISS for hash %s... (task=%s)", text_hash[:8], task_type)
    return tuple(result)


def embed_with_cache(text: str, task_type: TaskType = "RETRIEVAL_DOCUMENT") -> list[float]:
    """Embed text, returning a cached result if available."""
    text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    _hash_to_text[text_hash] = text  # keep text alive for cache duration
    return list(_cached_embed_inner(text_hash, task_type))


def cache_info() -> str:
    """Return a human-readable cache stats string for logging/health endpoint."""
    info = _cached_embed_inner.cache_info()
    return f"hits={info.hits} misses={info.misses} size={info.currsize}/{info.maxsize}"
