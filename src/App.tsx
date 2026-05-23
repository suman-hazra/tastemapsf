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
import FinishButton from "./components/FinishButton";
import LoadingState from "./components/LoadingState";
import ScoreDialog from "./components/ScoreDialog";
import TriedPromptDialog from "./components/TriedPromptDialog";
import WorldMap from "./components/WorldMap";
import { useMapData } from "./hooks/useMapData";

interface SharedScore {
  tried: number;
  total: number;
}

function readSharedScore(): SharedScore | null {
  const params = new URLSearchParams(window.location.search);
  const tried = Number(params.get("score"));
  const total = Number(params.get("total"));
  if (!Number.isInteger(tried) || !Number.isInteger(total)) return null;
  if (tried < 0 || total <= 0 || tried > total) return null;
  return { tried, total };
}

export default function App() {
  const mapData = useMapData();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [unseededName, setUnseededName] = useState<string | null>(null);
  const [triedPromptSlug, setTriedPromptSlug] = useState<string | null>(null);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [sharedScore, setSharedScore] = useState<SharedScore | null>(() =>
    readSharedScore(),
  );
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
      if (selectedSlug === slug) {
        setSelectedSlug(null);
        setTriedPromptSlug(null);
        return;
      }
      setSelectedSlug(slug);
      setTriedPromptSlug(slug);
      return;
    }
    if (unseededDisplayName) {
      setSelectedSlug(null);
      setTriedPromptSlug(null);
      setUnseededName((prev) =>
        prev === unseededDisplayName ? null : unseededDisplayName,
      );
      return;
    }
    setSelectedSlug(null);
    setUnseededName(null);
    setTriedPromptSlug(null);
  };

  const openScoreDialog = () => {
    setTriedPromptSlug(null);
    setSharedScore(null);
    setShowScoreDialog(true);
  };

  const closeScoreDialog = () => {
    setShowScoreDialog(false);
    setSharedScore(null);
  };

  const closePanel = () => {
    setSelectedSlug(null);
    setUnseededName(null);
    setTriedPromptSlug(null);
  };

  const answerTriedPrompt = (tried: boolean) => {
    if (!triedPromptSlug) return;
    setTriedSet((prev) => {
      const next = new Set(prev);
      if (tried) {
        next.add(triedPromptSlug);
      } else {
        next.delete(triedPromptSlug);
      }
      return next;
    });
    setTriedPromptSlug(null);
  };

  const suggestNextCountry = () => {
    if (mapData.status !== "ready") return;
    const untriedCountries = mapData.countries.filter(
      (country) => !triedSet.has(country.id),
    );
    if (untriedCountries.length === 0) return;

    const nextCountry =
      untriedCountries[Math.floor(Math.random() * untriedCountries.length)];
    setShowScoreDialog(false);
    setSharedScore(null);
    setUnseededName(null);
    setTriedPromptSlug(null);
    setSelectedSlug(nextCountry.id);
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
  const triedPromptCountry =
    mapData.status === "ready" && triedPromptSlug
      ? (mapData.countryBySlug.get(triedPromptSlug) ?? null)
      : null;

  const panelCountry = selectedCountry
    ? selectedCountry
    : unseededName
      ? { displayName: unseededName }
      : null;

  return (
    <ErrorBoundary>
      <div className="h-full">
        <main className="relative h-full overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-5 py-4 sm:px-6">
            <a
              href="/"
              className="pointer-events-auto flex items-center"
              aria-label="TastemapSF home"
            >
              <svg width="0" height="0" className="absolute" aria-hidden="true">
                <filter id="logo-chroma-white" colorInterpolationFilters="sRGB">
                  <feColorMatrix
                    type="matrix"
                    values="1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            -1 -1 -1 0 2.4"
                  />
                  <feComponentTransfer>
                    <feFuncA type="discrete" tableValues="0 1" />
                  </feComponentTransfer>
                  <feComposite in2="SourceGraphic" operator="in" />
                </filter>
              </svg>
              <img
                src="/tastemapsflogo2.png"
                alt="TastemapSF"
                className="h-20 w-auto"
                style={{ filter: "url(#logo-chroma-white)" }}
              />
            </a>
            <div className="pointer-events-auto px-3 py-2">
              <Counter tried={triedCount} total={total} />
            </div>
          </div>

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
                seededSlugs={mapData.countries.map((country) => country.id)}
                centroidForSlug={mapData.centroidForSlug}
                nameForSlug={(slug) =>
                  mapData.countryBySlug.get(slug)?.name
                }
                flagForSlug={(slug) =>
                  mapData.countryBySlug.get(slug)?.flag
                }
                onSelect={(slug, displayName) =>
                  handleSelect(slug, displayName)
                }
              />
              <FinishButton onClick={openScoreDialog} />
              <CountryPanel
                country={panelCountry}
                onClose={closePanel}
              />
              <TriedPromptDialog
                country={triedPromptCountry}
                onAnswer={answerTriedPrompt}
              />
              {(showScoreDialog || sharedScore) && (
                <ScoreDialog
                  tried={sharedScore?.tried ?? triedCount}
                  total={sharedScore?.total ?? mapData.total}
                  onClose={closeScoreDialog}
                  onSuggestNext={suggestNextCountry}
                  canSuggestNext={triedCount < mapData.total}
                />
              )}
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
