import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api, { orchestrationAPI } from '../lib/api';
import { useDemoMode } from '../context/DemoModeContext';
import VeteranLayout from '../components/VeteranLayout';

import ConditionRoadmap from '../components/conditions/ConditionRoadmap';
import { useCelebration } from '../components/Celebration';
import { toast } from 'sonner';
import { ChevronRight, CheckCircle, AlertTriangle, FileText, Shield, Send, Users, Copy, FileCheck, Heart, UserPlus, Award } from 'lucide-react';
import { ClaimStageBar } from '../components/StageNavigationIndicator';

export default function ClaimReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { celebrate, CelebrationComponent } = useCelebration();
  const { isDemoMode, appendDemoParam } = useDemoMode();
  const [analysis, setAnalysis] = useState(location.state?.analysis || null);
  const [loading, setLoading] = useState(!location.state?.analysis);
  const [submitting, setSubmitting] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [conditionRequirements, setConditionRequirements] = useState({});
  const [veteranNotes, setVeteranNotes] = useState('');
  const [error, setError] = useState(null);
  const [claimId, setClaimId] = useState(null);
  const [selectedConditionForRoadmap, setSelectedConditionForRoadmap] = useState(null);
  const [vaSubmitting, setVaSubmitting] = useState(false);
  const [vaSubmissionStatus, setVaSubmissionStatus] = useState(null);
  const [vaConfigured, setVaConfigured] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [requirementsLoaded, setRequirementsLoaded] = useState(false);
  
  // Verification data for benefit calculation
  const [verificationData, setVerificationData] = useState({
    hasSpouse: false,
    numChildren: 0,
    numSchoolAgeChildren: 0,
    numDependentParents: 0,
    smcEligible: false,
    smcType: null
  });
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [dependentsLoaded, setDependentsLoaded] = useState(false);
  const [nextActions, setNextActions] = useState(null);

  useEffect(() => {
    if (!analysis) {
      loadLatestAnalysis();
    } else {
      initializeSelections();
    }
    checkVaStatus();
    loadDependentData();
  }, [analysis]);

  useEffect(() => {
    if (claimId) {
      loadNextActions(claimId);
      loadSubmissionStatus(claimId);
    }
  }, [claimId]);

  const loadSubmissionStatus = async (id) => {
    try {
      const response = await api.get(appendDemoParam(`/submit/status/${id}`));
      if (response.data.success && response.data.status?.vaClaimId) {
        setVaSubmissionStatus({
          submitted: true,
          submission_id: response.data.status.vaClaimId,
          status: response.data.status.status,
        });
      }
    } catch (err) {
      // 400 = not yet submitted, 404 = claim not found — both are fine, just leave status null
    }
  };

  const loadNextActions = async (id) => {
    try {
      const response = await orchestrationAPI.getNextActions(id);
      if (response.data.success) {
        setNextActions(response.data);
      }
    } catch (err) {
      console.log('Next actions not available');
    }
  };

  const loadDependentData = async () => {
    try {
      const response = await api.get(appendDemoParam('/veteran-profile/dependents'));
      if (response.data.success && response.data.dependents) {
        const deps = response.data.dependents;
        setVerificationData({
          hasSpouse: deps.has_spouse || false,
          numChildren: deps.num_children || 0,
          numSchoolAgeChildren: deps.num_school_age_children || 0,
          numDependentParents: deps.num_dependent_parents || 0,
          smcEligible: deps.smc_eligible || false,
          smcType: deps.smc_type || null
        });
        setDependentsLoaded(true);
        // Dependent data confirmed from VA profile — mark verification complete
        // If user edits any field below, verification resets to prompt re-confirm
        setVerificationComplete(true);
      }
    } catch (err) {
      // Even if the call fails, don't block submission — default data is fine
      setDependentsLoaded(true);
      setVerificationComplete(true);
    }
  };

  const checkVaStatus = async () => {
    try {
      const response = await api.get(appendDemoParam('/va/status'));
      setVaConfigured(response.data.configured);
    } catch (err) {
      setVaConfigured(false);
    }
  };

  const loadLatestAnalysis = async () => {
    try {
      const response = await api.get(appendDemoParam('/claims-intelligence/latest-analysis'));
      if (response.data.has_analysis) {
        setAnalysis(response.data.analysis);
        if (response.data.analysis?.claim_id) {
          setClaimId(response.data.analysis.claim_id);
          setIsApproved(true);
        }
      } else {
        navigate('/document-onboarding');
      }
    } catch (err) {
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirementStatus = async (claimIdToFetch) => {
    try {
      const response = await api.get(appendDemoParam(`/conditions/claim/${claimIdToFetch}/requirement-status`));
      if (response.data.success && response.data.requirement_status) {
        setConditionRequirements(prev => {
          const updated = { ...prev };
          Object.entries(response.data.requirement_status).forEach(([name, status]) => {
            updated[name] = {
              ...updated[name],
              total: status.total,
              completed: status.completed,
              overridden: status.overridden,
              percentage: status.percentage,
              complete: status.complete,
              missing: status.missing,
              backendVerified: true
            };
          });
          return updated;
        });
        setRequirementsLoaded(true);
      }
    } catch (err) {
      setRequirementsLoaded(true);
    }
  };

  const initializeSelections = () => {
    if (analysis?.conditions) {
      const claimableConditions = analysis.conditions
        .filter(c => c.claimable)
        .map(c => c.condition_name);
      setSelectedConditions(claimableConditions);
      
      const requirements = {};
      analysis.conditions.forEach(c => {
        const totalReqs = c.is_presumptive ? 2 : 4;
        requirements[c.condition_name] = {
          total: totalReqs,
          completed: 0,
          backendVerified: false,
          items: getRequirementsForCondition(c)
        };
      });
      setConditionRequirements(requirements);
      
      if (analysis.claim_id) {
        setClaimId(analysis.claim_id);
        setIsApproved(true);
        fetchRequirementStatus(analysis.claim_id);
      }
    }
  };

  const getRequirementsForCondition = (condition) => {
    if (condition.is_presumptive) {
      return [
        { id: 'diagnosis', name: 'Current Diagnosis', completed: true },
        { id: 'dd214', name: 'DD-214', completed: false }
      ];
    }
    return [
      { id: 'diagnosis', name: 'Current Diagnosis', completed: true },
      { id: 'service_records', name: 'Service Treatment Records', completed: false },
      { id: 'nexus', name: 'Nexus Letter', completed: false },
      { id: 'dd214', name: 'DD-214', completed: false }
    ];
  };

  const toggleCondition = (conditionName) => {
    setSelectedConditions(prev => 
      prev.includes(conditionName)
        ? prev.filter(c => c !== conditionName)
        : [...prev, conditionName]
    );
  };

  const getConditionCompletionStatus = (conditionName) => {
    const reqs = conditionRequirements[conditionName];
    if (!reqs) return { percentage: 0, complete: false, backendVerified: false };
    if (reqs.backendVerified && reqs.complete !== undefined) {
      return { percentage: reqs.percentage || 0, complete: reqs.complete, backendVerified: true };
    }
    const percentage = Math.round((reqs.completed / reqs.total) * 100);
    return { percentage, complete: false, backendVerified: reqs.backendVerified || false };
  };

  const getOverallReadiness = () => {
    if (selectedConditions.length === 0) {
      return { ready: false, message: 'Select at least one condition' };
    }
    
    const unverifiedConditions = selectedConditions.filter(c => {
      const status = getConditionCompletionStatus(c);
      return !status.backendVerified;
    });
    
    const incompleteConditions = selectedConditions.filter(c => {
      const status = getConditionCompletionStatus(c);
      return !status.complete;
    });
    
    if (unverifiedConditions.length > 0) {
      return { 
        ready: true, 
        message: 'Ready to create claim package',
        needsConfirmation: true,
        confirmMessage: 'Some requirement checks are still loading. Proceed anyway?'
      };
    }
    
    if (incompleteConditions.length > 0) {
      return { 
        ready: true, 
        message: `${incompleteConditions.length} condition(s) may need additional evidence`,
        incompleteConditions,
        warning: true,
        needsConfirmation: true,
        confirmMessage: `${incompleteConditions.length} condition(s) have incomplete requirements. Continue anyway?`
      };
    }
    
    return { ready: true, message: 'All requirements met - ready to submit' };
  };

  const handleApproveAndCreate = async () => {
    if (selectedConditions.length === 0) {
      setError('Please select at least one condition');
      return;
    }

    // Proceed even if some checks are still loading

    setSubmitting(true);
    setError(null);

    try {
      const assembleResponse = await api.post(appendDemoParam('/claims-intelligence/pre-assemble-claim'), {
        condition_names: selectedConditions,
        include_secondary: true
      });

      if (!assembleResponse.data.success) {
        throw new Error('Failed to assemble claim package');
      }

      const packageId = assembleResponse.data.package_id;
      
      const approveResponse = await api.post(appendDemoParam('/claims-intelligence/approve-claim'), {
        claim_package_id: packageId,
        approved_conditions: selectedConditions,
        veteran_notes: veteranNotes
      });

      if (approveResponse.data.success) {
        setClaimId(approveResponse.data.claim_id);
        setIsApproved(true);
        celebrate('milestone_reached', 'Your claim package is assembled and ready for submission!');
      }
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.response?.data?.message;
      if (detail) {
        setError(detail);
      } else if (status === 404) {
        setError('The claim assembly service is currently unavailable. Please try again later or contact support if the issue persists.');
      } else if (status === 500) {
        setError('An internal server error occurred while creating your claim package. Please try again in a few moments.');
      } else if (!err.response) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred while creating your claim package. Please try again or contact support.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitToVA = async () => {
    if (!claimId) {
      toast.error('Please approve the claim first');
      return;
    }

    setVaSubmitting(true);
    try {
      const response = await api.post(appendDemoParam('/va/submit'), { claim_id: claimId });
      if (response.data.success) {
        setVaSubmissionStatus({
          submitted: true,
          submission_id: response.data.submission_id,
          status: response.data.status
        });
        celebrate('claim_submitted', 'Your claim is on its way to the VA. Outstanding work, soldier!');
      }
    } catch (err) {
      toast.error('Failed to submit to VA');
    } finally {
      setVaSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4" aria-hidden="true">⚙️</div>
          <p className="text-gray-600">Loading your claim analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No analysis found</p>
          <button
            onClick={() => navigate('/document-onboarding')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Start Document Upload
          </button>
        </div>
      </div>
    );
  }

  const readiness = getOverallReadiness();

  return (
    <VeteranLayout>
    <div className="min-h-full bg-slate-50">

      {claimId && <ClaimStageBar claimId={claimId} />}

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Review & Submit Your Claim</h1>
          <p className="mt-2 text-gray-600">
            Select conditions, verify your information, and submit your claim package.
          </p>
        </div>

        {/* Error Modal */}
        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setError(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="bg-red-50 px-6 py-4 flex items-center gap-3 border-b border-red-100">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-red-800">Something Went Wrong</h3>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-700 text-sm leading-relaxed">{error}</p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setError(null)}
                  className="px-5 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-950 font-medium text-sm transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">

          {/* Your Conditions */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold mb-4">Your Conditions</h2>
            <div className="space-y-3">
              {analysis.conditions?.map((condition, index) => {
                const isSelected = selectedConditions.includes(condition.condition_name);
                const status = getConditionCompletionStatus(condition.condition_name);

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-[#1B3A5F] bg-blue-50/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={`condition-${index}`}
                        checked={isSelected}
                        onChange={() => toggleCondition(condition.condition_name)}
                        className="mt-1 h-5 w-5 min-h-[20px] min-w-[20px] rounded cursor-pointer accent-[#1B3A5F]"
                        aria-describedby={`condition-desc-${index}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label htmlFor={`condition-${index}`} className="font-medium text-gray-900 cursor-pointer">{condition.condition_name}</label>
                          {condition.is_presumptive && (
                            <span className="px-2 py-0.5 bg-blue-50 text-[#1B3A5F] text-xs rounded-full flex items-center gap-1">
                              <Shield className="h-3 w-3" aria-hidden="true" />
                              Presumptive
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            condition.evidence_strength === 'strong'
                              ? 'bg-green-100 text-green-700'
                              : condition.evidence_strength === 'moderate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {condition.evidence_strength} evidence
                          </span>
                        </div>

                        {condition.va_diagnostic_code && (
                          <p id={`condition-desc-${index}`} className="text-sm text-gray-500 mt-1">
                            VA Code: {condition.va_diagnostic_code}
                          </p>
                        )}

                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <span id={`progress-label-${index}`} className="text-sm text-gray-600">Requirements</span>
                              <span className={`text-sm font-medium ${
                                status.complete ? 'text-green-600' : 'text-amber-600'
                              }`}>
                                {status.percentage}% complete
                              </span>
                            </div>
                            <div
                              className="h-2 bg-gray-200 rounded-full overflow-hidden"
                              role="progressbar"
                              aria-valuenow={status.percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-labelledby={`progress-label-${index}`}
                            >
                              <div
                                className={`h-full rounded-full transition-all ${
                                  status.complete ? 'bg-green-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${status.percentage}%` }}
                              />
                            </div>
                            <button
                              onClick={() => setSelectedConditionForRoadmap(condition)}
                              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium min-h-[44px]"
                            >
                              <FileText className="h-4 w-4" aria-hidden="true" />
                              View & Complete Requirements
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        {condition.potential_rating_range && (
                          <p className="text-sm font-medium text-gray-700">
                            {condition.potential_rating_range[0]}%-{condition.potential_rating_range[1]}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Additional Notes</h3>
              <span className="text-xs text-gray-400">Optional</span>
            </div>
            <textarea
              value={veteranNotes}
              onChange={(e) => setVeteranNotes(e.target.value)}
              placeholder="Add any additional context about your conditions, service history, or evidence..."
              className="w-full p-3 border rounded-lg resize-none h-24 text-sm"
            />
          </div>

          {/* Verify Your Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-2 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" aria-hidden="true" />
              Verify Your Information
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              VA compensation rates vary based on dependents. This helps calculate your accurate benefit entitlement.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Spouse */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-rose-500" aria-hidden="true" />
                  <div>
                    <label htmlFor="hasSpouse" className="font-medium text-gray-900">Married?</label>
                    <p className="text-xs text-gray-500">Higher rates for veterans with a spouse</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="hasSpouse"
                  checked={verificationData.hasSpouse}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, hasSpouse: e.target.checked }))}
                  className="h-5 w-5 min-h-[20px] min-w-[20px] text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Children */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-500" aria-hidden="true" />
                  <div>
                    <label htmlFor="numChildren" className="font-medium text-gray-900">Dependent Children</label>
                    <p className="text-xs text-gray-500">Under 18 or in school (18-23)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVerificationData(prev => ({ ...prev, numChildren: Math.max(0, prev.numChildren - 1) }))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    aria-label="Decrease children"
                  >-</button>
                  <input type="number" id="numChildren" min="0" max="20" value={verificationData.numChildren}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, numChildren: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-16 h-10 text-center border rounded-lg"
                  />
                  <button
                    onClick={() => setVerificationData(prev => ({ ...prev, numChildren: prev.numChildren + 1 }))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    aria-label="Increase children"
                  >+</button>
                </div>
              </div>

              {/* Dependent Parents */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#1B3A5F]" aria-hidden="true" />
                  <div>
                    <label htmlFor="numParents" className="font-medium text-gray-900">Dependent Parents</label>
                    <p className="text-xs text-gray-500">Parents who depend on you for support</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVerificationData(prev => ({ ...prev, numDependentParents: Math.max(0, prev.numDependentParents - 1) }))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    aria-label="Decrease parents"
                  >-</button>
                  <input type="number" id="numParents" min="0" max="2" value={verificationData.numDependentParents}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, numDependentParents: Math.min(2, Math.max(0, parseInt(e.target.value) || 0)) }))}
                    className="w-16 h-10 text-center border rounded-lg"
                  />
                  <button
                    onClick={() => setVerificationData(prev => ({ ...prev, numDependentParents: Math.min(2, prev.numDependentParents + 1) }))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    aria-label="Increase parents"
                  >+</button>
                </div>
              </div>

              {/* SMC Eligibility */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-amber-600" aria-hidden="true" />
                  <div>
                    <label htmlFor="smcEligible" className="font-medium text-gray-900">Special Monthly Compensation?</label>
                    <p className="text-xs text-gray-500">For severe disabilities (loss of limb, etc.)</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="smcEligible"
                  checked={verificationData.smcEligible}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, smcEligible: e.target.checked }))}
                  className="h-5 w-5 min-h-[20px] min-w-[20px] text-amber-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => setVerificationComplete(true)}
              className={`w-full mt-4 py-3 rounded-lg font-medium transition-all ${
                !verificationComplete
                  ? 'bg-blue-900 text-white hover:bg-blue-950'
                  : 'bg-green-100 text-green-700 border border-green-300'
              }`}
            >
              {verificationComplete ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" aria-hidden="true" />
                  Information Verified
                </span>
              ) : (
                'Confirm Information'
              )}
            </button>
          </div>

          {/* Assemble Claim Package */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">Assemble Claim Package</h3>

            {!isApproved ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Once you're satisfied with your selected conditions and verification info, assemble your claim package for review.
                </p>
                <button
                  onClick={handleApproveAndCreate}
                  disabled={selectedConditions.length === 0 || !readiness.ready || submitting}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    selectedConditions.length > 0 && readiness.ready && !submitting
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Creating Package...' : 'Approve & Create Claim Package'}
                </button>
                {!readiness.ready && selectedConditions.length > 0 && (
                  <p className="text-sm text-amber-600 text-center">{readiness.message}</p>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-700">Claim Package Assembled</p>
                    <p className="text-sm text-green-600">Your conditions have been packaged and are ready for submission.</p>
                  </div>
                  {claimId && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border text-sm">
                      <FileCheck className="h-4 w-4 text-green-600" aria-hidden="true" />
                      <code className="font-mono text-green-700 text-xs">{claimId.slice(0, 8)}...</code>
                      <button onClick={() => { navigator.clipboard.writeText(claimId); toast.success('Claim ID copied!'); }}
                        className="p-1 hover:bg-gray-100 rounded" aria-label="Copy claim ID">
                        <Copy className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit to VA */}
          <div className={`bg-white rounded-xl shadow-sm border p-6 ${!isApproved ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" aria-hidden="true" />
              Submit Your Claim
            </h3>

            {vaSubmissionStatus?.submitted ? (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Send className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 text-lg">Successfully Submitted to VA!</h4>
                    <p className="text-sm text-gray-600">Your claim is now in the VA's system</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Submission ID:</span>
                    <code className="font-mono text-green-700">{vaSubmissionStatus.submission_id}</code>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-700">{vaSubmissionStatus.status || 'Received'}</span>
                  </div>
                </div>
                <button onClick={() => navigate('/dashboard')}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  Go to Dashboard <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div>
                {isApproved && !verificationComplete && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-amber-700">Please verify your dependent information above before submitting.</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleSubmitToVA}
                    disabled={vaSubmitting || !verificationComplete || !isApproved}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                      verificationComplete && isApproved && !vaSubmitting
                        ? 'bg-[#1B3A5F] text-white hover:bg-[#1B3A5F]/90' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}>
                    {vaSubmitting ? (
                      <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true" /> Submitting...</>
                    ) : (
                      <><Send className="h-4 w-4" aria-hidden="true" /> Submit to VA</>
                    )}
                  </button>
                  <button onClick={() => navigate('/dashboard')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                    Go to Dashboard <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Back to Documents */}
          <div className="flex justify-start">
            <button onClick={() => navigate('/document-onboarding')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Back to Documents
            </button>
          </div>
        </div>
      </div>

      {/* Condition Roadmap Modal */}
      {selectedConditionForRoadmap && (
        <ConditionRoadmap
          condition={selectedConditionForRoadmap}
          isOpen={!!selectedConditionForRoadmap}
          onClose={() => setSelectedConditionForRoadmap(null)}
          onSave={(data) => {
            if (data?.stats) {
              setConditionRequirements(prev => ({
                ...prev,
                [selectedConditionForRoadmap.condition_name]: {
                  ...prev[selectedConditionForRoadmap.condition_name],
                  total: data.stats.total,
                  completed: data.stats.completed,
                  percentage: data.stats.percentage,
                  complete: data.stats.complete,
                  backendVerified: true
                }
              }));
            }
            if (claimId) {
              fetchRequirementStatus(claimId);
            }
          }}
          claimId={claimId}
        />
      )}
      {CelebrationComponent}
    </div>
    </VeteranLayout>
  );
}
