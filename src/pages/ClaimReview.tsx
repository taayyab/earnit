import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FileCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
  RefreshCw,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { qaApi, claimsApi } from "../lib/api"
import type { QAResult, QACheck, QAIssue, Claim } from "../lib/api"

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />
    default:
      return <Info className="h-5 w-5 text-slate-400" />
  }
}

const getSeverityBg = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-50 border-red-200"
    case "warning":
      return "bg-amber-50 border-amber-200"
    case "info":
      return "bg-blue-50 border-blue-200"
    default:
      return "bg-slate-50 border-slate-200"
  }
}

export function ClaimReview() {
  const { id: claimId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [qaResult, setQaResult] = useState<QAResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [claimId])

  const loadData = async () => {
    if (!claimId) return

    try {
      setLoading(true)
      setError(null)

      const [claimRes, qaRes] = await Promise.all([
        claimsApi.get(claimId).catch(() => ({ success: false, claim: null })),
        qaApi.getResults(claimId).catch(() => ({ success: false, qa: null })),
      ])

      if (claimRes.claim) {
        setClaim(claimRes.claim)
      }

      if (qaRes.qa) {
        setQaResult(qaRes.qa)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load QA results")
    } finally {
      setLoading(false)
    }
  }

  const handleRunValidation = async () => {
    if (!claimId) return

    setValidating(true)
    setError(null)

    try {
      const result = await qaApi.validate(claimId)
      if (result.success && result.qa) {
        setQaResult(result.qa)
        setSuccess("QA validation complete!")
      }
    } catch (err: any) {
      setError(err.message || "Failed to run validation")
    } finally {
      setValidating(false)
    }
  }

  const handleApprove = async () => {
    if (!claimId) return

    try {
      const result = await qaApi.approve(claimId)
      if (result.success) {
        navigate(`/claims/${claimId}`)
      }
    } catch (err) {
      setError("Failed to approve claim")
    }
  }

  const toggleCheck = (checkName: string) => {
    const newExpanded = new Set(expandedChecks)
    if (newExpanded.has(checkName)) {
      newExpanded.delete(checkName)
    } else {
      newExpanded.add(checkName)
    }
    setExpandedChecks(newExpanded)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A574] mx-auto mb-4" />
          <p className="text-slate-500">Loading QA review...</p>
        </div>
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
          <FileCheck className="h-8 w-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-slate-800">Quality Assurance Review</h1>
        </div>
        <p className="text-slate-500">
          Pre-submission validation ensures your claim meets VA requirements for the best chance of approval.
        </p>
      </div>

      {/* Alerts */}
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

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-700">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)}>
            <X className="h-5 w-5 text-green-400 hover:text-green-600" />
          </button>
        </div>
      )}

      {/* Approval Readiness Score */}
      <Card className="mb-6 overflow-hidden">
        <div className={`h-2 ${qaResult ? getScoreBarColor(qaResult.overallScore) : "bg-slate-200"}`} />
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Approval Readiness Score</h3>
              <p className="text-sm text-slate-500">
                {qaResult
                  ? qaResult.passed
                    ? "Your claim meets the requirements for submission!"
                    : "Some issues need to be addressed before submission."
                  : "Run validation to check your claim"}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${qaResult ? getScoreColor(qaResult.overallScore) : "text-slate-400"}`}>
                {qaResult ? qaResult.overallScore : "--"}
              </div>
              <p className="text-xs text-slate-500">out of 100</p>
            </div>
          </div>

          {/* Score Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>0</span>
              <span className="text-amber-600">Pass: 80</span>
              <span>100</span>
            </div>
            <div className="h-4 bg-slate-200 rounded-full overflow-hidden relative">
              {qaResult && (
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(qaResult.overallScore)}`}
                  style={{ width: `${qaResult.overallScore}%` }}
                />
              )}
              {/* Pass threshold marker */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400" style={{ left: "80%" }} />
            </div>
          </div>

          <Button
            onClick={handleRunValidation}
            disabled={validating}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {validating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {qaResult ? "Re-Run Validation" : "Run QA Validation"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {qaResult && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-slate-800">
                {qaResult.summary.passedChecks}/{qaResult.summary.totalChecks}
              </div>
              <p className="text-xs text-slate-500">Checks Passed</p>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-red-600">{qaResult.summary.criticalIssues}</div>
              <p className="text-xs text-slate-500">Critical Issues</p>
            </CardContent>
          </Card>
          <Card className="text-center border-amber-200">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-amber-600">{qaResult.summary.warningIssues}</div>
              <p className="text-xs text-slate-500">Warnings</p>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-blue-600">{qaResult.summary.infoIssues}</div>
              <p className="text-xs text-slate-500">Info</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QA Checks */}
      {qaResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Validation Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qaResult.checks.map((check) => (
                <div key={check.name} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCheck(check.name)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {check.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium text-slate-800">{check.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">
                        {check.score}/{check.maxScore} pts
                      </span>
                      {check.issues.length > 0 && (
                        <span className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-600">
                          {check.issues.length} issue{check.issues.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {expandedChecks.has(check.name) ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expandedChecks.has(check.name) && check.issues.length > 0 && (
                    <div className="px-4 pb-4 space-y-2 border-t bg-slate-50">
                      {check.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className={`mt-2 p-3 rounded-lg border ${getSeverityBg(issue.severity)}`}
                        >
                          <div className="flex items-start gap-2">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1">
                              <h5 className="font-medium text-slate-800">{issue.title}</h5>
                              <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
                              <p className="text-sm text-slate-700 mt-2 p-2 bg-white/50 rounded">
                                <strong>Recommendation:</strong> {issue.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Issues Alert */}
      {qaResult && qaResult.summary.criticalIssues > 0 && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">
                  {qaResult.summary.criticalIssues} Critical Issue{qaResult.summary.criticalIssues !== 1 ? "s" : ""} Found
                </h4>
                <p className="text-sm text-red-700">
                  Critical issues must be resolved before your claim can be submitted.
                  Please review the issues above and take the recommended actions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate(`/claims/${claimId}/analysis`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analysis
        </Button>
        <Button
          onClick={handleApprove}
          disabled={!qaResult || !qaResult.passed}
          className="bg-gradient-to-r from-[#D4A574] to-[#8B9D83] hover:from-[#B8895E] hover:to-[#6B7D63] text-white disabled:opacity-50"
        >
          {qaResult?.passed ? "Approve & Proceed to Submit" : "Resolve Issues to Continue"}
        </Button>
      </div>
    </div>
  )
}
