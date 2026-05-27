import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import require_service_auth
from app.pipelines.resume_parser import parse_resume
from app.schemas.resume import ParseRequest, StructuredResume

logger = logging.getLogger("rescomail.ai-service.resume-parser")
router = APIRouter(tags=["resume-parser"])


@router.post("/parse", response_model=StructuredResume)
async def parse_resume_route(
    request: ParseRequest,
    _auth: None = Depends(require_service_auth),
):
    logger.info("Parsing resume %s", request.resumeId)

    loop = asyncio.get_event_loop()
    try:
        return await loop.run_in_executor(None, parse_resume, request)
    except Exception as error:
        logger.exception("Resume parsing failed for %s", request.resumeId)
        raise HTTPException(status_code=500, detail=str(error)) from error
