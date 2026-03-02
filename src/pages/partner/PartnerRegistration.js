import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Building2, 
  FileText, 
  Shield, 
  Scale,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Users,
  CreditCard,
  Loader2,
  Target,
  Clock,
  UserPlus,
  MessageSquare,
  Zap
} from 'lucide-react';
import PartnerTermsOfService from '../legal/PartnerTermsOfService';
import HIPAABusinessAssociateAgreement from '../legal/HIPAABusinessAssociateAgreement';
import { useAuth } from '../../lib/auth-context';
import { useDraftSave } from '../../hooks/useDraftSave';

const STEPS = [
  { id: 1, name: 'Organization Info', icon: Building2 },
  { id: 2, name: 'License Selection', icon: CreditCard },
  { id: 3, name: 'Partner Terms', icon: FileText },
  { id: 4, name: 'HIPAA Agreement', icon: Shield },
  { id: 5, name: 'VA & Fee Disclosures', icon: Scale },
  { id: 6, name: 'Program Objectives', icon: Target },
  { id: 7, name: 'Review & Submit', icon: CheckCircle2 }
];

const INTAKE_GOALS = [
  { id: '10', label: '1-10 veterans/month', description: 'Small practice' },
  { id: '50', label: '11-50 veterans/month', description: 'Growing organization' },
  { id: '200', label: '51-200 veterans/month', description: 'Established practice' },
  { id: '500', label: '201-500 veterans/month', description: 'Large organization' },
  { id: 'unlimited', label: '500+ veterans/month', description: 'Enterprise scale' }
];

const SLA_TARGETS = [
  { id: '24h', label: 'Initial contact within 24 hours', category: 'response' },
  { id: '48h', label: 'Initial contact within 48 hours', category: 'response' },
  { id: '72h', label: 'Initial contact within 72 hours', category: 'response' },
  { id: '30day', label: 'Claim submission within 30 days', category: 'processing' },
  { id: '60day', label: 'Claim submission within 60 days', category: 'processing' },
  { id: '90day', label: 'Claim submission within 90 days', category: 'processing' }
];

const COLLABORATION_TOOLS = [
  { id: 'platform_messaging', label: 'Platform Messaging', description: 'In-app secure messaging' },
  { id: 'email', label: 'Email Updates', description: 'Regular email notifications' },
  { id: 'phone', label: 'Phone Consultations', description: 'Direct phone support' },
  { id: 'video', label: 'Video Meetings', description: 'VA Video Connect / Zoom' }
];

const TEAM_ROLES = [
  { id: 'claims_processor', label: 'Claims Processor', description: 'Handles claim documentation' },
  { id: 'case_manager', label: 'Case Manager', description: 'Oversees veteran cases' },
  { id: 'intake_specialist', label: 'Intake Specialist', description: 'Initial veteran contact' },
  { id: 'qa_reviewer', label: 'QA Reviewer', description: 'Reviews claims before submission' },
  { id: 'attorney', label: 'Attorney', description: 'Legal oversight and appeals' },
  { id: 'admin', label: 'Administrator', description: 'Team and billing management' }
];

const ESCALATION_PRIORITIES = [
  { id: 'urgent', label: 'Urgent (Same day)', description: 'Crisis or time-sensitive issues' },
  { id: 'high', label: 'High Priority (24 hours)', description: 'Important issues requiring quick attention' },
  { id: 'standard', label: 'Standard (48-72 hours)', description: 'Normal escalation path' }
];

const VSO_TIER = {
  id: 'vso_nonprofit',
  name: 'VSO Partner',
  price: 'No Platform Fee',
  monthlyEquivalent: 'Per 38 CFR 14.636',
  maxVeterans: 'Unlimited',
  platformFee: '0%',
  features: [
    'Full platform access',
    'Unlimited veterans',
    'Email & phone support',
    'Analytics & reporting',
    'Standard integrations',
    'No platform fees (per 38 CFR 14.636)'
  ],
  recommended: true
};

const PAID_LICENSE_TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$6,000/year',
    monthlyEquivalent: '$500/month',
    maxVeterans: '50 veterans/month',
    platformFee: '10%',
    features: [
      'Full platform access',
      'Up to 50 veterans per month',
      'Email support',
      'Basic analytics',
      'Standard integrations'
    ],
    recommended: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$24,000/year',
    monthlyEquivalent: '$2,000/month',
    maxVeterans: '500 veterans/month',
    platformFee: '8%',
    features: [
      'Full platform access',
      'Up to 500 veterans per month',
      'Priority support',
      'Advanced analytics & reporting',
      'Custom branding',
      'API access'
    ],
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$60,000/year',
    monthlyEquivalent: '$5,000/month',
    maxVeterans: 'Unlimited',
    platformFee: '5%',
    features: [
      'Full platform access',
      'Unlimited veterans',
      'Dedicated account manager',
      'Enterprise analytics',
      'Custom integrations',
      'White-label options',
      'SLA guarantees'
    ],
    recommended: false
  }
];

const LICENSE_TIERS = [VSO_TIER, ...PAID_LICENSE_TIERS];

const ORG_TYPES = [
  { id: 'vso', name: 'Veterans Service Organization (VSO)', requiresAccreditation: true },
  { id: 'law_firm', name: 'Law Firm', requiresAccreditation: true },
  { id: 'claims_agent', name: 'Claims Agent', requiresAccreditation: true }
];

export default function PartnerRegistration() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    vaAccreditationNumber: '',
    contactEmail: '',
    contactPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'TX',
    zipCode: '',
    signerName: '',
    signerTitle: '',
    licenseTier: 'professional',
    ein: '',
    stateBarNumber: '',
    stateOfIncorporation: '',
    businessEntityType: '',
    website: '',
    repFirstName: '',
    repLastName: '',
    objectives: {
      intakeGoal: '50',
      slaResponseTime: '48h',
      slaProcessingTime: '60day',
      collaborationTools: ['platform_messaging', 'email'],
      teamRoles: ['claims_processor', 'case_manager'],
      escalationPriority: 'standard',
      successRateTarget: 75,
      teamSize: 1
    }
  });
  const [agreements, setAgreements] = useState({
    partnerTos: null,
    hipaaBaa: null,
    vaAccreditation: null,
    feeDisclosure: null
  });
  const [errors, setErrors] = useState({});

  const {
    saveDraft,
    clearDraft,
    handleImportantFieldChange,
    hasDraft,
    DraftSavedIndicator,
    ResumeDraftPrompt,
    resumeDraft,
    discardDraft,
  } = useDraftSave('partner_registration', formData, setFormData, {
    importantFields: ['organizationName', 'contactEmail', 'vaAccreditationNumber', 'signerName'],
  });

  const isVSO = formData.organizationType === 'vso';

  const importantFields = ['organizationName', 'contactEmail', 'vaAccreditationNumber', 'signerName', 'signerTitle'];

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'organizationType' && value === 'vso') {
        updated.licenseTier = 'vso_nonprofit';
      }
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImportantFieldBlur = (field) => {
    if (importantFields.includes(field)) {
      handleImportantFieldChange();
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.organizationName) newErrors.organizationName = 'Organization name is required';
    if (!formData.organizationType) newErrors.organizationType = 'Organization type is required';
    if (!formData.vaAccreditationNumber) newErrors.vaAccreditationNumber = 'VA accreditation number is required';
    if (!formData.contactEmail) newErrors.contactEmail = 'Contact email is required';
    if (!formData.signerName) newErrors.signerName = 'Authorized signer name is required';
    if (!formData.signerTitle) newErrors.signerTitle = 'Signer title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep < 7) {
      if (currentStep === 1 && isVSO) {
        setCurrentStep(3);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      if (currentStep === 3 && isVSO) {
        setCurrentStep(1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handlePartnerTosAccept = (data) => {
    setAgreements(prev => ({ ...prev, partnerTos: data }));
    handleNext();
  };

  const handleHipaaBaaAccept = (data) => {
    setAgreements(prev => ({ ...prev, hipaaBaa: data }));
    handleNext();
  };

  const handleVaFeeDisclosuresAccept = (vaAccreditation, feeDisclosure) => {
    setAgreements(prev => ({ 
      ...prev, 
      vaAccreditation,
      feeDisclosure 
    }));
    handleNext();
  };

  const handleObjectiveChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      objectives: {
        ...prev.objectives,
        [field]: value
      }
    }));
  };

  const handleObjectiveToggle = (field, value) => {
    setFormData(prev => {
      const current = prev.objectives[field] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return {
        ...prev,
        objectives: {
          ...prev.objectives,
          [field]: updated
        }
      };
    });
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !token) {
      setSubmitError('Please log in to register your organization.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const agreementPayload = [
      {
        agreement_type: 'partner_tos',
        agreement_version: agreements.partnerTos?.agreement_version || '1.0.0',
        signer_name: formData.signerName,
        signer_title: formData.signerTitle,
        agreement_hash: agreements.partnerTos?.agreement_hash || ''
      },
      {
        agreement_type: 'hipaa_baa',
        agreement_version: agreements.hipaaBaa?.agreement_version || '1.0.0',
        signer_name: formData.signerName,
        signer_title: formData.signerTitle,
        agreement_hash: agreements.hipaaBaa?.agreement_hash || ''
      },
      {
        agreement_type: 'va_accreditation',
        agreement_version: '1.0.0',
        signer_name: formData.signerName,
        signer_title: formData.signerTitle,
        agreement_hash: ''
      },
      {
        agreement_type: 'fee_disclosure',
        agreement_version: '1.0.0',
        signer_name: formData.signerName,
        signer_title: formData.signerTitle,
        agreement_hash: ''
      }
    ];

    const registrationData = {
      name: formData.organizationName,
      organization_type: formData.organizationType,
      va_accreditation_number: formData.vaAccreditationNumber,
      license_tier: formData.licenseTier,
      contact_email: formData.contactEmail,
      contact_phone: formData.contactPhone,
      address: {
        line1: formData.addressLine1,
        line2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode
      },
      company_info: {
        ein: formData.ein || null,
        state_bar_number: formData.stateBarNumber || null,
        state_of_incorporation: formData.stateOfIncorporation || null,
        business_entity_type: formData.businessEntityType || null,
        website: formData.website || null
      },
      primary_representative: {
        first_name: formData.repFirstName || formData.signerName.split(' ')[0],
        last_name: formData.repLastName || formData.signerName.split(' ').slice(1).join(' '),
        accreditation_type: formData.organizationType === 'law_firm' ? 'attorney' : 
                           formData.organizationType === 'claims_agent' ? 'claims_agent' : 'vso_rep',
        record_number: formData.vaAccreditationNumber || null
      },
      signer_name: formData.signerName,
      signer_title: formData.signerTitle,
      signed_agreements: agreementPayload,
      program_objectives: {
        intake_goal: formData.objectives.intakeGoal,
        sla_response_time: formData.objectives.slaResponseTime,
        sla_processing_time: formData.objectives.slaProcessingTime,
        collaboration_tools: formData.objectives.collaborationTools,
        team_roles: formData.objectives.teamRoles,
        escalation_priority: formData.objectives.escalationPriority,
        success_rate_target: formData.objectives.successRateTarget,
        team_size: formData.objectives.teamSize
      }
    };

    try {
      const response = await fetch('/api/partner/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(registrationData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Record consent for each accepted agreement to create audit trail
        const consentTypes = [
          { type: 'partner_tos', version: agreements.partnerTos?.agreement_version || '1.0.0' },
          { type: 'hipaa_baa', version: agreements.hipaaBaa?.agreement_version || '1.0.0' },
          { type: 'privacy_policy', version: '1.0.0' },
          { type: 'terms_of_service', version: '1.0.0' }
        ];
        
        // Record consents in parallel (non-blocking - don't fail registration if consent tracking fails)
        try {
          await Promise.all(consentTypes.map(consent =>
            fetch('/api/consents', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                agreement_type: consent.type,
                agreement_version: consent.version,
                acceptance_context: 'partner_registration',
                organization_id: result.organization_id || null,
                acceptances_detail: {
                  signer_name: formData.signerName,
                  signer_title: formData.signerTitle,
                  organization_name: formData.organizationName
                }
              })
            })
          ));
        } catch (consentErr) {
          console.warn('Failed to record consents:', consentErr);
          // Continue with registration success even if consent tracking fails
        }
        
        clearDraft();
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/partner/dashboard');
        }, 2000);
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'object' 
          ? error.detail.error || JSON.stringify(error.detail)
          : error.detail || 'Registration failed. Please try again.';
        setSubmitError(errorMessage);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <nav aria-label="Registration progress">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <li key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2
                  ${isComplete ? 'bg-green-600 border-green-600 text-white' : ''}
                  ${isCurrent ? 'bg-[#1B3A5F] border-[#1B3A5F] text-white' : ''}
                  ${!isComplete && !isCurrent ? 'bg-white border-slate-300 text-slate-400' : ''}
                `}>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.name}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${isComplete ? 'bg-green-600' : 'bg-slate-200'}`} />
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
          <Building2 className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Organization Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="organizationName" className="block text-sm font-medium text-slate-700 mb-1">
            Organization Name *
          </label>
          <input
            id="organizationName"
            type="text"
            value={formData.organizationName}
            onChange={(e) => handleInputChange('organizationName', e.target.value)}
            onBlur={() => handleImportantFieldBlur('organizationName')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
              errors.organizationName ? 'border-red-500' : 'border-slate-300'
            }`}
            aria-invalid={!!errors.organizationName}
            aria-describedby={errors.organizationName ? 'organizationName-error' : undefined}
          />
          {errors.organizationName && (
            <p id="organizationName-error" className="mt-1 text-sm text-red-600">{errors.organizationName}</p>
          )}
        </div>

        <div>
          <label htmlFor="organizationType" className="block text-sm font-medium text-slate-700 mb-1">
            Organization Type *
          </label>
          <select
            id="organizationType"
            value={formData.organizationType}
            onChange={(e) => handleInputChange('organizationType', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
              errors.organizationType ? 'border-red-500' : 'border-slate-300'
            }`}
            aria-invalid={!!errors.organizationType}
          >
            <option value="">Select organization type</option>
            {ORG_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          {errors.organizationType && (
            <p className="mt-1 text-sm text-red-600">{errors.organizationType}</p>
          )}
        </div>

        <div>
          <label htmlFor="vaAccreditationNumber" className="block text-sm font-medium text-slate-700 mb-1">
            VA OGC Accreditation Number *
          </label>
          <input
            id="vaAccreditationNumber"
            type="text"
            value={formData.vaAccreditationNumber}
            onChange={(e) => handleInputChange('vaAccreditationNumber', e.target.value)}
            onBlur={() => handleImportantFieldBlur('vaAccreditationNumber')}
            placeholder="e.g., 12345"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
              errors.vaAccreditationNumber ? 'border-red-500' : 'border-slate-300'
            }`}
            aria-invalid={!!errors.vaAccreditationNumber}
          />
          {errors.vaAccreditationNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.vaAccreditationNumber}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Your organization's VA Office of General Counsel accreditation number (38 CFR 14.629)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 mb-1">
              Contact Email *
            </label>
            <input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              onBlur={() => handleImportantFieldBlur('contactEmail')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
                errors.contactEmail ? 'border-red-500' : 'border-slate-300'
              }`}
              aria-invalid={!!errors.contactEmail}
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
            )}
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-700 mb-1">
              Contact Phone
            </label>
            <input
              id="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-md font-medium text-slate-900 mb-3">Business Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ein" className="block text-sm font-medium text-slate-700 mb-1">
                EIN (Tax ID)
              </label>
              <input
                id="ein"
                type="text"
                value={formData.ein}
                onChange={(e) => handleInputChange('ein', e.target.value)}
                placeholder="XX-XXXXXXX"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              />
            </div>
            <div>
              <label htmlFor="businessEntityType" className="block text-sm font-medium text-slate-700 mb-1">
                Business Entity Type
              </label>
              <select
                id="businessEntityType"
                value={formData.businessEntityType}
                onChange={(e) => handleInputChange('businessEntityType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              >
                <option value="">Select entity type</option>
                <option value="LLC">LLC</option>
                <option value="PLLC">PLLC</option>
                <option value="PC">Professional Corporation (PC)</option>
                <option value="Corp">Corporation</option>
                <option value="S-Corp">S-Corporation</option>
                <option value="Partnership">Partnership</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
              </select>
            </div>
            {formData.organizationType === 'law_firm' && (
              <div>
                <label htmlFor="stateBarNumber" className="block text-sm font-medium text-slate-700 mb-1">
                  State Bar Number
                </label>
                <input
                  id="stateBarNumber"
                  type="text"
                  value={formData.stateBarNumber}
                  onChange={(e) => handleInputChange('stateBarNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                />
              </div>
            )}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-md font-medium text-slate-900 mb-3">Authorized Signer Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="signerName" className="block text-sm font-medium text-slate-700 mb-1">
                Full Legal Name *
              </label>
              <input
                id="signerName"
                type="text"
                value={formData.signerName}
                onChange={(e) => handleInputChange('signerName', e.target.value)}
                onBlur={() => handleImportantFieldBlur('signerName')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
                  errors.signerName ? 'border-red-500' : 'border-slate-300'
                }`}
                aria-invalid={!!errors.signerName}
              />
              {errors.signerName && (
                <p className="mt-1 text-sm text-red-600">{errors.signerName}</p>
              )}
            </div>
            <div>
              <label htmlFor="signerTitle" className="block text-sm font-medium text-slate-700 mb-1">
                Title/Position *
              </label>
              <input
                id="signerTitle"
                type="text"
                value={formData.signerTitle}
                onChange={(e) => handleInputChange('signerTitle', e.target.value)}
                onBlur={() => handleImportantFieldBlur('signerTitle')}
                placeholder="e.g., Managing Partner, Executive Director"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
                  errors.signerTitle ? 'border-red-500' : 'border-slate-300'
                }`}
                aria-invalid={!!errors.signerTitle}
              />
              {errors.signerTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.signerTitle}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Select Your License Tier
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          {PAID_LICENSE_TIERS.map(tier => (
            <div
              key={tier.id}
              role="radio"
              aria-checked={formData.licenseTier === tier.id}
              tabIndex={0}
              onClick={() => handleInputChange('licenseTier', tier.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleInputChange('licenseTier', tier.id);
                }
              }}
              className={`
                relative p-6 border-2 rounded-xl cursor-pointer transition-all
                ${formData.licenseTier === tier.id 
                  ? 'border-[#1B3A5F] ring-2 ring-[#1B3A5F] ring-offset-2' 
                  : 'border-slate-200 hover:border-slate-300'}
                ${tier.recommended ? 'shadow-lg' : ''}
              `}
            >
              {tier.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B3A5F] text-white">
                  Recommended
                </Badge>
              )}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
                <p className="text-2xl font-bold text-[#1B3A5F] mt-2">{tier.price}</p>
                <p className="text-sm text-slate-500">{tier.monthlyEquivalent}</p>
                <div className="mt-4 space-y-2">
                  <Badge className="bg-slate-100 text-slate-700">{tier.maxVeterans}</Badge>
                  <Badge className="bg-amber-100 text-amber-700">{tier.platformFee} platform fee</Badge>
                </div>
                <ul className="mt-4 text-left text-sm text-slate-600 space-y-2">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500 text-center">
          All plans include full VA-compliant fee tracking. Platform fee only applies to approved claims with fees.
          Annual licenses can be billed monthly or annually (10% discount for annual payment).
        </p>
      </CardContent>
    </Card>
  );

  const renderStep5VaDisclosures = () => {
    const [vaAccepted, setVaAccepted] = useState(false);
    const [feeAccepted, setFeeAccepted] = useState(false);

    const handleContinue = () => {
      if (vaAccepted && feeAccepted) {
        handleVaFeeDisclosuresAccept(
          { agreement_type: 'va_accreditation', accepted: true },
          { agreement_type: 'fee_disclosure', accepted: true }
        );
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
            VA Accreditation & Fee Disclosures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">VA Accreditation Attestation (38 CFR 14.629)</h3>
            <p className="text-sm text-blue-800 mb-4">
              By checking the box below, you attest that:
            </p>
            <ul className="text-sm text-blue-800 space-y-2 mb-4">
              <li>- Your organization maintains valid VA Office of General Counsel (OGC) accreditation</li>
              <li>- All representatives who will assist veterans through this platform are individually accredited per 38 CFR 14.629</li>
              <li>- You will promptly notify EarnedIT of any changes to accreditation status</li>
              <li>- You will ensure representatives complete required continuing education</li>
              <li>- You understand that loss of accreditation may result in immediate suspension of platform access</li>
            </ul>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="vaAccreditation"
                checked={vaAccepted}
                onChange={(e) => setVaAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                aria-describedby="va-attestation-desc"
              />
              <label htmlFor="vaAccreditation" className="text-sm text-blue-900 cursor-pointer">
                <span id="va-attestation-desc">
                  <strong>I attest</strong> that my organization and all representatives maintain valid VA OGC 
                  accreditation and will comply with all requirements of 38 CFR 14.629.
                </span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-2">Fee Disclosure Agreement (38 CFR 14.636)</h3>
            <p className="text-sm text-amber-800 mb-4">
              By checking the box below, you acknowledge and agree to the following fee regulations:
            </p>
            <ul className="text-sm text-amber-800 space-y-2 mb-4">
              <li>- <strong>Original Claims:</strong> NO fees may be charged for original disability claim preparation per federal law</li>
              <li>- <strong>Direct-Pay Agreements:</strong> Maximum 20% of past-due benefits, must be contingent on success, VA withholds and pays</li>
              <li>- <strong>Non-Direct-Pay Agreements:</strong> Maximum 33.33% of past-due benefits</li>
              <li>- Fees apply ONLY to past-due (retroactive) benefits, NEVER to ongoing monthly payments</li>
              <li>- All fee agreements must be filed with VA within 30 days of execution</li>
              <li>- VA assesses a 5% fee (maximum $100) on direct-pay fee agreements</li>
              <li>- Direct-pay agreements must be filed with the VA Regional Office</li>
              <li>- Non-direct-pay agreements must be filed with the VA Office of General Counsel</li>
            </ul>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="feeDisclosure"
                checked={feeAccepted}
                onChange={(e) => setFeeAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                aria-describedby="fee-disclosure-desc"
              />
              <label htmlFor="feeDisclosure" className="text-sm text-amber-900 cursor-pointer">
                <span id="fee-disclosure-desc">
                  <strong>I acknowledge and agree</strong> to comply with all VA fee regulations per 38 CFR 14.636, 
                  including fee caps, filing requirements, and the prohibition on fees for original claims.
                </span>
              </label>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!vaAccepted || !feeAccepted}
            className="w-full bg-[#1B3A5F] hover:bg-[#152d4a] text-white"
            aria-label="Continue to review"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
            I Accept and Continue to Review
          </Button>
          {(!vaAccepted || !feeAccepted) && (
            <p className="text-xs text-slate-500 text-center">
              Please accept both disclosures above to continue.
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStep6Objectives = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Program Objectives & Collaboration Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Set your organization's goals and preferences. These help us match you with veterans 
            and optimize your workflow.
          </p>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-md font-medium text-slate-900 mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#1B3A5F]" aria-hidden="true" />
            Veteran Intake Goals
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            {INTAKE_GOALS.map(goal => (
              <div
                key={goal.id}
                role="radio"
                aria-checked={formData.objectives.intakeGoal === goal.id}
                tabIndex={0}
                onClick={() => handleObjectiveChange('intakeGoal', goal.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleObjectiveChange('intakeGoal', goal.id);
                  }
                }}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${formData.objectives.intakeGoal === goal.id 
                    ? 'border-[#1B3A5F] bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'}
                `}
              >
                <p className="font-medium text-slate-900">{goal.label}</p>
                <p className="text-xs text-slate-500">{goal.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-md font-medium text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1B3A5F]" aria-hidden="true" />
            SLA Targets
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Response Time</label>
              <div className="space-y-2">
                {SLA_TARGETS.filter(t => t.category === 'response').map(target => (
                  <div
                    key={target.id}
                    role="radio"
                    aria-checked={formData.objectives.slaResponseTime === target.id}
                    tabIndex={0}
                    onClick={() => handleObjectiveChange('slaResponseTime', target.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleObjectiveChange('slaResponseTime', target.id);
                      }
                    }}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3
                      ${formData.objectives.slaResponseTime === target.id 
                        ? 'border-[#1B3A5F] bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'}
                    `}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.objectives.slaResponseTime === target.id 
                        ? 'border-[#1B3A5F] bg-[#1B3A5F]' 
                        : 'border-slate-300'
                    }`}>
                      {formData.objectives.slaResponseTime === target.id && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-slate-700">{target.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Processing Time</label>
              <div className="space-y-2">
                {SLA_TARGETS.filter(t => t.category === 'processing').map(target => (
                  <div
                    key={target.id}
                    role="radio"
                    aria-checked={formData.objectives.slaProcessingTime === target.id}
                    tabIndex={0}
                    onClick={() => handleObjectiveChange('slaProcessingTime', target.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleObjectiveChange('slaProcessingTime', target.id);
                      }
                    }}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3
                      ${formData.objectives.slaProcessingTime === target.id 
                        ? 'border-[#1B3A5F] bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'}
                    `}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.objectives.slaProcessingTime === target.id 
                        ? 'border-[#1B3A5F] bg-[#1B3A5F]' 
                        : 'border-slate-300'
                    }`}>
                      {formData.objectives.slaProcessingTime === target.id && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-slate-700">{target.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-md font-medium text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#1B3A5F]" aria-hidden="true" />
            Collaboration Tools
          </h3>
          <p className="text-sm text-slate-500 mb-3">Select all communication methods you'll use with veterans</p>
          <div className="grid md:grid-cols-2 gap-3">
            {COLLABORATION_TOOLS.map(tool => (
              <div
                key={tool.id}
                role="checkbox"
                aria-checked={formData.objectives.collaborationTools.includes(tool.id)}
                tabIndex={0}
                onClick={() => handleObjectiveToggle('collaborationTools', tool.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleObjectiveToggle('collaborationTools', tool.id);
                  }
                }}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all flex items-start gap-3
                  ${formData.objectives.collaborationTools.includes(tool.id) 
                    ? 'border-[#1B3A5F] bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'}
                `}
              >
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                  formData.objectives.collaborationTools.includes(tool.id)
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]'
                    : 'border-slate-300'
                }`}>
                  {formData.objectives.collaborationTools.includes(tool.id) && (
                    <CheckCircle2 className="w-3 h-3 text-white" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{tool.label}</p>
                  <p className="text-xs text-slate-500">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-md font-medium text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1B3A5F]" aria-hidden="true" />
            Team Configuration
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="teamSize" className="block text-sm font-medium text-slate-700 mb-2">
                Team Size
              </label>
              <input
                id="teamSize"
                type="number"
                min="1"
                max="100"
                value={formData.objectives.teamSize}
                onChange={(e) => handleObjectiveChange('teamSize', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              />
              <p className="mt-1 text-xs text-slate-500">Number of team members who will use the platform</p>
            </div>
            <div>
              <label htmlFor="successRateTarget" className="block text-sm font-medium text-slate-700 mb-2">
                Target Success Rate (%)
              </label>
              <input
                id="successRateTarget"
                type="number"
                min="50"
                max="100"
                value={formData.objectives.successRateTarget}
                onChange={(e) => handleObjectiveChange('successRateTarget', parseInt(e.target.value) || 75)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              />
              <p className="mt-1 text-xs text-slate-500">Your goal for claim approval rate (50-100%)</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Team Roles</label>
            <p className="text-sm text-slate-500 mb-3">Select the roles you plan to assign to team members</p>
            <div className="grid md:grid-cols-3 gap-2">
              {TEAM_ROLES.map(role => (
                <div
                  key={role.id}
                  role="checkbox"
                  aria-checked={formData.objectives.teamRoles.includes(role.id)}
                  tabIndex={0}
                  onClick={() => handleObjectiveToggle('teamRoles', role.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleObjectiveToggle('teamRoles', role.id);
                    }
                  }}
                  className={`
                    p-3 border rounded-lg cursor-pointer transition-all
                    ${formData.objectives.teamRoles.includes(role.id) 
                      ? 'border-[#1B3A5F] bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                      formData.objectives.teamRoles.includes(role.id)
                        ? 'border-[#1B3A5F] bg-[#1B3A5F]'
                        : 'border-slate-300'
                    }`}>
                      {formData.objectives.teamRoles.includes(role.id) && (
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" aria-hidden="true" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{role.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-6">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#1B3A5F]" aria-hidden="true" />
            Escalation Priority
          </h3>
          <p className="text-sm text-slate-500 mb-3">How quickly should urgent issues be escalated?</p>
          <div className="space-y-2">
            {ESCALATION_PRIORITIES.map(priority => (
              <div
                key={priority.id}
                role="radio"
                aria-checked={formData.objectives.escalationPriority === priority.id}
                tabIndex={0}
                onClick={() => handleObjectiveChange('escalationPriority', priority.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleObjectiveChange('escalationPriority', priority.id);
                  }
                }}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-3
                  ${formData.objectives.escalationPriority === priority.id 
                    ? 'border-[#1B3A5F] bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'}
                `}
              >
                <div className={`w-4 h-4 rounded-full border-2 ${
                  formData.objectives.escalationPriority === priority.id 
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]' 
                    : 'border-slate-300'
                }`}>
                  {formData.objectives.escalationPriority === priority.id && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{priority.label}</p>
                  <p className="text-xs text-slate-500">{priority.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep7 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
          Review & Submit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-3">Organization Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Name:</dt>
                <dd className="font-medium">{formData.organizationName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Type:</dt>
                <dd className="font-medium">{ORG_TYPES.find(t => t.id === formData.organizationType)?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">VA Accreditation:</dt>
                <dd className="font-medium">{formData.vaAccreditationNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Contact:</dt>
                <dd className="font-medium">{formData.contactEmail}</dd>
              </div>
            </dl>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-3">License Selection</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Tier:</dt>
                <dd className="font-medium">{LICENSE_TIERS.find(t => t.id === formData.licenseTier)?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Annual Fee:</dt>
                <dd className="font-medium">{LICENSE_TIERS.find(t => t.id === formData.licenseTier)?.price}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Platform Fee:</dt>
                <dd className="font-medium">{LICENSE_TIERS.find(t => t.id === formData.licenseTier)?.platformFee}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            Agreements Signed
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              Partner Terms of Service (v{agreements.partnerTos?.agreement_version})
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              HIPAA Business Associate Agreement (v{agreements.hipaaBaa?.agreement_version})
            </li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Next Steps After Submission</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Complete payment for license activation</li>
            <li>Upload malpractice insurance certificate</li>
            <li>Verify VA accreditation status</li>
            <li>Invite team members</li>
            <li>Begin veteran client onboarding</li>
          </ol>
        </div>

        {!isAuthenticated && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg" role="alert">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Please log in to submit your registration.</span>
            </div>
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg" role="alert">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Registration successful! Redirecting to your dashboard...</span>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isAuthenticated || submitSuccess}
            className="bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Submit partner registration"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" aria-hidden="true" />
                Submit Registration
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return (
          <PartnerTermsOfService 
            isRegistration={true} 
            onAccept={handlePartnerTosAccept}
          />
        );
      case 4:
        return (
          <HIPAABusinessAssociateAgreement 
            isRegistration={true} 
            onAccept={handleHipaaBaaAccept}
          />
        );
      case 5:
        return renderStep5VaDisclosures();
      case 6:
        return renderStep6Objectives();
      case 7:
        return renderStep7();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Partner Organization Registration</h1>
          <p className="text-slate-600 mt-2">
            Join EarnedIT to provide VA disability claims assistance to veterans
          </p>
        </div>

        <ResumeDraftPrompt onResume={resumeDraft} onDiscard={discardDraft} />
        <DraftSavedIndicator />

        {renderStepIndicator()}
        {renderCurrentStep()}

        {currentStep !== 3 && currentStep !== 4 && currentStep !== 5 && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
              variant="outline"
              className="flex items-center gap-2"
              aria-label="Go to previous step"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </Button>
            {currentStep < 7 && currentStep !== 5 && (
              <Button
                onClick={handleNext}
                className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white flex items-center gap-2"
                aria-label="Continue to next step"
              >
                Continue
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
