import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { Button } from './ui/button';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Upload, 
  MessageSquare, 
  Settings,
  LogOut,
  User,
  Scale,
  ClipboardList,
  Users,
  HelpCircle
} from 'lucide-react';

const navItems = {
  veteran: [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/intake', label: 'Start Claim', icon: FileText },
    { path: '/documents', label: 'Documents', icon: Upload },
    { path: '/appeals', label: 'Appeals', icon: Scale },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/services', label: 'Services', icon: ClipboardList },
    { path: '/settings', label: 'Settings', icon: Settings },
  ],
  peer_mentor: [
    { path: '/mentor', label: 'Dashboard', icon: Home },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/settings', label: 'Settings', icon: Settings },
  ],
  claims_agent: [
    { path: '/agent', label: 'Dashboard', icon: Home },
    { path: '/support-cases', label: 'Cases', icon: ClipboardList },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/settings', label: 'Settings', icon: Settings },
  ],
  partner_org: [
    { path: '/partner/dashboard', label: 'Dashboard', icon: Home },
    { path: '/partner/clients/onboard', label: 'Onboard Client', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings },
  ],
};

export default function MobileNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const userNavItems = navItems[user.role] || navItems.veteran;

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="min-h-[44px] min-w-[44px]"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <nav 
            className="flex flex-col h-full" 
            role="navigation" 
            aria-label="Main navigation"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-lg text-primary">EarnedIt</span>
              <SheetClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="min-h-[44px] min-w-[44px]"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetClose>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted/50 border-b">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {user.firstName || user.email}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role?.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <ul className="space-y-1 px-2" role="list">
                {userNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <SheetClose asChild>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-muted'
                          }`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t p-2 space-y-1">
              <SheetClose asChild>
                <Link
                  to="/faq"
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-foreground hover:bg-muted min-h-[44px]"
                >
                  <HelpCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                  Help & FAQ
                </Link>
              </SheetClose>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px]"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                Sign Out
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
