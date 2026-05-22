// Maps ISO 3166-1 numeric codes (as used by world-atlas countries-110m.json)
// to our slug-style country ids. The TopoJSON uses STRING ids, 3-digit
// zero-padded (e.g., "032" for Argentina). Keep as strings throughout.
//
// Authoring rule: every country in restaurants.ts MUST have an entry here,
// and vice versa. useMapData runs a dev-mode assertion that fires if drift
// is detected — see `assertCountryIdMapIntegrity` below.

import { countries } from "./restaurants";

/** ISO 3166-1 numeric code (zero-padded 3-digit string) → restaurants.ts country slug. */
export const isoToSlug: Record<string, string> = {
  // Europe
  "380": "italy",
  "250": "france",
  "724": "spain",

  // North America
  "484": "mexico",

  // South America
  "604": "peru",
  "032": "argentina",

  // Asia
  "156": "china",
  "392": "japan",
  "410": "korea",
  "764": "thailand",
  "704": "vietnam",
  "356": "india",
  "104": "burma",
  "608": "philippines",

  // Middle East
  "422": "lebanon",
  "887": "yemen",
  "376": "israel",

  // Africa
  "231": "ethiopia",
};

/** Reverse lookup: slug → ISO numeric. Computed once. */
export const slugToIso: Record<string, string> = Object.fromEntries(
  Object.entries(isoToSlug).map(([iso, slug]) => [slug, iso]),
);

/**
 * Look up a country slug given a TopoJSON `geo.id`. Returns undefined for any
 * country that isn't seeded (the "unseeded" state).
 *
 * Accepts both string and number inputs — react-simple-maps usually passes
 * strings but we defensively coerce in case a consumer hands us a number.
 */
export function slugForGeoId(geoId: string | number): string | undefined {
  return isoToSlug[String(geoId)];
}

/**
 * Dev-mode integrity check. Runs once on app boot in development.
 *
 * Fails loudly if:
 *  - A country in restaurants.ts has no isoToSlug mapping (orphan slug)
 *  - An isoToSlug entry points to a slug not present in restaurants.ts
 *  - Duplicate slugs in isoToSlug
 *
 * Production builds skip this check entirely (no perf impact).
 */
export function assertCountryIdMapIntegrity(): void {
  if (!import.meta.env.DEV) return;

  const slugsInData = new Set(countries.map((c) => c.id));
  const slugsInMap = new Set<string>(Object.values(isoToSlug));

  const orphansInData: string[] = [];
  for (const slug of slugsInData) {
    if (!slugsInMap.has(slug)) orphansInData.push(slug);
  }

  const orphansInMap: string[] = [];
  for (const slug of slugsInMap) {
    if (!slugsInData.has(slug)) orphansInMap.push(slug);
  }

  // Duplicate slug detection (two ISO codes pointing to the same slug)
  const slugCounts = new Map<string, number>();
  for (const slug of Object.values(isoToSlug)) {
    slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
  }
  const duplicates = [...slugCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([slug]) => slug);

  if (orphansInData.length || orphansInMap.length || duplicates.length) {
    console.error(
      "[countryIdMap] integrity check failed:\n" +
        (orphansInData.length
          ? `  Slugs in restaurants.ts with no isoToSlug entry: ${orphansInData.join(", ")}\n`
          : "") +
        (orphansInMap.length
          ? `  isoToSlug entries with no matching country: ${orphansInMap.join(", ")}\n`
          : "") +
        (duplicates.length
          ? `  Duplicate slugs in isoToSlug: ${duplicates.join(", ")}\n`
          : ""),
    );
  }
}
