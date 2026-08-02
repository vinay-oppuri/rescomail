"""Typed environment configuration for the AI service."""

from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: Literal["development", "test", "production"] = "development"

    # AI providers
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash"
    groq_api_key: str = ""
    tavily_api_key: str = ""

    # Requests from the web app
    ai_service_api_key: str = Field(min_length=32)
    ai_service_previous_api_key: str = ""

    # Resume PDF limits
    resume_file_allowed_hosts: str = "utfs.io,ufs.sh"
    resume_max_download_bytes: int = 10 * 1024 * 1024
    resume_max_pages: int = 20

    # Operations
    rate_limit_per_minute: int = 60
    log_level: str = "INFO"
    sentry_dsn: str = ""
    sentry_traces_sample_rate: float = Field(default=0.1, ge=0, le=1)

    @model_validator(mode="after")
    def validate_secrets(self) -> "Settings":
        if self.environment == "production" and not self.gemini_api_key.strip():
            raise ValueError("GEMINI_API_KEY is required in production")

        previous_key = self.ai_service_previous_api_key.strip()
        if previous_key and len(previous_key) < 32:
            raise ValueError("AI_SERVICE_PREVIOUS_API_KEY must be at least 32 characters")
        return self


settings = Settings()
