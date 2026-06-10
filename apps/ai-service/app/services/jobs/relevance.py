"""
app/services/jobs/relevance.py — Cosine similarity filter for job relevance.

Uses Gemini text-embedding-004 via app/embeddings/semantic.py to score each
job listing against the candidate's resume and return the top-N most relevant.
"""

import logging

from app.embeddings.semantic import cosine_similarity, embed_text, embed_texts

logger = logging.getLogger("rescomail.ai-service.jobs.relevance")


def filter_by_relevance(
    jobs: list[dict],
    resume_text: str,
    top_n: int = 10,
    min_score: float = 0.3,
) -> list[dict]:
    """Score each job against the resume and return the top-N above min_score.

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
        resume_vec = embed_text(resume_text, task_type="RETRIEVAL_QUERY")
    except Exception as exc:
        logger.error("Failed to embed resume text: %s", exc)
        return jobs[:top_n]  # Degrade gracefully — return unfiltered jobs

    jd_texts = [
        f"{job.get('title', '')} {job.get('description', '')}".strip()
        for job in jobs
    ]

    try:
        job_vecs = embed_texts(jd_texts, task_type="RETRIEVAL_DOCUMENT")
    except Exception as exc:
        logger.error("Failed to batch embed job texts: %s", exc)
        return jobs[:top_n]

    scored: list[tuple[float, dict]] = []
    for job, job_vec in zip(jobs, job_vecs):
        score = cosine_similarity(resume_vec, job_vec)
        if score >= min_score:
            scored.append((score, {**job, "relevance_score": round(score, 4)}))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [job for _, job in scored[:top_n]]
