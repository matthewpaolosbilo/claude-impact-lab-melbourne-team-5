"""Pure prompt + parsing logic for the Maxxer agent.

No I/O, no DB, no HTTP. Importable from anywhere, easy to unit-test.

Source of truth for: system prompts, the onboarding tool schema, and the
`[EVENT:id]` enforcement used to keep Claude's suggestions grounded in real
events.
"""

from __future__ import annotations

import json
import re
from typing import Iterable, Optional

__all__ = [
    "MAXXER_VOICE_PREFACE",
    "FINISH_ONBOARDING_TOOL",
    "build_chat_system_prompt",
    "build_onboarding_system_prompt",
    "parse_event_id_tags",
    "enforce_event_suggestions",
]


# ---------------------------------------------------------------------------
# Voice
# ---------------------------------------------------------------------------

MAXXER_VOICE_PREFACE = """You are the Maxxer, the AI assistant for Community Maxxing — a civic participation app in Melbourne, Australia.

You speak in warm Gen Z slang. You're supportive, a little cheeky, never cringe. You talk like a friend who genuinely wants this person to get out there and find their people. You use slang naturally — "ngl", "fr fr", "lowkey", "giving", "slay", "no cap", "vibe check", "bet" — but you don't overdo it. Every other sentence doesn't need slang. You're warm first, funny second.

You are talking to an international student in Melbourne. Many of them are dealing with isolation, missing family, food insecurity, and not knowing anyone. You take that seriously underneath the playful tone. You never make loneliness feel like a personal failure. You frame showing up to community events as something genuinely cool and brave."""


# ---------------------------------------------------------------------------
# Chat system prompt (ongoing /api/chat)
# ---------------------------------------------------------------------------

_CHAT_INSTRUCTIONS = """Your job is to suggest EXACTLY 3 events from the available events list. Always 3, no more, no less. Present them conversationally, not as a numbered list. Explain why each one fits this person specifically based on what you know about them.

When suggesting events, wrap each event reference in a tag like [EVENT:id] so the frontend can parse it. Example: "there's this Saturday arvo BBQ at Flagstaff [EVENT:12] that's super chill, usually gets a good mix of people..."

Only suggest events whose ids appear in AVAILABLE EVENTS. Do not invent ids."""


def build_chat_system_prompt(
    events: list[dict],
    preferences: Optional[dict],
    past_rsvps: list[dict],
) -> str:
    """Render the ongoing-chat system prompt with grounded context."""
    events_block = json.dumps(events, default=str)
    rsvps_block = json.dumps(past_rsvps, default=str)
    if preferences is None:
        prefs_block = "null  (no preferences yet — be a bit more curious, ask one quick question)"
    else:
        prefs_block = json.dumps(preferences, default=str)

    return f"""{MAXXER_VOICE_PREFACE}

{_CHAT_INSTRUCTIONS}

AVAILABLE EVENTS:
{events_block}

USER PROFILE:
{prefs_block}

USER'S PAST ATTENDANCE:
{rsvps_block}
"""


# ---------------------------------------------------------------------------
# Onboarding system prompt + tool
# ---------------------------------------------------------------------------

_ONBOARDING_INSTRUCTIONS = """This person is new to Community Maxxing. Run a short, warm onboarding conversation (about 4-6 messages total) to learn what they need so the app can recommend the right community events later.

Across the conversation, gently surface these six dimensions:

1. Why they're in Melbourne (study, work, family, etc.)
2. What they miss from home (food, family rituals, language, scenery — anything)
3. The preferred social vibe (chill kitchen hangs, big BBQ parties, quiet garden time, etc.)
4. Any dietary needs (vegetarian, halal, allergies)
5. Cultural considerations the host should know
6. Roughly which area of Melbourne they hang out in, and how social they're feeling lately

Do NOT ask all of this in one go. One or two threads per message. Match their energy.

When you've got enough across all six dimensions, call the `finish_onboarding` tool with the structured preferences. The frontend will then send a follow-up turn where you suggest exactly 3 grounded events using the same [EVENT:id] tag format as the main chat — but for THIS turn, just finish onboarding cleanly with a warm closing line."""


def build_onboarding_system_prompt() -> str:
    return f"{MAXXER_VOICE_PREFACE}\n\n{_ONBOARDING_INSTRUCTIONS}\n"


# Anthropic tool definition Claude will call when onboarding is complete.
# input_schema mirrors the `preferences` payload documented in STATE.md.
FINISH_ONBOARDING_TOOL: dict = {
    "name": "finish_onboarding",
    "description": (
        "Call this tool when you have gathered enough across all six "
        "onboarding dimensions to confidently personalise event suggestions. "
        "Pass what you learned about the user."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "melbourne_reason": {
                "type": "string",
                "description": "Why they're in Melbourne (e.g. 'study', 'work', 'family').",
            },
            "misses_from_home": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Specific things they miss from home — food, rituals, scenery.",
            },
            "preferred_vibes": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Social vibes that feel right (e.g. 'cooking together', 'chill park hang').",
            },
            "dietary_needs": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Vegetarian, halal, allergies — empty list if none.",
            },
            "cultural_considerations": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Cultural notes the host could be aware of — empty list if none.",
            },
            "area": {
                "type": "string",
                "description": "Rough Melbourne neighbourhood they spend time in.",
            },
            "social_energy": {
                "type": "string",
                "description": "How social they feel right now — 'small intimate groups', 'open to anything', 'just want to be around people', etc.",
            },
        },
        "required": [
            "melbourne_reason",
            "misses_from_home",
            "preferred_vibes",
            "dietary_needs",
            "cultural_considerations",
            "area",
            "social_energy",
        ],
    },
}


# ---------------------------------------------------------------------------
# [EVENT:id] parsing + enforcement
# ---------------------------------------------------------------------------

_EVENT_TAG_RE = re.compile(r"\[EVENT:(\d+)\]")


def parse_event_id_tags(text: str) -> list[int]:
    """Extract event ids from `[EVENT:n]` tags, in order of appearance.

    Malformed tags (missing digits, non-numeric) are ignored silently.
    """
    return [int(m.group(1)) for m in _EVENT_TAG_RE.finditer(text)]


def enforce_event_suggestions(
    text: str,
    available_ids: Iterable[int],
    target: int = 3,
) -> tuple[str, list[int]]:
    """Filter suggested event ids down to known + deduped + truncated.

    Returns the (possibly modified) response text and the final id list. The
    text has `[EVENT:n]` tags removed for ids that aren't in `available_ids` so
    the frontend never has to render a broken pin.
    """
    available_set = set(available_ids)
    ordered: list[int] = []
    seen: set[int] = set()

    for raw_id in parse_event_id_tags(text):
        if raw_id not in available_set:
            continue
        if raw_id in seen:
            continue
        ordered.append(raw_id)
        seen.add(raw_id)
        if len(ordered) >= target:
            break

    def _strip(match: re.Match) -> str:
        raw = int(match.group(1))
        if raw in available_set:
            return match.group(0)
        return ""  # drop the tag entirely

    cleaned = _EVENT_TAG_RE.sub(_strip, text)
    return cleaned, ordered
