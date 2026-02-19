import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../lib/auth-context';
import { useToast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_BEFORE_TIMEOUT_MS = 3 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

export function SessionTimeoutWarning() {
  const { isAuthenticated, logout, token } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(WARNING_BEFORE_TIMEOUT_MS);
  
  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const showWarningRef = useRef(false);
  const isAuthenticatedRef = useRef(isAuthenticated);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    showWarningRef.current = false;
    setTimeRemaining(WARNING_BEFORE_TIMEOUT_MS);
    
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    if (isAuthenticatedRef.current) {
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true);
        showWarningRef.current = true;
        setTimeRemaining(WARNING_BEFORE_TIMEOUT_MS);
        
        countdownIntervalRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            const newTime = prev - 1000;
            return newTime > 0 ? newTime : 0;
          });
        }, 1000);
      }, SESSION_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS);
      
      logoutTimerRef.current = setTimeout(() => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setShowWarning(false);
        
        toast({
          title: 'Session Expired',
          description: 'Your session has expired due to inactivity. Please sign in again.',
          variant: 'destructive',
        });
        
        logout();
      }, SESSION_TIMEOUT_MS);
    }
  }, [toast, logout]);

  const handleExtendSession = useCallback(() => {
    resetTimers();
    
    toast({
      title: 'Session Extended',
      description: 'Your session has been extended for another 15 minutes.',
    });
  }, [resetTimers, toast]);

  const handleLogoutNow = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowWarning(false);
    showWarningRef.current = false;
    logout();
  }, [logout]);

  const handleActivity = useCallback(() => {
    if (!showWarningRef.current && isAuthenticatedRef.current) {
      const now = Date.now();
      if (now - lastActivityRef.current > 60000) {
        resetTimers();
      }
      lastActivityRef.current = now;
    }
  }, [resetTimers]);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    showWarningRef.current = showWarning;
  }, [showWarning]);

  useEffect(() => {
    if (isAuthenticated) {
      resetTimers();
      
      ACTIVITY_EVENTS.forEach(event => {
        window.addEventListener(event, handleActivity, { passive: true });
      });
      
      return () => {
        ACTIVITY_EVENTS.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current);
          warningTimerRef.current = null;
        }
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
          logoutTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      };
    }
  }, [isAuthenticated, handleActivity, resetTimers]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      showWarningRef.current = false;
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  }, [isAuthenticated]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated || !showWarning) {
    return null;
  }

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Session Expiring Soon
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Your session will expire in <span className="font-bold text-red-600">{formatTime(timeRemaining)}</span> due to inactivity.
            </p>
            <p>
              Would you like to continue working? Click "Stay Signed In" to extend your session.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleLogoutNow} className="sm:w-auto">
            Sign Out
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleExtendSession} className="bg-red-700 hover:bg-red-800 sm:w-auto">
            Stay Signed In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default SessionTimeoutWarning;
