"""
app/tasks/job_tasks.py — Celery beat periodic task for job digest email delivery.

Schedule (configured via celery_app.conf.beat_schedule below):
  - Daily at 08:00 UTC by default.
  - User-specific frequency overrides should be handled inside run_job_digest.

Beat schedule is registered here so it ships with the worker image.
"""

import logging

from celery.schedules import crontab

from app.tasks import celery_app

logger = logging.getLogger("rescomail.ai-service.tasks.jobs")


@celery_app.task(
    name="jobs.fetch_and_digest",
    bind=True,
    max_retries=2,
    default_retry_delay=60,
)
def run_job_digest(self, user_preferences: dict) -> dict:
    """Fetch relevant job listings, generate a digest, and email the user.

    Pipeline:
        1. Search jobs via JSearch / Adzuna (app/services/jobs/search.py)
        2. Filter by semantic similarity to resume (app/services/jobs/relevance.py)
        3. Rerank via cross-encoder (app/embeddings/reranker.py)
        4. Generate Gemini digest (app/services/jobs/digest.py)
        5. Send email via Resend (app/services/jobs/delivery.py)

    Args:
        user_preferences: dict with keys:
            - user_id: str
            - email: str
            - role: str
            - location: str
            - experience_level: str  (e.g. "mid", "senior")
            - resume_text: str
    """
    try:
        from app.pipelines.job_search import run_job_search_pipeline

        logger.info("Job digest task started for user %s", user_preferences.get("user_id"))
        result = run_job_search_pipeline(user_preferences)
        logger.info("Job digest task completed for user %s", user_preferences.get("user_id"))
        return result
    except Exception as exc:
        logger.exception("Job digest task failed for user %s", user_preferences.get("user_id"))
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Celery Beat schedule — runs daily at 08:00 UTC
# ---------------------------------------------------------------------------

celery_app.conf.beat_schedule = {
    "daily-job-digest": {
        "task": "jobs.fetch_and_digest",
        "schedule": crontab(hour=8, minute=0),
        # NOTE: user_preferences must be populated dynamically from DB.
        # This entry is a placeholder — in production, schedule one task
        # per subscribed user by iterating user preferences at beat tick time.
        "args": [{}],
    },
}
