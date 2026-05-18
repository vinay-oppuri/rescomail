import os
import requests
import fitz  # PyMuPDF

def extract_text(file_url: str) -> str:
    print(f"[Text Extractor] Fetching PDF from {file_url}")
    response = requests.get(file_url)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch PDF: {response.status_code}")
    
    # Save temp file
    temp_path = f"/tmp/resume_{os.getpid()}.pdf"
    # Fallback to local dir if /tmp doesn't exist (like on Windows)
    if not os.path.exists("/tmp"):
        temp_path = f"resume_{os.getpid()}.pdf"

    with open(temp_path, "wb") as f:
        f.write(response.content)
    
    print("[Text Extractor] Downloaded, parsing...")
    text = ""
    with fitz.open(temp_path) as doc:
        for page in doc:
            text += page.get_text() + "\n"
    
    os.remove(temp_path)
    return text.strip()
