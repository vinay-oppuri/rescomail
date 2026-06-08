"""
app/services/jobs/search.py — JSearch (RapidAPI) and Adzuna job search clients.

Supports pagination and returns a normalised list of job dicts regardless of
which source is queried. Source is selected based on available API keys.
"""

import logging
from typing import Any

import requests

from app.core.config import settings

logger = logging.getLogger("rescomail.ai-service.jobs.search")

_JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"
_ADZUNA_URL = "https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"
REQUEST_TIMEOUT = (5, 20)


# ---------------------------------------------------------------------------
# Normalised job dict structure
# ---------------------------------------------------------------------------

def _normalise_jsearch(job: dict) -> dict:
    return {
        "id": job.get("job_id", ""),
        "title": job.get("job_title", ""),
        "company": job.get("employer_name", ""),
        "location": job.get("job_city", "") or job.get("job_country", ""),
        "description": job.get("job_description", ""),
        "apply_link": job.get("job_apply_link", ""),
        "posted_at": job.get("job_posted_at_datetime_utc", ""),
        "source": "jsearch",
    }


def _normalise_adzuna(job: dict) -> dict:
    loc = job.get("location", {})
    area = loc.get("area", [])
    return {
        "id": str(job.get("id", "")),
        "title": job.get("title", ""),
        "company": job.get("company", {}).get("display_name", ""),
        "location": ", ".join(area) if area else "",
        "description": job.get("description", ""),
        "apply_link": job.get("redirect_url", ""),
        "posted_at": job.get("created", ""),
        "source": "adzuna",
    }


# ---------------------------------------------------------------------------
# JSearch client
# ---------------------------------------------------------------------------

def search_jsearch(query: str, location: str, page: int = 1, num_pages: int = 1) -> list[dict]:
    """Query JSearch (RapidAPI) and return normalised job listings."""
    if not settings.jsearch_api_key:
        logger.warning("JSEARCH_API_KEY is not set — skipping JSearch.")
        return []

    query_str = f"{query} in {location}" if (location and location.strip()) else query
    params: dict[str, Any] = {
        "query": query_str,
        "page": str(page),
        "num_pages": str(num_pages),
    }
    headers = {
        "X-RapidAPI-Key": settings.jsearch_api_key,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }

    try:
        response = requests.get(_JSEARCH_URL, headers=headers, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        return [_normalise_jsearch(j) for j in data.get("data", [])]
    except Exception as exc:
        logger.error("JSearch request failed: %s", exc)
        return []


# ---------------------------------------------------------------------------
# Adzuna client
# ---------------------------------------------------------------------------

def search_adzuna(query: str, location: str, country: str = "us", page: int = 1) -> list[dict]:
    """Query Adzuna and return normalised job listings."""
    if not settings.adzuna_app_id or not settings.adzuna_api_key:
        logger.warning("ADZUNA_APP_ID / ADZUNA_API_KEY not set — skipping Adzuna.")
        return []

    url = _ADZUNA_URL.format(country=country, page=page)
    params: dict[str, Any] = {
        "app_id": settings.adzuna_app_id,
        "app_key": settings.adzuna_api_key,
        "what": query,
        "where": location,
        "results_per_page": 20,
        "sort_by": "date",
    }

    try:
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        return [_normalise_adzuna(j) for j in data.get("results", [])]
    except Exception as exc:
        logger.error("Adzuna request failed: %s", exc)
        return []


# ---------------------------------------------------------------------------
# Unified search — tries JSearch first, falls back to Adzuna
# ---------------------------------------------------------------------------

def search_jobs(query: str, location: str, max_results: int = 20) -> list[dict]:
    """Search for jobs via the best available source."""
    jobs = search_jsearch(query, location)
    if not jobs:
        jobs = search_adzuna(query, location)

    return jobs[:max_results]
