import { useState, useEffect, useCallback } from 'react';
import { orchestrationAPI } from '../lib/api';

export const CLAIM_STAGES = {
  INTAKE: 'intake',
  DOCUMENTS: 'documents',
  CONDITIONS: 'conditions',
  EVIDENCE: 'evidence',
  QA_REVIEW: 'qa_review',
  RDB_PENDING: 'rdb_pending',
  RDB_APPROVED: 'rdb_approved',
  SUBMITTED: 'submitted'
};

export const STAGE_ORDER = [
  CLAIM_STAGES.INTAKE,
  CLAIM_STAGES.DOCUMENTS,
  CLAIM_STAGES.CONDITIONS,
  CLAIM_STAGES.EVIDENCE,
  CLAIM_STAGES.QA_REVIEW,
  CLAIM_STAGES.RDB_PENDING,
  CLAIM_STAGES.RDB_APPROVED,
  CLAIM_STAGES.SUBMITTED
];

export const STAGE_LABELS = {
  [CLAIM_STAGES.INTAKE]: 'Intake',
  [CLAIM_STAGES.DOCUMENTS]: 'Upload Documents',
  [CLAIM_STAGES.CONDITIONS]: 'Confirm Conditions',
  [CLAIM_STAGES.EVIDENCE]: 'Evidence Collection',
  [CLAIM_STAGES.QA_REVIEW]: 'Quality Review',
  [CLAIM_STAGES.RDB_PENDING]: 'Rating Decision Brief',
  [CLAIM_STAGES.RDB_APPROVED]: 'RDB Approved',
  [CLAIM_STAGES.SUBMITTED]: 'Submitted'
};

export const STAGE_ROUTES = {
  [CLAIM_STAGES.INTAKE]: (claimId) => `/claim/${claimId}/intake`,
  [CLAIM_STAGES.DOCUMENTS]: (claimId) => `/claim/${claimId}/documents`,
  [CLAIM_STAGES.CONDITIONS]: (claimId) => `/claim/${claimId}`,
  [CLAIM_STAGES.EVIDENCE]: (claimId) => `/claim/${claimId}`,
  [CLAIM_STAGES.QA_REVIEW]: () => `/claim-review`,
  [CLAIM_STAGES.RDB_PENDING]: () => `/claim-review`,
  [CLAIM_STAGES.RDB_APPROVED]: () => `/claim-review`,
  [CLAIM_STAGES.SUBMITTED]: (claimId) => `/claim/${claimId}`
};

export function getStageIndex(stage) {
  return STAGE_ORDER.indexOf(stage);
}

export function isStageAccessible(currentStage, targetStage) {
  const currentIdx = getStageIndex(currentStage);
  const targetIdx = getStageIndex(targetStage);
  return targetIdx <= currentIdx;
}

export function getNextStage(currentStage) {
  const currentIdx = getStageIndex(currentStage);
  if (currentIdx < STAGE_ORDER.length - 1) {
    return STAGE_ORDER[currentIdx + 1];
  }
  return null;
}

export function getRouteForStage(stage, claimId) {
  const routeFn = STAGE_ROUTES[stage];
  return routeFn ? routeFn(claimId) : `/claim/${claimId}`;
}

export function useClaimStage(claimId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aggregate, setAggregate] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [stageInfo, setStageInfo] = useState(null);

  const fetchClaimStage = useCallback(async () => {
    if (!claimId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [aggregateRes, stageRes] = await Promise.all([
        orchestrationAPI.getAggregate(claimId),
        orchestrationAPI.getStage(claimId)
      ]);

      setAggregate(aggregateRes.data);
      setCurrentStage(aggregateRes.data?.stage || CLAIM_STAGES.INTAKE);
      setStageInfo(stageRes.data);
    } catch (err) {
      console.error('Failed to fetch claim stage:', err);
      setError(err.response?.data?.detail || 'Failed to load claim status');
      setCurrentStage(CLAIM_STAGES.INTAKE);
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    fetchClaimStage();
  }, [fetchClaimStage]);

  const canAccessStage = useCallback((targetStage) => {
    if (!currentStage) return false;
    return isStageAccessible(currentStage, targetStage);
  }, [currentStage]);

  const getBlockedMessage = useCallback((targetStage) => {
    if (canAccessStage(targetStage)) return null;

    const currentIdx = getStageIndex(currentStage);
    const targetIdx = getStageIndex(targetStage);

    if (targetIdx > currentIdx) {
      const previousStage = STAGE_ORDER[targetIdx - 1];
      return `Please complete "${STAGE_LABELS[previousStage]}" before accessing this page.`;
    }

    return null;
  }, [currentStage, canAccessStage]);

  const transitionToStage = useCallback(async (targetStage, force = false) => {
    if (!claimId) return { success: false, error: 'No claim ID' };

    try {
      const response = await orchestrationAPI.transitionStage(claimId, targetStage, force);
      if (response.data.success) {
        setCurrentStage(response.data.current_stage);
        await fetchClaimStage();
      }
      return response.data;
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to transition stage'
      };
    }
  }, [claimId, fetchClaimStage]);

  return {
    loading,
    error,
    aggregate,
    currentStage,
    stageInfo,
    canAccessStage,
    getBlockedMessage,
    transitionToStage,
    refresh: fetchClaimStage,
    isQAPassed: aggregate?.qa_results?.is_ready || false,
    isRDBApproved: aggregate?.rdb?.approval_status === 'approved',
    hasConditions: (aggregate?.conditions?.length || 0) > 0,
    hasDocuments: (aggregate?.documents?.length || 0) > 0,
    completionPercentage: aggregate?.completion_percentage || 0
  };
}

export default useClaimStage;
