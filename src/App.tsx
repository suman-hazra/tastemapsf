// Phase A scaffold — placeholder app shell.
// Counter-as-headline layout per /plan-design-review IA decision.
// Header height revised from 64px → 96px to make the user's full brand logo
// (icon + wordmark) legible. Counter big-number scales up to match.
// Real wiring (map, panel, state) lands in Phase C-E.

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-24 items-center justify-between border-b border-black/5 px-6">
        <a href="/" className="flex items-center" aria-label="TastemapSF home">
          <img
            src="/tastemapsflogo.png"
            alt="TastemapSF"
            className="h-20 w-auto mix-blend-multiply"
          />
        </a>
        <div className="flex flex-col items-end leading-none">
          <div className="font-display tabular-nums">
            <span className="text-5xl font-semibold">—</span>
            <span className="ml-2 text-xl text-ink-soft">/ —</span>
          </div>
          <div className="mt-2 text-sm text-ink-soft">Loading map…</div>
        </div>
      </header>
      <main className="grid flex-1 place-items-center text-ink-soft">
        <div className="text-center">
          <div className="font-display text-xl">Phase A is alive.</div>
          <div className="mt-2 text-sm">Map renders in Phase C.</div>
        </div>
      </main>
    </div>
  );
}
