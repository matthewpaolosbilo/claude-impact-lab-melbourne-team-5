from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Event, Location
from schemas import LocationCreate, LocationRead

router = APIRouter(prefix="/api/locations", tags=["locations"])


def _to_read(loc: Location, event_count: int) -> LocationRead:
    return LocationRead(
        id=loc.id,
        name=loc.name,
        type=loc.type,
        latitude=loc.latitude,
        longitude=loc.longitude,
        address=loc.address,
        description=loc.description,
        photo_url=loc.photo_url,
        event_count=event_count,
        created_at=loc.created_at,
    )


@router.get("", response_model=list[LocationRead])
def list_locations(
    type: Optional[str] = None,
    db: Session = Depends(get_db),
) -> list[LocationRead]:
    now = datetime.utcnow()
    q = (
        db.query(Location, func.count(Event.id).label("event_count"))
        .outerjoin(
            Event,
            (Event.location_id == Location.id) & (Event.start_time >= now),
        )
        .group_by(Location.id)
        .order_by(Location.id)
    )
    if type is not None:
        q = q.filter(Location.type == type)

    return [_to_read(loc, count or 0) for loc, count in q.all()]


@router.post("", response_model=LocationRead, status_code=status.HTTP_201_CREATED)
def create_location(
    payload: LocationCreate,
    db: Session = Depends(get_db),
) -> LocationRead:
    location = Location(**payload.model_dump())
    db.add(location)
    db.commit()
    db.refresh(location)
    return _to_read(location, 0)
