import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import AdvocateLayout from '../components/AdvocateLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import { 
  Shield, 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Star,
  Calendar,
  FileText,
  Bell,
  UserPlus,
  Activity,
  ArrowRight,
  HandHeart,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import VeteranMilestoneAlerts from '../components/VeteranMilestoneAlerts';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/peer-support/profile');
      
      let assignmentsList = [];
      let invitationsList = [];
      
      try {
        const assignmentsRes = await api.get('/peer-support/my-assignments');
        assignmentsList = assignmentsRes.data.assignments || [];
      } catch (e) {}
      
      try {
        const invitationsRes = await api.get('/peer-support/pending-invitations');
        invitationsList = invitationsRes.data.invitations || [];
      } catch (e) {}
      
      setProfile(profileRes.data);
      setPendingInvitations(invitationsList);
      
      const formattedMentorships = assignmentsList.map(a => ({
        mentorship_id: a.id,
        veteran_id: a.veteran?.id,
        veteran_name: a.veteran?.first_name,
        status: a.status,
        started_at: a.assigned_at,
        tier: a.tier,
        consent: a.consent,
        claim_stage: a.claim_stage,
        claim_status: a.claim_status,
        claim_progress: a.claim_progress || 0,
        progress_estimated: a.progress_estimated,
        has_claim: a.claim_stage !== null && a.claim_stage !== undefined
      }));
      setMentorships(formattedMentorships);
      
      const activeCount = assignmentsList.filter(m => m.status === 'active').length;
      const completedCount = assignmentsList.filter(m => m.status === 'completed' || m.status === 'ended').length;
      const pendingCount = invitationsList.length;
      setStats({
        active: activeCount,
        completed: completedCount,
        pending: pendingCount,
        rating: profileRes.data.average_rating || 4.8,
        total: profileRes.data.total_veterans_helped || activeCount + completedCount
      });

      const activities = [
        ...invitationsList.slice(0, 2).map(inv => ({
          id: inv.id,
          type: 'invitation',
          message: `New support request from ${inv.veteran?.first_name || 'a veteran'}`,
          time: inv.requested_at || new Date().toISOString(),
          icon: UserPlus
        })),
        ...assignmentsList.slice(0, 3).map(a => ({
          id: a.id,
          type: 'mentorship',
          message: `${a.veteran?.first_name || 'Veteran'} - ${a.status === 'active' ? 'Claim in progress' : 'Claim updated'}`,
          time: a.assigned_at || new Date().toISOString(),
          icon: Activity
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (invitationId) => {
    try {
      const res = await api.post(`/peer-support/invitation/${invitationId}/accept`);
      toast.success(res.data.message || 'Invitation accepted! You can now start supporting.');
      loadDashboardData();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to accept invitation';
      toast.error(errorMsg);
    }
  };

  const handleDeclineMatch = async (invitationId) => {
    try {
      const res = await api.post(`/peer-support/invitation/${invitationId}/decline`);
      toast.success(res.data.message || 'Invitation declined');
      loadDashboardData();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to decline invitation';
      toast.error(errorMsg);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <AdvocateLayout>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AdvocateLayout>
    );
  }

  const advocateName = user?.name || user?.first_name || profile?.name || 'Advocate';

  return (
    <AdvocateLayout>
      <div className="p-4 lg:p-6 space-y-6" data-testid="mentor-dashboard">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {advocateName}!</h1>
              <p className="text-emerald-100 mt-1">
                You're making a difference. Here's your advocacy overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                  <span className="font-semibold text-lg">{stats?.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-emerald-100 text-sm">rating</span>
                </div>
              </div>
              {stats?.pending > 0 && (
                <Badge className="bg-amber-500 text-white hover:bg-amber-600 px-3 py-1">
                  <Bell className="h-4 w-4 mr-1" />
                  {stats.pending} pending
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow" data-testid="stat-card-active">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Veterans</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.active || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow" data-testid="stat-card-pending">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.pending || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow" data-testid="stat-card-rating">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-3xl font-bold text-slate-900">{stats?.rating?.toFixed(1) || '0.0'}</p>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow" data-testid="stat-card-total">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Veterans Helped</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.total || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <HandHeart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks you can do right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:border-emerald-300"
                onClick={() => window.location.href = '/messages'}
              >
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <span className="text-sm">Messages</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => window.location.href = '/advocate/calendar'}
              >
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Schedule</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={() => window.location.href = '/advocate/cases'}
              >
                <ClipboardList className="h-5 w-5 text-[#1B3A5F]" />
                <span className="text-sm">View Cases</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-amber-50 hover:border-amber-300"
                onClick={() => window.location.href = '/advocate/veterans'}
              >
                <Users className="h-5 w-5 text-amber-600" />
                <span className="text-sm">My Veterans</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="veterans" className="space-y-4">
              <TabsList className="bg-slate-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="veterans" 
                  data-testid="tab-mentorships"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Active Veterans ({mentorships.filter(m => m.status === 'active').length})
                </TabsTrigger>
                <TabsTrigger 
                  value="invitations" 
                  data-testid="tab-invitations"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Pending ({pendingInvitations.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="veterans" data-testid="mentorships-content">
                <Card>
                  <CardContent className="p-0">
                    {mentorships.filter(m => m.status === 'active').length === 0 ? (
                      <div className="text-center py-12 px-6">
                        <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                          <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No active veterans</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Accept an invitation to start supporting veterans
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {mentorships
                          .filter(m => m.status === 'active')
                          .map((mentorship) => (
                            <div key={mentorship.mentorship_id} className="p-4 hover:bg-slate-50 transition-colors" data-testid="mentorship-card">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-11 w-11 bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold">
                                  {mentorship.veteran_name?.charAt(0) || 'V'}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-slate-900">
                                      {mentorship.veteran_name || `Veteran #${mentorship.veteran_id?.slice(-6)}`}
                                    </h4>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                      Active
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      Started {new Date(mentorship.started_at).toLocaleDateString()}
                                    </span>
                                    {mentorship.tier && (
                                      <span className="capitalize">{mentorship.tier.replace('_', ' ')}</span>
                                    )}
                                  </div>
                                  {mentorship.has_claim ? (
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          {mentorship.claim_stage ? 
                                            `Stage: ${mentorship.claim_stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : 
                                            'Claim Progress'}
                                          {mentorship.progress_estimated && (
                                            <span className="ml-1 text-xs text-amber-600">(est.)</span>
                                          )}
                                        </span>
                                        <span className="font-medium text-slate-900">{mentorship.claim_progress}%</span>
                                      </div>
                                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full ${mentorship.progress_estimated ? 'bg-amber-400' : getProgressColor(mentorship.claim_progress)} transition-all duration-300`}
                                          style={{ width: `${mentorship.claim_progress}%` }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground italic">
                                      No active claim started yet
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => window.location.href = `/messages?veteran=${mentorship.veteran_id}`}
                                  data-testid="message-veteran-button"
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Message
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invitations" data-testid="invitations-content">
                <Card>
                  <CardContent className="p-0">
                    {pendingInvitations.length === 0 ? (
                      <div className="text-center py-12 px-6">
                        <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                          <Bell className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No pending invitations</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          When veterans request your support, they'll appear here
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {pendingInvitations.map((invitation) => (
                          <div key={invitation.id} className="p-4" data-testid="invitation-card">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-11 w-11 bg-amber-100 text-amber-600 flex items-center justify-center">
                                <UserPlus className="h-5 w-5" />
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-slate-900">
                                    {invitation.veteran?.first_name || 'Veteran'} needs support
                                  </h4>
                                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                                    {invitation.requested_tier?.replace('_', ' ') || 'General'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {invitation.reason || 'Requesting advocacy support for VA claims'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Requested {invitation.requested_at ? formatTimeAgo(invitation.requested_at) : 'recently'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptMatch(invitation.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  data-testid="accept-invitation-button"
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeclineMatch(invitation.id)}
                                  data-testid="decline-invitation-button"
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <VeteranMilestoneAlerts maxItems={6} showHeader={true} compact={false} />
          </div>
        </div>
      </div>
    </AdvocateLayout>
  );
}
