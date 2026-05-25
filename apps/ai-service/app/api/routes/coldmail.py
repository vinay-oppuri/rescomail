import logging

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import require_service_auth
from app.pipelines.coldmail_generation import generate_coldmail
from app.schemas.coldmail import ColdEmailGenerateRequest, ColdEmailResponse

logger = logging.getLogger("rescomail.ai-service.coldmail")
router = APIRouter(prefix="/coldmail", tags=["coldmail"])


@router.post("/generate", response_model=ColdEmailResponse)
async def generate_coldmail_route(
    request: ColdEmailGenerateRequest,
    _auth: None = Depends(require_service_auth),
):
    logger.info(
        "Generating cold email for resume %s",
        request.resumeId or "inline",
    )

    try:
        return generate_coldmail(request)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("Cold email generation failed for resume %s", request.resumeId)
        raise HTTPException(status_code=500, detail=str(error)) from error
