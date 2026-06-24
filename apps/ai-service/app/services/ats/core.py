import logging

from app.core.config import settings
from app.llm.gemini import generate_gemini_json
from app.llm.groq import generate_groq_json
from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest
from app.schemas.resume import StructuredResume

from .prompts import build_ats_prompt, GEMINI_ATS_SCHEMA
from .parsers import _build_response

logger = logging.getLogger("rescomail.ai-service.ats")


def analyze_resume_fit(
    request: AtsAnalyzeRequest,
    resume_text: str,
    structured_resume: StructuredResume | None = None,
) -> AtsAnalysisResponse:
    prompt = build_ats_prompt(
        resume_text=resume_text,
        job_description=request.jobDescription,
        company_name=request.companyName or "",
        target_keywords=request.targetKeywords or [],
    )

    # 1. Try primary Gemini model (gemini-3.5-flash by default)
    logger.info("Attempting ATS analysis with primary Gemini model...")
    result = _call_gemini(prompt, request.geminiApiKey, model="gemini-3.5-flash")

    # 2. Try alternative Gemini model if primary fails
    if not result:
        logger.info("Primary Gemini model failed. Attempting alternative model 'gemini-2.5-flash'...")
        result = _call_gemini(prompt, request.geminiApiKey, model="gemini-2.5-flash")

    # 3. Check for Groq fallback if Gemini failed completely
    if not result:
        groq_key = request.groqApiKey or settings.groq_api_key
        if groq_key and groq_key.strip():
            logger.info("Gemini failed completely. Falling back to Groq API...")
            result = _call_groq(prompt, groq_key)
            if not result:
                raise ValueError(
                    "Google Gemini failed due to high demand, and fallback Groq API analysis also failed. "
                    "Please verify your API keys and try again."
                )
        else:
            raise ValueError(
                "Google Gemini is currently experiencing high demand (503 Service Unavailable). "
                "Please configure a Groq API Key in your settings to use as a fallback, or try again later."
            )

    return _build_response(result, request)


def _call_gemini(prompt: str, api_key: str | None, model: str | None = None) -> dict | None:
    try:
        return generate_gemini_json(
            prompt=prompt,
            response_schema=GEMINI_ATS_SCHEMA,
            api_key=api_key,
            model=model,
        )
    except Exception as exc:
        logger.warning("Gemini ATS analysis model %s failed: %s", model or "default", exc)
        return None


def _call_groq(prompt: str, api_key: str) -> dict | None:
    try:
        return generate_groq_json(
            prompt=prompt,
            response_schema=GEMINI_ATS_SCHEMA,
            api_key=api_key,
        )
    except Exception as exc:
        logger.warning("Fallback Groq ATS analysis failed: %s", exc)
        return None
