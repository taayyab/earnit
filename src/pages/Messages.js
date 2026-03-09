import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import { getSocket } from '../lib/socket';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Lock, Shield, Send, Check, CheckCheck, Clock, MessageSquare, Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import VeteranLayout from '../components/VeteranLayout';
import AdvocateLayout from '../components/AdvocateLayout';

export default function Messages() {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id;
  const advocateRoles = ['advocate', 'veteran_advocate', 'peer_mentor', 'peer_supporter'];
  const isAdvocate = advocateRoles.includes(user?.role);
  const Layout = isAdvocate ? AdvocateLayout : VeteranLayout;
  // Theme tokens: green for advocate, blue for veteran
  const theme = isAdvocate ? {
    iconBg: 'from-emerald-600 to-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    avatar: 'bg-emerald-600',
    unread: 'bg-emerald-100 text-emerald-700',
    threadHeader: 'bg-emerald-50 border-l-emerald-500',
    shieldIcon: 'text-emerald-600',
    bubble: 'bg-emerald-600 text-white',
    composePicker: 'bg-emerald-600',
  } : {
    iconBg: 'from-[#1B3A5F] to-[#2C5282]',
    badge: 'bg-blue-50 text-blue-700 border border-blue-300',
    btn: 'bg-[#1B3A5F] hover:bg-[#2C5282]',
    avatar: 'bg-[#1B3A5F]',
    unread: 'bg-blue-100 text-blue-700',
    threadHeader: 'bg-blue-50 border-l-[#1B3A5F]',
    shieldIcon: 'text-[#1B3A5F]',
    bubble: 'bg-[#1B3A5F] text-white',
    composePicker: 'bg-[#1B3A5F]',
  };
  const location = useLocation();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [acceptingConnection, setAcceptingConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [advocates, setAdvocates] = useState([]);
  const [loadingAdvocates, setLoadingAdvocates] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState(new Set());
  const selectedThreadRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Keep ref in sync so socket handler has current value
  useEffect(() => { selectedThreadRef.current = selectedThread; }, [selectedThread]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* ignore */ }
  };

  const selectThread = (thread) => {
    setSelectedThread(thread);
    // Clear unread badge immediately when thread is opened
    setThreads(prev => prev.map(t =>
      t.thread_id === thread.thread_id ? { ...t, unread_count: 0 } : t
    ));
  };

  useEffect(() => {
    loadThreads();
  }, []);

  // Refresh threads when the tab becomes visible (e.g. switching between Marcus and Sarah tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadThreads();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread);
    }
  }, [selectedThread]);

  // Socket: connect and listen for incoming messages
  useEffect(() => {
    if (!currentUserId) return;
    const socket = getSocket(currentUserId);
    socket.emit('join', currentUserId);

    const handleNewMessage = (msg) => {
      const thread = selectedThreadRef.current;
      const senderId = msg.sender_id || msg.senderId;
      const isActiveThread = thread && (thread.thread_id === senderId || thread.participant_id === senderId);

      // Play sound for every incoming message
      playNotificationSound();

      // If this message belongs to the open thread, append it
      if (isActiveThread) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, { ...msg, is_mine: false }];
        });
      }

      // Update thread preview in sidebar
      setThreads(prev => {
        const exists = prev.find(t => t.thread_id === senderId || t.participant_id === senderId);
        if (exists) {
          return prev.map(t =>
            (t.thread_id === senderId || t.participant_id === senderId)
              ? {
                  ...t,
                  last_message_preview: msg.content,
                  last_message_at: msg.sent_at,
                  unread_count: isActiveThread ? 0 : (t.unread_count || 0) + 1,
                }
              : t
          );
        }
        // New thread from unknown sender — add it
        return [{
          thread_id: senderId,
          participant_id: senderId,
          participant_name: msg.sender_name || 'New message',
          source: 'threads',
          last_message_preview: msg.content,
          last_message_at: msg.sent_at,
          unread_count: 1,
        }, ...prev];
      });
    };

    socket.on('new_message', handleNewMessage);
    return () => { socket.off('new_message', handleNewMessage); };
  }, [currentUserId]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      let threadList = [];

      try {
        const res = await api.get('/messages/threads');
        threadList = (res.data.threads || []).map((thread) => ({
          ...thread,
          source: 'threads',
        }));
      } catch {
        if (currentUserId) {
          try {
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
            threadList = Object.values(grouped).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
          } catch { /* ignore */ }
        }
      }

      // Check if we were navigated here with ?advocateId=xxx
      const params = new URLSearchParams(location.search);
      const advocateId = params.get('advocateId');

      if (advocateId) {
        // Resolve advocate's actual USER ID (not the advocates table row ID)
        // The messages table FK requires users.id, not advocates.id
        let advocateName = 'Your Advocate';
        let actualParticipantId = advocateId; // fallback

        try {
          const advRes = await api.get('/advocates/my-advocate');
          if (advRes.data.hasAdvocate && advRes.data.advocate) {
            advocateName = advRes.data.advocate.name || advRes.data.advocate.first_name || 'Your Advocate';
            if (advRes.data.advocate.userId) {
              actualParticipantId = advRes.data.advocate.userId;
            }
          } else {
            // Connection is pending — my-advocate won't return it.
            // Look up the advocate's userId from the available-advocates list
            // so we match the thread correctly (advocates.id ≠ users.id).
            try {
              const availRes = await api.get('/vet-advocate/available-advocates');
              const found = (availRes.data.advocates || []).find(
                a => a.id === advocateId || a.userId === advocateId
              );
              if (found) {
                advocateName = found.name || 'Your Advocate';
                actualParticipantId = found.userId || actualParticipantId;
              }
            } catch { /* ignore */ }
          }
        } catch { /* use fallback */ }

        // Deduplicate threadList — same person can appear with two different IDs
        // (e.g. advocates.id vs users.id from different code paths)
        const deduped = new Map();
        for (const t of threadList) {
          const key = t.participant_id || t.thread_id;
          if (!deduped.has(key)) {
            deduped.set(key, t);
          }
        }
        threadList = Array.from(deduped.values());

        const existing = threadList.find(
          (t) => t.participant_id === advocateId || t.thread_id === advocateId ||
                 t.participant_id === actualParticipantId || t.thread_id === actualParticipantId
        );
        if (existing) {
          const cleared = threadList.map(t => t.thread_id === existing.thread_id ? { ...t, unread_count: 0 } : t);
          setThreads(cleared);
          setSelectedThread(existing);
        } else {
          const syntheticThread = {
            thread_id: actualParticipantId,
            participant_id: actualParticipantId,
            participant_name: advocateName,
            source: 'new',
            last_message_preview: 'Start a conversation...',
            last_message_at: new Date().toISOString(),
            unread_count: 0,
          };
          // Merge synthetic with threadList, but avoid adding it if participant already exists
          const alreadyExists = threadList.some(
            t => t.participant_id === actualParticipantId || t.thread_id === actualParticipantId
          );
          const merged = alreadyExists ? threadList : [syntheticThread, ...threadList];
          setThreads(merged);
          const selectTarget = alreadyExists
            ? threadList.find(t => t.participant_id === actualParticipantId || t.thread_id === actualParticipantId)
            : syntheticThread;
          setSelectedThread(selectTarget || syntheticThread);
        }
      } else {
        setThreads(threadList);
        if (threadList.length > 0) {
          // Auto-select first thread and clear its unread count
          const first = threadList[0];
          setSelectedThread(first);
          setThreads(threadList.map((t, i) => i === 0 ? { ...t, unread_count: 0 } : t));
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
      if (thread?.source === 'new') {
        setMessages([]);
        return;
      }
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
        // 'new' or 'legacy' — use direct message endpoint
        const participantId = selectedThread?.participant_id || selectedThread?.thread_id;
        if (!participantId || !currentUserId) {
          throw new Error('Missing sender/recipient for message send');
        }
        await api.post('/messages', {
          senderId: currentUserId,
          recipientId: participantId,
          content: newMessage,
        });
        // After first message sent, upgrade thread source so subsequent loads work
        if (selectedThread.source === 'new') {
          const upgraded = { ...selectedThread, source: 'threads' };
          setSelectedThread(upgraded);
          setThreads((prev) => prev.map((t) => t.thread_id === upgraded.thread_id ? upgraded : t));
        }
      }

      const sentContent = newMessage;
      setNewMessage('');

      // Optimistically update the thread preview in the left panel
      const now = new Date().toISOString();
      setThreads(prev => prev.map(t =>
        t.thread_id === selectedThread.thread_id
          ? { ...t, last_message_preview: sentContent, last_message_at: now }
          : t
      ));

      await loadMessages({ ...selectedThread, source: selectedThread.source === 'new' ? 'threads' : selectedThread.source });
      toast.success('Message sent');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const openCompose = async () => {
    setShowCompose(true);
    if (advocates.length > 0 && !loadingAdvocates) return;
    setLoadingAdvocates(true);
    try {
      if (isAdvocate) {
        // Advocates can message any veteran in the system
        const res = await api.get('/peer-support/veterans');
        const veterans = (res.data.veterans || []).filter(v => v.id);
        setAdvocates(veterans);
      } else {
        // Veterans compose to their advocate
        const res = await api.get('/advocates');
        setAdvocates(res.data.advocates || res.data || []);
      }
    } catch {
      toast.error(isAdvocate ? 'Could not load veterans' : 'Could not load advocates');
    } finally {
      setLoadingAdvocates(false);
    }
  };

  const startConversation = (person) => {
    // For advocates: person.id is veteran's users.id directly
    // For veterans: person.userId is the advocate's users.id
    const participantId = isAdvocate
      ? (person.id)
      : (person.userId || person.user_id || person.id);
    const participantName = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || (isAdvocate ? 'Veteran' : 'Advocate');
    const existing = threads.find(t => t.participant_id === participantId || t.thread_id === participantId);
    if (existing) {
      setSelectedThread(existing);
      setShowCompose(false);
      return;
    }
    const syntheticThread = {
      thread_id: participantId,
      participant_id: participantId,
      participant_name: participantName,
      source: 'new',
      last_message_preview: 'Start a conversation...',
      last_message_at: new Date().toISOString(),
      unread_count: 0,
    };
    setThreads(prev => [syntheticThread, ...prev.filter(t => t.thread_id !== participantId)]);
    setSelectedThread(syntheticThread);
    setShowCompose(false);
  };

  const toggleSelectMode = () => {
    setSelectMode(prev => !prev);
    setSelectedThreadIds(new Set());
  };

  const toggleThreadSelection = (threadId) => {
    setSelectedThreadIds(prev => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId);
      else next.add(threadId);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedThreadIds.size === 0) return;
    try {
      for (const threadId of selectedThreadIds) {
        await api.delete(`/messages/threads/${threadId}`);
      }
      const deletedIds = new Set(selectedThreadIds);
      setThreads(prev => prev.filter(t => !deletedIds.has(t.thread_id)));
      if (selectedThread && deletedIds.has(selectedThread.thread_id)) {
        setSelectedThread(null);
        setMessages([]);
      }
      setSelectedThreadIds(new Set());
      setSelectMode(false);
      toast.success(`${deletedIds.size} conversation${deletedIds.size > 1 ? 's' : ''} deleted`);
    } catch {
      toast.error('Failed to delete conversations');
    }
  };

  const handleAcceptConnection = async (veteranUserId) => {
    try {
      setAcceptingConnection(veteranUserId + '_accept');
      await api.post(`/vet-advocate/accept-connection/${veteranUserId}`);
      toast.success('Connection accepted! The veteran has been notified.');
      // Reload messages to remove the action buttons
      if (selectedThread) await loadMessages(selectedThread);
    } catch (error) {
      toast.error('Failed to accept connection');
    } finally {
      setAcceptingConnection(null);
    }
  };

  const handleDeclineConnection = async (veteranUserId) => {
    try {
      setAcceptingConnection(veteranUserId + '_decline');
      await api.post(`/vet-advocate/decline-connection/${veteranUserId}`);
      toast.success('Connection declined.');
      if (selectedThread) await loadMessages(selectedThread);
    } catch (error) {
      toast.error('Failed to decline connection');
    } finally {
      setAcceptingConnection(null);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col bg-white overflow-hidden" data-testid="messages-page">
        <div className="flex flex-col flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${theme.iconBg} rounded-xl flex items-center justify-center`}>
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              Secure Messages
            </h1>
            <p className="text-slate-600 mt-1">
              End-to-end encrypted communication
            </p>
          </div>

          <div className="mb-4">
            <Badge className={`${theme.badge} text-xs px-2.5 py-1`}>
              <Shield className="h-3 w-3 mr-1" />
              HIPAA Secure
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Thread List */}
          <Card className="lg:col-span-1 flex flex-col min-h-0 overflow-hidden" data-testid="thread-list">
            <CardContent className="p-0 flex flex-col flex-1 min-h-0">
              <div className="border-b border-border p-4 flex items-center justify-between gap-2">
                <h2 className="font-semibold text-foreground flex-1 min-w-0 truncate">
                  {selectMode
                    ? selectedThreadIds.size > 0
                      ? `${selectedThreadIds.size} selected`
                      : 'Select chats'
                    : 'Conversations'}
                </h2>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {selectMode ? (
                    <>
                      {selectedThreadIds.size > 0 && (
                        <button
                          onClick={handleDeleteSelected}
                          title="Delete selected"
                          className="flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                          style={{ width: 32, height: 32 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={toggleSelectMode}
                        title="Cancel"
                        className="flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        style={{ width: 32, height: 32 }}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      {threads.length > 0 && (
                        <button
                          onClick={toggleSelectMode}
                          title="Select chats to delete"
                          className="flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          style={{ width: 32, height: 32 }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      <button
                        onClick={openCompose}
                        title="New conversation"
                        className={`${theme.btn} flex items-center justify-center rounded-lg shadow-sm text-white`}
                        style={{ width: 32, height: 32 }}
                      >
                        <Plus size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Compose: advocate picker */}
              {showCompose && (
                <div className="border-b border-border bg-slate-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">{isAdvocate ? 'Select a veteran' : 'Select an advocate'}</p>
                    <button onClick={() => setShowCompose(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {loadingAdvocates ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full rounded" />
                      <Skeleton className="h-10 w-full rounded" />
                    </div>
                  ) : advocates.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{isAdvocate ? 'No assigned veterans yet' : 'No advocates available'}</p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {advocates.map(adv => (
                        <button
                          key={adv.id}
                          onClick={() => startConversation(adv)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white border border-transparent hover:border-slate-200 text-left transition-colors"
                        >
                          <div className={`h-7 w-7 rounded-full ${theme.composePicker} text-white text-xs flex items-center justify-center font-semibold shrink-0`}>
                            {(adv.name || adv.first_name || (isAdvocate ? 'V' : 'A'))[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{adv.name || `${adv.first_name || ''} ${adv.last_name || ''}`.trim()}</p>
                            {!isAdvocate && adv.specialties && <p className="text-xs text-muted-foreground truncate">{Array.isArray(adv.specialties) ? adv.specialties[0] : adv.specialties}</p>}
                            {isAdvocate && <p className="text-xs text-muted-foreground">Veteran</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <ScrollArea className="flex-1 min-h-0">
                {threads.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground space-y-3">
                    <p className="text-sm">No conversations yet</p>
                    <Button size="sm" variant="outline" onClick={openCompose} className="gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      Start a conversation
                    </Button>
                  </div>
                ) : (
                  threads.map((thread) => {
                    const isChecked = selectedThreadIds.has(thread.thread_id);
                    return (
                      <button
                        key={thread.thread_id}
                        onClick={() => selectMode ? toggleThreadSelection(thread.thread_id) : selectThread(thread)}
                        className={
                          `w-full px-4 py-3 border-b border-border text-left transition-colors hover:bg-white ${
                            selectedThread?.thread_id === thread.thread_id && !selectMode ? 'bg-white' : ''
                          } ${isChecked ? 'bg-slate-50' : ''}`
                        }
                        data-testid="thread-item"
                      >
                        <div className="flex items-center gap-3">
                          {selectMode ? (
                            <div className={`h-8 w-8 flex items-center justify-center flex-shrink-0 rounded-full border-2 transition-colors ${isChecked ? 'border-red-500 bg-red-500' : 'border-slate-300 bg-white'}`}>
                              {isChecked && <Check className="h-3.5 w-3.5 text-white" />}
                            </div>
                          ) : (
                            <Avatar className={`h-8 w-8 ${theme.avatar} text-white flex items-center justify-center text-xs font-semibold`}>
                              {thread.participant_name?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between">
                              <p className="font-medium text-foreground truncate text-sm">
                                {thread.participant_name || 'Unknown User'}
                              </p>
                              {!selectMode && (
                                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                  {formatTime(thread.last_message_at)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate leading-tight">
                              {thread.last_message_preview}
                            </p>
                            {!selectMode && thread.unread_count > 0 && (
                              <Badge className={`mt-1 ${theme.unread}`}>
                                {thread.unread_count} new
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message View */}
          <Card className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden" data-testid="message-view">
            {!selectedThread ? (
              <CardContent className="flex items-center justify-center flex-1 text-muted-foreground">
                <p>Select a conversation to view messages</p>
              </CardContent>
            ) : (
              <CardContent className="p-0 flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Thread Header */}
                <div className={`border-b border-border p-4 ${theme.threadHeader} border-l-4`}>
                  <div className="flex items-center gap-3">
                    <Shield className={`h-4 w-4 ${theme.shieldIcon}`} />
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
                <ScrollArea className="flex-1 min-h-0 p-4 bg-slate-50">
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
                        const createdAt = message.sent_at || message.created_at || message.createdAt;
                        const isRead = message.read ?? message.isRead;
                        const delivered = message.delivered ?? true;
                        const isConnectionRequest = message.subject === 'New Connection Request' || message.content?.includes('has requested to connect with you');
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
                                    ? theme.bubble
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
                              {/* Accept/Decline buttons for connection requests (advocate only) */}
                              {isConnectionRequest && !isOwn && isAdvocate && (
                                <div className="flex gap-2 mt-3 pt-2 border-t border-slate-200">
                                  <button
                                    onClick={() => handleAcceptConnection(senderId)}
                                    disabled={!!acceptingConnection}
                                    className="flex-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-60 transition-colors"
                                  >
                                    {acceptingConnection === senderId + '_accept' ? 'Accepting...' : 'Accept'}
                                  </button>
                                  <button
                                    onClick={() => handleDeclineConnection(senderId)}
                                    disabled={!!acceptingConnection}
                                    className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md disabled:opacity-60 transition-colors"
                                  >
                                    {acceptingConnection === senderId + '_decline' ? 'Declining...' : 'Decline'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
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
                      className={theme.btn}
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
    </Layout>
  );
}
