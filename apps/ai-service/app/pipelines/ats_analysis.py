import logging

from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest
from app.schemas.resume import StructuredResume
from app.services.ats import analyze_resume_fit
from app.services.resume.document_extraction import extract_text_from_url
from app.services.resume.text import structured_resume_to_text
from app.services.resume.cleaning import clean_resume_text

logger = logging.getLogger("rescomail.ai-service.ats")


def analyze_ats(request: AtsAnalyzeRequest) -> AtsAnalysisResponse:
    resume_text = _resolve_resume_text(request)
    structured_resume = request.structuredResume

    # 1. Run LLM-based ATS analysis
    response = analyze_resume_fit(request, resume_text, structured_resume)

    # 2. Override the LLM's self-reported semantic scores with real embedding scores.
    #    The LLM has no basis for computing cosine similarity — it fabricates numbers.
    #    We compute the real score and overwrite categoryScores.semantic and
    #    intelligence.semanticMatch fields so the output is truthful.
    try:
        from app.embeddings.semantic import semantic_similarity_score, shared_concepts

        real_semantic = semantic_similarity_score(resume_text, request.jobDescription)
        matched = shared_concepts(resume_text, request.jobDescription, limit=10)

        response.categoryScores.semantic = real_semantic
        response.intelligence.semanticMatch.resumeToJob = real_semantic
        response.intelligence.semanticMatch.embeddingModel = "gemini-text-embedding-004"
        response.intelligence.semanticMatch.matchedConcepts = matched

        logger.info(
            "Real semantic score for resume %s: %d (LLM had reported: was overridden)",
            request.resumeId or "inline",
            real_semantic,
        )
    except Exception as exc:
        # Non-fatal: if embedding call fails, keep LLM's scores rather than crashing
        logger.warning("Real semantic scoring failed, keeping LLM scores: %s", exc)

    return response


def _resolve_resume_text(request: AtsAnalyzeRequest) -> str:
    if request.resumeText and request.resumeText.strip():
        return clean_resume_text(request.resumeText)

    if request.structuredResume:
        structured_resume = StructuredResume.model_validate(request.structuredResume)
        return structured_resume_to_text(structured_resume)

    if request.fileUrl:
        return clean_resume_text(extract_text_from_url(request.fileUrl))

    raise ValueError("Unable to resolve resume text for ATS analysis.")
