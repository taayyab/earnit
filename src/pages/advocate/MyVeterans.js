import React, { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import AdvocateLayout from '../../components/AdvocateLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Progress } from '../../components/ui/progress';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '../../components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Calendar, 
  Eye, 
  Clock,
  FileText,
  Brain,
  ClipboardCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  UserPlus,
  Shield,
  Star,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import TouchpointAssessment from '../../components/TouchpointAssessment';

const CLAIM_STATUSES = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
  in_review: { label: 'In Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Send },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  denied: { label: 'Denied', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  pending: { label: 'Pending', color: 'bg-blue-50 text-[#1B3A5F]', icon: Loader2 },
};

const SUPPORT_TIERS = {
  peer_buddy: { label: 'Peer Buddy', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  claims_guide: { label: 'Claims Guide', color: 'bg-blue-50 text-[#1B3A5F] border-blue-200' },
  full_advocate: { label: 'Full Advocate', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const JOURNEY_STEPS = [
  { id: 'documents', title: 'Documents', icon: FileText },
  { id: 'analysis', title: 'Analysis', icon: Brain },
  { id: 'review', title: 'Review', icon: ClipboardCheck },
  { id: 'advocate', title: 'Advocate', icon: Users },
  { id: 'submit', title: 'Submit', icon: Send },
];

function JourneyProgressMini({ currentStep, className = '' }) {
  const stepIndex = JOURNEY_STEPS.findIndex(s => s.id === currentStep);
  const currentIndex = stepIndex >= 0 ? stepIndex : 0;
  const progress = ((currentIndex + 1) / JOURNEY_STEPS.length) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Journey Progress</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between">
        {JOURNEY_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index <= currentIndex;
          return (
            <div 
              key={step.id} 
              className={`flex flex-col items-center ${isComplete ? 'text-emerald-600' : 'text-slate-300'}`}
              title={step.title}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VeteranCard({ veteran, onViewDetails, onMessage, onSchedule }) {
  const status = CLAIM_STATUSES[veteran.claim_status] || CLAIM_STATUSES.pending;
  const tier = SUPPORT_TIERS[veteran.tier] || SUPPORT_TIERS.peer_buddy;
  const StatusIcon = status.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 bg-emerald-100">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-lg">
              {veteran.name?.charAt(0) || 'V'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-slate-900 truncate">{veteran.name}</h3>
              <Badge variant="outline" className={tier.color}>
                {tier.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${status.color} font-normal`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last contact: {formatDate(veteran.last_contact)}
              </span>
            </div>
            <JourneyProgressMini currentStep={veteran.journey_step || 'documents'} />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
            onClick={() => onMessage(veteran)}
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Message
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
            onClick={() => onSchedule(veteran)}
          >
            <Calendar className="h-4 w-4 mr-1.5" />
            Schedule
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onViewDetails(veteran)}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VeteranDetailsPanel({ veteran, open, onClose, onStartAssessment }) {
  if (!veteran) return null;

  const status = CLAIM_STATUSES[veteran.claim_status] || CLAIM_STATUSES.pending;
  const tier = SUPPORT_TIERS[veteran.tier] || SUPPORT_TIERS.peer_buddy;
  const StatusIcon = status.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 bg-emerald-100">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-2xl">
                {veteran.name?.charAt(0) || 'V'}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-xl">{veteran.name}</SheetTitle>
              <SheetDescription>
                <Badge variant="outline" className={tier.color}>
                  {tier.label}
                </Badge>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              Claim Status
            </h4>
            <div className="flex items-center gap-3">
              <Badge className={`${status.color} text-sm px-3 py-1`}>
                <StatusIcon className="h-4 w-4 mr-1.5" />
                {status.label}
              </Badge>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-900 mb-3">Journey Progress</h4>
            <div className="space-y-3">
              {JOURNEY_STEPS.map((step, index) => {
                const stepIndex = JOURNEY_STEPS.findIndex(s => s.id === veteran.journey_step);
                const currentIndex = stepIndex >= 0 ? stepIndex : 0;
                const isComplete = index < currentIndex;
                const isCurrent = index === currentIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-emerald-500 text-white' :
                      isCurrent ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500' :
                      'bg-slate-200 text-slate-400'
                    }`}>
                      {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-sm ${isCurrent ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                      {step.title}
                    </span>
                    {isCurrent && (
                      <Badge className="bg-emerald-100 text-emerald-700 ml-auto">Current</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-900">Assignment Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Assigned Date</p>
                <p className="font-medium">{formatDate(veteran.assigned_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Contact</p>
                <p className="font-medium">{formatDate(veteran.last_contact)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Support Tier</p>
                <p className="font-medium capitalize">{veteran.tier?.replace('_', ' ') || 'Peer Buddy'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{veteran.status || 'Active'}</p>
              </div>
            </div>
          </div>

          {veteran.consent && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h4 className="text-sm font-medium text-amber-900 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Consent Permissions
              </h4>
              <ul className="text-sm text-amber-800 space-y-1">
                {veteran.consent.claim_status && <li>✓ View claim status</li>}
                {veteran.consent.submission_needs && <li>✓ View submission needs</li>}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-4 border-t">
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => window.location.href = `/messages?veteran=${veteran.id}`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = `/advocate/calendar?schedule=${veteran.id}`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = `/claim/${veteran.claim_id || veteran.id}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Full Claim
            </Button>
            <Button 
              variant="outline" 
              className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              onClick={() => onStartAssessment(veteran)}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Complete Assessment
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <Users className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">No Veterans Assigned</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        You don't have any veterans assigned to you yet. When veterans request your support, 
        they'll appear here after you accept their invitation.
      </p>
      <Button
        variant="outline"
        onClick={() => window.location.href = '/mentor'}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Check Pending Invitations
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MyVeterans() {
  const { user } = useAuth();
  const [veterans, setVeterans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVeteran, setSelectedVeteran] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentVeteran, setAssessmentVeteran] = useState(null);

  useEffect(() => {
    loadVeterans();
  }, []);

  const loadVeterans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/peer-support/my-assignments');
      const assignments = response.data.assignments || [];
      
      const mappedVeterans = assignments.map(a => ({
        id: a.veteran?.id || a.id,
        assignment_id: a.id,
        name: a.veteran?.first_name || `Veteran #${a.veteran?.id?.slice(-6) || 'Unknown'}`,
        tier: a.tier || 'peer_buddy',
        status: a.status,
        claim_status: a.claim_status || 'pending',
        assigned_at: a.assigned_at,
        last_contact: a.last_contact || a.assigned_at,
        journey_step: a.journey_step || 'documents',
        consent: a.consent,
        claim_id: a.claim_id
      }));
      
      setVeterans(mappedVeterans);
    } catch (error) {
      console.error('Failed to load veterans:', error);
      toast.error('Failed to load assigned veterans');
    } finally {
      setLoading(false);
    }
  };

  const filteredVeterans = useMemo(() => {
    return veterans.filter(veteran => {
      const matchesSearch = veteran.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || veteran.claim_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [veterans, searchQuery, statusFilter]);

  const handleViewDetails = (veteran) => {
    setSelectedVeteran(veteran);
    setDetailsOpen(true);
  };

  const handleMessage = (veteran) => {
    window.location.href = `/messages?veteran=${veteran.id}`;
  };

  const handleSchedule = (veteran) => {
    window.location.href = `/advocate/calendar?schedule=${veteran.id}`;
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setTimeout(() => setSelectedVeteran(null), 300);
  };

  const handleStartAssessment = (veteran) => {
    setAssessmentVeteran(veteran);
    setShowAssessment(true);
  };

  const handleAssessmentComplete = (responses) => {
    setShowAssessment(false);
    setAssessmentVeteran(null);
    if (responses) {
      toast.success('Assessment completed successfully');
    }
  };

  const handleAssessmentDismiss = () => {
    setShowAssessment(false);
    setAssessmentVeteran(null);
  };

  return (
    <AdvocateLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Veterans</h1>
            <p className="text-muted-foreground mt-1">
              Manage and support your assigned veterans
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
              <Users className="h-4 w-4 mr-1.5" />
              {veterans.length} {veterans.length === 1 ? 'Veteran' : 'Veterans'}
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search veterans by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <LoadingSkeleton />
        ) : veterans.length === 0 ? (
          <EmptyState />
        ) : filteredVeterans.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              No veterans match your search criteria. Try adjusting your filters.
            </p>
            <Button 
              variant="link" 
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              className="mt-2"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVeterans.map(veteran => (
              <VeteranCard
                key={veteran.assignment_id || veteran.id}
                veteran={veteran}
                onViewDetails={handleViewDetails}
                onMessage={handleMessage}
                onSchedule={handleSchedule}
              />
            ))}
          </div>
        )}

        <VeteranDetailsPanel
          veteran={selectedVeteran}
          open={detailsOpen}
          onClose={handleCloseDetails}
          onStartAssessment={handleStartAssessment}
        />

        {assessmentVeteran && (
          <TouchpointAssessment
            touchpointId={assessmentVeteran.assignment_id || assessmentVeteran.id}
            advocateName={user?.full_name || user?.email || 'Advocate'}
            isOpen={showAssessment}
            onClose={handleAssessmentDismiss}
            onComplete={handleAssessmentComplete}
          />
        )}
      </div>
    </AdvocateLayout>
  );
}
