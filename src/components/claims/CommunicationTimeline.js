import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Send,
  Mail,
  MailOpen,
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle2,
  User,
  Users,
  RefreshCw,
  Loader2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { MessageComposer } from './MessageComposer';

const EVENT_ICONS = {
  message: { sent: Send, received: Mail },
  reminder: Bell,
};

const URGENCY_COLORS = {
  ok: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
};

export function CommunicationTimeline({ claimId, veteranId, veteranName }) {
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState(new Set());

  useEffect(() => {
    if (claimId) {
      loadTimeline();
    }
  }, [claimId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/communications/timeline/${claimId}`);
      setTimeline(response.data.timeline || []);
      setSummary(response.data.summary || null);
    } catch (error) {
      console.error('Failed to load communication timeline:', error);
      toast.error('Failed to load communications');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (eventId) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const renderEventIcon = (event) => {
    if (event.type === 'message') {
      const Icon = event.subtype === 'sent' ? Send : Mail;
      const color = event.subtype === 'sent' ? 'text-blue-600' : 'text-green-600';
      return <Icon className={`h-4 w-4 ${color}`} />;
    } else if (event.type === 'reminder') {
      const color = event.status === 'pending' ? 'text-yellow-600' : 'text-gray-400';
      return <Bell className={`h-4 w-4 ${color}`} />;
    }
    return <MessageSquare className="h-4 w-4 text-gray-500" />;
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadTimeline}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <MessageComposer
              claimId={claimId}
              veteranId={veteranId}
              veteranName={veteranName}
              onMessageSent={loadTimeline}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{summary.total_messages}</div>
              <div className="text-xs text-muted-foreground">Total Messages</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.sent_by_agent}</div>
              <div className="text-xs text-muted-foreground">Sent by Agent</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{summary.received_from_veteran}</div>
              <div className="text-xs text-muted-foreground">From Veteran</div>
            </div>
            {summary.awaiting_response > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{summary.awaiting_response}</div>
                <div className="text-xs text-muted-foreground">Awaiting Response</div>
              </div>
            )}
          </div>
        )}

        {timeline.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No communications yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-muted" />
              
              {timeline.map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute left-[-18px] p-1 bg-white rounded-full border">
                    {renderEventIcon(event)}
                  </div>
                  
                  <div 
                    className={`ml-2 p-3 rounded-lg border cursor-pointer transition-colors hover:border-primary/50 ${
                      event.type === 'message' && event.subtype === 'received' && !event.read
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-card'
                    }`}
                    onClick={() => toggleExpand(event.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {event.type === 'message' && (
                            <>
                              <span className="font-medium text-sm">
                                {event.subtype === 'sent' ? 'Sent to Veteran' : 'Received from Veteran'}
                              </span>
                              {!event.read && event.subtype === 'received' && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                              {event.requires_response && !event.response_received && (
                                <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                                  Awaiting Response
                                </Badge>
                              )}
                            </>
                          )}
                          {event.type === 'reminder' && (
                            <>
                              <span className="font-medium text-sm">
                                {event.subtype === 'first_reminder' ? 'First Reminder' : 
                                 event.subtype === 'second_reminder' ? 'Second Reminder' :
                                 event.subtype === 'escalate' ? 'Escalation' : 'Follow-up Reminder'}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${event.status === 'pending' ? 'border-yellow-500 text-yellow-700' : 'border-gray-300 text-gray-500'}`}
                              >
                                {event.status}
                              </Badge>
                            </>
                          )}
                        </div>
                        
                        {event.subject && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {event.subject}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(event.timestamp)}
                        </span>
                        {expandedEvents.has(event.id) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    
                    {expandedEvents.has(event.id) && (
                      <div className="mt-3 pt-3 border-t">
                        {event.type === 'message' && event.body_preview && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {event.body_preview}
                          </p>
                        )}
                        {event.type === 'reminder' && event.notes && (
                          <p className="text-sm text-muted-foreground">{event.notes}</p>
                        )}
                        {event.sender_name && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {event.sender_name}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function OverdueCommunications() {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadOverdue();
  }, []);

  const loadOverdue = async () => {
    try {
      setLoading(true);
      const response = await api.get('/communications/overdue');
      setOverdue(response.data.messages || []);
    } catch (error) {
      console.error('Failed to load overdue communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const processEscalations = async () => {
    try {
      setProcessing(true);
      const response = await api.post('/communications/process-escalations');
      const created = response.data.escalations_created?.length || 0;
      if (created > 0) {
        toast.success(`Created ${created} escalation reminder(s)`);
      } else {
        toast.info('No new escalations needed');
      }
      loadOverdue();
    } catch (error) {
      console.error('Failed to process escalations:', error);
      toast.error('Failed to process escalations');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (overdue.length === 0) {
    return null;
  }

  const urgentCount = overdue.filter(m => m.urgency === 'overdue').length;
  const warningCount = overdue.filter(m => m.urgency === 'warning').length;

  return (
    <Card className={urgentCount > 0 ? 'border-red-300' : warningCount > 0 ? 'border-yellow-300' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${urgentCount > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
            Awaiting Veteran Response
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={processEscalations}
              disabled={processing}
              title="Process escalations for overdue messages"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Badge variant={urgentCount > 0 ? 'destructive' : 'secondary'}>
              {overdue.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="max-h-[200px]">
          <div className="space-y-2">
            {overdue.slice(0, 5).map((msg) => (
              <div 
                key={msg.message_id}
                className={`p-2 rounded border ${URGENCY_COLORS[msg.urgency] || ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1">
                    {msg.subject}
                  </span>
                  <Badge variant="outline" className="text-xs ml-2">
                    {msg.days_waiting}d
                  </Badge>
                </div>
                {msg.escalation_level && (
                  <div className="text-xs mt-1 text-muted-foreground">
                    Next: {msg.escalation_level.replace(/_/g, ' ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        {overdue.length > 5 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            +{overdue.length - 5} more
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default CommunicationTimeline;
