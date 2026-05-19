GEMINI_STRUCTURED_RESUME_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "personalInfo": {
            "type": "OBJECT",
            "properties": {
                "name": {"type": "STRING"},
                "email": {"type": "STRING"},
                "phone": {"type": "STRING"},
            },
            "required": ["name", "email", "phone"],
        },
        "skills": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
        },
        "experience": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "role": {"type": "STRING"},
                    "company": {"type": "STRING"},
                    "duration": {"type": "STRING"},
                    "description": {"type": "STRING"},
                },
                "required": ["role", "company", "duration", "description"],
            },
        },
        "education": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "degree": {"type": "STRING"},
                    "school": {"type": "STRING"},
                    "year": {"type": "STRING"},
                },
                "required": ["degree", "school", "year"],
            },
        },
    },
    "required": ["personalInfo", "skills", "experience", "education"],
}
