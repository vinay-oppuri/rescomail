"""
coldmail_helpers.py
-------------------
Deterministic helper functions for cold email generation.
Covers resume extraction, copy building, scoring, and text utilities.
None of these touch the LLM — they are all pure Python.
"""
import math
import re

from app.schemas.coldmail import ColdEmailGenerateRequest
from app.schemas.resume import StructuredResume


# ---------------------------------------------------------------------------
# Resume extraction helpers
# ---------------------------------------------------------------------------

def candidate_name(
    structured_resume: StructuredResume | None,
    resume_text: str,
) -> str:
    """Return the candidate's name from structured resume or first resume line."""
    if structured_resume and structured_resume.personalInfo.name.strip():
        return structured_resume.personalInfo.name.strip()

    first_line = next(
        (line.strip() for line in resume_text.splitlines() if line.strip()),
        "",
    )

    if 2 <= len(first_line.split()) <= 4 and not re.search(r"[@:/\\]", first_line):
        return first_line[:80]

    return ""


def candidate_skills(
    structured_resume: StructuredResume | None,
    resume_text: str,
    job_description: str,
) -> list[str]:
    """Return up to 8 skills from the resume, falling back to JD keywords."""
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

    return keywords_from_text(job_description)[:8]


def experience_highlight(
    structured_resume: StructuredResume | None,
    resume_text: str,
) -> str:
    """Return a one-sentence summary of the candidate's top experience."""
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
        return sentence(details, "I have hands-on experience in similar work.")

    sentences = re.split(r"(?<=[.!?])\s+", resume_text.strip())
    meaningful = next((s for s in sentences if len(s) > 80), "")

    return sentence(meaningful, "I have hands-on experience in similar work.")


# ---------------------------------------------------------------------------
# Copy / body-part builders
# ---------------------------------------------------------------------------

def greeting(request: ColdEmailGenerateRequest) -> str:
    if request.recipientName:
        first_name = request.recipientName.split()[0]
        return f"Hi {first_name},"
    return "Hi,"


def subject_line(request: ColdEmailGenerateRequest) -> str:
    if request.jobTitle and request.companyName:
        return f"{request.jobTitle} interest at {request.companyName}"[:160]
    if request.companyName:
        return f"Interest in {request.companyName}"[:160]
    if request.jobTitle:
        return f"Interest in {request.jobTitle}"[:160]
    return "Quick note about your team"


def preview_text(request: ColdEmailGenerateRequest, skills: list[str]) -> str:
    skill_phrase = join_items(skills[:2]) or "relevant experience"
    company = request.companyName or "your team"
    return (
        f"A concise, resume-backed note for {company} highlighting {skill_phrase} "
        "and a clear next step."
    )[:240]


def cta_sentence(call_to_action: str) -> str:
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


def context_sentence(request: ColdEmailGenerateRequest) -> str:
    """Build the 'why this company' paragraph from context or JD."""
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


def personalization_notes(
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
        notes.append(f"Used resume evidence around {join_items(skills[:3])}.")

    notes.append(sentence(highlight, "Added a resume-backed experience proof point."))
    notes.append("Included a low-friction call to action.")

    if request.personalNote:
        notes.append("Included the candidate's custom note.")

    return notes[:6]


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def quality_score(
    request: ColdEmailGenerateRequest,
    structured_resume: StructuredResume | None,
    skills: list[str],
) -> int:
    """
    Deterministic quality score (0–98) based on input richness.

    Base 62, with bonuses for:
      +8  job title provided
      +8  company name provided
      +4  recipient name or role
      +6  company context (scraped or manual)
      +5  personal note
      +4  skills found in resume
      +5  structured (parsed) resume
    """
    score = 62
    score += 8 if request.jobTitle else 0
    score += 8 if request.companyName else 0
    score += 4 if request.recipientName or request.recipientRole else 0
    score += 6 if request.companyContext else 0
    score += 5 if request.personalNote else 0
    score += 4 if skills else 0
    score += 5 if structured_resume else 0
    return max(0, min(score, 98))


def read_time_seconds(body: str) -> int:
    words = len(re.findall(r"\w+", body))
    return max(10, min(300, math.ceil((words / 200) * 60)))


# ---------------------------------------------------------------------------
# Generic text utilities
# ---------------------------------------------------------------------------

def join_items(items: list[str]) -> str:
    clean_items = [item for item in items if item]

    if not clean_items:
        return ""
    if len(clean_items) == 1:
        return clean_items[0]
    if len(clean_items) == 2:
        return f"{clean_items[0]} and {clean_items[1]}"

    return f"{', '.join(clean_items[:-1])}, and {clean_items[-1]}"


def sentence(value: str, fallback: str) -> str:
    """Ensure a string ends with punctuation and is within 220 chars."""
    cleaned = " ".join(value.split()).strip()

    if not cleaned:
        return fallback
    if len(cleaned) > 220:
        cleaned = cleaned[:217].rstrip() + "..."
    if cleaned[-1] not in ".!?":
        cleaned += "."

    return cleaned


def keywords_from_text(text: str) -> list[str]:
    """Extract unique non-stop-word keywords from raw text."""
    words = re.findall(r"[A-Za-z][A-Za-z+#.-]{2,}", text.lower())
    stop_words = {
        "and", "are", "for", "the", "with", "you", "our", "your",
        "will", "this", "that", "from", "have", "role", "team",
        "work", "experience", "candidate",
    }
    seen: set[str] = set()
    keywords: list[str] = []

    for word in words:
        if word in stop_words or word in seen:
            continue
        seen.add(word)
        keywords.append(word)

    return keywords
