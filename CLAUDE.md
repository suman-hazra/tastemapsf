# Tastemap SF

> A world map explorer for San Francisco's global cuisine — click a country, discover its restaurants, and know exactly what to order.

---

## The Idea

San Francisco is one of the few cities in the world where you can eat cuisine from almost every country. But most people only end up cycling through the same familiar options. Tastemap SF is a visual, interactive tool that makes the full breadth of SF's food scene tangible — laid out on a world map, one country at a time.

The core experience: navigate a world map, click on any country, and instantly see the best SF restaurants serving that cuisine alongside the dishes you should order if you've never tried it before.

---

## Project Phases

### Phase 1 — The Map (Weekend MVP)

The goal of Phase 1 is a working, shareable web app with no backend required.

- A zoomable, scrollable world map built in React
- Every country is clickable
- A small human-like avatar that teleports to whichever country you click
- Clicking a country slides in a panel from the right showing:
  - Restaurants in SF serving that cuisine
  - Top 3–5 must-order dishes for that cuisine
- All data authored as hand-edited CSVs in `data/`, generated into a typed TS module (`src/data/restaurants.ts`) bundled with the app — no backend

### Phase 2 — Richer Data

Enrich the existing restaurant records with:

- Full address and neighborhood for each restaurant
- Cross-referenced menu data: confirm the recommended dishes are actually on the menu
- Dish descriptions for people unfamiliar with the cuisine
- Source attribution (Yelp, Google, Reddit, etc.) for each restaurant entry

### Phase 3 — Food Passport (Future)

Allow users to track their own culinary journey across the map:

- Mark countries as "tried" and individual restaurants as visited
- Visual progress on the map (e.g., countries you've eaten shade differently)
- Personal stats ("You've tried 34 of 80 cuisines available in SF")

> Note: The data schema in Phase 1 should be designed to support this feature even if it isn't built yet.

---

## Current Implementation Snapshot

Updated 2026-05-26.

- The food passport loop has been pulled into the shipped app: users can mark countries as tried, see the counter update, and reopen the app with tried state restored from `localStorage`.
- The hamburger menu now has four items: `View list`, `About`, `Get involved`, and `Legal & credits`.
- `About` is a dedicated story dialog. `Get involved` is a separate dialog with GitHub, restaurant-tip, email, and social links. Legal/privacy/attribution remain in `Legal & credits` and `LEGAL.md`.
- Mobile is no longer a minimal fallback. It uses a compact top bar, a cover-cropped map that fills the available frame, floating filter pills (`Soon`, `In SF`, `Tried`), and a floating `Finish` CTA inside the map.
- Mobile map panning bounds are computed from the actual cropped viewport so users can pan to offscreen regions such as Australia.
- Mobile hides desktop-only map affordances that do not make sense in the cropped view: the `Back to world view` button, tried-country flag overlays, and the San Francisco text label. The San Francisco marker dot remains.
- About, Get involved, and Legal sheets use `dvh`-aware mobile height caps to avoid iOS Safari toolbar clipping.
- Desktop keeps the original larger hero/header composition, desktop legend labels, desktop map controls, and desktop marker labels.

---

## Data

### Sources

Restaurant data will be sourced through a mix of automated scraping and light manual curation. The goal is for AI-driven collection to handle 80–90% of the work.

| Source | What it provides |
|---|---|
| **Yelp Fusion API** | Restaurant name, address, category, rating, review count |
| **Google Places API** | Corroborating data, additional details, menu links |
| **Google Search** | General cuisine guides, "best [X cuisine] SF" articles |
| **Reddit (r/sanfrancisco, r/AskSF)** | Community-sourced hidden gems and strong local recommendations |
| **Manual review** | Final pass to prune low-quality entries and spot-check recommendations |

### Schema (Phase 1)

Each country maps to a list of restaurants. The schema is intentionally flat and easy to edit by hand. Data is authored as a typed TypeScript module (`src/data/restaurants.ts`) — same shape, but TypeScript catches missing fields and typos at compile time.

```ts
{
  id: "france",
  name: "France",
  continent: "Europe",
  flag: "🇫🇷",
  cuisine_summary: "Classic French cooking — buttery sauces, fresh bread, and long dinners.",
  signature_dishes: [
    { name: "Steak frites",     description: "Grilled steak served with crispy fries — a French bistro staple." },
    { name: "Croque monsieur",  description: "A hot ham and melted cheese sandwich, often served with béchamel." },
    { name: "Crème brûlée",     description: "Vanilla custard with a caramelized sugar crust, cracked tableside." },
  ],
  restaurants: [
    {
      id: "cafe-claude",
      name: "Café Claude",
      neighborhood: "Union Square",
      // address?: optional, surfaced in Phase 2
      // tried?:   optional, reserved for Phase 3 food passport
    },
  ],
}
```

**Field notes:**
- Only `id`, `name`, `neighborhood` are required on a restaurant. Everything else is optional and rendered conditionally.
- The restaurant card builds a Google Maps search link on the fly from `name + neighborhood + "San Francisco"` — no per-entry URL field to maintain.
- `tried` is reserved for the Phase 3 food passport. Not displayed in Phase 1.

**Phase 2 will add to the restaurant schema:**
- Full street `address` filled in for every entry
- `must_order` dishes (cross-referenced against actual menus)
- `sources` array tracking provenance (Yelp, Google, Reddit, etc.)
- `menu_verified` flag once must-order dishes are confirmed on a real menu

---

## UI & Frontend

### Tech Stack

| Layer | Choice |
|---|---|
| Framework | React + TypeScript (Vite) |
| Map rendering | `react-simple-maps` over D3-geo, with a static TopoJSON world file |
| Data | Static typed TS module (`src/data/restaurants.ts`), co-located with the app |
| Styling | Tailwind CSS |
| Routing | None in Phase 1. React Router added later for deep-linking to `/country/france`. |

### Map Behavior

- The world map fills the viewport and is zoomable/pannable (mouse wheel + drag)
- All countries are rendered as SVG paths and are clickable
- Seeded microstates and small island nations omitted from the 110m TopoJSON are rendered as clickable pins from `UNMAPPED_SLUG_COORDINATES`
- Countries with SF restaurant data are visually distinct (e.g., slightly highlighted or a different fill)
- Countries with no data are still clickable but show a friendly "No restaurants found yet" state

### The Avatar

- A small human-like SVG figure sits on the map
- When a user clicks a country, the avatar teleports instantly to the centroid of that country
- The avatar serves as a playful indicator of "where you are" on the map

### Side Panel

Slides in from the right when a country is selected. Contains:

1. Country name + flag
2. One-line cuisine summary
3. Signature dishes to order (with short descriptions)
4. Restaurant cards, each showing:
   - Name + neighborhood
   - A link that opens the restaurant in Google Maps (built on the fly from name + neighborhood + "San Francisco")
   - Which signature dishes are available there (Phase 2)

   No rating or price range is copied into the card — those go stale and create attribution liability. The Google Maps listing is the source of truth for fresh details.

---

## Data Collection Script (Phase 1)

A separate Node.js or Python script (not part of the web app) will be responsible for building the JSON files. High-level flow:

1. **Seed list** — define the list of countries/cuisines to target (start with ~40–60 countries well-represented in SF)
2. **Yelp scrape** — for each cuisine, query the Yelp Fusion API for top SF results filtered by cuisine category
3. **Google corroboration** — cross-reference with Google Places to fill gaps and validate addresses
4. **Reddit harvest** — search r/sanfrancisco and r/AskSF for top recommendation threads; extract restaurant names mentioned by community
5. **Merge + deduplicate** — combine results, remove duplicates, score by source agreement
6. **Manual review pass** — human spot-check of the final list
7. **Output** — write the final `data.json`

---

## Folder Structure (Actual)

```
tastemapsf/
├── public/
│   ├── countries-110m.json     # World map geometry (TopoJSON)
│   ├── newlogo.png             # Brand logo (README header + share image)
│   ├── og.png                  # Open Graph social preview
│   ├── favicon.png             # Browser tab icon
│   ├── avatar.svg              # Map avatar figure
│   └── dolores.jpg             # Welcome dialog photo
├── src/
│   ├── components/             # WorldMap, CountryPanel, ScoreDialog, Counter, … (.tsx)
│   │   ├── AboutDialog.tsx      # Project story dialog
│   │   ├── GetInvolvedDialog.tsx # GitHub/contact/contribution dialog
│   │   └── LegalDialog.tsx      # Policy + attribution dialog
│   ├── data/
│   │   ├── types.ts            # Country / Restaurant / Dish interfaces
│   │   ├── restaurants.ts      # AUTO-GENERATED dataset (do not hand-edit)
│   │   └── countryIdMap.ts     # TopoJSON ISO code → country slug
│   ├── hooks/
│   │   └── useMapData.ts        # Load + index map geometry and centroids
│   ├── styles/
│   │   └── tokens.ts            # Color tokens for react-simple-maps (raw hex)
│   ├── utils/
│   │   └── toggleSlug.ts        # Immutable tried-set toggle (unit tested)
│   ├── index.css                # Tailwind v4 @theme tokens + base styles
│   ├── App.tsx                  # Root: panel/prompt state machine + counter
│   └── main.tsx
├── data/                        # Source-of-truth CSVs (hand-edited)
│   ├── countries.csv            # Country metadata + signature dishes
│   ├── restaurants.csv          # Restaurants joined by country_id
│   ├── build.mjs                # CSV → src/data/restaurants.ts generator
│   └── README.md                # Data editing workflow
├── README.md
├── CLAUDE.md
├── LEGAL.md
├── TODOS.md
└── package.json
```

---

## Roadmap

| Phase | Milestone | Status |
|---|---|---|
| Phase 1 | World map renders with clickable countries | ✅ Shipped |
| Phase 1 | Avatar teleports on country click | ✅ Shipped |
| Phase 1 | Side panel shows restaurants + dishes | ✅ Shipped (75 of 180 countries seeded with restaurants) |
| Phase 1 | Data collection script (Yelp + Google + Reddit) | Changed — CSV + LLM-assisted curation instead of an API scraper |
| Phase 2 | Restaurant addresses + neighborhoods for all entries | Not started (neighborhoods done; addresses deferred) |
| Phase 2 | Menu cross-reference for must-order dishes | Not started |
| Phase 3 | "Tried this" tracking per country and restaurant | ✅ Shipped (food passport pulled forward into Phase 1) |
| Phase 3 | Personal food passport stats + map visualization | Partial — score dialog + map coloring shipped; local-device persistence shipped; cross-device persistence deferred |

---

## Open Questions

- **How many countries to seed for the MVP?** SF has strong representation from ~60–80 cuisines. Starting with 40 is a reasonable weekend target.
- **Map library confirmation:** D3.js + TopoJSON is the recommended path given the need for custom SVG interactions and avatar placement. Worth confirming before starting the frontend.
- **Avatar design:** SVG icon vs. emoji vs. custom illustration — needs a decision before building the map component.
- **Yelp cuisine categories:** Yelp uses specific category slugs (e.g., `french`, `vietnamese`, `peruvian`) — the data script will need a mapping from country → Yelp category slug, which isn't always 1:1.

---

*Last updated: 2026-05-26*
