// One restaurant entry. Phase 1 card content per /plan-design-review (Codex
// tension #3): name + neighborhood + map link only. No copied rating or price
// — those go stale and create attribution liability.
//
// The card links to a Google Maps search built from name + neighborhood + SF.
// Using the official Maps URLs API (?api=1&query=...) means the link deep-links
// into the Google Maps app on mobile and falls back to maps.google.com on web.
// We build the URL on the fly rather than storing per-restaurant map links so
// every entry gets a working link without data maintenance.
//
// Mobile tap-target spec: whole card is the link target. Min height ~64px,
// above the 44px WCAG minimum.

import type { Restaurant } from "../data/types";

interface Props {
  restaurant: Restaurant;
}

function googleMapsUrl(restaurant: Restaurant): string {
  const query = `${restaurant.name} ${restaurant.neighborhood} San Francisco`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <li>
      <a
        href={googleMapsUrl(restaurant)}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-chip border border-black/5 bg-canvas p-3 transition-colors hover:border-black/15 hover:bg-black/[0.02]"
      >
        <div className="font-semibold leading-tight">{restaurant.name}</div>
        <div className="mt-0.5 text-sm text-ink-soft">
          {restaurant.neighborhood}
        </div>
        <div className="mt-1 text-xs font-medium text-ink-soft">
          Open in Google Maps →
        </div>
      </a>
    </li>
  );
}
