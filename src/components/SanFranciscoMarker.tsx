// Marks the app's home city on the map. Rendered inside react-simple-maps'
// <Marker> so the parent supplies projected screen positioning.

const PIN = "#C0362C";
const INK = "#1a1a1a";

export default function SanFranciscoMarker() {
  return (
    <g style={{ pointerEvents: "none" }} filter="url(#pinShadow)">
      {/* Teardrop pin. Tip sits at (0, 0) — the projected SF point. */}
      <path
        d="M0 0 C -5 -8, -7 -12, -7 -16 A 7 7 0 1 1 7 -16 C 7 -12, 5 -8, 0 0 Z"
        fill={PIN}
      />
      <circle cx="0" cy="-16" r="2.4" fill="#fff" />
      <text
        x={0}
        y={10}
        textAnchor="middle"
        fontFamily="var(--font-map-sans)"
        fontSize="7"
        fontWeight={700}
        fill={INK}
        letterSpacing="0.02em"
      >
        San Francisco
      </text>
    </g>
  );
}
