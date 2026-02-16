import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("authenticated")
    localStorage.removeItem("userId")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("isDemo")
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar - Fixed */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header - Hidden on Desktop */}
        <div className="lg:hidden flex-shrink-0">
          <Header onLogout={handleLogout} />
        </div>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-slate-200 bg-white px-4 py-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>
              EarnedIT Platform - Helping veterans get the benefits they've earned.
            </p>
            <p>
              Free for original claims per 38 CFR 14.636
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
