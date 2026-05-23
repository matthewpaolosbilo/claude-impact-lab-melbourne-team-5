from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user, get_current_user_optional
from models import Event, Location, RSVP, User
from schemas import (
    EventCreate,
    EventRead,
    HostSummary,
    LocationSummary,
    RSVPRead,
    RSVPUpdate,
)

router = APIRouter(prefix="/api/events", tags=["events"])
rsvps_router = APIRouter(prefix="/api/rsvps", tags=["rsvps"])
search_router = APIRouter(prefix="/api/search", tags=["search"])


def _to_event_read(
    event: Event, db: Session, current_user: Optional[User]
) -> EventRead:
    attendee_count = (
        db.query(RSVP).filter(RSVP.event_id == event.id).count()
    )
    user_rsvp: Optional[str] = None
    if current_user is not None:
        rsvp = (
            db.query(RSVP)
            .filter(RSVP.event_id == event.id, RSVP.user_id == current_user.id)
            .first()
        )
        if rsvp is not None:
            user_rsvp = rsvp.status
    return EventRead(
        id=event.id,
        title=event.title,
        description=event.description,
        event_type=event.event_type,
        start_time=event.start_time,
        end_time=event.end_time,
        host=HostSummary.model_validate(event.host),
        location=LocationSummary.model_validate(event.location),
        attendee_count=attendee_count,
        max_attendees=event.max_attendees,
        user_rsvp=user_rsvp,
    )


@router.get("", response_model=list[EventRead])
def list_events(
    location_id: Optional[int] = None,
    event_type: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    user_id: Optional[int] = None,
    attended: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query(Event)
    if location_id is not None:
        query = query.filter(Event.location_id == location_id)
    if event_type is not None:
        query = query.filter(Event.event_type == event_type)
    if date_from is not None:
        query = query.filter(Event.start_time >= date_from)
    if date_to is not None:
        query = query.filter(Event.start_time <= date_to)
    if user_id is not None:
        query = query.join(RSVP, RSVP.event_id == Event.id).filter(
            RSVP.user_id == user_id
        )
        if attended:
            query = query.filter(RSVP.status == "attended")
    events = query.order_by(Event.start_time).all()
    return [_to_event_read(e, db, current_user) for e in events]


@router.post("", response_model=EventRead)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    location = (
        db.query(Location).filter(Location.id == payload.location_id).first()
    )
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown location_id",
        )
    event = Event(
        location_id=payload.location_id,
        title=payload.title,
        description=payload.description,
        event_type=payload.event_type,
        start_time=payload.start_time,
        end_time=payload.end_time,
        host_user_id=current_user.id,
        max_attendees=payload.max_attendees,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return _to_event_read(event, db, current_user)


@router.get("/{event_id}", response_model=EventRead)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )
    return _to_event_read(event, db, current_user)


@router.post("/{event_id}/rsvp", response_model=RSVPRead)
def create_rsvp(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )
    existing = (
        db.query(RSVP)
        .filter(RSVP.event_id == event_id, RSVP.user_id == current_user.id)
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already RSVP'd to this event",
        )
    rsvp = RSVP(event_id=event_id, user_id=current_user.id, status="going")
    db.add(rsvp)
    db.commit()
    db.refresh(rsvp)
    return rsvp


@rsvps_router.patch("/{rsvp_id}", response_model=RSVPRead)
def update_rsvp(
    rsvp_id: int,
    payload: RSVPUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rsvp = db.query(RSVP).filter(RSVP.id == rsvp_id).first()
    if rsvp is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="RSVP not found"
        )
    event = db.query(Event).filter(Event.id == rsvp.event_id).first()
    is_attendee = rsvp.user_id == current_user.id
    is_host = event is not None and event.host_user_id == current_user.id
    if not (is_attendee or is_host):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the attendee or event host can update this RSVP",
        )
    rsvp.status = payload.status
    db.commit()
    db.refresh(rsvp)
    return rsvp


@search_router.get("", response_model=list[EventRead])
def search_events(
    q: Optional[str] = None,
    type: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query(Event)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (Event.title.ilike(like)) | (Event.description.ilike(like))
        )
    if type:
        query = query.join(Location, Event.location_id == Location.id).filter(
            Location.type == type
        )
    if date_from is not None:
        query = query.filter(Event.start_time >= date_from)
    if date_to is not None:
        query = query.filter(Event.start_time <= date_to)
    events = query.order_by(Event.start_time).all()
    return [_to_event_read(e, db, current_user) for e in events]
