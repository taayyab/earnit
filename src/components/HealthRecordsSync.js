import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Heart, 
  FileText, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ChevronRight,
  Shield,
  Download,
  Clock,
  Loader2
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

export default function HealthRecordsSync({ veteranIcn, claimId, onRecordsImported }) {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [records, setRecords] = useState({
    conditions: [],
    observations: [],
    medications: [],
    diagnostics: []
  });
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (veteranIcn) {
      checkSyncStatus();
    }
  }, [veteranIcn]);

  const checkSyncStatus = async () => {
    try {
      const response = await api.get('/fhir/sync-status');
      setSyncStatus(response.data);
      if (response.data.last_sync) {
        setRecords(response.data.records || {
          conditions: [],
          observations: [],
          medications: [],
          diagnostics: []
        });
      }
    } catch (err) {
    }
  };

  const handleSync = async () => {
    if (!veteranIcn) {
      toast.error('Please complete identity verification to sync health records');
      return;
    }

    setSyncing(true);
    try {
      const conditionsRes = await api.get(`/fhir/conditions/${veteranIcn}`);
      const observationsRes = await api.get(`/fhir/observations/${veteranIcn}`);
      
      const newRecords = {
        conditions: conditionsRes.data.conditions || [],
        observations: observationsRes.data.observations || [],
        medications: [],
        diagnostics: []
      };

      setRecords(newRecords);
      setSyncStatus({
        last_sync: new Date().toISOString(),
        record_count: newRecords.conditions.length + newRecords.observations.length
      });

      toast.success(`Synced ${newRecords.conditions.length} conditions from VA health records`);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Please verify your identity with ID.me to access VA health records');
      } else {
        toast.error('Unable to sync health records. Please try again later.');
      }
    } finally {
      setSyncing(false);
    }
  };

  const toggleRecord = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleImportSelected = async () => {
    if (selectedRecords.length === 0) {
      toast.error('Please select records to import');
      return;
    }

    setImporting(true);
    try {
      const conditionsToImport = records.conditions.filter(c => 
        selectedRecords.includes(c.fhir_id)
      );

      await api.post('/documents/import-health-records', {
        claim_id: claimId,
        conditions: conditionsToImport,
        source: 'va_health_records'
      });

      toast.success(`Imported ${selectedRecords.length} health records as evidence`);
      setSelectedRecords([]);
      onRecordsImported?.(conditionsToImport);
    } catch (err) {
      toast.error('Failed to import records. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const getConditionCategory = (condition) => {
    if (condition.category?.includes('mental')) return { label: 'Mental Health', color: 'bg-blue-50 text-[#1B3A5F]' };
    if (condition.category?.includes('musculoskeletal')) return { label: 'Musculoskeletal', color: 'bg-blue-100 text-blue-700' };
    if (condition.category?.includes('respiratory')) return { label: 'Respiratory', color: 'bg-cyan-100 text-cyan-700' };
    return { label: 'General', color: 'bg-neutral-100 text-neutral-700' };
  };

  return (
    <Card className="border-neutral-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              VA Health Records
            </CardTitle>
            <CardDescription>
              Automatically import your medical records from My HealtheVet
            </CardDescription>
          </div>
          {syncStatus?.last_sync && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Last synced: {new Date(syncStatus.last_sync).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Secure Connection</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your health records are accessed securely through the VA's FHIR API. 
                Only you can authorize access, and records are encrypted during transfer.
              </p>
            </div>
          </div>
        </div>

        {!syncStatus?.last_sync ? (
          <div className="text-center py-6">
            <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-medium text-neutral-700 mb-2">Connect Your Health Records</h3>
            <p className="text-sm text-neutral-500 mb-4 max-w-md mx-auto">
              Import your diagnoses, treatments, and medical history directly from VA health systems.
              This can automatically provide evidence for your claim.
            </p>
            <Button 
              onClick={handleSync}
              disabled={syncing}
              className="bg-[hsl(var(--primary))]"
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Health Records
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-neutral-900">
                Found {records.conditions.length} Conditions
              </h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>

            {records.conditions.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {records.conditions.map((condition) => {
                  const category = getConditionCategory(condition);
                  const isSelected = selectedRecords.includes(condition.fhir_id);
                  
                  return (
                    <div
                      key={condition.fhir_id}
                      onClick={() => toggleRecord(condition.fhir_id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRecord(condition.fhir_id)}
                          className="h-4 w-4 text-[hsl(var(--primary))]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">
                              {condition.display || 'Unnamed Condition'}
                            </span>
                            <Badge className={`text-xs ${category.color} border-0`}>
                              {category.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                            {condition.clinical_status && (
                              <span className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${
                                  condition.clinical_status === 'active' ? 'bg-green-500' : 'bg-neutral-400'
                                }`} />
                                {condition.clinical_status}
                              </span>
                            )}
                            {condition.onset_date && (
                              <span>Onset: {new Date(condition.onset_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        {condition.code && (
                          <span className="text-xs text-neutral-400 font-mono">
                            {condition.code}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-neutral-500">
                No conditions found in your VA health records
              </div>
            )}

            {selectedRecords.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <span className="text-sm text-neutral-600">
                  {selectedRecords.length} record(s) selected
                </span>
                <Button
                  onClick={handleImportSelected}
                  disabled={importing}
                  className="bg-[#1B3A5F] hover:bg-[#2a4a6f]"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import as Evidence
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> Health records from VA systems may take 24-48 hours to fully sync.
              Records are sourced from My HealtheVet and VA treatment facilities.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
