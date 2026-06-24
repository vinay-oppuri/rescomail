import json
import logging
import requests
from tenacity import (
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

logger = logging.getLogger("rescomail.ai-service.groq")

# Transient status codes that are retryable
_RETRYABLE_STATUSES = {429, 500, 502, 503, 504}

def _is_retryable(exc: BaseException) -> bool:
    if isinstance(exc, _GroqAPIError):
        return exc.status_code in _RETRYABLE_STATUSES
    return isinstance(exc, (requests.Timeout, requests.ConnectionError))

class _GroqAPIError(RuntimeError):
    def __init__(self, status_code: int, body: str):
        self.status_code = status_code
        super().__init__(f"Groq API error {status_code}: {body[:400]}")

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception(_is_retryable),
    reraise=True,
)
def _call_groq_api(api_key: str, model: str, payload: dict) -> dict:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    response = requests.post(url, json=payload, headers=headers, timeout=(5, 60))
    if response.status_code != 200:
        raise _GroqAPIError(response.status_code, response.text)
    return response.json()

def generate_groq_json(
    prompt: str,
    response_schema: dict | None = None,
    *,
    model: str = "llama-3.3-70b-versatile",
    temperature: float = 0.1,
    api_key: str,
) -> dict | None:
    """Generate structured JSON from Groq using llama-3.3-70b-versatile."""
    if not api_key:
        raise ValueError("Groq API key is not provided.")

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant designed to output JSON conforming strictly to the requested schema. Return ONLY valid JSON in your response.",
            },
            {
                "role": "user",
                "content": f"{prompt}\n\nPlease strictly output JSON conforming to this schema:\n{json.dumps(response_schema or {})}"
            }
        ],
        "temperature": temperature,
        "response_format": {"type": "json_object"}
    }

    try:
        data = _call_groq_api(api_key, model, payload)
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")
        return json.loads(content)
    except Exception as exc:
        logger.error("Groq API call failed: %s", exc)
        raise RuntimeError(f"Groq API call failed: {exc}") from exc
