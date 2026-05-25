// App shell. Owns the global passport state and selection. Children are pure
// (props in, callbacks out) per the architecture decision in /plan-eng-review.
//
//   state.selectedSlug   — slug of the country whose panel is open
//                          (null = no panel, or unseeded country was clicked)
//   state.unseededName   — display name when an unseeded country was clicked
//                          (mutually exclusive with selectedSlug)
//   state.unseededFlag   — flag emoji for the selected unseeded country
//   state.triedSet       — slugs the user has marked "tried"

import { useEffect, useRef, useState } from "react";
import Counter from "./components/Counter";
import CountryListMenu from "./components/CountryListMenu";
import CountryPanel from "./components/CountryPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import FinishButton from "./components/FinishButton";
import LegalDialog from "./components/LegalDialog";
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

const WELCOME_STORAGE_KEY = "tastemap-welcome-dismissed";
const WELCOME_STORAGE_VERSION = "v1";

function readWelcomeSeen(): boolean {
  try {
    return (
      window.localStorage.getItem(WELCOME_STORAGE_KEY) ===
      WELCOME_STORAGE_VERSION
    );
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
  // Set when a country is opened via "Pick my next bite". Suppresses the
  // tried prompt — desktop dialog and the mobile in-panel yes/no bar — since
  // the user picked a suggestion precisely because they haven't been yet.
  const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);
  const [showLegalDialog, setShowLegalDialog] = useState(false);
  const [sharedScore, setSharedScore] = useState<SharedScore | null>(() =>
    readSharedScore(),
  );
  const [triedSet, setTriedSet] = useState<Set<string>>(() => new Set());
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    window.matchMedia("(max-width: 767px)").matches,
  );
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // Skip the welcome dialog when the user arrived via a shared score link —
  // the score dialog is the primary thing they came to see. In dev, ignore
  // the dismissal flag so the dialog reappears on every reload while
  // iterating on it.
  const [showWelcome, setShowWelcome] = useState(() => {
    if (readSharedScore() !== null) return false;
    if (import.meta.env.DEV) return true;
    return !readWelcomeSeen();
  });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileViewport(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const dismissWelcome = () => {
    try {
      window.localStorage.setItem(WELCOME_STORAGE_KEY, WELCOME_STORAGE_VERSION);
    } catch {
      // Ignore storage errors — at worst the dialog reappears next visit.
    }
    setShowWelcome(false);
  };

  const openWelcomeDialog = () => {
    setShowMenu(false);
    setShowCountryList(false);
    setShowLegalDialog(false);
    setShowScoreDialog(false);
    setSharedScore(null);
    setTriedPromptSlug(null);
    setShowWelcome(true);
  };

  // Click handler from WorldMap. Toggle semantic: re-clicking the currently
  // open country closes the panel. Clicking an unseeded country opens the
  // panel in unseeded mode, with the country's display name.
  const handleSelect = (
    slug: string | null,
    unseededDisplayName: string | null,
    unseededDisplayFlag: string | null,
  ) => {
    // Any direct map selection is deliberate, so clear the suggestion flag.
    setSuggestedSlug(null);
    if (slug) {
      setUnseededName(null);
      setUnseededFlag(null);
      if (selectedSlug === slug) {
        setSelectedSlug(null);
        setTriedPromptSlug(null);
        return;
      }
      setSelectedSlug(slug);
      const selectedCountry =
        mapData.status === "ready"
          ? mapData.allCountryBySlug.get(slug)
          : undefined;
      setTriedPromptSlug(
        !isMobileViewport &&
          selectedCountry &&
          selectedCountry.restaurants.length > 0
          ? slug
          : null,
      );
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
    setShowLegalDialog(false);
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

  const openLegalDialog = () => {
    setShowMenu(false);
    setShowCountryList(false);
    setSelectedSlug(null);
    setUnseededName(null);
    setUnseededFlag(null);
    setTriedPromptSlug(null);
    setShowLegalDialog(true);
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
    setSuggestedSlug(nextCountry.id);
    setSelectedSlug(nextCountry.id);
  };

  const triedCount = triedSet.size;
  const total = mapData.status === "ready" ? mapData.total : null;
  const selectedCountry =
    mapData.status === "ready" && selectedSlug
      ? (mapData.allCountryBySlug.get(selectedSlug) ?? null)
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
            signature_dishes: country.signature_dishes,
          }))
      : [];
  return (
    <ErrorBoundary>
      <div className="h-[100dvh]">
        <main className="relative flex h-[100dvh] flex-col overflow-hidden bg-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-[#c4b5fd] opacity-25 blur-3xl" />
            <div className="absolute right-0 top-0 h-[440px] w-[620px] rounded-full bg-[#67e8f9] opacity-20 blur-3xl" />
          </div>

          <div className="relative z-20 shrink-0 px-3 pt-3 sm:px-6 sm:pt-6">
            <header
              className="relative z-50 flex h-14 items-center justify-between rounded-2xl px-4 sm:px-6"
              style={{
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(15,15,18,0.08)",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.55) inset, 0 4px 24px rgba(124,58,237,0.06)",
                WebkitBackdropFilter: "blur(20px)",
                backdropFilter: "blur(20px)",
              }}
            >
              <a
                href="/"
                className="flex items-center"
                aria-label="TastemapSF home"
              >
                <img
                  src="/newlogo.png"
                  alt="TastemapSF"
                  className="h-10 w-auto sm:h-12"
                />
              </a>
              <div className="relative flex items-center gap-2">
                <Counter tried={triedCount} total={total} />
                {!showMenu && (
                  <button
                    ref={menuButtonRef}
                    type="button"
                    aria-label="Open menu"
                    onClick={() => setShowMenu(true)}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white/70 text-[#0f0f12] transition-colors hover:bg-white sm:h-10 sm:w-10"
                  >
                    <svg
                      aria-hidden="true"
                      width="20"
                      height="20"
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
                )}
                {showMenu && (
                  <HamburgerMenu
                    onClose={() => {
                      setShowMenu(false);
                      menuButtonRef.current?.focus();
                    }}
                    onViewList={() => {
                      setShowMenu(false);
                      setShowCountryList(true);
                      setSelectedSlug(null);
                      setUnseededName(null);
                      setUnseededFlag(null);
                      setTriedPromptSlug(null);
                    }}
                    onAbout={openWelcomeDialog}
                    onLegal={openLegalDialog}
                  />
                )}
              </div>
            </header>

            <div className="flex flex-col gap-3 px-3 pb-3 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-6 sm:pb-4 sm:pt-6">
              <h1 className="max-w-3xl text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-[0.98] tracking-normal text-[#0f0f12]">
                Eat the{" "}
                <span className="bg-[linear-gradient(120deg,#7c3aed_0%,#ec4899_40%,#06b6d4_80%)] bg-clip-text text-transparent">
                  world
                </span>
                ,<br />
                without leaving San Francisco.
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#0f0f12] sm:justify-end sm:pb-1">
                <LegendChip label="Soon" color="#e8e8ee" />
                <LegendChip
                  label="In SF"
                  gradient="linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)"
                />
                <LegendChip
                  label="Tasted"
                  gradient="linear-gradient(135deg, #84cc16 0%, #22d3ee 100%)"
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-3 pb-3 sm:px-6 sm:pb-6 md:block md:gap-0">
            <div className="relative aspect-[93/50] max-h-full w-full shrink-0 overflow-hidden rounded-[24px] border border-black/[0.08] bg-white/70 shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_20px_60px_rgba(124,58,237,0.10)] md:aspect-auto md:h-full">
              {mapData.status === "loading" && <LoadingState />}

              {mapData.status === "error" && (
                <div className="grid h-full place-items-center px-6 text-center">
                  <div className="max-w-md">
                    <h2 className="font-display text-xl font-semibold">
                      Couldn't load the map.
                    </h2>
                    <p className="mt-2 text-sm text-ink-soft">
                      {mapData.message}
                    </p>
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
                  <div
                    className={`h-full transition-[filter,opacity] duration-200 ${
                      showWelcome || showScoreDialog || sharedScore
                        ? "opacity-55 blur-[2px]"
                        : ""
                    }`}
                  >
                    <WorldMap
                      topology={mapData.topology}
                      triedSet={triedSet}
                      selectedSlug={selectedSlug}
                      selectedCentroid={selectedCentroid}
                      seededSlugs={mapData.countries.map(
                        (country) => country.id,
                      )}
                      knownSlugs={mapData.allCountries.map(
                        (country) => country.id,
                      )}
                      centroidForSlug={mapData.centroidForSlug}
                      nameForSlug={(slug) =>
                        mapData.allCountryBySlug.get(slug)?.name
                      }
                      flagForSlug={(slug) =>
                        mapData.allCountryBySlug.get(slug)?.flag
                      }
                      onSelect={(slug, displayName, displayFlag) =>
                        handleSelect(slug, displayName, displayFlag)
                      }
                    />
                  </div>
                </>
              )}
            </div>
            {mapData.status === "ready" && (
              <FinishButton onClick={openScoreDialog} />
            )}
          </div>

          {/* Full-screen modals live at the <main> level — not inside the
              z-10 map region — so their z-[60] overlays the z-20 top banner
              and slogan instead of being trapped beneath them. */}
          {mapData.status === "ready" && (
            <CountryPanel
              country={panelCountry}
              onClose={closePanel}
              triedSet={triedSet}
              onSetTried={setCountryTried}
              hideTriedControl={
                selectedSlug !== null && selectedSlug === suggestedSlug
              }
            />
          )}
          {mapData.status === "ready" && !isMobileViewport && (
            <TriedPromptDialog
              country={triedPromptCountry}
              onAnswer={answerTriedPrompt}
              onClose={closeTriedPrompt}
            />
          )}
          {mapData.status === "ready" && (showScoreDialog || sharedScore) && (
            <ScoreDialog
              tried={sharedScore?.tried ?? triedCount}
              total={sharedScore?.total ?? mapData.total}
              onClose={closeScoreDialog}
              onSuggestNext={suggestNextCountry}
              canSuggestNext={!sharedScore && untriedCountries.length > 0}
              untriedCountries={sharedScore ? [] : untriedCountries}
            />
          )}
          {mapData.status === "ready" && showWelcome && (
            <WelcomeDialog onDismiss={dismissWelcome} />
          )}
          {mapData.status === "ready" && showCountryList && (
            <CountryListMenu
              countries={mapData.countries}
              triedSet={triedSet}
              onSetTried={setCountryTried}
              onFinish={openScoreDialog}
              onClose={() => setShowCountryList(false)}
            />
          )}
          {showLegalDialog && (
            <LegalDialog onClose={() => setShowLegalDialog(false)} />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

function LegendChip({
  label,
  color,
  gradient,
}: {
  label: string;
  color?: string;
  gradient?: string;
}) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-black/[0.08] bg-white/70 px-3 backdrop-blur-xl">
      <span
        aria-hidden="true"
        className="h-2 w-2 rounded-full"
        style={{ background: gradient ?? color }}
      />
      <span>{label}</span>
    </span>
  );
}

function HamburgerMenu({
  onClose,
  onViewList,
  onAbout,
  onLegal,
}: {
  onClose: () => void;
  onViewList: () => void;
  onAbout: () => void;
  onLegal: () => void;
}) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const items = [
    { label: "View list", icon: <ListIcon />, action: onViewList },
    { label: "About", icon: <InfoIcon />, action: onAbout },
    { label: "Legal & credits", icon: <ShieldIcon />, action: onLegal },
  ];

  useEffect(() => {
    itemRefs.current[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      const activeIndex = itemRefs.current.findIndex(
        (item) => item === document.activeElement,
      );

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        itemRefs.current[(activeIndex + 1 + items.length) % items.length]?.focus();
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        itemRefs.current[(activeIndex - 1 + items.length) % items.length]?.focus();
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        itemRefs.current[0]?.focus();
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        itemRefs.current[items.length - 1]?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [items.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50"
      onMouseDown={onClose}
    >
      <div className="absolute right-3 top-3 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="ml-auto grid h-9 w-9 place-items-center rounded-xl border border-black/[0.08] bg-white/[0.92] text-[#6b6b76] shadow-[0_2px_12px_rgba(15,15,18,0.06)] backdrop-blur-[20px] transition-all hover:bg-white hover:shadow-[0_4px_16px_rgba(15,15,18,0.10)] sm:h-10 sm:w-10"
        >
          <CloseIcon />
        </button>
        <div
          role="menu"
          aria-label="Main menu"
          onMouseDown={(event) => event.stopPropagation()}
          className="mt-4 w-[200px] animate-[menu-enter_250ms_cubic-bezier(0.22,1,0.36,1)_forwards] overflow-hidden rounded-[18px] border border-black/[0.08] bg-white/[0.92] py-1.5 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(124,58,237,0.12),0_6px_20px_rgba(6,182,212,0.08)] backdrop-blur-[24px] sm:w-60"
        >
          {items.map((item, index) => (
            <button
              key={item.label}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              onClick={item.action}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium leading-[1.4] text-[#0f0f12] transition-colors hover:bg-[#7c3aed]/[0.04] focus:bg-[#7c3aed]/[0.04] focus:outline-none ${
                index < items.length - 1 ? "border-b border-black/[0.08]" : ""
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <ChevronIcon />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="#6b6b76" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M4 5h8M4 8h8M4 11h8" stroke="#6b6b76" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="5.5" stroke="#6b6b76" strokeWidth="1.5" />
      <path d="M8 7.4v3.3" stroke="#6b6b76" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5.4" r="0.7" fill="#6b6b76" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M8 2.5l4.5 1.7v3.4c0 2.8-1.8 5.1-4.5 6-2.7-.9-4.5-3.2-4.5-6V4.2L8 2.5Z" stroke="#6b6b76" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M5.5 3.5L9 7l-3.5 3.5" stroke="rgba(15,15,18,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
