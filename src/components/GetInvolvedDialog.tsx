import { useEffect, useRef } from "react";

interface Props {
  onClose: () => void;
}

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

const LINK_CLASS =
  "font-medium text-[#7c3aed] underline decoration-[#7c3aed]/30 underline-offset-2 transition-colors hover:text-[#6d28d9] hover:decoration-[#7c3aed]/60";

export default function GetInvolvedDialog({ onClose }: Props) {
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
        aria-labelledby="get-involved-title"
        className="flex max-h-[85vh] max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-[24px] border border-black/[0.08] bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_30px_80px_rgba(124,58,237,0.15),0_8px_28px_rgba(6,182,212,0.08)] backdrop-blur-[28px] backdrop-saturate-150 sm:max-h-[calc(100vh-80px)] sm:max-w-[540px] sm:rounded-[24px]"
      >
        <div className="h-1 flex-shrink-0 bg-[linear-gradient(90deg,#7C3AED_0%,#EC4899_50%,#06B6D4_100%)]" />

        <header className="relative flex-shrink-0 border-b border-black/[0.08] px-5 pb-4 pt-7 sm:px-7 sm:pt-6">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-6 grid h-8 w-8 place-items-center rounded-[10px] bg-black/[0.04] text-[#6b6b76] transition-colors hover:bg-black/[0.08] hover:text-[#0f0f12] sm:top-5"
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

          <div className="flex items-center gap-3 pr-10">
            <GetInvolvedIcon />
            <div>
              <h2
                id="get-involved-title"
                className="m-0 text-[22px] font-bold leading-tight tracking-normal text-[#0f0f12]"
              >
                Get involved
              </h2>
              <p className="mt-1 max-w-[390px] text-[13px] leading-normal text-[#6b6b76]">
                Help improve Tastemap SF.
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
          <section className="px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-6 text-sm leading-[1.6] text-[#6b6b76]">
              <p className="m-0">
                Tastemap SF is open source. If you want to poke around the code,
                suggest a restaurant, or build your own version for another
                city, everything is on{" "}
                <a
                  href="https://github.com/suman-hazra/tastemapsf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  GitHub
                </a>
                . Fork it, adapt it, make it yours.
              </p>
              <p className="m-0">
                Have a restaurant you think belongs on the map? Know a cuisine
                that's missing? Drop me a line at{" "}
                <a href="mailto:tastemapsf@gmail.com" className={LINK_CLASS}>
                  tastemapsf@gmail.com
                </a>
                . I read everything. Same goes for feedback, corrections, or
                just thoughts on the project.
              </p>
              <p className="m-0">
                You can also find me on{" "}
                <a
                  href="https://x.com/SumanHazra_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  X
                </a>
                .
              </p>
            </div>
          </section>
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

function GetInvolvedIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#7c3aed]/10 text-[#7c3aed]"
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <circle cx="4" cy="3.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="4" cy="12.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="5.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M4 5.3v5.4M5.8 3.5H7.4c1.2 0 2.1.9 2.1 2v0"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
