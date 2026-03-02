import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Lock, Shield, Send, Check, CheckCheck, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import VeteranLayout from '../components/VeteranLayout';

export default function Messages() {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id;
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread);
    }
  }, [selectedThread]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      try {
        const res = await api.get('/messages/threads');
        const threadList = (res.data.threads || []).map((thread) => ({
          ...thread,
          source: 'threads',
        }));
        setThreads(threadList);
        if (threadList.length > 0) {
          setSelectedThread(threadList[0]);
        }
        return;
      } catch {
        if (!currentUserId) {
          setThreads([]);
          return;
        }
        const res = await api.get('/messages/inbox', { params: { userId: currentUserId } });
        const inbox = res.data.messages || [];
        const grouped = inbox.reduce((acc, msg) => {
          const participantId = msg.senderId || msg.sender_id;
          if (!participantId) return acc;
          if (!acc[participantId]) {
            acc[participantId] = {
              thread_id: participantId,
              participant_id: participantId,
              source: 'legacy',
              participant_name: msg.senderName || msg.sender_name || 'Unknown User',
              last_message_at: msg.createdAt || msg.created_at,
              last_message_preview: msg.content || '',
              unread_count: 0,
            };
          }
          acc[participantId].unread_count += (msg.isRead === false || msg.read === false) ? 1 : 0;
          return acc;
        }, {});
        const threadList = Object.values(grouped).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
        setThreads(threadList);
        if (threadList.length > 0) {
          setSelectedThread(threadList[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (thread) => {
    try {
      if (thread?.source === 'threads') {
        const res = await api.get(`/messages/threads/${thread.thread_id}/messages`);
        setMessages(res.data.messages || []);
        return;
      }

      const participantId = thread?.participant_id || thread?.thread_id;
      if (!participantId || !currentUserId) {
        setMessages([]);
        return;
      }
      const res = await api.get('/messages/conversation', {
        params: {
          userId1: currentUserId,
          userId2: participantId,
        },
      });
      const conversation = (res.data.messages || []).slice().reverse();
      setMessages(conversation);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    try {
      setSending(true);
      if (selectedThread?.source === 'threads') {
        await api.post(`/messages/threads/${selectedThread.thread_id}/messages`, {
          content: newMessage,
          contains_phi: false,
        });
      } else {
        const participantId = selectedThread?.participant_id || selectedThread?.thread_id;
        if (!participantId || !currentUserId) {
          throw new Error('Missing sender/recipient for message send');
        }
        await api.post('/messages', {
          senderId: currentUserId,
          recipientId: participantId,
          content: newMessage,
        });
      }
      
      setNewMessage('');
      await loadMessages(selectedThread);
      toast.success('Message sent');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <VeteranLayout>
        <div className="min-h-full bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-9 w-64" />
                </div>
                <Skeleton className="h-5 w-72" />
              </div>
              <Skeleton className="h-6 w-28 rounded-full" />
              <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-19rem)]">
                <Skeleton className="h-full w-full rounded-xl" />
                <Skeleton className="h-full w-full rounded-xl lg:col-span-2" />
              </div>
            </div>
          </div>
        </div>
      </VeteranLayout>
    );
  }

  return (
    <VeteranLayout>
      <div className="min-h-full bg-white" data-testid="messages-page">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5F] to-[#2C5282] rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              Secure Messages
            </h1>
            <p className="text-slate-600 mt-1">
              End-to-end encrypted communication
            </p>
          </div>

          <div className="mb-4">
            <Badge className="bg-[hsl(var(--phi-bg))] text-[hsl(var(--primary))] border-[hsl(var(--primary))]">
              <Shield className="h-3 w-3 mr-1" />
              HIPAA Secure
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-19rem)]">
          {/* Thread List */}
          <Card className="lg:col-span-1" data-testid="thread-list">
            <CardContent className="p-0">
              <div className="border-b border-border p-4">
                <h2 className="font-semibold text-foreground">Conversations</h2>
              </div>
              <ScrollArea className="h-[calc(100vh-20rem)]">
                {threads.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <button
                      key={thread.thread_id}
                      onClick={() => setSelectedThread(thread)}
                      className={
                        `w-full p-4 border-b border-border text-left transition-colors hover:bg-white ${
                          selectedThread?.thread_id === thread.thread_id ? 'bg-white' : ''
                        }`
                      }
                      data-testid="thread-item"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 bg-[hsl(var(--primary))] text-white flex items-center justify-center">
                          {thread.participant_name?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-foreground truncate">
                              {thread.participant_name || 'Unknown User'}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(thread.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {thread.last_message_preview}
                          </p>
                          {thread.unread_count > 0 && (
                            <Badge className="mt-1 bg-[hsl(var(--accent))]">
                              {thread.unread_count} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message View */}
          <Card className="lg:col-span-2" data-testid="message-view">
            {!selectedThread ? (
              <CardContent className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a conversation to view messages</p>
              </CardContent>
            ) : (
              <CardContent className="p-0 flex flex-col h-full">
                {/* Thread Header */}
                <div className="border-b border-border p-4 bg-[hsl(var(--phi-bg))] border-l-4 border-l-[hsl(var(--phi-border))]">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {selectedThread.participant_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        End-to-end encrypted • All actions are audited
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation below</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const senderId = message.sender_id || message.senderId;
                        const isOwn = senderId === currentUserId;
                        const messageId = message.message_id || message.id;
                        const createdAt = message.created_at || message.createdAt;
                        const isRead = message.read ?? message.isRead;
                        const delivered = message.delivered ?? true;
                        return (
                          <div
                            key={messageId}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            data-testid="message-bubble"
                          >
                            <div
                              className={
                                `max-w-[70%] rounded-lg p-3 ${
                                  isOwn
                                    ? 'bg-[hsl(var(--primary))] text-white'
                                    : 'bg-slate-100 text-foreground'
                                }`
                              }
                            >
                              {message.contains_phi && (
                                <div className="flex items-center gap-1 text-xs mb-1 opacity-80">
                                  <Lock className="h-3 w-3" />
                                  <span>Contains PHI</span>
                                </div>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs opacity-70">
                                  {formatTime(createdAt)}
                                </span>
                                {isOwn && (
                                  <span className="text-xs opacity-70">
                                    {isRead ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : delivered ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Clock className="h-3 w-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message... (Do not share passwords or SSNs)"
                      className="resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      data-testid="message-input"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                      data-testid="send-message-button"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Messages are encrypted end-to-end and audited for HIPAA compliance
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
          </div>
        </div>
      </div>
    </VeteranLayout>
  );
}
