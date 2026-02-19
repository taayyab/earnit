import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Bell,
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { toast } from 'sonner';

const navItems = [
  {
    title: 'Dashboard',
    href: '/mentor',
    icon: LayoutDashboard,
    description: 'Advocate overview',
  },
  {
    title: 'My Veterans',
    href: '/advocate/veterans',
    icon: Users,
    description: 'Veteran assignments',
  },
  {
    title: 'Calendar',
    href: '/advocate/calendar',
    icon: Calendar,
    description: 'Schedule & meetings',
  },
  {
    title: 'Support Cases',
    href: '/advocate/cases',
    icon: ClipboardList,
    description: 'Active cases',
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    description: 'Communications',
  },
];

const secondaryItems = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

function NavLink({ item, isActive, collapsed }) {
  const Icon = item.icon;
  
  return (
    <Link
      to={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-emerald-600 text-white'
          : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <div className="font-medium">{item.title}</div>
          {item.description && (
            <div className="text-xs opacity-70 truncate">{item.description}</div>
          )}
        </div>
      )}
      {!collapsed && isActive && (
        <ChevronRight className="h-4 w-4 flex-shrink-0" />
      )}
    </Link>
  );
}

function Sidebar({ collapsed, setCollapsed, milestoneCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [availability, setAvailability] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const res = await api.get('/peer-support/profile');
      setAvailability(res.data.is_available || false);
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  };

  const handleAvailabilityChange = async (checked) => {
    try {
      await api.put('/peer-support/profile', { is_available: checked });
      setAvailability(checked);
      toast.success(checked ? 'You are now available for advocacy' : 'You are now unavailable');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-emerald-800 text-white transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-emerald-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-300" />
            <span className="font-bold text-lg">EarnedIT</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-emerald-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{user?.name || user?.first_name || 'Advocate'}</div>
              <Badge className="bg-emerald-600 text-white text-xs">Veteran Advocate</Badge>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-emerald-200">Available</span>
            <Switch
              checked={availability}
              onCheckedChange={handleAvailabilityChange}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={location.pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </div>

        {!collapsed && (
          <>
            <div className="my-4 border-t border-emerald-700" />
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={location.pathname === item.href}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-emerald-700">
        <Button
          variant="ghost"
          className={cn(
            'w-full text-white hover:bg-emerald-700',
            collapsed ? 'justify-center' : 'justify-start'
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}

function MobileSidebar({ milestoneCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [availability, setAvailability] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const res = await api.get('/peer-support/profile');
      setAvailability(res.data.is_available || false);
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  };

  const handleAvailabilityChange = async (checked) => {
    try {
      await api.put('/peer-support/profile', { is_available: checked });
      setAvailability(checked);
      toast.success(checked ? 'You are now available for advocacy' : 'You are now unavailable');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-emerald-800">
        <div className="flex flex-col h-full text-white">
          <div className="flex items-center justify-between p-4 border-b border-emerald-700">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-300" />
              <span className="font-bold text-lg">EarnedIT</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-white hover:bg-emerald-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-4 py-3 border-b border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user?.name || user?.first_name || 'Advocate'}</div>
                <Badge className="bg-emerald-600 text-white text-xs">Veteran Advocate</Badge>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-emerald-200">Available for Advocacy</span>
              <Switch
                checked={availability}
                onCheckedChange={handleAvailabilityChange}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    location.pathname === item.href
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    {item.description && (
                      <div className="text-xs opacity-70">{item.description}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="my-4 border-t border-emerald-700" />
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    location.pathname === item.href
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-emerald-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-emerald-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AdvocateLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [milestoneCount, setMilestoneCount] = useState(0);

  useEffect(() => {
    loadMilestoneCount();
    const interval = setInterval(loadMilestoneCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMilestoneCount = async () => {
    try {
      const res = await api.get('/peer-support/veteran-milestones');
      setMilestoneCount(res.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to load milestone count:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:flex">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} milestoneCount={milestoneCount} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-4 py-3 border-b bg-white lg:px-6">
          <MobileSidebar milestoneCount={milestoneCount} />
          
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-900 lg:hidden">EarnedIT</h1>
          </div>

          {milestoneCount > 0 && (
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative" onClick={() => window.location.href = '/mentor'}>
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {milestoneCount > 9 ? '9+' : milestoneCount}
                </span>
              </Button>
            </div>
          )}

          <NotificationCenter />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
