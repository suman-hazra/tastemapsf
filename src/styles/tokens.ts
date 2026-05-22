// Design tokens — single source of truth for colors.
// Imported by components that need raw hex strings (e.g., <Geography fill={...}>
// on react-simple-maps, which does not accept Tailwind classes).
// Tailwind utility classes (bg-canvas, text-ink, etc.) come from the @theme
// block in index.css. These constants are the same values, exported for code
// paths that can't use classes.
//
// Locked during /plan-design-review. Do not bikeshed mid-build.

export const colors = {
  // Country fills on the map
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
