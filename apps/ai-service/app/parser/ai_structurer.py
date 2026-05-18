import os
import requests
import json
from .schemas import StructuredResume

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

def structure_with_gemini(preprocessed: dict) -> dict:
    if not GEMINI_API_KEY:
        print("[AI Structurer] No Gemini API Key. Returning fallback.")
        return {
            "personalInfo": {
                "name": preprocessed["name"],
                "email": preprocessed["email"],
                "phone": preprocessed["phone"]
            },
            "skills": ["Communication", "FastAPI"],
            "experience": [{"role": "Applicant", "company": "Unknown", "duration": "Present", "description": "Needs API key."}],
            "education": [{"degree": "Unknown", "school": "Unknown", "year": "Unknown"}]
        }
    
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
            "responseSchema": gemini_schema
        }
    }

    resp = requests.post(url, json=payload)
    if resp.status_code != 200:
        print("Gemini error:", resp.text)
        raise Exception(f"Gemini API Error: {resp.status_code}")
    
    data = resp.json()
    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
    return json.loads(text)
