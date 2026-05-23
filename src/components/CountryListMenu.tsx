import { useEffect, useRef } from "react";
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

export default function CountryListMenu({
  countries,
  triedSet,
  onSetTried,
  onFinish,
  onClose,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const continentGroups = groupCountriesByContinent(countries);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="country-list-title"
      className="absolute inset-y-0 right-0 z-40 flex w-full flex-col overflow-hidden border-l border-black/5 bg-panel shadow-xl md:max-w-[430px]"
    >
      <header className="flex items-start justify-between border-b border-black/5 px-4 py-3 sm:px-5 sm:py-4">
        <div>
          <h2
            id="country-list-title"
            className="font-display text-xl font-semibold leading-tight sm:text-2xl"
          >
            View list
          </h2>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Mark the countries you have tried.
          </p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close country list"
          className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-ink-soft hover:bg-black/5"
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
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4">
        <div className="space-y-5">
          {continentGroups.map((group) => (
            <section key={group.continent}>
              <h3 className="sticky top-0 z-10 border-b border-black/5 bg-panel py-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
                {group.continent}
              </h3>
              <ul className="divide-y divide-black/5">
                {group.countries.map((country) => {
                  const hasTried = triedSet.has(country.id);
                  return (
                    <li
                      key={country.id}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 py-3 sm:gap-3"
                    >
                      <span className="text-xl sm:text-2xl" aria-hidden="true">
                        {country.flag}
                      </span>
                      <span className="min-w-0 text-sm font-semibold leading-tight">
                        {country.name}
                      </span>
                      <div className="grid grid-cols-2 overflow-hidden rounded-chip border border-black/10 bg-white">
                        <button
                          type="button"
                          onClick={() => onSetTried(country.id, true)}
                          aria-pressed={hasTried}
                          className={`h-9 px-3 text-sm font-semibold transition-colors ${
                            hasTried
                              ? "bg-tried/20 text-ink"
                              : "text-ink-soft hover:bg-canvas"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => onSetTried(country.id, false)}
                          aria-pressed={!hasTried}
                          className={`h-9 border-l border-black/10 px-3 text-sm font-semibold transition-colors ${
                            !hasTried
                              ? "bg-[#c9463a]/10 text-ink"
                              : "text-ink-soft hover:bg-canvas"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <footer className="border-t border-black/5 bg-panel px-4 py-3 sm:px-5 sm:py-4">
        <button
          type="button"
          onClick={onFinish}
          className="h-12 w-full rounded-chip border border-black/10 bg-[#092652] px-4 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#12335f]"
        >
          Finish
        </button>
      </footer>
    </aside>
  );
}
