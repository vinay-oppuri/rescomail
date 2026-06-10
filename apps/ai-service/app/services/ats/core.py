import logging

from app.llm.gemini import generate_gemini_json
from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest
from app.schemas.resume import StructuredResume

from .prompts import build_ats_prompt, GEMINI_ATS_SCHEMA
from .parsers import _build_response
from .fallback import _fallback_response

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

    result = _call_gemini(prompt, request.geminiApiKey)
    if result:
        return _build_response(result, request)
    return _fallback_response(resume_text, request)


def _call_gemini(prompt: str, api_key: str | None) -> dict | None:
    try:
        return generate_gemini_json(
            prompt=prompt,
            response_schema=GEMINI_ATS_SCHEMA,
            api_key=api_key,
        )
    except Exception as exc:
        logger.warning("Gemini ATS analysis failed \u2014 using fallback: %s", exc)
        return None
