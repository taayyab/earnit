import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  FileX, 
  Check, 
  X, 
  AlertTriangle,
  Calendar,
  FileText,
  Shield
} from 'lucide-react';

const DenialSummaryCard = ({ analysisData, onVerifyIssue }) => {
  if (!analysisData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <FileX className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No denial analysis data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { decisionDate, deniedConditions = [], summary } = analysisData;

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  const getDeficiencyBadgeVariant = (deficiencyType) => {
    switch (deficiencyType?.toLowerCase()) {
      case 'evidence':
        return 'destructive';
      case 'nexus':
        return 'secondary';
      case 'service_connection':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDeficiencyType = (type) => {
    if (!type) return 'Unknown';
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileX className="h-5 w-5 text-red-600" />
              Denial Analysis Summary
            </CardTitle>
            <CardDescription>
              Extracted information from your VA denial letter
            </CardDescription>
          </div>
          {decisionDate && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(decisionDate).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {summary && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summary
            </h4>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Denied Conditions ({deniedConditions.length})
            </h3>
          </div>

          {deniedConditions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>No denied conditions found in the analysis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deniedConditions.map((condition, index) => (
                <div
                  key={condition.id || index}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-medium">{condition.name}</span>
                        {condition.diagnosticCode && (
                          <Badge variant="outline" className="text-xs">
                            Code: {condition.diagnosticCode}
                          </Badge>
                        )}
                        {condition.deficiencyType && (
                          <Badge 
                            variant={getDeficiencyBadgeVariant(condition.deficiencyType)}
                            className="text-xs"
                          >
                            {formatDeficiencyType(condition.deficiencyType)}
                          </Badge>
                        )}
                      </div>
                      
                      {condition.denialReason && (
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Reason: </span>
                            {condition.denialReason}
                          </p>
                        </div>
                      )}

                      {condition.confidenceScore !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(condition.confidenceScore)}`} />
                            <span className="text-xs text-muted-foreground">
                              {getConfidenceLabel(condition.confidenceScore)} confidence ({Math.round(condition.confidenceScore * 100)}%)
                            </span>
                          </div>
                          <Progress 
                            value={condition.confidenceScore * 100} 
                            className="w-20 h-2"
                          />
                        </div>
                      )}

                      {condition.vaRegulationRef && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span>Ref: {condition.vaRegulationRef}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                        onClick={() => onVerifyIssue?.(condition.id || index, true)}
                        title="Verify this issue"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={() => onVerifyIssue?.(condition.id || index, false)}
                        title="Reject this issue"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {condition.status && (
                    <div className="mt-2 pt-2 border-t">
                      <Badge 
                        variant={condition.status === 'verified' ? 'default' : 
                                condition.status === 'rejected' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {condition.status === 'verified' && <Check className="h-3 w-3 mr-1" />}
                        {condition.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                        {condition.status === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {condition.status.charAt(0).toUpperCase() + condition.status.slice(1)}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DenialSummaryCard;
