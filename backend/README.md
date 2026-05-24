# spacd — Backend

FastAPI + SQLAlchemy + SQLite API for the spacd demo.

## Quickstart

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
SPACD_SHARE_PASSWORD=demo-password \
SPACD_AUTH_SECRET=local-dev-secret \
.venv/bin/uvicorn main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the live OpenAPI explorer.

Run tests:

```bash
cd backend
.venv/bin/pytest -q
```

## Environment

```text
DATABASE_URL=sqlite:///./community.db
CORS_ORIGINS=http://localhost:5173,https://<your-netlify-site>.netlify.app
ANTHROPIC_API_KEY=sk-ant-...
MAXXER_MODEL=claude-sonnet-4-6
SPACD_SHARE_PASSWORD=<shared demo password>
SPACD_AUTH_SECRET=<long random token signing secret>
```

Required for the shareable hosted demo:

- `SPACD_SHARE_PASSWORD`: the password the team can share with demo users
- `SPACD_AUTH_SECRET`: private token-signing secret; generate with
  `openssl rand -base64 32`

If `ANTHROPIC_API_KEY` is missing, Maxxer uses a deterministic stub and no
Anthropic credits are spent.

## Auth Model

The app uses a lightweight demo auth flow.

`POST /api/users` accepts:

```json
{
  "name": "Priya",
  "password": "shared-demo-password"
}
```

The backend checks the password against `SPACD_SHARE_PASSWORD`, creates or
returns a user, and returns a signed bearer token. The frontend stores that user
and token in `localStorage`.

Maxxer endpoints require:

```text
Authorization: Bearer <token>
```

Event and RSVP write endpoints still use the older `X-User-Id` header. That is
good enough for the hackathon demo, but it is not production auth.

## API Routes

| Route | Method | Auth | Notes |
| --- | --- | --- | --- |
| `/health` | GET | none | `{ok: true}` |
| `/api/users` | POST | shared password | returns user plus bearer token |
| `/api/users/{id}` | GET | none | user profile fields |
| `/api/events` | GET | optional `X-User-Id` | list/filter events |
| `/api/events` | POST | `X-User-Id` | create event |
| `/api/events/{id}` | GET | optional `X-User-Id` | event detail |
| `/api/events/{id}/rsvp` | POST | `X-User-Id` | RSVP to event |
| `/api/rsvps/{id}` | PATCH | `X-User-Id` | update RSVP status |
| `/api/search` | GET | optional `X-User-Id` | keyword/type/date search |
| `/api/locations` | GET/POST | none | third-space locations |
| `/api/users/{id}/badges` | GET | none | badge progress |
| `/api/users/{id}/profile-stats` | GET | none | attended/hosted totals |
| `/api/chat` | POST | bearer token | Maxxer event recommendations |
| `/api/chat/onboarding` | POST | bearer token | three-question onboarding |

## Maxxer

Maxxer is the Claude-powered assistant. The backend:

- builds prompts from upcoming events, saved user preferences, and RSVP history
- asks Claude for exactly three grounded event suggestions
- strips hallucinated `[EVENT:id]` tags before returning responses
- completes onboarding after three user answers, forcing the tool call if needed
- falls back to a local stub when no Anthropic key is configured

Most Maxxer prompt and parsing logic lives in `services/maxxer.py`; the Anthropic
client/stub lives in `services/anthropic_client.py`.

## Seed Data

On startup, `main.py` calls `seed_if_empty()`.

The seed inserts:

- a sample host user
- Melbourne third-space locations
- sample events where matching locations exist

The seed is idempotent, so restarting the server is safe.

## Deploy

`render.yaml` defines the Render web service.

After merging to `main`, Render should auto-deploy. Confirm with:

```bash
curl https://commaxx-api.onrender.com/health
```

Make sure `CORS_ORIGINS` includes the deployed Netlify origin.
