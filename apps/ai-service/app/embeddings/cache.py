"""
app/embeddings/cache.py — Redis-backed embedding cache keyed by SHA256 of input text.

Avoids re-embedding the same job description or resume on every request.
TTL defaults to 24 hours (86400 s). Set REDIS_URL in .env to enable.

If Redis is unavailable, the cache degrades gracefully — callers receive None
from get_cached_embedding() and must compute the embedding themselves.
"""

import hashlib
import logging

import numpy as np

logger = logging.getLogger("rescomail.ai-service.embeddings.cache")

_redis_client = None


def _get_client():
    """Lazy-initialise the Redis client so import doesn't fail if redis is absent."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    try:
        import redis
        from app.core.config import settings

        _redis_client = redis.Redis.from_url(settings.redis_url, decode_responses=False)
        # Ping to verify connectivity at first use
        _redis_client.ping()
        logger.info("Embedding cache connected to Redis at %s", settings.redis_url)
    except Exception as exc:
        logger.warning("Embedding cache unavailable — Redis not reachable: %s", exc)
        _redis_client = None

    return _redis_client


def _cache_key(text: str) -> str:
    return f"emb:{hashlib.sha256(text.encode()).hexdigest()}"


def get_cached_embedding(text: str) -> np.ndarray | None:
    """Return the cached embedding vector for *text*, or None if not cached."""
    client = _get_client()
    if client is None:
        return None

    try:
        key = _cache_key(text)
        cached = client.get(key)
        if cached is None:
            return None
        return np.frombuffer(cached, dtype=np.float32)
    except Exception as exc:
        logger.debug("Cache read failed: %s", exc)
        return None


def set_cached_embedding(text: str, vector: np.ndarray, ttl: int = 86400) -> None:
    """Store *vector* in Redis under the SHA256 of *text* with a *ttl* (seconds)."""
    client = _get_client()
    if client is None:
        return

    try:
        key = _cache_key(text)
        # Ensure the vector is stored as float32 for consistent frombuffer reads
        client.setex(key, ttl, vector.astype(np.float32).tobytes())
    except Exception as exc:
        logger.debug("Cache write failed: %s", exc)
