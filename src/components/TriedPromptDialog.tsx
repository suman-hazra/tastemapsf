import { useEffect, useRef } from "react";
import type { Country } from "../data/types";

interface Props {
  country: Country | null;
  onAnswer: (tried: boolean) => void;
  onClose: () => void;
}

export default function TriedPromptDialog({
  country,
  onAnswer,
  onClose,
}: Props) {
  const yesButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!country) return;
    yesButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [country, onClose]);

  if (!country) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center px-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tried-prompt-title"
        className="pointer-events-auto relative w-full max-w-sm border border-black/10 bg-panel px-5 py-5 text-center shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close tried prompt"
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-ink-soft hover:bg-black/5"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5L15 15M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="text-3xl" aria-hidden="true">
          {country.flag}
        </div>
        <h2
          id="tried-prompt-title"
          className="mt-2 font-display text-2xl font-semibold leading-tight"
        >
          Tried {country.name}?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Mark this cuisine on your Tastemap.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            ref={yesButtonRef}
            type="button"
            onClick={() => onAnswer(true)}
            className="flex h-14 items-center justify-center gap-2 rounded-chip border border-tried bg-tried/15 text-sm font-semibold text-ink transition-colors hover:bg-tried/25"
          >
            <CheckIcon />
            <span>Yes</span>
          </button>
          <button
            type="button"
            onClick={() => onAnswer(false)}
            className="flex h-14 items-center justify-center gap-2 rounded-chip border border-[#c9463a]/35 bg-[#c9463a]/10 text-sm font-semibold text-ink transition-colors hover:bg-[#c9463a]/18"
          >
            <CrossIcon />
            <span>No</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        d="M5 11.5L9 15.5L17 6.5"
        stroke="#2f8f45"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        d="M6 6L16 16M16 6L6 16"
        stroke="#c9463a"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
