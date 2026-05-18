import re

def clean_and_normalize_text(text: str) -> str:
    if not text:
        return ""
    
    # Remove null bytes and non-printable characters
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    
    # Replace multiple spaces with a single space (while preserving newlines)
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)
    
    # Replace multiple consecutive newlines with a double newline
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    
    # Strip leading/trailing whitespace
    return cleaned.strip()
