import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../ui/alert';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Shield,
  Send,
  User,
  FileSignature,
  DollarSign,
  FileCheck,
  FolderOpen,
  Stethoscope,
  ClipboardCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  passed: { 
    icon: CheckCircle2, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    label: 'Passed' 
  },
  failed: { 
    icon: AlertCircle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    label: 'Failed' 
  },
  warning: { 
    icon: AlertTriangle, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    label: 'Warning' 
  },
  pending: { 
    icon: Circle, 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-50', 
    borderColor: 'border-gray-200',
    label: 'Pending' 
  },
};

const CATEGORY_ICONS = {
  veteran_identity: User,
  poa_status: FileSignature,
  fee_compliance: DollarSign,
  consents: FileCheck,
  form_packet: ClipboardCheck,
  documents: FolderOpen,
  conditions: Stethoscope,
  qa_status: Shield,
};

export function SubmissionReadinessChecklist({ claimId, onReady }) {
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (claimId) {
      loadReadiness();
    } else {
      setLoading(false);
    }
  }, [claimId]);

  const loadReadiness = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/submission-readiness/claim/${claimId}`);
      setReadiness(response.data);
    } catch (err) {
      console.error('Failed to load readiness checklist:', err);
      if (err.response?.status === 404) {
        setReadiness(null);
      } else {
        setError('Unable to load submission readiness data');
      }
    } finally {
      setLoading(false);
    }
  };

  const runAllChecks = async () => {
    try {
      setRunning(true);
      const response = await api.post(`/submission-readiness/claim/${claimId}/run-all-checks`);
      setReadiness(response.data.readiness);
      if (response.data.readiness?.is_ready_for_submission) {
        toast.success('All checks passed! Claim is ready for submission.');
      } else {
        const blockingCount = response.data.readiness?.blocking_issues?.length || 0;
        if (blockingCount > 0) {
          toast.warning(`${blockingCount} blocking issue(s) must be resolved before submission.`);
        } else {
          toast.info('Checks completed with warnings. Review recommended.');
        }
      }
    } catch (error) {
      console.error('Failed to run checks:', error);
      toast.error('Failed to run submission checks');
    } finally {
      setRunning(false);
    }
  };

  const markReady = async () => {
    try {
      setMarking(true);
      const response = await api.post(`/submission-readiness/claim/${claimId}/mark-ready`);
      if (response.data.success) {
        toast.success('Claim marked as ready for submission!');
        loadReadiness();
        if (onReady) {
          onReady();
        }
      }
    } catch (error) {
      console.error('Failed to mark ready:', error);
      const message = error.response?.data?.detail || 'Failed to mark claim as ready';
      toast.error(message);
    } finally {
      setMarking(false);
    }
  };

  const getOverallStatusColor = () => {
    if (!readiness) return 'text-gray-500';
    if (readiness.is_ready_for_submission) return 'text-green-600';
    if (readiness.summary?.failed > 0) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getOverallBadge = () => {
    if (!readiness) return null;
    if (readiness.is_ready_for_submission) {
      return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
    }
    if (readiness.summary?.failed > 0) {
      return <Badge variant="destructive">Not Ready</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Warnings</Badge>;
  };

  if (!claimId) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex items-center gap-3 py-8">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-medium text-red-700">{error}</p>
            <p className="text-sm text-red-600">Please try again or contact support.</p>
          </div>
          <Button variant="outline" onClick={loadReadiness} className="ml-auto">
            Retry
          </Button>
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
              <Shield className="h-5 w-5" />
              Submission Readiness
            </CardTitle>
            <CardDescription className="mt-1">
              Pre-flight checks before VA Lighthouse submission
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadReadiness}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {getOverallBadge()}
          </div>
        </div>

        {readiness && (
          <>
            <div className="flex items-center gap-4 mt-3">
              <Progress 
                value={readiness.overall_score} 
                className="h-2 flex-1"
              />
              <span className={`text-sm font-medium ${getOverallStatusColor()}`}>
                {readiness.overall_score}%
              </span>
            </div>
            
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-600">
                {readiness.summary?.passed || 0} passed
              </span>
              <span className="text-yellow-600">
                {readiness.summary?.warning || 0} warnings
              </span>
              <span className="text-red-600">
                {readiness.summary?.failed || 0} failed
              </span>
            </div>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {readiness?.blocking_issues?.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Blocking Issues</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {readiness.blocking_issues.map((issue) => (
                  <li key={issue.id} className="text-sm">
                    <strong>{issue.name}:</strong> {issue.description}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {readiness?.categories?.length > 0 ? (
          <Accordion 
            type="multiple" 
            defaultValue={readiness.categories
              .filter(c => c.status === 'failed')
              .map(c => c.id)
            }
          >
            {readiness.categories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Run checks to verify submission readiness</p>
          </div>
        )}

        <div className="pt-4 border-t flex gap-2">
          <Button 
            variant="outline"
            className="flex-1" 
            onClick={runAllChecks}
            disabled={running}
          >
            {running ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run All Checks
          </Button>
          
          <Button 
            className="flex-1" 
            onClick={markReady}
            disabled={marking || !readiness?.is_ready_for_submission}
          >
            {marking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {readiness?.is_ready_for_submission 
              ? 'Mark Ready for Submission' 
              : 'Resolve Issues First'
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategorySection({ category }) {
  const statusConfig = STATUS_CONFIG[category.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const CategoryIcon = CATEGORY_ICONS[category.id] || Shield;

  return (
    <AccordionItem value={category.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3 w-full pr-4">
          <div className={`p-1.5 rounded ${statusConfig.bgColor}`}>
            <CategoryIcon className={`h-4 w-4 ${statusConfig.color}`} />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium">{category.name}</span>
              <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
            </div>
            <span className="text-xs text-muted-foreground">
              {category.summary?.passed}/{category.summary?.total} checks passed
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 pl-2">
          {category.checks?.map((check) => (
            <CheckItem key={check.id} check={check} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function CheckItem({ check }) {
  const statusConfig = STATUS_CONFIG[check.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div 
      className={`p-3 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
    >
      <div className="flex items-start gap-3">
        <StatusIcon className={`h-4 w-4 mt-0.5 ${statusConfig.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium text-sm ${
              check.status === 'passed' ? 'text-green-800' :
              check.status === 'failed' ? 'text-red-800' :
              check.status === 'warning' ? 'text-yellow-800' :
              'text-gray-700'
            }`}>
              {check.name}
            </span>
            {check.blocking && check.status === 'failed' && (
              <Badge variant="destructive" className="text-xs">
                Blocking
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {check.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SubmissionReadinessChecklist;
