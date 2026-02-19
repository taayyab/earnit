import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api, { orchestrationAPI } from '../lib/api';
import { useDemoMode } from '../context/DemoModeContext';
import PageHeader from '../components/PageHeader';
import JourneyProgress from '../components/JourneyProgress';
import ConditionRoadmap from '../components/conditions/ConditionRoadmap';
import ClaimForecastCard from '../components/ClaimForecastCard';
import MedicationAnalysisCard from '../components/MedicationAnalysisCard';
import RatingPredictionCard from '../components/claims/RatingPredictionCard';
import RatingDecisionBrief from '../components/RatingDecisionBrief';
import BackPayAggregationCard from '../components/BackPayAggregationCard';
import { FormPacketBuilder } from '../components/claims/FormPacketBuilder';
import { SubmissionReadinessChecklist } from '../components/claims/SubmissionReadinessChecklist';
import { useCelebration } from '../components/Celebration';
import { toast } from 'sonner';
import { ChevronRight, CheckCircle, AlertTriangle, FileText, Shield, X, Clock, Send, Users, ExternalLink, Copy, FileCheck, Calendar, ArrowRight, Phone, DollarSign, Heart, UserPlus, Award, Scale, Lock, Upload, HelpCircle, ClipboardList } from 'lucide-react';
import { ClaimStageBar } from '../components/StageNavigationIndicator';
import { useClaimStage, STAGE_LABELS, CLAIM_STAGES } from '../hooks/useClaimStage';

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
  const [rdbCompleteness, setRdbCompleteness] = useState(null);
  const [rdbReviewed, setRdbReviewed] = useState(false);
  const [nextActions, setNextActions] = useState(null);
  const [submissionReady, setSubmissionReady] = useState(false);
  const [packetReady, setPacketReady] = useState(false);

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
    }
  }, [claimId]);

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
      }
    } catch (err) {
      setDependentsLoaded(true);
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

    const readiness = getOverallReadiness();
    if (readiness.needsConfirmation) {
      const confirmed = window.confirm(readiness.confirmMessage);
      if (!confirmed) {
        return;
      }
    }

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
        setRdbReviewed(false);
        setRdbCompleteness(null);
        celebrate('milestone_reached', 'Your claim package is assembled and ready for review!');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create claim package');
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
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        showBackButton={true} 
        backTo="/document-onboarding"
        showHomeButton={true}
      />
      
      {claimId && <ClaimStageBar claimId={claimId} />}
      
      <div className="max-w-5xl mx-auto px-4 py-6">
        <JourneyProgress 
          currentStep={isApproved ? 'submit' : 'review'} 
          className="mb-6" 
        />

        {/* Header Section - Only show in review mode */}
        {!isApproved && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review & Approve Your Claim</h1>
                <p className="mt-1 text-gray-600">
                  Select conditions, complete requirements, then approve your claim package
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{selectedConditions.length}</div>
                <p className="text-sm text-gray-500">Conditions Selected</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Dismiss error">
              <X className="h-5 w-5 text-red-400" aria-hidden="true" />
            </button>
          </div>
        )}

        {!isApproved ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Conditions List */}
            <div className="lg:col-span-2 space-y-4">
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
                            ? 'border-blue-500 bg-blue-50/50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`condition-${index}`}
                            checked={isSelected}
                            onChange={() => toggleCondition(condition.condition_name)}
                            className="mt-1 h-5 w-5 min-h-[20px] min-w-[20px] text-blue-600 rounded cursor-pointer"
                            aria-describedby={`condition-desc-${index}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <label htmlFor={`condition-${index}`} className="font-medium text-gray-900 cursor-pointer">{condition.condition_name}</label>
                              {condition.is_presumptive && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
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

                            {/* Requirements Progress */}
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

              {/* Secondary Opportunities */}
              {analysis.secondary_opportunities?.length > 0 && (
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-5">
                  <h3 className="font-semibold text-purple-800 mb-3">Secondary Claim Opportunities</h3>
                  <div className="space-y-2">
                    {analysis.secondary_opportunities.map((opp, i) => (
                      <div key={i} className="p-3 bg-white rounded-lg text-sm">
                        <p className="font-medium text-purple-900">{opp.secondary_condition}</p>
                        <p className="text-purple-600 text-xs">Secondary to: {opp.primary_condition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medication Side Effects Analysis */}
              {(analysis.medication_analysis || analysis.medication_opportunities?.length > 0) && (
                <MedicationAnalysisCard
                  medicationAnalysis={analysis.medication_analysis}
                  medicationOpportunities={analysis.medication_opportunities || []}
                  onAddCondition={(conditionName) => {
                    if (!selectedConditions.includes(conditionName)) {
                      setSelectedConditions(prev => [...prev, conditionName]);
                      toast.success(`Added "${conditionName}" as a secondary condition`);
                    }
                  }}
                />
              )}

              {/* Rating Prediction Card */}
              {selectedConditions.length > 0 && claimId && (
                <RatingPredictionCard 
                  claimId={claimId}
                  conditions={analysis?.conditions?.filter(c => selectedConditions.includes(c.condition_name)) || []}
                  documents={analysis?.documents || []}
                />
              )}
            </div>

            {/* Sidebar - Summary & Actions */}
            <div className="space-y-4">
              {/* Readiness Status */}
              <div className={`rounded-xl border p-5 ${
                readiness.ready 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-3">
                  {readiness.ready ? (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" aria-hidden="true" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      readiness.ready ? 'text-green-800' : 'text-amber-800'
                    }`}>
                      {readiness.ready ? 'Ready to Submit' : 'Action Required'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      readiness.ready ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      {readiness.message}
                    </p>
                    
                    {/* Actionable fallback content when action is required */}
                    {!readiness.ready && (
                      <div className="mt-4 space-y-3">
                        {/* Quick Action Links */}
                        {selectedConditions.length === 0 && (
                          <div className="p-3 bg-white rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-800 font-medium mb-2">
                              Get started by selecting conditions:
                            </p>
                            <ul className="text-sm text-amber-700 space-y-1 mb-3">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3" />
                                Review the conditions identified from your documents above
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3" />
                                Check the boxes next to conditions you want to claim
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {/* Next Actions from API */}
                        {nextActions?.actions?.length > 0 && (
                          <div className="space-y-2">
                            {nextActions.actions.slice(0, 2).map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => navigate(action.link)}
                                className="w-full p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 text-left transition-all group"
                              >
                                <div className="flex items-start gap-3">
                                  {action.icon === 'upload' && <Upload className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                  {action.icon === 'checklist' && <ClipboardList className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                  {action.icon === 'document' && <FileText className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                  {action.icon === 'shield' && <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                  {action.icon === 'help' && <HelpCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                  {action.icon === 'clock' && <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                  {action.icon === 'clipboard' && <ClipboardList className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                  {action.icon === 'file' && <FileText className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                  {!['upload', 'checklist', 'document', 'shield', 'help', 'clock', 'clipboard', 'file'].includes(action.icon) && 
                                    <ArrowRight className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-800 group-hover:text-amber-900">
                                      {action.title}
                                    </p>
                                    <p className="text-xs text-amber-600 mt-0.5">
                                      {action.description?.slice(0, 80)}{action.description?.length > 80 ? '...' : ''}
                                    </p>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-amber-400 group-hover:text-amber-600 flex-shrink-0 mt-1" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Progress Checklist */}
                        {nextActions?.progress_checklist?.length > 0 && (
                          <div className="p-3 bg-white rounded-lg border border-amber-200">
                            <p className="text-xs font-medium text-amber-800 mb-2 uppercase tracking-wide">
                              Progress Checklist
                            </p>
                            <div className="space-y-1.5">
                              {nextActions.progress_checklist.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  {item.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-amber-400 flex-shrink-0" />
                                  )}
                                  <span className={`text-xs ${item.completed ? 'text-green-700 line-through' : 'text-amber-700'}`}>
                                    {item.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {nextActions.progress_summary && (
                              <div className="mt-2 pt-2 border-t border-amber-100">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-amber-700">
                                    {nextActions.progress_summary.completed}/{nextActions.progress_summary.total} completed
                                  </span>
                                  <span className="font-medium text-amber-800">
                                    {nextActions.progress_summary.percentage}%
                                  </span>
                                </div>
                                <div className="mt-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-amber-500 rounded-full transition-all"
                                    style={{ width: `${nextActions.progress_summary.percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Fallback Help Link */}
                        {(!nextActions || nextActions?.actions?.length === 0) && selectedConditions.length > 0 && (
                          <button
                            onClick={() => navigate('/support/faq')}
                            className="w-full p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 text-left transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <HelpCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-amber-800 group-hover:text-amber-900">
                                  Need Help?
                                </p>
                                <p className="text-xs text-amber-600 mt-0.5">
                                  View our FAQ or contact support for assistance
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-amber-400 group-hover:text-amber-600 flex-shrink-0" />
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl shadow-sm border p-5">
                <h3 className="font-semibold mb-3">Additional Notes</h3>
                <textarea
                  value={veteranNotes}
                  onChange={(e) => setVeteranNotes(e.target.value)}
                  placeholder="Add any additional context..."
                  className="w-full p-3 border rounded-lg resize-none h-24 text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-sm border p-5 space-y-3">
                <button
                  onClick={handleApproveAndCreate}
                  disabled={selectedConditions.length === 0 || !readiness.ready || submitting}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    selectedConditions.length > 0 && readiness.ready && !submitting
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Creating Package...' : 'Approve & Create Claim'}
                </button>
                
                {!readiness.ready && selectedConditions.length > 0 && (
                  <p className="text-sm text-amber-600 text-center">
                    Complete all requirements for selected conditions to enable approval
                  </p>
                )}
                
                <button
                  onClick={() => navigate('/document-onboarding')}
                  className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back to Documents
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Success State - Redesigned with benefit forecasts and verification */
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Success Header - Compact */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl" aria-hidden="true">🎉</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-green-700">Claim Package Ready!</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Your claim has been assembled. Complete the information below for accurate benefit estimates.
                  </p>
                </div>
                {claimId && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border text-sm">
                    <FileCheck className="h-4 w-4 text-green-600" aria-hidden="true" />
                    <code className="font-mono text-green-700">{claimId.slice(0, 8)}...</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(claimId);
                        toast.success('Claim ID copied!');
                      }}
                      className="p-1 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Copy claim ID"
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Verification & Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Benefit Forecast Card */}
                <ClaimForecastCard 
                  claim={{ 
                    id: claimId, 
                    created_at: new Date().toISOString(),
                    submission_type: 'original',
                    documents_count: analysis?.documents?.length || 0
                  }} 
                  conditions={selectedConditions.map(name => {
                    const condition = analysis?.conditions?.find(c => c.condition_name === name);
                    return {
                      name,
                      completion_percentage: conditionRequirements[name]?.percentage || 50,
                      ...condition
                    };
                  })}
                  refreshKey={verificationComplete ? 1 : 0}
                  verificationData={verificationComplete ? verificationData : null}
                />

                <BackPayAggregationCard
                  veteranId={analysis?.veteran_id}
                  refreshKey={verificationComplete ? 1 : 0}
                />

                {/* Verification Data Collection */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-600" aria-hidden="true" />
                    Verify Your Information
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This information helps calculate your accurate benefit entitlement. VA compensation rates vary based on dependents.
                  </p>
                  
                  <div className="space-y-4">
                    {/* Spouse */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Heart className="h-5 w-5 text-rose-500" aria-hidden="true" />
                        <div>
                          <label htmlFor="hasSpouse" className="font-medium text-gray-900">Married?</label>
                          <p className="text-xs text-gray-500">VA pays higher rates for veterans with a spouse</p>
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
                          <p className="text-xs text-gray-500">Children under 18 or in school (18-23)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setVerificationData(prev => ({ ...prev, numChildren: Math.max(0, prev.numChildren - 1) }))}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          aria-label="Decrease children"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id="numChildren"
                          min="0"
                          max="20"
                          value={verificationData.numChildren}
                          onChange={(e) => setVerificationData(prev => ({ ...prev, numChildren: Math.max(0, parseInt(e.target.value) || 0) }))}
                          className="w-16 h-10 text-center border rounded-lg"
                        />
                        <button
                          onClick={() => setVerificationData(prev => ({ ...prev, numChildren: prev.numChildren + 1 }))}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          aria-label="Increase children"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Dependent Parents */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-purple-500" aria-hidden="true" />
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
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id="numParents"
                          min="0"
                          max="2"
                          value={verificationData.numDependentParents}
                          onChange={(e) => setVerificationData(prev => ({ ...prev, numDependentParents: Math.min(2, Math.max(0, parseInt(e.target.value) || 0)) }))}
                          className="w-16 h-10 text-center border rounded-lg"
                        />
                        <button
                          onClick={() => setVerificationData(prev => ({ ...prev, numDependentParents: Math.min(2, prev.numDependentParents + 1) }))}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          aria-label="Increase parents"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* SMC Eligibility */}
                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-amber-600" aria-hidden="true" />
                        <div>
                          <label htmlFor="smcEligible" className="font-medium text-gray-900">Special Monthly Compensation (SMC)?</label>
                          <p className="text-xs text-gray-500">For severe disabilities (loss of limb, blindness, etc.)</p>
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
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
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

                {/* Rating Decision Brief - Required Review */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                      <Scale className="h-5 w-5 text-[#1B3A5F]" aria-hidden="true" />
                      Rating Decision Brief
                    </h3>
                    {rdbReviewed && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle className="h-3 w-3" aria-hidden="true" />
                        Reviewed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Review your Rating Decision Brief before submission. This document connects your evidence to VA rating criteria and helps ensure a favorable decision.
                  </p>
                  
                  <RatingDecisionBrief 
                    claimId={claimId}
                    claimNumber={claimId?.slice(0, 8)}
                    onCompletenessChange={(completeness) => {
                      setRdbCompleteness(completeness);
                    }}
                  />

                  {rdbCompleteness && !rdbReviewed && (
                    <button
                      onClick={() => {
                        setRdbReviewed(true);
                        toast.success('Rating Decision Brief reviewed!');
                      }}
                      className="w-full mt-4 py-3 rounded-lg font-medium bg-[#1B3A5F] text-white hover:bg-[#1B3A5F]/90 transition-colors"
                    >
                      Mark Brief as Reviewed
                    </button>
                  )}

                  {!rdbCompleteness && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-sm text-amber-700">Generate and review the Rating Decision Brief above before submitting your claim.</p>
                    </div>
                  )}
                </div>

                {/* Submission Status or Next Steps */}
                <SubmissionReadinessChecklist
                  claimId={claimId}
                  onReady={() => setSubmissionReady(true)}
                />

                <FormPacketBuilder
                  claimId={claimId}
                  onPacketReady={() => setPacketReady(true)}
                />

                {vaSubmissionStatus?.submitted ? (
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Send className="h-6 w-6 text-green-600" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800 text-lg">Successfully Submitted to VA!</h3>
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
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                      <Send className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      Submit Your Claim
                    </h3>
                    
                    {(!verificationComplete || !rdbReviewed) && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="text-sm text-amber-700">
                          <p className="font-medium mb-1">Complete the following before submitting:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {!verificationComplete && <li>Verify your dependent information</li>}
                            {!rdbReviewed && <li>Review your Rating Decision Brief</li>}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      {vaConfigured && (
                        <button
                          onClick={handleSubmitToVA}
                          disabled={vaSubmitting || !verificationComplete || !rdbReviewed}
                          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                            verificationComplete && rdbReviewed && !vaSubmitting
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {vaSubmitting ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" aria-hidden="true" />
                              Submit to VA
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Go to Dashboard
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Summary & Help */}
              <div className="space-y-4">
                {/* Conditions Summary */}
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Approved Conditions</h3>
                  <div className="space-y-2">
                    {selectedConditions.map((name, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                        <span className="text-gray-700">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What to Expect */}
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" aria-hidden="true" />
                      <span className="text-gray-600">Initial Review: 1-2 weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" aria-hidden="true" />
                      <span className="text-gray-600">C&P Exam: 2-4 weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                      <span className="text-gray-600">Decision: 3-6 months</span>
                    </div>
                  </div>
                </div>

                {/* Get Support */}
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Need Support?
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">Connect with a peer advocate who understands your journey.</p>
                  <button
                    onClick={() => navigate('/advocates')}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Find an Advocate
                  </button>
                </div>

                {/* Help */}
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">VA Help</p>
                      <p className="text-amber-700">
                        <a href="tel:1-800-827-1000" className="underline">1-800-827-1000</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
  );
}
