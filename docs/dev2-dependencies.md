# Dev 2 Dependency Map — GIS / Mapping

**Last updated:** 2026-05-23
**Source:** `STATE.md` (post-restructure, 4-dev split)
**Workstream:** Dev 2, branch `feature/gis` — Locations data + Map UI + Spatial UX

> Scope changed materially in this revision. Dev 2 is no longer "frontend map only"; it now spans backend (Location model, seed, locations router) and frontend (map components, markers, search, sync, mobile UX). Frontend foundation tasks (Vite init, api.js, routing, auth, EventCard, EventModal, RSVP wiring, Netlify deploy) moved to Dev 3. Profile/badges/notifications moved to Dev 4.

---

## Dependency Table

| Task | Title | Intra-Dev-2 deps | Cross-workstream deps | External deps | Data contracts |
|------|-------|------------------|------------------------|---------------|----------------|
| 2.1 | `models.py` — Location model | — | Blocked on 1.3 (Dev 1 scaffolds `models.py` with User, Event, RSVP first); shared file | SQLAlchemy | DATA MODELS § Location |
| 2.2 | `seed.py` — 15 Melbourne seed locations | 2.1 | Blocked on 1.4 (Dev 1 scaffolds `seed.py`); blocked on 1.2 (database/session); shared file | — | SEED DATA § Melbourne Locations |
| 2.3 | `routers/locations.py` — `GET`/`POST /api/locations` (+ `event_count`) | 2.1 | Needs 1.9 (Dev 1 mounts router in `main.py`); `event_count` reads Event table from 1.3/1.6 | FastAPI, Pydantic | `GET /api/locations` response (incl. `event_count`) |
| 2.4 | `constants.js` — location type config (labels, colors, icons) | — | Needs 3.1 (Dev 3 inits Vite app so `src/utils/` exists) | — | Mirrors Location.type enum from 2.1 (inferred) |
| 2.5 | `MapView.jsx` — Leaflet map + colored markers | 2.3, 2.4 | Needs 3.1 (Vite + react-leaflet installed), 3.2 (`api.js` axios instance) | leaflet, react-leaflet, OpenStreetMap tiles | `GET /api/locations` |
| 2.6 | `LocationPin.jsx` — custom marker + popup ("See Events" CTA) | 2.4, 2.5, 2.7 | Needs 3.1 (lucide-react installed); "See Events" CTA usable once 1.6 (`GET /api/events`) is live | lucide-react | `GET /api/locations` shape |
| 2.7 | Custom SVG markers in `public/markers/` (bbq, garden, kitchen) | — | Needs 3.1 (Vite project so `public/` exists) | — | — |
| 2.8 | `SearchBar.jsx` — text input + type filter | 2.4 | Needs 3.1 + 3.2; coordinate with Dev 3 on placement (3.7 `Home.jsx`); hits 2.3 or Dev 1's 1.8 (`GET /api/search`) | — | `GET /api/locations` or `GET /api/search` |
| 2.9 | Map ↔ event list sync (click marker → highlight/scroll matching events) | 2.5, 2.6, 2.8 | Blocked on Dev 3's 3.7 (`Home.jsx` exists with event list) and 3.8 (`EventCard` to highlight); reads 1.6 (`GET /api/events`) for `location.id` matching | — | `GET /api/events` (esp. `location.id`) |
| 2.10 | Mobile map UX — full-width, sticky search, smooth pan/zoom | 2.5, 2.8 | Coordinate with Dev 3's 3.12 (mobile responsive shell) to avoid conflicting layout rules | tailwindcss | — |

---

## Intra-Dev-2 Task Graph

```mermaid
graph TD
    2.1[2.1 Location model] --> 2.2[2.2 Seed locations]
    2.1 --> 2.3[2.3 locations router]
    2.3 --> 2.5[2.5 MapView]
    2.4[2.4 constants.js] --> 2.5
    2.4 --> 2.6[2.6 LocationPin]
    2.4 --> 2.8[2.8 SearchBar]
    2.5 --> 2.6
    2.7[2.7 SVG markers] --> 2.6
    2.5 --> 2.9[2.9 Map↔list sync]
    2.6 --> 2.9
    2.8 --> 2.9
    2.5 --> 2.10[2.10 Mobile UX]
    2.8 --> 2.10
```

---

## Critical Path

`2.1 → 2.3 → 2.5 → 2.6 → 2.9`

Five tasks. The backend chain (model → router) feeds the map (2.5), which feeds the pins (2.6), which feed the map ↔ list sync (2.9 — the most cross-cutting frontend task). 2.10 (mobile UX) is the same depth but parallel to 2.9.

---

## Parallelizable Clusters

- **Backend branch:** 2.1 → 2.2 and 2.1 → 2.3 run in parallel once Dev 1's 1.3 scaffold lands. 2.2 (seed) and 2.3 (router) don't depend on each other.
- **Standalone leaves:** 2.4 (constants) and 2.7 (SVG markers) have no internal blockers once Dev 3's 3.1 (Vite init) is done. Either can be done first thing.
- **Frontend UI branch:** 2.5, 2.6, 2.8 share only 2.4 as a prerequisite — once 2.3 + 2.4 + 3.1 + 3.2 are in, they fan out.
- **Cross-cutting tail:** 2.9 and 2.10 both wait on 2.5+2.8 but are independent of each other.

---

## Earliest Unblock Points

1. **Dev 1's 1.3 (`models.py` scaffold)** — unblocks 2.1, which is the gate to all backend Dev 2 work (2.2, 2.3, and indirectly everything frontend that calls `/api/locations`).
2. **Dev 3's 3.1 (Vite app init)** — unblocks 2.4, 2.5, 2.6, 2.7, 2.8 (everything frontend). Already ✅ DONE per current STATE.md.
3. **Dev 3's 3.2 (`api.js`)** — unblocks 2.5 and 2.8. Already ✅ DONE.
4. **Dev 1's 1.9 (`main.py` mounts router)** — needed for 2.3 to be reachable end-to-end; without it the locations endpoint exists but isn't served.
5. **Dev 1's 1.6 (`GET /api/events`)** — unblocks the "See Events" CTA in 2.6 and the event-matching logic in 2.9.
6. **Dev 3's 3.7 (`Home.jsx`) + 3.8 (`EventCard`)** — hard prerequisites for 2.9 (no list to sync to until they exist).

Practical sequencing for Dev 2: kick off 2.4 and 2.7 immediately (Dev 3's foundation is already done), in parallel with 2.1 the moment Dev 1 lands 1.3. Then 2.2/2.3 run in parallel. 2.9 is the latest-blocking task; it needs Dev 1's events endpoint and Dev 3's Home + EventCard before it can be wired.

---

## Notes on Inferred Deps

- 2.4's location-type enum must match `Location.type` from 2.1 (`bbq` / `garden_bed` / `community_kitchen`). Not stated as a dep but drift will break marker rendering.
- 2.7 needs the Vite `public/` directory to exist, which is implicit in Dev 3's 3.1.
- 2.9 depends on the `location` object being present on event responses (per Integration Points contract). If Dev 1's 1.6 ever drops `location` from `GET /api/events`, 2.9 breaks.
- 2.10 (mobile) overlaps with Dev 3's 3.12 (mobile responsive). Inferred coordination need to avoid duplicated or conflicting Tailwind responsive rules.
