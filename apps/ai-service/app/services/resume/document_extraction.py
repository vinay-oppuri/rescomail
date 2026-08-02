"""Securely download a resume PDF and extract readable text."""

import os
import tempfile
from typing import BinaryIO
from urllib.parse import urlparse

import fitz
import requests

from app.core.config import settings

ALLOWED_CONTENT_TYPES = {"application/pdf", "application/octet-stream"}
DOWNLOAD_CHUNK_SIZE = 64 * 1024
REQUEST_TIMEOUT = (5, 30)


def extract_text_from_url(file_url: str) -> str:
    """Download and extract a validated PDF without keeping it on disk."""
    _validate_file_url(file_url)

    temporary_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temporary_path = temporary_file.name

    try:
        with temporary_file:
            _download_pdf(file_url, temporary_file)
        return _extract_pdf_text(temporary_path)
    finally:
        if os.path.exists(temporary_path):
            os.remove(temporary_path)


def _download_pdf(file_url: str, destination: BinaryIO) -> None:
    """Stream a PDF into a file while enforcing type and size limits."""
    with requests.get(
        file_url,
        stream=True,
        timeout=REQUEST_TIMEOUT,
        allow_redirects=False,
    ) as response:
        if response.status_code != 200:
            raise RuntimeError(f"Failed to fetch PDF: {response.status_code}")

        content_type = response.headers.get("content-type", "").split(";", 1)[0].lower()
        if content_type not in ALLOWED_CONTENT_TYPES:
            raise ValueError("Resume file must be a PDF.")

        content_length = response.headers.get("content-length")
        if content_length and int(content_length) > settings.resume_max_download_bytes:
            raise ValueError("Resume PDF is larger than the allowed limit.")

        downloaded_bytes = 0
        for chunk in response.iter_content(chunk_size=DOWNLOAD_CHUNK_SIZE):
            if not chunk:
                continue

            downloaded_bytes += len(chunk)
            if downloaded_bytes > settings.resume_max_download_bytes:
                raise ValueError("Resume PDF is larger than the allowed limit.")
            if downloaded_bytes == len(chunk) and not chunk.startswith(b"%PDF-"):
                raise ValueError("Resume file does not contain a valid PDF header.")

            destination.write(chunk)


def _extract_pdf_text(file_path: str) -> str:
    """Read page text and retain external URLs listed in the PDF."""
    pages: list[str] = []

    with fitz.open(file_path) as document:
        if document.needs_pass:
            raise ValueError("Encrypted PDF files are not supported.")
        if document.page_count > settings.resume_max_pages:
            raise ValueError("Resume PDF has too many pages.")

        for page in document:
            page_text = page.get_text("text", sort=True).strip()
            links = _page_links(page)
            if links:
                page_text = f"{page_text}\nLinks: {', '.join(links)}".strip()
            if page_text:
                pages.append(page_text)

    return "\n\n".join(pages)


def _page_links(page: fitz.Page) -> list[str]:
    """Return unique external links in their original order."""
    links: list[str] = []
    for item in page.get_links():
        uri = item.get("uri")
        if item.get("kind") == fitz.LINK_URI and uri and uri not in links:
            links.append(uri)
    return links


def _allowed_hosts() -> set[str]:
    hosts: set[str] = set()
    for value in settings.resume_file_allowed_hosts.split(","):
        value = value.strip().lower()
        if not value:
            continue
        parsed = urlparse(value if "://" in value else f"//{value}")
        hosts.add(parsed.hostname or value)
    return hosts


def _validate_file_url(file_url: str) -> None:
    parsed = urlparse(file_url)
    if parsed.scheme != "https":
        raise ValueError("Resume file URL must use https.")

    hostname = (parsed.hostname or "").lower()
    allowed_hosts = _allowed_hosts()
    if allowed_hosts and not any(
        hostname == allowed or hostname.endswith(f".{allowed}")
        for allowed in allowed_hosts
    ):
        raise ValueError("Resume file host is not allowed.")
