import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { 
  User,
  Briefcase,
  MapPin,
  Award,
  Stethoscope,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Globe,
  Building2,
  Edit2,
  Eye,
  EyeOff,
  Shield,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const FallbackIcon = CheckCircle2;

const STEPS = [
  { id: 1, name: 'Account Information', icon: User },
  { id: 2, name: 'Professional Information', icon: Briefcase },
  { id: 3, name: 'Primary Location', icon: MapPin },
  { id: 4, name: 'Credentials', icon: Award },
  { id: 5, name: 'Service Offerings', icon: Stethoscope },
  { id: 6, name: 'Agreements', icon: FileText },
  { id: 7, name: 'Review & Submit', icon: CheckCircle2 }
];

const PRACTICE_TYPES = [
  { id: 'solo', name: 'Solo Practice' },
  { id: 'group', name: 'Group Practice' },
  { id: 'hospital', name: 'Hospital' },
  { id: 'clinic', name: 'Clinic' },
  { id: 'telehealth_only', name: 'Telehealth Only' }
];

const CREDENTIAL_TYPES = [
  { id: 'medical_license', name: 'Medical License' },
  { id: 'dea', name: 'DEA Registration' },
  { id: 'board_certification', name: 'Board Certification' },
  { id: 'npi', name: 'NPI Registration' },
  { id: 'state_license', name: 'State License' },
  { id: 'specialty_certification', name: 'Specialty Certification' },
  { id: 'cds', name: 'Controlled Dangerous Substances (CDS)' },
  { id: 'other', name: 'Other' }
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const WEEKEND_DAYS = ['Saturday', 'Sunday'];

export default function ProviderRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [requiredAgreements, setRequiredAgreements] = useState([]);
  const [loadingAgreements, setLoadingAgreements] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    practiceName: '',
    practiceType: '',
    npiNumber: '',
    businessPhone: '',
    businessEmail: '',
    website: '',
    servesTelehealth: false,
    telehealthStates: [],
    location: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      wheelchairAccessible: false,
      operatingHours: {
        weekdays: { open: '09:00', close: '17:00', closed: false },
        weekends: { open: '09:00', close: '13:00', closed: true }
      }
    },
    credentials: [],
    services: [],
    agreements: {}
  });

  useEffect(() => {
    if (currentStep === 5) {
      fetchAvailableServices();
    }
    if (currentStep === 6) {
      fetchRequiredAgreements();
    }
  }, [currentStep]);

  const fetchAvailableServices = async () => {
    setLoadingServices(true);
    try {
      const response = await api.get('/providers/service-types');
      setAvailableServices(response.data.services || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setAvailableServices([
        { id: 'general_exam', name: 'General Physical Exam', category: 'Primary Care' },
        { id: 'mental_health', name: 'Mental Health Evaluation', category: 'Mental Health' },
        { id: 'ptsd_eval', name: 'PTSD Evaluation', category: 'Mental Health' },
        { id: 'orthopedic', name: 'Orthopedic Consultation', category: 'Specialty' },
        { id: 'audiology', name: 'Audiology Exam', category: 'Specialty' },
        { id: 'cardiology', name: 'Cardiology Consultation', category: 'Specialty' },
        { id: 'dbq_completion', name: 'DBQ Form Completion', category: 'Documentation' },
        { id: 'nexus_letter', name: 'Nexus Letter', category: 'Documentation' }
      ]);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchRequiredAgreements = async () => {
    setLoadingAgreements(true);
    try {
      const response = await api.get('/agreements/required?provider_type=community_care');
      setRequiredAgreements(response.data.agreements || []);
    } catch (error) {
      console.error('Failed to fetch agreements:', error);
      setRequiredAgreements([
        { 
          id: 'baa', 
          name: 'Business Associate Agreement (BAA)', 
          version: '1.0.0',
          content: 'This Business Associate Agreement establishes the terms and conditions under which the provider agrees to protect Protected Health Information (PHI) in accordance with HIPAA regulations...',
          required: true 
        },
        { 
          id: 'tos', 
          name: 'Terms of Service', 
          version: '1.0.0',
          content: 'By registering as a Community Care Provider, you agree to comply with all applicable laws and regulations, maintain accurate credentials, and provide timely services to veterans...',
          required: true 
        },
        { 
          id: 'pricing', 
          name: 'Pricing Agreement', 
          version: '1.0.0',
          content: 'Provider agrees to honor the pricing established during registration and provide transparent billing for all services rendered to veterans through the VA Community Care program...',
          required: true 
        }
      ]);
    } finally {
      setLoadingAgreements(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
    if (errors[`location.${field}`]) {
      setErrors(prev => ({ ...prev, [`location.${field}`]: null }));
    }
  };

  const handleOperatingHoursChange = (period, field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        operatingHours: {
          ...prev.location.operatingHours,
          [period]: {
            ...prev.location.operatingHours[period],
            [field]: value
          }
        }
      }
    }));
  };

  const handleTelehealthStateToggle = (state) => {
    setFormData(prev => {
      const current = prev.telehealthStates;
      const updated = current.includes(state)
        ? current.filter(s => s !== state)
        : [...current, state];
      return { ...prev, telehealthStates: updated };
    });
  };

  const addCredential = () => {
    setFormData(prev => ({
      ...prev,
      credentials: [
        ...prev.credentials,
        {
          id: Date.now(),
          type: '',
          number: '',
          issuingAuthority: '',
          state: '',
          expirationDate: '',
          documentFile: null,
          documentName: ''
        }
      ]
    }));
  };

  const updateCredential = (index, field, value) => {
    setFormData(prev => {
      const credentials = [...prev.credentials];
      credentials[index] = { ...credentials[index], [field]: value };
      return { ...prev, credentials };
    });
  };

  const removeCredential = (index) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials.filter((_, i) => i !== index)
    }));
  };

  const handleCredentialFileUpload = (index, event) => {
    const file = event.target.files?.[0];
    if (file) {
      updateCredential(index, 'documentFile', file);
      updateCredential(index, 'documentName', file.name);
    }
  };

  const toggleService = (serviceId) => {
    setFormData(prev => {
      const existing = prev.services.find(s => s.serviceId === serviceId);
      if (existing) {
        return {
          ...prev,
          services: prev.services.filter(s => s.serviceId !== serviceId)
        };
      } else {
        return {
          ...prev,
          services: [
            ...prev.services,
            {
              serviceId,
              price: '',
              turnaroundDays: '',
              acceptsVACommunitycare: true
            }
          ]
        };
      }
    });
  };

  const updateService = (serviceId, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s =>
        s.serviceId === serviceId ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleAgreementSign = (agreementId, signature) => {
    setFormData(prev => ({
      ...prev,
      agreements: {
        ...prev.agreements,
        [agreementId]: {
          signed: true,
          signature,
          signedAt: new Date().toISOString()
        }
      }
    }));
  };

  const handleAgreementAcknowledge = (agreementId, acknowledged) => {
    setFormData(prev => ({
      ...prev,
      agreements: {
        ...prev.agreements,
        [agreementId]: {
          ...prev.agreements[agreementId],
          acknowledged
        }
      }
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.practiceName) newErrors.practiceName = 'Practice name is required';
    if (!formData.practiceType) newErrors.practiceType = 'Practice type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.npiNumber) {
      newErrors.npiNumber = 'NPI Number is required';
    } else if (!/^\d{10}$/.test(formData.npiNumber)) {
      newErrors.npiNumber = 'NPI must be exactly 10 digits';
    }
    if (!formData.businessPhone) newErrors.businessPhone = 'Business phone is required';
    if (!formData.businessEmail) newErrors.businessEmail = 'Business email is required';
    if (formData.servesTelehealth && formData.telehealthStates.length === 0) {
      newErrors.telehealthStates = 'Please select at least one state for telehealth services';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.location.addressLine1) newErrors['location.addressLine1'] = 'Address is required';
    if (!formData.location.city) newErrors['location.city'] = 'City is required';
    if (!formData.location.state) newErrors['location.state'] = 'State is required';
    if (!formData.location.zipCode) newErrors['location.zipCode'] = 'ZIP code is required';
    else if (!/^\d{5}(-\d{4})?$/.test(formData.location.zipCode)) {
      newErrors['location.zipCode'] = 'Please enter a valid ZIP code';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    if (formData.credentials.length === 0) {
      newErrors.credentials = 'At least one credential is required';
    } else {
      formData.credentials.forEach((cred, index) => {
        if (!cred.type) newErrors[`credential_${index}_type`] = 'Credential type is required';
        if (!cred.number) newErrors[`credential_${index}_number`] = 'Credential number is required';
        if (!cred.expirationDate) newErrors[`credential_${index}_expiration`] = 'Expiration date is required';
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = () => {
    const newErrors = {};
    if (formData.services.length === 0) {
      newErrors.services = 'Please select at least one service to offer';
    } else {
      formData.services.forEach((service, index) => {
        if (!service.price) newErrors[`service_${index}_price`] = 'Price is required';
        if (!service.turnaroundDays) newErrors[`service_${index}_turnaround`] = 'Turnaround time is required';
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep6 = () => {
    const newErrors = {};
    requiredAgreements.forEach(agreement => {
      if (agreement.required) {
        const agreementData = formData.agreements[agreement.id];
        if (!agreementData?.signed) {
          newErrors[`agreement_${agreement.id}_signed`] = 'Signature is required';
        }
        if (!agreementData?.acknowledged) {
          newErrors[`agreement_${agreement.id}_acknowledged`] = 'Please acknowledge the agreement';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = true;
    switch (currentStep) {
      case 1: isValid = validateStep1(); break;
      case 2: isValid = validateStep2(); break;
      case 3: isValid = validateStep3(); break;
      case 4: isValid = validateStep4(); break;
      case 5: isValid = validateStep5(); break;
      case 6: isValid = validateStep6(); break;
      default: break;
    }
    if (isValid && currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        practice_name: formData.practiceName,
        practice_type: formData.practiceType,
        npi_number: formData.npiNumber,
        business_phone: formData.businessPhone,
        business_email: formData.businessEmail,
        website: formData.website || null,
        serves_telehealth: formData.servesTelehealth,
        telehealth_states: formData.telehealthStates
      };

      const registerResponse = await api.post('/providers/register', registrationData);
      const providerId = registerResponse.data.provider_id;

      const locationData = {
        provider_id: providerId,
        address_line1: formData.location.addressLine1,
        address_line2: formData.location.addressLine2 || null,
        city: formData.location.city,
        state: formData.location.state,
        zip_code: formData.location.zipCode,
        phone: formData.location.phone || null,
        wheelchair_accessible: formData.location.wheelchairAccessible,
        operating_hours: formData.location.operatingHours
      };
      await api.post('/providers/locations', locationData);

      for (const credential of formData.credentials) {
        const credentialData = {
          provider_id: providerId,
          credential_type: credential.type,
          credential_number: credential.number,
          issuing_authority: credential.issuingAuthority || null,
          state: credential.state || null,
          expiration_date: credential.expirationDate
        };
        await api.post('/providers/credentials', credentialData);
      }

      const servicesData = {
        provider_id: providerId,
        services: formData.services.map(s => ({
          service_type_id: s.serviceId,
          price: parseFloat(s.price),
          turnaround_days: parseInt(s.turnaroundDays),
          accepts_va_community_care: s.acceptsVACommunitycare
        }))
      };
      await api.post('/providers/services', servicesData);

      const agreementSignatures = Object.entries(formData.agreements).map(([agreementId, data]) => ({
        agreement_id: agreementId,
        signature: data.signature,
        signed_at: data.signedAt
      }));
      await api.post('/agreements/sign', { 
        provider_id: providerId,
        signatures: agreementSignatures 
      });

      setSubmitSuccess(true);
      toast.success('Registration successful! Welcome to the VA Community Care Network.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const progress = ((currentStep) / STEPS.length) * 100;
    
    return (
      <div className="mb-8">
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
        <nav aria-label="Registration progress">
          <ol className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {STEPS.map((step) => {
              const StepIcon = step.icon || FallbackIcon;
              const isComplete = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <li key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    disabled={step.id > currentStep}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                      ${isComplete ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200' : ''}
                      ${isCurrent ? 'bg-[#1B3A5F] text-white' : ''}
                      ${!isComplete && !isCurrent ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2
                      ${isComplete ? 'bg-green-600 border-green-600 text-white' : ''}
                      ${isCurrent ? 'bg-white border-white text-[#1B3A5F]' : ''}
                      ${!isComplete && !isCurrent ? 'bg-white border-slate-300 text-slate-400' : ''}
                    `}>
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <StepIcon className="w-4 h-4" aria-hidden="true" />
                      )}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">{step.name}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    );
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Account Information
        </CardTitle>
        <CardDescription>
          Create your provider account credentials and basic practice information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="provider@example.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.email}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Minimum 8 characters"
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.password}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-md font-medium text-slate-900 mb-4">Practice Information</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="practiceName">Practice Name *</Label>
              <Input
                id="practiceName"
                value={formData.practiceName}
                onChange={(e) => handleInputChange('practiceName', e.target.value)}
                placeholder="e.g., Veterans Health Associates"
                className={errors.practiceName ? 'border-red-500' : ''}
              />
              {errors.practiceName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.practiceName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="practiceType">Practice Type *</Label>
              <select
                id="practiceType"
                value={formData.practiceType}
                onChange={(e) => handleInputChange('practiceType', e.target.value)}
                className={`w-full mt-1 px-3 py-2 border rounded-md bg-background ${
                  errors.practiceType ? 'border-red-500' : 'border-input'
                }`}
              >
                <option value="">Select practice type</option>
                {PRACTICE_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {errors.practiceType && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.practiceType}
                </p>
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
          <Briefcase className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Professional Information
        </CardTitle>
        <CardDescription>
          Enter your professional credentials and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="npiNumber">NPI Number *</Label>
          <Input
            id="npiNumber"
            value={formData.npiNumber}
            onChange={(e) => handleInputChange('npiNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit NPI number"
            maxLength={10}
            className={errors.npiNumber ? 'border-red-500' : ''}
          />
          {errors.npiNumber && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.npiNumber}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Your National Provider Identifier (NPI) is required for VA Community Care participation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Business Phone *
            </Label>
            <Input
              id="businessPhone"
              type="tel"
              value={formData.businessPhone}
              onChange={(e) => handleInputChange('businessPhone', e.target.value)}
              placeholder="(555) 123-4567"
              className={errors.businessPhone ? 'border-red-500' : ''}
            />
            {errors.businessPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.businessPhone}</p>
            )}
          </div>
          <div>
            <Label htmlFor="businessEmail" className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Business Email *
            </Label>
            <Input
              id="businessEmail"
              type="email"
              value={formData.businessEmail}
              onChange={(e) => handleInputChange('businessEmail', e.target.value)}
              placeholder="office@practice.com"
              className={errors.businessEmail ? 'border-red-500' : ''}
            />
            {errors.businessEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.businessEmail}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> Website (Optional)
          </Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://www.yourpractice.com"
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              id="servesTelehealth"
              checked={formData.servesTelehealth}
              onCheckedChange={(checked) => handleInputChange('servesTelehealth', checked)}
            />
            <Label htmlFor="servesTelehealth" className="cursor-pointer">
              I offer telehealth services
            </Label>
          </div>

          {formData.servesTelehealth && (
            <div className="ml-8 p-4 bg-slate-50 rounded-lg">
              <Label className="mb-3 block">States where you're licensed to provide telehealth:</Label>
              {errors.telehealthStates && (
                <p className="mb-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.telehealthStates}
                </p>
              )}
              <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                {US_STATES.map(state => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => handleTelehealthStateToggle(state)}
                    className={`
                      px-2 py-1 text-sm rounded border transition-all
                      ${formData.telehealthStates.includes(state)
                        ? 'bg-[#1B3A5F] text-white border-[#1B3A5F]'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-[#1B3A5F]'
                      }
                    `}
                  >
                    {state}
                  </button>
                ))}
              </div>
              {formData.telehealthStates.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Selected: {formData.telehealthStates.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Primary Location
        </CardTitle>
        <CardDescription>
          Enter your primary practice location where veterans will receive care
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="addressLine1">Address Line 1 *</Label>
          <Input
            id="addressLine1"
            value={formData.location.addressLine1}
            onChange={(e) => handleLocationChange('addressLine1', e.target.value)}
            placeholder="Street address"
            className={errors['location.addressLine1'] ? 'border-red-500' : ''}
          />
          {errors['location.addressLine1'] && (
            <p className="mt-1 text-sm text-red-600">{errors['location.addressLine1']}</p>
          )}
        </div>

        <div>
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input
            id="addressLine2"
            value={formData.location.addressLine2}
            onChange={(e) => handleLocationChange('addressLine2', e.target.value)}
            placeholder="Suite, unit, building (optional)"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.location.city}
              onChange={(e) => handleLocationChange('city', e.target.value)}
              placeholder="City"
              className={errors['location.city'] ? 'border-red-500' : ''}
            />
            {errors['location.city'] && (
              <p className="mt-1 text-sm text-red-600">{errors['location.city']}</p>
            )}
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <select
              id="state"
              value={formData.location.state}
              onChange={(e) => handleLocationChange('state', e.target.value)}
              className={`w-full mt-1 px-3 py-2 border rounded-md bg-background ${
                errors['location.state'] ? 'border-red-500' : 'border-input'
              }`}
            >
              <option value="">Select state</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors['location.state'] && (
              <p className="mt-1 text-sm text-red-600">{errors['location.state']}</p>
            )}
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              value={formData.location.zipCode}
              onChange={(e) => handleLocationChange('zipCode', e.target.value)}
              placeholder="12345"
              className={errors['location.zipCode'] ? 'border-red-500' : ''}
            />
            {errors['location.zipCode'] && (
              <p className="mt-1 text-sm text-red-600">{errors['location.zipCode']}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="locationPhone">Location Phone (Optional)</Label>
          <Input
            id="locationPhone"
            type="tel"
            value={formData.location.phone}
            onChange={(e) => handleLocationChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="wheelchairAccessible"
            checked={formData.location.wheelchairAccessible}
            onCheckedChange={(checked) => handleLocationChange('wheelchairAccessible', checked)}
          />
          <Label htmlFor="wheelchairAccessible" className="cursor-pointer">
            This location is wheelchair accessible
          </Label>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-md font-medium text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Operating Hours
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-medium">Weekdays (Mon-Fri)</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="weekdaysClosed"
                    checked={formData.location.operatingHours.weekdays.closed}
                    onCheckedChange={(checked) => handleOperatingHoursChange('weekdays', 'closed', checked)}
                  />
                  <Label htmlFor="weekdaysClosed" className="text-sm cursor-pointer">Closed</Label>
                </div>
              </div>
              {!formData.location.operatingHours.weekdays.closed && (
                <div className="flex items-center gap-4">
                  <div>
                    <Label htmlFor="weekdaysOpen" className="text-sm">Open</Label>
                    <Input
                      id="weekdaysOpen"
                      type="time"
                      value={formData.location.operatingHours.weekdays.open}
                      onChange={(e) => handleOperatingHoursChange('weekdays', 'open', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <span className="mt-6">to</span>
                  <div>
                    <Label htmlFor="weekdaysClose" className="text-sm">Close</Label>
                    <Input
                      id="weekdaysClose"
                      type="time"
                      value={formData.location.operatingHours.weekdays.close}
                      onChange={(e) => handleOperatingHoursChange('weekdays', 'close', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-medium">Weekends (Sat-Sun)</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="weekendsClosed"
                    checked={formData.location.operatingHours.weekends.closed}
                    onCheckedChange={(checked) => handleOperatingHoursChange('weekends', 'closed', checked)}
                  />
                  <Label htmlFor="weekendsClosed" className="text-sm cursor-pointer">Closed</Label>
                </div>
              </div>
              {!formData.location.operatingHours.weekends.closed && (
                <div className="flex items-center gap-4">
                  <div>
                    <Label htmlFor="weekendsOpen" className="text-sm">Open</Label>
                    <Input
                      id="weekendsOpen"
                      type="time"
                      value={formData.location.operatingHours.weekends.open}
                      onChange={(e) => handleOperatingHoursChange('weekends', 'open', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <span className="mt-6">to</span>
                  <div>
                    <Label htmlFor="weekendsClose" className="text-sm">Close</Label>
                    <Input
                      id="weekendsClose"
                      type="time"
                      value={formData.location.operatingHours.weekends.close}
                      onChange={(e) => handleOperatingHoursChange('weekends', 'close', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
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
          <Award className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Credentials
        </CardTitle>
        <CardDescription>
          Add your professional credentials and licenses. You can upload supporting documents for verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.credentials && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {errors.credentials}
            </p>
          </div>
        )}

        {formData.credentials.map((credential, index) => (
          <div key={credential.id} className="p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Credential {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCredential(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Credential Type *</Label>
                <select
                  value={credential.type}
                  onChange={(e) => updateCredential(index, 'type', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 border rounded-md bg-white ${
                    errors[`credential_${index}_type`] ? 'border-red-500' : 'border-input'
                  }`}
                >
                  <option value="">Select type</option>
                  {CREDENTIAL_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                {errors[`credential_${index}_type`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`credential_${index}_type`]}</p>
                )}
              </div>
              <div>
                <Label>Credential Number *</Label>
                <Input
                  value={credential.number}
                  onChange={(e) => updateCredential(index, 'number', e.target.value)}
                  placeholder="License/credential number"
                  className={errors[`credential_${index}_number`] ? 'border-red-500' : ''}
                />
                {errors[`credential_${index}_number`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`credential_${index}_number`]}</p>
                )}
              </div>
              <div>
                <Label>Issuing Authority</Label>
                <Input
                  value={credential.issuingAuthority}
                  onChange={(e) => updateCredential(index, 'issuingAuthority', e.target.value)}
                  placeholder="e.g., State Medical Board"
                />
              </div>
              <div>
                <Label>State</Label>
                <select
                  value={credential.state}
                  onChange={(e) => updateCredential(index, 'state', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-white"
                >
                  <option value="">Select state</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Expiration Date *</Label>
                <Input
                  type="date"
                  value={credential.expirationDate}
                  onChange={(e) => updateCredential(index, 'expirationDate', e.target.value)}
                  className={errors[`credential_${index}_expiration`] ? 'border-red-500' : ''}
                />
                {errors[`credential_${index}_expiration`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`credential_${index}_expiration`]}</p>
                )}
              </div>
              <div>
                <Label>Upload Document</Label>
                <div className="mt-1">
                  <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {credential.documentName || 'Choose file'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleCredentialFileUpload(index, e)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addCredential}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Credential
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Service Offerings
        </CardTitle>
        <CardDescription>
          Select the services you offer and set your pricing for VA Community Care patients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.services && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {errors.services}
            </p>
          </div>
        )}

        {loadingServices ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#1B3A5F]" />
            <span className="ml-2 text-muted-foreground">Loading available services...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {availableServices.map(service => {
              const isSelected = formData.services.some(s => s.serviceId === service.id);
              const selectedService = formData.services.find(s => s.serviceId === service.id);

              return (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg transition-all ${
                    isSelected ? 'border-[#1B3A5F] bg-slate-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <div>
                        <Label htmlFor={`service-${service.id}`} className="cursor-pointer font-medium">
                          {service.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{service.category}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary">Selected</Badge>
                    )}
                  </div>

                  {isSelected && (
                    <div className="mt-4 grid md:grid-cols-3 gap-4 pl-10">
                      <div>
                        <Label className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" /> Price *
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={selectedService?.price || ''}
                          onChange={(e) => updateService(service.id, 'price', e.target.value)}
                          placeholder="0.00"
                          className={errors[`service_${formData.services.findIndex(s => s.serviceId === service.id)}_price`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Turnaround (days) *
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={selectedService?.turnaroundDays || ''}
                          onChange={(e) => updateService(service.id, 'turnaroundDays', e.target.value)}
                          placeholder="e.g., 5"
                          className={errors[`service_${formData.services.findIndex(s => s.serviceId === service.id)}_turnaround`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <Checkbox
                          id={`va-${service.id}`}
                          checked={selectedService?.acceptsVACommunitycare ?? true}
                          onCheckedChange={(checked) => updateService(service.id, 'acceptsVACommunitycare', checked)}
                        />
                        <Label htmlFor={`va-${service.id}`} className="ml-2 cursor-pointer text-sm">
                          Accepts VA Community Care
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep6 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Agreements
        </CardTitle>
        <CardDescription>
          Review and sign the required agreements to participate in the VA Community Care program
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loadingAgreements ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#1B3A5F]" />
            <span className="ml-2 text-muted-foreground">Loading agreements...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {requiredAgreements.map(agreement => {
              const agreementData = formData.agreements[agreement.id] || {};
              const isSigned = agreementData.signed;
              const isAcknowledged = agreementData.acknowledged;

              return (
                <div
                  key={agreement.id}
                  className={`p-4 border rounded-lg ${
                    isSigned && isAcknowledged ? 'border-green-500 bg-green-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-[#1B3A5F]" />
                      <h4 className="font-medium">{agreement.name}</h4>
                      {agreement.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {isSigned && isAcknowledged && (
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Signed
                      </Badge>
                    )}
                  </div>

                  <div className="mb-4 p-3 bg-white border rounded max-h-40 overflow-y-auto">
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{agreement.content}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`signature-${agreement.id}`}>E-Signature *</Label>
                      <Input
                        id={`signature-${agreement.id}`}
                        value={agreementData.signature || ''}
                        onChange={(e) => handleAgreementSign(agreement.id, e.target.value)}
                        placeholder="Type your full legal name as signature"
                        className={errors[`agreement_${agreement.id}_signed`] ? 'border-red-500' : ''}
                      />
                      {errors[`agreement_${agreement.id}_signed`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`agreement_${agreement.id}_signed`]}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`acknowledge-${agreement.id}`}
                        checked={isAcknowledged}
                        onCheckedChange={(checked) => handleAgreementAcknowledge(agreement.id, checked)}
                      />
                      <Label htmlFor={`acknowledge-${agreement.id}`} className="cursor-pointer text-sm">
                        I have read, understand, and agree to the terms of this agreement
                      </Label>
                    </div>
                    {errors[`agreement_${agreement.id}_acknowledged`] && (
                      <p className="text-sm text-red-600">{errors[`agreement_${agreement.id}_acknowledged`]}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep7 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
          Review & Submit
        </CardTitle>
        <CardDescription>
          Review your information before submitting your registration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {submitError}
            </p>
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Registration successful! Redirecting to login...
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" /> Account Information
              </h4>
              <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
              <p><span className="text-muted-foreground">Practice:</span> {formData.practiceName}</p>
              <p><span className="text-muted-foreground">Type:</span> {PRACTICE_TYPES.find(t => t.id === formData.practiceType)?.name}</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Professional Information
              </h4>
              <Button variant="ghost" size="sm" onClick={() => goToStep(2)}>
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <p><span className="text-muted-foreground">NPI:</span> {formData.npiNumber}</p>
              <p><span className="text-muted-foreground">Phone:</span> {formData.businessPhone}</p>
              <p><span className="text-muted-foreground">Email:</span> {formData.businessEmail}</p>
              <p><span className="text-muted-foreground">Telehealth:</span> {formData.servesTelehealth ? 'Yes' : 'No'}</p>
              {formData.servesTelehealth && formData.telehealthStates.length > 0 && (
                <p className="col-span-2">
                  <span className="text-muted-foreground">States:</span> {formData.telehealthStates.join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Primary Location
              </h4>
              <Button variant="ghost" size="sm" onClick={() => goToStep(3)}>
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
            </div>
            <div className="text-sm">
              <p>{formData.location.addressLine1}</p>
              {formData.location.addressLine2 && <p>{formData.location.addressLine2}</p>}
              <p>{formData.location.city}, {formData.location.state} {formData.location.zipCode}</p>
              <p className="mt-2">
                <span className="text-muted-foreground">Wheelchair Accessible:</span>{' '}
                {formData.location.wheelchairAccessible ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Award className="w-4 h-4" /> Credentials ({formData.credentials.length})
              </h4>
              <Button variant="ghost" size="sm" onClick={() => goToStep(4)}>
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              {formData.credentials.map((cred, index) => (
                <div key={cred.id} className="flex items-center gap-2">
                  <Badge variant="outline">{CREDENTIAL_TYPES.find(t => t.id === cred.type)?.name}</Badge>
                  <span>{cred.number}</span>
                  {cred.state && <span className="text-muted-foreground">({cred.state})</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Services ({formData.services.length})
              </h4>
              <Button variant="ghost" size="sm" onClick={() => goToStep(5)}>
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              {formData.services.map(service => {
                const serviceInfo = availableServices.find(s => s.id === service.serviceId);
                return (
                  <div key={service.serviceId} className="flex items-center justify-between">
                    <span>{serviceInfo?.name || service.serviceId}</span>
                    <span className="text-muted-foreground">${service.price} / {service.turnaroundDays} days</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" /> Agreements
              </h4>
              <Button variant="ghost" size="sm" onClick={() => goToStep(6)}>
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              {requiredAgreements.map(agreement => {
                const agreementData = formData.agreements[agreement.id];
                const isSigned = agreementData?.signed && agreementData?.acknowledged;
                return (
                  <div key={agreement.id} className="flex items-center gap-2">
                    {isSigned ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>{agreement.name}</span>
                    {isSigned && (
                      <span className="text-muted-foreground">- Signed by {agreementData.signature}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1B3A5F] to-[#2C5282] flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            VA Community Care Provider Registration
          </h1>
          <p className="text-muted-foreground">
            Join the network of providers serving our nation's veterans
          </p>
        </div>

        {renderStepIndicator()}

        {renderCurrentStep()}

        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>

          {currentStep < 7 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || submitSuccess}
              className="bg-[#1B3A5F] hover:bg-[#2a4a6f]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Submit Registration
                </>
              )}
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-[#1B3A5F] hover:underline font-medium">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
