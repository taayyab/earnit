import React from 'react';

function StatusBreakdownChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-muted-foreground text-center py-4">No data available</p>;
  }

  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const colors = {
    draft: 'bg-gray-400',
    new: 'bg-blue-400',
    in_review: 'bg-blue-500',
    evidence_needed: 'bg-yellow-500',
    qa_pending: 'bg-orange-500',
    ready_to_submit: 'bg-blue-500',
    submitted: 'bg-green-500',
    approved: 'bg-green-600',
    denied: 'bg-red-500',
    partial_approval: 'bg-yellow-600',
  };

  const labels = {
    draft: 'Draft',
    new: 'New',
    in_review: 'In Review',
    evidence_needed: 'Evidence Needed',
    qa_pending: 'QA Pending',
    ready_to_submit: 'Ready to Submit',
    submitted: 'Submitted',
    approved: 'Approved',
    denied: 'Denied',
    partial_approval: 'Partial Approval',
  };

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([status, count]) => (
        <div key={status} className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${colors[status] || 'bg-gray-400'}`} />
          <span className="flex-1 text-sm">{labels[status] || status}</span>
          <span className="text-sm font-medium">{count}</span>
          <span className="text-xs text-muted-foreground w-12 text-right">
            {((count / total) * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default StatusBreakdownChart;
