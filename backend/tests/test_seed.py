def test_seed_user_creates_sample_user(db_session):
    from models import User
    from seed import seed_user

    user = seed_user(db_session)

    assert user.id is not None
    assert user.email == "priya@example.com"
    assert db_session.query(User).count() == 1


def test_seed_user_is_idempotent(db_session):
    from models import User
    from seed import seed_user

    first = seed_user(db_session)
    second = seed_user(db_session)

    assert first.id == second.id
    assert db_session.query(User).count() == 1


def test_seed_events_skips_when_no_locations(db_session):
    from models import Event
    from seed import seed_events

    inserted = seed_events(db_session)

    assert inserted == 0
    assert db_session.query(Event).count() == 0


def test_seed_events_inserts_when_locations_present(db_session):
    from models import Event, Location
    from seed import SAMPLE_EVENTS, seed_events

    needed_names = {ev["location_name"] for ev in SAMPLE_EVENTS}
    for name in needed_names:
        db_session.add(
            Location(
                name=name,
                type="bbq",
                latitude=0.0,
                longitude=0.0,
                address="x",
                description="x",
            )
        )
    db_session.commit()

    inserted = seed_events(db_session)

    assert inserted == len(SAMPLE_EVENTS)
    assert db_session.query(Event).count() == len(SAMPLE_EVENTS)


def test_seed_if_empty_is_idempotent(db_session):
    from models import Event, Location, User
    from seed import SAMPLE_EVENTS, seed_if_empty

    needed_names = {ev["location_name"] for ev in SAMPLE_EVENTS}
    for name in needed_names:
        db_session.add(
            Location(
                name=name,
                type="bbq",
                latitude=0.0,
                longitude=0.0,
                address="x",
                description="x",
            )
        )
    db_session.commit()

    seed_if_empty(db_session)
    user_count_after_first = db_session.query(User).count()
    event_count_after_first = db_session.query(Event).count()

    seed_if_empty(db_session)

    assert db_session.query(User).count() == user_count_after_first
    assert db_session.query(Event).count() == event_count_after_first
