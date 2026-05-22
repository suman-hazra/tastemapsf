// App shell. Owns the global passport state and selection. Children are pure
// (props in, callbacks out) per the architecture decision in /plan-eng-review.
//
//   state.selectedSlug   — slug of the country whose panel is open
//                          (null = no panel, or unseeded country was clicked)
//   state.unseededName   — display name when an unseeded country was clicked
//                          (mutually exclusive with selectedSlug)
//   state.triedSet       — slugs the user has marked "tried"

import { useState } from "react";
import Counter from "./components/Counter";
import CountryPanel from "./components/CountryPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingState from "./components/LoadingState";
import WorldMap from "./components/WorldMap";
import { useMapData } from "./hooks/useMapData";
import { toggleSlug } from "./utils/toggleSlug";

export default function App() {
  const mapData = useMapData();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [unseededName, setUnseededName] = useState<string | null>(null);
  const [triedSet, setTriedSet] = useState<Set<string>>(() => new Set());

  // Click handler from WorldMap. Toggle semantic: re-clicking the currently
  // open country closes the panel. Clicking an unseeded country opens the
  // panel in unseeded mode, with the country's display name.
  const handleSelect = (
    slug: string | null,
    unseededDisplayName: string | null,
  ) => {
    if (slug) {
      setUnseededName(null);
      setSelectedSlug((prev) => (prev === slug ? null : slug));
      return;
    }
    if (unseededDisplayName) {
      setSelectedSlug(null);
      setUnseededName((prev) =>
        prev === unseededDisplayName ? null : unseededDisplayName,
      );
      return;
    }
    setSelectedSlug(null);
    setUnseededName(null);
  };

  const closePanel = () => {
    setSelectedSlug(null);
    setUnseededName(null);
  };

  const toggleTried = () => {
    if (!selectedSlug) return;
    setTriedSet((prev) => toggleSlug(prev, selectedSlug));
  };

  const triedCount = triedSet.size;
  const total = mapData.status === "ready" ? mapData.total : null;
  const selectedCountry =
    mapData.status === "ready" && selectedSlug
      ? (mapData.countryBySlug.get(selectedSlug) ?? null)
      : null;
  const selectedCentroid =
    mapData.status === "ready" && selectedSlug
      ? (mapData.centroidForSlug(selectedSlug) ?? null)
      : null;

  const panelCountry = selectedCountry
    ? selectedCountry
    : unseededName
      ? { displayName: unseededName }
      : null;

  const hint =
    total === null
      ? "Loading map…"
      : selectedSlug || unseededName
        ? " "
        : "Click a country to start";

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
          <Counter tried={triedCount} total={total} hint={hint} />
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
            <>
              <WorldMap
                topology={mapData.topology}
                triedSet={triedSet}
                selectedSlug={selectedSlug}
                selectedCentroid={selectedCentroid}
                onSelect={(slug, displayName) =>
                  handleSelect(slug, displayName)
                }
              />
              <CountryPanel
                country={panelCountry}
                tried={selectedSlug ? triedSet.has(selectedSlug) : false}
                onToggleTried={toggleTried}
                onClose={closePanel}
              />
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
