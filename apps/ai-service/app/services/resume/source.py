"""Resolve resume text from any supported request input."""

from typing import Protocol

from app.schemas.resume import StructuredResume
from app.services.resume.cleaning import clean_resume_text
from app.services.resume.document_extraction import extract_text_from_url
from app.services.resume.text import structured_resume_to_text


class ResumeSource(Protocol):
    """Fields required by requests that can supply a resume."""

    resumeText: str | None
    structuredResume: StructuredResume | None
    fileUrl: str | None


def resolve_resume_text(source: ResumeSource) -> str:
    """Return clean text from inline text, structured data, or a PDF URL."""
    if source.resumeText and source.resumeText.strip():
        return clean_resume_text(source.resumeText)

    if source.structuredResume:
        return structured_resume_to_text(source.structuredResume)

    if source.fileUrl:
        return clean_resume_text(extract_text_from_url(source.fileUrl))

    raise ValueError("Provide resumeText, structuredResume, or fileUrl.")
