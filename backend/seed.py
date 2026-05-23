"""Seed harness — Dev 1 owns user + sample events. Dev 2 fills `seed_locations`."""

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models import Event, Location, User

SAMPLE_USER = {
    "name": "Priya",
    "email": "priya@example.com",
    "bio": "Hackathon host",
}

# Sample events reference locations by NAME (not id) so this seed works
# regardless of insertion order and is robust to Dev 2's seed running before
# or after ours. Names match STATE.md "Seed Data — Melbourne Locations".
SAMPLE_EVENTS = [
    {
        "location_name": "Flagstaff Gardens BBQ",
        "title": "Saturday Arvo BBQ",
        "description": "BYO everything, we supply the onions",
        "event_type": "social",
        "start_offset_days": 7,
        "duration_hours": 3,
        "max_attendees": 20,
    },
    {
        "location_name": "CERES Community Garden",
        "title": "Weed & Plant Wednesday",
        "description": "Drop in for an hour, learn about permaculture",
        "event_type": "plant_learn",
        "start_offset_days": 4,
        "duration_hours": 2,
        "max_attendees": 15,
    },
    {
        "location_name": "FareShare Kitchen",
        "title": "Friday rescue-cook",
        "description": "Cook rescued produce into free meals",
        "event_type": "cook_share",
        "start_offset_days": 5,
        "duration_hours": 4,
        "max_attendees": 12,
    },
    {
        "location_name": "Edinburgh Gardens BBQ",
        "title": "Sunday park hang",
        "description": "Bring instruments, kids, dogs, snacks",
        "event_type": "social",
        "start_offset_days": 8,
        "duration_hours": 4,
        "max_attendees": None,
    },
    {
        "location_name": "Carlton Neighbourhood Learning Centre Kitchen",
        "title": "Multicultural cooking night",
        "description": "Share a dish from home",
        "event_type": "culture_country",
        "start_offset_days": 11,
        "duration_hours": 3,
        "max_attendees": 16,
    },
]


def seed_user(db: Session) -> User:
    existing = (
        db.query(User).filter(User.email == SAMPLE_USER["email"]).first()
    )
    if existing is not None:
        return existing
    user = User(**SAMPLE_USER)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed_locations(db: Session) -> int:
    """STUB — Dev 2 (feature/gis, task 2.2) replaces this body with the 15-row
    insert from STATE.md "Seed Data". Returns the number of rows inserted.
    On Dev 1's branch this is a no-op; events that depend on locations are
    silently skipped when the table is empty.
    """
    return 0


def seed_events(db: Session) -> int:
    """Insert sample events whose locations exist. Idempotent: only seeds when
    the events table is empty.
    """
    if db.query(Event).count() > 0:
        return 0
    host = seed_user(db)
    locations_by_name = {loc.name: loc for loc in db.query(Location).all()}
    inserted = 0
    now = datetime.now(timezone.utc).replace(microsecond=0, tzinfo=None)
    for ev in SAMPLE_EVENTS:
        loc = locations_by_name.get(ev["location_name"])
        if loc is None:
            continue
        start = now + timedelta(days=ev["start_offset_days"])
        end = start + timedelta(hours=ev["duration_hours"])
        db.add(
            Event(
                location_id=loc.id,
                title=ev["title"],
                description=ev["description"],
                event_type=ev["event_type"],
                start_time=start,
                end_time=end,
                host_user_id=host.id,
                max_attendees=ev["max_attendees"],
            )
        )
        inserted += 1
    db.commit()
    return inserted


def seed_if_empty(db: Session) -> None:
    """Idempotent orchestrator: user -> locations (Dev 2) -> events."""
    seed_user(db)
    seed_locations(db)
    seed_events(db)
