import { TriangleAlert } from "lucide-react";

type DemoBannerProps = {
  show: boolean;
  onExit: () => void;
  onDismiss: () => void;
};

const DemoBanner = ({ show, onExit, onDismiss }: DemoBannerProps) => (
  <div
    className={`border-b border-amber-200 bg-amber-50 ${show ? "" : "hidden"}`}
  >
    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs text-amber-700 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 font-medium uppercase tracking-wide">
        <TriangleAlert className="h-4 w-4" />
        Demo Mode
        <span className="font-normal normal-case text-amber-600">
          - Simulated data for demonstration
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onExit}
          className="rounded-md bg-amber-200/70 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-200"
        >
          Exit Demo
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium text-amber-700 hover:text-amber-900"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
);

export default DemoBanner;
