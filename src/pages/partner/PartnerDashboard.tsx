import { Building2, Users, FileText, TrendingUp, BarChart3, Settings, UserPlus, Shield } from "lucide-react";
import { StatsCard } from "../../components/stats-card";

const teamMembers = [
  {
    id: "1",
    name: "Robert Martinez",
    role: "Claims Agent",
    activeCases: 15,
    approvalRate: 92,
    status: "online",
  },
  {
    id: "2",
    name: "Emily Johnson",
    role: "Claims Agent",
    activeCases: 12,
    approvalRate: 88,
    status: "online",
  },
  {
    id: "3",
    name: "Michael Brown",
    role: "Claims Agent",
    activeCases: 18,
    approvalRate: 95,
    status: "offline",
  },
  {
    id: "4",
    name: "Sarah Williams",
    role: "Advocate",
    activeCases: 8,
    approvalRate: null,
    status: "online",
  },
];

const recentClaims = [
  { id: "CLM-2026-101", veteran: "John Smith", agent: "Robert Martinez", status: "Approved", date: "Feb 15, 2026" },
  { id: "CLM-2026-102", veteran: "Mary Johnson", agent: "Emily Johnson", status: "In Review", date: "Feb 14, 2026" },
  { id: "CLM-2026-103", veteran: "David Lee", agent: "Michael Brown", status: "Submitted", date: "Feb 13, 2026" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-emerald-100 text-emerald-700";
    case "In Review":
      return "bg-blue-100 text-blue-700";
    case "Submitted":
      return "bg-purple-100 text-purple-700";
    case "Denied":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export const PartnerDashboard = () => {
  const userName = localStorage.getItem("userName") || "Jennifer Williams";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Harris County VSO
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {userName.split(" ")[0]} - Organization Administrator
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A5F] rounded-lg hover:bg-[#1B3A5F]/90 transition-colors flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Team Member
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Veterans Served"
          value="1,247"
          icon={Users}
          trend={{ value: 89, isPositive: true }}
        />
        <StatsCard
          title="Active Claims"
          value="156"
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Team Members"
          value="12"
          icon={Building2}
        />
        <StatsCard
          title="Approval Rate"
          value="91%"
          icon={TrendingUp}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Team Performance</h2>
                <p className="text-sm text-slate-500 mt-1">Active team members and their caseloads</p>
              </div>
              <button className="text-sm text-[#1B3A5F] font-medium hover:underline">
                View Full Report →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Team Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Active Cases</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Approval Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-slate-600 font-medium text-xs">
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">{member.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">{member.activeCases}</span>
                      </td>
                      <td className="px-4 py-3">
                        {member.approvalRate ? (
                          <span className="font-semibold text-emerald-600">{member.approvalRate}%</span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                          member.status === "online" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            member.status === "online" ? "bg-emerald-500" : "bg-slate-400"
                          }`} />
                          {member.status === "online" ? "Online" : "Offline"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Recent Claims Activity</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {recentClaims.map((claim) => (
                <div key={claim.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-slate-900">{claim.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {claim.veteran} • Assigned to {claim.agent}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">{claim.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Organization Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Avg. Time to Decision</p>
                    <p className="text-xs text-slate-500">From submission to outcome</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-900">45 days</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Success Rate</p>
                    <p className="text-xs text-slate-500">Claims approved this quarter</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-emerald-600">91%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Veteran Satisfaction</p>
                    <p className="text-xs text-slate-500">Average rating from surveys</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-900">4.7/5</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                View Analytics Dashboard
              </button>
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-500" />
                Export Compliance Report
              </button>
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-500" />
                View Audit Logs
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-semibold text-amber-900">Subscription Status</h3>
            <p className="text-sm text-amber-700 mt-1">Professional Plan • 500 veterans</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-amber-700 mb-1">
                <span>Veterans served</span>
                <span>312 / 500</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: "62%" }} />
              </div>
            </div>
            <button className="mt-3 text-sm text-amber-900 font-medium hover:underline">
              Upgrade to Enterprise →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
