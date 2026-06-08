"""
app/tasks/ats_tasks.py — Async Celery task for ATS analysis.

Usage (from a FastAPI route — fire and forget):
    from app.tasks.ats_tasks import run_ats_analysis
    task = run_ats_analysis.delay(request_dict)
    return {"task_id": task.id}

Then poll GET /tasks/{task_id}/status to retrieve the result.
"""

import logging

from app.tasks import celery_app

logger = logging.getLogger("rescomail.ai-service.tasks.ats")


@celery_app.task(
    name="ats.analyze",
    bind=True,
    max_retries=3,
    default_retry_delay=5,
)
def run_ats_analysis(self, request_dict: dict) -> dict:
    """Run ATS analysis pipeline in a Celery worker.

    Args:
        request_dict: Serialised AtsAnalyzeRequest (use .model_dump()).

    Returns:
        Serialised AtsAnalysisResponse dict.
    """
    try:
        from app.pipelines.ats_analysis import analyze_ats
        from app.schemas.ats import AtsAnalyzeRequest

        request = AtsAnalyzeRequest(**request_dict)
        logger.info("ATS task started — resume %s", request.resumeId or "inline")
        result = analyze_ats(request)
        logger.info("ATS task completed — resume %s", request.resumeId or "inline")
        return result.model_dump()
    except Exception as exc:
        logger.exception("ATS task failed, retrying...")
        raise self.retry(exc=exc)
