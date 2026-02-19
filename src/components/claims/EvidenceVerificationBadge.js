import React from 'react';
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Stethoscope,
  Link,
  Calendar,
  HelpCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  verified: {
    icon: CheckCircle2,
    color: 'bg-green-100 border-green-500 text-green-700',
    badgeVariant: 'default',
    label: 'Verified',
  },
  warning: {
    icon: AlertTriangle,
    color: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    badgeVariant: 'secondary',
    label: 'Warning',
  },
  error: {
    icon: XCircle,
    color: 'bg-red-100 border-red-500 text-red-700',
    badgeVariant: 'destructive',
    label: 'Issues Found',
  },
  unavailable: {
    icon: HelpCircle,
    color: 'bg-gray-100 border-gray-400 text-gray-600',
    badgeVariant: 'outline',
    label: 'Unavailable',
  },
};

function VerificationIndicator({ verified, confidence, label, icon: Icon, issues = [] }) {
  const status = verified ? 'verified' : confidence > 0.3 ? 'warning' : 'error';
  const config = STATUS_CONFIG[status];
  
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className={`h-3 w-3 ${verified ? 'text-green-600' : confidence > 0.3 ? 'text-yellow-600' : 'text-red-500'}`} />
      <span className={verified ? 'text-green-700' : confidence > 0.3 ? 'text-yellow-700' : 'text-red-600'}>
        {label}
      </span>
      {confidence > 0 && (
        <span className="text-muted-foreground">({Math.round(confidence * 100)}%)</span>
      )}
    </div>
  );
}

function NexusStrengthBadge({ strength }) {
  const strengthConfig = {
    strong: { color: 'bg-green-500', label: 'Strong' },
    moderate: { color: 'bg-yellow-500', label: 'Moderate' },
    weak: { color: 'bg-orange-500', label: 'Weak' },
    none: { color: 'bg-gray-400', label: 'None' },
  };
  
  const config = strengthConfig[strength] || strengthConfig.none;
  
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-white font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function QualityScoreBar({ score }) {
  const getColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-300`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium">{score}%</span>
    </div>
  );
}

function EvidenceVerificationBadge({ verification, compact = false }) {
  if (!verification) {
    return null;
  }
  
  const status = verification.status || 'unavailable';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unavailable;
  const StatusIcon = config.icon;
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${config.color} cursor-help`}>
              <StatusIcon className="h-3 w-3" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs p-0 bg-white dark:bg-gray-900">
            <VerificationTooltipContent verification={verification} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.badgeVariant} className="cursor-help gap-1">
            <StatusIcon className="h-3 w-3" />
            <span>{config.label}</span>
            {verification.overall_score > 0 && (
              <span className="opacity-75">({verification.overall_score}%)</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm p-0 bg-white dark:bg-gray-900">
          <VerificationTooltipContent verification={verification} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function VerificationTooltipContent({ verification }) {
  const { diagnosis, provider_credentials, nexus_language, date_validation, overall_score } = verification;
  
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-sm font-semibold">Content Verification</span>
        {overall_score !== undefined && (
          <span className={`text-xs font-bold ${
            overall_score >= 70 ? 'text-green-600' : 
            overall_score >= 40 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            Quality: {overall_score}%
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {diagnosis && (
          <VerificationIndicator
            verified={diagnosis.verified}
            confidence={diagnosis.confidence}
            label={diagnosis.verified ? 
              `Diagnosis verified (${diagnosis.conditions_verified || 0}/${diagnosis.total_conditions || 0})` : 
              'Diagnosis not found'
            }
            icon={Stethoscope}
            issues={diagnosis.issues}
          />
        )}
        
        {provider_credentials && (
          <VerificationIndicator
            verified={provider_credentials.verified}
            confidence={provider_credentials.confidence}
            label={provider_credentials.verified ? 'Provider credentials found' : 'No credentials found'}
            icon={Shield}
            issues={provider_credentials.issues}
          />
        )}
        
        {nexus_language && (
          <div className="flex items-center gap-1.5 text-xs">
            <Link className={`h-3 w-3 ${nexus_language.verified ? 'text-green-600' : 'text-gray-400'}`} />
            <span>Nexus Language:</span>
            <NexusStrengthBadge strength={nexus_language.strength} />
          </div>
        )}
        
        {date_validation && (
          <VerificationIndicator
            verified={date_validation.verified}
            confidence={date_validation.confidence}
            label={date_validation.verified ? 'Dates validated' : 'Date issues'}
            icon={Calendar}
            issues={date_validation.issues}
          />
        )}
      </div>
      
      {(diagnosis?.issues?.length > 0 || provider_credentials?.issues?.length > 0 || 
        nexus_language?.issues?.length > 0 || date_validation?.issues?.length > 0) && (
        <div className="pt-2 border-t">
          <div className="text-[10px] text-muted-foreground">
            {[
              ...(diagnosis?.issues || []),
              ...(provider_credentials?.issues || []),
              ...(nexus_language?.issues || []),
              ...(date_validation?.issues || [])
            ].slice(0, 3).map((issue, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <AlertTriangle className="h-2.5 w-2.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function VerificationSummaryCard({ summary }) {
  if (!summary) return null;
  
  return (
    <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg">
      <div className="text-center">
        <div className="text-lg font-bold">{summary.total_documents}</div>
        <div className="text-[10px] text-muted-foreground">Documents</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">{summary.verified}</div>
        <div className="text-[10px] text-green-600">Verified</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-yellow-600">{summary.warnings}</div>
        <div className="text-[10px] text-yellow-600">Warnings</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-red-600">{summary.errors}</div>
        <div className="text-[10px] text-red-600">Issues</div>
      </div>
    </div>
  );
}

export { EvidenceVerificationBadge, QualityScoreBar, NexusStrengthBadge };
export default EvidenceVerificationBadge;
