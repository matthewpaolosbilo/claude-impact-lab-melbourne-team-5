from datetime import datetime, timedelta


def test_list_empty(client):
    r = client.get("/api/locations")
    assert r.status_code == 200
    assert r.json() == []


def test_list_returns_seeded_locations(client, a_location, a_garden):
    r = client.get("/api/locations")
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 2
    names = {item["name"] for item in items}
    assert "Flagstaff Gardens BBQ" in names
    assert "CERES Community Garden" in names
    first = items[0]
    assert {
        "id",
        "name",
        "type",
        "latitude",
        "longitude",
        "address",
        "description",
        "photo_url",
        "event_count",
        "created_at",
    } <= set(first.keys())


def test_filter_by_type(client, a_location, a_garden):
    r = client.get("/api/locations", params={"type": "bbq"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 1
    assert items[0]["type"] == "bbq"


def test_event_count_only_includes_upcoming(client, db_session, a_user, a_location):
    from models import Event

    now = datetime.utcnow()
    past = Event(
        location_id=a_location.id,
        title="Past event",
        description="",
        event_type="social",
        start_time=now - timedelta(days=2),
        end_time=now - timedelta(days=2, hours=-2),
        host_user_id=a_user.id,
    )
    upcoming = Event(
        location_id=a_location.id,
        title="Upcoming event",
        description="",
        event_type="social",
        start_time=now + timedelta(days=2),
        end_time=now + timedelta(days=2, hours=2),
        host_user_id=a_user.id,
    )
    db_session.add_all([past, upcoming])
    db_session.commit()

    r = client.get("/api/locations")
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 1
    assert items[0]["event_count"] == 1


def test_create_location(client):
    payload = {
        "name": "New Spot",
        "type": "bbq",
        "latitude": -37.8,
        "longitude": 144.96,
        "address": "Somewhere",
        "description": "A new BBQ spot",
    }
    r = client.post("/api/locations", json=payload)
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "New Spot"
    assert body["event_count"] == 0
    assert body["id"] is not None


def test_create_location_rejects_bad_coordinates(client):
    payload = {
        "name": "Bad Spot",
        "type": "bbq",
        "latitude": 999.0,
        "longitude": 144.96,
        "address": "Nowhere",
        "description": "Invalid",
    }
    r = client.post("/api/locations", json=payload)
    assert r.status_code == 422
