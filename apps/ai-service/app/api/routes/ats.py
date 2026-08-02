import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.api.dependencies import require_service_auth
from app.core.executor import run_in_thread
from app.core.rate_limit import limiter
from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest
from app.services.ats.workflow import analyze_ats

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

    try:
        return await run_in_thread(analyze_ats, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("ATS analysis failed for resume %s", body.resumeId)
        raise HTTPException(
            status_code=500,
            detail="ATS analysis failed. Please retry.",
        ) from error
