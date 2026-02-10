import { useState } from "react"
import {
  User,
  Shield,
  Calendar,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react"
import { apiClient } from "../api/client"
import { PageHeader } from "../components/layout/page-header"
import { ApiResponseCard } from "../components/api-response-card"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert"

interface ApiState {
  loading: boolean
  mode: "live" | "mock" | null
  response: unknown
}

// Demo profile data
const demoProfile = {
  firstName: "Marcus",
  lastName: "Thompson",
  email: "marcus.thompson@email.com",
  phone: "(555) 123-4567",
  address: "Austin, TX",
  branch: "United States Army",
  rank: "Sergeant (E-5)",
  serviceStart: "June 2016",
  serviceEnd: "June 2024",
  veteranStatus: "Confirmed",
}

export function Profile() {
  const [showApiSection, setShowApiSection] = useState(false)

  const [veteranConfirmation, setVeteranConfirmation] = useState<ApiState>({
    loading: false,
    mode: null,
    response: null,
  })

  const [serviceHistory, setServiceHistory] = useState<ApiState>({
    loading: false,
    mode: null,
    response: null,
  })

  const [benefitsReference, setBenefitsReference] = useState<ApiState>({
    loading: false,
    mode: null,
    response: null,
  })

  const handleVeteranConfirmation = async () => {
    setVeteranConfirmation({ loading: true, mode: null, response: null })
    const result = await apiClient.getVeteranConfirmation()
    setVeteranConfirmation({ loading: false, mode: result.mode, response: result })
  }

  const handleServiceHistory = async () => {
    setServiceHistory({ loading: true, mode: null, response: null })
    const result = await apiClient.getServiceHistory()
    setServiceHistory({ loading: false, mode: result.mode, response: result })
  }

  const handleBenefitsReference = async () => {
    setBenefitsReference({ loading: true, mode: null, response: null })
    const result = await apiClient.getBenefitsReference("disabilities")
    setBenefitsReference({ loading: false, mode: result.mode, response: result })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Profile"
        description="Your veteran information and account settings"
      />

      {/* Profile Overview Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {demoProfile.firstName} {demoProfile.lastName}
                  </h2>
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
                <p className="text-slate-500">
                  {demoProfile.branch} - {demoProfile.rank}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="h-4 w-4" />
                  {demoProfile.email}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="h-4 w-4" />
                  {demoProfile.phone}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="h-4 w-4" />
                  {demoProfile.address}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="h-4 w-4" />
                  {demoProfile.serviceStart} - {demoProfile.serviceEnd}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service History Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Service History
          </CardTitle>
          <CardDescription>
            Your military service record connected via VA.gov
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-800">{demoProfile.branch}</p>
                <p className="text-sm text-slate-500">
                  {demoProfile.rank} | Active Duty
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">
                  {demoProfile.serviceStart} - {demoProfile.serviceEnd}
                </p>
                <p className="text-sm text-slate-500">8 years of service</p>
              </div>
            </div>

            <Alert variant="info">
              <AlertTitle>VA Connection Active</AlertTitle>
              <AlertDescription>
                Your account is connected to VA.gov. Service history and veteran status
                are verified automatically.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

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
                VA API Testing
              </CardTitle>
              <CardDescription>
                Test live VA Lighthouse API connections (Developer Mode)
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
              <Alert variant="info" className="mb-4">
                <AlertDescription>
                  These buttons call real VA Sandbox APIs. All data is returned from VA's test environment.
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleVeteranConfirmation}
                  disabled={veteranConfirmation.loading}
                  variant="outline"
                >
                  {veteranConfirmation.loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Veteran Confirmation
                  <Badge variant="live" className="ml-2">LIVE</Badge>
                </Button>

                <Button
                  onClick={handleServiceHistory}
                  disabled={serviceHistory.loading}
                  variant="outline"
                >
                  {serviceHistory.loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  Service History
                  <Badge variant="live" className="ml-2">LIVE</Badge>
                </Button>

                <Button
                  onClick={handleBenefitsReference}
                  disabled={benefitsReference.loading}
                  variant="outline"
                >
                  {benefitsReference.loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  Benefits Reference
                  <Badge variant="live" className="ml-2">LIVE</Badge>
                </Button>
              </div>

              <ApiResponseCard
                label="Veteran Confirmation"
                mode={veteranConfirmation.mode}
                response={veteranConfirmation.response}
                loading={veteranConfirmation.loading}
              />

              <ApiResponseCard
                label="Service History"
                mode={serviceHistory.mode}
                response={serviceHistory.response}
                loading={serviceHistory.loading}
              />

              <ApiResponseCard
                label="Benefits Reference Data"
                mode={benefitsReference.mode}
                response={benefitsReference.response}
                loading={benefitsReference.loading}
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
