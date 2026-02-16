type StepperProps = {
  steps: string[];
  currentIndex: number;
};

const Stepper = ({ steps, currentIndex }: StepperProps) => (
  <div className="flex items-center justify-center text-sm text-slate-500">
    {steps.map((label, index) => {
      const isActive = index === currentIndex;
      const isComplete = index < currentIndex;
      return (
        <div key={label} className="flex items-center">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold ${
                isActive || isComplete
                  ? "bg-rose-700 text-white"
                  : " text-slate-500"
              }`}
            >
              {index + 1}
            </span>
            <span
              className={`font-medium ${
                isActive || isComplete
                  ? "text-slate-900"
                  : "text-slate-500"
              }`}
            >
              {label}
            </span>
          </div>
          {index < steps.length - 1 ? (
            <span
              className={`mx-4 h-px w-10 ${
                isComplete ? "bg-rose-700" : "bg-slate-200"
              }`}
            />
          ) : null}
        </div>
      );
    })}
  </div>
);

export default Stepper;
