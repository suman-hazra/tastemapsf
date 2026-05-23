interface Props {
  onClick: () => void;
}

export default function FinishButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-6 left-1/2 z-20 flex h-14 -translate-x-1/2 items-center gap-3 rounded-chip border border-black/10 bg-panel px-6 text-base font-semibold text-ink shadow-lg transition-colors hover:bg-canvas"
    >
      <FlagIcon />
      <span>Finish</span>
    </button>
  );
}

function FlagIcon() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        d="M5 18V4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M5.4 4.4H17.2V12.4H5.4V4.4Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M5.4 4.4H9.3V8.4H5.4V4.4Z" fill="currentColor" />
      <path d="M13.3 4.4H17.2V8.4H13.3V4.4Z" fill="currentColor" />
      <path d="M9.3 8.4H13.3V12.4H9.3V8.4Z" fill="currentColor" />
    </svg>
  );
}
