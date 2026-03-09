import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import VeteranLayout from '../components/VeteranLayout';
import { Skeleton } from '../components/ui/skeleton';
import ClaimAssemblyReview from '../components/ClaimAssemblyReview';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  CheckCircle2,
  ArrowRight,
  Upload,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Shield,
  FileText,
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

const STEPS = [
  { id: 1, label: 'Documents' },
  { id: 2, label: 'Review & Confirm' },
  { id: 3, label: 'Ready to Submit' },
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
    if (claimId) loadClaimAnalysis();
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
        setHasDocuments((docsResponse.data?.documents?.length || 0) > 0);
        setCurrentStep(1);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied');
        navigate('/dashboard');
      } else if (error.response?.status === 503) {
        setAiUnavailable(true);
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
      toast.info('Running AI analysis on your documents…');
      const response = await api.post('/intake/trigger-analysis', { claim_id: claimId });
      if (response.data.success) {
        toast.dismiss();
        toast.success(`Found ${response.data.conditions_found} conditions!`);
        await loadClaimAnalysis();
      }
    } catch (error) {
      toast.dismiss();
      if (error.response?.status === 503) {
        setAiUnavailable(true);
        toast.error('AI analysis temporarily unavailable. Try again shortly.');
      } else {
        toast.error('Analysis failed. Please try again.');
      }
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
    } catch {
      toast.error('Failed to submit confirmation');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <VeteranLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6" role="status" aria-live="polite">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </VeteranLayout>
    );
  }

  // ── Progress bar ───────────────────────────────────────────────────────────
  const StepBar = () => (
    <nav aria-label="Claim intake progress" className="mb-8">
      <ol className="flex items-center gap-0" role="list">
        {STEPS.map((step, idx) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          return (
            <React.Fragment key={step.id}>
              <li className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  done ? 'bg-green-500 text-white' : active ? 'bg-[#1B3A5F] text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${active ? 'text-slate-900' : done ? 'text-green-700' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </li>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded-full ${done ? 'bg-green-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );

  // ── Step 1: No documents yet ───────────────────────────────────────────────
  if (currentStep === 1 && !hasDocuments) {
    return (
      <VeteranLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <StepBar />
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1B3A5F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-[#1B3A5F]" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Upload Your Documents First</h1>
            <p className="text-slate-500">Our AI will read your records and build your claim automatically.</p>
          </div>

          {isMebClaim ? (
            <Card className="mb-6 border-blue-200">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-[#1B3A5F]" />
                  <span className="font-semibold text-[#1B3A5F] text-sm">MEB/IDES Required Documents</span>
                </div>
                <div className="space-y-2">
                  {MEB_EVIDENCE_REQUIREMENTS.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge className={doc.required ? 'bg-red-100 text-red-700 text-xs' : 'bg-slate-100 text-slate-500 text-xs'}>
                        {doc.required ? 'Required' : 'Optional'}
                      </Badge>
                      <span className="text-slate-700">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 border-blue-100 bg-blue-50/50">
              <CardContent className="pt-5">
                <p className="text-sm font-semibold text-slate-700 mb-3">What AI will extract automatically:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    'Service dates, branch & MOS from DD-214',
                    'All diagnosed conditions from medical records',
                    'Evidence supporting service connection',
                    'Presumptive condition eligibility',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            size="lg"
            onClick={() => navigate(`/claim/${claimId}/documents`)}
            className="w-full bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white h-12"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Documents
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </VeteranLayout>
    );
  }

  // ── Step 1: Documents uploaded, trigger analysis ───────────────────────────
  if (currentStep === 1 && hasDocuments && !analysis) {
    return (
      <VeteranLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <StepBar />
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              aiUnavailable ? 'bg-red-50' : 'bg-amber-50'
            }`}>
              {aiUnavailable
                ? <AlertTriangle className="w-8 h-8 text-red-500" />
                : <Sparkles className="w-8 h-8 text-amber-500" />
              }
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {aiUnavailable ? 'AI Temporarily Unavailable' : 'Ready to Analyze'}
            </h1>
            <p className="text-slate-500 max-w-md mx-auto">
              {aiUnavailable
                ? 'Our AI service is temporarily unavailable. Please try again in a few minutes.'
                : 'Your documents are uploaded. Run AI analysis to identify your conditions and build your claim.'
              }
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/claim/${claimId}/documents`)}
              className="flex-1 h-12 border-slate-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              Add More Documents
            </Button>
            <Button
              size="lg"
              onClick={triggerAnalysis}
              disabled={loading || analysisTriggered || aiUnavailable}
              className="flex-1 h-12 bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white"
            >
              {loading || analysisTriggered ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Analyzing…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Run AI Analysis<ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </div>
      </VeteranLayout>
    );
  }

  // ── Step 2: Review & Confirm ───────────────────────────────────────────────
  if (currentStep === 2 && analysis) {
    const score = analysis.approval_readiness?.overall_score || 0;
    return (
      <VeteranLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <StepBar />

          {/* Approval score banner */}
          <div className={`mb-6 rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 ${
            score >= 80 ? 'bg-green-50 border-green-200' : score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                score >= 80 ? 'bg-green-100' : score >= 50 ? 'bg-amber-100' : 'bg-slate-100'
              }`}>
                <Shield className={`w-5 h-5 ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-slate-500'}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">Approval Readiness</p>
                <p className="text-xs text-slate-500">{analysis.approval_readiness?.recommendation || 'Complete the review below.'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-32 hidden sm:block">
                <Progress value={score} className="h-2" />
              </div>
              <span className={`text-2xl font-bold ${
                score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-slate-600'
              }`}>{score}%</span>
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
      </VeteranLayout>
    );
  }

  // ── Step 3: Confirmed ──────────────────────────────────────────────────────
  if (currentStep === 3) {
    const score = analysis?.approval_readiness?.overall_score || 0;
    return (
      <VeteranLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <StepBar />
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Claim Confirmed!</h1>
            <p className="text-slate-500 mb-8">Your claim has been confirmed and is ready for final review.</p>

            {score > 0 && (
              <div className="mb-8 bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Approval Readiness Score</p>
                <div className="flex items-center justify-center gap-4">
                  <Progress value={score} className="h-3 w-48" />
                  <span className="text-2xl font-bold text-green-600">{score}%</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(2)}
                className="flex-1 h-12 border-slate-300"
              >
                Make Changes
              </Button>
              <Button
                size="lg"
                onClick={() => navigate(`/claim/${claimId}`)}
                className="flex-1 h-12 bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white"
              >
                View Full Claim
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </VeteranLayout>
    );
  }

  return null;
}
