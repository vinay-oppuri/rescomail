import os
import logging
import secrets

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header

from .parser import (
    ParseRequest,
    StructuredResume,
    clean_and_normalize_text,
    extract_text,
    preprocess_heuristics,
    structure_with_gemini,
)

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rescomail.ai-service")

app = FastAPI(title="Rescomail AI Service")

RESUME_PARSER_API_KEY = os.getenv("RESUME_PARSER_API_KEY")


@app.post("/parse", response_model=StructuredResume)
async def parse_resume(req: ParseRequest, authorization: str = Header(None)):
    if RESUME_PARSER_API_KEY:
        expected = f"Bearer {RESUME_PARSER_API_KEY}"

        if not authorization or not secrets.compare_digest(authorization, expected):
            raise HTTPException(status_code=401, detail="Unauthorized")

    logger.info("Parsing resume %s", req.resumeId)

    try:
        raw_text = extract_text(req.fileUrl)
        cleaned_text = clean_and_normalize_text(raw_text)
        preprocessed = preprocess_heuristics(cleaned_text, req.fileName)
        return structure_with_gemini(preprocessed)
    except Exception as e:
        logger.exception("Resume parsing failed for %s", req.resumeId)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}
