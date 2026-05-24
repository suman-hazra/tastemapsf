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
  "008": "albania",
  "040": "austria",
  "112": "belarus",
  "056": "belgium",
  "070": "bosnia_and_herzegovina",
  "100": "bulgaria",
  "191": "croatia",
  "196": "cyprus",
  "203": "czechia",
  "208": "denmark",
  "233": "estonia",
  "246": "finland",
  "250": "france",
  "276": "germany",
  "300": "greece",
  "348": "hungary",
  "352": "iceland",
  "372": "ireland",
  "380": "italy",
  "428": "latvia",
  "440": "lithuania",
  "442": "luxembourg",
  "498": "moldova",
  "499": "montenegro",
  "528": "netherlands",
  "807": "north_macedonia",
  "578": "norway",
  "616": "poland",
  "620": "portugal",
  "642": "romania",
  "643": "russia",
  "688": "serbia",
  "703": "slovakia",
  "705": "slovenia",
  "724": "spain",
  "752": "sweden",
  "756": "switzerland",
  "826": "uk",
  "804": "ukraine",

  // North America
  "044": "bahamas",
  "084": "belize",
  "124": "canada",
  "188": "costa_rica",
  "192": "cuba",
  "214": "dominican_republic",
  "222": "el_salvador",
  "320": "guatemala",
  "332": "haiti",
  "340": "honduras",
  "388": "jamaica",
  "484": "mexico",
  "558": "nicaragua",
  "591": "panama",
  "780": "trinidad_and_tobago",
  "840": "usa",

  // South America
  "032": "argentina",
  "068": "bolivia",
  "076": "brazil",
  "152": "chile",
  "170": "colombia",
  "218": "ecuador",
  "328": "guyana",
  "600": "paraguay",
  "604": "peru",
  "740": "suriname",
  "858": "uruguay",
  "862": "venezuela",

  // Asia
  "004": "afghanistan",
  "051": "armenia",
  "031": "azerbaijan",
  "050": "bangladesh",
  "064": "bhutan",
  "096": "brunei",
  "104": "burma",
  "116": "cambodia",
  "156": "china",
  "268": "georgia",
  "356": "india",
  "360": "indonesia",
  "364": "iran",
  "368": "iraq",
  "392": "japan",
  "400": "jordan",
  "398": "kazakhstan",
  "410": "korea",
  "414": "kuwait",
  "417": "kyrgyzstan",
  "418": "laos",
  "458": "malaysia",
  "496": "mongolia",
  "524": "nepal",
  "408": "north_korea",
  "512": "oman",
  "586": "pakistan",
  "608": "philippines",
  "634": "qatar",
  "682": "saudi_arabia",
  "144": "sri_lanka",
  "760": "syria",
  "158": "taiwan",
  "762": "tajikistan",
  "764": "thailand",
  "626": "timor_leste",
  "792": "turkey",
  "795": "turkmenistan",
  "784": "uae",
  "860": "uzbekistan",
  "704": "vietnam",

  // Middle East
  "376": "israel",
  "422": "lebanon",
  "275": "palestine",
  "887": "yemen",

  // Africa
  "012": "algeria",
  "024": "angola",
  "204": "benin",
  "072": "botswana",
  "854": "burkina_faso",
  "108": "burundi",
  "120": "cameroon",
  "140": "central_african_republic",
  "148": "chad",
  "180": "congo_drc",
  "178": "congo_republic",
  "262": "djibouti",
  "818": "egypt",
  "226": "equatorial_guinea",
  "232": "eritrea",
  "748": "eswatini",
  "231": "ethiopia",
  "266": "gabon",
  "270": "gambia",
  "288": "ghana",
  "324": "guinea",
  "624": "guinea_bissau",
  "404": "kenya",
  "426": "lesotho",
  "430": "liberia",
  "434": "libya",
  "450": "madagascar",
  "454": "malawi",
  "466": "mali",
  "478": "mauritania",
  "504": "morocco",
  "508": "mozambique",
  "516": "namibia",
  "562": "niger",
  "566": "nigeria",
  "646": "rwanda",
  "686": "senegal",
  "694": "sierra_leone",
  "706": "somalia",
  "710": "south_africa",
  "728": "south_sudan",
  "729": "sudan",
  "834": "tanzania",
  "768": "togo",
  "788": "tunisia",
  "800": "uganda",
  "894": "zambia",
  "716": "zimbabwe",

  // Oceania
  "036": "australia",
  "242": "fiji",
  "554": "new_zealand",
  "598": "papua_new_guinea",
  "548": "vanuatu",
};

/**
 * Slugs present in restaurants.ts but intentionally absent from `isoToSlug`
 * because the world-atlas 110m TopoJSON omits them (microstates, small island
 * nations). They show up in panels and search, just not on the world map.
 * To make any of these clickable, upgrade to the 50m or 10m TopoJSON.
 */
export const KNOWN_UNMAPPED_SLUGS = new Set<string>([
  "andorra",
  "antigua_and_barbuda",
  "bahrain",
  "barbados",
  "cabo_verde",
  "comoros",
  "dominica",
  "grenada",
  "maldives",
  "malta",
  "mauritius",
  "saint_lucia",
  "sao_tome_and_principe",
  "seychelles",
  "singapore",
]);

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

const isoNumericToAlpha2: Record<string, string> = {
  "004": "AF",
  "008": "AL",
  "010": "AQ",
  "012": "DZ",
  "024": "AO",
  "031": "AZ",
  "032": "AR",
  "036": "AU",
  "040": "AT",
  "044": "BS",
  "050": "BD",
  "051": "AM",
  "056": "BE",
  "064": "BT",
  "068": "BO",
  "070": "BA",
  "072": "BW",
  "076": "BR",
  "084": "BZ",
  "090": "SB",
  "096": "BN",
  "100": "BG",
  "104": "MM",
  "108": "BI",
  "112": "BY",
  "116": "KH",
  "120": "CM",
  "124": "CA",
  "140": "CF",
  "144": "LK",
  "148": "TD",
  "152": "CL",
  "156": "CN",
  "158": "TW",
  "170": "CO",
  "178": "CG",
  "180": "CD",
  "188": "CR",
  "191": "HR",
  "192": "CU",
  "196": "CY",
  "203": "CZ",
  "204": "BJ",
  "208": "DK",
  "214": "DO",
  "218": "EC",
  "222": "SV",
  "226": "GQ",
  "231": "ET",
  "232": "ER",
  "233": "EE",
  "238": "FK",
  "242": "FJ",
  "246": "FI",
  "250": "FR",
  "260": "TF",
  "262": "DJ",
  "266": "GA",
  "268": "GE",
  "270": "GM",
  "275": "PS",
  "276": "DE",
  "288": "GH",
  "300": "GR",
  "304": "GL",
  "320": "GT",
  "324": "GN",
  "328": "GY",
  "332": "HT",
  "340": "HN",
  "348": "HU",
  "352": "IS",
  "356": "IN",
  "360": "ID",
  "364": "IR",
  "368": "IQ",
  "372": "IE",
  "376": "IL",
  "380": "IT",
  "384": "CI",
  "388": "JM",
  "392": "JP",
  "398": "KZ",
  "400": "JO",
  "404": "KE",
  "408": "KP",
  "410": "KR",
  "414": "KW",
  "417": "KG",
  "418": "LA",
  "422": "LB",
  "426": "LS",
  "428": "LV",
  "430": "LR",
  "434": "LY",
  "440": "LT",
  "442": "LU",
  "450": "MG",
  "454": "MW",
  "458": "MY",
  "466": "ML",
  "478": "MR",
  "484": "MX",
  "496": "MN",
  "498": "MD",
  "499": "ME",
  "504": "MA",
  "508": "MZ",
  "512": "OM",
  "516": "NA",
  "524": "NP",
  "528": "NL",
  "540": "NC",
  "548": "VU",
  "554": "NZ",
  "558": "NI",
  "562": "NE",
  "566": "NG",
  "578": "NO",
  "586": "PK",
  "591": "PA",
  "598": "PG",
  "600": "PY",
  "604": "PE",
  "608": "PH",
  "616": "PL",
  "620": "PT",
  "624": "GW",
  "626": "TL",
  "630": "PR",
  "634": "QA",
  "642": "RO",
  "643": "RU",
  "646": "RW",
  "682": "SA",
  "686": "SN",
  "688": "RS",
  "694": "SL",
  "703": "SK",
  "704": "VN",
  "705": "SI",
  "706": "SO",
  "710": "ZA",
  "716": "ZW",
  "724": "ES",
  "728": "SS",
  "729": "SD",
  "732": "EH",
  "740": "SR",
  "748": "SZ",
  "752": "SE",
  "756": "CH",
  "760": "SY",
  "762": "TJ",
  "764": "TH",
  "768": "TG",
  "780": "TT",
  "784": "AE",
  "788": "TN",
  "792": "TR",
  "795": "TM",
  "800": "UG",
  "804": "UA",
  "807": "MK",
  "818": "EG",
  "826": "GB",
  "834": "TZ",
  "840": "US",
  "854": "BF",
  "858": "UY",
  "860": "UZ",
  "862": "VE",
  "887": "YE",
  "894": "ZM",
};

function alpha2ToFlag(alpha2: string): string {
  return alpha2
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

export function flagForGeoId(geoId: string | number): string | undefined {
  const alpha2 = isoNumericToAlpha2[String(geoId).padStart(3, "0")];
  return alpha2 ? alpha2ToFlag(alpha2) : undefined;
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
    if (!slugsInMap.has(slug) && !KNOWN_UNMAPPED_SLUGS.has(slug)) {
      orphansInData.push(slug);
    }
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
