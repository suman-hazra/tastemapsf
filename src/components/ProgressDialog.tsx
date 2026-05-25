import { useEffect, useMemo, useRef } from "react";
import type { Country } from "../data/types";

interface Props {
  tried: number;
  total: number;
  /** Seeded countries (the counter's universe). */
  countries: Country[];
  triedSet: ReadonlySet<string>;
  onClose: () => void;
  /** Jump to a country on the map (closes this dialog). */
  onPickCountry: (slug: string) => void;
}

export default function ProgressDialog({
  tried,
  total,
  countries,
  triedSet,
  onClose,
  onPickCountry,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // The countries you've collected, alphabetised. Shown as flag stamps.
  const triedCountries = useMemo(
    () =>
      countries
        .filter((c) => triedSet.has(c.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [countries, triedSet],
  );

  return (
    <div className="absolute inset-0 z-40 overflow-hidden" onMouseDown={onClose}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-[#c4b5fd] opacity-40 blur-[64px]" />
        <div className="absolute right-0 top-0 h-[500px] w-[700px] rounded-full bg-[#67e8f9] opacity-35 blur-[64px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[500px] rounded-full bg-[#bef264] opacity-25 blur-[64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.25)_60%,transparent_100%)]" />
      </div>
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-4 py-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="progress-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="relative flex max-h-[88dvh] w-full max-w-[480px] flex-col animate-[modal-enter_280ms_cubic-bezier(0.22,1,0.36,1)_forwards] overflow-hidden rounded-[24px] border border-black/[0.08] bg-white/[0.92] shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_30px_80px_rgba(124,58,237,0.22),0_8px_28px_rgba(6,182,212,0.10)] backdrop-blur-[28px]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#7c3aed_0%,#ec4899_50%,#06b6d4_100%)]"
            />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-[10px] bg-[#0f0f12]/[0.04] text-[#6b6b76] transition-colors hover:bg-[#0f0f12]/[0.08]"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5"
                  stroke="#6b6b76"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="flex-shrink-0 px-6 pt-8 sm:px-8">
              <h2
                id="progress-title"
                className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6b6b76]"
              >
                Your Tastemap
              </h2>
              <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
                <span className="bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] bg-clip-text text-[40px] font-bold leading-none text-transparent">
                  {tried}
                </span>
                <span className="text-lg font-medium text-[#6b6b76]">
                  / {total} cuisines tried
                </span>
              </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-2 sm:px-8 [-webkit-overflow-scrolling:touch]">
              {triedCountries.length === 0 ? (
                <div className="grid place-items-center py-12 text-center">
                  <p className="max-w-[260px] text-[14px] leading-[1.5] text-[#6b6b76]">
                    No cuisines tried yet. Tap a country on the map, then mark it
                    as tried to start your collection.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2.5">
                    {triedCountries.map((country) => (
                      <FlagStamp
                        key={country.id}
                        flag={country.flag}
                        name={country.name}
                        onClick={() => onPickCountry(country.id)}
                      />
                    ))}
                  </div>
                  <p className="pt-5 text-center text-[12px] text-[#6b6b76]">
                    Tap a flag to revisit that country
                  </p>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// A collected-country flag tile. Tapping it jumps back to that country on the
// map, mirroring the passport's flag chips.
function FlagStamp({
  flag,
  name,
  onClick,
}: {
  flag: string;
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      aria-label={`Revisit ${name}`}
      className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[24px] leading-none shadow-[0_2px_8px_rgba(132,204,22,0.22)] ring-2 ring-[#84cc16]/45 transition-all hover:scale-110 active:scale-95"
      style={{
        fontFamily:
          "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif",
      }}
    >
      <span aria-hidden="true">{flag}</span>
    </button>
  );
}
