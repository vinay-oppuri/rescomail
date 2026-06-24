"""
app/llm/gemini.py — Google Gemini API client with tenacity retry + token usage logging.
Uses exponential backoff on 429 / 503 / network errors before surfacing a failure.
"""

import json
import logging

import requests
from tenacity import (
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)

from app.core.config import settings

logger = logging.getLogger("rescomail.ai-service.gemini")

REQUEST_TIMEOUT = (5, 60)
_GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
_GEMINI_MODEL_ENV = "GEMINI_MODEL"
_DEFAULT_MODEL = "gemini-3.5-flash"

# HTTP status codes that warrant a retry (transient overload / rate-limit).
_RETRYABLE_STATUSES = {429, 500, 503}


def _is_retryable(exc: BaseException) -> bool:
    """Return True if the exception is worth retrying."""
    if isinstance(exc, _GeminiAPIError):
        return exc.status_code in _RETRYABLE_STATUSES
    # Retry on connection-level errors (timeout, reset, etc.)
    return isinstance(exc, (requests.Timeout, requests.ConnectionError))


class _GeminiAPIError(RuntimeError):
    """Internal error that carries the HTTP status code for retry decisions."""

    def __init__(self, status_code: int, body: str):
        self.status_code = status_code
        super().__init__(f"Gemini API error {status_code}: {body[:400]}")


def _get_api_key() -> str:
    """Return the Gemini API key, raising clearly if it is not set."""
    key = settings.gemini_api_key.strip()
    if not key:
        raise RuntimeError(
            "gemini_api_key is not set in settings. "
            "Rescomail uses Google Gemini as its only LLM provider. "
            "Set this variable in apps/ai-service/.env before starting the service."
        )
    return key


def _build_url(api_key: str, model: str) -> str:
    return (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception(_is_retryable),
    before_sleep=before_sleep_log(logger, logging.WARNING),
    reraise=True,
)
def _call_with_retry(api_key: str, model: str, payload: dict) -> dict:
    """Make a generateContent request, raising _GeminiAPIError on non-200."""
    url = _build_url(api_key, model)
    response = requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)

    if response.status_code != 200:
        raise _GeminiAPIError(response.status_code, response.text)

    data = response.json()

    # Log token usage when available
    usage = data.get("usageMetadata", {})
    if usage:
        logger.info(
            "Gemini token usage — prompt: %s, candidates: %s, total: %s",
            usage.get("promptTokenCount", "?"),
            usage.get("candidatesTokenCount", "?"),
            usage.get("totalTokenCount", "?"),
        )

    return data


def generate_gemini_json(
    prompt: str,
    response_schema: dict,
    *,
    model: str | None = None,
    temperature: float = 0.1,
    api_key: str | None = None,
) -> dict | None:
    """Generate a structured JSON response from Gemini.

    Retries up to 3 times with exponential backoff on transient errors (429, 503,
    connection resets). Surfaces a clear RuntimeError after exhausted retries.

    Args:
        prompt: Full prompt text.
        response_schema: JSON Schema the model must conform to.
        model: Gemini model to use (defaults to GEMINI_MODEL env or gemini-3.5-flash).
        temperature: Sampling temperature.
        api_key: Override the GEMINI_API_KEY env var (useful in tests).

    Returns:
        Parsed dict from the model response.

    Raises:
        RuntimeError: After all retries are exhausted or on a fatal error.
    """
    resolved_api_key = api_key or _get_api_key()
    resolved_model = model or settings.gemini_model

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": response_schema,
            "temperature": temperature,
        },
    }

    try:
        data = _call_with_retry(resolved_api_key, resolved_model, payload)
    except _GeminiAPIError as exc:
        logger.error(
            "Gemini API failed after retries — model: %s, status: %s",
            resolved_model,
            exc.status_code,
        )
        raise RuntimeError(str(exc)) from exc

    text = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "{}")
    )

    return json.loads(text)
