from app.schemas.coldmail import ColdEmailGenerateRequest


LENGTH_GUIDANCE = {
    "concise": "80-120 words",
    "standard": "120-170 words",
    "detailed": "170-230 words",
}

CTA_GUIDANCE = {
    "conversation": "Ask for a short conversation or intro call.",
    "referral": "Ask for a referral or pointer to the right hiring contact.",
    "interview": "Ask to be considered for an interview.",
    "feedback": "Ask for quick feedback on fit.",
}


def build_cold_email_prompt(
    request: ColdEmailGenerateRequest,
    resume_text: str,
) -> str:
    role = request.jobTitle or "the target role"
    company = request.companyName or "the company"
    length_guidance = LENGTH_GUIDANCE[request.length]
    cta_guidance = CTA_GUIDANCE[request.callToAction]

    return f"""
You are Rescomail's outbound job-search writing engine. Generate a polished cold
email from a candidate to a recruiter, hiring manager, founder, or team lead.

Product rules:
- Write in first person as the candidate.
- Use only evidence from the resume, job description, and provided context.
- Do not invent employers, metrics, achievements, referrals, or personal ties.
- Avoid generic openers like "I hope this email finds you well".
- Keep the email specific, respectful, and easy to skim.
- Make the subject short and useful.
- The body should be {length_guidance}.
- Tone: {request.tone}.
- CTA: {cta_guidance}
- End with a natural sign-off using the candidate name when it is available.
- Return only JSON that matches the provided schema.

Target:
Role: {role}
Company: {company}
Company website: {request.companyWebsiteUrl or "Unknown"}
Recipient name: {request.recipientName or "Unknown"}
Recipient role: {request.recipientRole or "Unknown"}
Company context from website: {request.companyContext or "None provided"}
Candidate note: {request.personalNote or "None provided"}

Job description:
{request.jobDescription[:12000]}

Candidate resume:
{resume_text[:12000]}
""".strip()
