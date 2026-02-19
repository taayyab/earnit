import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import ExternalLinkWarning from '../../components/ExternalLinkWarning';
import { 
  User, 
  Shield, 
  Briefcase,
  Calendar,
  FileCheck,
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Loader2,
  Building2,
  Target,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import api from '../../lib/api';

const STEPS = [
  { id: 1, name: 'Welcome', icon: Building2 },
  { id: 2, name: 'Profile Info', icon: User },
  { id: 3, name: 'Accreditation', icon: Shield },
  { id: 4, name: 'Specializations', icon: Briefcase },
  { id: 5, name: 'Availability', icon: Calendar },
  { id: 6, name: 'Objectives', icon: Target },
  { id: 7, name: 'Agreements', icon: FileCheck },
  { id: 8, name: 'Complete', icon: CheckCircle2 }
];

const ACCREDITATION_TYPES = [
  { value: 'attorney', label: 'Attorney', description: 'Licensed attorney accredited by VA OGC' },
  { value: 'claims_agent', label: 'Claims Agent', description: 'VA-accredited claims agent' },
  { value: 'vso_rep', label: 'VSO Representative', description: 'Veteran Service Organization representative' }
];

const SPECIALIZATIONS = [
  { value: 'ptsd', label: 'PTSD & Mental Health' },
  { value: 'tbi', label: 'Traumatic Brain Injury (TBI)' },
  { value: 'mst', label: 'Military Sexual Trauma (MST)' },
  { value: 'hearing_loss', label: 'Hearing Loss & Tinnitus' },
  { value: 'back_conditions', label: 'Back & Spine Conditions' },
  { value: 'joint_conditions', label: 'Joint & Musculoskeletal' },
  { value: 'respiratory', label: 'Respiratory Conditions' },
  { value: 'burn_pit', label: 'Burn Pit Exposure / PACT Act' },
  { value: 'agent_orange', label: 'Agent Orange Exposure' },
  { value: 'gulf_war', label: 'Gulf War Illness' },
  { value: 'appeals', label: 'Appeals & HLR' },
  { value: 'cue', label: 'CUE Claims' },
  { value: 'tdiu', label: 'TDIU / Individual Unemployability' },
  { value: 'smc', label: 'Special Monthly Compensation' }
];

const CASE_LOAD_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50];

const REQUIRED_AGREEMENTS = [
  { id: 'member_tos', label: 'Member Terms of Service', description: 'Terms governing your use of the platform as a claims specialist' },
  { id: 'hipaa_acknowledgment', label: 'HIPAA Acknowledgment', description: 'Acknowledgment of HIPAA requirements for handling veteran health information' },
  { id: 'ethics_agreement', label: 'Ethics & Conduct Agreement', description: 'Commitment to ethical claims assistance practices' }
];

const TARGET_CLAIM_TYPES = [
  { value: 'initial_claims', label: 'Initial Claims' },
  { value: 'supplemental_claims', label: 'Supplemental Claims' },
  { value: 'appeals_hlr', label: 'Appeals & Higher Level Review' },
  { value: 'bva_appeals', label: 'BVA Appeals' },
  { value: 'cue_claims', label: 'CUE Claims' },
  { value: 'tdiu', label: 'TDIU Applications' }
];

const VETERAN_COHORTS = [
  { value: 'post_911', label: 'Post-9/11 Veterans' },
  { value: 'gulf_war', label: 'Gulf War Era Veterans' },
  { value: 'vietnam', label: 'Vietnam Era Veterans' },
  { value: 'peacetime', label: 'Peacetime Veterans' },
  { value: 'burn_pit', label: 'PACT Act / Burn Pit Exposure' },
  { value: 'mst_survivors', label: 'MST Survivors' },
  { value: 'combat_veterans', label: 'Combat Veterans' }
];

const COLLABORATION_CADENCE = [
  { value: 'daily', label: 'Daily check-ins' },
  { value: 'weekly', label: 'Weekly sync meetings' },
  { value: 'biweekly', label: 'Bi-weekly reviews' },
  { value: 'as_needed', label: 'As needed basis' }
];

const APPEALS_PER_QUARTER_OPTIONS = [1, 2, 3, 5, 10, 15, 20];

const PROCESSING_TIME_GOALS = [
  { value: '30_days', label: 'Under 30 days' },
  { value: '60_days', label: 'Under 60 days' },
  { value: '90_days', label: 'Under 90 days' },
  { value: 'va_timeline', label: 'Match VA timelines' }
];

export default function AgentOnboarding() {
  const navigate = useNavigate();
  const { token, isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    vaAccreditationNumber: '',
    accreditationType: '',
    specializations: [],
    maxCaseLoad: 25,
    availabilitySchedule: {
      monday: { available: true, hours: '9am-5pm' },
      tuesday: { available: true, hours: '9am-5pm' },
      wednesday: { available: true, hours: '9am-5pm' },
      thursday: { available: true, hours: '9am-5pm' },
      friday: { available: true, hours: '9am-5pm' },
      saturday: { available: false, hours: '' },
      sunday: { available: false, hours: '' }
    },
    agreementsSigned: [],
    objectives: {
      targetClaimTypes: [],
      appealsPerQuarter: 5,
      preferredCohorts: [],
      collaborationCadence: 'weekly',
      processingTimeGoal: '60_days',
      targetSuccessRate: 80
    }
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const response = await api.get('/partner/member/onboarding-status');
      
      if (!response.data.has_membership) {
        navigate('/partner/register');
        return;
      }
      
      if (response.data.onboarding_completed) {
        navigate('/agent/dashboard');
        return;
      }
      
      setOrganization(response.data.organization);
      
      if (response.data.member) {
        const member = response.data.member;
        setFormData(prev => ({
          ...prev,
          firstName: member.first_name || '',
          lastName: member.last_name || '',
          accreditationType: member.accreditation_type || '',
          vaAccreditationNumber: member.va_accreditation_number || '',
          specializations: member.specializations || [],
          maxCaseLoad: member.max_case_load || 25,
          agreementsSigned: member.agreements_signed || []
        }));
      }
      
      if (response.data.onboarding_step > 0) {
        setCurrentStep(response.data.onboarding_step);
      }
    } catch (err) {
      console.error('Failed to load onboarding status:', err);
      setErrors({ load: 'Failed to load your organization information' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSpecializationToggle = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleAgreementToggle = (agreementId) => {
    setFormData(prev => ({
      ...prev,
      agreementsSigned: prev.agreementsSigned.includes(agreementId)
        ? prev.agreementsSigned.filter(a => a !== agreementId)
        : [...prev.agreementsSigned, agreementId]
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availabilitySchedule: {
        ...prev.availabilitySchedule,
        [day]: {
          ...prev.availabilitySchedule[day],
          available: !prev.availabilitySchedule[day].available
        }
      }
    }));
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
    setFormData(prev => ({
      ...prev,
      objectives: {
        ...prev.objectives,
        [field]: prev.objectives[field].includes(value)
          ? prev.objectives[field].filter(v => v !== value)
          : [...prev.objectives[field], value]
      }
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 2) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
    }
    
    if (step === 3) {
      if (!formData.accreditationType) {
        newErrors.accreditationType = 'Please select your accreditation type';
      }
    }
    
    if (step === 6) {
      if (formData.objectives.targetClaimTypes.length === 0) {
        newErrors.targetClaimTypes = 'Please select at least one claim type focus';
      }
      if (!formData.objectives.collaborationCadence) {
        newErrors.collaborationCadence = 'Please select a collaboration cadence';
      }
    }
    
    if (step === 7) {
      const allSigned = REQUIRED_AGREEMENTS.every(ag => 
        formData.agreementsSigned.includes(ag.id)
      );
      if (!allSigned) {
        newErrors.agreements = 'Please accept all required agreements to continue';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
      try {
        await api.patch('/partner/member/onboarding-step', { step: currentStep + 1 });
      } catch (err) {
        console.error('Failed to save step progress:', err);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(7)) return;
    
    setSubmitting(true);
    setErrors({});
    
    try {
      const response = await api.post('/partner/member/onboarding', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
        bio: formData.bio || null,
        va_accreditation_number: formData.vaAccreditationNumber || null,
        accreditation_type: formData.accreditationType || null,
        specializations: formData.specializations,
        max_case_load: formData.maxCaseLoad,
        availability_schedule: formData.availabilitySchedule,
        agreements_signed: formData.agreementsSigned,
        objectives: formData.objectives
      });

      if (response.data.success) {
        setCurrentStep(8);
      } else {
        throw new Error(response.data.message || 'Onboarding failed');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setErrors({ submit: error.response?.data?.detail || error.message || 'Onboarding failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F] mx-auto mb-4" />
          <p className="text-slate-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <nav className="mb-8" aria-label="Onboarding progress">
      <ol className="flex justify-between">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <li key={step.id} className="flex flex-col items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${isComplete ? 'bg-green-600 text-white' : 
                  isCurrent ? 'bg-[#1B3A5F] text-white' : 
                  'bg-slate-200 text-slate-500'}
              `}>
                {isComplete ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : 
                  <Icon className="w-5 h-5" aria-hidden="true" />}
              </div>
              <span className={`text-xs text-center hidden md:block ${isCurrent ? 'font-medium text-[#1B3A5F]' : 'text-slate-500'}`}>
                {step.name}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Welcome to {organization?.name || 'Your Organization'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-[#1B3A5F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-[#1B3A5F]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome, Claims Specialist!
          </h2>
          <p className="text-slate-600 max-w-md mx-auto">
            You've been invited to join <strong>{organization?.name}</strong> as a claims specialist.
            Let's get your profile set up so you can start helping veterans.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What you'll set up:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your profile information</li>
            <li>• VA accreditation details</li>
            <li>• Areas of specialization</li>
            <li>• Availability and case load preferences</li>
            <li>• Required agreements</li>
          </ul>
        </div>

        <p className="text-sm text-slate-500 text-center">
          This should only take about 5 minutes.
        </p>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Your Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
                errors.firstName ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
                errors.lastName ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
            Professional Bio (Optional)
          </label>
          <textarea
            id="bio"
            rows={4}
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Brief description of your background and experience helping veterans..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          VA Accreditation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Accreditation Type *
          </label>
          <div className="space-y-2">
            {ACCREDITATION_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('accreditationType', type.value)}
                className={`w-full py-3 px-4 border-2 rounded-lg text-left transition-all ${
                  formData.accreditationType === type.value
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]/5 ring-2 ring-[#1B3A5F] ring-offset-2'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-medium">{type.label}</span>
                <p className="text-sm text-slate-500 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
          {errors.accreditationType && (
            <p className="mt-2 text-sm text-red-600">{errors.accreditationType}</p>
          )}
        </div>

        <div>
          <label htmlFor="vaAccreditationNumber" className="block text-sm font-medium text-slate-700 mb-1">
            VA OGC Accreditation Number
          </label>
          <input
            id="vaAccreditationNumber"
            type="text"
            value={formData.vaAccreditationNumber}
            onChange={(e) => handleInputChange('vaAccreditationNumber', e.target.value)}
            placeholder="Enter your VA OGC record number"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
          />
          <p className="text-xs text-slate-500 mt-1">
            Find your accreditation at{' '}
            <ExternalLinkWarning 
              href="https://www.va.gov/ogc/apps/accreditation/index.asp"
              className="text-[#1B3A5F] underline"
              showIcon={true}
            >
              VA OGC Accreditation Search
            </ExternalLinkWarning>
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Your organization may have already provided accreditation 
                information. Individual accreditation is required for attorneys and claims agents 
                per 38 CFR 14.629.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Areas of Specialization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Select the claim types and conditions you specialize in. This helps us match you with 
          appropriate cases.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {SPECIALIZATIONS.map(spec => (
            <button
              key={spec.value}
              type="button"
              onClick={() => handleSpecializationToggle(spec.value)}
              className={`py-2 px-3 text-sm border rounded-lg text-left transition-all ${
                formData.specializations.includes(spec.value)
                  ? 'border-[#1B3A5F] bg-[#1B3A5F]/5 text-[#1B3A5F]'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {formData.specializations.includes(spec.value) && '✓ '}
              {spec.label}
            </button>
          ))}
        </div>

        {formData.specializations.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-slate-600 mb-2">Selected specializations:</p>
            <div className="flex flex-wrap gap-2">
              {formData.specializations.map(spec => {
                const specInfo = SPECIALIZATIONS.find(s => s.value === spec);
                return (
                  <Badge key={spec} variant="secondary" className="bg-[#1B3A5F]/10 text-[#1B3A5F]">
                    {specInfo?.label || spec}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Availability & Capacity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Maximum Case Load
          </label>
          <p className="text-sm text-slate-500 mb-3">
            How many active claims can you manage at once?
          </p>
          <div className="flex flex-wrap gap-2">
            {CASE_LOAD_OPTIONS.map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleInputChange('maxCaseLoad', num)}
                className={`w-14 h-12 border-2 rounded-lg font-medium transition-all ${
                  formData.maxCaseLoad === num
                    ? 'border-[#1B3A5F] bg-[#1B3A5F] text-white'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Weekly Availability
          </label>
          <p className="text-sm text-slate-500 mb-3">
            Which days are you typically available?
          </p>
          <div className="grid grid-cols-7 gap-2">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`py-2 px-1 text-xs font-medium border rounded-lg transition-all ${
                  formData.availabilitySchedule[day]?.available
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]/10 text-[#1B3A5F]'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                {day.slice(0, 3).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep6 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Objectives & Capacity Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-slate-600">
          Help us understand your goals and preferences so we can match you with the right cases and set you up for success.
        </p>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Target Claim Types
          </label>
          <p className="text-sm text-slate-500 mb-3">
            Which claim types do you want to focus on and master?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TARGET_CLAIM_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleObjectiveToggle('targetClaimTypes', type.value)}
                className={`py-2 px-3 text-sm border rounded-lg text-left transition-all ${
                  formData.objectives.targetClaimTypes.includes(type.value)
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]/5 text-[#1B3A5F]'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {formData.objectives.targetClaimTypes.includes(type.value) && '✓ '}
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Appeals Per Quarter Goal
          </label>
          <p className="text-sm text-slate-500 mb-3">
            How many appeals do you aim to handle per quarter?
          </p>
          <div className="flex flex-wrap gap-2">
            {APPEALS_PER_QUARTER_OPTIONS.map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleObjectiveChange('appealsPerQuarter', num)}
                className={`w-14 h-12 border-2 rounded-lg font-medium transition-all ${
                  formData.objectives.appealsPerQuarter === num
                    ? 'border-[#1B3A5F] bg-[#1B3A5F] text-white'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            <Users className="w-4 h-4 inline mr-2" />
            Preferred Veteran Cohorts
          </label>
          <p className="text-sm text-slate-500 mb-3">
            Which veteran groups do you prefer working with?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {VETERAN_COHORTS.map(cohort => (
              <button
                key={cohort.value}
                type="button"
                onClick={() => handleObjectiveToggle('preferredCohorts', cohort.value)}
                className={`py-2 px-3 text-sm border rounded-lg text-left transition-all ${
                  formData.objectives.preferredCohorts.includes(cohort.value)
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]/5 text-[#1B3A5F]'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {formData.objectives.preferredCohorts.includes(cohort.value) && '✓ '}
                {cohort.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Collaboration Cadence with Advocates
          </label>
          <p className="text-sm text-slate-500 mb-3">
            How often do you prefer to sync with peer advocates?
          </p>
          <div className="space-y-2">
            {COLLABORATION_CADENCE.map(cadence => (
              <button
                key={cadence.value}
                type="button"
                onClick={() => handleObjectiveChange('collaborationCadence', cadence.value)}
                className={`w-full py-2 px-4 border-2 rounded-lg text-left transition-all ${
                  formData.objectives.collaborationCadence === cadence.value
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {cadence.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Processing Time Goal
          </label>
          <p className="text-sm text-slate-500 mb-3">
            What's your target for average claim processing time?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PROCESSING_TIME_GOALS.map(goal => (
              <button
                key={goal.value}
                type="button"
                onClick={() => handleObjectiveChange('processingTimeGoal', goal.value)}
                className={`py-2 px-3 text-sm border rounded-lg text-left transition-all ${
                  formData.objectives.processingTimeGoal === goal.value
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]/5 text-[#1B3A5F]'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {formData.objectives.processingTimeGoal === goal.value && '✓ '}
                {goal.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Target Success Rate: {formData.objectives.targetSuccessRate}%
          </label>
          <p className="text-sm text-slate-500 mb-3">
            What approval success rate do you aim to achieve?
          </p>
          <input
            type="range"
            min="50"
            max="100"
            value={formData.objectives.targetSuccessRate}
            onChange={(e) => handleObjectiveChange('targetSuccessRate', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep7 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Required Agreements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Please review and accept the following agreements to complete your onboarding.
        </p>

        <div className="space-y-3">
          {REQUIRED_AGREEMENTS.map(agreement => (
            <div 
              key={agreement.id}
              className={`p-4 border-2 rounded-lg transition-all ${
                formData.agreementsSigned.includes(agreement.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-200'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreementsSigned.includes(agreement.id)}
                  onChange={() => handleAgreementToggle(agreement.id)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="font-medium text-slate-900">{agreement.label}</span>
                  <p className="text-sm text-slate-500 mt-0.5">{agreement.description}</p>
                </div>
              </label>
            </div>
          ))}
        </div>

        {errors.agreements && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{errors.agreements}</p>
          </div>
        )}

        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.submit}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep8 = () => (
    <Card className="text-center">
      <CardContent className="pt-8 pb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">You're All Set!</h2>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Your profile is complete and you're ready to start helping veterans with their 
          disability claims. Welcome to the team!
        </p>
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/agent/dashboard')}
            className="bg-[#1B3A5F] hover:bg-[#2a4a6f] w-full md:w-auto"
          >
            Go to Dashboard
          </Button>
          <p className="text-sm text-slate-500">
            You'll be assigned cases based on your specializations and availability.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Agent Onboarding</h1>
          <p className="text-slate-600">Complete your profile to get started</p>
        </div>

        {renderStepIndicator()}
        {renderCurrentStep()}

        {currentStep < 8 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            {currentStep === 7 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#1B3A5F] hover:bg-[#2a4a6f] flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-[#1B3A5F] hover:bg-[#2a4a6f] flex items-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
