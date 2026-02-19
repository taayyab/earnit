import React from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useClaimStage, STAGE_LABELS, getRouteForStage, getStageIndex, STAGE_ORDER } from '../hooks/useClaimStage';
import { AlertTriangle, Lock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function ClaimStageGuard({ 
  children, 
  requiredStage,
  minStage,
  allowPastStages = true 
}) {
  const { id: claimId, claimId: claimIdAlt } = useParams();
  const location = useLocation();
  const resolvedClaimId = claimId || claimIdAlt;
  
  const { 
    loading, 
    error, 
    currentStage, 
    canAccessStage,
    getBlockedMessage 
  } = useClaimStage(resolvedClaimId);

  if (!resolvedClaimId) {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" aria-hidden="true" />
          <p className="text-muted-foreground">Checking claim status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Claim</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const stageToCheck = requiredStage || minStage;
  
  if (stageToCheck && !canAccessStage(stageToCheck)) {
    const blockedMessage = getBlockedMessage(stageToCheck);
    const correctRoute = getRouteForStage(currentStage, resolvedClaimId);

    if (location.pathname !== correctRoute) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-amber-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Complete Previous Steps First
              </h2>
              <p className="text-gray-600 mb-6">
                {blockedMessage || `You need to complete the "${STAGE_LABELS[currentStage]}" stage before accessing this page.`}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-2">Your current stage:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {STAGE_LABELS[currentStage] || 'Intake'}
                  </span>
                </div>
              </div>

              <ClaimStageProgress currentStage={currentStage} targetStage={stageToCheck} />
              
              <div className="flex flex-col gap-3 mt-6">
                <Button 
                  onClick={() => window.location.href = correctRoute}
                  className="w-full"
                >
                  Continue from Current Stage
                  <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  if (requiredStage && !allowPastStages) {
    const currentIdx = getStageIndex(currentStage);
    const requiredIdx = getStageIndex(requiredStage);
    
    if (currentIdx > requiredIdx) {
      const correctRoute = getRouteForStage(currentStage, resolvedClaimId);
      return <Navigate to={correctRoute} replace />;
    }
  }

  return children;
}

function ClaimStageProgress({ currentStage, targetStage }) {
  const currentIdx = getStageIndex(currentStage);
  const targetIdx = getStageIndex(targetStage);
  
  const stagesToShow = STAGE_ORDER.slice(
    Math.max(0, currentIdx - 1),
    Math.min(STAGE_ORDER.length, targetIdx + 2)
  );

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {stagesToShow.map((stage, idx) => {
        const stageIdx = getStageIndex(stage);
        const isCompleted = stageIdx < currentIdx;
        const isCurrent = stage === currentStage;
        const isTarget = stage === targetStage;
        const isLocked = stageIdx > currentIdx;

        return (
          <React.Fragment key={stage}>
            {idx > 0 && (
              <div className={`w-4 h-0.5 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
            <div 
              className={`
                px-2 py-1 rounded text-xs font-medium
                ${isCompleted ? 'bg-green-100 text-green-700' : ''}
                ${isCurrent ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' : ''}
                ${isTarget ? 'bg-amber-100 text-amber-700' : ''}
                ${isLocked && !isTarget ? 'bg-gray-100 text-gray-400' : ''}
              `}
            >
              {STAGE_LABELS[stage]}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function RequireQAPass({ children }) {
  const { id: claimId } = useParams();
  const { loading, aggregate, currentStage } = useClaimStage(claimId);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Checking QA status...</p>
        </div>
      </div>
    );
  }

  const qaReady = aggregate?.qa_results?.is_ready;
  const qaScore = aggregate?.qa_results?.overall_score || 0;

  if (!qaReady && qaScore < 60) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            QA Review Required
          </h2>
          <p className="text-gray-600 mb-4">
            Your claim must pass Quality Assurance review before accessing the Rating Decision Brief.
          </p>
          {qaScore > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Current QA Score</p>
              <p className="text-2xl font-bold text-amber-600">{qaScore}%</p>
              <p className="text-xs text-gray-400">Minimum required: 60%</p>
            </div>
          )}
          <Button 
            onClick={() => window.location.href = `/claim/${claimId}`}
            className="w-full"
          >
            Review Claim Details
          </Button>
        </div>
      </div>
    );
  }

  return children;
}

export function RequireRDBApproval({ children }) {
  const { id: claimId } = useParams();
  const { loading, aggregate } = useClaimStage(claimId);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Checking RDB status...</p>
        </div>
      </div>
    );
  }

  const rdbApproved = aggregate?.rdb?.approval_status === 'approved';

  if (!rdbApproved) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            RDB Approval Required
          </h2>
          <p className="text-gray-600 mb-4">
            Your Rating Decision Brief must be reviewed and approved before submitting your claim to the VA.
          </p>
          {aggregate?.rdb ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">RDB Status</p>
              <p className="text-lg font-semibold text-amber-600 capitalize">
                {aggregate.rdb.approval_status || 'Pending Review'}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">RDB Status</p>
              <p className="text-lg font-semibold text-gray-600">Not Generated</p>
            </div>
          )}
          <Button 
            onClick={() => window.location.href = '/claim-review'}
            className="w-full"
          >
            Go to Claim Review
          </Button>
        </div>
      </div>
    );
  }

  return children;
}

export function RequireDenialLetter({ children }) {
  const { id: claimId } = useParams();
  const { loading, aggregate } = useClaimStage(claimId);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Checking appeal status...</p>
        </div>
      </div>
    );
  }

  const hasAppeal = aggregate?.appeal;
  const hasDenialLetter = aggregate?.appeal?.denial_letter_uploaded;

  if (!hasAppeal || !hasDenialLetter) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Denial Letter Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please upload your VA denial letter before accessing the appeal analysis.
          </p>
          <Button 
            onClick={() => window.location.href = '/appeals'}
            className="w-full"
          >
            Go to Appeals
          </Button>
        </div>
      </div>
    );
  }

  return children;
}

export default ClaimStageGuard;
