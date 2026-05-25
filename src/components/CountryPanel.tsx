import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Country, Dish, Restaurant } from "../data/types";

interface UnseededCountry {
  displayName: string;
  flag?: string;
}

interface SuggestionCountry {
  name: string;
  flag?: string;
}

interface Props {
  country: Country | UnseededCountry | null;
  onClose: () => void;
  /**
   * Header chrome height in px. On desktop the panel docks below it so it
   * doesn't cover the counter and legend. Ignored on mobile (bottom sheet).
   */
  desktopTopOffset?: number;
  triedSet?: ReadonlySet<string>;
  onSetTried?: (countryId: string, tried: boolean) => void;
  showTriedHint?: boolean;
  onDismissTriedHint?: () => void;
  /**
   * Hide the "Mark as tried" bar. Set when the panel was opened from a
   * "Pick my next bite" suggestion — the country was suggested precisely
   * because the user hasn't been there, so asking is pointless.
   */
  hideTriedControl?: boolean;
}

const TIP_EMAIL = "tastemapsf@gmail.com";

function buildTipEmail(country: SuggestionCountry, restaurantName: string) {
  const countryLabel = [country.flag, country.name].filter(Boolean).join(" ");
  return {
    subject: `Tastemap SF restaurant suggestion for ${country.name}`,
    body: [
      `Country: ${countryLabel}`,
      `Restaurant name/details: ${restaurantName}`,
      "",
      "Sent from Tastemap SF.",
    ].join("\n"),
  };
}

function buildTipMailto(country: SuggestionCountry, restaurantName: string) {
  const email = buildTipEmail(country, restaurantName);
  const params = new URLSearchParams({
    subject: email.subject,
    body: email.body,
  });
  return `mailto:${TIP_EMAIL}?${params.toString()}`;
}

function buildGmailComposeUrl(
  country: SuggestionCountry,
  restaurantName: string,
) {
  const email = buildTipEmail(country, restaurantName);
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: TIP_EMAIL,
    su: email.subject,
    body: email.body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function googleMapsUrl(restaurant: Restaurant): string {
  const query = `${restaurant.name} ${restaurant.neighborhood} San Francisco`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function twemojiFlagUrl(flag?: string) {
  if (!flag) return null;
  const codepoints = [...flag]
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");
  if (!codepoints) return null;
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoints}.svg`;
}

export default function CountryPanel({
  country,
  onClose,
  desktopTopOffset = 0,
  triedSet,
  onSetTried,
  showTriedHint = false,
  onDismissTriedHint,
  hideTriedControl = false,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const [suggestionCountry, setSuggestionCountry] =
    useState<SuggestionCountry | null>(null);

  useEffect(() => {
    if (!country) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;

      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
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
    return () => document.removeEventListener("keydown", onKey);
  }, [country, onClose]);

  if (!country) return null;

  const isUnseeded = !("id" in country);
  const displayName = isUnseeded ? country.displayName : country.name;
  const displayFlag = country.flag;
  const flagUrl = twemojiFlagUrl(displayFlag);
  const showTriedControl =
    !isUnseeded &&
    country.restaurants.length > 0 &&
    onSetTried !== undefined &&
    !hideTriedControl;
  const isTried = !isUnseeded && triedSet?.has(country.id) === true;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30"
      style={
        { "--panel-top": `${desktopTopOffset + 8}px` } as React.CSSProperties
      }
    >
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="pointer-events-auto absolute inset-x-0 bottom-0 flex max-h-[82dvh] flex-col overflow-hidden rounded-t-[20px] border border-black/[0.08] bg-white/[0.88] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_20px_60px_rgba(124,58,237,0.15)] backdrop-blur-[28px] animate-[drawer-enter_280ms_cubic-bezier(0.22,1,0.36,1)_forwards] md:bottom-6 md:left-auto md:right-6 md:top-[var(--panel-top)] md:w-[420px] md:max-h-none md:rounded-2xl"
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-9 rounded-full bg-[#0f0f12]/15 md:hidden"
        />

        <header className="flex flex-shrink-0 items-start gap-4 px-6 pb-4 pt-6">
          {flagUrl ? (
            <img
              src={flagUrl}
              alt=""
              aria-hidden="true"
              className="block h-12 w-12 flex-shrink-0 rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.08)] md:h-14 md:w-14"
            />
          ) : displayFlag ? (
            <div
              aria-hidden="true"
              className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-white text-4xl shadow-[0_4px_14px_rgba(0,0,0,0.08)] md:h-14 md:w-14"
            >
              {displayFlag}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b6b76]">
              {isUnseeded ? "Cuisine" : country.continent}
            </div>
            <h2
              id="panel-title"
              className="mt-1 text-[22px] font-bold leading-[1.05] tracking-normal text-[#0f0f12] md:text-[28px]"
            >
              {displayName}
            </h2>
            <div className="mt-2 h-0.5 w-12 rounded-full bg-[linear-gradient(90deg,#7c3aed,#06b6d4)]" />
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-[#6b6b76] transition-colors hover:bg-[#0f0f12]/[0.05]"
          >
            <span aria-hidden="true" className="text-[15px] leading-none">
              x
            </span>
          </button>
        </header>

        {showTriedControl && (
          <div className="flex-shrink-0 px-6 pb-4">
            <TriedActionBar
              isTried={isTried}
              showHint={showTriedHint}
              onToggle={() => {
                onSetTried(country.id, !isTried);
                onDismissTriedHint?.();
              }}
            />
          </div>
        )}

        <div className="mx-6 h-px flex-shrink-0 bg-black/[0.08]" />

        <div
          className="flex-1 space-y-7 overflow-y-auto px-6 py-5 [-webkit-overflow-scrolling:touch]"
          tabIndex={0}
        >
          {isUnseeded ? (
            <UnseededBody
              country={{ name: country.displayName, flag: country.flag }}
              onSuggest={setSuggestionCountry}
            />
          ) : (
            <SeededBody country={country} onSuggest={setSuggestionCountry} />
          )}
        </div>

        {suggestionCountry && (
          <SuggestionDialog
            country={suggestionCountry}
            onClose={() => setSuggestionCountry(null)}
          />
        )}
      </aside>
    </div>
  );
}

function TriedActionBar({
  isTried,
  showHint,
  onToggle,
}: {
  isTried: boolean;
  showHint: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isTried}
      onClick={onToggle}
      className={`group flex h-11 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left transition-all duration-200 active:scale-[0.99] ${
        isTried
          ? "animate-[tried-pill-pop_260ms_cubic-bezier(0.22,1,0.36,1)] border-[#84cc16]/25 bg-[linear-gradient(135deg,#84cc16_0%,#22d3ee_100%)] shadow-[0_2px_12px_rgba(132,204,22,0.20)]"
          : "border-black/[0.08] bg-white/60 shadow-[0_1px_4px_rgba(15,15,18,0.04)] hover:bg-white/90 hover:shadow-[0_2px_8px_rgba(15,15,18,0.06)]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border-[1.5px] transition-colors ${
            isTried
              ? "border-white/50 bg-white/25 text-white"
              : "border-black/[0.12] bg-[#0f0f12]/[0.06] text-transparent"
          }`}
        >
          {isTried && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span
          className={`truncate text-[13px] font-semibold ${
            isTried ? "text-white" : "text-[#0f0f12]"
          }`}
        >
          {isTried ? "Tried" : "Mark as tried"}
        </span>
      </span>
      <span
        className={`hidden flex-shrink-0 text-[11px] font-medium sm:inline ${
          isTried ? "text-white/70" : "text-[#6b6b76]"
        }`}
      >
        {isTried
          ? "Added to your map"
          : showHint
            ? "Tap to track your progress"
            : "Update your progress"}
      </span>
    </button>
  );
}

function SeededBody({
  country,
  onSuggest,
}: {
  country: Country;
  onSuggest: (country: SuggestionCountry) => void;
}) {
  const hasRestaurants = country.restaurants.length > 0;
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);

  useEffect(() => {
    setIsIntroExpanded(false);
  }, [country.id]);

  return (
    <>
      <IntroSummary
        text={country.cuisine_summary}
        isExpanded={isIntroExpanded}
        onToggle={() => setIsIntroExpanded((expanded) => !expanded)}
      />

      <section>
        <SectionLabel>Where to eat in SF</SectionLabel>
        {hasRestaurants ? (
          <ul className="space-y-2">
            {country.restaurants.map((restaurant) => (
              <RestaurantEntry key={restaurant.id} restaurant={restaurant} />
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-black/[0.08] bg-white/50 p-4 text-sm">
            <div className="font-semibold text-[#0f0f12]">
              Sorry, we could not find restaurants for {country.name} in San
              Francisco yet.
            </div>
            <button
              type="button"
              onClick={() =>
                onSuggest({ name: country.name, flag: country.flag })
              }
              className="mt-3 inline-flex h-11 items-center rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.25),0_2px_6px_rgba(6,182,212,0.14)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Send me one →
            </button>
          </div>
        )}
      </section>

      <section>
        <SectionLabel>Order these first</SectionLabel>
        <ul className="space-y-4">
          {country.signature_dishes.map((dish) => (
            <DishEntry key={dish.name} dish={dish} />
          ))}
        </ul>
      </section>
    </>
  );
}

function IntroSummary({
  text,
  isExpanded,
  onToggle,
}: {
  text: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <p
        className="text-[13.5px] leading-[1.6] text-[#6b6b76]"
        style={
          isExpanded
            ? undefined
            : {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
              }
        }
      >
        {text}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="mt-2 text-[12px] font-semibold text-[#7c3aed] underline decoration-[#7c3aed]/25 underline-offset-2 transition-colors hover:text-[#6d28d9] hover:decoration-[#7c3aed]/60"
      >
        {isExpanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

function UnseededBody({
  country,
  onSuggest,
}: {
  country: SuggestionCountry;
  onSuggest: (country: SuggestionCountry) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-[1.6] text-[#6b6b76]">
        Sorry, we could not find restaurants for {country.name} in San
        Francisco yet.
      </p>
      <button
        type="button"
        onClick={() => onSuggest(country)}
        className="inline-flex h-11 items-center rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.25),0_2px_6px_rgba(6,182,212,0.14)] transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Send me one →
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b6b76]">
      {children}
    </h3>
  );
}

function DishEntry({ dish }: { dish: Dish }) {
  return (
    <li>
      <span className="inline-block rounded-md border border-[#7c3aed]/[0.12] bg-[#7c3aed]/[0.07] px-2.5 py-1 text-[12.5px] font-semibold leading-tight text-[#7c3aed]">
        {dish.name}
      </span>
      <p className="mt-1.5 text-[13px] leading-[1.55] text-[#6b6b76]">
        {dish.description}
      </p>
    </li>
  );
}

function RestaurantEntry({ restaurant }: { restaurant: Restaurant }) {
  return (
    <li>
      <a
        href={googleMapsUrl(restaurant)}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-black/[0.08] bg-white/50 px-4 py-3 transition-all hover:bg-white hover:shadow-[0_4px_14px_rgba(15,15,18,0.04)]"
      >
        <div className="text-[13.5px] font-semibold leading-tight text-[#0f0f12]">
          {restaurant.name}
        </div>
        <div className="mt-0.5 text-xs text-[#6b6b76]">
          {restaurant.neighborhood}
        </div>
        <div className="mt-1.5 inline-flex text-[11.5px] font-medium text-[#7c3aed] hover:opacity-80">
          Open in Google Maps →
        </div>
      </a>
    </li>
  );
}

function SuggestionDialog({
  country,
  onClose,
}: {
  country: SuggestionCountry;
  onClose: () => void;
}) {
  const [restaurantName, setRestaurantName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submitSuggestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = restaurantName.trim();
    if (!trimmedName) return;
    setSubmitted(true);
    const opened = window.open(
      buildGmailComposeUrl(country, trimmedName),
      "_blank",
      "noopener,noreferrer",
    );
    if (!opened) {
      window.location.href = buildTipMailto(country, trimmedName);
    }
  };

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/20 px-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggestion-title"
        onSubmit={submitSuggestion}
        className="w-full max-w-sm rounded-2xl border border-black/[0.08] bg-white/[0.92] p-4 shadow-xl backdrop-blur-[28px] sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="suggestion-title"
              className="text-lg font-bold leading-tight text-[#0f0f12] sm:text-xl"
            >
              Send me one
            </h2>
            <p className="mt-1 text-xs text-[#6b6b76] sm:text-sm">
              {[country.flag, country.name].filter(Boolean).join(" ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close suggestion dialog"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-[#6b6b76] hover:bg-black/5"
          >
            x
          </button>
        </div>

        <label
          className="mt-4 block text-xs font-medium sm:text-sm"
          htmlFor="restaurant-tip"
        >
          Restaurant name/details
        </label>
        <input
          ref={inputRef}
          id="restaurant-tip"
          value={restaurantName}
          onChange={(event) => {
            setRestaurantName(event.target.value);
            setSubmitted(false);
          }}
          required
          className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30"
        />
        {submitted && (
          <p className="mt-3 text-sm leading-relaxed text-[#6b6b76]">
            Your email draft should open in a new tab. Please hit send there.
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-black/10 px-4 text-sm font-semibold hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] px-4 text-sm font-semibold text-white"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
