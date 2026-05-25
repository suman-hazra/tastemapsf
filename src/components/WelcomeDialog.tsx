import { useEffect, useRef } from "react";

interface Props {
  onDismiss: () => void;
}

export default function WelcomeDialog({ onDismiss }: Props) {
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    ctaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
      if (e.key !== "Tab") return;

      const card = ctaRef.current?.closest<HTMLElement>("[data-welcome-card]");
      if (!card) return;
      const focusable = Array.from(
        card.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden px-4 py-6"
      onMouseDown={onDismiss}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-[#c4b5fd] opacity-40 blur-[64px]" />
        <div className="absolute right-0 top-0 h-[500px] w-[700px] rounded-full bg-[#67e8f9] opacity-35 blur-[64px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[500px] rounded-full bg-[#bef264] opacity-25 blur-[64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.25)_60%,transparent_100%)]" />
      </div>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        aria-describedby="welcome-info"
        data-welcome-card
        onMouseDown={(event) => event.stopPropagation()}
        className="relative w-full max-w-[560px] animate-[welcome-card-in_240ms_ease-out] overflow-hidden rounded-[24px] border border-black/[0.08] bg-white/[0.85] px-6 py-7 text-center shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_30px_80px_rgba(124,58,237,0.22),0_8px_28px_rgba(6,182,212,0.10)] backdrop-blur-[28px] sm:px-10 sm:py-9"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#7c3aed_0%,#ec4899_50%,#06b6d4_100%)]"
        />

        <figure>
          <div
            aria-hidden="true"
            className="mb-3 select-none bg-[linear-gradient(135deg,#7c3aed_0%,#ec4899_50%,#06b6d4_100%)] bg-clip-text text-[56px] font-bold leading-[0.5] text-transparent sm:text-[64px]"
          >
            &quot;
          </div>
          <blockquote
            id="welcome-title"
            className="mx-auto max-w-md text-[17px] font-semibold leading-[1.4] tracking-normal text-[#0f0f12] sm:text-[19px]"
          >
            Anyone who doesn&apos;t have a great time in San Francisco is
            pretty much dead to me.
          </blockquote>
          <figcaption className="mt-3 text-[13px] font-medium text-[#6b6b76]">
            — Anthony Bourdain
          </figcaption>
        </figure>

        <div className="my-6 h-px bg-[linear-gradient(90deg,transparent,rgba(15,15,18,0.10),transparent)] sm:my-7" />

        <p
          id="welcome-info"
          className="mx-auto mb-7 max-w-md text-[14px] leading-[1.55] text-[#0f0f12] sm:text-[14.5px]"
        >
          SF serves the world on a plate. Click a country to see where to eat
          its cuisine in the city, and mark the ones you&apos;ve tried.
        </p>

        <button
          ref={ctaRef}
          type="button"
          onClick={onDismiss}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] px-8 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.40),0_2px_6px_rgba(6,182,212,0.20)] transition-all duration-150 ease-out hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed] active:scale-[0.98]"
        >
          <span>Let&apos;s go</span>
          <span aria-hidden="true" className="text-base">
            →
          </span>
        </button>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs leading-relaxed text-[#6b6b76]">
          <span
            aria-hidden="true"
            className="inline-grid h-4 w-4 flex-shrink-0 place-items-center rounded-full bg-[#7c3aed]/10 text-[10px] font-bold leading-none text-[#7c3aed]"
          >
            i
          </span>
          <span>
            Prefer a checklist instead? Open the menu and choose{" "}
            <span className="font-semibold text-[#0f0f12]">View list</span>.
          </span>
        </p>
      </section>
    </div>
  );
}
