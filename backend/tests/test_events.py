from datetime import datetime


def _post_event_payload(location_id: int, **overrides) -> dict:
    payload = {
        "title": "Saturday Arvo BBQ",
        "description": "BYO everything, we supply the onions",
        "event_type": "social",
        "location_id": location_id,
        "start_time": "2026-05-30T12:00:00",
        "end_time": "2026-05-30T15:00:00",
        "max_attendees": 20,
    }
    payload.update(overrides)
    return payload


def test_list_events_empty(client):
    response = client.get("/api/events")
    assert response.status_code == 200
    assert response.json() == []


def test_list_events_returns_event_with_host_location_attendee_count(
    client, an_event
):
    response = client.get("/api/events")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    event = body[0]
    assert event["id"] == an_event.id
    assert event["title"] == an_event.title
    assert event["event_type"] == an_event.event_type
    assert event["host"]["name"] == "Priya"
    assert event["location"]["name"] == "Flagstaff Gardens BBQ"
    assert event["location"]["type"] == "bbq"
    assert event["attendee_count"] == 0
    assert event["max_attendees"] == 20
    assert event["user_rsvp"] is None


def test_list_events_filter_by_location_id(
    client, db_session, a_user, a_location, a_garden
):
    from models import Event

    bbq_event = Event(
        location_id=a_location.id,
        title="BBQ",
        description="",
        event_type="social",
        start_time=datetime(2026, 6, 1, 12),
        end_time=datetime(2026, 6, 1, 14),
        host_user_id=a_user.id,
    )
    garden_event = Event(
        location_id=a_garden.id,
        title="Weed Wed",
        description="",
        event_type="plant_learn",
        start_time=datetime(2026, 6, 2, 10),
        end_time=datetime(2026, 6, 2, 12),
        host_user_id=a_user.id,
    )
    db_session.add_all([bbq_event, garden_event])
    db_session.commit()

    response = client.get(f"/api/events?location_id={a_garden.id}")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["title"] == "Weed Wed"


def test_list_events_filter_by_event_type_and_date_range(
    client, db_session, a_user, a_location
):
    from models import Event

    early = Event(
        location_id=a_location.id,
        title="Early",
        description="",
        event_type="social",
        start_time=datetime(2026, 6, 1, 12),
        end_time=datetime(2026, 6, 1, 14),
        host_user_id=a_user.id,
    )
    middle_culture = Event(
        location_id=a_location.id,
        title="Culture",
        description="",
        event_type="culture_country",
        start_time=datetime(2026, 6, 5, 12),
        end_time=datetime(2026, 6, 5, 14),
        host_user_id=a_user.id,
    )
    later = Event(
        location_id=a_location.id,
        title="Later",
        description="",
        event_type="social",
        start_time=datetime(2026, 6, 10, 12),
        end_time=datetime(2026, 6, 10, 14),
        host_user_id=a_user.id,
    )
    db_session.add_all([early, middle_culture, later])
    db_session.commit()

    type_response = client.get("/api/events?event_type=culture_country")
    assert [e["title"] for e in type_response.json()] == ["Culture"]

    date_response = client.get(
        "/api/events?date_from=2026-06-04T00:00:00&date_to=2026-06-09T00:00:00"
    )
    assert [e["title"] for e in date_response.json()] == ["Culture"]


def test_list_events_user_rsvp_field_reflects_current_user(
    client, db_session, an_event, a_user, another_user
):
    from models import RSVP

    db_session.add(
        RSVP(event_id=an_event.id, user_id=another_user.id, status="going")
    )
    db_session.commit()

    no_header = client.get("/api/events").json()[0]
    assert no_header["user_rsvp"] is None
    assert no_header["attendee_count"] == 1

    other_view = client.get(
        "/api/events", headers={"X-User-Id": str(another_user.id)}
    ).json()[0]
    assert other_view["user_rsvp"] == "going"

    self_view = client.get(
        "/api/events", headers={"X-User-Id": str(a_user.id)}
    ).json()[0]
    assert self_view["user_rsvp"] is None


def test_post_event_requires_x_user_id_else_401(client, a_location):
    response = client.post(
        "/api/events", json=_post_event_payload(a_location.id)
    )
    assert response.status_code == 401


def test_post_event_sets_host_to_current_user(client, a_user, a_location):
    response = client.post(
        "/api/events",
        json=_post_event_payload(a_location.id),
        headers={"X-User-Id": str(a_user.id)},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["host"]["id"] == a_user.id
    assert body["host"]["name"] == a_user.name
    assert body["location"]["id"] == a_location.id
    assert body["attendee_count"] == 0
    assert body["user_rsvp"] is None


def test_post_event_400_when_location_missing(client, a_user):
    response = client.post(
        "/api/events",
        json=_post_event_payload(location_id=9999),
        headers={"X-User-Id": str(a_user.id)},
    )
    assert response.status_code == 400


def test_get_event_by_id_includes_user_rsvp(
    client, db_session, an_event, a_user
):
    from models import RSVP

    db_session.add(RSVP(event_id=an_event.id, user_id=a_user.id, status="going"))
    db_session.commit()

    response = client.get(
        f"/api/events/{an_event.id}",
        headers={"X-User-Id": str(a_user.id)},
    )

    assert response.status_code == 200
    assert response.json()["user_rsvp"] == "going"


def test_get_event_404(client):
    response = client.get("/api/events/9999")
    assert response.status_code == 404
