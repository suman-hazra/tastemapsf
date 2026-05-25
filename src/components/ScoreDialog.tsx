import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Country } from "../data/types";

type NextBiteCountry = Pick<
  Country,
  "id" | "flag" | "name" | "signature_dishes"
>;

interface Props {
  tried: number;
  total: number;
  onClose: () => void;
  onSuggestNext: (countryId: string) => void;
  canSuggestNext: boolean;
  untriedCountries: NextBiteCountry[];
}

const SHARE_URL_BASE = "https://www.tastemapsf.com/";

function scoreMessage(tried: number, total: number): string {
  if (tried === 0) {
    return "Your map is still untouched. Perfect excuse to start with one great meal in San Francisco.";
  }
  const pct = total > 0 ? tried / total : 0;
  if (pct >= 1) {
    return "You did it. Every available country on the map is stamped.";
  }
  if (pct >= 0.9) {
    return "You have nearly eaten the world without leaving San Francisco.";
  }
  if (pct >= 0.75) {
    return "Your passport is packed. You are down to the hard-to-find corners of San Francisco.";
  }
  if (pct >= 0.5) {
    return "You have crossed the halfway mark. Now it is about curiosity, not convenience.";
  }
  if (pct >= 0.25) {
    return "You have tasted across continents, but the best surprises may still be ahead.";
  }
  if (pct >= 0.1) {
    return "You know your way around a handful of cuisines, but there is still a lot of SF to taste.";
  }
  return "You have only taken the first bite of the map. Start with one country, one dish, one neighborhood.";
}

export default function ScoreDialog({
  tried,
  total,
  onClose,
  onSuggestNext,
  canSuggestNext,
  untriedCountries,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [biteState, setBiteState] = useState<"idle" | "spinning" | "revealed">(
    "idle",
  );
  const [nextBite, setNextBite] = useState<NextBiteCountry | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const exploreButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const shareUrl = useMemo(() => {
    const url = new URL(SHARE_URL_BASE);
    url.searchParams.set("score", String(tried));
    url.searchParams.set("total", String(total));
    return url.toString();
  }, [tried, total]);
  const shareText = `I scored ${tried} out of ${total} on TastemapSF!!!\n\nWhat is your score? Try it yourself here:`;
  const canNativeShare =
    typeof (navigator as Navigator & { share?: unknown }).share === "function";
  const message = scoreMessage(tried, total);
  const filledDots = Math.ceil((total > 0 ? tried / total : 0) * 10);
  const isPicking = biteState === "spinning";
  const isRevealed = biteState === "revealed";
  const isPickerActive = biteState !== "idle";

  const resetPicker = () => {
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setBiteState("idle");
    setNextBite(null);
  };

  const closeOrBack = () => {
    if (isPickerActive) {
      resetPicker();
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (isRevealed) {
      exploreButtonRef.current?.focus();
    } else if (isPicking) {
      backButtonRef.current?.focus();
    } else {
      (canSuggestNext ? primaryButtonRef.current : closeButtonRef.current)?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (biteState !== "idle") {
          resetPicker();
        } else {
          onClose();
        }
      }
      if (e.key !== "Tab") return;

      const card = cardRef.current;
      if (!card) return;
      const focusable = Array.from(
        card.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [biteState, canSuggestNext, onClose]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  const nativeShare = async () => {
    if (!canNativeShare) {
      await copyShareLink();
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
      await copyShareLink();
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
    setNextBite(country);
    setBiteState("spinning");

    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
    }

    revealTimerRef.current = window.setTimeout(() => {
      setBiteState("revealed");
    }, 3000);
  };

  const exploreNextBite = () => {
    if (!nextBite) return;
    onSuggestNext(nextBite.id);
  };

  return (
    <div
      className="absolute inset-0 z-40 grid place-items-center overflow-hidden px-4 py-6"
      onMouseDown={closeOrBack}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-[#c4b5fd] opacity-40 blur-[64px]" />
        <div className="absolute right-0 top-0 h-[500px] w-[700px] rounded-full bg-[#67e8f9] opacity-35 blur-[64px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[500px] rounded-full bg-[#bef264] opacity-25 blur-[64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.25)_60%,transparent_100%)]" />
      </div>
      <section
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-title"
        onMouseDown={(event) => event.stopPropagation()}
          className="relative w-full max-w-[480px] animate-[modal-enter_280ms_cubic-bezier(0.22,1,0.36,1)_forwards] overflow-hidden rounded-[24px] border border-black/[0.08] bg-white/[0.92] px-6 pb-7 pt-8 text-center shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_30px_80px_rgba(124,58,237,0.22),0_8px_28px_rgba(6,182,212,0.10)] backdrop-blur-[28px] sm:max-w-[480px] sm:px-10 sm:pb-9 sm:pt-10"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#7c3aed_0%,#ec4899_50%,#06b6d4_100%)]"
        />
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeOrBack}
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

        <div className="relative">
          <div className="mb-2 flex items-baseline justify-center gap-1 tabular-nums">
            <span
              className={`bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] bg-clip-text font-bold leading-none tracking-normal text-transparent ${
                isPickerActive ? "text-[64px]" : "text-[64px] sm:text-[80px]"
              }`}
            >
              {tried}
            </span>
            <span
              className={`font-medium tracking-normal text-[#6b6b76] ${
                isPickerActive ? "text-xl" : "text-xl sm:text-2xl"
              }`}
            >
              / {total}
            </span>
          </div>
          <div
            className="mb-7 flex items-center justify-center gap-1.5"
            aria-label={`${tried} out of ${total} countries tried`}
          >
            {Array.from({ length: 10 }).map((_, index) => {
              const isFilled = index < filledDots;
              return (
                <span
                  key={index}
                  aria-hidden="true"
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    height: isPickerActive ? 6 : 8,
                    width: isFilled ? (isPickerActive ? 24 : 28) : isPickerActive ? 6 : 8,
                    background: isFilled
                      ? "linear-gradient(90deg, #7c3aed, #06b6d4)"
                      : "rgba(15,15,18,0.08)",
                    transitionDelay: `${index * 60}ms`,
                  }}
                />
              );
            })}
          </div>
          <h2
            id="score-title"
            className="mb-2.5 text-xl font-bold leading-[1.2] tracking-normal text-[#0f0f12] sm:text-[22px]"
          >
            Your Tastemap Score
          </h2>
          <p className="mx-auto mb-7 max-w-[360px] text-[14.5px] leading-[1.55] text-[#6b6b76]">
            {message}
          </p>
          <div
            className={
              canSuggestNext
                ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
                : "grid grid-cols-1"
            }
          >
            <button
              ref={backButtonRef}
              type="button"
              onClick={closeOrBack}
              className="h-12 rounded-xl border border-black/[0.08] bg-white/70 px-4 text-sm font-semibold text-[#0f0f12] transition-all hover:bg-white hover:shadow-[0_4px_14px_rgba(15,15,18,0.06)] active:scale-[0.98]"
            >
              Back to map
            </button>
            {canSuggestNext && (
              isRevealed && nextBite ? (
                <button
                  ref={exploreButtonRef}
                  type="button"
                  onClick={exploreNextBite}
                  className="inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.35),0_2px_6px_rgba(6,182,212,0.18)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(124,58,237,0.45),0_4px_10px_rgba(6,182,212,0.22)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#7c3aed,0_8px_24px_rgba(124,58,237,0.35)] active:scale-[0.98] active:shadow-[0_4px_12px_rgba(124,58,237,0.30)]"
                >
                  Explore {nextBite.name} →
                </button>
              ) : (
                <button
                  ref={primaryButtonRef}
                  type="button"
                  onClick={pickNextBite}
                  disabled={isPicking}
                  className="inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.35),0_2px_6px_rgba(6,182,212,0.18)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(124,58,237,0.45),0_4px_10px_rgba(6,182,212,0.22)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#7c3aed,0_8px_24px_rgba(124,58,237,0.35)] active:scale-[0.98] active:shadow-[0_4px_12px_rgba(124,58,237,0.30)] disabled:scale-100 disabled:cursor-default disabled:bg-black/[0.06] disabled:text-[#6b6b76] disabled:shadow-none"
                >
                  {isPicking ? <SpinnerIcon /> : <PlusIcon />}
                  {isPicking ? "Picking..." : "Pick My Next Bite"}
                </button>
              )
            )}
          </div>
          {isPicking && (
            <div
              className="my-5 grid place-items-center"
              aria-busy="true"
              aria-label="Picking your next cuisine"
            >
              <PickerWheel />
            </div>
          )}
          {isRevealed && nextBite && (
            <RevealPanel country={nextBite} />
          )}
          <div className="my-6 h-px bg-[linear-gradient(90deg,transparent,rgba(15,15,18,0.10),transparent)]" />

          <div className="mb-4 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b6b76]">
            Share via
          </div>
          <div className="grid grid-cols-4 gap-2 sm:flex sm:justify-center sm:gap-4">
            <ShareButton
              label="More"
              onClick={nativeShare}
              icon={<MoreIcon />}
            />
            <ShareLink
              label="X"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                shareText,
              )}&url=${encodeURIComponent(shareUrl)}`}
              icon={<XIcon />}
            />
            <ShareLink
              label="Facebook"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl,
              )}`}
              icon={<FacebookIcon />}
            />
            <ShareButton
              label={copied ? "Copied" : "Copy"}
              onClick={copyShareLink}
              icon={<CopyIcon />}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v12M2 8h12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return <span className="picker-spinner" aria-hidden="true" />;
}

function PickerWheel() {
  return (
    <div className="relative grid h-40 w-40 place-items-center sm:h-40 sm:w-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[12px] border-x-transparent border-t-[#0f0f12]"
      />
      <div className="picker-wheel" aria-hidden="true">
        <div className="picker-wheel-hub" />
      </div>
    </div>
  );
}

function RevealPanel({ country }: { country: NextBiteCountry }) {
  const flagUrl = twemojiFlagUrl(country.flag);
  const dishes = country.signature_dishes
    .slice(0, 3)
    .map((dish) => dish.name)
    .join(", ");

  return (
    <div
      className="reveal-section my-5 border-y border-black/[0.08] py-5 text-center"
      aria-live="polite"
      aria-label={`Your next cuisine: ${country.name}`}
    >
      <div className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b6b76]">
        Your next cuisine
      </div>
      {flagUrl ? (
        <img
          src={flagUrl}
          alt=""
          aria-hidden="true"
          className="mx-auto mb-3 h-14 w-14 rounded-[14px] shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
        />
      ) : (
        <div className="mb-3 text-5xl" aria-hidden="true">
          {country.flag}
        </div>
      )}
      <h3 className="mb-1.5 text-2xl font-bold leading-[1.2] tracking-normal text-[#0f0f12]">
        {country.name}
      </h3>
      {dishes && (
        <p className="text-[13px] leading-[1.4] text-[#6b6b76]">
          {dishes}
        </p>
      )}
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

function ShareButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-black/[0.04]"
    >
      <ShareIconTile>{icon}</ShareIconTile>
      <span className="text-[11px] font-medium text-[#6b6b76]">{label}</span>
    </button>
  );
}

function ShareLink({
  label,
  icon,
  href,
}: {
  label: string;
  icon: ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-black/[0.04]"
    >
      <ShareIconTile>{icon}</ShareIconTile>
      <span className="text-[11px] font-medium text-[#6b6b76]">{label}</span>
    </a>
  );
}

function ShareIconTile({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl border border-black/[0.08] bg-white/70 shadow-[0_2px_8px_rgba(15,15,18,0.04)]">
      {children}
    </span>
  );
}

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5 9h.01M9 9h.01M13 9h.01" stroke="#6b6b76" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="#6b6b76" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="#6b6b76" strokeWidth="1.4" />
      <path d="M9.8 13V9.4h1.2l.2-1.4H9.8V7.1c0-.4.1-.7.7-.7h.8V5.2A9.4 9.4 0 0 0 10.1 5c-1.2 0-2 .7-2 2v1H6.8v1.4h1.3V13h1.7Z" fill="#6b6b76" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="6.5" y="5.5" width="6" height="6" rx="1.2" stroke="#6b6b76" strokeWidth="1.4" />
      <path d="M5 12.5H4.7c-.7 0-1.2-.5-1.2-1.2V6.7c0-.7.5-1.2 1.2-1.2H5" stroke="#6b6b76" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
