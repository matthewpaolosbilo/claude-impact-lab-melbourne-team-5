# STATE.md — Community Maxxing
## Strava for Acts of Public Service — Melbourne MVP

> **Claude Code handoff file.** Four developers, one day, one app.
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
4. **The Maxxer AI agent** — conversational onboarding + event curation grounded in real database events
5. **FastAPI backend** + **React frontend**
6. **Deploy:** backend on Render, frontend on Netlify

---

## ARCHITECTURE

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│  FRONTEND (Netlify)         │     │  BACKEND (Render)            │
│                             │     │                              │
│  React + Vite               │────▶│  FastAPI + SQLite            │
│  Mapbox GL JS               │     │                              │
│  Tailwind CSS               │     │  /api/locations   GET/POST   │
│  ChatPanel + OnboardingChat │     │  /api/chat        POST       │
│                             │     │  /api/events      GET/POST   │
│  Pages:                     │     │  /api/events/{id}/rsvp POST  │
│  - Map (home)               │     │  /api/users/{id}/badges GET  │
│  - Event detail             │     │  /api/users       POST       │
│  - Profile + badges         │     │  /api/search      GET        │
│  - Maxxer onboarding chat   │     │  /api/chat/onboarding POST   │
│                             │     │                              │
└─────────────────────────────┘     └──────────────────────────────┘
```

### Tech Decisions (locked, don't revisit)
- **Map:** Mapbox GL JS via `react-map-gl` (requires public token, generous free tier). Token lives in `VITE_MAPBOX_TOKEN`.
- **DB:** SQLite via SQLAlchemy (good enough for MVP, zero config on Render)
- **Auth:** Simplified — name + email, no OAuth today. Store a user_id in localStorage.
- **Badges:** Computed server-side on badge check endpoint, not event-driven
- **AI agent:** Anthropic Claude Sonnet is called server-side only from FastAPI; never expose `ANTHROPIC_API_KEY` to the browser
- **Icons:** Lucide React for UI, custom SVG markers for map pins

### The Maxxer — AI Agent

The Maxxer is a warm, culturally aware conversational assistant for international students in Melbourne. It helps users discover community events with a supportive friend vibe: natural Gen Z slang, a little cheeky, never judgmental, always grounded in real events from the database.

New users without saved preferences see fullscreen conversational onboarding before the map. The Maxxer asks about what brought them to Melbourne, what they miss from home, their preferred social vibe, dietary/cultural considerations, where they usually are in Melbourne, and how social they feel. It should gather this across 4-6 natural messages, then save extracted preferences to the user profile and transition to the map with 3 curated events highlighted.

Returning users see the Maxxer as a collapsible chat sidebar beside the map on desktop and a bottom drawer on mobile. They can ask for suggestions, receive proactive 3-event picks, and get gentle activity nudges based on preferences, past RSVPs, and upcoming events. Every recommendation set must contain exactly 3 real events and tag each event reference as `[EVENT:id]` for frontend parsing.

Backend prompt baseline:
```text
You are the Maxxer, the AI assistant for Community Maxxing — a civic participation app in Melbourne, Australia.

You speak in warm Gen Z slang. You're supportive, a little cheeky, never cringe. You talk like a friend who genuinely wants this person to get out there and find their people. You use slang naturally — "ngl", "fr fr", "lowkey", "giving", "slay", "no cap", "vibe check", "bet" — but you don't overdo it. Every other sentence doesn't need slang. You're warm first, funny second.

You are talking to an international student in Melbourne. Many of them are dealing with isolation, missing family, food insecurity, and not knowing anyone. You take that seriously underneath the playful tone. You never make loneliness feel like a personal failure. You frame showing up to community events as something genuinely cool and brave.

Your job is to suggest EXACTLY 3 events from the available events list. Always 3, no more, no less. Present them conversationally, not as a numbered list. Explain why each one fits this person specifically based on what you know about them.

When suggesting events, wrap each event reference in a tag like [EVENT:id] so the frontend can parse it. Example: "there's this Saturday arvo BBQ at Flagstaff [EVENT:12] that's super chill, usually gets a good mix of people..."

AVAILABLE EVENTS:
{events_json}

USER PROFILE:
{user_preferences_json}

USER'S PAST ATTENDANCE:
{past_rsvps_json}
```

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
│   │   ├── chat.py           ← Maxxer chat + onboarding endpoints
│   │   └── badges.py         ← badge definitions + computation
│   ├── requirements.txt
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api.js            ← axios instance, base URL config
│   │   ├── components/
│   │   │   ├── MapView.jsx       ← Mapbox map with markers
│   │   │   ├── LocationPin.jsx   ← custom marker per type
│   │   │   ├── EventCard.jsx     ← event summary card
│   │   │   ├── EventModal.jsx    ← create/view event
│   │   │   ├── ChatPanel.jsx     ← Maxxer sidebar / mobile drawer
│   │   │   ├── OnboardingChat.jsx← fullscreen Maxxer onboarding
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
    preferences: dict | None  # JSON profile extracted by Maxxer onboarding
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

### DEV 1 — Backend Foundation (FastAPI + DB + Users + Events + Deploy)
**Branch:** `feature/backend`

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Init `backend/` with `requirements.txt` (fastapi, uvicorn, sqlalchemy, pydantic) | ✅ DONE | `backend/requirements.txt` + `pyproject.toml` + `uv.lock` on main. Merged via PR #13. |
| 1.2 | `database.py` — SQLite engine, sessionmaker, `init_db()` | ✅ DONE | `backend/database.py` + `backend/deps.py` (`get_db`) on main. |
| 1.3 | `models.py` — User, Event, RSVP (Location model owned by Dev 2) | ✅ DONE | `backend/models.py` on main; Location added by Dev 2's 2.1. Pydantic schemas in `backend/schemas.py`. |
| 1.4 | `seed.py` — scaffold + insert 5 sample events (location seed owned by Dev 2) | ✅ DONE | `backend/seed.py` idempotent; invoked from `main.py` lifespan after `init_db()`. |
| 1.5 | `routers/users.py` — `POST /api/users` (create/login by email), `GET /api/users/{id}` | ✅ DONE | `backend/routers/users.py` on main; `test_users.py` passes. |
| 1.6 | `routers/events.py` — `GET /api/events` (list, filter by location/type/date), `POST /api/events`, `GET /api/events/{id}` | ✅ DONE | `backend/routers/events.py` on main; `test_events.py` passes. |
| 1.7 | `routers/events.py` — `POST /api/events/{id}/rsvp`, `PATCH /api/rsvps/{id}` (mark attended) | ✅ DONE | RSVP endpoints in `events.py`; `test_rsvp.py` passes. |
| 1.8 | `routers/events.py` — `GET /api/search?q=...&type=...&date=...` | ✅ DONE | Search endpoint in `events.py`; `test_search.py` passes. |
| 1.9 | `main.py` — mount routers, CORS (allow Netlify domain + localhost), call seed on startup | ✅ DONE | `backend/main.py` mounts users/events/locations/badges routers; CORS configured; seed on startup. |
| 1.10 | `render.yaml` — web service config, start `uvicorn main:app --host 0.0.0.0 --port $PORT` | ✅ DONE | `backend/render.yaml` on main. |
| 1.10.1 | Add `anthropic` to `requirements.txt` and load `ANTHROPIC_API_KEY` from Render env | ✅ DONE | `anthropic>=0.40,<1` in `requirements.txt` + `pyproject.toml`. `services/anthropic_client.AnthropicMaxxerClient` reads `ANTHROPIC_API_KEY` (and optional `MAXXER_MODEL`, default `claude-sonnet-4-6`) at request time. Backend-only secret — Render env var still needs setting before/at merge. |
| 1.10.2 | `models.py` / schemas — add nullable `preferences` JSON column to `User` and include it in user reads | ✅ DONE | SQLAlchemy `JSON` column on `User`; idempotent `ALTER TABLE users ADD COLUMN preferences` in `init_db()` for pre-existing local DBs; `UserRead.preferences: Optional[dict]`. Defaults `null` on create; populated by `/api/chat/onboarding` tool call. |
| 1.10.3 | `routers/chat.py` — `POST /api/chat` for ongoing Maxxer suggestions | ✅ DONE | Loads upcoming-14d events (limit 30), last 5 RSVPs, current `user.preferences`; calls `MaxxerClient` (real Claude or stub if no key); returns `{response, suggested_event_ids, onboarding_complete}` with exactly 3 grounded events via `[EVENT:id]` enforcement. Hallucinated ids filtered before response leaves the server. |
| 1.10.4 | `routers/chat.py` — `POST /api/chat/onboarding` for conversational preference gathering | ✅ DONE | Stateless: frontend sends `history` each turn. System prompt + `finish_onboarding` tool (6 dimensions). When Claude calls the tool, preferences persist to `User.preferences`, a follow-up call generates 3 grounded picks, response returns `onboarding_complete:true` + typed `MaxxerPreferences`. Otherwise returns assistant text with `onboarding_complete:false`. |
| 1.10.5 | Maxxer system prompts + response parsing | ✅ DONE | `services/maxxer.py` owns the warm Gen Z `MAXXER_VOICE_PREFACE`, chat + onboarding system prompts, the `finish_onboarding` tool schema, and `enforce_event_suggestions(text, available_ids)` — drops hallucinated ids, dedupes, truncates to 3, strips orphan `[EVENT:id]` tags. 10 unit tests cover edge cases. |
| 1.11 | Test all endpoints locally with curl/httpie | ✅ DONE | Met via pytest suite: `backend/tests/` has 8 test files (users, events, rsvp, search, locations, badge_logic, seed, smoke) — broader coverage than curl/httpie spot checks. |
| 1.12 | Deploy to Render, confirm health check | ✅ DONE | Live at https://commaxx-api.onrender.com/ (docs at `/docs`). |

**Backend live URL:** https://commaxx-api.onrender.com/ (interactive docs at `/docs`)

---

### DEV 2 — GIS / Mapping (Locations data + Map UI + Spatial UX) **[you]**
**Branch:** `feature/gis`

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | `models.py` — Location model | ✅ DONE | Scaffolded by Dev 1 to unblock Event FK; columns match STATE.md spec. |
| 2.2 | `seed.py` — insert all 15 Melbourne seed locations | ✅ DONE | Idempotent; called from `main.py` lifespan after `init_db()`. Logs `[seed] inserted 15 locations` on cold start. |
| 2.3 | `routers/locations.py` — `GET /api/locations` (list, filter by type), `POST /api/locations`; include `event_count` | ✅ DONE | `event_count` = upcoming events (`start_time >= now`) via outer-join + group_by. Mounted in `main.py`. `LocationRead`/`LocationCreate` added to `schemas.py`. Frontend now consumes via `useLocations()` hook. |
| 2.4 | `constants.js` — location type config: labels, colors, icons (🔥 BBQ = orange, 🌱 Garden = green, 🍳 Kitchen = purple) | ✅ DONE | `LOCATION_TYPES` + `MAP_DEFAULTS` in `frontend/src/utils/constants.js`. Lucide icons (Flame/Sprout/ChefHat). |
| 2.5 | `MapView.jsx` — Mapbox GL map (via `react-map-gl`) centred on Melbourne CBD (-37.8136, 144.9631, zoom 13). Install `mapbox-gl` + `react-map-gl`; remove `leaflet` + `react-leaflet`. Fetch locations from API, render colored markers by type | ✅ DONE | Style: `mapbox/light-v11`. Click-to-popup. `Home.jsx` passes API-fed locations from `useLocations()` / `/api/locations`. Accepts `selectedLocationId` + `highlightedLocationIds`, pulses suggested pins, and pans/zooms selected locations into view. |
| 2.6 | `LocationPin.jsx` — custom marker. Click opens popup with name, type badge, description, "See Events" button | ✅ DONE | Coloured pin + Lucide icon, scales on hover. "See Events" CTA deferred until events list exists. |
| 2.7 | Custom SVG markers in `public/markers/` (bbq, garden, kitchen) | ⏸ DEFERRED | Using Lucide icons inline for now. Add bespoke SVGs if/when designers hand them over. |
| 2.8 | `SearchBar.jsx` — text input + type filter dropdown (All / BBQ / Garden / Kitchen). Hooks into `GET /api/locations` or `GET /api/search` | ✅ DONE | Added `frontend/src/components/SearchBar.jsx`; filters API-fed locations plus current event list by query/type in `Home.jsx`. |
| 2.9 | Map ↔ event list sync — clicking marker scrolls/highlights matching events; viewport-based filtering optional | ✅ DONE | Marker click selects a location, pans/zooms the map, pulses the pin, and scrolls/highlights the first matching event card. |
| 2.10 | Mobile map UX — full-width on small screens, sticky search, smooth pan/zoom | ✅ DONE | Search is sticky; map has stable mobile height; event list/FAB spacing adjusted for small screens. |

---

### DEV 3 — Frontend Foundation (App shell + Auth + Event UI + Deploy)
**Branch:** `feature/frontend-app`

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Init React app with Vite, install deps: `react-leaflet`, `leaflet`, `axios`, `react-router-dom`, `tailwindcss`, `lucide-react` | ✅ DONE | Vite 8 + React 19, Tailwind v4 with brand tokens registered via `@theme` in `src/index.css`. Leaflet icon-fix applied in `main.jsx`. |
| 3.2 | `api.js` — axios instance with `baseURL` from env var `VITE_API_URL` (default `http://localhost:8000`) | ✅ DONE | `.env.example` committed with `VITE_API_URL=http://localhost:8000`. Dev 2 + Dev 4 will add their endpoints here. |
| 3.3 | Tailwind config + design tokens applied (see DESIGN TOKENS below) | ✅ DONE | Inter font import added; `@theme` in `src/index.css` extended with `--font-sans`, `--radius-card`, `--shadow-card`, `--spacing-card`. Base layer sets `body` background, text color, and font. Demo pill in `App.jsx` uses `rounded-card shadow-card p-card` as smoke test. Branch: `feat-3.3`. |
| 3.4 | `App.jsx` — React Router: `/` → Home, `/profile` → Profile (Dev 4 owns Profile page) | ✅ DONE | `BrowserRouter` with `/` and `/profile` routes wired. Inline placeholders mark slots for 3.7 (Home) and Dev 4's 4.6 (Profile). Branch: `feat-3.4`. |
| 3.5 | Nav header component — logo/title left, profile avatar/name right (links to Profile) | ✅ DONE | `NavHeader.jsx` sticky top bar mounted in `App.jsx` above `<Routes>`. Logo links to `/`; "Sign in" pill links to `/profile` (slot for 3.6 auth-aware avatar + name). Lucide `UserCircle2`. Branch: `feat-3.5`. |
| 3.7 | `Home.jsx` — layout: search bar top, map (Dev 2's `MapView`) 60% height, scrollable event list below, "Add Event" FAB bottom-right | ✅ DONE | `frontend/src/pages/Home.jsx` wired into `/`. Dev 2's SearchBar now filters locations/events; event list + modal consume seeded/API events from Dev 3's 3.8/3.9 work. Consumes Dev 2's merged `MapView` with API-fed locations. Branch: `feat-3.7` (stacked on `feat-3.5`). |
| 3.7.1 | App shell gate for `OnboardingChat.jsx` | ✅ DONE | `OnboardingGate.jsx` wraps the `/` route; `needsOnboarding(user)` helper in `utils/preferences.js` centralises the trigger (true when signed-in user has null/undefined/empty `preferences`). Stub `OnboardingChat.jsx` renders a single "Finish (stub)" button that calls `onComplete(preferences)`; gate writes preferences via `useUser.setUser` and the same-tab sync event flips back to Home. Dev 4's 4.15 replaces the stub wholesale, keeping the `onComplete` contract; when Dev 1's 1.10.2 lands, `useUser` hydrates `preferences` from the API and the gate stays unchanged. Branch: `feat-3.7.1`. |
| 3.7.2 | Home layout slot for `ChatPanel.jsx` | ✅ DONE | `ChatPanelSlot.jsx` placeholder mounted in desktop right sidebar (`lg:w-80 xl:w-96`) and mobile drawer strip below the event list. `suggestedEventIds` state lifted into `Home.jsx`; Dev 2 maps these to highlighted locations for `MapView` and also highlights matching event cards. Branch: `feat-3.7.2`. |
| 3.8 | `EventCard.jsx` — compact card: title, type pill, date/time, location name, RSVP button | ✅ DONE | `frontend/src/components/EventCard.jsx`. Click opens `EventModal` in view mode; RSVP button stubbed (real wiring in 3.10). Slots marked for Dev 4's 4.9 attendee avatars + 4.10 host badges. Branch: `feat-3.8-3.9`. |
| 3.9 | `EventModal.jsx` — view/create event. Form: title, description, type, location, start/end, max attendees | ✅ DONE | `frontend/src/components/EventModal.jsx`. Dual-mode (view/create), Esc + backdrop close, native `datetime-local` inputs, required-field validation. Location dropdown consumes `locations` prop fed by Dev 2's `useLocations` hook. Branch: `feat-3.8-3.9`. |
| 3.10 | Wire RSVP: "I'm Going" → `POST /api/events/{id}/rsvp` with user_id from localStorage | ✅ DONE | `rsvpToEvent(eventId, userId)` helper in `frontend/src/api.js` (sends `X-User-Id` header). `Home.jsx` does optimistic update + real POST + rollback on failure + success toast, and calls `useBadgeWatcher.triggerBadgeCheck()` on success or 409 (already-RSVP'd treated as success). Unsigned users get AuthModal popped via the `community-maxxing-open-auth` event. SEED_EVENTS → live `GET /api/events` swap deferred. Branch: `feat-3.10`. |
| 3.11 | Empty states: no events yet, no search results — friendly copy + illustration | ⬜ TODO | |
| 3.12 | Mobile responsive: stacks vertical, full-width cards | ⬜ TODO | |
| 3.13 | `vite.config.js` — proxy `/api` to backend in dev | ✅ DONE | Done early as part of 3.1 — proxies `/api` to `http://localhost:8000`. |
| 3.14 | `netlify.toml` — build command, publish dir, redirect `/api/*` to Render backend URL | ✅ DONE | `frontend/netlify.toml`. Build cmd `npm run build`, publish `dist`. `/api/*` rewrites (status 200, force=true) to `https://commaxx-api.onrender.com/api/:splat`; SPA fallback `/* → /index.html` ordered after the API rule. Render `/api/locations` confirmed 200 from the rewrite target. Netlify site base directory should be set to `frontend`. Branch: `feat-3.14`. |
| 3.15 | Deploy to Netlify, confirm app loads end-to-end | ⬜ TODO | Update STATE.md with live URL |

**Frontend live URL:** `________________` (fill in after deploy)

---

### DEV 4 — Badges, Notifications, Social (engagement layer)
**Branch:** `feature/social`

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Badge computation helpers (backend): `count_attended`, `count_hosted`, `check_weekly_streak`, `count_distinct_types`, `hosted_event_with_min_attendees` | ✅ DONE | `backend/badge_logic.py` — pure SQLAlchemy 2.0 queries, plus extras: `weekly_streak_length`, `largest_hosted_attendance`, `latest_qualifying_attendance` for progress text. |
| 4.2 | `routers/badges.py` — `GET /api/users/{id}/badges` (returns earned + available with progress) | ✅ DONE | Plus a small `/api/users/{id}/profile-stats` endpoint to power ProfilePanel. Imports `get_db` from `database.py` — Dev 1, please expose. |
| 4.3 | `badges.js` — client-side badge metadata (name, icon, description, earn criteria text) matching server definitions | ✅ DONE | `frontend/src/utils/badges.js` — 8 badges + `mergeBadgePayload(serverPayload)` helper. |
| 4.4 | `BadgeShelf.jsx` — grid of all possible badges. Earned = full color + glow. Locked = greyed out with hint text | ✅ DONE | Fetches `/api/users/{id}/badges`; accepts an optional `payload` prop for preview/SSR. |
| 4.5 | `ProfilePanel.jsx` — user name, email, member since, total events attended, total events hosted | ✅ DONE | Hits `/api/users/{id}` + `/api/users/{id}/profile-stats`. |
| 4.6 | `Profile.jsx` page — ProfilePanel + BadgeShelf + past RSVP history | ✅ DONE | Reads `cm.user_id` from localStorage. Past RSVPs uses `GET /api/events?user_id&attended=true` — Dev 1, please add that filter. |
| 4.7 | Toast notifications: "RSVP confirmed!", "New badge earned: 🔥 First Flame!" | ✅ DONE | Custom (`ToastProvider`, `useToast`, `Toaster`). No extra dep. Slide-in animation. |
| 4.8 | Badge unlock celebration: modal with confetti/pulse when new badge earned | ✅ DONE | `BadgeUnlockModal` + `useBadgeWatcher(userId)`. Call `triggerBadgeCheck()` after RSVP success. Diff stored in `cm.badges.lastEarned`. |
| 4.9 | Attendee surfacing on `EventCard`: count + avatars (or initials) for who's going | ✅ DONE | `AttendeeChips` sub-component for Dev 3 to drop in. Degrades to count-only if backend doesn't include `attendees[]`. |
| 4.10 | Host attribution on `EventCard` and `EventModal` — show host name + their badges | ✅ DONE | `HostBadge` sub-component — lazy-fetches host's top badges. |
| 4.11 | Community notification hooks — placeholder UI for "new event near you" / "your friend RSVPed" | ✅ DONE | `NotificationFeed` stub with 3 sample entries, ready for backend wiring. |
| 4.12 | README.md — project overview, setup instructions, env vars, deploy URLs | ✅ DONE | Draft committed; Dev 1 + 3 will fill in live URLs after deploy. |
| 4.13 | `ChatPanel.jsx` — Maxxer collapsible chat sidebar / mobile bottom drawer | ✅ DONE | `frontend/src/components/ChatPanel.jsx`. Right sidebar on desktop, bottom drawer on mobile. Session-only history via `useMaxxer` hook. Floating "Ask Maxxer" pill stacks above the Add event FAB. |
| 4.14 | Inline Maxxer event recommendation cards | ✅ DONE | `MaxxerEventSuggestion.jsx` + `utils/maxxerParse.js`. Each `[EVENT:id]` in agent text renders as a tappable card with View / I'm going. Falls back to a "Event reference not found" pill if the id isn't in the current events map. |
| 4.15 | `OnboardingChat.jsx` — fullscreen conversational onboarding | ✅ DONE | `frontend/src/components/OnboardingChat.jsx`. Bootstraps via `useMaxxer({mode:'onboarding'})`; on `onboarding_complete` it hands extracted preferences to the host (Home.jsx's temp gate — see 3.7.1). |
| 4.16 | Maxxer suggestion state bridge to map | 🟡 PARTIAL | State plumbing done: ChatPanel → Home → `MapView` via new `highlightedLocationIds` prop. Dev 2 still needs to wire the marker highlight + flyTo. Suggested events also get a gold ring in the list below. |
| 4.17 | Proactive Maxxer open-app suggestions and activity nudges | ✅ DONE | `ChatPanel` accepts `proactiveOnMount`; calls `useMaxxer.bootstrap()` once which fires `/api/chat` with empty history and surfaces 3 picks. Nudge copy lives in the mock until Dev 1's `/api/chat` ships. |
| 4.18 | Maxxer tone and safety QA pass | ⬜ TODO | Warm Gen Z slang, supportive and culturally aware; never frames loneliness as failure; suggestions must be grounded in real DB events. Needs a live-data review once Dev 1's `/api/chat` ships. |
| 4.19 | Local mock for Dev 1's chat endpoints | ✅ DONE | `utils/maxxerMock.js` — picks 3 upcoming events from `/api/events` and embeds `[EVENT:id]` tags so the frontend Maxxer flow is demoable end-to-end. `api.js` falls through on 404/405/network errors. Delete once 1.10.3/1.10.4 land. |

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
  Provider: Mapbox GL JS (via react-map-gl)
  Style: mapbox://styles/mapbox/light-v11 (default; switch to custom later)
  Centre: -37.8136, 144.9631 (Melbourne CBD)
  Default zoom: 13
  Marker sizes: 12px radius for locations
  Token env var: VITE_MAPBOX_TOKEN (public token, pk.*)

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
  ├── feature/backend       (Dev 1)
  ├── feature/gis           (Dev 2)
  ├── feature/frontend-app  (Dev 3)
  └── feature/social        (Dev 4)
```

### Merge Order
1. **Dev 1 merges first** — backend foundation must be live before anyone else can connect; Maxxer needs `/api/chat`, `/api/chat/onboarding`, `User.preferences`, and `ANTHROPIC_API_KEY` before real agent calls work
2. **Dev 2 + Dev 3 merge in parallel** — GIS/map and frontend app shell are both core; Dev 3 can build Maxxer layout slots and onboarding gates with mock responses while Dev 1 finishes chat endpoints
3. **Dev 4 merges last** — badges, notifications, Maxxer chat UI, onboarding experience, recommendation cards, nudges, and social affordances layer on top

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
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx

# Frontend (Netlify)
VITE_API_URL=https://commaxx-api.onrender.com
VITE_MAPBOX_TOKEN=pk.xxxxxxxxxxxxxxxxxxxxxxxx  # public Mapbox token, scoped to *.netlify.app + localhost
```

---

## INTEGRATION POINTS (read before you start)

### Dev 1 ↔ Dev 2 (backend foundation ↔ GIS)
- **Shared file:** `backend/models.py` — Dev 1 sets up first (User, Event, RSVP); Dev 2 adds Location class
- **Shared file:** `backend/seed.py` — Dev 1 scaffolds; Dev 2 adds 15 locations; Dev 1 seeds sample events
- **Shared file:** `backend/main.py` — Dev 1 owns; Dev 2 mounts `routers/locations.py`
- Dev 2's `GET /api/locations` is the contract Dev 3's MapView and event-list depend on

### Dev 1 ↔ Dev 4 (backend ↔ social/badges)
- **Shared file:** `backend/main.py` — Dev 4 mounts `routers/badges.py`
- Dev 4 reads from RSVP/Event tables Dev 1 owns. Don't change those schemas without checking in.
- **Maxxer contract:** Dev 1 owns `/api/chat`, `/api/chat/onboarding`, Anthropic integration, `User.preferences`, and `[EVENT:id]` response parsing; Dev 4 owns the chat/onboarding product UI that consumes those endpoints.
- Dev 4 can mock `POST /api/chat` and `POST /api/chat/onboarding` responses locally until Dev 1 deploys the real backend endpoints.

### Dev 2 ↔ Dev 3 (GIS ↔ frontend app)
- **Shared file:** `frontend/src/pages/Home.jsx` — Dev 3 owns layout; Dev 2 drops in `MapView` and `SearchBar`
- **Shared file:** `frontend/src/api.js` — Dev 3 creates; Dev 2 adds location endpoints
- Dev 2 owns: `MapView`, `LocationPin`, `SearchBar`, `constants.js` (location config), `public/markers/`
- Dev 3 owns: app shell, routing, nav header, auth flow, `EventCard`, `EventModal`, `Home.jsx` layout
- Dev 3 passes Maxxer suggested event IDs through Home state; Dev 2 makes MapView visually highlight/pan to the matching suggested pins.

### Dev 3 ↔ Dev 4 (frontend app ↔ social layer)
- **Shared file:** `frontend/src/api.js` — Dev 3 creates; Dev 4 adds `/users/{id}/badges`, `/api/chat`, `/api/chat/onboarding`, and any social endpoints
- **Shared file:** `frontend/src/App.jsx` — Dev 3 sets up router with `/profile` route; Dev 4 mounts the Profile page there
- **Shared file:** `frontend/src/pages/Home.jsx` — Dev 3 owns layout shell; Dev 4 mounts `ChatPanel` into the reserved sidebar/drawer slot
- **Shared file:** `frontend/src/components/EventCard.jsx` — Dev 3 base; Dev 4 enriches with attendee count, host name, badge progress
- Dev 3 owns the RSVP wiring; Dev 4 adds the "new badge earned" check on RSVP success
- Dev 3 owns the auth/profile gate; Dev 4 owns `OnboardingChat` and signals onboarding completion when backend returns `onboarding_complete: true`.

### API response schemas (agree now)

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

// POST /api/chat
// request
{
  "user_id": 1,
  "message": "what's on this weekend"
}

// response
{
  "response": "ok so based on your vibe I've got three fire picks for you this week: there's this Saturday arvo BBQ at Flagstaff [EVENT:12]...",
  "suggested_event_ids": [12, 7, 3],
  "onboarding_complete": true
}

// POST /api/chat/onboarding
// request
{
  "user_id": 1,
  "message": "I'm here for uni and I miss cooking with my cousins"
}

// response while still onboarding
{
  "response": "yeah that makes sense fr — food is such a shortcut back to people. Are you more after chill kitchen hangs or bigger social stuff right now?",
  "suggested_event_ids": [],
  "onboarding_complete": false
}

// response when onboarding is complete
{
  "response": "ok I've got you, let me find your first picks 🔥",
  "suggested_event_ids": [4, 9, 11],
  "onboarding_complete": true,
  "preferences": {
    "melbourne_reason": "study",
    "misses_from_home": ["family cooking", "shared meals"],
    "preferred_vibes": ["cooking together", "low-key hangs"],
    "dietary_needs": [],
    "cultural_considerations": [],
    "area": "Carlton",
    "social_energy": "small intimate groups"
  }
}
```

---

## STATUS TRACKER

| Workstream | Dev | Branch | Progress | Blocker |
|------------|-----|--------|----------|---------|
| Backend Foundation | Dev 1 | `feature/backend` | 🟡 In progress — 12/17 done (1.1–1.12 ✅; live at commaxx-api.onrender.com); Maxxer subtasks 1.10.1–1.10.5 TODO | Maxxer needs `ANTHROPIC_API_KEY` env + `routers/chat.py` (1.10.1–1.10.5) |
| GIS / Mapping | Dev 2 (you) | `feature/gis` | ✅ Complete — 9/10 done (2.1–2.6, 2.8–2.10); 2.7 deferred | Bespoke SVG markers remain deferred until designers provide assets |
| Frontend App | Dev 3 | `feature/frontend-app` | 🟡 In progress — 14/17 done (3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.7.1, 3.7.2, 3.8, 3.9, 3.10, 3.13, 3.14) | 3.11/3.12 polish and 3.15 deploy remain |
| Badges & Social + Maxxer | Dev 4 | `feature/social` | 🟡 17/19 done — Maxxer frontend complete (4.13/4.14/4.15/4.17/4.19 ✅, 4.16 now wired through Dev 2 map highlights, 4.18 needs live-data QA) | Real Maxxer responses need Dev 1 `/api/chat` endpoints; mock adapter in `utils/maxxerMock.js` until then |

**Last updated:** 2026-05-23 — Dev 1 Phase 2 ready for review: Maxxer chat + onboarding endpoints, `User.preferences`, anthropic SDK, and the Dev 4 4.6 events filter all on `feature/backend`. 75 backend tests passing.

---

## FUTURE (not today)
- AI agent layer v2: matchmaker, narrator, commitment escalation beyond the Maxxer MVP
- Aboriginal seasonal calendar integration
- Buddy system for event attendance
- Workplace rights info hub
- Grocery price agent
- Paperwork navigator
- Anchor communities (recurring weekly groups)
- Civic service score radar chart
