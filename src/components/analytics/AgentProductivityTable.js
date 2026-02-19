import React from 'react';
import { Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

function AgentProductivityTable({ agents, onAgentClick }) {
  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No agent data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Agent</th>
            <th className="text-center py-3 px-4 font-medium">Total Claims</th>
            <th className="text-center py-3 px-4 font-medium">Submitted</th>
            <th className="text-center py-3 px-4 font-medium">In Progress</th>
            <th className="text-center py-3 px-4 font-medium">Avg Days</th>
            <th className="text-center py-3 px-4 font-medium">Efficiency</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr 
              key={agent.agent_id} 
              className="border-b hover:bg-muted/50 cursor-pointer"
              onClick={() => onAgentClick && onAgentClick(agent.agent_id)}
            >
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium">{agent.agent_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{agent.email}</p>
                </div>
              </td>
              <td className="text-center py-3 px-4">
                <Badge variant="outline">{agent.total_claims}</Badge>
              </td>
              <td className="text-center py-3 px-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {agent.submitted}
                </Badge>
              </td>
              <td className="text-center py-3 px-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {agent.in_progress}
                </Badge>
              </td>
              <td className="text-center py-3 px-4">
                <span className={agent.avg_processing_days > 14 ? 'text-red-600' : 'text-green-600'}>
                  {agent.avg_processing_days} days
                </span>
              </td>
              <td className="text-center py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <Progress value={agent.efficiency_rate} className="w-16 h-2" />
                  <span className="text-sm">{agent.efficiency_rate}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AgentProductivityTable;
