# 🗺️ Taste Map SF

**Explore San Francisco's global cuisine, one country at a time.**

San Francisco is one of the few cities in the world where you can eat cuisine from nearly every country. Taste Map SF puts that on a map — literally. Navigate a world map, click a country, and instantly discover the best SF restaurants serving that cuisine along with exactly what to order.

![Taste Map SF — world map with side panel](./docs/screenshot-placeholder.png)

---

## Features

- **Interactive world map** — every country is clickable
- **Traveling avatar** — a small figure that teleports to whichever country you select
- **Slide-in country panel** — restaurants, signature dishes, and what to order for each cuisine
- **Google Maps deep-links** — every restaurant card opens directly in Google Maps
- **Hand-curated data** — Phase 1 picks sourced from Eater 38, Michelin Bib Gourmand, and r/sanfrancisco
- **No backend required** — all data is bundled with the app

---

## Tech Stack

- **React + TypeScript** (Vite) — UI framework
- **react-simple-maps** over D3-geo — SVG world map with TopoJSON
- **Tailwind CSS** — styling
- **Vitest + React Testing Library** — tests
- **Static TypeScript data** — restaurants live in `src/data/restaurants.ts`

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install & Run

```bash
git clone https://github.com/your-username/taste-map-sf.git
cd taste-map-sf
npm install
npm run dev
```

The app will be running at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

---

## Data

All restaurant data lives in `src/data/restaurants.ts` as a typed TypeScript constant — TypeScript catches missing fields and typos at compile time. Each restaurant entry is minimal:

```ts
{
  id: "cafe-claude",
  name: "Café Claude",
  neighborhood: "Union Square",
  // address?: optional, surfaced in Phase 2
  // tried?:   optional, reserved for Phase 3 food passport
}
```

Only `id`, `name`, and `neighborhood` are required. The restaurant card builds a Google Maps search link on the fly from `name + neighborhood + "San Francisco"`, so there's no per-entry URL field to keep current.

Phase 2 will enrich each record with `address`, `must_order` dishes (cross-referenced against actual menus), and `sources` (provenance: Yelp / Google / Reddit).

### Building the Dataset

Phase 1 data is hand-curated. Edit `src/data/restaurants.ts` directly — there is no automated build pipeline yet.

A Phase 2 effort will add `scripts/build-data/` to pull from the Yelp Fusion API, Google Places, and Reddit, with a merge + manual review pass that emits a new `restaurants.ts`. API keys will be needed at that point; none are required for Phase 1.

---

## Roadmap

- [x] Project spec & data schema
- [x] World map with clickable countries
- [x] Avatar + teleport mechanic
- [x] Side panel with restaurant cards
- [x] Seed data for ~18 cuisines (hand-curated)
- [ ] Data pipeline (Yelp + Google + Reddit) — Phase 2
- [ ] Restaurant addresses for every entry — Phase 2
- [ ] Menu cross-reference for must-order dishes — Phase 2
- [ ] Food passport — personal "tried this" tracking — Phase 3

---

## Contributing

Found a great restaurant that's missing? Spotted an error? Contributions are welcome.

1. Fork the repo
2. Edit `src/data/restaurants.ts` directly, or open an issue with the restaurant details
3. Submit a pull request

Please keep entries to restaurants that are currently open and genuinely represent the cuisine well.

---

## License

MIT
