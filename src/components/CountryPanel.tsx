// Slide-in side panel. Three render modes based on what the user clicked:
//
//   1. SEEDED + has restaurants  → cuisine summary + dishes + restaurant list
//   2. SEEDED + 0 restaurants    → cuisine summary + dishes + suggestion CTA
//   3. UNSEEDED                  → name + flag + short apologetic empty state
//                                  + suggestion CTA.
//
// Affordances per /plan-design-review:
//   - close button (X) in header
//   - ESC key closes (handled in App.tsx via document listener)
//   - re-click country on map closes (handled in App.tsx by toggle)
//   - NO outside-click-to-close (too easy to dismiss accidentally)
//
// Responsive:
//   - Desktop ≥1024px : fixed 400px wide, full height, right side
//   - Tablet 768-1023 : 40% viewport width
//   - Mobile <768px   : full-width / full-height

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Country } from "../data/types";
import DishBadge from "./DishBadge";
import RestaurantCard from "./RestaurantCard";

interface UnseededCountry {
  displayName: string;
  flag?: string;
}

interface SuggestionCountry {
  name: string;
  flag?: string;
}

interface Props {
  /** The seeded country to show, OR an unseeded country's display name. */
  country: Country | UnseededCountry | null;
  onClose: () => void;
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

export default function CountryPanel({
  country,
  onClose,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [suggestionCountry, setSuggestionCountry] =
    useState<SuggestionCountry | null>(null);

  // ESC key closes. DOM-order tab focus starts at the close button.
  useEffect(() => {
    if (!country) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [country, onClose]);

  if (!country) return null;

  const isUnseeded = !("id" in country);

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="panel-title"
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-full flex-col overflow-hidden border-l border-black/5 bg-panel shadow-lg md:max-w-[40%] lg:max-w-[400px]"
    >
      {/* Header */}
      <header className="flex items-start justify-between border-b border-black/5 px-5 py-4">
        <div className="min-w-0 flex-1 pr-3">
          <div className="font-display text-2xl font-semibold leading-tight">
            <span aria-hidden="true" className="mr-2">
              {country.flag}
            </span>
            <span id="panel-title">
              {isUnseeded ? country.displayName : country.name}
            </span>
          </div>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close panel"
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {isUnseeded ? (
          <UnseededBody
            country={{
              name: country.displayName,
              flag: country.flag,
            }}
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

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-ink-soft">
        {country.cuisine_summary}
      </p>

      <section>
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Order these first
        </h3>
        <ul className="mt-2 space-y-3">
          {country.signature_dishes.map((dish) => (
            <DishBadge key={dish.name} dish={dish} />
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Where to eat in SF
        </h3>
        {hasRestaurants ? (
          <ul className="mt-2 space-y-2">
            {country.restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </ul>
        ) : (
          <div className="mt-2 rounded-chip border border-black/5 bg-canvas p-3 text-sm">
            <div className="font-medium">
              Sorry, we could not find restaurants for {country.name} in San
              Francisco yet.
            </div>
            <button
              type="button"
              onClick={() =>
                onSuggest({ name: country.name, flag: country.flag })
              }
              className="mt-2 inline-flex h-11 items-center rounded-chip border border-black/10 px-3 text-sm font-medium hover:bg-black/5"
            >
              Send me one →
            </button>
          </div>
        )}
      </section>
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
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Sorry, we could not find restaurants for {country.name} in San
        Francisco yet.
      </p>
      <button
        type="button"
        onClick={() => onSuggest(country)}
        className="inline-flex h-11 items-center rounded-chip border border-black/10 px-3 text-sm font-medium hover:bg-black/5"
      >
        Send me one →
      </button>
    </div>
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
        className="w-full max-w-sm border border-black/10 bg-panel p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="suggestion-title"
              className="font-display text-xl font-semibold leading-tight"
            >
              Send me one
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {[country.flag, country.name].filter(Boolean).join(" ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close suggestion dialog"
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
        </div>

        <label
          className="mt-4 block text-sm font-medium"
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
          className="mt-2 h-11 w-full rounded-chip border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30"
        />
        {submitted && (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Your email draft should open in a new tab. Please hit send there.
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-chip border border-black/10 px-4 text-sm font-semibold hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-chip border border-black/10 bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
