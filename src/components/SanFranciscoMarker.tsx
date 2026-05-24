// Marks the app's home city on the map. Rendered inside react-simple-maps'
// <Marker> so the parent supplies projected screen positioning.

const POLE = "#5c4634";
const INK = "#1a1a1a";

export default function SanFranciscoMarker() {
  return (
    <g style={{ pointerEvents: "none" }} filter="url(#pinShadow)">
      {/* Flagpole base sits at (0, 0) — the projected SF point. */}
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={-31}
        stroke={POLE}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <circle cx={0} cy={0} r={1.8} fill={POLE} />
      <circle cx={0} cy={-31} r={1.3} fill={POLE} />

      {/* Compact California flag. Uses the public SVG asset, scaled for map use. */}
      <g transform="translate(0 -31)">
        <image
          href="/Flag_of_California.svg"
          x={0}
          y={0}
          width={30}
          height={20}
          preserveAspectRatio="xMidYMid meet"
        />
        <rect
          x={0}
          y={0}
          width={30}
          height={20}
          fill="none"
          stroke={INK}
          strokeWidth={0.6}
        />
      </g>
      <text
        x={0}
        y={10}
        textAnchor="middle"
        fontFamily="'EB Garamond', Garamond, Georgia, serif"
        fontSize="8"
        fontWeight={500}
        fill={INK}
      >
        San Francisco
      </text>
    </g>
  );
}
