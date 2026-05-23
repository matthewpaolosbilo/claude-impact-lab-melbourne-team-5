"""Seed Melbourne community spaces. Idempotent — only runs if the
locations table is empty so it's safe to call on every startup."""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from database import SessionLocal
from models import Location, Event, Location, User

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

SEED_LOCATIONS: list[dict] = [
    # BBQs
    {
        "name": "Flagstaff Gardens BBQ",
        "type": "bbq",
        "latitude": -37.8112,
        "longitude": 144.9536,
        "address": "309 William St, West Melbourne",
        "description": "Free electric BBQs in the CBD's oldest park. Great for weekend gatherings.",
    },
    {
        "name": "Princes Park BBQ Area",
        "type": "bbq",
        "latitude": -37.7834,
        "longitude": 144.9612,
        "address": "Princes Park, Carlton North",
        "description": "Sheltered BBQ area near the oval. Popular with student groups.",
    },
    {
        "name": "Yarra Bank Reserve BBQ",
        "type": "bbq",
        "latitude": -37.8185,
        "longitude": 144.9480,
        "address": "Yarra Bank Reserve, Southbank",
        "description": "Riverside BBQs with city views. Walk along Birrarung Marr afterwards.",
    },
    {
        "name": "Royal Park BBQ",
        "type": "bbq",
        "latitude": -37.7810,
        "longitude": 144.9480,
        "address": "Royal Park, Parkville",
        "description": "Large park with scattered BBQ facilities. Near native grassland remnants.",
    },
    {
        "name": "Edinburgh Gardens BBQ",
        "type": "bbq",
        "latitude": -37.7745,
        "longitude": 144.9815,
        "address": "Edinburgh Gardens, North Fitzroy",
        "description": "Community hub. Busy on weekends — arrive early for a BBQ spot.",
    },
    # Garden Beds
    {
        "name": "CERES Community Garden",
        "type": "garden_bed",
        "latitude": -37.7575,
        "longitude": 144.9985,
        "address": "Roberts St & Stewart St, Brunswick East",
        "description": "Permaculture-focused community garden. Shared plots available for newcomers.",
    },
    {
        "name": "Rushall Community Garden",
        "type": "garden_bed",
        "latitude": -37.7713,
        "longitude": 144.9935,
        "address": "Rushall Cres, North Fitzroy",
        "description": "Heritage-listed garden along Merri Creek. Focus on native and edible plants.",
    },
    {
        "name": "Collingwood Children's Farm Garden",
        "type": "garden_bed",
        "latitude": -37.7985,
        "longitude": 145.0010,
        "address": "18 St Heliers St, Abbotsford",
        "description": "Community plots on the Yarra. Volunteer days every Saturday.",
    },
    {
        "name": "Fitzroy Community Garden",
        "type": "garden_bed",
        "latitude": -37.7948,
        "longitude": 144.9782,
        "address": "Cecil St, Fitzroy",
        "description": "Inner-city garden beds. Growing native herbs and seasonal vegetables.",
    },
    {
        "name": "Veg Out Community Garden",
        "type": "garden_bed",
        "latitude": -37.8615,
        "longitude": 144.9668,
        "address": "cnr Shakespeare Gr & Chaucer St, St Kilda",
        "description": "Beachside community garden. Open events and shared harvests.",
    },
    # Community Kitchens
    {
        "name": "FareShare Kitchen",
        "type": "community_kitchen",
        "latitude": -37.7975,
        "longitude": 144.9392,
        "address": "1 Ballarat St, Abbotsford",
        "description": "Volunteer kitchen cooking rescued food into free meals. Shifts available daily.",
    },
    {
        "name": "STREAT Coffee Roasters Kitchen",
        "type": "community_kitchen",
        "latitude": -37.8050,
        "longitude": 144.9600,
        "address": "Cromwell Place, Collingwood",
        "description": "Social enterprise kitchen training young people. Community cooking nights.",
    },
    {
        "name": "The Community Grocer Pop-Up",
        "type": "community_kitchen",
        "latitude": -37.8136,
        "longitude": 144.9631,
        "address": "Queen Victoria Market, Melbourne",
        "description": "Affordable produce market with community cooking demos every weekend.",
    },
    {
        "name": "Carlton Neighbourhood Learning Centre Kitchen",
        "type": "community_kitchen",
        "latitude": -37.7925,
        "longitude": 144.9680,
        "address": "20 Princes St, Carlton",
        "description": "Shared kitchen space. Hosts multicultural cooking sessions weekly.",
    },
    {
        "name": "Asylum Seeker Resource Centre Kitchen",
        "type": "community_kitchen",
        "latitude": -37.8305,
        "longitude": 144.9535,
        "address": "214-218 Nicholson St, Footscray",
        "description": "Community kitchen focused on food security. Volunteers always welcome.",
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
def seed_locations(db: Session) -> int:
    """Insert seed locations if the table is empty. Returns rows inserted."""
    if db.query(Location).count() > 0:
        return 0
    for row in SEED_LOCATIONS:
        db.add(Location(**row))
    db.commit()
    return len(SEED_LOCATIONS)


def run_seed() -> None:
    db = SessionLocal()
    try:
        inserted = seed_locations(db)
        if inserted:
            print(f"[seed] inserted {inserted} locations")
    finally:
        db.close()
