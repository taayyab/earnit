import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { 
  ClipboardList, 
  Upload,
  FileCheck,
  AlertCircle,
  Star,
  Shield,
  File,
  CheckCircle2,
  Clock
} from 'lucide-react';

const EvidenceTaskList = ({ evidenceRequirements = [], onEvidenceStatusChange, onUploadEvidence }) => {
  const groupedEvidence = useMemo(() => {
    const groups = {
      required: [],
      recommended: [],
      optional: []
    };

    evidenceRequirements.forEach(item => {
      const priority = item.priority?.toLowerCase() || 'optional';
      if (groups[priority]) {
        groups[priority].push(item);
      } else {
        groups.optional.push(item);
      }
    });

    return groups;
  }, [evidenceRequirements]);

  const completionStats = useMemo(() => {
    const total = evidenceRequirements.length;
    const completed = evidenceRequirements.filter(e => e.status === 'completed' || e.status === 'uploaded').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const requiredTotal = groupedEvidence.required.length;
    const requiredCompleted = groupedEvidence.required.filter(e => e.status === 'completed' || e.status === 'uploaded').length;
    
    return { total, completed, percentage, requiredTotal, requiredCompleted };
  }, [evidenceRequirements, groupedEvidence]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'uploaded':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'missing':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'uploaded':
        return <Badge variant="default" className="bg-green-600 text-xs">Uploaded</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="text-xs">In Progress</Badge>;
      case 'missing':
        return <Badge variant="destructive" className="text-xs">Missing</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'required':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'recommended':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const renderEvidenceGroup = (title, items, priority, icon) => {
    if (items.length === 0) return null;

    const groupCompleted = items.filter(e => e.status === 'completed' || e.status === 'uploaded').length;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            {icon}
            {title}
            <span className="text-muted-foreground">({groupCompleted}/{items.length})</span>
          </h3>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className={`flex items-start gap-3 p-3 border rounded-lg transition-colors
                ${(item.status === 'completed' || item.status === 'uploaded') ? 'bg-green-50/50 border-green-200' : 'hover:bg-muted/30'}
                ${item.status === 'missing' ? 'border-red-200 bg-red-50/30' : ''}`}
            >
              <div className="pt-1">
                <Checkbox
                  checked={item.status === 'completed' || item.status === 'uploaded'}
                  onCheckedChange={(checked) => 
                    onEvidenceStatusChange?.(item.id || index, checked ? 'completed' : 'pending')
                  }
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {getStatusIcon(item.status)}
                  <span className={`font-medium ${(item.status === 'completed' || item.status === 'uploaded') ? 'line-through text-muted-foreground' : ''}`}>
                    {item.type || item.name}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                )}

                {item.vaRegulationRef && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Shield className="h-3 w-3" />
                    <span>VA Regulation: {item.vaRegulationRef}</span>
                  </div>
                )}

                {item.notes && (
                  <p className="text-xs text-muted-foreground italic">{item.notes}</p>
                )}

                {item.uploadedFile && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded w-fit">
                    <FileCheck className="h-3 w-3" />
                    <span>{item.uploadedFile}</span>
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <Button
                  size="sm"
                  variant={item.status === 'completed' || item.status === 'uploaded' ? 'outline' : 'default'}
                  onClick={() => onUploadEvidence?.(item.id || index, item)}
                  className="h-8"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {item.status === 'completed' || item.status === 'uploaded' ? 'Replace' : 'Upload'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Evidence Checklist
            </CardTitle>
            <CardDescription>
              Required documentation to strengthen your appeal
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {completionStats.completed}/{completionStats.total} Complete
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{completionStats.percentage}%</span>
          </div>
          <Progress value={completionStats.percentage} className="h-3" />
          {completionStats.requiredTotal > 0 && (
            <p className="text-xs text-muted-foreground">
              {completionStats.requiredCompleted} of {completionStats.requiredTotal} required items completed
            </p>
          )}
        </div>

        {renderEvidenceGroup(
          'Required Evidence',
          groupedEvidence.required,
          'required',
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}

        {renderEvidenceGroup(
          'Recommended Evidence',
          groupedEvidence.recommended,
          'recommended',
          <Star className="h-4 w-4 text-yellow-500" />
        )}

        {renderEvidenceGroup(
          'Optional Evidence',
          groupedEvidence.optional,
          'optional',
          <File className="h-4 w-4 text-gray-400" />
        )}

        {evidenceRequirements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No evidence requirements defined</p>
            <p className="text-xs mt-1">Upload a denial letter to generate requirements</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvidenceTaskList;
