import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../lib/auth-context';
import api from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Users,
  Upload,
  FileSearch,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  FileText,
  Loader2,
  X
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Select Client', icon: Users },
  { id: 2, name: 'Upload Documents', icon: Upload },
  { id: 3, name: 'AI Analysis', icon: FileSearch },
  { id: 4, name: 'Review Claim', icon: ClipboardCheck },
  { id: 5, name: 'Complete', icon: CheckCircle2 }
];

const REQUIRED_DOCUMENTS = [
  {
    id: 'dd214',
    name: 'DD-214',
    description: 'Certificate of Release or Discharge from Active Duty',
    required: true,
    icon: '📋'
  },
  {
    id: 'medical_records',
    name: 'Medical Records',
    description: 'Current VA or private medical records showing diagnoses',
    required: true,
    icon: '🏥'
  },
  {
    id: 'service_treatment_records',
    name: 'Service Treatment Records',
    description: 'In-service medical records (if available)',
    required: false,
    icon: '📁'
  }
];

export default function AgentClaimWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationId, setOrganizationId] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(true);
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedConditions, setSelectedConditions] = useState([]);
  
  const [claimNotes, setClaimNotes] = useState('');
  const [claimType, setClaimType] = useState('original');
  const [createdClaimId, setCreatedClaimId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrganizationAndClients();
    
    const preselectedClientId = searchParams.get('clientId') || location.state?.clientId;
    if (preselectedClientId) {
      setSelectedClient({ id: preselectedClientId });
    }
  }, []);

  useEffect(() => {
    if (selectedClient && selectedClient.id && clients.length > 0 && !selectedClient.veteran_name) {
      const fullClient = clients.find(c => c.id === selectedClient.id);
      if (fullClient) {
        setSelectedClient(fullClient);
      }
    }
  }, [clients, selectedClient]);

  const loadOrganizationAndClients = async () => {
    try {
      const orgResponse = await api.get('/partner/organization');
      if (orgResponse.data?.organization?.id) {
        const orgId = orgResponse.data.organization.id;
        setOrganizationId(orgId);
        
        const clientsResponse = await api.get(`/partner/organization/${orgId}/clients`);
        if (clientsResponse.data?.clients) {
          setClients(clientsResponse.data.clients);
        }
      }
    } catch (err) {
      console.error('Failed to load organization/clients:', err);
      setError('Failed to load client list. Please try again.');
    } finally {
      setLoadingClients(false);
    }
  };

  const identifyDocumentType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('dd214') || lower.includes('dd-214')) return 'dd214';
    if (lower.includes('str') || lower.includes('service treatment')) return 'service_treatment_records';
    return 'medical_records';
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: identifyDocumentType(file.name),
      status: 'pending'
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setError(null);
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

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileType = (index, newType) => {
    setUploadedFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, type: newType } : f
    ));
  };

  const hasRequiredDocuments = () => {
    const types = uploadedFiles.map(f => f.type);
    return types.includes('dd214') && types.includes('medical_records');
  };

  const handleAnalyzeDocuments = async () => {
    if (!hasRequiredDocuments()) {
      setError('Please upload at least DD-214 and medical records');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setCurrentStep(3);

    try {
      const formData = new FormData();
      uploadedFiles.forEach(({ file }) => {
        if (file) formData.append('files', file);
      });
      
      if (selectedClient?.veteran_id) {
        formData.append('veteran_id', selectedClient.veteran_id);
      }

      const response = await api.post('/claims-intelligence/analyze-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
        if (response.data.analysis?.conditions) {
          setSelectedConditions(response.data.analysis.conditions.map(c => c.condition || c.name));
        }
        setCurrentStep(4);
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message || 'Failed to analyze documents';
      setError(errorDetail);
      setCurrentStep(2);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleCondition = (conditionName) => {
    setSelectedConditions(prev => 
      prev.includes(conditionName)
        ? prev.filter(c => c !== conditionName)
        : [...prev, conditionName]
    );
  };

  const handleCreateClaim = async () => {
    if (!selectedClient || selectedConditions.length === 0) {
      setError('Please select at least one condition to claim');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        client_link_id: selectedClient.id,
        veteran_id: selectedClient.veteran_id,
        claim_type: claimType,
        conditions: selectedConditions.map(name => {
          const analysisCondition = analysis?.conditions?.find(c => (c.condition || c.name) === name);
          return {
            name: name,
            diagnostic_code: analysisCondition?.diagnostic_code,
            evidence_strength: analysisCondition?.evidence_strength,
            service_connection: analysisCondition?.service_connection
          };
        }),
        notes: claimNotes,
        analysis: analysis
      };

      const response = await api.post('/agent/claims/create-for-client', payload);
      
      if (response.data.success) {
        setCreatedClaimId(response.data.claim_id);
        setCurrentStep(5);
      } else {
        throw new Error(response.data.message || 'Failed to create claim');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message || 'Failed to create claim';
      setError(errorDetail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedClient) {
      setError('Please select a client');
      return;
    }
    if (currentStep === 1 && selectedClient) {
      const poaStatus = selectedClient.poa_status;
      if (poaStatus !== 'active') {
        setError(`Active Power of Attorney (POA) is required to create a claim. This client's POA status is: ${poaStatus || 'none'}. Please complete POA documentation first.`);
        return;
      }
    }
    if (currentStep === 2 && !hasRequiredDocuments()) {
      setError('Please upload required documents');
      return;
    }
    setError(null);
    
    if (currentStep === 2) {
      handleAnalyzeDocuments();
    } else if (currentStep === 4) {
      handleCreateClaim();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      if (currentStep === 4) {
        setCurrentStep(2);
      } else {
        setCurrentStep(prev => prev - 1);
      }
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = clientSearch.toLowerCase();
    return (
      client.veteran_name?.toLowerCase().includes(searchLower) ||
      client.veteran_email?.toLowerCase().includes(searchLower)
    );
  });

  const renderStepIndicator = () => (
    <div className="mb-8">
      <nav aria-label="Claim creation progress">
        <ol className="flex items-center justify-center space-x-2 md:space-x-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
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
                  />
                </div>
                <span className={`ml-2 text-sm font-medium hidden lg:inline ${isActive ? 'text-[#1B3A5F]' : 'text-slate-500'}`}>
                  {step.name}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={`w-6 md:w-10 h-0.5 mx-2 ${isComplete ? 'bg-green-600' : 'bg-slate-200'}`} />
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
          <Users className="w-5 h-5 text-[#1B3A5F]" />
          Select Veteran Client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
          />
        </div>

        {loadingClients ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#1B3A5F]" />
            <span className="ml-2 text-slate-600">Loading clients...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600">No clients found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/partner/onboard-client')}
            >
              Onboard New Client
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredClients.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedClient?.id === client.id
                    ? 'border-[#1B3A5F] bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{client.veteran_name}</p>
                    <p className="text-sm text-slate-500">{client.veteran_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>
                      {client.status}
                    </Badge>
                    {selectedClient?.id === client.id && (
                      <CheckCircle2 className="w-5 h-5 text-[#1B3A5F]" />
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <Badge 
                    variant={
                      client.poa_status === 'active' 
                        ? 'success' 
                        : client.poa_status === 'pending' 
                          ? 'warning' 
                          : 'destructive'
                    }
                  >
                    POA: {client.poa_status || 'none'}
                  </Badge>
                  {client.poa_status !== 'active' && (
                    <span className="text-xs text-amber-600">Active POA required to create claim</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#1B3A5F]" />
          Upload Client Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedClient && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Creating claim for:</strong> {selectedClient.veteran_name}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {REQUIRED_DOCUMENTS.map(doc => {
            const hasDoc = uploadedFiles.some(f => f.type === doc.id);
            return (
              <div 
                key={doc.id}
                className={`p-4 rounded-lg border-2 ${
                  hasDoc 
                    ? 'border-green-500 bg-green-50' 
                    : doc.required 
                      ? 'border-amber-300 bg-amber-50' 
                      : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{doc.icon}</span>
                  <span className="font-medium text-sm">{doc.name}</span>
                  {hasDoc && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </div>
                <p className="text-xs text-slate-600">{doc.description}</p>
                {doc.required && !hasDoc && (
                  <span className="text-xs text-amber-600 mt-1 block">Required</span>
                )}
              </div>
            );
          })}
        </div>

        <div 
          {...getRootProps()} 
          className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragActive ? 'border-[#1B3A5F] bg-blue-50' : 'border-slate-300 hover:border-[#1B3A5F]'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-[#1B3A5F] font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="text-slate-700 font-medium">Drag and drop documents here</p>
                <p className="text-slate-500 text-sm mt-1">or click to browse (PDF, JPG, PNG up to 50MB)</p>
              </>
            )}
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-slate-900">Uploaded Documents ({uploadedFiles.length})</h3>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={file.type}
                    onChange={(e) => updateFileType(index, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="dd214">DD-214</option>
                    <option value="medical_records">Medical Records</option>
                    <option value="service_treatment_records">Service Treatment Records</option>
                  </select>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardContent className="py-12 text-center">
        <Loader2 className="w-16 h-16 animate-spin text-[#1B3A5F] mx-auto mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Analyzing Documents</h2>
        <p className="text-slate-600 mb-6">
          Our AI is reviewing the documents to identify claimable conditions...
        </p>
        <div className="max-w-md mx-auto space-y-3">
          <AnalysisStep label="Extracting service information from DD-214" />
          <AnalysisStep label="Identifying medical diagnoses" />
          <AnalysisStep label="Mapping conditions to VA diagnostic codes" />
          <AnalysisStep label="Evaluating evidence strength" />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-[#1B3A5F]" />
          Review Claim
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-2">Client</h3>
            <p className="text-slate-700">{selectedClient?.veteran_name}</p>
            <p className="text-sm text-slate-500">{selectedClient?.veteran_email}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-2">Claim Type</h3>
            <select
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="original">Original Claim</option>
              <option value="increase">Claim for Increase</option>
              <option value="secondary">Secondary Condition</option>
              <option value="supplemental">Supplemental Claim</option>
            </select>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-slate-900 mb-3">
            Identified Conditions ({analysis?.conditions?.length || 0})
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Select the conditions to include in this claim:
          </p>
          <div className="space-y-2">
            {analysis?.conditions?.map((condition, index) => {
              const conditionName = condition.condition || condition.name;
              const isSelected = selectedConditions.includes(conditionName);
              return (
                <div
                  key={index}
                  onClick={() => toggleCondition(conditionName)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCondition(conditionName)}
                          className="h-4 w-4 rounded border-slate-300 text-green-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="font-medium">{conditionName}</span>
                      </div>
                      {condition.diagnostic_code && (
                        <p className="text-sm text-slate-600 mt-1 ml-6">
                          Diagnostic Code: {condition.diagnostic_code}
                        </p>
                      )}
                      {condition.evidence_strength && (
                        <Badge 
                          variant={condition.evidence_strength === 'strong' ? 'success' : 'secondary'}
                          className="mt-2 ml-6"
                        >
                          Evidence: {condition.evidence_strength}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-slate-900 mb-2">Agent Notes</h3>
          <textarea
            value={claimNotes}
            onChange={(e) => setClaimNotes(e.target.value)}
            placeholder="Add any notes about this claim..."
            className="w-full border rounded-lg px-3 py-2 h-24 resize-none"
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>{uploadedFiles.length} documents uploaded</li>
            <li>{selectedConditions.length} conditions selected for claim</li>
            <li>Claim type: {claimType}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Claim Created Successfully!</h2>
        <p className="text-slate-600 mb-6">
          The claim for {selectedClient?.veteran_name} has been created and is ready for review.
        </p>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto mb-6">
          <h4 className="font-medium text-green-900 mb-2">Next Steps</h4>
          <ol className="text-sm text-green-800 list-decimal list-inside space-y-1 text-left">
            <li>Review the claim details in the agent dashboard</li>
            <li>Complete any missing evidence or documentation</li>
            <li>Submit for QA review when ready</li>
            <li>Notify the veteran of their claim status</li>
          </ol>
        </div>
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline"
            onClick={() => {
              setCurrentStep(1);
              setSelectedClient(null);
              setUploadedFiles([]);
              setAnalysis(null);
              setSelectedConditions([]);
              setClaimNotes('');
              setCreatedClaimId(null);
            }}
          >
            Create Another Claim
          </Button>
          {createdClaimId && (
            <Button 
              className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white"
              onClick={() => navigate(`/agent/claims/${createdClaimId}`)}
            >
              View Claim Details
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => navigate('/agent/dashboard')}
          >
            Go to Dashboard
          </Button>
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
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Claim for Client</h1>
          <p className="text-slate-600 mt-1">
            Build a VA disability claim on behalf of your veteran client
          </p>
        </div>

        {currentStep < 5 && renderStepIndicator()}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {renderCurrentStep()}

        {currentStep < 5 && currentStep !== 3 && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={currentStep === 1 ? () => navigate(-1) : handleBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            <Button
              onClick={handleNext}
              disabled={isSubmitting || (currentStep === 1 && !selectedClient) || (currentStep === 2 && !hasRequiredDocuments())}
              className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : currentStep === 4 ? (
                <>
                  Create Claim
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisStep({ label }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
      </div>
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
}
