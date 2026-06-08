"""
app/services/jobs/relevance.py — Cosine similarity filter for job relevance.

Reuses the existing semantic embedding infrastructure (app/embeddings/semantic.py)
to score each job listing against the candidate's resume and return the top-N.
Also integrates the embedding cache to avoid re-embedding the resume on each call.
"""

import logging

import numpy as np

logger = logging.getLogger("rescomail.ai-service.jobs.relevance")


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Return cosine similarity between two 1-D vectors."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def _get_embedding(text: str) -> np.ndarray:
    """Return the semantic embedding for *text*, using the cache if available."""
    from app.embeddings.cache import get_cached_embedding, set_cached_embedding

    cached = get_cached_embedding(text)
    if cached is not None:
        return cached

    from app.embeddings.semantic import embed_text  # type: ignore

    vector = embed_text(text)
    set_cached_embedding(text, vector)
    return vector


def filter_by_relevance(
    jobs: list[dict],
    resume_text: str,
    top_n: int = 10,
    min_score: float = 0.3,
) -> list[dict]:
    """Score each job against the resume and return the top-N above *min_score*.

    Args:
        jobs: List of normalised job dicts (from search.py).
        resume_text: Full text of the candidate's resume.
        top_n: Maximum number of jobs to return.
        min_score: Minimum cosine similarity to include a job.

    Returns:
        Sorted list of job dicts (highest similarity first), each annotated
        with a ``relevance_score`` float field.
    """
    if not jobs:
        return []

    try:
        resume_vec = _get_embedding(resume_text)
    except Exception as exc:
        logger.error("Failed to embed resume text: %s", exc)
        return jobs[:top_n]  # Degrade gracefully — return unfiltered jobs

    scored: list[tuple[float, dict]] = []

    for job in jobs:
        jd_text = f"{job.get('title', '')} {job.get('description', '')}"
        try:
            job_vec = _get_embedding(jd_text)
            score = _cosine_similarity(resume_vec, job_vec)
        except Exception as exc:
            logger.debug("Failed to embed job %s: %s", job.get("id"), exc)
            score = 0.0

        if score >= min_score:
            scored.append((score, {**job, "relevance_score": round(score, 4)}))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [job for _, job in scored[:top_n]]
