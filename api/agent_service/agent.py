from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any, AsyncGenerator

from claude_agent_sdk import ClaudeAgentOptions, ClaudeSDKClient, create_sdk_mcp_server, tool
from claude_agent_sdk.types import AssistantMessage, ResultMessage, TextBlock, ToolResultBlock, ToolUseBlock, UserMessage

from config import getClaudeModel, getMaxAgentTurns

from .code_executor import get_execute_python_tool


logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).resolve().parents[1]
PROMPT_PATH = Path(__file__).resolve().parent / "prompts" / "system_prompt.md"
TRIAL_DATA_PATH = ROOT_DIR / "data" / "mcrpc" / "data.xlsx"
TRIAL_SCHEMA_PATH = ROOT_DIR / "data" / "mcrpc" / "data_schema.md"

FLOWCHART_SCHEMA = {
    "prior_treatments": [
        {"id": "n1-adt", "label": "ADT only"},
        {"id": "n1-adt-doc", "label": "ADT + Docetaxel"},
        {"id": "n1-adt-arpi", "label": "ADT + ARPI"},
        {"id": "n1-adt-arpi-doc", "label": "ADT + ARPI + Docetaxel"},
    ],
    "conditions": [
        {"id": "n2-hrr-pos", "label": "HRR positive general"},
        {"id": "n2-brca", "label": "BRCA1 or BRCA2 positive"},
        {"id": "n2-non-brca", "label": "Non-BRCA HRR positive"},
        {"id": "n2-hrr-neg", "label": "HRR negative"},
        {"id": "n2-psma-pos", "label": "PSMA positive"},
        {"id": "n2-psma-neg", "label": "PSMA negative"},
        {"id": "n2-msi-present", "label": "MSI-H / dMMR present"},
        {"id": "n2-msi-absent", "label": "MSI-H / dMMR absent"},
        {"id": "n2-oligo", "label": "Oligometastatic disease"},
        {"id": "n2-indolent", "label": "Indolent disease"},
        {"id": "n2-bone", "label": "Bone-predominant, symptomatic disease"},
        {"id": "n2-doc-yes", "label": "Eligible for Docetaxel"},
        {"id": "n2-doc-no", "label": "Ineligible for Docetaxel due to comorbidities"},
    ],
    "treatments": [
        {"id": "n3-rt-surgery", "label": "Radiation / Surgery"},
        {"id": "n3-sipuleucel", "label": "Sipuleucel-T"},
        {"id": "n3-ra223", "label": "Radium 223"},
        {"id": "n3-docetaxel", "label": "Docetaxel"},
        {"id": "n3-cabazi", "label": "Cabazitaxel"},
        {"id": "n3-talazo-enza", "label": "Talazoparib + enzalutamide"},
        {"id": "n3-olapa-abi", "label": "Olaparib + abiraterone"},
        {"id": "n3-nira-abi", "label": "Niraparib + abiraterone"},
        {"id": "n3-olaparib", "label": "Olaparib"},
        {"id": "n3-abi-pred", "label": "Abiraterone + prednisone"},
        {"id": "n3-enza", "label": "Enzalutamide"},
        {"id": "n3-ra223-enza", "label": "Radium 223 + enzalutamide"},
        {"id": "n3-lu-psma", "label": "177Lu-PSMA-617"},
        {"id": "n3-pembro", "label": "Pembrolizumab"},
    ],
    "edge_rules": {
        "n1-adt": [
            ["n2-brca", "n3-talazo-enza"], ["n2-brca", "n3-olapa-abi"], ["n2-brca", "n3-nira-abi"],
            ["n2-non-brca", "n3-talazo-enza"], ["n2-hrr-neg", "n3-abi-pred"], ["n2-hrr-neg", "n3-enza"],
            ["n2-hrr-neg", "n3-docetaxel"], ["n2-hrr-neg", "n3-ra223-enza"], ["n2-psma-pos", "n3-lu-psma"],
            ["n2-msi-present", "n3-pembro"], ["n2-oligo", "n3-rt-surgery"], ["n2-indolent", "n3-sipuleucel"],
            ["n2-bone", "n3-ra223"], ["n2-doc-yes", "n3-docetaxel"], ["n2-doc-no", "n3-cabazi"],
        ],
        "n1-adt-doc": [
            ["n2-brca", "n3-talazo-enza"], ["n2-brca", "n3-olapa-abi"], ["n2-brca", "n3-nira-abi"],
            ["n2-non-brca", "n3-talazo-enza"], ["n2-hrr-neg", "n3-abi-pred"], ["n2-hrr-neg", "n3-enza"],
            ["n2-hrr-neg", "n3-cabazi"], ["n2-hrr-neg", "n3-ra223-enza"], ["n2-psma-pos", "n3-lu-psma"],
            ["n2-msi-present", "n3-pembro"], ["n2-oligo", "n3-rt-surgery"], ["n2-indolent", "n3-sipuleucel"],
            ["n2-bone", "n3-ra223"], ["n2-doc-yes", "n3-docetaxel"], ["n2-doc-no", "n3-cabazi"],
        ],
        "n1-adt-arpi": [
            ["n2-hrr-pos", "n3-olaparib"], ["n2-hrr-neg", "n3-docetaxel"], ["n2-hrr-neg", "n3-ra223"],
            ["n2-psma-pos", "n3-lu-psma"], ["n2-msi-present", "n3-pembro"], ["n2-oligo", "n3-rt-surgery"],
            ["n2-indolent", "n3-sipuleucel"], ["n2-bone", "n3-ra223"], ["n2-doc-yes", "n3-docetaxel"],
            ["n2-doc-no", "n3-cabazi"],
        ],
        "n1-adt-arpi-doc": [
            ["n2-psma-pos", "n3-lu-psma"], ["n2-hrr-pos", "n3-olaparib"], ["n2-hrr-neg", "n3-cabazi"],
            ["n2-psma-neg", "n3-cabazi"], ["n2-hrr-neg", "n3-ra223"], ["n2-msi-present", "n3-pembro"],
            ["n2-bone", "n3-ra223"], ["n2-doc-yes", "n3-docetaxel"], ["n2-doc-no", "n3-cabazi"],
        ],
    },
}

VALID_PRIOR_IDS = {item["id"] for item in FLOWCHART_SCHEMA["prior_treatments"]}
VALID_COND_IDS = {item["id"] for item in FLOWCHART_SCHEMA["conditions"]}
VALID_TREATMENT_IDS = {item["id"] for item in FLOWCHART_SCHEMA["treatments"]}


def _loadPrompt() -> str:
    prompt = PROMPT_PATH.read_text()
    schema_text = json.dumps(FLOWCHART_SCHEMA, indent=2)
    trial_schema = ""
    if TRIAL_SCHEMA_PATH.exists():
        trial_schema = f"\n\n## Trial Data Schema\n\n{TRIAL_SCHEMA_PATH.read_text()}"
    elif TRIAL_DATA_PATH.exists():
        trial_schema = "\n\n## Trial Data\n\nAn mCRPC trial XLSX file is available through execute_python."
    else:
        trial_schema = "\n\n## Trial Data\n\nNo trial XLSX file is currently available. For trial-data questions, say the data is unavailable or not extracted."

    return f"{prompt}\n\n## Flowchart Schema\n\n```json\n{schema_text}\n```\n{trial_schema}"


def get_viz_profile_tool() -> Any:
    @tool(
        "viz_profile",
        "Trigger the frontend flowchart to render an mCRPC patient profile. Returns a structured frontend action payload.",
        {
            "type": "object",
            "properties": {
                "selected_prior": {
                    "type": "string",
                    "enum": sorted(VALID_PRIOR_IDS),
                    "description": "Prior-treatment node ID.",
                },
                "bio_choice": {
                    "type": "string",
                    "enum": ["yes", "no"],
                    "description": "Whether the patient has biomarker assessment in the flowchart.",
                },
                "selected_cond_ids": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": sorted(VALID_COND_IDS),
                    },
                    "description": "Condition, biomarker, and special-situation node IDs to select.",
                },
                "selected_treatment_id": {
                    "type": ["string", "null"],
                    "enum": sorted(VALID_TREATMENT_IDS) + [None],
                    "description": "Optional treatment node ID to focus.",
                },
            },
            "required": ["selected_prior"],
        },
    )
    async def viz_profile(args: dict[str, Any]) -> dict[str, Any]:
        selected_prior = args.get("selected_prior")
        bio_choice = args.get("bio_choice", "yes")
        selected_cond_ids = args.get("selected_cond_ids")
        selected_treatment_id = args.get("selected_treatment_id")
        cond_ids = selected_cond_ids or []
        if selected_prior not in VALID_PRIOR_IDS:
            return _toolText({"success": False, "error": f"Invalid selected_prior: {selected_prior}"}, is_error=True)
        if bio_choice not in {"yes", "no"}:
            return _toolText({"success": False, "error": f"Invalid bio_choice: {bio_choice}"}, is_error=True)
        invalid_cond_ids = [cond_id for cond_id in cond_ids if cond_id not in VALID_COND_IDS]
        if invalid_cond_ids:
            return _toolText({"success": False, "error": f"Invalid selected_cond_ids: {invalid_cond_ids}"}, is_error=True)
        if selected_treatment_id and selected_treatment_id not in VALID_TREATMENT_IDS:
            return _toolText({"success": False, "error": f"Invalid selected_treatment_id: {selected_treatment_id}"}, is_error=True)

        return _toolText({
            "success": True,
            "action": "viz_profile",
            "payload": {
                "selectedPrior": selected_prior,
                "bioChoice": bio_choice,
                "selectedCondIds": cond_ids,
                "selectedTreatmentId": selected_treatment_id,
            },
        })

    return viz_profile


def _toolText(data: dict[str, Any], is_error: bool = False) -> dict[str, Any]:
    return {
        "content": [
            {
                "type": "text",
                "text": json.dumps(data, ensure_ascii=False),
            }
        ],
        "is_error": is_error,
    }


class ChatAgent:
    def __init__(self):
        tools = [get_viz_profile_tool()]
        allowed_tools = ["mcp__mcrpc__viz_profile"]

        if TRIAL_DATA_PATH.exists():
            tools.append(get_execute_python_tool(str(TRIAL_DATA_PATH)))
            allowed_tools.append("mcp__mcrpc__execute_python")
        else:
            logger.warning("Trial data file not found at %s; execute_python is disabled", TRIAL_DATA_PATH)

        self.mcp_server = create_sdk_mcp_server(
            name="mcrpc",
            version="1.0.0",
            tools=tools,
        )
        self.system_prompt = _loadPrompt()
        self.allowed_tools = allowed_tools

    async def chat(
        self,
        message: str,
        provider_session_id: str | None = None,
        context: dict[str, Any] | None = None,
    ) -> AsyncGenerator[dict[str, Any], None]:
        options = ClaudeAgentOptions(
            system_prompt=self.system_prompt,
            mcp_servers={"mcrpc": self.mcp_server},
            allowed_tools=self.allowed_tools,
            include_partial_messages=True,
            max_turns=getMaxAgentTurns(),
            model=getClaudeModel(),
            permission_mode="bypassPermissions",
        )
        if provider_session_id:
            options.resume = provider_session_id

        query = self._buildQuery(message, context or {})
        new_provider_session_id = provider_session_id

        try:
            async with ClaudeSDKClient(options=options) as client:
                await client.query(query)
                async for msg in client.receive_response():
                    if isinstance(msg, ResultMessage):
                        new_provider_session_id = getattr(msg, "session_id", None) or new_provider_session_id
                        yield {
                            "type": "result_summary",
                            "provider_session_id": new_provider_session_id,
                            "num_turns": getattr(msg, "num_turns", 0),
                            "total_cost_usd": getattr(msg, "total_cost_usd", 0),
                            "is_error": getattr(msg, "is_error", False),
                        }
                    elif isinstance(msg, AssistantMessage):
                        for block in msg.content:
                            async for event in self._eventFromAssistantBlock(block):
                                yield event
                    elif isinstance(msg, UserMessage):
                        for block in msg.content:
                            if isinstance(block, ToolResultBlock):
                                yield self._toolResultEvent(block)

            yield {
                "type": "done",
                "provider_session_id": new_provider_session_id,
            }
        except Exception as exc:
            logger.exception("Error in Claude agent chat")
            yield {
                "type": "error",
                "error": str(exc),
            }

    def _buildQuery(self, message: str, context: dict[str, Any]) -> str:
        if not context:
            return message
        return (
            f"{message}\n\n"
            "Current frontend context, if relevant:\n"
            f"```json\n{json.dumps(context, ensure_ascii=False)}\n```"
        )

    async def _eventFromAssistantBlock(self, block: Any) -> AsyncGenerator[dict[str, Any], None]:
        if isinstance(block, TextBlock):
            yield {"type": "text_delta", "content": block.text}
            return
        if isinstance(block, ToolUseBlock):
            tool_name = getattr(block, "name", "")
            tool_input = getattr(block, "input", {}) or {}
            is_viz_profile = tool_name == "viz_profile" or tool_name.endswith("__viz_profile")
            event_type = "frontend_tool_call" if is_viz_profile else "tool_call"
            yield {
                "type": event_type,
                "tool_name": tool_name,
                "tool_input": tool_input,
                "tool_use_id": getattr(block, "id", None),
            }
            if is_viz_profile:
                payload = self._payloadFromVizToolInput(tool_input)
                if payload:
                    yield {
                        "type": "frontend_action",
                        "action": "viz_profile",
                        "payload": payload,
                    }
            return
        if isinstance(block, ToolResultBlock):
            yield self._toolResultEvent(block)

    def _toolResultEvent(self, block: ToolResultBlock) -> dict[str, Any]:
        content = getattr(block, "content", "")
        parsed = self._parseToolResultContent(content)
        if isinstance(parsed, dict) and parsed.get("action") == "viz_profile" and parsed.get("payload"):
            return {
                "type": "frontend_action",
                "action": "viz_profile",
                "payload": parsed["payload"],
                "tool_use_id": getattr(block, "tool_use_id", None),
            }
        return {
            "type": "tool_result",
            "tool_use_id": getattr(block, "tool_use_id", None),
            "content": parsed if parsed is not None else content,
            "is_error": getattr(block, "is_error", False),
        }

    def _payloadFromVizToolInput(self, tool_input: dict[str, Any]) -> dict[str, Any] | None:
        selected_prior = tool_input.get("selected_prior")
        if selected_prior not in VALID_PRIOR_IDS:
            return None
        cond_ids = tool_input.get("selected_cond_ids") or []
        cond_ids = [cond_id for cond_id in cond_ids if cond_id in VALID_COND_IDS]
        treatment_id = tool_input.get("selected_treatment_id")
        return {
            "selectedPrior": selected_prior,
            "bioChoice": tool_input.get("bio_choice") if tool_input.get("bio_choice") in {"yes", "no"} else "yes",
            "selectedCondIds": cond_ids,
            "selectedTreatmentId": treatment_id if treatment_id in VALID_TREATMENT_IDS else None,
        }

    def _parseToolResultContent(self, content: Any) -> Any:
        if isinstance(content, dict):
            return content
        if isinstance(content, list) and len(content) == 1:
            item = content[0]
            text = getattr(item, "text", None)
            if text:
                return self._parseToolResultContent(text)
        if isinstance(content, str):
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return content
        return content


_chat_agent: ChatAgent | None = None


def getChatAgent() -> ChatAgent:
    global _chat_agent
    if _chat_agent is None:
        _chat_agent = ChatAgent()
    return _chat_agent
