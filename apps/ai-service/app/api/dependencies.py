import os
import secrets

from fastapi import Header, HTTPException


def require_service_auth(authorization: str | None = Header(default=None)) -> None:
    api_key = os.getenv("RESUME_PARSER_API_KEY")

    if not api_key:
        return

    expected = f"Bearer {api_key}"

    if not authorization or not secrets.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")
