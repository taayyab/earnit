import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimsAPI, documentsAPI, aiAPI, agentAPI, orchestrationAPI } from '../lib/api';
import api from '../lib/api';
import { useAuth } from '../lib/auth-context';
import PageHeader from '../components/PageHeader';
import HelpTooltip from '../components/HelpTooltip';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import {
  FileText,
  Upload,
  ClipboardList,
  Brain,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Users,
  Calendar,
  Shield,
  Sparkles,
  FileCheck,
  Heart,
  Gavel,
  XCircle,
  Lock
} from 'lucide-react';
import QADashboard from '../components/QADashboard';
import VeteranJourneyTracker from '../components/VeteranJourneyTracker';
import { EvidenceChecklist } from '../components/conditions';
import SecondaryConditionPanel from '../components/conditions/SecondaryConditionPanel';
import RatingDecisionBrief from '../components/RatingDecisionBrief';
import { ClientOnboardingPanel } from '../components/claims/ClientOnboardingPanel';
import { TeamAssignmentCard } from '../components/claims/TeamAssignmentPanel';
import { AgentMeetingCard } from '../components/claims/AgentMeetingScheduler';
import LetterTemplatePanel from '../components/claims/LetterTemplatePanel';
import RatingPredictionCard from '../components/claims/RatingPredictionCard';
import SSDIEligibilityCard from '../components/SSDIEligibilityCard';
import { toast } from 'sonner';
import { ClaimStageBar } from '../components/StageNavigationIndicator';
import { useClaimStage, STAGE_LABELS } from '../hooks/useClaimStage';
import PriorityProcessingCard, { PriorityProcessingBadge } from '../components/PriorityProcessingCard';
import DocumentConditionMatcher from '../components/DocumentConditionMatcher';
import MEBDashboard from '../components/claims/MEBDashboard';
import { POAIntakeDialog } from '../components/claims/POAIntakeWizard';
import { AdvocateRatingModal } from '../components/RatingModal';

export default function ClaimDetail() {
  const { id: claimId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [advocate, setAdvocate] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAiResults, setShowAiResults] = useState(false);
  const [claimContext, setClaimContext] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [conditionData, setConditionData] = useState({ conditions: [], selectedCondition: null, requirements: [] });
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [claimAggregate, setClaimAggregate] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState(null);
  
  const isAgent = user?.role === 'claims_agent';
  const { currentStage, isQAPassed, isRDBApproved, completionPercentage } = useClaimStage(claimId);

  useEffect(() => {
    // Wait for auth state to be resolved before loading claim data
    if (user !== undefined) {
      loadClaimData();
    }
  }, [claimId, user?.role]);

  const loadClaimData = async () => {
    try {
      setLoading(true);
      
      // Use agent endpoint for claims agents, veteran endpoint for veterans
      const useAgentEndpoint = user?.role === 'claims_agent';
      const claimPromise = useAgentEndpoint 
        ? agentAPI.getClaim(claimId) 
        : claimsAPI.get(claimId);
      
      const [claimRes, docsRes, advocateRes, contextRes, conditionsRes, aggregateRes] = await Promise.all([
        claimPromise,
        documentsAPI.list(claimId),
        api.get('/advocates/my-advocate').catch(() => ({ data: { has_advocate: false } })),
        api.get(`/veteran/claim/${claimId}/context`).catch(() => ({ data: null })),
        api.get(`/conditions/claim/${claimId}`).catch(() => ({ data: { success: false, conditions: [] } })),
        orchestrationAPI.getAggregate(claimId).catch(() => ({ data: null }))
      ]);
      
      setClaim(claimRes.data);
      setDocuments(docsRes.data.documents || []);
      
      if (aggregateRes.data) {
        setClaimAggregate(aggregateRes.data);
      }
      
      if (advocateRes.data.has_advocate) {
        setAdvocate(advocateRes.data.advocate);
      }
      
      if (contextRes.data?.success) {
        setClaimContext(contextRes.data);
      }
      
      if (conditionsRes.data?.success && conditionsRes.data?.conditions?.length > 0) {
        const conditions = conditionsRes.data.conditions;
        const firstCondition = conditions[0];
        setConditionData({
          conditions: conditions,
          selectedCondition: firstCondition,
          requirements: firstCondition.requirements || []
        });
      }
    } catch (err) {
      console.error('Failed to load claim:', err);
      toast.error('Failed to load claim details');
    } finally {
      setLoading(false);
      setDataRefreshKey(prev => prev + 1);
    }
  };

  const runAIAnalysis = async () => {
    if (!claim?.conditions || claim.conditions.length === 0) {
      toast.error('Please complete the intake questionnaire first to add conditions');
      return;
    }

    setAnalyzing(true);
    setShowAiResults(false);

    try {
      // Call new AI analysis endpoint
      const response = await api.post('/ai/analyze-claim', {
        claim_id: claimId
      });

      setAiAnalysis(response.data.analysis);
      setShowAiResults(true);
      toast.success('AI analysis completed! 🧠');
      
      // Reload claim to get updated analysis
      await loadClaimData();
    } catch (err) {
      console.error('AI analysis failed:', err);
      toast.error('AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getClaimProgress = () => {
    let progress = 0;
    let steps = [];
    
    // Step 1: Intake completed
    if (claim?.intake_data || claim?.conditions?.length > 0) {
      progress += 25;
      steps.push({ name: 'Intake Questionnaire', complete: true });
    } else {
      steps.push({ name: 'Intake Questionnaire', complete: false });
    }
    
    // Step 2: Documents uploaded
    if (documents.length > 0) {
      progress += 25;
      steps.push({ name: 'Upload Documents', complete: true });
    } else {
      steps.push({ name: 'Upload Documents', complete: false });
    }
    
    // Step 3: Form completed
    if (claim?.form_completed) {
      progress += 25;
      steps.push({ name: 'Complete VA Form', complete: true });
    } else {
      steps.push({ name: 'Complete VA Form', complete: false });
    }
    
    // Step 4: Submitted
    if (claim?.status === 'submitted' || claim?.status === 'approved') {
      progress += 25;
      steps.push({ name: 'Submit to VA', complete: true });
    } else {
      steps.push({ name: 'Submit to VA', complete: false });
    }
    
    return { progress, steps };
  };

  const { progress, steps } = getClaimProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-[#D4A574] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading your claim...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader title="Claim Not Found" backTo="/dashboard" />
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Claim Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find this claim. It may have been deleted.</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-[hsl(var(--primary))]">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title={`Claim #${claim.claim_id?.slice(-8)}`}
        subtitle={`Created ${new Date(claim.created_at).toLocaleDateString()}`}
        backTo="/dashboard"
        rightContent={<PriorityProcessingBadge claimId={claimId} />}
      />
      
      <ClaimStageBar claimId={claimId} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'overview' 
                ? 'border-[#D4A574] text-[#D4A574]' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'qa' 
                ? 'border-[#D4A574] text-[#D4A574]' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Quality Check
              {claimContext?.qa?.has_report && (
                <Badge className={claimContext?.qa?.ready_for_submission ? 'bg-green-500' : 'bg-yellow-500'}>
                  {claimContext?.qa?.overall_score}%
                </Badge>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'evidence' 
                ? 'border-[#D4A574] text-[#D4A574]' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Evidence Tracking
              {conditionData.conditions.length > 0 && (
                <Badge className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                  {conditionData.conditions.length}
                </Badge>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('letters')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'letters' 
                ? 'border-[#D4A574] text-[#D4A574]' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Letters
            </div>
          </button>
          <button
            onClick={() => navigate('/services')}
            className="px-4 py-2 font-medium text-sm border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Support Services
            </div>
          </button>
        </div>

        {activeTab === 'letters' ? (
          <div className="space-y-6">
            <LetterTemplatePanel claimId={claimId} />
          </div>
        ) : activeTab === 'qa' ? (
          <div className="space-y-6">
            <QADashboard claimId={claimId} onRefresh={loadClaimData} />
            
            {/* Journey Tracker */}
            {claimContext?.journey && (
              <VeteranJourneyTracker
                claimId={claimId}
                claimStatus={claim.status}
                hasIntake={claimContext.journey.has_intake}
                hasDocuments={claimContext.journey.has_documents}
                hasQACheck={claimContext.journey.has_qa_check}
                qaScore={claimContext.qa?.overall_score}
                hasMentor={claimContext.journey.has_mentor}
                mentorName={claimContext.mentor?.name}
                hasWraparoundAssessment={claimContext.journey.has_wraparound_assessment}
                wraparoundUrgency={claimContext.wraparound?.urgency_level}
                isSubmitted={claimContext.journey.is_submitted}
              />
            )}
          </div>
        ) : activeTab === 'evidence' ? (
          <div className="space-y-6">
            {conditionData.conditions.length > 0 ? (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card className="border-neutral-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
                        Your Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {conditionData.conditions.map((condition) => (
                        <div
                          key={condition.id}
                          onClick={() => {
                            setConditionData(prev => ({
                              ...prev,
                              selectedCondition: condition,
                              requirements: condition.requirements || []
                            }));
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            conditionData.selectedCondition?.id === condition.id
                              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-neutral-900 text-sm">
                              {condition.name || condition.condition_name}
                            </h4>
                            {condition.is_presumptive && (
                              <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Presumptive
                              </Badge>
                            )}
                          </div>
                          {condition.progress !== undefined && (
                            <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[hsl(var(--primary))] transition-all"
                                style={{ width: `${condition.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-2">
                  {conditionData.selectedCondition ? (
                    <>
                      <EvidenceChecklist
                        condition={conditionData.selectedCondition}
                        requirements={conditionData.requirements}
                        onUpdateStatus={async (evidenceId, newStatus) => {
                          try {
                            await api.put(`/conditions/evidence/${evidenceId}/status`, { status: newStatus });
                            toast.success('Evidence status updated');
                            loadClaimData();
                          } catch (err) {
                            toast.error('Failed to update evidence status');
                          }
                        }}
                        onScheduleAction={async (requirementId, actionType) => {
                          try {
                            await api.post(`/conditions/condition/${conditionData.selectedCondition.id}/action`, {
                              action_type: actionType,
                              title: `Scheduled ${actionType.replace('_', ' ')}`
                            });
                            toast.success('Action scheduled');
                          } catch (err) {
                            toast.error('Failed to schedule action');
                          }
                        }}
                      />
                      <SecondaryConditionPanel
                        condition={conditionData.selectedCondition}
                        claimId={claimId}
                        onSecondaryAdded={(newCondition) => {
                          toast.success(`Secondary condition "${newCondition.name}" added to your claim`);
                          loadClaimData();
                        }}
                      />
                    </>
                  ) : (
                    <Card className="border-neutral-200">
                      <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-700 mb-2">Select a Condition</h3>
                        <p className="text-neutral-500">Choose a condition from the list to view its evidence requirements</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card className="border-neutral-200">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-700 mb-2">No Conditions Yet</h3>
                  <p className="text-neutral-500 mb-4">Upload your documents to identify conditions and track evidence requirements</p>
                  <Button onClick={() => navigate('/document-onboarding')}>
                    Upload Documents
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
        <>
        {/* Progress Overview */}
        {(claim?.claim_type === 'meb_ides' || claim?.submission_type === 'meb_ides') && (
          <div className="mb-6">
            <MEBDashboard claimId={claimId} />
          </div>
        )}

        <Card className="mb-6 bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Claim Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Complete all steps to submit your claim
                  <HelpTooltip content="Follow these steps in order to complete your claim. Each step helps build a stronger case for your benefits." />
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#D4A574]">{progress}%</div>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={progress} className="h-3 mb-4" />
            <div className="grid md:grid-cols-4 gap-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  {step.complete ? (
                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${step.complete ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* What's Next Card */}
            <Card className="border-l-4 border-l-[#D4A574]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-[#D4A574]" />
                  What's Next
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!claim.intake_data && !claim.conditions?.length && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <ClipboardList className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Complete Your Intake Questionnaire</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            This helps us understand your service history and the conditions you're claiming. It takes about 10-15 minutes.
                          </p>
                          <Button
                            onClick={() => navigate(`/claim/${claimId}/intake`)}
                            className="bg-blue-600 hover:bg-blue-700"
                            data-testid="start-intake-button"
                          >
                            Start Intake Questionnaire
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {claim.intake_data && documents.length === 0 && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-start gap-3">
                        <Upload className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Upload Your Supporting Documents</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Upload medical records, service records, and any evidence that supports your claim.
                          </p>
                          <Button
                            onClick={() => navigate(`/claim/${claimId}/documents`)}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid="upload-docs-button"
                          >
                            Upload Documents
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {claim.intake_data && documents.length > 0 && !claim.form_completed && (
                    <div className="p-4 rounded-lg bg-[#E8C9A1]/20 border border-[#D4A574]/30">
                      <div className="flex items-start gap-3">
                        <FileText className="h-6 w-6 text-[#D4A574] flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Complete Your VA Form 21-526EZ</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            We've auto-filled the form with your information. Review and complete any missing details.
                          </p>
                          <Button
                            onClick={() => navigate(`/form/${claimId}`)}
                            className="bg-gradient-to-r from-[#D4A574] to-[#C97B63] hover:from-[#B8895E] hover:to-[#A85F4A] text-white"
                            data-testid="open-form-button"
                          >
                            Open Form Editor
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {claim.form_completed && claim.status === 'draft' && (
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <Send className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Ready to Submit!</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Your claim is complete and ready for submission. Run a final QA check and submit to the VA.
                          </p>
                          <Button
                            onClick={() => navigate(`/form/${claimId}`)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Review & Submit
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {claim.status === 'denied' && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1 text-red-800">Claim Denied - You Have Options</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Don't give up! Many claims are approved on appeal. Our AI-powered appeal wizard will help you understand the denial reasons and build a stronger case.
                          </p>
                          <Button
                            onClick={() => navigate(`/appeal-wizard/${claimId}`)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Gavel className="h-4 w-4 mr-2" />
                            Start Appeal Process
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {(claim.status === 'submitted' || claim.status === 'approved' || claim.status === 'in_review') && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-start gap-3">
                        <Gavel className="h-6 w-6 text-slate-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Need to File an Appeal?</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            If you've received a decision you disagree with, or want to increase your rating, start the appeal process here.
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/appeal-wizard/${claimId}`)}
                          >
                            <Gavel className="h-4 w-4 mr-2" />
                            Start Appeal Wizard
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SSDI Eligibility Card - Show for approved claims with high ratings */}
                  {claim.status === 'approved' && (
                    <SSDIEligibilityCard 
                      claimId={claimId}
                      claimStatus={claim.status}
                      vaRating={claim.combined_rating || claim.rating || 0}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conditions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
                  Claimed Conditions
                  <HelpTooltip content="These are the medical conditions you're claiming for VA disability benefits. Each condition will be evaluated for service connection." />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {claim.conditions && claim.conditions.length > 0 ? (
                  <div className="space-y-3">
                    {claim.conditions.map((condition, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-gradient-to-br from-[#F5F1E8] to-white border border-[#D4A574]/20 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-foreground mb-1">
                              {typeof condition === 'string' ? condition : condition.name}
                            </h4>
                            {condition.description && (
                              <p className="text-sm text-muted-foreground mb-2">{condition.description}</p>
                            )}
                            {condition.code && (
                              <Badge variant="outline" className="text-xs">
                                VA Code: {condition.code}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground mb-4">No conditions added yet</p>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/claim/${claimId}/intake`)}
                    >
                      Add Conditions via Intake
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-[#8B9D83]" />
                  Supporting Documents ({documents.length})
                  <HelpTooltip content="Upload medical records, service records, and any other evidence that supports your claim. More evidence means a stronger case." />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id}>
                        <div
                          className="p-3 rounded-lg border border-border flex items-center justify-between hover:bg-white transition-colors cursor-pointer"
                          onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-[#8B9D83]" />
                            <div>
                              <p className="font-medium text-sm">{doc.filename}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.category} • {(doc.file_size / 1024).toFixed(1)} KB
                                {doc.phi_detected && <span className="text-[hsl(var(--accent))] ml-2">🔒 PHI</span>}
                              </p>
                            </div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                        </div>
                        {expandedDocId === doc.id && (
                          <div className="mt-2 ml-4">
                            <DocumentConditionMatcher
                              documentId={doc.id}
                              claimId={claimId}
                              filename={doc.filename}
                              onMatchingComplete={loadClaimData}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/claim/${claimId}/documents`)}
                      className="w-full mt-3"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload More Documents
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                    <Button
                      onClick={() => navigate(`/claim/${claimId}/documents`)}
                      className="bg-[#8B9D83] hover:bg-[#6B7D63] text-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis Results */}
            {(showAiResults && aiAnalysis) && (
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Claims Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Evidence Strength</span>
                        <span className="text-3xl font-bold text-[#D4A574]">
                          {aiAnalysis.overall_score}%
                        </span>
                      </div>
                      <Progress value={aiAnalysis.overall_score} className="h-3 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Based on {aiAnalysis.condition_analyses?.length || 0} conditions analyzed
                      </p>
                    </div>

                    {/* Condition Analysis */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Condition Mapping Results</h4>
                      <div className="space-y-3">
                        {aiAnalysis.condition_analyses?.map((analysis, i) => (
                          <div key={i} className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold">{analysis.condition_input}</p>
                                  <Badge className="bg-purple-600 text-white">
                                    Code {analysis.va_code}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(analysis.confidence * 100)}% match
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{analysis.va_name}</p>
                              </div>
                            </div>
                            <div className="mt-3 p-3 bg-white rounded border border-purple-100">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-purple-900">Evidence Score:</span>
                                <span className="text-sm font-bold text-purple-600">{analysis.evidence_score}%</span>
                              </div>
                              {analysis.missing_evidence && analysis.missing_evidence.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-semibold text-orange-900 mb-1">Missing Evidence:</p>
                                  <ul className="text-xs text-orange-700 space-y-1">
                                    {analysis.missing_evidence.slice(0, 3).map((item, j) => (
                                      <li key={j} className="flex items-start gap-1">
                                        <span>•</span>
                                        <span>{typeof item === 'string' ? item : item.type}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {analysis.secondary_suggestions && analysis.secondary_suggestions.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-purple-100">
                                  <p className="text-xs font-semibold text-blue-900 mb-1">💡 Consider Also Claiming:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {analysis.secondary_suggestions.slice(0, 3).map((sec, k) => (
                                      <Badge key={k} variant="outline" className="text-xs bg-blue-50">
                                        {sec}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Condition Suggestions */}
                    {aiAnalysis.secondary_condition_suggestions && aiAnalysis.secondary_condition_suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#D4A574]" />
                          AI-Identified Secondary Conditions ({aiAnalysis.secondary_condition_suggestions.length})
                        </h4>
                        <div className="space-y-2">
                          {aiAnalysis.secondary_condition_suggestions.slice(0, 5).map((suggestion, i) => (
                            <div key={i} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                              <p className="text-sm font-medium text-blue-900">
                                {suggestion.secondary} <span className="text-xs text-blue-600">(secondary to {suggestion.primary})</span>
                              </p>
                              <p className="text-xs text-blue-700 mt-1">{suggestion.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">AI Recommendations</h4>
                        <div className="space-y-2">
                          {aiAnalysis.recommendations.map((rec, i) => (
                            <div key={i} className="text-sm p-2 rounded bg-white border border-slate-200">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Original AI Analysis (if exists) */}
            {claim.ai_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Evidence Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Evidence Strength Score</span>
                        <span className="text-2xl font-bold text-[#D4A574]">
                          {claim.ai_analysis.overall_score || 0}/100
                        </span>
                      </div>
                      <Progress value={claim.ai_analysis.overall_score || 0} className="h-2" />
                    </div>
                    {claim.ai_analysis.gaps && claim.ai_analysis.gaps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Recommended Actions</h4>
                        <div className="space-y-2">
                          {claim.ai_analysis.gaps.slice(0, 3).map((gap, i) => (
                            <div key={i} className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                              <p className="font-medium text-blue-900">{gap.description}</p>
                              {gap.remediation && (
                                <p className="text-blue-700 text-xs mt-1">💡 {gap.remediation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rating Prediction Card - Show after AI analysis is complete */}
            {(showAiResults || claim.ai_analysis) && claim.conditions?.length > 0 && (
              <RatingPredictionCard 
                claimId={claimId}
                conditions={claim.conditions}
                documents={documents}
                onRefresh={loadClaimData}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Priority Processing Card */}
            <PriorityProcessingCard 
              claimId={claimId} 
              veteranId={user?.id}
              showRequestButton={true}
            />
            
            {/* Team Assignment for Agents */}
            {isAgent && (
              <TeamAssignmentCard
                claimId={claimId}
                currentAgentId={claim?.assigned_agent_id}
                onAssignmentChange={() => loadClaimData()}
              />
            )}
            
            {/* Client Onboarding for Agents */}
            {isAgent && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Client Onboarding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClientOnboardingPanel 
                    claimId={claimId} 
                    veteranName={claim?.veteran?.name}
                    conditions={claim?.conditions}
                    claimType={claim?.claim_type || claim?.submission_type}
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Client Meetings for Agents */}
            {isAgent && (
              <AgentMeetingCard
                claimId={claimId}
                veteranName={claim?.veteran?.name}
              />
            )}
            
            {/* Rating Decision Brief */}
            <RatingDecisionBrief claimId={claimId} claimNumber={claim?.claim_number} refreshKey={dataRefreshKey} />
            
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Claim Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current Status</p>
                    <Badge
                      className={`${
                        claim.status === 'approved' ? 'bg-[hsl(var(--success))]' :
                        claim.status === 'submitted' ? 'bg-[#8B9D83]' :
                        claim.status === 'in_review' ? 'bg-blue-500' :
                        claim.status === 'denied' ? 'bg-[hsl(var(--destructive))]' :
                        'bg-neutral-400'
                      } text-white text-sm px-3 py-1`}
                    >
                      {claim.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Claim Type</p>
                    <p className="font-medium">{claim.submission_type || 'Initial'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Conditions</p>
                    <p className="font-medium">{claim.conditions?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Documents</p>
                    <p className="font-medium">{documents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advocate Card */}
            {advocate && (
              <Card className="bg-gradient-to-br from-[#E8C9A1]/10 to-[#B5C4AE]/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#C97B63]" />
                    Your Advocate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C97B63] flex items-center justify-center text-white font-bold text-lg">
                      {advocate.first_name?.[0]}{advocate.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{advocate.first_name} {advocate.last_name}</p>
                      <p className="text-xs text-muted-foreground">{advocate.rank}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/messages')}
                    className="w-full"
                  >
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRatingModal(true)}
                    className="w-full mt-2"
                  >
                    Rate Your Advocate
                  </Button>
                </CardContent>
              </Card>
            )}

            {showRatingModal && advocate && (
              <AdvocateRatingModal
                advocateId={advocate.id}
                advocateName={`${advocate.first_name} ${advocate.last_name}`}
                onClose={() => setShowRatingModal(false)}
                onSubmitted={() => setShowRatingModal(false)}
              />
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/claim/${claimId}/intake`)}
                  className="w-full justify-start"
                  data-testid="nav-intake-button"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Intake Questionnaire
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/claim/${claimId}/documents`)}
                  className="w-full justify-start"
                  data-testid="nav-documents-button"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/form/${claimId}`)}
                  className="w-full justify-start"
                  data-testid="nav-form-button"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  VA Form Editor
                </Button>
                {documents.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={runAIAnalysis}
                    disabled={analyzing}
                    className="w-full justify-start"
                    data-testid="run-ai-button"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
                  </Button>
                )}
                <POAIntakeDialog
                  claimId={claimId}
                  claimType={claim?.claim_type || claim?.submission_type}
                  veteranName={claim?.veteran?.name || ''}
                  trigger={
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      POA & Agreement Intake
                    </Button>
                  }
                  onComplete={loadClaimData}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
