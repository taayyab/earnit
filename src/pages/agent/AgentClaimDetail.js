import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { agentAPI, documentsAPI } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import AgentLayout from '../../components/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  BarChart3,
  Shield,
  Send,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import QADashboard from '../../components/QADashboard';
import { EvidenceChecklist } from '../../components/conditions';
import RatingDecisionBrief from '../../components/RatingDecisionBrief';
import { EvidenceOperationsButton } from '../../components/claims/EvidenceOperationsPanel';
import { TeamAssignmentCard } from '../../components/claims/TeamAssignmentPanel';
import { AgentMeetingCard } from '../../components/claims/AgentMeetingScheduler';
import { ClientOnboardingPanel } from '../../components/claims/ClientOnboardingPanel';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  new: 'bg-blue-100 text-blue-800',
  in_review: 'bg-blue-50 text-[#1B3A5F]',
  evidence_needed: 'bg-orange-100 text-orange-800',
  qa_pending: 'bg-yellow-100 text-yellow-800',
  ready_to_submit: 'bg-green-100 text-green-800',
  submitted: 'bg-emerald-100 text-emerald-800'
};

export default function AgentClaimDetail() {
  const { id: claimId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (claimId) {
      loadClaimData();
    }
  }, [claimId]);

  const loadClaimData = async () => {
    try {
      setLoading(true);
      const [claimRes, docsRes] = await Promise.all([
        agentAPI.getClaim(claimId),
        api.get(`/agent/claims/${claimId}/evidence`).catch(() => ({ data: { documents: [] } }))
      ]);
      
      setClaim(claimRes.data);
      setDocuments(docsRes.data?.documents || []);
    } catch (err) {
      console.error('Failed to load claim:', err);
      toast.error('Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.post('/agent/kanban/move', {
        claim_id: claimId,
        new_status: newStatus
      });
      toast.success(`Claim moved to ${newStatus.replace(/_/g, ' ')}`);
      loadClaimData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleQAApprove = async (passed) => {
    try {
      await api.post('/agent/qa-approve', {
        claim_id: claimId,
        passed: passed
      });
      toast.success(passed ? 'QA Approved - Ready to submit' : 'QA Failed - Returned for evidence');
      loadClaimData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to process QA approval');
    }
  };

  if (loading) {
    return (
      <AgentLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AgentLayout>
    );
  }

  if (!claim) {
    return (
      <AgentLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Claim not found</p>
              <Button className="mt-4" onClick={() => navigate('/agent/command-center')}>
                Back to Command Center
              </Button>
            </CardContent>
          </Card>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/agent/command-center')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Claim Details</h1>
              <p className="text-muted-foreground font-mono text-sm">
                ID: {claimId.slice(-12)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[claim.status] || STATUS_COLORS.draft}>
              {claim.status?.replace(/_/g, ' ').toUpperCase()}
            </Badge>
            <EvidenceOperationsButton claimId={claimId} claim={claim} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Veteran Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{claim.veteran?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{claim.veteran?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Claim Type</p>
                    <p className="font-medium capitalize">{claim.submission_type || 'Original'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conditions</p>
                    <p className="font-medium">{claim.conditions_count || 0} claimed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="evidence">Evidence ({documents.length})</TabsTrigger>
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="qa">QA Report</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="font-medium">
                            {claim.created_at ? new Date(claim.created_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Last Updated</p>
                          <p className="font-medium">
                            {claim.updated_at ? new Date(claim.updated_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {claim.evidence_score != null && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Evidence Score</span>
                          <span className="font-bold">{claim.evidence_score}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              claim.evidence_score >= 80 ? 'bg-green-500' :
                              claim.evidence_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${claim.evidence_score}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {claim.conditions && claim.conditions.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Claimed Conditions</p>
                        <div className="flex flex-wrap gap-2">
                          {claim.conditions.map((condition, idx) => (
                            <Badge key={idx} variant="outline">
                              {typeof condition === 'string' ? condition : condition.name || 'Unknown'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {claim.evidence_gaps && claim.evidence_gaps.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Evidence Gaps</p>
                        <div className="space-y-1">
                          {claim.evidence_gaps.map((gap, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-orange-600">
                              <AlertCircle className="h-4 w-4" />
                              {gap}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evidence" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documents ({documents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {documents.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No documents uploaded yet
                      </p>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{doc.original_filename || doc.filename}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.category || 'Uncategorized'} • {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Unknown date'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {doc.processing_status || 'pending'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="conditions" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <EvidenceChecklist claimId={claimId} isAgent={true} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="qa" className="mt-4">
                <QADashboard claimId={claimId} isAgent={true} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {/* Rating Decision Brief - Prominent Position for Agents */}
            <RatingDecisionBrief 
              claimId={claimId} 
              claimNumber={claimId?.slice(-12)}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {claim.status === 'new' && (
                  <Button className="w-full" onClick={() => handleStatusChange('in_review')}>
                    Start Review
                  </Button>
                )}
                
                {claim.status === 'in_review' && (
                  <>
                    <Button className="w-full" onClick={() => handleStatusChange('evidence_needed')}>
                      Request Evidence
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => handleStatusChange('qa_pending')}>
                      Send to QA
                    </Button>
                  </>
                )}
                
                {claim.status === 'qa_pending' && (
                  <>
                    <Button 
                      className="w-full bg-[#1B3A5F] hover:bg-[#2a4a6f]"
                      onClick={() => handleQAApprove(true)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve QA
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="destructive" 
                      onClick={() => handleQAApprove(false)}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Fail QA
                    </Button>
                  </>
                )}
                
                {claim.status === 'ready_to_submit' && (
                  <Button className="w-full bg-[#1B3A5F] hover:bg-[#2a4a6f]" onClick={() => handleStatusChange('submitted')}>
                    <Send className="h-4 w-4 mr-2" />
                    Mark Submitted
                  </Button>
                )}
              </CardContent>
            </Card>

            <ClientOnboardingPanel
              claimId={claimId}
              veteranName={claim.veteran?.name}
              conditions={claim.conditions}
              claimType={claim.submission_type}
            />

            <TeamAssignmentCard
              claimId={claimId}
              currentAgentId={claim.assigned_agent_id}
              currentAgentName={claim.assigned_agent_name}
              onAssignmentChange={(agentId, agentName) => {
                setClaim(prev => ({
                  ...prev,
                  assigned_agent_id: agentId === 'self' ? user?.user_id : agentId,
                  assigned_agent_name: agentName
                }));
              }}
            />

            <AgentMeetingCard
              claimId={claimId}
              veteranName={claim.veteran?.name}
            />

            {claim.sla && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    SLA Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Days in Status</span>
                      <span className="font-medium">{claim.sla.days_in_status}</span>
                    </div>
                    {claim.sla.sla_days && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SLA Target</span>
                        <span className="font-medium">{claim.sla.sla_days} days</span>
                      </div>
                    )}
                    {claim.sla.days_remaining != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Days Remaining</span>
                        <span className={`font-medium ${claim.sla.is_overdue ? 'text-red-600' : ''}`}>
                          {claim.sla.is_overdue ? `${Math.abs(claim.sla.days_remaining)} overdue` : claim.sla.days_remaining}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {claim.priority && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Priority Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold">{claim.priority.score}</span>
                    <span className="text-muted-foreground">/100</span>
                    <Badge className="ml-2" variant={claim.priority.level === 'critical' ? 'destructive' : 'secondary'}>
                      {claim.priority.level?.toUpperCase()}
                    </Badge>
                  </div>
                  {claim.priority.breakdown && (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age</span>
                        <span>{claim.priority.breakdown.age}/40</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Urgency</span>
                        <span>{claim.priority.breakdown.urgency}/30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Evidence</span>
                        <span>{claim.priority.breakdown.evidence}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inactivity</span>
                        <span>{claim.priority.breakdown.inactivity}/10</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
