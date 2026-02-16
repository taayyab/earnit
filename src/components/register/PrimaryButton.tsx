import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type PrimaryButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  showIcon?: boolean;
  className?: string;
};

const PrimaryButton = ({
  onClick,
  disabled,
  children,
  showIcon = true,
  className = "",
}: PrimaryButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation text-primary-foreground shadow min-h-14 px-5 py-3 text-base ${className}`}
  >
    {children}
    {showIcon ? <ChevronRight className="h-4 w-4" /> : null}
  </button>
);

export default PrimaryButton;
