import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileText,
  Shield,
  Clock,
  Package,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { submitApi, claimsApi } from "../lib/api"
import type { SubmissionReadiness, SubmissionPackage, SubmissionResult, Claim } from "../lib/api"

export function ClaimSubmit() {
  const { id: claimId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [readiness, setReadiness] = useState<SubmissionReadiness | null>(null)
  const [packagePreview, setPackagePreview] = useState<SubmissionPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  useEffect(() => {
    loadData()
  }, [claimId])

  const loadData = async () => {
    if (!claimId) return

    try {
      setLoading(true)
      setError(null)

      const [claimRes, readinessRes, packageRes] = await Promise.all([
        claimsApi.get(claimId).catch(() => ({ success: false, claim: null })),
        submitApi.getReadiness(claimId).catch(() => ({ success: false, readiness: null })),
        submitApi.previewPackage(claimId).catch(() => ({ success: false, package: null })),
      ])

      if (claimRes.claim) {
        setClaim(claimRes.claim)
      }

      if (readinessRes.readiness) {
        setReadiness(readinessRes.readiness)
      }

      if (packageRes.package) {
        setPackagePreview(packageRes.package)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load submission data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!claimId || !confirmSubmit) return

    setSubmitting(true)
    setError(null)

    try {
      const result = await submitApi.submit(claimId)
      if (result.success && result.submission) {
        setSubmissionResult(result.submission)
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit claim")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A574] mx-auto mb-4" />
          <p className="text-slate-500">Loading submission data...</p>
        </div>
      </div>
    )
  }

  // Show success screen after submission
  if (submissionResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Claim Submitted Successfully!</h1>
            <p className="text-green-700 mb-6">{submissionResult.message}</p>

            <div className="bg-white rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">VA Confirmation Number</p>
                  <p className="text-xl font-bold text-slate-800">{submissionResult.vaClaimId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Submitted On</p>
                  <p className="font-medium text-slate-700">{formatDate(submissionResult.submittedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Estimated Decision Date</p>
                  <p className="font-medium text-slate-700">{formatDate(submissionResult.estimatedDecisionDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                    <Clock className="h-3 w-3 mr-1" />
                    {submissionResult.status.charAt(0).toUpperCase() + submissionResult.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {submissionResult.note && (
              <p className="text-sm text-amber-600 mb-6">{submissionResult.note}</p>
            )}

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/claims/${claimId}`)}
              >
                Back to Claim
              </Button>
              <Button
                onClick={() => navigate(`/claims/${claimId}/track`)}
                className="bg-gradient-to-r from-[#D4A574] to-[#8B9D83] hover:from-[#B8895E] hover:to-[#6B7D63] text-white"
              >
                Track Your Claim
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
        <div className="flex items-center gap-3 mb-2">
          <Send className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-slate-800">Submit to VA</h1>
        </div>
        <p className="text-slate-500">
          Review your claim package and submit directly to the VA for processing.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)}>
            <X className="h-5 w-5 text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      {/* Readiness Check */}
      <Card className={`mb-6 ${readiness?.isReady ? 'border-green-200 bg-green-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${readiness?.isReady ? 'text-green-600' : 'text-amber-600'}`} />
            Submission Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          {readiness?.isReady ? (
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-800">Your claim is ready for submission!</p>
                <p className="text-sm text-green-600">All requirements have been met.</p>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="font-semibold text-amber-800">Some items need attention</p>
                  <p className="text-sm text-amber-600">Please resolve the following before submitting.</p>
                </div>
              </div>
              <ul className="space-y-2">
                {readiness?.missingItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-amber-700">
                    <X className="h-4 w-4" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">{readiness?.conditions || 0}</p>
              <p className="text-xs text-slate-500">Conditions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">{readiness?.documents || 0}</p>
              <p className="text-xs text-slate-500">Documents</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">{readiness?.approvalReadinessScore || 0}%</p>
              <p className="text-xs text-slate-500">QA Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Preview */}
      {packagePreview && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-600" />
              Submission Package Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Conditions */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">Claimed Conditions</h4>
              <div className="space-y-2">
                {packagePreview.conditions.map((condition, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{condition.name}</span>
                      {condition.vaCode && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {condition.vaCode}
                        </span>
                      )}
                    </div>
                    {condition.claimedRating && (
                      <span className="text-sm text-slate-600">{condition.claimedRating}% claimed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">Supporting Documents</h4>
              <div className="grid grid-cols-2 gap-2">
                {packagePreview.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm truncate">{doc.fileName}</span>
                    {doc.hasOCR && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">OCR</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Forms */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">VA Forms</h4>
              <div className="space-y-2">
                {packagePreview.forms.map((form, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="font-medium">{form.formNumber}</span>
                      <span className="text-sm text-slate-500 ml-2">{form.formName}</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded capitalize">
                      {form.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Rating */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">Estimated Combined Rating</p>
                  <p className="text-3xl font-bold text-amber-800">{packagePreview.estimatedRating}%</p>
                </div>
                <p className="text-xs text-amber-600 max-w-xs text-right">
                  This is an estimate based on claimed ratings. Actual rating determined by VA.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation */}
      {readiness?.isReady && (
        <Card className="mb-6 border-green-200">
          <CardContent className="pt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmSubmit}
                onChange={(e) => setConfirmSubmit(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <p className="font-semibold text-slate-800">I confirm that all information is accurate</p>
                <p className="text-sm text-slate-600">
                  By checking this box, I certify that all information provided in this claim is true and accurate
                  to the best of my knowledge. I understand that submitting false information may result in
                  penalties.
                </p>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate(`/claims/${claimId}/review`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Review
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!readiness?.isReady || !confirmSubmit || submitting}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Claim to VA
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
