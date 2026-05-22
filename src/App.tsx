// Phase A scaffold — placeholder app shell.
// Counter-as-headline layout per /plan-design-review IA decision.
// Real wiring (map, panel, state) lands in Phase C-E.

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center justify-between border-b border-black/5 px-6">
        <a href="/" className="flex items-center" aria-label="TastemapSF home">
          <img
            src="/tastemapsflogo.png"
            alt="TastemapSF"
            className="h-12 w-auto mix-blend-multiply"
          />
        </a>
        <div className="flex flex-col items-end leading-none">
          <div className="font-display tabular-nums text-3xl">
            <span className="font-semibold">—</span>
            <span className="ml-1 text-base text-ink-soft">/ —</span>
          </div>
          <div className="mt-1 text-xs text-ink-soft">Loading map…</div>
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
