from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest
from app.schemas.resume import StructuredResume
from app.embeddings.semantic import semantic_similarity_score
from app.services.ats.evidence import (
    build_keyword_evidence,
    matched_keywords,
    missing_keywords,
)
from app.services.ats.intelligence import build_intelligence
from app.services.ats.job_profile import extract_job_profile
from app.services.ats.recommendations import (
    build_rewrite_suggestions,
    build_risks,
    build_strengths,
    build_suggestions,
    build_summary,
    verdict,
)
from app.services.ats.scores import build_score_breakdown, weighted_score
from app.utils.text import normalize_text


def analyze_resume_fit(
    request: AtsAnalyzeRequest,
    resume_text: str,
    structured_resume: StructuredResume | None = None,
) -> AtsAnalysisResponse:
    normalized_resume = normalize_text(resume_text)
    normalized_job = normalize_text(request.jobDescription)
    job_profile = extract_job_profile(request)
    evidence = build_keyword_evidence(
        resume_text,
        normalized_resume,
        job_profile.requiredKeywords + job_profile.preferredKeywords,
    )
    semantic_resume_job = semantic_similarity_score(resume_text, request.jobDescription)
    category_scores = build_score_breakdown(
        evidence,
        normalized_resume,
        normalized_job,
        job_profile,
        structured_resume,
        semantic_resume_job,
    )
    intelligence = build_intelligence(
        resume_text,
        request.jobDescription,
        normalized_resume,
        job_profile,
        evidence,
        category_scores,
        semantic_resume_job,
    )
    heuristic_score = weighted_score(category_scores)
    overall_score = round(
        heuristic_score * 0.72
        + intelligence.compatibilityPrediction.probability * 0.28
    )

    # 1. Establish robust local template-based fallbacks
    strengths = build_strengths(category_scores, evidence)
    risks = build_risks(category_scores, evidence, job_profile)
    suggestions = build_suggestions(category_scores, evidence, job_profile)
    rewrite_suggestions = build_rewrite_suggestions(evidence, job_profile)
    summary = build_summary(overall_score, job_profile, evidence)

    # 2. Try RAG LLM layer enrichment via Gemini
    from app.services.ats.llm_layer import run_ats_llm_layer
    ai_response = run_ats_llm_layer(
        request=request,
        resume_text=resume_text,
        missing_keywords=missing_keywords(evidence),
        job_profile=job_profile,
        category_scores=category_scores,
        semantic_resume_job=semantic_resume_job,
    )

    if ai_response:
        suggestions = ai_response.suggestions
        rewrite_suggestions = ai_response.rewriteSuggestions
        summary = ai_response.summary

    return AtsAnalysisResponse(
        resumeId=request.resumeId,
        overallScore=overall_score,
        verdict=verdict(overall_score),
        categoryScores=category_scores,
        jobProfile=job_profile,
        evidence=evidence,
        matchedKeywords=matched_keywords(evidence),
        missingKeywords=missing_keywords(evidence),
        strengths=strengths,
        risks=risks,
        suggestions=suggestions,
        rewriteSuggestions=rewrite_suggestions,
        intelligence=intelligence,
        summary=summary,
    )
