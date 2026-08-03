from app.schemas.resume import StructuredResume

GEMINI_ATS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "overallScore": {"type": "INTEGER", "description": "Overall ATS match score 0-100"},
        "verdict": {
            "type": "STRING",
            "enum": ["strong_match", "good_match", "partial_match", "needs_work"],
        },
        "summary": {
            "type": "STRING",
            "description": "A 2-3 sentence professional match summary evaluating how well the candidate fits the target role based on key alignments and gaps. Do NOT output contact information, name headers, emails, or phone numbers here.",
        },
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
                "seniority": {
                    "type": "STRING",
                    "enum": ["entry", "mid", "senior", "lead", "staff"],
                },
                "yearsRequired": {"type": "INTEGER"},
                "requiredKeywords": {"type": "ARRAY", "items": {"type": "STRING"}},
                "preferredKeywords": {"type": "ARRAY", "items": {"type": "STRING"}},
                "responsibilities": {"type": "ARRAY", "items": {"type": "STRING"}},
                "certifications": {"type": "ARRAY", "items": {"type": "STRING"}},
            },
            "required": [
                "title",
                "seniority",
                "yearsRequired",
                "requiredKeywords",
                "preferredKeywords",
                "responsibilities",
                "certifications",
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
                    "target": {
                        "type": "STRING",
                        "description": "The category of the rewrite. Must be one of: 'Summary', 'Work Experience', or 'Projects'",
                    },
                    "reason": {
                        "type": "STRING",
                        "description": "Why this specific bullet point replacement is suggested and how it enhances the ATS score",
                    },
                    "before": {
                        "type": "STRING",
                        "description": "The exact original bullet point or sentence from the candidate's resume that should be replaced. Must match the original text verbatim.",
                    },
                    "after": {
                        "type": "STRING",
                        "description": "The complete, optimized new bullet point or sentence to insert instead, incorporating missing keywords and action verbs. Must be a single bullet point/sentence, not a merged paragraph.",
                    },
                },
                "required": ["target", "reason", "before", "after"],
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
            "required": [
                "resumeToJob",
                "titleAlignment",
                "requiredSkillCoverage",
                "matchedConcepts",
            ],
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
                "required": [
                    "skill",
                    "severity",
                    "currentEvidence",
                    "recommendation",
                    "learningFocus",
                ],
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
                                    "enum": [
                                        "recruiter_guideline",
                                        "resume_pattern",
                                        "domain_knowledge",
                                    ],
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
        "overallScore",
        "verdict",
        "summary",
        "categoryScores",
        "jobProfile",
        "evidence",
        "matchedKeywords",
        "missingKeywords",
        "strengths",
        "risks",
        "suggestions",
        "rewriteSuggestions",
        "semanticMatch",
        "compatibilityPrediction",
        "skillGaps",
        "recruiterGuidance",
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
    structured_resume: StructuredResume | None = None,
) -> str:
    structured_text = ""
    if structured_resume:
        import json

        try:
            structured_text = f"\n## Structured Candidate Resume JSON:\n{json.dumps(structured_resume.model_dump(), indent=2)}\n"
        except Exception:
            pass

    return f"""## Candidate Resume Text:
{resume_text[:12000]}
{structured_text}
## Target Job Description:
{job_description[:12000]}

## Company Name:
{company_name or "Not specified"}

---
### Instructions:

Analyze how well this resume matches the job description.

1. **Extract Job Profile**: Title, seniority, years required, required keywords (must-haves), preferred keywords (nice-to-haves), responsibilities, certifications.

2. **Build Keyword Evidence** (up to 50 keywords): For each required/preferred keyword, check the resume and classify as "exact", "semantic", or "missing". Include brief context snippets. Never count the company name as a keyword match.

3. **Score Categories**: Assign 0-100 for each of the 6 categories above.

4. **Generate Intelligence**: Semantic match scores, compatibility prediction (probability + confidence + signals), skill gaps (up to 8), personalized recruiter guidance (2-4 items).

5. **Strengths & Risks**: 3-5 each.

6. **Suggestions**: 2-5 actionable items with priority levels.

7. **Rewrite Suggestions**: You MUST analyze the candidate's resume pointwise: check the professional summary, each individual bullet point under every work experience entry, and each individual bullet point under every project entry.
   - For each individual sentence or bullet point that needs improvement (e.g. lacks metrics, lacks action verbs, or misses relevant keywords), generate a separate pointwise rewrite suggestion in the `rewriteSuggestions` list.
   - If a bullet point or sentence is already strong and needs no improvement, do NOT suggest a rewrite for it (skip it).
   - Do NOT merge multiple bullet points or sentences together into a single rewrite suggestion. Each suggestion MUST correspond to exactly one original bullet point or sentence.
   - You should generate suggestions for all projects and all experience entries that contain weak bullet points.
   - CRITICAL: Do NOT restrict yourself to exactly 3 suggestions. You MUST review and generate suggestions for EVERY single bullet point or sentence in the resume that can be optimized. Strive to generate between 5 to 12 detailed, pointwise suggestions if the resume is not fully optimized.
   - For each suggestion, you MUST include:
     - `target`: The section/category, must be exactly 'Summary', 'Work Experience', or 'Projects'.
     - `reason`: A brief explanation of how this specific change boosts ATS compatibility (e.g. "Injects missing keyword 'Express' and quantifies impact").
     - `before`: The exact original bullet point or sentence from the candidate's resume, copied verbatim.
     - `after`: An optimized, impact-driven single bullet point or sentence that integrates missing keywords or action verbs.

8. **Summary**: A 2-3 sentence professional evaluation summarizing the overall fit of the candidate's profile for the target job description (e.g. highlighting key strengths and major gaps). Do NOT output raw contact details, emails, names, or phone headers here.

IMPORTANT: The company name "{company_name}" must NOT be treated as a keyword match.
IMPORTANT: If no specific resume section is identified, use "resume" as the sourceSection."""
