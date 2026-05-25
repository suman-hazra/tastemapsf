interface Props {
  onClick: () => void;
}

export default function FinishButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-20 mx-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] px-5 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.35),0_2px_6px_rgba(6,182,212,0.18)] transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(124,58,237,0.45),0_4px_10px_rgba(6,182,212,0.22)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#7c3aed,0_8px_24px_rgba(124,58,237,0.35)] active:scale-[0.98] active:shadow-[0_4px_12px_rgba(124,58,237,0.30)] disabled:scale-100 disabled:cursor-not-allowed disabled:bg-black/[0.06] disabled:text-[#6b6b76] disabled:shadow-none md:fixed md:bottom-10 md:left-1/2 md:z-20 md:-translate-x-1/2"
    >
      <FlagIcon />
      <span>My Score</span>
    </button>
  );
}

function FlagIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M3.25 1.5v13M3.25 2.25h8.25l-1.5 3 1.5 3H3.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
