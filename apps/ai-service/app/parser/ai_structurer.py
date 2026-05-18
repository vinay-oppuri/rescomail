import os
import requests
import json
from .schemas import StructuredResume

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
REQUEST_TIMEOUT = (5, 60)


def structure_with_gemini(preprocessed: dict) -> dict:
    if not GEMINI_API_KEY:
        fallback = {
            "personalInfo": {
                "name": preprocessed["name"],
                "email": preprocessed["email"],
                "phone": preprocessed["phone"]
            },
            "skills": [],
            "experience": [],
            "education": []
        }

        return StructuredResume.model_validate(fallback).model_dump()

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

    prompt = f"""You are an ATS parser. Extract and strictly format into JSON matching the schema.
Text: {preprocessed["raw"][:4000]} # Limit to 4k chars to avoid token issues for now

Extracted Name: {preprocessed['name']}
Extracted Email: {preprocessed['email']}
Extracted Phone: {preprocessed['phone']}
"""
    gemini_schema = {
        "type": "OBJECT",
        "properties": {
            "personalInfo": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING"},
                    "email": {"type": "STRING"},
                    "phone": {"type": "STRING"}
                },
                "required": ["name", "email", "phone"]
            },
            "skills": {
                "type": "ARRAY",
                "items": {"type": "STRING"}
            },
            "experience": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "role": {"type": "STRING"},
                        "company": {"type": "STRING"},
                        "duration": {"type": "STRING"},
                        "description": {"type": "STRING"}
                    },
                    "required": ["role", "company", "duration", "description"]
                }
            },
            "education": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "degree": {"type": "STRING"},
                        "school": {"type": "STRING"},
                        "year": {"type": "STRING"}
                    },
                    "required": ["degree", "school", "year"]
                }
            }
        },
        "required": ["personalInfo", "skills", "experience", "education"]
    }

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": gemini_schema,
            "temperature": 0.1
        }
    }

    resp = requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)
    if resp.status_code != 200:
        raise RuntimeError(f"Gemini API Error: {resp.status_code}")

    data = resp.json()
    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
    parsed = json.loads(text)

    return StructuredResume.model_validate(parsed).model_dump()
