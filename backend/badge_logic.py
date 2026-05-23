"""Badge computation helpers and definitions.

Pure functions over the RSVP / Event / Location tables. Owned by Dev 4.
Models (User, Event, RSVP, Location) are imported from `models` — Dev 1 + Dev 2 own those.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Callable, List, Optional

from sqlalchemy import func, select, distinct
from sqlalchemy.orm import Session

from models import Event, Location, RSVP


ATTENDED = "attended"


def _attended_query(db: Session, user_id: int, location_type: Optional[str] = None):
    q = (
        select(RSVP, Event, Location)
        .join(Event, RSVP.event_id == Event.id)
        .join(Location, Event.location_id == Location.id)
        .where(RSVP.user_id == user_id, RSVP.status == ATTENDED)
    )
    if location_type is not None:
        q = q.where(Location.type == location_type)
    return q


def count_attended(db: Session, user_id: int, location_type: Optional[str] = None) -> int:
    """Number of events the user has attended, optionally filtered by location type."""
    q = (
        select(func.count(RSVP.id))
        .join(Event, RSVP.event_id == Event.id)
        .join(Location, Event.location_id == Location.id)
        .where(RSVP.user_id == user_id, RSVP.status == ATTENDED)
    )
    if location_type is not None:
        q = q.where(Location.type == location_type)
    return int(db.execute(q).scalar() or 0)


def count_hosted(db: Session, user_id: int) -> int:
    """Number of events the user has hosted."""
    q = select(func.count(Event.id)).where(Event.host_user_id == user_id)
    return int(db.execute(q).scalar() or 0)


def count_distinct_types(db: Session, user_id: int) -> int:
    """How many distinct location types the user has attended events at."""
    q = (
        select(func.count(distinct(Location.type)))
        .select_from(RSVP)
        .join(Event, RSVP.event_id == Event.id)
        .join(Location, Event.location_id == Location.id)
        .where(RSVP.user_id == user_id, RSVP.status == ATTENDED)
    )
    return int(db.execute(q).scalar() or 0)


def _iso_week(d: date) -> tuple[int, int]:
    iso = d.isocalendar()
    return (iso[0], iso[1])  # (year, week)


def check_weekly_streak(db: Session, user_id: int, weeks: int = 3) -> bool:
    """True if the user attended at least one event in each of the most recent `weeks` ISO weeks
    leading up to (and including) the user's most recent attended event."""
    q = (
        select(Event.start_time)
        .join(RSVP, RSVP.event_id == Event.id)
        .where(RSVP.user_id == user_id, RSVP.status == ATTENDED)
        .order_by(Event.start_time.desc())
    )
    times = [row[0] for row in db.execute(q).all()]
    if not times:
        return False

    attended_weeks = {_iso_week(t.date() if isinstance(t, datetime) else t) for t in times}
    anchor = times[0].date() if isinstance(times[0], datetime) else times[0]
    for i in range(weeks):
        target = anchor - timedelta(weeks=i)
        if _iso_week(target) not in attended_weeks:
            return False
    return True


def weekly_streak_length(db: Session, user_id: int) -> int:
    """Current consecutive-week streak from the user's most recent attended event backwards."""
    q = (
        select(Event.start_time)
        .join(RSVP, RSVP.event_id == Event.id)
        .where(RSVP.user_id == user_id, RSVP.status == ATTENDED)
        .order_by(Event.start_time.desc())
    )
    times = [row[0] for row in db.execute(q).all()]
    if not times:
        return 0
    attended_weeks = {_iso_week(t.date() if isinstance(t, datetime) else t) for t in times}
    anchor = times[0].date() if isinstance(times[0], datetime) else times[0]
    streak = 0
    while _iso_week(anchor - timedelta(weeks=streak)) in attended_weeks:
        streak += 1
    return streak


def hosted_event_with_min_attendees(db: Session, user_id: int, threshold: int) -> bool:
    """True if the user has hosted any event with `threshold`+ attended RSVPs."""
    return largest_hosted_attendance(db, user_id) >= threshold


def largest_hosted_attendance(db: Session, user_id: int) -> int:
    """Largest attendee count across events this user has hosted (status=attended)."""
    q = (
        select(func.count(RSVP.id))
        .select_from(Event)
        .join(RSVP, RSVP.event_id == Event.id, isouter=True)
        .where(Event.host_user_id == user_id, RSVP.status == ATTENDED)
        .group_by(Event.id)
        .order_by(func.count(RSVP.id).desc())
        .limit(1)
    )
    val = db.execute(q).scalar()
    return int(val or 0)


def latest_qualifying_attendance(db: Session, user_id: int, location_type: Optional[str] = None) -> Optional[date]:
    """Date of the most recent attended event (optionally filtered by location type).
    Used as a simple `earned_at` for MVP — we don't persist badge unlock timestamps yet."""
    q = (
        select(Event.start_time)
        .join(RSVP, RSVP.event_id == Event.id)
        .join(Location, Event.location_id == Location.id)
        .where(RSVP.user_id == user_id, RSVP.status == ATTENDED)
        .order_by(Event.start_time.desc())
        .limit(1)
    )
    if location_type is not None:
        q = q.where(Location.type == location_type)
    val = db.execute(q).scalar()
    if val is None:
        return None
    return val.date() if isinstance(val, datetime) else val


# ---------------------------------------------------------------------------
# Badge definitions
# ---------------------------------------------------------------------------
#
# Each badge has:
#   id          stable string id
#   name        display name
#   icon        emoji
#   description short text describing how to earn it
#   check       fn(db, user_id) -> bool        — earned?
#   progress    fn(db, user_id) -> str         — human-readable progress when locked
#   earned_at   fn(db, user_id) -> date|None   — best-effort timestamp when earned
#

def _progress_attended(location_type: Optional[str], target: int, unit: str):
    def _fn(db: Session, user_id: int) -> str:
        n = count_attended(db, user_id, location_type=location_type)
        return f"{min(n, target)}/{target} {unit}"
    return _fn


def _progress_hosted(target: int):
    def _fn(db: Session, user_id: int) -> str:
        n = count_hosted(db, user_id)
        return f"{min(n, target)}/{target} hosted"
    return _fn


def _progress_streak(target: int):
    def _fn(db: Session, user_id: int) -> str:
        n = weekly_streak_length(db, user_id)
        return f"{min(n, target)}/{target} weeks in a row"
    return _fn


def _progress_types(target: int):
    def _fn(db: Session, user_id: int) -> str:
        n = count_distinct_types(db, user_id)
        return f"{min(n, target)}/{target} space types visited"
    return _fn


def _progress_total(target: int):
    def _fn(db: Session, user_id: int) -> str:
        n = count_attended(db, user_id)
        return f"{min(n, target)}/{target} acts of participation"
    return _fn


def _progress_welcomer(threshold: int):
    def _fn(db: Session, user_id: int) -> str:
        best = largest_hosted_attendance(db, user_id)
        return f"Host an event with {threshold}+ attendees (best so far: {best})"
    return _fn


BADGE_DEFINITIONS: List[dict] = [
    {
        "id": "first_flame",
        "name": "First Flame",
        "icon": "🔥",
        "description": "Attended your first BBQ event",
        "check": lambda db, uid: count_attended(db, uid, location_type="bbq") >= 1,
        "progress": _progress_attended("bbq", 1, "BBQ events"),
        "earned_at": lambda db, uid: latest_qualifying_attendance(db, uid, location_type="bbq"),
    },
    {
        "id": "green_thumb",
        "name": "Green Thumb",
        "icon": "🌱",
        "description": "Attended 3 garden bed sessions",
        "check": lambda db, uid: count_attended(db, uid, location_type="garden_bed") >= 3,
        "progress": _progress_attended("garden_bed", 3, "garden sessions"),
        "earned_at": lambda db, uid: latest_qualifying_attendance(db, uid, location_type="garden_bed"),
    },
    {
        "id": "community_chef",
        "name": "Community Chef",
        "icon": "🍳",
        "description": "Attended 3 community kitchen events",
        "check": lambda db, uid: count_attended(db, uid, location_type="community_kitchen") >= 3,
        "progress": _progress_attended("community_kitchen", 3, "kitchen events"),
        "earned_at": lambda db, uid: latest_qualifying_attendance(db, uid, location_type="community_kitchen"),
    },
    {
        "id": "host_hero",
        "name": "Host Hero",
        "icon": "⭐",
        "description": "Hosted your first event",
        "check": lambda db, uid: count_hosted(db, uid) >= 1,
        "progress": _progress_hosted(1),
        "earned_at": lambda db, uid: None,  # could query earliest hosted event start_time
    },
    {
        "id": "week_streak",
        "name": "Weekly Regular",
        "icon": "📅",
        "description": "Attended events 3 weeks in a row",
        "check": lambda db, uid: check_weekly_streak(db, uid, weeks=3),
        "progress": _progress_streak(3),
        "earned_at": lambda db, uid: latest_qualifying_attendance(db, uid),
    },
    {
        "id": "cross_pollinator",
        "name": "Cross-Pollinator",
        "icon": "🐝",
        "description": "Attended all 3 space types",
        "check": lambda db, uid: count_distinct_types(db, uid) >= 3,
        "progress": _progress_types(3),
        "earned_at": lambda db, uid: latest_qualifying_attendance(db, uid),
    },
    {
        "id": "ten_acts",
        "name": "Community Maxxer",
        "icon": "💪",
        "description": "10 total acts of civic participation",
        "check": lambda db, uid: count_attended(db, uid) >= 10,
        "progress": _progress_total(10),
        "earned_at": lambda db, uid: latest_qualifying_attendance(db, uid),
    },
    {
        "id": "welcomer",
        "name": "Welcomer",
        "icon": "🤗",
        "description": "Hosted an event with 5+ attendees",
        "check": lambda db, uid: hosted_event_with_min_attendees(db, uid, 5),
        "progress": _progress_welcomer(5),
        "earned_at": lambda db, uid: None,
    },
]


def compute_badges(db: Session, user_id: int) -> dict:
    """Return the badge response for a user matching the STATE.md schema:
       { "earned": [...], "available": [...] }
    """
    earned: list[dict] = []
    available: list[dict] = []
    today = date.today()
    for b in BADGE_DEFINITIONS:
        if b["check"](db, user_id):
            earned_on = b["earned_at"](db, user_id) or today
            earned.append({
                "id": b["id"],
                "name": b["name"],
                "icon": b["icon"],
                "description": b["description"],
                "earned_at": earned_on.isoformat(),
            })
        else:
            available.append({
                "id": b["id"],
                "name": b["name"],
                "icon": b["icon"],
                "description": b["description"],
                "progress": b["progress"](db, user_id),
            })
    return {"earned": earned, "available": available}
