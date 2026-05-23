// Character avatar rendered from /public/avatar.svg.
// Positioned with feet at the marker origin so it stands on the selected
// country's centroid.

interface Props {
  height?: number;
}

// Source SVG aspect ratio (width / height) from /public/avatar.svg viewBox.
const ASPECT = 88.5 / 209.45;

export default function Avatar({ height = 48 }: Props) {
  const width = height * ASPECT;
  return (
    <image
      href="/avatar.svg"
      width={width}
      height={height}
      x={-width / 2}
      y={-height}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
