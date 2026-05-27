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

          <h2
            id="about-title"
            className="m-0 pr-10 text-[22px] font-bold leading-tight tracking-normal text-[#0f0f12]"
          >
            About
          </h2>
          <p className="mt-1 max-w-[390px] text-[13px] leading-normal text-[#6b6b76]">
            The story behind Tastemap SF
          </p>
        </header>

        <div className="flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
          <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-black/[0.08] bg-[#0f0f12]">
            <img
              src="/suman-about.jpg"
              alt="Suman pulling a cheesy bite at a San Francisco restaurant"
              loading="lazy"
              className="h-full w-full object-cover object-[center_22%]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_top,rgba(255,255,255,0.9),transparent)]"
            />
          </div>

          <section className="px-5 py-5 sm:px-7">
            <h3 className="mb-3.5 text-[10.5px] font-bold uppercase leading-none tracking-[0.16em] text-[#a1a1ab]">
              About
            </h3>
            <div className="flex flex-col gap-6 text-sm leading-[1.6] text-[#6b6b76]">
              <p className="m-0">
                I have been fascinated with food for as long as I can remember.
                After coming back from school, I would plop my massive backpack
                on the floor, much to the annoyance of my mother, and giddily
                take my place next to her on the barebones sofa. I would already
                be mildly disappointed after glancing at the vegetables she had
                been peeling while occasionally looking up at the television. We
                were going to have gourd for dinner for the thousandth time.
              </p>
              <p className="m-0">
                For now, though, I found solace in what was playing on TV. An
                elegant, beautifully draped middle-aged woman was preparing some
                exotic dish from some exotic part of the world. I had never
                tried any of the ingredients lying in front of her, and I didn't
                know if I ever would, but she had my full attention as I stared
                raptly at the screen, full of intrigue and desire.
              </p>
              <p className="m-0">
                Growing up in small military outposts all over India, delicious
                food was abundant, but it was almost always Indian. Probably the
                only non-Indian food I had was the so-called Chinese food, which
                I later learned was nothing like the food people actually eat in
                China.
              </p>
              <p className="m-0">
                So when I moved to Delhi for college, I made it a point to
                immerse myself in the culinary variety the metropolis had to
                offer. I would look up unfamiliar cuisines and try to find
                restaurants in Delhi where I could experience them. I didn't get
                very far because I had very little money, but whenever I could,
                I made it a point to experiment. And I would be lying if I said
                my friends, who often became unwilling participants in these
                experiments, didn't suffer for it.
              </p>
              <p className="m-0">
                As I grew older and started traveling, my culinary horizons
                expanded further. It wouldn't be an exaggeration to say I
                traveled more for food than for tourist attractions. In Rome, my
                first priority was finding the best pizza. The Colosseum could
                wait.
              </p>
              <p className="m-0">
                When I moved to San Francisco, I had many firsts: my first
                authentic Mexican taco, my first authentic Peking duck, my first
                authentic rendang, and so much more. The culinary variety this
                city offers is dizzying, and I found the abundance almost
                paralyzing when deciding where to go next.
              </p>
              <p className="m-0">
                That's why I built TasteMapSF. My hope is that this project
                gives people a way to explore the city one country at a time,
                and a reason to try something new.
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
