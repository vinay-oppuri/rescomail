from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest
from app.schemas.resume import StructuredResume
from app.services.ats.scoring import analyze_resume_fit
from app.services.resume.document_extraction import extract_text_from_url
from app.services.resume.text import structured_resume_to_text
from app.services.resume.cleaning import clean_resume_text


def analyze_ats(request: AtsAnalyzeRequest) -> AtsAnalysisResponse:
    resume_text = _resolve_resume_text(request)
    structured_resume = request.structuredResume
    return analyze_resume_fit(request, resume_text, structured_resume)


def _resolve_resume_text(request: AtsAnalyzeRequest) -> str:
    if request.resumeText and request.resumeText.strip():
        return clean_resume_text(request.resumeText)

    if request.structuredResume:
        structured_resume = StructuredResume.model_validate(request.structuredResume)
        return structured_resume_to_text(structured_resume)

    if request.fileUrl:
        return clean_resume_text(extract_text_from_url(request.fileUrl))

    raise ValueError("Unable to resolve resume text for ATS analysis.")
