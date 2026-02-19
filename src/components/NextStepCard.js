import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowRight, 
  Upload, 
  FileCheck, 
  ClipboardCheck, 
  Users, 
  Send, 
  CheckCircle,
  Sparkles,
  AlertCircle,
  Clock,
  Target
} from 'lucide-react';
import api from '../lib/api';

const getStageConfig = (stage, claimId) => {
  const stages = {
    intake: {
      title: "Let's Get Started",
      description: "Upload your military and medical documents to begin your claim",
      icon: Upload,
      action: "Start Document Upload",
      route: "/document-onboarding",
      color: "from-[hsl(var(--primary))] to-[hsl(var(--primary))]/90",
      bgColor: "bg-white",
      borderColor: "border-neutral-200"
    },
    documents: {
      title: "Upload Your Documents",
      description: "Add your DD-214, medical records, and supporting evidence",
      icon: Upload,
      action: "Continue Uploading",
      route: claimId ? `/document-onboarding?claim=${claimId}` : "/document-onboarding",
      color: "from-[hsl(var(--primary))] to-[hsl(var(--primary))]/90",
      bgColor: "bg-white",
      borderColor: "border-neutral-200"
    },
    analysis: {
      title: "Review AI Findings",
      description: "We found conditions in your documents. Review and confirm them.",
      icon: Sparkles,
      action: "Review Conditions",
      route: claimId ? `/claim/${claimId}` : "/claim-review",
      color: "from-purple-600 to-purple-700",
      bgColor: "bg-white",
      borderColor: "border-neutral-200"
    },
    in_review: {
      title: "Review Your Claim",
      description: "Check your identified conditions and evidence strength",
      icon: FileCheck,
      action: "Review Claim",
      route: claimId ? `/claim/${claimId}` : "/claim-review",
      color: "from-purple-600 to-purple-700",
      bgColor: "bg-white",
      borderColor: "border-neutral-200"
    },
    qa_check: {
      title: "Quality Check in Progress",
      description: "Our team is reviewing your claim for completeness",
      icon: ClipboardCheck,
      action: "View QA Status",
      route: claimId ? `/claim/${claimId}` : "/claim-review",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-white",
      borderColor: "border-neutral-200"
    },
    peer_support: {
      title: "Connect with Your Advocate",
      description: "Your veteran advocate can help answer questions before submission",
      icon: Users,
      action: "Message Advocate",
      route: "/messages",
      color: "from-green-600 to-green-700",
      bgColor: "bg-white",
      borderColor: "border-neutral-200"
    },
    submission: {
      title: "Ready to Submit!",
      description: "Your claim is complete and ready to send to the VA",
      icon: Send,
      action: "Submit Claim",
      route: claimId ? `/claim/${claimId}` : "/claim-review",
      color: "from-[#A32638] to-[#8B1E2E]",
      bgColor: "bg-white",
      borderColor: "border-neutral-200"
    },
    submitted: {
      title: "Claim Submitted",
      description: "Your claim is with the VA. Track its status here.",
      icon: CheckCircle,
      action: "Track Status",
      route: claimId ? `/claim/${claimId}/status` : "/appeals",
      color: "from-green-600 to-green-700",
      bgColor: "bg-white",
      borderColor: "border-neutral-200"
    }
  };
  
  return stages[stage] || stages.intake;
};

export default function NextStepCard({ claim, className = '' }) {
  const navigate = useNavigate();
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJourneyStatus();
  }, [claim]);

  const loadJourneyStatus = async () => {
    try {
      const response = await api.get('/lifecycle/veteran/journey');
      if (response.data.success && response.data.claims?.length > 0) {
        const claimJourney = response.data.claims[0];
        setJourneyData(claimJourney);
      }
    } catch (err) {
      console.error('Failed to load journey status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getClaimId = () => {
    return claim?.claim_id || claim?.id || journeyData?.claim_id;
  };

  const determineStage = () => {
    if (!claim && !journeyData) return 'intake';
    
    const claimData = claim || journeyData;
    const status = claimData?.status;
    const stage = claimData?.stage || journeyData?.stage;
    
    if (status === 'submitted' || status === 'approved') return 'submitted';
    if (status === 'qa_pending') return 'qa_check';
    if (stage) return stage;
    if (status === 'in_review') return 'in_review';
    if (status === 'draft') return 'documents';
    
    return 'intake';
  };

  const claimId = getClaimId();
  const currentStage = determineStage();
  const stageConfig = getStageConfig(currentStage, claimId);
  const Icon = stageConfig.icon;

  if (loading) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardContent className="p-6">
          <div className="h-24 bg-white border border-slate-200 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const progress = journeyData?.progress || 0;
  const blockers = journeyData?.blockers || [];

  return (
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <div className={`bg-gradient-to-r ${stageConfig.color} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm opacity-90">Your Next Step</p>
              <h3 className="text-xl font-bold">{stageConfig.title}</h3>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            {progress}% Complete
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 bg-white">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-3 rounded-full bg-gradient-to-br ${stageConfig.color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <p className="text-slate-700 mb-4">{stageConfig.description}</p>
            
            {blockers.length > 0 && (
              <div className="mb-4 p-3 bg-white border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Action Needed:</p>
                    <p className="text-sm text-amber-700">{blockers[0]?.message}</p>
                  </div>
                </div>
              </div>
            )}
            
            {journeyData?.next_step && !blockers.length && (
              <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">{journeyData.next_step}</p>
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => navigate(stageConfig.route)}
              className={`bg-gradient-to-r ${stageConfig.color} hover:opacity-90 text-white`}
            >
              {stageConfig.action}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
            <span>Overall Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${stageConfig.color} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            <span>Documents</span>
            <span>Analysis</span>
            <span>Review</span>
            <span>Submit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActionCards({ claims, advocate }) {
  const navigate = useNavigate();
  
  const hasActiveClaim = claims?.length > 0;
  const hasAdvocate = !!advocate;
  
  const actions = [];
  
  if (!hasActiveClaim) {
    actions.push({
      title: "Start Your Claim",
      description: "Upload documents to begin",
      icon: Upload,
      route: "/document-onboarding",
      color: "bg-[hsl(var(--primary))]",
      priority: 1
    });
  }
  
  if (hasActiveClaim && !hasAdvocate) {
    actions.push({
      title: "Find an Advocate",
      description: "Get veteran advocate support",
      icon: Users,
      route: "/advocates",
      color: "bg-green-500",
      priority: 2
    });
  }
  
  if (hasActiveClaim) {
    actions.push({
      title: "Review Claim",
      description: "Check your progress",
      icon: FileCheck,
      route: "/claim-review",
      color: "bg-purple-500",
      priority: 3
    });
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.slice(0, 3).map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={() => navigate(action.route)}
            className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all text-left group"
          >
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {action.title}
            </h4>
            <p className="text-sm text-slate-500">{action.description}</p>
          </button>
        );
      })}
    </div>
  );
}
