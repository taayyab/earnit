type BackButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
};

const BackButton = ({
  onClick,
  label = "Back",
  className = "",
}: BackButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation border border-[#e5e7eb] shadow-sm hover:bg-slate-100 hover:text-[hsl(var(--primary))] min-h-14 px-5 py-3 text-base ${className}`}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-chevron-left mr-2 h-4 w-4"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6"></path>
    </svg>
    {label}
  </button>
);

export default BackButton;
