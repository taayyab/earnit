import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import AgentLayout from '../components/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import ExternalLinkWarning from '../components/ExternalLinkWarning';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Checkbox } from '../components/ui/checkbox';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Send,
  RefreshCw,
  ExternalLink,
  LayoutGrid,
  Bot,
  UserPlus,
  PlusCircle,
} from 'lucide-react';
import DrillConfigPanel from '../components/admin/DrillConfigPanel';
import { toast } from 'sonner';

export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [selectedClaims, setSelectedClaims] = useState(new Set());
  const [activeTab, setActiveTab] = useState('claims');
  const [vaSubmissions, setVaSubmissions] = useState([]);
  const [vaConfigured, setVaConfigured] = useState(false);
  const [loadingVa, setLoadingVa] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (onboardingChecked) {
      loadDashboardData();
      checkVaStatus();
    }
  }, [onboardingChecked]);

  const checkOnboardingStatus = async () => {
    // Skip onboarding check for demo users - they don't need partner membership
    const isDemoUser = user?.is_demo === true || user?.email?.endsWith('@earnedit.demo');
    if (isDemoUser) {
      setOnboardingChecked(true);
      return;
    }
    
    try {
      const response = await api.get('/partner/member/onboarding-status');
      if (response.data.has_membership && !response.data.onboarding_completed) {
        navigate('/agent/onboarding');
        return;
      }
      setOnboardingChecked(true);
    } catch (error) {
      // On error, allow access - prevents blocking demo users or when endpoint fails
      setOnboardingChecked(true);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [claims, filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [claimsRes, statsRes] = await Promise.all([
        api.get('/agent/claims'),
        api.get('/agent/dashboard')
      ]);
      
      setClaims(claimsRes.data.claims || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const checkVaStatus = async () => {
    try {
      const response = await api.get('/va/status');
      setVaConfigured(response.data.configured);
    } catch (error) {
      setVaConfigured(false);
    }
  };

  const loadVaSubmissions = async () => {
    try {
      setLoadingVa(true);
      const response = await api.get('/va/pending-submissions');
      setVaSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Failed to load VA submissions:', error);
      toast.error('Failed to load VA submissions');
    } finally {
      setLoadingVa(false);
    }
  };

  const handleSubmitToVa = async (claimId) => {
    try {
      const response = await api.post('/va/submit', { claim_id: claimId });
      if (response.data.success) {
        toast.success('Claim submitted to VA successfully');
        loadVaSubmissions();
        loadDashboardData();
      } else {
        toast.error(response.data.error || 'Failed to submit to VA');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit claim to VA');
    }
  };

  const handleRefreshVaStatus = async (claimId) => {
    try {
      const response = await api.get(`/va/claim/${claimId}/status`);
      toast.success(`Status: ${response.data.status}`);
      loadVaSubmissions();
    } catch (error) {
      toast.error('Failed to refresh status');
    }
  };

  const applyFilters = () => {
    let filtered = [...claims];

    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(c => c.priority === filters.priority);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.claim_id.toLowerCase().includes(search) ||
        c.veteran_name?.toLowerCase().includes(search)
      );
    }

    setFilteredClaims(filtered);
  };

  const handleViewClaim = async (claim) => {
    try {
      const claimId = claim.claim_id || claim.id;
      const res = await api.get(`/claims/${claimId}`);
      setSelectedClaim(res.data);
      setShowDetailDialog(true);
    } catch (error) {
      toast.error('Failed to load claim details');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedClaims.size === 0) return;
    
    try {
      await api.post('/agent/bulk/status', {
        claim_ids: Array.from(selectedClaims),
        new_status: 'qa_pending'
      });
      toast.success(`${selectedClaims.size} claims approved`);
      setSelectedClaims(new Set());
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to approve claims');
    }
  };

  const handleRequestEvidence = async (claimId) => {
    try {
      await api.post('/agent/kanban/move', {
        claim_id: claimId,
        new_status: 'evidence_needed'
      });
      toast.success('Evidence request sent to veteran');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to request evidence');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      in_review: 'bg-blue-500',
      approved: 'bg-[hsl(var(--success))]',
      needs_evidence: 'bg-orange-500',
      submitted: 'bg-purple-500'
    };
    return colors[status] || 'bg-white0';
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />;
    if (priority === 'medium') return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />;
  };

  const toggleClaimSelection = (claimId) => {
    const newSelected = new Set(selectedClaims);
    if (newSelected.has(claimId)) {
      newSelected.delete(claimId);
    } else {
      newSelected.add(claimId);
    }
    setSelectedClaims(newSelected);
  };

  const handleInviteVeteran = async () => {
    if (!inviteEmail) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setInviteLoading(true);
    try {
      const response = await api.post('/partner/clients/invitations', {
        veteran_email: inviteEmail,
        veteran_name: inviteName || null
      });
      
      if (response.data.success) {
        toast.success('Invitation sent successfully');
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteName('');
        
        if (!response.data.email_sent) {
          toast.warning('Invitation created but email could not be sent. Please contact support.');
        }
      } else {
        toast.error('Failed to send invitation');
      }
    } catch (error) {
      console.error('Invite error:', error);
      toast.error(error.response?.data?.detail || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  if (!onboardingChecked || loading) {
    return (
      <AgentLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="p-6 space-y-6" data-testid="agent-dashboard">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Work Queue</h1>
            <p className="text-muted-foreground">Prioritized claims requiring your action</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus className="w-4 h-4" />
              Invite Veteran
            </Button>
            <Button 
              className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white flex items-center gap-2"
              onClick={() => navigate('/agent/create-claim')}
            >
              <PlusCircle className="w-4 h-4" />
              Create Claim
            </Button>
          </div>
        </div>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          if (value === 'va-submissions') loadVaSubmissions();
        }} className="mb-6">
          <TabsList>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Claims
            </TabsTrigger>
            <TabsTrigger value="va-submissions" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              VA Submissions
              {!vaConfigured && <span className="text-xs text-amber-500">(Not Configured)</span>}
            </TabsTrigger>
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <TabsTrigger value="drill-config" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Drill Config
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="claims">
            {selectedClaims.size > 0 && (
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={handleBulkApprove}
                  className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90"
                  data-testid="bulk-approve-button"
                >
                  Approve {selectedClaims.size} Selected
                </Button>
              </div>
            )}
        {/* Stats Cards - Clickable to filter */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card 
            data-testid="stat-card-pending"
            className="cursor-pointer hover:border-yellow-500 transition-colors"
            onClick={() => setFilters({ ...filters, status: 'pending' })}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.pending || stats?.status_counts?.pending || 0}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            data-testid="stat-card-in-review"
            className="cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => setFilters({ ...filters, status: 'in_review' })}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Review</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.in_review || stats?.status_counts?.in_review || 0}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            data-testid="stat-card-approved"
            className="cursor-pointer hover:border-green-500 transition-colors"
            onClick={() => setFilters({ ...filters, status: 'approved' })}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.approved || stats?.status_counts?.qa_pending || 0}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                  <CheckCircle2 className="h-6 w-6 text-[hsl(var(--success))]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            data-testid="stat-card-needs-evidence"
            className="cursor-pointer hover:border-orange-500 transition-colors"
            onClick={() => setFilters({ ...filters, status: 'needs_evidence' })}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Needs Evidence</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.needs_evidence || stats?.status_counts?.evidence_needed || 0}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search claims..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger data-testid="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="needs_evidence">Needs Evidence</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters({ ...filters, priority: value })}
              >
                <SelectTrigger data-testid="priority-filter">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Claims Table */}
        <Card data-testid="claims-table">
          <CardHeader>
            <CardTitle>Claims Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedClaims.size === filteredClaims.length && filteredClaims.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedClaims(new Set(filteredClaims.map(c => c.claim_id)));
                        } else {
                          setSelectedClaims(new Set());
                        }
                      }}
                      data-testid="select-all-checkbox"
                    />
                  </TableHead>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Veteran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Evidence Score</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No claims found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => {
                    const claimId = claim.id || claim.claim_id;
                    return (
                    <TableRow 
                      key={claimId} 
                      data-testid="claim-row"
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/claim/${claimId}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedClaims.has(claimId)}
                          onCheckedChange={() => toggleClaimSelection(claimId)}
                          data-testid="claim-checkbox"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {claimId?.slice(-8)}
                      </TableCell>
                      <TableCell>{claim.veteran?.name || claim.veteran_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(claim.priority)}
                          <span className="capitalize">{claim.priority || 'medium'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={claim.evidence_score || 0} className="w-16 h-2" />
                          <span className="text-sm font-medium">{claim.evidence_score || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {claim.updated_at ? new Date(claim.updated_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/claim/${claimId}`)}
                            data-testid="view-claim-button"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(claim.status === 'needs_evidence' || claim.status === 'evidence_needed') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestEvidence(claimId)}
                              data-testid="request-evidence-button"
                            >
                              Request Evidence
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="va-submissions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    VA Submissions
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={loadVaSubmissions} disabled={loadingVa}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingVa ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!vaConfigured ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                    <h3 className="font-medium text-lg mb-2">VA Lighthouse Not Configured</h3>
                    <p className="text-muted-foreground mb-4">
                      The VA Lighthouse API is not yet configured. 
                      Please add the VA_LIGHTHOUSE_API_KEY to enable direct VA submissions.
                    </p>
                    <ExternalLinkWarning
                      href="https://developer.va.gov/"
                      className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                      showIcon={true}
                    >
                      Get VA API Credentials
                    </ExternalLinkWarning>
                  </div>
                ) : loadingVa ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Loading submissions...</p>
                  </div>
                ) : vaSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">No Pending Submissions</h3>
                    <p className="text-muted-foreground">
                      There are no claims awaiting VA submission or with pending status.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Claim ID</TableHead>
                        <TableHead>Veteran</TableHead>
                        <TableHead>Submission Status</TableHead>
                        <TableHead>VA Confirmation</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vaSubmissions.map((submission) => (
                        <TableRow key={submission.claim_id}>
                          <TableCell className="font-mono text-sm">
                            {submission.claim_id?.slice(-8) || 'N/A'}
                          </TableCell>
                          <TableCell>{submission.veteran_name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge className={
                              submission.va_status === 'received' ? 'bg-green-500' :
                              submission.va_status === 'processing' ? 'bg-blue-500' :
                              submission.va_status === 'pending' ? 'bg-yellow-500' :
                              'bg-white0'
                            }>
                              {submission.va_status || 'Awaiting'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {submission.va_submission_id || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {submission.submitted_at 
                              ? new Date(submission.submitted_at).toLocaleDateString() 
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!submission.va_submission_id && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitToVa(submission.claim_id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Submit
                                </Button>
                              )}
                              {submission.va_submission_id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRefreshVaStatus(submission.claim_id)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drill-config">
            <DrillConfigPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Claim Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Claim ID</p>
                  <p className="font-mono">{selectedClaim.claim_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedClaim.status)}>
                    {selectedClaim.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Evidence Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedClaim.evidence_score || 0} className="flex-1 h-2" />
                    <span className="font-medium">{selectedClaim.evidence_score || 0}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getPriorityIcon(selectedClaim.priority)}
                    <span className="capitalize">{selectedClaim.priority}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {selectedClaim.conditions?.map((condition, i) => (
                    <Badge key={i} variant="outline">{condition}</Badge>
                  )) || <p className="text-sm text-muted-foreground">No conditions listed</p>}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">AI Analysis</p>
                <Card className="bg-white border border-slate-200">
                  <CardContent className="pt-4">
                    <p className="text-sm">{selectedClaim.ai_analysis || 'No analysis available yet'}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90"
                  data-testid="approve-claim-button"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Claim
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  data-testid="request-more-evidence-button"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Request More Evidence
                </Button>
                <Button
                  variant="outline"
                  data-testid="message-veteran-button"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Veteran Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Veteran</DialogTitle>
            <DialogDescription>
              Send an invitation email to a veteran to begin their onboarding process.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="veteran-email">Email Address *</Label>
              <Input
                id="veteran-email"
                type="email"
                placeholder="veteran@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="veteran-name">Veteran Name (Optional)</Label>
              <Input
                id="veteran-name"
                type="text"
                placeholder="John Smith"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#1B3A5F] hover:bg-[#152d4a]"
              onClick={handleInviteVeteran}
              disabled={inviteLoading || !inviteEmail}
            >
              {inviteLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgentLayout>
  );
}
