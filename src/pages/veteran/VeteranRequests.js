import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { toast } from 'sonner';
import api from '../../lib/api';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Search,
  Plus,
  Building2,
  FileText,
  Calendar,
  Phone,
  Video,
  MapPin,
  RefreshCw,
  ExternalLink,
  Ban,
  ClipboardList,
  User,
  DollarSign,
  ArrowRight
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Clock,
    step: 1
  },
  matched: {
    label: 'Provider Matched',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: User,
    step: 2
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    icon: CheckCircle2,
    step: 3
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: RefreshCw,
    step: 4
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle2,
    step: 5
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-slate-100 text-slate-600 border-slate-300',
    icon: XCircle,
    step: 0
  },
  declined: {
    label: 'Declined',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: Ban,
    step: 0
  }
};

const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Submitted', step: 1 },
  { key: 'matched', label: 'Provider Matched', step: 2 },
  { key: 'accepted', label: 'Accepted', step: 3 },
  { key: 'in_progress', label: 'In Progress', step: 4 },
  { key: 'completed', label: 'Completed', step: 5 }
];

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.color} flex items-center gap-1.5 px-2.5 py-1`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

function StatusTimeline({ status }) {
  const currentStep = STATUS_CONFIG[status]?.step || 0;
  
  if (status === 'cancelled' || status === 'declined') {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <XCircle className="h-4 w-4" />
        <span>Request {status === 'cancelled' ? 'cancelled' : 'declined by provider'}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = currentStep >= step.step;
        const isCurrent = currentStep === step.step;
        
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center min-w-[80px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{step.step}</span>
                )}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  isCompleted || isCurrent ? 'text-slate-700 font-medium' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < TIMELINE_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 min-w-[20px] ${
                  currentStep > step.step ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function RequestCard({ request, onViewDetails, onCancel }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const canCancel = ['pending', 'accepted'].includes(request.status);
  const formattedDate = request.submitted_at 
    ? new Date(request.submitted_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'N/A';
  
  const lastUpdated = request.completed_at || request.created_at;
  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-base font-semibold">
                    {request.request_number || `REQ-${request.id?.slice(0, 8)}`}
                  </CardTitle>
                  <StatusBadge status={request.status} />
                </div>
                <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {request.provider && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {request.provider.practice_name || 'Provider Pending'}
                    </span>
                  )}
                  {request.service && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {request.service.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Submitted: {formattedDate}
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <Separator />
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-700">Status Progress</h4>
              <StatusTimeline status={request.status} />
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Request Details</h4>
                <div className="space-y-2 text-sm">
                  {request.condition_descriptions?.length > 0 && (
                    <div>
                      <span className="text-slate-500">Condition: </span>
                      <span>{request.condition_descriptions[0]}</span>
                    </div>
                  )}
                  {request.preferred_location_type && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Preference: </span>
                      {request.preferred_location_type === 'telehealth' ? (
                        <span className="flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" /> Telehealth
                        </span>
                      ) : request.preferred_location_type === 'in_person' ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> In-Person
                        </span>
                      ) : (
                        <span>Either</span>
                      )}
                    </div>
                  )}
                  {request.service?.price && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Quoted Price: </span>
                      <span className="font-medium">${request.service.price}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {request.provider && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Provider Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-500">Practice: </span>
                      <span>{request.provider.practice_name}</span>
                    </div>
                    {request.scheduled_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          Scheduled: {new Date(request.scheduled_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-xs text-slate-400">
              Last updated: {formattedLastUpdated}
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(request.id)}
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                View Full Details
              </Button>
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(request)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Cancel Request
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function RequestDetailModal({ request, open, onClose }) {
  if (!request) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {request.request_number || `REQ-${request.id?.slice(0, 8)}`}
            <StatusBadge status={request.status} />
          </DialogTitle>
          <DialogDescription>
            Service request details and status history
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <h4 className="font-medium mb-3">Status Progress</h4>
            <StatusTimeline status={request.status} />
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-3">Service Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Service Type:</span>
                <p className="font-medium">{request.service?.name || 'N/A'}</p>
              </div>
              {request.service?.description && (
                <div className="col-span-2">
                  <span className="text-slate-500">Description:</span>
                  <p>{request.service.description}</p>
                </div>
              )}
              {request.condition_descriptions?.map((condition, idx) => (
                <div key={idx} className="col-span-2">
                  <span className="text-slate-500">Condition Notes:</span>
                  <p>{condition}</p>
                </div>
              ))}
              {request.service?.price && (
                <div>
                  <span className="text-slate-500">Quoted Price:</span>
                  <p className="font-medium">${request.service.price}</p>
                </div>
              )}
              {request.service?.turnaround_days && (
                <div>
                  <span className="text-slate-500">Turnaround Time:</span>
                  <p>{request.service.turnaround_days} days</p>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-3">Provider Information</h4>
            {request.provider ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Practice Name:</span>
                  <p className="font-medium">{request.provider.practice_name}</p>
                </div>
                {request.provider.contact_name && (
                  <div>
                    <span className="text-slate-500">Contact:</span>
                    <p>{request.provider.contact_name}</p>
                  </div>
                )}
                {request.provider.business_phone && ['accepted', 'in_progress', 'completed'].includes(request.status) && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{request.provider.business_phone}</span>
                  </div>
                )}
                {request.provider.serves_telehealth && (
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-green-500" />
                    <span>Telehealth Available</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Awaiting provider assignment</p>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-3">Status History</h4>
            <div className="space-y-2 text-sm">
              {request.submitted_at && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span>Request Submitted</span>
                  <span className="text-slate-500">
                    {new Date(request.submitted_at).toLocaleString()}
                  </span>
                </div>
              )}
              {request.matched_at && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span>Provider Matched</span>
                  <span className="text-slate-500">
                    {new Date(request.matched_at).toLocaleString()}
                  </span>
                </div>
              )}
              {request.scheduled_date && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span>Appointment Scheduled</span>
                  <span className="text-slate-500">
                    {new Date(request.scheduled_date).toLocaleString()}
                  </span>
                </div>
              )}
              {request.completed_at && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span>Request Completed</span>
                  <span className="text-slate-500">
                    {new Date(request.completed_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-3">Documents & Deliverables</h4>
            {request.delivered_document_ids?.length > 0 ? (
              <div className="space-y-2">
                {request.delivered_document_ids.map((docId, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Document {idx + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {request.status === 'completed' 
                  ? 'Documents will be available soon'
                  : 'Documents will appear here once the service is completed'}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelRequestModal({ request, open, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  
  const handleConfirm = () => {
    onConfirm(request.id, reason);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Cancel Service Request
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this request? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium">{request?.request_number}</p>
            <p className="text-sm text-slate-500">
              {request?.service?.name} - {request?.provider?.practice_name || 'Provider Pending'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason for cancellation (optional)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Please let us know why you're cancelling this request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Keep Request
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function VeteranRequests() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('active');
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailRequest, setDetailRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [cancelRequest, setCancelRequest] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const getStatusFilter = useCallback(() => {
    switch (activeTab) {
      case 'active':
        return null;
      case 'completed':
        return 'completed';
      case 'all':
      default:
        return null;
    }
  }, [activeTab]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const statusFilter = getStatusFilter();
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      params.append('page', currentPage);
      params.append('limit', 20);
      
      const response = await api.get(`/api/requests?${params.toString()}`);
      
      if (response.data?.success) {
        let filteredRequests = response.data.requests || [];
        
        if (activeTab === 'active') {
          filteredRequests = filteredRequests.filter(r => 
            ['pending', 'matched', 'accepted', 'in_progress'].includes(r.status)
          );
        }
        
        setRequests(filteredRequests);
        setTotalRequests(response.data.total || 0);
      } else {
        setRequests([]);
        setTotalRequests(0);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load your requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, getStatusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleViewDetails = async (requestId) => {
    setLoadingDetails(true);
    try {
      const response = await api.get(`/api/requests/${requestId}`);
      if (response.data?.success) {
        setDetailRequest(response.data.request);
        setShowDetailModal(true);
      } else {
        toast.error('Failed to load request details');
      }
    } catch (error) {
      console.error('Failed to fetch request details:', error);
      toast.error('Failed to load request details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenCancelModal = (request) => {
    setCancelRequest(request);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (requestId, reason) => {
    setCancelLoading(true);
    try {
      const response = await api.post(`/api/requests/${requestId}/cancel`, { reason });
      if (response.data?.success) {
        toast.success('Request cancelled successfully');
        setShowCancelModal(false);
        setCancelRequest(null);
        fetchRequests();
      } else {
        toast.error(response.data?.detail || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Failed to cancel request:', error);
      const message = error.response?.data?.detail || 'Failed to cancel request';
      toast.error(message);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const activeCount = requests.filter(r => 
    ['pending', 'matched', 'accepted', 'in_progress'].includes(r.status)
  ).length;
  
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Service Requests</h1>
            <p className="text-slate-600 mt-1">
              Track and manage your community care service requests
            </p>
          </div>
          <Button
            onClick={() => navigate('/veteran/providers')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Request New Service
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              All
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ClipboardList className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    {activeTab === 'active' 
                      ? 'No active requests' 
                      : activeTab === 'completed'
                      ? 'No completed requests'
                      : 'No requests yet'}
                  </h3>
                  <p className="text-slate-500 text-center mb-6 max-w-md">
                    {activeTab === 'active' 
                      ? "You don't have any active service requests at the moment."
                      : activeTab === 'completed'
                      ? "You haven't completed any service requests yet."
                      : "Start by searching for a provider and requesting a service."}
                  </p>
                  <Button onClick={() => navigate('/veteran/providers')}>
                    <Search className="h-4 w-4 mr-2" />
                    Find a Provider
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onViewDetails={handleViewDetails}
                    onCancel={handleOpenCancelModal}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!loading && requests.length > 0 && totalRequests > 20 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {Math.ceil(totalRequests / 20)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= Math.ceil(totalRequests / 20)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <RequestDetailModal
        request={detailRequest}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDetailRequest(null);
        }}
      />

      <CancelRequestModal
        request={cancelRequest}
        open={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelRequest(null);
        }}
        onConfirm={handleConfirmCancel}
        loading={cancelLoading}
      />
    </div>
  );
}
