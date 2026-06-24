def build_resume_parser_prompt(preprocessed: dict) -> str:
    return f"""You are an ATS parser. Extract and strictly format into JSON matching the schema.

Guidelines:
- Extract the candidate's real name from the resume text below. Do NOT use generic names like "Resume", "CV", "Updated", or placeholder terms.
- Use the filename hint "{preprocessed["name"]}" only as a backup reference if no name is found in the text.
- Extract any email address, phone number, portfolio/GitHub/LinkedIn URLs, skills, experiences, projects, and education.

Extracted Email Hint: {preprocessed["email"]}
Extracted Phone Hint: {preprocessed["phone"]}

Text:
{preprocessed["raw"][:12000]}
"""

