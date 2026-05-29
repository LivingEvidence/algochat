# Copy this file to `.env` in the `api/` folder and fill in your values.

# Enable Microsoft Foundry integration for Claude Agent SDK / Claude Code.
CLAUDE_CODE_USE_FOUNDRY=1

# Anthropic Foundry API key.
ANTHROPIC_FOUNDRY_API_KEY=

# Azure resource name. Used by Claude tooling to reach:
# https://{resource}.services.ai.azure.com
ANTHROPIC_FOUNDRY_RESOURCE=

# Set these to your Azure Foundry deployment names.
ANTHROPIC_DEFAULT_SONNET_MODEL=claude-haiku-4-5
ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-haiku-4-5
ANTHROPIC_DEFAULT_OPUS_MODEL=claude-haiku-4-5

# Comma-separated frontend origins allowed by CORS.
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173

# Local backend port used by `uv run python run.py`.
API_PORT=8392

# Maximum turns Claude can take for one chat request.
CLAUDE_AGENT_MAX_TURNS=8
