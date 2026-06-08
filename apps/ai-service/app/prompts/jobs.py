"""
app/prompts/jobs.py — Prompts for the Jobs feature.

Contains:
  - RELEVANCE_SUMMARY_PROMPT: Ask Gemini to explain why a job fits a candidate.
  - DIGEST_PROMPT: Ask Gemini to produce a formatted digest of multiple jobs.
"""

RELEVANCE_SUMMARY_PROMPT = """
You are a career advisor reviewing a job listing for a specific candidate.

## Candidate Resume Summary
{resume_summary}

## Job Listing
Title: {job_title}
Company: {company}
Location: {location}
Description:
{job_description}

## Task
Write 2-3 concise sentences explaining why this job is a strong match for the candidate.
Focus on specific skills, experience, or background that align with the role.
Be honest — if there are notable gaps, mention them briefly.
""".strip()


DIGEST_PROMPT = """
You are a career assistant preparing a personalised job digest email for a candidate.

## Candidate Profile
Role they are targeting: {target_role}
Location preference: {location}
Experience level: {experience_level}

## Matched Job Listings
{jobs_block}

## Task
Write a friendly, professional email digest that:
1. Opens with a brief greeting.
2. Lists each job with: company, title, location, a 2-sentence match explanation, and an apply link.
3. Closes with an encouraging note.

Keep the total email under 500 words. Do not use excessive marketing language.
""".strip()
