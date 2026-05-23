# Restaurant data — external editing workflow

This folder is the **source of truth** for Tastemap SF's country and restaurant data.

The app reads `src/data/restaurants.ts`, but that file is **auto-generated** from the two CSVs here. Edit the CSVs, run `npm run build:data`, and the app's data is rebuilt. Don't edit `src/data/restaurants.ts` directly — your changes will be overwritten.

The CSVs are designed to be easy to edit outside the project (Google Sheets, Excel, Numbers, or a text editor) and easy to paste into other LLM chats for help expanding or verifying the list.

---

## Files

| File | Purpose |
|---|---|
| `countries.csv` | One row per country. Holds the cuisine intro and up to 5 signature dishes inline. |
| `restaurants.csv` | One row per restaurant, joined to a country via `country_id`. |
| `build.mjs` | Node script — reads both CSVs and writes `src/data/restaurants.ts`. |
| `README.md` | This file. |

---

## Schemas

### `countries.csv`

| Column | Required | Notes |
|---|---|---|
| `id` | yes | Lowercase kebab-case slug, e.g., `france`, `south-korea`. Must also exist in `src/data/countryIdMap.ts` so the map can highlight it. |
| `name` | yes | Display name. |
| `continent` | yes | One of: `Europe`, `North America`, `South America`, `Asia`, `Middle East`, `Africa`, `Oceania`. |
| `flag` | yes | Unicode flag emoji (e.g., 🇫🇷). |
| `cuisine_summary` | yes | One-sentence beginner intro to the cuisine. Warm + concrete, not cute. |
| `dish1_name` … `dish5_name` | first 3 required | Dish display name. Columns for up to 5 dishes; leave unused columns empty. |
| `dish1_desc` … `dish5_desc` | matched to name | Beginner-friendly description, ~10–20 words. |

### `restaurants.csv`

| Column | Required | Notes |
|---|---|---|
| `country_id` | yes | Must match an `id` in `countries.csv`. |
| `id` | yes | Lowercase kebab-case slug. Unique within a country. |
| `name` | yes | Display name. Diacritics OK (Café, Pasión, etc.). |
| `neighborhood` | yes | SF neighborhood, e.g., `Mission`, `North Beach`, `Outer Sunset`. |
| `address` | no | Full street address. Phase 2 enrichment — leave empty for now. |
| `status` | yes | `open` / `closed` / `unverified`. Rows with `status: closed` are dropped at build time. |
| `last_verified` | no | ISO date (e.g., `2026-05-22`) when status was last confirmed. |
| `notes` | no | Free text — e.g., "permanently closed", "moved to Hayes Valley", "lunch only". |

---

## Workflows

### Verifying the existing list

Every restaurant from the original seed is currently marked `status: unverified`. Several are known to be permanently closed — they should be flagged so the build skips them.

1. Open `restaurants.csv` in Google Sheets (or your editor of choice).
2. For each row, check Google Maps + a quick web search to confirm the place is operating in SF.
3. Set `status` to `open` (still operating) or `closed` (permanently shut). Fill in `last_verified` with today's date (`YYYY-MM-DD`).
4. Add a `notes` value for anything noteworthy (moved, renamed, lunch-only, etc.).
5. Run `npm run build:data`. Closed entries are dropped automatically.

### Adding a country

1. Add a row to `countries.csv` with the slug, continent, flag, cuisine summary, and 3 signature dishes.
2. Confirm the slug exists in `src/data/countryIdMap.ts` so the map will highlight it. Add a mapping there if missing.
3. Add restaurants to `restaurants.csv` with the matching `country_id`.
4. Run `npm run build:data`, then `npm run dev` and click your new country to spot-check.

### Adding restaurants to an existing country

1. Append rows to `restaurants.csv` with the right `country_id`.
2. Run `npm run build:data`.

---

## Working with other LLMs

The CSV format is meant to be pasted directly into Claude / ChatGPT / Gemini / etc. for help expanding or verifying the list. Here are prompt templates that work well.

### Prompt — expand the country list

```
I'm building Tastemap SF — a web app where users click a country on a world
map and see the best San Francisco restaurants for that cuisine. Data lives
in two CSVs.

countries.csv columns:
  id,name,continent,flag,cuisine_summary,
  dish1_name,dish1_desc,dish2_name,dish2_desc,dish3_name,dish3_desc,
  dish4_name,dish4_desc,dish5_name,dish5_desc

restaurants.csv columns:
  country_id,id,name,neighborhood,address,status,last_verified,notes

Conventions:
- id / country_id are lowercase kebab-case slugs (e.g., "south-korea", "cote-divoire").
- continent is one of: Europe, North America, South America, Asia, Middle East, Africa, Oceania.
- cuisine_summary is one warm, concrete sentence (no exclamation points, no "delicious!").
- Dish descriptions are 10–20 words, beginner-friendly — what someone who's
  never eaten this cuisine should expect.
- Quote any field containing commas or double quotes (CSV-standard; escape
  internal " as "").

Here are the countries I already have:
[paste the `id` column from countries.csv]

Please propose [N] additional cuisines well-represented in SF, with 3 signature
dishes each. Output strict CSV rows ready to paste into countries.csv.
```

### Prompt — propose restaurants for a cuisine

```
I'm adding restaurants for [CUISINE] cuisine to Tastemap SF (San Francisco).
Schema:

restaurants.csv columns:
  country_id,id,name,neighborhood,address,status,last_verified,notes

For [CUISINE], propose 3–5 genuinely well-regarded SF restaurants that are
currently operating (as of [TODAY'S DATE]). Use Eater 38, Michelin Bib
Gourmand, local food press, and r/sanfrancisco as your reference points.

- country_id = [SLUG]
- id = lowercase kebab-case version of the restaurant name
- status = "unverified" (I'll do my own verification pass)
- last_verified = empty
- notes = empty unless you flag something I should know

Output strict CSV rows only. No commentary.
```

### Prompt — verify a batch is still open

```
Here are restaurants from my Tastemap SF data. For each, tell me whether it's
currently operating in San Francisco as of [TODAY'S DATE]. Check Google Maps
and a quick search. Output one row per restaurant in the form:

  <id>: <open | closed | uncertain> — <one-sentence reason or source>

Restaurants:
[paste the relevant rows from restaurants.csv]
```

---

## Tips when expanding the list

- **Quality > breadth.** One genuinely loved restaurant beats four mediocre ones.
- **Phase 1 target: 30–60 countries.** SF is one of the few cities that can plausibly carry this.
- **Verify before importing.** A list full of permanently-closed places is worse than a smaller, accurate list.
- **Slug consistency.** `country_id` in `restaurants.csv` must match `id` in `countries.csv` exactly. Lowercase, hyphens, no diacritics in slugs (use `cote-divoire`, not `côte-d'ivoire`).
- **Diacritics are fine in display fields.** `Café Claude`, `Pasión`, `Phở` — these all work in `name` and other display columns.
- **CSV gotchas.** Quote any field with a comma or double-quote. Escape internal `"` as `""`. Most spreadsheets do this automatically on export.

---

## Rebuilding the app data

```bash
npm run build:data
```

This regenerates `src/data/restaurants.ts`. The script:

- Validates that every restaurant's `country_id` exists in `countries.csv`
- Skips restaurants with `status: closed`
- Errors out on duplicate IDs or missing required fields
- Preserves continent grouping in the generated file

After running, run `npx tsc --noEmit` (or `npm run build`) to confirm types are still clean before committing.
