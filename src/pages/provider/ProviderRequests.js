import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Video,
  MapPin,
  Phone,
  Mail,
  Eye,
  ChevronRight,
  Stethoscope,
  DollarSign,
  ClipboardList,
  MessageSquare,
  Paperclip
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-800',
    icon: Clock,
    description: 'Waiting for your response'
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle2,
    description: 'Ready to start work'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-purple-100 text-purple-800',
    icon: PlayCircle,
    description: 'Currently working'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    description: 'Work finished'
  },
  declined: {
    label: 'Declined',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Request declined'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-slate-100 text-slate-600',
    icon: XCircle,
    description: 'Cancelled by veteran'
  }
};

const TELEHEALTH_CONFIG = {
  telehealth: { label: 'Telehealth Only', icon: Video, color: 'text-blue-600' },
  in_person: { label: 'In-Person Only', icon: MapPin, color: 'text-green-600' },
  either: { label: 'Flexible', icon: CheckCircle2, color: 'text-slate-600' }
};

export default function ProviderRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  const [declineReason, setDeclineReason] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = activeTab !== 'all' ? `&status=${activeTab}` : '';
      const response = await api.get(`/api/providers/requests?page=${page}&limit=20${statusParam}`);
      setRequests(response.data.requests || []);
      setPagination({
        page: response.data.page || 1,
        total: response.data.total || 0,
        totalPages: response.data.total_pages || 1
      });
    } catch (err) {
      console.error('Failed to load requests:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setIsSubmitting(true);
    try {
      await api.post(`/api/providers/requests/${requestId}/accept`);
      toast.success('Request accepted successfully');
      loadRequests();
      setShowDetailModal(false);
    } catch (err) {
      console.error('Failed to accept request:', err);
      toast.error(err.response?.data?.detail || 'Failed to accept request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post(`/api/providers/requests/${selectedRequest.id}/decline`, {
        decline_reason: declineReason
      });
      toast.success('Request declined');
      setShowDeclineModal(false);
      setDeclineReason('');
      loadRequests();
    } catch (err) {
      console.error('Failed to decline request:', err);
      toast.error(err.response?.data?.detail || 'Failed to decline request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWork = async (requestId) => {
    setIsSubmitting(true);
    try {
      await api.post(`/api/providers/requests/${requestId}/start`);
      toast.success('Work started on request');
      loadRequests();
      setShowDetailModal(false);
    } catch (err) {
      console.error('Failed to start work:', err);
      toast.error(err.response?.data?.detail || 'Failed to start work');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/api/providers/requests/${selectedRequest.id}/complete`, {
        completion_notes: completionNotes || null
      });
      toast.success('Request marked as complete');
      setShowCompleteModal(false);
      setCompletionNotes('');
      loadRequests();
    } catch (err) {
      console.error('Failed to complete request:', err);
      toast.error(err.response?.data?.detail || 'Failed to complete request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeclineModal = (request) => {
    setSelectedRequest(request);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  const openCompleteModal = (request) => {
    setSelectedRequest(request);
    setCompletionNotes('');
    setShowCompleteModal(true);
  };

  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVeteranDisplayName = (veteran) => {
    if (!veteran) return 'Unknown';
    return veteran.first_name || 'Veteran';
  };

  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const renderTelehealthBadge = (preference) => {
    const config = TELEHEALTH_CONFIG[preference] || TELEHEALTH_CONFIG.either;
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 text-sm ${config.color}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    );
  };

  const renderActionButtons = (request) => {
    const buttons = [];
    
    buttons.push(
      <Button
        key="view"
        variant="outline"
        size="sm"
        onClick={() => openDetailModal(request)}
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
    );

    if (request.status === 'pending') {
      buttons.push(
        <Button
          key="accept"
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => handleAccept(request.id)}
          disabled={isSubmitting}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Accept
        </Button>
      );
      buttons.push(
        <Button
          key="decline"
          variant="destructive"
          size="sm"
          onClick={() => openDeclineModal(request)}
          disabled={isSubmitting}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Decline
        </Button>
      );
    }

    if (request.status === 'accepted') {
      buttons.push(
        <Button
          key="start"
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => handleStartWork(request.id)}
          disabled={isSubmitting}
        >
          <PlayCircle className="h-4 w-4 mr-1" />
          Start Work
        </Button>
      );
    }

    if (request.status === 'in_progress') {
      buttons.push(
        <Button
          key="complete"
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => openCompleteModal(request)}
          disabled={isSubmitting}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Mark Complete
        </Button>
      );
    }

    return buttons;
  };

  const renderRequestCard = (request) => {
    const StatusIcon = STATUS_CONFIG[request.status]?.icon || Clock;
    
    return (
      <Card key={request.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-muted-foreground">
                      {request.request_number || request.id?.slice(0, 8)}
                    </span>
                    {renderStatusBadge(request.status)}
                  </div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {getVeteranDisplayName(request.veteran)}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Service:</span>
                  <span>{request.service?.name || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Submitted:</span>
                  <span>{formatDate(request.submitted_at || request.created_at)}</span>
                </div>

                {request.quoted_price && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Quote:</span>
                    <span>${parseFloat(request.quoted_price).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {renderTelehealthBadge(request.preferred_location_type)}
                </div>
              </div>

              {request.condition_descriptions && request.condition_descriptions.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Condition: </span>
                  <span className="text-slate-700">
                    {request.condition_descriptions[0]?.slice(0, 100)}
                    {request.condition_descriptions[0]?.length > 100 ? '...' : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
              {renderActionButtons(request)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getTabCount = (status) => {
    if (status === 'all') return requests.length;
    return requests.filter(r => r.status === status).length;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading requests...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/provider/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Inbox className="h-6 w-6 text-primary" />
                Service Requests
              </h1>
              <p className="text-muted-foreground">
                Manage incoming requests from veterans
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => loadRequests()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
              <Button variant="link" className="text-red-700" onClick={() => loadRequests()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full max-w-2xl">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Accepted
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" />
              In Progress
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="declined" className="flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              Declined
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' 
                      ? "You haven't received any service requests yet."
                      : `No ${activeTab.replace('_', ' ')} requests at this time.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map(renderRequestCard)}
                
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      disabled={pagination.page <= 1}
                      onClick={() => loadRequests(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => loadRequests(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Details
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.request_number || selectedRequest?.id?.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {getVeteranDisplayName(selectedRequest.veteran)}
                  </h3>
                  {selectedRequest.status !== 'pending' && selectedRequest.veteran && (
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      {selectedRequest.veteran.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {selectedRequest.veteran.email}
                        </div>
                      )}
                      {selectedRequest.veteran.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {selectedRequest.veteran.phone}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {renderStatusBadge(selectedRequest.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-muted-foreground">Service Type</Label>
                  <p className="font-medium">{selectedRequest.service?.name || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quoted Price</Label>
                  <p className="font-medium">
                    {selectedRequest.quoted_price 
                      ? `$${parseFloat(selectedRequest.quoted_price).toFixed(2)}`
                      : 'Not quoted'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="font-medium">
                    {formatDateTime(selectedRequest.submitted_at || selectedRequest.created_at)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Preference</Label>
                  <div className="font-medium">
                    {renderTelehealthBadge(selectedRequest.preferred_location_type)}
                  </div>
                </div>
                {selectedRequest.urgency && (
                  <div>
                    <Label className="text-muted-foreground">Urgency</Label>
                    <p className="font-medium capitalize">{selectedRequest.urgency}</p>
                  </div>
                )}
                {selectedRequest.scheduled_date && (
                  <div>
                    <Label className="text-muted-foreground">Scheduled Date</Label>
                    <p className="font-medium">{formatDate(selectedRequest.scheduled_date)}</p>
                  </div>
                )}
              </div>

              {selectedRequest.condition_descriptions && selectedRequest.condition_descriptions.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    Condition Description
                  </Label>
                  <div className="p-3 bg-slate-50 rounded-lg text-sm">
                    {selectedRequest.condition_descriptions.map((desc, idx) => (
                      <p key={idx} className="mb-2 last:mb-0">{desc}</p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  Status History
                </Label>
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDateTime(selectedRequest.created_at)}</span>
                  </div>
                  {selectedRequest.submitted_at && selectedRequest.submitted_at !== selectedRequest.created_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>{formatDateTime(selectedRequest.submitted_at)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[selectedRequest.status]?.color.split(' ')[0] || 'bg-slate-500'}`} />
                    <span className="text-muted-foreground">Current Status:</span>
                    <span className="capitalize">{selectedRequest.status?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                  <Paperclip className="h-4 w-4" />
                  Document Attachments
                </Label>
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                  <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents attached</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedRequest?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetailModal(false);
                    openDeclineModal(selectedRequest);
                  }}
                  disabled={isSubmitting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleAccept(selectedRequest.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Accept Request
                </Button>
              </>
            )}
            {selectedRequest?.status === 'accepted' && (
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => handleStartWork(selectedRequest.id)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4 mr-2" />
                )}
                Start Work
              </Button>
            )}
            {selectedRequest?.status === 'in_progress' && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setShowDetailModal(false);
                  openCompleteModal(selectedRequest);
                }}
                disabled={isSubmitting}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeclineModal} onOpenChange={setShowDeclineModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Decline Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this request. This will be shared with the veteran.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="decline-reason">Reason for Declining *</Label>
              <Textarea
                id="decline-reason"
                placeholder="Please explain why you are unable to accept this request..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={!declineReason.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Complete Request
            </DialogTitle>
            <DialogDescription>
              Mark this service request as complete. Add any notes about the completed work.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="completion-notes">Completion Notes (Optional)</Label>
              <Textarea
                id="completion-notes"
                placeholder="Add any notes about the completed service, deliverables, or next steps..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
