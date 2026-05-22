# Taste Map SF

> A world map explorer for San Francisco's global cuisine — click a country, discover its restaurants, and know exactly what to order.

---

## The Idea

San Francisco is one of the few cities in the world where you can eat cuisine from almost every country. But most people only end up cycling through the same familiar options. Taste Map SF is a visual, interactive tool that makes the full breadth of SF's food scene tangible — laid out on a world map, one country at a time.

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
- All data served from static JSON files bundled with the app

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

### JSON Schema

Each country in the dataset maps to a list of restaurants. The schema is intentionally flat and easy to edit by hand.

```json
{
  "countries": [
    {
      "id": "france",
      "name": "France",
      "continent": "Europe",
      "flag": "🇫🇷",
      "cuisine_summary": "Classic French cooking — buttery sauces, fresh bread, and long dinners.",
      "signature_dishes": [
        {
          "name": "Steak frites",
          "description": "Grilled steak served with crispy fries — a French bistro staple."
        },
        {
          "name": "Croque monsieur",
          "description": "A hot ham and melted cheese sandwich, often served with béchamel."
        },
        {
          "name": "Crème brûlée",
          "description": "Vanilla custard with a caramelized sugar crust, cracked tableside."
        }
      ],
      "restaurants": [
        {
          "id": "cafe-claude",
          "name": "Café Claude",
          "neighborhood": "Union Square",
          "address": "7 Claude Ln, San Francisco, CA 94108",
          "yelp_url": "https://www.yelp.com/biz/cafe-claude-san-francisco",
          "google_place_id": null,
          "rating_yelp": 4.2,
          "price_range": "$$",
          "must_order": ["Steak frites", "French onion soup"],
          "menu_verified": false,
          "sources": ["yelp", "reddit"],
          "tried": false
        }
      ]
    }
  ]
}
```

**Field notes:**
- `tried` is a boolean reserved for the Phase 3 food passport feature — include it now, leave it `false` for all entries
- `menu_verified` indicates whether the must-order dishes were confirmed against an actual menu (Phase 2 goal)
- `sources` is an array tracking where the restaurant data came from

---

## UI & Frontend

### Tech Stack

| Layer | Choice |
|---|---|
| Framework | React |
| Map rendering | D3.js (SVG world map with TopoJSON) — recommended for the level of custom interactivity needed |
| Data | Static JSON files, co-located with the app |
| Styling | TBD (Tailwind CSS recommended for speed) |
| Routing | React Router (for deep-linking to `/country/france` later) |

### Map Behavior

- The world map fills the viewport and is zoomable/pannable (mouse wheel + drag)
- All countries are rendered as SVG paths and are clickable
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
   - Price range
   - Rating
   - Which signature dishes are available there (Phase 2)
   - Link to Yelp/Google

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

## Folder Structure (Proposed)

```
taste-map-sf/
├── public/
│   └── world.topojson          # World map geometry file
├── src/
│   ├── components/
│   │   ├── WorldMap.jsx         # D3 SVG map + zoom/pan
│   │   ├── Avatar.jsx           # The little traveler figure
│   │   ├── CountryPanel.jsx     # Slide-in side panel
│   │   ├── RestaurantCard.jsx   # Individual restaurant entry
│   │   └── DishBadge.jsx        # Signature dish chip
│   ├── data/
│   │   └── restaurants.json     # The full dataset
│   ├── hooks/
│   │   └── useMapData.js        # Load and index the JSON data
│   └── App.jsx
├── scripts/
│   └── build-data/              # Data collection scripts (Yelp, Google, Reddit)
│       ├── fetch-yelp.js
│       ├── fetch-google.js
│       ├── harvest-reddit.js
│       └── merge.js
├── README.md
└── package.json
```

---

## Roadmap

| Phase | Milestone | Status |
|---|---|---|
| Phase 1 | World map renders with clickable countries | Not started |
| Phase 1 | Avatar teleports on country click | Not started |
| Phase 1 | Side panel shows restaurants + dishes for ~40 countries | Not started |
| Phase 1 | Data collection script (Yelp + Google + Reddit) | Not started |
| Phase 2 | Restaurant addresses + neighborhoods for all entries | Not started |
| Phase 2 | Menu cross-reference for must-order dishes | Not started |
| Phase 3 | "Tried this" tracking per country and restaurant | Not started |
| Phase 3 | Personal food passport stats + map visualization | Not started |

---

## Open Questions

- **How many countries to seed for the MVP?** SF has strong representation from ~60–80 cuisines. Starting with 40 is a reasonable weekend target.
- **Map library confirmation:** D3.js + TopoJSON is the recommended path given the need for custom SVG interactions and avatar placement. Worth confirming before starting the frontend.
- **Avatar design:** SVG icon vs. emoji vs. custom illustration — needs a decision before building the map component.
- **Yelp cuisine categories:** Yelp uses specific category slugs (e.g., `french`, `vietnamese`, `peruvian`) — the data script will need a mapping from country → Yelp category slug, which isn't always 1:1.

---

*Last updated: May 2026*
