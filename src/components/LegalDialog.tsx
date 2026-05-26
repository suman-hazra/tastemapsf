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
      "World map data by Natural Earth and TopoJSON, rendered with react-simple-maps.",
      "Country flags via Twemoji by Twitter / X, licensed under CC-BY 4.0.",
      "Typography: Inter by Rasmus Andersson, licensed under the SIL Open Font License.",
      "Built with React, Tailwind CSS, and Vite.",
    ],
  },
];

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true",
  );
}

export default function LegalDialog({ onClose }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#f8f8fb]/72 px-0 pt-10 backdrop-blur-[3px] sm:items-center sm:px-4 sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        className="legal-panel flex max-h-[85vh] max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-[24px] border border-black/[0.08] bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_30px_80px_rgba(124,58,237,0.15),0_8px_28px_rgba(6,182,212,0.08)] backdrop-blur-[28px] backdrop-saturate-150 sm:max-h-[calc(100vh-80px)] sm:max-w-[540px] sm:rounded-[24px]"
      >
        <div className="h-1 flex-shrink-0 bg-[linear-gradient(90deg,#7C3AED_0%,#EC4899_50%,#06B6D4_100%)]" />

        <header className="relative flex-shrink-0 border-b border-black/[0.08] px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-[10px] bg-black/[0.04] text-[#6b6b76] transition-colors hover:bg-black/[0.08] hover:text-[#0f0f12]"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20">
              <path
                d="M5.5 5.5L14.5 14.5M14.5 5.5L5.5 14.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
              />
            </svg>
          </button>

          <h2
            id="legal-title"
            className="m-0 pr-10 text-[22px] font-bold leading-tight tracking-normal text-[#0f0f12]"
          >
            Legal &amp; credits
          </h2>
          <p className="mt-1 max-w-[390px] text-[13px] leading-normal text-[#6b6b76]">
            Transparency about data, privacy, and the people who built this.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto py-2 [-webkit-overflow-scrolling:touch]">
          {SECTIONS.map((section, index) => (
            <section
              key={section.title}
              className={`px-5 py-5 sm:px-7 ${
                index === SECTIONS.length - 1
                  ? ""
                  : "border-b border-black/[0.08]"
              }`}
            >
              <h3 className="mb-3.5 text-[10.5px] font-bold uppercase leading-none tracking-[0.16em] text-[#a1a1ab]">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.body.map((text) => (
                  <p
                    key={text}
                    className="m-0 text-sm leading-[1.6] text-[#6b6b76]"
                  >
                    {text}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="flex-shrink-0 border-t border-black/[0.08] px-7 pb-5 pt-4 text-center">
          <p className="m-0 text-xs leading-normal text-[#a1a1ab]">
            Made with care in San Francisco.
          </p>
        </footer>
      </section>
    </div>
  );
}
