import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Clock, Video, Phone, MessageSquare, Users, ExternalLink, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function MeetingScheduler({ advocateId, advocateName, onClose, onScheduled }) {
  const [step, setStep] = useState('type');
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    meeting_type: 'video_call',
    scheduled_date: '',
    duration_minutes: 30,
    title: '',
    description: ''
  });

  const meetingTypes = [
    { value: 'video_call', label: 'Video Call', icon: Video, description: 'Face-to-face meeting online' },
    { value: 'phone_call', label: 'Phone Call', icon: Phone, description: 'Audio call only' },
    { value: 'messaging', label: 'Messaging', icon: MessageSquare, description: 'Chat-based communication' },
    { value: 'in_person', label: 'In Person', icon: Users, description: 'Meet in person' }
  ];

  const handleTypeSelect = (type) => {
    setFormData({ ...formData, meeting_type: type });
    setStep('datetime');
  };

  const handleDateChange = async (date) => {
    setFormData({ ...formData, scheduled_date: date });
    
    try {
      const response = await api.get(`/meetings/advocate/${advocateId}/availability?date=${date}`);
      setAvailableSlots(response.data.available_slots || []);
    } catch (err) {
      console.error('Failed to load availability:', err);
    }
  };

  const handleSlotSelect = (slot) => {
    setFormData({ ...formData, scheduled_date: slot.start_time });
    setStep('details');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/meetings', {
        advocate_id: advocateId,
        ...formData
      });

      toast.success('Meeting scheduled successfully!');
      if (onScheduled) onScheduled(response.data.meeting);
      if (onClose) onClose();
    } catch (err) {
      toast.error('Failed to schedule meeting');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Schedule Meeting</CardTitle>
          <CardDescription>with {advocateName || 'your advocate'}</CardDescription>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {step === 'type' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">How would you like to meet?</p>
            {meetingTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className={`w-full p-4 rounded-lg border text-left transition-all hover:border-[hsl(var(--primary))] hover:bg-white ${
                    formData.meeting_type === type.value ? 'border-[hsl(var(--primary))] bg-white' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[hsl(var(--primary))]/10">
                      <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 'datetime' && (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('type')} className="mb-2">
              Back
            </Button>
            
            <div className="space-y-2">
              <Label>Select a Date</Label>
              <Input
                type="date"
                min={getMinDate()}
                value={formData.scheduled_date.split('T')[0] || ''}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

            {availableSlots.length > 0 && (
              <div className="space-y-2">
                <Label>Available Times</Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot, i) => (
                    <button
                      key={i}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.available}
                      className={`p-2 text-sm rounded border transition-all ${
                        slot.available 
                          ? 'hover:border-[hsl(var(--primary))] hover:bg-white cursor-pointer'
                          : 'opacity-50 cursor-not-allowed bg-white'
                      }`}
                    >
                      {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <Clock className="inline h-4 w-4 mr-1" />
              Duration: {formData.duration_minutes} minutes
            </div>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('datetime')} className="mb-2">
              Back
            </Button>

            <div className="p-3 bg-white rounded-lg text-sm">
              <p className="font-medium">
                {meetingTypes.find(t => t.value === formData.meeting_type)?.label}
              </p>
              <p className="text-muted-foreground">
                {new Date(formData.scheduled_date).toLocaleString([], {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
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
              <Label htmlFor="description">Agenda / Notes (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What would you like to discuss?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function MeetingCard({ meeting, onJoin, onReschedule, onCancel }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video_call': return Video;
      case 'phone_call': return Phone;
      case 'messaging': return MessageSquare;
      case 'in_person': return Users;
      default: return Calendar;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-white text-slate-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-white text-slate-800';
    }
  };

  const TypeIcon = getTypeIcon(meeting.meeting_type);
  const meetingDate = new Date(meeting.scheduled_date);
  const isUpcoming = meetingDate > new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--primary))]/10">
              <TypeIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h4 className="font-medium">{meeting.title || 'Meeting with Advocate'}</h4>
              <p className="text-sm text-muted-foreground">
                {meetingDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                {' at '}
                {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <Badge className={`mt-2 ${getStatusColor(meeting.status)}`}>
                {meeting.status}
              </Badge>
            </div>
          </div>

          {isUpcoming && meeting.status !== 'cancelled' && (
            <div className="flex gap-2">
              {meeting.meeting_type === 'video_call' && meeting.meeting_link && (
                <Button size="sm" onClick={() => onJoin && onJoin(meeting)}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Join
                </Button>
              )}
            </div>
          )}
        </div>

        {meeting.dial_in_number && (
          <div className="mt-3 p-2 bg-white rounded text-sm">
            <p className="text-muted-foreground">Dial-in: {meeting.dial_in_number}</p>
            {meeting.dial_in_pin && <p className="text-muted-foreground">PIN: {meeting.dial_in_pin}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UpcomingMeetings({ meetings = [], onScheduleNew }) {
  if (meetings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground mb-4">No upcoming meetings</p>
          {onScheduleNew && (
            <Button onClick={onScheduleNew}>
              Schedule a Meeting
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.meeting_id} meeting={meeting} />
      ))}
    </div>
  );
}
