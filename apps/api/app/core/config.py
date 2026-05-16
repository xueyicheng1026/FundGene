from functools import lru_cache
import os
from pathlib import Path
from typing import Any

from pydantic import AliasChoices
from pydantic import Field
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]

DEFAULT_NEWS_FEEDS = [
    "https://www.federalreserve.gov/feeds/press_all.xml",
    "https://www.sec.gov/news/pressreleases.rss",
    "https://home.treasury.gov/news/press-releases/rss",
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        env_prefix="FUNDGENE_",
        extra="ignore",
    )

    app_name: str = "FundGene API"
    app_env: str = "development"
    api_prefix: str = "/api"
    database_url: str = (
        "postgresql+psycopg://fundgene:fundgene@localhost:5432/fundgene"
    )
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )
    advisor_model: str = "deepseek:deepseek-v4-pro"
    agent_mode: str = "hybrid"
    agent_model_timeout_ms: int = 30000
    agent_runtime_flags: str = "default"
    agent_max_tool_calls: int = 8
    agent_max_workers: int = 3
    deepseek_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("FUNDGENE_DEEPSEEK_API_KEY", "DEEPSEEK_API_KEY"),
    )
    deepseek_thinking: str = "disabled"
    deepseek_reasoning_effort: str = "high"
    auth_session_cookie_name: str = "fundgene_session"
    auth_session_ttl_hours: int = 168
    auth_session_secure: bool = False
    auth_session_samesite: str = "lax"
    news_feeds: list[str] = Field(default_factory=lambda: list(DEFAULT_NEWS_FEEDS))

    @field_validator("news_feeds", mode="before")
    @classmethod
    def parse_news_feeds(cls, value: Any) -> Any:
        if isinstance(value, str):
            parts = [
                part.strip()
                for chunk in value.splitlines()
                for part in chunk.split(",")
                if part.strip()
            ]
            return parts
        return value

    @field_validator("deepseek_thinking")
    @classmethod
    def validate_deepseek_thinking(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"enabled", "disabled"}:
            raise ValueError("deepseek_thinking must be 'enabled' or 'disabled'.")
        return normalized

    @field_validator("deepseek_reasoning_effort")
    @classmethod
    def validate_deepseek_reasoning_effort(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"high", "max"}:
            raise ValueError("deepseek_reasoning_effort must be 'high' or 'max'.")
        return normalized

    @property
    def resolved_deepseek_api_key(self) -> str | None:
        value = self.deepseek_api_key or os.getenv("DEEPSEEK_API_KEY")
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


@lru_cache
def get_settings() -> Settings:
    return Settings()
