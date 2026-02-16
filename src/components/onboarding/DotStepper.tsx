type DotStepperProps = {
  currentStep: number;
  totalSteps: number;
};

const DotStepper = ({ currentStep, totalSteps }: DotStepperProps) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: totalSteps }).map((_, index) => {
      const isActive = index === currentStep - 1;
      const isComplete = index < currentStep - 1;
      return (
        <span
          key={`step-dot-${index}`}
          className={`h-2 rounded-full ${
            isActive
              ? "w-6 bg-[#D4A574]"
              : isComplete
                ? "w-2 bg-[#D4A574]"
                : "w-2 bg-slate-300"
          }`}
        />
      );
    })}
  </div>
);

export default DotStepper;
