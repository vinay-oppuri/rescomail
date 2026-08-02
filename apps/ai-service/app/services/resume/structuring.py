from app.llm.gemini import generate_gemini_json
from app.schemas.resume import StructuredResume

from .prompt import build_resume_parser_prompt
from .response_schema import GEMINI_STRUCTURED_RESUME_SCHEMA


def structure_resume(preprocessed: dict, api_key: str | None = None) -> StructuredResume:
    generated = generate_gemini_json(
        build_resume_parser_prompt(preprocessed),
        GEMINI_STRUCTURED_RESUME_SCHEMA,
        api_key=api_key,
    )
    return StructuredResume.model_validate(generated or _fallback_resume(preprocessed))


def _fallback_resume(preprocessed: dict) -> dict:
    return {
        "personalInfo": {
            "name": preprocessed["name"],
            "email": preprocessed["email"],
            "phone": preprocessed["phone"],
            "portfolioUrl": None,
            "githubUrl": None,
            "linkedinUrl": None,
        },
        "summary": None,
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
    }

