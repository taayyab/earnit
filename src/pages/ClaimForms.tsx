import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Download,
  Eye,
  CheckCircle2,
  Stethoscope,
  ClipboardList,
  X,
  Copy,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { formsApi, aiApi } from "../lib/api"
import type { FormGenerationResult, ExtractedCondition } from "../lib/api"

export function ClaimForms() {
  const { id: claimId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [conditions, setConditions] = useState<ExtractedCondition[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generatedForm, setGeneratedForm] = useState<FormGenerationResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)

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



      if (analysisRes.analysis?.conditions) {
        setConditions(analysisRes.analysis.conditions)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load forms data")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate526EZ = async () => {
    if (!claimId) return
    setGenerating("526ez")
    setError(null)

    try {
      const result = await formsApi.generate526EZ(claimId)
      if (result.success && result.form) {
        setGeneratedForm(result.form)
        setShowPreview(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate form")
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateNexus = async (conditionId: string) => {
    setGenerating(`nexus-${conditionId}`)
    setError(null)

    try {
      const result = await formsApi.generateNexusLetter(conditionId)
      if (result.success && result.nexusLetter) {
        setGeneratedForm(result.nexusLetter)
        setShowPreview(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate nexus letter")
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateDBQ = async (conditionId: string) => {
    setGenerating(`dbq-${conditionId}`)
    setError(null)

    try {
      const result = await formsApi.generateDBQ(conditionId)
      if (result.success && result.dbq) {
        setGeneratedForm(result.dbq)
        setShowPreview(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate DBQ")
    } finally {
      setGenerating(null)
    }
  }

  const handleCopyToClipboard = async () => {
    if (!generatedForm?.previewText) return

    try {
      await navigator.clipboard.writeText(generatedForm.previewText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }



  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A574] mx-auto mb-4" />
          <p className="text-slate-500">Loading forms...</p>
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
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">VA Forms</h1>
        </div>
        <p className="text-slate-500">
          Generate and preview VA disability claim forms, nexus letters, and DBQs.
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

      {/* Main Form - VA Form 21-526EZ */}
      <Card className="mb-6 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            VA Form 21-526EZ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Application for Disability Compensation and Related Compensation Benefits.
            This is the primary form for filing a VA disability claim.
          </p>
          <Button
            onClick={handleGenerate526EZ}
            disabled={generating === "526ez"}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {generating === "526ez" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Generate Preview
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Condition-Specific Forms */}
      {conditions.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Condition-Specific Forms</h2>

          {conditions.map((condition) => (
            <Card key={condition.id} className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {condition.name}
                  {condition.vaCode && (
                    <span className="text-sm font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {condition.vaCode}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Nexus Letter */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-green-800">Nexus Letter</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Medical statement linking condition to service.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateNexus(condition.id!)}
                      disabled={generating === `nexus-${condition.id}`}
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      {generating === `nexus-${condition.id}` ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>

                  {/* DBQ */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium text-purple-800">DBQ</h4>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">
                      Disability Benefits Questionnaire for evaluation.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateDBQ(condition.id!)}
                      disabled={generating === `dbq-${condition.id}`}
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      {generating === `dbq-${condition.id}` ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {/* Info Box */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Important Note</h4>
              <p className="text-sm text-amber-700 mt-1">
                Generated forms are for preview and reference only. Nexus letters require review and signature
                by a qualified medical professional. DBQs must be completed by a licensed healthcare provider.
                The VA Form 21-526EZ will be auto-populated during the submission process.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && generatedForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{generatedForm.formName}</h3>
                <p className="text-sm text-slate-500">
                  {generatedForm.formNumber} | Generated: {new Date(generatedForm.generatedAt).toLocaleString()}
                  {generatedForm.method === "simulated" && (
                    <span className="ml-2 text-amber-600">(Simulated Preview)</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-lg border overflow-x-auto">
                {generatedForm.previewText}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-between">
              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#D4A574] to-[#8B9D83] hover:from-[#B8895E] hover:to-[#6B7D63] text-white"
                  disabled
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF (Coming Soon)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
