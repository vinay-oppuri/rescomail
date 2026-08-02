import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.api.dependencies import require_service_auth
from app.core.executor import run_in_thread
from app.core.rate_limit import limiter
from app.schemas.resume import ParseRequest, StructuredResume
from app.services.resume.workflow import parse_resume

logger = logging.getLogger("rescomail.ai-service.resume-parser")
router = APIRouter(tags=["resume-parser"])


@router.post("/parse", response_model=StructuredResume)
@limiter.limit("10/minute")
async def parse_resume_route(
    request: Request,
    body: ParseRequest,
    _auth: None = Depends(require_service_auth),
):
    logger.info("Parsing resume %s", body.resumeId)

    try:
        return await run_in_thread(parse_resume, body)
    except Exception as error:
        logger.exception("Resume parsing failed for %s", body.resumeId)
        raise HTTPException(
            status_code=500,
            detail="Resume parsing failed. Please retry.",
        ) from error
