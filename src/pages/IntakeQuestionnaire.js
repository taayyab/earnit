import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import PageHeader from '../components/PageHeader';
import ClaimAssemblyReview from '../components/ClaimAssemblyReview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Upload,
  RefreshCw,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

const MEB_EVIDENCE_REQUIREMENTS = [
  { name: 'Physical Evaluation Board (PEB) Findings', required: true },
  { name: 'Line of Duty (LOD) Determination', required: true },
  { name: 'Fit/Unfit Finding Documentation', required: true },
  { name: 'Medical Evaluation Board Report', required: true },
  { name: 'Narrative Summary (NARSUM)', required: true },
  { name: 'Service Treatment Records', required: true },
  { name: 'VA C&P Examination Results', required: false },
  { name: 'DD-214 (if discharged)', required: false }
];

const CONFIRMATION_STEPS = [
  { id: 1, name: 'Documents', icon: FileText },
  { id: 2, name: 'Review & Confirm', icon: CheckCircle2 },
  { id: 3, name: 'Ready to Submit', icon: ArrowRight }
];

export default function IntakeQuestionnaire() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [analysisTriggered, setAnalysisTriggered] = useState(false);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [isMebClaim, setIsMebClaim] = useState(false);

  useEffect(() => {
    if (claimId) {
      loadClaimAnalysis();
    }
  }, [claimId]);

  const loadClaimAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/intake/analysis/${claimId}`);
      
      if (response.data.has_analysis) {
        setAnalysis(response.data);
        setCurrentStep(2);
        setHasDocuments(true);
        if (response.data.claim_type === 'meb_ides' || response.data.is_meb_ides) {
          setIsMebClaim(true);
        }
      } else {
        const docsResponse = await api.get(`/documents/claim/${claimId}`);
        if (docsResponse.data?.documents?.length > 0) {
          setHasDocuments(true);
          setCurrentStep(1);
        } else {
          setHasDocuments(false);
          setCurrentStep(1);
        }
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied');
        navigate('/dashboard');
      } else if (error.response?.status === 503) {
        setAiUnavailable(true);
        toast.error('AI analysis is temporarily unavailable');
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    if (analysisTriggered) return;
    
    try {
      setLoading(true);
      setAnalysisTriggered(true);
      toast.info('Analyzing your documents...');
      
      const response = await api.post('/intake/trigger-analysis', {
        claim_id: claimId
      });
      
      if (response.data.success) {
        toast.dismiss();
        toast.success(`Found ${response.data.conditions_found} conditions!`);
        await loadClaimAnalysis();
      }
    } catch (error) {
      toast.dismiss();
      if (error.response?.status === 503) {
        setAiUnavailable(true);
        toast.error('AI analysis is temporarily unavailable. Please try again later.');
      } else {
        toast.error('Analysis failed. Please try again.');
      }
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
      setAnalysisTriggered(false);
    }
  };

  const handleConfirmation = async (confirmationData) => {
    try {
      setSubmitting(true);
      
      const response = await api.post('/intake/confirmation', {
        claim_id: claimId,
        snapshot_id: analysis.snapshot_id,
        ...confirmationData
      });
      
      if (response.data.success) {
        setCurrentStep(3);
        toast.success('Claim confirmed! Ready for review.');
      } else {
        toast.error(response.data.message || 'Failed to save confirmation');
      }
    } catch (error) {
      toast.error('Failed to submit confirmation');
      console.error('Confirmation error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedToReview = () => {
    navigate('/claim-review', { state: { claimId, analysis } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader title="Claim Intake" />
        <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" aria-hidden="true" />
            <p className="text-lg text-slate-500">Loading your claim data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <PageHeader title="Claim Review & Confirmation" />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <nav aria-label="Claim progress">
            <ol className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm" role="list">
              {CONFIRMATION_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep >= step.id;
                const isComplete = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                
                return (
                  <React.Fragment key={step.id}>
                    <li className="flex items-center gap-3" aria-current={isCurrent ? 'step' : undefined}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isComplete 
                          ? 'bg-green-500 text-white' 
                          : isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-400'
                      }`} aria-hidden="true">
                        {isComplete ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <StepIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div className="hidden md:block">
                        <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                          Step {step.id}
                          <span className="sr-only">{isComplete ? ' (completed)' : isCurrent ? ' (current)' : ''}</span>
                        </p>
                        <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.name}
                        </p>
                      </div>
                    </li>
                    {index < CONFIRMATION_STEPS.length - 1 && (
                      <li role="presentation" className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </ol>
          </nav>
        </div>

        {currentStep === 1 && !hasDocuments && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <Upload className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Upload Your Documents First</CardTitle>
              <CardDescription className="text-base">
                Before we can build your claim, we need to analyze your military and medical records.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {isMebClaim ? (
                <div className="bg-indigo-50 p-6 rounded-lg text-left border border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                    <h4 className="font-medium text-indigo-900">MEB/IDES Required Documents:</h4>
                  </div>
                  <ul className="space-y-2 text-indigo-800">
                    {MEB_EVIDENCE_REQUIREMENTS.map((doc, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {doc.required ? (
                          <span className="text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded">REQUIRED</span>
                        ) : (
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">OPTIONAL</span>
                        )}
                        {doc.name}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-indigo-700">
                    These documents are critical for your IDES timeline tracking and VA rating determination.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 p-6 rounded-lg text-left">
                  <h4 className="font-medium text-blue-900 mb-3">What we'll extract automatically:</h4>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
                      Service dates, branch, and MOS from your DD-214
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
                      All diagnosed conditions from medical records
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
                      Evidence supporting service connection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
                      Presumptive condition eligibility
                    </li>
                  </ul>
                </div>
              )}
              
              <p className="text-muted-foreground">
                You'll only need to confirm the details — we do the heavy lifting!
              </p>
              
              <Button
                size="lg"
                onClick={() => navigate(`/claim/${claimId}/documents`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-5 w-5 mr-2" aria-hidden="true" />
                Upload Documents
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && hasDocuments && !analysis && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                aiUnavailable ? 'bg-red-100' : 'bg-yellow-100'
              }`} aria-hidden="true">
                {aiUnavailable ? (
                  <AlertTriangle className="h-10 w-10 text-red-600" />
                ) : (
                  <RefreshCw className="h-10 w-10 text-yellow-600" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {aiUnavailable ? 'AI Analysis Temporarily Unavailable' : 'Documents Ready for Analysis'}
              </CardTitle>
              <CardDescription className="text-base">
                {aiUnavailable 
                  ? 'Our AI analysis service is temporarily unavailable. Please try again in a few minutes.'
                  : 'We have your documents. Click below to start the AI analysis.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                size="lg"
                onClick={triggerAnalysis}
                disabled={loading || analysisTriggered}
                className={aiUnavailable ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" aria-hidden="true" />
                    {aiUnavailable ? 'Try Again' : 'Analyze My Documents'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && analysis && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center" aria-hidden="true">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Review Your Pre-Assembled Claim</h2>
                  <p className="text-muted-foreground">
                    We've extracted information from your documents. Please review and confirm the details below.
                    You only need to make changes if something is incorrect.
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-blue-900">No typing required!</p>
                  <p className="text-sm text-blue-700">
                    All information has been extracted from your documents. 
                    Simply toggle conditions on/off and select severity levels.
                  </p>
                </div>
              </div>
            </div>

            <ClaimAssemblyReview
              serviceProfile={analysis.service_profile}
              conditions={analysis.conditions}
              conditionScores={analysis.condition_scores}
              approvalReadiness={analysis.approval_readiness}
              onConfirm={handleConfirmation}
              loading={submitting}
            />
          </div>
        )}

        {currentStep === 3 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Claim Confirmed!</CardTitle>
              <CardDescription className="text-base">
                Your claim has been confirmed and is ready for final review.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {analysis?.approval_readiness && (
                <div className="bg-white p-6 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Approval Readiness Score</p>
                  <div className="flex items-center justify-center gap-4">
                    <Progress 
                      value={analysis.approval_readiness.overall_score || 0} 
                      className="h-4 w-48"
                    />
                    <span className="text-2xl font-bold text-green-600">
                      {analysis.approval_readiness.overall_score || 0}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {analysis.approval_readiness.recommendation}
                  </p>
                </div>
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentStep(2)}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Make Changes
                </Button>
                <Button
                  size="lg"
                  onClick={handleProceedToReview}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Proceed to Final Review
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
