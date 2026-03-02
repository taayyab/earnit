import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  CheckCircle, 
  Clock, 
  FileSearch, 
  Send, 
  AlertCircle,
  ArrowRight,
  Shield,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PHASE_CONFIG = {
  identified: {
    label: 'Identified',
    icon: FileSearch,
    color: 'text-neutral-500',
    bg: 'bg-neutral-100',
    description: 'Condition found in your records'
  },
  selected: {
    label: 'Selected',
    icon: CheckCircle,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    description: 'You chose to include this in your claim'
  },
  gathering_evidence: {
    label: 'Gathering Evidence',
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-100',
    description: 'Collecting required documentation'
  },
  evidence_complete: {
    label: 'Evidence Complete',
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-100',
    description: 'All required evidence collected'
  },
  ready_for_review: {
    label: 'Ready for Review',
    icon: FileSearch,
    color: 'text-[#1B3A5F]',
    bg: 'bg-blue-50',
    description: 'Ready for QA check before submission'
  },
  submitted: {
    label: 'Submitted',
    icon: Send,
    color: 'text-green-600',
    bg: 'bg-green-100',
    description: 'Submitted to the VA'
  }
};

export default function ConditionProgressTracker({ 
  conditions = [], 
  summary,
  showActions = true,
  compact = false
}) {
  const navigate = useNavigate();

  if (conditions.length === 0) {
    return (
      <Card className="border-neutral-200">
        <CardContent className="py-8 text-center">
          <FileSearch className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
          <h3 className="font-medium text-neutral-600 mb-1">No Conditions Selected</h3>
          <p className="text-sm text-neutral-500 mb-4">
            Upload your documents to identify claimable conditions
          </p>
          <button
            onClick={() => navigate('/document-onboarding')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm hover:bg-[hsl(var(--primary))]/90"
          >
            Start Document Upload
            <ArrowRight className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" />
            Your Claim Progress
          </CardTitle>
          {summary && (
            <Badge variant="outline">
              {summary.total_conditions} Condition{summary.total_conditions !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {summary && (
          <div className="grid grid-cols-4 gap-2 p-3 bg-neutral-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-600">
                {summary.by_phase?.gathering_evidence || 0}
              </div>
              <div className="text-xs text-neutral-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {summary.by_phase?.evidence_complete || 0}
              </div>
              <div className="text-xs text-neutral-500">Evidence Done</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-[#1B3A5F]">
                {summary.by_phase?.ready_for_review || 0}
              </div>
              <div className="text-xs text-neutral-500">Ready</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {summary.by_phase?.submitted || 0}
              </div>
              <div className="text-xs text-neutral-500">Submitted</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {conditions.map((condition) => {
            const phase = condition.phase || 'identified';
            const config = PHASE_CONFIG[phase] || PHASE_CONFIG.identified;
            const PhaseIcon = config.icon;

            return (
              <div 
                key={condition.id}
                className="p-3 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors cursor-pointer"
                onClick={() => condition.claim_id && navigate(`/claim/${condition.claim_id}?condition=${condition.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <PhaseIcon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-neutral-900">{condition.name}</h4>
                      {condition.is_presumptive && (
                        <Badge className="bg-blue-50 text-[#1B3A5F] border-0 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Presumptive
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className={`${config.bg} ${config.color} border-0 text-xs`}>
                        {config.label}
                      </Badge>
                      
                      {condition.estimated_rating && (
                        <span className="text-xs text-neutral-500">
                          Est. {condition.estimated_rating}% Rating
                        </span>
                      )}
                    </div>
                    
                    {!compact && condition.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                          <span>Evidence Progress</span>
                          <span>{condition.progress}%</span>
                        </div>
                        <Progress value={condition.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                  
                  {showActions && (
                    <ArrowRight className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {summary?.pending_actions?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Actions Needed
            </h4>
            <div className="space-y-2">
              {summary.pending_actions.slice(0, 3).map((action, index) => (
                <div 
                  key={index}
                  className="p-2 bg-amber-50 border border-amber-100 rounded-lg text-sm"
                >
                  <p className="font-medium text-amber-800">{action.condition}: {action.requirement}</p>
                  <p className="text-amber-700 text-xs mt-1">{action.instructions}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
