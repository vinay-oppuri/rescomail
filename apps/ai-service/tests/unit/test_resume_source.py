from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.schemas.resume import StructuredResume
from app.services.resume.source import resolve_resume_text


def test_inline_resume_text_has_priority():
    source = SimpleNamespace(
        resumeText="  Python developer\n\n\nwith FastAPI  ",
        structuredResume=None,
        fileUrl="https://utfs.io/f/resume.pdf",
    )

    assert resolve_resume_text(source) == "Python developer\n\nwith FastAPI"


def test_structured_resume_is_converted_to_text():
    resume = StructuredResume.model_validate(
        {
            "personalInfo": {
                "name": "Jane Doe",
                "email": "jane@example.com",
                "phone": "1234567890",
            },
            "skills": ["Python", "FastAPI"],
            "experience": [],
            "education": [],
        }
    )
    source = SimpleNamespace(resumeText=None, structuredResume=resume, fileUrl=None)

    text = resolve_resume_text(source)

    assert "Jane Doe" in text
    assert "Skills: Python, FastAPI" in text


@patch("app.services.resume.source.extract_text_from_url")
def test_pdf_resume_is_downloaded_and_cleaned(mock_extract):
    mock_extract.return_value = "Resume\ttext"
    source = SimpleNamespace(
        resumeText=None,
        structuredResume=None,
        fileUrl="https://utfs.io/f/resume.pdf",
    )

    assert resolve_resume_text(source) == "Resume text"
    mock_extract.assert_called_once_with(source.fileUrl)


def test_missing_resume_source_is_rejected():
    source = SimpleNamespace(resumeText=None, structuredResume=None, fileUrl=None)

    with pytest.raises(ValueError, match="Provide resumeText"):
        resolve_resume_text(source)
