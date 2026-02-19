import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  FileCheck,
  Scale,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function RatingDecisionBrief({ claimId, claimNumber, onCompletenessChange, refreshKey = 0 }) {
  const [rdb, setRdb] = useState(null);
  const [attestations, setAttestations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [expandedCondition, setExpandedCondition] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (claimId) {
      setLoadError(null);
      loadRDB();
      loadAttestations();
    }
  }, [claimId, refreshKey]);

  const loadRDB = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/rdb/${claimId}`);
      setRdb(response.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Failed to load RDB:', err);
        setLoadError('Failed to load Rating Decision Brief');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAttestations = async () => {
    try {
      const response = await api.get(`/rdb/${claimId}/attestations`);
      if (response.data.success) {
        setAttestations(response.data);
        if (onCompletenessChange && response.data.rdb_completeness) {
          onCompletenessChange(response.data.rdb_completeness);
        }
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Failed to load attestations:', err);
      }
    }
  };

  const generateRDB = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/rdb/generate', { claim_id: claimId });
      
      if (response.data.success) {
        toast.success('Rating Decision Brief generated successfully!');
        await loadRDB();
        await loadAttestations();
      }
    } catch (err) {
      console.error('Failed to generate RDB:', err);
      toast.error('Failed to generate Rating Decision Brief');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/rdb/${claimId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RDB_${claimNumber || claimId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (completeness) => {
    if (completeness >= 80) return 'text-green-600';
    if (completeness >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusBg = (completeness) => {
    if (completeness >= 80) return 'bg-green-50 border-green-200';
    if (completeness >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const toggleCondition = (idx) => {
    setExpandedCondition(expandedCondition === idx ? null : idx);
  };

  if (loading) {
    return (
      <Card className="border-[#1B3A5F]/20">
        <CardContent className="py-8 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Loading Rating Decision Brief...</p>
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="border-[#1B3A5F]/20">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-600">{loadError}</p>
            <Button variant="ghost" size="sm" onClick={() => { setLoadError(null); loadRDB(); loadAttestations(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rdbCompleteness = attestations?.rdb_completeness || {};
  const conditions = attestations?.conditions || [];
  const qaReport = attestations?.qa_report || {};

  return (
    <Card className="border-[#1B3A5F]/20 bg-gradient-to-br from-[#1B3A5F]/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#1B3A5F]">
            <Scale className="h-5 w-5" />
            Rating Decision Brief
          </CardTitle>
          {rdb && (
            <Badge variant="outline" className={rdbCompleteness.ready_for_submission 
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
            }>
              {rdbCompleteness.ready_for_submission ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" />Ready</>
              ) : (
                <><AlertTriangle className="h-3 w-3 mr-1" />Needs Work</>
              )}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Evidence attestation connecting your documents to VA rating criteria
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!rdb ? (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-800 mb-1">No Brief Generated Yet</h4>
                <p className="text-sm text-amber-700 mb-3">
                  Generate a Rating Decision Brief to analyze your evidence and identify any gaps before submission.
                </p>
                <Button 
                  onClick={generateRDB}
                  disabled={generating}
                  className="bg-[#1B3A5F] hover:bg-[#1B3A5F]/90"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Evidence...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Brief
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Overall Completeness */}
            <div className="p-4 rounded-lg border bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Completeness</span>
                <span className={`text-lg font-bold ${getStatusColor(rdbCompleteness.overall_score || 0)}`}>
                  {Math.round(rdbCompleteness.overall_score || 0)}%
                </span>
              </div>
              <Progress 
                value={rdbCompleteness.overall_score || 0} 
                className="h-2"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{rdbCompleteness.conditions_complete || 0} of {rdbCompleteness.conditions_analyzed || 0} conditions complete</span>
                <span>{rdbCompleteness.critical_issues_count || 0} critical issues</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-white border">
                <p className="text-xs text-muted-foreground">Conditions</p>
                <p className="text-lg font-semibold">{conditions.length || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-white border">
                <p className="text-xs text-muted-foreground">Documents</p>
                <p className="text-lg font-semibold">{rdb.evidence_index?.length || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-white border">
                <p className="text-xs text-muted-foreground">QA Score</p>
                <p className="text-lg font-semibold">{Math.round(qaReport.overall_score || 0)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-white border">
                <p className="text-xs text-muted-foreground">Version</p>
                <p className="text-lg font-semibold">v{rdb.version || 1}</p>
              </div>
            </div>

            {/* Condition Attestations */}
            {conditions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Evidence Attestation by Condition
                </h4>
                <div className="space-y-2">
                  {conditions.map((condition, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-lg border ${getStatusBg(condition.completeness_score)}`}
                    >
                      <button
                        onClick={() => toggleCondition(idx)}
                        className="w-full p-3 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            condition.completeness_score >= 80 ? 'bg-green-100' :
                            condition.completeness_score >= 60 ? 'bg-amber-100' : 'bg-red-100'
                          }`}>
                            <span className={`text-sm font-bold ${getStatusColor(condition.completeness_score)}`}>
                              {Math.round(condition.completeness_score)}%
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{condition.condition_name}</p>
                            <p className="text-xs text-muted-foreground">
                              DC {condition.diagnostic_code} | Rating: {condition.best_supported_rating || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {condition.has_nexus ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />Nexus
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                              <XCircle className="h-3 w-3 mr-1" />No Nexus
                            </Badge>
                          )}
                          {expandedCondition === idx ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                      
                      {expandedCondition === idx && (
                        <div className="px-3 pb-3 space-y-3 border-t">
                          {/* Summary */}
                          <p className="text-sm pt-3 text-muted-foreground">{condition.summary}</p>
                          
                          {/* Evidence Attestations */}
                          {condition.attestations?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-2">Evidence Requirements</p>
                              <div className="space-y-1">
                                {condition.attestations.slice(0, 6).map((att, attIdx) => (
                                  <div key={attIdx} className="flex items-center justify-between text-xs p-2 bg-white rounded border">
                                    <span className="flex-1 truncate">{att.requirement}</span>
                                    <Badge variant="outline" className={
                                      att.status === 'SATISFIED' 
                                        ? 'bg-green-50 text-green-700 ml-2' 
                                        : 'bg-red-50 text-red-700 ml-2'
                                    }>
                                      {att.status === 'SATISFIED' ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                      ) : (
                                        <XCircle className="h-3 w-3" />
                                      )}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Gap Analysis */}
                          {condition.gap_analysis?.total_gaps > 0 && (
                            <div className="p-2 rounded bg-amber-50 border border-amber-200">
                              <p className="text-xs font-medium text-amber-800 mb-1">Gap Analysis</p>
                              {condition.gap_analysis.critical_gaps?.length > 0 && (
                                <p className="text-xs text-red-700">
                                  <strong>Critical:</strong> {condition.gap_analysis.critical_gaps.slice(0,2).join(', ')}
                                </p>
                              )}
                              {condition.gap_analysis.major_gaps?.length > 0 && (
                                <p className="text-xs text-amber-700">
                                  <strong>Major:</strong> {condition.gap_analysis.major_gaps.slice(0,2).join(', ')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QA Recommendations */}
            {qaReport.recommendations?.length > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs font-medium text-blue-800 mb-2">Recommendations</p>
                <ul className="space-y-1">
                  {qaReport.recommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="text-xs text-blue-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={downloadPDF}
                disabled={downloading}
                className="flex-1 bg-[#1B3A5F] hover:bg-[#1B3A5F]/90"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={generateRDB}
                disabled={generating}
                title="Regenerate Brief"
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>

            {rdb.pdf_generated_at && (
              <p className="text-xs text-center text-muted-foreground">
                Last generated: {new Date(rdb.pdf_generated_at).toLocaleDateString()}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
