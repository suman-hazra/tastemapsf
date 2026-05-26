// Marks the app's home city on the map. Rendered inside react-simple-maps'
// <Marker> so the parent supplies projected screen positioning.

interface Props {
  onReset: () => void;
  showLabel?: boolean;
}

export default function SanFranciscoMarker({
  onReset,
  showLabel = true,
}: Props) {
  const labelStyle = {
    fontFamily: "'Inter', sans-serif",
    textShadow:
      "0 1px 3px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.7)",
    userSelect: "none" as const,
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label="Back to world view"
      onClick={(event) => {
        event.stopPropagation();
        onReset();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onReset();
      }}
      style={{ cursor: "pointer", outline: "none" }}
    >
      <title>Back to world view</title>
      <circle
        className="sf-pulse-ring"
        r={7}
        fill="none"
        stroke="url(#sfMarkerGrad)"
        strokeWidth={1.5}
      />
      <circle
        className="sf-pulse-ring sf-pulse-ring-delayed"
        r={7}
        fill="none"
        stroke="url(#sfMarkerGrad)"
        strokeWidth={1}
      />

      <circle r={7} fill="url(#sfMarkerGrad)" filter="url(#sfGlow)" />
      <circle r={7} fill="url(#sfMarkerGrad)" />
      <circle cx={-1.5} cy={-1.5} r={2.5} fill="#ffffff" opacity={0.9} />

      {showLabel && (
        <>
          <text
            x={-16}
            y={4}
            textAnchor="end"
            fontSize={11}
            fontWeight={700}
            letterSpacing="0.08em"
            fill="#0f0f12"
            style={labelStyle}
          >
            San Francisco
          </text>
          <text
            x={-16}
            y={16}
            textAnchor="end"
            fontSize={8}
            fontWeight={600}
            letterSpacing="0.12em"
            fill="#6b6b76"
            style={labelStyle}
          >
            HOME BASE
          </text>
        </>
      )}
    </g>
  );
}
