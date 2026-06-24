from app.schemas.ats import (
    AtsAnalysisResponse,
    AtsAnalyzeRequest,
    AtsCompatibilityPrediction,
    AtsGroundedSuggestion,
    AtsIntelligence,
    AtsJobProfile,
    AtsKeywordEvidence,
    AtsRewriteSuggestion,
    AtsScoreBreakdown,
    AtsSemanticMatch,
    AtsSkillGap,
    AtsSuggestion,
)

def _build_response(result: dict, request: AtsAnalyzeRequest) -> AtsAnalysisResponse:
    cs = result.get("categoryScores", {})
    jp = result.get("jobProfile", {})
    sm = result.get("semanticMatch", {})
    cp = result.get("compatibilityPrediction", {})

    return AtsAnalysisResponse(
        resumeId=request.resumeId,
        overallScore=_clamp(result.get("overallScore", 50)),
        verdict=_safe_verdict(result.get("verdict", "needs_work")),
        categoryScores=AtsScoreBreakdown(
            keywords=_clamp(cs.get("keywords", 50)),
            semantic=_clamp(cs.get("semantic", 50)),
            skills=_clamp(cs.get("skills", 50)),
            experience=_clamp(cs.get("experience", 50)),
            impact=_clamp(cs.get("impact", 50)),
            formatting=_clamp(cs.get("formatting", 50)),
        ),
        jobProfile=AtsJobProfile(
            title=jp.get("title", "Target role"),
            seniority=jp.get("seniority", "mid"),
            yearsRequired=jp.get("yearsRequired", 0),
            requiredKeywords=jp.get("requiredKeywords", []),
            preferredKeywords=jp.get("preferredKeywords", []),
            responsibilities=jp.get("responsibilities", []),
            certifications=jp.get("certifications", []),
        ),
        evidence=[_parse_evidence(e) for e in result.get("evidence", [])[:50]],
        matchedKeywords=result.get("matchedKeywords", []),
        missingKeywords=result.get("missingKeywords", []),
        strengths=result.get("strengths", ["Begin ATS comparison with this baseline."]),
        risks=result.get("risks", []),
        suggestions=[_parse_suggestion(s) for s in result.get("suggestions", [])[:7]],
        rewriteSuggestions=[_parse_rewrite(r) for r in result.get("rewriteSuggestions", [])[:4]],
        intelligence=AtsIntelligence(
            semanticMatch=AtsSemanticMatch(
                resumeToJob=_clamp(sm.get("resumeToJob", 50)),
                titleAlignment=_clamp(sm.get("titleAlignment", 50)),
                requiredSkillCoverage=_clamp(sm.get("requiredSkillCoverage", 50)),
                embeddingModel="gemini-llm-analysis-v2",
                matchedConcepts=sm.get("matchedConcepts", []),
            ),
            compatibilityPrediction=AtsCompatibilityPrediction(
                modelVersion="gemini-llm-ats-v1",
                modelType="gemini-3.5-flash-llm-analysis",
                probability=_clamp(cp.get("probability", 50)),
                confidence=cp.get("confidence", "medium"),
                signals=cp.get("signals", []),
            ),
            skillGaps=[_parse_gap(g) for g in result.get("skillGaps", [])[:8]],
            recruiterGuidance=[_parse_guidance(g) for g in result.get("recruiterGuidance", [])[:4]],
        ),
        summary=result.get("summary", ""),
    )


def _parse_evidence(item: dict) -> AtsKeywordEvidence:
    return AtsKeywordEvidence(
        keyword=item.get("keyword", ""),
        status=item.get("status", "missing"),
        strength=_clamp(item.get("strength", 0)),
        sourceSection=item.get("sourceSection", "resume"),
        snippets=item.get("snippets", []),
    )


def _parse_suggestion(item: dict) -> AtsSuggestion:
    return AtsSuggestion(
        priority=item.get("priority", "medium"),
        title=item.get("title", ""),
        detail=item.get("detail", ""),
        example=item.get("example"),
    )


def _parse_rewrite(item: dict) -> AtsRewriteSuggestion:
    return AtsRewriteSuggestion(
        target=item.get("target", ""),
        reason=item.get("reason", ""),
        before=item.get("before"),
        after=item.get("after", ""),
    )


def _parse_gap(item: dict) -> AtsSkillGap:
    return AtsSkillGap(
        skill=item.get("skill", ""),
        severity=item.get("severity", "optional"),
        currentEvidence=item.get("currentEvidence", "missing"),
        recommendation=item.get("recommendation", ""),
        learningFocus=item.get("learningFocus", ""),
    )


def _parse_guidance(item: dict) -> AtsGroundedSuggestion:
    return AtsGroundedSuggestion(
        title=item.get("title", ""),
        detail=item.get("detail", ""),
        citations=item.get("citations", []),
    )


def _safe_verdict(verdict: str) -> str:
    valid = {"strong_match", "good_match", "partial_match", "needs_work"}
    return verdict if verdict in valid else "needs_work"


def _clamp(score: int) -> int:
    return max(0, min(100, score))
