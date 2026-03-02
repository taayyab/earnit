import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import {
  UserPlus,
  Shield,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  Users,
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  Settings,
  Target,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  FileCheck,
  Folder,
  TrendingUp,
  Scale,
  RefreshCw,
  FileSearch,
  Loader2
} from 'lucide-react';
import { DenialSummaryCard, AppealRoadmap } from '../../components/appeals';
import { appealsAPI } from '../../lib/api';

const DEFAULT_CONSENT_TYPES = [
  {
    id: 'representation',
    label: 'Representation Consent',
    description: 'I authorize this organization to represent me before the VA in disability claims matters.',
    required: true
  },
  {
    id: 'phi_access',
    label: 'PHI Access Authorization',
    description: 'I authorize access to my Protected Health Information (PHI) for the purpose of preparing and supporting my VA disability claim.',
    required: true
  },
  {
    id: 'communication',
    label: 'Communication Consent',
    description: 'I consent to receive communications regarding my claim status via email and/or phone.',
    required: false
  },
  {
    id: 'third_party',
    label: 'Third-Party Information Sharing',
    description: 'I authorize sharing of claim-related information with approved third parties (e.g., medical providers) as needed.',
    required: false
  }
];

const DEFAULT_STEPS = [
  { id: 1, name: 'Veteran Information', icon: Users },
  { id: 2, name: 'Consent Authorization', icon: Shield },
  { id: 3, name: 'Power of Attorney', icon: FileText },
  { id: 4, name: 'Claim Pathway', icon: Target },
  { id: 5, name: 'Preparation & Scheduling', icon: Calendar },
  { id: 6, name: 'Confirmation', icon: CheckCircle2 }
];

const CLAIM_PATHWAYS = [
  {
    id: 'initial',
    label: 'Initial Claim',
    description: 'First-time claim for a new disability condition',
    icon: FileText,
    color: 'blue'
  },
  {
    id: 'increase',
    label: 'Increased Rating',
    description: 'Request for higher rating on existing service-connected disability',
    icon: TrendingUp,
    color: 'green'
  },
  {
    id: 'appeal',
    label: 'Appeal',
    description: 'Challenge a previous VA decision (HLR, Supplemental, or BVA)',
    icon: Scale,
    color: 'amber'
  },
  {
    id: 'secondary',
    label: 'Secondary Condition',
    description: 'New condition caused by or related to existing service-connected disability',
    icon: RefreshCw,
    color: 'purple'
  }
];

const CLAIM_OBJECTIVES = [
  { id: 'maximize_rating', label: 'Maximize disability rating', description: 'Focus on getting the highest possible rating' },
  { id: 'fast_resolution', label: 'Fastest possible resolution', description: 'Prioritize speed over optimization' },
  { id: 'specific_conditions', label: 'Specific conditions focus', description: 'Focus on particular conditions veteran cares about most' },
  { id: 'back_pay', label: 'Maximize back pay recovery', description: 'Establish earliest effective dates possible' },
  { id: 'secondary_claims', label: 'Explore secondary conditions', description: 'Identify all related conditions that may qualify' }
];

const DOCUMENT_CHECKLIST_INITIAL = [
  { id: 'dd214', label: 'DD-214 (Discharge Papers)', required: true, description: 'Certificate of Release or Discharge from Active Duty' },
  { id: 'service_records', label: 'Service Treatment Records', required: true, description: 'Medical records from active duty service' },
  { id: 'medical_records', label: 'Current Medical Records', required: true, description: 'Recent treatment records for claimed conditions' },
  { id: 'buddy_statements', label: 'Buddy Statements', required: false, description: 'Statements from fellow service members' },
  { id: 'nexus_letter', label: 'Nexus Letter', required: false, description: 'Medical opinion linking condition to service' },
  { id: 'dbq', label: 'Disability Benefits Questionnaire (DBQ)', required: false, description: 'Completed by treating physician' }
];

const DOCUMENT_CHECKLIST_INCREASE = [
  { id: 'rating_decision', label: 'Current Rating Decision Letter', required: true, description: 'Most recent VA decision showing current rating' },
  { id: 'medical_records', label: 'Recent Medical Records', required: true, description: 'Records showing worsening of condition' },
  { id: 'dbq', label: 'Updated DBQ', required: true, description: 'New questionnaire showing current severity' },
  { id: 'personal_statement', label: 'Personal Statement', required: false, description: 'Description of how condition has worsened' },
  { id: 'work_impact', label: 'Employment Impact Documentation', required: false, description: 'Evidence of work limitations' }
];

const DOCUMENT_CHECKLIST_APPEAL = [
  { id: 'decision_letter', label: 'VA Decision Letter Being Appealed', required: true, description: 'The decision you are challenging' },
  { id: 'soc', label: 'Statement of the Case (if applicable)', required: false, description: 'VA response to your Notice of Disagreement' },
  { id: 'new_evidence', label: 'New & Relevant Evidence', required: true, description: 'Evidence not previously considered by VA' },
  { id: 'medical_opinion', label: 'Independent Medical Opinion', required: false, description: 'Expert opinion supporting your appeal' },
  { id: 'legal_brief', label: 'Legal Brief/Argument', required: false, description: 'Written argument for appeal (optional)' }
];

const DOCUMENT_CHECKLIST_SECONDARY = [
  { id: 'rating_decision', label: 'Current Rating Decision', required: true, description: 'Showing existing service-connected condition' },
  { id: 'medical_records', label: 'Medical Records for New Condition', required: true, description: 'Diagnosis and treatment records' },
  { id: 'nexus_letter', label: 'Nexus Letter', required: true, description: 'Medical opinion connecting conditions' },
  { id: 'dbq', label: 'DBQ for Secondary Condition', required: false, description: 'Completed questionnaire for new condition' }
];

const COMMUNICATION_PREFERENCES = [
  { id: 'email', label: 'Email', icon: Mail, description: 'Receive updates via email' },
  { id: 'phone', label: 'Phone Calls', icon: Phone, description: 'Receive calls for important updates' },
  { id: 'text', label: 'Text Messages', icon: MessageSquare, description: 'Quick updates via SMS' }
];

const CONTACT_FREQUENCY = [
  { id: 'weekly', label: 'Weekly check-ins' },
  { id: 'biweekly', label: 'Bi-weekly check-ins' },
  { id: 'monthly', label: 'Monthly check-ins' },
  { id: 'as_needed', label: 'Only when there are updates' }
];

const SCHEDULING_PREFERENCES = [
  { id: 'morning', label: 'Morning (8am - 12pm)' },
  { id: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
  { id: 'evening', label: 'Evening (5pm - 8pm)' }
];

export default function VeteranClientOnboarding() {
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeConsentTypes, setActiveConsentTypes] = useState(DEFAULT_CONSENT_TYPES);
  const [activeSteps, setActiveSteps] = useState(DEFAULT_STEPS);
  const [veteranData, setVeteranData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [consents, setConsents] = useState({});
  const [poaData, setPoaData] = useState({
    formType: '21-22a',
    hasUploadedPOA: false,
    poaDocumentPath: null
  });
  const [claimPathway, setClaimPathway] = useState({
    type: null,
    objectives: [],
    priorityConditions: ''
  });
  const [documentChecklist, setDocumentChecklist] = useState({});
  const [communicationPrefs, setCommunicationPrefs] = useState({
    channels: ['email'],
    frequency: 'weekly',
    schedulingPreference: 'morning',
    scheduleFirstTouch: true,
    firstTouchDate: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [clientLinkId, setClientLinkId] = useState(null);
  
  const [appealState, setAppealState] = useState({
    caseId: null,
    analysisData: null,
    roadmapData: null,
    isAnalyzing: false,
    isUploading: false,
    denialLetterUploaded: false,
    denialLetterDocumentId: null
  });

  useEffect(() => {
    loadOrganization();
  }, []);

  useEffect(() => {
    if (organizationId) {
      loadTemplates();
    }
  }, [organizationId]);

  const getStepIcon = (stepId) => {
    const iconMap = {
      'veteran_info': Users,
      'consent': Shield,
      'consents': Shield,
      'consent_authorization': Shield,
      'poa': FileText,
      'power_of_attorney': FileText,
      'claim_pathway': Target,
      'claim_type': Target,
      'pathway': Target,
      'preparation': Calendar,
      'preparation_scheduling': Calendar,
      'scheduling': Calendar,
      'confirmation': CheckCircle2,
      'review': ClipboardList,
      'review_submit': ClipboardList,
      'submit': CheckCircle2,
      'personal_info': Users,
      'contact_info': Users,
      'service_data': FileText,
      'service_history': FileText,
      'military_service': FileText,
      'documents': Folder,
      'document_upload': Folder,
      'evidence': Folder,
      'communication': MessageSquare,
      'preferences': Clock,
      1: Users,
      2: Shield,
      3: FileText,
      4: Target,
      5: Calendar,
      6: CheckCircle2
    };
    return iconMap[stepId] || ClipboardList;
  };

  const getDocumentChecklist = () => {
    switch (claimPathway.type) {
      case 'initial': return DOCUMENT_CHECKLIST_INITIAL;
      case 'increase': return DOCUMENT_CHECKLIST_INCREASE;
      case 'appeal': return DOCUMENT_CHECKLIST_APPEAL;
      case 'secondary': return DOCUMENT_CHECKLIST_SECONDARY;
      default: return DOCUMENT_CHECKLIST_INITIAL;
    }
  };

  const handleClaimPathwayChange = (field, value) => {
    setClaimPathway(prev => ({ ...prev, [field]: value }));
    if (field === 'type') {
      const checklist = value === 'initial' ? DOCUMENT_CHECKLIST_INITIAL :
                        value === 'increase' ? DOCUMENT_CHECKLIST_INCREASE :
                        value === 'appeal' ? DOCUMENT_CHECKLIST_APPEAL :
                        value === 'secondary' ? DOCUMENT_CHECKLIST_SECONDARY :
                        DOCUMENT_CHECKLIST_INITIAL;
      setDocumentChecklist(checklist.reduce((acc, doc) => ({ ...acc, [doc.id]: false }), {}));
    }
  };

  const handleObjectiveToggle = (objectiveId) => {
    setClaimPathway(prev => ({
      ...prev,
      objectives: prev.objectives.includes(objectiveId)
        ? prev.objectives.filter(id => id !== objectiveId)
        : [...prev.objectives, objectiveId]
    }));
  };

  const handleDocumentChecklistChange = (docId, value) => {
    setDocumentChecklist(prev => ({ ...prev, [docId]: value }));
  };

  const handleCommunicationChange = (field, value) => {
    setCommunicationPrefs(prev => ({ ...prev, [field]: value }));
  };

  const handleChannelToggle = (channelId) => {
    setCommunicationPrefs(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(id => id !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const handleDenialLetterUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAppealState(prev => ({ ...prev, isUploading: true }));
    setError(null);

    try {
      const caseResponse = await appealsAPI.createCase({
        veteran_email: veteranData.email,
        veteran_name: `${veteranData.firstName} ${veteranData.lastName}`,
        organization_id: organizationId
      });
      
      const caseId = caseResponse.data.case_id || caseResponse.data.id;
      
      const uploadResponse = await appealsAPI.uploadDenialLetter(caseId, file);
      const documentId = uploadResponse.data.document_id || uploadResponse.data.id;

      setAppealState(prev => ({
        ...prev,
        caseId,
        denialLetterUploaded: true,
        denialLetterDocumentId: documentId,
        isUploading: false,
        isAnalyzing: true
      }));
      
      setDocumentChecklist(prev => ({ ...prev, decision_letter: true }));

      const analyzeResponse = await appealsAPI.analyzeCase(caseId, documentId);
      
      const [analysisResponse, roadmapResponse] = await Promise.all([
        appealsAPI.getAnalysis(caseId).catch(() => ({ data: analyzeResponse.data })),
        appealsAPI.getRoadmap(caseId).catch(() => ({ data: null }))
      ]);

      setAppealState(prev => ({
        ...prev,
        analysisData: analysisResponse.data,
        roadmapData: roadmapResponse.data,
        isAnalyzing: false
      }));

    } catch (err) {
      console.error('Error uploading/analyzing denial letter:', err);
      setError('Failed to upload or analyze the denial letter. Please try again.');
      setAppealState(prev => ({
        ...prev,
        isUploading: false,
        isAnalyzing: false
      }));
    }
  }, [veteranData, organizationId]);

  const handleVerifyIssue = useCallback(async (issueId, verified) => {
    try {
      await appealsAPI.verifyIssue(issueId, { verified });
      
      if (appealState.caseId) {
        const analysisResponse = await appealsAPI.getAnalysis(appealState.caseId);
        setAppealState(prev => ({
          ...prev,
          analysisData: analysisResponse.data
        }));
      }
    } catch (err) {
      console.error('Error verifying issue:', err);
      setError('Failed to update issue verification');
    }
  }, [appealState.caseId]);

  const handleRerunAnalysis = useCallback(async () => {
    if (!appealState.caseId || !appealState.denialLetterDocumentId) return;
    
    setAppealState(prev => ({ ...prev, isAnalyzing: true }));
    setError(null);
    
    try {
      await appealsAPI.analyzeCase(appealState.caseId, appealState.denialLetterDocumentId);
      
      const [analysisResponse, roadmapResponse] = await Promise.all([
        appealsAPI.getAnalysis(appealState.caseId),
        appealsAPI.getRoadmap(appealState.caseId)
      ]);

      setAppealState(prev => ({
        ...prev,
        analysisData: analysisResponse.data,
        roadmapData: roadmapResponse.data,
        isAnalyzing: false
      }));
    } catch (err) {
      console.error('Error re-running analysis:', err);
      setError('Failed to re-analyze the denial letter. Please try again.');
      setAppealState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [appealState.caseId, appealState.denialLetterDocumentId]);

  useEffect(() => {
    if (selectedTemplate) {
      const consentTypes = selectedTemplate.consent_types !== undefined
        ? (selectedTemplate.consent_types || [])
        : DEFAULT_CONSENT_TYPES;
      const steps = selectedTemplate.steps?.length
        ? selectedTemplate.steps.map((s, i) => ({ 
            ...s, 
            step_id: s.step_id || s.id,
            position: i + 1,
            id: i + 1,
            icon: getStepIcon(s.step_id || s.id || i + 1) 
          }))
        : DEFAULT_STEPS;
      setActiveSteps(steps);
      setActiveConsentTypes(consentTypes);
      setConsents(consentTypes.reduce((acc, c) => ({ ...acc, [c.id]: false }), {}));
      setCurrentStep(1);
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/partner/organization/${organizationId}/onboarding-templates`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
        const defaultTemplate = data.templates?.find(t => t.is_default);
        if (defaultTemplate) {
          loadFullTemplate(defaultTemplate.id);
        } else if (data.templates?.length === 0) {
          setActiveConsentTypes(DEFAULT_CONSENT_TYPES);
          setConsents(DEFAULT_CONSENT_TYPES.reduce((acc, c) => ({ ...acc, [c.id]: false }), {}));
          setCurrentStep(1);
        }
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      setActiveConsentTypes(DEFAULT_CONSENT_TYPES);
      setConsents(DEFAULT_CONSENT_TYPES.reduce((acc, c) => ({ ...acc, [c.id]: false }), {}));
      setCurrentStep(1);
    }
  };

  const loadFullTemplate = async (templateId) => {
    try {
      const response = await fetch(`/api/partner/organization/${organizationId}/onboarding-templates/${templateId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedTemplate(data.template);
      }
    } catch (err) {
      console.error('Failed to load template:', err);
    }
  };

  const loadOrganization = async () => {
    try {
      const response = await fetch('/api/partner/organization', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to load organization');
      }
      
      const data = await response.json();
      
      if (!data.organization) {
        navigate('/partner/register');
        return;
      }
      
      setOrganizationId(data.organization.id);
    } catch (err) {
      console.error('Failed to load organization:', err);
      setError('Failed to load organization. Please try again.');
    }
  };

  const handleVeteranInputChange = (field, value) => {
    setVeteranData(prev => ({ ...prev, [field]: value }));
  };

  const handleConsentChange = (consentId, value) => {
    setConsents(prev => ({ ...prev, [consentId]: value }));
  };

  const validateStep1 = () => {
    if (!veteranData.email || !veteranData.firstName || !veteranData.lastName) {
      setError('Please fill in all required fields');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(veteranData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!activeConsentTypes || activeConsentTypes.length === 0) {
      setError(null);
      return true;
    }
    const requiredConsents = activeConsentTypes.filter(c => c.required);
    const allRequiredGiven = requiredConsents.every(c => consents[c.id]);
    if (!allRequiredGiven) {
      setError('Please provide all required consents');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep4 = () => {
    if (!claimPathway.type) {
      setError('Please select a claim pathway');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep5 = () => {
    if (communicationPrefs.channels.length === 0) {
      setError('Please select at least one communication channel');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (!getCurrentStepValidation()) return;
    if (currentStep < activeSteps.length) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    navigate('/partner/dashboard');
  };

  const handleSubmit = async () => {
    if (!organizationId) {
      setError('Organization not loaded. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const consentPayload = Object.entries(consents).map(([type, given]) => ({
        consent_type: type,
        consent_given: given
      }));

      const response = await fetch(`/api/partner/organization/${organizationId}/clients/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          veteran_email: veteranData.email,
          veteran_first_name: veteranData.firstName,
          veteran_last_name: veteranData.lastName,
          veteran_phone: veteranData.phone || null,
          consents: consentPayload,
          claim_pathway: {
            type: claimPathway.type,
            objectives: claimPathway.objectives,
            priority_conditions: claimPathway.priorityConditions
          },
          appeal_case_id: appealState.caseId || null,
          document_readiness: Object.entries(documentChecklist).map(([docId, ready]) => ({
            document_id: docId,
            is_ready: ready
          })),
          communication_preferences: {
            channels: communicationPrefs.channels,
            frequency: communicationPrefs.frequency,
            scheduling_preference: communicationPrefs.schedulingPreference,
            schedule_first_touch: communicationPrefs.scheduleFirstTouch,
            first_touch_date: communicationPrefs.firstTouchDate || null,
            notes: communicationPrefs.notes || null
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        setClientLinkId(result.client_link_id);
        
        if (poaData.hasUploadedPOA && result.client_link_id) {
          await recordPOA(result.client_link_id);
        }
        
        setSuccess(true);
      } else {
        const errorData = await response.json();
        if (errorData.detail?.error) {
          setError(errorData.detail.error);
        } else if (typeof errorData.detail === 'string') {
          setError(errorData.detail);
        } else {
          setError('Failed to onboard veteran client. Please try again.');
        }
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const recordPOA = async (linkId) => {
    try {
      await fetch(`/api/partner/organization/${organizationId}/clients/${linkId}/poa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          form_type: poaData.formType,
          poa_document_path: poaData.poaDocumentPath
        })
      });
    } catch (err) {
      console.error('Failed to record POA:', err);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <nav aria-label="Onboarding progress">
        <ol className="flex items-center justify-center space-x-4">
          {activeSteps.map((step, index) => {
            const Icon = step.icon || ClipboardList;
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            
            return (
              <li key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${isComplete ? 'bg-green-600 border-green-600' : ''}
                  ${isActive ? 'bg-[#1B3A5F] border-[#1B3A5F]' : ''}
                  ${!isActive && !isComplete ? 'border-slate-300 bg-white' : ''}
                `}>
                  <Icon 
                    className={`w-5 h-5 ${isActive || isComplete ? 'text-white' : 'text-slate-400'}`}
                    aria-hidden="true"
                  />
                </div>
                <span className={`ml-2 text-sm font-medium hidden md:inline ${isActive ? 'text-[#1B3A5F]' : 'text-slate-500'}`}>
                  {step.name}
                </span>
                {index < activeSteps.length - 1 && (
                  <div className={`w-8 md:w-12 h-0.5 mx-2 md:mx-4 ${isComplete ? 'bg-green-600' : 'bg-slate-200'}`} />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Veteran Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 mb-4">
          Enter the veteran's contact information to begin the onboarding process.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={veteranData.firstName}
              onChange={(e) => handleVeteranInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={veteranData.lastName}
              onChange={(e) => handleVeteranInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={veteranData.email}
            onChange={(e) => handleVeteranInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={veteranData.phone}
            onChange={(e) => handleVeteranInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> An invitation will be sent to the veteran's email address 
            to create their account and complete identity verification via ID.me.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => {
    const consentList = Array.isArray(activeConsentTypes) ? activeConsentTypes : [];
    
    if (consentList.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
              Consent Authorization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                No additional consents are required for this onboarding template.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
            Consent Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            The veteran must provide the following consents before representation can begin.
            Required consents are marked with an asterisk (*).
          </p>

          <div className="space-y-4">
            {consentList.map(consent => (
              <div
                key={consent.id}
                className={`p-4 border rounded-lg transition-colors ${
                  consents[consent.id] 
                    ? 'border-green-300 bg-green-50' 
                    : consent.required 
                      ? 'border-amber-200 bg-amber-50' 
                      : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={consent.id}
                    checked={consents[consent.id]}
                    onChange={(e) => handleConsentChange(consent.id, e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                  />
                  <div className="flex-1">
                    <label htmlFor={consent.id} className="text-sm font-medium text-slate-900 cursor-pointer">
                      {consent.label} {consent.required && <span className="text-red-500">*</span>}
                    </label>
                    <p className="text-sm text-slate-600 mt-1">{consent.description}</p>
                  </div>
                  {consents[consent.id] && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mt-6">
            <p className="text-xs text-slate-600">
              <strong>HIPAA Notice:</strong> All consents are logged and stored securely in compliance with 
              HIPAA regulations. Veterans may revoke consent at any time by contacting your organization.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Power of Attorney
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-slate-600">
          Upload a signed VA Form 21-22 or 21-22a to authorize your organization to represent 
          this veteran before the VA.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              POA Form Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="poaFormType"
                  value="21-22"
                  checked={poaData.formType === '21-22'}
                  onChange={(e) => setPoaData(prev => ({ ...prev, formType: e.target.value }))}
                  className="text-[#1B3A5F] focus:ring-[#1B3A5F]"
                />
                <span className="text-sm">VA Form 21-22 (VSO)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="poaFormType"
                  value="21-22a"
                  checked={poaData.formType === '21-22a'}
                  onChange={(e) => setPoaData(prev => ({ ...prev, formType: e.target.value }))}
                  className="text-[#1B3A5F] focus:ring-[#1B3A5F]"
                />
                <span className="text-sm">VA Form 21-22a (Attorney/Agent)</span>
              </label>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            {poaData.hasUploadedPOA ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
                <p className="text-sm font-medium text-green-700">POA document uploaded</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPoaData(prev => ({ ...prev, hasUploadedPOA: false, poaDocumentPath: null }))}
                >
                  Replace Document
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-12 h-12 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Drag and drop your signed POA form here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF format, max 10MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPoaData(prev => ({ ...prev, hasUploadedPOA: true, poaDocumentPath: '/uploads/poa-temp.pdf' }))}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> The POA must be signed by the veteran and include all required 
              information. Incomplete forms will delay the onboarding process.
            </p>
          </div>

          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              You can skip this step and upload the POA later. However, you will not be able to 
              submit claims on behalf of the veteran until a valid POA is on file.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => {
    const currentChecklist = getDocumentChecklist();
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
            Claim Pathway & Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-slate-900 mb-3">Select Claim Type</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {CLAIM_PATHWAYS.map(pathway => {
                const Icon = pathway.icon;
                const isSelected = claimPathway.type === pathway.id;
                const colorClasses = {
                  blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300',
                  green: isSelected ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-300',
                  amber: isSelected ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-300',
                  purple: isSelected ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:border-blue-200'
                };
                
                return (
                  <button
                    key={pathway.id}
                    type="button"
                    onClick={() => handleClaimPathwayChange('type', pathway.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${colorClasses[pathway.color]}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-6 h-6 ${isSelected ? `text-${pathway.color}-600` : 'text-slate-400'}`} />
                      <div>
                        <h4 className="font-medium text-slate-900">{pathway.label}</h4>
                        <p className="text-sm text-slate-600 mt-1">{pathway.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className={`w-5 h-5 text-${pathway.color}-600 ml-auto`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-slate-900 mb-3">Veteran's Priorities</h3>
            <p className="text-sm text-slate-600 mb-4">
              What matters most to this veteran? Select all that apply.
            </p>
            <div className="space-y-3">
              {CLAIM_OBJECTIVES.map(objective => (
                <label
                  key={objective.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    claimPathway.objectives.includes(objective.id)
                      ? 'border-[#1B3A5F] bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={claimPathway.objectives.includes(objective.id)}
                    onChange={() => handleObjectiveToggle(objective.id)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                  />
                  <div>
                    <span className="font-medium text-slate-900">{objective.label}</span>
                    <p className="text-sm text-slate-600">{objective.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="priorityConditions" className="block text-sm font-medium text-slate-700 mb-2">
              Priority Conditions (Optional)
            </label>
            <textarea
              id="priorityConditions"
              value={claimPathway.priorityConditions}
              onChange={(e) => handleClaimPathwayChange('priorityConditions', e.target.value)}
              placeholder="List specific conditions the veteran wants to prioritize (e.g., PTSD, back injury, hearing loss)"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
            />
          </div>

          {claimPathway.type && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Documents Needed for {CLAIM_PATHWAYS.find(p => p.id === claimPathway.type)?.label}
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                {currentChecklist.filter(d => d.required).map(doc => (
                  <li key={doc.id} className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    {doc.label} <span className="text-red-500">*</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStep5 = () => {
    const checklist = getDocumentChecklist();
    const selectedPathway = CLAIM_PATHWAYS.find(p => p.id === claimPathway.type);
    const isAppealPathway = claimPathway.type === 'appeal';
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
            Preparation & Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAppealPathway && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-[#1B3A5F]" />
                  Denial Letter Analysis
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Appeal</Badge>
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Upload the VA decision letter being appealed. We'll automatically extract the denial reasons and create a personalized appeal strategy.
                </p>
              </div>
              
              {!appealState.denialLetterUploaded ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <FileSearch className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="font-medium text-slate-900 mb-2">Upload VA Decision Letter</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    PDF, DOC, or image format accepted
                  </p>
                  <label>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleDenialLetterUpload}
                      disabled={appealState.isUploading}
                    />
                    <Button asChild disabled={appealState.isUploading}>
                      <span>
                        {appealState.isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Select Decision Letter
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Denial letter uploaded successfully
                    </AlertDescription>
                  </Alert>
                  
                  {appealState.isAnalyzing && (
                    <Card>
                      <CardContent className="py-6">
                        <div className="flex items-center gap-4">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium">Analyzing denial letter...</p>
                            <p className="text-sm text-muted-foreground">
                              Extracting denial reasons and generating appeal strategy
                            </p>
                            <Progress value={45} className="mt-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {appealState.analysisData && !appealState.isAnalyzing && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">AI-Extracted Denial Information</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRerunAnalysis}
                          disabled={appealState.isAnalyzing}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-analyze
                        </Button>
                      </div>
                      
                      <DenialSummaryCard 
                        analysisData={appealState.analysisData} 
                        onVerifyIssue={handleVerifyIssue}
                      />
                    </div>
                  )}
                  
                  {appealState.roadmapData && !appealState.isAnalyzing && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">Evidence Roadmap</h4>
                      <AppealRoadmap 
                        roadmap={appealState.roadmapData}
                        onStepClick={() => {}}
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-slate-900 mb-3">Additional Documents</h4>
                <div className="space-y-3">
                  {checklist.filter(doc => doc.id !== 'decision_letter').map(doc => (
                    <label
                      key={doc.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        documentChecklist[doc.id]
                          ? 'border-green-300 bg-green-50'
                          : doc.required
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={documentChecklist[doc.id] || false}
                        onChange={(e) => handleDocumentChecklistChange(doc.id, e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-slate-900">
                          {doc.label} {doc.required && <span className="text-red-500">*</span>}
                        </span>
                        <p className="text-sm text-slate-600">{doc.description}</p>
                      </div>
                      {documentChecklist[doc.id] && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {!isAppealPathway && (
            <div>
              <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#1B3A5F]" />
                Document Readiness Checklist
                {selectedPathway && <Badge variant="outline">{selectedPathway.label}</Badge>}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Check off documents the veteran already has. This helps us prepare their personalized roadmap.
              </p>
              <div className="space-y-3">
                {checklist.map(doc => (
                  <label
                    key={doc.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      documentChecklist[doc.id]
                        ? 'border-green-300 bg-green-50'
                        : doc.required
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={documentChecklist[doc.id] || false}
                      onChange={(e) => handleDocumentChecklistChange(doc.id, e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-slate-900">
                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                      </span>
                      <p className="text-sm text-slate-600">{doc.description}</p>
                    </div>
                    {documentChecklist[doc.id] && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#1B3A5F]" />
              Communication Preferences
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              How does the veteran prefer to be contacted?
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {COMMUNICATION_PREFERENCES.map(pref => {
                const Icon = pref.icon;
                const isSelected = communicationPrefs.channels.includes(pref.id);
                return (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => handleChannelToggle(pref.id)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      isSelected
                        ? 'border-[#1B3A5F] bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-[#1B3A5F]' : 'text-slate-400'}`} />
                    <span className="font-medium text-sm">{pref.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Preferred Contact Frequency
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CONTACT_FREQUENCY.map(freq => (
                <label
                  key={freq.id}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    communicationPrefs.frequency === freq.id
                      ? 'border-[#1B3A5F] bg-blue-50'
                      : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={freq.id}
                    checked={communicationPrefs.frequency === freq.id}
                    onChange={() => handleCommunicationChange('frequency', freq.id)}
                    className="text-[#1B3A5F] focus:ring-[#1B3A5F]"
                  />
                  <span className="text-sm">{freq.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1B3A5F]" />
                Schedule First-Touch Meeting
              </h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={communicationPrefs.scheduleFirstTouch}
                  onChange={(e) => handleCommunicationChange('scheduleFirstTouch', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                />
                <span className="text-sm">Schedule now</span>
              </label>
            </div>
            
            {communicationPrefs.scheduleFirstTouch && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Time of Day
                  </label>
                  <div className="flex gap-3">
                    {SCHEDULING_PREFERENCES.map(pref => (
                      <label
                        key={pref.id}
                        className={`flex-1 p-2 border rounded-lg text-center cursor-pointer text-sm transition-colors ${
                          communicationPrefs.schedulingPreference === pref.id
                            ? 'border-[#1B3A5F] bg-blue-50'
                            : 'border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="scheduleTime"
                          value={pref.id}
                          checked={communicationPrefs.schedulingPreference === pref.id}
                          onChange={() => handleCommunicationChange('schedulingPreference', pref.id)}
                          className="sr-only"
                        />
                        {pref.label}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="firstTouchDate" className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="firstTouchDate"
                    value={communicationPrefs.firstTouchDate}
                    onChange={(e) => handleCommunicationChange('firstTouchDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={communicationPrefs.notes}
              onChange={(e) => handleCommunicationChange('notes', e.target.value)}
              placeholder="Any special considerations, accessibility needs, or important information about this veteran..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStep6 = () => {
    const selectedPathway = CLAIM_PATHWAYS.find(p => p.id === claimPathway.type);
    const selectedObjectives = CLAIM_OBJECTIVES.filter(o => claimPathway.objectives.includes(o.id));
    const checklist = getDocumentChecklist();
    const docsReady = checklist.filter(d => documentChecklist[d.id]);
    const docsMissing = checklist.filter(d => !documentChecklist[d.id] && d.required);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
            Confirm & Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium text-slate-900 mb-3">Veteran Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Name:</dt>
                  <dd className="font-medium">{veteranData.firstName} {veteranData.lastName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Email:</dt>
                  <dd className="font-medium">{veteranData.email}</dd>
                </div>
                {veteranData.phone && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Phone:</dt>
                    <dd className="font-medium">{veteranData.phone}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium text-slate-900 mb-3">Consents Provided</h3>
              <ul className="space-y-2">
                {(activeConsentTypes || []).filter(c => consents[c.id]).map(consent => (
                  <li key={consent.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    {consent.label}
                  </li>
                ))}
                {(!activeConsentTypes || activeConsentTypes.length === 0) && (
                  <li className="text-sm text-slate-500">No consents required</li>
                )}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-3">Power of Attorney</h3>
            <div className="flex items-center gap-2">
              {poaData.hasUploadedPOA ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm">VA Form {poaData.formType} uploaded</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-amber-700">POA not yet uploaded - can be added later</span>
                </>
              )}
            </div>
          </div>

          {selectedPathway && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Claim Pathway
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#1B3A5F]">{selectedPathway.label}</Badge>
              </div>
              {selectedObjectives.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-blue-800 font-medium mb-2">Priorities:</p>
                  <ul className="space-y-1">
                    {selectedObjectives.map(obj => (
                      <li key={obj.id} className="text-sm text-blue-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {obj.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Documents Ready ({docsReady.length})
              </h3>
              {docsReady.length > 0 ? (
                <ul className="space-y-1 text-sm text-green-800">
                  {docsReady.map(doc => (
                    <li key={doc.id} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {doc.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-700">No documents marked as ready yet</p>
              )}
            </div>

            {docsMissing.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Documents Needed ({docsMissing.length})
                </h3>
                <ul className="space-y-1 text-sm text-amber-800">
                  {docsMissing.map(doc => (
                    <li key={doc.id}>{doc.label}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {claimPathway.type === 'appeal' && appealState.analysisData && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                <FileSearch className="w-5 h-5" />
                Appeal Analysis Summary
              </h3>
              <div className="space-y-2 text-sm">
                {appealState.analysisData.summary && (
                  <p className="text-amber-800">{appealState.analysisData.summary}</p>
                )}
                {appealState.analysisData.deniedConditions?.length > 0 && (
                  <div>
                    <p className="font-medium text-amber-900">Identified Denied Conditions:</p>
                    <ul className="mt-1 space-y-1 text-amber-800">
                      {appealState.analysisData.deniedConditions.map((condition, index) => (
                        <li key={condition.id || index} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          {condition.name}
                          {condition.diagnosticCode && (
                            <Badge variant="outline" className="text-xs">
                              Code: {condition.diagnosticCode}
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Communication Plan
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Channels:</dt>
                <dd className="font-medium">
                  {communicationPrefs.channels.map(c => 
                    COMMUNICATION_PREFERENCES.find(p => p.id === c)?.label
                  ).join(', ') || 'Not specified'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Frequency:</dt>
                <dd className="font-medium">
                  {CONTACT_FREQUENCY.find(f => f.id === communicationPrefs.frequency)?.label}
                </dd>
              </div>
              {communicationPrefs.scheduleFirstTouch && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">First Touch:</dt>
                  <dd className="font-medium">
                    {SCHEDULING_PREFERENCES.find(s => s.id === communicationPrefs.schedulingPreference)?.label}
                    {communicationPrefs.firstTouchDate && ` on ${communicationPrefs.firstTouchDate}`}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Next Steps After Onboarding</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
              <li>Veteran will receive an invitation email to create their account</li>
              <li>Veteran completes ID.me identity verification</li>
              {!poaData.hasUploadedPOA && <li>Upload signed Power of Attorney form</li>}
              {docsMissing.length > 0 && <li>Collect missing required documents</li>}
              {communicationPrefs.scheduleFirstTouch && <li>First-touch meeting scheduled</li>}
              <li>Begin claims assistance with personalized roadmap</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSuccess = () => {
    const selectedPathway = CLAIM_PATHWAYS.find(p => p.id === claimPathway.type);
    const checklist = getDocumentChecklist();
    const docsMissing = checklist.filter(d => !documentChecklist[d.id] && d.required);
    
    const onboardingData = {
      clientId: clientLinkId,
      claimPathway: claimPathway,
      documentChecklist: documentChecklist,
      communicationPrefs: communicationPrefs,
      appealCaseId: appealState.caseId,
      appealAnalysis: appealState.analysisData
    };
    
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Client Onboarded Successfully!</h2>
          <p className="text-slate-600 mb-6">
            {veteranData.firstName} {veteranData.lastName} has been added to your organization.
          </p>

          {selectedPathway && (
            <div className="p-4 bg-slate-50 rounded-lg mb-6 max-w-md mx-auto text-left">
              <h3 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#1B3A5F]" />
                Personalized Roadmap Created
              </h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Badge className="bg-[#1B3A5F]">{selectedPathway.label}</Badge>
                </p>
                {docsMissing.length > 0 && (
                  <p className="text-amber-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {docsMissing.length} document{docsMissing.length > 1 ? 's' : ''} needed before claim submission
                  </p>
                )}
                {communicationPrefs.scheduleFirstTouch && (
                  <p className="text-green-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    First-touch meeting to be scheduled
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6 max-w-md mx-auto">
            <h3 className="font-medium text-blue-900 mb-2">Ready to Start a Claim?</h3>
            <p className="text-sm text-blue-700 mb-3">
              Your personalized roadmap is ready. Start building the claim now with pre-filled information.
            </p>
            <Button 
              className="w-full bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white"
              onClick={() => navigate('/agent/create-claim', { state: onboardingData })}
            >
              <FileText className="w-4 h-4 mr-2" />
              Start Claim Now
            </Button>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline"
              onClick={() => {
                setCurrentStep(1);
                setVeteranData({ email: '', firstName: '', lastName: '', phone: '' });
                setConsents((activeConsentTypes || []).reduce((acc, c) => ({ ...acc, [c.id]: false }), {}));
                setPoaData({ formType: '21-22a', hasUploadedPOA: false, poaDocumentPath: null });
                setClaimPathway({ type: null, objectives: [], priorityConditions: '' });
                setDocumentChecklist({});
                setCommunicationPrefs({
                  channels: ['email'],
                  frequency: 'weekly',
                  schedulingPreference: 'morning',
                  scheduleFirstTouch: true,
                  firstTouchDate: '',
                  notes: ''
                });
                setAppealState({
                  caseId: null,
                  analysisData: null,
                  roadmapData: null,
                  isAnalyzing: false,
                  isUploading: false,
                  denialLetterUploaded: false,
                  denialLetterDocumentId: null
                });
                setSuccess(null);
                setClientLinkId(null);
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Another Client
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/partner/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getStepType = (step) => {
    return step.step_id || step.type || step.name?.toLowerCase().replace(/\s+/g, '_') || `step_${step.id}`;
  };

  const getStepRendererByType = (stepType) => {
    const typeRenderers = {
      'veteran_info': renderStep1,
      'veteran_information': renderStep1,
      'consent': renderStep2,
      'consent_authorization': renderStep2,
      'poa': renderStep3,
      'power_of_attorney': renderStep3,
      'claim_pathway': renderStep4,
      'claim_pathway_&_goals': renderStep4,
      'preparation': renderStep5,
      'preparation_&_scheduling': renderStep5,
      'preparation_scheduling': renderStep5,
      'confirmation': renderStep6,
      'confirm': renderStep6,
      'confirm_&_complete': renderStep6,
      '1': renderStep1,
      '2': renderStep2,
      '3': renderStep3,
      '4': renderStep4,
      '5': renderStep5,
      '6': renderStep6
    };
    const normalizedType = String(stepType || '').toLowerCase();
    return typeRenderers[normalizedType] || null;
  };

  const getCurrentStepValidation = () => {
    const currentStepData = activeSteps.find(s => s.id === currentStep);
    if (!currentStepData) return true;
    
    const stepType = String(getStepType(currentStepData) || '').toLowerCase();
    
    if (['veteran_info', 'veteran_information', '1'].includes(stepType)) {
      return validateStep1();
    }
    if (['consent', 'consent_authorization', '2'].includes(stepType)) {
      return validateStep2();
    }
    if (['claim_pathway', 'claim_pathway_&_goals', '4'].includes(stepType)) {
      return validateStep4();
    }
    if (['preparation', 'preparation_&_scheduling', 'preparation_scheduling', '5'].includes(stepType)) {
      return validateStep5();
    }
    
    return true;
  };

  const renderCurrentStep = () => {
    if (success) return renderSuccess();
    
    const currentStepData = activeSteps.find(s => s.id === currentStep);
    if (!currentStepData) return null;
    
    const stepType = getStepType(currentStepData);
    const renderer = getStepRendererByType(stepType);
    
    if (renderer) {
      return renderer();
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
            {currentStepData.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            {currentStepData.description || 'Complete this step to continue.'}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Onboard New Veteran Client</h1>
          <p className="text-slate-600 mt-1">
            Complete the following steps to add a veteran to your organization
          </p>
        </div>

        {!success && renderStepIndicator()}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {renderCurrentStep()}

        {!success && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={currentStep === 1 ? handleCancel : handleBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < activeSteps.length ? (
              <Button
                onClick={handleNext}
                className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white flex items-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Complete Onboarding'}
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
