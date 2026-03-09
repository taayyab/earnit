import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { getSocket } from '../lib/socket';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Bell, Check, CheckCheck, X, FileText, Calendar, UserPlus, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthSafe } from '../lib/auth-context';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthSafe();

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    // Poll for new notifications every 30 seconds (fallback)
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Real-time: connect to socket and listen for new_notification events
  useEffect(() => {
    const userId = user?.id || user?.user_id;
    if (!userId) return;
    const socket = getSocket(userId);
    socket.emit('join', userId);

    const handleNewNotification = (notification) => {
      setNotifications(prev => {
        if (prev.some(n => n.notification_id === notification.notification_id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);
    return () => { socket.off('new_notification', handleNewNotification); };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (error) {
      // Silently ignore auth errors - user will be redirected
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Failed to load notifications:', error);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      await api.post(`/notifications/${notification.notification_id}/read`);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notification.notification_id
            ? { ...n, read: true }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Navigate if action URL exists
      if (notification.action_url) {
        setOpen(false);
        navigate(notification.action_url);
      }
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { className: "h-5 w-5" };
    switch (type) {
      case 'claim_update':
        return <FileText {...iconProps} className="h-5 w-5 text-blue-600" />;
      case 'document_received':
        return <FileText {...iconProps} className="h-5 w-5 text-green-600" />;
      case 'agent_assigned':
        return <UserPlus {...iconProps} className="h-5 w-5 text-[#1B3A5F]" />;
      case 'meeting_scheduled':
        return <Calendar {...iconProps} className="h-5 w-5 text-[#1B3A5F]" />;
      case 'deadline_reminder':
        return <Clock {...iconProps} className="h-5 w-5 text-amber-600" />;
      case 'urgent':
        return <AlertTriangle {...iconProps} className="h-5 w-5 text-red-600" />;
      case 'message':
        return <MessageSquare {...iconProps} className="h-5 w-5 text-teal-600" />;
      default:
        return <Bell {...iconProps} className="h-5 w-5 text-slate-600" />;
    }
  };

  const getNotificationStyles = (type, read) => {
    if (read) {
      return 'bg-background hover:bg-muted/50 border-l-4 border-l-transparent opacity-75';
    }
    const baseUnread = 'border-l-4 hover:opacity-90';
    switch (type) {
      case 'urgent':
      case 'deadline_reminder':
        return `bg-amber-50 ${baseUnread} border-l-amber-500`;
      case 'claim_update':
      case 'claim_status_change':
        return `bg-blue-50 ${baseUnread} border-l-blue-500`;
      case 'agent_assigned':
      case 'advocate_connection_accepted':
        return `bg-blue-50 ${baseUnread} border-l-[#1B3A5F]`;
      case 'meeting_scheduled':
      case 'meeting_reminder_24h':
      case 'meeting_reminder_1h':
        return `bg-blue-50 ${baseUnread} border-l-[#1B3A5F]`;
      default:
        return `bg-slate-50 ${baseUnread} border-l-[hsl(var(--accent))]`;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          data-testid="notification-bell"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[hsl(var(--accent))] text-xs"
              data-testid="notification-badge"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs"
              data-testid="mark-all-read-button"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.notification_id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-4 text-left transition-all ${getNotificationStyles(notification.type, notification.read)}`}
                  data-testid="notification-item"
                  data-read={notification.read ? 'true' : 'false'}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 p-2 rounded-lg shadow-sm ${notification.read ? 'bg-muted' : 'bg-white'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--accent))] mt-1 animate-pulse" />
                        )}
                      </div>
                      <p className={`text-sm line-clamp-2 ${!notification.read ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatTime(notification.created_at)}
                        </p>
                        {notification.read && notification.read_at && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Check className="h-3 w-3" /> Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
