# Dev 3 Workflow — PXL // DS v3 Frontend Migration

**Source docs:** `docs/PXL-DS-v3-handover.md` and `docs/pxl-ds-v3.html`  
**Owner:** Dev 3 (`feature/frontend-app`)  
**Goal:** Apply the PXL // DS v3 visual language to the existing React frontend without changing product behaviour.

---

## Working Rule

Do the migration in layers. First tokens, then reusable primitives, then high-traffic screens. Keep each step visually verifiable before moving on.

The design system is opinionated:
- Pixel components have hard edges: `border-radius: 0`.
- Pixel outlines use `outline`, not `border`.
- Pixel shadows are solid offsets, never blurred.
- Buttons use Bungee, body uses Space Grotesk, badges/tags/meta use DM Mono.
- Dark mode is controlled by `data-theme="dark"` on `<html>`.

---

## Step 1 — Create The Design-System Base

**Files:**
- `frontend/src/index.css`

**Do:**
1. Replace the current Inter import with the PXL font import:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Bungee&family=Space+Grotesk:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
   ```
2. Add PXL tokens from the handover under `:root`.
3. Add the `[data-theme="dark"]` override block.
4. Keep any existing Tailwind v4 `@theme` entries that app code still uses, but map them onto PXL tokens where possible.
5. Set base `body` styles to:
   - `background: var(--color-bg-primary)`
   - `color: var(--color-text-primary)`
   - `font-family: var(--font-body)`

**Acceptance check:**
- App still boots.
- Body background changes to warm neutral `#F5F4F0`.
- No component work yet; this step is tokens only.

---

## Step 2 — Add Reusable Pixel Utilities

**Files:**
- `frontend/src/index.css`

**Add utility classes:**
- `.pxl-surface` — surface background, `outline: var(--pixel-border)`, `box-shadow: var(--pixel-shadow)`, `border-radius: 0`.
- `.pxl-button` — Bungee font, hard edge, outline, offset shadow, active press transform.
- `.pxl-button-lime`, `.pxl-button-electric`, `.pxl-button-coral`, `.pxl-button-ghost`.
- `.pxl-badge` — DM Mono, uppercase-ish metadata styling, outline, hard edge.
- `.pxl-input` — Space Grotesk, no border, hard edge, focus outline.
- `.pxl-divider` — repeating pixel divider from the handover.

**Acceptance check:**
- Utilities are plain CSS and can be used from JSX via `className`.
- No global selector accidentally makes Mapbox controls unreadable.

---

## Step 3 — Migrate Navigation First

**Files:**
- `frontend/src/components/NavHeader.jsx`

**Do:**
1. Convert header surface to PXL styling: warm surface, bottom outline, no rounded elements except true avatar circles if needed.
2. Logo/title should use `--font-brand`.
3. Sign-in/profile button should use `.pxl-button` styling.
4. If using initials avatar, wrap with a hard pixel outline.

**Acceptance check:**
- Header reads as the new brand immediately.
- Auth state from `useUser` still works.
- Mobile header does not overflow.

---

## Step 4 — Migrate Core Event Components

**Files:**
- `frontend/src/components/EventCard.jsx`
- `frontend/src/components/EventModal.jsx`
- `frontend/src/components/AttendeeChips.jsx`
- `frontend/src/components/HostBadge.jsx`

**Do:**
1. Event cards become PXL community cards:
   - hard outline
   - no card radius
   - 4px top accent bar
   - title in Bungee
   - metadata in DM Mono
2. RSVP/action buttons use `.pxl-button` variants.
3. Event type pills use `.pxl-badge`.
4. Modal can keep `--radius-md` only if it is treated as a non-pixel overlay; internal form controls should still use `.pxl-input`.

**Acceptance check:**
- View mode and create mode still work.
- Required-field validation is still visible.
- EventCard click and EventModal close interactions still work.

---

## Step 5 — Migrate Home Layout

**Files:**
- `frontend/src/pages/Home.jsx`
- `frontend/src/components/MapView.jsx`
- `frontend/src/components/LocationPin.jsx`

**Do:**
1. Keep the map usable and visually dominant; do not bury it in a decorative card.
2. Convert surrounding panels/toolbars to PXL surfaces.
3. Replace rounded FAB styling with a PXL action button.
4. Leave Mapbox internals alone unless styling conflicts are obvious.
5. Preserve the future Maxxer layout slots from `STATE.md`:
   - desktop right sidebar slot for `ChatPanel`
   - mobile bottom drawer slot
   - highlighted event IDs flowing into `MapView`

**Acceptance check:**
- Locations still load from `/api/locations`.
- Event list still opens modals.
- Add Event flow still opens create mode.
- Map controls are clickable.

---

## Step 6 — Migrate Auth And Profile Surfaces

**Files:**
- `frontend/src/components/AuthModal.jsx`
- `frontend/src/pages/Profile.jsx`
- `frontend/src/components/ProfilePanel.jsx`
- `frontend/src/components/BadgeShelf.jsx`
- `frontend/src/components/BadgeUnlockModal.jsx`
- `frontend/src/components/Toaster.jsx`
- `frontend/src/components/NotificationFeed.jsx`

**Do:**
1. Auth inputs use `.pxl-input`; auth buttons use `.pxl-button`.
2. Profile card follows the handover:
   - lime banner or stripe
   - pixel avatar treatment
   - Bungee name
   - DM Mono handle/meta
3. BadgeShelf uses `.pxl-badge` language and hard outlined tiles.
4. Toasts use outline + coloured left accent.
5. Badge unlock can use `--ease-bounce`; normal UI transitions should not use `--ease-pixel`.

**Acceptance check:**
- Profile page loads for existing user.
- Badge fetch/error/loading states still render.
- Toasts appear above the app and do not block essential controls.

---

## Step 7 — Add Dark Mode Plumbing

**Files:**
- `frontend/src/App.jsx`
- `frontend/src/components/NavHeader.jsx`
- `frontend/src/index.css`

**Do:**
1. Add a small theme toggle in the nav if time allows.
2. Toggle `document.documentElement.dataset.theme` between `""` and `"dark"`.
3. Store selected theme in localStorage only if it is trivial; otherwise default to light for MVP.

**Acceptance check:**
- `data-theme="dark"` flips background/text/border tokens.
- Accent colours remain unchanged.
- Pixel shadows flip to light in dark mode.

---

## Step 8 — Mobile Pass

**Files:**
- `frontend/src/pages/Home.jsx`
- `frontend/src/components/EventCard.jsx`
- `frontend/src/components/EventModal.jsx`
- `frontend/src/pages/Profile.jsx`

**Do:**
1. Check 375px width first.
2. Make cards full-width and prevent Bungee headings from overflowing.
3. Ensure buttons wrap cleanly or become icon-only where appropriate.
4. Keep map height usable and avoid overlapping bottom controls.

**Acceptance check:**
- No horizontal scroll at 375px.
- Button text does not overflow.
- Modal content scrolls within viewport.

---

## Step 9 — Final QA Checklist

Run:
```bash
cd frontend
npm run build
```

Manual smoke test:
- First-visit auth modal
- Header signed-out and signed-in states
- Home map location load
- Event card open
- Event create modal validation
- Profile page
- Badge/toast surfaces if reachable
- Mobile at 375px
- Optional dark mode

Design QA:
- No rounded corners on pixel components.
- No blurred shadows on pixel components.
- Buttons are Bungee.
- Badges/meta are DM Mono.
- Body copy is Space Grotesk.
- Emoji feel intentional, not scattered.

---

## Suggested Commit Order

1. `feat(frontend): add pxl design tokens`
2. `feat(frontend): add pxl component utilities`
3. `style(frontend): apply pxl styling to nav and event UI`
4. `style(frontend): apply pxl styling to home and profile`
5. `style(frontend): polish responsive pxl layout`

Keep functionality changes out of these commits unless they are required to preserve existing behaviour.
