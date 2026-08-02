from unittest.mock import patch
import pytest
from app.pipelines.resume_parser import parse_resume
from app.schemas.resume import ParseRequest, StructuredResume
from app.pipelines.ats_analysis import analyze_ats
from app.schemas.ats import AtsAnalyzeRequest, AtsAnalysisResponse
from app.pipelines.coldmail_generation import generate_coldmail
from app.schemas.coldmail import ColdEmailGenerateRequest, ColdEmailResponse

@patch("app.pipelines.resume_parser.extract_text_from_url")
@patch("app.services.resume.structuring.generate_gemini_json")
def test_parse_resume_pipeline(mock_gemini, mock_extract):
    mock_extract.return_value = "This is a raw resume text for John Doe."
    mock_gemini.return_value = {
        "personalInfo": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+123456789",
            "portfolioUrl": None,
            "githubUrl": None,
            "linkedinUrl": None,
        },
        "summary": "Experienced software engineer.",
        "skills": ["Python", "FastAPI"],
        "experience": [],
        "education": [],
        "projects": [],
    }

    req = ParseRequest(
        resumeId="mock-resume-id",
        fileUrl="https://utfs.io/f/test.pdf",
        fileName="test.pdf",
        geminiApiKey="mock-key"
    )
    res = parse_resume(req)
    assert isinstance(res, StructuredResume)
    assert res.personalInfo.name == "John Doe"
    assert "Python" in res.skills

@patch("app.services.ats.core.generate_gemini_json")
def test_ats_analysis_pipeline(mock_gemini):
    mock_gemini.return_value = {
        "overallScore": 85,
        "verdict": "strong_match",
        "categoryScores": {
            "skills": 90,
            "experience": 80,
            "education": 85,
        },
        "skillsGap": [
            {
                "skill": "Docker",
                "severity": "important",
                "recommendation": "Learn Docker basics.",
            }
        ],
        "guidance": "Great fit for the backend developer role.",
        "rewrites": [],
    }

    req = AtsAnalyzeRequest(
        jobDescription="We need a Python developer who knows FastAPI and Docker.",
        resumeText="John Doe is a Python developer with FastAPI experience.",
        structuredResume={
            "personalInfo": {
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+123456789",
            },
            "skills": ["Python", "FastAPI"],
            "experience": [],
            "education": [],
            "projects": [],
        },
        geminiApiKey="mock-key"
    )
    res = analyze_ats(req)
    assert isinstance(res, AtsAnalysisResponse)
    assert res.overallScore == 85
    assert res.verdict == "strong_match"

@patch("app.services.coldmail.generation.generate_gemini_json")
@patch("app.services.coldmail.company_context.get_rag_company_context")
def test_coldmail_generation_pipeline(mock_rag, mock_gemini):
    mock_rag.return_value = "Mocked company context from Tavily."
    mock_gemini.return_value = {
        "subject": "Inquiry: Python Backend Developer role",
        "previewText": "Experienced developer interested in Python Backend Developer opportunities.",
        "body": "Dear Hiring Manager,\n\nI am John Doe...",
        "followUpSubject": "Follow up on inquiry",
        "followUpBody": "Dear Hiring Manager,\n\nI wanted to follow up...",
        "personalizationNotes": ["Personalized note based on company website."],
        "estimatedReadTimeSeconds": 45,
    }

    req = ColdEmailGenerateRequest(
        resumeText="John Doe, Python Developer.",
        jobDescription="FastAPI developer opening.",
        companyName="TechCorp",
        companyWebsiteUrl="https://techcorp.com",
        recipientName="Jane Smith",
        recipientRole="Hiring Manager",
        personalNote="Love your recent blog post on FastAPI.",
        geminiApiKey="mock-key"
    )
    res = generate_coldmail(req)
    assert isinstance(res, ColdEmailResponse)
    assert res.estimatedReadTimeSeconds > 0
