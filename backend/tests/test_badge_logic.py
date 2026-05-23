"""Tests for badge computation. Uses Dev 1's conftest fixtures (db_session, a_user, etc.)."""
from datetime import datetime, timedelta

from badge_logic import (
    BADGE_DEFINITIONS,
    check_weekly_streak,
    compute_badges,
    count_attended,
    count_distinct_types,
    count_hosted,
    hosted_event_with_min_attendees,
    largest_hosted_attendance,
)
from models import Event, Location, RSVP, User


# ---------- helpers ----------

def _ids(badge_list):
    return {b["id"] for b in badge_list}


def _user(db, name, email=None):
    u = User(name=name, email=email or f"{name.lower()}@example.com")
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def _location(db, name, ltype):
    loc = Location(
        name=name,
        type=ltype,
        latitude=-37.81,
        longitude=144.96,
        address="test",
        description="test",
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


def _event(db, *, host, location, start, end=None, title="evt"):
    ev = Event(
        location_id=location.id,
        title=title,
        description="",
        event_type="social",
        start_time=start,
        end_time=end or start,
        host_user_id=host.id,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


def _attend(db, user, event, status="attended"):
    r = RSVP(event_id=event.id, user_id=user.id, status=status)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


# ---------- tests ----------

def test_no_activity_no_badges(db_session, a_user):
    result = compute_badges(db_session, a_user.id)
    assert result["earned"] == []
    assert len(result["available"]) == len(BADGE_DEFINITIONS)
    assert all(isinstance(b["progress"], str) for b in result["available"])


def test_first_flame_after_one_bbq(db_session, a_user, another_user, a_location):
    ev = _event(db_session, host=another_user, location=a_location, start=datetime(2026, 5, 1, 12, 0))
    _attend(db_session, a_user, ev)
    earned = _ids(compute_badges(db_session, a_user.id)["earned"])
    assert "first_flame" in earned
    assert "green_thumb" not in earned


def test_going_doesnt_earn(db_session, a_user, another_user, a_location):
    ev = _event(db_session, host=another_user, location=a_location, start=datetime(2026, 5, 1, 12, 0))
    _attend(db_session, a_user, ev, status="going")
    assert count_attended(db_session, a_user.id) == 0
    earned = _ids(compute_badges(db_session, a_user.id)["earned"])
    assert "first_flame" not in earned


def test_green_thumb_needs_three(db_session, a_user, another_user, a_garden):
    for i in range(2):
        ev = _event(db_session, host=another_user, location=a_garden, start=datetime(2026, 4, i + 1, 10, 0))
        _attend(db_session, a_user, ev)
    assert "green_thumb" not in _ids(compute_badges(db_session, a_user.id)["earned"])
    ev3 = _event(db_session, host=another_user, location=a_garden, start=datetime(2026, 4, 3, 10, 0))
    _attend(db_session, a_user, ev3)
    assert "green_thumb" in _ids(compute_badges(db_session, a_user.id)["earned"])


def test_host_hero(db_session, a_user, a_location):
    _event(db_session, host=a_user, location=a_location, start=datetime(2026, 5, 5, 9, 0))
    assert count_hosted(db_session, a_user.id) == 1
    assert "host_hero" in _ids(compute_badges(db_session, a_user.id)["earned"])


def test_cross_pollinator(db_session, a_user, another_user):
    for ltype, name in [("bbq", "BBQ A"), ("garden_bed", "Garden A"), ("community_kitchen", "Kitchen A")]:
        loc = _location(db_session, name, ltype)
        ev = _event(db_session, host=another_user, location=loc, start=datetime(2026, 5, 1, 12, 0))
        _attend(db_session, a_user, ev)
    assert count_distinct_types(db_session, a_user.id) == 3
    assert "cross_pollinator" in _ids(compute_badges(db_session, a_user.id)["earned"])


def test_ten_acts(db_session, a_user, another_user, a_location):
    for i in range(10):
        ev = _event(db_session, host=another_user, location=a_location, start=datetime(2026, 5, 1, 12, 0) + timedelta(days=i))
        _attend(db_session, a_user, ev)
    assert "ten_acts" in _ids(compute_badges(db_session, a_user.id)["earned"])


def test_welcomer_needs_5_attended(db_session, a_user, a_location):
    ev = _event(db_session, host=a_user, location=a_location, start=datetime(2026, 5, 1, 12, 0))
    for i in range(4):
        g = _user(db_session, f"guest{i}")
        _attend(db_session, g, ev)
    assert not hosted_event_with_min_attendees(db_session, a_user.id, 5)

    g5 = _user(db_session, "guest5")
    _attend(db_session, g5, ev)
    assert hosted_event_with_min_attendees(db_session, a_user.id, 5)
    assert largest_hosted_attendance(db_session, a_user.id) == 5
    assert "welcomer" in _ids(compute_badges(db_session, a_user.id)["earned"])


def test_weekly_streak_three_weeks(db_session, a_user, another_user, a_location):
    base = datetime(2026, 5, 4, 12, 0)
    for delta in [0, 7, 14]:
        ev = _event(db_session, host=another_user, location=a_location, start=base + timedelta(days=delta))
        _attend(db_session, a_user, ev)
    assert check_weekly_streak(db_session, a_user.id, weeks=3)
    assert "week_streak" in _ids(compute_badges(db_session, a_user.id)["earned"])


def test_weekly_streak_broken_by_gap(db_session, a_user, another_user, a_location):
    base = datetime(2026, 5, 4, 12, 0)
    for delta in [0, 14]:
        ev = _event(db_session, host=another_user, location=a_location, start=base + timedelta(days=delta))
        _attend(db_session, a_user, ev)
    assert not check_weekly_streak(db_session, a_user.id, weeks=3)


def test_progress_strings_present_for_locked(db_session, a_user, another_user, a_garden):
    ev = _event(db_session, host=another_user, location=a_garden, start=datetime(2026, 5, 1, 12, 0))
    _attend(db_session, a_user, ev)
    result = compute_badges(db_session, a_user.id)
    for badge in result["available"]:
        assert badge["progress"], f"missing progress for {badge['id']}"
    gt = next(b for b in result["available"] if b["id"] == "green_thumb")
    assert "1/3" in gt["progress"]


def test_earned_response_shape_matches_state_md(db_session, a_user, another_user, a_location):
    ev = _event(db_session, host=another_user, location=a_location, start=datetime(2026, 5, 1, 12, 0))
    _attend(db_session, a_user, ev)
    result = compute_badges(db_session, a_user.id)
    assert set(result.keys()) == {"earned", "available"}
    for b in result["earned"]:
        assert set(b.keys()) == {"id", "name", "icon", "description", "earned_at"}
    for b in result["available"]:
        assert set(b.keys()) == {"id", "name", "icon", "description", "progress"}
