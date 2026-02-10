import { useState } from "react"
import {
  Code,
  Building2,
  Scale,
  Heart,
  Users,
  RefreshCw,
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
  category: "facilities" | "appeals" | "health" | "eligibility"
  isMock: boolean
}

const apiEndpoints: ApiEndpoint[] = [
  {
    id: "facilities",
    name: "VA Facilities",
    description: "Search VA health facilities and cemeteries",
    icon: Building2,
    category: "facilities",
    isMock: true,
  },
  {
    id: "appeals",
    name: "Appeals Status",
    description: "Check status of pending appeals",
    icon: Scale,
    category: "appeals",
    isMock: true,
  },
  {
    id: "health",
    name: "Patient Health",
    description: "Access patient health records (FHIR)",
    icon: Heart,
    category: "health",
    isMock: true,
  },
  {
    id: "community-care",
    name: "Community Care Eligibility",
    description: "Check eligibility for community care",
    icon: Users,
    category: "eligibility",
    isMock: true,
  },
]

export function Playground() {
  const [apiStates, setApiStates] = useState<Record<string, ApiState>>({})

  const handleApiCall = async (endpointId: string) => {
    setApiStates((prev) => ({
      ...prev,
      [endpointId]: { loading: true, mode: null, response: null },
    }))

    let result: { mode: "live" | "mock" }

    switch (endpointId) {
      case "facilities":
        result = await apiClient.getFacilities()
        break
      case "appeals":
        result = await apiClient.getAppealsStatus()
        break
      case "health":
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

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="API Playground"
        description="Test VA Lighthouse API endpoints with mock data"
      >
        <Badge variant="mock" className="text-sm px-3 py-1">
          Developer Mode
        </Badge>
      </PageHeader>

      {/* Warning Alert */}
      <Alert variant="warning" className="mb-6">
        <AlertTitle>Mock Data Only</AlertTitle>
        <AlertDescription>
          All API calls on this page return mock data for testing purposes.
          This allows you to explore the API structure without making real network requests.
          Use the Profile and Claims pages for live VA sandbox testing.
        </AlertDescription>
      </Alert>

      {/* API Endpoints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {apiEndpoints.map((endpoint) => {
          const Icon = endpoint.icon
          const state = apiStates[endpoint.id]
          const isLoading = state?.loading

          return (
            <Card key={endpoint.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50">
                      <Icon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{endpoint.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {endpoint.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="mock">MOCK</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleApiCall(endpoint.id)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Calling API...
                    </>
                  ) : (
                    <>
                      <Code className="h-4 w-4" />
                      Test Endpoint
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* API Responses */}
      <div className="space-y-4">
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
