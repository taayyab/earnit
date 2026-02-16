import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Link2,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Plus,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { evidenceApi, documentsApi, aiApi } from "../lib/api"
import type { EvidenceLink, EvidenceSuggestion, ConditionWithEvidence, Document, ExtractedCondition } from "../lib/api"

const documentTypeLabels: Record<string, string> = {
  dd214: "DD-214",
  medical_records: "Medical Records",
  service_treatment: "Service Treatment Records",
  buddy_statement: "Buddy Statement",
  nexus_letter: "Nexus Letter",
  dbq: "Disability Benefits Questionnaire",
  va_decision: "VA Decision Letter",
  private_medical: "Private Medical Records",
  employment_records: "Employment Records",
  personal_statement: "Personal Statement",
  other: "Other",
}

export function ClaimEvidence() {
  const { id: claimId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [conditions, setConditions] = useState<ConditionWithEvidence[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [suggestions, setSuggestions] = useState<EvidenceSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expandedConditions, setExpandedConditions] = useState<Set<string>>(new Set())
  const [linkingCondition, setLinkingCondition] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [claimId])

  const loadData = async () => {
    if (!claimId) return

    try {
      setLoading(true)
      setError(null)

      const userId = localStorage.getItem("userId") || ""

      const [evidenceRes, docsRes] = await Promise.all([
        evidenceApi.getByClaim(claimId).catch(() => ({ success: false, conditionsWithEvidence: [], evidenceLinks: [] })),
        documentsApi.listByClaim(claimId).catch(() => ({ success: false, documents: [] })),
      ])

      if (evidenceRes.conditionsWithEvidence) {
        setConditions(evidenceRes.conditionsWithEvidence)
        // Auto-expand conditions that have no evidence
        const needsEvidence = new Set(
          evidenceRes.conditionsWithEvidence
            .filter((c) => c.evidenceLinks.length === 0)
            .map((c) => c.id)
        )
        setExpandedConditions(needsEvidence)
      }

      if (docsRes.documents) {
        setDocuments(docsRes.documents)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load evidence data")
    } finally {
      setLoading(false)
    }
  }

  const handleGetSuggestions = async () => {
    if (!claimId) return

    setLoadingSuggestions(true)
    try {
      const result = await evidenceApi.getSuggestions(claimId)
      if (result.success) {
        setSuggestions(result.suggestions)
        setSuccess(`Found ${result.suggestions.length} AI-suggested evidence links`)
      }
    } catch (err: any) {
      setError(err.message || "Failed to get suggestions")
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleLinkDocument = async (conditionId: string, documentId: string, relevanceScore?: number) => {
    try {
      const result = await evidenceApi.link({
        conditionId,
        documentId,
        relevanceScore,
      })

      if (result.success) {
        setSuccess("Document linked successfully")
        loadData()
        // Remove this suggestion
        setSuggestions((prev) =>
          prev.filter((s) => !(s.conditionId === conditionId && s.documentId === documentId))
        )
      }
    } catch (err: any) {
      setError(err.message || "Failed to link document")
    }
  }

  const handleUnlinkDocument = async (linkId: string) => {
    try {
      const result = await evidenceApi.unlink(linkId)
      if (result.success) {
        setSuccess("Document unlinked")
        loadData()
      }
    } catch (err: any) {
      setError(err.message || "Failed to unlink document")
    }
  }

  const handleConfirmEvidence = async () => {
    if (!claimId) return

    try {
      const result = await evidenceApi.confirm(claimId)
      if (result.success) {
        navigate(`/claims/${claimId}/review`)
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm evidence")
    }
  }

  const toggleCondition = (conditionId: string) => {
    const newExpanded = new Set(expandedConditions)
    if (newExpanded.has(conditionId)) {
      newExpanded.delete(conditionId)
    } else {
      newExpanded.add(conditionId)
    }
    setExpandedConditions(newExpanded)
  }

  const getAvailableDocuments = (conditionId: string) => {
    const condition = conditions.find((c) => c.id === conditionId)
    const linkedDocIds = condition?.evidenceLinks.map((l) => l.documentId) || []
    return documents.filter((d) => !linkedDocIds.includes(d.id))
  }

  const getEvidenceScore = () => {
    const total = conditions.length
    const withEvidence = conditions.filter((c) => c.evidenceLinks.length > 0).length
    return total > 0 ? Math.round((withEvidence / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A574] mx-auto mb-4" />
          <p className="text-slate-500">Loading evidence data...</p>
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
          <Link2 className="h-8 w-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-slate-800">Evidence Linking</h1>
        </div>
        <p className="text-slate-500">
          Connect your uploaded documents to each condition to build a strong evidence package.
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

      {/* Evidence Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Evidence Coverage</h3>
              <p className="text-sm text-slate-500">
                {conditions.filter((c) => c.evidenceLinks.length > 0).length} of {conditions.length} conditions have linked evidence
              </p>
            </div>
            <div className="text-3xl font-bold text-amber-600">{getEvidenceScore()}%</div>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4A574] to-[#8B9D83] transition-all duration-500"
              style={{ width: `${getEvidenceScore()}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card className="mb-6 border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-amber-600" />
              <div>
                <h3 className="font-semibold text-slate-800">AI Evidence Suggestions</h3>
                <p className="text-sm text-slate-600">
                  Let AI analyze your documents and suggest relevant evidence links
                </p>
              </div>
            </div>
            <Button
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loadingSuggestions ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Suggestions
                </>
              )}
            </Button>
          </div>

          {/* Show suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Suggested Links:</h4>
              {suggestions.slice(0, 5).map((suggestion, idx) => (
                <div
                  key={`${suggestion.conditionId}-${suggestion.documentId}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{suggestion.conditionName}</p>
                    <p className="text-sm text-slate-600">
                      <FileText className="inline h-3 w-3 mr-1" />
                      {suggestion.documentFileName}
                      <span className="ml-2 text-amber-600">
                        ({suggestion.relevanceScore}% relevance)
                      </span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleLinkDocument(suggestion.conditionId, suggestion.documentId, suggestion.relevanceScore)
                    }
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Link
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditions with Evidence */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Conditions & Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          {conditions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No conditions found for this claim.</p>
              <Button onClick={() => navigate(`/claims/${claimId}/analysis`)}>
                Go to Analysis
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {conditions.map((condition) => (
                <div key={condition.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCondition(condition.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {condition.evidenceLinks.length > 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      )}
                      <div className="text-left">
                        <span className="font-medium text-slate-800">{condition.name}</span>
                        {condition.vaCode && (
                          <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            {condition.vaCode}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">
                        {condition.evidenceLinks.length} document{condition.evidenceLinks.length !== 1 ? "s" : ""} linked
                      </span>
                      {expandedConditions.has(condition.id) ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expandedConditions.has(condition.id) && (
                    <div className="px-4 pb-4 border-t bg-slate-50">
                      {/* Linked Documents */}
                      {condition.evidenceLinks.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Linked Evidence:</h5>
                          <div className="space-y-2">
                            {condition.evidenceLinks.map((link) => (
                              <div
                                key={link.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-slate-400" />
                                  <div>
                                    <p className="font-medium text-slate-800">{link.documentFileName}</p>
                                    <p className="text-xs text-slate-500">
                                      {documentTypeLabels[link.documentType || "other"] || link.documentType}
                                      {link.relevanceScore && (
                                        <span className="ml-2 text-green-600">
                                          {link.relevanceScore}% relevance
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleUnlinkDocument(link.id)}
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Document */}
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-slate-700 mb-2">Add Evidence:</h5>
                        {getAvailableDocuments(condition.id).length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {getAvailableDocuments(condition.id).map((doc) => (
                              <button
                                key={doc.id}
                                onClick={() => handleLinkDocument(condition.id, doc.id)}
                                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50 transition-colors text-left"
                              >
                                <Plus className="h-4 w-4 text-slate-400" />
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-700 truncate">{doc.fileName}</p>
                                  <p className="text-xs text-slate-500">
                                    {documentTypeLabels[doc.documentType] || doc.documentType}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">
                            All documents are already linked to this condition.
                            <button
                              onClick={() => navigate(`/claims/${claimId}/documents`)}
                              className="ml-2 text-amber-600 hover:underline"
                            >
                              Upload more <ExternalLink className="inline h-3 w-3" />
                            </button>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
          onClick={handleConfirmEvidence}
          disabled={conditions.length === 0}
          className="bg-gradient-to-r from-[#D4A574] to-[#8B9D83] hover:from-[#B8895E] hover:to-[#6B7D63] text-white"
        >
          Confirm & Proceed to Review
        </Button>
      </div>
    </div>
  )
}
