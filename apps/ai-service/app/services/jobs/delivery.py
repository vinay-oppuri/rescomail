"""
app/services/jobs/delivery.py — Email delivery via Resend.

Sends the job digest email to the candidate. Uses Resend's Python SDK if
RESEND_API_KEY is configured, otherwise logs the email body (dev/test mode).
"""

import logging

from app.core.config import settings

logger = logging.getLogger("rescomail.ai-service.jobs.delivery")


def send_digest_email(
    to_email: str,
    subject: str,
    body: str,
    from_email: str = "digest@rescomail.com",
) -> bool:
    """Send the job digest email to the candidate.

    Args:
        to_email: Recipient email address.
        subject: Email subject line.
        body: Plain-text or HTML email body.
        from_email: Sender address (must be verified in Resend).

    Returns:
        True if the email was sent successfully, False otherwise.
    """
    if not settings.resend_api_key:
        logger.warning(
            "RESEND_API_KEY is not set — digest email NOT sent. "
            "To: %s | Subject: %s\n%s",
            to_email,
            subject,
            body[:500],
        )
        return False

    try:
        import resend  # type: ignore

        resend.api_key = settings.resend_api_key

        params: resend.Emails.SendParams = {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "text": body,
        }

        response = resend.Emails.send(params)
        email_id = response.get("id", "unknown")
        logger.info("Digest email sent — id: %s, to: %s", email_id, to_email)
        return True

    except Exception as exc:
        logger.error("Failed to send digest email to %s: %s", to_email, exc)
        return False
