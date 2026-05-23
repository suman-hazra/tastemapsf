// Flag marker for tried countries. Rendered inside react-simple-maps'
// <Marker>, so the parent supplies projected screen positioning.

interface Props {
  flag: string;
}

export default function FlagMarker({ flag }: Props) {
  return (
    <g style={{ pointerEvents: "none" }} filter="url(#pinShadow)">
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fontFamily="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"
        fontSize="17"
        dominantBaseline="middle"
      >
        {flag}
      </text>
    </g>
  );
}
