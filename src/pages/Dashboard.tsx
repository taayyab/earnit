import { useEffect, useState } from "react"
import { FileText, Plus, ArrowRight, Heart, Calendar, Users, AlertCircle, Loader2, X, Send, MessageSquare, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { claimsApi, advocatesApi, touchpointsApi } from "../lib/api"
import type { Claim, Advocate, Touchpoint } from "../lib/api"

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: "bg-neutral-400",
    in_progress: "bg-blue-500",
    in_review: "bg-blue-500",
    qa_pending: "bg-yellow-500",
    submitted: "bg-[#8B9D83]",
    approved: "bg-green-500",
    denied: "bg-red-500",
  }
  return colors[status] || "bg-neutral-400"
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: "Draft",
    in_progress: "In Progress",
    in_review: "In Review",
    qa_pending: "QA Pending",
    submitted: "Submitted",
    approved: "Approved",
    denied: "Denied",
  }
  return labels[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  }
}

export function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [claims, setClaims] = useState<Claim[]>([])
  const [advocate, setAdvocate] = useState<Advocate | null>(null)
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [message, setMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [schedulingTouchpoint, setSchedulingTouchpoint] = useState(false)
  const [touchpointScheduled, setTouchpointScheduled] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [meetingType, setMeetingType] = useState("Video Call")

  const userName = localStorage.getItem("userName") || "Veteran"
  const userId = localStorage.getItem("userId")
  const firstName = userName.split(" ")[0]

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    if (!userId) {
      setError("User not authenticated")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [claimsRes, advocateRes, touchpointsRes] = await Promise.all([
        claimsApi.list(userId).catch(() => ({ success: false, claims: [] })),
        advocatesApi.getMyAdvocate(userId).catch(() => ({ success: false, hasAdvocate: false, advocate: null })),
        touchpointsApi.getUpcoming(userId).catch(() => ({ success: false, touchpoints: [] })),
      ])

      setClaims(claimsRes.claims || [])
      setTouchpoints(touchpointsRes.touchpoints || [])

      // Check API first, then fall back to localStorage for advocate
      if (advocateRes.advocate) {
        setAdvocate(advocateRes.advocate)
      } else {
        // Fall back to localStorage (from onboarding)
        const storedAdvocate = localStorage.getItem("assignedAdvocate")
        if (storedAdvocate) {
          try {
            const parsed = JSON.parse(storedAdvocate)
            setAdvocate({
              id: parsed.id,
              name: parsed.name,
              branch: parsed.branch,
              era: parsed.era,
              yearsExperience: parsed.yearsExperience,
              specialties: parsed.specialties || [],
              bio: parsed.bio,
              rating: parsed.rating,
              reviewCount: parsed.reviewCount,
              tier: parsed.tier,
              availability: parsed.availability || [],
              interactionStyle: parsed.interactionStyle,
              matchScore: parsed.matchScore,
            })
          } catch {
            // Invalid JSON
          }
        }
      }
    } catch (err) {
      console.error("Error loading dashboard:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClaim = async () => {
    if (!userId) return

    setCreating(true)
    setError(null)
    try {
      const result = await claimsApi.create({
        veteranId: userId,
        claimType: "original",
      })

      if (result.success && result.claim) {
        // Navigate to the new claim detail page
        navigate(`/claims/${result.claim.id}`)
      }
    } catch (err) {
      console.error("Error creating claim:", err)
      setError("Failed to create claim. Please try again.")
      setCreating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !advocate) return

    setSendingMessage(true)
    // Simulate sending message (in production, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSendingMessage(false)
    setMessageSent(true)

    // Reset after showing success
    setTimeout(() => {
      setShowMessageModal(false)
      setMessage("")
      setMessageSent(false)
    }, 2000)
  }

  const handleScheduleTouchpoint = async () => {
    if (!selectedDate || !selectedTime || !advocate || !userId) return

    setSchedulingTouchpoint(true)
    setError(null)
    try {
      const scheduledDate = new Date(`${selectedDate}T${selectedTime}`)
      const result = await touchpointsApi.schedule({
        veteranId: userId,
        advocateId: advocate.id,
        scheduledDate: scheduledDate.toISOString(),
        meetingType,
        notes: "",
      })

      if (result.success) {
        setTouchpointScheduled(true)
        // Reload touchpoints
        const touchpointsRes = await touchpointsApi.getUpcoming(userId)
        setTouchpoints(touchpointsRes.touchpoints || [])

        // Reset after showing success
        setTimeout(() => {
          setShowScheduleModal(false)
          setSelectedDate("")
          setSelectedTime("")
          setMeetingType("Video Call")
          setTouchpointScheduled(false)
        }, 2000)
      } else {
        setError("Failed to schedule touchpoint. Please try again.")
      }
    } catch (err) {
      console.error("Error scheduling touchpoint:", err)
      setError("Failed to schedule touchpoint. Please try again.")
    } finally {
      setSchedulingTouchpoint(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A574] mx-auto mb-4" />
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <img
            src="/earnedit_logo.webp"
            alt="EarnedIT"
            className="h-16 w-16 object-contain"
          />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              Welcome back, {firstName}
            </h1>
            <p className="text-lg text-slate-500">
              We're here to help you every step of the way
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Top Row: Advocate, Touchpoints, Progress */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Advocate Widget */}
        <Card className="lg:col-span-1 border-[#D4A574]/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-[#C97B63]" />
              Your Peer Advocate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advocate ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B9D83] flex items-center justify-center text-white font-semibold text-lg">
                    {advocate.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{advocate.name}</p>
                    <p className="text-sm text-slate-500">{advocate.branch} • {advocate.era}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="text-yellow-500">★</span>
                  <span>{advocate.rating} ({advocate.reviewCount} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {advocate.specialties.slice(0, 2).map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-0.5 text-xs rounded-full bg-[#8B9D83]/10 text-[#8B9D83]"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574]/10"
                  onClick={() => setShowMessageModal(true)}
                >
                  Send Message
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="h-12 w-12 text-[#D4A574] mx-auto mb-3 opacity-50" />
                <p className="text-sm text-slate-500 mb-4">
                  You haven't been matched with an advocate yet
                </p>
                <Button
                  onClick={() => navigate("/onboarding")}
                  className="w-full bg-gradient-to-r from-[#D4A574] to-[#C97B63] hover:from-[#B8895E] hover:to-[#A85F4A] text-white"
                >
                  Find Your Advocate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Touchpoints Widget */}
        <Card className="lg:col-span-1 border-[#8B9D83]/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-[#8B9D83]" />
              Upcoming Touchpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {touchpoints.length > 0 ? (
              <div className="space-y-3">
                {touchpoints.slice(0, 2).map((tp) => {
                  const { date, time } = formatDateTime(tp.scheduledDate)
                  return (
                    <div
                      key={tp.id}
                      className="p-3 rounded-lg bg-gradient-to-br from-[#E8C9A1]/10 to-[#B5C4AE]/10 border border-[#D4A574]/20"
                    >
                      <p className="text-sm font-semibold text-slate-800">{tp.meetingType}</p>
                      <p className="text-xs text-slate-500">
                        {date} at {time}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">with {tp.advocateName}</p>
                    </div>
                  )
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[#8B9D83] hover:text-[#8B9D83] hover:bg-[#8B9D83]/10"
                >
                  View All Touchpoints
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Calendar className="h-12 w-12 text-[#8B9D83] mx-auto mb-3 opacity-50" />
                <p className="text-sm text-slate-500">No upcoming touchpoints</p>
                {advocate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-[#8B9D83] text-[#8B9D83]"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    Schedule Touchpoint
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Stats Widget */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Total Claims</span>
              <span className="text-2xl font-bold text-slate-800">{claims.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">In Progress</span>
              <span className="text-2xl font-bold text-blue-500">
                {claims.filter(c => c.status === "draft" || c.status === "in_progress" || c.status === "in_review").length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Conditions</span>
              <span className="text-2xl font-bold text-[#8B9D83]">
                {claims.reduce((acc, c) => acc + (c.conditions?.length || 0), 0)}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4A574] to-[#8B9D83]"
                style={{ width: claims.length > 0 ? "35%" : "0%" }}
              />
            </div>
            <p className="text-xs text-slate-400 text-center">
              {claims.length > 0 ? "35% of claims process completed" : "Start your first claim"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl md:text-2xl">Your Claims</CardTitle>
            <Button
              onClick={handleCreateClaim}
              disabled={creating}
              className="bg-[#A82735] hover:bg-[#8F1B29] text-white"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {creating ? "Creating..." : "New Claim"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-[#E8C9A1]/10 to-[#B5C4AE]/10 rounded-lg border-2 border-dashed border-[#D4A574]/30">
              <FileText className="h-16 w-16 text-[#D4A574] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2 text-slate-800">Ready to get started?</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Let's create your first VA disability claim. We'll guide you through every step.
              </p>
              <Button
                onClick={handleCreateClaim}
                disabled={creating}
                size="lg"
                className="bg-gradient-to-r from-[#D4A574] to-[#C97B63] hover:from-[#B8895E] hover:to-[#A85F4A] text-white"
              >
                {creating ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5 mr-2" />
                )}
                Create Your First Claim
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <Card
                  key={claim.id}
                  className="hover:shadow-md transition-all cursor-pointer border-slate-200 hover:border-[#D4A574]/50"
                  onClick={() => navigate(`/claims/${claim.id}`)}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-800">
                            {claim.claimType === "original" ? "Initial Disability Claim" :
                             claim.claimType === "increase" ? "Claim for Increase" :
                             claim.claimType === "appeal" ? "Appeal" : claim.claimType}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full text-white ${getStatusColor(claim.status)}`}
                          >
                            {getStatusLabel(claim.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">ID: {claim.id.slice(0, 8)}</p>
                        {claim.conditions && claim.conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {claim.conditions.map((condition) => (
                              <span
                                key={condition.id}
                                className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600"
                              >
                                {condition.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          Last updated: {formatDate(claim.updatedAt)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Helpful Tips for New Users */}
      {claims.length <= 2 && (
        <Card className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-[#D4A574] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">New to VA disability claims?</h3>
                <p className="text-sm text-slate-500 mb-3">Don't worry - we make it simple.</p>
                <ol className="text-sm space-y-2 list-decimal list-inside text-slate-600">
                  <li>Create a claim and list your conditions</li>
                  <li>Connect with a peer advocate who understands your journey</li>
                  <li>Upload your medical records and evidence</li>
                  <li>We'll help auto-fill the VA forms for you</li>
                  <li>Submit when ready and track your progress</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Message Modal */}
      {showMessageModal && advocate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-[#D4A574]" />
                <h2 className="text-lg font-semibold text-slate-800">Message {advocate.name}</h2>
              </div>
              <button
                onClick={() => {
                  setShowMessageModal(false)
                  setMessage("")
                  setMessageSent(false)
                }}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4">
              {messageSent ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Message Sent!</h3>
                  <p className="text-sm text-slate-500">
                    {advocate.name} will respond as soon as possible.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B9D83] flex items-center justify-center text-white font-semibold">
                      {advocate.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{advocate.name}</p>
                      <p className="text-xs text-slate-500">{advocate.branch} Veteran</p>
                    </div>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full h-32 p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574]"
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowMessageModal(false)
                        setMessage("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendingMessage}
                      className="bg-[#D4A574] hover:bg-[#B8895E] text-white"
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Touchpoint Modal */}
      {showScheduleModal && advocate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#8B9D83]" />
                <h2 className="text-lg font-semibold text-slate-800">Schedule Touchpoint</h2>
              </div>
              <button
                onClick={() => {
                  setShowScheduleModal(false)
                  setSelectedDate("")
                  setSelectedTime("")
                  setMeetingType("Video Call")
                  setTouchpointScheduled(false)
                }}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4">
              {touchpointScheduled ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Touchpoint Scheduled!</h3>
                  <p className="text-sm text-slate-500">
                    Your meeting with {advocate.name} has been confirmed.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B9D83] flex items-center justify-center text-white font-semibold">
                      {advocate.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{advocate.name}</p>
                      <p className="text-xs text-slate-500">Your Peer Advocate</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Meeting Type
                      </label>
                      <select
                        value={meetingType}
                        onChange={(e) => setMeetingType(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/50 focus:border-[#8B9D83]"
                      >
                        <option value="Video Call">Video Call</option>
                        <option value="Phone Call">Phone Call</option>
                        <option value="In-Person">In-Person</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/50 focus:border-[#8B9D83]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/50 focus:border-[#8B9D83]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowScheduleModal(false)
                        setSelectedDate("")
                        setSelectedTime("")
                        setMeetingType("Video Call")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleScheduleTouchpoint}
                      disabled={!selectedDate || !selectedTime || schedulingTouchpoint}
                      className="bg-[#8B9D83] hover:bg-[#6B7D63] text-white"
                    >
                      {schedulingTouchpoint ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
