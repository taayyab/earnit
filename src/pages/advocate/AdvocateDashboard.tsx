import { useState, useEffect } from "react";
import { Users, MessageSquare, Calendar, Award, Clock, CheckCircle, Mail, Loader2 } from "lucide-react";
import { StatsCard } from "../../components/stats-card";
import { messagesApi } from "../../lib/api";
import type { Message } from "../../lib/api";

const assignedVeterans = [
  {
    id: "1",
    name: "James Wilson",
    branch: "Army",
    claimStage: "Evidence Review",
    lastContact: "2 days ago",
    status: "active",
  },
  {
    id: "2",
    name: "Maria Garcia",
    branch: "Navy",
    claimStage: "QA Check",
    lastContact: "5 days ago",
    status: "needs-attention",
  },
  {
    id: "3",
    name: "Robert Thompson",
    branch: "Marines",
    claimStage: "Peer Support",
    lastContact: "1 day ago",
    status: "active",
  },
];

const pendingRequests = [
  {
    id: "1",
    veteranName: "Thomas Anderson",
    branch: "Air Force",
    requestDate: "Feb 14, 2026",
    matchScore: 92,
  },
  {
    id: "2",
    veteranName: "Lisa Martinez",
    branch: "Army",
    requestDate: "Feb 15, 2026",
    matchScore: 87,
  },
];

export const AdvocateDashboard = () => {
  const userName = localStorage.getItem("userName") || "Sarah Mitchell";
  const userId = localStorage.getItem("userId");

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userId) {
      loadMessages();
    }
  }, [userId]);

  const loadMessages = async () => {
    if (!userId) return;
    try {
      setLoadingMessages(true);
      const [messagesRes, unreadRes] = await Promise.all([
        messagesApi.getInbox(userId),
        messagesApi.getUnreadCount(userId),
      ]);
      if (messagesRes.messages) {
        setMessages(messagesRes.messages);
      }
      if (typeof unreadRes.unreadCount === "number") {
        setUnreadCount(unreadRes.unreadCount);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {userName.split(" ")[0]}
        </h1>
        <p className="text-slate-500 mt-1">
          Your advocate dashboard - supporting veterans on their claims journey
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Assigned Veterans"
          value="3"
          icon={Users}
          trend={{ value: 1, isPositive: true }}
        />
        <StatsCard
          title="Pending Requests"
          value="2"
          icon={Clock}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="Unread Messages"
          value={unreadCount.toString()}
          icon={MessageSquare}
          trend={unreadCount > 0 ? { value: unreadCount, isPositive: false } : undefined}
        />
        <StatsCard
          title="Avg. Rating"
          value="4.8"
          icon={Award}
          trend={{ value: 0.2, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Assigned Veterans</h2>
            <p className="text-sm text-slate-500 mt-1">Veterans you're currently supporting</p>
          </div>
          <div className="divide-y divide-slate-100">
            {assignedVeterans.map((veteran) => (
              <div key={veteran.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-700 font-semibold text-sm">
                        {veteran.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{veteran.name}</p>
                      <p className="text-sm text-slate-500">{veteran.branch} • {veteran.claimStage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      veteran.status === "needs-attention"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {veteran.status === "needs-attention" ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {veteran.status === "needs-attention" ? "Needs Attention" : "On Track"}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">Last contact: {veteran.lastContact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100">
            <button className="text-sm text-[#1B3A5F] font-medium hover:underline">
              View all assigned veterans →
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Pending Connection Requests</h2>
            <p className="text-sm text-slate-500 mt-1">Veterans waiting to be matched with you</p>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-sm">
                        {request.veteranName.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{request.veteranName}</p>
                      <p className="text-sm text-slate-500">{request.branch} • Requested {request.requestDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {request.matchScore}% Match
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-white bg-[#1B3A5F] rounded-lg hover:bg-[#1B3A5F]/90 transition-colors">
                    Accept
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pendingRequests.length === 0 && (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto" />
              <p className="text-slate-500 mt-2">No pending requests</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Messages</h2>
              <p className="text-sm text-slate-500 mt-1">Messages from your assigned veterans</p>
            </div>
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                <Mail className="h-4 w-4" />
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
        {loadingMessages ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 text-slate-400 mx-auto animate-spin" />
            <p className="text-slate-500 mt-2">Loading messages...</p>
          </div>
        ) : messages.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {messages.slice(0, 5).map((message) => (
              <div
                key={message.id}
                className={`p-4 hover:bg-slate-50 transition-colors ${!message.isRead ? "bg-blue-50/50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${!message.isRead ? "bg-blue-100" : "bg-slate-100"}`}>
                    <span className={`font-semibold text-sm ${!message.isRead ? "text-blue-700" : "text-slate-600"}`}>
                      {message.senderName?.split(" ").map(n => n[0]).join("") || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-medium truncate ${!message.isRead ? "text-slate-900" : "text-slate-700"}`}>
                        {message.senderName || "Unknown"}
                      </p>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {formatMessageDate(message.createdAt)}
                      </span>
                    </div>
                    {message.subject && (
                      <p className={`text-sm truncate ${!message.isRead ? "text-slate-800 font-medium" : "text-slate-600"}`}>
                        {message.subject}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 truncate mt-0.5">
                      {message.content}
                    </p>
                  </div>
                  {!message.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-2">No messages yet</p>
            <p className="text-sm text-slate-400 mt-1">Messages from veterans will appear here</p>
          </div>
        )}
        {messages.length > 5 && (
          <div className="p-4 border-t border-slate-100">
            <button className="text-sm text-[#1B3A5F] font-medium hover:underline">
              View all {messages.length} messages →
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Meetings</h2>
            <p className="text-sm text-slate-500">Scheduled touchpoints with veterans</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-[#1B3A5F] border border-[#1B3A5F] rounded-lg hover:bg-[#1B3A5F]/5 transition-colors">
            <Calendar className="h-4 w-4 inline-block mr-2" />
            Schedule Meeting
          </button>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <Calendar className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-slate-500 mt-2">No upcoming meetings scheduled</p>
          <button className="mt-3 text-sm text-[#1B3A5F] font-medium hover:underline">
            Schedule your first meeting →
          </button>
        </div>
      </div>
    </div>
  );
};
