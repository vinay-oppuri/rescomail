import re
import logging
import ipaddress
import requests
from urllib.parse import urlparse

from app.core.config import settings
from app.embeddings.semantic import semantic_search_scores

logger = logging.getLogger("rescomail.ai-service.company_context")

TAVILY_SEARCH_ENDPOINT = "https://api.tavily.com/search"
TAVILY_TIMEOUT_MS = 20_000
MAX_COMPANY_CONTEXT_LENGTH = 2000


def _is_public_website_url(value: str) -> bool:
    try:
        parsed = urlparse(value)
        hostname = (parsed.hostname or "").lower().rstrip(".")

        if parsed.scheme not in {"http", "https"} or not hostname:
            return False

        if hostname == "localhost" or hostname.endswith(".local"):
            return False

        try:
            return ipaddress.ip_address(hostname).is_global
        except ValueError:
            return True
    except ValueError:
        return False


def get_rag_company_context(
    company_name: str,
    job_title: str,
    job_description: str = "",
    company_website_url: str = "",
) -> str:
    api_key = settings.tavily_api_key
    if not api_key:
        logger.warning(
            "Company context RAG SKIPPED — tavily_api_key is not configured. "
            "Set it in your env to enable website-based context enrichment."
        )
        return ""

    if not company_name and not company_website_url:
        return ""

    if company_website_url and not _is_public_website_url(company_website_url):
        logger.warning("Rejected non-public company website URL.")
        company_website_url = ""

    if not company_name and not company_website_url:
        return ""

    target_name = company_name or company_website_url
    logger.info(
        "RAG scraping company context for '%s' (Role: %s) …",
        target_name,
        job_title or "unknown role",
    )

    query = f"{target_name} recent news blog products mission {job_title}".strip()
    
    payload = {
        "query": query,
        "search_depth": "advanced",
        "include_answer": False,
        "include_images": False,
        "include_raw_content": True,
        "max_results": 5,
    }
    if company_website_url:
        parsed = urlparse(company_website_url)
        domain = parsed.hostname or company_website_url
        if domain.startswith("www."):
            domain = domain[4:]
        payload["include_domains"] = [domain]

    data = {}
    try:
        response = requests.post(
            TAVILY_SEARCH_ENDPOINT,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=TAVILY_TIMEOUT_MS / 1000.0,
        )
        response.raise_for_status()
        data = response.json()
    except Exception as exc:
        logger.error("Company context search FAILED for '%s': %s", target_name, exc)

    # Aggregate text
    raw_text_blocks = []
    for result in data.get("results", []):
        content = result.get("raw_content") or result.get("content")
        if isinstance(content, str) and content.strip():
            raw_text_blocks.append(content.strip())
            
    # Fallback to Extract API if search returned nothing but we have a URL
    if not raw_text_blocks and company_website_url:
        logger.info("Search returned nothing. Falling back to extract for %s", company_website_url)
        try:
            extract_response = requests.post(
                "https://api.tavily.com/extract",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={"urls": company_website_url},
                timeout=TAVILY_TIMEOUT_MS / 1000.0,
            )
            extract_response.raise_for_status()
            extract_data = extract_response.json()
            for res in extract_data.get("results", []):
                content = res.get("raw_content")
                if isinstance(content, str) and content.strip():
                    raw_text_blocks.append(content.strip())
        except Exception as exc:
            logger.error("Fallback extract FAILED for '%s': %s", company_website_url, exc)

    if not raw_text_blocks:
        logger.warning("No usable text returned from Tavily Search for '%s'.", target_name)
        return ""
    
    full_text = "\n\n".join(raw_text_blocks)
    normalized_text = _normalize_extracted_text(full_text)
    
    chunks = _chunk_text(normalized_text, chunk_size=500)
    
    if not chunks:
        return ""

    # Perform RAG retrieval
    rag_query = f"{job_title} {job_description}".strip()
    if not rag_query:
        rag_query = f"{company_name} news and context"
        
    scores = semantic_search_scores(rag_query, chunks)
    
    ranked = list(zip(chunks, scores))
    ranked.sort(key=lambda item: -item[1])
    
    # Take top 3 chunks
    top_chunks = [chunk for chunk, score in ranked[:3]]
    
    context = "\n\n".join(top_chunks)
    result_text = _clamp_text(context, MAX_COMPANY_CONTEXT_LENGTH)
    
    prefix = ""
    if company_website_url:
        prefix = f"Company website: {company_website_url}\n"
    elif company_name:
        prefix = f"Company: {company_name}\n"
        
    final_result = f"{prefix}Extracted company context:\n{result_text}"

    logger.info(
        "Company context RAG completed successfully for '%s' — extracted top chunks.",
        target_name,
    )
    return final_result


def _chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    chunks = []
    current_chunk = ""
    
    for line in lines:
        if len(current_chunk) + len(line) > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = line + " "
        else:
            current_chunk += line + " "
            
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
        
    return chunks


def _normalize_extracted_text(value: str) -> str:
    value = re.sub(r"\[[^\]]*\]\([^)]*\)", " ", value)
    value = re.sub(r"https?:\/\/\S+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def _clamp_text(value: str, max_length: int) -> str:
    if len(value) <= max_length:
        return value
    return f"{value[:max_length - 3].strip()}..."


def get_company_context_from_website(
    company_website_url: str, company_name: str, job_title: str
) -> str:
    return get_rag_company_context(company_name, job_title, "", company_website_url)
