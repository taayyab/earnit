import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Search,
  Scale,
  FileSignature,
  ClipboardList,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

const STAGE_ICONS = {
  document_completeness: FileCheck,
  evidence_mapping: Search,
  rating_criteria_alignment: Scale,
  nexus_validation: FileSignature,
  deficiency_report: ClipboardList
};

const STAGE_NAMES = {
  document_completeness: 'Document Completeness',
  evidence_mapping: 'Evidence Mapping',
  rating_criteria_alignment: 'Rating Criteria',
  nexus_validation: 'Nexus Validation',
  deficiency_report: 'Deficiency Report'
};

export default function QADashboard({ claimId, onRefresh }) {
  const [qaReport, setQaReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [expandedStage, setExpandedStage] = useState(null);

  useEffect(() => {
    loadLatestReport();
  }, [claimId]);

  const loadLatestReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/qa/claim/${claimId}/latest`);
      if (response.data.exists) {
        setQaReport(response.data.report);
      }
    } catch (err) {
      console.error('Failed to load QA report:', err);
    } finally {
      setLoading(false);
    }
  };

  const runQACheck = async () => {
    try {
      setRunning(true);
      const response = await api.post(`/qa/check/${claimId}`);
      setQaReport(response.data.report);
      toast.success('QA check completed!');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to run QA check');
    } finally {
      setRunning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500';
      case 'needs_improvement':
        return 'bg-yellow-500';
      case 'significant_gaps':
        return 'bg-orange-500';
      case 'critical_issues':
      case 'not_ready':
        return 'bg-red-500';
      default:
        return 'bg-white0';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ready':
        return 'Ready for Submission';
      case 'needs_improvement':
        return 'Needs Improvement';
      case 'significant_gaps':
        return 'Significant Gaps';
      case 'critical_issues':
        return 'Critical Issues';
      case 'not_ready':
        return 'Not Ready';
      default:
        return 'Unknown';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'major':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'minor':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#D4A574]/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#D4A574]" />
            Pre-Submission Quality Check
          </CardTitle>
          <Button
            onClick={runQACheck}
            disabled={running}
            className="bg-gradient-to-r from-[#D4A574] to-[#C97B63] hover:from-[#B8895E] hover:to-[#A85F4A] text-white"
          >
            {running ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run QA Check
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!qaReport ? (
          <div className="text-center py-8">
            <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No QA Report Yet</h3>
            <p className="text-muted-foreground mb-4">
              Run a quality check to analyze your claim package before submission.
            </p>
            <p className="text-sm text-muted-foreground">
              The QA engine will check document completeness, evidence mapping,
              rating criteria alignment, nexus validation, and generate a deficiency report.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(qaReport.overall_score)}`}>
                  {qaReport.overall_score}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className={`${getStatusColor(qaReport.overall_status)} text-white text-sm px-3 py-1`}>
                  {getStatusLabel(qaReport.overall_status)}
                </Badge>
              </div>
              <div className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Ready to Submit</p>
                {qaReport.ready_for_submission ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <span className="text-lg font-semibold text-green-600">Yes</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <span className="text-lg font-semibold text-red-600">Not Yet</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg">5-Stage Analysis</h4>
              {qaReport.stage_results?.map((stage, index) => {
                const StageIcon = STAGE_ICONS[stage.stage] || FileCheck;
                const isExpanded = expandedStage === stage.stage;
                
                return (
                  <div key={stage.stage} className="border rounded-lg overflow-hidden">
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-white transition-colors ${
                        stage.passed ? 'bg-green-50' : 'bg-red-50'
                      }`}
                      onClick={() => setExpandedStage(isExpanded ? null : stage.stage)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${stage.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                          <StageIcon className={`h-5 w-5 ${stage.passed ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium">
                            Stage {index + 1}: {STAGE_NAMES[stage.stage]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stage.issues?.length || 0} issues found
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getScoreColor(stage.score)}`}>
                            {stage.score}%
                          </p>
                        </div>
                        {stage.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && stage.issues?.length > 0 && (
                      <div className="border-t p-4 bg-white space-y-2">
                        {stage.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-100">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{issue.title}</p>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                              <p className="text-sm text-blue-600 mt-1">
                                Fix: {issue.remediation}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {issue.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {qaReport.critical_issues?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Critical Issues ({qaReport.critical_issues.length})
                </h4>
                <div className="space-y-2">
                  {qaReport.critical_issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">{issue.title}</p>
                        <p className="text-sm text-red-600">{issue.remediation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {qaReport.recommendations?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {qaReport.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Last checked: {new Date(qaReport.generated_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
