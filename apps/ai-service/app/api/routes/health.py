from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health/live")
def liveness():
    return {"status": "ok"}


@router.get("/health/ready")
def readiness():
    return {"status": "ready", "auth_configured": bool(settings.ai_service_api_key)}


@router.get("/health", include_in_schema=False)
def health():
    return readiness()
