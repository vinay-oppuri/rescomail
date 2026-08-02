"""Rate-limit configuration and error response."""

from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded

from app.core.config import settings


def get_rate_limit_key(request: Request) -> str:
    """Prefer the authenticated user ID, then fall back to client IP."""
    user_id = request.headers.get("x-rescomail-user-id")
    client_ip = request.client.host if request.client else "unknown"
    return user_id or client_ip


limiter = Limiter(
    key_func=get_rate_limit_key,
    default_limits=[f"{settings.rate_limit_per_minute}/minute"],
)


async def rate_limit_exceeded_handler(
    request: Request,
    error: RateLimitExceeded,
) -> JSONResponse:
    """Return a stable response without exposing limiter internals."""
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please slow down."},
    )
