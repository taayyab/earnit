import { Briefcase, FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, DollarSign } from "lucide-react";
import { StatsCard } from "../../components/stats-card";

const activeCases = [
  {
    id: "CLM-2026-001",
    veteranName: "Michael Roberts",
    conditions: ["PTSD", "TBI", "Knee Injury"],
    stage: "QA Review",
    rating: 70,
    deadline: "Feb 20, 2026",
    priority: "high",
  },
  {
    id: "CLM-2026-002",
    veteranName: "Angela Thompson",
    conditions: ["Sleep Apnea", "Hypertension"],
    stage: "Document Prep",
    rating: 50,
    deadline: "Feb 25, 2026",
    priority: "medium",
  },
  {
    id: "CLM-2026-003",
    veteranName: "Christopher Lee",
    conditions: ["Tinnitus", "Hearing Loss"],
    stage: "Evidence Review",
    rating: 30,
    deadline: "Mar 1, 2026",
    priority: "low",
  },
  {
    id: "CLM-2026-004",
    veteranName: "Patricia Davis",
    conditions: ["Back Pain", "Migraines", "Depression"],
    stage: "Submission",
    rating: 60,
    deadline: "Feb 18, 2026",
    priority: "high",
  },
];

const recentActivity = [
  { id: "1", action: "QA Check passed", case: "CLM-2026-001", time: "2 hours ago" },
  { id: "2", action: "Nexus letter uploaded", case: "CLM-2026-002", time: "4 hours ago" },
  { id: "3", action: "New client intake", case: "CLM-2026-005", time: "Yesterday" },
];

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const getStageStyles = (stage: string) => {
  switch (stage) {
    case "Submission":
      return "bg-emerald-100 text-emerald-700";
    case "QA Review":
      return "bg-blue-100 text-blue-700";
    case "Document Prep":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export const AgentDashboard = () => {
  const userName = localStorage.getItem("userName") || "David Chen";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {userName.split(" ")[0]}
        </h1>
        <p className="text-slate-500 mt-1">
          Your claims agent dashboard - manage your caseload efficiently
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Cases"
          value="12"
          icon={Briefcase}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Pending Review"
          value="4"
          icon={Clock}
        />
        <StatsCard
          title="Submitted This Month"
          value="8"
          icon={CheckCircle}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="Approval Rate"
          value="94%"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Active Cases</h2>
              <p className="text-sm text-slate-500 mt-1">Your current caseload sorted by deadline</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A5F] rounded-lg hover:bg-[#1B3A5F]/90 transition-colors">
              + New Client
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Case ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Veteran</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Est. Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-slate-900">{caseItem.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{caseItem.veteranName}</p>
                        <p className="text-xs text-slate-500">{caseItem.conditions.slice(0, 2).join(", ")}{caseItem.conditions.length > 2 ? ` +${caseItem.conditions.length - 2}` : ""}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${getStageStyles(caseItem.stage)}`}>
                        {caseItem.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{caseItem.rating}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{caseItem.deadline}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full capitalize ${getPriorityStyles(caseItem.priority)}`}>
                        {caseItem.priority === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {caseItem.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100">
            <button className="text-sm text-[#1B3A5F] font-medium hover:underline">
              View all cases →
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4">
                  <p className="text-sm text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-mono">{activity.case}</span> • {activity.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-500" />
                Generate Nexus Letter
              </button>
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                Run QA Check
              </button>
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-amber-500" />
                Fee Agreements
              </button>
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                Client Intake Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
