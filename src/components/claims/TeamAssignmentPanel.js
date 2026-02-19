import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Users,
  User,
  UserCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export function TeamAssignmentPanel({ claimId, currentAgentId, currentAgentName, onAssignmentChange }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(currentAgentId || '');

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/agent/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    setSelectedAgentId(currentAgentId || '');
  }, [currentAgentId]);

  const handleAssign = async () => {
    if (!selectedAgentId) {
      toast.error('Please select a team member');
      return;
    }

    try {
      setAssigning(true);
      await api.post('/agent/assign-to', {
        claim_id: claimId,
        agent_id: selectedAgentId
      });
      
      const assignedAgent = agents.find(a => a.id === selectedAgentId);
      toast.success(`Claim assigned to ${assignedAgent?.name || 'team member'}`);
      
      if (onAssignmentChange) {
        onAssignmentChange(selectedAgentId, assignedAgent?.name);
      }
    } catch (error) {
      console.error('Failed to assign claim:', error);
      toast.error(error.response?.data?.detail || 'Failed to assign claim');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      setAssigning(true);
      await api.post('/agent/assign', {
        claim_id: claimId
      });
      
      toast.success('Claim assigned to you');
      
      if (onAssignmentChange) {
        onAssignmentChange('self', 'You');
      }
    } catch (error) {
      console.error('Failed to assign claim:', error);
      toast.error(error.response?.data?.detail || 'Failed to assign claim');
    } finally {
      setAssigning(false);
    }
  };

  const currentAgent = agents.find(a => a.id === currentAgentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Currently Assigned</span>
        {currentAgentId ? (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center">
              <UserCheck className="h-3 w-3 text-[#1B3A5F]" />
            </div>
            <span className="font-medium text-sm">
              {currentAgentName || currentAgent?.name || 'Assigned Agent'}
            </span>
          </div>
        ) : (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
            Unassigned
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Select 
            value={selectedAgentId} 
            onValueChange={setSelectedAgentId}
            disabled={loading || assigning}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={loading ? "Loading..." : "Select team member"} />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{agent.name}</span>
                    {agent.is_current_user && (
                      <Badge variant="secondary" className="text-xs ml-1">You</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={!selectedAgentId || assigning || selectedAgentId === currentAgentId}
          >
            {assigning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Assign"
            )}
          </Button>
        </div>

        {!currentAgentId && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleAssignToMe}
            disabled={assigning}
          >
            <UserCheck className="h-4 w-4" />
            Assign to Me
          </Button>
        )}
      </div>
    </div>
  );
}

export function TeamAssignmentCard({ claimId, currentAgentId, currentAgentName, onAssignmentChange }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TeamAssignmentPanel
          claimId={claimId}
          currentAgentId={currentAgentId}
          currentAgentName={currentAgentName}
          onAssignmentChange={onAssignmentChange}
        />
      </CardContent>
    </Card>
  );
}

export default TeamAssignmentPanel;
