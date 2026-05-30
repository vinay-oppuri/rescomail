from app.schemas.coldmail import ColdEmailGenerateRequest, ColdEmailResponse
from app.schemas.resume import StructuredResume
from app.services.coldmail_generation import generate_cold_email_draft
from app.services.document_extraction import extract_text_from_url
from app.services.resume_text import structured_resume_to_text
from app.services.text_cleaning import clean_resume_text


def generate_coldmail(request: ColdEmailGenerateRequest) -> ColdEmailResponse:
    resume_text = _resolve_resume_text(request)
    structured_resume = request.structuredResume

    # Resolve company context using RAG retrieval without mutating the inbound request object.
    company_context = request.companyContext or ""
    if not company_context and (request.companyName or request.companyWebsiteUrl):
        from app.services.company_context import get_rag_company_context
        
        job_description = request.jobDescription or request.jobTitle or ""
        company_context = get_rag_company_context(
            company_name=request.companyName,
            job_title=request.jobTitle,
            job_description=job_description,
            company_website_url=request.companyWebsiteUrl,
        )

    return generate_cold_email_draft(
        request,
        resume_text,
        company_context=company_context,
        structured_resume=structured_resume,
    )


def _resolve_resume_text(request: ColdEmailGenerateRequest) -> str:
    if request.resumeText and request.resumeText.strip():
        return clean_resume_text(request.resumeText)

    if request.structuredResume:
        structured_resume = StructuredResume.model_validate(request.structuredResume)
        return structured_resume_to_text(structured_resume)

    if request.fileUrl:
        return clean_resume_text(extract_text_from_url(request.fileUrl))

    raise ValueError("Unable to resolve resume text for cold email generation.")
