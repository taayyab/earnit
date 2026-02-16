type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
};

const ProgressBar = ({
  currentStep,
  totalSteps,
  progressPercent,
}: ProgressBarProps) => (
  <div className="border-b border-slate-200">
    <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-slate-500">
        <span className="text-[#65758b]">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-[#D4A574] font-medium">
          {progressPercent}% Complete
        </span>
      </div>
    </div>
  </div>
);

export default ProgressBar;
