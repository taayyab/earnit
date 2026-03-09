import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import VeteranLayout from '../components/VeteranLayout';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import AppealRoadmap from '../components/appeals/AppealRoadmap';
import EvidenceTaskList from '../components/appeals/EvidenceTaskList';
import {
  Gavel,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Scale,
  RefreshCw,
  Upload,
  Calendar,
  Info,
  Download,
  Plus,
  Trash2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Timer,
  Sparkles,
  FileCheck,
  Target,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const WIZARD_STORAGE_KEY = 'appeal_wizard_state';

const STEPS = [
  { id: 1, name: 'Decision Details', icon: FileText },
  { id: 2, name: 'Choose Appeal Path', icon: Scale },
  { id: 3, name: 'New Evidence', icon: Upload },
  { id: 4, name: 'Review & Generate', icon: Gavel }
];

const APPEAL_OPTIONS = [
  {
    id: 'supplemental_claim',
    name: 'Supplemental Claim',
    form: 'VA Form 20-0995',
    description: 'Submit new and relevant evidence to support your claim.',
    timeline: '4-5 months average',
    pros: [
      'Can submit new evidence at any time',
      'Fastest average processing time',
      'Multiple submissions allowed',
      'Can be filed while other appeals are pending'
    ],
    cons: [
      'Requires new and relevant evidence',
      'Cannot argue interpretation of existing evidence',
      'No hearing available'
    ],
    bestFor: 'Veterans who have new medical evidence, buddy statements, or nexus letters that were not previously considered.',
    successRate: '25-35%'
  },
  {
    id: 'higher_level_review',
    name: 'Higher-Level Review (HLR)',
    form: 'VA Form 20-0996',
    description: 'Have a more senior reviewer take a fresh look at your case.',
    timeline: '4-5 months average',
    pros: [
      'Fresh review by senior rater',
      'Can request informal conference call',
      'Good for clear and unmistakable errors',
      'No new evidence required'
    ],
    cons: [
      'Cannot submit new evidence',
      'One HLR per claim issue',
      'Limited to record review'
    ],
    bestFor: 'Veterans who believe the VA made a clear error in weighing evidence or applying regulations.',
    successRate: '15-20%'
  },
  {
    id: 'board_appeal',
    name: 'Board Appeal (BVA)',
    form: 'VA Form 10182',
    description: 'Appeal directly to the Board of Veterans\' Appeals.',
    timeline: '12-24 months average',
    pros: [
      'Decided by Veterans Law Judge',
      'Can request a hearing',
      'Can submit new evidence',
      'Most thorough review option'
    ],
    cons: [
      'Longest processing time',
      'More complex process',
      'May require travel or video hearing'
    ],
    bestFor: 'Veterans with complex cases or who want the most thorough review possible.',
    successRate: '35-40%',
    lanes: [
      { id: 'direct_review', name: 'Direct Review', description: 'Fastest - no new evidence or hearing', timeline: '1 year average' },
      { id: 'evidence_submission', name: 'Evidence Submission', description: 'Submit new evidence within 90 days', timeline: '1-2 years average' },
      { id: 'hearing', name: 'Hearing Request', description: 'Request a hearing with a Judge', timeline: '2+ years average' }
    ]
  }
];

export default function AppealDecisionWizard() {
  const navigate = useNavigate();
  const { claimId } = useParams();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [claim, setClaim] = useState(null);
  const [deniedConditions, setDeniedConditions] = useState([]);
  
  const [appealCaseId, setAppealCaseId] = useState(null);
  const [downloadingDemo, setDownloadingDemo] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [evidenceRequirements, setEvidenceRequirements] = useState([]);
  
  const [decisionData, setDecisionData] = useState({
    decisionDate: '',
    denialReasons: '',
    selectedConditions: [],
    decisionLetterUploaded: false,
    denialLetterFile: null,
    denialLetterAnalysis: null,
    isAnalyzing: false
  });
  
  const [appealChoice, setAppealChoice] = useState({
    type: null,
    boardLane: null,
    requestInformalConference: false
  });
  
  const [newEvidence, setNewEvidence] = useState([]);
  const [newEvidenceInput, setNewEvidenceInput] = useState({ type: '', description: '' });
  
  const [generatedForm, setGeneratedForm] = useState(null);
  const [deadlineInfo, setDeadlineInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStorageKey = useCallback(() => {
    return `${WIZARD_STORAGE_KEY}_${claimId || 'new'}`;
  }, [claimId]);

  const saveWizardState = useCallback(() => {
    const stateToSave = {
      currentStep,
      appealCaseId,
      decisionData: {
        ...decisionData,
        denialLetterFile: null
      },
      appealChoice,
      newEvidence,
      roadmapData,
      evidenceRequirements,
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save wizard state:', error);
    }
  }, [currentStep, appealCaseId, decisionData, appealChoice, newEvidence, roadmapData, evidenceRequirements, getStorageKey]);

  const loadSavedState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(getStorageKey());
      if (savedState) {
        const parsed = JSON.parse(savedState);
        const savedDate = new Date(parsed.savedAt);
        const hoursSinceSave = (new Date() - savedDate) / (1000 * 60 * 60);
        if (hoursSinceSave < 24) {
          return parsed;
        } else {
          localStorage.removeItem(getStorageKey());
        }
      }
    } catch (error) {
      console.error('Failed to load saved wizard state:', error);
    }
    return null;
  }, [getStorageKey]);

  const clearSavedState = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error('Failed to clear saved state:', error);
    }
  }, [getStorageKey]);

  useEffect(() => {
    const savedState = loadSavedState();
    if (savedState) {
      setCurrentStep(savedState.currentStep || 1);
      if (savedState.appealCaseId) setAppealCaseId(savedState.appealCaseId);
      if (savedState.decisionData) setDecisionData(prev => ({ ...prev, ...savedState.decisionData }));
      if (savedState.appealChoice) setAppealChoice(savedState.appealChoice);
      if (savedState.newEvidence) setNewEvidence(savedState.newEvidence);
      if (savedState.roadmapData) setRoadmapData(savedState.roadmapData);
      if (savedState.evidenceRequirements) setEvidenceRequirements(savedState.evidenceRequirements);
      toast.info('Restored your previous progress');
    }
    if (claimId) {
      loadClaimData();
    }
  }, [claimId, loadSavedState]);

  useEffect(() => {
    if (currentStep > 1 || decisionData.decisionDate || appealCaseId) {
      saveWizardState();
    }
  }, [currentStep, decisionData, appealChoice, newEvidence, appealCaseId, saveWizardState]);

  useEffect(() => {
    if (decisionData.decisionDate) {
      calculateDeadline();
    }
  }, [decisionData.decisionDate]);

  const loadClaimData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/claims/${claimId}`);
      setClaim(response.data.claim);
      
      const conditions = response.data.claim?.conditions || [];
      const denied = conditions.filter(c => c.status === 'denied' || !c.status);
      setDeniedConditions(denied);
    } catch (error) {
      console.error('Failed to load claim:', error);
      toast.error('Failed to load claim data');
    } finally {
      setLoading(false);
    }
  };

  const downloadDemoLetter = async () => {
    try {
      setDownloadingDemo(true);
      const condition = decisionData.deniedConditions?.[0] || 'PTSD';
      const response = await api.get(`/appeals/dummy-denial-letter?condition=${encodeURIComponent(condition)}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'VA_Decision_Letter_DEMO.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Demo denial letter downloaded! Upload it below to test the appeal flow.');
    } catch {
      toast.error('Failed to generate demo letter');
    } finally {
      setDownloadingDemo(false);
    }
  };

  const handleDenialLetterUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDecisionData(prev => ({ 
      ...prev, 
      denialLetterFile: file, 
      isAnalyzing: true,
      decisionLetterUploaded: true 
    }));

    try {
      let caseId = appealCaseId;
      if (!caseId) {
        const createRes = await api.post('/appeals/cases', {
          claim_id: claimId || null,
          appeal_type: 'supplemental',
          original_decision_date: decisionData.decisionDate || null
        });
        
        if (createRes.data.success && createRes.data.appeal_case_id) {
          caseId = createRes.data.appeal_case_id;
          setAppealCaseId(caseId);
        } else {
          throw new Error('Failed to create appeal case');
        }
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'denial_letter');

      const uploadRes = await api.post(`/appeals/cases/${caseId}/upload-denial-letter`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const analysisRes = await api.get(`/appeals/cases/${caseId}/analysis`);
        
        if (analysisRes.data) {
          const analysis = analysisRes.data;
          
          const denialIssues = analysis.denial_issues || [];
          const evidenceReqs = analysis.evidence_requirements || [];
          
          const reasons = denialIssues.length > 0
            ? denialIssues.map(issue => issue.denial_reason_detail || issue.denial_reason).join('; ')
            : '';
          
          const deniedFromLetter = denialIssues
            .map(issue => issue.condition_name)
            .filter(Boolean);

          const roadmap = buildRoadmapFromAnalysis(denialIssues, evidenceReqs);
          setRoadmapData(roadmap);

          const formattedRequirements = evidenceReqs.map(req => ({
            id: req.id,
            type: req.evidence_type,
            name: req.evidence_type?.replace(/_/g, ' '),
            description: req.description,
            priority: req.priority,
            status: req.status || 'pending',
            vaRegulationRef: req.va_regulation_reference,
            conditionName: req.condition_name,
            instructions: req.instructions
          }));
          setEvidenceRequirements(formattedRequirements);

          setDecisionData(prev => ({ 
            ...prev, 
            denialLetterAnalysis: analysis,
            isAnalyzing: false,
            denialReasons: reasons || prev.denialReasons,
            selectedConditions: [...new Set([...prev.selectedConditions, ...deniedFromLetter])]
          }));

          if (deniedFromLetter.length > 0) {
            setDeniedConditions(prev => {
              const existingNames = prev.map(c => c.name || c.condition_name);
              const newConditions = deniedFromLetter
                .filter(name => !existingNames.includes(name))
                .map(name => ({ name, condition_name: name }));
              return [...prev, ...newConditions];
            });
          }

          toast.success(`Denial letter analyzed! Found ${denialIssues.length} denied conditions.`);
        } else {
          toast.warning('Letter uploaded but analysis unavailable');
          setDecisionData(prev => ({ ...prev, isAnalyzing: false }));
        }
      } else {
        toast.success('Letter uploaded. Please enter details manually.');
        setDecisionData(prev => ({ ...prev, isAnalyzing: false }));
      }
    } catch (error) {
      console.error('Failed to analyze denial letter:', error);
      toast.error('Failed to analyze denial letter. Please enter details manually.');
      setDecisionData(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const buildRoadmapFromAnalysis = (denialIssues, evidenceReqs) => {
    const steps = [];
    let stepIndex = 0;
    
    steps.push({
      id: `step-${stepIndex++}`,
      title: 'Review Denial Analysis',
      description: 'Review the AI-extracted denial reasons and verify accuracy',
      status: 'completed',
      estimatedDays: 1
    });

    const groupedByCondition = {};
    evidenceReqs.forEach(req => {
      const condition = req.condition_name || 'General';
      if (!groupedByCondition[condition]) {
        groupedByCondition[condition] = [];
      }
      groupedByCondition[condition].push(req);
    });

    Object.entries(groupedByCondition).forEach(([condition, reqs]) => {
      const requiredReqs = reqs.filter(r => r.priority === 'required');
      const recommendedReqs = reqs.filter(r => r.priority === 'recommended');
      
      if (requiredReqs.length > 0) {
        steps.push({
          id: `step-${stepIndex++}`,
          title: `Gather Required Evidence: ${condition}`,
          description: `Collect ${requiredReqs.length} required pieces of evidence for ${condition}`,
          status: 'pending',
          estimatedDays: 14,
          evidenceNeeded: requiredReqs.map(r => r.evidence_type?.replace(/_/g, ' '))
        });
      }
      
      if (recommendedReqs.length > 0) {
        steps.push({
          id: `step-${stepIndex++}`,
          title: `Gather Recommended Evidence: ${condition}`,
          description: `Collect ${recommendedReqs.length} recommended pieces of evidence for ${condition}`,
          status: 'pending',
          estimatedDays: 7,
          evidenceNeeded: recommendedReqs.map(r => r.evidence_type?.replace(/_/g, ' '))
        });
      }
    });

    steps.push({
      id: `step-${stepIndex++}`,
      title: 'Choose Appeal Path',
      description: 'Select the best appeal option based on your situation',
      status: 'pending',
      estimatedDays: 1
    });

    steps.push({
      id: `step-${stepIndex++}`,
      title: 'Submit Appeal',
      description: 'Complete and submit your appeal form to the VA',
      status: 'pending',
      estimatedDays: 1
    });

    const totalDays = steps.reduce((sum, step) => sum + (step.estimatedDays || 0), 0);

    return {
      steps,
      totalEstimatedDays: totalDays,
      recommendedPath: denialIssues.length > 0 ? {
        name: 'Supplemental Claim',
        description: 'Based on your denial reasons, new evidence could strengthen your case',
        successRate: 0.30
      } : null
    };
  };

  const generateRemediationRoadmap = (analysis) => {
    if (!analysis?.denial_reasons) return [];

    const roadmap = [];

    for (const denial of analysis.denial_reasons || []) {
      const steps = [];
      const reason = denial.reason?.toLowerCase() || '';
      const lacking = denial.evidence_lacking?.toLowerCase() || '';

      if (reason.includes('nexus') || lacking.includes('nexus') || reason.includes('connection')) {
        steps.push({
          priority: 1,
          action: 'Obtain Independent Medical Opinion (IMO)',
          description: 'Get a nexus letter from a qualified medical professional stating your condition is "at least as likely as not" connected to your military service.',
          evidence_type: 'NEXUS_LETTER',
          estimated_time: '2-4 weeks'
        });
      }

      if (reason.includes('diagnosis') || lacking.includes('current diagnosis')) {
        steps.push({
          priority: 1,
          action: 'Get Current Medical Diagnosis',
          description: 'Obtain a current diagnosis from a medical provider with ICD-10 codes documenting your condition.',
          evidence_type: 'MEDICAL_RECORDS',
          estimated_time: '1-2 weeks'
        });
      }

      if (reason.includes('service') || lacking.includes('in-service') || lacking.includes('service treatment')) {
        steps.push({
          priority: 2,
          action: 'Gather Service Connection Evidence',
          description: 'Collect buddy statements, personal statements, and any documented evidence of the condition during service.',
          evidence_type: 'BUDDY_STATEMENT',
          estimated_time: '2-3 weeks'
        });
      }

      if (reason.includes('severity') || reason.includes('rating') || lacking.includes('dbq')) {
        steps.push({
          priority: 2,
          action: 'Complete Updated DBQ',
          description: 'Have a medical provider complete a current Disability Benefits Questionnaire documenting the severity of your condition.',
          evidence_type: 'DBQ',
          estimated_time: '1-2 weeks'
        });
      }

      if (steps.length === 0) {
        steps.push({
          priority: 2,
          action: 'Gather Supporting Evidence',
          description: `Address the denial reason: "${denial.reason}". Consider medical records, statements, or expert opinions that specifically counter this reason.`,
          evidence_type: 'OTHER',
          estimated_time: '2-4 weeks'
        });
      }

      roadmap.push({
        condition: denial.condition,
        denial_reason: denial.reason,
        steps: steps.sort((a, b) => a.priority - b.priority)
      });
    }

    return roadmap;
  };

  const calculateDeadline = () => {
    if (!decisionData.decisionDate) return;
    
    const decisionDate = new Date(decisionData.decisionDate);
    const oneYearLater = new Date(decisionDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    const today = new Date();
    const daysRemaining = Math.ceil((oneYearLater - today) / (1000 * 60 * 60 * 24));
    
    setDeadlineInfo({
      deadline: oneYearLater.toLocaleDateString(),
      daysRemaining,
      isUrgent: daysRemaining <= 90,
      isExpired: daysRemaining <= 0
    });
  };

  const handleConditionToggle = (conditionName) => {
    setDecisionData(prev => {
      const selected = prev.selectedConditions.includes(conditionName)
        ? prev.selectedConditions.filter(c => c !== conditionName)
        : [...prev.selectedConditions, conditionName];
      return { ...prev, selectedConditions: selected };
    });
  };

  const addNewEvidence = () => {
    if (!newEvidenceInput.type || !newEvidenceInput.description) {
      toast.error('Please fill in evidence type and description');
      return;
    }
    setNewEvidence([...newEvidence, { ...newEvidenceInput, id: Date.now() }]);
    setNewEvidenceInput({ type: '', description: '' });
  };

  const removeEvidence = (id) => {
    setNewEvidence(newEvidence.filter(e => e.id !== id));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!decisionData.decisionDate) {
          toast.error('Please enter the VA decision date');
          return false;
        }
        if (decisionData.selectedConditions.length === 0) {
          toast.error('Please select at least one condition to appeal');
          return false;
        }
        if (deadlineInfo?.isExpired) {
          toast.error('The 1-year appeal deadline has passed. Please consult with a VSO about your options.');
          return false;
        }
        return true;
      case 2:
        if (!appealChoice.type) {
          toast.error('Please select an appeal type');
          return false;
        }
        if (appealChoice.type === 'board_appeal' && !appealChoice.boardLane) {
          toast.error('Please select a Board Appeal lane');
          return false;
        }
        return true;
      case 3:
        if (appealChoice.type === 'supplemental_claim' && newEvidence.length === 0) {
          toast.error('Supplemental Claims require new evidence. Please add at least one piece of evidence.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const updateAppealCaseOnBackend = async () => {
    if (!appealCaseId) return;
    
    try {
      await api.patch(`/appeals/cases/${appealCaseId}`, {
        appeal_type: appealChoice.type || 'supplemental',
        original_decision_date: decisionData.decisionDate || null
      });
    } catch (error) {
      console.warn('Failed to update appeal case on backend:', error);
    }
  };

  const createAppealCaseIfNeeded = async () => {
    if (appealCaseId) return appealCaseId;
    
    try {
      const createRes = await api.post('/appeals/cases', {
        claim_id: claimId || null,
        appeal_type: appealChoice.type || 'supplemental',
        original_decision_date: decisionData.decisionDate || null
      });
      
      if (createRes.data.success && createRes.data.appeal_case_id) {
        const newCaseId = createRes.data.appeal_case_id;
        setAppealCaseId(newCaseId);
        return newCaseId;
      }
    } catch (error) {
      console.error('Failed to create appeal case:', error);
    }
    return null;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    
    const nextStep = Math.min(currentStep + 1, 4);
    
    if (currentStep === 1 && nextStep === 2) {
      await createAppealCaseIfNeeded();
    }
    
    if (currentStep === 2 && nextStep === 3) {
      await updateAppealCaseOnBackend();
    }
    
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleEvidenceStatusChange = async (evidenceId, newStatus) => {
    setEvidenceRequirements(prev => 
      prev.map(req => 
        req.id === evidenceId ? { ...req, status: newStatus } : req
      )
    );
    
    if (appealCaseId && evidenceId) {
      try {
        await api.post(`/appeals/cases/${appealCaseId}/evidence/${evidenceId}/status`, {
          status: newStatus
        });
      } catch (error) {
        console.warn('Failed to update evidence status on backend:', error);
      }
    }
  };

  const handleUploadEvidence = async (evidenceId, evidenceItem) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('evidence_id', evidenceId);
        formData.append('evidence_type', evidenceItem.type || evidenceItem.name);

        if (appealCaseId) {
          await api.post(`/appeals/cases/${appealCaseId}/evidence/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }

        setEvidenceRequirements(prev =>
          prev.map(req =>
            req.id === evidenceId 
              ? { ...req, status: 'uploaded', uploadedFile: file.name }
              : req
          )
        );

        toast.success(`Evidence uploaded: ${file.name}`);
      } catch (error) {
        console.error('Error uploading evidence:', error);
        toast.error('Failed to upload evidence document');
      }
    };

    input.click();
  };

  const handleRoadmapStepClick = () => {
  };

  const generateAppealForm = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/appeals/generate-form', {
        claim_id: claimId,
        appeal_type: appealChoice.type,
        board_lane: appealChoice.boardLane,
        request_informal_conference: appealChoice.requestInformalConference,
        decision_date: decisionData.decisionDate,
        conditions: decisionData.selectedConditions,
        denial_reasons: decisionData.denialReasons,
        new_evidence: newEvidence
      });
      
      setGeneratedForm(response.data);
      toast.success('Appeal form generated successfully!');
    } catch (error) {
      console.error('Failed to generate form:', error);
      toast.error('Failed to generate appeal form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createAppealRecord = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/appeals/create', {
        claim_id: claimId,
        appeal_type: appealChoice.type,
        conditions: decisionData.selectedConditions,
        decision_date: decisionData.decisionDate,
        reason: decisionData.denialReasons,
        new_evidence: newEvidence.map(e => e.description),
        appeal_case_id: appealCaseId
      });
      
      if (response.data.success) {
        await api.post('/deadlines/create', {
          deadline_type: 'appeal_deadline',
          reference_date: decisionData.decisionDate,
          claim_id: claimId,
          custom_title: `Appeal Deadline - ${appealChoice.type.replace(/_/g, ' ')}`,
          custom_description: `One year deadline to file ${appealChoice.type.replace(/_/g, ' ')} for denied conditions`,
          action_url: `/appeal-wizard/${claimId}`
        });
        
        clearSavedState();
        toast.success('Appeal created and deadline tracked!');
        navigate('/appeals-status');
      }
    } catch (error) {
      console.error('Failed to create appeal:', error);
      toast.error('Failed to create appeal record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const renderStepIndicator = () => (
    <div className="mb-8">
      <Progress value={getStepProgress()} className="h-2 mb-4" />
      <nav aria-label="Appeal wizard progress">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            
            return (
              <li key={step.id} className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors mb-2
                  ${isComplete ? 'bg-green-600 border-green-600' : ''}
                  ${isActive ? 'bg-[#1B3A5F] border-[#1B3A5F]' : ''}
                  ${!isActive && !isComplete ? 'border-slate-300 bg-white' : ''}
                `}>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  )}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-[#1B3A5F]' : 'text-slate-500'}`}>
                  {step.name}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1B3A5F]" />
            VA Decision Details
          </CardTitle>
          <CardDescription>
            Enter information from your VA decision letter to help us guide you through the appeal process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date of VA Decision Letter <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={decisionData.decisionDate}
              onChange={(e) => setDecisionData(prev => ({ ...prev, decisionDate: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {deadlineInfo && (
            <div className={`p-4 rounded-lg border ${
              deadlineInfo.isExpired ? 'bg-red-50 border-red-200' :
              deadlineInfo.isUrgent ? 'bg-amber-50 border-amber-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                {deadlineInfo.isExpired ? (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                ) : deadlineInfo.isUrgent ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                ) : (
                  <Timer className="w-5 h-5 text-green-600 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-medium ${
                    deadlineInfo.isExpired ? 'text-red-800' :
                    deadlineInfo.isUrgent ? 'text-amber-800' :
                    'text-green-800'
                  }`}>
                    {deadlineInfo.isExpired ? 'Appeal Deadline Passed' :
                     deadlineInfo.isUrgent ? 'Urgent: Deadline Approaching' :
                     'Appeal Deadline'}
                  </h4>
                  <p className={`text-sm ${
                    deadlineInfo.isExpired ? 'text-red-700' :
                    deadlineInfo.isUrgent ? 'text-amber-700' :
                    'text-green-700'
                  }`}>
                    {deadlineInfo.isExpired ? (
                      'The 1-year deadline has passed. Consult with a VSO about your options.'
                    ) : (
                      <>
                        You have <strong>{deadlineInfo.daysRemaining} days</strong> until {deadlineInfo.deadline} to file your appeal.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-dashed border-[#1B3A5F]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#1B3A5F]" />
            Upload Your Denial Letter
            <Badge className="bg-amber-100 text-amber-700 ml-2">Recommended</Badge>
          </CardTitle>
          <CardDescription>
            Upload your VA decision letter and our AI will automatically extract denial reasons, dates, and conditions to help build your appeal strategy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {decisionData.isAnalyzing ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
              <Loader2 className="w-8 h-8 text-[#1B3A5F] animate-spin mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Analyzing your denial letter...</p>
              <p className="text-sm text-slate-500">This may take a moment</p>
            </div>
          ) : decisionData.denialLetterFile && !decisionData.isAnalyzing ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{decisionData.denialLetterFile.name}</p>
                  <p className="text-sm text-green-600">Letter uploaded and analyzed</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block p-8 text-center border-2 border-dashed border-slate-300 rounded-lg hover:border-[#1B3A5F] cursor-pointer transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Click to upload your VA decision letter</p>
                <p className="text-sm text-slate-500 mt-1">PDF or image files accepted</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleDenialLetterUpload}
                />
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={downloadDemoLetter}
                disabled={downloadingDemo}
              >
                {downloadingDemo
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <Download className="w-4 h-4 mr-2" />}
                Download Demo Denial Letter (for testing)
              </Button>
              <p className="text-xs text-slate-400 text-center">
                Downloads a realistic VA denial letter PDF — upload it above to test the full appeal flow
              </p>
            </div>
          )}

          {decisionData.denialLetterAnalysis && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">AI Analysis Complete</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Decision Date:</span>
                    <span className="ml-2 font-medium text-blue-800">
                      {decisionData.denialLetterAnalysis.decision_date || 'Not found'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Conditions Found:</span>
                    <span className="ml-2 font-medium text-blue-800">
                      {decisionData.denialLetterAnalysis.conditions_decided?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Confidence:</span>
                    <span className="ml-2 font-medium text-blue-800">
                      {Math.round((decisionData.denialLetterAnalysis.extraction_confidence || 0) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">CUE Indicators:</span>
                    <span className="ml-2 font-medium text-blue-800">
                      {decisionData.denialLetterAnalysis.cue_indicators?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {generateRemediationRoadmap(decisionData.denialLetterAnalysis).length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-[#1B3A5F]">
                      <Target className="w-5 h-5" />
                      Your Remediation Roadmap
                    </CardTitle>
                    <CardDescription className="text-[#1B3A5F]">
                      Based on the denial reasons, here's your action plan to strengthen your appeal
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {generateRemediationRoadmap(decisionData.denialLetterAnalysis).map((item, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-[#1B3A5F] text-white">{item.condition}</Badge>
                          <span className="text-sm text-[#1B3A5F]">-</span>
                          <span className="text-sm text-[#1B3A5F] italic">"{item.denial_reason}"</span>
                        </div>
                        <div className="space-y-2">
                          {item.steps.map((step, stepIdx) => (
                            <div key={stepIdx} className="flex items-start gap-3 pl-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                step.priority === 1 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                              }`}>
                                {stepIdx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-800">{step.action}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {step.estimated_time}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#1B3A5F]" />
            Denial Details
          </CardTitle>
          <CardDescription>
            {decisionData.denialLetterAnalysis 
              ? 'We\'ve pre-filled this from your letter. Review and edit if needed.'
              : 'Enter the denial reasons from your decision letter.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Brief Description of Denial Reasons
            </label>
            <textarea
              value={decisionData.denialReasons}
              onChange={(e) => setDecisionData(prev => ({ ...prev, denialReasons: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              rows={3}
              placeholder="e.g., 'Lack of nexus between service and current condition', 'No diagnosis in service treatment records'"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1B3A5F]" />
            Select Conditions to Appeal
          </CardTitle>
          <CardDescription>
            Choose which denied conditions you want to appeal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deniedConditions.length > 0 ? (
            <div className="space-y-3">
              {deniedConditions.map((condition, index) => (
                <div
                  key={index}
                  onClick={() => handleConditionToggle(condition.name || condition.condition_name)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    decisionData.selectedConditions.includes(condition.name || condition.condition_name)
                      ? 'border-[#1B3A5F] bg-[#E8F4FD]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={decisionData.selectedConditions.includes(condition.name || condition.condition_name)}
                        onChange={() => {}}
                        className="w-5 h-5 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                      />
                      <span className="font-medium">{condition.name || condition.condition_name}</span>
                    </div>
                    {condition.diagnostic_code && (
                      <Badge variant="outline">{condition.diagnostic_code}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-600">
                Enter the conditions that were denied in your decision letter:
              </p>
              <input
                type="text"
                placeholder="Enter condition name and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleConditionToggle(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              />
              {decisionData.selectedConditions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {decisionData.selectedConditions.map((condition, idx) => (
                    <Badge key={idx} className="bg-[#1B3A5F] text-white flex items-center gap-1">
                      {condition}
                      <button 
                        onClick={() => handleConditionToggle(condition)}
                        className="ml-1 hover:text-red-200"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {roadmapData && (
        <AppealRoadmap 
          roadmap={roadmapData}
          onStepClick={handleRoadmapStepClick}
        />
      )}

      {evidenceRequirements.length > 0 && (
        <EvidenceTaskList
          evidenceRequirements={evidenceRequirements}
          onEvidenceStatusChange={handleEvidenceStatusChange}
          onUploadEvidence={handleUploadEvidence}
        />
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Understanding Your Options</h4>
              <p className="text-sm text-blue-700 mt-1">
                Each appeal path has different requirements and timelines. Choose the one that best fits your situation.
                You can only pursue one path at a time for each issue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {APPEAL_OPTIONS.map((option) => (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all ${
              appealChoice.type === option.id
                ? 'border-2 border-[#1B3A5F] shadow-lg'
                : 'border hover:border-slate-300 hover:shadow-md'
            }`}
            onClick={() => setAppealChoice(prev => ({ ...prev, type: option.id, boardLane: null }))}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={appealChoice.type === option.id}
                    onChange={() => {}}
                    className="w-5 h-5 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{option.name}</h3>
                    <p className="text-sm text-slate-600">{option.form}</p>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {option.timeline}
                </Badge>
              </div>

              <p className="text-slate-700 mb-4">{option.description}</p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800 text-sm">Pros</span>
                  </div>
                  <ul className="space-y-1">
                    {option.pros.map((pro, idx) => (
                      <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsDown className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800 text-sm">Cons</span>
                  </div>
                  <ul className="space-y-1">
                    {option.cons.map((con, idx) => (
                      <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                        <XCircle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Best for:</strong> {option.bestFor}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Estimated success rate: <strong>{option.successRate}</strong>
                </p>
              </div>

              {option.lanes && appealChoice.type === option.id && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-3">Select Board Appeal Lane:</h4>
                  <div className="space-y-2">
                    {option.lanes.map((lane) => (
                      <div
                        key={lane.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAppealChoice(prev => ({ ...prev, boardLane: lane.id }));
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          appealChoice.boardLane === lane.id
                            ? 'border-[#1B3A5F] bg-[#E8F4FD]'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={appealChoice.boardLane === lane.id}
                            onChange={() => {}}
                            className="w-4 h-4 text-[#1B3A5F]"
                          />
                          <div>
                            <span className="font-medium">{lane.name}</span>
                            <span className="text-slate-500 text-sm ml-2">({lane.timeline})</span>
                            <p className="text-sm text-slate-600">{lane.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {option.id === 'higher_level_review' && appealChoice.type === option.id && (
                <div className="mt-4 pt-4 border-t">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appealChoice.requestInformalConference}
                      onChange={(e) => {
                        e.stopPropagation();
                        setAppealChoice(prev => ({ ...prev, requestInformalConference: e.target.checked }));
                      }}
                      className="w-5 h-5 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                    />
                    <div>
                      <span className="font-medium">Request Informal Conference</span>
                      <p className="text-sm text-slate-600">
                        A phone call with a VA representative to discuss your case before a decision is made.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {appealChoice.type === 'higher_level_review' ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">No New Evidence Allowed</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Higher-Level Reviews do not accept new evidence. The senior reviewer will only 
                  consider evidence that was already in your claims file when the original decision was made.
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  If you have new evidence, consider filing a Supplemental Claim instead.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1B3A5F]" />
                New Evidence for Your Appeal
              </CardTitle>
              <CardDescription>
                {appealChoice.type === 'supplemental_claim' 
                  ? 'Supplemental Claims require new and relevant evidence that was not previously considered.'
                  : 'Add any new evidence you want to submit with your Board Appeal.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Evidence Type
                  </label>
                  <select
                    value={newEvidenceInput.type}
                    onChange={(e) => setNewEvidenceInput(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                  >
                    <option value="">Select type...</option>
                    <option value="medical_records">Medical Records</option>
                    <option value="nexus_letter">Nexus Letter</option>
                    <option value="dbq">Disability Benefits Questionnaire (DBQ)</option>
                    <option value="buddy_statement">Buddy Statement</option>
                    <option value="personal_statement">Personal Statement</option>
                    <option value="service_records">Service Records</option>
                    <option value="private_medical">Private Medical Opinion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newEvidenceInput.description}
                    onChange={(e) => setNewEvidenceInput(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of evidence"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                  />
                </div>
              </div>
              <Button onClick={addNewEvidence} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Evidence
              </Button>

              {newEvidence.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-sm text-slate-700">Evidence to Submit:</h4>
                  {newEvidence.map((evidence) => (
                    <div key={evidence.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <Badge variant="outline" className="mr-2">
                          {evidence.type.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm">{evidence.description}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeEvidence(evidence.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {evidenceRequirements.length > 0 && (
            <EvidenceTaskList
              evidenceRequirements={evidenceRequirements}
              onEvidenceStatusChange={handleEvidenceStatusChange}
              onUploadEvidence={handleUploadEvidence}
            />
          )}

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <h4 className="font-medium text-blue-800 mb-3">Evidence Tips</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <strong>Nexus Letters:</strong> A medical opinion linking your condition to service is often the most powerful evidence.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <strong>Buddy Statements:</strong> Fellow service members can corroborate in-service events or symptoms.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <strong>DBQs:</strong> A private physician can complete a DBQ with current severity information.
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderStep4 = () => {
    const selectedOption = APPEAL_OPTIONS.find(o => o.id === appealChoice.type);
    const selectedLane = selectedOption?.lanes?.find(l => l.id === appealChoice.boardLane);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Review Your Appeal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-2">Appeal Type</h4>
                <p className="font-semibold">{selectedOption?.name}</p>
                <p className="text-sm text-slate-600">{selectedOption?.form}</p>
                {selectedLane && (
                  <p className="text-sm text-slate-600 mt-1">Lane: {selectedLane.name}</p>
                )}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-2">Decision Date</h4>
                <p className="font-semibold">{new Date(decisionData.decisionDate).toLocaleDateString()}</p>
                {deadlineInfo && (
                  <p className={`text-sm ${deadlineInfo.isUrgent ? 'text-amber-600' : 'text-slate-600'}`}>
                    Deadline: {deadlineInfo.deadline} ({deadlineInfo.daysRemaining} days)
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-2">Conditions Being Appealed</h4>
              <div className="flex flex-wrap gap-2">
                {decisionData.selectedConditions.map((condition, idx) => (
                  <Badge key={idx} className="bg-[#1B3A5F] text-white">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>

            {appealChoice.requestInformalConference && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Informal Conference Requested</span>
                </div>
              </div>
            )}

            {newEvidence.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-2">New Evidence ({newEvidence.length})</h4>
                <ul className="space-y-1">
                  {newEvidence.map((evidence, idx) => (
                    <li key={idx} className="text-sm text-slate-600">
                      • {evidence.type.replace(/_/g, ' ')}: {evidence.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Button
            onClick={generateAppealForm}
            disabled={isSubmitting}
            className="h-16 bg-[#1B3A5F] hover:bg-[#0F2A4A]"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            Generate {selectedOption?.form}
          </Button>
          
          <Button
            onClick={createAppealRecord}
            disabled={isSubmitting}
            variant="outline"
            className="h-16"
          >
            <FileText className="w-5 h-5 mr-2" />
            Create Appeal & Track Deadline
          </Button>
        </div>

        {generatedForm && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h4 className="font-medium text-green-800">Form Generated Successfully!</h4>
              </div>
              <p className="text-sm text-green-700 mb-4">
                Your {selectedOption?.form} has been pre-filled with your information. 
                Review it carefully before submitting to the VA.
              </p>
              <Button className="bg-[#1B3A5F] hover:bg-[#2a4a6f]">
                <Download className="w-4 h-4 mr-2" />
                Download Form
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Important Reminders</h4>
                <ul className="text-sm text-amber-700 mt-2 space-y-1">
                  <li>• Review the generated form carefully before submitting</li>
                  <li>• Make copies of everything you submit</li>
                  <li>• Consider faxing or using certified mail for paper submissions</li>
                  <li>• You can also submit through VA.gov or eBenefits</li>
                  <li>• Keep records of your submission date and confirmation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  if (loading) {
    return (
      <VeteranLayout>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </VeteranLayout>
    );
  }

  return (
    <VeteranLayout>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(claimId ? `/claim/${claimId}` : '/appeals-status')} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Gavel className="w-7 h-7 text-[#1B3A5F]" />
            Appeal a VA Decision
          </h1>
          <p className="text-slate-600 mt-2">
            We'll help you choose the right appeal path and generate the necessary forms.
          </p>
        </div>

        {renderStepIndicator()}
        {renderCurrentStep()}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < 4 && (
            <Button
              onClick={handleNext}
              className="bg-[#1B3A5F] hover:bg-[#0F2A4A]"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </VeteranLayout>
  );
}
