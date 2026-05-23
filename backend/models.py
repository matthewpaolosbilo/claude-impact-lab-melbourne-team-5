from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    bio = Column(String, nullable=True)
    preferences = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    location_id = Column(
        Integer, ForeignKey("locations.id"), nullable=False, index=True
    )
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    event_type = Column(String, nullable=False, index=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    host_user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    max_attendees = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    host = relationship("User", foreign_keys=[host_user_id])
    location = relationship("Location", foreign_keys=[location_id])
    rsvps = relationship("RSVP", back_populates="event", cascade="all, delete-orphan")


class RSVP(Base):
    __tablename__ = "rsvps"
    __table_args__ = (
        UniqueConstraint("event_id", "user_id", name="uq_rsvp_event_user"),
    )

    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String, nullable=False, default="going")
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    event = relationship("Event", back_populates="rsvps")
    user = relationship("User", foreign_keys=[user_id])


# --- Add new models below this line ---


# Dev 2 (feature/gis, task 2.1) — Location is your model. Scaffolded here with
# the STATE.md "Data Models" schema so Event's FK + nested EventRead.location work
# on Dev 1's branch in isolation. Enrich (indexes, validators) or replace as needed;
# keep `__tablename__ = "locations"` and the columns referenced by EventRead.
class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    description = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
