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

interface Props {
  /** Current count of tried countries. */
  tried: number;
  /** Total seeded countries (denominator). Null = data still loading. */
  total: number | null;
}

const PULSE_MS = 400;

export default function Counter({ tried, total }: Props) {
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
  const pct = isLoading || total === 0 ? 0 : Math.round((tried / total) * 100);
  const circumference = 50.26;

  return (
    <div className="flex h-9 items-center gap-2.5 rounded-xl border border-[#7c3aed]/15 bg-[#7c3aed]/[0.06] px-3 leading-none">
      <svg
        viewBox="0 0 20 20"
        className="h-5 w-5 -rotate-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="score-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="#e4e4ea"
          strokeWidth="2.5"
        />
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="url(#score-ring-grad)"
          strokeWidth="2.5"
          strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
          strokeLinecap="round"
          className="transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <div className="flex items-baseline gap-1 text-[13px] tabular-nums text-[#0f0f12]">
        <span
          className="inline-block font-bold transition-transform duration-300 ease-out"
          style={{
            transform: pulse ? "scale(1.12)" : "scale(1)",
          }}
        >
          {isLoading ? "—" : tried}
        </span>
        <span className="text-[#6b6b76]">
          / {isLoading ? "—" : total}
        </span>
      </div>
    </div>
  );
}
