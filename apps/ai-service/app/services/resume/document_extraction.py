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
from urllib.parse import urlparse

import fitz
import requests

from app.core.config import settings
from app.core.executor import thread_executor

logger = logging.getLogger("rescomail.ai-service.document-extraction")

DEFAULT_MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024
REQUEST_TIMEOUT = (5, 30)


# ---------------------------------------------------------------------------
# Public async API — use these from async FastAPI handlers / pipelines
# ---------------------------------------------------------------------------


async def extract_text_from_url_async(file_url: str) -> str:
    """Download and extract text from a PDF URL without blocking the event loop."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(thread_executor, extract_text_from_url, file_url)


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

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temp_path = temp_file.name

    try:
        downloaded = 0

        with requests.get(
            file_url,
            stream=True,
            timeout=REQUEST_TIMEOUT,
            allow_redirects=False,
        ) as response:
            if response.status_code != 200:
                raise RuntimeError(f"Failed to fetch PDF: {response.status_code}")

            content_type = response.headers.get("content-type", "").split(";", 1)[0].lower()
            if content_type not in {"application/pdf", "application/octet-stream"}:
                raise ValueError("Resume file must be a PDF.")

            content_length = response.headers.get("content-length")

            if content_length and int(content_length) > max_download_bytes:
                raise ValueError("Resume PDF is larger than the allowed limit.")

            with temp_file:
                for chunk in response.iter_content(chunk_size=64 * 1024):
                    if not chunk:
                        continue

                    downloaded += len(chunk)

                    if downloaded > max_download_bytes:
                        raise ValueError(
                            "Resume PDF is larger than the allowed limit."
                        )

                    if downloaded == len(chunk) and not chunk.startswith(b"%PDF-"):
                        raise ValueError("Resume file does not contain a valid PDF header.")
                    temp_file.write(chunk)

        return _sync_extract(temp_path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def _sync_extract(temp_path: str) -> str:
    """Extract text from a local PDF file path using PyMuPDF, embedding links in-place."""
    pages_text = []
    with fitz.open(temp_path) as doc:
        if doc.needs_pass:
            raise ValueError("Encrypted PDF files are not supported.")
        if doc.page_count > settings.resume_max_pages:
            raise ValueError("Resume PDF has too many pages.")
        for page in doc:
            links = page.get_links()
            # Filter external URI links
            uri_links = [l for l in links if l.get("kind") == fitz.LINK_URI and "uri" in l]

            # Use get_text("dict", sort=True) to get layout blocks sorted logically
            page_dict = page.get_text("dict", sort=True)

            page_lines = []
            for block in page_dict.get("blocks", []):
                # Only process text blocks (type 0)
                if block.get("type") != 0:
                    continue

                for line in block.get("lines", []):
                    line_parts = []
                    current_uri = None
                    current_text = []

                    for span in line.get("spans", []):
                        span_text = span.get("text", "")
                        if not span_text:
                            continue

                        # Find if span intersects with any link
                        span_rect = fitz.Rect(span["bbox"])
                        span_uri = None
                        for link in uri_links:
                            link_rect = fitz.Rect(link["from"])
                            # Check if the intersection is non-empty
                            if not (link_rect & span_rect).is_empty:
                                span_uri = link["uri"]
                                break

                        if span_uri == current_uri:
                            current_text.append(span_text)
                        else:
                            # Commit previous span group
                            if current_text:
                                merged_text = "".join(current_text)
                                if current_uri:
                                    left_strip = len(merged_text) - len(merged_text.lstrip())
                                    right_strip = len(merged_text) - len(merged_text.rstrip())
                                    stripped = merged_text.strip()
                                    if stripped:
                                        link_str = f"[{stripped}]({current_uri})"
                                        line_parts.append(merged_text[:left_strip] + link_str + merged_text[len(merged_text)-right_strip:])
                                    else:
                                        line_parts.append(merged_text)
                                else:
                                    line_parts.append(merged_text)
                            current_uri = span_uri
                            current_text = [span_text]

                    # Commit last span group
                    if current_text:
                        merged_text = "".join(current_text)
                        if current_uri:
                            left_strip = len(merged_text) - len(merged_text.lstrip())
                            right_strip = len(merged_text) - len(merged_text.rstrip())
                            stripped = merged_text.strip()
                            if stripped:
                                link_str = f"[{stripped}]({current_uri})"
                                line_parts.append(merged_text[:left_strip] + link_str + merged_text[len(merged_text)-right_strip:])
                            else:
                                line_parts.append(merged_text)
                        else:
                            line_parts.append(merged_text)

                    line_str = "".join(line_parts)
                    if line_str.strip():
                        page_lines.append(line_str)

                # Add a blank line between blocks to preserve layout paragraphs
                page_lines.append("")

            pages_text.append("\n".join(page_lines).strip())

    return "\n\n".join(p for p in pages_text if p).strip()


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

    if parsed.scheme != "https":
        raise ValueError("Resume file URL must use https.")

    allowed_hosts = _allowed_hosts()

    if allowed_hosts:
        hostname = (parsed.hostname or "").lower()
        is_allowed = any(
            hostname == allowed or hostname.endswith(f".{allowed}")
            for allowed in allowed_hosts
        )
        if not is_allowed:
            raise ValueError("Resume file host is not allowed.")
