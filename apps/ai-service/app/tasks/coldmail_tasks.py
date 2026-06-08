"""
app/tasks/coldmail_tasks.py — Async Celery task for cold email generation.
"""

import logging

from app.tasks import celery_app

logger = logging.getLogger("rescomail.ai-service.tasks.coldmail")


@celery_app.task(
    name="coldmail.generate",
    bind=True,
    max_retries=3,
    default_retry_delay=5,
)
def run_coldmail_generation(self, request_dict: dict) -> dict:
    """Run cold email generation pipeline in a Celery worker.

    Args:
        request_dict: Serialised ColdEmailGenerateRequest (use .model_dump()).

    Returns:
        Serialised ColdEmailResponse dict.
    """
    try:
        from app.pipelines.coldmail_generation import generate_coldmail
        from app.schemas.coldmail import ColdEmailGenerateRequest

        request = ColdEmailGenerateRequest(**request_dict)
        logger.info("Coldmail task started — resume %s", request.resumeId or "inline")
        result = generate_coldmail(request)
        logger.info("Coldmail task completed — resume %s", request.resumeId or "inline")
        return result.model_dump()
    except Exception as exc:
        logger.exception("Coldmail task failed, retrying...")
        raise self.retry(exc=exc)
