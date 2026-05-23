import { useEffect, useMemo, useRef, useState } from "react";
import type { Country } from "../data/types";

type BiteCountry = Pick<Country, "id" | "flag" | "name">;

interface Props {
  tried: number;
  total: number;
  onClose: () => void;
  onSuggestNext: (countryId: string) => void;
  canSuggestNext: boolean;
  untriedCountries: BiteCountry[];
}

const CONFETTI = [
  { left: "12%", delay: "0ms", color: "#7cc576" },
  { left: "23%", delay: "80ms", color: "#fed21c" },
  { left: "35%", delay: "20ms", color: "#c9463a" },
  { left: "48%", delay: "120ms", color: "#ad5cee" },
  { left: "58%", delay: "40ms", color: "#7cc576" },
  { left: "69%", delay: "150ms", color: "#fed21c" },
  { left: "81%", delay: "70ms", color: "#c9463a" },
  { left: "90%", delay: "110ms", color: "#ad5cee" },
] as const;

const SHARE_URL_BASE = "https://www.tastemapsf.com/";

export default function ScoreDialog({
  tried,
  total,
  onClose,
  onSuggestNext,
  canSuggestNext,
  untriedCountries,
}: Props) {
  const [shareExpanded, setShareExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [biteState, setBiteState] = useState<"idle" | "spinning" | "revealed">(
    "idle",
  );
  const [nextBite, setNextBite] = useState<BiteCountry | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const shareUrl = useMemo(() => {
    const url = new URL(SHARE_URL_BASE);
    url.searchParams.set("score", String(tried));
    url.searchParams.set("total", String(total));
    return url.toString();
  }, [tried, total]);
  const shareText = `I scored ${tried} out of ${total} on TastemapSF!!!\n\nWhat is your score? Try it yourself here:`;
  const canNativeShare =
    typeof (navigator as Navigator & { share?: unknown }).share === "function";

  useEffect(() => {
    return () => {
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
      }
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  const nativeShare = async () => {
    if (!canNativeShare) {
      setShareExpanded(true);
      return;
    }

    try {
      await navigator.share({
        title: "Tastemap SF",
        text: shareText,
        url: shareUrl,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setShareExpanded(true);
    }
  };

  const copyShareLink = async () => {
    const text = `${shareText} ${shareUrl}`;
    if (!navigator.clipboard) {
      window.prompt("Copy your Tastemap SF score:", text);
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const pickNextBite = () => {
    if (!canSuggestNext || untriedCountries.length === 0) return;
    const country =
      untriedCountries[Math.floor(Math.random() * untriedCountries.length)];
    setShareExpanded(false);
    setNextBite(country);
    setBiteState("spinning");

    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
    }
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
    }

    revealTimerRef.current = window.setTimeout(() => {
      setBiteState("revealed");
      openTimerRef.current = window.setTimeout(() => {
        onSuggestNext(country.id);
      }, 1300);
    }, 1700);
  };

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/20 px-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-title"
        className="relative w-full max-w-md overflow-hidden border border-black/10 bg-panel px-4 py-5 text-center shadow-xl sm:max-w-lg sm:px-6 sm:py-6"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.34), rgba(255,255,255,0.34)), url('/dolores.jpg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close score dialog"
          className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full text-ink-soft hover:bg-black/5"
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

        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {CONFETTI.map((piece, index) => (
            <span
              key={index}
              className="score-confetti"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                backgroundColor: piece.color,
              }}
            />
          ))}
        </div>

        <div className="relative">
          <div className="font-display text-5xl font-semibold tabular-nums sm:text-6xl">
            {tried}
            <span className="ml-2 text-xl text-ink-soft sm:text-2xl">
              / {total}
            </span>
          </div>
          <h2
            id="score-title"
            className="mt-3 font-display text-xl font-semibold sm:text-2xl"
          >
            Your Tastemap score
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            <span className="inline-block bg-white/70 px-2 py-1 text-ink">
              San Francisco has room for every appetite. You have tasted part
              of the map, and there is always another cuisine, neighborhood,
              and table to try next.
            </span>
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-chip border border-black/10 bg-white px-4 text-sm font-semibold transition-colors hover:bg-canvas"
            >
              Back to map
            </button>
            <button
              type="button"
              onClick={pickNextBite}
              disabled={!canSuggestNext || biteState === "spinning"}
              className="h-11 whitespace-nowrap rounded-chip border border-black/10 bg-white px-4 text-sm font-semibold transition-colors hover:bg-canvas disabled:cursor-default disabled:border-black/5 disabled:bg-white/70 disabled:text-ink-soft"
            >
              {biteState === "spinning" ? "Picking..." : "Pick My Next Bite"}
            </button>
          </div>
          {nextBite && (
            <div className="mt-5 grid place-items-center">
              <div className="relative grid h-44 w-44 place-items-center sm:h-56 sm:w-56">
                <div
                  className={
                    biteState === "revealed"
                      ? "next-bite-pointer next-bite-hidden"
                      : "next-bite-pointer"
                  }
                  aria-hidden="true"
                />
                <div
                  className={
                    biteState === "spinning"
                      ? "next-bite-wheel next-bite-wheel-spinning"
                      : biteState === "revealed"
                        ? "next-bite-wheel next-bite-wheel-revealed"
                      : "next-bite-wheel"
                  }
                  aria-hidden="true"
                />
                <div
                  className={
                    biteState === "revealed"
                      ? "next-bite-wheel-hub next-bite-hidden"
                      : "next-bite-wheel-hub"
                  }
                  aria-hidden="true"
                />
                <div
                  className={
                    biteState === "revealed"
                      ? "next-bite-result next-bite-result-visible"
                      : "next-bite-result"
                  }
                >
                  <div className="next-bite-flag" aria-hidden="true">
                    {nextBite.flag}
                  </div>
                  <div className="next-bite-country font-display font-semibold">
                    {nextBite.name}
                  </div>
                </div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShareExpanded((expanded) => !expanded)}
            className="mt-3 h-11 w-full rounded-chip border border-black/10 bg-white px-4 text-sm font-semibold transition-colors hover:bg-canvas"
          >
            Share your score
          </button>
          {shareExpanded && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {canNativeShare && (
                <button
                  type="button"
                  onClick={nativeShare}
                  className="h-10 rounded-chip border border-black/10 bg-white px-3 text-sm font-semibold transition-colors hover:bg-canvas"
                >
                  More
                </button>
              )}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  shareText,
                )}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 place-items-center rounded-chip border border-black/10 bg-white text-sm font-semibold transition-colors hover:bg-canvas"
              >
                X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 place-items-center rounded-chip border border-black/10 bg-white text-sm font-semibold transition-colors hover:bg-canvas"
              >
                Facebook
              </a>
              <button
                type="button"
                onClick={copyShareLink}
                className="h-10 rounded-chip border border-black/10 bg-white px-3 text-sm font-semibold transition-colors hover:bg-canvas"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
