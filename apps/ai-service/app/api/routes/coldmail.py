import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.api.dependencies import require_service_auth
from app.core.executor import thread_executor
from app.core.rate_limit import limiter
from app.pipelines.coldmail_generation import generate_coldmail
from app.schemas.coldmail import ColdEmailGenerateRequest, ColdEmailResponse

logger = logging.getLogger("rescomail.ai-service.coldmail")
router = APIRouter(prefix="/coldmail", tags=["coldmail"])


@router.post("/generate", response_model=ColdEmailResponse)
@limiter.limit("10/minute")
async def generate_coldmail_route(
    request: Request,
    body: ColdEmailGenerateRequest,
    _auth: None = Depends(require_service_auth),
):
    logger.info(
        "Generating cold email for resume %s",
        body.resumeId or "inline",
    )

    loop = asyncio.get_running_loop()
    try:
        return await loop.run_in_executor(thread_executor, generate_coldmail, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("Cold email generation failed for resume %s", body.resumeId)
        raise HTTPException(
            status_code=500,
            detail="Cold email generation failed. Please retry.",
        ) from error
