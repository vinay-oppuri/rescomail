"""
app/core/exceptions.py — Custom exception classes and FastAPI exception handlers.
Register the handlers in app/main.py via app.add_exception_handler(...).
"""

from fastapi import Request
from fastapi.responses import JSONResponse


class RescomailError(Exception):
    """Base class for all Rescomail AI service exceptions."""

    status_code: int = 500
    detail: str = "An unexpected error occurred."

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)


class LLMError(RescomailError):
    """Raised when a Gemini API call fails after all retries."""

    status_code = 502
    detail = "The language model returned an error. Please retry."


class DocumentExtractionError(RescomailError):
    """Raised when PDF text extraction fails."""

    status_code = 422
    detail = "Failed to extract text from the provided document."


class RateLimitExceededError(RescomailError):
    """Raised when a client exceeds the configured rate limit."""

    status_code = 429
    detail = "Too many requests. Please slow down."


class AuthError(RescomailError):
    """Raised for authentication failures."""

    status_code = 401
    detail = "Unauthorized."


# ---------------------------------------------------------------------------
# FastAPI exception handlers — register these in main.py
# ---------------------------------------------------------------------------


async def rescomail_exception_handler(request: Request, exc: RescomailError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please contact support."},
    )
