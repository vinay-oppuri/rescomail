def build_resume_parser_prompt(preprocessed: dict) -> str:
    return f"""You are an ATS parser. Extract and strictly format into JSON matching the schema.
Text: {preprocessed["raw"][:4000]}

Extracted Name: {preprocessed["name"]}
Extracted Email: {preprocessed["email"]}
Extracted Phone: {preprocessed["phone"]}
"""
