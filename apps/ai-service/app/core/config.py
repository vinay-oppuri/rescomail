"""
app/core/config.py — Typed, validated configuration via pydantic-settings.
Replaces raw os.environ calls throughout the codebase.
Fails fast at startup if any required variable is missing.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # --- LLM ---
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"

    # --- Auth ---
    ai_service_api_key: str

    # --- Resume file restrictions ---
    resume_file_allowed_hosts: str = ""
    resume_max_download_bytes: int = 10 * 1024 * 1024  # 10 MB

    # --- Redis (Celery broker + embedding cache) ---
    redis_url: str = "redis://localhost:6379/0"

    # --- Rate limiting ---
    rate_limit_per_minute: int = 60

    # --- Logging ---
    log_level: str = "INFO"

    # --- Jobs feature ---
    jsearch_api_key: str = ""
    adzuna_app_id: str = ""
    adzuna_api_key: str = ""
    resend_api_key: str = ""
    tavily_api_key: str = ""

    # --- Embeddings ---
    rescomail_allow_hashed_embedding_fallback: bool = False
    rescomail_embedding_model: str = "BAAI/bge-base-en-v1.5"
    rescomail_reranker_model: str = "cross-encoder/ms-marco-MiniLM-L12-v2"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # ignore unknown env vars — don't break on unrelated vars


settings = Settings()
