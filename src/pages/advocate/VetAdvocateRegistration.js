import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Heart, 
  User, 
  Shield, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import VetAdvocateVolunteerAgreement from '../legal/VetAdvocateVolunteerAgreement';
import { useAuth } from '../../lib/auth-context';
import { useDraftSave } from '../../hooks/useDraftSave';

const STEPS = [
  { id: 1, name: 'About You', icon: User },
  { id: 2, name: 'Experience', icon: Shield },
  { id: 3, name: 'Availability', icon: Calendar },
  { id: 4, name: 'Volunteer Agreement', icon: Heart },
  { id: 5, name: 'Review & Submit', icon: CheckCircle2 }
];

const SERVICE_BRANCHES = [
  'Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force'
];

const SERVICE_ERAS = [
  'Post-9/11 (2001-Present)',
  'Gulf War (1990-2001)',
  'Post-Vietnam (1975-1990)',
  'Vietnam Era (1964-1975)',
  'Korean War (1950-1953)',
  'World War II (1941-1945)'
];

const FOCUS_AREAS = [
  { value: 'military_transition', label: 'Military Transition' },
  { value: 'va_claims', label: 'VA Claims Process' },
  { value: 'peer_connection', label: 'Peer Connection & Friendship' },
  { value: 'quality_of_life', label: 'Quality of Life' },
  { value: 'employment', label: 'Employment & Career' },
  { value: 'education', label: 'Education & Training' },
  { value: 'family_support', label: 'Family Support' },
  { value: 'financial', label: 'Financial Wellness' }
];

const INTERACTION_STYLES = [
  { value: 'supportive', label: 'Supportive & Encouraging', description: 'Focus on emotional support and positive reinforcement' },
  { value: 'direct', label: 'Direct & Action-Oriented', description: 'Focus on clear steps and practical guidance' },
  { value: 'detailed', label: 'Detailed & Thorough', description: 'Focus on comprehensive explanations and information' },
  { value: 'flexible', label: 'Flexible & Adaptive', description: 'Adjust style based on veteran needs' }
];

const CADENCE_OPTIONS = [
  { value: 'weekly', label: 'Weekly', description: 'Regular weekly check-ins' },
  { value: 'biweekly', label: 'Bi-weekly', description: 'Check-ins every two weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Monthly touchpoints' },
  { value: 'as_needed', label: 'As Needed', description: 'Flexible schedule based on veteran needs' }
];

export default function VetAdvocateRegistration() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isVeteran: null,
    serviceBranch: '',
    serviceEra: '',
    bio: '',
    focusAreas: [],
    interactionStyle: 'flexible',
    preferredCadence: 'as_needed',
    hasFiledClaim: null,
    maxVeterans: 3,
    availabilitySchedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    },
    preferredCommunication: ['platform_message'],
    volunteerAgreement: null
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    saveDraft,
    clearDraft,
    handleImportantFieldChange,
    hasDraft,
    DraftSavedIndicator,
    ResumeDraftPrompt,
    resumeDraft,
    discardDraft,
  } = useDraftSave('advocate_registration', formData, setFormData, {
    importantFields: ['firstName', 'lastName', 'email'],
  });

  const importantFields = ['firstName', 'lastName', 'email', 'phone'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImportantFieldBlur = (field) => {
    if (importantFields.includes(field)) {
      handleImportantFieldChange();
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (formData.isVeteran === null) newErrors.isVeteran = 'Please indicate if you are a veteran';
    }
    
    if (step === 2) {
      if (formData.isVeteran && !formData.serviceBranch) {
        newErrors.serviceBranch = 'Service branch is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleVolunteerAgreementAccept = (data) => {
    setFormData(prev => ({ ...prev, volunteerAgreement: data }));
    handleNext();
  };

  const handleFocusAreaToggle = (area) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !token) {
      setErrors({ submit: 'Please log in to submit your application.' });
      return;
    }

    setSubmitting(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/vet-advocate/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          is_veteran: formData.isVeteran,
          service_branch: formData.serviceBranch || null,
          service_era: formData.serviceEra || null,
          bio: formData.bio || null,
          focus_areas: formData.focusAreas || [],
          interaction_style: formData.interactionStyle,
          preferred_cadence: formData.preferredCadence,
          max_veterans: formData.maxVeterans,
          availability_schedule: formData.availabilitySchedule,
          preferred_communication: formData.preferredCommunication.reduce((acc, method) => {
            acc[method] = { enabled: true };
            return acc;
          }, {}),
          default_tier: 'full_advocate',
          phone: formData.phone || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();

      if (formData.volunteerAgreement) {
        await fetch(`/api/vet-advocate/volunteer-agreement/${data.profile_id || data.user_id}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData.volunteerAgreement)
        });
      }

      // Record consent for volunteer agreement to create audit trail
      try {
        const consentTypes = [
          { type: 'vet_advocate_agreement', version: '1.0.0' },
          { type: 'privacy_policy', version: '1.0.0' },
          { type: 'terms_of_service', version: '1.0.0' }
        ];
        
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
              acceptance_context: 'advocate_registration',
              acceptances_detail: {
                volunteer_name: `${formData.firstName} ${formData.lastName}`,
                is_veteran: formData.isVeteran,
                focus_areas: formData.focusAreas
              }
            })
          })
        ));
      } catch (consentErr) {
        console.warn('Failed to record consents:', consentErr);
        // Continue with registration success even if consent tracking fails
      }

      clearDraft();
      setSubmitted(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to the Team!</h2>
              <p className="text-slate-600 mb-6">
                Thank you for volunteering to help fellow veterans. Your account is now active
                and you'll be notified when a veteran is assigned to you.
              </p>
              <Button 
                onClick={() => window.location.href = '/advocate/dashboard'}
                className="bg-[#1B3A5F] hover:bg-[#2a4a6f]"
              >
                Go to Advocate Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <nav className="mb-8" aria-label="Registration progress">
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
              <span className={`text-xs text-center ${isCurrent ? 'font-medium text-[#1B3A5F]' : 'text-slate-500'}`}>
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
          <User className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Tell Us About Yourself
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
              onBlur={() => handleImportantFieldBlur('firstName')}
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
              onBlur={() => handleImportantFieldBlur('lastName')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
                errors.lastName ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleImportantFieldBlur('email')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
              errors.email ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
            onBlur={() => handleImportantFieldBlur('phone')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
          />
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium text-slate-700 mb-3">Are you a veteran? *</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleInputChange('isVeteran', true)}
              className={`flex-1 py-3 px-4 border-2 rounded-lg transition-all ${
                formData.isVeteran === true
                  ? 'border-[#1B3A5F] bg-[#1B3A5F]/5 ring-2 ring-[#1B3A5F] ring-offset-2'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              Yes, I'm a veteran
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('isVeteran', false)}
              className={`flex-1 py-3 px-4 border-2 rounded-lg transition-all ${
                formData.isVeteran === false
                  ? 'border-[#1B3A5F] bg-[#1B3A5F]/5 ring-2 ring-[#1B3A5F] ring-offset-2'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              No, I want to volunteer
            </button>
          </div>
          {errors.isVeteran && <p className="mt-2 text-sm text-red-600">{errors.isVeteran}</p>}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Your Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.isVeteran && (
          <>
            <div>
              <label htmlFor="serviceBranch" className="block text-sm font-medium text-slate-700 mb-1">
                Service Branch *
              </label>
              <select
                id="serviceBranch"
                value={formData.serviceBranch}
                onChange={(e) => handleInputChange('serviceBranch', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F] ${
                  errors.serviceBranch ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select branch</option>
                {SERVICE_BRANCHES.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
              {errors.serviceBranch && <p className="mt-1 text-sm text-red-600">{errors.serviceBranch}</p>}
            </div>

            <div>
              <label htmlFor="serviceEra" className="block text-sm font-medium text-slate-700 mb-1">
                Service Era
              </label>
              <select
                id="serviceEra"
                value={formData.serviceEra}
                onChange={(e) => handleInputChange('serviceEra', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
              >
                <option value="">Select era</option>
                {SERVICE_ERAS.map(era => (
                  <option key={era} value={era}>{era}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Have you filed a VA disability claim before?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleInputChange('hasFiledClaim', true)}
              className={`flex-1 py-2 px-4 border-2 rounded-lg ${
                formData.hasFiledClaim === true
                  ? 'border-[#1B3A5F] bg-[#1B3A5F]/5'
                  : 'border-slate-200'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('hasFiledClaim', false)}
              className={`flex-1 py-2 px-4 border-2 rounded-lg ${
                formData.hasFiledClaim === false
                  ? 'border-[#1B3A5F] bg-[#1B3A5F]/5'
                  : 'border-slate-200'
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            What areas can you help veterans with? (Select all that apply)
          </label>
          <p className="text-sm text-slate-500 mb-3">
            These help us match you with veterans who need support in these life areas.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FOCUS_AREAS.map(area => (
              <button
                key={area.value}
                type="button"
                onClick={() => handleFocusAreaToggle(area.value)}
                className={`py-2 px-3 text-sm border rounded-lg text-left ${
                  formData.focusAreas.includes(area.value)
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]/5 text-[#1B3A5F]'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                {formData.focusAreas.includes(area.value) && '✓ '}
                {area.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            What's your support style?
          </label>
          <p className="text-sm text-slate-500 mb-3">
            This helps veterans find an advocate whose style matches their preferences.
          </p>
          <div className="grid grid-cols-1 gap-2">
            {INTERACTION_STYLES.map(style => (
              <button
                key={style.value}
                type="button"
                onClick={() => handleInputChange('interactionStyle', style.value)}
                className={`py-3 px-4 border-2 rounded-lg text-left ${
                  formData.interactionStyle === style.value
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]/5'
                    : 'border-slate-200'
                }`}
              >
                <span className="font-medium">{style.label}</span>
                <p className="text-sm text-slate-500 mt-1">{style.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            How often do you prefer to check in with veterans?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CADENCE_OPTIONS.map(cadence => (
              <button
                key={cadence.value}
                type="button"
                onClick={() => handleInputChange('preferredCadence', cadence.value)}
                className={`py-3 px-4 border-2 rounded-lg text-left ${
                  formData.preferredCadence === cadence.value
                    ? 'border-[#1B3A5F] bg-[#1B3A5F]/5'
                    : 'border-slate-200'
                }`}
              >
                <span className="font-medium">{cadence.label}</span>
                <p className="text-sm text-slate-500 mt-1">{cadence.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
            Brief Bio (shown to veterans)
          </label>
          <textarea
            id="bio"
            rows={4}
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Share a bit about yourself and why you want to help fellow veterans..."
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
          <Calendar className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Your Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            How many veterans can you support at once?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 10].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleInputChange('maxVeterans', num)}
                className={`w-12 h-12 border-2 rounded-lg ${
                  formData.maxVeterans === num
                    ? 'border-[#1B3A5F] bg-[#1B3A5F] text-white'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Start small - you can always increase this later.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Preferred communication methods
          </label>
          <div className="space-y-2">
            {[
              { id: 'platform_message', label: 'Platform Messages' },
              { id: 'video_call', label: 'Video Calls' },
              { id: 'phone_call', label: 'Phone Calls' },
              { id: 'email', label: 'Email' }
            ].map(method => (
              <label key={method.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferredCommunication.includes(method.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('preferredCommunication', 
                        [...formData.preferredCommunication, method.id]);
                    } else {
                      handleInputChange('preferredCommunication',
                        formData.preferredCommunication.filter(m => m !== method.id));
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                />
                <span className="text-sm">{method.label}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <VetAdvocateVolunteerAgreement
      onAccept={handleVolunteerAgreementAccept}
      signerName={`${formData.firstName} ${formData.lastName}`}
    />
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Review Your Application
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <div>
            <span className="text-sm text-slate-500">Name:</span>
            <p className="font-medium">{formData.firstName} {formData.lastName}</p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Email:</span>
            <p className="font-medium">{formData.email}</p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Veteran Status:</span>
            <p className="font-medium">{formData.isVeteran ? 'Yes' : 'No'}</p>
          </div>
          {formData.isVeteran && formData.serviceBranch && (
            <div>
              <span className="text-sm text-slate-500">Service Branch:</span>
              <p className="font-medium">{formData.serviceBranch}</p>
            </div>
          )}
          {formData.focusAreas.length > 0 && (
            <div>
              <span className="text-sm text-slate-500">Focus Areas:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.focusAreas.map(area => {
                  const areaData = FOCUS_AREAS.find(a => a.value === area);
                  return (
                    <Badge key={area} className="bg-[#1B3A5F]/10 text-[#1B3A5F]">
                      {areaData ? areaData.label : area}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <span className="text-sm text-slate-500">Interaction Style:</span>
            <p className="font-medium">
              {INTERACTION_STYLES.find(s => s.value === formData.interactionStyle)?.label || formData.interactionStyle}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Check-in Cadence:</span>
            <p className="font-medium">
              {CADENCE_OPTIONS.find(c => c.value === formData.preferredCadence)?.label || formData.preferredCadence}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Max Veterans:</span>
            <p className="font-medium">{formData.maxVeterans}</p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Volunteer Agreement:</span>
            <p className="font-medium text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              Signed
            </p>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg" role="alert">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Please log in to submit your application.</span>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
              <span>{errors.submit}</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting || !isAuthenticated}
          className="w-full bg-[#1B3A5F] hover:bg-[#2a4a6f] disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1B3A5F] mb-2">Become a Vet Advocate</h1>
          <p className="text-slate-600">
            Help fellow veterans navigate their disability claims journey
          </p>
        </div>

        <ResumeDraftPrompt onResume={resumeDraft} onDiscard={discardDraft} />
        <DraftSavedIndicator />

        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}

        {currentStep !== 4 && currentStep !== 5 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-[#1B3A5F] hover:bg-[#2a4a6f] flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
