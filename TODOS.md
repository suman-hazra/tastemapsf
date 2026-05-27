# TODOS — Tastemap SF

Captured during /plan-ceo-review on 2026-05-21. Most items below were explicitly deferred during the cherry-pick ceremony or surfaced by the outside-voice (Codex) review.

Priorities:
- **P1** — should land in the first iteration after Phase 1 ships
- **P2** — nice-to-have, do when convenient
- **P3** — polish; do only if you feel like it

> Item numbers below are stable identifiers; completed items keep their original
> number and move to the Completed section rather than being renumbered.

---

## ✅ Completed

### 2. Touch zoom on the world map
Shipped — the map is wrapped in `react-simple-maps` `<ZoomableGroup>`, so phone
users can pinch-zoom to tap small countries.
**Completed:** 2026-05-24

### 4. "Surprise me" / random untried-country button
Shipped as **Pick My Next Bite** — a lottery-style wheel picks an untried
country, reveals it with a larger flag animation, then opens that country's
details.
**Completed:** 2026-05-24

### 1. Proper mobile responsive (bottom sheet + touch-friendly map)
Shipped — mobile now uses a compact top bar, full-height cover-cropped map,
floating filter pills, a bottom `Map` / `List` toggle, mobile-safe panning
bounds, hidden desktop-only map controls/labels, and iOS-safe dialog heights.
The mobile score pill opens the score dialog, and country details already
render as the mobile bottom-sheet style.
**Completed:** 2026-05-26

### 10. About page
Shipped as hamburger-menu dialogs instead of a route. `About` contains the
project story; `Get involved` is a separate menu item/dialog for GitHub,
restaurant tips, email, and social links.
**Completed:** 2026-05-26

---

## P1 — first follow-up iteration

No open P1 items.

---

## P2 — nice to have

### 3. Continent-level progress breakdown
**What:** Show per-continent stats below the global counter (e.g. "Asia: 6/14 · Africa: 1/9").
**Why:** Adds texture beyond the single global count; surfaces "I've barely touched Africa" style insights.
**Context:** Schema already has `continent` per country, so the grouping is free. Just a render addition.
**Effort:** S (~30 min human / ~5 min CC)

> Item 4 ("Surprise me") shipped as Pick My Next Bite — see the Completed section.

### 5. Keyboard accessibility for the map
**What:** Tab to focus map, arrow keys to navigate countries, Enter to open panel.
**Why:** Makes the site usable by keyboard-only users; raises the quality bar.
**Context:** `react-simple-maps` does not provide this for free. Requires rendering focusable elements over geographies and wiring arrow-key state machine.
**Effort:** M (~1-2h human / ~20 min CC)

### 6. Persistence + shareable passport URL (paired)
**What:** Add real persistence (localStorage → eventually Supabase/Firebase + auth) and let users share their passport state via a URL.
**Why:** This is the actual Phase 2 vision. The session-only Phase 1 passport is a personal experience; this turns it social.
**Context:** Local-device persistence via `localStorage` is shipped. This item now specifically means cross-device/server persistence and a shareable passport state URL.
**Effort:** L (~1-2 days human / ~2-4h CC) — design + plan separately

---

## P3 — polish, do if you feel like it

### 7. Animated avatar trail between countries
**What:** Instead of teleporting, the avatar slides between countries with a tiny flight path or footprint trail.
**Why:** Cosmetic delight. Pure "made with love" energy.
**Effort:** S (~1-2h human)

### 8. "You've unlocked X cuisine!" first-time toast
**What:** When the user marks the first country in a new continent (or just any country), show a celebratory toast.
**Why:** Amplifies the dopamine of the loop.
**Effort:** S (~30 min)

### 9. Onboarding tooltip for first-time visitors
**What:** A subtle tooltip pointing at the map: "Click a country to start your passport."
**Why:** Reduces "what do I do?" friction.
**Effort:** S (~20 min)

### 11. Phase 2 test foundation: two starter tests
**What:** When Phase 2 begins, write at minimum:
  - A render test that `<RestaurantCard>` with only `{id, name, neighborhood}` does not crash.
  - A state test that toggling tried on country A then country B yields `triedSet = {a, b}` and counter = 2.
**Why:** Bootstraps the test suite cleanly before complexity arrives.
**Effort:** S (~30 min)

### 12. Restaurant ordering / "go here first" badge (revisit)
**What:** Originally proposed as a "sort by rating" feature, but ratings were dropped from cards. Could still mark one restaurant per country as "start here" via a `featured: true` flag in the data.
**Why:** Helps decision paralysis when a country has 3 options.
**Effort:** S (~30 min)
**Note:** Re-scope before doing — original premise (Yelp rating) is gone.

---

## Phase 2+ scope (planning placeholder)

The original CLAUDE.md describes Phase 2 (data enrichment via Yelp/Google/Reddit scraping) and Phase 3 (passport tracking). The Phase 1 changes shift the boundaries:
- The food passport is already in Phase 1.
- Phase 2 absorbs: persistence + auth + share, full mobile, keyboard a11y, automated data pipeline.
- Phase 3 becomes the social layer: public passports, leaderboards, restaurant tips, photos.

A new `/plan-ceo-review` session is warranted at the start of Phase 2.
