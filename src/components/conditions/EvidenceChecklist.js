import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  FileText, 
  Calendar, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Phone,
  MapPin
} from 'lucide-react';

const STATUS_CONFIG = {
  missing: { 
    icon: Circle, 
    color: 'text-neutral-400', 
    bg: 'bg-neutral-100',
    label: 'Not Started' 
  },
  requested: { 
    icon: Clock, 
    color: 'text-amber-500', 
    bg: 'bg-amber-100',
    label: 'Requested' 
  },
  scheduled: { 
    icon: Calendar, 
    color: 'text-blue-500', 
    bg: 'bg-blue-100',
    label: 'Scheduled' 
  },
  received: { 
    icon: CheckCircle, 
    color: 'text-green-500', 
    bg: 'bg-green-100',
    label: 'Received' 
  },
  reviewed: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bg: 'bg-green-100',
    label: 'Complete' 
  }
};

export default function EvidenceChecklist({ 
  condition,
  requirements = [],
  onUpdateStatus,
  onScheduleAction
}) {
  const [expandedReq, setExpandedReq] = useState(null);

  const completedCount = requirements.filter(r => 
    r.evidence_items?.some(e => ['received', 'reviewed'].includes(e.status))
  ).length;
  
  const progress = requirements.length > 0 
    ? Math.round((completedCount / requirements.length) * 100) 
    : 0;

  const getActionButton = (requirement) => {
    const reqType = requirement.requirement_type;
    
    switch (reqType) {
      case 'medical':
        return {
          label: 'Schedule Doctor Visit',
          icon: Calendar,
          action: () => onScheduleAction?.(requirement.id, 'medical_appointment')
        };
      case 'service':
        return {
          label: 'Request Service Records',
          icon: FileText,
          action: () => onScheduleAction?.(requirement.id, 'records_request')
        };
      case 'nexus':
        return {
          label: 'Request Nexus Letter',
          icon: FileText,
          action: () => onScheduleAction?.(requirement.id, 'nexus_letter')
        };
      case 'evaluation':
        return {
          label: 'Download DBQ Form',
          icon: ExternalLink,
          href: 'https://www.va.gov/find-forms/?q=dbq'
        };
      default:
        return {
          label: 'Mark as Complete',
          icon: CheckCircle,
          action: () => onUpdateStatus?.(requirement.evidence_items?.[0]?.id, 'received')
        };
    }
  };

  return (
    <Card className="border-neutral-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
            Evidence Checklist: {condition?.condition_name}
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {completedCount}/{requirements.length} Complete
          </Badge>
        </div>
        <Progress value={progress} className="mt-3" />
      </CardHeader>
      
      <CardContent className="space-y-3">
        {requirements.map((req, index) => {
          const evidenceItem = req.evidence_items?.[0] || {};
          const status = evidenceItem.status || 'missing';
          const config = STATUS_CONFIG[status] || STATUS_CONFIG.missing;
          const StatusIcon = config.icon;
          const isExpanded = expandedReq === req.id;
          const actionConfig = getActionButton(req);

          return (
            <div 
              key={req.id || index}
              className="border border-neutral-200 rounded-lg overflow-hidden"
            >
              <div 
                className="p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setExpandedReq(isExpanded ? null : req.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-full ${config.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-neutral-900">{req.title}</h4>
                      {req.is_mandatory && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5">{req.description}</p>
                    
                    {req.cfr_reference && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Reference: {req.cfr_reference}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Badge className={config.bg + ' ' + config.color + ' border-0'}>
                      {config.label}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 bg-neutral-50 border-t border-neutral-100">
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-neutral-700 mb-2">How to get this:</h5>
                    <p className="text-sm text-neutral-600">{req.instructions}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {actionConfig.href ? (
                      <a 
                        href={actionConfig.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm hover:bg-[hsl(var(--primary))]/90"
                      >
                        <actionConfig.icon className="h-4 w-4" />
                        {actionConfig.label}
                      </a>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          actionConfig.action?.();
                        }}
                        className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                      >
                        <actionConfig.icon className="h-4 w-4 mr-2" />
                        {actionConfig.label}
                      </Button>
                    )}
                    
                    {status !== 'received' && status !== 'reviewed' && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus?.(evidenceItem.id, 'received');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        I Have This
                      </Button>
                    )}
                  </div>
                  
                  {evidenceItem.scheduled_date && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Scheduled for: {new Date(evidenceItem.scheduled_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {requirements.length === 0 && (
          <div className="text-center py-6 text-neutral-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
            <p>No requirements loaded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
