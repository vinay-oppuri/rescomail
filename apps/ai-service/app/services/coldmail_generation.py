import math
import re

from pydantic import ValidationError

from app.llm.gemini import generate_gemini_json
from app.models.coldmail import GEMINI_COLD_EMAIL_SCHEMA
from app.prompts.coldmail import build_cold_email_prompt
from app.schemas.coldmail import ColdEmailGenerateRequest, ColdEmailResponse
from app.schemas.resume import StructuredResume


def generate_cold_email_draft(
    request: ColdEmailGenerateRequest,
    resume_text: str,
    structured_resume: StructuredResume | None = None,
) -> ColdEmailResponse:
    generated = generate_gemini_json(
        build_cold_email_prompt(request, resume_text),
        GEMINI_COLD_EMAIL_SCHEMA,
        temperature=0.35,
    )

    if generated:
        try:
            return _validated_response(generated, request)
        except ValidationError:
            pass

    return _fallback_response(request, resume_text, structured_resume)


def _validated_response(
    generated: dict,
    request: ColdEmailGenerateRequest,
) -> ColdEmailResponse:
    response = ColdEmailResponse.model_validate(generated)
    return response.model_copy(update={"resumeId": request.resumeId})


def _fallback_response(
    request: ColdEmailGenerateRequest,
    resume_text: str,
    structured_resume: StructuredResume | None,
) -> ColdEmailResponse:
    candidate_name = _candidate_name(structured_resume, resume_text)
    greeting = _greeting(request)
    role = request.jobTitle or "the role"
    company = request.companyName or "your team"
    skills = _candidate_skills(structured_resume, resume_text, request.jobDescription)
    highlight = _experience_highlight(structured_resume, resume_text)
    context = _context_sentence(request)
    cta = _cta_sentence(request.callToAction)
    signoff_name = candidate_name or "Your Name"

    skill_phrase = _join_items(skills[:3]) or "relevant product and engineering work"
    role_phrase = f"{role} at {company}" if request.companyName else role

    body_parts = [
        greeting,
        "",
        (
            f"I'm reaching out about {role_phrase}. My background includes "
            f"{skill_phrase}, and {highlight}"
        ),
        "",
        context,
    ]

    if request.personalNote:
        body_parts.extend(["", request.personalNote])

    body_parts.extend(["", cta, "", f"Best,\n{signoff_name}"])
    body = "\n".join(part for part in body_parts if part is not None).strip()

    follow_up_body = "\n\n".join(
        [
            greeting,
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

    subject = _subject_line(request)
    quality_score = _quality_score(request, structured_resume, skills)

    return ColdEmailResponse(
        resumeId=request.resumeId,
        subject=subject,
        previewText=_preview_text(request, skills),
        body=body,
        followUpSubject=f"Following up: {subject}"[:160],
        followUpBody=follow_up_body,
        personalizationNotes=_personalization_notes(request, skills, highlight),
        qualityScore=quality_score,
        estimatedReadTimeSeconds=_read_time_seconds(body),
    )


def _candidate_name(
    structured_resume: StructuredResume | None,
    resume_text: str,
) -> str:
    if structured_resume and structured_resume.personalInfo.name.strip():
        return structured_resume.personalInfo.name.strip()

    first_line = next(
        (line.strip() for line in resume_text.splitlines() if line.strip()),
        "",
    )

    if 2 <= len(first_line.split()) <= 4 and not re.search(r"[@:/\\]", first_line):
        return first_line[:80]

    return ""


def _candidate_skills(
    structured_resume: StructuredResume | None,
    resume_text: str,
    job_description: str,
) -> list[str]:
    if structured_resume and structured_resume.skills:
        return [skill.strip() for skill in structured_resume.skills if skill.strip()][:8]

    skills_match = re.search(
        r"skills?\s*[:\-]\s*(.+)",
        resume_text,
        flags=re.IGNORECASE,
    )

    if skills_match:
        skills = re.split(r"[,|;/]", skills_match.group(1))
        cleaned = [skill.strip() for skill in skills if skill.strip()]
        if cleaned:
            return cleaned[:8]

    return _keywords_from_text(job_description)[:8]


def _experience_highlight(
    structured_resume: StructuredResume | None,
    resume_text: str,
) -> str:
    if structured_resume and structured_resume.experience:
        experience = structured_resume.experience[0]
        details = " ".join(
            item.strip()
            for item in [
                experience.role,
                f"at {experience.company}" if experience.company else "",
                experience.description,
            ]
            if item and item.strip()
        )
        return _sentence(details, "I have hands-on experience in similar work.")

    sentences = re.split(r"(?<=[.!?])\s+", resume_text.strip())
    meaningful = next((sentence for sentence in sentences if len(sentence) > 80), "")

    return _sentence(meaningful, "I have hands-on experience in similar work.")


def _context_sentence(request: ColdEmailGenerateRequest) -> str:
    if request.companyContext:
        context = re.sub(
            r"^Company website:.*?Extracted company context:\s*",
            "",
            request.companyContext,
            flags=re.IGNORECASE | re.DOTALL,
        ).strip()

        if len(context) > 220:
            context = context[:217].rstrip() + "..."

        if not context:
            context = "the team is doing relevant work in this area"

        return (
            "I noticed from your site that "
            f"{context.rstrip('.')}. I would be excited to bring that same "
            "focus to the team."
        )

    first_sentence = re.split(r"(?<=[.!?])\s+", request.jobDescription.strip())[0]

    if len(first_sentence) > 180:
        first_sentence = first_sentence[:177].rstrip() + "..."

    return (
        "The role stood out because it emphasizes "
        f"{first_sentence.rstrip('.')}. That maps closely to the work I want to do next."
    )


def _cta_sentence(call_to_action: str) -> str:
    ctas = {
        "conversation": "Would you be open to a 15-minute conversation this week?",
        "referral": (
            "If you are not the right person, would you be comfortable pointing "
            "me toward the best contact?"
        ),
        "interview": "Would you be open to considering me for an interview?",
        "feedback": (
            "Would you be willing to share quick feedback on whether my background "
            "fits what the team needs?"
        ),
    }

    return ctas.get(call_to_action, ctas["conversation"])


def _greeting(request: ColdEmailGenerateRequest) -> str:
    if request.recipientName:
        first_name = request.recipientName.split()[0]
        return f"Hi {first_name},"

    return "Hi,"


def _subject_line(request: ColdEmailGenerateRequest) -> str:
    if request.jobTitle and request.companyName:
        return f"{request.jobTitle} interest at {request.companyName}"[:160]

    if request.companyName:
        return f"Interest in {request.companyName}"[:160]

    if request.jobTitle:
        return f"Interest in {request.jobTitle}"[:160]

    return "Quick note about your team"


def _preview_text(request: ColdEmailGenerateRequest, skills: list[str]) -> str:
    skill_phrase = _join_items(skills[:2]) or "relevant experience"
    company = request.companyName or "your team"
    return (
        f"A concise, resume-backed note for {company} highlighting {skill_phrase} "
        "and a clear next step."
    )[:240]


def _personalization_notes(
    request: ColdEmailGenerateRequest,
    skills: list[str],
    highlight: str,
) -> list[str]:
    notes = []

    if request.companyName:
        notes.append(f"Anchored the note to {request.companyName}.")

    if request.jobTitle:
        notes.append(f"Positioned the candidate for {request.jobTitle}.")

    if skills:
        notes.append(f"Used resume evidence around {_join_items(skills[:3])}.")

    notes.append(_sentence(highlight, "Added a resume-backed experience proof point."))
    notes.append("Included a low-friction call to action.")

    if request.personalNote:
        notes.append("Included the candidate's custom note.")

    return notes[:6]


def _quality_score(
    request: ColdEmailGenerateRequest,
    structured_resume: StructuredResume | None,
    skills: list[str],
) -> int:
    score = 62
    score += 8 if request.jobTitle else 0
    score += 8 if request.companyName else 0
    score += 4 if request.recipientName or request.recipientRole else 0
    score += 6 if request.companyContext else 0
    score += 5 if request.personalNote else 0
    score += 4 if skills else 0
    score += 5 if structured_resume else 0

    return max(0, min(score, 98))


def _read_time_seconds(body: str) -> int:
    words = len(re.findall(r"\w+", body))
    return max(10, min(300, math.ceil((words / 200) * 60)))


def _join_items(items: list[str]) -> str:
    clean_items = [item for item in items if item]

    if not clean_items:
        return ""

    if len(clean_items) == 1:
        return clean_items[0]

    if len(clean_items) == 2:
        return f"{clean_items[0]} and {clean_items[1]}"

    return f"{', '.join(clean_items[:-1])}, and {clean_items[-1]}"


def _sentence(value: str, fallback: str) -> str:
    cleaned = " ".join(value.split()).strip()

    if not cleaned:
        return fallback

    if len(cleaned) > 220:
        cleaned = cleaned[:217].rstrip() + "..."

    if cleaned[-1] not in ".!?":
        cleaned += "."

    return cleaned


def _keywords_from_text(text: str) -> list[str]:
    words = re.findall(r"[A-Za-z][A-Za-z+#.-]{2,}", text.lower())
    stop_words = {
        "and",
        "are",
        "for",
        "the",
        "with",
        "you",
        "our",
        "your",
        "will",
        "this",
        "that",
        "from",
        "have",
        "role",
        "team",
        "work",
        "experience",
        "candidate",
    }
    seen = set()
    keywords = []

    for word in words:
        if word in stop_words or word in seen:
            continue

        seen.add(word)
        keywords.append(word)

    return keywords
