import { useState } from "react"
import {
  Code,
  Building2,
  Scale,
  Heart,
  Users,
  RefreshCw,
  Shield,
  FileText,
  Upload,
  ClipboardList,
  History,
  AlertCircle,
} from "lucide-react"
import { apiClient } from "../api/client"
import { PageHeader } from "../components/layout/page-header"
import { ApiResponseCard } from "../components/api-response-card"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert"

interface ApiState {
  loading: boolean
  mode: "live" | "mock" | null
  response: unknown
}

interface ApiEndpoint {
  id: string
  name: string
  description: string
  icon: typeof Code
  category: "verification" | "benefits" | "appeals" | "health" | "other"
  isLive: boolean
}

const apiEndpoints: ApiEndpoint[] = [
  // Veteran Verification
  {
    id: "veteran-confirmation",
    name: "Veteran Confirmation",
    description: "Verify veteran status after ID.me authentication",
    icon: Shield,
    category: "verification",
    isLive: true,
  },
  {
    id: "service-history",
    name: "Service History",
    description: "Military service history including branches and dates",
    icon: History,
    category: "verification",
    isLive: true,
  },
  // Benefits
  {
    id: "benefits-reference",
    name: "Benefits Reference Data",
    description: "Disability codes, contention types, and reference data",
    icon: ClipboardList,
    category: "benefits",
    isLive: true,
  },
  {
    id: "benefits-claims",
    name: "Benefits Claims",
    description: "Check status of existing disability compensation claims",
    icon: FileText,
    category: "benefits",
    isLive: true,
  },
  {
    id: "benefits-intake",
    name: "Benefits Intake",
    description: "Submit claim documents to VA for processing",
    icon: Upload,
    category: "benefits",
    isLive: false,
  },
  {
    id: "forms",
    name: "VA Forms",
    description: "Search and retrieve VA form metadata",
    icon: FileText,
    category: "benefits",
    isLive: true,
  },
  // Facilities
  {
    id: "facilities",
    name: "VA Facilities",
    description: "Find nearby VA medical centers and clinics",
    icon: Building2,
    category: "other",
    isLive: true,
  },
  // Appeals
  {
    id: "appealable-issues",
    name: "Appealable Issues",
    description: "Identify which claim decisions can be appealed",
    icon: AlertCircle,
    category: "appeals",
    isLive: false,
  },
  {
    id: "appeals-status",
    name: "Appeals Status",
    description: "Track status of active appeals",
    icon: Scale,
    category: "appeals",
    isLive: false,
  },
  {
    id: "legacy-appeals",
    name: "Legacy Appeals",
    description: "Access legacy appeals filed before AMA",
    icon: Scale,
    category: "appeals",
    isLive: false,
  },
  // Health
  {
    id: "patient-health",
    name: "Patient Health",
    description: "Access veteran health records via FHIR",
    icon: Heart,
    category: "health",
    isLive: false,
  },
  {
    id: "community-care",
    name: "Community Care Eligibility",
    description: "Check eligibility for community care outside VA",
    icon: Users,
    category: "health",
    isLive: false,
  },
]

const categoryLabels: Record<string, string> = {
  verification: "Veteran Verification",
  benefits: "Benefits & Claims",
  appeals: "Appeals",
  health: "Health",
  other: "Other Services",
}

export function Playground() {
  const [apiStates, setApiStates] = useState<Record<string, ApiState>>({})

  const handleApiCall = async (endpointId: string) => {
    setApiStates((prev) => ({
      ...prev,
      [endpointId]: { loading: true, mode: null, response: null },
    }))

    let result: { mode: "live" | "mock" }

    switch (endpointId) {
      case "veteran-confirmation":
        result = await apiClient.getVeteranConfirmation()
        break
      case "service-history":
        result = await apiClient.getServiceHistory()
        break
      case "benefits-reference":
        result = await apiClient.getBenefitsReference("disabilities")
        break
      case "benefits-claims":
        result = await apiClient.getBenefitsClaims()
        break
      case "benefits-intake":
        result = await apiClient.submitBenefitsIntake()
        break
      case "forms":
        result = await apiClient.getForms()
        break
      case "facilities":
        result = await apiClient.getFacilities()
        break
      case "appealable-issues":
        result = await apiClient.getAppealableIssues()
        break
      case "appeals-status":
        result = await apiClient.getAppealsStatus()
        break
      case "legacy-appeals":
        result = await apiClient.getLegacyAppeals()
        break
      case "patient-health":
        result = await apiClient.getPatientHealth()
        break
      case "community-care":
        result = await apiClient.getCommunityCareEligibility()
        break
      default:
        result = { mode: "mock" as const }
    }

    setApiStates((prev) => ({
      ...prev,
      [endpointId]: { loading: false, mode: result.mode, response: result },
    }))
  }

  const categories = [...new Set(apiEndpoints.map((e) => e.category))]

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="API Playground"
        description="Test all 12 VA Lighthouse API endpoints"
      >
        <Badge variant="mock" className="text-sm px-3 py-1">
          Developer Mode
        </Badge>
      </PageHeader>

      {/* Info Alert */}
      <Alert variant="info" className="mb-6">
        <AlertTitle>Live vs Mock APIs</AlertTitle>
        <AlertDescription>
          APIs marked <Badge variant="live" className="mx-1">LIVE</Badge> will call the real VA sandbox when credentials are configured.
          APIs marked <Badge variant="mock" className="mx-1">MOCK</Badge> return simulated data to prevent test pollution or due to authorization restrictions.
        </AlertDescription>
      </Alert>

      {/* API Endpoints by Category */}
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {categoryLabels[category]}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiEndpoints
              .filter((e) => e.category === category)
              .map((endpoint) => {
                const Icon = endpoint.icon
                const state = apiStates[endpoint.id]
                const isLoading = state?.loading

                return (
                  <Card key={endpoint.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${endpoint.isLive ? "bg-green-50" : "bg-amber-50"}`}>
                            <Icon className={`h-5 w-5 ${endpoint.isLive ? "text-green-600" : "text-amber-600"}`} />
                          </div>
                          <div>
                            <CardTitle className="text-sm">{endpoint.name}</CardTitle>
                          </div>
                        </div>
                        <Badge variant={endpoint.isLive ? "live" : "mock"}>
                          {endpoint.isLive ? "LIVE" : "MOCK"}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-2">
                        {endpoint.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        onClick={() => handleApiCall(endpoint.id)}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Calling...</span>
                          </>
                        ) : (
                          <>
                            <Code className="h-4 w-4" />
                            <span>Test</span>
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      ))}

      {/* API Responses */}
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          API Responses
        </h2>

        {Object.entries(apiStates).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Code className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                No API calls yet
              </h3>
              <p className="text-slate-500">
                Click on any endpoint above to test the API and see the response here.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(apiStates).map(([endpointId, state]) => {
            const endpoint = apiEndpoints.find((e) => e.id === endpointId)
            if (!endpoint || (!state.loading && !state.response)) return null

            return (
              <ApiResponseCard
                key={endpointId}
                label={endpoint.name}
                mode={state.mode}
                response={state.response}
                loading={state.loading}
              />
            )
          })
        )}
      </div>

      {/* Documentation Link */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-1">
                VA Lighthouse API Documentation
              </h3>
              <p className="text-sm text-slate-500 mb-3">
                Explore the full VA API documentation to understand all available
                endpoints and their capabilities.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://developer.va.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Documentation
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
