"""
coldmail_generation.py
----------------------
Orchestrates the cold email generation pipeline.

Flow:
  1. Call Gemini with the prompt and JSON schema.
  2. Normalise the returned body to proper email structure (coldmail_body).
  3. Overwrite Gemini's quality score and read-time with server-computed values.
  4. Validate against ColdEmailResponse schema.
  5. On Gemini failure or schema error, return a deterministic fallback email.

All deterministic helpers (copy building, scoring, text utilities) live in
coldmail_helpers.py.  Body post-processing lives in coldmail_body.py.
"""
import logging

from pydantic import ValidationError

from app.llm.gemini import generate_gemini_json
from app.models.coldmail import GEMINI_COLD_EMAIL_SCHEMA
from app.prompts.coldmail import build_cold_email_prompt
from app.schemas.coldmail import ColdEmailGenerateRequest, ColdEmailResponse
from app.schemas.resume import StructuredResume
from app.services.coldmail_body import normalize_body
from app.services.coldmail_helpers import (
    candidate_name,
    candidate_skills,
    context_sentence,
    cta_sentence,
    experience_highlight,
    greeting,
    join_items,
    keywords_from_text,
    personalization_notes,
    preview_text,
    quality_score,
    read_time_seconds,
    subject_line,
)

logger = logging.getLogger("rescomail.ai-service.coldmail")


def generate_cold_email_draft(
    request: ColdEmailGenerateRequest,
    resume_text: str,
    company_context: str = "",
    structured_resume: StructuredResume | None = None,
) -> ColdEmailResponse:
    generated = generate_gemini_json(
        build_cold_email_prompt(request, resume_text),
        GEMINI_COLD_EMAIL_SCHEMA,
        temperature=0.35,
        api_key=request.geminiApiKey,
    )

    if generated:
        # Normalise body fields: ensure greeting → paragraphs → sign-off structure.
        for field in ("body", "followUpBody"):
            if isinstance(generated.get(field), str):
                generated[field] = normalize_body(generated[field])

        # Always overwrite Gemini's quality score and read-time with server-computed
        # values. Gemini has no basis for scoring quality and invented arbitrary numbers.
        skills = candidate_skills(structured_resume, resume_text, request.jobDescription)
        generated["qualityScore"] = quality_score(request, structured_resume, skills)
        generated["estimatedReadTimeSeconds"] = read_time_seconds(generated.get("body", ""))
        logger.info(
            "Cold email quality score: %s (jobTitle=%s, company=%s, hasContext=%s, hasRecipient=%s)",
            generated["qualityScore"],
            bool(request.jobTitle),
            bool(request.companyName),
            bool(company_context),
            bool(request.recipientName or request.recipientRole),
        )

        try:
            return _validated_response(generated, request, company_context)
        except ValidationError:
            logger.warning("Gemini response failed schema validation — using fallback.")

    return _fallback_response(request, resume_text, structured_resume, company_context)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _validated_response(
    generated: dict,
    request: ColdEmailGenerateRequest,
    company_context: str = "",
) -> ColdEmailResponse:
    response = ColdEmailResponse.model_validate(generated)
    return response.model_copy(update={"resumeId": request.resumeId, "companyContext": company_context})


def _fallback_response(
    request: ColdEmailGenerateRequest,
    resume_text: str,
    structured_resume: StructuredResume | None,
    company_context: str = "",
) -> ColdEmailResponse:
    """Deterministic fallback email when Gemini is unavailable or returns bad output."""
    name = candidate_name(structured_resume, resume_text)
    hello = greeting(request)
    role = request.jobTitle or "the role"
    company = request.companyName or "your team"
    skills = candidate_skills(structured_resume, resume_text, request.jobDescription)
    highlight = experience_highlight(structured_resume, resume_text)
    ctx = context_sentence(request)
    cta = cta_sentence(request.callToAction)
    signoff_name = name or "Your Name"
    skill_phrase = join_items(skills[:3]) or "relevant product and engineering work"
    role_phrase = f"{role} at {company}" if request.companyName else role

    body_parts = [
        hello,
        "",
        (
            f"I'm reaching out about {role_phrase}. My background includes "
            f"{skill_phrase}, and {highlight}"
        ),
        "",
        ctx,
    ]

    if request.personalNote:
        body_parts.extend(["", request.personalNote])

    body_parts.extend(["", cta, "", f"Best,\n{signoff_name}"])
    body = "\n".join(part for part in body_parts if part is not None).strip()

    follow_up_body = "\n\n".join(
        [
            hello,
            (
                f"I wanted to follow up on my note about {role_phrase}. "
                f"I think my experience with {skill_phrase} could be useful "
                "for the problems described in the role."
            ),
            (
                "If there is a better person to contact, I would appreciate "
                "being pointed in the right direction."
            ),
            f"Best,\n{signoff_name}",
        ]
    )

    subject = subject_line(request)
    score = quality_score(request, structured_resume, skills)

    return ColdEmailResponse(
        resumeId=request.resumeId,
        subject=subject,
        previewText=preview_text(request, skills),
        body=body,
        followUpSubject=f"Following up: {subject}"[:160],
        followUpBody=follow_up_body,
        personalizationNotes=personalization_notes(request, skills, highlight),
        qualityScore=score,
        estimatedReadTimeSeconds=read_time_seconds(body),
        companyContext=company_context,
    )
