import re

def preprocess_heuristics(text: str, filename: str) -> dict:
    # A very basic heuristic for email and name
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    email = email_match.group(0) if email_match else ""
    
    phone_match = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    phone = phone_match.group(0) if phone_match else ""

    return {
        "name": filename.replace(".pdf", "").replace("-", " ").title(),
        "email": email,
        "phone": phone,
        "raw": text
    }
