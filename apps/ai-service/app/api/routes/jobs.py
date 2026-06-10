"""
app/api/routes/jobs.py — Jobs feature API routes.

Endpoints:
  POST /jobs/subscribe     — Subscribe a user to job digest emails
  POST /jobs/digest        — Trigger an on-demand digest (for testing)
  DELETE /jobs/unsubscribe — Unsubscribe a user from job digest emails
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from app.api.dependencies import require_service_auth

logger = logging.getLogger("rescomail.ai-service.jobs")
router = APIRouter(prefix="/jobs", tags=["jobs"])


class JobSubscribeRequest(BaseModel):
    user_id: str
    email: EmailStr
    role: str
    location: str
    experience_level: str = "mid"
    resume_text: str
    frequency: str = "daily"  # "daily" | "weekly"


class JobDigestRequest(BaseModel):
    user_id: str
    email: EmailStr
    role: str
    location: str
    experience_level: str = "mid"
    resume_text: str


class JobUnsubscribeRequest(BaseModel):
    user_id: str


@router.post("/subscribe")
async def subscribe_to_jobs(
    request: JobSubscribeRequest,
    _auth: None = Depends(require_service_auth),
):
    """Register user preferences for recurring job digest delivery.

    NOTE: This endpoint stores preferences in the main app DB (ai-service stays
    stateless). For now it triggers an immediate digest as a preview.
    """
    logger.info("Job subscription request for user %s", request.user_id)
    # In production: persist preferences to DB via main web app callback.
    # For now, enqueue an immediate digest task.
    try:
        from app.pipelines.job_search import run_job_search_pipeline
        import asyncio

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, run_job_search_pipeline, request.model_dump())
        return {"subscribed": True, "result": result, "message": "First digest delivered."}
    except Exception as exc:
        logger.exception("Failed to run job digest for user %s", request.user_id)
        raise HTTPException(
            status_code=500,
            detail="Job search failed. Please retry.",
        ) from exc


@router.post("/digest")
async def trigger_digest(
    request: JobDigestRequest,
    _auth: None = Depends(require_service_auth),
):
    """Trigger an on-demand job digest (useful for testing or manual runs)."""
    logger.info("On-demand digest requested for user %s", request.user_id)
    try:
        from app.pipelines.job_search import run_job_search_pipeline
        import asyncio

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, run_job_search_pipeline, request.model_dump())
        return {"result": result, "message": "Digest task completed."}
    except Exception as exc:
        logger.exception("Failed to run on-demand digest for user %s", request.user_id)
        raise HTTPException(
            status_code=500,
            detail="Job digest generation failed. Please retry.",
        ) from exc


@router.delete("/unsubscribe")
async def unsubscribe_from_jobs(
    request: JobUnsubscribeRequest,
    _auth: None = Depends(require_service_auth),
):
    """Remove a user's job digest subscription.

    NOTE: In production, this should call the main web app to remove stored preferences.
    """
    logger.info("Unsubscribe request for user %s", request.user_id)
    # Placeholder — actual DB cleanup happens in the main web app.
    return {"unsubscribed": True, "user_id": request.user_id}


@router.get("/search")
async def search_jobs_route(
    query: str,
    location: str,
    max_results: int = 15,
    _auth: None = Depends(require_service_auth),
):
    """Search for jobs using JSearch or Adzuna."""
    logger.info("Job search query: '%s' in location: '%s'", query, location)
    try:
        from app.services.jobs.search import search_jobs
        results = search_jobs(query, location, max_results=max_results)
        return {"results": results}
    except Exception as exc:
        logger.exception("Failed to search jobs for query '%s'", query)
        raise HTTPException(
            status_code=500,
            detail="Job digest delivery failed. Please retry.",
        ) from exc
