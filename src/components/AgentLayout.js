import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import {
  LayoutDashboard,
  ClipboardList,
  FolderOpen,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  FileText,
  Users,
  Search,
  CalendarDays,
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const navItems = [
  {
    title: 'Work Queue',
    href: '/agent',
    icon: ClipboardList,
    description: 'Prioritized claims requiring action',
  },
  {
    title: 'Command Center',
    href: '/agent/command-center',
    icon: LayoutDashboard,
    description: 'Kanban board view',
  },
  {
    title: 'My Schedule',
    href: '/agent/schedule',
    icon: CalendarDays,
    description: 'Meetings with clients',
  },
  {
    title: 'Evidence & Documents',
    href: '/agent/evidence',
    icon: FolderOpen,
    description: 'Document management hub',
  },
  {
    title: 'Communications',
    href: '/agent/communications',
    icon: MessageSquare,
    description: 'Messages and notifications',
  },
  {
    title: 'Metrics & Reports',
    href: '/agent/metrics',
    icon: BarChart3,
    description: 'Analytics & impact reports',
  },
];

const secondaryItems = [
  {
    title: 'Forms Library',
    href: '/forms-library',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const adminItems = [
  {
    title: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'System administration',
  },
  {
    title: 'Accreditation Review',
    href: '/admin/accreditation',
    icon: Shield,
    description: 'Review pending accreditations',
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
          ? 'bg-[hsl(var(--primary))] text-white'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-[#1B3A5F] text-white transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#D4A574]" />
            <span className="font-bold text-lg">EarnedIT</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#D4A574] flex items-center justify-center">
              <Users className="h-5 w-5 text-[#1B3A5F]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{user?.name || 'Claims Agent'}</div>
              <Badge className="bg-[#D4A574] text-[#1B3A5F] text-xs">Claims Agent</Badge>
            </div>
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
            <div className="my-4 border-t border-white/10" />
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

        {!collapsed && user?.role === 'admin' && (
          <>
            <div className="my-4 border-t border-white/10" />
            <div className="text-xs uppercase tracking-wider text-white/50 px-3 mb-2">Admin</div>
            <div className="space-y-1">
              {adminItems.map((item) => (
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

      <div className="p-3 border-t border-white/10">
        <Button
          variant="ghost"
          className={cn(
            'w-full text-white hover:bg-white/10',
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

function MobileSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

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
      <SheetContent side="left" className="w-72 p-0 bg-[#1B3A5F]">
        <div className="flex flex-col h-full text-white">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#D4A574]" />
              <span className="font-bold text-lg">EarnedIT</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#D4A574] flex items-center justify-center">
                <Users className="h-5 w-5 text-[#1B3A5F]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user?.name || 'Claims Agent'}</div>
                <Badge className="bg-[#D4A574] text-[#1B3A5F] text-xs">Claims Agent</Badge>
              </div>
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
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
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

            <div className="my-4 border-t border-white/10" />
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    location.pathname === item.href
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>

            {user?.role === 'admin' && (
              <>
                <div className="my-4 border-t border-white/10" />
                <div className="text-xs uppercase tracking-wider text-white/50 px-3 mb-2">Admin</div>
                <div className="space-y-1">
                  {adminItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        location.pathname === item.href
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
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
              </>
            )}
          </ScrollArea>

          <div className="p-3 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
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

export default function AgentLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:flex">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-4 py-3 border-b bg-white lg:px-6">
          <MobileSidebar />
          
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search claims, veterans..."
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
            </div>
          </div>

          <NotificationCenter />
        </header>

        <div className="bg-[hsl(var(--phi-bg))] border-b px-4 py-2 flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span><strong>PHI Notice:</strong> You are viewing protected health information. All actions are audited.</span>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
