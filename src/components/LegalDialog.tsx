import { useEffect, useRef } from "react";

interface Props {
  onClose: () => void;
}

const SECTIONS: Array<{
  title: string;
  body: string[];
}> = [
  {
    title: "Disclaimer",
    body: [
      "Tastemap SF is a personal, non-commercial project by Suman Hazra.",
      "Click a country, learn what to order, find restaurants in San Francisco, and mark cuisines you have tried.",
      "Restaurant information is manually curated and may be incomplete or outdated. Please verify hours, menus, locations, and availability directly with each restaurant.",
      "Tastemap SF is not affiliated with, sponsored by, or endorsed by the restaurants listed in the app.",
    ],
  },
  {
    title: "Privacy",
    body: [
      "Tastemap SF does not require an account and does not currently use analytics, advertising pixels, or tracking cookies.",
      "If you send a restaurant suggestion, your email app may send your email address and the restaurant details you provide to tastemapsf@gmail.com.",
      "The app stores lightweight progress state in your browser while you use it, such as countries you mark as tried. This is not tied to an account.",
      "For privacy questions or deletion requests, email tastemapsf@gmail.com.",
    ],
  },
  {
    title: "Attributions",
    body: [
      "Tastemap SF uses open-source libraries including React, Vite, Tailwind CSS, D3 Geo, react-simple-maps, and topojson-client.",
      "World geography is based on TopoJSON/Natural Earth-style map data. Natural Earth map data is public domain.",
      "Tastemap SF logo assets were generated with OpenAI tools.",
      "The Dolores Park photo is sourced from Wikimedia Commons under a Creative Commons license. The expected source is Mission Dolores Park, San Francisco.jpg by Travel Coffee Book, released under CC0 1.0.",
    ],
  },
];

export default function LegalDialog({ onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/20 px-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-dialog-title"
        className="relative max-h-[84vh] w-full max-w-lg overflow-y-auto border border-black/10 bg-panel px-6 py-6 shadow-xl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-ink-soft hover:bg-black/5"
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

        <h2
          id="legal-dialog-title"
          className="pr-10 font-display text-2xl font-semibold"
        >
          Legal & credits
        </h2>
        <div className="mt-5 space-y-6 text-sm leading-relaxed text-ink-soft">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="border-b border-black/5 pb-2 font-display text-sm font-semibold uppercase tracking-wide text-ink">
                {section.title}
              </h3>
              <div className="mt-3 space-y-3">
                {section.body.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
