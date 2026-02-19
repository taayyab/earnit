import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../lib/auth-context';

const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const BACKOFF_MULTIPLIER = 2;

export function useRealtimeUpdates() {
  const { user, token } = useAuth();
  const [connected, setConnected] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [error, setError] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  
  const eventSourceRef = useRef(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);
  const retryTimeoutRef = useRef(null);
  const eventHandlersRef = useRef({});
  const mountedRef = useRef(true);

  const registerHandler = useCallback((eventType, handler) => {
    if (!eventHandlersRef.current[eventType]) {
      eventHandlersRef.current[eventType] = [];
    }
    eventHandlersRef.current[eventType].push(handler);
    
    return () => {
      eventHandlersRef.current[eventType] = eventHandlersRef.current[eventType].filter(
        h => h !== handler
      );
    };
  }, []);

  const dispatchEvent = useCallback((eventType, data) => {
    const handlers = eventHandlersRef.current[eventType] || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (err) {
        console.error(`Error in ${eventType} handler:`, err);
      }
    });
  }, []);

  const disconnect = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setConnected(false);
    setConnectionId(null);
  }, []);

  const connect = useCallback(() => {
    if (!token || !user) {
      return;
    }

    disconnect();

    const baseUrl = window.location.origin;
    const sseUrl = `${baseUrl}/api/realtime/events?token=${encodeURIComponent(token)}`;
    
    try {
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('connected', (e) => {
        if (!mountedRef.current) return;
        
        try {
          const data = JSON.parse(e.data);
          setConnectionId(data.connection_id);
          setConnected(true);
          setError(null);
          retryDelayRef.current = INITIAL_RETRY_DELAY;
          dispatchEvent('connected', data);
        } catch (err) {
          console.error('Error parsing connected event:', err);
        }
      });

      eventSource.addEventListener('heartbeat', (e) => {
        if (!mountedRef.current) return;
        setLastEvent({ type: 'heartbeat', timestamp: new Date().toISOString() });
      });

      eventSource.addEventListener('claim_update', (e) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(e.data);
          setLastEvent({ type: 'claim_update', data, timestamp: new Date().toISOString() });
          dispatchEvent('claim_update', data);
        } catch (err) {
          console.error('Error parsing claim_update event:', err);
        }
      });

      eventSource.addEventListener('notification', (e) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(e.data);
          setLastEvent({ type: 'notification', data, timestamp: new Date().toISOString() });
          dispatchEvent('notification', data);
        } catch (err) {
          console.error('Error parsing notification event:', err);
        }
      });

      eventSource.addEventListener('queue_update', (e) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(e.data);
          setLastEvent({ type: 'queue_update', data, timestamp: new Date().toISOString() });
          dispatchEvent('queue_update', data);
        } catch (err) {
          console.error('Error parsing queue_update event:', err);
        }
      });

      eventSource.onerror = (err) => {
        if (!mountedRef.current) return;
        
        console.warn('SSE connection error, will retry:', err);
        setConnected(false);
        setError('Connection lost');
        
        eventSource.close();
        eventSourceRef.current = null;

        const delay = retryDelayRef.current;
        retryDelayRef.current = Math.min(delay * BACKOFF_MULTIPLIER, MAX_RETRY_DELAY);
        
        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current && token && user) {
            connect();
          }
        }, delay);
      };

    } catch (err) {
      console.error('Failed to create EventSource:', err);
      setError(err.message);
    }
  }, [token, user, disconnect, dispatchEvent]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (token && user) {
      connect();
    }
    
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [token, user, connect, disconnect]);

  return {
    connected,
    connectionId,
    error,
    lastEvent,
    registerHandler,
    reconnect: connect,
    disconnect
  };
}

export function useClaimUpdates(onClaimUpdate) {
  const { registerHandler } = useRealtimeUpdates();
  
  useEffect(() => {
    if (onClaimUpdate) {
      return registerHandler('claim_update', onClaimUpdate);
    }
  }, [registerHandler, onClaimUpdate]);
}

export function useNotificationUpdates(onNotification) {
  const { registerHandler } = useRealtimeUpdates();
  
  useEffect(() => {
    if (onNotification) {
      return registerHandler('notification', onNotification);
    }
  }, [registerHandler, onNotification]);
}

export function useQueueUpdates(onQueueUpdate) {
  const { registerHandler } = useRealtimeUpdates();
  
  useEffect(() => {
    if (onQueueUpdate) {
      return registerHandler('queue_update', onQueueUpdate);
    }
  }, [registerHandler, onQueueUpdate]);
}

export default useRealtimeUpdates;
