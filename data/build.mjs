#!/usr/bin/env node
// data/build.mjs — reads countries.csv + restaurants.csv and regenerates
// src/data/restaurants.ts.  Invoked via `npm run build:data`.
//
// Source of truth: the two CSVs in this folder. Edit them, then run the build.
// The generated .ts is checked in (so the app builds without running this
// script), but never edit it by hand — your changes will be overwritten.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const COUNTRIES_CSV = path.join(__dirname, "countries.csv");
const RESTAURANTS_CSV = path.join(__dirname, "restaurants.csv");
const OUTPUT_TS = path.join(repoRoot, "src/data/restaurants.ts");

// RFC 4180-ish CSV parser. Handles double-quoted fields, escaped quotes ("")
// inside quoted fields, and \r\n or \n row terminators.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c !== "\r") {
        field += c;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop trailing blank rows that come from a final newline.
  return rows.filter(
    (r) => !(r.length === 1 && r[0] === "") && r.length > 0,
  );
}

function rowsToObjects(rows) {
  const [header, ...body] = rows;
  return body.map((row) => {
    const obj = {};
    header.forEach((key, i) => {
      obj[key.trim()] = (row[i] ?? "").trim();
    });
    return obj;
  });
}

const countriesCsv = fs.readFileSync(COUNTRIES_CSV, "utf8");
const restaurantsCsv = fs.readFileSync(RESTAURANTS_CSV, "utf8");

const countryRows = rowsToObjects(parseCSV(countriesCsv));
const restaurantRows = rowsToObjects(parseCSV(restaurantsCsv));

// Validate.
const errors = [];

const countryIds = new Set();
for (const c of countryRows) {
  if (!c.id || !c.name || !c.continent || !c.flag || !c.cuisine_summary) {
    errors.push(`countries.csv: row missing required field — ${JSON.stringify(c)}`);
  }
  if (countryIds.has(c.id)) {
    errors.push(`countries.csv: duplicate id "${c.id}"`);
  }
  countryIds.add(c.id);
}

const restaurantsByCountry = new Map();
let skippedClosed = 0;
for (const r of restaurantRows) {
  if (!r.country_id) {
    errors.push(`restaurants.csv: row missing country_id — ${JSON.stringify(r)}`);
    continue;
  }
  if (!countryIds.has(r.country_id)) {
    errors.push(
      `restaurants.csv: "${r.id}" references unknown country_id "${r.country_id}"`,
    );
    continue;
  }
  if (r.status === "closed") {
    skippedClosed++;
    continue;
  }
  if (!r.id || !r.name || !r.neighborhood) {
    errors.push(`restaurants.csv: row missing required field — ${JSON.stringify(r)}`);
    continue;
  }
  if (!restaurantsByCountry.has(r.country_id)) {
    restaurantsByCountry.set(r.country_id, []);
  }
  restaurantsByCountry.get(r.country_id).push(r);
}

for (const [cid, list] of restaurantsByCountry) {
  const seen = new Set();
  for (const r of list) {
    if (seen.has(r.id)) {
      errors.push(`restaurants.csv: duplicate id "${r.id}" within country "${cid}"`);
    }
    seen.add(r.id);
  }
}

if (errors.length) {
  console.error("Build failed:");
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}

// Emit TypeScript.
const esc = (s) => JSON.stringify(s ?? "");

function emitDishes(c) {
  const dishes = [];
  for (let i = 1; i <= 5; i++) {
    const name = c[`dish${i}_name`];
    const desc = c[`dish${i}_desc`];
    if (name && desc) {
      dishes.push(`      { name: ${esc(name)}, description: ${esc(desc)} },`);
    }
  }
  return dishes.join("\n");
}

function emitRestaurants(cid) {
  const list = restaurantsByCountry.get(cid) || [];
  if (list.length === 0) return "    restaurants: [],";
  const lines = list.map((r) => {
    const fields = [
      `id: ${esc(r.id)}`,
      `name: ${esc(r.name)}`,
      `neighborhood: ${esc(r.neighborhood)}`,
    ];
    if (r.address) fields.push(`address: ${esc(r.address)}`);
    return `      { ${fields.join(", ")} },`;
  });
  return `    restaurants: [\n${lines.join("\n")}\n    ],`;
}

// Group by continent for a readable output file.
const continentOrder = [
  "Europe",
  "North America",
  "South America",
  "Asia",
  "Middle East",
  "Africa",
  "Oceania",
];
const byContinent = new Map();
for (const c of countryRows) {
  if (!byContinent.has(c.continent)) byContinent.set(c.continent, []);
  byContinent.get(c.continent).push(c);
}

const blocks = [];
for (const continent of continentOrder) {
  if (!byContinent.has(continent)) continue;
  blocks.push(`  // ── ${continent.toUpperCase()} ──`);
  for (const c of byContinent.get(continent)) {
    blocks.push(
      `  {
    id: ${esc(c.id)},
    name: ${esc(c.name)},
    continent: ${esc(c.continent)},
    flag: ${esc(c.flag)},
    cuisine_summary: ${esc(c.cuisine_summary)},
    signature_dishes: [
${emitDishes(c)}
    ],
${emitRestaurants(c.id)}
  },`,
    );
  }
}

const out = `// AUTO-GENERATED from data/countries.csv + data/restaurants.csv.
// Do not edit by hand — run \`npm run build:data\` after editing the CSVs.

import type { Country } from "./types";

export const countries: Country[] = [
${blocks.join("\n")}
];
`;

fs.writeFileSync(OUTPUT_TS, out);

const totalRestaurants = [...restaurantsByCountry.values()].reduce(
  (n, list) => n + list.length,
  0,
);
console.log(`Wrote ${path.relative(repoRoot, OUTPUT_TS)}`);
console.log(`  ${countryRows.length} countries`);
console.log(
  `  ${totalRestaurants} restaurants (skipped ${skippedClosed} marked closed)`,
);
