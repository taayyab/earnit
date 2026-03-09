import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import { useDemoMode } from '../context/DemoModeContext';
import VeteranLayout from '../components/VeteranLayout';
import DocumentGuidance, { DocumentHelpButton } from '../components/DocumentGuidance';
import JourneyProgress from '../components/JourneyProgress';
import StepFeedback from '../components/StepFeedback';
import { useCelebration } from '../components/Celebration';
import {
  HelpCircle,
  FileText,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  ClipboardList,
  Stethoscope,
  FolderOpen,
  FileEdit,
  Users,
  Loader2,
  Trophy,
  Pill,
  Activity,
  BriefcaseMedical
} from 'lucide-react';

const formatFileSize = (size) => {
  if (!size && size !== 0) return 'Previously uploaded';
  if (size === 0) return 'Previously uploaded';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const WIZARD_STEPS = [
  { 
    id: 'guidance', 
    title: 'Document Guidance',
    shortTitle: 'Guidance',
    description: 'Learn what documents you need and why'
  },
  { 
    id: 'requirements', 
    title: 'Evidence Requirements',
    shortTitle: 'Requirements', 
    description: 'Understand what each document accomplishes'
  },
  { 
    id: 'upload', 
    title: 'Upload Documents',
    shortTitle: 'Upload',
    description: 'Upload your documents for analysis'
  },
  { 
    id: 'analysis', 
    title: 'AI Analysis',
    shortTitle: 'Analysis',
    description: 'AI identifies claimable conditions'
  },
  { 
    id: 'review', 
    title: 'Review Results',
    shortTitle: 'Review',
    description: 'Review identified conditions'
  }
];

const DOCUMENT_TYPES = [
  {
    id: 'dd214',
    name: 'DD-214',
    description: 'Certificate of Release or Discharge from Active Duty',
    required: true,
    icon: ClipboardList,
    importance: 'critical',
    whyNeeded: 'Proves your military service dates and character of discharge. Required for all VA claims.',
    whatItAccomplishes: 'Establishes service connection eligibility and helps link conditions to service period.',
    vaLink: 'https://www.archives.gov/veterans/military-service-records'
  },
  {
    id: 'medical_records',
    name: 'Medical Records',
    description: 'Current VA or private medical records showing diagnoses',
    required: true,
    icon: Stethoscope,
    importance: 'critical',
    whyNeeded: 'Documents your current medical conditions and their severity.',
    whatItAccomplishes: 'Provides evidence of current disability status and helps determine rating percentage.',
    vaLink: 'https://www.va.gov/health-care/get-medical-records/'
  },
  {
    id: 'service_treatment_records',
    name: 'Service Treatment Records',
    description: 'In-service medical records (if available)',
    required: false,
    icon: FolderOpen,
    importance: 'helpful',
    whyNeeded: 'Shows medical treatment during your military service.',
    whatItAccomplishes: 'Directly connects conditions to in-service events, strengthening your claim significantly.',
    vaLink: 'https://www.archives.gov/veterans/military-service-records'
  },
  {
    id: 'nexus_letter',
    name: 'Nexus Letter',
    description: 'Doctor\'s opinion connecting condition to service',
    required: false,
    icon: FileEdit,
    importance: 'highly_beneficial',
    whyNeeded: 'Provides medical opinion linking your condition to military service.',
    whatItAccomplishes: 'Often the key evidence that establishes service connection, especially for indirect claims.'
  },
  {
    id: 'buddy_statements',
    name: 'Buddy Statements',
    description: 'Statements from fellow service members or family',
    required: false,
    icon: Users,
    importance: 'helpful',
    whyNeeded: 'Provides witness testimony about your condition or in-service events.',
    whatItAccomplishes: 'Supports claims where official documentation is limited, especially for PTSD and MST.'
  }
];

function WizardProgressBar({ currentStep, steps, onStepClick }) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  
  return (
    <div className="mb-8">
      <div className="hidden md:flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 -z-10" />
        <div 
          className="absolute left-0 top-5 h-0.5 bg-[hsl(var(--primary))] -z-10 transition-all duration-300" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.id === currentStep;
          const isClickable = index <= currentIndex;
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all min-h-[44px] min-w-[44px] ${
                  isCompleted 
                    ? 'bg-[hsl(var(--primary))] text-white' 
                    : isCurrent 
                      ? 'bg-[hsl(var(--primary))] text-white ring-4 ring-[hsl(var(--primary))]/20' 
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
              </div>
              <span className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                isCurrent ? 'text-[hsl(var(--primary))]' : isCompleted ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {step.shortTitle}
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span className="text-sm text-[hsl(var(--primary))] font-medium">
            {steps[currentIndex]?.title}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[hsl(var(--primary))] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function DocumentCard({ doc, expanded, onToggle }) {
  const importanceColors = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
    highly_beneficial: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' },
    helpful: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' }
  };
  
  const colors = importanceColors[doc.importance] || importanceColors.helpful;
  const DocIcon = doc.icon;

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} overflow-hidden transition-all`}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left min-h-[56px]"
        aria-expanded={expanded}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 border border-gray-200/70 flex items-center justify-center">
          <DocIcon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900">{doc.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
              {doc.required ? 'Required' : doc.importance === 'highly_beneficial' ? 'Highly Recommended' : 'Optional'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200/50">
          <div className="mt-3 space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                Why is this needed?
              </h5>
              <p className="text-sm text-gray-600 mt-1">{doc.whyNeeded}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                What it accomplishes
              </h5>
              <p className="text-sm text-gray-600 mt-1">{doc.whatItAccomplishes}</p>
            </div>
            {doc.vaLink && (
              <a 
                href={doc.vaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[hsl(var(--primary))] hover:underline min-h-[44px]"
              >
                <ExternalLink className="h-4 w-4" />
                Learn more from VA.gov
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GuidanceStep({ onNext }) {
  const [expandedDocs, setExpandedDocs] = useState({ dd214: true, medical_records: true });
  
  const criticalDocs = DOCUMENT_TYPES.filter(d => d.importance === 'critical');
  const beneficialDocs = DOCUMENT_TYPES.filter(d => d.importance !== 'critical');
  
  return (
    <div className="space-y-6">
      <div className="bg-[hsl(var(--primary))]/5 border border-[hsl(var(--primary))]/20 rounded-lg p-4 md:p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />
          What Documents Do You Need?
        </h2>
        <p className="text-gray-600">
          Before uploading, let's make sure you understand which documents are most important for your VA disability claim. 
          Strong documentation significantly increases your chances of approval.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
        </div>
        <p className="text-sm text-gray-600 -mt-2">These documents are essential for your claim to be processed.</p>
        
        <div className="space-y-3">
          {criticalDocs.map(doc => (
            <DocumentCard 
              key={doc.id}
              doc={doc}
              expanded={expandedDocs[doc.id]}
              onToggle={() => setExpandedDocs(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Supporting Documents</h3>
        </div>
        <p className="text-sm text-gray-600 -mt-2">These documents strengthen your claim if available.</p>
        
        <div className="space-y-3">
          {beneficialDocs.map(doc => (
            <DocumentCard 
              key={doc.id}
              doc={doc}
              expanded={expandedDocs[doc.id]}
              onToggle={() => setExpandedDocs(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
            />
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Don't have everything? That's okay!
        </h4>
        <p className="text-sm text-green-700 mt-1">
          Start with what you have. The VA will request some records on your behalf, and you can always add more documents later. 
          At minimum, upload your DD-214 and any medical records you have.
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-white rounded-lg font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors min-h-[48px]"
        >
          Continue to Evidence Requirements
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function RequirementsStep({ onNext, onBack }) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 md:p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-amber-600" />
          Understanding Evidence Requirements
        </h2>
        <p className="text-gray-600">
          The VA uses your documents to make decisions about your claim. Understanding what they're looking for helps you provide stronger evidence.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">1</span>
            Service Connection
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            The VA needs to verify that your condition is connected to your military service.
          </p>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500 font-medium mb-2">DOCUMENTS THAT HELP:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-gray-500 flex-shrink-0" /> DD-214 (service dates)</li>
              <li className="flex items-center gap-2"><FolderOpen className="h-4 w-4 text-gray-500 flex-shrink-0" /> Service Treatment Records</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-500 flex-shrink-0" /> Buddy Statements</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">2</span>
            Current Diagnosis
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            You need proof that you currently have the condition you're claiming.
          </p>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500 font-medium mb-2">DOCUMENTS THAT HELP:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-gray-500 flex-shrink-0" /> Current Medical Records</li>
              <li className="flex items-center gap-2"><FileEdit className="h-4 w-4 text-gray-500 flex-shrink-0" /> Doctor's Diagnosis Letter</li>
              <li className="flex items-center gap-2"><Pill className="h-4 w-4 text-gray-500 flex-shrink-0" /> Prescription Records</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">3</span>
            Nexus (Link)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            A medical opinion stating your condition is "at least as likely as not" connected to service.
          </p>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500 font-medium mb-2">DOCUMENTS THAT HELP:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-center gap-2"><FileEdit className="h-4 w-4 text-gray-500 flex-shrink-0" /> Nexus Letter from Doctor</li>
              <li className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-gray-500 flex-shrink-0" /> C&P Exam Opinion</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">4</span>
            Severity & Impact
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Evidence showing how your condition affects your daily life and work.
          </p>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500 font-medium mb-2">DOCUMENTS THAT HELP:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-gray-500 flex-shrink-0" /> Treatment Frequency Records</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-500 flex-shrink-0" /> Personal Statement</li>
              <li className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-gray-500 flex-shrink-0" /> Employment Records</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 flex items-center gap-2">
          <Info className="h-5 w-5" />
          Pro Tip: Quality Over Quantity
        </h4>
        <p className="text-sm text-blue-700 mt-1">
          One well-documented medical record showing diagnosis and treatment is more valuable than multiple incomplete documents. 
          Focus on records that clearly state your diagnosis and connect it to your service.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors min-h-[48px]"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Guidance
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-white rounded-lg font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors min-h-[48px]"
        >
          Ready to Upload Documents
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function UploadStep({ 
  uploadedFiles, 
  onDrop, 
  getRootProps, 
  getInputProps, 
  isDragActive, 
  removeFile, 
  updateFileType, 
  hasRequiredDocuments, 
  hasRestoredFiles,
  analysis,
  onAnalyze, 
  onReanalyze,
  analyzing,
  onBack,
  onContinueWithPrevious,
  showDocGuide,
  setShowDocGuide
}) {
  const [providerRequestSent, setProviderRequestSent] = useState(false);

  const importanceBadge = {
    critical: { label: 'Required', className: 'text-red-600' },
    highly_beneficial: { label: 'Highly Recommended', className: 'text-amber-600' },
    helpful: { label: 'Optional', className: 'text-gray-500' },
  };

  return (
    <div className="space-y-6">
      <div className="bg-[hsl(var(--primary))]/5 border border-[hsl(var(--primary))]/20 rounded-lg p-4 md:p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Upload className="h-6 w-6 text-[hsl(var(--primary))]" />
          Upload Your Documents
        </h2>
        <p className="text-gray-600">
          Upload as many documents as you have. Our AI will analyze them to identify all claimable conditions. Required documents are marked below.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Document Checklist</h3>
          <button
            onClick={() => setShowDocGuide(true)}
            className="text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 flex items-center gap-1 min-h-[44px]"
          >
            <HelpCircle className="h-4 w-4" />
            How to get these
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {DOCUMENT_TYPES.map(doc => {
            const hasDoc = uploadedFiles.some(f => f.type === doc.id);
            const badge = importanceBadge[doc.importance] || importanceBadge.helpful;
            const DocIcon = doc.icon;
            return (
              <div
                key={doc.id}
                className={`p-4 rounded-lg border-2 flex items-start gap-3 ${
                  hasDoc
                    ? 'border-green-500 bg-green-50'
                    : doc.required
                    ? 'border-red-300 bg-red-50'
                    : doc.importance === 'highly_beneficial'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${hasDoc ? 'bg-green-100' : doc.required ? 'bg-red-100' : doc.importance === 'highly_beneficial' ? 'bg-amber-100' : 'bg-gray-100'}`}>
                  <DocIcon className={`h-5 w-5 ${hasDoc ? 'text-green-600' : doc.required ? 'text-red-500' : doc.importance === 'highly_beneficial' ? 'text-amber-600' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{doc.name}</span>
                    {hasDoc ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <span className={`text-xs font-medium ${badge.className}`}>{badge.label}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div 
        {...getRootProps()} 
        className={`bg-white rounded-lg shadow p-8 border-2 border-dashed cursor-pointer transition-colors min-h-[160px] flex items-center justify-center ${
          isDragActive ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5' : 'border-neutral-300 hover:border-[hsl(var(--primary))]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Upload className="h-10 w-10 text-gray-400" />
          </div>
          {isDragActive ? (
            <p className="text-[hsl(var(--primary))] font-medium text-lg">Drop files here...</p>
          ) : (
            <>
              <p className="text-gray-700 font-medium text-lg">
                Drag and drop your documents here
              </p>
              <p className="text-gray-500 text-sm mt-2">
                or tap to browse (PDF, JPG, PNG up to 50MB)
              </p>
            </>
          )}
        </div>
      </div>

      {hasRestoredFiles() && !analysis && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="font-medium text-amber-800">Welcome back!</p>
          <p className="text-sm text-amber-700 mt-1">
            We saved your progress. Click below to load your previous analysis, or re-upload documents for a fresh start.
          </p>
          <button
            onClick={onReanalyze}
            disabled={analyzing}
            className="mt-3 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Loading Analysis...
              </span>
            ) : 'Load Previous Analysis'}
          </button>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Uploaded Documents ({uploadedFiles.length})</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className={`flex items-center justify-between gap-3 p-3 border rounded-lg ${
                file.needsReupload ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                    file.needsReupload ? 'bg-amber-100' : 'bg-white border border-slate-200'
                  }`}>
                    <FileText className={`h-4 w-4 ${file.needsReupload ? 'text-amber-600' : 'text-slate-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    {file.needsReupload && (
                      <p className="text-xs text-amber-600 font-medium">Re-upload to continue</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={file.type}
                    onChange={(e) => updateFileType(index, e.target.value)}
                    className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B3A5F]"
                  >
                    <option value="dd214">DD-214</option>
                    <option value="medical_records">Medical Records</option>
                    <option value="service_treatment_records">Service Treatment Records</option>
                    <option value="nexus_letter">Nexus Letter</option>
                    <option value="buddy_statements">Buddy Statement</option>
                  </select>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasRestoredFiles() && analysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900">Previous Analysis Found</h4>
              <p className="text-sm text-blue-700 mt-1">
                You have a saved analysis with {analysis.conditions?.length || 0} identified conditions. 
                You can continue where you left off or re-upload documents for a fresh analysis.
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <button
                  onClick={onContinueWithPrevious}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm min-h-[48px]"
                >
                  Continue with Previous Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Medical Provider */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
            <BriefcaseMedical className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-amber-900 text-sm">Don't have your documents?</h4>
            <p className="text-xs text-amber-700 mt-1">
              If you can't access your medical records, service treatment records, or other required documents — request them directly from your VA healthcare provider or private doctor. We'll send a records request on your behalf.
            </p>
          </div>
          <button
            onClick={() => setProviderRequestSent(true)}
            disabled={providerRequestSent}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors min-w-[130px] justify-center ${
              providerRequestSent
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {providerRequestSent ? (
              <><CheckCircle className="h-3.5 w-3.5" /> Request Sent</>
            ) : (
              <>Contact Provider</>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors min-h-[48px]"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Requirements
        </button>
        <button
          onClick={onAnalyze}
          disabled={!hasRequiredDocuments() || analyzing}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors min-h-[48px] ${
            hasRequiredDocuments() && !analyzing
              ? 'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
          }`}
        >
          {analyzing ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Analyzing...
            </>
          ) : (
            <>
              Analyze My Documents
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function AnalysisStep() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="h-12 w-12 text-[hsl(var(--primary))] animate-spin" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Analyzing Your Documents</h2>
        <p className="text-gray-600 mb-6">
          Our AI is reviewing your records to identify all claimable conditions...
        </p>
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Extracting medical information</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
            <span>Identifying service-connected conditions</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
            <span>Matching to VA diagnostic codes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ analysis, onProceedToReview }) {
  const conditionCount = analysis?.conditions?.length || 0;
  
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
        <p className="text-gray-600 mb-4">
          We found {conditionCount} potential claimable condition{conditionCount !== 1 ? 's' : ''} in your documents.
        </p>
      </div>

      {analysis?.conditions && analysis.conditions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Identified Conditions</h3>
          <div className="space-y-3">
            {analysis.conditions.slice(0, 5).map((condition, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{condition.name || condition.condition_name}</p>
                  {condition.diagnostic_code && (
                    <p className="text-sm text-gray-500">DC {condition.diagnostic_code}</p>
                  )}
                </div>
                {condition.confidence && (
                  <span className={`text-sm px-2 py-1 rounded ${
                    condition.confidence > 0.7 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {Math.round(condition.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            ))}
            {analysis.conditions.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                +{analysis.conditions.length - 5} more conditions
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <button
          onClick={onProceedToReview}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[hsl(var(--primary))] text-white rounded-lg font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors text-lg min-h-[56px]"
        >
          Review & Build My Claim
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function DocumentOnboarding() {
  const navigate = useNavigate();
  React.useEffect(() => { navigate('/claim-review', { replace: true }); }, [navigate]);
  return null;
}

function _DocumentOnboardingUnused() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { celebrate, CelebrationComponent } = useCelebration();
  const { isDemoMode, appendDemoParam } = useDemoMode();
  const [currentStep, setCurrentStep] = useState('guidance');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showDocGuide, setShowDocGuide] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('step_complete');
  const [claimId, setClaimId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { message: 'Please sign in to continue with your claim.' } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated && !draftLoaded) {
      loadDraft();
    }
  }, [isAuthenticated, draftLoaded]);

  useEffect(() => {
    if (draftLoaded && uploadedFiles.length > 0) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadedFiles, currentStep, draftLoaded]);

  const loadDraft = async () => {
    try {
      const response = await api.get(appendDemoParam('/draft/load'));
      if (response.data.success && response.data.draft) {
        const draft = response.data.draft;
        setClaimId(response.data.claim_id);
        
        if (draft.uploaded_files && draft.uploaded_files.length > 0) {
          const restoredFiles = draft.uploaded_files.map(f => ({
            file: null,
            name: f.name,
            size: f.size,
            type: f.type,
            status: 'restored',
            needsReupload: true
          }));
          setUploadedFiles(restoredFiles);
        }
        
        if (draft.analysis) {
          setAnalysis(draft.analysis);
        }
        
        if (draft.saved_at) {
          setLastSaved(new Date(draft.saved_at));
        }
      }
    } catch (err) {
    } finally {
      setDraftLoaded(true);
    }
  };

  const saveDraft = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const fileMetadata = uploadedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        status: f.status
      }));
      
      const response = await api.post(appendDemoParam('/draft/save'), {
        claim_id: claimId,
        current_step: currentStep,
        uploaded_files: fileMetadata,
        analysis: analysis
      });
      
      if (response.data.success) {
        setClaimId(response.data.claim_id);
        setLastSaved(new Date());
      }
    } catch (err) {
    } finally {
      setIsSaving(false);
    }
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
    
    const hasDD214 = newFiles.some(f => f.type === 'dd214');
    const hasMedical = newFiles.some(f => f.type === 'medical_records');
    if (hasDD214) {
      setFeedbackType('dd214_uploaded');
    } else if (hasMedical) {
      setFeedbackType('medical_uploaded');
    } else {
      setFeedbackType('document_uploaded');
    }
    setShowFeedback(true);
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

  const identifyDocumentType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('dd214') || lower.includes('dd-214')) return 'dd214';
    if (lower.includes('str') || lower.includes('service treatment')) return 'service_treatment_records';
    if (lower.includes('nexus')) return 'nexus_letter';
    if (lower.includes('buddy') || lower.includes('statement')) return 'buddy_statements';
    return 'medical_records';
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileType = (index, newType) => {
    setUploadedFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, type: newType } : f
    ));
  };

  const hasRequiredDocuments = () => {
    const readyFiles = uploadedFiles.filter(f => f.file && !f.needsReupload);
    return readyFiles.length > 0;
  };

  const hasRestoredFiles = () => {
    return uploadedFiles.some(f => f.needsReupload);
  };

  const handleStepClick = (stepId) => {
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    const targetIndex = WIZARD_STEPS.findIndex(s => s.id === stepId);
    if (targetIndex <= currentIndex) {
      setCurrentStep(stepId);
    }
  };

  const handleAnalyze = async () => {
    if (analyzing) return;
    
    if (!hasRequiredDocuments()) {
      setError('Please upload at least one document to continue.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setCurrentStep('analysis');

    try {
      const formData = new FormData();
      uploadedFiles.forEach(({ file }) => {
        if (file) formData.append('files', file);
      });

      const response = await api.post(appendDemoParam('/claims-intelligence/analyze-documents'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
        setCurrentStep('review');
        
        const fromCache = response.data.from_cache;
        const conditionCount = response.data.analysis?.conditions?.length || 0;
        
        if (fromCache) {
          setFeedbackType('analysis_cached');
        } else if (conditionCount > 0) {
          celebrate('document_uploaded', `${conditionCount} potential condition${conditionCount > 1 ? 's' : ''} identified from your documents!`);
          setFeedbackType('analysis_complete');
        } else {
          setFeedbackType('analysis_complete');
        }
        setShowFeedback(true);
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message || 'Failed to analyze documents';
      if (err.response?.status === 401 || err.response?.status === 403 || errorDetail === 'Not authenticated') {
        navigate('/login', { state: { message: 'Your session has expired. Please sign in again.' } });
        return;
      }
      if (err.response?.status === 429) {
        setError('Too many analysis attempts. Please wait a moment before trying again.');
      } else {
        setError(errorDetail);
      }
      setCurrentStep('upload');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReanalyzeFromServer = async () => {
    if (analyzing) return;
    
    setAnalyzing(true);
    setError(null);
    setCurrentStep('analysis');

    try {
      const response = await api.post(appendDemoParam('/claims-intelligence/reanalyze-stored-documents'), {}, {
        timeout: 120000
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
        setCurrentStep('review');
        
        const fromCache = response.data.from_cache;
        const conditionCount = response.data.analysis?.conditions?.length || 0;
        
        if (fromCache) {
          setFeedbackType('analysis_cached');
        } else if (conditionCount > 0) {
          celebrate('document_uploaded', `${conditionCount} potential condition${conditionCount > 1 ? 's' : ''} identified from your documents!`);
          setFeedbackType('analysis_complete');
        } else {
          setFeedbackType('analysis_complete');
        }
        setShowFeedback(true);
      } else {
        throw new Error(response.data.message || 'Re-analysis failed');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message || 'Failed to re-analyze documents';
      if (err.response?.status === 401 || err.response?.status === 403 || errorDetail === 'Not authenticated') {
        navigate('/login', { state: { message: 'Your session has expired. Please sign in again.' } });
        return;
      }
      if (err.response?.status === 404) {
        setError('No documents found on server. Please re-upload your documents.');
      } else if (err.response?.status === 429) {
        setError('Too many analysis attempts. Your previous analysis has been loaded.');
        if (err.response?.data?.analysis) {
          setAnalysis(err.response.data.analysis);
          setCurrentStep('review');
          return;
        }
      } else {
        setError(errorDetail);
      }
      setCurrentStep('upload');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleProceedToReview = () => {
    navigate('/claim-review', { state: { analysis, claimId } });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <VeteranLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Start Your VA Disability Claim</h1>
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isSaving ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Progress saved</span>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-gray-600">
            Follow these steps to build a strong VA disability claim.
          </p>
        </div>

        <WizardProgressBar 
          currentStep={currentStep}
          steps={WIZARD_STEPS}
          onStepClick={handleStepClick}
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-medium text-red-800">Something went wrong</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <p className="text-red-600 text-xs mt-2">
              Try uploading your documents again. If the problem persists, ensure your files are in PDF, JPG, or PNG format.
            </p>
          </div>
        )}

        {currentStep === 'guidance' && (
          <GuidanceStep onNext={() => setCurrentStep('requirements')} />
        )}

        {currentStep === 'requirements' && (
          <RequirementsStep 
            onNext={() => setCurrentStep('upload')} 
            onBack={() => setCurrentStep('guidance')}
          />
        )}

        {currentStep === 'upload' && (
          <UploadStep 
            uploadedFiles={uploadedFiles}
            onDrop={onDrop}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            removeFile={removeFile}
            updateFileType={updateFileType}
            hasRequiredDocuments={hasRequiredDocuments}
            hasRestoredFiles={hasRestoredFiles}
            analysis={analysis}
            onAnalyze={handleAnalyze}
            onReanalyze={handleReanalyzeFromServer}
            analyzing={analyzing}
            onBack={() => setCurrentStep('requirements')}
            onContinueWithPrevious={() => setCurrentStep('review')}
            showDocGuide={showDocGuide}
            setShowDocGuide={setShowDocGuide}
          />
        )}

        {currentStep === 'analysis' && <AnalysisStep />}

        {currentStep === 'review' && (
          <ReviewStep 
            analysis={analysis}
            onProceedToReview={handleProceedToReview}
          />
        )}
      </div>

      {showDocGuide && <DocumentGuidance onClose={() => setShowDocGuide(false)} />}
      
      <StepFeedback 
        show={showFeedback}
        type={feedbackType}
        onClose={() => setShowFeedback(false)}
      />
      
      {CelebrationComponent}
    </VeteranLayout>
  );
}
