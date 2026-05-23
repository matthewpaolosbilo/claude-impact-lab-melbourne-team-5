"""Route tests for /api/chat and /api/chat/onboarding.

Uses the `fake_maxxer` fixture (conftest) to script Maxxer client responses.
One test exercises the StubMaxxerClient end-to-end (no override) to confirm the
no-API-key dev path works.
"""

from datetime import datetime, timedelta


def _upcoming(now: datetime, days_ahead: int) -> datetime:
    return now + timedelta(days=days_ahead)


def _seed_events(db_session, host, location, count: int = 3):
    from models import Event

    now = datetime.utcnow()
    events = []
    for i in range(count):
        start = _upcoming(now, i + 1)
        events.append(
            Event(
                location_id=location.id,
                title=f"Event {i + 1}",
                description="",
                event_type="social",
                start_time=start,
                end_time=start + timedelta(hours=2),
                host_user_id=host.id,
            )
        )
    db_session.add_all(events)
    db_session.commit()
    for e in events:
        db_session.refresh(e)
    return events


def test_chat_404_when_user_missing(client, fake_maxxer):
    response = client.post("/api/chat", json={"user_id": 9999, "message": "hi"})
    assert response.status_code == 404


def test_chat_returns_three_event_suggestions_from_available_pool(
    client, db_session, a_user, a_location, fake_maxxer
):
    e1, e2, e3 = _seed_events(db_session, a_user, a_location, count=3)

    fake_maxxer.responses.append(
        {
            "text": (
                f"ok lineup: [EVENT:{e1.id}] then [EVENT:{e2.id}] and "
                f"[EVENT:{e3.id}] 🔥"
            ),
            "tool_calls": [],
        }
    )

    response = client.post(
        "/api/chat", json={"user_id": a_user.id, "message": "what's on"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["suggested_event_ids"] == [e1.id, e2.id, e3.id]
    assert body["onboarding_complete"] is True
    assert "[EVENT:" in body["response"]


def test_chat_filters_out_hallucinated_event_ids(
    client, db_session, a_user, a_location, fake_maxxer
):
    e1, e2 = _seed_events(db_session, a_user, a_location, count=2)

    fake_maxxer.responses.append(
        {
            "text": (
                f"try [EVENT:{e1.id}] then [EVENT:9999] and [EVENT:{e2.id}]"
            ),
            "tool_calls": [],
        }
    )

    response = client.post(
        "/api/chat", json={"user_id": a_user.id, "message": "yo"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["suggested_event_ids"] == [e1.id, e2.id]
    assert "[EVENT:9999]" not in body["response"]


def test_chat_in_stub_mode_works_without_anthropic_key(
    client, db_session, a_user, a_location, monkeypatch
):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    e1, e2, e3 = _seed_events(db_session, a_user, a_location, count=3)

    response = client.post(
        "/api/chat", json={"user_id": a_user.id, "message": "hey"}
    )

    assert response.status_code == 200
    body = response.json()
    # The stub picks the first 3 upcoming events from the system prompt.
    assert set(body["suggested_event_ids"]) <= {e1.id, e2.id, e3.id}
    assert len(body["suggested_event_ids"]) == 3
    assert body["onboarding_complete"] is True


def test_chat_passes_history_to_client(
    client, db_session, a_user, a_location, fake_maxxer
):
    _seed_events(db_session, a_user, a_location, count=1)
    fake_maxxer.responses.append({"text": "ok", "tool_calls": []})

    client.post(
        "/api/chat",
        json={
            "user_id": a_user.id,
            "message": "current",
            "history": [
                {"role": "user", "content": "first"},
                {"role": "assistant", "content": "reply"},
            ],
        },
    )

    sent = fake_maxxer.calls[0]["messages"]
    assert [m["content"] for m in sent] == ["first", "reply", "current"]
    assert [m["role"] for m in sent] == ["user", "assistant", "user"]


def test_onboarding_continues_when_no_tool_call(
    client, a_user, fake_maxxer
):
    fake_maxxer.responses.append(
        {"text": "what brought you to Melbs?", "tool_calls": []}
    )

    response = client.post(
        "/api/chat/onboarding",
        json={"user_id": a_user.id, "message": "hi"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["onboarding_complete"] is False
    assert body["response"] == "what brought you to Melbs?"
    assert body["suggested_event_ids"] == []
    assert body.get("preferences") is None


def test_onboarding_completes_and_saves_preferences_when_tool_called(
    client, db_session, a_user, a_location, fake_maxxer
):
    e1, e2, e3 = _seed_events(db_session, a_user, a_location, count=3)
    prefs = {
        "melbourne_reason": "study",
        "misses_from_home": ["family cooking"],
        "preferred_vibes": ["cooking together"],
        "dietary_needs": [],
        "cultural_considerations": [],
        "area": "Carlton",
        "social_energy": "small intimate groups",
    }
    fake_maxxer.responses.extend(
        [
            # First call: tool use to finish onboarding
            {
                "text": "ok I've got you 🔥",
                "tool_calls": [{"name": "finish_onboarding", "input": prefs}],
            },
            # Second call: 3 grounded event suggestions
            {
                "text": (
                    f"try [EVENT:{e1.id}] [EVENT:{e2.id}] [EVENT:{e3.id}]"
                ),
                "tool_calls": [],
            },
        ]
    )

    response = client.post(
        "/api/chat/onboarding",
        json={"user_id": a_user.id, "message": "small intimate groups"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["onboarding_complete"] is True
    assert body["preferences"] == prefs
    assert body["suggested_event_ids"] == [e1.id, e2.id, e3.id]

    # User row was updated with the extracted preferences.
    db_session.refresh(a_user)
    assert a_user.preferences == prefs


def test_onboarding_preserves_existing_preferences_until_completion(
    client, db_session, a_user, fake_maxxer
):
    a_user.preferences = {"melbourne_reason": "old"}
    db_session.commit()

    fake_maxxer.responses.append(
        {"text": "tell me more", "tool_calls": []}
    )
    client.post(
        "/api/chat/onboarding",
        json={"user_id": a_user.id, "message": "hi"},
    )

    db_session.refresh(a_user)
    assert a_user.preferences == {"melbourne_reason": "old"}
