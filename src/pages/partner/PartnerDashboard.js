import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building2,
  Settings,
  ChevronRight,
  Search,
  RefreshCw,
  Plus,
  PlusCircle,
  Mail,
  Phone
} from 'lucide-react';

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClaims: 0,
    pendingPOA: 0,
    completedThisMonth: 0
  });
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const orgResponse = await api.get('/partner/organization');
      const orgData = orgResponse.data;
      
      if (!orgData.organization) {
        navigate('/partner/register');
        return;
      }
      
      setOrganization(orgData.organization);
      
      const [statsResponse, clientsResponse, complianceResponse] = await Promise.allSettled([
        api.get(`/partner/organization/${orgData.organization.id}/stats`),
        api.get(`/partner/organization/${orgData.organization.id}/clients`),
        api.get(`/partner/organization/${orgData.organization.id}/compliance-status`)
      ]);

      if (statsResponse.status === 'fulfilled') {
        const statsData = statsResponse.value.data;
        setStats({
          totalClients: statsData.stats?.total_clients || 0,
          activeClaims: statsData.stats?.active_clients || 0,
          pendingPOA: statsData.stats?.pending_poa || 0,
          completedThisMonth: statsData.stats?.onboarded_this_month || 0
        });
      }

      if (clientsResponse.status === 'fulfilled') {
        const clientsData = clientsResponse.value.data;
        setClients(clientsData.clients || []);
      }

      if (complianceResponse.status === 'fulfilled') {
        const complianceData = complianceResponse.value.data;
        setCompliance(complianceData.compliance);
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-amber-100 text-amber-800',
      inactive: 'bg-slate-100 text-slate-800'
    };
    return <Badge className={styles[status] || styles.inactive}>{status}</Badge>;
  };

  const getClaimStatusBadge = (status) => {
    const config = {
      intake: { label: 'Intake', className: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-800' },
      submitted: { label: 'Submitted', className: 'bg-green-100 text-green-800' },
      pending_decision: { label: 'Pending Decision', className: 'bg-amber-100 text-amber-800' }
    };
    const { label, className } = config[status] || { label: status || 'N/A', className: 'bg-slate-100 text-slate-800' };
    return <Badge className={className}>{label}</Badge>;
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setInvitePhone(formatted);
  };

  const handleInviteVeteran = async () => {
    if (deliveryMethod === 'email' && !inviteEmail) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (deliveryMethod === 'sms' && !invitePhone) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (deliveryMethod === 'both' && (!inviteEmail || !invitePhone)) {
      toast.error('Please enter both email and phone number for dual delivery');
      return;
    }
    
    setInviteLoading(true);
    try {
      const payload = {
        veteran_name: inviteName || null,
        delivery_method: deliveryMethod
      };
      
      if (deliveryMethod === 'email' || deliveryMethod === 'both') {
        payload.veteran_email = inviteEmail;
      }
      if (deliveryMethod === 'sms' || deliveryMethod === 'both') {
        payload.veteran_phone = invitePhone.replace(/\D/g, '');
      }
      
      const response = await api.post('/partner/clients/invitations', payload);
      const data = response.data;
      
      if (data.success) {
        const deliveryStatus = data.delivery_status || {};
        const emailSent = deliveryStatus.email?.sent;
        const smsSent = deliveryStatus.sms?.sent;
        
        let successMsg = 'Invitation created';
        if (deliveryMethod === 'email' && emailSent) {
          successMsg = 'Email invitation sent successfully';
        } else if (deliveryMethod === 'sms' && smsSent) {
          successMsg = 'SMS invitation sent successfully';
        } else if (deliveryMethod === 'both') {
          if (emailSent && smsSent) {
            successMsg = 'Invitation sent via email and SMS';
          } else if (emailSent) {
            successMsg = 'Email sent, but SMS could not be delivered';
          } else if (smsSent) {
            successMsg = 'SMS sent, but email could not be delivered';
          }
        }
        
        toast.success(successMsg);
        setShowInviteModal(false);
        setInviteEmail('');
        setInvitePhone('');
        setInviteName('');
        setDeliveryMethod('email');
        
        if (deliveryMethod !== 'sms' && !emailSent && deliveryStatus.email?.error) {
          toast.warning(`Email error: ${deliveryStatus.email.error}`);
        }
        if (deliveryMethod !== 'email' && !smsSent && deliveryStatus.sms?.error) {
          toast.warning(`SMS error: ${deliveryStatus.sms.error}`);
        }
      } else {
        toast.error(data.detail || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Invite error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to send invitation';
      toast.error(errorMsg);
    } finally {
      setInviteLoading(false);
    }
  };

  const getPOAStatusIcon = (status) => {
    if (status === 'active' || status === 'verified') {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    if (status === 'pending') {
      return <Clock className="w-4 h-4 text-amber-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const filteredClients = clients.filter(client => {
    const name = client.name || '';
    const email = client.email || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getComplianceStatusBadge = (status, type) => {
    if (!status) return <Badge className="bg-slate-100 text-slate-800">Unknown</Badge>;
    
    if (status === 'verified' || status === 'active' || status === 'signed' || status === 'compliant') {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    if (status === 'pending' || status === 'pending_payment' || status === 'not_uploaded') {
      return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Action Required</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A5F] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-700 mb-4">{error}</p>
          <Button onClick={loadDashboardData} className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Partner Dashboard</h1>
            {organization && (
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">{organization.name}</span>
                <Badge className="bg-[#1B3A5F] text-white">{organization.license_tier}</Badge>
                {organization.license_status !== 'active' && (
                  <Badge className="bg-amber-100 text-amber-800">{organization.license_status}</Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2" onClick={loadDashboardData}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
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

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Clients</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalClients}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Clients</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeClaims}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pending POA</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingPOA}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Added This Month</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedThisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1B3A5F]" />
                Veteran Clients
              </CardTitle>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No clients found</p>
                <Button 
                  className="mt-4 bg-[#1B3A5F] hover:bg-[#152d4a] text-white"
                  onClick={() => navigate('/partner/clients/onboard')}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Your First Client
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Consent</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">POA</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Onboarded</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(client => (
                      <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <span className="font-medium text-slate-900">{client.name}</span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">{client.email}</td>
                        <td className="py-4 px-4">{getStatusBadge(client.status)}</td>
                        <td className="py-4 px-4">{getStatusBadge(client.consent_status)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            {getPOAStatusIcon(client.poa_status)}
                            <span className="text-sm text-slate-600 capitalize">{client.poa_status}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">
                          {client.onboarded_at ? new Date(client.onboarded_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white"
                              onClick={() => navigate('/agent/create-claim', { state: { clientId: client.id } })}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Start Claim
                            </Button>
                            <Button variant="ghost" size="sm" className="text-[#1B3A5F]">
                              View
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/partner/clients/onboard')}
              >
                <UserPlus className="w-4 h-4 mr-3 text-[#1B3A5F]" />
                Onboard New Veteran Client
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/agent/create-claim')}
              >
                <FileText className="w-4 h-4 mr-3 text-[#1B3A5F]" />
                Start New Claim
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-3 text-[#1B3A5F]" />
                Upload POA Document
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-3 text-[#1B3A5F]" />
                Manage Team Members
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                compliance?.va_accreditation?.status === 'verified' ? 'bg-green-50' : 'bg-amber-50'
              }`}>
                <div className="flex items-center gap-3">
                  {compliance?.va_accreditation?.status === 'verified' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    compliance?.va_accreditation?.status === 'verified' ? 'text-green-800' : 'text-amber-800'
                  }`}>VA Accreditation</span>
                </div>
                {getComplianceStatusBadge(compliance?.va_accreditation?.status, 'va')}
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                compliance?.agreements?.hipaa_baa?.signed ? 'bg-green-50' : 'bg-amber-50'
              }`}>
                <div className="flex items-center gap-3">
                  {compliance?.agreements?.hipaa_baa?.signed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    compliance?.agreements?.hipaa_baa?.signed ? 'text-green-800' : 'text-amber-800'
                  }`}>HIPAA BAA</span>
                </div>
                {getComplianceStatusBadge(compliance?.agreements?.hipaa_baa?.signed ? 'signed' : 'pending', 'hipaa')}
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                compliance?.malpractice_insurance?.status === 'verified' ? 'bg-green-50' : 'bg-amber-50'
              }`}>
                <div className="flex items-center gap-3">
                  {compliance?.malpractice_insurance?.status === 'verified' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    compliance?.malpractice_insurance?.status === 'verified' ? 'text-green-800' : 'text-amber-800'
                  }`}>Malpractice Insurance</span>
                </div>
                {getComplianceStatusBadge(compliance?.malpractice_insurance?.status, 'insurance')}
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                compliance?.agreements?.fee_disclosure?.signed ? 'bg-green-50' : 'bg-amber-50'
              }`}>
                <div className="flex items-center gap-3">
                  {compliance?.agreements?.fee_disclosure?.signed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    compliance?.agreements?.fee_disclosure?.signed ? 'text-green-800' : 'text-amber-800'
                  }`}>Fee Disclosure</span>
                </div>
                {getComplianceStatusBadge(compliance?.agreements?.fee_disclosure?.signed ? 'compliant' : 'pending', 'fee')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Veteran Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Veteran</DialogTitle>
            <DialogDescription>
              Send an invitation to a veteran via email, SMS, or both.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Delivery Method</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={deliveryMethod === 'email' ? 'default' : 'outline'}
                  className={deliveryMethod === 'email' ? 'bg-[#1B3A5F]' : ''}
                  onClick={() => setDeliveryMethod('email')}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={deliveryMethod === 'sms' ? 'default' : 'outline'}
                  className={deliveryMethod === 'sms' ? 'bg-[#1B3A5F]' : ''}
                  onClick={() => setDeliveryMethod('sms')}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  SMS
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={deliveryMethod === 'both' ? 'default' : 'outline'}
                  className={deliveryMethod === 'both' ? 'bg-[#1B3A5F]' : ''}
                  onClick={() => setDeliveryMethod('both')}
                >
                  Both
                </Button>
              </div>
            </div>

            {(deliveryMethod === 'email' || deliveryMethod === 'both') && (
              <div className="space-y-2">
                <Label htmlFor="veteran-email">Email Address {deliveryMethod !== 'sms' && '*'}</Label>
                <Input
                  id="veteran-email"
                  type="email"
                  placeholder="veteran@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            )}

            {(deliveryMethod === 'sms' || deliveryMethod === 'both') && (
              <div className="space-y-2">
                <Label htmlFor="veteran-phone">Phone Number {deliveryMethod !== 'email' && '*'}</Label>
                <Input
                  id="veteran-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={invitePhone}
                  onChange={handlePhoneChange}
                  maxLength={14}
                />
                <p className="text-xs text-slate-500">US phone numbers only</p>
              </div>
            )}

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
              onClick={() => {
                setShowInviteModal(false);
                setInviteEmail('');
                setInvitePhone('');
                setInviteName('');
                setDeliveryMethod('email');
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#1B3A5F] hover:bg-[#152d4a]"
              onClick={handleInviteVeteran}
              disabled={inviteLoading || 
                (deliveryMethod === 'email' && !inviteEmail) ||
                (deliveryMethod === 'sms' && !invitePhone) ||
                (deliveryMethod === 'both' && (!inviteEmail || !invitePhone))
              }
            >
              {inviteLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
