// Pure immutable Set toggle. Pulled out of App.tsx so the state logic can
// be unit-tested without spinning up the DOM.
//
// Returns a NEW Set with the slug added (if absent) or removed (if present).
// Never mutates the input — React relies on reference inequality to re-render.

export function toggleSlug(
  set: ReadonlySet<string>,
  slug: string,
): Set<string> {
  const next = new Set(set);
  if (next.has(slug)) next.delete(slug);
  else next.add(slug);
  return next;
}
