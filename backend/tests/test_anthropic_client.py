"""Tests for services/anthropic_client.py — Maxxer client selection + stub behaviour."""
import json


def test_get_maxxer_client_returns_stub_when_key_absent(monkeypatch):
    from services.anthropic_client import StubMaxxerClient, get_maxxer_client

    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)

    client = get_maxxer_client()
    assert isinstance(client, StubMaxxerClient)


def test_get_maxxer_client_returns_real_when_key_present(monkeypatch):
    from services.anthropic_client import (
        AnthropicMaxxerClient,
        get_maxxer_client,
    )

    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-fake-key")

    client = get_maxxer_client()
    assert isinstance(client, AnthropicMaxxerClient)


def test_stub_chat_returns_three_event_tags_from_available_events():
    from services.anthropic_client import StubMaxxerClient
    from services.maxxer import build_chat_system_prompt

    events = [
        {"id": 12, "title": "BBQ", "event_type": "social"},
        {"id": 7, "title": "Garden", "event_type": "plant_learn"},
        {"id": 3, "title": "Kitchen", "event_type": "cook_share"},
        {"id": 99, "title": "Should not pick", "event_type": "social"},
    ]
    system = build_chat_system_prompt(events, preferences=None, past_rsvps=[])

    client = StubMaxxerClient()
    completion = client.complete(
        system=system,
        messages=[{"role": "user", "content": "what's on this weekend"}],
        tools=None,
    )

    assert completion["tool_calls"] == []
    text = completion["text"]
    # All three picked must come from the available events list.
    for picked in ("[EVENT:12]", "[EVENT:7]", "[EVENT:3]"):
        assert picked in text, f"stub missed {picked} from {text!r}"


def test_stub_onboarding_continues_when_few_user_turns():
    from services.anthropic_client import StubMaxxerClient
    from services.maxxer import (
        FINISH_ONBOARDING_TOOL,
        build_onboarding_system_prompt,
    )

    client = StubMaxxerClient()
    completion = client.complete(
        system=build_onboarding_system_prompt(),
        messages=[{"role": "user", "content": "hi"}],
        tools=[FINISH_ONBOARDING_TOOL],
    )

    assert completion["tool_calls"] == []
    assert completion["text"]  # canned follow-up text


def test_stub_onboarding_advances_questions_after_each_user_turn():
    from services.anthropic_client import StubMaxxerClient
    from services.maxxer import (
        FINISH_ONBOARDING_TOOL,
        build_onboarding_system_prompt,
    )

    client = StubMaxxerClient()
    opener = client.complete(
        system=build_onboarding_system_prompt(),
        messages=[],
        tools=[FINISH_ONBOARDING_TOOL],
    )
    second = client.complete(
        system=build_onboarding_system_prompt(),
        messages=[
            {"role": "assistant", "content": opener["text"]},
            {"role": "user", "content": "study in Carlton"},
        ],
        tools=[FINISH_ONBOARDING_TOOL],
    )

    assert "What brought you" in opener["text"]
    assert "What brought you" not in second["text"]
    assert "miss" in second["text"].lower()


def test_stub_onboarding_completes_after_three_user_turns():
    from services.anthropic_client import StubMaxxerClient
    from services.maxxer import (
        FINISH_ONBOARDING_TOOL,
        build_onboarding_system_prompt,
    )

    client = StubMaxxerClient()
    completion = client.complete(
        system=build_onboarding_system_prompt(),
        messages=[
            {"role": "user", "content": "hi I'm here for uni"},
            {"role": "assistant", "content": "love that, what do you miss?"},
            {"role": "user", "content": "shared meals with my cousins"},
            {"role": "assistant", "content": "got it. vibe?"},
            {"role": "user", "content": "small intimate groups"},
        ],
        tools=[FINISH_ONBOARDING_TOOL],
    )

    assert len(completion["tool_calls"]) == 1
    call = completion["tool_calls"][0]
    assert call["name"] == "finish_onboarding"
    # Stub must produce keys matching the tool input schema so the route
    # handler can persist preferences without special-casing the stub.
    for key in (
        "melbourne_reason",
        "misses_from_home",
        "preferred_vibes",
        "dietary_needs",
        "cultural_considerations",
        "area",
        "social_energy",
    ):
        assert key in call["input"]
