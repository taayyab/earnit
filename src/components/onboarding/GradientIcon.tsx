import type { LucideIcon } from "lucide-react";

type GradientIconProps = {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
};

const GradientIcon = ({
  icon: Icon,
  className = "",
  iconClassName = "",
}: GradientIconProps) => (
  <div
    className={`inline-flex p-3 rounded-full bg-gradient-to-br from-[#D4A574]/10 to-[#8B9D83]/10 mb-4 ${className}`}
  >
    <Icon className={`h-8 w-8 text-[#1c3a5f] ${iconClassName}`} />
  </div>
);

export default GradientIcon;
