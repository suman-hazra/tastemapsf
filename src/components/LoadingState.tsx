// Centered "Loading map…" indicator for the main viewport area.
// Used while useMapData fetches the TopoJSON.

export default function LoadingState() {
  return (
    <div
      className="grid h-full place-items-center text-ink-soft"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-ink-soft border-t-transparent"
          aria-hidden="true"
        />
        <div className="text-sm">Loading map…</div>
      </div>
    </div>
  );
}
