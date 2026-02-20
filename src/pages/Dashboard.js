import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimsAPI } from '../lib/api';
import api from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { useDemoMode } from '../context/DemoModeContext';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import GuidedTour from '../components/GuidedTour';
import VeteranLayout from '../components/VeteranLayout';
import VAHealthRecordsImport from '../components/VAHealthRecordsImport';
import NextStepCard from '../components/NextStepCard';
import HealthRecordsSync from '../components/HealthRecordsSync';
import BackPayAggregationCard from '../components/BackPayAggregationCard';
import ClaimForecastCard from '../components/ClaimForecastCard';
import BackPayEstimationCard from '../components/BackPayEstimationCard';
import VAStatusSyncCard from '../components/VAStatusSyncCard';
import MeetingScheduler from '../components/MeetingScheduler';
import MedicationAnalysisCard from '../components/MedicationAnalysisCard';
import SurveyModal from '../components/SurveyModal';
import SurveyBanner from '../components/SurveyBanner';
import PriorityProcessingCard from '../components/PriorityProcessingCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Clock, 
  Target,
  Shield,
  Users,
  FileSearch,
  Folder,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Tag,
  Zap,
  Heart,
  BookOpen,
  Download,
  Gavel,
  Library,
  ClipboardCheck,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advocate, setAdvocate] = useState(null);
  const [conditionProgress, setConditionProgress] = useState({ conditions: [], summary: null });
  const [journeyStage, setJourneyStage] = useState(null);
  const [showHealthImport, setShowHealthImport] = useState(false);
  const [showHealthRecordsSync, setShowHealthRecordsSync] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [medicationOpportunities, setMedicationOpportunities] = useState([]);
  const [onboardingProgress, setOnboardingProgress] = useState(null);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [pendingSurveys, setPendingSurveys] = useState([]);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyBannerDismissed, setSurveyBannerDismissed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [queuePosition, setQueuePosition] = useState(null);
  const { user } = useAuth();
  const { isDemoMode, appendDemoParam, demoProfile } = useDemoMode();
  const navigate = useNavigate();
  
  const { connected: realtimeConnected, registerHandler } = useRealtimeUpdates();

  const handleClaimUpdate = useCallback((data) => {
    if (data.claim_id && claims.length > 0) {
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === data.claim_id 
            ? { ...claim, status: data.status || claim.status, ...data.updates }
            : claim
        )
      );
      setDataRefreshKey(prev => prev + 1);
      toast.success('Claim status updated', {
        description: data.message || `Your claim status has changed to ${data.status}`
      });
    }
  }, [claims]);

  const handleNotificationUpdate = useCallback((data) => {
    setUnreadNotifications(prev => prev + 1);
    if (data.title) {
      toast.info(data.title, {
        description: data.message || 'You have a new notification'
      });
    }
  }, []);

  const handleQueueUpdate = useCallback((data) => {
    if (data.position !== undefined) {
      setQueuePosition(data.position);
      if (data.position <= 3) {
        toast.info('Queue Update', {
          description: `Your claim is now #${data.position} in the review queue`
        });
      }
    }
  }, []);

  useEffect(() => {
    if (registerHandler) {
      const unsubClaim = registerHandler('claim_update', handleClaimUpdate);
      const unsubNotification = registerHandler('notification', handleNotificationUpdate);
      const unsubQueue = registerHandler('queue_update', handleQueueUpdate);
      
      return () => {
        if (unsubClaim) unsubClaim();
        if (unsubNotification) unsubNotification();
        if (unsubQueue) unsubQueue();
      };
    }
  }, [registerHandler, handleClaimUpdate, handleNotificationUpdate, handleQueueUpdate]);

  useEffect(() => {
    checkOnboardingAndLoadData();
  }, []);

  const checkOnboardingAndLoadData = async () => {
    // Check localStorage first to prevent redirect loops
    const locallyCompleted = localStorage.getItem('onboarding_completed') === 'true';
    if (!locallyCompleted) {
      try {
        const onboardingStatusRes = await api.get('/users/onboarding-status').catch(() => ({ data: { completed: true } }));
        if (!onboardingStatusRes.data.completed) {
          navigate('/onboarding', { replace: true });
          return;
        }
      } catch (err) {
        // On error, continue to dashboard
      }
    }
    loadDashboardData();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const demoSuffix = isDemoMode ? '?demo=true' : '';
      const [claimsRes, advocateRes, conditionRes, journeyRes, meetingsRes, medicationRes, onboardingRes, surveysRes] = await Promise.all([
        claimsAPI.list(),
        api.get(appendDemoParam('/advocates/my-advocate')).catch(() => ({ data: { has_advocate: false } })),
        api.get(appendDemoParam('/conditions/dashboard/summary')).catch(() => ({ data: { success: false } })),
        api.get(appendDemoParam('/lifecycle/veteran/journey')).catch(() => ({ data: { success: false } })),
        api.get(appendDemoParam('/meetings/upcoming')).catch(() => ({ data: { meetings: [] } })),
        api.get(appendDemoParam('/claims-intelligence/medication-opportunities')).catch(() => ({ data: { opportunities: [] } })),
        api.get(appendDemoParam('/onboarding-checklist')).catch(() => ({ data: { success: false, checklist: null } })),
        api.get(appendDemoParam('/surveys/pending')).catch(() => ({ data: { surveys: [], count: 0 } }))
      ]);
      
      setClaims(claimsRes.data.claims || []);
      if (advocateRes.data.has_advocate) {
        setAdvocate(advocateRes.data.advocate);
      }
      if (conditionRes.data.success && conditionRes.data.summary) {
        setConditionProgress({
          conditions: conditionRes.data.summary.conditions || [],
          summary: conditionRes.data.summary
        });
      }
      if (journeyRes.data.success) {
        setJourneyStage(journeyRes.data.journey);
      }
      setUpcomingMeetings(meetingsRes.data.meetings || meetingsRes.data.upcoming_meetings || []);
      setMedicationOpportunities(medicationRes.data.opportunities || medicationRes.data.secondary_condition_opportunities || []);
      if (onboardingRes.data.success && onboardingRes.data.checklist) {
        setOnboardingProgress(onboardingRes.data.checklist);
      }
      setPendingSurveys(surveysRes.data.surveys || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      toast.error('Failed to load some dashboard data');
    } finally {
      setLoading(false);
      setDataRefreshKey(prev => prev + 1);
    }
  };

  const getClaimProgress = () => {
    if (!claims.length) return 0;
    
    const statusToProgress = {
      'draft': 0,
      'documents_uploaded': 17,
      'in_review': 33,
      'analysis_complete': 33,
      'conditions_selected': 50,
      'qa_pending': 67,
      'qa_complete': 83,
      'ready_to_submit': 83,
      'submitted': 100,
      'approved': 100,
      'denied': 100
    };
    
    const status = claims[0]?.status;
    return statusToProgress[status] ?? 0;
  };

  const getCurrentMission = () => {
    if (!claims.length) {
      return {
        title: 'Start Your Claim',
        description: 'Upload your military and medical documents to begin. Our AI will identify all conditions you may be eligible to claim.',
        action: 'Upload Documents',
        actionPath: '/document-onboarding',
        icon: Upload,
        color: 'bg-[#1B3A5F]'
      };
    }
    
    const claim = claims[0];
    const conditionCount = conditionProgress.conditions?.length || 0;
    
    if (claim.status === 'draft' || !claim.documents_count) {
      return {
        title: 'Upload Your Documents',
        description: 'Upload your DD-214, medical records, and any supporting evidence. The more documents you provide, the better our AI can identify your conditions.',
        action: 'Continue Upload',
        actionPath: '/document-onboarding',
        icon: Upload,
        color: 'bg-[#1B3A5F]'
      };
    }
    
    if (conditionCount === 0) {
      return {
        title: 'Review AI Analysis',
        description: 'Your documents have been analyzed. Review the conditions our AI identified and select which ones to include in your claim.',
        action: 'Review Conditions',
        actionPath: '/claim-review',
        icon: FileSearch,
        color: 'bg-[#2C5282]'
      };
    }
    
    const incompleteConditions = conditionProgress.conditions?.filter(c => c.completion_percentage < 100) || [];
    if (incompleteConditions.length > 0) {
      return {
        title: 'Complete Evidence Requirements',
        description: `${incompleteConditions.length} condition${incompleteConditions.length > 1 ? 's' : ''} need${incompleteConditions.length === 1 ? 's' : ''} additional evidence. Click each condition to see exactly what's required for VA approval.`,
        action: 'View Condition Roadmaps',
        actionPath: '/claim-review',
        icon: Target,
        color: 'bg-amber-600'
      };
    }
    
    return {
      title: 'Ready for Submission',
      description: 'All conditions have complete evidence. Review your claim package one final time before submitting to the VA.',
      action: 'Review & Submit',
      actionPath: '/claim-review',
      icon: CheckCircle2,
      color: 'bg-green-600'
    };
  };

  const mission = getCurrentMission();
  const MissionIcon = mission.icon;

  if (loading) {
    return (
      <VeteranLayout>
        <div className="min-h-full bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-[#1B3A5F] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg text-slate-600">Loading your dashboard...</p>
          </div>
        </div>
      </VeteranLayout>
    );
  }

  return (
    <VeteranLayout>
      <div className="min-h-full bg-white">
        {user?.role === 'veteran' && (
        <GuidedTour tourName="dashboard" onComplete={() => {}} />
      )}
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-24">
        
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#1B3A5F] to-[#2C5282] rounded-xl flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5 md:w-6 md:h-6 text-white rotate-90" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Welcome back, {user?.first_name || user?.email?.split('@')[0] || 'Veteran'}
                </h1>
                <p className="text-sm md:text-base text-slate-600">Your path to the benefits you've earned</p>
              </div>
            </div>
            
            {user?.representation_mode && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 border border-slate-200">
                <Users className="w-4 h-4 text-[#1B3A5F]" />
                <span className="text-sm font-medium text-slate-700">
                  {user.representation_mode === 'earnedit_agent' && 'EarnedIT Claims Assistance'}
                  {user.representation_mode === 'vso_partner' && 'VSO Representation'}
                  {user.representation_mode === 'accredited_agent' && 'Accredited Claims Agent'}
                  {user.representation_mode === 'self_managed' && 'Self-Managed (DIY)'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-[#1B3A5F] hover:text-[#2C5282]"
                  onClick={() => navigate('/settings')}
                >
                  Change
                </Button>
              </div>
            )}
          </div>
        </div>

        {pendingSurveys.length > 0 && !surveyBannerDismissed && (
          <SurveyBanner
            survey={pendingSurveys[0]}
            onOpenSurvey={() => setShowSurveyModal(true)}
            onDismiss={() => setSurveyBannerDismissed(true)}
          />
        )}

        <NextStepCard
          claim={claims[0] || null}
          className="mb-6 md:mb-8"
        />

        <div className={`${mission.color} rounded-2xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <MissionIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="text-xs sm:text-sm font-medium text-white/70 mb-1">YOUR NEXT MISSION</div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">{mission.title}</h2>
                <p className="text-sm sm:text-base text-white/90 mb-4 sm:mb-6 max-w-2xl">{mission.description}</p>
                <Button 
                  size="lg"
                  className="bg-white text-[#1B3A5F] hover:bg-slate-100 font-semibold w-full sm:w-auto"
                  onClick={() => navigate(mission.actionPath)}
                >
                  {mission.action}
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {claims.length > 0 && (
          <Card className="mb-8 border-2 border-slate-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-[#1B3A5F]" />
                  <span className="font-semibold text-slate-900">Claim Progress</span>
                </div>
                <span className="text-sm text-slate-600">{getClaimProgress()}% Complete</span>
              </div>
              <Progress value={getClaimProgress()} className="h-3 mb-4" />
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-2">
                {[
                  { label: 'Documents', icon: Upload, done: claims[0]?.documents_count > 0 },
                  { label: 'AI Analysis', icon: Sparkles, done: conditionProgress.conditions?.length > 0 },
                  { label: 'Conditions', icon: Target, done: conditionProgress.summary?.selected_count > 0 },
                  { label: 'Evidence', icon: FileText, done: conditionProgress.summary?.avg_completion >= 80 },
                  { label: 'QA Review', icon: Shield, done: claims[0]?.status === 'qa_complete' },
                  { label: 'Submit', icon: CheckCircle2, done: claims[0]?.status === 'submitted' },
                ].map((step, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`w-10 h-10 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center mb-1 ${
                      step.done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <step.icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className={`text-xs ${step.done ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {claims.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <BackPayEstimationCard 
              claimId={claims[0]?.id}
              veteranId={user?.id}
            />
            <ClaimForecastCard 
              claim={claims[0]} 
              conditions={conditionProgress.conditions || []}
              refreshKey={dataRefreshKey}
            />
          </div>
        )}

        {claims.length > 0 && (
          <div className="mb-8">
            <BackPayAggregationCard
              veteranId={user?.id}
              refreshKey={dataRefreshKey}
            />
          </div>
        )}

        {claims.length > 0 && (
          <div className="mb-8">
            <VAStatusSyncCard claimId={claims[0]?.id} />
          </div>
        )}

        {claims.length > 0 && (
          <div className="mb-8">
            <PriorityProcessingCard 
              claimId={claims[0]?.id} 
              veteranId={user?.id}
              showRequestButton={true}
            />
          </div>
        )}

        {medicationOpportunities.length > 0 && (
          <div className="mb-8">
            <MedicationAnalysisCard 
              medicationOpportunities={medicationOpportunities}
              onAddCondition={(conditionName) => {
                navigate('/claim-review', { state: { addCondition: conditionName } });
              }}
            />
          </div>
        )}

        {conditionProgress.conditions?.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#1B3A5F]" />
                Your Conditions
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigate('/claim-review')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conditionProgress.conditions.slice(0, 6).map((condition, idx) => (
                <Card 
                  key={idx} 
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-[#1B3A5F]/30"
                  onClick={() => navigate('/claim-review')}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">
                        {condition.condition_name}
                      </h4>
                      {condition.is_presumptive && (
                        <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0 ml-2">
                          Presumptive
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Evidence Ready</span>
                        <span className={`font-medium ${
                          condition.completion_percentage >= 80 ? 'text-green-600' :
                          condition.completion_percentage >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {condition.completion_percentage || 0}%
                        </span>
                      </div>
                      <Progress value={condition.completion_percentage || 0} className="h-2" />
                      
                      {condition.completion_percentage < 100 && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{condition.missing_requirements || 'Evidence needed'}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Onboarding Progress Card - shows if user hasn't completed onboarding */}
        {(!user?.onboarding_completed && !onboardingProgress?.completed) && (
          <Card className="mb-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Complete Your Onboarding</h3>
                    <p className="text-sm text-slate-600">
                      {onboardingProgress 
                        ? `${onboardingProgress.completed_items || 0} of ${onboardingProgress.total_items || 5} steps completed`
                        : 'Tell us about yourself to personalize your experience'}
                    </p>
                  </div>
                </div>
                <Button 
                  className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
                  onClick={() => navigate('/onboarding')}
                >
                  Continue Onboarding
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              {onboardingProgress && onboardingProgress.total_items > 0 && (
                <div className="mt-4">
                  <Progress 
                    value={(onboardingProgress.completed_items / onboardingProgress.total_items) * 100} 
                    className="h-2" 
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-[#1B3A5F]/30 focus-visible:ring-2 focus-visible:ring-[#1B3A5F] focus-visible:ring-offset-2" 
            onClick={() => navigate('/forms-library')}
            role="button"
            aria-label="VA Forms Library - DBQs, 21-526EZ, templates and guides"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/forms-library');
              }
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E8F4FD] rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-[#1B3A5F]" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">VA Forms Library</h3>
                  <p className="text-sm text-slate-600">DBQs, 21-526EZ, templates & guides</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-[#1B3A5F]/30 focus-visible:ring-2 focus-visible:ring-[#1B3A5F] focus-visible:ring-offset-2" 
            onClick={() => navigate('/advocates')}
            role="button"
            aria-label={advocate ? `Your Advocate - ${advocate.first_name} ${advocate.last_name}` : 'Get Support - Connect with a peer mentor'}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/advocates');
              }
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {advocate ? 'Your Advocate' : 'Get Support'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {advocate ? `${advocate.first_name} ${advocate.last_name}` : 'Connect with a peer mentor'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-[#1B3A5F]/30 focus-visible:ring-2 focus-visible:ring-[#1B3A5F] focus-visible:ring-offset-2" 
            onClick={() => navigate('/services')}
            role="button"
            aria-label="Support Services - Housing, employment, healthcare"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/services');
              }
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FCE7F3] rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">Support Services</h3>
                  <p className="text-sm text-slate-600">Housing, employment, healthcare</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-red-300 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" 
            onClick={() => navigate(claims[0]?.id ? `/appeal-wizard/${claims[0].id}` : '/appeal-wizard')}
            role="button"
            aria-label="Appeal a Decision - Challenge a denied claim with our guided wizard"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(claims[0]?.id ? `/appeal-wizard/${claims[0].id}` : '/appeal-wizard');
              }
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Gavel className="w-6 h-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">Appeal a Decision</h3>
                  <p className="text-sm text-slate-600">Challenge a denied claim</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2" 
            onClick={() => setShowHealthImport(true)}
            role="button"
            aria-label="Import VA Health Records from MyHealtheVet"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowHealthImport(true);
              }
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">Import VA Health Records</h3>
                    <Badge className="bg-green-100 text-green-700 text-xs hidden sm:inline-flex">MyHealtheVet</Badge>
                  </div>
                  <p className="text-sm text-slate-600">Import from VA directly</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2" 
            onClick={() => navigate('/evidence-library')}
            role="button"
            aria-label="Evidence Library - Manage and link documents to conditions"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/evidence-library');
              }
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Library className="w-6 h-6 text-purple-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">Evidence Library</h3>
                  <p className="text-sm text-slate-600">Manage & link documents</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          {/* SSDI Benefits Card */}
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" 
            onClick={() => navigate('/ssdi')}
            role="button"
            aria-label="SSDI Benefits - Apply for Social Security Disability"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/ssdi');
              }
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">SSDI Benefits</h3>
                  <p className="text-sm text-slate-600">Additional monthly income</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          {advocate && (
            <Card 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-[#D4A574]/50 focus-visible:ring-2 focus-visible:ring-[#D4A574] focus-visible:ring-offset-2" 
              onClick={() => setShowMeetingScheduler(true)}
              role="button"
              aria-label="Schedule a meeting with your advocate"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowMeetingScheduler(true);
                }
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#D4A574]/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#D4A574]" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">Schedule Meeting</h3>
                    <p className="text-sm text-slate-600">
                      {upcomingMeetings.length > 0 
                        ? `${upcomingMeetings.length} upcoming`
                        : `Meet with ${advocate.first_name}`}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {showHealthImport && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="health-import-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowHealthImport(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowHealthImport(false);
              }
            }}
          >
            <div 
              className="max-w-lg w-full"
              role="document"
            >
              <VAHealthRecordsImport
                claimId={claims[0]?.id}
                onImportComplete={(records) => {
                  loadDashboardData();
                  toast.success(`Imported ${Object.values(records).flat().length} health records`);
                }}
                onClose={() => setShowHealthImport(false)}
              />
            </div>
          </div>
        )}

        {showHealthRecordsSync && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowHealthRecordsSync(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowHealthRecordsSync(false);
              }
            }}
          >
            <div className="max-w-lg w-full">
              <HealthRecordsSync
                veteranIcn={user?.icn}
                claimId={claims[0]?.id}
                onRecordsImported={(records) => {
                  loadDashboardData();
                  setShowHealthRecordsSync(false);
                }}
              />
            </div>
          </div>
        )}

        {showMeetingScheduler && advocate && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="meeting-scheduler-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMeetingScheduler(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowMeetingScheduler(false);
              }
            }}
          >
            <MeetingScheduler
              advocateId={advocate.id || advocate.advocate_id}
              advocateName={`${advocate.first_name} ${advocate.last_name}`}
              onScheduled={(meeting) => {
                setUpcomingMeetings(prev => [meeting, ...prev]);
                toast.success('Meeting scheduled!');
              }}
              onClose={() => setShowMeetingScheduler(false)}
            />
          </div>
        )}

        {!claims.length && (
          <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-100">
            <CardContent className="pt-8 pb-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="flex justify-center gap-3 mb-6">
                  <div className="w-16 h-16 bg-[#E8F4FD] rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#1B3A5F]" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Let AI Build Your Claim
                </h2>
                <p className="text-slate-600 mb-6">
                  Upload your DD-214 and medical records. Our AI will analyze everything, identify 
                  all conditions you may be eligible for, and show you exactly what evidence you need 
                  for VA approval.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                  {[
                    { icon: Upload, title: 'Upload Documents', desc: 'DD-214, medical records, service records' },
                    { icon: Sparkles, title: 'AI Analysis', desc: 'Identifies conditions & required evidence' },
                    { icon: Target, title: 'Roadmap', desc: 'Step-by-step path to approval' },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-100">
                      <div className="w-10 h-10 bg-[#1B3A5F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-5 h-5 text-[#1B3A5F]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{step.title}</h4>
                        <p className="text-xs text-slate-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  size="lg"
                  className="bg-[#1B3A5F] hover:bg-[#0F2A4A] text-white px-8"
                  onClick={() => navigate('/document-onboarding')}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Start Your Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {claims.length > 0 && (
          <Card className="border-2 border-slate-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1B3A5F]" />
                  Your Claims
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/document-onboarding')}
                >
                  New Claim
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {claims.map((claim) => (
                  <div
                    key={claim.claim_id || claim.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#1B3A5F]/30 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/claim/${claim.claim_id || claim.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#E8F4FD] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#1B3A5F]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {claim.claim_number || `Claim #${(claim.claim_id || claim.id)?.slice(-8)}`}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {claim.conditions_count || 0} conditions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`
                        ${claim.status === 'submitted' ? 'bg-green-100 text-green-700' :
                          claim.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                          'bg-blue-100 text-blue-700'}
                      `}>
                        {claim.status?.replace('_', ' ')}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <SurveyModal
          isOpen={showSurveyModal}
          onClose={() => setShowSurveyModal(false)}
          survey={pendingSurveys[0]}
          onComplete={() => {
            setPendingSurveys(prev => prev.slice(1));
            setSurveyBannerDismissed(false);
          }}
        />
      </div>
      </div>
    </VeteranLayout>
  );
}
