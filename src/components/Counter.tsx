// "X / N tried" headline counter. Per /plan-design-review:
//   - counter-as-headline (not in a corner pill — this IS the product surface)
//   - subtle color shifts at milestones (5, 10, 15, 20) — no toasts, no confetti
//   - pure-CSS +1 animation: tiny scale tick + color flash, ~400ms total
//   - tabular-nums so the +1 doesn't shift width
//
// Pulse trigger: useEffect compares `tried` to its previous value via a ref.
// Pulses ONLY on increase (not on untoggle decrement — removal isn't a
// celebration). 400ms self-clearing setTimeout, with cleanup if the count
// changes again before the previous pulse finishes.

import { useEffect, useRef, useState } from "react";
import { colors, counterColorForTriedCount } from "../styles/tokens";

interface Props {
  /** Current count of tried countries. */
  tried: number;
  /** Total seeded countries (denominator). Null = data still loading. */
  total: number | null;
  /** Hint text shown beneath the number ("Click a country to start" etc). */
  hint: string;
}

const PULSE_MS = 400;

export default function Counter({ tried, total, hint }: Props) {
  const [pulse, setPulse] = useState(false);
  const prevTried = useRef(tried);

  useEffect(() => {
    if (tried > prevTried.current) {
      setPulse(true);
      const t = window.setTimeout(() => setPulse(false), PULSE_MS);
      prevTried.current = tried;
      return () => window.clearTimeout(t);
    }
    prevTried.current = tried;
    return undefined;
  }, [tried]);

  const isLoading = total === null;
  const milestoneColor = isLoading
    ? colors.inkSoft
    : counterColorForTriedCount(tried);
  const numberColor = pulse ? colors.tried : milestoneColor;

  return (
    <div className="flex flex-col items-end leading-none">
      <div className="font-display tabular-nums">
        <span
          className="inline-block text-5xl font-semibold transition-all duration-300 ease-out"
          style={{
            color: numberColor,
            transform: pulse ? "scale(1.12)" : "scale(1)",
          }}
        >
          {isLoading ? "—" : tried}
        </span>
        <span className="ml-2 text-xl text-ink-soft">
          / {isLoading ? "—" : total}
        </span>
      </div>
      <div
        className="mt-2 text-sm text-ink-soft"
        // Reserve space so the layout doesn't shift when the hint is blank.
        style={{ minHeight: "1.25rem" }}
      >
        {hint}
      </div>
    </div>
  );
}
