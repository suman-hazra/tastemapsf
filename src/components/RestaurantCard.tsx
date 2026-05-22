// One restaurant entry. Phase 1 card content per /plan-design-review (Codex
// tension #3): name + neighborhood + Yelp/Google link only. No copied rating
// or price — those go stale and create attribution liability. The link
// carries the user to a source-of-truth listing.
//
// Mobile tap-target spec: the whole card is the link target when an external
// URL exists. Card minimum height ~64px > 44px WCAG minimum. When there's no
// URL (rare in seed data), card renders as a non-interactive list item.

import type { Restaurant } from "../data/types";

interface Props {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: Props) {
  const externalUrl = restaurant.yelp_url ?? restaurant.google_url;

  const cardInner = (
    <>
      <div className="font-semibold leading-tight">{restaurant.name}</div>
      <div className="mt-0.5 text-sm text-ink-soft">
        {restaurant.neighborhood}
      </div>
    </>
  );

  if (externalUrl) {
    return (
      <li>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-chip border border-black/5 bg-canvas p-3 transition-colors hover:border-black/15 hover:bg-black/[0.02]"
        >
          {cardInner}
          <div className="mt-1 text-xs font-medium text-ink-soft">
            View listing →
          </div>
        </a>
      </li>
    );
  }

  return (
    <li className="rounded-chip border border-black/5 bg-canvas p-3">
      {cardInner}
    </li>
  );
}
