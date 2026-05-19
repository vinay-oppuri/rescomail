import json
import os

import requests

REQUEST_TIMEOUT = (5, 60)


def generate_gemini_json(
    prompt: str,
    response_schema: dict,
    *,
    model: str | None = None,
    temperature: float = 0.1,
) -> dict | None:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return None

    target_model = model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
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
        raise RuntimeError(f"Gemini API Error: {response.status_code}")

    data = response.json()
    text = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "{}")
    )

    return json.loads(text)
