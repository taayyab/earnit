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
import { Switch } from '../../components/ui/switch';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Users,
  FileText,
  Shield,
  Activity,
  Settings,
  Search,
  Eye,
  Edit,
  Trash2,
  UserX,
  Building2,
  ClipboardList,
  ScrollText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Lock,
  Server,
  Database,
  Zap,
  UserCheck,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Archive,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import InactivityStatisticsPanel from '../../components/admin/InactivityStatisticsPanel';
import InactivityStatusBadge from '../../components/InactivityStatusBadge';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userFilters, setUserFilters] = useState({ role: 'all', status: 'all', search: '' });
  const [usersPage, setUsersPage] = useState(0);
  
  const [claims, setClaims] = useState([]);
  const [claimsTotal, setClaimsTotal] = useState(0);
  const [claimFilters, setClaimFilters] = useState({ status: 'all' });
  const [claimsPage, setClaimsPage] = useState(0);
  
  const [partners, setPartners] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsTotal, setAuditLogsTotal] = useState(0);
  const [auditFilters, setAuditFilters] = useState({ event_type: 'all' });
  const [auditPage, setAuditPage] = useState(0);
  
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserData, setEditUserData] = useState({});

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    loadDashboardStats();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'claims') loadClaims();
    if (activeTab === 'partners') loadPartners();
    if (activeTab === 'audit') loadAuditLogs();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab, userFilters, usersPage, claimFilters, claimsPage, auditFilters, auditPage]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userFilters.role !== 'all') params.append('role', userFilters.role);
      if (userFilters.status !== 'all') params.append('status', userFilters.status);
      if (userFilters.search) params.append('search', userFilters.search);
      params.append('limit', '20');
      params.append('offset', String(usersPage * 20));
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users || []);
      setUsersTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    }
  };

  const loadClaims = async () => {
    try {
      const params = new URLSearchParams();
      if (claimFilters.status !== 'all') params.append('status', claimFilters.status);
      params.append('limit', '20');
      params.append('offset', String(claimsPage * 20));
      
      const response = await api.get(`/admin/claims?${params.toString()}`);
      setClaims(response.data.claims || []);
      setClaimsTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to load claims:', error);
      toast.error('Failed to load claims');
    }
  };

  const loadPartners = async () => {
    try {
      const response = await api.get('/admin/partners');
      setPartners(response.data.partners || []);
    } catch (error) {
      console.error('Failed to load partners:', error);
      toast.error('Failed to load partners');
    }
  };

  const loadAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.event_type !== 'all') params.append('event_type', auditFilters.event_type);
      params.append('limit', '50');
      params.append('offset', String(auditPage * 50));
      
      const response = await api.get(`/admin/audit-logs?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
      setAuditLogsTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      toast.error('Failed to load audit logs');
    }
  };

  const loadSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      await api.put(`/admin/users/${selectedUser.id}`, editUserData);
      toast.success('User updated successfully');
      setEditUserDialog(false);
      setSelectedUser(null);
      setEditUserData({});
      loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(error.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleSuspendUser = async (userId, suspend) => {
    try {
      await api.put(`/admin/users/${userId}`, { is_suspended: suspend });
      toast.success(suspend ? 'User suspended' : 'User reactivated');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleTogglePartner = async (partnerId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.put(`/admin/partners/${partnerId}/status?status=${newStatus}`);
      toast.success(`Partner ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      loadPartners();
    } catch (error) {
      toast.error('Failed to update partner status');
    }
  };

  const handleUpdateSettings = async (key, value) => {
    if (user?.role !== 'super_admin') {
      toast.error('Only super admins can change system settings');
      return;
    }
    
    setSettingsLoading(true);
    try {
      await api.put('/admin/settings', { [key]: value });
      toast.success('Settings updated successfully');
      loadSettings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const openEditUserDialog = (userToEdit) => {
    setSelectedUser(userToEdit);
    setEditUserData({
      role: userToEdit.role,
      mfa_enabled: userToEdit.mfa_enabled,
      is_suspended: userToEdit.is_suspended
    });
    setEditUserDialog(true);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      veteran: 'bg-blue-500',
      peer_mentor: 'bg-green-500',
      veteran_advocate: 'bg-green-500',
      claims_agent: 'bg-purple-500',
      partner_admin: 'bg-orange-500',
      admin: 'bg-red-500',
      super_admin: 'bg-red-700'
    };
    return colors[role] || 'bg-gray-500';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      new: 'bg-blue-500',
      in_review: 'bg-yellow-500',
      evidence_needed: 'bg-orange-500',
      qa_pending: 'bg-purple-500',
      ready_to_submit: 'bg-cyan-500',
      submitted: 'bg-indigo-500',
      approved: 'bg-green-500',
      denied: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getHealthIcon = (status) => {
    if (status === 'healthy') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === 'degraded') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  if (loading) {
    return (
      <AgentLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded" />
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
              <Shield className="h-6 w-6 text-[#1B3A5F]" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">System administration and management</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadDashboardStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Claims
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Partners
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="retention" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Retention
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-bold">{dashboardStats?.total_users || 0}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Claims</p>
                      <p className="text-3xl font-bold">{dashboardStats?.total_claims || 0}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Accreditations</p>
                      <p className="text-3xl font-bold">{dashboardStats?.pending_accreditations || 0}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Partners</p>
                      <p className="text-3xl font-bold">{dashboardStats?.active_partners || 0}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Role Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dashboardStats?.role_breakdown || {}).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleBadgeColor(role)}>{role}</Badge>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Claims by Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {Object.entries(dashboardStats?.claims_by_status || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <Badge className={getStatusBadgeColor(status)}>{status.replace(/_/g, ' ')}</Badge>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {Object.entries(dashboardStats?.system_health || {}).map(([service, status]) => (
                    <div key={service} className="flex items-center gap-3 p-3 rounded-lg border">
                      {getHealthIcon(status)}
                      <div>
                        <p className="font-medium capitalize">{service}</p>
                        <p className="text-sm text-muted-foreground capitalize">{status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={userFilters.search}
                      onChange={(e) => {
                        setUserFilters({ ...userFilters, search: e.target.value });
                        setUsersPage(0);
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={userFilters.role}
                    onValueChange={(value) => {
                      setUserFilters({ ...userFilters, role: value });
                      setUsersPage(0);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="veteran">Veterans</SelectItem>
                      <SelectItem value="peer_mentor">Advocates</SelectItem>
                      <SelectItem value="claims_agent">Agents</SelectItem>
                      <SelectItem value="partner_admin">Partners</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={userFilters.status}
                    onValueChange={(value) => {
                      setUserFilters({ ...userFilters, status: value });
                      setUsersPage(0);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>MFA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{u.first_name} {u.last_name}</p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(u.role)}>{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            {u.mfa_enabled ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Lock className="h-3 w-3 mr-1" /> Enabled
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {u.is_suspended ? (
                                <Badge variant="destructive">Suspended</Badge>
                              ) : (
                                <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                              )}
                              <InactivityStatusBadge
                                status={u.inactivity_status}
                                daysInactive={u.days_inactive}
                                daysUntilArchive={u.days_until_archive}
                                isArchived={u.is_archived}
                                showTooltip={true}
                                size="small"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {u.last_login ? format(new Date(u.last_login), 'MMM d, yyyy') : 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openEditUserDialog(u)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSuspendUser(u.id, !u.is_suspended)}
                              >
                                {u.is_suspended ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                              </Button>
                              {user?.role === 'super_admin' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteUser(u.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {users.length} of {usersTotal} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUsersPage(Math.max(0, usersPage - 1))}
                      disabled={usersPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUsersPage(usersPage + 1)}
                      disabled={(usersPage + 1) * 20 >= usersTotal}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Claims Management</CardTitle>
                <CardDescription>View and manage all claims across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <Select
                    value={claimFilters.status}
                    onValueChange={(value) => {
                      setClaimFilters({ ...claimFilters, status: value });
                      setClaimsPage(0);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="evidence_needed">Evidence Needed</SelectItem>
                      <SelectItem value="qa_pending">QA Pending</SelectItem>
                      <SelectItem value="ready_to_submit">Ready to Submit</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Veteran</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Conditions</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No claims found
                        </TableCell>
                      </TableRow>
                    ) : (
                      claims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-mono text-sm">{claim.id?.slice(-8)}</TableCell>
                          <TableCell>{claim.veteran_name}</TableCell>
                          <TableCell className="capitalize">{claim.claim_type}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(claim.status)}>
                              {claim.status?.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{claim.conditions_count}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {claim.created_at ? format(new Date(claim.created_at), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/claim/${claim.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {claims.length} of {claimsTotal} claims
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setClaimsPage(Math.max(0, claimsPage - 1))}
                      disabled={claimsPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setClaimsPage(claimsPage + 1)}
                      disabled={(claimsPage + 1) * 20 >= claimsTotal}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Partner Organizations</CardTitle>
                <CardDescription>Manage VSOs, law firms, and other partner organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active Veterans</TableHead>
                      <TableHead>Admin Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No partner organizations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      partners.map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell className="font-medium">{partner.name}</TableCell>
                          <TableCell className="capitalize">{partner.type}</TableCell>
                          <TableCell>
                            <Badge className={partner.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                              {partner.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{partner.veteran_count}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{partner.admin_email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {partner.created_at ? format(new Date(partner.created_at), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Switch
                                checked={partner.status === 'active'}
                                onCheckedChange={() => handleTogglePartner(partner.id, partner.status)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform-wide settings and security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings && (
                  <>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Session Timeout</p>
                          <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={settings.session_timeout_minutes}
                          onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) })}
                          className="w-20"
                          min={5}
                          max={120}
                        />
                        <span className="text-sm text-muted-foreground">minutes</span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={settingsLoading || user?.role !== 'super_admin'}
                          onClick={() => handleUpdateSettings('session_timeout_minutes', settings.session_timeout_minutes)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">MFA Enforcement</p>
                          <p className="text-sm text-muted-foreground">Require MFA for all admin users</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.mfa_enforcement_enabled}
                        disabled={settingsLoading || user?.role !== 'super_admin'}
                        onCheckedChange={(checked) => handleUpdateSettings('mfa_enforcement_enabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Server className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Maintenance Mode</p>
                          <p className="text-sm text-muted-foreground">Disable platform access for non-admins</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.maintenance_mode}
                        disabled={settingsLoading || user?.role !== 'super_admin'}
                        onCheckedChange={(checked) => handleUpdateSettings('maintenance_mode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Zap className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">API Rate Limit</p>
                          <p className="text-sm text-muted-foreground">Requests per minute per user</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={settings.api_rate_limit}
                          onChange={(e) => setSettings({ ...settings, api_rate_limit: parseInt(e.target.value) })}
                          className="w-20"
                          min={10}
                          max={1000}
                        />
                        <span className="text-sm text-muted-foreground">req/min</span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={settingsLoading || user?.role !== 'super_admin'}
                          onClick={() => handleUpdateSettings('api_rate_limit', settings.api_rate_limit)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Environment</p>
                          <p className="text-sm text-muted-foreground">Current deployment environment</p>
                        </div>
                      </div>
                      <Badge variant="outline">{settings.environment}</Badge>
                    </div>
                  </>
                )}

                {user?.role !== 'super_admin' && (
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                      Only super admins can modify system settings.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>View system events, security logs, and PHI access records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <Select
                    value={auditFilters.event_type}
                    onValueChange={(value) => {
                      setAuditFilters({ ...auditFilters, event_type: value });
                      setAuditPage(0);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="security">Security Events</SelectItem>
                      <SelectItem value="phi_access">PHI Access</SelectItem>
                      <SelectItem value="system">System Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {log.timestamp ? format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss') : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.user_id?.slice(-8) || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{log.ip_address || '-'}</TableCell>
                          <TableCell>
                            {log.success ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {JSON.stringify(log.details)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {auditLogs.length} of {auditLogsTotal} logs
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAuditPage(Math.max(0, auditPage - 1))}
                      disabled={auditPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAuditPage(auditPage + 1)}
                      disabled={(auditPage + 1) * 50 >= auditLogsTotal}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <InactivityStatisticsPanel />
          </TabsContent>
        </Tabs>

        <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user role and settings for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editUserData.role}
                  onValueChange={(value) => setEditUserData({ ...editUserData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veteran">Veteran</SelectItem>
                    <SelectItem value="peer_mentor">Peer Mentor</SelectItem>
                    <SelectItem value="claims_agent">Claims Agent</SelectItem>
                    <SelectItem value="partner_admin">Partner Admin</SelectItem>
                    {user?.role === 'super_admin' && (
                      <>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Suspended</Label>
                <Switch
                  checked={editUserData.is_suspended}
                  onCheckedChange={(checked) => setEditUserData({ ...editUserData, is_suspended: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUserDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AgentLayout>
  );
}
