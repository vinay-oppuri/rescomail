"""
app/core/rate_limit.py — slowapi limiter configuration.
Import `limiter` and apply @limiter.limit("N/minute") to routes.
Also import `limiter_handler` and register it on the FastAPI app in main.py.
"""

from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.config import settings


def get_rate_limit_key(request: Request) -> str:
    return request.headers.get("x-rescomail-user-id") or (
        request.client.host if request.client else "unknown"
    )


limiter = Limiter(
    key_func=get_rate_limit_key,
    default_limits=[f"{settings.rate_limit_per_minute}/minute"],
)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc.detail}. Please slow down."},
    )
