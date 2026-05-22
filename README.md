# 🗺️ Taste Map SF

**Explore San Francisco's global cuisine, one country at a time.**

San Francisco is one of the few cities in the world where you can eat cuisine from nearly every country. Taste Map SF puts that on a map — literally. Navigate a world map, click a country, and instantly discover the best SF restaurants serving that cuisine along with exactly what to order.

![Taste Map SF — world map with side panel](./docs/screenshot-placeholder.png)

---

## Features

- **Interactive world map** — zoomable and pannable, every country is clickable
- **Traveling avatar** — a small figure that teleports to whichever country you select
- **Slide-in country panel** — restaurants, signature dishes, and what to order for each cuisine
- **Curated data** — restaurants sourced from Yelp, Google Places, and the SF Reddit community
- **No backend required** — all data lives in static JSON files

---

## Tech Stack

- **React** — UI framework
- **D3.js + TopoJSON** — SVG world map rendering and interactivity
- **Static JSON** — restaurant and cuisine data, bundled with the app

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

All restaurant data lives in `src/data/restaurants.json`. Each entry follows this shape:

```json
{
  "id": "cafe-claude",
  "name": "Café Claude",
  "neighborhood": "Union Square",
  "address": "7 Claude Ln, San Francisco, CA 94108",
  "rating_yelp": 4.2,
  "price_range": "$$",
  "must_order": ["Steak frites", "French onion soup"],
  "sources": ["yelp", "reddit"],
  "tried": false
}
```

### Building the Dataset

A set of data collection scripts lives in `scripts/build-data/`. They pull from the Yelp Fusion API, Google Places API, and Reddit to seed the restaurant list.

```bash
cd scripts/build-data
npm install
node merge.js   # runs the full pipeline and outputs src/data/restaurants.json
```

You'll need API keys for Yelp and Google Places — see [Configuration](#configuration) below.

---

## Configuration

Create a `.env` file in the project root:

```
VITE_YELP_API_KEY=your_yelp_api_key
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

API keys are only needed to rebuild the dataset. The app itself runs entirely off the pre-built JSON.

---

## Roadmap

- [x] Project spec & data schema
- [ ] World map with clickable countries
- [ ] Avatar + teleport mechanic
- [ ] Side panel with restaurant cards
- [ ] Data pipeline (Yelp + Google + Reddit)
- [ ] Seed data for ~40 cuisines
- [ ] Restaurant addresses and neighborhood tags
- [ ] Menu cross-reference for must-order dishes
- [ ] Food passport — personal "tried this" tracking

---

## Contributing

Found a great restaurant that's missing? Spotted an error? Contributions are welcome.

1. Fork the repo
2. Edit `src/data/restaurants.json` directly, or open an issue with the restaurant details
3. Submit a pull request

Please keep entries to restaurants that are currently open and genuinely represent the cuisine well.

---

## License

MIT
