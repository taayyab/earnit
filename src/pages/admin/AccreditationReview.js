import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import AgentLayout from '../../components/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  RefreshCw,
  Scale,
  Users,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const ACCREDITATION_TYPE_LABELS = {
  va_attorney: 'VA Attorney',
  va_claims_agent: 'VA Claims Agent',
  vso_representative: 'VSO Representative',
};

const ACCREDITATION_TYPE_ICONS = {
  va_attorney: Scale,
  va_claims_agent: FileCheck,
  vso_representative: Users,
};

export default function AccreditationReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingSubmissions();
  }, []);

  const loadPendingSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/accreditation/pending');
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Failed to load pending submissions:', error);
      toast.error('Failed to load pending accreditation submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPendingSubmissions();
    setRefreshing(false);
    toast.success('Submissions refreshed');
  };

  const handleApprove = async (submission) => {
    try {
      setActionLoading(true);
      await api.post(`/admin/accreditation/${submission.id}/approve`);
      toast.success(`Accreditation approved for ${submission.user_name || submission.user_email}`);
      loadPendingSubmissions();
    } catch (error) {
      console.error('Failed to approve accreditation:', error);
      toast.error(error.response?.data?.detail || 'Failed to approve accreditation');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (submission) => {
    setSelectedSubmission(submission);
    setRejectionReason('');
    setReviewerNotes('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/admin/accreditation/${selectedSubmission.id}/reject`, {
        rejection_reason: rejectionReason,
        reviewer_notes: reviewerNotes || null,
      });
      toast.success(`Accreditation rejected for ${selectedSubmission.user_name || selectedSubmission.user_email}`);
      setRejectDialogOpen(false);
      setSelectedSubmission(null);
      loadPendingSubmissions();
    } catch (error) {
      console.error('Failed to reject accreditation:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject accreditation');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCredentials = (credentials) => {
    if (!credentials) return 'N/A';
    const parts = [];
    if (credentials.ogc_number) parts.push(`OGC: ${credentials.ogc_number}`);
    if (credentials.bar_number) parts.push(`Bar: ${credentials.bar_number}`);
    if (credentials.bar_state) parts.push(`State: ${credentials.bar_state}`);
    if (credentials.vso_org_id) parts.push(`VSO Org: ${credentials.vso_org_id}`);
    if (credentials.vso_rep_id) parts.push(`Rep ID: ${credentials.vso_rep_id}`);
    return parts.length > 0 ? parts.join(', ') : 'No credentials provided';
  };

  const getAccreditationIcon = (type) => {
    const Icon = ACCREDITATION_TYPE_ICONS[type] || Shield;
    return Icon;
  };

  return (
    <AgentLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Accreditation Review</h1>
            <p className="text-muted-foreground">
              Review and approve VA claims agent accreditation submissions
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Submissions ({submissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Pending Submissions</h3>
                <p className="text-muted-foreground">
                  All accreditation submissions have been reviewed
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Accreditation Type</TableHead>
                      <TableHead>Credentials</TableHead>
                      <TableHead className="text-center">Documents</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => {
                      const AccreditationIcon = getAccreditationIcon(submission.accreditation_type);
                      return (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{submission.user_name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{submission.user_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <AccreditationIcon className="h-4 w-4 text-[hsl(var(--primary))]" />
                              <Badge variant="outline">
                                {ACCREDITATION_TYPE_LABELS[submission.accreditation_type] || submission.accreditation_type}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm max-w-xs truncate" title={formatCredentials(submission.credentials)}>
                              {formatCredentials(submission.credentials)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{submission.document_count || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(submission.created_at)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(submission)}
                                disabled={actionLoading}
                                className="bg-[#1B3A5F] hover:bg-[#2a4a6f]"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectDialog(submission)}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Accreditation</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this accreditation submission.
                This will be shared with the applicant.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Explain why the accreditation is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewer-notes">Internal Notes (Optional)</Label>
                <Input
                  id="reviewer-notes"
                  placeholder="Internal notes for other reviewers..."
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Accreditation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AgentLayout>
  );
}
