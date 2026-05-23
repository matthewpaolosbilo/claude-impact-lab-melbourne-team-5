# Community Maxxing — Backend

FastAPI + SQLite. Owned by Dev 1 on `feature/backend`. Locations router is Dev 2's
(`feature/gis`); badges router is Dev 4's (`feature/social`). All three branches share
`models.py`, `seed.py`, and `main.py` — see the section at the bottom for the conventions
that keep merges clean.

## Quickstart

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload
```

Open `http://localhost:8000/docs` for the live OpenAPI explorer. The committed
[openapi.json](openapi.json) snapshot lets Dev 2/3/4 stub against the contract without
running the server.

Run the tests:

```bash
.venv/bin/pytest -q
```

## API contract

Base URL in dev: `http://localhost:8000`. Frontend (`feature/frontend-app`) proxies
`/api/*` here via Vite (see `frontend/vite.config.js`).

### Auth: `X-User-Id` header

Protected endpoints expect the integer user id in an `X-User-Id` header. Missing or
unknown ids return `401`. This is the hackathon stand-in for real auth — the frontend
stores `user_id` in `localStorage` after `POST /api/users`.

### Routes

| Route | Method | Auth | Notes |
|---|---|---|---|
| `/health` | GET | none | `{ok: true}` |
| `/api/users` | POST | none | body `{name, email, bio?}`; returns existing user on duplicate email (login-by-email) |
| `/api/users/{id}` | GET | none | 404 if missing |
| `/api/events` | GET | optional | filters `location_id`, `event_type`, `date_from`, `date_to`; `user_rsvp` reflects current user |
| `/api/events` | POST | required | body `{title, description, event_type, location_id, start_time, end_time, max_attendees?}`; host = current user; 400 if `location_id` unknown |
| `/api/events/{id}` | GET | optional | 404 if missing |
| `/api/events/{id}/rsvp` | POST | required | creates RSVP `status="going"`; 409 if already RSVP'd, 404 if event missing |
| `/api/rsvps/{id}` | PATCH | required | body `{status: "going" \| "attended"}`; only attendee or event host may update |
| `/api/search` | GET | optional | filters `q` (title/description LIKE), `type` (location type), `date_from`, `date_to` |

### Response shapes

See [openapi.json](openapi.json) for the full schema. Key shapes:

```jsonc
// EventRead
{
  "id": 1,
  "title": "Saturday Arvo BBQ",
  "description": "BYO everything, we supply the onions",
  "event_type": "social",
  "start_time": "2026-05-30T12:00:00",
  "end_time": "2026-05-30T15:00:00",
  "host": { "id": 1, "name": "Priya" },
  "location": { "id": 1, "name": "Flagstaff Gardens BBQ", "type": "bbq" },
  "attendee_count": 7,
  "max_attendees": 20,
  "user_rsvp": null  // null | "going" | "attended"
}
```

## Environment variables

```
DATABASE_URL=sqlite:///./community.db
CORS_ORIGINS=http://localhost:5173,https://community-maxxing.netlify.app
```

`CORS_ORIGINS` is a comma-separated list. Production value should include the deployed
Netlify domain.

## Seed data

On startup the app calls `seed_if_empty()` which:

1. Inserts a sample host user (`priya@example.com`).
2. Calls `seed_locations(db)` — **stub on this branch.** Dev 2's `feature/gis` fills it
   with the 15 Melbourne locations from STATE.md.
3. Inserts up to 5 sample events (only those whose location is already seeded; the rest
   are silently skipped).

All steps are idempotent — restart the server as many times as you want.

## Shared files (don't break Dev 2 / Dev 4)

- **`models.py`** — User, Event, RSVP scaffolded here. `Location` is a stub matching
  STATE.md's schema so this branch boots in isolation; Dev 2 enriches/replaces.
  New models go **below** the `# --- Add new models below this line ---` marker.
- **`seed.py`** — `seed_locations(db)` is a stub returning `0`. Dev 2 replaces the body.
- **`main.py`** — commented `include_router(locations.router)` / `include_router(badges.router)`
  lines mark where Dev 2 (locations) and Dev 4 (badges) wire in their routers.

## Deploy

`render.yaml` defines a web service on Render's free tier:

```bash
git push -u origin feature/backend
# Open PR; merge to main; Render auto-deploys.
curl https://<service>.onrender.com/health
```
