GEMINI_ATS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "overallScore": {"type": "INTEGER", "description": "Overall ATS match score 0-100"},
        "verdict": {
            "type": "STRING",
            "enum": ["strong_match", "good_match", "partial_match", "needs_work"],
        },
        "summary": {"type": "STRING", "description": "2-3 sentence professional summary"},
        "categoryScores": {
            "type": "OBJECT",
            "properties": {
                "keywords": {"type": "INTEGER"},
                "semantic": {"type": "INTEGER"},
                "skills": {"type": "INTEGER"},
                "experience": {"type": "INTEGER"},
                "impact": {"type": "INTEGER"},
                "formatting": {"type": "INTEGER"},
            },
            "required": ["keywords", "semantic", "skills", "experience", "impact", "formatting"],
        },
        "jobProfile": {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING"},
                "seniority": {"type": "STRING", "enum": ["entry", "mid", "senior", "lead", "staff"]},
                "yearsRequired": {"type": "INTEGER"},
                "requiredKeywords": {"type": "ARRAY", "items": {"type": "STRING"}},
                "preferredKeywords": {"type": "ARRAY", "items": {"type": "STRING"}},
                "responsibilities": {"type": "ARRAY", "items": {"type": "STRING"}},
                "certifications": {"type": "ARRAY", "items": {"type": "STRING"}},
            },
            "required": [
                "title", "seniority", "yearsRequired",
                "requiredKeywords", "preferredKeywords",
                "responsibilities", "certifications",
            ],
        },
        "evidence": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "keyword": {"type": "STRING"},
                    "status": {"type": "STRING", "enum": ["exact", "semantic", "missing"]},
                    "strength": {"type": "INTEGER"},
                    "sourceSection": {"type": "STRING"},
                    "snippets": {"type": "ARRAY", "items": {"type": "STRING"}},
                },
                "required": ["keyword", "status", "strength", "sourceSection", "snippets"],
            },
        },
        "matchedKeywords": {"type": "ARRAY", "items": {"type": "STRING"}},
        "missingKeywords": {"type": "ARRAY", "items": {"type": "STRING"}},
        "strengths": {"type": "ARRAY", "items": {"type": "STRING"}},
        "risks": {"type": "ARRAY", "items": {"type": "STRING"}},
        "suggestions": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "priority": {"type": "STRING", "enum": ["high", "medium", "low"]},
                    "title": {"type": "STRING"},
                    "detail": {"type": "STRING"},
                    "example": {"type": "STRING"},
                },
                "required": ["priority", "title", "detail"],
            },
        },
        "rewriteSuggestions": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "target": {"type": "STRING"},
                    "reason": {"type": "STRING"},
                    "before": {"type": "STRING"},
                    "after": {"type": "STRING"},
                },
                "required": ["target", "reason", "after"],
            },
        },
        "semanticMatch": {
            "type": "OBJECT",
            "properties": {
                "resumeToJob": {"type": "INTEGER"},
                "titleAlignment": {"type": "INTEGER"},
                "requiredSkillCoverage": {"type": "INTEGER"},
                "matchedConcepts": {"type": "ARRAY", "items": {"type": "STRING"}},
            },
            "required": ["resumeToJob", "titleAlignment", "requiredSkillCoverage", "matchedConcepts"],
        },
        "compatibilityPrediction": {
            "type": "OBJECT",
            "properties": {
                "probability": {"type": "INTEGER"},
                "confidence": {"type": "STRING", "enum": ["low", "medium", "high"]},
                "signals": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "label": {"type": "STRING"},
                            "impact": {"type": "INTEGER"},
                            "direction": {"type": "STRING", "enum": ["positive", "negative"]},
                        },
                        "required": ["label", "impact", "direction"],
                    },
                },
            },
            "required": ["probability", "confidence", "signals"],
        },
        "skillGaps": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "skill": {"type": "STRING"},
                    "severity": {"type": "STRING", "enum": ["critical", "important", "optional"]},
                    "currentEvidence": {"type": "STRING", "enum": ["missing", "weak", "semantic"]},
                    "recommendation": {"type": "STRING"},
                    "learningFocus": {"type": "STRING"},
                },
                "required": ["skill", "severity", "currentEvidence", "recommendation", "learningFocus"],
            },
        },
        "recruiterGuidance": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "title": {"type": "STRING"},
                    "detail": {"type": "STRING"},
                    "citations": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "id": {"type": "STRING"},
                                "title": {"type": "STRING"},
                                "sourceType": {
                                    "type": "STRING",
                                    "enum": ["recruiter_guideline", "resume_pattern", "domain_knowledge"],
                                },
                                "relevance": {"type": "INTEGER"},
                            },
                            "required": ["id", "title", "sourceType", "relevance"],
                        },
                    },
                },
                "required": ["title", "detail", "citations"],
            },
        },
    },
    "required": [
        "overallScore", "verdict", "summary", "categoryScores",
        "jobProfile", "evidence", "matchedKeywords", "missingKeywords",
        "strengths", "risks", "suggestions", "rewriteSuggestions",
        "semanticMatch", "compatibilityPrediction", "skillGaps", "recruiterGuidance",
    ],
}

ATS_SYSTEM_PROMPT = """You are an expert ATS optimization advisor.

## How ATS Systems Work
- Parsers look for standard section headers (Contact, Summary, Skills, Experience, Education, Projects, Certifications)
- Tables, columns, graphics, and icons confuse parsers
- Content in PDF headers/footers is often missed
- Recruiters search using boolean strings (e.g. "Python AND Kubernetes")
- The top third of a resume is the most important scan area
- Exact keyword matches score higher than semantic matches

## Scoring Guidelines (rate each 0-100)
1. Keywords (25% weight): % of required keywords present. Exact > semantic matches.
2. Semantic Depth (20%): Does the resume demonstrate genuine understanding beyond keyword lists?
3. Skills Coverage (18%): Breadth and depth of skills matching the job description.
4. Experience Fit (20%): Years, seniority, responsibility scope aligned with the role.
5. Impact (10%): Quantified achievements (%, $, scale, users). Action verbs.
6. Formatting (7%): Standard sections, appropriate length (250-1200 words), clear contact info.

## Verdict Thresholds
- strong_match: 85-100
- good_match: 70-84
- partial_match: 55-69
- needs_work: 0-54

## Evidence Rules
- exact: keyword appears directly in resume text
- semantic: synonym or related concept found (e.g. "AWS" in JD, "cloud" in resume)
- missing: no evidence found

## Skill Gap Severity
- critical: required keyword, missing entirely
- important: required keyword with weak/semantic evidence, or missing preferred keyword
- optional: preferred keyword with weak evidence

## Compatibility Signals
Provide 2-6 signals explaining the prediction. Each has a label, impact (-100 to 100), and direction (positive/negative)."""


def build_ats_prompt(
    resume_text: str,
    job_description: str,
    company_name: str,
    target_keywords: list[str],
) -> str:
    return f"""## Candidate Resume:
{resume_text[:12000]}

## Target Job Description:
{job_description[:12000]}

## Company Name:
{company_name or "Not specified"}

## User-Specified Target Keywords:
{", ".join(target_keywords) if target_keywords else "None specified"}

---
### Instructions:

Analyze how well this resume matches the job description.

1. **Extract Job Profile**: Title, seniority, years required, required keywords (must-haves), preferred keywords (nice-to-haves), responsibilities, certifications.

2. **Build Keyword Evidence** (up to 50 keywords): For each required/preferred keyword, check the resume and classify as "exact", "semantic", or "missing". Include brief context snippets. Never count the company name as a keyword match.

3. **Score Categories**: Assign 0-100 for each of the 6 categories above.

4. **Generate Intelligence**: Semantic match scores, compatibility prediction (probability + confidence + signals), skill gaps (up to 8), personalized recruiter guidance (2-4 items).

5. **Strengths & Risks**: 3-5 each.

6. **Suggestions**: 2-5 actionable items with priority levels.

7. **Rewrite Suggestions**: 2-4 specific bullet/section rewrites.

8. **Summary**: 2-3 professional sentences.

IMPORTANT: The company name "{company_name}" must NOT be treated as a keyword match.
IMPORTANT: If no specific resume section is identified, use "resume" as the sourceSection."""
