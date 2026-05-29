from __future__ import annotations

import json
import logging
from enum import Enum
from typing import Any, AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from agent_service.agent import getChatAgent


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    provider_session_id: str | None = None
    context: dict[str, Any] = Field(default_factory=dict)


class SSEEventType(str, Enum):
    MESSAGE_START = "message_start"
    TEXT_DELTA = "text_delta"
    TOOL_CALL = "tool_call"
    TOOL_RESULT = "tool_result"
    FRONTEND_ACTION = "frontend_action"
    MESSAGE_END = "message_end"
    ERROR = "error"


@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        chat_agent = getChatAgent()
    except Exception as exc:
        logger.exception("Agent service is unavailable")
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    async def eventGenerator() -> AsyncGenerator[str, None]:
        sequence = 0
        provider_session_id = request.provider_session_id
        yield formatSse(
            SSEEventType.MESSAGE_START,
            {
                "session_id": request.session_id,
                "provider_session_id": provider_session_id,
            },
            sequence,
        )
        sequence += 1

        async for event in chat_agent.chat(
            request.message,
            provider_session_id=provider_session_id,
            context=request.context,
        ):
            event_type = event.get("type")
            if event.get("provider_session_id"):
                provider_session_id = event["provider_session_id"]

            if event_type == "text_delta":
                yield formatSse(SSEEventType.TEXT_DELTA, {"text": event.get("content", "")}, sequence)
                sequence += 1
            elif event_type == "tool_call":
                yield formatSse(
                    SSEEventType.TOOL_CALL,
                    {
                        "tool_name": event.get("tool_name"),
                        "tool_input": event.get("tool_input"),
                        "tool_use_id": event.get("tool_use_id"),
                    },
                    sequence,
                )
                sequence += 1
            elif event_type == "tool_result":
                yield formatSse(
                    SSEEventType.TOOL_RESULT,
                    {
                        "tool_use_id": event.get("tool_use_id"),
                        "content": event.get("content"),
                        "is_error": event.get("is_error", False),
                    },
                    sequence,
                )
                sequence += 1
            elif event_type == "frontend_action":
                yield formatSse(
                    SSEEventType.FRONTEND_ACTION,
                    {
                        "action": event.get("action"),
                        "payload": event.get("payload"),
                        "tool_use_id": event.get("tool_use_id"),
                    },
                    sequence,
                )
                sequence += 1
            elif event_type == "result_summary":
                continue
            elif event_type == "done":
                yield formatSse(
                    SSEEventType.MESSAGE_END,
                    {
                        "session_id": request.session_id,
                        "provider_session_id": provider_session_id,
                    },
                    sequence,
                )
                sequence += 1
            elif event_type == "error":
                yield formatSse(
                    SSEEventType.ERROR,
                    {"error": event.get("error", "Unknown agent error")},
                    sequence,
                )
                sequence += 1

    return StreamingResponse(
        eventGenerator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def formatSse(sse_event_type: SSEEventType, data: dict[str, Any], sequence: int) -> str:
    data = {**data, "sequence": sequence}
    return f"event: {sse_event_type.value}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
