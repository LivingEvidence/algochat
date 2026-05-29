from __future__ import annotations

import os

from dotenv import load_dotenv


load_dotenv()


REQUIRED_CORS_ORIGINS = [
    "https://livingevidence.github.io",
]


def getCorsOrigins() -> list[str]:
    raw = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,https://livingevidence.github.io",
    )
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    for origin in REQUIRED_CORS_ORIGINS:
        if origin not in origins:
            origins.append(origin)
    return origins or ["http://localhost:5173"]


def getClaudeModel() -> str:
    return os.getenv(
        "ANTHROPIC_DEFAULT_SONNET_MODEL",
        os.getenv("ANTHROPIC_DEFAULT_HAIKU_MODEL", "claude-haiku-4-5"),
    )


def getMaxAgentTurns() -> int:
    raw = os.getenv("CLAUDE_AGENT_MAX_TURNS", "8")
    try:
        return max(1, int(raw))
    except ValueError:
        return 8


def getApiPort() -> int:
    raw = os.getenv("API_PORT", "8392")
    try:
        return max(1, int(raw))
    except ValueError:
        return 8392
