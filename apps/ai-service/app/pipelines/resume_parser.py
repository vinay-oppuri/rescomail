from app.schemas.resume import ParseRequest, StructuredResume
from app.services.document_extraction import extract_text_from_url
from app.services.resume_heuristics import preprocess_resume_text
from app.services.resume_structuring import structure_resume
from app.services.text_cleaning import clean_resume_text


def parse_resume(request: ParseRequest) -> StructuredResume:
    raw_text = extract_text_from_url(request.fileUrl)
    cleaned_text = clean_resume_text(raw_text)
    preprocessed = preprocess_resume_text(cleaned_text, request.fileName)
    return structure_resume(preprocessed)
