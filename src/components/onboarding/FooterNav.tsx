import { ArrowRight, ChevronLeft } from "lucide-react";
import DotStepper from "./DotStepper";

type FooterNavProps = {
  onBack: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  currentStep: number;
  totalSteps: number;
};

const FooterNav = ({
  onBack,
  onPrimary,
  primaryLabel,
  currentStep,
  totalSteps,
}: FooterNavProps) => (
  <div className="mt-12 flex w-full items-center justify-between">
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation border border-[#e5e7eb] shadow-sm hover:bg-slate-100 min-h-14 px-5 py-3 text-base"
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </button>

    <DotStepper currentStep={currentStep} totalSteps={totalSteps} />

    <button
      type="button"
      onClick={onPrimary}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation text-primary-foreground shadow min-h-14 px-5 py-3 text-white bg-[#b2242e] hover:bg-[#8F1B29]"
    >
      {primaryLabel}
      <ArrowRight className="h-4 w-4" />
    </button>
  </div>
);

export default FooterNav;
