// Bottom-right zoom control stack: +, −, RESET. RESET activates only when
// the user has moved away from the home view.
//
// Pure presentational — the parent owns the zoom state and supplies handlers.

import { map as c } from "../styles/tokens";

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  /** Whether RESET should be active (i.e. the view is not at home). */
  canReset: boolean;
}

export default function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  canReset,
}: Props) {
  const resetEnabled = canReset;

  const btnBase: React.CSSProperties = {
    width: 36,
    height: 36,
    border: "none",
    background: c.chromeBg,
    color: c.chromeText,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-map-mono)",
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
    transition: "background 120ms",
  };

  const divider: React.CSSProperties = { height: 1, background: c.chromeLine };

  return (
    <div
      style={{
        position: "absolute",
        right: 20,
        bottom: 24,
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${c.chromeLine}`,
        background: c.chromeBg,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        zIndex: 3,
      }}
    >
      <button
        type="button"
        aria-label="Zoom in"
        style={btnBase}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = c.chromeHover)
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = c.chromeBg)}
        onClick={onZoomIn}
      >
        +
      </button>
      <div style={divider} />
      <button
        type="button"
        aria-label="Zoom out"
        style={btnBase}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = c.chromeHover)
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = c.chromeBg)}
        onClick={onZoomOut}
      >
        −
      </button>
      <div style={divider} />
      <button
        type="button"
        aria-label="Reset zoom"
        disabled={!resetEnabled}
        style={{
          ...btnBase,
          height: 28,
          fontSize: 9,
          letterSpacing: "0.18em",
          color: resetEnabled ? c.chromeText : c.chromeQuiet,
          cursor: resetEnabled ? "pointer" : "default",
        }}
        onMouseEnter={(e) => {
          if (resetEnabled) e.currentTarget.style.background = c.chromeHover;
        }}
        onMouseLeave={(e) => (e.currentTarget.style.background = c.chromeBg)}
        onClick={() => {
          if (resetEnabled) onReset();
        }}
      >
        RESET
      </button>
    </div>
  );
}
