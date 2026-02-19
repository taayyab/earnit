import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClaimStage, STAGE_ORDER, STAGE_LABELS, getStageIndex, getRouteForStage } from '../hooks/useClaimStage';
import { CheckCircle, Circle, Lock, ChevronRight } from 'lucide-react';

export function StageNavigationIndicator({ claimId, compact = false }) {
  const navigate = useNavigate();
  const { loading, currentStage, canAccessStage } = useClaimStage(claimId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <div className="animate-pulse flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!currentStage) return null;

  const currentIdx = getStageIndex(currentStage);
  
  const visibleStages = compact 
    ? STAGE_ORDER.slice(Math.max(0, currentIdx - 1), Math.min(STAGE_ORDER.length, currentIdx + 3))
    : STAGE_ORDER;

  return (
    <nav 
      className={`${compact ? 'p-2' : 'p-4 bg-white rounded-lg shadow-sm border'}`} 
      aria-label="Claim progress"
    >
      {!compact && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-500">Claim Progress</h3>
        </div>
      )}
      
      <ol className={`flex ${compact ? 'items-center gap-1' : 'flex-col gap-2'}`}>
        {visibleStages.map((stage, idx) => {
          const stageIdx = getStageIndex(stage);
          const isCompleted = stageIdx < currentIdx;
          const isCurrent = stage === currentStage;
          const isAccessible = canAccessStage(stage);
          const isLocked = !isAccessible;
          const route = getRouteForStage(stage, claimId);

          return (
            <li key={stage} className={compact ? 'flex items-center' : ''}>
              {compact && idx > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-300 mx-1" aria-hidden="true" />
              )}
              <button
                onClick={() => isAccessible && navigate(route)}
                disabled={isLocked}
                className={`
                  flex items-center gap-2 rounded-lg transition-all
                  ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm w-full'}
                  ${isCompleted ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}
                  ${isCurrent ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300 font-medium' : ''}
                  ${isLocked ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
                  ${!isCompleted && !isCurrent && !isLocked ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' : ''}
                `}
                aria-current={isCurrent ? 'step' : undefined}
                aria-disabled={isLocked}
              >
                <span className="flex-shrink-0">
                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />}
                  {isCurrent && <Circle className="h-4 w-4 text-blue-600 fill-blue-600" aria-hidden="true" />}
                  {!isCompleted && !isCurrent && !isLocked && <Circle className="h-4 w-4 text-gray-400" aria-hidden="true" />}
                  {isLocked && <Lock className="h-4 w-4 text-gray-300" aria-hidden="true" />}
                </span>
                <span className={compact ? 'hidden sm:inline' : ''}>
                  {STAGE_LABELS[stage]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {!compact && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Current Stage:</span>
            <span className="font-medium text-blue-600">{STAGE_LABELS[currentStage]}</span>
          </div>
        </div>
      )}
    </nav>
  );
}

export function ClaimStageBar({ claimId }) {
  const { loading, currentStage, completionPercentage, isQAPassed, isRDBApproved } = useClaimStage(claimId);

  if (loading) {
    return (
      <div className="bg-white border-b px-4 py-2 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white border-b px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Stage:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {STAGE_LABELS[currentStage] || 'Intake'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Progress:</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
            <span className="font-medium text-gray-700">{completionPercentage}%</span>
          </div>
          
          {isQAPassed && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              QA Passed
            </span>
          )}
          
          {isRDBApproved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              RDB Approved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StageNavigationIndicator;
