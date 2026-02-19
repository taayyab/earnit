import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '../ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '../ui/tooltip';
import {
  ClipboardList,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  User,
  Shield,
  Upload,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Play,
  Info,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pending: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100', label: 'Not Started' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100', label: 'Completed' },
  skipped: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Skipped' },
};

const CATEGORY_ICONS = {
  profile: User,
  document: FileText,
  form: ClipboardList,
  claim: Shield,
  review: CheckCircle2,
};

function ChecklistItem({ item, onStatusChange, isUpdating }) {
  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const CategoryIcon = CATEGORY_ICONS[item.category] || FileText;

  const handleToggle = () => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    onStatusChange(item.id, newStatus);
  };

  return (
    <div className={`p-4 rounded-lg border transition-all ${item.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          {isUpdating ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Checkbox
              checked={item.status === 'completed'}
              onCheckedChange={handleToggle}
              className="h-5 w-5"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CategoryIcon className={`h-4 w-4 ${statusConfig.color}`} />
            <span className={`font-medium ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
              {item.title}
            </span>
            {item.required && (
              <Badge variant="outline" className="text-xs">Required</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
          {item.guidance && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{item.guidance}</span>
            </div>
          )}
        </div>
        <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0`}>
          {statusConfig.label}
        </Badge>
      </div>
    </div>
  );
}

export function ClientOnboardingPanel({ claimId, veteranName, conditions, claimType, onOnboardingCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initiating, setInitiating] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const loadOnboardingStatus = useCallback(async () => {
    if (!claimId) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/agent/onboarding/${claimId}`);
      setOnboardingData(response.data);
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    if (open && claimId) {
      loadOnboardingStatus();
    }
  }, [open, claimId, loadOnboardingStatus]);

  const handleInitiateOnboarding = async () => {
    if (!claimId || !onboardingData?.veteran_id) {
      toast.error('Missing claim or veteran information');
      return;
    }

    try {
      setInitiating(true);
      const conditionNames = conditions?.map(c => 
        typeof c === 'string' ? c : c.name
      ) || [];
      
      await api.post('/agent/onboarding/initiate', {
        veteran_id: onboardingData.veteran_id,
        claim_id: claimId,
        claim_type: claimType || 'initial',
        conditions: conditionNames,
        send_welcome_email: true
      });
      
      toast.success('Onboarding checklist created!');
      await loadOnboardingStatus();
      
      if (onOnboardingCreated) {
        onOnboardingCreated();
      }
    } catch (error) {
      console.error('Failed to initiate onboarding:', error);
      toast.error(error.response?.data?.detail || 'Failed to create onboarding checklist');
    } finally {
      setInitiating(false);
    }
  };

  const handleItemStatusChange = async (itemId, newStatus) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await api.post(`/agent/onboarding/${claimId}/update-item`, {
        item_id: itemId,
        status: newStatus
      });
      
      await loadOnboardingStatus();
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update checklist item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const groupedItems = onboardingData?.checklist?.items?.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {}) || {};

  const categoryLabels = {
    profile: 'Profile Setup',
    document: 'Documents',
    form: 'VA Forms',
    claim: 'Claim Details',
    review: 'Final Review',
    other: 'Other Items'
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Onboarding
          {onboardingData?.has_checklist && onboardingData?.progress && (
            <Badge variant="secondary" className="ml-1">
              {onboardingData.progress.percent}%
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#1B3A5F]" />
            Client Onboarding
          </SheetTitle>
          <SheetDescription>
            {veteranName ? `Manage onboarding for ${veteranName}` : 'Manage client document collection'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !onboardingData?.has_checklist ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center mb-4">
                  <ClipboardList className="h-6 w-6 text-[#1B3A5F]" />
                </div>
                <h3 className="font-semibold mb-2">No Onboarding Checklist</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a personalized document checklist for this client based on their claim type and conditions.
                </p>
                <Button 
                  onClick={handleInitiateOnboarding} 
                  disabled={initiating}
                  className="gap-2"
                >
                  {initiating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Onboarding
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {onboardingData.progress.completed} of {onboardingData.progress.total} items
                    </span>
                  </div>
                  <Progress value={onboardingData.progress.percent} className="h-2" />
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Completed: {onboardingData.progress.completed}
                    </span>
                    <span className="flex items-center gap-1">
                      <Circle className="h-3 w-3 text-gray-400" />
                      Remaining: {onboardingData.progress.total - onboardingData.progress.completed}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <ScrollArea className="h-[calc(100vh-280px)]">
                <Accordion type="multiple" defaultValue={Object.keys(groupedItems)} className="space-y-2">
                  {Object.entries(groupedItems).map(([category, items]) => {
                    const CategoryIcon = CATEGORY_ICONS[category] || FileText;
                    const completedInCategory = items.filter(i => i.status === 'completed').length;
                    
                    return (
                      <AccordionItem key={category} value={category} className="border rounded-lg">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-3">
                            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{categoryLabels[category] || category}</span>
                            <Badge variant="secondary" className="text-xs">
                              {completedInCategory}/{items.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-0">
                          <div className="space-y-2">
                            {items.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item) => (
                              <ChecklistItem
                                key={item.id}
                                item={item}
                                onStatusChange={handleItemStatusChange}
                                isUpdating={updatingItems.has(item.id)}
                              />
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </ScrollArea>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function OnboardingQuickStart({ claimId, veteranId, veteranName, conditions, claimType, onComplete }) {
  const [initiating, setInitiating] = useState(false);

  const handleStart = async () => {
    try {
      setInitiating(true);
      const conditionNames = conditions?.map(c => 
        typeof c === 'string' ? c : c.name
      ) || [];
      
      await api.post('/agent/onboarding/initiate', {
        veteran_id: veteranId,
        claim_id: claimId,
        claim_type: claimType || 'initial',
        conditions: conditionNames,
        send_welcome_email: true
      });
      
      toast.success('Onboarding checklist created for ' + (veteranName || 'client'));
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to initiate onboarding:', error);
      toast.error(error.response?.data?.detail || 'Failed to create onboarding checklist');
    } finally {
      setInitiating(false);
    }
  };

  return (
    <Card className="border-[#D4A574]/30 bg-[#D4A574]/5">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="h-5 w-5 text-[#1B3A5F]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">Start Client Onboarding</h4>
            <p className="text-xs text-muted-foreground">
              Create a personalized document checklist based on their conditions
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={handleStart}
            disabled={initiating}
            className="gap-1"
          >
            {initiating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Play className="h-3 w-3" />
                Start
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClientOnboardingPanel;
