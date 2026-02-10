import { FileText, Upload, Plus, Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { PageHeader } from "../components/layout/page-header"
import { StatsCard } from "../components/stats-card"
import { ClaimCard } from "../components/claim-card"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert"

// Demo data for the dashboard
const demoStats = {
  activeClaims: 2,
  documentsUploaded: 12,
  pendingActions: 1,
  averageRating: 70,
}

const demoClaims = [
  {
    id: "CLM-2026-001",
    title: "Initial Disability Claim",
    status: "in_review" as const,
    submissionDate: "Jan 15, 2026",
    lastUpdated: "Feb 8, 2026",
    conditions: ["PTSD", "Tinnitus", "Sleep Apnea"],
    rating: undefined,
  },
  {
    id: "CLM-2025-047",
    title: "Supplemental Claim - Knee Condition",
    status: "pending" as const,
    lastUpdated: "Feb 5, 2026",
    conditions: ["Left Knee Strain"],
    rating: undefined,
  },
]

const demoRecentActivity = [
  { action: "Document uploaded", detail: "Medical Records - VA Hospital", time: "2 hours ago" },
  { action: "Claim status updated", detail: "CLM-2026-001 moved to In Review", time: "1 day ago" },
  { action: "New condition identified", detail: "AI detected Sleep Apnea mention", time: "3 days ago" },
]

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Welcome back, Veteran"
        description="Here's an overview of your claims and recent activity"
      >
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="h-4 w-4 flex-none" />
          <span>New Claim</span>
        </Button>
      </PageHeader>

      {/* Pending Action Alert */}
      {demoStats.pendingActions > 0 && (
        <Alert variant="warning" className="mb-6">
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            You have {demoStats.pendingActions} pending action(s) that need your attention.
            <Link to="/claims" className="ml-2 font-medium underline">
              View details
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Active Claims"
          value={demoStats.activeClaims}
          description="Claims in progress"
          icon={FileText}
        />
        <StatsCard
          title="Documents"
          value={demoStats.documentsUploaded}
          description="Uploaded this month"
          icon={Upload}
          trend={{ value: 25, isPositive: true }}
        />
        <StatsCard
          title="Pending Actions"
          value={demoStats.pendingActions}
          description="Require attention"
          icon={AlertCircle}
        />
        <StatsCard
          title="Est. Combined Rating"
          value={`${demoStats.averageRating}%`}
          description="Based on submitted claims"
          icon={TrendingUp}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claims Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-slate-800">Your Claims</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/claims">View all</Link>
            </Button>
          </div>

          {demoClaims.length > 0 ? (
            <div className="space-y-4">
              {demoClaims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  {...claim}
                  onClick={() => console.log(`View claim ${claim.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  No claims yet
                </h3>
                <p className="text-slate-500 mb-4 max-w-sm">
                  Start your first disability claim to get the benefits you've earned.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Plus className="h-4 w-4 flex-none" />
                  <span>Start Your First Claim</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity Section */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-200">
                {demoRecentActivity.map((activity, index) => (
                  <li key={index} className="p-4">
                    <p className="font-medium text-slate-800 text-sm">
                      {activity.action}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {activity.detail}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Plus className="h-4 w-4 flex-none" />
                <span>Start New Claim</span>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Upload className="h-4 w-4 flex-none" />
                <span>Upload Documents</span>
              </Button>
              <Link
                to="/profile"
                className="inline-flex items-center w-full justify-start gap-3 h-11 px-5 py-3 rounded-lg text-base font-medium border-2 border-slate-200 bg-transparent text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all duration-150"
              >
                <CheckCircle2 className="h-4 w-4 flex-none" />
                <span>Complete Profile</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
