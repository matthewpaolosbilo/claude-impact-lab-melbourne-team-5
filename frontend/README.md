# spacd — Frontend

React + Vite app for the spacd demo.

## What It Does

- Shared-password login modal with Claude Impact Lab context and pitch-deck link
- Three-question Maxxer onboarding flow
- Default-open Maxxer sidebar with suggested events after onboarding
- Mapbox map of Melbourne third spaces
- Search and type filters for locations/events
- Event cards, event modal, RSVP flow, profile, badges, and toasts
- Static pitch deck served from `/assets/spaced-deck.html`

## Quickstart

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The Vite dev server proxies `/api` to `http://localhost:8000`, so run the
backend locally for the full flow.

## Environment

Create `frontend/.env.local` for local overrides:

```text
VITE_API_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=pk.your_public_mapbox_token
```

For Netlify:

```text
VITE_API_URL=https://commaxx-api.onrender.com
VITE_MAPBOX_TOKEN=pk.your_public_mapbox_token
```

## Scripts

```bash
npm run dev       # local dev server
npm run build     # production build
npm run preview   # preview built dist locally
npm run lint      # eslint
npm run test      # vitest API wrapper tests
```

## Static Assets

Files in `public/` are copied directly into `dist/` by Vite. The pitch deck
belongs at:

```text
frontend/public/assets/spaced-deck.html
```

That makes it available at:

```text
/assets/spaced-deck.html
```

Do not put static HTML meant to be linked directly under `src/assets`; Vite only
serves `src` assets when they are imported by application code.

## Demo Notes

- Signed-in users always see onboarding on a fresh page load, even if previous
  preferences are stored. That is deliberate for sharing/demo sessions.
- After onboarding completes, the final Maxxer recommendation response is moved
  into the sidebar rather than staying on the transient onboarding screen.
- The Maxxer sidebar opens by default after onboarding so suggested events are
  immediately visible.
- The frontend stores the returned demo user and bearer token in `localStorage`.
