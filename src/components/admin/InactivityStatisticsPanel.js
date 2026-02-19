import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Archive, 
  RefreshCw, 
  Play,
  UserCheck,
  Mail,
  CheckCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const InactivityStatisticsPanel = () => {
  const [statistics, setStatistics] = useState(null);
  const [inactiveVeterans, setInactiveVeterans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningCleanup, setRunningCleanup] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/veteran-retention/statistics');
      if (response.data?.success) {
        setStatistics(response.data.statistics);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch inactivity statistics:', err);
      setError('Unable to load inactivity statistics. Please try again.');
    }
  };

  const fetchInactiveVeterans = async (filter = 'warning') => {
    try {
      const response = await api.get('/veteran-retention/inactive-veterans', {
        params: { status_filter: filter, limit: 50 }
      });
      if (response.data?.success) {
        setInactiveVeterans(response.data.veterans);
      }
    } catch (error) {
      console.error('Failed to fetch inactive veterans:', error);
    }
  };

  const runCleanup = async (dryRun = true) => {
    setRunningCleanup(true);
    try {
      const response = await api.post('/veteran-retention/run-cleanup', {
        dry_run: dryRun,
        send_warnings: true
      });
      
      if (response.data?.success) {
        const report = response.data.report || {};
        toast({
          title: dryRun ? 'Dry Run Complete' : 'Cleanup Started',
          description: dryRun 
            ? `Would send ${report.warnings_sent || 0} warnings and archive ${report.veterans_archived || 0} records.`
            : 'Cleanup job is running in the background.',
        });
        
        if (!dryRun) {
          setTimeout(() => {
            fetchStatistics();
            fetchInactiveVeterans('warning');
          }, 2000);
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to run cleanup process.',
      });
    } finally {
      setRunningCleanup(false);
    }
  };

  const reactivateVeteran = async (userId) => {
    try {
      const response = await api.post('/veteran-retention/reactivate', {
        user_id: userId
      });
      
      if (response.data?.success) {
        toast({
          title: 'Veteran Reactivated',
          description: 'The veteran record has been reactivated.',
        });
        fetchInactiveVeterans(activeTab === 'archived' ? 'archived' : 'warning');
        fetchStatistics();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reactivate veteran record.',
      });
    }
  };

  const sendWarning = async (userId) => {
    try {
      const response = await api.post(`/veteran-retention/send-warning/${userId}`);
      
      if (response.data?.success) {
        toast({
          title: 'Warning Sent',
          description: 'Inactivity warning email has been sent.',
        });
        fetchInactiveVeterans('warning');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send warning email.',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStatistics(),
        fetchInactiveVeterans('warning')
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'archived') {
      fetchInactiveVeterans('archived');
    } else if (activeTab === 'inactive') {
      fetchInactiveVeterans('warning');
    }
  }, [activeTab]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error && !statistics) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex items-center gap-3 py-8">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-medium text-red-700">{error}</p>
            <p className="text-sm text-red-600">Inactivity data could not be loaded.</p>
          </div>
          <Button variant="outline" onClick={() => { setLoading(true); Promise.all([fetchStatistics(), fetchInactiveVeterans('warning')]).finally(() => setLoading(false)); }} className="ml-auto">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Veteran Inactivity Management
          </CardTitle>
          <CardDescription>
            HIPAA-compliant veteran record lifecycle management. Records are archived after {statistics?.archive_threshold_days || 730} days of inactivity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{statistics?.active_veterans || 0}</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Approaching Warning</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{statistics?.approaching_warning || 0}</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Ready for Archive</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{statistics?.ready_for_archive || 0}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Archive className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Archived</span>
              </div>
              <p className="text-2xl font-bold text-gray-600">{statistics?.archived_veterans || 0}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => runCleanup(true)}
              disabled={runningCleanup}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${runningCleanup ? 'animate-spin' : ''}`} />
              Preview Cleanup (Dry Run)
            </Button>
            <Button 
              onClick={() => runCleanup(false)}
              disabled={runningCleanup}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Cleanup
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Veteran Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Retention Policy</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Warning sent after {statistics?.warning_threshold_days || 365} days of inactivity</li>
                    <li>Records archived after {statistics?.archive_threshold_days || 730} days of inactivity</li>
                    <li>Archived records retained for {statistics?.hipaa_minimum_retention_years || 6} years per HIPAA requirements</li>
                    <li>Veterans can reactivate their accounts by logging in</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="inactive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Days Inactive</TableHead>
                    <TableHead>Warning Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveVeterans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No inactive veterans found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    inactiveVeterans.map((veteran) => (
                      <TableRow key={veteran.user_id}>
                        <TableCell>{veteran.first_name} {veteran.last_name}</TableCell>
                        <TableCell>{veteran.email}</TableCell>
                        <TableCell>
                          {veteran.last_activity_at 
                            ? new Date(veteran.last_activity_at).toLocaleDateString() 
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={veteran.days_inactive > 730 ? 'destructive' : 'secondary'}>
                            {veteran.days_inactive} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {veteran.warning_sent ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!veteran.warning_sent && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => sendWarning(veteran.user_id)}
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Send Warning
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="archived">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Archived At</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveVeterans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No archived veterans found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    inactiveVeterans.map((veteran) => (
                      <TableRow key={veteran.user_id}>
                        <TableCell>{veteran.first_name} {veteran.last_name}</TableCell>
                        <TableCell>{veteran.email}</TableCell>
                        <TableCell>
                          {veteran.archived_at 
                            ? new Date(veteran.archived_at).toLocaleDateString() 
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{veteran.archive_reason || 'Inactivity'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => reactivateVeteran(veteran.user_id)}
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Reactivate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InactivityStatisticsPanel;
