import os
import secrets

from fastapi import Header, HTTPException


def require_service_auth(authorization: str | None = Header(default=None)) -> None:
    """Validate inbound requests from the web app using AI_SERVICE_API_KEY.

    This is the web → AI service trust boundary.
    The AI service → web webhook callback uses RESUME_PARSER_API_KEY (a separate secret).
    """
    api_key = os.getenv("AI_SERVICE_API_KEY", "").strip()

    if not api_key:
        # Key not configured — skip auth (dev convenience, logged at startup as warning).
        return

    expected = f"Bearer {api_key}"

    if not authorization or not secrets.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")
