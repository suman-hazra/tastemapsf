// 16px static dark-grey silhouette. Per /plan-design-review:
//   - single inline SVG path, no animation
//   - hidden when no country is selected (App.tsx controls visibility)
//   - teleports to selected country centroid (via react-simple-maps Marker)
//
// Renders centered on its origin point: viewBox is -8 to 8 so (0,0) is the
// figure's "feet" position. Marker translates the whole group to the
// projected centroid coordinate.

import { colors } from "../styles/tokens";

interface Props {
  size?: number;
}

export default function Avatar({ size = 16 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-8 -16 16 16"
      fill={colors.avatar}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="0" cy="-11.5" r="2.2" />
      {/* Body + legs as a single rounded path */}
      <path d="M -2.8 -8.5 Q -3.2 -7 -2.5 -5.5 L -2.5 -0.5 Q -2.5 0 -2 0 L -0.5 0 L -0.5 -4 L 0.5 -4 L 0.5 0 L 2 0 Q 2.5 0 2.5 -0.5 L 2.5 -5.5 Q 3.2 -7 2.8 -8.5 Z" />
    </svg>
  );
}
