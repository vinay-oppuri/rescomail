"""
app/embeddings/semantic.py — Gemini text-embedding-004 backed semantic search.

Uses the Gemini REST API directly (same pattern as app/llm/gemini.py) —
no extra SDK, no local models, no Redis.

Embedding task types (Gemini recommended):
  - "RETRIEVAL_DOCUMENT" — for job descriptions, resume text being indexed
  - "RETRIEVAL_QUERY"    — for query (resume when searching for jobs)
  - "SEMANTIC_SIMILARITY" — for pairwise comparisons

Docs: https://ai.google.dev/api/embeddings#method:-models.batchembedcontents
"""

import logging
import math
import numpy as np
from collections import Counter
from typing import Literal

import requests

from app.core.config import settings
from app.models.ats_semantics import SEMANTIC_ALIASES
from app.utils.text import normalize_keyword, tokenize

logger = logging.getLogger("rescomail.ai-service.embeddings.semantic")

GEMINI_EMBEDDING_MODEL = "gemini-embedding-2"
_EMBED_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
_REQUEST_TIMEOUT = (5, 30)

TaskType = Literal[
    "RETRIEVAL_DOCUMENT",
    "RETRIEVAL_QUERY",
    "SEMANTIC_SIMILARITY",
]


def embed_text(text: str, task_type: TaskType = "RETRIEVAL_DOCUMENT") -> list[float]:
    """Embed a single text string."""
    return embed_texts([text], task_type=task_type)[0]


def embed_texts(
    texts: list[str], task_type: TaskType = "RETRIEVAL_DOCUMENT"
) -> list[list[float]]:
    """Batch-embed texts using Gemini batchEmbedContents (max 100 per call).

    Uses the REST batchEmbedContents endpoint which is cheaper and faster
    than calling embedContent N times.
    """
    if not texts:
        return []

    api_key = settings.gemini_api_key
    url = f"{_EMBED_BASE_URL}/{GEMINI_EMBEDDING_MODEL}:batchEmbedContents?key={api_key}"
    results: list[list[float]] = []

    # Gemini batch limit is 100 per call
    for i in range(0, len(texts), 100):
        batch = texts[i : i + 100]
        payload = {
            "requests": [
                {
                    "model": f"models/{GEMINI_EMBEDDING_MODEL}",
                    "content": {"parts": [{"text": t}]},
                    "taskType": task_type,
                }
                for t in batch
            ]
        }

        response = requests.post(url, json=payload, timeout=_REQUEST_TIMEOUT)

        if response.status_code != 200:
            raise RuntimeError(
                f"Gemini Embeddings API error {response.status_code}: {response.text[:400]}"
            )

        data = response.json()
        for embedding in data.get("embeddings", []):
            results.append(embedding.get("values", []))

    return results


def semantic_search_scores(query: str, documents: list[str]) -> list[int]:
    """Score each document against the query. Returns 0-100 int scores."""
    if not documents:
        return []

    query_vec = embed_text(query, task_type="RETRIEVAL_QUERY")
    doc_vecs = embed_texts(documents, task_type="RETRIEVAL_DOCUMENT")

    return [
        _calibrate_similarity(cosine_similarity(query_vec, doc_vec))
        for doc_vec in doc_vecs
    ]


def semantic_similarity_score(left: str, right: str) -> int:
    """Return a 0-100 similarity score between two texts."""
    vecs = embed_texts([left, right], task_type="SEMANTIC_SIMILARITY")
    return _calibrate_similarity(cosine_similarity(vecs[0], vecs[1]))


def shared_concepts(left: str, right: str, limit: int = 10) -> list[str]:
    """Return shared keyword concepts between two texts (lexical — no embeddings)."""
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


def cosine_similarity(left: list[float], right: list[float]) -> float:
    """Cosine similarity between two vectors. Returns float in [-1, 1]."""
    if not left or not right:
        return 0.0
    a = np.array(left, dtype=np.float32)
    b = np.array(right, dtype=np.float32)
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    return float(np.dot(a, b) / denom) if denom > 0 else 0.0


def cosine_similarity_batch(
    query: list[float], docs: list[list[float]]
) -> list[float]:
    """Score one query vector against N document vectors in a single numpy call.

    ~50-100x faster than calling cosine_similarity() in a loop for large batches.
    Use this in filter_by_relevance() instead of the per-pair loop.
    """
    if not docs:
        return []
    q = np.array(query, dtype=np.float32)
    D = np.array(docs, dtype=np.float32)          # shape: (N, 768)
    norms = np.linalg.norm(D, axis=1) * np.linalg.norm(q)
    norms = np.where(norms == 0, 1e-9, norms)     # guard div-by-zero
    return (D @ q / norms).tolist()


def _calibrate_similarity(similarity: float) -> int:
    """Map cosine similarity [-1, 1] to a 0-100 score."""
    calibrated = (similarity + 1.0) / 2.0
    return round(100 * max(0.0, min(1.0, calibrated)))


# ---------------------------------------------------------------------------
# Lexical helpers — kept for shared_concepts (no API call needed)
# ---------------------------------------------------------------------------

def _weighted_features(text: str) -> Counter:
    tokens = [token for token in tokenize(text) if len(token) > 1]
    features: Counter = Counter()

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
    return [padded[i : i + 3] for i in range(len(padded) - 2)]
