import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import api from '../../lib/api';
import AgentLayout from '../../components/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Eye,
  Play,
  Shield,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  FileCheck,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Ban,
  Star,
  Users,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-500', icon: Eye },
  verified: { label: 'Verified', color: 'bg-green-500', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  suspended: { label: 'Suspended', color: 'bg-gray-500', icon: Ban },
};

const TIER_CONFIG = {
  verified: { label: 'Verified', color: 'bg-green-500' },
  preferred: { label: 'Preferred', color: 'bg-blue-500' },
  elite: { label: 'Elite', color: 'bg-blue-500' },
};

const CREDENTIAL_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500' },
  verified: { label: 'Verified', color: 'bg-green-500' },
  rejected: { label: 'Rejected', color: 'bg-red-500' },
  expired: { label: 'Expired', color: 'bg-gray-500' },
};

export default function ProviderVerification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queueStats, setQueueStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [totalProviders, setTotalProviders] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [providerCredentials, setProviderCredentials] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [credentialAction, setCredentialAction] = useState('verify');
  
  const [verifyTier, setVerifyTier] = useState('verified');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [credentialReason, setCredentialReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    loadQueueStats();
    loadProviders();
  }, [user, navigate]);

  useEffect(() => {
    loadProviders();
  }, [page, filters]);

  const loadQueueStats = async () => {
    try {
      const response = await api.get('/admin/providers/queue-stats');
      setQueueStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load queue stats:', error);
      toast.error('Failed to load queue statistics');
    }
  };

  const loadProviders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== 'all') {
        params.append('status_filter', filters.status);
      }
      params.append('limit', String(ITEMS_PER_PAGE));
      params.append('offset', String(page * ITEMS_PER_PAGE));
      
      const response = await api.get(`/admin/providers/pending?${params.toString()}`);
      setProviders(response.data.providers || []);
      setTotalProviders(response.data.total || 0);
    } catch (error) {
      console.error('Failed to load providers:', error);
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadQueueStats(), loadProviders()]);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const loadProviderDetails = async (provider) => {
    setSelectedProvider(provider);
    setDetailsPanelOpen(true);
    setDetailsLoading(true);
    
    try {
      const [detailsRes, credentialsRes] = await Promise.all([
        api.get(`/admin/providers/${provider.id}/details`),
        api.get(`/admin/providers/${provider.id}/credentials`),
      ]);
      setProviderDetails(detailsRes.data);
      setProviderCredentials(credentialsRes.data.credentials || []);
    } catch (error) {
      console.error('Failed to load provider details:', error);
      toast.error('Failed to load provider details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStartReview = async (provider) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/providers/${provider.id}/start-review`);
      toast.success(`Started review for ${provider.practice_name}`);
      loadQueueStats();
      loadProviders();
      if (providerDetails?.provider?.id === provider.id) {
        loadProviderDetails(provider);
      }
    } catch (error) {
      console.error('Failed to start review:', error);
      toast.error(error.response?.data?.detail || 'Failed to start review');
    } finally {
      setActionLoading(false);
    }
  };

  const openVerifyDialog = (provider) => {
    setSelectedProvider(provider);
    setVerifyTier('verified');
    setVerifyNotes('');
    setVerifyDialogOpen(true);
  };

  const handleVerify = async () => {
    if (!selectedProvider) return;
    
    try {
      setActionLoading(true);
      await api.put(`/admin/providers/${selectedProvider.id}/verify`, {
        tier: verifyTier,
        notes: verifyNotes || null,
      });
      toast.success(`${selectedProvider.practice_name} verified as ${TIER_CONFIG[verifyTier]?.label || verifyTier}`);
      setVerifyDialogOpen(false);
      setSelectedProvider(null);
      loadQueueStats();
      loadProviders();
    } catch (error) {
      console.error('Failed to verify provider:', error);
      toast.error(error.response?.data?.detail || 'Failed to verify provider');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (provider) => {
    setSelectedProvider(provider);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedProvider || rejectReason.length < 10) {
      toast.error('Please provide a rejection reason (minimum 10 characters)');
      return;
    }
    
    try {
      setActionLoading(true);
      await api.put(`/admin/providers/${selectedProvider.id}/reject`, {
        reason: rejectReason,
      });
      toast.success(`${selectedProvider.practice_name} rejected`);
      setRejectDialogOpen(false);
      setSelectedProvider(null);
      loadQueueStats();
      loadProviders();
    } catch (error) {
      console.error('Failed to reject provider:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject provider');
    } finally {
      setActionLoading(false);
    }
  };

  const openSuspendDialog = (provider) => {
    setSelectedProvider(provider);
    setSuspendReason('');
    setSuspendDialogOpen(true);
  };

  const handleSuspend = async () => {
    if (!selectedProvider || suspendReason.length < 10) {
      toast.error('Please provide a suspension reason (minimum 10 characters)');
      return;
    }
    
    try {
      setActionLoading(true);
      await api.put(`/admin/providers/${selectedProvider.id}/suspend`, {
        reason: suspendReason,
      });
      toast.success(`${selectedProvider.practice_name} suspended`);
      setSuspendDialogOpen(false);
      setSelectedProvider(null);
      loadQueueStats();
      loadProviders();
    } catch (error) {
      console.error('Failed to suspend provider:', error);
      toast.error(error.response?.data?.detail || 'Failed to suspend provider');
    } finally {
      setActionLoading(false);
    }
  };

  const openCredentialAction = (credential, action) => {
    setSelectedCredential(credential);
    setCredentialAction(action);
    setCredentialReason('');
    setCredentialDialogOpen(true);
  };

  const handleCredentialAction = async () => {
    if (!selectedCredential) return;
    
    if (credentialAction === 'reject' && credentialReason.length < 10) {
      toast.error('Please provide a rejection reason (minimum 10 characters)');
      return;
    }
    
    try {
      setActionLoading(true);
      const endpoint = credentialAction === 'verify' 
        ? `/admin/providers/credentials/${selectedCredential.id}/verify`
        : `/admin/providers/credentials/${selectedCredential.id}/reject`;
      
      const payload = credentialAction === 'reject' 
        ? { reason: credentialReason }
        : { notes: credentialReason || null };
      
      await api.put(endpoint, payload);
      toast.success(`Credential ${credentialAction === 'verify' ? 'verified' : 'rejected'}`);
      setCredentialDialogOpen(false);
      setSelectedCredential(null);
      
      if (providerDetails?.provider) {
        const credentialsRes = await api.get(`/admin/providers/${providerDetails.provider.id}/credentials`);
        setProviderCredentials(credentialsRes.data.credentials || []);
      }
    } catch (error) {
      console.error(`Failed to ${credentialAction} credential:`, error);
      toast.error(error.response?.data?.detail || `Failed to ${credentialAction} credential`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500', icon: Clock };
  };

  const getTierConfig = (tier) => {
    return TIER_CONFIG[tier] || { label: tier, color: 'bg-gray-500' };
  };

  const getCredentialStatusConfig = (status) => {
    return CREDENTIAL_STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500' };
  };

  const filteredProviders = providers.filter(provider => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      provider.practice_name?.toLowerCase().includes(searchLower) ||
      provider.email?.toLowerCase().includes(searchLower) ||
      provider.npi_number?.includes(filters.search)
    );
  });

  const totalPages = Math.ceil(totalProviders / ITEMS_PER_PAGE);

  if (loading && !queueStats) {
    return (
      <AgentLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="grid md:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-[#1B3A5F]" />
              Provider Verification Queue
            </h1>
            <p className="text-muted-foreground">Review and verify community care provider applications</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{queueStats?.pending || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold text-blue-600">{queueStats?.under_review || 0}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{queueStats?.verified || 0}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{queueStats?.rejected || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-bold text-gray-600">{queueStats?.suspended || 0}</p>
                </div>
                <Ban className="h-8 w-8 text-gray-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Queue Total</p>
                  <p className="text-2xl font-bold text-[#1B3A5F]">{queueStats?.total_queue || 0}</p>
                </div>
                <Users className="h-8 w-8 text-[#1B3A5F] opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Provider Queue</CardTitle>
            <CardDescription>Providers awaiting verification review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or NPI..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) => {
                  setFilters({ ...filters, status: value });
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Practice Name</TableHead>
                    <TableHead>NPI</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Credentials</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredProviders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        No providers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProviders.map((provider) => {
                      const statusConfig = getStatusConfig(provider.verification_status);
                      const StatusIcon = statusConfig?.icon || Clock;
                      return (
                        <TableRow key={provider.id}>
                          <TableCell>
                            <div className="font-medium">{provider.practice_name}</div>
                            <div className="text-sm text-muted-foreground">{provider.practice_type}</div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{provider.npi_number || 'N/A'}</TableCell>
                          <TableCell className="text-sm">{provider.email}</TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig.color} text-white`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{provider.credentials_count || 0}</span>
                              {provider.pending_credentials > 0 && (
                                <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                                  {provider.pending_credentials} pending
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(provider.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadProviderDetails(provider)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {provider.verification_status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartReview(provider)}
                                  disabled={actionLoading}
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              )}
                              {(provider.verification_status === 'pending' || provider.verification_status === 'under_review') && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-[#1B3A5F] hover:bg-[#2a4a6f]"
                                    onClick={() => openVerifyDialog(provider)}
                                    disabled={actionLoading}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openRejectDialog(provider)}
                                    disabled={actionLoading}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {page * ITEMS_PER_PAGE + 1} to {Math.min((page + 1) * ITEMS_PER_PAGE, totalProviders)} of {totalProviders}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Sheet open={detailsPanelOpen} onOpenChange={setDetailsPanelOpen}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Provider Details
              </SheetTitle>
              <SheetDescription>
                Review provider information and credentials
              </SheetDescription>
            </SheetHeader>
            
            {detailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : providerDetails ? (
              <Tabs defaultValue="info" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="locations">Locations</TabsTrigger>
                  <TabsTrigger value="credentials">Credentials</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Practice Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Practice Name</Label>
                          <p className="font-medium">{providerDetails.provider?.practice_name}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Practice Type</Label>
                          <p className="font-medium">{providerDetails.provider?.practice_type}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">NPI Number</Label>
                          <p className="font-mono">{providerDetails.provider?.npi_number || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <Badge className={`${getStatusConfig(providerDetails.provider?.verification_status).color} text-white`}>
                            {getStatusConfig(providerDetails.provider?.verification_status).label}
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{providerDetails.provider?.business_phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{providerDetails.provider?.business_email || providerDetails.provider?.email}</span>
                        </div>
                        {providerDetails.provider?.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a href={providerDetails.provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {providerDetails.provider.website}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {providerDetails.provider?.tier && (
                        <>
                          <Separator />
                          <div>
                            <Label className="text-xs text-muted-foreground">Provider Tier</Label>
                            <Badge className={`${getTierConfig(providerDetails.provider.tier).color} text-white mt-1`}>
                              <Star className="h-3 w-3 mr-1" />
                              {getTierConfig(providerDetails.provider.tier).label}
                            </Badge>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="flex gap-2">
                    {(providerDetails.provider?.verification_status === 'pending' || 
                      providerDetails.provider?.verification_status === 'under_review') && (
                      <>
                        <Button
                          className="flex-1 bg-[#1B3A5F] hover:bg-[#2a4a6f]"
                          onClick={() => openVerifyDialog(providerDetails.provider)}
                          disabled={actionLoading}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Verify Provider
                        </Button>
                        <Button
                          className="flex-1"
                          variant="destructive"
                          onClick={() => openRejectDialog(providerDetails.provider)}
                          disabled={actionLoading}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    {providerDetails.provider?.verification_status === 'verified' && (
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => openSuspendDialog(providerDetails.provider)}
                        disabled={actionLoading}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend Provider
                      </Button>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="locations" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    {providerDetails.locations?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        No locations registered
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {providerDetails.locations?.map((location) => (
                          <Card key={location.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                  <div>
                                    <p className="font-medium">{location.location_name || 'Main Location'}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {location.address_line1}
                                      {location.address_line2 && `, ${location.address_line2}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {location.city}, {location.state} {location.zip_code}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {location.is_primary && (
                                    <Badge variant="outline">Primary</Badge>
                                  )}
                                  <Badge variant={location.is_active ? 'default' : 'secondary'}>
                                    {location.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="credentials" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    {providerCredentials.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        No credentials registered
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {providerCredentials.map((credential) => {
                          const credStatus = getCredentialStatusConfig(credential.status);
                          return (
                            <Card key={credential.id}>
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <FileCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                      <p className="font-medium">{credential.credential_type}</p>
                                      <p className="text-sm text-muted-foreground font-mono">
                                        {credential.credential_number}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {credential.issuing_authority}
                                        {credential.state && ` - ${credential.state}`}
                                      </p>
                                      {credential.expiration_date && (
                                        <p className="text-xs text-muted-foreground">
                                          Expires: {formatDate(credential.expiration_date)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <Badge className={`${credStatus.color} text-white`}>
                                      {credStatus.label}
                                    </Badge>
                                    {credential.status === 'pending' && (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 text-green-600 border-green-600 hover:bg-green-50"
                                          onClick={() => openCredentialAction(credential, 'verify')}
                                        >
                                          <CheckCircle2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 text-red-600 border-red-600 hover:bg-red-50"
                                          onClick={() => openCredentialAction(credential, 'reject')}
                                        >
                                          <XCircle className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="services" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    {providerDetails.services?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Stethoscope className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        No services registered
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {providerDetails.services?.map((service) => (
                          <Card key={service.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">Service #{service.service_type_id}</p>
                                    {service.price && (
                                      <p className="text-sm text-muted-foreground">
                                        ${service.price.toFixed(2)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {service.accepts_va_community_care && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                                      VA Community Care
                                    </Badge>
                                  )}
                                  <Badge variant={service.is_available ? 'default' : 'secondary'}>
                                    {service.is_available ? 'Available' : 'Unavailable'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : null}
          </SheetContent>
        </Sheet>

        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Provider</DialogTitle>
              <DialogDescription>
                Approve this provider and assign a tier level.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Provider Tier *</Label>
                <Select value={verifyTier} onValueChange={setVerifyTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Verified - Basic verification
                      </div>
                    </SelectItem>
                    <SelectItem value="preferred">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        Preferred - Enhanced visibility
                      </div>
                    </SelectItem>
                    <SelectItem value="elite">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        Elite - Top-tier provider
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Verification Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes about this verification..."
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyDialogOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button className="bg-[#1B3A5F] hover:bg-[#2a4a6f]" onClick={handleVerify} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Verify Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Provider</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this provider application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rejection Reason *</Label>
                <Textarea
                  placeholder="Explain why this provider is being rejected (minimum 10 characters)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
                {rejectReason.length > 0 && rejectReason.length < 10 && (
                  <p className="text-xs text-red-500">Minimum 10 characters required</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={actionLoading || rejectReason.length < 10}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                Reject Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Provider</DialogTitle>
              <DialogDescription>
                Suspending a provider will remove them from active listings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Suspension Reason *</Label>
                <Textarea
                  placeholder="Explain why this provider is being suspended (minimum 10 characters)..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={4}
                />
                {suspendReason.length > 0 && suspendReason.length < 10 && (
                  <p className="text-xs text-red-500">Minimum 10 characters required</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuspendDialogOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleSuspend} disabled={actionLoading || suspendReason.length < 10}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
                Suspend Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={credentialDialogOpen} onOpenChange={setCredentialDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {credentialAction === 'verify' ? 'Verify Credential' : 'Reject Credential'}
              </DialogTitle>
              <DialogDescription>
                {credentialAction === 'verify' 
                  ? 'Confirm this credential is valid.'
                  : 'Please provide a reason for rejecting this credential.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedCredential && (
                <Card>
                  <CardContent className="pt-4">
                    <p className="font-medium">{selectedCredential.credential_type}</p>
                    <p className="text-sm text-muted-foreground font-mono">{selectedCredential.credential_number}</p>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-2">
                <Label>{credentialAction === 'verify' ? 'Notes (Optional)' : 'Rejection Reason *'}</Label>
                <Textarea
                  placeholder={credentialAction === 'verify' 
                    ? 'Add any verification notes...'
                    : 'Explain why this credential is being rejected (minimum 10 characters)...'}
                  value={credentialReason}
                  onChange={(e) => setCredentialReason(e.target.value)}
                  rows={3}
                />
                {credentialAction === 'reject' && credentialReason.length > 0 && credentialReason.length < 10 && (
                  <p className="text-xs text-red-500">Minimum 10 characters required</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCredentialDialogOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              {credentialAction === 'verify' ? (
                <Button className="bg-[#1B3A5F] hover:bg-[#2a4a6f]" onClick={handleCredentialAction} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Verify Credential
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleCredentialAction} disabled={actionLoading || credentialReason.length < 10}>
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject Credential
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AgentLayout>
  );
}
