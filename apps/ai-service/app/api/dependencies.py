import secrets

from fastapi import Header, HTTPException

from app.core.config import settings


def require_service_auth(authorization: str | None = Header(default=None)) -> None:
    """Validate inbound requests from the web app using AI_SERVICE_API_KEY."""
    candidates = [settings.ai_service_api_key, settings.ai_service_previous_api_key]
    valid = bool(authorization) and any(
        key and secrets.compare_digest(authorization, f"Bearer {key.strip()}")
        for key in candidates
    )
    if not valid:
        raise HTTPException(status_code=401, detail="Unauthorized")
