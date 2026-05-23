// Slide-in side panel. Three render modes based on what the user clicked:
//
//   1. SEEDED + has restaurants  → cuisine summary + dishes + restaurant list
//   2. SEEDED + 0 restaurants    → cuisine summary + dishes + "Restaurants
//                                  coming soon — got a pick?" mailto
//   3. UNSEEDED                  → name + flag + "No restaurants seeded yet
//                                  — got a tip?" mailto.
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
  onClose: () => void;
}

const MAILTO = "mailto:sumanhazra10@gmail.com?subject=Tastemap%20SF%20%E2%80%94%20restaurant%20tip";

export default function CountryPanel({
  country,
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
              className="mt-2 inline-flex h-11 items-center rounded-chip border border-black/10 px-3 text-sm font-medium hover:bg-black/5"
            >
              Send me one →
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
        className="inline-flex h-11 items-center rounded-chip border border-black/10 px-3 text-sm font-medium hover:bg-black/5"
      >
        Send me one →
      </a>
    </div>
  );
}
