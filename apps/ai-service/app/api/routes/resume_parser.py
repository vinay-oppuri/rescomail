import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.api.dependencies import require_service_auth
from app.core.rate_limit import limiter
from app.pipelines.resume_parser import parse_resume
from app.schemas.resume import ParseRequest, StructuredResume

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

    loop = asyncio.get_event_loop()
    try:
        return await loop.run_in_executor(None, parse_resume, body)
    except Exception as error:
        logger.exception("Resume parsing failed for %s", body.resumeId)
        raise HTTPException(
            status_code=500,
            detail="Resume parsing failed. Please retry.",
        ) from error
