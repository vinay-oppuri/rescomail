"""Prompt used to turn extracted resume text into structured data."""


def build_resume_parser_prompt(preprocessed: dict) -> str:
    return f"""You are an ATS parser. Extract and strictly format into JSON matching the schema.

Guidelines:
- Extract the candidate's real name from the resume text below. Do NOT use generic names like "Resume", "CV", "Updated", or placeholder terms.
- Use the filename hint "{preprocessed["name"]}" only as a backup reference if no name is found in the text.
- Extract any email address, phone number, portfolio/GitHub/LinkedIn URLs, skills, experiences, projects, and education.
- **Professional Summary**: Extract the candidate's professional summary, profile, or about section into the root-level `summary` field. Do NOT mix contact details, names, job titles, or links into the `summary` field. Do NOT mix the summary text into experience or project sections.
- **Projects**: For each project, extract the title, description, and list of technologies. If there is a GitHub link or Live/Demo URL associated with the project (either written explicitly or embedded as a markdown hyperlink in the text, e.g., `[GitHub](url)` or `[Project Title](url)`), extract and populate `githubUrl` and `liveUrl` respectively.
- **No Truncation & Description Format**: Do NOT summarize, truncate, or omit details from work experience descriptions or project descriptions. You MUST parse each description as an array of strings (JSON array), where each element in the array represents a single bullet point, line, or detail from the resume. Do NOT merge them into a single string. Retain all bullet points, accomplishments, technical details, and metrics verbatim or close to verbatim.

Extracted Email Hint: {preprocessed["email"]}
Extracted Phone Hint: {preprocessed["phone"]}

Text:
{preprocessed["raw"][:12000]}
"""

