import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EngagementPreferences from '../components/EngagementPreferences';
import DataExportCard from '../components/settings/DataExportCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../lib/auth-context';
import VeteranLayout from '../components/VeteranLayout';
import AdvocateLayout from '../components/AdvocateLayout';
import { Settings as SettingsIcon, MessageSquare, Bell, Shield, User, Download, Trash2, AlertTriangle, Power, UserX, UserCheck, CheckCircle, Clock } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('engagement');
  const isAdvocate = user?.role === 'veteran_advocate' || user?.role === 'advocate' || user?.role === 'peer_mentor' || user?.role === 'peer_supporter';
  const Layout = isAdvocate ? AdvocateLayout : VeteranLayout;
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Account management state
  const [accountStatus, setAccountStatus] = useState(null); // null | { status, createdAt, deactivatedAt, consent }
  const [accountLoading, setAccountLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const userId = user?.user_id || user?.id;

  const loadAccountStatus = async () => {
    if (!userId) return;
    setAccountLoading(true);
    try {
      const res = await api.get(`/veterans/${userId}`);
      setAccountStatus(res.data.data);
    } catch {
      setAccountStatus(null);
    } finally {
      setAccountLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!userId) return;
    setActivating(true);
    try {
      await api.post('/veterans', { veteranId: userId });
      toast.success('Account activated successfully.');
      await loadAccountStatus();
    } catch {
      toast.error('Failed to activate account.');
    } finally {
      setActivating(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivate) { setConfirmDeactivate(true); return; }
    if (!userId) return;
    setDeactivating(true);
    try {
      await api.delete(`/veterans/${userId}`);
      toast.success('Account deactivated. All VA API access has been revoked.');
      setConfirmDeactivate(false);
      await loadAccountStatus();
    } catch {
      toast.error('Failed to deactivate account.');
    } finally {
      setDeactivating(false);
    }
  };

  const handleResetData = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setResetting(true);
    try {
      await api.post('/users/full-reset');
      toast.success('All veteran data cleared. Starting fresh!');
      localStorage.removeItem('onboarding_completed');
      setTimeout(() => navigate('/onboarding'), 800);
    } catch {
      toast.error('Failed to reset data. Please try again.');
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-full bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${isAdvocate ? 'from-emerald-600 to-emerald-700' : 'from-[#1B3A5F] to-[#2C5282]'} rounded-xl flex items-center justify-center`}>
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              Settings
            </h1>
            <p className="text-slate-600 mt-1">Manage your preferences and account settings</p>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === 'account') loadAccountStatus(); }}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Communication</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Power className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="engagement">
              <EngagementPreferences onSaved={() => {}} />
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Touchpoint Reminders</p>
                      <p className="text-sm text-muted-foreground">Get reminded before scheduled meetings</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Claim Updates</p>
                      <p className="text-sm text-muted-foreground">Be notified of claim status changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/mfa-setup')}>
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground">Update your account password</p>
                    </div>
                    <Button variant="outline">
                      Update
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">View and manage your active sessions</p>
                    </div>
                    <Button variant="outline">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <p className="font-medium capitalize">{user?.role?.replace('_', ' ')}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Veteran Status</p>
                    <p className="font-medium">{user?.veteran_status ? 'Verified' : 'Pending Verification'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <DataExportCard />

              {/* Dev / Testing: Reset Data */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Reset Testing Data
                  </CardTitle>
                  <CardDescription>
                    Delete all your claims, conditions, and uploaded documents so you can test the full flow from scratch. This cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {confirmReset && (
                    <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      Are you sure? This will delete all your claims, conditions, documents, and reset onboarding.
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleResetData}
                      disabled={resetting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {resetting ? 'Resetting...' : confirmReset ? 'Yes, Reset Everything' : 'Reset All Data'}
                    </Button>
                    {confirmReset && (
                      <Button variant="outline" size="sm" onClick={() => setConfirmReset(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Power className="h-5 w-5 text-[#1B3A5F]" />
                    VA Account Status
                  </CardTitle>
                  <CardDescription>
                    Manage your VA API access and account activation. Deactivating your account immediately revokes all VA API tokens and blocks further VA data access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accountLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                      <Clock className="h-4 w-4 animate-spin" /> Loading account status...
                    </div>
                  ) : accountStatus ? (
                    <>
                      {/* Status banner */}
                      <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                        accountStatus.account.status === 'active'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        {accountStatus.account.status === 'active'
                          ? <UserCheck className="h-6 w-6 text-green-600 flex-shrink-0" />
                          : <UserX className="h-6 w-6 text-red-600 flex-shrink-0" />
                        }
                        <div>
                          <p className={`font-semibold ${accountStatus.account.status === 'active' ? 'text-green-900' : 'text-red-900'}`}>
                            Account {accountStatus.account.status === 'active' ? 'Active' : 'Deactivated'}
                          </p>
                          <p className="text-sm text-slate-600">
                            {accountStatus.account.status === 'active'
                              ? 'VA API access is enabled. You can authorize data sharing with the VA.'
                              : `Deactivated on ${new Date(accountStatus.account.deactivatedAt).toLocaleDateString()}. All VA API calls are blocked.`}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border rounded-lg bg-slate-50">
                          <p className="text-xs text-slate-500 mb-1">Account Created</p>
                          <p className="text-sm font-medium">{new Date(accountStatus.account.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="p-3 border rounded-lg bg-slate-50">
                          <p className="text-xs text-slate-500 mb-1">VA Token</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            {accountStatus.consent?.hasActiveToken
                              ? <><CheckCircle className="h-3.5 w-3.5 text-green-600" /> Active</>
                              : <><UserX className="h-3.5 w-3.5 text-slate-400" /> None / Expired</>}
                          </p>
                        </div>
                        {accountStatus.consent?.scopes?.length > 0 && (
                          <div className="col-span-2 p-3 border rounded-lg bg-slate-50">
                            <p className="text-xs text-slate-500 mb-1">Authorized Scopes</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {accountStatus.consent.scopes.map(s => (
                                <span key={s} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {accountStatus.account.status === 'active' ? (
                        <div className="pt-2 space-y-2">
                          {/* Connect to VA OAuth */}
                          {!accountStatus.consent?.hasActiveToken && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm font-medium text-blue-800 mb-2">Connect to VA Lighthouse</p>
                              <p className="text-xs text-blue-600 mb-3">Authorize EarnedIT to access your VA records via OAuth 2.0. You'll be redirected to VA's secure login.</p>
                              <Button
                                size="sm"
                                className="bg-blue-700 hover:bg-blue-800 text-white"
                                onClick={() => {
                                  const userId = user?.user_id || user?.id;
                                  window.location.href = `/api/va/oauth/authorize?userId=${userId}`;
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Connect VA Account (OAuth)
                              </Button>
                            </div>
                          )}
                          {confirmDeactivate && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              This will immediately revoke all VA OAuth tokens and block all VA API access. Are you sure?
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button variant="destructive" size="sm" onClick={handleDeactivate} disabled={deactivating}>
                              <UserX className="h-4 w-4 mr-2" />
                              {deactivating ? 'Deactivating...' : confirmDeactivate ? 'Yes, Deactivate Account' : 'Deactivate Account'}
                            </Button>
                            {confirmDeactivate && (
                              <Button variant="outline" size="sm" onClick={() => setConfirmDeactivate(false)}>Cancel</Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" onClick={handleActivate} disabled={activating} className="bg-green-600 hover:bg-green-700 text-white">
                          <UserCheck className="h-4 w-4 mr-2" />
                          {activating ? 'Activating...' : 'Reactivate Account'}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        No VA account found. Activate your account to enable VA API access and data sharing authorization.
                      </div>
                      <Button size="sm" onClick={handleActivate} disabled={activating} className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white">
                        <UserCheck className="h-4 w-4 mr-2" />
                        {activating ? 'Activating...' : 'Activate VA Account'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
