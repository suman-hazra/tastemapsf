// Compact pan controls. Each click nudges the view in that direction by a
// chunk relative to the current zoom.
//
// Pure presentational — parent owns the position state and supplies the
// handlers.

import type { MouseEventHandler } from "react";
import { map as c } from "../styles/tokens";

type Direction = "up" | "down" | "left" | "right";

interface Props {
  onPanUp: () => void;
  onPanDown: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
}

const CONTROL_SIZE = 78;
const BUTTON_SIZE = 28;

const CHEVRON_PATHS: Record<Direction, string> = {
  up: "M3 11L9 5L15 11",
  down: "M3 7L9 13L15 7",
  left: "M11 3L5 9L11 15",
  right: "M7 3L13 9L7 15",
};

function PanButton({
  direction,
  onClick,
}: {
  direction: Direction;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Pan ${direction}`}
      style={{
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        background: "transparent",
        border: "none",
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        zIndex: 3,
        color: c.chromeText,
        transition: "background 120ms",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = c.chromeHover)
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d={CHEVRON_PATHS[direction]}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function PanControls({
  onPanUp,
  onPanDown,
  onPanLeft,
  onPanRight,
}: Props) {
  return (
    <div
      aria-label="Map pan controls"
      style={{
        position: "absolute",
        left: 20,
        bottom: 24,
        width: CONTROL_SIZE,
        height: CONTROL_SIZE,
        border: `1px solid ${c.chromeLine}`,
        borderRadius: 999,
        background: c.chromeBg,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        zIndex: 3,
      }}
    >
      <div style={{ position: "absolute", left: 24, top: 4 }}>
        <PanButton direction="up" onClick={onPanUp} />
      </div>
      <div style={{ position: "absolute", left: 4, top: 24 }}>
        <PanButton direction="left" onClick={onPanLeft} />
      </div>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 5,
          height: 5,
          borderRadius: 999,
          background: c.chromeQuiet,
          transform: "translate(-50%, -50%)",
        }}
      />
      <div style={{ position: "absolute", right: 4, top: 24 }}>
        <PanButton direction="right" onClick={onPanRight} />
      </div>
      <div style={{ position: "absolute", left: 24, bottom: 4 }}>
        <PanButton direction="down" onClick={onPanDown} />
      </div>
    </div>
  );
}
