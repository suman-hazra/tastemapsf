// Signature dish entry. Renders as a chip-style header with a beginner-framed
// description right below. Phase 1: always-expanded (no click-to-toggle) —
// keeping the panel scannable.

import type { Dish } from "../data/types";

interface Props {
  dish: Dish;
}

export default function DishBadge({ dish }: Props) {
  return (
    <li className="leading-snug">
      <div className="inline-block rounded-chip bg-black/5 px-2 py-0.5 text-sm font-semibold">
        {dish.name}
      </div>
      <p className="mt-1 text-sm text-ink-soft">{dish.description}</p>
    </li>
  );
}
