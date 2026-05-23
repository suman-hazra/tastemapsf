interface Props {
  tried: number;
  total: number;
  onClose: () => void;
  onSuggestNext: () => void;
  canSuggestNext: boolean;
}

const CONFETTI = [
  { left: "12%", delay: "0ms", color: "#7cc576" },
  { left: "23%", delay: "80ms", color: "#fed21c" },
  { left: "35%", delay: "20ms", color: "#c9463a" },
  { left: "48%", delay: "120ms", color: "#ad5cee" },
  { left: "58%", delay: "40ms", color: "#7cc576" },
  { left: "69%", delay: "150ms", color: "#fed21c" },
  { left: "81%", delay: "70ms", color: "#c9463a" },
  { left: "90%", delay: "110ms", color: "#ad5cee" },
] as const;

export default function ScoreDialog({
  tried,
  total,
  onClose,
  onSuggestNext,
  canSuggestNext,
}: Props) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/20 px-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-title"
        className="relative w-full max-w-lg overflow-hidden border border-black/10 bg-panel px-6 py-6 text-center shadow-xl"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {CONFETTI.map((piece, index) => (
            <span
              key={index}
              className="score-confetti"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                backgroundColor: piece.color,
              }}
            />
          ))}
        </div>

        <div className="relative">
          <div className="font-display text-6xl font-semibold tabular-nums">
            {tried}
            <span className="ml-2 text-2xl text-ink-soft">/ {total}</span>
          </div>
          <h2
            id="score-title"
            className="mt-3 font-display text-2xl font-semibold"
          >
            Your Taste Map score
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            San Francisco has room for every appetite. You have tasted part of
            the map, and there is always another cuisine, neighborhood, and
            table to try next.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-chip border border-black/10 px-4 text-sm font-semibold transition-colors hover:bg-canvas"
            >
              Back to map
            </button>
            <button
              type="button"
              onClick={onSuggestNext}
              disabled={!canSuggestNext}
              className="h-11 whitespace-nowrap rounded-chip border border-black/10 bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-default disabled:border-black/5 disabled:bg-black/10 disabled:text-ink-soft"
            >
              Pick My Next Bite
            </button>
          </div>
          <button
            type="button"
            disabled
            className="mt-3 h-11 w-full rounded-chip border border-black/10 px-4 text-sm font-semibold text-ink-soft"
          >
            Share your score
          </button>
        </div>
      </section>
    </div>
  );
}
