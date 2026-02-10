import { useState } from "react"
import {
  Plus,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
  Send,
} from "lucide-react"
import { apiClient } from "../api/client"
import { PageHeader } from "../components/layout/page-header"
import { ClaimCard } from "../components/claim-card"
import { ApiResponseCard } from "../components/api-response-card"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { Alert, AlertDescription } from "../components/ui/alert"

interface ApiState {
  loading: boolean
  mode: "live" | "mock" | null
  response: unknown
}

// Demo claims data
const demoClaims = [
  {
    id: "CLM-2026-001",
    title: "Initial Disability Claim",
    status: "in_review" as const,
    submissionDate: "Jan 15, 2026",
    lastUpdated: "Feb 8, 2026",
    conditions: ["PTSD", "Tinnitus", "Sleep Apnea"],
  },
  {
    id: "CLM-2025-047",
    title: "Supplemental Claim - Knee Condition",
    status: "pending" as const,
    lastUpdated: "Feb 5, 2026",
    conditions: ["Left Knee Strain"],
  },
  {
    id: "CLM-2025-032",
    title: "Hearing Loss Claim",
    status: "approved" as const,
    submissionDate: "Oct 10, 2025",
    lastUpdated: "Dec 20, 2025",
    conditions: ["Bilateral Hearing Loss"],
    rating: 10,
  },
  {
    id: "CLM-2025-015",
    title: "Back Condition Appeal",
    status: "denied" as const,
    submissionDate: "Aug 5, 2025",
    lastUpdated: "Nov 15, 2025",
    conditions: ["Lumbar Spine Strain"],
  },
]

export function Claims() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showApiSection, setShowApiSection] = useState(false)

  const [benefitsClaims, setBenefitsClaims] = useState<ApiState>({
    loading: false,
    mode: null,
    response: null,
  })

  const [benefitsIntake, setBenefitsIntake] = useState<ApiState>({
    loading: false,
    mode: null,
    response: null,
  })

  const handleBenefitsClaims = async () => {
    setBenefitsClaims({ loading: true, mode: null, response: null })
    const result = await apiClient.getBenefitsClaims()
    setBenefitsClaims({ loading: false, mode: result.mode, response: result })
  }

  const handleBenefitsIntake = async () => {
    setBenefitsIntake({ loading: true, mode: null, response: null })
    const result = await apiClient.submitBenefitsIntake()
    setBenefitsIntake({ loading: false, mode: result.mode, response: result })
  }

  const filteredClaims = demoClaims.filter(
    (claim) =>
      claim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.conditions.some((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  const stats = {
    total: demoClaims.length,
    pending: demoClaims.filter((c) => c.status === "pending" || c.status === "in_review").length,
    approved: demoClaims.filter((c) => c.status === "approved").length,
    denied: demoClaims.filter((c) => c.status === "denied").length,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="My Claims"
        description="View and manage your VA disability claims"
      >
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Claim
        </Button>
      </PageHeader>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Claims</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Denied</p>
          <p className="text-2xl font-bold text-red-600">{stats.denied}</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search claims by ID, title, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Claims List */}
      <div className="space-y-4 mb-8">
        {filteredClaims.length > 0 ? (
          filteredClaims.map((claim) => (
            <ClaimCard
              key={claim.id}
              {...claim}
              onClick={() => console.log(`View claim ${claim.id}`)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                No claims found
              </h3>
              <p className="text-slate-500 mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start your first claim to get the benefits you've earned"}
              </p>
              {!searchQuery && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Start Your First Claim
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* API Testing Section (Collapsible) */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowApiSection(!showApiSection)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-amber-500" />
                Claims API Testing
              </CardTitle>
              <CardDescription>
                Test VA Benefits Claims and Intake APIs (Developer Mode)
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              {showApiSection ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {showApiSection && (
          <CardContent className="pt-0">
            <Separator className="mb-6" />

            <div className="space-y-4">
              <Alert variant="warning" className="mb-4">
                <AlertDescription>
                  The Submit Claim button uses mock data for safety. Get Claims calls the real VA sandbox.
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleBenefitsClaims}
                  disabled={benefitsClaims.loading}
                  variant="outline"
                >
                  {benefitsClaims.loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Get Benefits Claims
                  <Badge variant="live" className="ml-2">LIVE</Badge>
                </Button>

                <Button
                  onClick={handleBenefitsIntake}
                  disabled={benefitsIntake.loading}
                  variant="outline"
                >
                  {benefitsIntake.loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Claim (Test)
                  <Badge variant="mock" className="ml-2">MOCK</Badge>
                </Button>
              </div>

              <ApiResponseCard
                label="Benefits Claims"
                mode={benefitsClaims.mode}
                response={benefitsClaims.response}
                loading={benefitsClaims.loading}
              />

              <ApiResponseCard
                label="Benefits Intake (Submit Claim)"
                mode={benefitsIntake.mode}
                response={benefitsIntake.response}
                loading={benefitsIntake.loading}
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
