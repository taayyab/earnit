import React, { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import AdvocateLayout from '../../components/AdvocateLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Calendar } from '../../components/ui/calendar';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
} from 'lucide-react';
import { toast } from 'sonner';

const MEETING_TYPES = {
  check_in: { label: 'Check-in', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: MessageSquare },
  document_review: { label: 'Document Review', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: FileText },
  milestone_celebration: { label: 'Milestone Celebration', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: PartyPopper },
  video_call: { label: 'Video Call', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Video },
  phone_call: { label: 'Phone Call', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: Phone },
  in_person: { label: 'In Person', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: Users },
};

const MEETING_STATUSES = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  rescheduled: { label: 'Rescheduled', color: 'bg-amber-100 text-amber-800' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

function MeetingCard({ meeting, onReschedule, onCancel, onSendReminder }) {
  const meetingType = MEETING_TYPES[meeting.meeting_type] || MEETING_TYPES.check_in;
  const meetingStatus = MEETING_STATUSES[meeting.status] || MEETING_STATUSES.scheduled;
  const TypeIcon = meetingType.icon;
  const meetingDate = new Date(meeting.scheduled_date);
  const isUpcoming = meetingDate > new Date();
  const isPast = meetingDate < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${meetingType.color}`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {meeting.title || `${meetingType.label} with ${meeting.veteran_name || 'Veteran'}`}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>{meetingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <Clock className="h-3 w-3 ml-1" />
                <span>{meetingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-xs ${meetingType.color}`}>
                  {meetingType.label}
                </Badge>
                <Badge className={`text-xs ${meetingStatus.color}`}>
                  {meetingStatus.label}
                </Badge>
              </div>
            </div>
          </div>
          
          {isUpcoming && meeting.status !== 'cancelled' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSendReminder(meeting)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onReschedule(meeting)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reschedule
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCancel(meeting)} className="text-red-600">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {meeting.description && (
          <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{meeting.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ScheduleMeetingDialog({ open, onOpenChange, veterans, onSchedule }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    veteran_id: '',
    meeting_type: 'check_in',
    scheduled_date: '',
    scheduled_time: '10:00',
    duration_minutes: 30,
    title: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.veteran_id || !formData.scheduled_date) {
      toast.error('Please select a veteran and date');
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
        title: formData.title || `${MEETING_TYPES[formData.meeting_type]?.label || 'Meeting'}`,
        description: formData.description,
      });
      setFormData({
        veteran_id: '',
        meeting_type: 'check_in',
        scheduled_date: '',
        scheduled_time: '10:00',
        duration_minutes: 30,
        title: '',
        description: '',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule New Meeting</DialogTitle>
          <DialogDescription>
            Schedule a meeting with one of your assigned veterans
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="veteran">Select Veteran *</Label>
            <Select
              value={formData.veteran_id}
              onValueChange={(value) => setFormData({ ...formData, veteran_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a veteran..." />
              </SelectTrigger>
              <SelectContent>
                {veterans.map((veteran) => (
                  <SelectItem key={veteran.id} value={veteran.id}>
                    {veteran.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Meeting Type</Label>
            <Select
              value={formData.meeting_type}
              onValueChange={(value) => setFormData({ ...formData, meeting_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEETING_TYPES).map(([value, { label, icon: Icon }]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                min={getMinDate()}
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={formData.duration_minutes.toString()}
              onValueChange={(value) => setFormData({ ...formData, duration_minutes: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Weekly check-in"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Agenda (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Topics to discuss..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RescheduleDialog({ open, onOpenChange, meeting, onReschedule }) {
  const [loading, setLoading] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate) {
      toast.error('Please select a new date');
      return;
    }

    setLoading(true);
    try {
      const newDateTime = `${newDate}T${newTime}:00`;
      await onReschedule(meeting.meeting_id, newDateTime, reason);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to reschedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Meeting</DialogTitle>
          <DialogDescription>
            Select a new date and time for this meeting
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-date">New Date *</Label>
              <Input
                id="new-date"
                type="date"
                min={getMinDate()}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-time">New Time *</Label>
              <Input
                id="new-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Reason for rescheduling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Rescheduling...' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CalendarView({ meetings, selectedDate, onDateChange, view }) {
  const meetingDates = useMemo(() => {
    const dates = {};
    meetings.forEach((m) => {
      const dateKey = new Date(m.scheduled_date).toDateString();
      if (!dates[dateKey]) dates[dateKey] = [];
      dates[dateKey].push(m);
    });
    return dates;
  }, [meetings]);

  const getDayContent = (day) => {
    const dateKey = day.toDateString();
    const dayMeetings = meetingDates[dateKey] || [];
    if (dayMeetings.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-0.5 justify-center mt-1">
        {dayMeetings.slice(0, 3).map((m, i) => {
          const type = MEETING_TYPES[m.meeting_type] || MEETING_TYPES.check_in;
          return (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${type.color.split(' ')[0]}`}
            />
          );
        })}
      </div>
    );
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  if (view === 'weekly') {
    const weekDays = getWeekDays();
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(selectedDate.getDate() - 7);
              onDateChange(newDate);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-sm">
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(selectedDate.getDate() + 7);
              onDateChange(newDate);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dateKey = day.toDateString();
            const dayMeetings = meetingDates[dateKey] || [];
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={day.toISOString()}
                className={`p-2 rounded-lg border cursor-pointer transition-colors min-h-[100px] ${
                  isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                } ${isToday ? 'bg-blue-50' : ''}`}
                onClick={() => onDateChange(day)}
              >
                <div className="text-center mb-2">
                  <div className="text-xs text-muted-foreground">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </div>
                </div>
                <div className="space-y-1">
                  {dayMeetings.slice(0, 2).map((m, i) => {
                    const type = MEETING_TYPES[m.meeting_type] || MEETING_TYPES.check_in;
                    return (
                      <div
                        key={i}
                        className={`text-xs p-1 rounded truncate ${type.color}`}
                      >
                        {new Date(m.scheduled_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    );
                  })}
                  {dayMeetings.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayMeetings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => date && onDateChange(date)}
      className="rounded-md border"
      components={{
        DayContent: ({ date }) => (
          <div>
            {date.getDate()}
            {getDayContent(date)}
          </div>
        ),
      }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdvocateCalendar() {
  const [meetings, setMeetings] = useState([]);
  const [veterans, setVeterans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('monthly');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, veteransRes] = await Promise.all([
        api.get('/meetings'),
        api.get('/peer-support/my-assignments'),
      ]);

      const meetingsData = meetingsRes.data.meetings || [];
      setMeetings(meetingsData);

      const assignments = veteransRes.data.assignments || [];
      const mappedVeterans = assignments.map((a) => ({
        id: a.veteran?.id || a.id,
        name: a.veteran?.first_name || `Veteran #${a.veteran?.id?.slice(-6) || 'Unknown'}`,
      }));
      setVeterans(mappedVeterans);
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
      .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
      .slice(0, 5);
  }, [meetings]);

  const selectedDateMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const meetingDate = new Date(m.scheduled_date);
      return meetingDate.toDateString() === selectedDate.toDateString();
    });
  }, [meetings, selectedDate]);

  const pastMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((m) => new Date(m.scheduled_date) < now || m.status === 'completed')
      .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))
      .slice(0, 10);
  }, [meetings]);

  const handleSchedule = async (meetingData) => {
    try {
      const veteran = veterans.find((v) => v.id === meetingData.veteran_id);
      await api.post('/meetings', {
        ...meetingData,
        advocate_id: null,
      });
      toast.success(`Meeting scheduled with ${veteran?.name || 'veteran'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to schedule meeting');
      throw error;
    }
  };

  const handleReschedule = async (meetingId, newDate, reason) => {
    try {
      await api.put(`/meetings/${meetingId}/reschedule`, {
        new_date: newDate,
        reason: reason,
      });
      toast.success('Meeting rescheduled successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to reschedule meeting');
      throw error;
    }
  };

  const handleCancel = async (meeting) => {
    try {
      await api.put(`/meetings/${meeting.meeting_id}/cancel`);
      toast.success('Meeting cancelled');
      loadData();
    } catch (error) {
      toast.error('Failed to cancel meeting');
    }
  };

  const handleSendReminder = async (meeting) => {
    toast.success(`Reminder sent for meeting with ${meeting.veteran_name || 'veteran'}`);
  };

  const openRescheduleDialog = (meeting) => {
    setSelectedMeeting(meeting);
    setRescheduleDialogOpen(true);
  };

  return (
    <AdvocateLayout>
      <div className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Calendar</h1>
                <p className="text-muted-foreground mt-1">
                  Schedule and manage meetings with your veterans
                </p>
              </div>
              <Button
                onClick={() => setScheduleDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Calendar View</CardTitle>
                  <Tabs value={calendarView} onValueChange={setCalendarView}>
                    <TabsList className="grid w-[200px] grid-cols-2">
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <CalendarView
                  meetings={meetings}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  view={calendarView}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-emerald-600" />
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardTitle>
                <CardDescription>
                  {selectedDateMeetings.length === 0
                    ? 'No meetings scheduled for this day'
                    : `${selectedDateMeetings.length} meeting${selectedDateMeetings.length > 1 ? 's' : ''} scheduled`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton />
                ) : selectedDateMeetings.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No meetings on this day</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setScheduleDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule a Meeting
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateMeetings.map((meeting) => (
                      <MeetingCard
                        key={meeting.meeting_id}
                        meeting={meeting}
                        onReschedule={openRescheduleDialog}
                        onCancel={handleCancel}
                        onSendReminder={handleSendReminder}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-slate-500" />
                  Meeting History
                </CardTitle>
                <CardDescription>Past meetings with your veterans</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton />
                ) : pastMeetings.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No past meetings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastMeetings.map((meeting) => (
                      <MeetingCard
                        key={meeting.meeting_id}
                        meeting={meeting}
                        onReschedule={openRescheduleDialog}
                        onCancel={handleCancel}
                        onSendReminder={handleSendReminder}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Upcoming Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingMeetings.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming meetings</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4 pr-4">
                      {upcomingMeetings.map((meeting) => {
                        const type = MEETING_TYPES[meeting.meeting_type] || MEETING_TYPES.check_in;
                        const TypeIcon = type.icon;
                        const meetingDate = new Date(meeting.scheduled_date);

                        return (
                          <div
                            key={meeting.meeting_id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                            onClick={() => setSelectedDate(meetingDate)}
                          >
                            <div className={`p-2 rounded-full ${type.color}`}>
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {meeting.veteran_name || 'Veteran'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {meetingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {meetingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meeting Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(MEETING_TYPES).slice(0, 3).map(([key, { label, color, icon: Icon }]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ScheduleMeetingDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        veterans={veterans}
        onSchedule={handleSchedule}
      />

      <RescheduleDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        meeting={selectedMeeting}
        onReschedule={handleReschedule}
      />
    </AdvocateLayout>
  );
}
