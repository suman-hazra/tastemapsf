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

export default function AboutDialog({ onClose }: Props) {
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
        aria-labelledby="about-title"
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[24px] border border-black/[0.08] bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_30px_80px_rgba(124,58,237,0.15),0_8px_28px_rgba(6,182,212,0.08)] backdrop-blur-[28px] backdrop-saturate-150 sm:max-h-[calc(100vh-80px)] sm:max-w-[540px] sm:rounded-[24px]"
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
            id="about-title"
            className="m-0 pr-10 text-[22px] font-bold leading-tight tracking-normal text-[#0f0f12]"
          >
            About
          </h2>
          <p className="mt-1 max-w-[390px] text-[13px] leading-normal text-[#6b6b76]">
            The story behind Tastemap SF — and how to get involved.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
          <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-black/[0.08] bg-[#0f0f12]">
            <img
              src="/suman.jpg"
              alt="Suman pulling a cheesy bite at a San Francisco restaurant"
              loading="lazy"
              className="h-full w-full object-cover object-[center_22%]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_top,rgba(255,255,255,0.9),transparent)]"
            />
          </div>

          <section className="border-b border-black/[0.08] px-5 py-5 sm:px-7">
            <h3 className="mb-3.5 text-[10.5px] font-bold uppercase leading-none tracking-[0.16em] text-[#a1a1ab]">
              Why I built this
            </h3>
            <div className="flex flex-col gap-6 text-sm leading-[1.6] text-[#6b6b76]">
              <p className="m-0">
                I grew up in small Indian cities - places with incredible food,
                but mostly our own. The world's cuisines simply hadn't made
                their way there yet. I didn't have my first pizza until college
                in Delhi. My first Thai curry. My first Japanese meal. Not
                because Indian food wasn't enough; it's endlessly rich but
                because I had never been in a place where the rest of the
                world's tables were also within reach.
              </p>
              <p className="m-0">
                As I grew older, I started traveling - Vietnam, Thailand,
                Japan, Turkey, across Europe — and food became the whole point.
                Not the monuments. The food. I'd watch MasterChef
                and Top Chef obsessively, fascinated not just by technique but
                by the history and culture packed into every dish.
              </p>
              <p className="m-0">
                Then I moved to San Francisco, and I was genuinely floored. I
                had never lived somewhere with this much culinary diversity. But
                the abundance was almost paralyzing - so many cuisines, so
                little guidance on where to start. So I built Tastemap SF: a way
                to explore the city one country at a time, keep score, and
                always have a reason to try something new.
              </p>
            </div>
          </section>

          <section className="px-5 py-5 sm:px-7">
            <h3 className="mb-3.5 text-[10.5px] font-bold uppercase leading-none tracking-[0.16em] text-[#a1a1ab]">
              Get involved
            </h3>
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
