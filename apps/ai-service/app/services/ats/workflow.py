"""ATS analysis workflow."""

import logging

from app.embeddings.semantic import semantic_similarity_score, shared_concepts
from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest
from app.services.resume.source import resolve_resume_text

from .core import analyze_resume_fit

logger = logging.getLogger("rescomail.ai-service.ats")


def analyze_ats(request: AtsAnalyzeRequest) -> AtsAnalysisResponse:
    """Analyze resume fit and replace guessed semantic scores with real ones."""
    resume_text = resolve_resume_text(request)
    response = analyze_resume_fit(request, resume_text, request.structuredResume)

    try:
        score = semantic_similarity_score(resume_text, request.jobDescription)
        concepts = shared_concepts(resume_text, request.jobDescription, limit=10)
    except Exception as error:
        logger.warning("Semantic scoring failed; keeping LLM scores: %s", error)
        return response

    response.categoryScores.semantic = score
    response.intelligence.semanticMatch.resumeToJob = score
    response.intelligence.semanticMatch.embeddingModel = "gemini-embedding-2"
    response.intelligence.semanticMatch.matchedConcepts = concepts
    return response
