import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Upload,
  Brain,
  CheckCircle2,
  Clock,
  ArrowRight,
  Users,
  AlertCircle,
  Shield,
  Loader2,
  ArrowLeft,
  Search,
  FileCheck,
  Send,
  BarChart3,
  X,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { claimsApi, advocatesApi, messagesApi } from "../lib/api"
import type { Claim, Advocate } from "../lib/api"


const CLAIM_STAGES = [
  { key: "intake", label: "Intake", description: "Document upload & collection", icon: Upload },
  { key: "analysis", label: "Analysis", description: "AI condition discovery", icon: Brain },
  { key: "evidence", label: "Evidence", description: "Gather & link evidence", icon: Search },
  { key: "review", label: "Review", description: "Quality assurance", icon: FileCheck },
  { key: "submit", label: "Submit", description: "VA submission", icon: Send },
  { key: "track", label: "Track", description: "Monitor status", icon: BarChart3 },
]

export function ClaimDetail() {
  const { id: claimId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [advocate, setAdvocate] = useState<Advocate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageSubject, setMessageSubject] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState(false)

  const userId = localStorage.getItem("userId")

  useEffect(() => {
    if (claimId) {
      loadClaimData()
    }
  }, [claimId])

  const loadClaimData = async () => {
    if (!claimId || !userId) return

    try {
      setLoading(true)
      setError(null)

      const [claimRes, advocateRes] = await Promise.all([
        claimsApi.get(claimId).catch(() => ({ success: false, claim: null })),
        advocatesApi.getMyAdvocate(userId).catch(() => ({ success: false, hasAdvocate: false, advocate: null })),
      ])

      if (claimRes.claim) {
        setClaim(claimRes.claim)
      } else {
        setError("Claim not found")
      }

      if (advocateRes.advocate) {
        setAdvocate(advocateRes.advocate)
      } else {
        const storedAdvocate = localStorage.getItem("assignedAdvocate")
        if (storedAdvocate) {
          try {
            setAdvocate(JSON.parse(storedAdvocate))
          } catch {
            // Invalid JSON
          }
        }
      }
    } catch (err) {
      console.error("Error loading claim:", err)
      setError("Failed to load claim details")
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStageIndex = () => {
    if (!claim) return 0
    const stageIndex = CLAIM_STAGES.findIndex(s => s.key === claim.stage)
    return stageIndex >= 0 ? stageIndex : 0
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-neutral-400",
      in_progress: "bg-blue-500",
      in_review: "bg-blue-500",
      submitted: "bg-[#8B9D83]",
      approved: "bg-green-500",
      denied: "bg-red-500",
    }
    return colors[status] || "bg-neutral-400"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "DRAFT",
      in_progress: "IN PROGRESS",
      in_review: "IN REVIEW",
      submitted: "SUBMITTED",
      approved: "APPROVED",
      denied: "DENIED",
    }
    return labels[status] || status.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleSendMessage = async () => {
    if (!userId || !advocate || !messageContent.trim()) return

    // Get the advocate's user ID (the user account behind the advocate profile)
    const advocateUserId = advocate.userId

    if (!advocateUserId) {
      console.error("Advocate user ID not found")
      return
    }

    try {
      setSendingMessage(true)
      await messagesApi.send({
        senderId: userId,
        recipientId: advocateUserId,
        claimId: claimId,
        subject: messageSubject || `Question about Claim #${claimId?.slice(0, 8)}`,
        content: messageContent,
      })

      setMessageSuccess(true)
      setTimeout(() => {
        setShowMessageModal(false)
        setMessageSubject("")
        setMessageContent("")
        setMessageSuccess(false)
      }, 2000)
    } catch (err) {
      console.error("Error sending message:", err)
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A574] mx-auto mb-4" />
          <p className="text-slate-500">Loading your claim...</p>
        </div>
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-slate-800">Claim Not Found</h2>
        <p className="text-slate-500 mb-6">We couldn't find this claim. It may have been deleted.</p>
        <Button onClick={() => navigate("/dashboard")} className="bg-[#D4A574] hover:bg-[#B8895E]">
          Return to Dashboard
        </Button>
      </div>
    )
  }

  const currentStageIndex = getCurrentStageIndex()
  const progressPercent = Math.round(((currentStageIndex + 1) / CLAIM_STAGES.length) * 100)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Claim #{claim.id.slice(0, 8)}
            </h1>
            <p className="text-slate-500">Created {formatDate(claim.createdAt)}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded text-white ${getStatusColor(claim.status)}`}
          >
            {getStatusLabel(claim.status)}
          </span>
        </div>
      </div>

      {/* 6-Stage Progress Tracker */}
      <Card className="mb-6 bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1 text-slate-800">Claim Progress</h3>
              <p className="text-sm text-slate-500">
                Stage {currentStageIndex + 1} of {CLAIM_STAGES.length}: {CLAIM_STAGES[currentStageIndex].label}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#D4A574]">{progressPercent}%</div>
              <p className="text-xs text-slate-500">Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-[#D4A574] to-[#8B9D83] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 6 Stage Icons */}
          <div className="grid grid-cols-6 gap-2">
            {CLAIM_STAGES.map((stage, index) => {
              const Icon = stage.icon
              const isComplete = index < currentStageIndex
              const isCurrent = index === currentStageIndex



              return (
                <div key={stage.key} className="text-center">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-all ${isComplete
                      ? "bg-green-500 text-white"
                      : isCurrent
                        ? "bg-[#D4A574] text-white ring-4 ring-[#D4A574]/30"
                        : "bg-slate-200 text-slate-400"
                      }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <p
                    className={`text-xs font-medium ${isCurrent ? "text-[#D4A574]" : isComplete ? "text-green-600" : "text-slate-400"
                      }`}
                  >
                    {stage.label}
                  </p>
                  <p className="text-[10px] text-slate-400 hidden md:block">{stage.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Stage Action Card */}
          <Card className="border-l-4 border-l-[#D4A574]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <ArrowRight className="h-5 w-5 text-[#D4A574]" />
                Current Step: {CLAIM_STAGES[currentStageIndex].label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* INTAKE Stage */}
              {claim.stage === "intake" && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Upload className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-slate-800">
                        Upload Your Documents
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Upload your DD-214, medical records, buddy statements, and any other supporting documents.
                        Our system will automatically extract and analyze the information.
                      </p>
                      <ul className="text-sm text-slate-600 mb-4 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          DD-214 (Discharge Papers)
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          Medical Records
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          Service Treatment Records
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          Buddy Statements
                        </li>
                      </ul>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate(`/claims/${claimId}/documents`)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ANALYSIS Stage */}
              {claim.stage === "analysis" && (
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <Brain className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-slate-800">
                        AI Condition Discovery
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Our AI is analyzing your documents to identify potential conditions and map them
                        to VA diagnostic codes. Review the discovered conditions and add any that were missed.
                      </p>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => navigate(`/claims/${claimId}/analysis`)}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        View AI Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* EVIDENCE Stage */}
              {claim.stage === "evidence" && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-start gap-3">
                    <Search className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-slate-800">
                        Gather & Link Evidence
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Link your uploaded documents to specific conditions. Our system will identify
                        evidence gaps and help you request nexus letters or DBQs from providers.
                      </p>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Search className="h-4 w-4 mr-2" />
                        Review Evidence
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* REVIEW Stage */}
              {claim.stage === "review" && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <FileCheck className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-slate-800">
                        Quality Assurance Review
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Your claim is being reviewed for completeness. We check document quality,
                        evidence mapping, and rating criteria alignment. Target score: 80+
                      </p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Approval Readiness Score</span>
                          <span className="font-bold text-amber-600">{claim.approvalReadinessScore || 0}/100</span>
                        </div>
                        <div className="h-2 bg-amber-100 rounded-full">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${claim.approvalReadinessScore || 0}%` }}
                          />
                        </div>
                      </div>
                      <Button
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={() => navigate(`/claims/${claimId}/review`)}
                      >
                        <FileCheck className="h-4 w-4 mr-2" />
                        View QA Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBMIT Stage */}
              {claim.stage === "submit" && (
                <div className="p-4 rounded-lg bg-[#E8C9A1]/30 border border-[#D4A574]/50">
                  <div className="flex items-start gap-3">
                    <Send className="h-6 w-6 text-[#D4A574] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-slate-800">
                        Ready to Submit!
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Your claim package is complete and ready for VA submission. Review the final
                        package and submit with one click via the Benefits Intake API.
                      </p>
                      <Button className="bg-gradient-to-r from-[#D4A574] to-[#C97B63] hover:from-[#B8895E] hover:to-[#A85F4A] text-white">
                        <Send className="h-4 w-4 mr-2" />
                        Submit to VA
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TRACK Stage */}
              {claim.stage === "track" && (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-6 w-6 text-slate-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-slate-800">
                        Tracking Your Claim
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Your claim has been submitted to the VA. We're monitoring the status and will
                        notify you of any updates or requests for additional information.
                      </p>
                      <div className="p-3 bg-white rounded border mb-3">
                        <p className="text-xs text-slate-500">VA Claim ID</p>
                        <p className="font-mono font-medium">{claim.vaClaimId || "Pending..."}</p>
                      </div>
                      <Button variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Status Timeline
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conditions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Shield className="h-5 w-5 text-[#A82735]" />
                Claimed Conditions ({claim.conditions?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {claim.conditions && claim.conditions.length > 0 ? (
                <div className="space-y-3">
                  {claim.conditions.map((condition) => (
                    <div
                      key={condition.id}
                      className="p-4 rounded-lg bg-gradient-to-br from-[#F5F1E8] to-white border border-[#D4A574]/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-slate-800 mb-1">
                            {condition.name}
                          </h4>
                          {condition.description && (
                            <p className="text-sm text-slate-600 mb-2">
                              {condition.description}
                            </p>
                          )}
                          {condition.vaCode && (
                            <span className="px-2 py-0.5 text-xs rounded border border-slate-300 text-slate-600">
                              VA Code: {condition.vaCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-2">No conditions identified yet</p>
                  <p className="text-sm text-slate-400">
                    Upload documents to let our AI discover conditions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Claim Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-800">Claim Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Claim Type</p>
                  <p className="font-medium text-slate-800">
                    {claim.claimType === "original"
                      ? "Initial Claim"
                      : claim.claimType === "increase"
                        ? "Claim for Increase"
                        : claim.claimType}
                  </p>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-500 mb-1">Current Stage</p>
                  <p className="font-medium text-slate-800 capitalize">{claim.stage}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Documents</p>
                  <p className="font-medium text-slate-800">0 uploaded</p>
                </div>
                {claim.estimatedRating && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Estimated Rating</p>
                    <p className="font-medium text-slate-800">{claim.estimatedRating}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Advocate Card */}
          {advocate && (
            <Card className="bg-gradient-to-br from-[#E8C9A1]/10 to-[#B5C4AE]/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Users className="h-5 w-5 text-[#C97B63]" />
                  Your Advocate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C97B63] flex items-center justify-center text-white font-bold text-lg">
                    {advocate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{advocate.name}</p>
                    <p className="text-xs text-slate-500">
                      {advocate.branch} • {advocate.era}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-[#D4A574] text-[#D4A574]"
                  onClick={() => setShowMessageModal(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Need Help?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Your advocate can help you gather evidence and understand each step.
                  </p>
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send Message Modal */}
      {showMessageModal && advocate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-slate-800">
                Message {advocate.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowMessageModal(false)
                  setMessageSubject("")
                  setMessageContent("")
                  setMessageSuccess(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {messageSuccess ? (
              <div className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-slate-800 mb-1">
                  Message Sent!
                </h4>
                <p className="text-sm text-slate-500">
                  {advocate.name} will receive your message shortly.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subject
                  </label>
                  <Input
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder={`Question about Claim #${claimId?.slice(0, 8)}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    value={messageContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowMessageModal(false)
                      setMessageSubject("")
                      setMessageContent("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#D4A574] hover:bg-[#B8895E]"
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || sendingMessage}
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
