import React, { useState, useRef, useEffect } from 'react';
import IDmeFlowModal from '../components/IDmeFlowModal';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useCelebration } from '../components/Celebration';
import { animateError, animateSuccess } from '../lib/uxFeedback';
import { Shield, AlertCircle, CheckCircle2, Users, Briefcase, UserCheck, User, ChevronLeft, ChevronRight, Clock, Upload, Scale, FileCheck, Eye, EyeOff } from 'lucide-react';
import logoImage from '../assets/logo.webp';
import { toast } from 'sonner';
import api from '../lib/api';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

const REPRESENTATION_OPTIONS = [
  {
    id: 'earnedit_agent',
    title: 'EarnedIT Claims Assistance',
    description: 'AI-powered claims preparation with professional oversight',
    details: 'Our platform uses advanced AI to help prepare your claim, supervised by accredited VA partners.',
    badge: 'Pending VA Accreditation',
    badgeType: 'pending',
    icon: Shield,
    features: [
      'AI-assisted document analysis',
      'Condition extraction & evidence mapping',
      'Pre-submission quality review',
      'Supervised by accredited partners'
    ],
    requiresAcknowledgment: true,
    acknowledgmentText: 'I understand that EarnedIT is pending VA accreditation and my claim preparation services will be supervised by accredited partners.'
  },
  {
    id: 'vso_partner',
    title: 'Veterans Service Organization (VSO)',
    description: 'Work with an established VSO for your claim',
    details: 'Connect with a local or national VSO representative who can assist with your claim at no cost.',
    icon: Users,
    features: [
      'Free representation services',
      'Local VSO office support',
      'Accredited VSO representatives',
      'In-person assistance available'
    ],
    requiresCredentials: true
  },
  {
    id: 'accredited_agent',
    title: 'Accredited Claims Agent',
    description: 'Hire a VA-accredited claims agent',
    details: 'Work with an independent VA-accredited claims agent or attorney for professional representation.',
    icon: Briefcase,
    features: [
      'Professional legal representation',
      'VA-accredited agent/attorney',
      'May charge contingency fees',
      'Appeals expertise'
    ],
    requiresCredentials: true
  },
  {
    id: 'self_managed',
    title: 'Self-Managed (DIY)',
    description: 'File your claim independently',
    details: 'Use our platform tools to prepare and file your claim on your own.',
    icon: User,
    features: [
      'Full platform access',
      'Document organization tools',
      'Condition tracking',
      'Educational resources'
    ]
  }
];

const ACCREDITATION_TYPES = [
  {
    id: 'va_attorney',
    title: 'VA Attorney',
    description: 'Licensed attorney accredited by the VA Office of General Counsel',
    icon: Scale
  },
  {
    id: 'va_claims_agent',
    title: 'VA Claims Agent',
    description: 'Non-attorney claims agent accredited by the VA Office of General Counsel',
    icon: FileCheck
  },
  {
    id: 'vso_representative',
    title: 'VSO Representative',
    description: 'Representative authorized by a Veterans Service Organization',
    icon: Users
  }
];

const ROLE_OPTIONS = [
  {
    id: 'veteran',
    title: "I'm a Veteran",
    description: 'Get help with your VA disability claim',
    icon: User
  },
  {
    id: 'advocate',
    title: "I'm a Veteran Advocate",
    description: 'Support fellow veterans through peer-to-peer guidance',
    icon: UserCheck
  },
  {
    id: 'claims_agent',
    title: "I'm a Claims Agent",
    description: 'Provide professional representation services to veterans',
    icon: Briefcase
  },
  {
    id: 'partner_admin',
    title: "I'm a VSO / Partner Admin",
    description: 'Manage your organization and oversee veteran support programs',
    icon: Scale
  },
  {
    id: 'provider',
    title: "I'm a Community Provider",
    description: 'Deliver medical evidence and wraparound services to veterans',
    icon: Shield
  }
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    representation_mode: ''
  });
  const [userRole, setUserRole] = useState('');
  const [agentType, setAgentType] = useState('');
  const [acknowledgment, setAcknowledgment] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [credentialsSubmitted, setCredentialsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showIdmeVerify, setShowIdmeVerify] = useState(false);

  const [accreditationType, setAccreditationType] = useState('');
  const [ogcNumber, setOgcNumber] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [barState, setBarState] = useState('');
  const [vsoOrganization, setVsoOrganization] = useState('');
  const [vsoRepId, setVsoRepId] = useState('');
  const [credentialFile, setCredentialFile] = useState(null);
  const [credentialAttestation, setCredentialAttestation] = useState(false);
  
  const { register: registerUser } = useAuth();
  const { celebrate, CelebrationComponent } = useCelebration();
  const navigate = useNavigate();
  const errorRef = useRef(null);
  const successRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) {
      animateError(errorRef.current);
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  useEffect(() => {
    if (success && successRef.current) {
      animateSuccess(successRef.current);
    }
  }, [success]);

  const selectedOption = REPRESENTATION_OPTIONS.find(opt => opt.id === formData.representation_mode);
  const requiresCredentialsStep = selectedOption?.requiresCredentials === true;
  const isClaimsAgent = userRole === 'claims_agent';
  const isVeteran = userRole === 'veteran';
  const totalSteps = isClaimsAgent ? 3 : (requiresCredentialsStep ? 4 : isVeteran ? 3 : 2);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRepresentationSelect = (mode) => {
    setFormData({ ...formData, representation_mode: mode });
    setAcknowledgment(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCredentialFile(e.target.files[0]);
    }
  };

  const canProceedToStep2 = () => {
    return (
      formData.first_name.trim() !== '' &&
      formData.last_name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password.length >= 8 &&
      formData.password === formData.confirm_password
    );
  };

  const canProceedToStep3 = () => {
    if (!userRole) return false;
    if (userRole === 'veteran') {
      if (!formData.representation_mode) return false;
      if (selectedOption?.requiresAcknowledgment && !acknowledgment) return false;
    } else if (userRole === 'claims_agent') {
      if (!agentType) return false;
    }
    return true;
  };

  const canSubmitCredentials = () => {
    if (!accreditationType) return false;
    if (!credentialAttestation) return false;
    
    if (accreditationType === 'va_attorney') {
      return ogcNumber.trim() !== '' && barNumber.trim() !== '' && barState !== '';
    } else if (accreditationType === 'va_claims_agent') {
      return ogcNumber.trim() !== '';
    } else if (accreditationType === 'vso_representative') {
      return vsoOrganization.trim() !== '' && vsoRepId.trim() !== '';
    }
    return false;
  };

  const canSubmit = () => {
    if (!userRole) return false;
    if (userRole === 'veteran') {
      if (!formData.representation_mode) return false;
      if (selectedOption?.requiresAcknowledgment && !acknowledgment) return false;
    } else if (userRole === 'claims_agent') {
      if (!agentType) return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    setError('');
    if (!userRole) {
      setError('Please select whether you are a Veteran or Claims Agent');
      return;
    }
    if (userRole === 'veteran') {
      if (!canProceedToStep3()) {
        setError('Please select a representation type');
        return;
      }
      if (requiresCredentialsStep) {
        setStep(3);
      } else {
        handleSubmit();
      }
    } else if (userRole === 'claims_agent') {
      if (!agentType) {
        setError('Please select your agent type');
        return;
      }
      setAccreditationType(agentType);
      setStep(3);
    }
  };

  const submitAccreditation = async () => {
    const credentials = {
      ogc_number: ogcNumber || null,
      bar_number: accreditationType === 'va_attorney' ? barNumber : null,
      bar_state: accreditationType === 'va_attorney' ? barState : null,
      vso_org_id: accreditationType === 'vso_representative' ? vsoOrganization : null,
      vso_rep_id: accreditationType === 'vso_representative' ? vsoRepId : null
    };

    const response = await api.post('/accreditation/submit', {
      accreditation_type: accreditationType,
      credentials: credentials,
      attestation_accepted: true
    });

    const submissionId = response.data.submission_id;

    if (credentialFile && submissionId) {
      const documentTypeMap = {
        'va_attorney': 'bar_license',
        'va_claims_agent': 'ogc_certificate',
        'vso_representative': 'vso_authorization'
      };
      const documentType = documentTypeMap[accreditationType] || 'other';
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', credentialFile);
      
      try {
        await api.post(
          `/accreditation/upload?document_type=${documentType}&submission_id=${submissionId}`,
          uploadFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setCredentialFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (uploadError) {
        console.error('Document upload failed:', uploadError);
        toast.error('Your credentials were submitted but the document upload failed. You can upload documents later.');
      }
    }

    setCredentialsSubmitted(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!canSubmit()) {
      setError('Please complete all required selections');
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: userRole,
        representation_mode: userRole === 'veteran' ? formData.representation_mode : null,
        agent_type: userRole === 'claims_agent' ? agentType : null
      };

      await registerUser(registrationData);

      if (userRole === 'veteran') {
        // Veterans must verify identity with ID.me before accessing the dashboard
        setLoading(false);
        setShowIdmeVerify(true);
      } else {
        setSuccess(true);
        celebrate('profile_complete', `Welcome aboard, ${formData.first_name}! Your account is ready.`);
        const redirectPath = userRole === 'claims_agent' ? '/agent/onboarding' : '/dashboard';
        setTimeout(() => navigate(redirectPath), 3500);
      }

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error?.message || err.response?.data?.detail || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const handleVeteranVerified = () => {
    setShowIdmeVerify(false);
    setSuccess(true);
    celebrate('profile_complete', `Welcome, ${formData.first_name}! Your veteran status is confirmed.`);
    setTimeout(() => navigate('/document-onboarding'), 2500);
  };

  const handleCredentialsSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!canSubmitCredentials()) {
      setError('Please complete all required fields and accept the attestation');
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: userRole,
        representation_mode: userRole === 'veteran' ? formData.representation_mode : null,
        agent_type: userRole === 'claims_agent' ? agentType : null
      };

      await registerUser(registrationData);

      await submitAccreditation();

      if (userRole === 'veteran') {
        setLoading(false);
        setShowIdmeVerify(true);
      } else {
        setSuccess(true);
        celebrate('profile_complete', `Welcome aboard, ${formData.first_name}! Your credentials are pending verification.`);
        const redirectPath = userRole === 'claims_agent' ? '/agent/onboarding' : '/dashboard';
        setTimeout(() => navigate(redirectPath), 3500);
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error?.message || err.response?.data?.detail || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const step2Label = isClaimsAgent ? 'Agent Type' : 'Role';
    // Build steps array dynamically
    const indicatorSteps = [{ label: 'Account Info' }, { label: step2Label }];
    if (requiresCredentialsStep) indicatorSteps.push({ label: 'Credentials' });
    if (isVeteran) indicatorSteps.push({ label: 'Verify ID', isVerify: true });
    if (isClaimsAgent) indicatorSteps.push({ label: 'Credentials' });

    return (
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center gap-2">
          {indicatorSteps.map((s, i) => {
            const stepNum = i + 1;
            const isActive = step >= stepNum;
            const isDone = step > stepNum || (s.isVerify && showIdmeVerify);
            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <div className="w-12 h-0.5 mb-4 bg-gray-200 relative">
                    <div className="absolute inset-0 bg-[#DC2626] transition-all duration-300" style={{ width: isActive ? '100%' : '0%' }} />
                  </div>
                )}
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shadow-sm transition-all ${
                    s.isVerify
                      ? showIdmeVerify || success
                        ? 'bg-[#DC2626] text-white'
                        : isActive
                        ? 'bg-[#DC2626]/30 text-[#DC2626] border-2 border-[#DC2626]'
                        : 'bg-gray-200 text-gray-400'
                      : isActive
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone && !s.isVerify
                      ? <CheckCircle2 className="h-5 w-5" />
                      : s.isVerify
                      ? <Shield className="h-4 w-4" />
                      : stepNum}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-[#1B3A5F]' : 'text-gray-400'}`}>{s.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCredentialsForm = () => {
    if (accreditationType === 'va_attorney') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ogc_number">OGC Accreditation Number *</Label>
            <Input
              id="ogc_number"
              type="text"
              placeholder="Enter your OGC accreditation number"
              value={ogcNumber}
              onChange={(e) => setOgcNumber(e.target.value)}
              required
              data-testid="ogc-number-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bar_number">Bar Number *</Label>
            <Input
              id="bar_number"
              type="text"
              placeholder="Enter your bar number"
              value={barNumber}
              onChange={(e) => setBarNumber(e.target.value)}
              required
              data-testid="bar-number-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bar_state">Bar State *</Label>
            <select
              id="bar_state"
              value={barState}
              onChange={(e) => setBarState(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
              data-testid="bar-state-select"
            >
              <option value="">Select state...</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="credential_file">Bar License / Accreditation Certificate (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="credential_file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                data-testid="credential-file-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {credentialFile ? credentialFile.name : 'Upload Document'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Accepted formats: PDF, JPG, PNG</p>
          </div>
        </div>
      );
    }

    if (accreditationType === 'va_claims_agent') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ogc_number">OGC Accreditation Number *</Label>
            <Input
              id="ogc_number"
              type="text"
              placeholder="Enter your OGC accreditation number"
              value={ogcNumber}
              onChange={(e) => setOgcNumber(e.target.value)}
              required
              data-testid="ogc-number-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credential_file">OGC Certificate (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="credential_file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                data-testid="credential-file-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {credentialFile ? credentialFile.name : 'Upload Certificate'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Accepted formats: PDF, JPG, PNG</p>
          </div>
        </div>
      );
    }

    if (accreditationType === 'vso_representative') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vso_organization">VSO Organization Name *</Label>
            <Input
              id="vso_organization"
              type="text"
              placeholder="e.g., American Legion, DAV, VFW"
              value={vsoOrganization}
              onChange={(e) => setVsoOrganization(e.target.value)}
              required
              data-testid="vso-organization-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vso_rep_id">VSO Representative ID *</Label>
            <Input
              id="vso_rep_id"
              type="text"
              placeholder="Enter your VSO representative ID"
              value={vsoRepId}
              onChange={(e) => setVsoRepId(e.target.value)}
              required
              data-testid="vso-rep-id-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credential_file">Authorization Letter (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="credential_file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                data-testid="credential-file-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {credentialFile ? credentialFile.name : 'Upload Authorization Letter'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Accepted formats: PDF, JPG, PNG</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white" data-testid="register-page">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImage} alt="EarnedIT" className="h-16 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-[#1B3A5F]">EarnedIT</h1>
              <p className="text-xs text-slate-500">Veteran Benefits Platform</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          {renderStepIndicator()}

          {step === 1 && (
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                <CardDescription>
                  Join EarnedIT to start your VA disability claim
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert ref={errorRef} className="mb-4 border-[hsl(var(--destructive))] bg-red-50" data-testid="register-error">
                    <AlertCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        type="text"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        data-testid="first-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        type="text"
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        data-testid="last-name-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="veteran@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      data-testid="email-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        data-testid="password-input"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        name="confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        data-testid="confirm-password-input"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#DC2626] hover:bg-[#B91C1C]"
                    disabled={!canProceedToStep2()}
                    data-testid="next-step-button"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                  <p className="text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-[hsl(var(--primary))] hover:underline font-medium"
                      data-testid="login-link"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-[#1B3A5F] mb-2">
                  {!userRole ? 'Tell Us About Yourself'
                    : userRole === 'veteran' ? 'Choose Your Representation'
                    : userRole === 'claims_agent' ? 'Select Your Agent Type'
                    : 'Almost Done!'}
                </h2>
                <p className="text-slate-500 text-base">
                  {!userRole ? 'Select the role that best describes you to personalize your experience'
                    : userRole === 'veteran' ? "Select how you'd like to manage your VA disability claim"
                    : userRole === 'claims_agent' ? 'Choose the type of accreditation you hold'
                    : 'Click Create Account to complete your registration'}
                </p>
              </div>

              {error && (
                <Alert ref={errorRef} className="mb-4 border-[hsl(var(--destructive))] bg-red-50 max-w-md mx-auto" data-testid="register-error">
                  <AlertCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert ref={successRef} className="mb-4 border-[hsl(var(--success))] bg-green-50 max-w-md mx-auto" data-testid="register-success">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                  <AlertDescription>
                    Account created! {userRole === 'claims_agent' ? 'Taking you to agent onboarding...' : userRole === 'veteran' ? 'Taking you to upload your documents...' : 'Taking you to your dashboard...'}
                  </AlertDescription>
                </Alert>
              )}

              {!userRole && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                  {ROLE_OPTIONS.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = userRole === option.id;
                    return (
                      <div
                        key={option.id}
                        className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden group focus:outline-none ${
                          isSelected
                            ? 'border-[#DC2626] bg-red-50/40 shadow-md'
                            : 'border-slate-200 bg-white hover:border-[#1B3A5F]/30 hover:shadow-sm'
                        }`}
                        onClick={() => {
                          setUserRole(option.id);
                          setFormData({ ...formData, representation_mode: '' });
                          setAgentType('');
                          setAcknowledgment(false);
                        }}
                        data-testid={`role-${option.id}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setUserRole(option.id)}
                      >
                        {/* Theme accent bar */}
                        <div className={`h-1 w-full ${isSelected ? 'bg-[#DC2626]' : 'bg-[#1B3A5F]'}`} />

                        <div className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${isSelected ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-[#1B3A5F]/8 text-[#1B3A5F]'}`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#DC2626] flex items-center justify-center shadow-sm">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className={`font-semibold text-[15px] mb-1 leading-snug ${isSelected ? 'text-[#DC2626]' : 'text-slate-900'}`}>{option.title}</h3>
                          <p className="text-sm text-slate-500 leading-relaxed">{option.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {userRole === 'veteran' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REPRESENTATION_OPTIONS.map((option) => {
                      const IconComponent = option.icon;
                      const isSelected = formData.representation_mode === option.id;
                      
                      return (
                        <Card 
                          key={option.id}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            isSelected 
                              ? 'ring-2 ring-[hsl(var(--accent))] border-[hsl(var(--accent))]' 
                              : 'hover:border-[hsl(var(--accent))]/50'
                          }`}
                          onClick={() => handleRepresentationSelect(option.id)}
                          data-testid={`representation-${option.id}`}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-[hsl(var(--accent))]/10' : 'bg-gray-100'}`}>
                                  <IconComponent className={`h-6 w-6 ${isSelected ? 'text-[hsl(var(--accent))]' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{option.title}</CardTitle>
                                  {option.badge && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                                      option.badgeType === 'pending' 
                                        ? 'bg-amber-100 text-amber-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      <Clock className="h-3 w-3" />
                                      {option.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                              </div>
                            </div>
                            <CardDescription className="mt-2">{option.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-3">{option.details}</p>
                            <ul className="space-y-1">
                              {option.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {selectedOption?.requiresAcknowledgment && (
                    <div className="max-w-2xl mx-auto">
                      <Alert className="border-amber-200 bg-amber-50">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={acknowledgment}
                              onChange={(e) => setAcknowledgment(e.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-amber-300 text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
                              data-testid="acknowledgment-checkbox"
                            />
                            <span className="text-sm">{selectedOption.acknowledgmentText}</span>
                          </label>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </>
              )}

              {userRole && userRole !== 'veteran' && userRole !== 'claims_agent' && (
                <div className="max-w-md mx-auto text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {ROLE_OPTIONS.find(r => r.id === userRole)?.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ROLE_OPTIONS.find(r => r.id === userRole)?.description}
                    </p>
                  </div>
                  {isVeteran ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <Shield className="h-4 w-4 text-[#DC2626] flex-shrink-0" />
                      <p className="text-xs text-[#DC2626] font-medium">Next: You'll verify your veteran status with ID.me before accessing your dashboard.</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Click "Create Account" to complete your registration.</p>
                  )}
                </div>
              )}

              {userRole === 'claims_agent' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {ACCREDITATION_TYPES.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = agentType === type.id;
                    
                    return (
                      <Card 
                        key={type.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isSelected 
                            ? 'ring-2 ring-[hsl(var(--accent))] border-[hsl(var(--accent))]' 
                            : 'hover:border-[hsl(var(--accent))]/50'
                        }`}
                        onClick={() => setAgentType(type.id)}
                        data-testid={`agent-type-${type.id}`}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-[hsl(var(--accent))]/10' : 'bg-gray-100'}`}>
                              <IconComponent className={`h-6 w-6 ${isSelected ? 'text-[hsl(var(--accent))]' : 'text-gray-600'}`} />
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                            </div>
                          </div>
                          <CardTitle className="text-lg mt-3">{type.title}</CardTitle>
                          <CardDescription className="mt-1">{type.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between max-w-2xl mx-auto pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (userRole) {
                      setUserRole('');
                      setFormData({ ...formData, representation_mode: '' });
                      setAgentType('');
                    } else {
                      setStep(1);
                    }
                  }}
                  disabled={loading || success}
                  data-testid="back-button"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  className="bg-[#DC2626] hover:bg-[#B91C1C]"
                  disabled={!userRole || !canProceedToStep3() || loading || success}
                  onClick={handleStep2Next}
                  data-testid="register-submit-button"
                >
                  {loading ? 'Creating Account...' : success ? 'Account Created!' : (isClaimsAgent || requiresCredentialsStep) ? 'Continue' : isVeteran ? 'Create Account & Verify Identity' : 'Create Account'}
                  {!loading && !success && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center max-w-md mx-auto">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
                Your information is protected under HIPAA compliance.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#1B3A5F]">Professional Credentials</h2>
                <p className="text-muted-foreground mt-2">Enter your VA accreditation information for verification</p>
              </div>

              {error && (
                <Alert ref={errorRef} className="mb-4 border-[hsl(var(--destructive))] bg-red-50 max-w-md mx-auto" data-testid="register-error">
                  <AlertCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert ref={successRef} className="mb-4 border-green-200 bg-green-50 max-w-md mx-auto" data-testid="register-success">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {credentialsSubmitted 
                      ? "Account created! Your credentials are pending verification. You'll receive an email once approved."
                      : "Account created! Taking you to upload your documents..."
                    }
                  </AlertDescription>
                </Alert>
              )}

              <Card className="w-full max-w-lg mx-auto">
                <CardHeader>
                  <CardTitle className="text-lg">Select Your Accreditation Type</CardTitle>
                  <CardDescription>Choose the type of VA accreditation you hold</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {ACCREDITATION_TYPES.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = accreditationType === type.id;
                      
                      return (
                        <div
                          key={type.id}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setAccreditationType(type.id)}
                          data-testid={`accreditation-type-${type.id}`}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-[hsl(var(--accent))]/10' : 'bg-gray-100'}`}>
                            <IconComponent className={`h-5 w-5 ${isSelected ? 'text-[hsl(var(--accent))]' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{type.title}</p>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {accreditationType && (
                    <div className="pt-4 border-t">
                      {renderCredentialsForm()}
                    </div>
                  )}

                  {accreditationType && (
                    <div className="pt-4">
                      <Alert className="border-blue-200 bg-blue-50">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={credentialAttestation}
                              onChange={(e) => setCredentialAttestation(e.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-blue-300 text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
                              data-testid="credential-attestation-checkbox"
                            />
                            <span className="text-sm">
                              I attest that the information provided is accurate and I am authorized to represent veterans before the VA.
                            </span>
                          </label>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between max-w-lg mx-auto pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={loading || success}
                  data-testid="back-button-step3"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  className="bg-[#DC2626] hover:bg-[#B91C1C]"
                  disabled={!canSubmitCredentials() || loading || success}
                  onClick={handleCredentialsSubmit}
                  data-testid="submit-credentials-button"
                >
                  {loading ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account & Submit Credentials'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center max-w-md mx-auto">
                Your credentials will be verified by our team. You'll receive an email notification once your accreditation is approved.
              </p>
            </div>
          )}
        </div>
      </div>
      {CelebrationComponent}

      <IDmeFlowModal
        open={showIdmeVerify}
        onClose={() => {}}
        onSuccess={handleVeteranVerified}
        userName={`${formData.first_name || ''} ${formData.last_name || ''}`.trim() || 'Verified Veteran'}
      />
    </div>
  );
}
