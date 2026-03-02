import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  MessageSquare,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import logoImg from '../assets/logo.webp';
import NotificationCenter from './NotificationCenter';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Main dashboard',
  },
  {
    title: 'My Claims',
    href: '/my-claims',
    icon: FileText,
    description: 'View claims and documents',
  },
  {
    title: 'Evidence Library',
    href: '/evidence-library',
    icon: FolderOpen,
    description: 'Evidence management',
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    description: 'Communications',
  },
  {
    title: 'Forms Library',
    href: '/forms-library',
    icon: ClipboardList,
    description: 'VA forms',
  },
  {
    title: 'Peer Support',
    href: '/advocates',
    icon: Users,
    description: 'Advocate matching',
  },
];

const secondaryItems = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

// Inline styles for hover effects that Tailwind can't handle
const sidebarStyles = `
  .nav-link {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .nav-link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%) scaleY(0);
    width: 3px;
    height: 60%;
    border-radius: 0 4px 4px 0;
    background: #D4A574;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .nav-link:hover::before {
    transform: translateY(-50%) scaleY(1);
  }
  .nav-link.active::before {
    transform: translateY(-50%) scaleY(1);
    background: #D4A574;
    box-shadow: 0 0 8px rgba(212, 165, 116, 0.5);
  }
  .nav-link::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(212, 165, 116, 0.08) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .nav-link:hover::after {
    opacity: 1;
  }
  .nav-link.active::after {
    opacity: 1;
    background: linear-gradient(90deg, rgba(212, 165, 116, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%);
  }
  .nav-link .nav-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .nav-link:hover .nav-icon {
    transform: scale(1.15);
    color: #D4A574;
  }
  .nav-link.active .nav-icon {
    color: #D4A574;
    filter: drop-shadow(0 0 4px rgba(212, 165, 116, 0.4));
  }
  .nav-link .nav-chevron {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    transform: translateX(-4px);
  }
  .nav-link:hover .nav-chevron,
  .nav-link.active .nav-chevron {
    opacity: 1;
    transform: translateX(0);
  }
  .nav-link .nav-title {
    transition: color 0.3s ease;
  }
  .nav-link:hover .nav-title {
    color: white;
  }
  .nav-link .nav-desc {
    transition: opacity 0.3s ease;
  }
  .nav-link:hover .nav-desc {
    opacity: 0.9;
  }
  .sidebar-logout {
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sidebar-logout:hover {
    background: rgba(239, 68, 68, 0.15) !important;
  }
  .sidebar-logout:hover .logout-icon {
    color: #f87171;
    transform: scale(1.1);
  }
  .sidebar-logout .logout-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .user-profile-section {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: default;
    border-radius: 10px;
    margin: 4px;
    padding: 12px;
  }
  .user-profile-section:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  .user-profile-section:hover .user-avatar {
    transform: scale(1.08);
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.35), 0 0 16px rgba(212, 165, 116, 0.15);
  }
  .user-profile-section:hover .user-name {
    color: #fff;
  }
  .user-profile-section:hover .user-badge {
    background: #e0b88a !important;
    box-shadow: 0 0 8px rgba(212, 165, 116, 0.3);
  }
  .user-avatar {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 0 0 rgba(212, 165, 116, 0);
  }
  .user-name {
    transition: color 0.3s ease;
  }
  .user-badge {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .logo-container {
    transition: all 0.3s ease;
  }
  .logo-container:hover .logo-img {
    transform: scale(1.1) rotate(3deg);
  }
  .logo-img {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .collapse-btn {
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    border-radius: 8px !important;
  }
  .collapse-btn:hover {
    background: rgba(212, 165, 116, 0.2) !important;
    box-shadow: 0 0 12px rgba(212, 165, 116, 0.15);
  }
  .collapse-btn .collapse-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .collapse-btn:hover .collapse-icon {
    color: #D4A574;
    transform: scale(1.15);
  }
`;

function NavLink({ item, isActive, collapsed }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={cn(
        'nav-link group flex items-center rounded-lg py-2.5 text-sm relative z-10',
        collapsed ? 'justify-center px-0' : 'gap-3 px-3',
        isActive
          ? 'active bg-white/10 text-white'
          : 'text-white/60'
      )}
    >
      <Icon className="nav-icon h-5 w-5 flex-shrink-0" />
      {!collapsed && (
        <div className="flex-1 min-w-0 relative z-10">
          <div className="nav-title font-medium">{item.title}</div>
          {item.description && (
            <div className="nav-desc text-xs opacity-50 truncate">{item.description}</div>
          )}
        </div>
      )}
      {!collapsed && (
        <ChevronRight className="nav-chevron h-4 w-4 flex-shrink-0 text-[#D4A574]" />
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
      'flex flex-col h-full bg-gradient-to-b from-[#1B3A5F] to-[#152d4a] text-white transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <style>{sidebarStyles}</style>

      <div className={cn(
        "flex items-center p-4 border-b border-white/10",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="logo-container flex items-center gap-2 cursor-default">
            <img src={logoImg} alt="EarnedIT" className="logo-img h-8 w-8 object-contain" />
            <span className="font-bold text-lg tracking-wide">EarnedIT</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="collapse-btn text-white"
        >
          <Menu className="collapse-icon h-5 w-5" />
        </Button>
      </div>

      {!collapsed && (
        <div className="border-b border-white/10">
          <div className="user-profile-section flex items-center gap-3">
            <div className="user-avatar h-10 w-10 rounded-full bg-[#D4A574] flex items-center justify-center font-semibold text-[#1B3A5F]">
              {user?.first_name && user?.last_name
                ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
                : user?.first_name
                  ? user.first_name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0)?.toUpperCase() || 'V'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="user-name font-medium text-sm truncate text-white/90">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.first_name || user?.email?.split('@')[0] || 'Veteran'}
              </div>
              <Badge className="user-badge bg-[#D4A574] text-[#1B3A5F] text-xs mt-0.5">Veteran</Badge>
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
      </ScrollArea>

      <div className="p-3 border-t border-white/10">
        <Button
          variant="ghost"
          className={cn(
            'sidebar-logout w-full text-white/70 hover:text-white',
            collapsed ? 'justify-center' : 'justify-start'
          )}
          onClick={handleLogout}
        >
          <LogOut className="logout-icon h-5 w-5" />
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
          <style>{sidebarStyles}</style>

          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="logo-container flex items-center gap-2">
              <img src={logoImg} alt="EarnedIT" className="logo-img h-8 w-8 object-contain" />
              <span className="font-bold text-lg tracking-wide">EarnedIT</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-white hover:bg-white/10 transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-b border-white/10">
            <div className="user-profile-section flex items-center gap-3">
              <div className="user-avatar h-10 w-10 rounded-full bg-[#D4A574] flex items-center justify-center font-semibold text-[#1B3A5F]">
                {user?.first_name && user?.last_name
                  ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
                  : user?.first_name
                    ? user.first_name.charAt(0).toUpperCase()
                    : user?.email?.charAt(0)?.toUpperCase() || 'V'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="user-name font-medium text-sm truncate text-white/90">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.first_name || user?.email?.split('@')[0] || 'Veteran'}
                </div>
                <Badge className="user-badge bg-[#D4A574] text-[#1B3A5F] text-xs mt-0.5">Veteran</Badge>
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
                    'nav-link group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm relative',
                    location.pathname === item.href
                      ? 'active bg-white/10 text-white'
                      : 'text-white/60'
                  )}
                >
                  <item.icon className="nav-icon h-5 w-5 relative z-10" />
                  <div className="relative z-10">
                    <div className="nav-title font-medium">{item.title}</div>
                    {item.description && (
                      <div className="nav-desc text-xs opacity-50">{item.description}</div>
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
                    'nav-link group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm relative',
                    location.pathname === item.href
                      ? 'active bg-white/10 text-white'
                      : 'text-white/60'
                  )}
                >
                  <item.icon className="nav-icon h-5 w-5 relative z-10" />
                  <span className="nav-title relative z-10">{item.title}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-white/10">
            <Button
              variant="ghost"
              className="sidebar-logout w-full justify-start text-white/70 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="logout-icon h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function VeteranLayout({ children }) {
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
            <h1 className="text-lg font-semibold text-slate-900 lg:hidden">EarnedIT</h1>
          </div>

          <NotificationCenter />
        </header>

        <main className="flex-1 overflow-auto pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}
