import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Info, LogOut, Eye } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../lib/auth-context';
import { useDemoMode } from '../context/DemoModeContext';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/marketing', '/terms', '/privacy', '/faq', '/help', '/support', '/how-to-sign-up', '/legal/partner-tos', '/legal/hipaa-baa', '/partner/register', '/advocate/register', '/pitch-deck', '/executive-summary'];

export default function DemoModeBanner() {
  const [dismissed, setDismissed] = React.useState(() => localStorage.getItem('demo_banner_dismissed') === 'true');
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { isDemoMode: isUrlDemoMode } = useDemoMode();

  const handleExitDemo = async () => {
    localStorage.removeItem('demo_banner_dismissed');
    if (isUrlDemoMode) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('demo');
      setSearchParams(newParams);
      return;
    }
    if (logout) {
      await logout();
    }
    navigate('/login');
  };
  
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  
  const isDemoUser = React.useMemo(() => {
    if (!isAuthenticated || !user) return false;
    if (user.is_demo) return true;
    if (user.email?.endsWith('@earnedit.demo')) return true;
    return false;
  }, [isAuthenticated, user]);
  
  const showBanner = !dismissed && !isPublicRoute && (isDemoUser || isUrlDemoMode);
  
  if (!showBanner) return null;
  
  return (
    <>
      <div className="h-10" />
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 print:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 flex-1 justify-center">
            {isUrlDemoMode ? (
              <Eye className="h-4 w-4 text-amber-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-amber-800">DEMO MODE</span>
            <span className="text-sm text-amber-700 hidden sm:inline">
              {isUrlDemoMode 
                ? '— Sample data for VA Lighthouse review'
                : '— Simulated data for demonstration'}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button 
              onClick={handleExitDemo}
              className="flex items-center gap-1 text-amber-700 hover:text-amber-900 text-sm font-medium bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded transition-colors"
            >
              <LogOut className="h-3 w-3" />
              Exit Demo
            </button>
            <button 
              onClick={() => { setDismissed(true); localStorage.setItem('demo_banner_dismissed', 'true'); }}
              className="text-amber-600 hover:text-amber-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function DemoFeatureNote({ feature, children }) {
  return (
    <Alert className="bg-amber-50 border-amber-200 mb-4">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 text-sm">
        <strong>Demo Mode:</strong> {feature} {children}
      </AlertDescription>
    </Alert>
  );
}
