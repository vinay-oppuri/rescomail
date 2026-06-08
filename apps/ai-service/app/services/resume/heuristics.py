import re


def preprocess_resume_text(text: str, filename: str | None = None) -> dict:
    email_match = re.search(
        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
        text,
    )
    phone_match = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    source_name = (filename or "resume").replace(".pdf", "").replace("-", " ")

    return {
        "name": source_name.title(),
        "email": email_match.group(0) if email_match else "",
        "phone": phone_match.group(0) if phone_match else "",
        "raw": text,
    }
