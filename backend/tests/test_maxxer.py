"""Unit tests for services/maxxer.py — pure prompt + parsing logic."""
import json

import pytest


def test_parse_event_id_tags_extracts_in_order():
    from services.maxxer import parse_event_id_tags

    text = "Try [EVENT:12] then [EVENT:7] and finally [EVENT:3] for a chill arvo"
    assert parse_event_id_tags(text) == [12, 7, 3]


def test_parse_event_id_tags_handles_no_tags_and_malformed():
    from services.maxxer import parse_event_id_tags

    assert parse_event_id_tags("no tags here") == []
    assert parse_event_id_tags("[EVENT:abc] [EVENT:] [EVENT:12]") == [12]


def test_enforce_event_suggestions_drops_unknown_ids_and_their_tags():
    from services.maxxer import enforce_event_suggestions

    text = "Try [EVENT:5] or [EVENT:99] or even [EVENT:7]"
    cleaned, ids = enforce_event_suggestions(text, available_ids={5, 7, 8})

    assert ids == [5, 7]
    assert "[EVENT:5]" in cleaned
    assert "[EVENT:7]" in cleaned
    assert "[EVENT:99]" not in cleaned


def test_enforce_event_suggestions_dedupes_and_truncates_to_three():
    from services.maxxer import enforce_event_suggestions

    text = (
        "[EVENT:1] [EVENT:1] [EVENT:2] [EVENT:3] [EVENT:4]"
    )
    cleaned, ids = enforce_event_suggestions(
        text, available_ids={1, 2, 3, 4, 5}
    )

    assert ids == [1, 2, 3]
    # 4th survives in text but isn't promoted to the response list.
    # Acceptable for the hackathon: cleaning every extra tag adds complexity
    # without changing how the frontend renders. The contract is the list.
    assert cleaned.count("[EVENT:") >= 3


def test_enforce_event_suggestions_fewer_than_three_returns_what_it_has():
    from services.maxxer import enforce_event_suggestions

    text = "just one: [EVENT:1]"
    cleaned, ids = enforce_event_suggestions(text, available_ids={1, 2, 3})

    assert ids == [1]
    assert "[EVENT:1]" in cleaned


def test_enforce_event_suggestions_returns_empty_list_when_no_known_ids():
    from services.maxxer import enforce_event_suggestions

    text = "only fakes: [EVENT:99] [EVENT:100]"
    cleaned, ids = enforce_event_suggestions(text, available_ids={1, 2, 3})

    assert ids == []
    assert "[EVENT:99]" not in cleaned
    assert "[EVENT:100]" not in cleaned


def test_build_chat_system_prompt_includes_events_json_and_preferences():
    from services.maxxer import build_chat_system_prompt

    events = [{"id": 1, "title": "BBQ"}]
    prefs = {"melbourne_reason": "study", "area": "Carlton"}
    rsvps = [{"event_id": 1, "status": "attended"}]

    prompt = build_chat_system_prompt(events, prefs, rsvps)

    assert "EXACTLY 3" in prompt
    assert "[EVENT:id]" in prompt
    assert json.dumps(events) in prompt or '"title": "BBQ"' in prompt
    assert "Carlton" in prompt
    assert '"event_id": 1' in prompt or "attended" in prompt


def test_build_chat_system_prompt_handles_missing_preferences():
    from services.maxxer import build_chat_system_prompt

    prompt = build_chat_system_prompt(events=[], preferences=None, past_rsvps=[])

    assert "null" in prompt or "no preferences yet" in prompt.lower()
    # No crash on None preferences is the main thing.


def test_build_onboarding_system_prompt_mentions_dimensions():
    from services.maxxer import build_onboarding_system_prompt

    prompt = build_onboarding_system_prompt()

    # The 3 scripted questions combine: reason + area, home misses +
    # dietary/cultural, and social vibe.
    for keyword in [
        "Melbourne",
        "home",
        "vibe",
        "dietary",
        "cultural",
    ]:
        assert keyword.lower() in prompt.lower(), f"missing {keyword!r}"


def test_finish_onboarding_tool_schema_has_six_dimensions():
    from services.maxxer import FINISH_ONBOARDING_TOOL

    assert FINISH_ONBOARDING_TOOL["name"] == "finish_onboarding"
    props = FINISH_ONBOARDING_TOOL["input_schema"]["properties"]
    for key in (
        "melbourne_reason",
        "misses_from_home",
        "preferred_vibes",
        "dietary_needs",
        "cultural_considerations",
        "area",
        "social_energy",
    ):
        assert key in props, f"missing dimension {key}"


def test_finish_onboarding_tool_only_requires_melbourne_reason():
    """Other dimensions are optional so Claude wraps up after 5 questions even
    when the user didn't volunteer every detail."""
    from services.maxxer import FINISH_ONBOARDING_TOOL

    required = FINISH_ONBOARDING_TOOL["input_schema"]["required"]
    assert required == ["melbourne_reason"]


def test_onboarding_prompt_scripts_three_questions():
    from services.maxxer import build_onboarding_system_prompt

    prompt = build_onboarding_system_prompt()
    # Must mention the hard cap and the must-call rule, otherwise Claude
    # keeps the conversation going.
    assert "3" in prompt
    assert "MUST" in prompt and "finish_onboarding" in prompt
