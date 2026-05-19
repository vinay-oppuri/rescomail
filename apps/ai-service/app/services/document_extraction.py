import os
import tempfile
from urllib.parse import urlparse

import fitz
import requests

DEFAULT_MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024
REQUEST_TIMEOUT = (5, 30)


def extract_text_from_url(file_url: str) -> str:
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

        text = ""

        with fitz.open(temp_path) as doc:
            for page in doc:
                text += page.get_text() + "\n"

        return text.strip()
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def _allowed_hosts() -> set[str]:
    raw_hosts = os.getenv("RESUME_FILE_ALLOWED_HOSTS", "")
    return {
        host.strip().lower()
        for host in raw_hosts.split(",")
        if host.strip()
    }


def _max_download_bytes() -> int:
    return int(
        os.getenv("RESUME_MAX_DOWNLOAD_BYTES", str(DEFAULT_MAX_DOWNLOAD_BYTES))
    )


def _validate_file_url(file_url: str) -> None:
    parsed = urlparse(file_url)

    if parsed.scheme not in {"http", "https"}:
        raise ValueError("Resume file URL must use http or https.")

    allowed_hosts = _allowed_hosts()

    if allowed_hosts and (parsed.hostname or "").lower() not in allowed_hosts:
        raise ValueError("Resume file host is not allowed.")
