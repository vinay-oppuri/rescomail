"""
coldmail_body.py
----------------
Post-processing for Gemini-generated cold email bodies.

Gemini occasionally returns the body as a single prose paragraph even when
the prompt instructs it otherwise. This module detects that case and
re-formats the text into the expected structure:

    Hi [Name],

    Paragraph one.

    Paragraph two.

    Best,
    [Name]
"""
import logging
import re

logger = logging.getLogger("rescomail.ai-service.coldmail.body")

# Matches common email sign-off openings (case-insensitive).
_SIGN_OFF_RE = re.compile(
    r"^(best(?:\s+regards)?|regards|sincerely|cheers|thanks?(?:\s+you)?|warm\s+regards)[,.]?",
    re.IGNORECASE,
)


def normalize_body(body: str) -> str:
    """Ensure the email body always has proper greeting → paragraphs → sign-off structure.

    - If the body already contains blank-line-separated paragraphs (``\\n\\n``),
      only whitespace cleanup is applied.
    - If the body is a single prose blob, it is split into logical sections:
      greeting, content paragraphs (≤ 3 sentences each), and sign-off.
    """
    if not body:
        return body

    # Normalise line endings and collapse runs of 3+ blank lines to 2.
    body = body.replace("\r\n", "\n").replace("\r", "\n")
    body = re.sub(r"\n{3,}", "\n\n", body).strip()

    # Already structured — leave it alone.
    if "\n\n" in body:
        return body

    # --- Single-block prose detected: reformat into email structure ---
    logger.debug("Cold email body arrived as a prose block — reformatting into email structure.")

    lines = [line.strip() for line in body.splitlines() if line.strip()]
    if not lines:
        return body

    parts: list[str] = []

    # Identify greeting: first line that starts with Hi/Hello/Dear/Hey or ends with comma.
    greeting_idx = 0
    if re.match(r"^(hi|hello|dear|hey)\b", lines[0], re.IGNORECASE) or lines[0].endswith(","):
        parts.append(lines[0])
        greeting_idx = 1
    else:
        parts.append("Hi,")

    remaining = lines[greeting_idx:]

    # Identify sign-off: trailing lines that look like a closing.
    signoff_lines: list[str] = []
    while remaining and _SIGN_OFF_RE.match(remaining[-1]):
        signoff_lines.insert(0, remaining.pop())
    # Also pull the name line that sits directly above the sign-off keyword.
    if signoff_lines and remaining and len(remaining[-1].split()) <= 4:
        signoff_lines.insert(0, remaining.pop())

    # Group remaining sentences into paragraphs of at most 3 sentences.
    middle_text = " ".join(remaining)
    sentences = re.split(r"(?<=[.!?])\s+", middle_text)
    chunk_size = 3
    paragraphs = [
        " ".join(sentences[i : i + chunk_size])
        for i in range(0, len(sentences), chunk_size)
    ]
    parts.extend(paragraphs)

    if signoff_lines:
        parts.extend(signoff_lines)

    return "\n\n".join(p for p in parts if p)
