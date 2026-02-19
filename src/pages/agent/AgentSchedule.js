import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import AgentLayout from '../../components/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  X,
  RefreshCw,
  CalendarDays,
  List,
  Plus,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

const MEETING_TYPE_ICONS = {
  video_call: Video,
  phone_call: Phone,
  in_person: Users,
};

const MEETING_TYPES = [
  { value: 'video_call', label: 'Video Call', icon: Video },
  { value: 'phone_call', label: 'Phone Call', icon: Phone },
  { value: 'in_person', label: 'In Person', icon: Users },
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
];

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  rescheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-slate-100 text-slate-800 border-slate-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

function ScheduleMeetingDialog({ open, onOpenChange, claims, onScheduled }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    claim_id: '',
    meeting_type: 'video_call',
    scheduled_date: '',
    scheduled_time: '10:00',
    duration_minutes: 30,
    title: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.claim_id) {
      toast.error('Please select a client/claim');
      return;
    }
    if (!formData.scheduled_date || !formData.scheduled_time) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
      
      await api.post('/agent/meetings', {
        claim_id: formData.claim_id,
        scheduled_date: scheduledDateTime,
        duration_minutes: formData.duration_minutes,
        meeting_type: formData.meeting_type,
        title: formData.title || undefined,
        description: formData.description || undefined,
      });

      toast.success('Meeting scheduled successfully!');
      onOpenChange(false);
      setFormData({
        claim_id: '',
        meeting_type: 'video_call',
        scheduled_date: '',
        scheduled_time: '10:00',
        duration_minutes: 30,
        title: '',
        description: '',
      });
      
      if (onScheduled) {
        onScheduled();
      }
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      toast.error(error.response?.data?.detail || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const selectedClaim = claims.find(c => c.id === formData.claim_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" aria-hidden="true" />
            Schedule New Meeting
          </DialogTitle>
          <DialogDescription>
            Schedule a meeting with one of your clients
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claim-select">Select Client / Claim</Label>
            <Select
              value={formData.claim_id}
              onValueChange={(val) => setFormData({ ...formData, claim_id: val })}
            >
              <SelectTrigger id="claim-select" aria-label="Select a client or claim">
                <SelectValue placeholder="Choose a client..." />
              </SelectTrigger>
              <SelectContent>
                {claims.length === 0 ? (
                  <SelectItem value="" disabled>No claims assigned</SelectItem>
                ) : (
                  claims.map((claim) => (
                    <SelectItem key={claim.id} value={claim.id}>
                      {claim.veteran_name || 'Unknown'} - {claim.status?.replace(/_/g, ' ')}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedClaim && (
              <p className="text-xs text-slate-500">
                Claim ID: {selectedClaim.id.slice(-8)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Meeting type">
              {MEETING_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.meeting_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setFormData({ ...formData, meeting_type: type.value })}
                    className={`p-3 rounded-lg border text-center transition-all focus:outline-none focus:ring-2 focus:ring-[#1B3A5F] focus:ring-offset-2 ${
                      isSelected
                        ? 'border-[#1B3A5F] bg-[#1B3A5F]/5 ring-1 ring-[#1B3A5F]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${isSelected ? 'text-[#1B3A5F]' : 'text-slate-500'}`} aria-hidden="true" />
                    <span className={`text-xs font-medium ${isSelected ? 'text-[#1B3A5F]' : 'text-slate-600'}`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-date">Date</Label>
              <Input
                id="meeting-date"
                type="date"
                min={getMinDate()}
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-time">Time</Label>
              <Input
                id="meeting-time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration-select">Duration</Label>
            <Select
              value={String(formData.duration_minutes)}
              onValueChange={(val) => setFormData({ ...formData, duration_minutes: parseInt(val) })}
            >
              <SelectTrigger id="duration-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-title">Title (Optional)</Label>
            <Input
              id="meeting-title"
              placeholder="e.g., Initial Claim Review"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-notes">Notes / Agenda (Optional)</Label>
            <Textarea
              id="meeting-notes"
              placeholder="Topics to discuss..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.claim_id}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                  Schedule Meeting
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MeetingCard({ meeting, onCancel, onNavigate }) {
  const [cancelling, setCancelling] = useState(false);
  const TypeIcon = MEETING_TYPE_ICONS[meeting.meeting_type] || Calendar;
  const meetingDate = new Date(meeting.scheduled_date);
  const isUpcoming = meetingDate > new Date() && meeting.status !== 'cancelled';

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) return;
    
    setCancelling(true);
    try {
      await api.delete(`/agent/meetings/${meeting.meeting_id}`);
      toast.success('Meeting cancelled');
      if (onCancel) onCancel(meeting.meeting_id);
    } catch (error) {
      toast.error('Failed to cancel meeting');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${meeting.status === 'cancelled' ? 'opacity-60' : ''}`}
      role="article"
      aria-label={`Meeting: ${meeting.title || 'Client Meeting'} with ${meeting.veteran_name || 'Client'}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg shrink-0 ${
            meeting.status === 'cancelled' ? 'bg-red-50' : 'bg-[#1B3A5F]/10'
          }`}>
            <TypeIcon className={`h-5 w-5 ${
              meeting.status === 'cancelled' ? 'text-red-400' : 'text-[#1B3A5F]'
            }`} aria-hidden="true" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 line-clamp-1">
                  {meeting.title || 'Client Meeting'}
                </h3>
                <p className="text-sm text-slate-600">
                  {meeting.veteran_name || 'Client'}
                </p>
              </div>
              <Badge variant="outline" className={STATUS_COLORS[meeting.status] || STATUS_COLORS.scheduled}>
                {meeting.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>{meetingDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>{meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span className="text-slate-400" aria-hidden="true">|</span>
              <span>{meeting.duration_minutes} min</span>
            </div>

            {meeting.description && (
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                {meeting.description}
              </p>
            )}

            {meeting.dial_in_number && meeting.status !== 'cancelled' && (
              <div className="mt-2 text-xs text-slate-500">
                Dial-in: {meeting.dial_in_number}
                {meeting.dial_in_pin && ` (PIN: ${meeting.dial_in_pin})`}
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              {meeting.claim_id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigate(`/agent/claim/${meeting.claim_id}`)}
                >
                  View Claim
                </Button>
              )}
              
              {isUpcoming && meeting.meeting_link && meeting.meeting_type === 'video_call' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(meeting.meeting_link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" aria-hidden="true" />
                  Join
                </Button>
              )}
              
              {isUpcoming && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                  onClick={handleCancel}
                  disabled={cancelling}
                  aria-label="Cancel meeting"
                >
                  {cancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" aria-hidden="true" />
                      Cancel
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WeekView({ meetings, currentDate, onNavigate }) {
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      day.setHours(0, 0, 0, 0);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getMeetingsForDay = (day) => {
    return meetings.filter(m => {
      const meetingDate = new Date(m.scheduled_date);
      return isSameDay(meetingDate, day);
    }).sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
  };

  return (
    <div 
      className="grid grid-cols-7 gap-2 md:gap-4"
      role="grid"
      aria-label="Weekly calendar view"
    >
      {weekDays.map((day, idx) => {
        const dayMeetings = getMeetingsForDay(day);
        const isToday = isSameDay(day, today);
        const isPast = day < today;
        
        return (
          <div
            key={idx}
            role="gridcell"
            aria-label={`${day.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}, ${dayMeetings.length} meeting${dayMeetings.length !== 1 ? 's' : ''}`}
            className={`min-h-[150px] rounded-lg border p-2 ${
              isToday ? 'border-[#1B3A5F] bg-[#1B3A5F]/5' :
              isPast ? 'bg-slate-50 border-slate-200' : 'border-slate-200'
            }`}
          >
            <div className={`text-center mb-2 pb-2 border-b ${
              isToday ? 'border-[#1B3A5F]/20' : 'border-slate-100'
            }`}>
              <div className="text-xs text-slate-500 uppercase">
                {day.toLocaleDateString([], { weekday: 'short' })}
              </div>
              <div className={`text-lg font-semibold ${
                isToday ? 'text-[#1B3A5F]' : isPast ? 'text-slate-400' : 'text-slate-900'
              }`}>
                {day.getDate()}
              </div>
            </div>
            
            <div className="space-y-1">
              {dayMeetings.slice(0, 3).map((meeting) => {
                const meetingTime = new Date(meeting.scheduled_date);
                const TypeIcon = MEETING_TYPE_ICONS[meeting.meeting_type] || Calendar;
                return (
                  <button
                    key={meeting.meeting_id}
                    className={`w-full text-left p-1.5 rounded text-xs hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#1B3A5F] ${
                      meeting.status === 'cancelled'
                        ? 'bg-red-50 text-red-600 line-through'
                        : 'bg-[#1B3A5F]/10 text-[#1B3A5F]'
                    }`}
                    onClick={() => meeting.claim_id && onNavigate(`/agent/claim/${meeting.claim_id}`)}
                    aria-label={`${meetingTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${meeting.veteran_name || meeting.title || 'Client Meeting'}`}
                  >
                    <div className="flex items-center gap-1">
                      <TypeIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate font-medium">
                        {meetingTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="truncate mt-0.5">
                      {meeting.veteran_name || meeting.title || 'Client'}
                    </div>
                  </button>
                );
              })}
              {dayMeetings.length > 3 && (
                <div className="text-xs text-center text-slate-500">
                  +{dayMeetings.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgentSchedule() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState('upcoming');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const loadMeetings = useCallback(async () => {
    try {
      const response = await api.get('/agent/meetings/all');
      setMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('Failed to load meetings:', error);
      toast.error('Failed to load meetings');
    }
  }, []);

  const loadClaims = useCallback(async () => {
    try {
      const response = await api.get('/agent/claims');
      const claimsData = response.data.claims || [];
      setClaims(claimsData.map(c => ({
        id: c.id,
        veteran_name: c.veteran?.name || c.veteran_name || 'Unknown',
        status: c.status,
      })));
    } catch (error) {
      console.error('Failed to load claims:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadMeetings(), loadClaims()]);
    setLoading(false);
  }, [loadMeetings, loadClaims]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMeetings();
    setRefreshing(false);
  };

  const handleCancel = async (meetingId) => {
    const previousMeetings = [...meetings];
    setMeetings(prev =>
      prev.map(m =>
        m.meeting_id === meetingId ? { ...m, status: 'cancelled' } : m
      )
    );
    setRefreshing(true);
    try {
      await loadMeetings();
    } catch (error) {
      setMeetings(previousMeetings);
      toast.error('Failed to sync meeting status');
    } finally {
      setRefreshing(false);
    }
  };

  const handleScheduled = () => {
    handleRefresh();
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const filteredMeetings = meetings.filter(m => {
    if (filter === 'upcoming') {
      return new Date(m.scheduled_date) >= new Date() && m.status !== 'cancelled';
    }
    if (filter === 'past') {
      return new Date(m.scheduled_date) < new Date() || m.status === 'cancelled';
    }
    return true;
  });

  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    if (filter === 'past') {
      return new Date(b.scheduled_date) - new Date(a.scheduled_date);
    }
    return new Date(a.scheduled_date) - new Date(b.scheduled_date);
  });

  const getWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    return `${startOfWeek.toLocaleDateString([], options)} - ${endOfWeek.toLocaleDateString([], options)}`;
  };

  const upcomingCount = meetings.filter(m => 
    new Date(m.scheduled_date) >= new Date() && m.status !== 'cancelled'
  ).length;
  
  const todayCount = meetings.filter(m => {
    const meetingDate = new Date(m.scheduled_date);
    const today = new Date();
    return (
      meetingDate.getDate() === today.getDate() &&
      meetingDate.getMonth() === today.getMonth() &&
      meetingDate.getFullYear() === today.getFullYear() &&
      m.status !== 'cancelled'
    );
  }).length;

  return (
    <AgentLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-7 w-7 text-[#1B3A5F]" aria-hidden="true" />
              My Schedule
            </h1>
            <p className="text-slate-600 mt-1">
              Manage your meetings with clients
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh meetings"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setShowScheduleDialog(true)}
              className="bg-[#1B3A5F] hover:bg-[#1B3A5F]/90"
            >
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-[#1B3A5F]">{todayCount}</div>
              <div className="text-sm text-slate-600">Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{upcomingCount}</div>
              <div className="text-sm text-slate-600">Upcoming</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-slate-600">
                {meetings.filter(m => m.status === 'confirmed').length}
              </div>
              <div className="text-sm text-slate-600">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">
                {meetings.filter(m => m.status === 'scheduled').length}
              </div>
              <div className="text-sm text-slate-600">Pending</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2" role="tablist" aria-label="View options">
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                  role="tab"
                  aria-selected={view === 'list'}
                  aria-controls="list-view"
                >
                  <List className="h-4 w-4 mr-1" aria-hidden="true" />
                  List
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('week')}
                  role="tab"
                  aria-selected={view === 'week'}
                  aria-controls="week-view"
                >
                  <CalendarDays className="h-4 w-4 mr-1" aria-hidden="true" />
                  Week
                </Button>
              </div>
              
              {view === 'week' && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigateWeek(-1)}
                    aria-label="Previous week"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <span className="text-sm font-medium min-w-[140px] text-center" aria-live="polite">
                    {getWeekRange()}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigateWeek(1)}
                    aria-label="Next week"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {view === 'list' && (
                <Tabs value={filter} onValueChange={setFilter}>
                  <TabsList aria-label="Filter meetings">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12" role="status" aria-label="Loading meetings">
                <Loader2 className="h-8 w-8 animate-spin text-[#1B3A5F]" />
              </div>
            ) : view === 'week' ? (
              <div id="week-view" role="tabpanel">
                <WeekView
                  meetings={meetings}
                  currentDate={currentDate}
                  onNavigate={navigate}
                />
              </div>
            ) : sortedMeetings.length === 0 ? (
              <div id="list-view" role="tabpanel" className="text-center py-12">
                <CalendarDays className="h-16 w-16 text-slate-300 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No meetings found</h3>
                <p className="text-slate-600 mb-4">
                  {filter === 'upcoming' 
                    ? 'Click "Schedule Meeting" to create a new meeting'
                    : 'No past meetings to display'}
                </p>
                <Button onClick={() => setShowScheduleDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                  Schedule Meeting
                </Button>
              </div>
            ) : (
              <div id="list-view" role="tabpanel" className="space-y-4">
                {refreshing && (
                  <div className="flex items-center justify-center py-2 text-sm text-slate-500" role="status">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                    Syncing...
                  </div>
                )}
                {sortedMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.meeting_id}
                    meeting={meeting}
                    onCancel={handleCancel}
                    onNavigate={navigate}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ScheduleMeetingDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        claims={claims}
        onScheduled={handleScheduled}
      />
    </AgentLayout>
  );
}
