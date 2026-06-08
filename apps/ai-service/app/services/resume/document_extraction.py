"""
app/services/resume/document_extraction.py — PDF text extraction via PyMuPDF.

PyMuPDF (fitz) is a synchronous C-extension. Calling it directly inside an
async FastAPI handler blocks the entire event loop while the PDF is parsed.
This module wraps the sync extraction in a dedicated ThreadPoolExecutor so
it runs off the event loop thread, keeping the server responsive.
"""

import asyncio
import logging
import os
import tempfile
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

import fitz
import requests

from app.core.config import settings

logger = logging.getLogger("rescomail.ai-service.document-extraction")

DEFAULT_MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024
REQUEST_TIMEOUT = (5, 30)

# Dedicated executor for CPU-bound / blocking PyMuPDF calls.
# Max 4 workers — tune based on expected concurrency and server CPU count.
_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="pdf-extract")


# ---------------------------------------------------------------------------
# Public async API — use these from async FastAPI handlers / pipelines
# ---------------------------------------------------------------------------


async def extract_text_from_url_async(file_url: str) -> str:
    """Download and extract text from a PDF URL without blocking the event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, extract_text_from_url, file_url)


# ---------------------------------------------------------------------------
# Synchronous implementation — kept for background executor / Celery tasks
# ---------------------------------------------------------------------------


def extract_text_from_url(file_url: str) -> str:
    """Download a PDF from *file_url* and return its extracted text.

    Validates the URL scheme and, if configured, the allowed hosts before
    downloading. The PDF is streamed into a temp file to enforce the size limit
    without loading the whole file into memory first.
    """
    _validate_file_url(file_url)
    max_download_bytes = _max_download_bytes()

    response = requests.get(file_url, stream=True, timeout=REQUEST_TIMEOUT)

    if response.status_code != 200:
        raise RuntimeError(f"Failed to fetch PDF: {response.status_code}")

    content_length = response.headers.get("content-length")

    if content_length and int(content_length) > max_download_bytes:
        raise ValueError("Resume PDF is larger than the allowed limit.")

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temp_path = temp_file.name

    try:
        downloaded = 0

        with temp_file:
            for chunk in response.iter_content(chunk_size=64 * 1024):
                if not chunk:
                    continue

                downloaded += len(chunk)

                if downloaded > max_download_bytes:
                    raise ValueError("Resume PDF is larger than the allowed limit.")

                temp_file.write(chunk)

        return _sync_extract(temp_path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def _sync_extract(temp_path: str) -> str:
    """Extract text from a local PDF file path using PyMuPDF."""
    text = ""
    with fitz.open(temp_path) as doc:
        for page in doc:
            text += page.get_text() + "\n"
    return text.strip()


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _allowed_hosts() -> set[str]:
    raw_hosts = settings.resume_file_allowed_hosts
    hosts: set[str] = set()

    for host in raw_hosts.split(","):
        host = host.strip().lower()

        if not host:
            continue

        parsed = urlparse(host if "://" in host else f"//{host}")
        hosts.add(parsed.hostname or host)

    return hosts


def _max_download_bytes() -> int:
    return settings.resume_max_download_bytes


def _validate_file_url(file_url: str) -> None:
    parsed = urlparse(file_url)

    if parsed.scheme not in {"http", "https"}:
        raise ValueError("Resume file URL must use http or https.")

    allowed_hosts = _allowed_hosts()

    if allowed_hosts:
        hostname = (parsed.hostname or "").lower()
        is_allowed = any(
            hostname == allowed or hostname.endswith(f".{allowed}")
            for allowed in allowed_hosts
        )
        if not is_allowed:
            raise ValueError("Resume file host is not allowed.")
