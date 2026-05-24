# spacd

> Community connection for international students.

spacd is a Melbourne civic participation prototype that helps students and
residents find low-pressure community events at public BBQs, community gardens,
and shared kitchens. People can sign in with a shared demo password, complete a
short Maxxer onboarding chat, browse a Mapbox map of third spaces, RSVP to
events, and collect badges for showing up.

Built in one day by Team 5 at Claude Impact Lab Melbourne, then lightly polished
after the hackathon so it can be shared with friends and colleagues.

## Demo Flow

1. Open the app.
2. Sign in with your name and the shared demo password.
3. Answer Maxxer's three onboarding questions.
4. Review Maxxer's suggested events in the default-open sidebar.
5. Browse the map, open event cards, RSVP, and check the profile/badges page.

The pitch deck is served as a static asset at `/assets/spaced-deck.html` and is
linked from the header and login modal.

## Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite, deployed on Render
- **Frontend:** React 19 + Vite 8 + Tailwind v4 + Mapbox GL, deployed on Netlify
- **AI:** Anthropic Claude via backend-only Maxxer chat endpoints
- **Auth:** shared-password demo login; Maxxer endpoints require a signed bearer token

## Repository Layout

```text
backend/
  auth.py                 shared-password + signed token helpers
  badge_logic.py          badge computation helpers
  database.py             SQLAlchemy engine/session setup
  main.py                 FastAPI app, CORS, router mounting, seed startup
  models.py               User, Event, RSVP, Location models
  routers/                users, events, locations, badges, chat
  services/               Anthropic client + Maxxer prompt/parsing logic
  tests/                  pytest coverage for API and Maxxer behavior

frontend/
  public/assets/          static pitch deck and other public assets
  src/api.js              frontend API helpers
  src/components/         map, events, auth, chat, profile, badge UI
  src/hooks/              user, toast, badge watcher, Maxxer chat hooks
  src/pages/              Home and Profile routes
  src/utils/              constants, mocks, parsing, data hooks
```

Longer hackathon handoff notes live in `STATE.md` and `docs/`. They are useful
for archaeology, but the READMEs are the current setup reference.

## Local Setup

### Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
SPACD_SHARE_PASSWORD=demo-password \
SPACD_AUTH_SECRET=local-dev-secret \
.venv/bin/uvicorn main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the FastAPI docs.

Backend tests:

```bash
cd backend
.venv/bin/pytest -q
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Frontend checks:

```bash
cd frontend
npm run build
npm run test
```

## Environment Variables

### Backend

```text
DATABASE_URL=sqlite:///./community.db
CORS_ORIGINS=http://localhost:5173,https://<your-netlify-site>.netlify.app
ANTHROPIC_API_KEY=sk-ant-...
SPACD_SHARE_PASSWORD=<shared demo password>
SPACD_AUTH_SECRET=<long random token signing secret>
```

`SPACD_SHARE_PASSWORD` is the human-shared demo password. `SPACD_AUTH_SECRET`
should be a private random string, for example `openssl rand -base64 32`.

If `ANTHROPIC_API_KEY` is not set, the backend falls back to a deterministic
stub so the UI remains demoable without spending credits.

### Frontend

```text
VITE_API_URL=https://commaxx-api.onrender.com
VITE_MAPBOX_TOKEN=pk...
```

For local development, `frontend/vite.config.js` proxies `/api` to
`http://localhost:8000`.

## API Surface

| Route | Method | Purpose |
| --- | --- | --- |
| `/health` | GET | backend health check |
| `/api/users` | POST | shared-password login; returns user + bearer token |
| `/api/users/{id}` | GET | user profile fields |
| `/api/users/{id}/badges` | GET | earned + available badges |
| `/api/users/{id}/profile-stats` | GET | profile totals |
| `/api/locations` | GET/POST | third-space locations |
| `/api/events` | GET/POST | event list + create |
| `/api/events/{id}` | GET | event detail |
| `/api/events/{id}/rsvp` | POST | RSVP |
| `/api/rsvps/{id}` | PATCH | mark RSVP attended/going |
| `/api/search` | GET | keyword/type/date search |
| `/api/chat` | POST | Maxxer event suggestions; requires bearer token |
| `/api/chat/onboarding` | POST | three-question Maxxer onboarding; requires bearer token |

## Deployment Notes

- Backend deploys from `backend/render.yaml`.
- Frontend deploys from `frontend/netlify.toml`; set Netlify's base directory to
  `frontend`.
- Add the deployed Netlify origin to `CORS_ORIGINS` on Render.
- The pitch deck is copied by Vite from `frontend/public/assets` and should be
  reachable at `/assets/spaced-deck.html` on the deployed frontend.

## Known Demo Constraints

- Auth is intentionally lightweight and built for a shareable demo, not a
  production account system.
- Event creation is still optimistic/local in parts of the frontend.
- SQLite is fine for this prototype but not the long-term database choice.
- Full Maxxer usage spends Anthropic credits when `ANTHROPIC_API_KEY` is set.

## License

Built for Claude Impact Lab Melbourne, May 2026.
