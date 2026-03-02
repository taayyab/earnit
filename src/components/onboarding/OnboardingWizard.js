import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import api, { documentsAPI } from '../../lib/api';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  Heart,
  User,
  FileText,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  File,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import ClaimTypeSelector from '../claims/ClaimTypeSelector';

const SERVICE_BRANCHES = [
  'Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force'
];

const DOCUMENT_TYPES = [
  { id: 'dd214', label: 'DD-214 (Discharge Papers)', required: true, description: 'Your certificate of release or discharge from active duty' },
  { id: 'medical_records', label: 'Service Medical Records', required: false, description: 'Medical treatment records from your military service' },
  { id: 'va_records', label: 'VA Medical Records', required: false, description: 'Records from VA medical facilities' },
  { id: 'private_medical', label: 'Private Medical Records', required: false, description: 'Records from civilian doctors or hospitals' },
  { id: 'buddy_statements', label: 'Buddy Statements', required: false, description: 'Statements from fellow service members' }
];

export default function OnboardingWizard({ onComplete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    phone: '',
    address_line1: '',
    city: '',
    state: '',
    zip_code: '',
    service_branch: '',
    service_start_date: '',
    service_end_date: '',
    discharge_status: 'honorable',
    claimType: 'original'
  });
  
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: Heart },
    { id: 'basic_info', title: 'Basic Information', icon: User },
    { id: 'claim_type', title: 'Claim Type', icon: Shield },
    { id: 'document_guidance', title: 'Document Guidance', icon: FileText },
    { id: 'document_upload', title: 'Upload Documents', icon: Upload },
    { id: 'confirmation', title: 'Confirmation', icon: CheckCircle2 }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        setUploading(true);
        setUploadProgress(0);
        
        const response = await documentsAPI.upload(file, null, (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        });

        if (response.data.success) {
          setUploadedFiles(prev => [...prev, {
            id: response.data.document_id,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'uploaded'
          }]);
          toast.success(`Uploaded: ${file.name}`);
        }
      } catch (err) {
        console.error('Upload failed:', err);
        toast.error(`Failed to upload: ${file.name}`);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.post('/users/complete-onboarding', {
        personal_info: {
          phone: formData.phone,
          address_line1: formData.address_line1,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code
        },
        service_data: {
          service_branch: formData.service_branch,
          service_start_date: formData.service_start_date,
          service_end_date: formData.service_end_date,
          discharge_status: formData.discharge_status
        },
        claim_type: formData.claimType,
        uploaded_documents: uploadedFiles.map(f => f.id),
        completed_at: new Date().toISOString()
      });
      
      toast.success('Welcome to EarnedIT! Your profile is set up.');
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      toast.error('Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return true;
      case 'basic_info':
        return formData.service_branch !== '';
      case 'claim_type':
        return true;
      case 'document_guidance':
        return true;
      case 'document_upload':
        return true;
      case 'confirmation':
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 max-w-xl mx-auto py-8">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Heart className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Welcome, {user?.first_name || 'Veteran'}!</h2>
            <p className="text-lg text-muted-foreground">
              Thank you for your service. EarnedIT is here to help you navigate the VA disability claims process 
              and get the benefits you've earned.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Secure</p>
                <p className="text-xs text-muted-foreground">HIPAA Compliant</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Guided</p>
                <p className="text-xs text-muted-foreground">Step-by-step help</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-[#1B3A5F] mx-auto mb-2" />
                <p className="text-sm font-medium">Proven</p>
                <p className="text-xs text-muted-foreground">Higher success rates</p>
              </div>
            </div>
          </div>
        );

      case 'basic_info':
        return (
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Tell Us About Yourself</h2>
              <p className="text-muted-foreground">This information helps us personalize your experience</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" /> Address
                </Label>
                <Input
                  value={formData.address_line1}
                  onChange={(e) => handleInputChange('address_line1', e.target.value)}
                  placeholder="Street address"
                  className="mb-2"
                />
                <div className="grid grid-cols-6 gap-2">
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    className="col-span-3"
                  />
                  <Input
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="ST"
                    maxLength={2}
                    className="col-span-1"
                  />
                  <Input
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    placeholder="ZIP"
                    className="col-span-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="branch" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Branch of Service *
                </Label>
                <select
                  id="branch"
                  value={formData.service_branch}
                  onChange={(e) => handleInputChange('service_branch', e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select branch</option>
                  {SERVICE_BRANCHES.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Service Start
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.service_start_date}
                    onChange={(e) => handleInputChange('service_start_date', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Service End
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.service_end_date}
                    onChange={(e) => handleInputChange('service_end_date', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'claim_type':
        return (
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Select Your Claim Type</h2>
              <p className="text-muted-foreground">Choose the type of claim you're filing</p>
            </div>
            <ClaimTypeSelector
              selectedType={formData.claimType}
              onTypeSelect={(type) => handleInputChange('claimType', type)}
            />
          </div>
        );

      case 'document_guidance':
        return (
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Documents You'll Need</h2>
              <p className="text-muted-foreground">Gather these documents to support your claim</p>
            </div>
            
            <div className="space-y-3">
              {DOCUMENT_TYPES.map(doc => (
                <div 
                  key={doc.id}
                  className={`p-4 rounded-lg border ${doc.required ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className={`h-5 w-5 mt-0.5 ${doc.required ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{doc.label}</span>
                        {doc.required && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Tip:</strong> Don't worry if you don't have all documents right now. 
                  You can upload them later, and we'll help you obtain missing records.
                </div>
              </div>
            </div>
          </div>
        );

      case 'document_upload':
        return (
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Upload Your Documents</h2>
              <p className="text-muted-foreground">Upload any documents you have ready</p>
            </div>

            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
                  <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                  <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, JPG, PNG (max 50MB each)</p>
                </>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files ({uploadedFiles.length})</Label>
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-center text-muted-foreground">
              You can skip this step and upload documents later from your dashboard.
            </p>
          </div>
        );

      case 'confirmation':
        return (
          <div className="max-w-xl mx-auto space-y-6 py-8 text-center">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">You're All Set!</h2>
            <p className="text-lg text-muted-foreground">
              Your profile is ready. You can now start building your VA disability claim.
            </p>
            
            <Card className="text-left">
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold">Summary</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Branch:</span>
                  <span>{formData.service_branch || 'Not specified'}</span>
                  <span className="text-muted-foreground">Documents Uploaded:</span>
                  <span>{uploadedFiles.length} files</span>
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{formData.phone || 'Not provided'}</span>
                </div>
              </CardContent>
            </Card>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Click "Complete Setup" to go to your dashboard and start your claim.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all ${
                  index < currentStep ? 'bg-green-500 border-green-500' :
                  index === currentStep ? 'bg-blue-500 border-blue-500' :
                  'bg-white border-gray-300'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : (
                    <step.icon className={`h-5 w-5 ${index === currentStep ? 'text-white' : 'text-gray-400'}`} />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
            <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button 
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Setup
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
