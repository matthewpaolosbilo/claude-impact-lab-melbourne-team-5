from datetime import datetime


def test_search_by_q_matches_title_and_description(
    client, db_session, a_user, a_location
):
    from models import Event

    bbq = Event(
        location_id=a_location.id,
        title="Saturday Arvo BBQ",
        description="Snags and salads",
        event_type="social",
        start_time=datetime(2026, 6, 1, 12),
        end_time=datetime(2026, 6, 1, 14),
        host_user_id=a_user.id,
    )
    yarn = Event(
        location_id=a_location.id,
        title="Yarn circle",
        description="Bring stories",
        event_type="culture_country",
        start_time=datetime(2026, 6, 2, 12),
        end_time=datetime(2026, 6, 2, 14),
        host_user_id=a_user.id,
    )
    db_session.add_all([bbq, yarn])
    db_session.commit()

    title_match = client.get("/api/search?q=Arvo")
    assert title_match.status_code == 200
    assert [e["title"] for e in title_match.json()] == ["Saturday Arvo BBQ"]

    desc_match = client.get("/api/search?q=stories")
    assert [e["title"] for e in desc_match.json()] == ["Yarn circle"]


def test_search_filters_by_location_type(
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
        start_time=datetime(2026, 6, 2, 12),
        end_time=datetime(2026, 6, 2, 14),
        host_user_id=a_user.id,
    )
    db_session.add_all([bbq_event, garden_event])
    db_session.commit()

    response = client.get("/api/search?type=garden_bed")
    assert response.status_code == 200
    assert [e["title"] for e in response.json()] == ["Weed Wed"]


def test_search_filters_by_date_range(
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
    middle = Event(
        location_id=a_location.id,
        title="Middle",
        description="",
        event_type="social",
        start_time=datetime(2026, 6, 5, 12),
        end_time=datetime(2026, 6, 5, 14),
        host_user_id=a_user.id,
    )
    late = Event(
        location_id=a_location.id,
        title="Late",
        description="",
        event_type="social",
        start_time=datetime(2026, 6, 10, 12),
        end_time=datetime(2026, 6, 10, 14),
        host_user_id=a_user.id,
    )
    db_session.add_all([early, middle, late])
    db_session.commit()

    response = client.get(
        "/api/search?date_from=2026-06-04T00:00:00&date_to=2026-06-09T00:00:00"
    )
    assert response.status_code == 200
    assert [e["title"] for e in response.json()] == ["Middle"]
