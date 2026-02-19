import React, { useState } from 'react';
import api from '../lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function QAChecklist({ open, onOpenChange, claimId, onSubmitReady }) {
  const [qaReport, setQaReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedChecks, setExpandedChecks] = useState(new Set());

  const runQACheck = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/qa/check/${claimId}`);
      setQaReport(res.data.report);
      
      if (res.data.report.ready_for_submission) {
        toast.success('All checks passed! Your claim is ready for submission.');
      } else {
        toast.warning(`${res.data.report.summary.critical_failures} critical issue(s) found`);
      }
    } catch (error) {
      console.error('QA check failed:', error);
      toast.error(error.response?.data?.detail || 'QA check failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckExpanded = (checkId) => {
    const newExpanded = new Set(expandedChecks);
    if (newExpanded.has(checkId)) {
      newExpanded.delete(checkId);
    } else {
      newExpanded.add(checkId);
    }
    setExpandedChecks(newExpanded);
  };

  const getCheckIcon = (check) => {
    if (check.passed) {
      return <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />;
    }
    if (check.severity === 'critical') {
      return <XCircle className="h-5 w-5 text-[hsl(var(--destructive))]" />;
    }
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'critical') {
      return <Badge className="bg-[hsl(var(--destructive))]">Critical</Badge>;
    }
    return <Badge className="bg-yellow-500">Warning</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="qa-checklist-dialog">
        <DialogHeader>
          <DialogTitle>Pre-Submission Quality Assurance</DialogTitle>
          <DialogDescription>
            Comprehensive validation to ensure your claim is complete and ready for VA submission
          </DialogDescription>
        </DialogHeader>

        {!qaReport ? (
          <div className="py-12 text-center">
            <Info className="h-12 w-12 text-[hsl(var(--primary))] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Check Your Claim?</h3>
            <p className="text-muted-foreground mb-6">
              We'll validate your form, documents, and evidence to ensure everything is ready for submission.
            </p>
            <Button
              onClick={runQACheck}
              disabled={loading}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
              data-testid="run-qa-button"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Checks...
                </>
              ) : (
                'Run QA Checks'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white border border-slate-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Overall Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {qaReport.summary.passed_checks} of {qaReport.summary.total_checks} checks passed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">{qaReport.overall_score}%</div>
                  {qaReport.ready_for_submission ? (
                    <Badge className="bg-[hsl(var(--success))] mt-1">Ready to Submit</Badge>
                  ) : (
                    <Badge className="bg-[hsl(var(--destructive))] mt-1">Not Ready</Badge>
                  )}
                </div>
              </div>
              <Progress value={qaReport.overall_score} className="h-2" />
            </div>

            {/* Critical Failures Alert */}
            {qaReport.summary.critical_failures > 0 && (
              <Alert className="border-[hsl(var(--destructive))] bg-red-50" data-testid="critical-failures-alert">
                <XCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                <AlertDescription>
                  <strong>Action Required:</strong> {qaReport.summary.critical_failures} critical issue(s) must be resolved before submission.
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings Alert */}
            {qaReport.summary.warnings > 0 && qaReport.summary.critical_failures === 0 && (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription>
                  <strong>Recommendations:</strong> {qaReport.summary.warnings} optional improvement(s) suggested.
                </AlertDescription>
              </Alert>
            )}

            {/* Checklist Items */}
            <div className="space-y-2">
              <h3 className="font-semibold">Quality Checks</h3>
              {qaReport.checks.map((check, index) => (
                <div
                  key={check.check_id}
                  className="border border-border rounded-lg overflow-hidden"
                  data-testid={`qa-check-${check.check_id}`}
                >
                  <button
                    onClick={() => toggleCheckExpanded(check.check_id)}
                    className="w-full p-4 flex items-start gap-3 hover:bg-white transition-colors text-left"
                  >
                    <div className="mt-0.5">{getCheckIcon(check)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{check.name}</h4>
                        {!check.passed && getSeverityBadge(check.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                      {check.action_required && (
                        <p className="text-sm text-[hsl(var(--accent))] mt-2 font-medium">
                          → {check.action_required}
                        </p>
                      )}
                    </div>
                    {expandedChecks.has(check.check_id) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {expandedChecks.has(check.check_id) && (
                    <div className="px-4 pb-4 pt-2 bg-white border-t border-slate-100">
                      <p className="text-sm text-muted-foreground mb-2">{check.description}</p>
                      {check.details && (
                        <div className="bg-white p-3 rounded text-xs space-y-1">
                          <strong>Details:</strong>
                          {Object.entries(check.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                              <span className="font-medium">
                                {Array.isArray(value) ? value.join(', ') || 'None' : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {qaReport.recommendations && qaReport.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  Recommendations
                </h3>
                <ul className="space-y-1 text-sm">
                  {qaReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="close-qa-button"
            >
              Close
            </Button>
            <div className="flex gap-2">
              {qaReport && (
                <Button
                  variant="outline"
                  onClick={runQACheck}
                  disabled={loading}
                  data-testid="rerun-qa-button"
                >
                  {loading ? 'Running...' : 'Re-run Checks'}
                </Button>
              )}
              {qaReport && qaReport.ready_for_submission && (
                <Button
                  onClick={() => {
                    onSubmitReady();
                    onOpenChange(false);
                  }}
                  className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90"
                  data-testid="proceed-to-submit-button"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Proceed to Submit
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
