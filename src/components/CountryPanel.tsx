// Slide-in side panel. Three render modes based on what the user clicked:
//
//   1. SEEDED + has restaurants  → cuisine summary + dishes + restaurant list
//                                  + tried-toggle
//   2. SEEDED + 0 restaurants    → cuisine summary + dishes + "Restaurants
//                                  coming soon — got a pick?" mailto +
//                                  tried-toggle
//   3. UNSEEDED                  → name + flag + "No restaurants seeded yet
//                                  — got a tip?" mailto. No tried-toggle.
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

import { useEffect, useRef } from "react";
import type { Country } from "../data/types";
import DishBadge from "./DishBadge";
import RestaurantCard from "./RestaurantCard";

interface Props {
  /** The seeded country to show, OR an unseeded country's display name. */
  country: Country | { displayName: string } | null;
  tried: boolean;
  onToggleTried: () => void;
  onClose: () => void;
}

const MAILTO = "mailto:sumanhazra10@gmail.com?subject=Tastemap%20SF%20%E2%80%94%20restaurant%20tip";

export default function CountryPanel({
  country,
  tried,
  onToggleTried,
  onClose,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
      className="absolute inset-y-0 right-0 z-10 flex w-full max-w-full flex-col overflow-hidden border-l border-black/5 bg-panel shadow-lg md:max-w-[40%] lg:max-w-[400px]"
    >
      {/* Header */}
      <header className="flex items-start justify-between border-b border-black/5 px-5 py-4">
        <div className="min-w-0 flex-1 pr-3">
          <div className="font-display text-2xl font-semibold leading-tight">
            <span aria-hidden="true" className="mr-2">
              {isUnseeded ? "" : country.flag}
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
          <UnseededBody />
        ) : (
          <SeededBody country={country} />
        )}
      </div>

      {/* Footer: tried-toggle (only for seeded countries) */}
      {!isUnseeded && (
        <footer className="border-t border-black/5 px-5 py-3">
          <button
            type="button"
            onClick={onToggleTried}
            aria-pressed={tried}
            className={`flex h-11 w-full items-center justify-between rounded-chip border px-3 text-sm font-medium transition-colors ${
              tried
                ? "border-tried bg-tried/15 text-ink"
                : "border-black/10 hover:bg-black/5"
            }`}
          >
            <span>
              {tried
                ? `You've tried ${country.name}`
                : `Tried ${country.name}?`}
            </span>
            <span
              aria-hidden="true"
              className={`grid h-6 w-6 place-items-center rounded-full border ${
                tried ? "border-tried bg-tried text-white" : "border-black/15"
              }`}
            >
              {tried && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7L6 10L11 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </button>
        </footer>
      )}
    </aside>
  );
}

function SeededBody({ country }: { country: Country }) {
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
              Restaurants coming soon — got a pick?
            </div>
            <a
              href={MAILTO}
              className="mt-1 inline-block text-sm underline decoration-black/20 underline-offset-2 hover:decoration-black/60"
            >
              Send me one
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

function UnseededBody() {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        No restaurants seeded yet — got a tip?
      </p>
      <a
        href={MAILTO}
        className="inline-block text-sm font-medium underline decoration-black/20 underline-offset-2 hover:decoration-black/60"
      >
        Send me one
      </a>
    </div>
  );
}
