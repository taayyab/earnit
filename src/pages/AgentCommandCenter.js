import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import AgentLayout from '../components/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../components/ui/hover-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import {
  Shield,
  FileText,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  ChevronRight,
  MoreVertical,
  User,
  RefreshCw,
  Layers,
  ArrowRight,
  Flame,
  Timer,
  GripVertical,
  Lightbulb,
  TrendingUp,
  Calendar,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { EvidenceOperationsButton } from '../components/claims/EvidenceOperationsPanel';
import { CreateClaimModal } from '../components/claims/CreateClaimModal';

const PRIORITY_COLORS = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-gray-400 text-white',
};

const SLA_COLORS = {
  overdue: 'text-red-600 bg-red-50 border-red-200',
  critical: 'text-orange-600 bg-orange-50 border-orange-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  ok: 'text-green-600 bg-green-50 border-green-200',
  none: 'text-gray-500 bg-gray-50 border-gray-200',
};

const COLUMN_COLORS = {
  draft: 'border-t-gray-400',
  new: 'border-t-blue-500',
  in_review: 'border-t-purple-500',
  evidence_needed: 'border-t-orange-500',
  qa_pending: 'border-t-yellow-500',
  ready_to_submit: 'border-t-green-500',
  submitted: 'border-t-emerald-600',
};

function ClaimQuickPreview({ claim }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">{claim.veteran?.name || 'Unknown Veteran'}</span>
        <Badge className={`${PRIORITY_COLORS[claim.priority?.level] || PRIORITY_COLORS.low} text-xs`}>
          {claim.priority?.level?.toUpperCase()}
        </Badge>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>Created: {claim.created_at ? new Date(claim.created_at).toLocaleDateString() : 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>Updated: {claim.updated_at ? new Date(claim.updated_at).toLocaleDateString() : 'Unknown'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted p-2 rounded">
          <div className="text-muted-foreground">Conditions</div>
          <div className="font-semibold">{claim.conditions_count || 0}</div>
        </div>
        <div className="bg-muted p-2 rounded">
          <div className="text-muted-foreground">Documents</div>
          <div className="font-semibold">{claim.documents_count || 0}</div>
        </div>
      </div>
      
      {claim.evidence_score != null && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Evidence Score</span>
            <span className="font-semibold">{claim.evidence_score}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${
                claim.evidence_score >= 80 ? 'bg-green-500' :
                claim.evidence_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${claim.evidence_score}%` }}
            />
          </div>
        </div>
      )}
      
      {claim.priority?.breakdown && (
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-1">Priority Breakdown</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex justify-between">
              <span>Age:</span>
              <span className="font-medium">{claim.priority.breakdown.age}/40</span>
            </div>
            <div className="flex justify-between">
              <span>Urgency:</span>
              <span className="font-medium">{claim.priority.breakdown.urgency}/30</span>
            </div>
            <div className="flex justify-between">
              <span>Evidence:</span>
              <span className="font-medium">{claim.priority.breakdown.evidence}/20</span>
            </div>
            <div className="flex justify-between">
              <span>Inactivity:</span>
              <span className="font-medium">{claim.priority.breakdown.inactivity}/10</span>
            </div>
          </div>
          <div className="flex justify-between mt-1 pt-1 border-t text-xs font-semibold">
            <span>Total Score:</span>
            <span>{claim.priority.score}/100</span>
          </div>
        </div>
      )}
      
      <div className="text-xs text-center text-muted-foreground pt-2">
        Click to view full details
      </div>
    </div>
  );
}

function ClaimCard({ claim, isSelected, onSelect, onMove, agents, onViewClaim, isDragging }) {
  const priorityColor = PRIORITY_COLORS[claim.priority?.level] || PRIORITY_COLORS.low;
  const slaColor = SLA_COLORS[claim.sla?.urgency] || SLA_COLORS.none;

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Card 
          className={`mb-2 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''} ${isDragging ? 'shadow-lg rotate-2 scale-105' : ''}`}
          onClick={(e) => {
            if (e.target.type !== 'checkbox') {
              onViewClaim(claim.id);
            }
          }}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-1">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onSelect(claim.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs text-muted-foreground truncate">
                    {claim.id.slice(-8)}
                  </span>
                  <Badge className={`${priorityColor} text-xs px-1.5 py-0`}>
                    {claim.priority?.level?.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="font-medium text-sm truncate mb-1">
                  {claim.veteran?.name || 'Unknown Veteran'}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {claim.conditions_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {claim.documents_count || 0}
                  </span>
                  {claim.evidence_score && (
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {claim.evidence_score}%
                    </span>
                  )}
                </div>

                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${slaColor}`}>
                  {claim.sla?.urgency === 'overdue' && <AlertCircle className="h-3 w-3" />}
                  {claim.sla?.urgency === 'critical' && <Flame className="h-3 w-3" />}
                  {claim.sla?.urgency === 'warning' && <Timer className="h-3 w-3" />}
                  {claim.sla?.urgency === 'ok' && <CheckCircle2 className="h-3 w-3" />}
                  <span>
                    {claim.sla?.is_overdue 
                      ? `${Math.abs(claim.sla.days_remaining)}d overdue`
                      : claim.sla?.days_remaining != null
                        ? `${claim.sla.days_remaining}d remaining`
                        : `${claim.sla?.days_in_status || 0}d in status`
                    }
                  </span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewClaim(claim.id)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="p-0">
                      <EvidenceOperationsButton claimId={claim.id} claim={claim} />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {['new', 'in_review', 'evidence_needed', 'qa_pending', 'ready_to_submit', 'submitted'].map((status) => (
                    status !== claim.status && (
                      <DropdownMenuItem 
                        key={status} 
                        onClick={(e) => {
                          e.stopPropagation();
                          onMove(claim.id, status);
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Move to {status.replace(/_/g, ' ')}
                      </DropdownMenuItem>
                    )
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="right">
        <ClaimQuickPreview claim={claim} />
      </HoverCardContent>
    </HoverCard>
  );
}

function KanbanColumn({ column, selectedClaims, onSelectClaim, onMoveClaim, agents, onViewClaim }) {
  const columnColor = COLUMN_COLORS[column.id] || 'border-t-gray-400';
  
  return (
    <div className="flex-shrink-0 w-72">
      <Card className={`h-full border-t-4 ${columnColor}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{column.label}</CardTitle>
            <div className="flex items-center gap-2">
              {column.overdue_count > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {column.overdue_count} overdue
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {column.count}
              </Badge>
            </div>
          </div>
          {column.sla_days && (
            <p className="text-xs text-muted-foreground">
              SLA: {column.sla_days} days
            </p>
          )}
        </CardHeader>
        <CardContent className="p-2">
          <Droppable droppableId={column.id}>
            {(provided, snapshot) => (
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`pr-4 min-h-[100px] transition-colors ${
                    snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg' : ''
                  }`}
                >
                  {column.claims.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {snapshot.isDraggingOver ? 'Drop here' : 'No claims'}
                    </p>
                  ) : (
                    column.claims.map((claim, index) => (
                      <Draggable key={claim.id} draggableId={claim.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ClaimCard
                              claim={claim}
                              isSelected={selectedClaims.has(claim.id)}
                              onSelect={onSelectClaim}
                              onMove={onMoveClaim}
                              agents={agents}
                              onViewClaim={onViewClaim}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              </ScrollArea>
            )}
          </Droppable>
        </CardContent>
      </Card>
    </div>
  );
}

function WorkloadSidebar({ workload, currentUserId, recommendation, onAssignRecommended }) {
  if (!workload || workload.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No workload data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendation && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Auto-Balance Recommendation</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {recommendation.reason}
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{recommendation.agent_name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({recommendation.active_claims} active)
                </span>
              </div>
              {recommendation.agent_id && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onAssignRecommended(recommendation.agent_id)}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Assign
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-1">Unassigned Claims</p>
        <p className="text-2xl font-bold">{workload.unassigned_count || 0}</p>
      </div>
      
      {workload.agents?.map((agent) => (
        <Card key={agent.agent_id} className={agent.is_current_user ? 'ring-2 ring-primary' : ''}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{agent.agent_name}</p>
                {agent.is_current_user && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
              {recommendation?.agent_id === agent.agent_id && (
                <Badge className="bg-primary text-primary-foreground text-xs">
                  Recommended
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Active</p>
                <p className="font-medium">{agent.active_claims}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-medium">{agent.total_claims}</p>
              </div>
            </div>
            {agent.status_breakdown && Object.keys(agent.status_breakdown).length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(agent.status_breakdown).map(([status, count]) => (
                    <Badge key={status} variant="secondary" className="text-xs">
                      {status.replace(/_/g, ' ')}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AgentCommandCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [columns, setColumns] = useState([]);
  const [summary, setSummary] = useState({ total_claims: 0, total_overdue: 0 });
  const [workload, setWorkload] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedClaims, setSelectedClaims] = useState(new Set());
  const [assignedOnly, setAssignedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const isInitialLoad = useRef(true);

  const hasAttemptedSeedThisSession = () => {
    return sessionStorage.getItem('agent_demo_seed_attempted') === 'true';
  };

  const markSeedAttempted = () => {
    sessionStorage.setItem('agent_demo_seed_attempted', 'true');
  };

  const seedDemoClaims = async () => {
    try {
      await api.post('/demo/seed-agent-claims');
      toast.success('Demo claims created successfully');
      return true;
    } catch (error) {
      console.error('Failed to seed demo claims:', error);
      return false;
    }
  };

  const loadKanbanData = useCallback(async (skipAutoSeed = false) => {
    try {
      setLoading(true);
      const response = await api.get(`/agent/kanban?assigned_only=${assignedOnly}`);
      const newColumns = response.data.columns || [];
      const newSummary = response.data.summary || { total_claims: 0, total_overdue: 0 };
      
      setColumns(newColumns);
      setSummary(newSummary);
      
      const shouldAutoSeed = !skipAutoSeed 
        && isInitialLoad.current 
        && !assignedOnly 
        && !hasAttemptedSeedThisSession() 
        && newSummary.total_claims === 0;
      
      isInitialLoad.current = false;
      
      if (shouldAutoSeed) {
        markSeedAttempted();
        const seeded = await seedDemoClaims();
        if (seeded) {
          const retryResponse = await api.get(`/agent/kanban?assigned_only=${assignedOnly}`);
          setColumns(retryResponse.data.columns || []);
          setSummary(retryResponse.data.summary || { total_claims: 0, total_overdue: 0 });
        }
      }
    } catch (error) {
      console.error('Failed to load kanban data:', error);
      toast.error('Failed to load command center data');
    } finally {
      setLoading(false);
    }
  }, [assignedOnly]);

  const loadWorkload = useCallback(async () => {
    try {
      const response = await api.get('/agent/workload');
      setWorkload(response.data);
    } catch (error) {
      console.error('Failed to load workload:', error);
    }
  }, []);

  const loadAgents = useCallback(async () => {
    try {
      const response = await api.get('/agent/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }, []);

  const loadRecommendation = useCallback(async () => {
    try {
      const response = await api.get('/agent/workload/recommend');
      setRecommendation(response.data);
    } catch (error) {
      console.error('Failed to load recommendation:', error);
    }
  }, []);

  useEffect(() => {
    loadKanbanData();
    loadWorkload();
    loadAgents();
    loadRecommendation();
  }, [loadKanbanData, loadWorkload, loadAgents, loadRecommendation]);

  const handleSelectClaim = (claimId) => {
    const newSelected = new Set(selectedClaims);
    if (newSelected.has(claimId)) {
      newSelected.delete(claimId);
    } else {
      newSelected.add(claimId);
    }
    setSelectedClaims(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedClaims.size > 0) {
      setSelectedClaims(new Set());
    } else {
      const allClaimIds = columns.flatMap(col => col.claims.map(c => c.id));
      setSelectedClaims(new Set(allClaimIds));
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const claimId = draggableId;

    const newColumns = columns.map(col => {
      if (col.id === source.droppableId) {
        return {
          ...col,
          claims: col.claims.filter(c => c.id !== claimId),
          count: col.count - 1
        };
      }
      if (col.id === destination.droppableId) {
        const movedClaim = columns
          .find(c => c.id === source.droppableId)
          ?.claims.find(c => c.id === claimId);
        if (movedClaim) {
          const newClaims = [...col.claims];
          newClaims.splice(destination.index, 0, { ...movedClaim, status: newStatus });
          return {
            ...col,
            claims: newClaims,
            count: col.count + 1
          };
        }
      }
      return col;
    });
    setColumns(newColumns);

    try {
      await api.post('/agent/kanban/move', {
        claim_id: claimId,
        new_status: newStatus
      });
      toast.success(`Claim moved to ${newStatus.replace(/_/g, ' ')}`);
    } catch (error) {
      toast.error('Failed to move claim');
      loadKanbanData();
    }
  };

  const handleMoveClaim = async (claimId, newStatus) => {
    try {
      await api.post('/agent/kanban/move', {
        claim_id: claimId,
        new_status: newStatus
      });
      toast.success(`Claim moved to ${newStatus.replace(/_/g, ' ')}`);
      loadKanbanData();
    } catch (error) {
      toast.error('Failed to move claim');
    }
  };

  const handleBulkAssign = async (agentId) => {
    if (selectedClaims.size === 0) {
      toast.error('No claims selected');
      return;
    }

    try {
      setBulkActionLoading(true);
      // When "self" is selected, pass null to assign to current user
      const targetAgentId = agentId === 'self' ? null : agentId;
      const response = await api.post('/agent/bulk/assign', {
        claim_ids: Array.from(selectedClaims),
        agent_id: targetAgentId
      });
      
      const { updated_count, failed_ids } = response.data;
      
      if (failed_ids && failed_ids.length > 0) {
        toast.warning(
          `Assigned ${updated_count} claims. ${failed_ids.length} failed: ${failed_ids.map(id => id.slice(-6)).join(', ')}`,
          { duration: 6000 }
        );
      } else {
        toast.success(`${updated_count} claims assigned successfully`);
      }
      
      setSelectedClaims(new Set());
      loadKanbanData();
      loadWorkload();
      loadRecommendation();
    } catch (error) {
      toast.error('Failed to assign claims');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedClaims.size === 0) {
      toast.error('No claims selected');
      return;
    }

    try {
      setBulkActionLoading(true);
      const response = await api.post('/agent/bulk/status', {
        claim_ids: Array.from(selectedClaims),
        new_status: newStatus
      });
      
      const { updated_count, failed_ids } = response.data;
      
      if (failed_ids && failed_ids.length > 0) {
        toast.warning(
          `Updated ${updated_count} claims to ${newStatus.replace(/_/g, ' ')}. ${failed_ids.length} failed: ${failed_ids.map(id => id.slice(-6)).join(', ')}`,
          { duration: 6000 }
        );
      } else {
        toast.success(`${updated_count} claims updated to ${newStatus.replace(/_/g, ' ')}`);
      }
      
      setSelectedClaims(new Set());
      loadKanbanData();
    } catch (error) {
      toast.error('Failed to update claims');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleAssignRecommended = async (agentId) => {
    if (selectedClaims.size === 0) {
      toast.error('Select claims first to assign to recommended agent');
      return;
    }
    await handleBulkAssign(agentId);
  };

  const handleViewClaim = (claimId) => {
    navigate(`/agent/claim/${claimId}`);
  };

  if (loading && columns.length === 0) {
    return (
      <AgentLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="p-4 space-y-4" data-testid="agent-command-center">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
            <p className="text-muted-foreground">Drag and drop claims between columns</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{summary.total_claims}</span>
                <span className="text-muted-foreground">Total Claims</span>
              </div>
              {summary.total_overdue > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {summary.total_overdue} Overdue
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="assigned-only"
                checked={assignedOnly}
                onCheckedChange={(checked) => {
                  setAssignedOnly(checked);
                  setSelectedClaims(new Set());
                }}
              />
              <Label htmlFor="assigned-only" className="text-sm">
                My Claims Only
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedClaims.size > 0 ? 'Clear Selection' : 'Select All'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadKanbanData(true);
                loadWorkload();
                loadRecommendation();
              }}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <CreateClaimModal onClaimCreated={() => {
              loadKanbanData(true);
              loadWorkload();
            }} />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Workload
                  {recommendation && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      <Lightbulb className="h-3 w-3" />
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Agent Workload</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <WorkloadSidebar 
                    workload={workload} 
                    currentUserId={user?.user_id}
                    recommendation={recommendation}
                    onAssignRecommended={handleAssignRecommended}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {selectedClaims.size > 0 && (
          <Card className="mb-4 border-primary bg-primary/5">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="font-medium">
                  {selectedClaims.size} claim{selectedClaims.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <Select onValueChange={handleBulkAssign} disabled={bulkActionLoading}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Assign to Me</SelectItem>
                      {recommendation && (
                        <SelectItem value={recommendation.agent_id}>
                          {recommendation.agent_name} (Recommended)
                        </SelectItem>
                      )}
                      {agents.filter(a => a.id !== recommendation?.agent_id).map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={handleBulkStatusChange} disabled={bulkActionLoading}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Change status to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="evidence_needed">Evidence Needed</SelectItem>
                      <SelectItem value="qa_pending">QA Pending</SelectItem>
                      <SelectItem value="ready_to_submit">Ready to Submit</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClaims(new Set())}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  selectedClaims={selectedClaims}
                  onSelectClaim={handleSelectClaim}
                  onMoveClaim={handleMoveClaim}
                  agents={agents}
                  onViewClaim={handleViewClaim}
                />
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>
    </AgentLayout>
  );
}
