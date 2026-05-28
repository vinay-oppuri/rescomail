import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router

load_dotenv_called = False
try:
    from dotenv import load_dotenv
    load_dotenv()
    load_dotenv_called = True
except ImportError:
    pass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rescomail.ai-service")


def _assert_required_env() -> None:
    """Fail fast at startup if critical environment variables are missing."""
    missing = []

    if not os.getenv("GEMINI_API_KEY", "").strip():
        missing.append(
            "GEMINI_API_KEY — required for Gemini LLM (the only supported provider)"
        )

    if not os.getenv("AI_SERVICE_API_KEY", "").strip():
        missing.append(
            "AI_SERVICE_API_KEY - required to authenticate inbound web app requests"
        )

    if missing:
        raise RuntimeError(
            "Rescomail AI service cannot start — missing required environment variables:\n"
            + "\n".join(f"  • {m}" for m in missing)
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _assert_required_env()
    
    # Precompile Pydantic schemas to avoid thread concurrency mega-cache errors
    try:
        from app.schemas.ats import AtsAnalyzeRequest, AtsAnalysisResponse
        from app.schemas.resume import StructuredResume
        AtsAnalyzeRequest.model_json_schema()
        AtsAnalysisResponse.model_json_schema()
        StructuredResume.model_json_schema()
    except Exception as e:
        logger.warning(f"Failed to precompile models: {e}")

    logger.info("Rescomail AI service started (Gemini provider: %s)", os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
    yield
    logger.info("Rescomail AI service shutting down.")


app = FastAPI(title="Rescomail AI Service", lifespan=lifespan)
app.include_router(api_router)
