import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Brain,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  Edit2,
  Save,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { aiApi } from "../lib/api"
import type { ExtractedCondition } from "../lib/api"

export function ClaimAnalysis() {
  const { id: claimId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [conditions, setConditions] = useState<ExtractedCondition[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "", vaCode: "" })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCondition, setNewCondition] = useState({ name: "", description: "", vaCode: "" })
  const [documentsAnalyzed, setDocumentsAnalyzed] = useState(0)

  useEffect(() => {
    loadData()
  }, [claimId])

  const loadData = async () => {
    if (!claimId) return

    try {
      setLoading(true)
      setError(null)

      const [analysisRes] = await Promise.all([
        aiApi.getAnalysis(claimId).catch(() => ({ success: false, analysis: null })),
      ])

      if (analysisRes.analysis) {
        setConditions(analysisRes.analysis.conditions || [])
        setDocumentsAnalyzed(analysisRes.analysis.documentsAnalyzed || 0)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load analysis data")
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!claimId) return

    setAnalyzing(true)
    setError(null)

    try {
      const result = await aiApi.analyze(claimId)
      if (result.success && result.analysis) {
        setConditions(result.analysis.conditions || [])
        setDocumentsAnalyzed(result.analysis.documentsAnalyzed || 0)
        setSuccess("AI analysis complete! Review the discovered conditions below.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze documents")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAddCondition = async () => {
    if (!claimId || !newCondition.name.trim()) return

    try {
      const result = await aiApi.addCondition(claimId, newCondition)
      if (result.success && result.condition) {
        setConditions([...conditions, result.condition])
        setNewCondition({ name: "", description: "", vaCode: "" })
        setShowAddForm(false)
        setSuccess("Condition added successfully")
      }
    } catch (err) {
      setError("Failed to add condition")
    }
  }

  const handleRemoveCondition = async (conditionId: string) => {
    if (!confirm("Are you sure you want to remove this condition?")) return

    try {
      await aiApi.removeCondition(conditionId)
      setConditions(conditions.filter((c) => c.id !== conditionId))
      setSuccess("Condition removed")
    } catch (err) {
      setError("Failed to remove condition")
    }
  }

  const handleEditCondition = (condition: ExtractedCondition) => {
    setEditingId(condition.id || null)
    setEditForm({
      name: condition.name,
      description: condition.description || "",
      vaCode: condition.vaCode || "",
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    try {
      const result = await aiApi.updateCondition(editingId, editForm)
      if (result.success) {
        setConditions(
          conditions.map((c) =>
            c.id === editingId ? { ...c, ...editForm } : c
          )
        )
        setEditingId(null)
        setSuccess("Condition updated")
      }
    } catch (err) {
      setError("Failed to update condition")
    }
  }

  const handleConfirmAndProceed = async () => {
    if (!claimId) return

    try {
      await aiApi.confirmAnalysis(claimId)
      navigate(`/claims/${claimId}/evidence`)
    } catch (err) {
      setError("Failed to proceed")
    }
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "bg-slate-200"
    if (confidence >= 0.8) return "bg-green-500"
    if (confidence >= 0.6) return "bg-yellow-500"
    return "bg-orange-500"
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A574] mx-auto mb-4" />
          <p className="text-slate-500">Loading analysis...</p>
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
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-slate-800">AI Condition Analysis</h1>
        </div>
        <p className="text-slate-500">
          Our AI analyzes your documents to identify potential service-connected conditions and map them to VA diagnostic codes.
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

      {/* Analysis Status */}
      <Card className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                {conditions.length > 0 ? "Analysis Complete" : "Ready to Analyze"}
              </h3>
              <p className="text-sm text-slate-600">
                {conditions.length > 0
                  ? `Found ${conditions.length} potential condition${conditions.length !== 1 ? "s" : ""} from ${documentsAnalyzed} document${documentsAnalyzed !== 1 ? "s" : ""}`
                  : "Click the button to start AI analysis of your uploaded documents"}
              </p>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {conditions.length > 0 ? "Re-Analyze" : "Start Analysis"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Discovered Conditions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Discovered Conditions ({conditions.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="border-purple-300 text-purple-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Condition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Condition Form */}
          {showAddForm && (
            <div className="mb-4 p-4 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50">
              <h4 className="font-semibold text-slate-800 mb-3">Add New Condition</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Condition Name *"
                  value={newCondition.name}
                  onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <input
                  type="text"
                  placeholder="VA Diagnostic Code (optional)"
                  value={newCondition.vaCode}
                  onChange={(e) => setNewCondition({ ...newCondition, vaCode: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newCondition.description}
                  onChange={(e) => setNewCondition({ ...newCondition, description: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddCondition} className="bg-purple-600 hover:bg-purple-700">
                    Add Condition
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {conditions.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No conditions discovered yet</h3>
              <p className="text-slate-500 mb-4">
                Run the AI analysis to automatically discover conditions from your documents,
                or add them manually.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {conditions.map((condition) => (
                <div
                  key={condition.id || condition.name}
                  className="p-4 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors"
                >
                  {editingId === condition.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="VA Code"
                          value={editForm.vaCode}
                          onChange={(e) => setEditForm({ ...editForm, vaCode: e.target.value })}
                          className="w-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">{condition.name}</h4>
                          {condition.vaCode && (
                            <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                              Code: {condition.vaCode}
                            </span>
                          )}
                          {condition.confidence && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <span
                                className={`w-2 h-2 rounded-full ${getConfidenceColor(condition.confidence)}`}
                              />
                              {Math.round(condition.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                        {condition.description && (
                          <p className="text-sm text-slate-600">{condition.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => handleEditCondition(condition)}
                          className="p-2 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => condition.id && handleRemoveCondition(condition.id)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">About VA Diagnostic Codes</h4>
              <p className="text-sm text-blue-700">
                The VA uses diagnostic codes from 38 CFR Part 4 to rate disabilities.
                Each code corresponds to specific conditions and has a maximum rating percentage.
                Our AI maps your conditions to these codes to help streamline your claim.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate(`/claims/${claimId}/documents`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </Button>
        <Button
          onClick={handleConfirmAndProceed}
          disabled={conditions.length === 0}
          className="bg-gradient-to-r from-[#D4A574] to-[#8B9D83] hover:from-[#B8895E] hover:to-[#6B7D63] text-white"
        >
          Confirm & Proceed to Evidence
        </Button>
      </div>
    </div>
  )
}
