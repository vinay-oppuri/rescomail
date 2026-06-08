"""
app/core/logging.py — Structured logging with per-request trace_id via structlog.
Adds TraceMiddleware that injects a UUID trace_id into every request's context,
which then appears in all log lines emitted during that request.
"""

import logging
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


def configure_structlog(log_level: str = "INFO") -> None:
    """Configure structlog once at application startup."""
    level = getattr(logging, log_level.upper(), logging.INFO)

    # Configure the stdlib root logger so uvicorn/fastapi logs are captured too
    logging.basicConfig(
        format="%(message)s",
        level=level,
    )

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,      # requires stdlib LoggerFactory
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),  # wraps stdlib loggers → has .name
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Return a structlog logger bound to a specific module name."""
    return structlog.get_logger(name)


class TraceMiddleware(BaseHTTPMiddleware):
    """Inject a unique trace_id into every request's structlog context.

    Every log statement made during the lifetime of the request will
    automatically include ``trace_id=<uuid>``, making cross-pipeline
    debugging much easier.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        trace_id = str(uuid.uuid4())
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            trace_id=trace_id,
            method=request.method,
            path=request.url.path,
        )
        response = await call_next(request)
        response.headers["X-Trace-Id"] = trace_id
        return response
