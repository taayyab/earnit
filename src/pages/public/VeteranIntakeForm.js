import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import {
  User,
  Shield,
  FileText,
  Award,
  Target,
  CheckCircle2,
  Upload,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Consent', icon: Shield },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Service History', icon: Award },
  { id: 5, title: 'Objectives', icon: Target },
  { id: 6, title: 'Confirmation', icon: CheckCircle2 }
];

const BRANCHES = [
  'Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force'
];

const DISCHARGE_TYPES = [
  'Honorable',
  'General (Under Honorable Conditions)',
  'Other Than Honorable',
  'Bad Conduct',
  'Dishonorable'
];

export default function VeteranIntakeForm() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [completed, setCompleted] = useState(false);

  const [formData, setFormData] = useState({
    personal_info: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      ssn_last_four: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: ''
    },
    consents: [
      { consent_type: 'representation', consent_given: false, label: 'I consent to be represented by this organization in my VA disability claim.' },
      { consent_type: 'phi_access', consent_given: false, label: 'I authorize access to my protected health information (PHI) as required for my claim.' },
      { consent_type: 'fee_agreement', consent_given: false, label: 'I understand and agree to the fee structure as explained.' }
    ],
    service_history: {
      branch: '',
      service_start: '',
      service_end: '',
      discharge_type: '',
      mos: '',
      deployments: []
    },
    claim_objectives: '',
    conditions_to_claim: [],
    additional_notes: ''
  });

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/public/veteran-intake/${token}`);
      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Invalid or expired invitation link');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setTokenData(data);
      setFormData(prev => ({
        ...prev,
        personal_info: {
          ...prev.personal_info,
          email: data.veteran_email || '',
          first_name: data.veteran_name?.split(' ')[0] || '',
          last_name: data.veteran_name?.split(' ').slice(1).join(' ') || ''
        }
      }));
    } catch (err) {
      setError('Failed to validate invitation link');
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personal_info: { ...prev.personal_info, [field]: value }
    }));
  };

  const updateConsent = (index, value) => {
    setFormData(prev => ({
      ...prev,
      consents: prev.consents.map((c, i) => 
        i === index ? { ...c, consent_given: value } : c
      )
    }));
  };

  const updateServiceHistory = (field, value) => {
    setFormData(prev => ({
      ...prev,
      service_history: { ...prev.service_history, [field]: value }
    }));
  };

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('document_type', docType);

    try {
      const response = await fetch(`/api/public/veteran-intake/${token}/upload`, {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedDocs(prev => [...prev, { type: docType, name: file.name }]);
        toast.success(`${docType} uploaded successfully`);
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to upload document');
      }
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/public/veteran-intake/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setCompleted(true);
        setStep(6);
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to submit onboarding');
      }
    } catch (err) {
      toast.error('Failed to submit onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.personal_info.first_name && 
               formData.personal_info.last_name && 
               formData.personal_info.email;
      case 2:
        return formData.consents.every(c => c.consent_given);
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#1B3A5F] mx-auto mb-4" />
          <p className="text-slate-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Invitation</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <p className="text-sm text-slate-500">
              Please contact your representative for a new invitation link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Onboarding Complete!</h2>
            <p className="text-slate-600 mb-6">
              Thank you for completing your onboarding with {tokenData?.organization_name}.
              Your representative will be in touch with next steps.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                A confirmation has been sent to your email address.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1B3A5F] mb-2">EarnedIT</h1>
          <p className="text-slate-600">VA Disability Claims Assistance</p>
          {tokenData && (
            <Badge className="mt-2 bg-[#1B3A5F] text-white">
              {tokenData.organization_name}
            </Badge>
          )}
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`flex flex-col items-center flex-1 ${
                  s.id === step
                    ? 'text-[#1B3A5F]'
                    : s.id < step
                    ? 'text-green-600'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    s.id === step
                      ? 'bg-[#1B3A5F] text-white'
                      : s.id < step
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200'
                  }`}
                >
                  {s.id < step ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <s.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs hidden sm:block">{s.title}</span>
              </div>
            ))}
          </div>
          <Progress value={(step / 5) * 100} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[step - 1].icon, { className: 'w-5 h-5 text-[#1B3A5F]' })}
              {STEPS[step - 1].title}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Please provide your personal information.'}
              {step === 2 && 'Review and accept the required consents.'}
              {step === 3 && 'Upload your DD-214 and any relevant documents.'}
              {step === 4 && 'Tell us about your military service.'}
              {step === 5 && 'Describe your claim objectives.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.personal_info.first_name}
                      onChange={(e) => updatePersonalInfo('first_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.personal_info.last_name}
                      onChange={(e) => updatePersonalInfo('last_name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.personal_info.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.personal_info.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.personal_info.date_of_birth}
                      onChange={(e) => updatePersonalInfo('date_of_birth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssn">Last 4 of SSN</Label>
                    <Input
                      id="ssn"
                      maxLength={4}
                      value={formData.personal_info.ssn_last_four}
                      onChange={(e) => updatePersonalInfo('ssn_last_four', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address1">Address</Label>
                  <Input
                    id="address1"
                    placeholder="Street Address"
                    value={formData.personal_info.address_line1}
                    onChange={(e) => updatePersonalInfo('address_line1', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.personal_info.city}
                      onChange={(e) => updatePersonalInfo('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      maxLength={2}
                      value={formData.personal_info.state}
                      onChange={(e) => updatePersonalInfo('state', e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      maxLength={5}
                      value={formData.personal_info.zip_code}
                      onChange={(e) => updatePersonalInfo('zip_code', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {formData.consents.map((consent, idx) => (
                  <div key={consent.consent_type} className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                    <Checkbox
                      id={consent.consent_type}
                      checked={consent.consent_given}
                      onCheckedChange={(checked) => updateConsent(idx, checked)}
                    />
                    <label
                      htmlFor={consent.consent_type}
                      className="text-sm text-slate-700 leading-relaxed cursor-pointer"
                    >
                      {consent.label}
                    </label>
                  </div>
                ))}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> By providing consent, you authorize {tokenData?.organization_name} to assist with your VA disability claim.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Upload your DD-214</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'dd214')}
                      className="hidden"
                      id="dd214-upload"
                      disabled={uploadingDoc}
                    />
                    <label htmlFor="dd214-upload">
                      <Button variant="outline" className="cursor-pointer" asChild disabled={uploadingDoc}>
                        <span>{uploadingDoc ? 'Uploading...' : 'Select File'}</span>
                      </Button>
                    </label>
                  </div>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Upload Medical Records (Optional)</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'medical_records')}
                      className="hidden"
                      id="medical-upload"
                      disabled={uploadingDoc}
                    />
                    <label htmlFor="medical-upload">
                      <Button variant="outline" className="cursor-pointer" asChild disabled={uploadingDoc}>
                        <span>{uploadingDoc ? 'Uploading...' : 'Select File'}</span>
                      </Button>
                    </label>
                  </div>
                </div>
                {uploadedDocs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Uploaded Documents:</p>
                    {uploadedDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{doc.type}: {doc.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Branch of Service</Label>
                  <Select
                    value={formData.service_history.branch}
                    onValueChange={(value) => updateServiceHistory('branch', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((branch) => (
                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Start Date</Label>
                    <Input
                      type="date"
                      value={formData.service_history.service_start}
                      onChange={(e) => updateServiceHistory('service_start', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Service End Date</Label>
                    <Input
                      type="date"
                      value={formData.service_history.service_end}
                      onChange={(e) => updateServiceHistory('service_end', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Discharge Type</Label>
                  <Select
                    value={formData.service_history.discharge_type}
                    onValueChange={(value) => updateServiceHistory('discharge_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discharge type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCHARGE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>MOS/Rate/AFSC</Label>
                  <Input
                    placeholder="e.g., 11B, HM, 3D0X1"
                    value={formData.service_history.mos}
                    onChange={(e) => updateServiceHistory('mos', e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What conditions do you want to claim?</Label>
                  <Textarea
                    placeholder="List the conditions you believe are related to your service (e.g., PTSD, hearing loss, back pain, etc.)"
                    value={formData.conditions_to_claim.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      conditions_to_claim: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Describe your claim objectives</Label>
                  <Textarea
                    placeholder="What are you hoping to achieve with your VA disability claim?"
                    value={formData.claim_objectives}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      claim_objectives: e.target.value
                    }))}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any additional information you'd like to share..."
                    value={formData.additional_notes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      additional_notes: e.target.value
                    }))}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                className="bg-[#1B3A5F] hover:bg-[#152d4a]"
                onClick={nextStep}
                disabled={!canProceed() || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : step === 5 ? (
                  'Submit'
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Powered by EarnedIT | Secure & Confidential
        </p>
      </div>
    </div>
  );
}
