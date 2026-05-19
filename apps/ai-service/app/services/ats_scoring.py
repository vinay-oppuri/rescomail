from app.schemas.ats import AtsAnalysisResponse, AtsAnalyzeRequest
from app.schemas.resume import StructuredResume
from app.services.ats.evidence import (
    build_keyword_evidence,
    matched_keywords,
    missing_keywords,
)
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
    category_scores = build_score_breakdown(
        evidence,
        normalized_resume,
        normalized_job,
        job_profile,
        structured_resume,
    )
    overall_score = weighted_score(category_scores)

    return AtsAnalysisResponse(
        resumeId=request.resumeId,
        overallScore=overall_score,
        verdict=verdict(overall_score),
        categoryScores=category_scores,
        jobProfile=job_profile,
        evidence=evidence,
        matchedKeywords=matched_keywords(evidence),
        missingKeywords=missing_keywords(evidence),
        strengths=build_strengths(category_scores, evidence),
        risks=build_risks(category_scores, evidence, job_profile),
        suggestions=build_suggestions(category_scores, evidence, job_profile),
        rewriteSuggestions=build_rewrite_suggestions(evidence, job_profile),
        summary=build_summary(overall_score, job_profile, evidence),
    )
