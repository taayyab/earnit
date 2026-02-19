import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageMode } from '../../context/PlainLanguageContext';
import { claimPhases, translatePhase } from '../../utils/plainLanguageTerms';

const PHASES = [
  { phase: 1 },
  { phase: 2 },
  { phase: 3 },
  { phase: 4 },
  { phase: 5 },
  { phase: 6 },
  { phase: 7 }
];

export function ClaimTimeline({ 
  currentPhase = 1, 
  className,
  showLabels = true,
  compact = false
}) {
  const { usePlainLanguage } = useLanguageMode();

  return (
    <div className={cn("w-full", className)}>
      <div className="hidden md:block">
        <HorizontalTimeline 
          currentPhase={currentPhase} 
          usePlainLanguage={usePlainLanguage}
          showLabels={showLabels}
          compact={compact}
        />
      </div>
      <div className="md:hidden">
        <VerticalTimeline 
          currentPhase={currentPhase} 
          usePlainLanguage={usePlainLanguage}
          showLabels={showLabels}
          compact={compact}
        />
      </div>
    </div>
  );
}

function HorizontalTimeline({ currentPhase, usePlainLanguage, showLabels, compact }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {PHASES.map(({ phase }, index) => {
          const isCompleted = phase < currentPhase;
          const isCurrent = phase === currentPhase;
          const isLast = index === PHASES.length - 1;

          return (
            <React.Fragment key={phase}>
              <div className="flex flex-col items-center relative z-10">
                <div className={cn(
                  "flex items-center justify-center rounded-full transition-all",
                  compact ? "h-6 w-6" : "h-8 w-8",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && "bg-blue-500 text-white ring-4 ring-blue-100",
                  !isCompleted && !isCurrent && "bg-slate-200 text-slate-400"
                )}>
                  {isCompleted ? (
                    <CheckCircle className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
                  ) : (
                    <span className={cn(
                      "font-medium",
                      compact ? "text-xs" : "text-sm"
                    )}>{phase}</span>
                  )}
                </div>
                {showLabels && (
                  <span className={cn(
                    "mt-2 text-center max-w-[80px] leading-tight",
                    compact ? "text-[10px]" : "text-xs",
                    isCurrent ? "text-blue-700 font-medium" : "text-slate-500"
                  )}>
                    {translatePhase(phase, usePlainLanguage)}
                  </span>
                )}
              </div>
              {!isLast && (
                <div className={cn(
                  "flex-1 mx-1",
                  compact ? "h-0.5" : "h-1",
                  phase < currentPhase ? "bg-green-500" : "bg-slate-200"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function VerticalTimeline({ currentPhase, usePlainLanguage, showLabels, compact }) {
  return (
    <div className="relative pl-4">
      {PHASES.map(({ phase }, index) => {
        const isCompleted = phase < currentPhase;
        const isCurrent = phase === currentPhase;
        const isLast = index === PHASES.length - 1;

        return (
          <div key={phase} className="relative">
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex items-center justify-center rounded-full shrink-0 transition-all",
                compact ? "h-6 w-6" : "h-8 w-8",
                isCompleted && "bg-green-500 text-white",
                isCurrent && "bg-blue-500 text-white ring-4 ring-blue-100",
                !isCompleted && !isCurrent && "bg-slate-200 text-slate-400"
              )}>
                {isCompleted ? (
                  <CheckCircle className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
                ) : (
                  <span className={cn(
                    "font-medium",
                    compact ? "text-xs" : "text-sm"
                  )}>{phase}</span>
                )}
              </div>
              {showLabels && (
                <div className={cn(
                  "pb-4",
                  compact ? "pt-0.5" : "pt-1"
                )}>
                  <span className={cn(
                    compact ? "text-xs" : "text-sm",
                    isCurrent ? "text-blue-700 font-medium" : "text-slate-600"
                  )}>
                    {translatePhase(phase, usePlainLanguage)}
                  </span>
                </div>
              )}
            </div>
            {!isLast && (
              <div className={cn(
                "absolute left-0 w-0.5 -translate-x-1/2",
                compact ? "top-6 h-4 ml-3" : "top-8 h-6 ml-4",
                phase < currentPhase ? "bg-green-500" : "bg-slate-200"
              )} style={{ left: compact ? '12px' : '16px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ClaimTimelineCompact({ currentPhase = 1, className }) {
  const { usePlainLanguage } = useLanguageMode();
  const progress = ((currentPhase - 1) / 6) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600">
          Step {currentPhase} of 7
        </span>
        <span className="text-slate-500">
          {translatePhase(currentPhase, usePlainLanguage)}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(progress, 5)}%` }}
        />
      </div>
    </div>
  );
}

export default ClaimTimeline;
