import { useEffect, useRef } from "react";

interface Props {
  onDismiss: () => void;
}

export default function WelcomeDialog({ onDismiss }: Props) {
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    ctaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="w-full max-w-lg border border-black/10 bg-panel px-7 py-8 text-center shadow-xl"
      >
        <blockquote className="font-display text-xl leading-snug text-ink sm:text-2xl">
          <span aria-hidden="true" className="mr-1 text-ink-soft">
            &ldquo;
          </span>
          <span id="welcome-title" className="italic">
            Anyone who doesn&rsquo;t have a great time in San Francisco is
            pretty much dead to me.
          </span>
          <span aria-hidden="true" className="ml-1 text-ink-soft">
            &rdquo;
          </span>
        </blockquote>
        <div className="mt-3 text-sm font-medium tracking-wide text-ink-soft">
          — Anthony Bourdain
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink">
          SF serves the world on a plate. Click a country to see where to eat
          its cuisine in the city, and mark the ones you&rsquo;ve tried.
        </p>

        <button
          ref={ctaRef}
          type="button"
          onClick={onDismiss}
          className="mt-7 h-12 rounded-chip border border-black/10 bg-ink px-6 text-sm font-semibold text-panel transition-colors hover:bg-black"
        >
          Let&rsquo;s go
        </button>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          <span
            aria-hidden="true"
            className="mr-1 inline-grid h-4 w-4 place-items-center rounded-full border border-black/20 text-[10px] font-semibold leading-none"
          >
            i
          </span>{" "}
          Prefer a checklist instead? Open the menu and choose{" "}
          <span className="font-semibold">View list</span>.
        </p>
      </section>
    </div>
  );
}
