from fastapi import FastAPI, HTTPException, Header
import os
from dotenv import load_dotenv

from .parser import ParseRequest, extract_text, clean_and_normalize_text, preprocess_heuristics, structure_with_gemini

load_dotenv()

app = FastAPI(title="Rescomail AI Service")

RESUME_PARSER_API_KEY = os.getenv("RESUME_PARSER_API_KEY")

@app.post("/parse")
async def parse_resume(req: ParseRequest, authorization: str = Header(None)):
    if RESUME_PARSER_API_KEY:
        if not authorization or authorization != f"Bearer {RESUME_PARSER_API_KEY}":
            raise HTTPException(status_code=401, detail="Unauthorized")

    print(f"=== [PIPELINE START] Parsing Resume ID: {req.resumeId} ===")
    try:
        raw_text = extract_text(req.fileUrl)
        print(f"[Pipeline] Text extraction completed, length: {len(raw_text)}")
        
        cleaned_text = clean_and_normalize_text(raw_text)
        print(f"[Pipeline] Cleaning completed, length: {len(cleaned_text)}")
        
        preprocessed = preprocess_heuristics(cleaned_text, req.fileName)
        print(f"[Pipeline] Preprocessing completed. Extracted Name: {preprocessed['name']}")
        
        structured = structure_with_gemini(preprocessed)
        print("[Pipeline] Structuring completed.")
        
        return structured
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}
