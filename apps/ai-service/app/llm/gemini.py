import json
import os

import requests

REQUEST_TIMEOUT = (5, 60)
_GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
_GEMINI_MODEL_ENV = "GEMINI_MODEL"
_DEFAULT_MODEL = "gemini-2.5-flash"


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


def generate_gemini_json(
    prompt: str,
    response_schema: dict,
    *,
    model: str | None = None,
    temperature: float = 0.1,
) -> dict | None:
    api_key = _get_api_key()
    target_model = model or os.getenv(_GEMINI_MODEL_ENV, _DEFAULT_MODEL)
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{target_model}:generateContent?key={api_key}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": response_schema,
            "temperature": temperature,
        },
    }

    response = requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)

    if response.status_code != 200:
        raise RuntimeError(f"Gemini API error {response.status_code}: {response.text[:400]}")

    data = response.json()
    text = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "{}")
    )

    return json.loads(text)
