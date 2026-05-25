import { useEffect, useMemo, useRef } from "react";
import type { Country } from "../data/types";

interface Props {
  countries: Country[];
  triedSet: ReadonlySet<string>;
  onSetTried: (countryId: string, tried: boolean) => void;
  onFinish: () => void;
  onClose: () => void;
}

function groupCountriesByContinent(countries: Country[]) {
  const groups = new Map<string, Country[]>();
  for (const country of countries) {
    const list = groups.get(country.continent) ?? [];
    list.push(country);
    groups.set(country.continent, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([continent, list]) => ({
      continent,
      countries: [...list].sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

function flagUrl(flag: string) {
  const codepoints = Array.from(flag)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoints}.svg`;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true",
  );
}

export default function CountryListMenu({
  countries,
  triedSet,
  onSetTried,
  onFinish,
  onClose,
}: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const continentGroups = useMemo(
    () => groupCountriesByContinent(countries),
    [countries],
  );
  const triedCount = countries.reduce(
    (count, country) => count + (triedSet.has(country.id) ? 1 : 0),
    0,
  );

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#f8f8fb]/72 px-0 pt-10 backdrop-blur-[3px] sm:items-center sm:px-4 sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-list-title"
        className="view-list-panel flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[24px] border border-black/[0.08] bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_30px_80px_rgba(124,58,237,0.15),0_8px_28px_rgba(6,182,212,0.08)] backdrop-blur-[28px] backdrop-saturate-150 sm:max-h-[calc(100vh-80px)] sm:max-w-[420px] sm:rounded-[24px]"
      >
        <header className="relative flex-shrink-0 border-b border-black/[0.08] px-6 pb-4 pt-6">
          <h2
            id="country-list-title"
            className="m-0 text-xl font-bold leading-tight tracking-normal text-[#0f0f12]"
          >
            View list
          </h2>
          <p className="mt-1 text-[13px] leading-normal text-[#6b6b76]">
            Mark the countries you have tried.
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-[10px] bg-black/[0.04] text-[#6b6b76] transition-colors hover:bg-black/[0.08] hover:text-[#0f0f12]"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20">
              <path
                d="M5.5 5.5L14.5 14.5M14.5 5.5L5.5 14.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-2 py-2 [-webkit-overflow-scrolling:touch]">
          {continentGroups.map((group, groupIndex) => (
            <section
              key={group.continent}
              className={groupIndex === 0 ? "" : "mt-4"}
            >
              <h3 className="sticky top-0 z-10 mb-1 bg-white/90 px-4 pb-1.5 pt-3 text-[10.5px] font-bold uppercase leading-none tracking-[0.16em] text-[#a1a1ab] backdrop-blur-md">
                {group.continent}
              </h3>
              <ul>
                {group.countries.map((country, rowIndex) => {
                  const hasTried = triedSet.has(country.id);
                  return (
                    <li
                      key={country.id}
                      className="view-list-row mx-2 flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors hover:bg-[rgba(124,58,237,0.04)]"
                      style={{
                        animationDelay: `${Math.min(
                          (groupIndex * 8 + rowIndex) * 20,
                          300,
                        )}ms`,
                      }}
                    >
                      <img
                        src={flagUrl(country.flag)}
                        alt=""
                        aria-hidden="true"
                        className="h-5 w-5 flex-shrink-0 rounded object-cover"
                        loading="lazy"
                      />
                      <span className="min-w-0 flex-1 text-sm font-medium leading-tight text-[#0f0f12]">
                        {country.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSetTried(country.id, !hasTried)}
                        aria-pressed={hasTried}
                        className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all ${
                          hasTried
                            ? "bg-[linear-gradient(135deg,#84CC16_0%,#22D3EE_100%)] text-white shadow-[0_2px_8px_rgba(132,204,22,0.30)]"
                            : "bg-black/[0.05] text-[#6b6b76] hover:bg-black/[0.08]"
                        }`}
                      >
                        {hasTried && (
                          <svg
                            aria-hidden="true"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                          >
                            <path
                              d="M2.4 6.1L4.8 8.3L9.6 3.7"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.7"
                            />
                          </svg>
                        )}
                        {hasTried ? "Tried" : "Not yet"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetTried(country.id, true)}
                        disabled={hasTried}
                        aria-label={`Add ${country.name}`}
                        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-black/[0.04] text-[#6b6b76] transition-colors hover:bg-[rgba(124,58,237,0.08)] hover:text-[#7c3aed] disabled:cursor-default disabled:opacity-45 disabled:hover:bg-black/[0.04] disabled:hover:text-[#6b6b76]"
                      >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
                          <path
                            d="M8 3.5V12.5M3.5 8H12.5"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="1.7"
                          />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <footer className="flex-shrink-0 border-t border-black/[0.08] bg-white/60 px-6 pb-5 pt-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#7C3AED_0%,#06B6D4_100%)] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.35),0_2px_6px_rgba(6,182,212,0.18)] transition-all hover:scale-[1.01] hover:shadow-[0_12px_32px_rgba(124,58,237,0.45),0_4px_10px_rgba(6,182,212,0.22)] active:scale-[0.98]"
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
              <path
                d="M2.7 7.2L5.6 9.9L11.3 4.1"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            Finish - {triedCount} of {countries.length} tried
          </button>
        </footer>
      </aside>
    </div>
  );
}
