"""Cold-email generation workflow."""

from app.schemas.coldmail import ColdEmailGenerateRequest, ColdEmailResponse
from app.services.resume.source import resolve_resume_text

from .company_context import get_rag_company_context
from .generation import generate_cold_email_draft


def generate_coldmail(request: ColdEmailGenerateRequest) -> ColdEmailResponse:
    """Generate an email using resume and optional company context."""
    resume_text = resolve_resume_text(request)
    company_context = _resolve_company_context(request)
    enriched_request = request.model_copy(update={"companyContext": company_context})

    return generate_cold_email_draft(
        enriched_request,
        resume_text,
        company_context=company_context,
        structured_resume=enriched_request.structuredResume,
    )


def _resolve_company_context(request: ColdEmailGenerateRequest) -> str:
    if request.companyContext:
        return request.companyContext

    if not (request.companyName or request.companyWebsiteUrl):
        return ""

    return get_rag_company_context(
        company_name=request.companyName,
        job_title=request.jobTitle,
        job_description=request.jobDescription,
        company_website_url=request.companyWebsiteUrl,
    )
