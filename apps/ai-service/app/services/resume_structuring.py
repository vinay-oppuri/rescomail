from app.llm.gemini import generate_gemini_json
from app.models.resume import GEMINI_STRUCTURED_RESUME_SCHEMA
from app.prompts.resume_parser import build_resume_parser_prompt
from app.schemas.resume import StructuredResume


def structure_resume(preprocessed: dict) -> StructuredResume:
    generated = generate_gemini_json(
        build_resume_parser_prompt(preprocessed),
        GEMINI_STRUCTURED_RESUME_SCHEMA,
    )
    return StructuredResume.model_validate(generated or _fallback_resume(preprocessed))


def _fallback_resume(preprocessed: dict) -> dict:
    return {
        "personalInfo": {
            "name": preprocessed["name"],
            "email": preprocessed["email"],
            "phone": preprocessed["phone"],
        },
        "skills": [],
        "experience": [],
        "education": [],
    }
