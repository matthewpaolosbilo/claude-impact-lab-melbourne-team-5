# PXL // DS — Design System v3.0
## Claude Code Handover Document

> **Bungee Edition · Gen Z · Pixel Art · Light + Dark**  
> Community design system for connection apps. Warm neutral canvas, electric pixel accents, emoji as a first-class language.

---

## 1. Overview

PXL // DS is a single-file HTML design system (`pxl-ds-v3.html`) covering all tokens, components, and guidelines needed to build a community/social app with a Gen Z pixel-art aesthetic. Everything is defined in CSS custom properties on `:root` with a `[data-theme="dark"]` override block for dark mode.

**Key design decisions to preserve:**
- The "pixel principle" governs all components: hard edges, 2px outlines, offset shadows. No `border-radius` on pixel components.
- Three Google Fonts, three distinct jobs (see Typography below).
- Light/dark mode is toggled by setting `data-theme="dark"` on `<html>`.

---

## 2. Fonts

Import from Google Fonts — all three are required:

```css
@import url('https://fonts.googleapis.com/css2?family=Bungee&family=Space+Grotesk:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
```

| Token | Family | Weight | Use |
|---|---|---|---|
| `--font-brand` | Bungee | 400 / 700 | Logo, headings, buttons, nav |
| `--font-body` | Space Grotesk | 400 / 500 | Body copy, labels, forms |
| `--font-mono` | DM Mono | 400 / 500 | Badges, tags, timestamps, metadata |

**Never mix roles.** Buttons always use `--font-brand`. Badges always use `--font-mono`. Body copy always uses `--font-body`.

---

## 3. Colour Tokens

### Accent palette

| Token | Hex | Semantic use |
|---|---|---|
| `--color-lime` | `#C8F135` | Primary action |
| `--color-lime-ink` | `#2a4000` | Text on lime backgrounds |
| `--color-electric` | `#7B5EA7` | Brand anchor / secondary CTA |
| `--color-electric-ink` | `#f0e6ff` | Text on electric backgrounds |
| `--color-coral` | `#FF6147` | Alert / urgency / destructive |
| `--color-sky` | `#4DAEEC` | Info / connect |
| `--color-mint` | `#3ECFAC` | Success |
| `--color-candy` | `#FF8DC7` | Delight / fun moments |
| `--color-amber` | `#FFB830` | Warning |

### Backgrounds (light)

| Token | Hex |
|---|---|
| `--color-bg-primary` | `#F5F4F0` |
| `--color-bg-secondary` | `#EDECE8` |
| `--color-bg-tertiary` | `#E4E3DF` |
| `--color-surface` | `#FFFFFF` |

### Backgrounds (dark) — set via `[data-theme="dark"]`

| Token | Hex |
|---|---|
| `--color-bg-primary` | `#141413` |
| `--color-bg-secondary` | `#1C1C1A` |
| `--color-bg-tertiary` | `#252522` |
| `--color-surface` | `#1F1F1D` |

### Text

| Token | Light | Dark |
|---|---|---|
| `--color-text-primary` | `#1A1917` | `#F0EFE9` |
| `--color-text-secondary` | `#6B6A65` | `#9E9D97` |
| `--color-text-tertiary` | `#9E9D97` | `#6B6A65` |

### Borders

| Token | Light | Dark |
|---|---|---|
| `--border` | `rgba(26,25,23,0.10)` | `rgba(240,239,233,0.08)` |
| `--border-strong` | `rgba(26,25,23,0.20)` | `rgba(240,239,233,0.16)` |

---

## 4. The Pixel System

This is the core visual identity. Three rules, applied to every component:

```css
--pixel-unit:            8px;
--pixel-border:          2px solid #1A1917;   /* dark: 2px solid #F0EFE9 */
--pixel-shadow:          3px 3px 0 #1A1917;   /* dark: 3px 3px 0 #F0EFE9 */
--pixel-shadow-lime:     3px 3px 0 #C8F135;
--pixel-shadow-electric: 3px 3px 0 #7B5EA7;
--pixel-shadow-coral:    3px 3px 0 #FF6147;
```

**Rules:**
1. **Hard edges** — `border-radius: 0` on all pixel components. No exceptions.
2. **Outline, not border** — use `outline: 2px solid var(--color-text-primary)` (outlines don't affect layout, borders do).
3. **Offset shadow** — solid `3px 3px 0` shadow, no blur. On `:active`, reduce to `1px 1px 0` and `transform: translate(2px, 2px)` to simulate a press.

**Non-pixel surfaces** (modals, tooltips, cards that aren't part of the pixel language) may use:
```css
--radius-sm:   4px;
--radius-md:   8px;
--radius-pill: 999px;
```

---

## 5. Spacing

8px grid. Always use multiples of 8.

| Token | Value |
|---|---|
| `--sp-1` | 4px |
| `--sp-2` | 8px |
| `--sp-3` | 12px |
| `--sp-4` | 16px |
| `--sp-6` | 24px |
| `--sp-8` | 32px |
| `--sp-12` | 48px |
| `--sp-16` | 64px |

---

## 6. Typography Scale

| Class | Font | Size | Notes |
|---|---|---|---|
| Display 1 | Bungee 400 | 48px | Hero headings |
| Display 2 | Bungee 400 | 30px | Section headings |
| Display 3 | Bungee 400 | 20px | Sub-headings, card titles |
| Body | Space Grotesk 400 | 15px | Line-height 1.7 |
| Caption | Space Grotesk 400 | 13px | Secondary info |
| Mono | DM Mono 400 | 13px | Badges, tags, IDs |
| Label (mono) | DM Mono | 9–11px | Section labels, uppercase + `letter-spacing: 0.10em` |

---

## 7. Components

### Buttons

All buttons: `font-family: var(--font-brand)`, hard edges, pixel border/shadow. On `:active`: `transform: translate(2px, 2px)` + reduce shadow to `1px 1px 0`.

| Class | Background | Text | Shadow colour |
|---|---|---|---|
| `btn-primary` | `--color-text-primary` | `--color-bg-primary` | lime |
| `btn-lime` | `--color-lime` | `--color-lime-ink` | dark |
| `btn-outline` | transparent | `--color-text-primary` | dark |
| `btn-ghost` | `--color-bg-secondary` | `--color-text-secondary` | none |
| `btn-electric` | `--color-electric` | `--color-electric-ink` | dark |
| `btn-coral` | `--color-coral` | `#fff` | dark |

Base padding: `10px 22px`. Font size: `15px`.

### Badges

`font-family: var(--font-mono)`, `font-size: 10px`, `padding: 4px 10px`. Hard pixel outline (not shadow).

| Class | Background | Text | Outline |
|---|---|---|---|
| `b-lime` | `--color-lime` | `--color-lime-ink` | `--color-text-primary` |
| `b-mint` | `#d6fff6` | `#0a3329` | `--color-mint` |
| `b-coral` | `#ffe5e0` | `#6b1a0c` | `--color-coral` |
| `b-electric` | `#ece8ff` | `#2e1a5e` | `--color-electric` |
| `b-neutral` | `--color-bg-tertiary` | `--color-text-secondary` | `--border-strong` |
| `b-candy` | `#ffe8f4` | `#6b0032` | `--color-candy` |

### Inputs

```css
.ds-input {
  font-family: var(--font-body);
  font-size: 13px;
  background: var(--color-bg-secondary);
  outline: 2px solid var(--border-strong);
  padding: 10px 13px;
  border: none;
  border-radius: 0;
}
.ds-input:focus { outline: 2px solid var(--color-text-primary); }
```

Labels: `font-family: var(--font-body)`, `font-size: 12px`, `font-weight: 500`, `color: var(--color-text-secondary)`.  
Help text: `font-family: var(--font-mono)`, `font-size: 10px`, `color: var(--color-text-tertiary)`.

### Toasts / Notifications

`outline: 2px solid var(--color-text-primary)`, `border-left: 4px solid <accent>`, `background: var(--color-surface)`.

| Class | Left border colour |
|---|---|
| `toast-success` | `--color-mint` |
| `toast-warning` | `--color-amber` |
| `toast-error` | `--color-coral` |
| `toast-info` | `--color-sky` |

### Community Cards

3-column grid, `gap: 10px`. Each card: `outline: 2px solid var(--color-text-primary)`, `border-radius: 0`.

- Top accent bar: `height: 4px`, uses an accent colour.
- Title: `font-family: var(--font-brand)`, `font-size: 16px`.
- Meta: `font-family: var(--font-mono)`, `font-size: 10px`.
- Dark variant (`comm-card-dark`): inverted — `background: var(--color-text-primary)`, title in `--color-lime`.

### Profile Card

- Banner: `height: 56px`, lime stripe pattern.
- Avatar: `48×48px`, pixel-art SVG, `outline: 3px solid var(--color-surface)`, `margin-top: -24px` (overlaps banner).
- Name: `font-family: var(--font-brand)`.
- Handle: `font-family: var(--font-mono)`, `font-size: 10px`.
- Interest tags: `font-family: var(--font-mono)`, `font-size: 10px`, `background: var(--color-bg-secondary)`, `outline: 1px solid var(--border-strong)`.

### Interest Tags (`.itag`)

`font-family: var(--font-brand)`, `font-size: 14px`, `padding: 6px 14px`, `outline: 2px solid var(--color-text-primary)`.

- Active state: `box-shadow: var(--pixel-shadow)` + background is the accent colour.
- Inactive: `background: var(--color-bg-secondary)`, `outline: 2px solid var(--border-strong)`.

### Connection Suggestion Card

Header bar in `--color-lime` showing shared interest count. Body: avatar + name + shared tags. Footer: primary CTA + ghost skip button.

### Avatars

Pixel-art SVGs with `image-rendering: pixelated`. Sizes: 24, 32, 40, 48, 64px. Always wrapped with `outline: 2px solid var(--color-text-primary)` (or surface colour when overlapping).

---

## 8. Motion

```css
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);    /* buttons, interactions */
--ease-out:     cubic-bezier(0.25, 0.46, 0.45, 0.94);  /* page transitions */
--ease-bounce:  cubic-bezier(0.68, -0.55, 0.265, 1.55);/* celebrations */
--ease-pixel:   steps(6, end);                          /* sprite movement ONLY */

--dur-fast:  150ms;
--dur-base:  240ms;
--dur-slow:  400ms;
```

Use `--ease-pixel` **only** for pixel-art sprite/character movement. Do not use it for UI transitions. Stepped easing on regular UI elements breaks the feel.

---

## 9. Emoji

Emoji are first-class UI elements — not decoration. They appear in interest tags, community titles, profile handles, empty states, and toasts. Categories used in the design system:

- **Reaction**: ✦ ⚡ 🔥 💫 ✨ 🌀
- **Social**: 👋 🎯 🚩
- **Interest**: 🎧 🎮 ✏️ 📸 🌿 🍜 🎬 💅
- **Status/feedback**: 🎉 ⚡ ✅ ❌

Emoji font size in interest tags: `20px+`. In inline UI copy: match surrounding text size.

---

## 10. Voice & Tone

Write like a person who uses the app. Warm, punchy, direct. Never corporate.

**Do:**
- "You joined Pixel Art Club — 892 people are hyped to meet you 🎉"
- "Nobody in your area yet — be the first to plant a flag 🚩"
- "3 people nearby are also into hyperpop ⚡ say hi?"
- "Something broke — not the vibe. We're on it ⚡"

**Don't:**
- "You have successfully joined the community. Welcome aboard."
- "No communities found in your location."
- "3 users with matching interests have been found in your area."
- "An error has occurred. Please try again later or contact support."

Copy should celebrate belonging and make people feel seen. Emoji at the end of key messages, not scattered throughout.

---

## 11. Dark Mode

Toggle by setting `data-theme="dark"` on `<html>`. The CSS override block handles all colour changes automatically. The pixel border and shadow colours flip from dark (`#1A1917`) to light (`#F0EFE9`). Accent colours remain unchanged in dark mode.

```javascript
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
}
```

---

## 12. Pixel Divider

Between major sections, use the repeating pixel divider:

```css
.px-div {
  height: 8px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-lime)          0, var(--color-lime)          8px,
    var(--color-text-primary)  8px, var(--color-text-primary) 16px,
    var(--color-electric)      16px, var(--color-electric)    24px,
    var(--color-text-primary)  24px, var(--color-text-primary) 32px,
    var(--color-coral)         32px, var(--color-coral)       40px,
    var(--color-text-primary)  40px, var(--color-text-primary) 48px,
    var(--color-mint)          48px, var(--color-mint)        56px,
    var(--color-text-primary)  56px, var(--color-text-primary) 64px
  );
  margin: 0 0 56px;
}
```

---

## 13. Pixel Avatar Art (SVG)

Avatars are pixel SVGs using a consistent 10×13 or 12×12 grid with `image-rendering: pixelated`. The sprite colour scheme maps head colour → body colour, allowing accent-colour variants:

```svg
<!-- 10×13 grid sprite -->
<svg width="40" height="52" viewBox="0 0 10 13" style="image-rendering:pixelated">
  <rect x="3" y="0" width="4" height="4" fill="[HEAD COLOUR]"/>
  <rect x="2" y="4" width="6" height="9" fill="[BODY COLOUR]"/>
  <rect x="4" y="2" width="1" height="1" fill="#1A1917"/>  <!-- left eye -->
  <rect x="6" y="2" width="1" height="1" fill="#1A1917"/>  <!-- right eye -->
  <rect x="4" y="3" width="3" height="1" fill="#1A1917"/>  <!-- mouth -->
</svg>
```

Always wrap sprites with `outline: 2px solid rgba(255,255,255,0.12)` (on dark backgrounds) or `outline: 2px solid var(--color-text-primary)` (on light).

---

## 14. Quick-Copy Token Block

Paste this into your `tokens.css` / `variables.css` / `:root` stylesheet:

```css
@import url('https://fonts.googleapis.com/css2?family=Bungee&family=Space+Grotesk:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

:root {
  --font-brand:            'Bungee', sans-serif;
  --font-body:             'Space Grotesk', sans-serif;
  --font-mono:             'DM Mono', monospace;

  --color-bg-primary:      #F5F4F0;
  --color-bg-secondary:    #EDECE8;
  --color-bg-tertiary:     #E4E3DF;
  --color-surface:         #FFFFFF;

  --color-text-primary:    #1A1917;
  --color-text-secondary:  #6B6A65;
  --color-text-tertiary:   #9E9D97;

  --color-lime:            #C8F135;
  --color-lime-ink:        #2a4000;
  --color-electric:        #7B5EA7;
  --color-electric-ink:    #f0e6ff;
  --color-coral:           #FF6147;
  --color-sky:             #4DAEEC;
  --color-mint:            #3ECFAC;
  --color-candy:           #FF8DC7;
  --color-amber:           #FFB830;

  --border:                rgba(26,25,23,0.10);
  --border-strong:         rgba(26,25,23,0.20);

  --pixel-unit:            8px;
  --pixel-border:          2px solid #1A1917;
  --pixel-shadow:          3px 3px 0 #1A1917;
  --pixel-shadow-lime:     3px 3px 0 #C8F135;
  --pixel-shadow-electric: 3px 3px 0 #7B5EA7;
  --pixel-shadow-coral:    3px 3px 0 #FF6147;

  --radius-sm:             4px;
  --radius-md:             8px;
  --radius-pill:           999px;

  --sp-1:  4px;  --sp-2:  8px;  --sp-3: 12px;  --sp-4: 16px;
  --sp-6: 24px;  --sp-8: 32px;  --sp-12: 48px; --sp-16: 64px;

  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:     cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-bounce:  cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-pixel:   steps(6, end);
  --dur-fast: 150ms;  --dur-base: 240ms;  --dur-slow: 400ms;
}

[data-theme="dark"] {
  --color-bg-primary:      #141413;
  --color-bg-secondary:    #1C1C1A;
  --color-bg-tertiary:     #252522;
  --color-surface:         #1F1F1D;
  --color-text-primary:    #F0EFE9;
  --color-text-secondary:  #9E9D97;
  --color-text-tertiary:   #6B6A65;
  --border:                rgba(240,239,233,0.08);
  --border-strong:         rgba(240,239,233,0.16);
  --pixel-border:          2px solid #F0EFE9;
  --pixel-shadow:          3px 3px 0 #F0EFE9;
}
```

---

## 15. Common Mistakes to Avoid

- **Adding `border-radius` to pixel components.** If it uses `--pixel-border` or `--pixel-shadow`, `border-radius` must be `0`.
- **Using `border` instead of `outline`.** Outlines don't affect box model. This matters for the 2px pixel border.
- **Using `--ease-pixel` for UI transitions.** Stepped easing is for sprites only.
- **Using `border-left` alone for the full card border.** Cards use `outline` for the full perimeter + `border-left` for the coloured accent only (toasts).
- **Overriding accent colours in dark mode.** The 7 accent colours (`--color-lime`, `--color-electric`, etc.) are intentionally the same in both modes.
- **Mismatching font to role.** Buttons = Bungee. Badges = DM Mono. Body = Space Grotesk. Never swap.
