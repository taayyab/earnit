import { Link, useLocation } from "react-router-dom"
import {
  Home,
  FileText,
  User,
  Code,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onLogout: () => void
}

const mainNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/claims", label: "My Claims", icon: FileText },
  { path: "/profile", label: "Profile", icon: User },
]

const devNavItems = [
  { path: "/playground", label: "API Playground", icon: Code },
]

export function Sidebar({ collapsed, onToggle, onLogout }: SidebarProps) {
  const location = useLocation()

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-200">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-slate-800 hover:opacity-80 transition-opacity"
        >
          <Shield className="h-8 w-8 text-amber-500 shrink-0" />
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight">
              Earned<span className="text-amber-500">IT</span>
            </span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="mb-4">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Main
            </p>
          )}
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0 flex-none" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </div>

        <div className="pt-4 border-t border-slate-200">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Developer
            </p>
          )}
          {devNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-50 text-amber-600"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0 flex-none" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 space-y-1">
        <Link
          to="/help"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Help" : undefined}
        >
          <HelpCircle className="h-5 w-5 shrink-0 flex-none" />
          {!collapsed && <span>Help</span>}
        </Link>
        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0 flex-none" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full justify-center",
            collapsed && "px-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
