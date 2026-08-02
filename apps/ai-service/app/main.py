"""Create and configure the FastAPI application."""

from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import unhandled_exception_handler
from app.core.logging import TraceMiddleware, configure_logging, get_logger
from app.core.rate_limit import limiter, rate_limit_exceeded_handler

configure_logging(settings.log_level)
logger = get_logger("rescomail.ai-service")


def configure_error_reporting() -> None:
    """Enable Sentry only when a DSN is configured."""
    if not settings.sentry_dsn:
        return

    # Sentry discovers FastAPI automatically. Avoid importing a version-specific
    # integration class, which can break startup when package versions differ.
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=settings.sentry_traces_sample_rate,
        send_default_pii=False,
    )


def prepare_schemas() -> None:
    """Build frequently used schemas once during startup."""
    from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest
    from app.schemas.resume import StructuredResume

    for schema in (AtsAnalyzeRequest, AtsAnalysisResponse, StructuredResume):
        schema.model_json_schema()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        prepare_schemas()
    except Exception as error:
        logger.warning("Schema preparation failed: %s", error)

    logger.info("AI service started in %s", settings.environment)
    yield
    logger.info("AI service stopped")


def create_app() -> FastAPI:
    """Build the application. Keeping this in one function makes it testable."""
    public_docs = settings.environment != "production"
    application = FastAPI(
        title="Rescomail AI Service",
        lifespan=lifespan,
        docs_url="/docs" if public_docs else None,
        redoc_url="/redoc" if public_docs else None,
        openapi_url="/openapi.json" if public_docs else None,
    )

    application.state.limiter = limiter
    application.add_middleware(SlowAPIMiddleware)
    application.add_middleware(TraceMiddleware)

    application.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    application.add_exception_handler(Exception, unhandled_exception_handler)
    application.include_router(api_router)
    return application


configure_error_reporting()
app = create_app()
