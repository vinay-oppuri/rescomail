import logging
from pydantic import BaseModel

from app.llm.gemini import generate_gemini_json
from app.schemas.ats import (
    AtsAnalyzeRequest,
    AtsJobProfile,
    AtsRewriteSuggestion,
    AtsScoreBreakdown,
    AtsSuggestion,
)
from app.services.ats.knowledge_base import retrieve_guidance

logger = logging.getLogger("rescomail.ai-service.ats.llm_layer")


class AtsAILayerResponse(BaseModel):
    summary: str
    suggestions: list[AtsSuggestion]
    rewriteSuggestions: list[AtsRewriteSuggestion]


GEMINI_ATS_AI_LAYER_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary": {"type": "STRING"},
        "suggestions": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "priority": {"type": "STRING", "enum": ["high", "medium", "low"]},
                    "title": {"type": "STRING"},
                    "detail": {"type": "STRING"},
                    "example": {"type": "STRING"},
                },
                "required": ["priority", "title", "detail"],
            },
        },
        "rewriteSuggestions": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "target": {"type": "STRING"},
                    "reason": {"type": "STRING"},
                    "before": {"type": "STRING"},
                    "after": {"type": "STRING"},
                },
                "required": ["target", "reason", "after"],
            },
        },
    },
    "required": ["summary", "suggestions", "rewriteSuggestions"],
}


def run_ats_llm_layer(
    request: AtsAnalyzeRequest,
    resume_text: str,
    missing_keywords: list[str],
    job_profile: AtsJobProfile,
    category_scores: AtsScoreBreakdown,
    semantic_resume_job: int,
) -> AtsAILayerResponse | None:
    try:
        # 1. Retrieve RAG guidelines from the internal knowledge base
        query = " ".join(
            [
                job_profile.title,
                " ".join(job_profile.requiredKeywords),
                f"impact score {category_scores.impact}",
                f"formatting score {category_scores.formatting}",
                f"semantic score {semantic_resume_job}",
            ]
        )
        retrieved = retrieve_guidance(query, limit=3)
        guideline_texts = [
            f"- Guidance '{doc.title}': {doc.content}"
            for doc, rel in retrieved
        ]

        # 2. Build prompt for Gemini
        prompt = _build_prompt(
            resume_text=resume_text,
            job_description=request.jobDescription,
            missing_keywords=missing_keywords,
            guideline_texts=guideline_texts,
        )

        # 3. Call Gemini for structured JSON generation
        result = generate_gemini_json(
            prompt=prompt,
            response_schema=GEMINI_ATS_AI_LAYER_SCHEMA,
            api_key=request.geminiApiKey,
        )

        if not result:
            return None

        return AtsAILayerResponse.model_validate(result)

    except Exception as exc:
        logger.warning(
            "ATS AI layer RAG enrichment failed — falling back to templates: %s",
            exc,
        )
        return None


def _build_prompt(
    resume_text: str,
    job_description: str,
    missing_keywords: list[str],
    guideline_texts: list[str],
) -> str:
    guidelines_block = "\n".join(guideline_texts)
    missing_keywords_block = (
        ", ".join(missing_keywords) if missing_keywords else "None detected"
    )

    return f"""You are an expert ATS optimization advisor. Your task is to analyze the candidate's resume against the target job description and provide a personalized match report.

Leverage the following recruiter guidelines retrieved from our RAG knowledge base:
{guidelines_block}

### Missing Critical Keywords:
{missing_keywords_block}

### Candidate Resume:
{resume_text[:8000]}

### Job Description:
{job_description[:8000]}

---

### Instructions:
1. **Match Summary**: Write 2-3 professional, objective sentences describing how well the candidate aligns with the role, highlighting key strengths and the most critical gap.
2. **Suggestions**: Provide 2 to 4 actionable suggestions to optimize the resume. Give each suggestion a priority ("high", "medium", or "low"), a concise title, details of why it is needed, and a brief example.
3. **Bullet Point Improvements**: Provide 2 to 4 rewrite suggestions for specific lines or sections on the candidate's resume.
   - Identify the original target text (the target bullet or section name).
   - State the reason why it needs improvement (e.g. to weave in missing keywords or show better metric-driven impact).
   - Write the improved 'after' version of the text.

Your output must strictly conform to the provided JSON Schema.
"""
