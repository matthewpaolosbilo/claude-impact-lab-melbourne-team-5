# Dev 3 Dependency Map — Frontend Foundation

**Last updated:** 2026-05-23 (3.14 `netlify.toml` shipped on `feat-3.14`)
**Source:** `STATE.md` (post-restructure, 4-dev split)
**Workstream:** Dev 3, branch `feature/frontend-app` — App shell + Auth + Event UI + Deploy

> Eleven tasks ✅ DONE: 3.1 (Vite + React 19 + Tailwind v4 with brand tokens), 3.2 (`api.js` axios instance + `.env.example`), 3.3 (design tokens applied), 3.4 (`App.jsx` router with `/` and `/profile` placeholder routes, branch `feat-3.4`), 3.5 (`NavHeader.jsx` global sticky top bar, branch `feat-3.5`), 3.6 (`AuthModal.jsx` + `useUser` hook, user-aware NavHeader, branch `feat-3.6` PR #14), 3.7 (`Home.jsx` layout with map + slots + FAB, branch `feat-3.7`), 3.8 + 3.9 (`EventCard.jsx` + dual-mode `EventModal.jsx`, branch `feat-3.8-3.9`, wired against `SEED_EVENTS` mock and Dev 2's `useLocations` hook), 3.10 (`rsvpToEvent` helper + real `POST /api/events/{id}/rsvp` from `Home.jsx`, optimistic + rollback + `triggerBadgeCheck` on success, branch `feat-3.10`), 3.13 (vite proxy `/api` → `localhost:8000`). The frontend now renders a clickable map + event list + create + RSVP flow against a real backend. Remaining Dev 3 work: 3.7.1/3.7.2 Maxxer shell slots (new from PR #17, not yet captured in this table), and the deploy tail (3.11, 3.12, 3.14, 3.15). Dev 3 owns three shared files (`api.js`, `App.jsx`, `EventCard.jsx`) and the Netlify deploy tail.

---

## Dependency Table

| Task | Title | Intra-Dev-3 deps | Cross-workstream deps | External deps | Data contracts |
|------|-------|-------------------|------------------------|---------------|----------------|
| 3.1 ✅ | Init Vite + install deps | — | — | npm: react, vite, react-leaflet, leaflet, axios, react-router-dom, tailwindcss, lucide-react | — |
| 3.2 ✅ | `api.js` axios instance | 3.1 ✅ | Shared with Dev 2 (adds location endpoints) and Dev 4 (adds badge endpoints) | env: `VITE_API_URL` | — |
| 3.3 | Tailwind config + design tokens | 3.1 ✅ | — | tailwindcss | DESIGN TOKENS § |
| 3.4 ✅ | `App.jsx` — React Router | 3.1 ✅ | Shared file with Dev 4 (Dev 4 swaps the `/profile` placeholder for 4.6) | react-router-dom | — |
| 3.5 ✅ | Nav header component | 3.1 ✅, 3.4 ✅ | — | lucide-react | — |
| 3.6 ✅ | Auth flow (name + email modal) | 3.2 ✅, 3.5 ✅ | Satisfied by Dev 1's 1.5 (`POST /api/users`) now on main | localStorage | (user_id stored client-side) |
| 3.7 ✅ | `Home.jsx` — layout (search + map + list + FAB) | 3.1 ✅, 3.4 ✅ | Consumes Dev 2's 2.5 (`MapView`) ✅ merged; SearchBar (2.8) and EventCard (3.8) slots still placeholders | — | — |
| 3.8 ✅ | `EventCard.jsx` — compact card | 3.1 ✅, 3.2 ✅, 3.3 ✅ | Shipped against `SEED_EVENTS` mock; shared file with Dev 4 (4.9 attendee surfacing, 4.10 host attribution) — slots marked in source | lucide-react | `GET /api/events` (mock today; swap when Dev 1's 1.6 lands) |
| 3.9 ✅ | `EventModal.jsx` — view/create | 3.1 ✅, 3.2 ✅, 3.8 ✅ | Shipped against `SEED_EVENTS` mock; location dropdown consumes Dev 2's `useLocations` hook (live `GET /api/locations`) | — | `GET/POST /api/events` (mock today), `GET /api/locations` ✅ |
| 3.10 ✅ | Wire RSVP | 3.2 ✅, 3.6 ✅, 3.8 ✅, 3.9 ✅ | `POST /api/events/{id}/rsvp` with `X-User-Id` header; calls `useBadgeWatcher.triggerBadgeCheck()` on success and 409, satisfying Dev 4's 4.8 hook contract | localStorage | `POST /api/events/{id}/rsvp` ✅ |
| 3.11 | Empty states | 3.7, 3.8 | — | — | — |
| 3.12 | Mobile responsive | 3.5, 3.7, 3.8, 3.9 | Coordinate with Dev 2's 2.10 (mobile map UX) and Dev 4's profile mobile (inferred — Dev 4 page 4.6 needs its own mobile pass) | tailwindcss | — |
| 3.13 ✅ | `vite.config.js` proxy | 3.1 ✅ | Targets Dev 1's local backend on `:8000` | vite | — |
| 3.14 ✅ | `netlify.toml` — build + `/api/*` redirect | 3.1 ✅ | Dev 1's 1.12 ✅ (Render live at `https://commaxx-api.onrender.com`) | Netlify | — |
| 3.15 | Deploy to Netlify, confirm end-to-end | 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.14 | Needs Dev 1's 1.12 (backend live) and 1.9 (CORS allowing Netlify domain); shows up at the URL Dev 1's CORS needs | Netlify, GitHub | — |

---

## Intra-Dev-3 Task Graph

```mermaid
graph TD
    3.1[3.1 Init Vite ✅] --> 3.3[3.3 Tailwind tokens]
    3.1 --> 3.4[3.4 App.jsx router ✅]
    3.1 --> 3.13[3.13 vite proxy ✅]
    3.1 --> 3.14[3.14 netlify.toml ✅]
    3.2[3.2 api.js ✅] --> 3.6[3.6 Auth flow ✅]
    3.3 --> 3.8[3.8 EventCard ✅]
    3.4 --> 3.5[3.5 Nav header ✅]
    3.4 --> 3.7[3.7 Home.jsx ✅]
    3.5 --> 3.6
    3.5 --> 3.12[3.12 Mobile]
    3.2 --> 3.8
    3.8 --> 3.9[3.9 EventModal ✅]
    3.2 --> 3.10[3.10 RSVP wiring ✅]
    3.6 --> 3.10
    3.8 --> 3.10
    3.9 --> 3.10
    3.7 --> 3.11[3.11 Empty states]
    3.8 --> 3.11
    3.7 --> 3.12
    3.8 --> 3.12
    3.9 --> 3.12
    3.3 --> 3.15[3.15 Deploy Netlify]
    3.4 --> 3.15
    3.5 --> 3.15
    3.6 --> 3.15
    3.7 --> 3.15
    3.8 --> 3.15
    3.9 --> 3.15
    3.10 --> 3.15
    3.11 --> 3.15
    3.12 --> 3.15
    3.14 --> 3.15
```

---

## Critical Path (remaining TODO work)

With 3.10 ✅ shipped on `feat-3.10`, the spine collapses to a single fan-in. The longest unavoidable chain is now:

`(3.11 + 3.12 + 3.14) → 3.15` — three parallel leaves into the deploy.

Every remaining task is independently startable. 3.15 is still the final gate and depends on every other task being merged.

PR #17 added 3.7.1 (`OnboardingChat` shell gate) and 3.7.2 (`ChatPanel` layout slot) to Dev 3's scope; both are parallel leaves blocked only on Dev 4's `OnboardingChat`/`ChatPanel` components and can be scaffolded against mocks today.

---

## Parallelizable Clusters

- **Config branch (all parallel after 3.1 ✅):** 3.14 is a standalone leaf until 3.15.
- **Router branch:** 3.4 ✅ → 3.5 ✅ → 3.6 ✅ → 3.12.
- **Data-UI branch:** 3.3 ✅ → 3.8 ✅ → 3.9 ✅ → 3.10 ✅.
- **Independent leaves before 3.15:** 3.11, 3.12, 3.14 (plus 3.7.1, 3.7.2 from PR #17).

The remaining work is one engineer's afternoon of parallel leaves into 3.15.

---

## Earliest Unblock Points (what other devs owe Dev 3)

1. **Dev 1's 1.5 / 1.6 / 1.7** ✅ — all satisfied on main. 3.6 (auth), 3.8/3.9 (events UI), and 3.10 (RSVP) shipped against the live endpoints (3.8/3.9 still consume `SEED_EVENTS` locally; swap is a follow-up).
2. **Dev 1's 1.12 (Render deploy)** ✅ — backend live at `commaxx-api.onrender.com`; 3.14 (netlify.toml redirect target) and 3.15 (end-to-end live) are unblocked.
3. **Dev 1's 1.9 (CORS in main.py)** — needs the Netlify domain from 3.15, circular soft coupling. Use env var.
4. **Dev 2's 2.8 (SearchBar)** — slot-in component for 3.7's search-bar placeholder. Independent of remaining Dev 3 work.
5. **Dev 4's `OnboardingChat.jsx` and `ChatPanel.jsx`** — slot-in components for 3.7.1 and 3.7.2 (new from PR #17). 3.7.1/3.7.2 can scaffold against mock responses until then.

---

## Notes on Inferred Deps

- 3.4 and 3.15 are shared coordination points: Dev 4 adds the `/profile` route in 3.4's file, and Dev 4's BadgeShelf/Profile must ship before 3.15 for the deploy to be end-to-end complete (inferred — STATE.md merge order has Dev 4 merging last, so 3.15 may need to be revisited post-Dev-4-merge).
- 3.10's success callback is the hook Dev 4's 4.8 (badge unlock celebration) attaches to. Inferred soft contract — Dev 3 must expose the callback shape.
- 3.12 (mobile) overlaps with Dev 2's 2.10 — both touch responsive rules. Coordinate to avoid conflicting Tailwind breakpoints.
- 3.14's redirect target requires Dev 1's Render URL to be stable; if Dev 1 rebuilds the service, the redirect breaks.
