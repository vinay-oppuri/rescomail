import json
import logging
import os

import requests

logger = logging.getLogger("rescomail.ai-service.gemini")

REQUEST_TIMEOUT = (5, 60)
_GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
_GEMINI_MODEL_ENV = "GEMINI_MODEL"
_DEFAULT_MODEL = "gemini-2.5-flash"
_FALLBACK_MODEL = "gemini-1.5-flash"

# HTTP status codes that indicate the model is temporarily overloaded / rate-limited.
_OVERLOAD_STATUSES = {429, 503}


def _get_api_key() -> str:
    """Return the Gemini API key, raising clearly if it is not set."""
    key = os.getenv(_GEMINI_API_KEY_ENV, "").strip()
    if not key:
        raise RuntimeError(
            f"{_GEMINI_API_KEY_ENV} is not set. "
            "Rescomail uses Google Gemini as its only LLM provider. "
            "Set this variable in apps/ai-service/.env before starting the service."
        )
    return key


def _call_gemini(api_key: str, model: str, payload: dict) -> requests.Response:
    """Make a single generateContent request and return the raw Response."""
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )
    return requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)


def generate_gemini_json(
    prompt: str,
    response_schema: dict,
    *,
    model: str | None = None,
    temperature: float = 0.1,
    api_key: str | None = None,
) -> dict | None:
    resolved_api_key = api_key or _get_api_key()
    primary_model = model or os.getenv(_GEMINI_MODEL_ENV, _DEFAULT_MODEL)
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": response_schema,
            "temperature": temperature,
        },
    }

    response = _call_gemini(resolved_api_key, primary_model, payload)

    # If the primary model is overloaded / rate-limited, fall back to gemini-1.5-flash
    # so the request can still be served rather than failing outright.
    if response.status_code in _OVERLOAD_STATUSES and primary_model != _FALLBACK_MODEL:
        logger.warning(
            "Gemini model '%s' returned %s (high demand). "
            "Retrying with fallback model '%s'.",
            primary_model,
            response.status_code,
            _FALLBACK_MODEL,
        )
        response = _call_gemini(resolved_api_key, _FALLBACK_MODEL, payload)

    if response.status_code != 200:
        logger.error(
            "Gemini API error %s from model '%s': %s",
            response.status_code,
            primary_model,
            response.text[:400],
        )
        raise RuntimeError(f"Gemini API error {response.status_code}: {response.text[:400]}")

    data = response.json()
    text = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "{}")
    )

    return json.loads(text)
