"""
app/main.py — FastAPI application factory.

Wires together:
  - Structured logging (structlog + TraceMiddleware)
  - Rate limiting (slowapi)
  - Custom exception handlers
  - All API routers
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import (
    RescomailError,
    rescomail_exception_handler,
    unhandled_exception_handler,
)
from app.core.logging import TraceMiddleware, configure_structlog, get_logger
from app.core.rate_limit import limiter

# Initialise structlog before anything else
configure_structlog(settings.log_level)
logger = get_logger("rescomail.ai-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Precompile Pydantic schemas at startup to avoid cold-start latency and
    # thread-concurrency mega-cache errors under load.
    try:
        from app.schemas.ats import AtsAnalyzeRequest, AtsAnalysisResponse
        from app.schemas.resume import StructuredResume

        AtsAnalyzeRequest.model_json_schema()
        AtsAnalysisResponse.model_json_schema()
        StructuredResume.model_json_schema()
    except Exception as exc:
        logger.warning("Failed to precompile Pydantic schemas", error=str(exc))

    logger.info(
        "Rescomail AI service started",
        gemini_model=settings.gemini_model,
        log_level=settings.log_level,
        rate_limit=f"{settings.rate_limit_per_minute}/minute",
    )
    yield
    logger.info("Rescomail AI service shutting down.")


import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        integrations=[FastApiIntegration()],
        traces_sample_rate=settings.sentry_traces_sample_rate,
        send_default_pii=False,
    )

public_docs = settings.environment != "production"
app = FastAPI(
    title="Rescomail AI Service",
    lifespan=lifespan,
    docs_url="/docs" if public_docs else None,
    redoc_url="/redoc" if public_docs else None,
    openapi_url="/openapi.json" if public_docs else None,
)

# --- Middleware ---
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(TraceMiddleware)

# --- Exception handlers ---
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(RescomailError, rescomail_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# --- Routers ---
app.include_router(api_router)
