"""Maxxer client wrapper — selects real Anthropic SDK or a deterministic stub.

The route handler in `routers/chat.py` depends on `get_maxxer_client` via FastAPI
`Depends(...)`. Tests inject a fake by overriding that dependency.
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Iterable, Literal, Optional, TypedDict

__all__ = [
    "MaxxerMessage",
    "MaxxerCompletion",
    "MaxxerClient",
    "AnthropicMaxxerClient",
    "StubMaxxerClient",
    "get_maxxer_client",
]

logger = logging.getLogger(__name__)


MAXXER_MODEL = os.getenv("MAXXER_MODEL", "claude-sonnet-4-6")
MAXXER_MAX_TOKENS = int(os.getenv("MAXXER_MAX_TOKENS", "1024"))


class MaxxerMessage(TypedDict):
    role: Literal["user", "assistant"]
    content: str


class MaxxerToolCall(TypedDict):
    name: str
    input: dict


class MaxxerCompletion(TypedDict):
    text: str
    tool_calls: list[MaxxerToolCall]


class MaxxerClient:
    """Interface every Maxxer backend implements. Not abstract — subclasses override."""

    def complete(
        self,
        *,
        system: str,
        messages: list[MaxxerMessage],
        tools: Optional[list[dict]] = None,
        tool_choice: Optional[dict] = None,
    ) -> MaxxerCompletion:
        raise NotImplementedError


# ---------------------------------------------------------------------------
# Real Anthropic client
# ---------------------------------------------------------------------------


class AnthropicMaxxerClient(MaxxerClient):
    """Calls the real Claude API. Constructed lazily so test runs without the
    SDK still work."""

    def __init__(self, api_key: Optional[str] = None) -> None:
        from anthropic import Anthropic  # imported here so stub mode stays SDK-free

        self._client = Anthropic(api_key=api_key) if api_key else Anthropic()

    def complete(
        self,
        *,
        system: str,
        messages: list[MaxxerMessage],
        tools: Optional[list[dict]] = None,
        tool_choice: Optional[dict] = None,
    ) -> MaxxerCompletion:
        from anthropic import APIError  # local import to avoid hard dep at module load

        kwargs = {
            "model": MAXXER_MODEL,
            "max_tokens": MAXXER_MAX_TOKENS,
            "system": system,
            "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
            "tools": tools if tools else [],
        }
        if tool_choice is not None:
            kwargs["tool_choice"] = tool_choice
        try:
            response = self._client.messages.create(**kwargs)
        except APIError as exc:  # pragma: no cover - exercised manually
            logger.exception("Anthropic API call failed: %s", exc)
            raise

        text_parts: list[str] = []
        tool_calls: list[MaxxerToolCall] = []
        for block in response.content:
            block_type = getattr(block, "type", None)
            if block_type == "text":
                text_parts.append(block.text)
            elif block_type == "tool_use":
                tool_calls.append({"name": block.name, "input": dict(block.input)})
        return {"text": "".join(text_parts), "tool_calls": tool_calls}


# ---------------------------------------------------------------------------
# Stub
# ---------------------------------------------------------------------------


_AVAILABLE_EVENTS_BLOCK = re.compile(
    r"AVAILABLE EVENTS:\s*(.+?)(?:\n\nUSER PROFILE:|\Z)",
    re.DOTALL,
)
_STUB_FOLLOWUPS = [
    "yo welcome 🔥 first off — what brought you to Melbs, and which part of Melbourne are you usually around?",
    "love that. what's something you miss from home rn, plus any dietary or cultural stuff I should respect?",
    "okay bet — last one: what kind of social vibe feels right? chill kitchen hangs, big BBQ energy, quiet garden time, or low-key just being around people?",
]


class StubMaxxerClient(MaxxerClient):
    """Deterministic mock used when ANTHROPIC_API_KEY is absent.

    Lets Dev 3/4 build the chat/onboarding UI against realistic-shape responses
    without the secret.
    """

    def complete(
        self,
        *,
        system: str,
        messages: list[MaxxerMessage],
        tools: Optional[list[dict]] = None,
        tool_choice: Optional[dict] = None,
    ) -> MaxxerCompletion:
        logger.warning(
            "MAXXER_STUB ANTHROPIC_API_KEY not set; returning canned response"
        )
        if tools:
            # tool_choice forces completion regardless of turn count
            force = tool_choice and tool_choice.get("type") == "tool"
            return self._onboarding(messages, force=bool(force))
        return self._chat(system)

    @staticmethod
    def _chat(system: str) -> MaxxerCompletion:
        ids = _extract_available_event_ids(system)[:3]
        if ids:
            tags = ", ".join(f"[EVENT:{i}]" for i in ids)
            text = (
                "ngl can't reach the real Maxxer rn so here's a sample lineup based "
                f"on what's coming up: {tags}. each of these is grounded in actual "
                "events from your area — give them a look fr 🔥"
            )
        else:
            text = (
                "ngl no events on the schedule right now — once your community drops "
                "some, I'll be back with picks 🤙"
            )
        return {"text": text, "tool_calls": []}

    @staticmethod
    def _onboarding(messages: list[MaxxerMessage], *, force: bool = False) -> MaxxerCompletion:
        user_turns = sum(1 for m in messages if m["role"] == "user")
        if not force and user_turns < 3:
            idx = max(0, min(user_turns - 1, len(_STUB_FOLLOWUPS) - 1))
            return {"text": _STUB_FOLLOWUPS[idx], "tool_calls": []}
        return {
            "text": "ok I've got you, let me find your first picks 🔥",
            "tool_calls": [
                {
                    "name": "finish_onboarding",
                    "input": {
                        "melbourne_reason": "study",
                        "misses_from_home": [],
                        "preferred_vibes": [],
                        "dietary_needs": [],
                        "cultural_considerations": [],
                        "area": "Melbourne CBD",
                        "social_energy": "open to anything",
                    },
                }
            ],
        }


def _extract_available_event_ids(system_prompt: str) -> list[int]:
    """Pull event ids out of the JSON block under `AVAILABLE EVENTS:`.

    Best-effort — returns an empty list if the block is missing or unparseable
    rather than raising, so the stub still produces a valid response shape.
    """
    match = _AVAILABLE_EVENTS_BLOCK.search(system_prompt)
    if not match:
        return []
    raw = match.group(1).strip()
    try:
        events = json.loads(raw)
    except json.JSONDecodeError:
        return []
    return [int(e["id"]) for e in events if isinstance(e, dict) and "id" in e]


# ---------------------------------------------------------------------------
# Factory used by FastAPI Depends(...)
# ---------------------------------------------------------------------------


def get_maxxer_client() -> MaxxerClient:
    """Pick the real client if ANTHROPIC_API_KEY is set, else the stub."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key:
        return AnthropicMaxxerClient(api_key=api_key)
    return StubMaxxerClient()
