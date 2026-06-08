import secrets

from fastapi import Header, HTTPException

from app.core.config import settings


def require_service_auth(authorization: str | None = Header(default=None)) -> None:
    """Validate inbound requests from the web app using AI_SERVICE_API_KEY."""
    api_key = settings.ai_service_api_key.strip()

    if not api_key:
        raise HTTPException(status_code=503, detail="AI service auth is not configured")

    expected = f"Bearer {api_key}"

    if not authorization or not secrets.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")
