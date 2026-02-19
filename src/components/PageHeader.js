import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthSafe } from '../lib/auth-context';
import { Button } from './ui/button';
import NotificationCenter from './NotificationCenter';
import MobileNav from './MobileNav';
import { PendingAccreditationBadge } from './PendingAccreditationBadge';
import { Shield, Home, ArrowLeft, LogOut } from 'lucide-react';
import logoImage from '../assets/logo.webp';

export default function PageHeader({ title, subtitle, showBackButton = true, backTo = '/dashboard', showHomeButton = true, showAccreditationStatus = false }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthSafe();

  const handleSignOut = async () => {
    if (logout) {
      await logout();
    }
    navigate('/login');
  };

  return (
    <div className="border-b border-border bg-white sticky top-0 z-50" data-testid="page-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isAuthenticated && <MobileNav />}
            <Link to="/" className="flex items-center gap-3">
              <img src={logoImage} alt="EarnedIT" className="h-16 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#1B3A5F]">EarnedIT</h1>
                <p className="text-xs text-slate-500">Veteran Benefits Platform</p>
              </div>
            </Link>
            {showAccreditationStatus && (
              <PendingAccreditationBadge variant="compact" className="hidden md:inline-flex" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => navigate(backTo)}
                data-testid="back-button"
                className="hidden sm:flex"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {showHomeButton && (
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                data-testid="home-button"
                className="hidden sm:flex"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            )}
            {user && (
              <Button
                variant="ghost"
                onClick={handleSignOut}
                data-testid="sign-out-button"
                className="hidden sm:flex text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
        {(title || subtitle) && (
          <div className="mt-4">
            {title && <h2 className="text-2xl font-semibold text-foreground">{title}</h2>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
