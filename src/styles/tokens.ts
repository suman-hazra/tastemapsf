// Design tokens — single source of truth for colors.
// Imported by components that need raw hex strings (e.g., <Geography fill={...}>
// on react-simple-maps, which does not accept Tailwind classes).
// Tailwind utility classes (bg-canvas, text-ink, etc.) come from the @theme
// block in index.css. These constants are the same values, exported for code
// paths that can't use classes.
//
// Locked during /plan-design-review. Do not bikeshed mid-build.

export const colors = {
  // Country fills on the map (legacy — kept for the Counter milestone tones)
  tried: "#7CC576",
  seeded: "#B8D4F0",
  seededHover: "#9DBFE2",
  unseeded: "#EEEEEE",

  // Surfaces
  canvas: "#FAF7F2",
  panel: "#FFFFFF",

  // Text
  ink: "#1A1A1A",
  inkSoft: "#6B6B6B",

  // Decorative
  avatar: "#3D3D3D",
  border: "rgba(26, 26, 26, 0.12)",
} as const;

// Passport-style map palette (Michelin / Google Maps inspired).
// Four country states, each a distinct fill:
//   • unseeded   — cool pale stone, recedes against the ocean
//   • seeded     — warm parchment, invites exploration
//   • selected   — honey wash, "you're looking at this one"
//   • tried      — clay, the passport stamp
// Progression: cool → warm cream → warm honey → warm clay.
export const map = {
  bg: "#a8d3e6",          // vibrant ocean blue

  unseededLand: "#e3e8ec", // cool pale stone — not in our list
  unseededLine: "#b0bac3", // darker so boundaries inside the unseeded mass read
  land: "#fbf3e5",         // warm parchment — seeded country
  landLine: "#9aa6b0",     // medium gray-blue — reads against the warm cream fill
  landHover: "#f5ead2",    // slight warming on hover
  selectedLand: "#e8c89a", // honey wash — selected
  label: "#7d8a93",
  labelHover: "#0e0e0c",

  visited: "#bda58e",      // warm muted clay — tried
  visitedInk: "#8a6f57",   // tried country border

  accent: "#c8281e",       // pin / selected stroke
  accentInk: "#7a1612",    // pin border

  oceanMajor: "#4d7a96",
  oceanSea: "#6a92ab",

  chromeBg: "#ffffff",
  chromeHover: "#fafaf9",
  chromeLine: "#e8e6e1",
  chromeText: "#0e0e0c",
  chromeQuiet: "#9a948a",
} as const;

// Milestone counter colors — counter shifts at these thresholds.
// 0-4 = ink. 5-9 = light green. 10-14 = warm green. 15-19 = rich green. 20+ = gold.
export const counterTone = {
  default: colors.ink,
  milestone5: "#94C58F",
  milestone10: colors.tried,
  milestone15: "#5BA854",
  milestone20: "#C9A227",
} as const;

export function counterColorForTriedCount(count: number): string {
  if (count >= 20) return counterTone.milestone20;
  if (count >= 15) return counterTone.milestone15;
  if (count >= 10) return counterTone.milestone10;
  if (count >= 5) return counterTone.milestone5;
  return counterTone.default;
}

export type ColorToken = keyof typeof colors;
