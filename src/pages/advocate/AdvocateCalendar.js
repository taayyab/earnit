import React, { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import AdvocateLayout from '../../components/AdvocateLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  X,
  Send,
  CheckCircle2,
  History,
  FileText,
  PartyPopper,
  MessageSquare,
  ArrowLeft,
  CalendarDays,
  Sparkles,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

const MEETING_TYPES = {
  check_in: { label: 'Check-in', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: MessageSquare },
  document_review: { label: 'Document Review', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: FileText },
  milestone_celebration: { label: 'Milestone', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: PartyPopper },
  video_call: { label: 'Video Call', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', icon: Video },
  phone_call: { label: 'Phone Call', color: 'bg-sky-100 text-sky-700 border-sky-200', dot: 'bg-sky-500', icon: Phone },
  in_person: { label: 'In Person', color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500', icon: Users },
};

const MEETING_STATUSES = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  rescheduled: { label: 'Rescheduled', color: 'bg-amber-100 text-amber-800' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MeetingCard({ meeting, onReschedule, onCancel, onSendReminder }) {
  const meetingType = MEETING_TYPES[meeting.meeting_type] || MEETING_TYPES.check_in;
  const meetingStatus = MEETING_STATUSES[meeting.status] || MEETING_STATUSES.scheduled;
  const TypeIcon = meetingType.icon;
  const meetingDate = new Date(meeting.scheduled_date);
  const isUpcoming = meetingDate > new Date();

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all">
      <div className={`p-2.5 rounded-xl ${meetingType.color} flex-shrink-0`}>
        <TypeIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-slate-900 truncate">
              {meeting.title || `${meetingType.label} with ${meeting.veteran_name || 'Veteran'}`}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {meetingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {meetingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          {isUpcoming && meeting.status !== 'cancelled' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSendReminder(meeting)}>
                  <Send className="h-4 w-4 mr-2" /> Send Reminder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onReschedule(meeting)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Reschedule
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCancel(meeting)} className="text-red-600">
                  <X className="h-4 w-4 mr-2" /> Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge className={`text-xs px-2 py-0.5 ${meetingType.color}`}>{meetingType.label}</Badge>
          <Badge className={`text-xs px-2 py-0.5 ${meetingStatus.color}`}>{meetingStatus.label}</Badge>
        </div>
        {meeting.description && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-1">{meeting.description}</p>
        )}
      </div>
    </div>
  );
}

function MonthCalendar({ meetings, selectedDate, onDateChange, onMonthChange, viewMonth }) {
  const meetingDates = useMemo(() => {
    const dates = {};
    meetings.forEach((m) => {
      const dateKey = new Date(m.scheduled_date).toDateString();
      if (!dates[dateKey]) dates[dateKey] = [];
      dates[dateKey].push(m);
    });
    return dates;
  }, [meetings]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const days = [];
  // Fill leading blanks
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  return (
    <div>
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const prev = new Date(viewMonth);
            prev.setMonth(prev.getMonth() - 1);
            onMonthChange(prev);
          }}
          className="hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-slate-800">
          {MONTHS[month]} {year}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const next = new Date(viewMonth);
            next.setMonth(next.getMonth() + 1);
            onMonthChange(next);
          }}
          className="hover:bg-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day) return <div key={`blank-${idx}`} />;
          const dateKey = day.toDateString();
          const dayMeetings = meetingDates[dateKey] || [];
          const isToday = day.toDateString() === today.toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateChange(day)}
              className={`relative flex flex-col items-center py-1.5 px-1 rounded-lg transition-all text-sm
                ${isSelected ? 'bg-emerald-600 text-white' : isToday ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-100 text-slate-700'}
              `}
            >
              <span>{day.getDate()}</span>
              {dayMeetings.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayMeetings.slice(0, 3).map((m, i) => {
                    const type = MEETING_TYPES[m.meeting_type] || MEETING_TYPES.check_in;
                    return (
                      <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : type.dot}`} />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleMeetingScreen({ veterans, onSchedule, onBack }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: pick type, 2: pick veteran + details
  const [formData, setFormData] = useState({
    veteran_id: '',
    meeting_type: '',
    scheduled_date: '',
    scheduled_time: '10:00',
    duration_minutes: 30,
    title: '',
    description: '',
  });

  const getMinDate = () => new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.veteran_id || !formData.scheduled_date || !formData.meeting_type) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
      await onSchedule({
        veteran_id: formData.veteran_id,
        meeting_type: formData.meeting_type,
        scheduled_date: scheduledDateTime,
        duration_minutes: formData.duration_minutes,
        title: formData.title || MEETING_TYPES[formData.meeting_type]?.label,
        description: formData.description,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Schedule a Meeting</h1>
          <p className="text-sm text-slate-500">Set up a time to connect with your veteran</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  step === s ? 'bg-emerald-600 text-white shadow-sm' :
                  step > s ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  step > s ? 'bg-emerald-600 text-white' : step === s ? 'bg-white text-emerald-600' : 'bg-slate-400 text-white'
                }`}>
                  {step > s ? '✓' : s}
                </span>
                {s === 1 ? 'Meeting Type' : 'Details & Time'}
              </div>
              {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Pick meeting type */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">What type of meeting?</h2>
            <p className="text-sm text-slate-500 mb-6">Choose the format that works best for your veteran</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(MEETING_TYPES).map(([value, { label, color, icon: Icon }]) => (
                <button
                  key={value}
                  onClick={() => {
                    setFormData({ ...formData, meeting_type: value });
                    setStep(2);
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    formData.meeting_type === value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-sm text-slate-800">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pick veteran, date, time, details */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl ${MEETING_TYPES[formData.meeting_type]?.color}`}>
                {React.createElement(MEETING_TYPES[formData.meeting_type]?.icon || CalendarIcon, { className: 'h-5 w-5' })}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {MEETING_TYPES[formData.meeting_type]?.label}
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Change type
                </button>
              </div>
            </div>

            <div className="space-y-5 bg-white rounded-2xl border border-slate-200 p-6">
              {/* Veteran */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <User className="h-4 w-4 text-slate-400" />
                  Select Veteran <span className="text-red-500">*</span>
                </Label>
                {veterans.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                    No assigned veterans found. You'll be able to schedule meetings once veterans are assigned to you.
                  </div>
                ) : (
                  <Select
                    value={formData.veteran_id}
                    onValueChange={(v) => setFormData({ ...formData, veteran_id: v })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose a veteran..." />
                    </SelectTrigger>
                    <SelectContent>
                      {veterans.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                                {v.name?.charAt(0) || 'V'}
                              </AvatarFallback>
                            </Avatar>
                            {v.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm font-medium">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    min={getMinDate()}
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm font-medium">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="h-11"
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Duration</Label>
                <div className="flex gap-2">
                  {[15, 30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration_minutes: mins })}
                      className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                        formData.duration_minutes === mins
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-slate-200 text-slate-600 hover:border-emerald-400'
                      }`}
                    >
                      {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Title <span className="text-slate-400 text-xs">(optional)</span></Label>
                <Input
                  placeholder={`e.g., Weekly ${MEETING_TYPES[formData.meeting_type]?.label || 'meeting'}`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-11"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Notes / Agenda <span className="text-slate-400 text-xs">(optional)</span></Label>
                <Textarea
                  placeholder="Topics to discuss, goals for this meeting..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-11 text-base font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Scheduling...</span>
                ) : (
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Confirm Meeting</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function RescheduleDialog({ open, onOpenChange, meeting, onReschedule }) {
  const [loading, setLoading] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate) { toast.error('Please select a new date'); return; }
    setLoading(true);
    try {
      await onReschedule(meeting.meeting_id, `${newDate}T${newTime}:00`, reason);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>New Date *</Label>
              <Input type="date" min={new Date().toISOString().split('T')[0]} value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>New Time *</Label>
              <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea placeholder="Reason for rescheduling..." value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'Rescheduling...' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdvocateCalendar() {
  const [meetings, setMeetings] = useState([]);
  const [veterans, setVeterans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(new Date());
  const [scheduling, setScheduling] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, veteransRes] = await Promise.all([
        api.get('/meetings'),
        api.get('/peer-support/my-assignments'),
      ]);
      setMeetings(meetingsRes.data.meetings || []);
      const assignments = veteransRes.data.assignments || [];
      setVeterans(assignments.map((a) => ({
        id: a.veteran?.id || a.id,
        name: a.veteran?.first_name || a.veteran?.name || `Veteran #${(a.veteran?.id || a.id)?.slice(-6) || 'Unknown'}`,
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((m) => new Date(m.scheduled_date) >= now && m.status !== 'cancelled')
      .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
  }, [meetings]);

  const selectedDateMeetings = useMemo(() => {
    return meetings.filter((m) =>
      new Date(m.scheduled_date).toDateString() === selectedDate.toDateString()
    );
  }, [meetings, selectedDate]);

  const pastMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((m) => new Date(m.scheduled_date) < now || m.status === 'completed')
      .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))
      .slice(0, 10);
  }, [meetings]);

  const handleSchedule = async (meetingData) => {
    const veteran = veterans.find((v) => v.id === meetingData.veteran_id);
    await api.post('/meetings', { ...meetingData, advocate_id: null });
    toast.success(`Meeting scheduled with ${veteran?.name || 'veteran'}`);
    setScheduling(false);
    loadData();
  };

  const handleReschedule = async (meetingId, newDate, reason) => {
    await api.put(`/meetings/${meetingId}/reschedule`, { new_date: newDate, reason });
    toast.success('Meeting rescheduled');
    loadData();
  };

  const handleCancel = async (meeting) => {
    try {
      await api.put(`/meetings/${meeting.meeting_id}/cancel`);
      toast.success('Meeting cancelled');
      loadData();
    } catch { toast.error('Failed to cancel meeting'); }
  };

  const handleSendReminder = (meeting) => {
    toast.success(`Reminder sent for meeting with ${meeting.veteran_name || 'veteran'}`);
  };

  // Full-screen scheduling view
  if (scheduling) {
    return (
      <AdvocateLayout>
        <ScheduleMeetingScreen
          veterans={veterans}
          onSchedule={handleSchedule}
          onBack={() => setScheduling(false)}
        />
      </AdvocateLayout>
    );
  }

  return (
    <AdvocateLayout>
      <div className="min-h-full bg-slate-50">
        {/* Page header */}
        <div className="bg-white border-b px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-emerald-600" />
                Calendar
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {upcomingMeetings.length > 0
                  ? `${upcomingMeetings.length} upcoming meeting${upcomingMeetings.length > 1 ? 's' : ''}`
                  : 'No upcoming meetings'}
              </p>
            </div>
            <Button
              onClick={() => setScheduling(true)}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Calendar + meetings for selected day */}
            <div className="flex-1 space-y-6">
              {/* Mini calendar card */}
              <Card className="shadow-sm">
                <CardContent className="p-5">
                  <MonthCalendar
                    meetings={meetings}
                    selectedDate={selectedDate}
                    onDateChange={(d) => { setSelectedDate(d); setViewMonth(d); }}
                    onMonthChange={setViewMonth}
                    viewMonth={viewMonth}
                  />
                </CardContent>
              </Card>

              {/* Selected day meetings */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </CardTitle>
                      <CardDescription className="mt-0.5">
                        {selectedDateMeetings.length === 0
                          ? 'No meetings scheduled'
                          : `${selectedDateMeetings.length} meeting${selectedDateMeetings.length > 1 ? 's' : ''}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                    </div>
                  ) : selectedDateMeetings.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CalendarIcon className="h-7 w-7 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No meetings this day</p>
                      <p className="text-xs text-slate-400 mt-1">Click "Schedule Meeting" to add one</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setScheduling(true)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Schedule for this day
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateMeetings.map((meeting) => (
                        <MeetingCard
                          key={meeting.meeting_id}
                          meeting={meeting}
                          onReschedule={(m) => { setSelectedMeeting(m); setRescheduleDialogOpen(true); }}
                          onCancel={handleCancel}
                          onSendReminder={handleSendReminder}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meeting history */}
              {pastMeetings.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="h-4 w-4 text-slate-400" />
                      Past Meetings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pastMeetings.map((meeting) => (
                        <MeetingCard
                          key={meeting.meeting_id}
                          meeting={meeting}
                          onReschedule={(m) => { setSelectedMeeting(m); setRescheduleDialogOpen(true); }}
                          onCancel={handleCancel}
                          onSendReminder={handleSendReminder}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right sidebar: upcoming meetings */}
            <div className="w-full lg:w-72 space-y-6">
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="shadow-sm">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {loading ? '—' : upcomingMeetings.length}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Upcoming</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-slate-700">
                      {loading ? '—' : pastMeetings.length}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Completed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming meetings list */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <div className="space-y-1 flex-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingMeetings.length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">All clear — no upcoming meetings</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[320px]">
                      <div className="space-y-2 pr-2">
                        {upcomingMeetings.slice(0, 8).map((meeting) => {
                          const type = MEETING_TYPES[meeting.meeting_type] || MEETING_TYPES.check_in;
                          const TypeIcon = type.icon;
                          const meetingDate = new Date(meeting.scheduled_date);
                          const isToday = meetingDate.toDateString() === new Date().toDateString();

                          return (
                            <button
                              key={meeting.meeting_id}
                              className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left border border-transparent hover:border-slate-200"
                              onClick={() => { setSelectedDate(meetingDate); setViewMonth(meetingDate); }}
                            >
                              <div className={`p-1.5 rounded-lg ${type.color} flex-shrink-0`}>
                                <TypeIcon className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-800 truncate">
                                  {meeting.veteran_name || 'Veteran'}
                                </p>
                                <p className={`text-xs ${isToday ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                                  {isToday ? 'Today' : meetingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  {' · '}
                                  {meetingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Meeting type legend */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-slate-500 uppercase tracking-wide">Meeting Types</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {Object.entries(MEETING_TYPES).map(([key, { label, dot }]) => (
                      <div key={key} className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
                        <span className="text-xs text-slate-600">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <RescheduleDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        meeting={selectedMeeting}
        onReschedule={handleReschedule}
      />
    </AdvocateLayout>
  );
}
