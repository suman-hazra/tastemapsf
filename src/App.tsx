// App shell. Owns the global passport state and selection. Children are pure
// (props in, callbacks out) per the architecture decision in /plan-eng-review.
//
//   state.selectedSlug   — slug of the country whose panel is open
//                          (null = no panel, or unseeded country was clicked)
//   state.unseededName   — display name when an unseeded country was clicked
//                          (mutually exclusive with selectedSlug)
//   state.unseededFlag   — flag emoji for the selected unseeded country
//   state.triedSet       — slugs the user has marked "tried"

import { useEffect, useState } from "react";
import Counter from "./components/Counter";
import CountryListMenu from "./components/CountryListMenu";
import CountryPanel from "./components/CountryPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import FinishButton from "./components/FinishButton";
import LoadingState from "./components/LoadingState";
import ScoreDialog from "./components/ScoreDialog";
import TriedPromptDialog from "./components/TriedPromptDialog";
import WelcomeDialog from "./components/WelcomeDialog";
import WorldMap from "./components/WorldMap";
import { useMapData } from "./hooks/useMapData";

interface SharedScore {
  tried: number;
  total: number;
}

const WELCOME_STORAGE_KEY = "tastemapsf:welcome-seen";

function readWelcomeSeen(): boolean {
  try {
    return window.localStorage.getItem(WELCOME_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
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
  // Block the browser's OS-level pinch-zoom so fixed overlays (logo,
  // counter, Finish) can't slide off the visual viewport. Map zoom via
  // wheel/pinch over the SVG is unaffected — d3-zoom handles those.
  useEffect(() => {
    const blockPinch = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    const blockGesture = (e: Event) => e.preventDefault();
    document.addEventListener("wheel", blockPinch, { passive: false });
    document.addEventListener("gesturestart", blockGesture);
    return () => {
      document.removeEventListener("wheel", blockPinch);
      document.removeEventListener("gesturestart", blockGesture);
    };
  }, []);

  const mapData = useMapData();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [unseededName, setUnseededName] = useState<string | null>(null);
  const [unseededFlag, setUnseededFlag] = useState<string | null>(null);
  const [triedPromptSlug, setTriedPromptSlug] = useState<string | null>(null);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);
  const [sharedScore, setSharedScore] = useState<SharedScore | null>(() =>
    readSharedScore(),
  );
  const [triedSet, setTriedSet] = useState<Set<string>>(() => new Set());
  // Skip the welcome dialog when the user arrived via a shared score link —
  // the score dialog is the primary thing they came to see.
  const [showWelcome, setShowWelcome] = useState(
    () => !readWelcomeSeen() && readSharedScore() === null,
  );

  const dismissWelcome = () => {
    try {
      window.localStorage.setItem(WELCOME_STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors — at worst the dialog reappears next visit.
    }
    setShowWelcome(false);
  };

  // Click handler from WorldMap. Toggle semantic: re-clicking the currently
  // open country closes the panel. Clicking an unseeded country opens the
  // panel in unseeded mode, with the country's display name.
  const handleSelect = (
    slug: string | null,
    unseededDisplayName: string | null,
    unseededDisplayFlag: string | null,
  ) => {
    if (slug) {
      setUnseededName(null);
      setUnseededFlag(null);
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
      if (unseededName === unseededDisplayName) {
        setUnseededName(null);
        setUnseededFlag(null);
      } else {
        setUnseededName(unseededDisplayName);
        setUnseededFlag(unseededDisplayFlag);
      }
      return;
    }
    setSelectedSlug(null);
    setUnseededName(null);
    setUnseededFlag(null);
    setTriedPromptSlug(null);
  };

  const openScoreDialog = () => {
    setTriedPromptSlug(null);
    setSharedScore(null);
    setShowMenu(false);
    setShowCountryList(false);
    setShowScoreDialog(true);
  };

  const closeScoreDialog = () => {
    setShowScoreDialog(false);
    setSharedScore(null);
  };

  const closePanel = () => {
    setSelectedSlug(null);
    setUnseededName(null);
    setUnseededFlag(null);
    setTriedPromptSlug(null);
  };

  const closeTriedPrompt = () => {
    setTriedPromptSlug(null);
    setSelectedSlug(null);
    setUnseededName(null);
    setUnseededFlag(null);
  };

  const answerTriedPrompt = (tried: boolean) => {
    if (!triedPromptSlug) return;
    const answeredSlug = triedPromptSlug;
    setCountryTried(answeredSlug, tried);
    closeTriedPrompt();
  };

  const setCountryTried = (countryId: string, tried: boolean) => {
    setTriedSet((prev) => {
      const next = new Set(prev);
      if (tried) {
        next.add(countryId);
      } else {
        next.delete(countryId);
      }
      return next;
    });
  };

  const suggestNextCountry = (countryId: string) => {
    if (mapData.status !== "ready") return;
    const nextCountry = mapData.countryBySlug.get(countryId);
    if (!nextCountry) return;

    setShowScoreDialog(false);
    setSharedScore(null);
    setUnseededName(null);
    setUnseededFlag(null);
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
      ? { displayName: unseededName, flag: unseededFlag ?? undefined }
      : null;
  const untriedCountries =
    mapData.status === "ready"
      ? mapData.countries
          .filter((country) => !triedSet.has(country.id))
          .map((country) => ({
            id: country.id,
            flag: country.flag,
            name: country.name,
          }))
      : [];

  return (
    <ErrorBoundary>
      <div className="h-full">
        <main className="relative h-full overflow-hidden">
          <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between px-5 py-4 sm:px-6">
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
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setShowMenu((open) => !open)}
              className="pointer-events-auto grid h-12 w-12 place-items-center rounded-chip bg-[#092652] text-white shadow-md transition-colors hover:bg-[#12335f]"
            >
              <svg
                aria-hidden="true"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 7H19M5 12H19M5 17H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {showMenu && (
              <div className="pointer-events-auto absolute right-5 top-[72px] min-w-44 border border-black/10 bg-panel p-2 shadow-lg sm:right-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowCountryList(true);
                    setSelectedSlug(null);
                    setUnseededName(null);
                    setUnseededFlag(null);
                    setTriedPromptSlug(null);
                  }}
                  className="h-11 w-full rounded-chip px-3 text-left text-sm font-semibold text-ink transition-colors hover:bg-canvas"
                >
                  View list
                </button>
              </div>
            )}
          </div>
          <div className="pointer-events-none fixed left-1/2 top-4 z-20 -translate-x-1/2">
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
                onSelect={(slug, displayName, displayFlag) =>
                  handleSelect(slug, displayName, displayFlag)
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
                onClose={closeTriedPrompt}
              />
              {showCountryList && (
                <CountryListMenu
                  countries={mapData.countries}
                  triedSet={triedSet}
                  onSetTried={setCountryTried}
                  onFinish={openScoreDialog}
                  onClose={() => setShowCountryList(false)}
                />
              )}
              {(showScoreDialog || sharedScore) && (
                <ScoreDialog
                  tried={sharedScore?.tried ?? triedCount}
                  total={sharedScore?.total ?? mapData.total}
                  onClose={closeScoreDialog}
                  onSuggestNext={suggestNextCountry}
                  canSuggestNext={!sharedScore && untriedCountries.length > 0}
                  untriedCountries={sharedScore ? [] : untriedCountries}
                />
              )}
              {showWelcome && <WelcomeDialog onDismiss={dismissWelcome} />}
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
