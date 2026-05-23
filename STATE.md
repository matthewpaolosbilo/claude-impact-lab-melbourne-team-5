# STATE.md — Community Maxxing
## Strava for Acts of Public Service — Melbourne MVP

> **Claude Code handoff file.** Three developers, one day, one app.
> Each developer: read this file, find your workstream, build it, update your status.

---

## PROJECT CONTEXT

Community Maxxing is a civic participation platform for the City of Melbourne. It connects international students (and all residents) to community third spaces — barbecues, garden beds, and community kitchens — hosted in public parks and underutilised office spaces. Users discover and create events at these spaces, earn badges for participation, and build a visible civic profile.

### Core User Stories (from real student interviews)
- "I need to find cheaper groceries and free community meals"
- "I'm away from family — I need recurring, low-key places to just be around people"
- "Church was my connection point — I need that unconditional welcome somewhere"
- "I want to contribute but I don't know where or how"

### What We're Building Today
A lightweight web app with:
1. **Map interface** showing community BBQs, garden beds, and community kitchens across Melbourne
2. **Event discovery and creation** — users search for and add events at these locations
3. **Badges and rewards** for participation (attendance, hosting, streaks)
4. **FastAPI backend** + **React frontend**
5. **Deploy:** backend on Render, frontend on Netlify

---

## ARCHITECTURE

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│  FRONTEND (Netlify)         │     │  BACKEND (Render)            │
│                             │     │                              │
│  React + Vite               │────▶│  FastAPI + SQLite            │
│  Leaflet map (OpenStreetMap)│     │                              │
│  Tailwind CSS               │     │  /api/locations   GET/POST   │
│                             │     │  /api/events      GET/POST   │
│  Pages:                     │     │  /api/events/{id}/rsvp POST  │
│  - Map (home)               │     │  /api/users/{id}/badges GET  │
│  - Event detail             │     │  /api/users       POST       │
│  - Profile + badges         │     │  /api/search      GET        │
│                             │     │                              │
└─────────────────────────────┘     └──────────────────────────────┘
```

### Tech Decisions (locked, don't revisit)
- **Map:** Leaflet + OpenStreetMap (free, no API key)
- **DB:** SQLite via SQLAlchemy (good enough for MVP, zero config on Render)
- **Auth:** Simplified — name + email, no OAuth today. Store a user_id in localStorage.
- **Badges:** Computed server-side on badge check endpoint, not event-driven
- **Icons:** Lucide React for UI, custom SVG markers for map pins

---

## REPO STRUCTURE

```
community-maxxing/
├── STATE.md                  ← you are here
├── backend/
│   ├── main.py               ← FastAPI app, CORS, mount routes
│   ├── models.py             ← SQLAlchemy models
│   ├── database.py           ← engine, session, init_db
│   ├── seed.py               ← seed Melbourne locations + sample events
│   ├── routers/
│   │   ├── locations.py      ← CRUD for third spaces
│   │   ├── events.py         ← CRUD for events, RSVP, attendance
│   │   ├── users.py          ← user creation, profile
│   │   └── badges.py         ← badge definitions + computation
│   ├── requirements.txt
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api.js            ← axios instance, base URL config
│   │   ├── components/
│   │   │   ├── MapView.jsx       ← Leaflet map with markers
│   │   │   ├── LocationPin.jsx   ← custom marker per type
│   │   │   ├── EventCard.jsx     ← event summary card
│   │   │   ├── EventModal.jsx    ← create/view event
│   │   │   ├── SearchBar.jsx     ← search events by keyword/type
│   │   │   ├── BadgeShelf.jsx    ← display earned badges
│   │   │   └── ProfilePanel.jsx  ← user profile + stats
│   │   ├── pages/
│   │   │   ├── Home.jsx          ← map + search + event list
│   │   │   └── Profile.jsx       ← badges + history
│   │   └── utils/
│   │       ├── badges.js         ← badge definitions (display only)
│   │       └── constants.js      ← location types, colors, etc.
│   ├── public/
│   │   └── markers/              ← SVG pin icons (bbq, garden, kitchen)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── netlify.toml
│   └── index.html
└── README.md
```

---

## DATA MODELS

### Location (a third space)
```python
class Location(Base):
    __tablename__ = "locations"
    id: int                   # PK
    name: str                 # "Flagstaff Gardens BBQ Area"
    type: str                 # "bbq" | "garden_bed" | "community_kitchen"
    latitude: float
    longitude: float
    address: str
    description: str          # what's here, what to expect
    photo_url: str | None     # optional
    created_at: datetime
```

### Event
```python
class Event(Base):
    __tablename__ = "events"
    id: int                   # PK
    location_id: int          # FK → Location
    title: str                # "Saturday Arvo BBQ — BYO everything"
    description: str
    event_type: str           # "cook_share" | "plant_learn" | "fix_flow" | "social" | "culture_country"
    start_time: datetime
    end_time: datetime
    host_user_id: int         # FK → User
    max_attendees: int | None
    created_at: datetime
```

### User
```python
class User(Base):
    __tablename__ = "users"
    id: int                   # PK
    name: str
    email: str                # unique
    bio: str | None
    created_at: datetime
```

### RSVP
```python
class RSVP(Base):
    __tablename__ = "rsvps"
    id: int                   # PK
    event_id: int             # FK → Event
    user_id: int              # FK → User
    status: str               # "going" | "attended"
    created_at: datetime
```

### Badge (not a DB table — computed)
```python
BADGE_DEFINITIONS = [
    {
        "id": "first_flame",
        "name": "First Flame",
        "description": "Attended your first BBQ event",
        "icon": "🔥",
        "check": lambda user_id: count_attended(user_id, location_type="bbq") >= 1
    },
    {
        "id": "green_thumb",
        "name": "Green Thumb",
        "description": "Attended 3 garden bed sessions",
        "icon": "🌱",
        "check": lambda user_id: count_attended(user_id, location_type="garden_bed") >= 3
    },
    {
        "id": "community_chef",
        "name": "Community Chef",
        "description": "Attended 3 community kitchen events",
        "icon": "🍳",
        "check": lambda user_id: count_attended(user_id, location_type="community_kitchen") >= 3
    },
    {
        "id": "host_hero",
        "name": "Host Hero",
        "description": "Hosted your first event",
        "icon": "⭐",
        "check": lambda user_id: count_hosted(user_id) >= 1
    },
    {
        "id": "week_streak",
        "name": "Weekly Regular",
        "description": "Attended events 3 weeks in a row",
        "icon": "📅",
        "check": lambda user_id: check_weekly_streak(user_id, weeks=3)
    },
    {
        "id": "cross_pollinator",
        "name": "Cross-Pollinator",
        "description": "Attended all 3 space types",
        "icon": "🐝",
        "check": lambda user_id: count_distinct_types(user_id) >= 3
    },
    {
        "id": "ten_acts",
        "name": "Community Maxxer",
        "description": "10 total acts of civic participation",
        "icon": "💪",
        "check": lambda user_id: count_attended(user_id) >= 10
    },
    {
        "id": "welcomer",
        "name": "Welcomer",
        "description": "Hosted an event with 5+ attendees",
        "icon": "🤗",
        "check": lambda user_id: hosted_event_with_min_attendees(user_id, 5)
    },
]
```

---

## SEED DATA — Melbourne Locations

```python
SEED_LOCATIONS = [
    # BBQs
    {"name": "Flagstaff Gardens BBQ", "type": "bbq", "lat": -37.8112, "lng": 144.9536,
     "address": "309 William St, West Melbourne", "description": "Free electric BBQs in the CBD's oldest park. Great for weekend gatherings."},
    {"name": "Princes Park BBQ Area", "type": "bbq", "lat": -37.7834, "lng": 144.9612,
     "address": "Princes Park, Carlton North", "description": "Sheltered BBQ area near the oval. Popular with student groups."},
    {"name": "Yarra Bank Reserve BBQ", "type": "bbq", "lat": -37.8185, "lng": 144.9480,
     "address": "Yarra Bank Reserve, Southbank", "description": "Riverside BBQs with city views. Walk along Birrarung Marr afterwards."},
    {"name": "Royal Park BBQ", "type": "bbq", "lat": -37.7810, "lng": 144.9480,
     "address": "Royal Park, Parkville", "description": "Large park with scattered BBQ facilities. Near native grassland remnants."},
    {"name": "Edinburgh Gardens BBQ", "type": "bbq", "lat": -37.7745, "lng": 144.9815,
     "address": "Edinburgh Gardens, North Fitzroy", "description": "Community hub. Busy on weekends — arrive early for a BBQ spot."},

    # Garden Beds
    {"name": "CERES Community Garden", "type": "garden_bed", "lat": -37.7575, "lng": 144.9985,
     "address": "Roberts St & Stewart St, Brunswick East", "description": "Permaculture-focused community garden. Shared plots available for newcomers."},
    {"name": "Rushall Community Garden", "type": "garden_bed", "lat": -37.7713, "lng": 144.9935,
     "address": "Rushall Cres, North Fitzroy", "description": "Heritage-listed garden along Merri Creek. Focus on native and edible plants."},
    {"name": "Collingwood Children's Farm Garden", "type": "garden_bed", "lat": -37.7985, "lng": 145.0010,
     "address": "18 St Heliers St, Abbotsford", "description": "Community plots on the Yarra. Volunteer days every Saturday."},
    {"name": "Fitzroy Community Garden", "type": "garden_bed", "lat": -37.7948, "lng": 144.9782,
     "address": "Cecil St, Fitzroy", "description": "Inner-city garden beds. Growing native herbs and seasonal vegetables."},
    {"name": "Veg Out Community Garden", "type": "garden_bed", "lat": -37.8615, "lng": 144.9668,
     "address": "cnr Shakespeare Gr & Chaucer St, St Kilda", "description": "Beachside community garden. Open events and shared harvests."},

    # Community Kitchens
    {"name": "FareShare Kitchen", "type": "community_kitchen", "lat": -37.7975, "lng": 144.9392,
     "address": "1 Ballarat St, Abbotsford", "description": "Volunteer kitchen cooking rescued food into free meals. Shifts available daily."},
    {"name": "STREAT Coffee Roasters Kitchen", "type": "community_kitchen", "lat": -37.8050, "lng": 144.9600,
     "address": "Cromwell Place, Collingwood", "description": "Social enterprise kitchen training young people. Community cooking nights."},
    {"name": "The Community Grocer Pop-Up", "type": "community_kitchen", "lat": -37.8136, "lng": 144.9631,
     "address": "Queen Victoria Market, Melbourne", "description": "Affordable produce market with community cooking demos every weekend."},
    {"name": "Carlton Neighbourhood Learning Centre Kitchen", "type": "community_kitchen", "lat": -37.7925, "lng": 144.9680,
     "address": "20 Princes St, Carlton", "description": "Shared kitchen space. Hosts multicultural cooking sessions weekly."},
    {"name": "Asylum Seeker Resource Centre Kitchen", "type": "community_kitchen", "lat": -37.8305, "lng": 144.9535,
     "address": "214-218 Nicholson St, Footscray", "description": "Community kitchen focused on food security. Volunteers always welcome."},
]
```

---

## WORKSTREAMS

### DEV 1 — Backend (FastAPI + DB + Seed + Deploy)
**Branch:** `feature/backend`

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Init `backend/` with `requirements.txt` (fastapi, uvicorn, sqlalchemy, pydantic) | ⬜ TODO | |
| 1.2 | `database.py` — SQLite engine, sessionmaker, `init_db()` | ⬜ TODO | DB file: `community.db` |
| 1.3 | `models.py` — Location, Event, User, RSVP (see Data Models above) | ⬜ TODO | |
| 1.4 | `seed.py` — insert all 15 seed locations + 5 sample events | ⬜ TODO | Run on startup if DB empty |
| 1.5 | `routers/locations.py` — `GET /api/locations` (list all, filter by type), `POST /api/locations` | ⬜ TODO | |
| 1.6 | `routers/events.py` — `GET /api/events` (list, filter by location/type/date), `POST /api/events`, `GET /api/events/{id}` | ⬜ TODO | Include location data in response |
| 1.7 | `routers/events.py` — `POST /api/events/{id}/rsvp`, `PATCH /api/rsvps/{id}` (mark attended) | ⬜ TODO | |
| 1.8 | `routers/users.py` — `POST /api/users` (create/login by email), `GET /api/users/{id}` | ⬜ TODO | Return existing user if email exists |
| 1.9 | `routers/badges.py` — `GET /api/users/{id}/badges` (compute and return earned badges) | ⬜ TODO | See badge definitions above |
| 1.10 | `routers/events.py` — `GET /api/search?q=...&type=...&date=...` | ⬜ TODO | Search events by keyword, type, date range |
| 1.11 | `main.py` — mount routers, CORS (allow Netlify domain + localhost), call seed on startup | ⬜ TODO | |
| 1.12 | `render.yaml` — web service config, build command `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT` | ⬜ TODO | |
| 1.13 | Test all endpoints locally with curl/httpie | ⬜ TODO | |
| 1.14 | Deploy to Render, confirm health check | ⬜ TODO | Update STATE.md with live URL |

**Backend live URL:** `________________` (fill in after deploy)

---

### DEV 2 — Frontend: Map + Locations + Events (React + Leaflet)
**Branch:** `feature/frontend-map`

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Init React app with Vite, install deps: `react-leaflet`, `leaflet`, `axios`, `react-router-dom`, `tailwindcss`, `lucide-react` | ⬜ TODO | |
| 2.2 | `api.js` — axios instance with `baseURL` from env var `VITE_API_URL` (default `http://localhost:8000`) | ⬜ TODO | |
| 2.3 | `constants.js` — location type config: labels, colors, icons (🔥 BBQ = orange, 🌱 Garden = green, 🍳 Kitchen = purple) | ⬜ TODO | |
| 2.4 | `MapView.jsx` — Leaflet map centred on Melbourne CBD (-37.8136, 144.9631, zoom 13). Fetch locations from API, render colored markers by type. | ⬜ TODO | Use CircleMarker or custom DivIcon |
| 2.5 | `LocationPin.jsx` — custom marker component. Click opens popup with location name, type badge, description, and "See Events" button | ⬜ TODO | |
| 2.6 | `SearchBar.jsx` — search bar above map. Text input + type filter dropdown (All / BBQ / Garden / Kitchen). Calls `GET /api/search` or filters client-side | ⬜ TODO | |
| 2.7 | `EventCard.jsx` — compact card: event title, type pill, date/time, location name, attendee count, RSVP button | ⬜ TODO | |
| 2.8 | `EventModal.jsx` — modal to view event detail OR create new event. Form fields: title, description, type (dropdown), location (dropdown), start/end time, max attendees | ⬜ TODO | |
| 2.9 | `Home.jsx` — page layout: search bar top, map takes 60% height, scrollable event list below. "Add Event" FAB button bottom-right opens EventModal in create mode | ⬜ TODO | |
| 2.10 | Wire RSVP: clicking "I'm Going" calls `POST /api/events/{id}/rsvp` with user_id from localStorage | ⬜ TODO | |
| 2.11 | `vite.config.js` — proxy `/api` to backend in dev | ⬜ TODO | |
| 2.12 | `netlify.toml` — build command, publish dir, redirect `/api/*` to Render backend URL | ⬜ TODO | |
| 2.13 | Visual polish: warm color palette, rounded cards, smooth transitions | ⬜ TODO | See DESIGN TOKENS below |
| 2.14 | Deploy to Netlify, confirm map loads with seed data | ⬜ TODO | Update STATE.md with live URL |

**Frontend live URL:** `________________` (fill in after deploy)

---

### DEV 3 — Frontend: Profile, Badges, UX Polish + Simple Auth
**Branch:** `feature/frontend-profile`

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Simple auth flow: on first visit, modal asks name + email. `POST /api/users` → store `user_id` in localStorage. Show name in header thereafter. | ⬜ TODO | No passwords. Just identification. |
| 3.2 | `ProfilePanel.jsx` — slide-out panel or page. Shows user name, email, member since date, total events attended, total events hosted | ⬜ TODO | |
| 3.3 | `BadgeShelf.jsx` — grid of all possible badges. Earned badges are full color + glow. Unearned badges are greyed out with "locked" overlay and hint text for how to earn | ⬜ TODO | Fetch from `GET /api/users/{id}/badges` |
| 3.4 | `badges.js` — client-side badge metadata (name, icon, description, earn criteria text) matching server definitions | ⬜ TODO | 8 badges total — see definitions above |
| 3.5 | `Profile.jsx` page — ProfilePanel + BadgeShelf + event history (past RSVPs) | ⬜ TODO | |
| 3.6 | Nav header component — logo/title left, profile avatar/name right (links to Profile page). Simple top bar. | ⬜ TODO | |
| 3.7 | `App.jsx` — React Router: `/` → Home, `/profile` → Profile | ⬜ TODO | |
| 3.8 | Toast notifications: "RSVP confirmed!", "New badge earned: 🔥 First Flame!" | ⬜ TODO | Use a simple toast lib or custom |
| 3.9 | Empty states: no events yet, no badges yet, no RSVPs yet — friendly copy + illustration | ⬜ TODO | |
| 3.10 | Mobile responsive: map stacks above event list, cards go full-width, profile is a full page not a panel | ⬜ TODO | |
| 3.11 | Badge unlock animation: when user earns a new badge, show a celebratory modal with confetti or pulse effect | ⬜ TODO | Check for new badges after each RSVP |
| 3.12 | README.md — project overview, setup instructions, env vars, deploy URLs | ⬜ TODO | |

---

## DESIGN TOKENS

```
Brand: Community Maxxing

Colors:
  --cm-orange:    #F97316   (BBQ / warmth / energy)
  --cm-green:     #22C55E   (Garden / growth)
  --cm-purple:    #A855F7   (Kitchen / nourishment)
  --cm-cream:     #FFF7ED   (background)
  --cm-charcoal:  #1C1917   (text)
  --cm-warm-gray: #78716C   (secondary text)
  --cm-gold:      #EAB308   (badges / achievement)

Typography:
  Headings: Inter or system-ui, bold
  Body: Inter or system-ui, regular

Map:
  Tile layer: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
  Centre: -37.8136, 144.9631 (Melbourne CBD)
  Default zoom: 13
  Marker sizes: 12px radius for locations

Cards:
  Border radius: 12px
  Shadow: 0 1px 3px rgba(0,0,0,0.1)
  Padding: 16px
```

---

## DEVOPS & WORKFLOW

### Branching
```
main ← auto-deploys to Render (backend) and Netlify (frontend)
  ├── feature/backend          (Dev 1)
  ├── feature/frontend-map     (Dev 2)
  └── feature/frontend-profile (Dev 3)
```

### Merge Order
1. **Dev 1 merges first** — backend must be live before frontend can connect
2. **Dev 2 merges second** — map + events is the core experience
3. **Dev 3 merges last** — profile/badges layer on top

### Merge Checklist
Before merging your branch:
- [ ] Pull latest main
- [ ] Resolve conflicts
- [ ] Test locally against live backend (Dev 2, 3) or with seed data (Dev 1)
- [ ] Update your task statuses in STATE.md to ✅ DONE
- [ ] PR → main → auto-deploy

### Environment Variables
```
# Backend (Render)
DATABASE_URL=sqlite:///./community.db
CORS_ORIGINS=http://localhost:5173,https://community-maxxing.netlify.app

# Frontend (Netlify)
VITE_API_URL=https://community-maxxing.onrender.com
```

---

## INTEGRATION POINTS (read before you start)

### Dev 1 ↔ Dev 2
- Dev 2 depends on API response shapes from Dev 1
- Agree on these response schemas now:

```jsonc
// GET /api/locations
[{
  "id": 1,
  "name": "Flagstaff Gardens BBQ",
  "type": "bbq",
  "latitude": -37.8112,
  "longitude": 144.9536,
  "address": "309 William St, West Melbourne",
  "description": "Free electric BBQs...",
  "photo_url": null,
  "event_count": 3  // number of upcoming events at this location
}]

// GET /api/events
[{
  "id": 1,
  "title": "Saturday Arvo BBQ",
  "description": "BYO everything, we supply the onions",
  "event_type": "social",
  "start_time": "2026-05-30T12:00:00",
  "end_time": "2026-05-30T15:00:00",
  "host": {"id": 1, "name": "Priya"},
  "location": {"id": 1, "name": "Flagstaff Gardens BBQ", "type": "bbq"},
  "attendee_count": 7,
  "max_attendees": 20,
  "user_rsvp": null  // null | "going" | "attended"
}]

// GET /api/users/{id}/badges
{
  "earned": [
    {"id": "first_flame", "name": "First Flame", "icon": "🔥", "description": "...", "earned_at": "2026-05-23"}
  ],
  "available": [
    {"id": "green_thumb", "name": "Green Thumb", "icon": "🌱", "description": "...", "progress": "1/3 garden sessions"}
  ]
}
```

### Dev 2 ↔ Dev 3
- Both work in `frontend/src/` — avoid editing the same files
- Dev 2 owns: `MapView`, `LocationPin`, `SearchBar`, `EventCard`, `EventModal`, `Home.jsx`
- Dev 3 owns: `ProfilePanel`, `BadgeShelf`, `Profile.jsx`, `App.jsx` (routing), nav header
- **Shared file:** `api.js` — Dev 2 creates it, Dev 3 adds profile/badge endpoints to it
- **Shared file:** `App.jsx` — Dev 2 creates with Home route, Dev 3 adds Profile route (merge carefully)

---

## STATUS TRACKER

| Workstream | Dev | Branch | Progress | Blocker |
|------------|-----|--------|----------|---------|
| Backend | Dev 1 | `feature/backend` | ⬜ Not started | — |
| Frontend Map | Dev 2 | `feature/frontend-map` | ⬜ Not started | Needs API URL from Dev 1 |
| Frontend Profile | Dev 3 | `feature/frontend-profile` | ⬜ Not started | Needs api.js from Dev 2 |

**Last updated:** 2026-05-23 — project kickoff

---

## FUTURE (not today)
- AI agent layer: matchmaker, narrator, commitment escalation
- Aboriginal seasonal calendar integration
- Buddy system for event attendance
- Workplace rights info hub
- Grocery price agent
- Paperwork navigator
- Anchor communities (recurring weekly groups)
- Civic service score radar chart
