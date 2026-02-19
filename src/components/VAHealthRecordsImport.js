import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import api from '../lib/api';
import { toast } from 'sonner';
import {
  Shield,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Heart,
  Pill,
  Activity,
  Lock,
  RefreshCw,
  ChevronRight,
  Info,
  ExternalLink,
  Loader2
} from 'lucide-react';

const RECORD_TYPES = [
  {
    id: 'conditions',
    name: 'Medical Conditions & Diagnoses',
    description: 'All diagnosed conditions from your VA health records',
    icon: Heart,
    fhirResource: 'Condition',
    color: 'text-red-600'
  },
  {
    id: 'medications',
    name: 'Medications',
    description: 'Current and past prescriptions',
    icon: Pill,
    fhirResource: 'MedicationStatement',
    color: 'text-blue-600'
  },
  {
    id: 'observations',
    name: 'Lab Results & Vitals',
    description: 'Blood tests, vitals, and clinical observations',
    icon: Activity,
    fhirResource: 'Observation',
    color: 'text-green-600'
  },
  {
    id: 'procedures',
    name: 'Procedures & Treatments',
    description: 'Surgeries, therapies, and medical procedures',
    icon: FileText,
    fhirResource: 'Procedure',
    color: 'text-purple-600'
  }
];

export default function VAHealthRecordsImport({ 
  claimId = null,
  onImportComplete = () => {},
  onClose = () => {}
}) {
  const [step, setStep] = useState('consent');
  const [selectedTypes, setSelectedTypes] = useState(['conditions', 'observations']);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedRecords, setImportedRecords] = useState(null);
  const [vaConnected, setVaConnected] = useState(false);
  const [veteranIcn, setVeteranIcn] = useState(null);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    checkVAConnection();
  }, []);

  const checkVAConnection = async () => {
    setCheckingConnection(true);
    try {
      const response = await api.get('/fhir/sync-status');
      if (response.data.connected) {
        setVaConnected(true);
        setVeteranIcn(response.data.veteran_icn);
        setStep('consent');
      } else {
        setVaConnected(false);
        setStep('connect');
      }
    } catch (err) {
      setVaConnected(false);
      setStep('connect');
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleConnectVA = async () => {
    setConnecting(true);
    try {
      const response = await api.post('/fhir/connect-va');
      if (response.data.success && response.data.login_url) {
        window.open(response.data.login_url, '_blank', 'width=600,height=700');
        toast.info('Please complete sign-in in the new window, then click "Check Connection"');
      } else {
        toast.error(response.data.error || 'Failed to connect to VA');
      }
    } catch (err) {
      toast.error('Failed to initiate VA connection');
    } finally {
      setConnecting(false);
    }
  };

  const handleTypeToggle = useCallback((typeId) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  }, []);

  const handleConsent = () => {
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one record type to import');
      return;
    }
    setStep('confirm');
  };

  const handleImport = async () => {
    if (!veteranIcn) {
      setError('VA connection not established. Please verify your identity first.');
      return;
    }

    setImporting(true);
    setImportProgress(0);
    setError(null);

    try {
      const results = {
        conditions: [],
        medications: [],
        observations: [],
        procedures: []
      };

      const totalSteps = selectedTypes.length;
      let completedSteps = 0;

      for (const typeId of selectedTypes) {
        const recordType = RECORD_TYPES.find(t => t.id === typeId);
        
        try {
          let response;
          switch (typeId) {
            case 'conditions':
              response = await api.get(`/fhir/conditions/${veteranIcn}`);
              results.conditions = response.data.conditions || [];
              break;
            case 'observations':
              response = await api.get(`/fhir/observations/${veteranIcn}`);
              results.observations = response.data.observations || [];
              break;
            case 'medications':
              response = await api.get(`/fhir/medications/${veteranIcn}`);
              results.medications = response.data.medications || [];
              break;
            case 'procedures':
              response = await api.get(`/fhir/procedures/${veteranIcn}`);
              results.procedures = response.data.procedures || [];
              break;
          }
        } catch (err) {
        }

        completedSteps++;
        setImportProgress(Math.round((completedSteps / totalSteps) * 100));
      }

      if (results.conditions.length > 0 && claimId) {
        await api.post('/documents/import-health-records', {
          claim_id: claimId,
          conditions: results.conditions,
          source: 'va_fhir'
        });
      }

      setImportedRecords(results);
      setStep('complete');
      toast.success('Health records imported successfully');
      
    } catch (err) {
      setError('Failed to import health records. Please try again.');
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const getTotalRecordCount = () => {
    if (!importedRecords) return 0;
    return (
      (importedRecords.conditions?.length || 0) +
      (importedRecords.medications?.length || 0) +
      (importedRecords.observations?.length || 0) +
      (importedRecords.procedures?.length || 0)
    );
  };

  const renderConnectStep = () => (
    <div className="space-y-4">
      <div 
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        role="region"
        aria-labelledby="connect-heading"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 id="connect-heading" className="font-medium text-blue-900 text-sm">
              Connect Your VA Health Records
            </h3>
            <p className="text-xs text-blue-800 mt-1">
              Sign in with your MyHealtheVet or VA.gov account to securely import your 
              service treatment records and medical history.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-3">
          <ExternalLink className="w-8 h-8 text-[#1B3A5F]" />
        </div>
        <h4 className="font-semibold text-slate-900">MyHealtheVet / VA.gov Login</h4>
        <p className="text-sm text-slate-600 mt-1">
          Your data is protected with HIPAA-compliant encryption
        </p>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleConnectVA}
          disabled={connecting}
          className="w-full bg-[#1B3A5F] hover:bg-[#2a4a6f]"
        >
          {connecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Sign in with VA.gov / MyHealtheVet
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => checkVAConnection()}
          disabled={checkingConnection}
          className="w-full"
        >
          {checkingConnection ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Connection Status
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full text-slate-500"
        >
          Cancel
        </Button>
      </div>

      <div className="text-center text-xs text-slate-500 pt-2">
        <Lock className="w-3 h-3 inline mr-1" />
        Secure connection powered by ID.me
      </div>
    </div>
  );

  const renderConsentStep = () => (
    <div className="space-y-4">
      <div 
        className="bg-blue-50 border border-blue-200 rounded-lg p-3"
        role="region"
        aria-labelledby="privacy-notice-heading"
      >
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 id="privacy-notice-heading" className="font-medium text-blue-900 text-sm">
              HIPAA Privacy Notice
            </h3>
            <p className="text-xs text-blue-800 mt-0.5">
              Your health data is protected and encrypted. By proceeding, you authorize 
              EarnedIT to securely import your VA health records.
            </p>
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-900 mb-2">
          Select Records to Import
        </legend>
        
        <div className="space-y-2" role="group" aria-label="Health record types">
          {RECORD_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedTypes.includes(type.id);
            
            return (
              <div
                key={type.id}
                className={`
                  border rounded-lg p-3 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-[#1B3A5F] bg-slate-50' 
                    : 'border-slate-200 hover:border-slate-300'}
                `}
                onClick={() => handleTypeToggle(type.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTypeToggle(type.id);
                  }
                }}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                aria-describedby={`${type.id}-description`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleTypeToggle(type.id)}
                    aria-hidden="true"
                    tabIndex={-1}
                    className="h-4 w-4"
                  />
                  <Icon className={`w-4 h-4 ${type.color} flex-shrink-0`} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{type.name}</p>
                    <p id={`${type.id}-description`} className="text-xs text-slate-500 truncate">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
          size="sm"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConsent}
          className="flex-1 bg-[#1B3A5F] hover:bg-[#2a4a6f]"
          disabled={selectedTypes.length === 0}
          aria-describedby={selectedTypes.length === 0 ? 'select-warning' : undefined}
          size="sm"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
        </Button>
      </div>
      {selectedTypes.length === 0 && (
        <p id="select-warning" className="text-xs text-amber-600 text-center" role="alert">
          Please select at least one record type
        </p>
      )}
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-4">
      <div 
        className="bg-amber-50 border border-amber-200 rounded-lg p-3"
        role="region"
        aria-labelledby="confirmation-heading"
      >
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 id="confirmation-heading" className="font-medium text-amber-900 text-sm">
              Confirm Import
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Importing {selectedTypes.length} record type(s) to support your claim.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-slate-900 text-sm mb-2">Records to Import:</h4>
        <ul className="space-y-1.5" aria-label="Selected record types">
          {selectedTypes.map(typeId => {
            const type = RECORD_TYPES.find(t => t.id === typeId);
            const Icon = type.icon;
            return (
              <li key={typeId} className="flex items-center gap-2 text-slate-700 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                <Icon className={`w-3.5 h-3.5 ${type.color}`} aria-hidden="true" />
                <span>{type.name}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {!vaConnected && (
        <div 
          className="bg-red-50 border border-red-200 rounded-lg p-3"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium text-red-900 text-sm">VA Connection Required</p>
              <p className="text-xs text-red-700 mt-0.5">
                Verify your identity through ID.me to connect.
              </p>
              <Button 
                size="sm" 
                className="mt-2 bg-red-600 hover:bg-red-700 h-7 text-xs"
                onClick={handleConnectVA}
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" aria-hidden="true" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3 h-3 mr-1" aria-hidden="true" />
                    Connect to VA.gov
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => setStep('consent')}
          className="flex-1"
          size="sm"
        >
          Back
        </Button>
        <Button
          onClick={handleImport}
          className="flex-1 bg-[#1B3A5F] hover:bg-[#2a4a6f]"
          disabled={importing || !vaConnected}
          size="sm"
        >
          {importing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" aria-hidden="true" />
              <span aria-live="polite">Importing...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Import
            </>
          )}
        </Button>
      </div>

      {importing && (
        <div role="status" aria-live="polite" aria-atomic="true">
          <Progress value={importProgress} className="h-1.5" />
          <p className="text-xs text-slate-600 text-center mt-1">
            Importing... {importProgress}%
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600" aria-hidden="true" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Import Complete!
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Imported {getTotalRecordCount()} records from your VA account.
        </p>
      </div>

      {importedRecords && (
        <div 
          className="bg-slate-50 rounded-lg p-3 text-left"
          role="region"
          aria-label="Import summary"
        >
          <h4 className="font-medium text-slate-900 text-sm mb-2">Summary:</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {importedRecords.conditions?.length > 0 && (
              <div className="flex justify-between items-center">
                <dt className="text-slate-600 text-xs">Conditions</dt>
                <dd>
                  <Badge className="bg-red-100 text-red-700 text-xs h-5">
                    {importedRecords.conditions.length}
                  </Badge>
                </dd>
              </div>
            )}
            {importedRecords.observations?.length > 0 && (
              <div className="flex justify-between items-center">
                <dt className="text-slate-600 text-xs">Labs & Vitals</dt>
                <dd>
                  <Badge className="bg-green-100 text-green-700 text-xs h-5">
                    {importedRecords.observations.length}
                  </Badge>
                </dd>
              </div>
            )}
            {importedRecords.medications?.length > 0 && (
              <div className="flex justify-between items-center">
                <dt className="text-slate-600 text-xs">Medications</dt>
                <dd>
                  <Badge className="bg-blue-100 text-blue-700 text-xs h-5">
                    {importedRecords.medications.length}
                  </Badge>
                </dd>
              </div>
            )}
            {importedRecords.procedures?.length > 0 && (
              <div className="flex justify-between items-center">
                <dt className="text-slate-600 text-xs">Procedures</dt>
                <dd>
                  <Badge className="bg-purple-100 text-purple-700 text-xs h-5">
                    {importedRecords.procedures.length}
                  </Badge>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div 
        className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left"
        role="region"
        aria-labelledby="next-steps-heading"
      >
        <h4 id="next-steps-heading" className="font-medium text-blue-900 text-sm flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" aria-hidden="true" />
          Next Steps
        </h4>
        <p className="text-xs text-blue-800 mt-1">
          Your conditions are mapped and evidence requirements auto-populated.
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => {
            setStep('consent');
            setImportedRecords(null);
          }}
          className="flex-1"
          size="sm"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          Import More
        </Button>
        <Button
          onClick={() => {
            onImportComplete(importedRecords);
            onClose();
          }}
          className="flex-1 bg-[#1B3A5F] hover:bg-[#2a4a6f]"
          size="sm"
        >
          Continue
          <ChevronRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#1B3A5F] to-[#2a5a8f] rounded-lg flex items-center justify-center">
            <Download className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-base">Import VA Health Records</CardTitle>
            <CardDescription className="text-xs">
              From MyHealtheVet
            </CardDescription>
          </div>
        </div>

        <div 
          className="flex items-center gap-1.5 mt-3"
          role="navigation"
          aria-label="Import progress"
        >
          {['consent', 'confirm', 'complete'].map((s, idx) => (
            <React.Fragment key={s}>
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${step === s 
                    ? 'bg-[#1B3A5F] text-white' 
                    : idx < ['consent', 'confirm', 'complete'].indexOf(step)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-400'}
                `}
                aria-current={step === s ? 'step' : undefined}
                aria-label={`Step ${idx + 1}: ${s === 'consent' ? 'Select records' : s === 'confirm' ? 'Confirm import' : 'Complete'}`}
              >
                {idx < ['consent', 'confirm', 'complete'].indexOf(step) ? (
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < 2 && (
                <div 
                  className={`flex-1 h-0.5 rounded ${
                    idx < ['consent', 'confirm', 'complete'].indexOf(step)
                      ? 'bg-green-300'
                      : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {step === 'connect' && renderConnectStep()}
        {step === 'consent' && renderConsentStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'complete' && renderCompleteStep()}
      </CardContent>
    </Card>
  );
}
