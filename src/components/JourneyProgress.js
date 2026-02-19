import React from 'react';
import { Check, FileText, Brain, ClipboardCheck, Users, Send } from 'lucide-react';

const JOURNEY_STEPS = [
  {
    id: 'documents',
    title: 'Upload Documents',
    description: 'DD-214 & medical records',
    icon: FileText
  },
  {
    id: 'analysis',
    title: 'AI Analysis',
    description: 'Conditions identified',
    icon: Brain
  },
  {
    id: 'review',
    title: 'Review & Approve',
    description: 'Your decisions',
    icon: ClipboardCheck
  },
  {
    id: 'advocate',
    title: 'Veteran Advocate',
    description: 'Optional guidance',
    icon: Users
  },
  {
    id: 'submit',
    title: 'Submit',
    description: 'Send to VA',
    icon: Send
  }
];

export default function JourneyProgress({ currentStep, className = '' }) {
  const currentIndex = JOURNEY_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 p-4 ${className}`}>
      <h3 className="text-sm font-medium text-neutral-500 mb-4">Your Claims Journey</h3>
      <div className="flex items-center justify-between">
        {JOURNEY_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-[hsl(var(--primary))] text-white ring-4 ring-[hsl(var(--primary))]/20'
                      : 'bg-white text-neutral-400'
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs text-center max-w-[60px] leading-tight ${
                    isCurrent ? 'text-[hsl(var(--primary))] font-semibold' : isComplete ? 'text-green-600' : 'text-neutral-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < JOURNEY_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-1 rounded ${
                    index < currentIndex ? 'bg-green-500' : 'bg-neutral-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function MiniProgress({ current, total, label }) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[hsl(var(--primary))] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-neutral-600 whitespace-nowrap">
        {label || `${current} of ${total}`}
      </span>
    </div>
  );
}
