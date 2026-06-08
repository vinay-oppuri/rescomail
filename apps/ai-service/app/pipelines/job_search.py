"""
app/pipelines/job_search.py — Job search pipeline orchestrator.

Orchestrates: Search → Relevance Filter → Rerank → Digest → Deliver
"""

import logging

logger = logging.getLogger("rescomail.ai-service.pipelines.job-search")


def run_job_search_pipeline(user_preferences: dict) -> dict:
    """Run the full job search → digest → deliver pipeline.

    Args:
        user_preferences: dict with keys:
            - user_id: str
            - email: str
            - role: str
            - location: str
            - experience_level: str
            - resume_text: str

    Returns:
        dict with keys:
            - jobs_found: int
            - jobs_sent: int
            - email_sent: bool
            - email_id: str | None
    """
    from app.services.jobs.search import search_jobs
    from app.services.jobs.relevance import filter_by_relevance
    from app.services.jobs.digest import generate_job_summaries, generate_digest_email
    from app.services.jobs.delivery import send_digest_email

    role = user_preferences.get("role", "")
    location = user_preferences.get("location", "")
    experience_level = user_preferences.get("experience_level", "")
    resume_text = user_preferences.get("resume_text", "")
    email = user_preferences.get("email", "")

    if not email or not role:
        logger.warning("Skipping job pipeline — missing email or role in preferences")
        return {"jobs_found": 0, "jobs_sent": 0, "email_sent": False}

    # Step 1: Search
    logger.info("Searching jobs for '%s' in '%s'", role, location)
    raw_jobs = search_jobs(role, location, max_results=30)
    logger.info("Found %d raw job listings", len(raw_jobs))

    if not raw_jobs:
        return {"jobs_found": 0, "jobs_sent": 0, "email_sent": False}

    # Step 2: Relevance filter
    relevant_jobs = filter_by_relevance(raw_jobs, resume_text, top_n=10)
    logger.info("%d jobs passed relevance filter", len(relevant_jobs))

    if not relevant_jobs:
        return {"jobs_found": len(raw_jobs), "jobs_sent": 0, "email_sent": False}

    # Step 3: Generate match summaries (uses reranker internally if available)
    resume_summary = resume_text[:1500]  # Truncate for prompt
    jobs_with_summaries = generate_job_summaries(relevant_jobs, resume_summary)

    # Step 4: Generate digest email
    digest = generate_digest_email(
        jobs=jobs_with_summaries,
        target_role=role,
        location=location,
        experience_level=experience_level,
    )

    # Step 5: Deliver
    sent = send_digest_email(
        to_email=email,
        subject=digest.get("email_subject", "Your Job Digest"),
        body=digest.get("email_body", ""),
    )

    return {
        "jobs_found": len(raw_jobs),
        "jobs_sent": len(jobs_with_summaries),
        "email_sent": sent,
    }
