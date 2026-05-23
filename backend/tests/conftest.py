import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models  # noqa: F401  registers tables on Base.metadata
from database import Base, get_db
from main import app
from models import Event, Location, RSVP, User


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    # Build TestClient without the `with` block so FastAPI startup events
    # (init_db + seed) don't fire against the production SQLite file.
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def a_user(db_session):
    user = User(name="Priya", email="priya@example.com")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def another_user(db_session):
    user = User(name="Sam", email="sam@example.com")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def a_location(db_session):
    location = Location(
        name="Flagstaff Gardens BBQ",
        type="bbq",
        latitude=-37.8112,
        longitude=144.9536,
        address="309 William St, West Melbourne",
        description="Free electric BBQs.",
    )
    db_session.add(location)
    db_session.commit()
    db_session.refresh(location)
    return location


@pytest.fixture
def a_garden(db_session):
    location = Location(
        name="CERES Community Garden",
        type="garden_bed",
        latitude=-37.7575,
        longitude=144.9985,
        address="Brunswick East",
        description="Permaculture garden.",
    )
    db_session.add(location)
    db_session.commit()
    db_session.refresh(location)
    return location


@pytest.fixture
def fake_maxxer():
    """A scriptable MaxxerClient injected via FastAPI dep override.

    Tests append onto `fake_maxxer.responses` before issuing requests; each call
    pops the next response (or returns an empty stub if the queue is empty).
    Records every call on `fake_maxxer.calls` for assertion.
    """
    from services.anthropic_client import MaxxerClient, get_maxxer_client

    class _Fake(MaxxerClient):
        def __init__(self) -> None:
            self.calls: list[dict] = []
            self.responses: list[dict] = []

        def complete(self, *, system, messages, tools=None):
            self.calls.append(
                {"system": system, "messages": messages, "tools": tools}
            )
            if not self.responses:
                return {"text": "", "tool_calls": []}
            return self.responses.pop(0)

    fake = _Fake()
    app.dependency_overrides[get_maxxer_client] = lambda: fake
    yield fake
    app.dependency_overrides.pop(get_maxxer_client, None)


@pytest.fixture
def an_event(db_session, a_user, a_location):
    from datetime import datetime

    event = Event(
        location_id=a_location.id,
        title="Saturday Arvo BBQ",
        description="BYO everything, we supply the onions",
        event_type="social",
        start_time=datetime(2026, 5, 30, 12, 0, 0),
        end_time=datetime(2026, 5, 30, 15, 0, 0),
        host_user_id=a_user.id,
        max_attendees=20,
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
    return event
