import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../ui/dialog';
import {
  Bell,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Loader2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const REMINDER_TYPES = {
  follow_up: { label: 'Follow-up', color: 'bg-blue-100 text-blue-800' },
  first_reminder: { label: 'First Reminder', color: 'bg-yellow-100 text-yellow-800' },
  second_reminder: { label: 'Second Reminder', color: 'bg-orange-100 text-orange-800' },
  escalation: { label: 'Escalation', color: 'bg-red-100 text-red-800' },
  appointment: { label: 'Appointment', color: 'bg-blue-50 text-[#1B3A5F]' },
  deadline: { label: 'Deadline', color: 'bg-pink-100 text-pink-800' },
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

export function ReminderManager({ claimId, veteranId }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/communications/reminders');
      const claimReminders = claimId 
        ? response.data.reminders.filter(r => r.claim_id === claimId)
        : response.data.reminders;
      setReminders(claimReminders);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReminder = async (reminderId) => {
    try {
      await api.delete(`/communications/reminders/${reminderId}`);
      toast.success('Reminder cancelled');
      loadReminders();
    } catch (error) {
      console.error('Failed to cancel reminder:', error);
      toast.error('Failed to cancel reminder');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const upcomingReminders = pendingReminders.filter(r => {
    const days = getDaysUntil(r.scheduled_for);
    return days !== null && days <= 3 && days >= 0;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Follow-up Reminders
            {pendingReminders.length > 0 && (
              <Badge variant="secondary">{pendingReminders.length} pending</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadReminders}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <ScheduleReminderDialog
              claimId={claimId}
              veteranId={veteranId}
              onCreated={loadReminders}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingReminders.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-sm text-yellow-800">
                {upcomingReminders.length} reminder{upcomingReminders.length !== 1 ? 's' : ''} due soon
              </span>
            </div>
            <div className="space-y-1">
              {upcomingReminders.map((r) => (
                <div key={r.id} className="text-xs text-yellow-700">
                  {REMINDER_TYPES[r.type]?.label || r.type}: {formatDate(r.scheduled_for)}
                </div>
              ))}
            </div>
          </div>
        )}

        {reminders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No reminders scheduled</p>
            <p className="text-xs">Schedule a follow-up to stay on top of communications</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {reminders.map((reminder) => {
                const daysUntil = getDaysUntil(reminder.scheduled_for);
                const isOverdue = daysUntil !== null && daysUntil < 0;
                const isUpcoming = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0;
                
                return (
                  <div 
                    key={reminder.id}
                    className={`p-3 rounded-lg border ${
                      reminder.status === 'pending' 
                        ? isOverdue 
                          ? 'bg-red-50 border-red-200' 
                          : isUpcoming 
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-card border-border'
                        : STATUS_COLORS[reminder.status] || 'bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={REMINDER_TYPES[reminder.type]?.color || 'bg-gray-100'}>
                            {REMINDER_TYPES[reminder.type]?.label || reminder.type}
                          </Badge>
                          <Badge variant="outline" className={STATUS_COLORS[reminder.status] || ''}>
                            {reminder.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(reminder.scheduled_for)}</span>
                          {reminder.status === 'pending' && daysUntil !== null && (
                            <span className={`text-xs ${
                              isOverdue ? 'text-red-600' : isUpcoming ? 'text-yellow-600' : 'text-muted-foreground'
                            }`}>
                              ({isOverdue ? `${Math.abs(daysUntil)}d overdue` : 
                                daysUntil === 0 ? 'Today' : 
                                daysUntil === 1 ? 'Tomorrow' : 
                                `in ${daysUntil}d`})
                            </span>
                          )}
                        </div>
                        
                        {reminder.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {reminder.notes}
                          </p>
                        )}
                      </div>
                      
                      {reminder.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleCancelReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function ScheduleReminderDialog({ claimId, veteranId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [reminderType, setReminderType] = useState('follow_up');
  const [scheduledFor, setScheduledFor] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!scheduledFor) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      setCreating(true);
      await api.post('/communications/reminders', {
        claim_id: claimId,
        veteran_id: veteranId,
        reminder_type: reminderType,
        scheduled_for: new Date(scheduledFor).toISOString(),
        notes: notes || null,
      });
      
      toast.success('Reminder scheduled');
      setOpen(false);
      resetForm();
      
      if (onCreated) {
        onCreated();
      }
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      toast.error('Failed to schedule reminder');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setReminderType('follow_up');
    setScheduledFor('');
    setNotes('');
  };

  const getQuickDates = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0);
    
    const twoWeeks = new Date(now);
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    twoWeeks.setHours(9, 0, 0, 0);
    
    return [
      { label: 'Tomorrow 9 AM', date: tomorrow },
      { label: '1 Week', date: nextWeek },
      { label: '2 Weeks', date: twoWeeks },
    ];
  };

  const formatDateForInput = (date) => {
    return date.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Follow-up Reminder</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Reminder Type</Label>
            <Select value={reminderType} onValueChange={setReminderType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REMINDER_TYPES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Quick Select</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {getQuickDates().map(({ label, date }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduledFor(formatDateForInput(date))}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="scheduled-for" className="text-sm font-medium">Date & Time</Label>
            <Input
              id="scheduled-for"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this reminder..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating || !scheduledFor}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Schedule Reminder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReminderManager;
