import React, { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import AdvocateLayout from '../../components/AdvocateLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Skeleton } from '../../components/ui/skeleton';
import { ScrollArea } from '../../components/ui/scroll-area';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  ClipboardList,
  Search,
  Filter,
  Home,
  Briefcase,
  Heart,
  DollarSign,
  Scale,
  GraduationCap,
  Activity,
  Users,
  Phone,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  Plus,
  ExternalLink,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Send,
  Eye,
  ThumbsUp,
  RotateCcw,
  Gauge,
  Timer,
  UserCheck,
  CalendarClock,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_ICONS = {
  housing: Home,
  employment: Briefcase,
  mental_health: Heart,
  financial: DollarSign,
  legal: Scale,
  education: GraduationCap,
  healthcare: Activity,
  family: Users
};

const CATEGORY_COLORS = {
  housing: 'bg-blue-100 text-blue-700 border-blue-200',
  employment: 'bg-green-100 text-green-700 border-green-200',
  mental_health: 'bg-blue-50 text-[#1B3A5F] border-blue-200',
  financial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  legal: 'bg-gray-100 text-gray-700 border-gray-200',
  education: 'bg-blue-50 text-[#1B3A5F] border-blue-200',
  healthcare: 'bg-red-100 text-red-700 border-red-200',
  family: 'bg-pink-100 text-pink-700 border-pink-200'
};

const CATEGORY_LABELS = {
  housing: 'Housing',
  employment: 'Employment',
  mental_health: 'Mental Health',
  financial: 'Financial',
  legal: 'Legal',
  education: 'Education',
  healthcare: 'Healthcare',
  family: 'Family'
};

const PRIORITY_CONFIG = {
  crisis: { label: 'Crisis', color: 'bg-red-500 text-white', icon: AlertTriangle },
  urgent: { label: 'Urgent', color: 'bg-orange-500 text-white', icon: AlertCircle },
  high: { label: 'High', color: 'bg-amber-100 text-amber-800', icon: TrendingUp },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700', icon: Clock },
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600', icon: CheckCircle2 }
};

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  assigned: { label: 'Assigned', color: 'bg-blue-50 text-[#1B3A5F]' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  pending_partner: { label: 'Pending Partner', color: 'bg-orange-100 text-orange-700' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-600' }
};

const REVIEW_STATUS_CONFIG = {
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-700', icon: Eye },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: ThumbsUp },
  needs_revision: { label: 'Needs Revision', color: 'bg-red-100 text-red-700', icon: RotateCcw }
};

const CRISIS_RESOURCES = [
  {
    name: 'Veterans Crisis Line',
    phone: '988 (Press 1)',
    description: '24/7 support for veterans in crisis',
    urgent: true
  },
  {
    name: 'National Suicide Prevention',
    phone: '988',
    description: '24/7 crisis support',
    urgent: true
  },
  {
    name: 'SAMHSA Helpline',
    phone: '1-800-662-4357',
    description: 'Substance abuse and mental health',
    urgent: false
  },
  {
    name: 'VA Emergency',
    phone: '911 or local VA',
    description: 'Medical emergencies',
    urgent: true
  }
];

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CrisisResourcesPanel() {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          Crisis Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {CRISIS_RESOURCES.map((resource, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-red-100">
              <div>
                <p className="text-sm font-medium text-slate-900">{resource.name}</p>
                <p className="text-xs text-muted-foreground">{resource.description}</p>
              </div>
              <a
                href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-medium hover:bg-red-700 transition-colors"
              >
                <Phone className="h-3 w-3" />
                {resource.phone}
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CaseCard({ caseData, onClick }) {
  const primaryCategory = caseData.identified_needs?.[0]?.category || 'healthcare';
  const CategoryIcon = CATEGORY_ICONS[primaryCategory] || Heart;
  const priorityConfig = PRIORITY_CONFIG[caseData.priority] || PRIORITY_CONFIG.medium;
  const statusConfig = STATUS_CONFIG[caseData.status] || STATUS_CONFIG.new;
  const reviewConfig = REVIEW_STATUS_CONFIG[caseData.review_status] || REVIEW_STATUS_CONFIG.pending_review;
  const PriorityIcon = priorityConfig.icon;
  const ReviewIcon = reviewConfig.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const categories = [...new Set(caseData.identified_needs?.map(n => n.category) || [])];
  const queuePosition = caseData.queue_position;
  const estimatedWait = caseData.estimated_wait_hours;

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4"
      style={{ borderLeftColor: caseData.priority === 'crisis' ? '#ef4444' : caseData.priority === 'urgent' ? '#f97316' : '#10b981' }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${CATEGORY_COLORS[primaryCategory]}`}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{caseData.veteran_name || 'Unknown Veteran'}</h3>
              <p className="text-xs text-muted-foreground">Case #{caseData.case_id?.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={priorityConfig.color}>
              <PriorityIcon className="h-3 w-3 mr-1" />
              {priorityConfig.label}
            </Badge>
            {queuePosition && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                Queue #{queuePosition}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {categories.slice(0, 3).map(cat => (
            <Badge key={cat} variant="outline" className={`text-xs ${CATEGORY_COLORS[cat]}`}>
              {CATEGORY_LABELS[cat]}
            </Badge>
          ))}
          {categories.length > 3 && (
            <Badge variant="outline" className="text-xs">+{categories.length - 3}</Badge>
          )}
        </div>

        {estimatedWait !== undefined && estimatedWait > 0 && (
          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground bg-slate-50 p-2 rounded">
            <Timer className="h-3 w-3" />
            <span>Est. wait: {estimatedWait < 1 ? 'Less than 1 hour' : `~${Math.round(estimatedWait)} hours`}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(caseData.created_at)}
            </span>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            {caseData.review_status && (
              <Badge className={reviewConfig.color}>
                <ReviewIcon className="h-3 w-3 mr-1" />
                {reviewConfig.label}
              </Badge>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </CardContent>
    </Card>
  );
}

function CaseDetailsPanel({ caseData, open, onClose, onUpdate }) {
  const [noteText, setNoteText] = useState('');
  const [newStatus, setNewStatus] = useState(caseData?.status || 'new');
  const [updating, setUpdating] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (caseData) {
      setNewStatus(caseData.status);
    }
  }, [caseData]);

  if (!caseData) return null;

  const priorityConfig = PRIORITY_CONFIG[caseData.priority] || PRIORITY_CONFIG.medium;
  const statusConfig = STATUS_CONFIG[caseData.status] || STATUS_CONFIG.new;
  const PriorityIcon = priorityConfig.icon;

  const handleStatusUpdate = async () => {
    if (newStatus === caseData.status) return;
    
    try {
      setUpdating(true);
      await api.put(`/support-cases/case/${caseData.case_id}/status`, {
        status: newStatus
      });
      toast.success('Status updated successfully');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      setAddingNote(true);
      await api.post(`/support-cases/case/${caseData.case_id}/note`, {
        note_text: noteText
      });
      setNoteText('');
      toast.success('Note added successfully');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleSelfAssign = async () => {
    try {
      await api.post(`/support-cases/case/${caseData.case_id}/self-assign`);
      toast.success('Case assigned to you');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to assign case');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <ClipboardList className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <SheetTitle>{caseData.veteran_name || 'Support Case'}</SheetTitle>
              <SheetDescription>Case #{caseData.case_id?.slice(0, 8)}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-6 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={priorityConfig.color}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {priorityConfig.label} Priority
              </Badge>
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </div>

            {!caseData.assigned_advocate_id && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 mb-2">This case is unassigned</p>
                <Button size="sm" onClick={handleSelfAssign} className="bg-amber-600 hover:bg-amber-700">
                  <Users className="h-4 w-4 mr-1" />
                  Assign to Me
                </Button>
              </div>
            )}

            {caseData.assigned_advocate_name && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Assigned Advocate</p>
                <p className="font-medium">{caseData.assigned_advocate_name}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Identified Needs
              </h4>
              <div className="space-y-2">
                {caseData.identified_needs?.length > 0 ? (
                  caseData.identified_needs.map((need, i) => {
                    const Icon = CATEGORY_ICONS[need.category] || Heart;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className={`p-1.5 rounded ${CATEGORY_COLORS[need.category]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{need.response || need.category}</p>
                          <Badge variant="outline" className="text-xs mt-1">{need.urgency || 'moderate'}</Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No specific needs identified</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Recommended Services
              </h4>
              <div className="space-y-2">
                {caseData.recommended_services?.length > 0 ? (
                  caseData.recommended_services.slice(0, 5).map((service, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                      <div className="flex gap-2 mt-2">
                        {service.contact_phone && (
                          <a href={`tel:${service.contact_phone}`} className="text-xs text-emerald-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Call
                          </a>
                        )}
                        {service.website && (
                          <a href={service.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No services recommended yet</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h4>
              <div className="space-y-2">
                {caseData.timeline?.map((event, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                    <div>
                      <p className="font-medium">{event.details || event.event}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notes ({caseData.notes?.length || 0})
              </h4>
              <div className="space-y-2 mb-3">
                {caseData.notes?.length > 0 ? (
                  caseData.notes.map((note, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm">{note.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {note.author_name} - {formatDate(note.created_at)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No notes yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={addingNote || !noteText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {addingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Update Status</h4>
              <div className="flex gap-2">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending_partner">Pending Partner</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === caseData.status}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                </Button>
              </div>
            </div>

            <ReviewWorkflowPanel caseData={caseData} onUpdate={onUpdate} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ReviewWorkflowPanel({ caseData, onUpdate }) {
  const [reviewStatus, setReviewStatus] = useState(caseData?.review_status || 'pending_review');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSupervisorReview, setIsSupervisorReview] = useState(false);

  const requiresSupervisor = caseData?.priority === 'crisis' || caseData?.priority === 'urgent';
  const currentReviewConfig = REVIEW_STATUS_CONFIG[caseData?.review_status] || REVIEW_STATUS_CONFIG.pending_review;
  const CurrentIcon = currentReviewConfig.icon;

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      await api.put(`/advocates/cases/${caseData.case_id}/review`, {
        status: reviewStatus,
        notes: reviewNotes,
        feedback: reviewFeedback,
        is_supervisor_review: isSupervisorReview
      });
      toast.success(`Review submitted: ${REVIEW_STATUS_CONFIG[reviewStatus]?.label || reviewStatus}`);
      setReviewNotes('');
      setReviewFeedback('');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to submit review');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!caseData) return null;

  return (
    <div className="pt-4 border-t">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Case Review Workflow
      </h4>
      
      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Current Review Status</span>
          <Badge className={currentReviewConfig.color}>
            <CurrentIcon className="h-3 w-3 mr-1" />
            {currentReviewConfig.label}
          </Badge>
        </div>
        {requiresSupervisor && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2">
            <AlertTriangle className="h-3 w-3" />
            High-priority case - Supervisor review recommended
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Update Review Status</label>
          <Select value={reviewStatus} onValueChange={setReviewStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending_review">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Review
                </div>
              </SelectItem>
              <SelectItem value="in_review">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  In Review
                </div>
              </SelectItem>
              <SelectItem value="approved">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Approved
                </div>
              </SelectItem>
              <SelectItem value="needs_revision">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Needs Revision
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Review Notes (Internal)</label>
          <Textarea
            placeholder="Add internal notes about this review..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={2}
          />
        </div>

        {reviewStatus === 'needs_revision' && (
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Feedback for Veteran</label>
            <Textarea
              placeholder="What needs to be revised..."
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {requiresSupervisor && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="supervisor-review"
              checked={isSupervisorReview}
              onChange={(e) => setIsSupervisorReview(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="supervisor-review" className="text-sm">
              This is a supervisor review
            </label>
          </div>
        )}

        <Button
          onClick={handleSubmitReview}
          disabled={submitting}
          className="w-full bg-[#1B3A5F] hover:bg-[#2a4a6f]"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Submit Review
        </Button>
      </div>
    </div>
  );
}

function AvailabilityToggle({ onStatusChange }) {
  const [status, setStatus] = useState('available');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const response = await api.get('/advocates/availability');
      if (response.data.availability) {
        setStatus(response.data.availability.status || 'available');
      }
    } catch (err) {
      console.error('Failed to load availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (newStatus) => {
    try {
      setUpdating(true);
      await api.put('/advocates/availability', { status: newStatus });
      setStatus(newStatus);
      toast.success(`Availability updated to: ${newStatus}`);
      if (onStatusChange) onStatusChange(newStatus);
    } catch (err) {
      toast.error('Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  const statusConfig = {
    available: { label: 'Available', color: 'bg-green-100 text-green-700 border-green-300', icon: UserCheck },
    limited: { label: 'Limited', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: CalendarClock },
    unavailable: { label: 'Unavailable', color: 'bg-red-100 text-red-700 border-red-300', icon: Clock }
  };

  const config = statusConfig[status] || statusConfig.available;
  const StatusIcon = config.icon;

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium">My Availability</span>
          </div>
          <Select value={status} onValueChange={updateAvailability} disabled={updating}>
            <SelectTrigger className={`w-36 ${config.color}`}>
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Available
                </div>
              </SelectItem>
              <SelectItem value="limited">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  Limited
                </div>
              </SelectItem>
              <SelectItem value="unavailable">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Unavailable
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkloadStatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/advocates/workload');
      setStats(response.data.workload);
    } catch (err) {
      console.error('Failed to load workload stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const capacityColor = stats.capacity_percentage >= 80 
    ? 'text-red-600' 
    : stats.capacity_percentage >= 50 
      ? 'text-amber-600' 
      : 'text-green-600';

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Gauge className="h-4 w-4" />
          My Workload
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Current Caseload</span>
          <span className={`text-lg font-bold ${capacityColor}`}>
            {stats.current_caseload} / {stats.max_caseload}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div 
            className={`h-full transition-all ${
              stats.capacity_percentage >= 80 ? 'bg-red-500' :
              stats.capacity_percentage >= 50 ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, stats.capacity_percentage)}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span>Crisis: {stats.by_priority?.crisis || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-orange-500" />
            <span>Urgent: {stats.by_priority?.urgent || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-amber-500" />
            <span>High: {stats.by_priority?.high || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>Completed: {stats.cases_completed_this_week || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex gap-1 mb-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="pt-3 border-t flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <ClipboardList className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">No Support Cases</h3>
      <p className="text-muted-foreground text-center max-w-md">
        There are no active support cases at this time. Cases will appear here when veterans complete their needs assessment.
      </p>
    </div>
  );
}

export default function SupportCases() {
  const [cases, setCases] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await api.get('/support-cases/advocate/dashboard');
      setCases(response.data.cases || []);
      setStatistics(response.data.statistics || {});
    } catch (error) {
      console.error('Failed to load support cases:', error);
      toast.error('Failed to load support cases');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = c.veteran_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.case_id?.includes(searchQuery);
      
      const caseCategories = c.identified_needs?.map(n => n.category) || [];
      const matchesCategory = categoryFilter === 'all' || caseCategories.includes(categoryFilter);
      
      const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [cases, searchQuery, categoryFilter, priorityFilter, statusFilter]);

  const handleViewCase = async (caseData) => {
    try {
      const response = await api.get(`/support-cases/case/${caseData.case_id}`);
      setSelectedCase(response.data.case);
      setDetailsOpen(true);
    } catch (err) {
      toast.error('Failed to load case details');
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setTimeout(() => setSelectedCase(null), 300);
  };

  const handleCaseUpdate = () => {
    loadCases();
    if (selectedCase) {
      api.get(`/support-cases/case/${selectedCase.case_id}`).then(res => {
        setSelectedCase(res.data.case);
      });
    }
  };

  const openCases = cases.filter(c => ['new', 'assigned', 'in_progress', 'pending_partner'].includes(c.status)).length;
  const resolvedThisMonth = cases.filter(c => {
    if (c.status !== 'resolved') return false;
    const updated = new Date(c.updated_at);
    const now = new Date();
    return updated.getMonth() === now.getMonth() && updated.getFullYear() === now.getFullYear();
  }).length;

  return (
    <AdvocateLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Support Cases</h1>
            <p className="text-muted-foreground mt-1">
              Manage wraparound support needs for your veterans
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Cases"
            value={cases.length}
            icon={ClipboardList}
            color="bg-blue-100 text-blue-700"
          />
          <StatCard
            title="Open Cases"
            value={openCases}
            icon={Clock}
            color="bg-amber-100 text-amber-700"
          />
          <StatCard
            title="Resolved This Month"
            value={resolvedThisMonth}
            icon={CheckCircle2}
            color="bg-green-100 text-green-700"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by veteran name or case ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full lg:w-36">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="crisis">Crisis</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <LoadingSkeleton />
            ) : cases.length === 0 ? (
              <EmptyState />
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Cases Found</h3>
                <p className="text-muted-foreground">
                  No cases match your filters. Try adjusting your criteria.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setPriorityFilter('all');
                    setStatusFilter('all');
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCases.map(caseData => (
                  <CaseCard
                    key={caseData.case_id}
                    caseData={caseData}
                    onClick={() => handleViewCase(caseData)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <AvailabilityToggle />
            <WorkloadStatsCard />
            <CrisisResourcesPanel />
          </div>
        </div>

        <CaseDetailsPanel
          caseData={selectedCase}
          open={detailsOpen}
          onClose={handleCloseDetails}
          onUpdate={handleCaseUpdate}
        />
      </div>
    </AdvocateLayout>
  );
}
