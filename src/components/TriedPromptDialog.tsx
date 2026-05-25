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
  const flagUrl = twemojiFlagUrl(country.flag);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 grid place-items-center px-6"
    >
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="tried-prompt-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="pointer-events-auto relative w-full max-w-[420px] overflow-hidden rounded-[24px] border border-black/[0.08] bg-white/[0.92] px-6 pb-6 pt-7 text-center shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(124,58,237,0.20),0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-[28px] sm:px-8 sm:pb-7 sm:pt-8"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#7c3aed_0%,#ec4899_50%,#06b6d4_100%)]"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-[10px] bg-[#0f0f12]/[0.04] text-[#6b6b76] transition-colors hover:bg-[#0f0f12]/[0.08]"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5"
              stroke="#6B6B76"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {flagUrl ? (
          <img
            src={flagUrl}
            alt=""
            className="mx-auto mb-4 h-12 w-12 rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
            aria-hidden="true"
          />
        ) : (
          <div className="mx-auto mb-4 text-5xl" aria-hidden="true">
            {country.flag}
          </div>
        )}
        <h2
          id="tried-prompt-title"
          className="mb-2 text-2xl font-bold leading-[1.15] tracking-normal text-[#0f0f12] sm:text-[28px]"
        >
          Tried {country.name}?
        </h2>
        <p className="mb-7 text-[15px] leading-[1.5] text-[#6b6b76]">
          Mark this cuisine on your Tastemap.
        </p>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
          <button
            ref={yesButtonRef}
            type="button"
            onClick={() => onAnswer(true)}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.35),0_2px_6px_rgba(6,182,212,0.18)] transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(124,58,237,0.45),0_4px_10px_rgba(6,182,212,0.22)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#7c3aed,0_8px_24px_rgba(124,58,237,0.35)] active:scale-[0.98] active:shadow-[0_4px_12px_rgba(124,58,237,0.30)] sm:flex-1"
          >
            <CheckIcon />
            <span>Yes</span>
          </button>
          <button
            type="button"
            onClick={() => onAnswer(false)}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-white/70 text-[15px] font-semibold text-[#0f0f12] transition-all duration-150 ease-out hover:bg-white hover:shadow-[0_4px_14px_rgba(15,15,18,0.06)] active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#7c3aed] sm:flex-1"
          >
            <CrossIcon />
            <span>No</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function twemojiFlagUrl(flag: string) {
  const codepoints = [...flag]
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");
  if (!codepoints) return null;
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoints}.svg`;
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M3.5 9.5l4 4 7-8"
        stroke="#ffffff"
        strokeWidth="2"
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
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M4.5 4.5l9 9M13.5 4.5l-9 9"
        stroke="#6b6b76"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
