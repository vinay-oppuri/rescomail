"""Gemini response schema for generated cold emails."""


GEMINI_COLD_EMAIL_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "resumeId": {"type": "STRING"},
        "subject": {"type": "STRING"},
        "previewText": {"type": "STRING"},
        "body": {"type": "STRING"},
        "followUpSubject": {"type": "STRING"},
        "followUpBody": {"type": "STRING"},
        "personalizationNotes": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
        },
        "qualityScore": {"type": "INTEGER"},
        "estimatedReadTimeSeconds": {"type": "INTEGER"},
    },
    "required": [
        "resumeId",
        "subject",
        "previewText",
        "body",
        "followUpSubject",
        "followUpBody",
        "personalizationNotes",
        "qualityScore",
        "estimatedReadTimeSeconds",
    ],
}
