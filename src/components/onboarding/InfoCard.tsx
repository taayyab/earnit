import type { ReactNode } from "react";

type InfoCardProps = {
  children: ReactNode;
  className?: string;
};

const InfoCard = ({ children, className = "" }: InfoCardProps) => (
  <div
    className={`rounded-xl border text-[#21252b] shadow bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30 ${className}`}
  >
    <div className="p-6 pt-6">{children}</div>
  </div>
);

export default InfoCard;
