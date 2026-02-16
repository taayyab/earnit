import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Upload,
  FileText,
  File,
  Image,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { documentsApi, claimsApi } from "../lib/api"
import type { Document, DocumentType, Claim } from "../lib/api"

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />
  if (fileType.includes("image")) return <Image className="h-8 w-8 text-blue-500" />
  return <File className="h-8 w-8 text-slate-400" />
}

export function ClaimDocuments() {
  const { id: claimId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("other")

  const userId = localStorage.getItem("userId")

  useEffect(() => {
    loadData()
  }, [claimId])

  const loadData = async () => {
    if (!claimId) return

    try {
      setLoading(true)
      setError(null)

      const [claimRes, docsRes, typesRes] = await Promise.all([
        claimsApi.get(claimId).catch(() => ({ success: false, claim: null })),
        documentsApi.listByClaim(claimId).catch(() => ({ success: false, documents: [], count: 0 })),
        documentsApi.getTypes().catch(() => ({ success: false, documentTypes: [] })),
      ])

      if (claimRes.claim) {
        setClaim(claimRes.claim)
      }
      setDocuments(docsRes.documents || [])
      setDocumentTypes(typesRes.documentTypes || [])
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load documents")
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        await uploadFiles(files)
      }
    },
    [userId, claimId, selectedType]
  )

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await uploadFiles(files)
    }
    e.target.value = ""
  }

  const uploadFiles = async (files: File[]) => {
    if (!userId || !claimId) return

    setUploading(true)
    setError(null)
    setSuccess(null)
    setUploadProgress(0)

    try {
      let uploaded = 0
      for (const file of files) {
        // Validate file type
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/tiff"]
        if (!allowedTypes.includes(file.type)) {
          setError(`Invalid file type: ${file.name}. Allowed: PDF, JPEG, PNG, TIFF`)
          continue
        }

        // Validate file size (100MB max)
        if (file.size > 100 * 1024 * 1024) {
          setError(`File too large: ${file.name}. Maximum size is 100MB`)
          continue
        }

        await documentsApi.upload(file, userId, claimId, selectedType)
        uploaded++
        setUploadProgress(Math.round((uploaded / files.length) * 100))
      }

      setSuccess(`Successfully uploaded ${uploaded} document${uploaded !== 1 ? "s" : ""}`)
      await loadData()
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || "Failed to upload documents")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      await documentsApi.delete(documentId)
      setDocuments(documents.filter((d) => d.id !== documentId))
      setSuccess("Document deleted successfully")
    } catch (err) {
      setError("Failed to delete document")
    }
  }

  const handleProceedToAnalysis = async () => {
    if (!claimId) return

    try {
      await claimsApi.update(claimId, { stage: "analysis" })
      navigate(`/claims/${claimId}`)
    } catch (err) {
      setError("Failed to proceed to analysis")
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A574] mx-auto mb-4" />
          <p className="text-slate-500">Loading documents...</p>
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Upload Documents</h1>
        <p className="text-slate-500">
          Upload your supporting documents for this claim. We accept PDF, JPEG, PNG, and TIFF files up to 100MB each.
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

      {/* Document Type Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Document Type</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? "border-[#D4A574] bg-[#D4A574]/10"
                : "border-slate-300 hover:border-[#D4A574]/50"
            }`}
          >
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-[#D4A574] mx-auto" />
                <p className="text-slate-600">Uploading... {uploadProgress}%</p>
                <div className="w-48 mx-auto h-2 bg-slate-200 rounded-full">
                  <div
                    className="h-full bg-[#D4A574] rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-[#D4A574] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Drag & drop files here
                </h3>
                <p className="text-slate-500 mb-4">or click to browse</p>
                <label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    className="bg-[#D4A574] hover:bg-[#B8895E] text-white"
                    onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files
                  </Button>
                </label>
                <p className="text-xs text-slate-400 mt-4">
                  Accepted: PDF, JPEG, PNG, TIFF (max 100MB per file)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Checklist */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Recommended Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: "dd214", label: "DD-214 (Discharge Papers)", required: true },
              { type: "medical_records", label: "Medical Records", required: true },
              { type: "service_treatment", label: "Service Treatment Records", required: false },
              { type: "buddy_statement", label: "Buddy Statements", required: false },
              { type: "nexus_letter", label: "Nexus Letter", required: false },
            ].map((item) => {
              const hasDoc = documents.some((d) => d.documentType === item.type)
              return (
                <div
                  key={item.type}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    hasDoc ? "bg-green-50 border border-green-200" : "bg-slate-50"
                  }`}
                >
                  {hasDoc ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                  )}
                  <span className={`flex-1 ${hasDoc ? "text-green-700" : "text-slate-600"}`}>
                    {item.label}
                  </span>
                  {item.required && !hasDoc && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                      Required
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            Uploaded Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  {getFileIcon(doc.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{doc.fileName}</p>
                    <p className="text-sm text-slate-500">
                      {doc.documentTypeLabel} • {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={documentsApi.getDownloadUrl(doc.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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
          onClick={() => navigate(`/claims/${claimId}`)}
        >
          Save & Continue Later
        </Button>
        <Button
          onClick={handleProceedToAnalysis}
          disabled={documents.length === 0}
          className="bg-gradient-to-r from-[#D4A574] to-[#8B9D83] hover:from-[#B8895E] hover:to-[#6B7D63] text-white"
        >
          Proceed to AI Analysis
        </Button>
      </div>
    </div>
  )
}
