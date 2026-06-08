"""
app/utils/hashing.py — SHA256 helper utilities for cache keys and content fingerprinting.
"""

import hashlib


def sha256_hex(text: str) -> str:
    """Return the SHA256 hex digest of *text* (UTF-8 encoded)."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_key(prefix: str, text: str) -> str:
    """Return a namespaced Redis-style key: ``<prefix>:<sha256(text)>``."""
    return f"{prefix}:{sha256_hex(text)}"
