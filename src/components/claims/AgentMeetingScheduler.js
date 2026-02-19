import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../ui/dialog';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  Users,
  Plus,
  ExternalLink,
  Loader2,
  X,
  CalendarPlus,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

const MEETING_TYPES = [
  { value: 'video_call', label: 'Video Call', icon: Video, description: 'Face-to-face online' },
  { value: 'phone_call', label: 'Phone Call', icon: Phone, description: 'Audio call only' },
  { value: 'in_person', label: 'In Person', icon: Users, description: 'Meet in person' },
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
];

function ScheduleMeetingDialog({ claimId, veteranName, onScheduled, trigger }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    meeting_type: 'video_call',
    scheduled_date: '',
    scheduled_time: '10:00',
    duration_minutes: 30,
    title: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.scheduled_date || !formData.scheduled_time) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
      
      const response = await api.post('/agent/meetings', {
        claim_id: claimId,
        scheduled_date: scheduledDateTime,
        duration_minutes: formData.duration_minutes,
        meeting_type: formData.meeting_type,
        title: formData.title || undefined,
        description: formData.description || undefined,
      });

      toast.success('Meeting scheduled successfully!');
      setOpen(false);
      setFormData({
        meeting_type: 'video_call',
        scheduled_date: '',
        scheduled_time: '10:00',
        duration_minutes: 30,
        title: '',
        description: '',
      });
      
      if (onScheduled) {
        onScheduled(response.data.meeting);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            Schedule Meeting
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Client Meeting
          </DialogTitle>
          <DialogDescription>
            Schedule a meeting with {veteranName || 'your client'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {MEETING_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.meeting_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, meeting_type: type.value })}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'border-[#1B3A5F] bg-[#1B3A5F]/5 ring-1 ring-[#1B3A5F]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${isSelected ? 'text-[#1B3A5F]' : 'text-slate-500'}`} />
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
              <Label htmlFor="date">Date</Label>
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
              <Label htmlFor="time">Time</Label>
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
            <Label>Duration</Label>
            <Select
              value={String(formData.duration_minutes)}
              onValueChange={(val) => setFormData({ ...formData, duration_minutes: parseInt(val) })}
            >
              <SelectTrigger>
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
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Initial Claim Review"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes / Agenda (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Topics to discuss..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
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

function MeetingItem({ meeting, onCancel }) {
  const [cancelling, setCancelling] = useState(false);
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video_call': return Video;
      case 'phone_call': return Phone;
      case 'in_person': return Users;
      default: return Calendar;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

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

  const TypeIcon = getTypeIcon(meeting.meeting_type);
  const meetingDate = new Date(meeting.scheduled_date);
  const isUpcoming = meetingDate > new Date() && meeting.status !== 'cancelled';

  return (
    <div className="p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-[#1B3A5F]/10 shrink-0">
            <TypeIcon className="h-4 w-4 text-[#1B3A5F]" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-sm truncate">
              {meeting.title || 'Client Meeting'}
            </h4>
            <p className="text-xs text-muted-foreground">
              {meetingDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              {' at '}
              {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-xs ${getStatusColor(meeting.status)}`}>
                {meeting.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {meeting.duration_minutes} min
              </span>
            </div>
          </div>
        </div>

        {isUpcoming && (
          <div className="flex items-center gap-1 shrink-0">
            {meeting.meeting_link && meeting.meeting_type === 'video_call' && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => window.open(meeting.meeting_link, '_blank')}
                title="Join meeting"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleCancel}
              disabled={cancelling}
              title="Cancel meeting"
            >
              {cancelling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        )}
      </div>

      {meeting.dial_in_number && meeting.status !== 'cancelled' && (
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          Dial-in: {meeting.dial_in_number}
          {meeting.dial_in_pin && ` (PIN: ${meeting.dial_in_pin})`}
        </div>
      )}
    </div>
  );
}

export function AgentMeetingPanel({ claimId, veteranName }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/agent/meetings/claim/${claimId}`);
      setMeetings(response.data.meetings || []);
    } catch (error) {
      if (error.response?.status === 403) {
        setMeetings([]);
      } else {
        console.error('Failed to load meetings:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleScheduled = (newMeeting) => {
    setMeetings(prev => [newMeeting, ...prev]);
  };

  const handleCancel = (meetingId) => {
    setMeetings(prev =>
      prev.map(m =>
        m.meeting_id === meetingId ? { ...m, status: 'cancelled' } : m
      )
    );
  };

  const upcomingMeetings = meetings.filter(
    m => new Date(m.scheduled_date) >= new Date() && m.status !== 'cancelled'
  );
  const pastMeetings = meetings.filter(
    m => new Date(m.scheduled_date) < new Date() || m.status === 'cancelled'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {upcomingMeetings.length} upcoming
        </span>
        <ScheduleMeetingDialog
          claimId={claimId}
          veteranName={veteranName}
          onScheduled={handleScheduled}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No meetings scheduled</p>
          <p className="text-xs text-muted-foreground mt-1">
            Schedule a meeting to connect with your client
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingMeetings.map((meeting) => (
            <MeetingItem
              key={meeting.meeting_id}
              meeting={meeting}
              onCancel={handleCancel}
            />
          ))}
          {pastMeetings.length > 0 && upcomingMeetings.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Past Meetings</p>
              {pastMeetings.slice(0, 3).map((meeting) => (
                <MeetingItem
                  key={meeting.meeting_id}
                  meeting={meeting}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
          {pastMeetings.length > 0 && upcomingMeetings.length === 0 && (
            pastMeetings.slice(0, 5).map((meeting) => (
              <MeetingItem
                key={meeting.meeting_id}
                meeting={meeting}
                onCancel={handleCancel}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function AgentMeetingCard({ claimId, veteranName }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Client Meetings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AgentMeetingPanel claimId={claimId} veteranName={veteranName} />
      </CardContent>
    </Card>
  );
}

export default AgentMeetingPanel;
