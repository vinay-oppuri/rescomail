"""Application exception handlers."""

import logging

from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("rescomail.ai-service")


async def unhandled_exception_handler(request: Request, error: Exception) -> JSONResponse:
    """Log unexpected errors while returning a safe public message."""
    logger.exception(
        "Unhandled request error",
        exc_info=error,
        extra={"method": request.method, "path": request.url.path},
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please contact support."},
    )
