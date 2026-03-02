import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ClipboardList,
  Upload,
  FileCheck,
  Users,
  Heart,
  Send,
  Sparkles
} from 'lucide-react';

const JOURNEY_STAGES = [
  {
    id: 'intake',
    name: 'Tell Your Story',
    description: 'Complete the intake questionnaire about your service and conditions',
    icon: ClipboardList,
    color: 'blue'
  },
  {
    id: 'documents',
    name: 'Gather Evidence',
    description: 'Upload medical records, service records, and supporting documents',
    icon: Upload,
    color: 'green'
  },
  {
    id: 'qa_check',
    name: 'Quality Check',
    description: 'AI-powered review ensures your claim is complete and strong',
    icon: FileCheck,
    color: 'purple'
  },
  {
    id: 'mentor',
    name: 'Veteran Advocate',
    description: 'Connect with a veteran advocate who understands your journey',
    icon: Users,
    color: 'orange'
  },
  {
    id: 'wraparound',
    name: 'Holistic Support',
    description: 'Access housing, employment, mental health, and other services',
    icon: Heart,
    color: 'pink'
  },
  {
    id: 'submit',
    name: 'Submit Claim',
    description: 'Review and submit your completed claim to the VA',
    icon: Send,
    color: 'emerald'
  }
];

export default function VeteranJourneyTracker({ 
  claimId,
  claimStatus = 'draft',
  hasIntake = false,
  hasDocuments = false,
  hasQACheck = false,
  qaScore = 0,
  hasMentor = false,
  mentorName = null,
  hasWraparoundAssessment = false,
  wraparoundUrgency = null,
  isSubmitted = false
}) {
  const navigate = useNavigate();

  const getStageStatus = (stageId) => {
    switch (stageId) {
      case 'intake':
        return hasIntake ? 'complete' : 'current';
      case 'documents':
        return hasDocuments ? 'complete' : (hasIntake ? 'current' : 'locked');
      case 'qa_check':
        return hasQACheck ? 'complete' : (hasDocuments ? 'current' : 'locked');
      case 'mentor':
        return hasMentor ? 'complete' : 'available';
      case 'wraparound':
        return hasWraparoundAssessment ? 'complete' : 'available';
      case 'submit':
        return isSubmitted ? 'complete' : (hasQACheck && qaScore >= 70 ? 'current' : 'locked');
      default:
        return 'locked';
    }
  };

  const handleStageAction = (stageId) => {
    switch (stageId) {
      case 'intake':
        navigate(`/claim/${claimId}/intake`);
        break;
      case 'documents':
        navigate(`/claim/${claimId}/documents`);
        break;
      case 'qa_check':
        navigate(`/claim/${claimId}?tab=qa`);
        break;
      case 'mentor':
        navigate('/advocates');
        break;
      case 'wraparound':
        navigate('/services');
        break;
      case 'submit':
        navigate(`/form/${claimId}`);
        break;
    }
  };

  const completedStages = JOURNEY_STAGES.filter(s => getStageStatus(s.id) === 'complete').length;
  const progressPercent = Math.round((completedStages / JOURNEY_STAGES.length) * 100);

  return (
    <Card className="border-2 border-[#D4A574]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-[#D4A574]" />
              Your Claim Journey
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Follow these steps to build the strongest possible claim
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#D4A574]">{progressPercent}%</div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2 mt-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {JOURNEY_STAGES.map((stage, index) => {
            const status = getStageStatus(stage.id);
            const Icon = stage.icon;
            const isComplete = status === 'complete';
            const isCurrent = status === 'current';
            const isAvailable = status === 'available';
            const isLocked = status === 'locked';

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isComplete ? 'bg-green-50 border-green-200' :
                  isCurrent ? 'bg-blue-50 border-blue-300 shadow-sm' :
                  isAvailable ? 'bg-white border-[#D4A574]/30 hover:border-[#D4A574]' :
                  'bg-white border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    isComplete ? 'bg-green-100' :
                    isCurrent ? 'bg-blue-100' :
                    isAvailable ? 'bg-[#D4A574]/10' :
                    'bg-white'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Icon className={`h-6 w-6 ${
                        isCurrent ? 'text-blue-600' :
                        isAvailable ? 'text-[#D4A574]' :
                        'text-gray-400'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${isLocked ? 'text-gray-400' : ''}`}>
                        {stage.name}
                      </h4>
                      {isComplete && stage.id === 'qa_check' && qaScore && (
                        <Badge className="bg-green-500 text-white">{qaScore}%</Badge>
                      )}
                      {isComplete && stage.id === 'mentor' && mentorName && (
                        <Badge variant="outline">{mentorName}</Badge>
                      )}
                      {isComplete && stage.id === 'wraparound' && wraparoundUrgency && (
                        <Badge className={
                          wraparoundUrgency === 'crisis' ? 'bg-red-500 text-white' :
                          wraparoundUrgency === 'urgent' ? 'bg-orange-500 text-white' :
                          'bg-green-500 text-white'
                        }>{wraparoundUrgency}</Badge>
                      )}
                      {isCurrent && (
                        <Badge className="bg-blue-500 text-white">Next Step</Badge>
                      )}
                    </div>
                    <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-muted-foreground'}`}>
                      {stage.description}
                    </p>
                  </div>
                  
                  {(isCurrent || isAvailable) && (
                    <Button
                      size="sm"
                      onClick={() => handleStageAction(stage.id)}
                      className={
                        isCurrent 
                          ? 'bg-[#1B3A5F] hover:bg-[#2a4a6f]' 
                          : 'bg-[#D4A574] hover:bg-[#B8895E]'
                      }
                    >
                      {isCurrent ? 'Start' : 'Access'}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                  
                  {isComplete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStageAction(stage.id)}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
