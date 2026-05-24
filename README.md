# spacd

> Strava for acts of public service — Melbourne MVP.

A civic participation web app that connects students and residents to community
**third spaces** across Melbourne — public BBQs, community garden beds, and shared
kitchens. Find events, RSVP, host your own, earn badges for showing up.

Built in one day by Team 5 at the Claude Impact Lab (Melbourne, May 2026).

---

## Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite — deployed on Render
- **Frontend:** React 19 + Vite 8 + Tailwind v4 + Leaflet (OpenStreetMap) — deployed on Netlify
- **Auth:** name + email only, `user_id` stored in `localStorage`

## Repository layout

```
backend/
├── badge_logic.py        — Dev 4: badge helpers + BADGE_DEFINITIONS
├── database.py           — Dev 1: SQLAlchemy engine + get_db
├── models.py             — Dev 1 (User/Event/RSVP) + Dev 2 (Location)
├── seed.py               — Dev 1 (events) + Dev 2 (locations)
├── main.py               — Dev 1: FastAPI app + CORS + router mounting
├── routers/
│   ├── badges.py         — Dev 4
│   ├── events.py         — Dev 1
│   ├── locations.py      — Dev 2
│   └── users.py          — Dev 1
└── tests/                — Dev 4: badge logic tests w/ in-memory SQLite

frontend/
├── src/
│   ├── api.js            — Dev 3 created, Dev 2 + Dev 4 extend
│   ├── App.jsx           — Dev 3 (router); Dev 4 added `?preview=social` dev preview
│   ├── components/
│   │   ├── BadgeShelf.jsx       — Dev 4
│   │   ├── BadgeUnlockModal.jsx — Dev 4
│   │   ├── AttendeeChips.jsx    — Dev 4
│   │   ├── HostBadge.jsx        — Dev 4
│   │   ├── NotificationFeed.jsx — Dev 4
│   │   ├── ProfilePanel.jsx     — Dev 4
│   │   ├── Toaster.jsx          — Dev 4
│   │   ├── DevSocialPreview.jsx — Dev 4 (dev-only)
│   │   ├── EventCard.jsx        — Dev 3 (Dev 4 drops AttendeeChips + HostBadge in)
│   │   ├── EventModal.jsx       — Dev 3
│   │   ├── MapView.jsx          — Dev 2
│   │   ├── LocationPin.jsx      — Dev 2
│   │   └── SearchBar.jsx        — Dev 2
│   ├── hooks/
│   │   ├── useToast.jsx         — Dev 4
│   │   └── useBadgeWatcher.js   — Dev 4
│   ├── pages/
│   │   ├── Home.jsx             — Dev 3
│   │   └── Profile.jsx          — Dev 4
│   └── utils/
│       ├── badges.js            — Dev 4
│       └── constants.js         — Dev 2
```

## Local setup

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt           # Dev 1 will add this
uvicorn main:app --reload --port 8000
```
Tests:
```bash
cd backend && source .venv/bin/activate
pip install pytest
pytest tests/ -v
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```
Open the Dev 4 preview with mocked data (no backend required):
```
http://localhost:5173/?preview=social
```

## Environment variables

**Backend (Render):**
```
DATABASE_URL=sqlite:///./community.db
CORS_ORIGINS=http://localhost:5173,https://community-maxxing.netlify.app
SPACD_SHARE_PASSWORD=<shared demo password>
SPACD_AUTH_SECRET=<long random token signing secret, optional but recommended>
```

**Frontend (Netlify):**
```
VITE_API_URL=https://commaxx-api.onrender.com
```

## API surface (current)

| Route | Method | Owner | Purpose |
|-------|--------|-------|---------|
| `/api/users` | POST | Dev 1 | Create/login by email |
| `/api/users/{id}` | GET | Dev 1 | Profile fields |
| `/api/users/{id}/badges` | GET | Dev 4 | Earned + available with progress |
| `/api/users/{id}/profile-stats` | GET | Dev 4 | Totals for ProfilePanel |
| `/api/locations` | GET/POST | Dev 2 | Third spaces |
| `/api/events` | GET/POST | Dev 1 | Event list + create |
| `/api/events/{id}` | GET | Dev 1 | Event detail |
| `/api/events/{id}/rsvp` | POST | Dev 1 | RSVP |
| `/api/rsvps/{id}` | PATCH | Dev 1 | Mark attended |
| `/api/search` | GET | Dev 1 | Keyword/type/date search |

See `STATE.md` for full schemas, data models, and remaining task statuses.

## Deploy URLs

- Backend: _TBD — Dev 1 fills in after Render deploy_
- Frontend: _TBD — Dev 3 fills in after Netlify deploy_

## Integration notes for Dev 4 work

- `Profile.jsx` is ready to mount at `/profile`. Dev 3 — add the route to `App.jsx`.
- `AttendeeChips` and `HostBadge` are composable; drop them inside Dev 3's `EventCard.jsx` /
  `EventModal.jsx` like the preview shows.
- After a successful RSVP, call `triggerBadgeCheck()` from `useBadgeWatcher(userId)` to fire
  the unlock toast + modal for any newly-earned badge. Wire `<BadgeUnlockModal>` near the app root.
- Wrap the app in `<ToastProvider>` and render `<Toaster />` once near the root.
- `fetchUserHistory` assumes `GET /api/events?user_id={id}&attended=true` — Dev 1, please
  add that filter or rename; Profile degrades gracefully if it 404s.

## License

Built for the City of Melbourne hackathon — Claude Impact Lab, May 2026.
