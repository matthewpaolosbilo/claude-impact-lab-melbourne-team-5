"""Maxxer chat endpoints.

POST /api/chat            — ongoing suggestions, returns 3 grounded events.
POST /api/chat/onboarding — conversational onboarding; completes via tool use.

Both are stateless: frontend sends `history` with each request. The MaxxerClient
is injected via `Depends(get_maxxer_client)` so tests swap in a fake.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import Event, RSVP, User
from services.anthropic_client import (
    MaxxerClient,
    MaxxerMessage,
    get_maxxer_client,
)
from services.maxxer import (
    FINISH_ONBOARDING_TOOL,
    build_chat_system_prompt,
    build_onboarding_system_prompt,
    enforce_event_suggestions,
)

router = APIRouter(prefix="/api/chat", tags=["chat"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class HistoryMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    user_id: int
    message: str
    history: list[HistoryMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    response: str
    suggested_event_ids: list[int]
    onboarding_complete: bool = True


class MaxxerPreferences(BaseModel):
    melbourne_reason: str
    misses_from_home: list[str] = Field(default_factory=list)
    preferred_vibes: list[str] = Field(default_factory=list)
    dietary_needs: list[str] = Field(default_factory=list)
    cultural_considerations: list[str] = Field(default_factory=list)
    area: str = "unknown"
    social_energy: str = "open to anything"


class OnboardingChatResponse(ChatResponse):
    onboarding_complete: bool = False
    preferences: Optional[MaxxerPreferences] = None


# ---------------------------------------------------------------------------
# Context-building helpers (all return JSON-safe primitives)
# ---------------------------------------------------------------------------


def _get_user_or_404(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


def _upcoming_events(db: Session, days: int = 14, limit: int = 30) -> list[Event]:
    now = datetime.utcnow()
    horizon = now + timedelta(days=days)
    return (
        db.query(Event)
        .filter(Event.start_time >= now, Event.start_time <= horizon)
        .order_by(Event.start_time)
        .limit(limit)
        .all()
    )


def _serialize_event(event: Event) -> dict:
    location = event.location
    return {
        "id": event.id,
        "title": event.title,
        "event_type": event.event_type,
        "start_time": event.start_time.isoformat() if event.start_time else None,
        "location": {
            "name": location.name if location else None,
            "type": location.type if location else None,
        },
    }


def _past_rsvps(db: Session, user_id: int, limit: int = 5) -> list[dict]:
    rsvps = (
        db.query(RSVP)
        .filter(RSVP.user_id == user_id)
        .order_by(RSVP.created_at.desc())
        .limit(limit)
        .all()
    )
    out: list[dict] = []
    for r in rsvps:
        loc_type = (
            r.event.location.type
            if r.event is not None and r.event.location is not None
            else None
        )
        out.append(
            {
                "event_id": r.event_id,
                "status": r.status,
                "title": r.event.title if r.event is not None else None,
                "location_type": loc_type,
            }
        )
    return out


def _conversation_messages(request: ChatRequest) -> list[MaxxerMessage]:
    messages: list[MaxxerMessage] = [
        {"role": m.role, "content": m.content} for m in request.history
    ]
    messages.append({"role": "user", "content": request.message})
    return messages


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    maxxer: MaxxerClient = Depends(get_maxxer_client),
) -> ChatResponse:
    user = _get_user_or_404(payload.user_id, db)
    events = _upcoming_events(db)
    available_ids = {e.id for e in events}

    system = build_chat_system_prompt(
        events=[_serialize_event(e) for e in events],
        preferences=user.preferences,
        past_rsvps=_past_rsvps(db, user.id),
    )
    completion = maxxer.complete(
        system=system,
        messages=_conversation_messages(payload),
    )

    cleaned, suggested_ids = enforce_event_suggestions(
        completion["text"], available_ids
    )
    return ChatResponse(
        response=cleaned,
        suggested_event_ids=suggested_ids,
        onboarding_complete=True,
    )


ONBOARDING_QUESTION_LIMIT = 5


def _count_user_turns(messages: list[MaxxerMessage]) -> int:
    return sum(1 for m in messages if m["role"] == "user")


@router.post("/onboarding", response_model=OnboardingChatResponse)
def chat_onboarding(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    maxxer: MaxxerClient = Depends(get_maxxer_client),
) -> OnboardingChatResponse:
    user = _get_user_or_404(payload.user_id, db)
    messages = _conversation_messages(payload)

    completion = maxxer.complete(
        system=build_onboarding_system_prompt(),
        messages=messages,
        tools=[FINISH_ONBOARDING_TOOL],
    )

    finish_call = next(
        (
            tc
            for tc in completion["tool_calls"]
            if tc["name"] == "finish_onboarding"
        ),
        None,
    )

    # Safety net: if the user has answered the 5 scripted questions and Claude
    # still hasn't called the tool, force it. Otherwise the conversation drags
    # on and the gate never flips. The forced call discards Claude's text so
    # the frontend transitions straight to the map.
    if finish_call is None and _count_user_turns(messages) >= ONBOARDING_QUESTION_LIMIT:
        forced = maxxer.complete(
            system=build_onboarding_system_prompt(),
            messages=messages,
            tools=[FINISH_ONBOARDING_TOOL],
            tool_choice={"type": "tool", "name": "finish_onboarding"},
        )
        finish_call = next(
            (
                tc
                for tc in forced["tool_calls"]
                if tc["name"] == "finish_onboarding"
            ),
            None,
        )
        if finish_call is not None:
            completion = forced

    if finish_call is None:
        return OnboardingChatResponse(
            response=completion["text"],
            suggested_event_ids=[],
            onboarding_complete=False,
            preferences=None,
        )

    new_prefs = finish_call["input"]
    user.preferences = new_prefs
    db.commit()
    db.refresh(user)

    events = _upcoming_events(db)
    available_ids = {e.id for e in events}
    follow_up = maxxer.complete(
        system=build_chat_system_prompt(
            events=[_serialize_event(e) for e in events],
            preferences=user.preferences,
            past_rsvps=_past_rsvps(db, user.id),
        ),
        messages=messages
        + [{"role": "assistant", "content": completion["text"]}],
    )
    cleaned, suggested_ids = enforce_event_suggestions(
        follow_up["text"], available_ids
    )

    return OnboardingChatResponse(
        response=cleaned or completion["text"],
        suggested_event_ids=suggested_ids,
        onboarding_complete=True,
        preferences=MaxxerPreferences(**new_prefs),
    )
