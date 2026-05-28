import os
import re
import logging
import requests

logger = logging.getLogger("rescomail.ai-service.company_context")

TAVILY_EXTRACT_ENDPOINT = "https://api.tavily.com/extract"
TAVILY_TIMEOUT_MS = 20_000
MAX_COMPANY_CONTEXT_LENGTH = 2000


def get_company_context_from_website(
    company_website_url: str, company_name: str, job_title: str
) -> str:
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        logger.warning(
            "Company context scraping SKIPPED — TAVILY_API_KEY is not configured. "
            "Set it in your env to enable website-based context enrichment."
        )
        return ""

    logger.info(
        "Scraping company context from '%s' for '%s' (%s) …",
        company_website_url,
        company_name or "unknown company",
        job_title or "unknown role",
    )

    query = " ".join(
        filter(
            bool,
            [
                company_name,
                job_title,
                "company overview products mission customers values hiring team recent launches",
            ],
        )
    )

    try:
        response = requests.post(
            TAVILY_EXTRACT_ENDPOINT,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "urls": company_website_url,
                "query": query,
                "chunks_per_source": 5,
                "extract_depth": "basic",
                "format": "text",
                "include_images": False,
                "include_favicon": False,
                "timeout": 12,
                "include_usage": True,
            },
            timeout=TAVILY_TIMEOUT_MS / 1000.0,
        )
        response.raise_for_status()
        data = response.json()
    except Exception as exc:
        logger.error(
            "Company context scraping FAILED for '%s': %s",
            company_website_url,
            exc,
        )
        return ""

    raw_content = ""
    for result in data.get("results", []):
        if isinstance(result.get("raw_content"), str):
            raw_content += result["raw_content"] + "\n\n"

    normalized = _normalize_extracted_text(raw_content)
    if not normalized:
        logger.warning(
            "Company context scraping returned no usable text for '%s'.",
            company_website_url,
        )
        return ""

    context = (
        f"Company website: {company_website_url}\n"
        f"Extracted company context: {normalized}"
    )
    result_text = _clamp_text(context, MAX_COMPANY_CONTEXT_LENGTH)
    logger.info(
        "Company context scraped successfully from '%s' — %d chars extracted.",
        company_website_url,
        len(result_text),
    )
    return result_text


def _normalize_extracted_text(value: str) -> str:
    value = re.sub(r"\[[^\]]*\]\([^)]*\)", " ", value)
    value = re.sub(r"https?:\/\/\S+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def _clamp_text(value: str, max_length: int) -> str:
    if len(value) <= max_length:
        return value
    return f"{value[:max_length - 3].strip()}..."

