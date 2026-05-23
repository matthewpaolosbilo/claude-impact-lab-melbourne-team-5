from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Users ----------


class UserCreate(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    bio: Optional[str] = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    bio: Optional[str] = None
    created_at: datetime


class HostSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


# ---------- Locations ----------


class LocationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str


class LocationCreate(BaseModel):
    name: str = Field(min_length=1)
    type: str = Field(min_length=1)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    address: str
    description: str
    photo_url: Optional[str] = None


class LocationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str
    latitude: float
    longitude: float
    address: str
    description: str
    photo_url: Optional[str] = None
    event_count: int = 0
    created_at: datetime


# ---------- Events ----------


class EventCreate(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(default="")
    event_type: str = Field(min_length=1)
    location_id: int
    start_time: datetime
    end_time: datetime
    max_attendees: Optional[int] = None


class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    event_type: str
    start_time: datetime
    end_time: datetime
    host: HostSummary
    location: LocationSummary
    attendee_count: int
    max_attendees: Optional[int] = None
    user_rsvp: Optional[str] = None  # null | "going" | "attended"


# ---------- RSVPs ----------


class RSVPRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    user_id: int
    status: str
    created_at: datetime


class RSVPUpdate(BaseModel):
    status: str = Field(pattern="^(going|attended)$")
