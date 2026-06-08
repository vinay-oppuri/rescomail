import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.api.dependencies import require_service_auth
from app.core.rate_limit import limiter
from app.pipelines.ats_analysis import analyze_ats
from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest

logger = logging.getLogger("rescomail.ai-service.ats")
router = APIRouter(prefix="/ats", tags=["ats"])


@router.post("/analyze", response_model=AtsAnalysisResponse)
@limiter.limit("10/minute")
async def analyze_ats_route(
    request: Request,
    body: AtsAnalyzeRequest,
    _auth: None = Depends(require_service_auth),
):
    logger.info("Running ATS analysis for resume %s", body.resumeId or "inline")

    import asyncio
    loop = asyncio.get_event_loop()
    try:
        return await loop.run_in_executor(None, analyze_ats, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("ATS analysis failed for resume %s", body.resumeId)
        raise HTTPException(status_code=500, detail=str(error)) from error
