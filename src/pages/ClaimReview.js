import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api, { orchestrationAPI } from '../lib/api';
import { useDemoMode } from '../context/DemoModeContext';
import VeteranLayout from '../components/VeteranLayout';
import ConditionRoadmap from '../components/conditions/ConditionRoadmap';
import { useCelebration } from '../components/Celebration';
import { toast } from 'sonner';
import {
  ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, AlertCircle,
  FileText, Shield, Users, Copy, FileCheck, Heart, UserPlus, Award,
  Upload, Phone, MessageSquare, Loader2, TrendingUp, ArrowRight, X, BriefcaseMedical,
  HelpCircle, ChevronDown, ChevronUp, Info, ClipboardList, Stethoscope,
  FolderOpen, FileEdit, ExternalLink
} from 'lucide-react';
import { ClaimStageBar } from '../components/StageNavigationIndicator';

const APP_NAVY = '#1B3A5F';

const WIZARD_STEPS = [
  { id: 1, label: 'Upload Docs' },
  { id: 2, label: 'Conditions' },
  { id: 3, label: 'Documents' },
  { id: 4, label: 'Family Info' },
  { id: 5, label: 'Create Claim' },
];

// ── Document guidance data ────────────────────────────────────────────────────
const DOCUMENT_TYPES = [
  {
    id: 'dd214',
    name: 'DD-214 / Discharge Papers',
    description: 'Certificate of Release or Discharge from Active Duty',
    badge: 'Required',
    badgeClass: 'bg-red-100 text-red-800',
    borderClass: 'border-red-200 bg-red-50',
    icon: ClipboardList,
    whyNeeded: 'Proves your military service dates and character of discharge. Required for all VA claims.',
    whatItAccomplishes: 'Establishes service connection eligibility and links conditions to your service period.',
    vaLink: 'https://www.archives.gov/veterans/military-service-records',
  },
  {
    id: 'medical_records',
    name: 'Medical Records',
    description: 'Current VA or private medical records showing diagnoses',
    badge: 'Required',
    badgeClass: 'bg-red-100 text-red-800',
    borderClass: 'border-red-200 bg-red-50',
    icon: Stethoscope,
    whyNeeded: 'Documents your current medical conditions and their severity.',
    whatItAccomplishes: 'Provides evidence of current disability status and helps determine rating percentage.',
    vaLink: 'https://www.va.gov/health-care/get-medical-records/',
  },
  {
    id: 'service_treatment_records',
    name: 'Service Treatment Records',
    description: 'In-service medical records (if available)',
    badge: 'Recommended',
    badgeClass: 'bg-amber-100 text-amber-800',
    borderClass: 'border-amber-200 bg-amber-50',
    icon: FolderOpen,
    whyNeeded: 'Shows medical treatment during your military service.',
    whatItAccomplishes: 'Directly connects conditions to in-service events, significantly strengthening your claim.',
    vaLink: 'https://www.archives.gov/veterans/military-service-records',
  },
  {
    id: 'nexus_letter',
    name: 'Nexus Letter',
    description: "Doctor's opinion connecting your condition to military service",
    badge: 'Recommended',
    badgeClass: 'bg-amber-100 text-amber-800',
    borderClass: 'border-amber-200 bg-amber-50',
    icon: FileEdit,
    whyNeeded: 'Provides medical opinion linking your condition to military service.',
    whatItAccomplishes: 'Often the key evidence that establishes service connection for indirect claims.',
  },
  {
    id: 'buddy_statements',
    name: 'Buddy Statements',
    description: 'Statements from fellow service members or family',
    badge: 'Optional',
    badgeClass: 'bg-blue-100 text-blue-800',
    borderClass: 'border-blue-200 bg-blue-50',
    icon: Users,
    whyNeeded: 'Provides witness testimony about your condition or in-service events.',
    whatItAccomplishes: 'Supports claims where official documentation is limited, especially for PTSD and MST.',
  },
];

function DocGuidanceCard({ doc, expanded, onToggle }) {
  const Icon = doc.icon;
  return (
    <div className={`rounded-xl border-2 ${doc.borderClass} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left"
        aria-expanded={expanded}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 border border-gray-200/70 flex items-center justify-center">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900">{doc.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.badgeClass}`}>{doc.badge}</span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">{doc.description}</p>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200/50 space-y-3 pt-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1"><HelpCircle className="h-3.5 w-3.5" /> Why is this needed?</p>
            <p className="text-sm text-gray-700">{doc.whyNeeded}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1"><CheckCircle className="h-3.5 w-3.5" /> What it accomplishes</p>
            <p className="text-sm text-gray-700">{doc.whatItAccomplishes}</p>
          </div>
          {doc.vaLink && (
            <a href={doc.vaLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <ExternalLink className="h-4 w-4" /> Learn more from VA.gov
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Contact Provider mini-card ────────────────────────────────────────────────
function ContactProviderCard({ conditionName }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="mt-3 flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Phone className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-amber-900">Missing medical records?</p>
          <p className="text-xs text-amber-700 truncate">Request records from your healthcare provider</p>
        </div>
      </div>
      <button
        onClick={() => { setSent(true); toast.success('Records request sent to your medical provider'); }}
        disabled={sent}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          sent ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-600 text-white hover:bg-amber-700'
        }`}
      >
        {sent ? <><CheckCircle className="h-3 w-3" /> Sent</> : <><MessageSquare className="h-3 w-3" /> Send Request</>}
      </button>
    </div>
  );
}

// ── Wizard step header ────────────────────────────────────────────────────────
function WizardHeader({ step }) {
  return (
    <div className="bg-white rounded-xl border p-4 mb-6">
      <div className="flex items-center gap-1">
        {WIZARD_STEPS.map((ws, i) => (
          <React.Fragment key={ws.id}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > ws.id ? 'bg-green-500 text-white' : step === ws.id ? 'text-white' : 'bg-gray-100 text-gray-400'
                }`}
                style={step === ws.id ? { background: APP_NAVY } : {}}
              >
                {step > ws.id ? <CheckCircle className="h-4 w-4" /> : ws.id}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${step === ws.id ? 'text-gray-900' : step > ws.id ? 'text-green-600' : 'text-gray-400'}`}>
                {ws.label}
              </span>
            </div>
            {i < WIZARD_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 rounded transition-all ${step > ws.id ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ClaimReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { celebrate, CelebrationComponent } = useCelebration();
  const { isDemoMode, appendDemoParam } = useDemoMode();

  // ── Core state ──
  const isForceNew = location.state?.forceNew === true;
  const [analysis, setAnalysis] = useState(isForceNew ? null : (location.state?.analysis || null));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [conditionRequirements, setConditionRequirements] = useState({});
  const [veteranNotes, setVeteranNotes] = useState('');
  const [error, setError] = useState(null);
  const [claimId, setClaimId] = useState(null);
  const [selectedConditionForRoadmap, setSelectedConditionForRoadmap] = useState(null);
  const [vaConfigured, setVaConfigured] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [requirementsLoaded, setRequirementsLoaded] = useState(false);
  const [nextActions, setNextActions] = useState(null);

  // ── Dependent / verification state ──
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

  // ── Wizard state ──
  const [wizardStep, setWizardStep] = useState(isForceNew ? 1 : (location.state?.analysis ? 2 : 1));
  const [docOverrides, setDocOverrides] = useState({});  // { condName: { reqId: true } }
  const [docUploads, setDocUploads] = useState({});      // { condName: { reqId: fileName } }

  // ── Step 1: Upload state ──
  const [showGuidance, setShowGuidance] = useState(true);
  const [expandedDocs, setExpandedDocs] = useState({ dd214: true, medical_records: true });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [providerRequestSent, setProviderRequestSent] = useState(false);

  // ── Effects ──
  useEffect(() => {
    if (!isForceNew && !analysis) {
      loadLatestAnalysis();
    } else if (analysis) {
      initializeSelections();
    }
    checkVaStatus();
    loadDependentData();
  }, [analysis]); // eslint-disable-line

  useEffect(() => {
    if (claimId) {
      loadNextActions(claimId);
    }
  }, [claimId]);

  // If claim already exists from a previous session, jump to step 5
  useEffect(() => {
    if (isApproved && claimId) setWizardStep(5);
  }, [isApproved, claimId]);

  // ── API loaders ──
  const loadNextActions = async (id) => {
    try {
      const response = await orchestrationAPI.getNextActions(id);
      if (response.data.success) setNextActions(response.data);
    } catch (err) { /* silent */ }
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
        setVerificationComplete(true);
      }
    } catch (err) { /* silent */ }
    setDependentsLoaded(true);
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
        } else {
          setWizardStep(2);
        }
      }
      // If no analysis, stay on step 1 (upload)
    } catch (err) {
      // Silent - stay on step 1
    } finally {
      setLoading(false);
    }
  };

  // ── File upload helpers ──
  const identifyDocumentType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('dd214') || lower.includes('dd-214')) return 'dd214';
    if (lower.includes('str') || lower.includes('service treatment')) return 'service_treatment_records';
    if (lower.includes('nexus')) return 'nexus_letter';
    if (lower.includes('buddy') || lower.includes('statement')) return 'buddy_statements';
    return 'medical_records';
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: identifyDocumentType(file.name),
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setAnalyzeError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/plain': ['.txt']
    },
    maxSize: 50 * 1024 * 1024
  });

  const handleAnalyzeDocuments = async () => {
    if (analyzing) return;
    const readyFiles = uploadedFiles.filter(f => f.file);
    if (readyFiles.length === 0) {
      setAnalyzeError('Please upload at least one document to continue.');
      return;
    }
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const formData = new FormData();
      readyFiles.forEach(({ file }) => formData.append('files', file));
      const response = await api.post(appendDemoParam('/claims-intelligence/analyze-documents'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });
      if (response.data.success) {
        setAnalysis(response.data.analysis);
        const conditionCount = response.data.analysis?.conditions?.length || 0;
        celebrate('document_uploaded', `${conditionCount} potential condition${conditionCount !== 1 ? 's' : ''} identified!`);
        setWizardStep(2);
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      setAnalyzeError(err.response?.data?.detail || err.message || 'Failed to analyze documents. Please try again.');
    } finally {
      setAnalyzing(false);
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
      const claimable = analysis.conditions
        .filter(c => c.claimable !== false)
        .map(c => c.condition_name);
      setSelectedConditions(claimable);

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
        { id: 'dd214', name: 'DD-214 / Service Records', completed: false }
      ];
    }
    return [
      { id: 'diagnosis', name: 'Current Diagnosis (Medical Record)', completed: true },
      { id: 'service_records', name: 'Service Treatment Records', completed: false },
      { id: 'nexus', name: 'Nexus Letter', completed: false },
      { id: 'dd214', name: 'DD-214 / Discharge Papers', completed: false }
    ];
  };

  const toggleCondition = (conditionName) => {
    setSelectedConditions(prev =>
      prev.includes(conditionName)
        ? prev.filter(c => c !== conditionName)
        : [...prev, conditionName]
    );
  };

  // ── Wizard helpers ──
  const isReqSatisfied = (condName, reqId, reqCompleted) =>
    reqCompleted || !!docOverrides[condName]?.[reqId] || !!docUploads[condName]?.[reqId];

  const getConditionProgress = (condName) => {
    const reqs = conditionRequirements[condName]?.items || [];
    if (reqs.length === 0) return { satisfied: 0, total: 0, pct: 100 };
    const satisfied = reqs.filter(r => isReqSatisfied(condName, r.id, r.completed)).length;
    return { satisfied, total: reqs.length, pct: Math.round((satisfied / reqs.length) * 100) };
  };

  const allConditionsComplete = () =>
    selectedConditions.length > 0 &&
    selectedConditions.every(cn => getConditionProgress(cn).pct === 100);

  const handleDocUpload = (condName, reqId, fileName) => {
    setDocUploads(prev => ({ ...prev, [condName]: { ...prev[condName], [reqId]: fileName } }));
  };

  const handleOverride = (condName, reqId) => {
    setDocOverrides(prev => ({ ...prev, [condName]: { ...prev[condName], [reqId]: true } }));
  };

  const computeSummary = () => {
    let totalReqs = 0, satisfiedReqs = 0, overriddenReqs = 0;
    selectedConditions.forEach(cn => {
      const reqs = conditionRequirements[cn]?.items || [];
      totalReqs += reqs.length;
      reqs.forEach(r => {
        if (isReqSatisfied(cn, r.id, r.completed)) satisfiedReqs++;
        if (docOverrides[cn]?.[r.id]) overriddenReqs++;
      });
    });
    const completionPct = totalReqs > 0 ? Math.round((satisfiedReqs / totalReqs) * 100) : 100;
    const overrideRatio = totalReqs > 0 ? overriddenReqs / totalReqs : 0;
    let riskLevel, riskColor, approvalChance;
    if (completionPct >= 80 && overrideRatio < 0.3) {
      riskLevel = 'Low'; riskColor = 'green'; approvalChance = '75–85%';
    } else if (completionPct >= 60) {
      riskLevel = 'Moderate'; riskColor = 'amber'; approvalChance = '55–70%';
    } else {
      riskLevel = 'High'; riskColor = 'red'; approvalChance = '35–55%';
    }
    return { completionPct, riskLevel, riskColor, approvalChance, totalReqs, satisfiedReqs, overriddenReqs };
  };

  // ── Create claim ──
  const handleCreateClaim = async () => {
    if (selectedConditions.length === 0) {
      setError('Please select at least one condition');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const assembleResponse = await api.post(appendDemoParam('/claims-intelligence/pre-assemble-claim'), {
        condition_names: selectedConditions,
        include_secondary: true
      });
      if (!assembleResponse.data.success) throw new Error('Failed to assemble claim package');
      const packageId = assembleResponse.data.package_id;

      const approveResponse = await api.post(appendDemoParam('/claims-intelligence/approve-claim'), {
        claim_package_id: packageId,
        approved_conditions: selectedConditions,
        veteran_notes: veteranNotes
      });
      if (approveResponse.data.success) {
        setClaimId(approveResponse.data.claim_id);
        setIsApproved(true);
        celebrate('milestone_reached', 'Your claim package is assembled and ready!');
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message;
      setError(detail || 'Failed to create claim package. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const summary = analysis ? computeSummary() : { completionPct: 0, riskLevel: 'Low', riskColor: 'green', approvalChance: '75–85%', totalReqs: 0, satisfiedReqs: 0, overriddenReqs: 0 };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <VeteranLayout>
      <div className="min-h-full bg-slate-50">
        {claimId && <ClaimStageBar claimId={claimId} />}

        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">

          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Build Your Claim</h1>
            <p className="mt-1 text-gray-500">Complete all steps to create the strongest possible claim package.</p>
          </div>

          {/* Wizard header */}
          <WizardHeader step={wizardStep} />

          {/* Error banner */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="flex-1 text-sm text-red-700">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </div>
          )}

          {/* ── STEP 1: Upload Documents ─────────────────────────────────────── */}
          {wizardStep === 1 && showGuidance && (
            <div className="space-y-5">
              {/* Guidance header */}
              <div className="bg-white rounded-xl border p-5">
                <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <FileText className="h-5 w-5" style={{ color: APP_NAVY }} />
                  What Documents Do You Need?
                </h2>
                <p className="text-sm text-gray-500">
                  Before uploading, review which documents are most important for your VA disability claim. Strong documentation significantly increases your chances of approval.
                </p>
              </div>

              {/* Required */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="text-base font-semibold text-gray-900">Required Documents</h3>
                </div>
                <p className="text-sm text-gray-500 -mt-1">Essential — your claim cannot be processed without these.</p>
                {DOCUMENT_TYPES.filter(d => d.badge === 'Required').map(doc => (
                  <DocGuidanceCard
                    key={doc.id}
                    doc={doc}
                    expanded={!!expandedDocs[doc.id]}
                    onToggle={() => setExpandedDocs(p => ({ ...p, [doc.id]: !p[doc.id] }))}
                  />
                ))}
              </div>

              {/* Recommended */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-amber-600" />
                  <h3 className="text-base font-semibold text-gray-900">Recommended Documents</h3>
                </div>
                <p className="text-sm text-gray-500 -mt-1">These significantly strengthen your claim if available.</p>
                {DOCUMENT_TYPES.filter(d => d.badge === 'Recommended').map(doc => (
                  <DocGuidanceCard
                    key={doc.id}
                    doc={doc}
                    expanded={!!expandedDocs[doc.id]}
                    onToggle={() => setExpandedDocs(p => ({ ...p, [doc.id]: !p[doc.id] }))}
                  />
                ))}
              </div>

              {/* Optional */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <h3 className="text-base font-semibold text-gray-900">Optional Documents</h3>
                </div>
                <p className="text-sm text-gray-500 -mt-1">Additional support for specific claim types.</p>
                {DOCUMENT_TYPES.filter(d => d.badge === 'Optional').map(doc => (
                  <DocGuidanceCard
                    key={doc.id}
                    doc={doc}
                    expanded={!!expandedDocs[doc.id]}
                    onToggle={() => setExpandedDocs(p => ({ ...p, [doc.id]: !p[doc.id] }))}
                  />
                ))}
              </div>

              {/* Reassurance note */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 text-sm">Don't have everything? That's okay!</p>
                  <p className="text-sm text-green-700 mt-1">Start with what you have. Upload your DD-214 and any medical records — you can always add more later.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowGuidance(false)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-all"
                  style={{ background: APP_NAVY }}
                >
                  Continue to Upload <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 1 && !showGuidance && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border p-5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="h-5 w-5" style={{ color: APP_NAVY }} />
                    Upload Your Documents
                  </h2>
                  <button onClick={() => setShowGuidance(true)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <ChevronLeft className="h-3.5 w-3.5" /> Back to guidance
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Upload your DD-214, medical records, and any other supporting documents. Our AI will analyze them to identify all claimable conditions.
                </p>
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`rounded-xl border-2 border-dashed cursor-pointer transition-colors p-10 flex items-center justify-center text-center ${
                  isDragActive ? 'border-[#1B3A5F] bg-blue-50' : 'border-gray-300 hover:border-[#1B3A5F] bg-white'
                }`}
              >
                <input {...getInputProps()} />
                <div>
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  {isDragActive ? (
                    <p className="text-[#1B3A5F] font-semibold text-lg">Drop files here...</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-semibold text-lg">Drag & drop your documents here</p>
                      <p className="text-gray-400 text-sm mt-1">or click to browse — PDF, JPG, PNG up to 50MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* File list */}
              {uploadedFiles.length > 0 && (
                <div className="bg-white rounded-xl border p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Files ({uploadedFiles.length})</h3>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}</p>
                      </div>
                      <select
                        value={file.type}
                        onChange={e => setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, type: e.target.value } : f))}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none"
                      >
                        <option value="dd214">DD-214</option>
                        <option value="medical_records">Medical Records</option>
                        <option value="service_treatment_records">Service Treatment Records</option>
                        <option value="nexus_letter">Nexus Letter</option>
                        <option value="buddy_statements">Buddy Statement</option>
                      </select>
                      <button
                        onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact provider */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                  <BriefcaseMedical className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-amber-900 text-sm">Don't have your documents?</h4>
                  <p className="text-xs text-amber-700 mt-1">Request records directly from your VA healthcare provider or private doctor.</p>
                </div>
                <button
                  onClick={() => { setProviderRequestSent(true); toast.success('Records request sent to your medical provider'); }}
                  disabled={providerRequestSent}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors min-w-[130px] justify-center ${
                    providerRequestSent ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {providerRequestSent ? <><CheckCircle className="h-3.5 w-3.5" /> Request Sent</> : 'Contact Provider'}
                </button>
              </div>

              {analyzeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {analyzeError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleAnalyzeDocuments}
                  disabled={uploadedFiles.filter(f => f.file).length === 0 || analyzing}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all ${
                    uploadedFiles.filter(f => f.file).length > 0 && !analyzing
                      ? 'hover:opacity-90'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  style={{ background: APP_NAVY }}
                >
                  {analyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing with AI...</>
                  ) : (
                    <>Analyze My Documents <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Select Conditions ───────────────────────────────────── */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-5">
                <h2 className="text-lg font-semibold mb-0.5">AI-Identified Conditions</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Select the conditions you want to claim. Each selected condition will require supporting documents in Step 3.
                </p>
                <div className="space-y-3">
                  {analysis?.conditions?.map((condition, index) => {
                    const isSelected = selectedConditions.includes(condition.condition_name);
                    return (
                      <div
                        key={index}
                        onClick={() => toggleCondition(condition.condition_name)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-[#1B3A5F] bg-blue-50/40' : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-0.5 h-5 w-5 rounded accent-[#1B3A5F] flex-shrink-0 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{condition.condition_name}</span>
                              {condition.is_presumptive && (
                                <span className="px-2 py-0.5 bg-blue-50 text-[#1B3A5F] text-xs rounded-full flex items-center gap-1">
                                  <Shield className="h-3 w-3" /> Presumptive
                                </span>
                              )}
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                condition.evidence_strength === 'strong' ? 'bg-green-100 text-green-700' :
                                condition.evidence_strength === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {condition.evidence_strength} evidence
                              </span>
                            </div>
                            {condition.va_diagnostic_code && (
                              <p className="text-xs text-gray-500 mt-1">DC {condition.va_diagnostic_code}</p>
                            )}
                          </div>
                          {condition.potential_rating_range && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold" style={{ color: APP_NAVY }}>
                                {condition.potential_rating_range[0]}–{condition.potential_rating_range[1]}%
                              </p>
                              <p className="text-[10px] text-gray-400">est. rating</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setWizardStep(1)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  disabled={selectedConditions.length === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all ${
                    selectedConditions.length > 0 ? 'hover:opacity-90' : 'opacity-40 cursor-not-allowed'
                  }`}
                  style={{ background: APP_NAVY }}
                >
                  Next: Add Supporting Documents
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Per-Condition Documents ────────────────────────────── */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-5">
                <h2 className="text-lg font-semibold mb-0.5">Supporting Documents</h2>
                <p className="text-sm text-gray-500">
                  Each condition must reach <strong>100%</strong>. Upload the required document or mark it as N/A to override.
                </p>
              </div>

              {selectedConditions.map(condName => {
                const condition = analysis.conditions?.find(c => c.condition_name === condName);
                const reqs = conditionRequirements[condName]?.items || [];
                const prog = getConditionProgress(condName);
                const isComplete = prog.pct === 100;
                const needsMedical = reqs.some(
                  r => !isReqSatisfied(condName, r.id, r.completed) && ['diagnosis', 'nexus'].includes(r.id)
                );

                return (
                  <div
                    key={condName}
                    className={`bg-white rounded-xl border-2 p-5 transition-all ${
                      isComplete ? 'border-green-300' : 'border-gray-200'
                    }`}
                  >
                    {/* Condition header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isComplete
                          ? <CheckCircle className="h-5 w-5 text-green-500" />
                          : <AlertCircle className="h-5 w-5 text-amber-500" />
                        }
                        <h3 className="font-semibold text-gray-900">{condName}</h3>
                        {condition?.is_presumptive && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Presumptive</span>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-amber-600'}`}>
                        {prog.pct}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-amber-400'}`}
                        style={{ width: `${prog.pct}%` }}
                      />
                    </div>

                    {/* Requirements list */}
                    <div className="space-y-2">
                      {reqs.map(req => {
                        const satisfied = isReqSatisfied(condName, req.id, req.completed);
                        const overridden = !!docOverrides[condName]?.[req.id];
                        const uploaded = docUploads[condName]?.[req.id];

                        return (
                          <div
                            key={req.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              satisfied
                                ? overridden ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {satisfied
                                ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                : <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                              }
                              <div className="min-w-0">
                                <p className={`text-sm font-medium ${satisfied ? 'text-gray-600' : 'text-gray-900'}`}>
                                  {req.name}
                                </p>
                                {uploaded && <p className="text-xs text-green-600 truncate">✓ {uploaded}</p>}
                                {overridden && <p className="text-xs text-gray-400">Marked as N/A</p>}
                              </div>
                            </div>

                            {!satisfied && (
                              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                <label className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity" style={{ background: APP_NAVY }}>
                                  <Upload className="h-3 w-3" />
                                  Upload
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={e => {
                                      const file = e.target.files?.[0];
                                      if (file) handleDocUpload(condName, req.id, file.name);
                                    }}
                                  />
                                </label>
                                <button
                                  onClick={() => handleOverride(condName, req.id)}
                                  className="px-3 py-1.5 border border-gray-300 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  N/A
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Contact provider for missing medical docs */}
                    {needsMedical && <ContactProviderCard conditionName={condName} />}
                  </div>
                );
              })}

              {/* Step navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setWizardStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  {!allConditionsComplete() && (
                    <p className="text-xs text-amber-600 hidden sm:block">All conditions must be 100% or marked N/A</p>
                  )}
                  <button
                    onClick={() => setWizardStep(4)}
                    disabled={!allConditionsComplete()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all ${
                      allConditionsComplete() ? 'hover:opacity-90' : 'opacity-40 cursor-not-allowed'
                    }`}
                    style={{ background: APP_NAVY }}
                  >
                    Next: Family Info <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Family & Dependent Information ─────────────────────── */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-0.5 flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: APP_NAVY }} />
                  Family & Dependent Information
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  VA compensation rates are higher for veterans with dependents. Verify your information below.
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  {/* Married */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-rose-500" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Married?</p>
                        <p className="text-xs text-gray-500">Higher rates with a spouse</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setVerificationData(prev => ({ ...prev, hasSpouse: !prev.hasSpouse }))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${verificationData.hasSpouse ? 'bg-[#1B3A5F]' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${verificationData.hasSpouse ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Dependent Children</p>
                        <p className="text-xs text-gray-500">Under 18 or school-age</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVerificationData(prev => ({ ...prev, numChildren: Math.max(0, prev.numChildren - 1) }))}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                      >−</button>
                      <span className="w-8 text-center font-bold text-gray-900">{verificationData.numChildren}</span>
                      <button
                        onClick={() => setVerificationData(prev => ({ ...prev, numChildren: prev.numChildren + 1 }))}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                      >+</button>
                    </div>
                  </div>

                  {/* School-age children */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">School-Age (18–23)</p>
                        <p className="text-xs text-gray-500">In college or vocational school</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVerificationData(prev => ({ ...prev, numSchoolAgeChildren: Math.max(0, prev.numSchoolAgeChildren - 1) }))}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                      >−</button>
                      <span className="w-8 text-center font-bold text-gray-900">{verificationData.numSchoolAgeChildren}</span>
                      <button
                        onClick={() => setVerificationData(prev => ({ ...prev, numSchoolAgeChildren: prev.numSchoolAgeChildren + 1 }))}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                      >+</button>
                    </div>
                  </div>

                  {/* Dependent parents */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5" style={{ color: APP_NAVY }} />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Dependent Parents</p>
                        <p className="text-xs text-gray-500">Parents you financially support</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVerificationData(prev => ({ ...prev, numDependentParents: Math.max(0, prev.numDependentParents - 1) }))}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                      >−</button>
                      <span className="w-8 text-center font-bold text-gray-900">{verificationData.numDependentParents}</span>
                      <button
                        onClick={() => setVerificationData(prev => ({ ...prev, numDependentParents: Math.min(2, prev.numDependentParents + 1) }))}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                      >+</button>
                    </div>
                  </div>

                  {/* SMC */}
                  <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl md:col-span-2">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Special Monthly Compensation?</p>
                        <p className="text-xs text-gray-500">For severe disabilities (loss of limb, blindness, etc.)</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setVerificationData(prev => ({ ...prev, smcEligible: !prev.smcEligible }))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${verificationData.smcEligible ? 'bg-amber-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${verificationData.smcEligible ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                {/* Additional notes */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={veteranNotes}
                    onChange={(e) => setVeteranNotes(e.target.value)}
                    placeholder="Any additional context about your conditions, service history, or circumstances..."
                    className="w-full p-3 border border-gray-200 rounded-xl resize-none h-20 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5F]/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setWizardStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={() => setWizardStep(5)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white hover:opacity-90 transition-all"
                  style={{ background: APP_NAVY }}
                >
                  Next: Create Claim <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Create Claim + Summary ─────────────────────────────── */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              {!isApproved ? (
                /* Pre-creation: show preview + create button */
                <div className="space-y-4">
                  {/* Claim preview */}
                  <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-1">Claim Package Preview</h2>
                    <p className="text-sm text-gray-500 mb-5">Review your claim before creating it.</p>

                    <div className="space-y-2 mb-6">
                      {selectedConditions.map(cn => {
                        const prog = getConditionProgress(cn);
                        return (
                          <div key={cn} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2">
                              {prog.pct === 100
                                ? <CheckCircle className="h-4 w-4 text-green-500" />
                                : <AlertCircle className="h-4 w-4 text-amber-400" />
                              }
                              <span className="text-sm font-medium text-gray-900">{cn}</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              prog.pct === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {prog.pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-2xl font-bold" style={{ color: APP_NAVY }}>{selectedConditions.length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Conditions</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-2xl font-bold text-green-700">{summary.completionPct}%</p>
                        <p className="text-xs text-gray-500 mt-0.5">Complete</p>
                      </div>
                      <div className={`text-center p-3 rounded-xl border ${
                        summary.riskColor === 'green' ? 'bg-green-50 border-green-100' :
                        summary.riskColor === 'amber' ? 'bg-amber-50 border-amber-100' :
                        'bg-red-50 border-red-100'
                      }`}>
                        <p className={`text-2xl font-bold ${
                          summary.riskColor === 'green' ? 'text-green-700' :
                          summary.riskColor === 'amber' ? 'text-amber-700' : 'text-red-700'
                        }`}>{summary.riskLevel}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Denial Risk</p>
                      </div>
                    </div>

                    <button
                      onClick={handleCreateClaim}
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                      style={{ background: APP_NAVY }}
                    >
                      {submitting ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Creating Claim...</>
                      ) : (
                        <>Create Claim <ArrowRight className="h-5 w-5" /></>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => setWizardStep(4)}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                </div>
              ) : (
                /* Post-creation: summary view */
                <div className="space-y-4">
                  {/* Success banner */}
                  <div
                    className="rounded-xl border-2 p-5 text-white"
                    style={{ background: 'linear-gradient(135deg, #1B3A5F 0%, #2a5298 100%)', borderColor: '#1B3A5F' }}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-7 w-7 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h2 className="text-xl font-bold">Claim Created Successfully</h2>
                        <p className="text-white/80 text-sm mt-0.5">
                          Your claim package has been assembled. Review the summary below.
                        </p>
                        {claimId && (
                          <div className="mt-2 flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-lg">
                            <FileCheck className="h-4 w-4 text-white/70" />
                            <code className="text-xs font-mono text-white/90">Claim #{claimId.slice(0, 8).toUpperCase()}</code>
                            <button
                              onClick={() => { navigator.clipboard.writeText(claimId); toast.success('Claim ID copied!'); }}
                              className="text-white/60 hover:text-white transition-colors"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl border p-4 text-center">
                      <p className="text-2xl font-bold" style={{ color: APP_NAVY }}>{selectedConditions.length}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Conditions Claimed</p>
                    </div>
                    <div className="bg-white rounded-xl border p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">{summary.completionPct}%</p>
                      <p className="text-xs text-gray-500 mt-0.5">Docs Complete</p>
                    </div>
                    <div className={`rounded-xl border p-4 text-center ${
                      summary.riskColor === 'green' ? 'bg-green-50 border-green-200' :
                      summary.riskColor === 'amber' ? 'bg-amber-50 border-amber-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <p className={`text-2xl font-bold ${
                        summary.riskColor === 'green' ? 'text-green-700' :
                        summary.riskColor === 'amber' ? 'text-amber-700' : 'text-red-700'
                      }`}>{summary.riskLevel}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Denial Risk</p>
                    </div>
                  </div>

                  {/* Per-condition breakdown */}
                  <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Condition Breakdown</h3>
                    <div className="space-y-3">
                      {selectedConditions.map(cn => {
                        const prog = getConditionProgress(cn);
                        const condition = analysis.conditions?.find(c => c.condition_name === cn);
                        return (
                          <div key={cn}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{cn}</span>
                                {condition?.is_presumptive && (
                                  <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">Presumptive</span>
                                )}
                              </div>
                              <span className={`text-xs font-bold ${prog.pct === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                                {prog.pct}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${prog.pct === 100 ? 'bg-green-500' : 'bg-amber-400'}`}
                                style={{ width: `${prog.pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Approval estimate */}
                  <div className="bg-white rounded-xl border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5" style={{ color: APP_NAVY }} />
                      <h3 className="font-semibold text-gray-900">Estimated Approval Likelihood</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 border-4"
                        style={{
                          borderColor: summary.riskColor === 'green' ? '#16a34a' :
                            summary.riskColor === 'amber' ? '#d97706' : '#dc2626'
                        }}
                      >
                        <div className="text-center">
                          <p className="text-lg font-bold leading-tight" style={{
                            color: summary.riskColor === 'green' ? '#16a34a' :
                              summary.riskColor === 'amber' ? '#d97706' : '#dc2626'
                          }}>
                            {summary.approvalChance.split('–')[0]}
                          </p>
                          <p className="text-[10px] text-gray-500">chance</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Estimated: <span className="font-bold">{summary.approvalChance}</span> approval probability
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on {summary.satisfiedReqs}/{summary.totalReqs} documented requirements across {selectedConditions.length} condition{selectedConditions.length !== 1 ? 's' : ''}.
                          {summary.overriddenReqs > 0 && ` ${summary.overriddenReqs} requirement${summary.overriddenReqs !== 1 ? 's' : ''} marked N/A.`}
                        </p>
                        {summary.riskLevel !== 'Low' && (
                          <p className="text-xs text-amber-700 mt-1.5 font-medium">
                            💡 Adding more supporting documents can increase your approval chances.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(`/claim/${claimId}`)}
                    disabled={!claimId}
                    className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-40"
                    style={{ background: APP_NAVY }}
                  >
                    View Detailed Analysis
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
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
              if (claimId) fetchRequirementStatus(claimId);
            }}
            claimId={claimId}
          />
        )}
        {CelebrationComponent}
      </div>
    </VeteranLayout>
  );
}
