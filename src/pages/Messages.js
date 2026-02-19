import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import PageHeader from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar } from '../components/ui/avatar';
import { Lock, Shield, Send, Check, CheckCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Messages() {
  const { user } = useAuth();
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
      loadMessages(selectedThread.thread_id);
    }
  }, [selectedThread]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages/threads');
      setThreads(res.data.threads || []);
      if (res.data.threads?.length > 0) {
        setSelectedThread(res.data.threads[0]);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId) => {
    try {
      const res = await api.get(`/messages/threads/${threadId}/messages`);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    try {
      setSending(true);
      await api.post(`/messages/threads/${selectedThread.thread_id}/messages`, {
        content: newMessage,
        contains_phi: false // In production, this would be auto-detected
      });
      
      setNewMessage('');
      await loadMessages(selectedThread.thread_id);
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
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-white rounded" />
            <div className="h-96 bg-white rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="messages-page">
      <PageHeader 
        title="Secure Messages"
        subtitle="End-to-end encrypted communication"
        showBackButton={false}
        showHomeButton={true}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Badge className="bg-[hsl(var(--phi-bg))] text-[hsl(var(--primary))] border-[hsl(var(--primary))]">
            <Shield className="h-3 w-3 mr-1" />
            HIPAA Secure
          </Badge>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
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
                        const isOwn = message.sender_id === user?.id;
                        return (
                          <div
                            key={message.message_id}
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
                                  {formatTime(message.created_at)}
                                </span>
                                {isOwn && (
                                  <span className="text-xs opacity-70">
                                    {message.read ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : message.delivered ? (
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
  );
}
