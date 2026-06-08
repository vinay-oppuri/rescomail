"""
app/services/jobs/digest.py — Gemini-powered job digest generation.

For each job, asks Gemini to explain in 2-3 sentences why the job fits
the candidate's profile. Then produces a complete digest email body.
"""

import logging

from app.llm.gemini import generate_gemini_json
from app.prompts.jobs import DIGEST_PROMPT, RELEVANCE_SUMMARY_PROMPT

logger = logging.getLogger("rescomail.ai-service.jobs.digest")

_SUMMARY_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
    },
    "required": ["summary"],
}

_DIGEST_SCHEMA = {
    "type": "object",
    "properties": {
        "email_subject": {"type": "string"},
        "email_body": {"type": "string"},
    },
    "required": ["email_subject", "email_body"],
}


def generate_job_summaries(
    jobs: list[dict],
    resume_summary: str,
) -> list[dict]:
    """Generate a match explanation for each job using Gemini.

    Args:
        jobs: List of relevance-scored job dicts.
        resume_summary: A short (300–500 word) summary of the candidate's resume.

    Returns:
        Jobs list with an added ``match_summary`` field on each item.
    """
    annotated = []
    for job in jobs:
        prompt = RELEVANCE_SUMMARY_PROMPT.format(
            resume_summary=resume_summary,
            job_title=job.get("title", ""),
            company=job.get("company", ""),
            location=job.get("location", ""),
            job_description=job.get("description", "")[:2000],
        )
        try:
            result = generate_gemini_json(prompt, _SUMMARY_SCHEMA, temperature=0.3)
            match_summary = (result or {}).get("summary", "")
        except Exception as exc:
            logger.warning("Failed to generate summary for job %s: %s", job.get("id"), exc)
            match_summary = ""

        annotated.append({**job, "match_summary": match_summary})

    return annotated


def generate_digest_email(
    jobs: list[dict],
    target_role: str,
    location: str,
    experience_level: str,
) -> dict:
    """Generate a complete digest email for the candidate.

    Args:
        jobs: Jobs with match_summary fields (output of generate_job_summaries).
        target_role: e.g. "Senior Software Engineer"
        location: e.g. "San Francisco, CA"
        experience_level: e.g. "senior"

    Returns:
        dict with ``email_subject`` and ``email_body`` keys.
    """
    jobs_block = "\n\n".join(
        f"**{i + 1}. {j.get('title')} at {j.get('company')}**\n"
        f"Location: {j.get('location')}\n"
        f"Match: {j.get('match_summary', 'N/A')}\n"
        f"Apply: {j.get('apply_link', 'N/A')}"
        for i, j in enumerate(jobs)
    )

    prompt = DIGEST_PROMPT.format(
        target_role=target_role,
        location=location,
        experience_level=experience_level,
        jobs_block=jobs_block,
    )

    try:
        result = generate_gemini_json(prompt, _DIGEST_SCHEMA, temperature=0.4)
        return result or {"email_subject": "Your Job Digest", "email_body": jobs_block}
    except Exception as exc:
        logger.error("Failed to generate digest email: %s", exc)
        return {"email_subject": "Your Job Digest", "email_body": jobs_block}
