import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
  FileText,
  ChevronRight
} from 'lucide-react';

const AppealRoadmap = ({ roadmap, onStepClick }) => {
  if (!roadmap) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No roadmap data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { steps = [], recommendedPath, deadline, totalEstimatedDays } = roadmap;

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'in_progress':
        return (
          <div className="relative">
            <Circle className="h-6 w-6 text-blue-600 fill-blue-100" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
            </div>
          </div>
        );
      default:
        return <Circle className="h-6 w-6 text-gray-300" />;
    }
  };

  const getStepStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const isDeadlineApproaching = () => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 30 && daysUntilDeadline > 0;
  };

  const isDeadlinePast = () => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getDaysUntilDeadline = () => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Appeal Roadmap
            </CardTitle>
            <CardDescription>
              Step-by-step guide to remediate your denied claims
            </CardDescription>
          </div>
          {totalEstimatedDays && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{totalEstimatedDays} days total
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {(isDeadlineApproaching() || isDeadlinePast()) && (
          <Alert variant={isDeadlinePast() ? "destructive" : "default"} 
                 className={isDeadlinePast() ? "" : "border-yellow-500 bg-yellow-50"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isDeadlinePast() ? (
                <span className="font-medium">
                  Deadline has passed! The appeal deadline was {new Date(deadline).toLocaleDateString()}.
                  Contact a VA representative immediately.
                </span>
              ) : (
                <span>
                  <span className="font-medium">Deadline approaching!</span> You have {getDaysUntilDeadline()} days 
                  until {new Date(deadline).toLocaleDateString()} to submit your appeal.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {recommendedPath && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-blue-800">
              <ArrowRight className="h-4 w-4" />
              Recommended Appeal Path
            </h4>
            <p className="text-sm text-blue-700">{recommendedPath.name}</p>
            {recommendedPath.description && (
              <p className="text-xs text-blue-600 mt-1">{recommendedPath.description}</p>
            )}
            {recommendedPath.successRate && (
              <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700">
                {Math.round(recommendedPath.successRate * 100)}% success rate
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span className="font-medium">{completedSteps} of {steps.length} steps</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {steps.map((step, index) => (
            <div key={step.id || index}>
              <div
                className={`flex items-start gap-4 p-4 rounded-lg transition-colors cursor-pointer hover:bg-muted/50
                  ${step.status === 'in_progress' ? 'bg-blue-50 border border-blue-200' : ''}
                  ${step.status === 'completed' ? 'bg-green-50/50' : ''}`}
                onClick={() => onStepClick?.(step.id || index, step)}
              >
                <div className="flex flex-col items-center">
                  {getStepIcon(step.status)}
                  {index < steps.length - 1 && (
                    <div className={`w-0.5 h-full min-h-[40px] mt-2 
                      ${step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'}`} 
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                      {getStepStatusBadge(step.status)}
                    </div>
                    {step.estimatedDays && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.estimatedDays} days
                      </span>
                    )}
                  </div>

                  <h4 className="font-medium mb-1">{step.title}</h4>
                  
                  {step.description && (
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  )}

                  {step.evidenceNeeded && step.evidenceNeeded.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Evidence Needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {step.evidenceNeeded.map((evidence, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {evidence}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.dueDate && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {new Date(step.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>

        {steps.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No steps defined in the roadmap yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppealRoadmap;
