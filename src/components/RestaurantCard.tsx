// One restaurant entry. Phase 1 card content per /plan-design-review (Codex
// tension #3): name + neighborhood + Yelp/Google link only. No copied rating
// or price — those go stale and create attribution liability. The link
// carries the user to a source-of-truth listing.
//
// Required fields rendered: name, neighborhood. Optional fields rendered
// conditionally — no "N/A" filler ever.

import type { Restaurant } from "../data/types";

interface Props {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: Props) {
  const externalUrl = restaurant.yelp_url ?? restaurant.google_url;

  return (
    <li className="rounded-chip border border-black/5 bg-canvas p-3">
      <div className="font-semibold leading-tight">{restaurant.name}</div>
      <div className="mt-0.5 text-sm text-ink-soft">
        {restaurant.neighborhood}
      </div>
      {externalUrl && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium underline decoration-black/20 underline-offset-2 hover:decoration-black/60"
        >
          View listing →
        </a>
      )}
    </li>
  );
}
