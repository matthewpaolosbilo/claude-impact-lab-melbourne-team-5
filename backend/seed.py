"""Seed Melbourne community spaces. Idempotent — only runs if the
locations table is empty so it's safe to call on every startup."""

from sqlalchemy.orm import Session

from database import SessionLocal
from models import Location

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
