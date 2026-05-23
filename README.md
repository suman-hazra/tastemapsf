# Tastemap SF

Explore San Francisco's global cuisine, one country at a time.

Tastemap SF is a static React app that turns SF's restaurant diversity into a world map. Click a country to learn what the cuisine is about, what to order first, and where to try it in San Francisco. Mark cuisines you have tried, see your score, and get a suggestion for what to eat next.

![Tastemap SF social preview](./public/og.png)

## Features

- **Interactive world map**: seeded countries are highlighted, unseeded countries still open a tip state.
- **Country side panel**: cuisine summary, signature dishes, and SF restaurant cards.
- **Tried prompt**: selecting a seeded country opens a centered Yes/No dialog for marking your passport.
- **Visual progress**: tried countries are shaded and marked with their country flag.
- **Finish flow**: bottom-center Finish CTA opens a score dialog with confetti and a `Pick My Next Bite` recommendation.
- **Recommendation CTA**: picks an untried seeded country and opens its side panel.
- **Hover-only country labels**: keeps dense map regions readable.
- **Map controls**: compact pan pad, zoom controls, bounded panning, and a denser default viewport.
- **Google Maps links**: restaurant cards build search links from restaurant name, neighborhood, and San Francisco.
- **No backend required**: state is in-memory; closing the tab resets progress.

## Tech Stack

- **React + TypeScript** with Vite
- **react-simple-maps** over D3 / TopoJSON
- **Tailwind CSS v4**
- **Vitest + React Testing Library**
- **CSV-authored data** generated into TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install And Run

```bash
git clone https://github.com/suman-hazra/tastemapsf.git
cd tastemapsf
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Build And Test

```bash
npm run build
npm test -- --run
```

## Data Workflow

The source of truth is in `data/`:

- `data/countries.csv`: country metadata, cuisine summaries, flags, and signature dishes.
- `data/restaurants.csv`: restaurant rows joined by `country_id`.
- `data/build.mjs`: generates `src/data/restaurants.ts`.

Do not edit `src/data/restaurants.ts` directly. It is generated.

```bash
npm run build:data
npm run build
```

When adding a country, also make sure its TopoJSON ISO code is mapped in `src/data/countryIdMap.ts`; otherwise the map cannot connect the geography to the app's country slug.

## Current UX

1. Open the map.
2. Click a highlighted country.
3. The side panel opens with the cuisine summary, dishes, and restaurants.
4. A centered prompt asks whether you have tried that cuisine.
5. Answering Yes adds a flag marker to the country and increments the score.
6. Click Finish to see your score.
7. Use `Pick My Next Bite` to jump to an untried cuisine.

## Project Notes

- Progress is intentionally not persisted yet.
- Legal, privacy, and attribution content is available in the hamburger menu and mirrored in `LEGAL.md`.
- Some marker positions use visual overrides where raw geometry centroids look wrong at this scale.
- The `feedback/` folder is ignored and should stay local.

## Roadmap

- [x] Clickable world map
- [x] Country side panel with restaurants and dishes
- [x] Tried tracking with map flags
- [x] Finish score dialog
- [x] Next-cuisine recommendation
- [x] CSV-driven data workflow
- [ ] Shareable score card / share flow
- [ ] Persisted progress
- [ ] More countries and restaurant verification
- [ ] Richer mobile UX

## Contributing

Found a great restaurant or spotted stale data?

1. Update `data/countries.csv` or `data/restaurants.csv`.
2. Run `npm run build:data`.
3. Run `npm run build`.
4. Open a pull request.

Please keep entries to restaurants that are currently open and genuinely represent the cuisine well.

## License

MIT

See `LICENSE` and `LEGAL.md`.
