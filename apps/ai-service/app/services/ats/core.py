"""Generate ATS analysis with a clear provider fallback order."""

import logging
from collections.abc import Callable

from app.core.config import settings
from app.llm.gemini import generate_gemini_json
from app.llm.groq import generate_groq_json
from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest
from app.schemas.resume import StructuredResume

from .parsers import _build_response
from .prompts import GEMINI_ATS_SCHEMA, build_ats_prompt

logger = logging.getLogger("rescomail.ai-service.ats")

ProviderCall = tuple[str, Callable[[], dict | None]]


def analyze_resume_fit(
    request: AtsAnalyzeRequest,
    resume_text: str,
    structured_resume: StructuredResume | None = None,
) -> AtsAnalysisResponse:
    """Run ATS analysis using the requested provider, then safe fallbacks."""
    prompt = build_ats_prompt(
        resume_text=resume_text,
        job_description=request.jobDescription,
        company_name=request.companyName,
        structured_resume=structured_resume,
    )

    for provider_name, generate in _provider_calls(request, prompt):
        try:
            result = generate()
            if result:
                return _build_response(result, request)
        except Exception as error:
            logger.warning("ATS provider %s failed: %s", provider_name, error)

    raise ValueError(
        "AI analysis is temporarily unavailable. Check the configured API keys and retry."
    )


def _provider_calls(request: AtsAnalyzeRequest, prompt: str) -> list[ProviderCall]:
    """Return configured providers in the desired fallback order."""
    gemini_key = request.geminiApiKey or settings.gemini_api_key
    groq_key = request.groqApiKey or settings.groq_api_key

    gemini_calls: list[ProviderCall] = []
    if gemini_key.strip():
        gemini_calls = [
            (
                f"Gemini ({settings.gemini_model})",
                lambda: generate_gemini_json(
                    prompt,
                    GEMINI_ATS_SCHEMA,
                    api_key=gemini_key,
                    model=settings.gemini_model,
                ),
            ),
            (
                "Gemini (gemini-2.5-flash)",
                lambda: generate_gemini_json(
                    prompt,
                    GEMINI_ATS_SCHEMA,
                    api_key=gemini_key,
                    model="gemini-2.5-flash",
                ),
            ),
        ]

    groq_calls: list[ProviderCall] = []
    if groq_key.strip():
        groq_calls = [
            (
                "Groq",
                lambda: generate_groq_json(
                    prompt,
                    GEMINI_ATS_SCHEMA,
                    api_key=groq_key,
                ),
            )
        ]

    if request.primaryProvider == "groq":
        return groq_calls + gemini_calls
    return gemini_calls + groq_calls
