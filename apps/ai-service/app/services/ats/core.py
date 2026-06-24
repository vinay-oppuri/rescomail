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

    result = None

    if request.primaryProvider == "groq":
        # 1. Try Groq API first
        groq_key = request.groqApiKey or settings.groq_api_key
        if groq_key and groq_key.strip():
            logger.info("Attempting ATS analysis with Groq as primary provider...")
            result = _call_groq(prompt, groq_key)
        else:
            logger.warning("Groq selected as primary but no Groq API Key is configured. Skipping Groq and attempting Gemini fallback...")

        # 2. Try Gemini fallback if Groq failed or key was missing
        if not result:
            logger.info("Primary Groq failed/unconfigured. Falling back to Gemini model 'gemini-3.5-flash'...")
            result = _call_gemini(prompt, request.geminiApiKey, model="gemini-3.5-flash")

        if not result:
            logger.info("Gemini model 'gemini-3.5-flash' failed. Attempting alternative model 'gemini-2.5-flash'...")
            result = _call_gemini(prompt, request.geminiApiKey, model="gemini-2.5-flash")

        if not result:
            if not groq_key or not groq_key.strip():
                raise ValueError(
                    "Groq is selected as the primary provider but no Groq API Key is configured, "
                    "and fallback Google Gemini failed due to high demand. "
                    "Please configure a Groq API Key in your settings, or try again later."
                )
            else:
                raise ValueError(
                    "Groq API analysis failed, and fallback Google Gemini is also currently experiencing high demand. "
                    "Please verify your API keys and try again."
                )
    else:
        # Default: Gemini first, Groq fallback
        logger.info("Attempting ATS analysis with primary Gemini model 'gemini-3.5-flash'...")
        result = _call_gemini(prompt, request.geminiApiKey, model="gemini-3.5-flash")

        if not result:
            logger.info("Primary Gemini model failed. Attempting alternative model 'gemini-2.5-flash'...")
            result = _call_gemini(prompt, request.geminiApiKey, model="gemini-2.5-flash")

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
