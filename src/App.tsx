// App shell. Owns the global passport state and selection. Children are pure
// (props in, callbacks out) per the architecture decision in /plan-eng-review.
//
//   state.selectedSlug   — slug of the country whose panel is open (Phase D)
//   state.triedSet       — slugs the user has marked "tried"
//
// Phase C wiring: map renders with 3-tone fills, click selects/deselects a
// country (visible as stroke ring on the map). Panel renders in Phase D.
// Counter shows em-dash → "X / N" once data loads. Real Counter component
// + milestone animation lands in Phase E.

import { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingState from "./components/LoadingState";
import WorldMap from "./components/WorldMap";
import { useMapData } from "./hooks/useMapData";

export default function App() {
  const mapData = useMapData();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [triedSet] = useState<Set<string>>(() => new Set());

  // Toggle semantic: clicking the currently selected country closes the panel.
  const selectCountry = (slug: string | null) => {
    if (slug === null) {
      setSelectedSlug(null);
      return;
    }
    setSelectedSlug((prev) => (prev === slug ? null : slug));
  };

  const triedCount = triedSet.size;
  const total = mapData.status === "ready" ? mapData.total : null;

  return (
    <ErrorBoundary>
      <div className="flex h-full flex-col">
        <header className="flex h-24 items-center justify-between border-b border-black/5 px-6">
          <a href="/" className="flex items-center" aria-label="TastemapSF home">
            <img
              src="/tastemapsflogo.png"
              alt="TastemapSF"
              className="h-20 w-auto mix-blend-multiply"
            />
          </a>
          <div className="flex flex-col items-end leading-none">
            <div className="font-display tabular-nums">
              <span className="text-5xl font-semibold">
                {total === null ? "—" : triedCount}
              </span>
              <span className="ml-2 text-xl text-ink-soft">
                / {total === null ? "—" : total}
              </span>
            </div>
            <div className="mt-2 text-sm text-ink-soft">
              {total === null ? "Loading map…" : "Click a country to start"}
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-hidden">
          {mapData.status === "loading" && <LoadingState />}

          {mapData.status === "error" && (
            <div className="grid h-full place-items-center px-6 text-center">
              <div className="max-w-md">
                <h2 className="font-display text-xl font-semibold">
                  Couldn't load the map.
                </h2>
                <p className="mt-2 text-sm text-ink-soft">{mapData.message}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-chip border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5"
                >
                  Reload
                </button>
              </div>
            </div>
          )}

          {mapData.status === "ready" && (
            <WorldMap
              topology={mapData.topology}
              triedSet={triedSet}
              selectedSlug={selectedSlug}
              onSelect={selectCountry}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
