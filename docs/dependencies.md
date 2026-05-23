# Cross-Workstream Dependency Index

**Last updated:** 2026-05-23 (drift fix: Dev 1 + Dev 2 + Dev 4 backend/social streams flipped ✅ to match origin/main; Maxxer subtasks 1.10.x / 3.7.x / 4.13–4.18 added)
**Source:** `STATE.md` (post-restructure, 4-dev split + Maxxer agent workstream)

> One-page index of how the four dev workstreams gate each other. Per-dev detail lives in `dev{1,2,3,4}-dependencies.md`. The graph below shows only **cross-workstream** edges — intra-dev chains are in each per-dev file.

---

## Per-Dev Files

- [Dev 1 — Backend Foundation](dev1-dependencies.md) — Original critical path ✅ COMPLETE (1.1–1.12 all done; live at https://commaxx-api.onrender.com/). Remaining Maxxer path: `1.10.1 → 1.10.3 → 1.10.5`.
- [Dev 2 — GIS / Mapping](dev2-dependencies.md) — Critical path: `2.8 → 2.9` (two tasks; 2.1, 2.3, 2.5, 2.6 ✅ DONE; 2.7 ⏸ deferred).
- [Dev 3 — Frontend Foundation](dev3-dependencies.md) — Critical path: `3.10 → 3.15` (two tasks; 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.13 ✅ DONE). Plus new Maxxer shell slots 3.7.1 and 3.7.2.
- [Dev 4 — Badges, Notifications, Social + Maxxer](dev4-dependencies.md) — Original critical path ✅ COMPLETE (4.1–4.12 done). Remaining Maxxer path: `4.13 → 4.14 → 4.18`.

---

## Cross-Workstream Dependency Graph

```mermaid
graph LR
    subgraph Dev1 [Dev 1 — Backend]
        D1_3[1.3 models.py ✅]
        D1_5[1.5 users router ✅]
        D1_6[1.6 events router ✅]
        D1_7[1.7 RSVP endpoints ✅]
        D1_9[1.9 main.py mount ✅]
        D1_12[1.12 Render deploy ✅]
        D1_10_2[1.10.2 User.preferences]
        D1_10_3[1.10.3 POST /api/chat]
        D1_10_4[1.10.4 POST /api/chat/onboarding]
    end

    subgraph Dev2 [Dev 2 — GIS]
        D2_1[2.1 Location model ✅]
        D2_2[2.2 Location seed ✅]
        D2_3[2.3 locations router ✅]
        D2_5[2.5 MapView ✅]
        D2_8[2.8 SearchBar]
    end

    subgraph Dev3 [Dev 3 — Frontend]
        D3_1[3.1 Vite init ✅]
        D3_2[3.2 api.js ✅]
        D3_4[3.4 App.jsx router ✅]
        D3_6[3.6 Auth flow ✅]
        D3_7[3.7 Home.jsx ✅]
        D3_8[3.8 EventCard ✅]
        D3_9[3.9 EventModal ✅]
        D3_10[3.10 RSVP wiring]
        D3_7_1[3.7.1 Onboarding gate]
        D3_7_2[3.7.2 ChatPanel slot]
        D3_14[3.14 netlify.toml]
        D3_15[3.15 Deploy Netlify]
    end

    subgraph Dev4 [Dev 4 — Social + Maxxer]
        D4_1[4.1 Badge helpers ✅]
        D4_2[4.2 badges router ✅]
        D4_5[4.5 ProfilePanel ✅]
        D4_6[4.6 Profile.jsx ✅]
        D4_8[4.8 Badge celebration ✅]
        D4_9[4.9 Attendee surface ✅]
        D4_10[4.10 Host attribution ✅]
        D4_13[4.13 ChatPanel]
        D4_15[4.15 OnboardingChat]
        D4_16[4.16 Map suggestion bridge]
    end

    D1_3 --> D2_1
    D2_2 --> D1_6
    D2_1 --> D1_6
    D2_3 --> D1_9
    D2_3 --> D3_9

    D1_5 --> D3_6
    D1_6 --> D3_8
    D1_6 --> D3_9
    D1_7 --> D3_10
    D1_12 --> D3_14
    D1_12 --> D3_15

    D2_5 --> D3_7
    D2_8 --> D3_7

    D1_3 --> D4_1
    D1_9 --> D4_2
    D1_5 --> D4_5
    D1_6 --> D4_9
    D1_6 --> D4_10

    D3_1 --> D4_2
    D3_4 --> D4_6
    D3_6 --> D4_5
    D3_8 --> D4_9
    D3_8 --> D4_10
    D3_10 --> D4_8

    D1_10_3 --> D4_13
    D1_10_4 --> D4_15
    D1_10_2 --> D1_10_3
    D1_10_2 --> D1_10_4
    D4_13 --> D3_7_2
    D4_15 --> D3_7_1
    D4_16 --> D2_5
```

---

## Global Critical Path

**Original core path complete.** The earlier longest chain `1.1 → 1.2 → 1.3 → 1.6 → 1.7 → 3.10 → 4.8 → 4.12` is ✅ done up to 1.7. The remaining unfinished spine of the core product is:

`3.10 → 3.15` (two tasks; RSVP wiring then Netlify deploy).

**Remaining Maxxer path:** `1.10.1 → 1.10.3 → 4.13 → 4.16 → 4.18` (five steps; Anthropic dep → chat endpoint → ChatPanel → map bridge → QA sign-off). 1.10.4 + 4.15 (onboarding) is a parallel branch of similar depth.

**Other paths still in flight:**
- **Map ↔ list sync:** `3.8 ✅ → 2.9 → 3.15` (Dev 2's last frontend integration).
- **Deploy:** `3.15` depends on 3.10 ✅ and (soft) on 3.14 + 1.12 ✅.

---

## Merge-Order Implications

**STATE.md's stated merge order:** Dev 1 → (Dev 2 + Dev 3 parallel) → Dev 4. **In practice:** Dev 1 has fully merged its core; Dev 4's badges/social merged after Dev 3's 3.6; Dev 2 and Dev 3 are interleaving final pieces.

**Where parallelism is real now:**
- **Maxxer kickoff is fully parallel:** Dev 1's 1.10.1 (Anthropic dep) and 1.10.2 (User.preferences) are independent siblings; 1.10.3 and 1.10.4 fan out after.
- **Dev 4's 4.13 + 4.15 can scaffold with mocked chat responses** before Dev 1's chat endpoints land.
- **Dev 3's 3.10 (RSVP wiring) is fully unblocked** — Dev 1's 1.7 is on main.
- **Dev 2's 2.8 (SearchBar) and 2.9 (sync)** are unblocked; Dev 3's `Home.jsx` slot is reserved.

**Where parallelism is illusory:**
- Dev 4's 4.16 (map suggestion bridge) and Dev 2's MapView need to coordinate the `highlightedEventIds` prop shape.
- Dev 3's 3.15 (deploy) is gated on everything else effectively complete; not a parallel concern.

**Recommended remaining sequence:**
1. **Dev 1:** ship 1.10.1 + 1.10.2 in parallel; then 1.10.3 + 1.10.4; then 1.10.5.
2. **Dev 2:** ship 2.8 → 2.9 → 2.10 (linear within stream; 2.9 needs Dev 3's `Home.jsx` event list which is ✅).
3. **Dev 3:** ship 3.10 immediately (highest leverage; closes the RSVP loop); then 3.7.1 + 3.7.2 slots once Dev 4 has stubs; then 3.11/3.12 polish; finally 3.14 + 3.15.
4. **Dev 4:** scaffold 4.13 + 4.15 against mocks now; wire to real endpoints when Dev 1 lands 1.10.3 / 1.10.4; then 4.14 / 4.16 / 4.17; 4.18 closes out.

The single highest-leverage remaining deliverable is **Dev 1's 1.10.3 (`POST /api/chat`)** — it unblocks Dev 4's entire Maxxer UX chain (4.13 → 4.14 → 4.16 → 4.17) and Dev 3's ChatPanel slot (3.7.2).
