import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
  Bell,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { submitApi, claimsApi } from "../lib/api"
import type { Claim } from "../lib/api"

interface TrackingStatus {
  claimId: string
  vaClaimId: string
  stage: string
  status: string
  submittedAt: string
  estimatedDecisionDate?: string
}

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  status: "completed" | "current" | "pending"
}

export function ClaimTrack() {
  const { id: claimId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [claimId])

  const loadData = async () => {
    if (!claimId) return

    try {
      setLoading(true)
      setError(null)

      const [claimRes, statusRes] = await Promise.all([
        claimsApi.get(claimId).catch(() => ({ success: false, claim: null })),
        submitApi.getStatus(claimId).catch(() => ({ success: false, status: null })),
      ])

      if (claimRes.claim) {
        setClaim(claimRes.claim)
      }

      if (statusRes.status) {
        setTrackingStatus(statusRes.status)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load tracking data")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!claimId) return
    setRefreshing(true)
    try {
      const statusRes = await submitApi.getStatus(claimId)
      if (statusRes.status) {
        setTrackingStatus(statusRes.status)
      }
    } catch (err) {
      console.error("Error refreshing:", err)
    } finally {
      setRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const calculateDaysRemaining = (estimatedDate: string) => {
    const now = new Date()
    const estimated = new Date(estimatedDate)
    const diffTime = estimated.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getProgressPercentage = (submittedAt: string, estimatedDate?: string) => {
    if (!estimatedDate) return 10
    const submitted = new Date(submittedAt).getTime()
    const estimated = new Date(estimatedDate).getTime()
    const now = new Date().getTime()
    const total = estimated - submitted
    const elapsed = now - submitted
    const percentage = Math.min(Math.max((elapsed / total) * 100, 5), 95)
    return Math.round(percentage)
  }

  // Generate simulated timeline events
  const generateTimeline = (): TimelineEvent[] => {
    if (!trackingStatus) return []

    const submittedDate = new Date(trackingStatus.submittedAt)
    const events: TimelineEvent[] = [
      {
        id: "1",
        date: trackingStatus.submittedAt,
        title: "Claim Submitted",
        description: "Your claim was successfully submitted to the VA.",
        status: "completed",
      },
      {
        id: "2",
        date: new Date(submittedDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        title: "Claim Received",
        description: "The VA has received and logged your claim.",
        status: "completed",
      },
      {
        id: "3",
        date: new Date(submittedDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        title: "Initial Review",
        description: "Your claim is being reviewed for completeness.",
        status: "current",
      },
      {
        id: "4",
        date: new Date(submittedDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        title: "Evidence Gathering",
        description: "The VA is gathering additional evidence if needed.",
        status: "pending",
      },
      {
        id: "5",
        date: new Date(submittedDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        title: "Rating Decision",
        description: "A rating specialist will evaluate your claim.",
        status: "pending",
      },
      {
        id: "6",
        date: trackingStatus.estimatedDecisionDate || new Date(submittedDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        title: "Decision Notification",
        description: "You will receive your decision letter.",
        status: "pending",
      },
    ]

    return events
  }

  const timeline = generateTimeline()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A574] mx-auto mb-4" />
          <p className="text-slate-500">Loading tracking data...</p>
        </div>
      </div>
    )
  }

  if (!trackingStatus?.vaClaimId) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(`/claims/${claimId}`)}
          className="mb-4 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Claim
        </Button>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-amber-800 mb-2">Claim Not Submitted</h2>
            <p className="text-amber-700 mb-4">
              This claim has not been submitted to the VA yet. Please complete the submission process first.
            </p>
            <Button
              onClick={() => navigate(`/claims/${claimId}/submit`)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              Go to Submit
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = getProgressPercentage(trackingStatus.submittedAt, trackingStatus.estimatedDecisionDate)
  const daysRemaining = trackingStatus.estimatedDecisionDate
    ? calculateDaysRemaining(trackingStatus.estimatedDecisionDate)
    : null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/claims/${claimId}`)}
          className="mb-4 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Claim
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-800">Track Your Claim</h1>
            </div>
            <p className="text-slate-500">
              Monitor the progress of your VA disability claim in real-time.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Status Overview Card */}
      <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* VA Claim ID */}
            <div className="text-center md:text-left">
              <p className="text-sm text-blue-600 mb-1">VA Claim Number</p>
              <p className="text-2xl font-bold text-blue-800">{trackingStatus.vaClaimId}</p>
            </div>

            {/* Progress */}
            <div className="text-center">
              <p className="text-sm text-blue-600 mb-1">Overall Progress</p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex-1 max-w-32 h-3 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-blue-800">{progress}%</span>
              </div>
            </div>

            {/* Days Remaining */}
            <div className="text-center md:text-right">
              <p className="text-sm text-blue-600 mb-1">Estimated Time Remaining</p>
              {daysRemaining !== null ? (
                <p className="text-2xl font-bold text-blue-800">
                  {daysRemaining > 0 ? `~${daysRemaining} days` : "Decision Expected Soon"}
                </p>
              ) : (
                <p className="text-lg text-blue-700">Calculating...</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Submitted On</p>
                <p className="font-semibold text-slate-800">{formatDate(trackingStatus.submittedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Estimated Decision</p>
                <p className="font-semibold text-slate-800">
                  {trackingStatus.estimatedDecisionDate
                    ? formatDate(trackingStatus.estimatedDecisionDate)
                    : "TBD"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            Claim Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {timeline.map((event, index) => (
              <div key={event.id} className="relative pl-8 pb-8 last:pb-0">
                {/* Vertical line */}
                {index < timeline.length - 1 && (
                  <div className={`absolute left-3 top-6 bottom-0 w-0.5 ${
                    event.status === "completed" ? "bg-green-300" : "bg-slate-200"
                  }`} />
                )}

                {/* Status indicator */}
                <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  event.status === "completed"
                    ? "bg-green-500"
                    : event.status === "current"
                    ? "bg-blue-500 ring-4 ring-blue-100"
                    : "bg-slate-200"
                }`}>
                  {event.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : event.status === "current" ? (
                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                  ) : (
                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className={`${event.status === "pending" ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${
                      event.status === "current" ? "text-blue-800" : "text-slate-800"
                    }`}>
                      {event.title}
                    </h4>
                    {event.status === "current" && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-1">{formatShortDate(event.date)}</p>
                  <p className="text-sm text-slate-600">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Helpful Resources */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-600" />
            Helpful Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://www.va.gov/track-claims/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-slate-800">VA Claims Tracker</p>
                <p className="text-sm text-slate-500">Official VA.gov tracking</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 ml-auto" />
            </a>
            <a
              href="https://www.va.gov/resources/what-to-expect-after-you-file-a-claim/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-slate-800">What to Expect</p>
                <p className="text-sm text-slate-500">After filing your claim</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 ml-auto" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-slate-600" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">VA Benefits Hotline</p>
                <p className="font-medium text-slate-800">1-800-827-1000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Find a VA Office</p>
                <a
                  href="https://www.va.gov/find-locations/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  VA.gov/find-locations
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Your Advocate</p>
                <p className="font-medium text-slate-800">Available via dashboard</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
