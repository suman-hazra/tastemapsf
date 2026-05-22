// Type-only module. Exports types, never values.
// restaurants.ts imports from here; never the reverse — keeps imports acyclic.
//
// Required fields:  id, name (countries); id, name, neighborhood (restaurants).
// Optional fields:  everything else. TypeScript optionals, no nulls. Render
// conditionally in components — never show "N/A" filler.

export type Continent =
  | "Europe"
  | "North America"
  | "South America"
  | "Asia"
  | "Middle East"
  | "Africa"
  | "Oceania";

export interface Dish {
  /** Display name, e.g., "Steak frites". */
  name: string;
  /**
   * Beginner-friendly description. Should read like you're telling a friend
   * who's never had this cuisine what to expect. ~10-20 words.
   */
  description: string;
}

export interface Restaurant {
  /** Stable slug, kebab-case, e.g., "tonys-pizza-napoletana". */
  id: string;
  /** Display name. */
  name: string;
  /** SF neighborhood, e.g., "Mission", "North Beach". */
  neighborhood: string;
  /** Optional full street address. */
  address?: string;
  /** Optional Yelp listing URL (preferred — covers freshness via Yelp). */
  yelp_url?: string;
  /** Optional Google Maps URL. */
  google_url?: string;
  /**
   * Phase 1 reserved for the food passport. Never displayed in Phase 1
   * (passport is country-level), but here so the schema is forward-compatible.
   */
  tried?: boolean;
}

export interface Country {
  /** Stable slug, kebab-case, e.g., "france". Used in countryIdMap. */
  id: string;
  /** Display name. */
  name: string;
  continent: Continent;
  /** Unicode flag emoji, e.g., "🇫🇷". */
  flag: string;
  /**
   * One-sentence cuisine intro for beginners. Should answer "what is this
   * cuisine for someone who's never had it?" — flavor character, texture,
   * social context. Not a Wikipedia summary.
   */
  cuisine_summary: string;
  /** 3-5 signature dishes a newcomer should try. */
  signature_dishes: Dish[];
  /**
   * Restaurants in SF for this cuisine. May be empty during seeding — when
   * empty, the panel shows "Restaurants coming soon — got a pick?" state.
   */
  restaurants: Restaurant[];
}
