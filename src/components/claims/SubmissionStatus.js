import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Send,
  Clock,
  XCircle,
  RotateCcw,
  Wifi,
  Shield,
  Server,
  FileWarning,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Pending',
    description: 'Preparing for submission'
  },
  submitting: {
    icon: Send,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Submitting',
    description: 'Uploading to VA'
  },
  retrying: {
    icon: RotateCcw,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Retrying',
    description: 'Retrying submission'
  },
  waiting_retry: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Waiting',
    description: 'Waiting to retry'
  },
  submitted: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Submitted',
    description: 'Successfully submitted to VA'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Failed',
    description: 'Submission failed'
  }
};

const ERROR_CATEGORY_CONFIG = {
  network_error: {
    icon: Wifi,
    color: 'text-orange-600',
    label: 'Network Error',
    description: 'Connection issues with VA servers'
  },
  authentication_error: {
    icon: Shield,
    color: 'text-red-600',
    label: 'Authentication Error',
    description: 'API credentials issue'
  },
  validation_error: {
    icon: FileWarning,
    color: 'text-red-600',
    label: 'Validation Error',
    description: 'Claim data validation failed'
  },
  server_error: {
    icon: Server,
    color: 'text-orange-600',
    label: 'Server Error',
    description: 'VA server temporarily unavailable'
  },
  rate_limit_error: {
    icon: Clock,
    color: 'text-yellow-600',
    label: 'Rate Limited',
    description: 'Too many requests to VA API'
  },
  configuration_error: {
    icon: Settings,
    color: 'text-red-600',
    label: 'Configuration Error',
    description: 'VA API not configured'
  },
  vbms_error: {
    icon: Server,
    color: 'text-orange-600',
    label: 'VBMS Error',
    description: 'VA document processing system error'
  },
  upload_error: {
    icon: AlertCircle,
    color: 'text-orange-600',
    label: 'Upload Error',
    description: 'Document upload to VA failed'
  },
  document_error: {
    icon: FileWarning,
    color: 'text-red-600',
    label: 'Document Error',
    description: 'Issue with claim documents'
  },
  unknown_error: {
    icon: AlertTriangle,
    color: 'text-gray-600',
    label: 'Unknown Error',
    description: 'An unexpected error occurred'
  }
};

export function SubmissionStatus({ claimId, onSubmissionComplete }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [errors, setErrors] = useState(null);
  const [showErrors, setShowErrors] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/submissions/claim/${claimId}`);
      setStatus(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to load submission status:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  const loadErrors = useCallback(async () => {
    try {
      const response = await api.get(`/submissions/claim/${claimId}/errors`);
      setErrors(response.data);
    } catch (error) {
      console.error('Failed to load errors:', error);
    }
  }, [claimId]);

  useEffect(() => {
    if (claimId) {
      loadStatus();
    }
  }, [claimId, loadStatus]);

  useEffect(() => {
    const latestStatus = status?.latest_status;
    if (latestStatus && ['pending', 'submitting', 'retrying', 'waiting_retry'].includes(latestStatus)) {
      const interval = setInterval(loadStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [status?.latest_status, loadStatus]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const response = await api.post('/submissions/submit', { 
        claim_id: claimId,
        force_resubmit: false 
      });
      
      if (response.data.success) {
        toast.success('Submission initiated. Processing in background.');
        loadStatus();
      } else {
        toast.error(response.data.error || 'Failed to initiate submission');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const response = await api.post(`/submissions/claim/${claimId}/retry`);
      
      if (response.data.success) {
        toast.success('Retry initiated');
        loadStatus();
      }
    } catch (error) {
      console.error('Retry error:', error);
      toast.error(error.response?.data?.detail || 'Failed to retry submission');
    } finally {
      setRetrying(false);
    }
  };

  const handleViewErrors = async () => {
    if (!errors) {
      await loadErrors();
    }
    setShowErrors(!showErrors);
  };

  const latestSubmission = status?.submissions?.[0];
  const statusConfig = latestSubmission 
    ? STATUS_CONFIG[latestSubmission.status] || STATUS_CONFIG.pending
    : null;

  const isInProgress = latestSubmission?.status && 
    ['pending', 'submitting', 'retrying', 'waiting_retry'].includes(latestSubmission.status);

  const canSubmit = !isInProgress && (!latestSubmission || latestSubmission.status === 'failed');
  const canRetry = latestSubmission?.status === 'failed';

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              VA Submission Status
            </CardTitle>
            <CardDescription className="mt-1">
              Track your claim submission to VA Lighthouse
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={loadStatus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {latestSubmission ? (
          <>
            <div className={`p-4 rounded-lg ${statusConfig.bgColor}`}>
              <div className="flex items-center gap-3">
                <statusConfig.icon className={`h-6 w-6 ${statusConfig.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    {isInProgress && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {statusConfig.description}
                  </p>
                </div>
              </div>

              {isInProgress && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Attempt {latestSubmission.attempt_count} of {latestSubmission.max_attempts}</span>
                    {latestSubmission.next_retry_at && (
                      <span className="text-muted-foreground">
                        Next retry: {new Date(latestSubmission.next_retry_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <Progress 
                    value={(latestSubmission.attempt_count / latestSubmission.max_attempts) * 100} 
                    className="h-2"
                  />
                </div>
              )}

              {latestSubmission.va_submission_id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-muted-foreground">
                    VA Submission ID: <span className="font-mono">{latestSubmission.va_submission_id}</span>
                  </p>
                </div>
              )}
            </div>

            {latestSubmission.status === 'failed' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Submission Failed</AlertTitle>
                <AlertDescription>
                  <p>{latestSubmission.failure_reason || 'An error occurred during submission.'}</p>
                  {latestSubmission.failure_category && (
                    <Badge variant="outline" className="mt-2">
                      {ERROR_CATEGORY_CONFIG[latestSubmission.failure_category]?.label || latestSubmission.failure_category}
                    </Badge>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {latestSubmission.status === 'submitted' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Successfully Submitted</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your claim has been submitted to VA. Processing typically takes 5-6 days.
                  {latestSubmission.completed_at && (
                    <p className="text-sm mt-1">
                      Submitted: {new Date(latestSubmission.completed_at).toLocaleString()}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {latestSubmission.errors?.length > 0 && (
              <div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleViewErrors}
                  className="w-full justify-start"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {showErrors ? 'Hide' : 'View'} Error Log ({latestSubmission.errors.length} errors)
                </Button>

                {showErrors && errors && (
                  <Accordion type="single" collapsible className="mt-2">
                    {errors.errors?.map((error, index) => {
                      const categoryConfig = ERROR_CATEGORY_CONFIG[error.category] || ERROR_CATEGORY_CONFIG.unknown_error;
                      const CategoryIcon = categoryConfig.icon;
                      
                      return (
                        <AccordionItem key={index} value={`error-${index}`}>
                          <AccordionTrigger className="hover:no-underline py-2">
                            <div className="flex items-center gap-2 text-sm">
                              <CategoryIcon className={`h-4 w-4 ${categoryConfig.color}`} />
                              <span>{categoryConfig.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(error.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="bg-muted/50 p-3 rounded text-sm space-y-2">
                              <p>{error.message}</p>
                              <div className="flex gap-2">
                                <Badge variant={error.retryable ? 'secondary' : 'destructive'}>
                                  {error.retryable ? 'Retryable' : 'Non-retryable'}
                                </Badge>
                                {error.http_status && (
                                  <Badge variant="outline">HTTP {error.http_status}</Badge>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No submission attempts yet</p>
            <p className="text-sm mt-1">Click Submit to VA to begin the submission process</p>
          </div>
        )}

        <div className="pt-4 border-t flex gap-2">
          {canRetry && (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Retry Submission
            </Button>
          )}
          
          <Button 
            className="flex-1" 
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {latestSubmission?.status === 'submitted' 
              ? 'Already Submitted' 
              : isInProgress 
                ? 'Submission In Progress' 
                : 'Submit to VA'
            }
          </Button>
        </div>

        {status?.submissions?.length > 1 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Previous attempts: {status.submissions.length - 1}
            </p>
            <div className="space-y-1">
              {status.submissions.slice(1, 4).map((sub, index) => (
                <div key={sub.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {STATUS_CONFIG[sub.status]?.label || sub.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SubmissionStatus;
