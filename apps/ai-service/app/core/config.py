"""
app/core/config.py — Typed, validated configuration via pydantic-settings.
Replaces raw os.environ calls throughout the codebase.
Fails fast at startup if any required variable is missing.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- LLM + Embeddings (same API key) ---
    gemini_api_key: str
    gemini_model: str = "gemini-3.5-flash"
    groq_api_key: str = ""

    # --- Auth ---
    ai_service_api_key: str

    # --- Resume file restrictions ---
    resume_file_allowed_hosts: str = "utfs.io,ufs.sh"
    resume_max_download_bytes: int = 10 * 1024 * 1024  # 10 MB

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


settings = Settings()
