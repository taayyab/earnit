import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  FileSearch, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Upload,
  CheckCircle2
} from 'lucide-react';
import api from '../../lib/api';
import DenialSummaryCard from './DenialSummaryCard';
import AppealRoadmap from './AppealRoadmap';
import EvidenceTaskList from './EvidenceTaskList';

const AppealAnalysisPanel = ({ appealCaseId }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [evidenceData, setEvidenceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingLetter, setUploadingLetter] = useState(false);

  const fetchAnalysisData = useCallback(async () => {
    if (!appealCaseId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [analysisResponse, roadmapResponse] = await Promise.all([
        api.get(`/api/appeals/cases/${appealCaseId}/analysis`).catch(() => ({ data: null })),
        api.get(`/api/appeals/cases/${appealCaseId}/roadmap`).catch(() => ({ data: null }))
      ]);

      if (analysisResponse.data) {
        setAnalysisData(analysisResponse.data);
        if (analysisResponse.data.evidenceRequirements) {
          setEvidenceData(analysisResponse.data.evidenceRequirements);
        }
      }

      if (roadmapResponse.data) {
        setRoadmapData(roadmapResponse.data);
      }
    } catch (err) {
      console.error('Error fetching analysis data:', err);
      setError('Failed to load appeal analysis data');
    } finally {
      setLoading(false);
    }
  }, [appealCaseId]);

  useEffect(() => {
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  const handleTriggerAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      
      await api.post(`/api/appeals/cases/${appealCaseId}/analyze`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchAnalysisData();
    } catch (err) {
      console.error('Error triggering analysis:', err);
      setError('Failed to analyze denial letter. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUploadDenialLetter = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLetter(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'denial_letter');

      await api.post(`/api/appeals/cases/${appealCaseId}/upload-denial-letter`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await handleTriggerAnalysis();
    } catch (err) {
      console.error('Error uploading denial letter:', err);
      setError('Failed to upload denial letter. Please try again.');
    } finally {
      setUploadingLetter(false);
    }
  };

  const handleVerifyIssue = async (issueId, verified) => {
    try {
      await api.post(`/api/appeals/cases/${appealCaseId}/verify-issue`, {
        issue_id: issueId,
        verified
      });
      await fetchAnalysisData();
    } catch (err) {
      console.error('Error verifying issue:', err);
      setError('Failed to update issue verification');
    }
  };

  const handleStepClick = () => {
  };

  const handleEvidenceStatusChange = async (evidenceId, status) => {
    try {
      await api.post(`/api/appeals/cases/${appealCaseId}/evidence/${evidenceId}/status`, {
        status
      });
      await fetchAnalysisData();
    } catch (err) {
      console.error('Error updating evidence status:', err);
      setError('Failed to update evidence status');
    }
  };

  const handleUploadEvidence = async (evidenceId, evidenceItem) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('evidence_id', evidenceId);
        formData.append('evidence_type', evidenceItem.type || evidenceItem.name);

        await api.post(`/api/appeals/cases/${appealCaseId}/evidence/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        await fetchAnalysisData();
      } catch (err) {
        console.error('Error uploading evidence:', err);
        setError('Failed to upload evidence document');
      }
    };

    input.click();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading appeal analysis...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analysisData && !roadmapData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Appeal Analysis
          </CardTitle>
          <CardDescription>
            Upload your VA denial letter to begin the analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Denial Letter Analyzed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your VA decision letter to extract denial reasons and generate an appeal strategy
            </p>
            
            <div className="flex justify-center gap-4">
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleUploadDenialLetter}
                  disabled={uploadingLetter}
                />
                <Button asChild disabled={uploadingLetter}>
                  <span>
                    {uploadingLetter ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Denial Letter
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileSearch className="h-6 w-6" />
            Appeal Analysis
          </h2>
          <p className="text-muted-foreground">
            Review your denial analysis and follow the remediation roadmap
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleTriggerAnalysis}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Re-analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-analyze
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analyzing && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">Analyzing denial letter...</p>
                <p className="text-sm text-muted-foreground">
                  This may take a moment while we extract denial reasons and generate recommendations
                </p>
                <Progress value={45} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <DenialSummaryCard 
            analysisData={analysisData} 
            onVerifyIssue={handleVerifyIssue}
          />
          
          <EvidenceTaskList
            evidenceRequirements={evidenceData}
            onEvidenceStatusChange={handleEvidenceStatusChange}
            onUploadEvidence={handleUploadEvidence}
          />
        </div>

        <div>
          <AppealRoadmap 
            roadmap={roadmapData}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {analysisData?.status === 'complete' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Analysis Complete</p>
                <p className="text-sm text-green-700">
                  Review the denial summary and follow the roadmap to prepare your appeal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppealAnalysisPanel;
