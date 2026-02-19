import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/auth-context';
import api from '../../lib/api';
import AgentLayout from '../../components/AgentLayout';
import ImpactReportCard from '../../components/ImpactReportCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import {
  BarChart3,
  Calendar,
  RefreshCw,
  Download,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Award,
  Target,
  PieChart,
  Activity,
} from 'lucide-react';
import {
  MetricCard,
  AgentProductivityTable,
  StatusBreakdownChart,
  DailyTrendChart,
  OutcomesSummary,
  FeeComplianceSummary,
} from '../../components/analytics';

export default function MetricsReports() {
  const { user } = useAuth();
  const [mainTab, setMainTab] = useState('analytics');
  const [analyticsTab, setAnalyticsTab] = useState('productivity');
  const [impactTab, setImpactTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const [dateRange, setDateRange] = useState('30');
  const [productivityData, setProductivityData] = useState(null);
  const [outcomesData, setOutcomesData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  
  const [periodType, setPeriodType] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [report, setReport] = useState(null);
  const [previousReport, setPreviousReport] = useState(null);
  const [organizationReport, setOrganizationReport] = useState(null);
  const [platformReport, setPlatformReport] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);

  const userRole = user?.role || '';
  const userId = user?.user_id || user?.id || '';
  const isAdmin = userRole === 'admin';
  const isClaimsAgent = userRole === 'claims_agent';
  const isVetAdvocate = userRole === 'vet_advocate' || userRole === 'veteran_advocate';
  const isPartner = userRole === 'partner' || userRole === 'vso_staff';

  const getAnalyticsDateRange = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(dateRange));
    return {
      start_date: start.toISOString(),
      end_date: end.toISOString()
    };
  }, [dateRange]);

  const getImpactDateRange = (date, type) => {
    const start = new Date(date);
    let end;
    if (type === 'quarterly') {
      const quarter = Math.floor(start.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      end = new Date(start);
      end.setMonth(end.getMonth() + 3, 0);
    } else {
      start.setDate(1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    }
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const getPreviousImpactDateRange = (date, type) => {
    const prevDate = new Date(date);
    if (type === 'quarterly') {
      prevDate.setMonth(prevDate.getMonth() - 3);
    } else {
      prevDate.setMonth(prevDate.getMonth() - 1);
    }
    return getImpactDateRange(prevDate, type);
  };

  const loadProductivity = useCallback(async () => {
    try {
      const { start_date, end_date } = getAnalyticsDateRange();
      const response = await api.get(`/analytics/productivity?start_date=${start_date}&end_date=${end_date}`);
      setProductivityData(response.data);
    } catch (error) {
      console.error('Failed to load productivity data:', error);
    }
  }, [getAnalyticsDateRange]);

  const loadOutcomes = useCallback(async () => {
    try {
      const { start_date, end_date } = getAnalyticsDateRange();
      const response = await api.get(`/analytics/outcomes?start_date=${start_date}&end_date=${end_date}`);
      setOutcomesData(response.data);
    } catch (error) {
      console.error('Failed to load outcomes data:', error);
    }
  }, [getAnalyticsDateRange]);

  const loadFeeCompliance = useCallback(async () => {
    try {
      const { start_date, end_date } = getAnalyticsDateRange();
      const response = await api.get(`/analytics/fee-compliance?start_date=${start_date}&end_date=${end_date}`);
      setFeeData(response.data);
    } catch (error) {
      console.error('Failed to load fee compliance data:', error);
    }
  }, [getAnalyticsDateRange]);

  const loadImpactReports = useCallback(async () => {
    try {
      const { start, end } = getImpactDateRange(selectedDate, periodType);
      const prevRange = getPreviousImpactDateRange(selectedDate, periodType);
      const promises = [];

      if (isVetAdvocate) {
        promises.push(
          api.get(`/impact/advocate/${userId}`, {
            params: { period_type: periodType, start_date: start, end_date: end }
          }).catch(() => ({ data: { report: null } }))
        );
        promises.push(
          api.get(`/impact/advocate/${userId}`, {
            params: { period_type: periodType, start_date: prevRange.start, end_date: prevRange.end }
          }).catch(() => ({ data: { report: null } }))
        );
      } else if (isClaimsAgent) {
        promises.push(
          api.get(`/impact/agent/${userId}`, {
            params: { period_type: periodType, start_date: start, end_date: end }
          }).catch(() => ({ data: { report: null } }))
        );
        promises.push(
          api.get(`/impact/agent/${userId}`, {
            params: { period_type: periodType, start_date: prevRange.start, end_date: prevRange.end }
          }).catch(() => ({ data: { report: null } }))
        );
        if (user?.organization_id) {
          promises.push(
            api.get(`/impact/organization/${user.organization_id}`, {
              params: { period_type: periodType, start_date: start, end_date: end }
            }).catch(() => ({ data: { report: null } }))
          );
        }
      } else if (isPartner) {
        if (user?.organization_id) {
          promises.push(
            api.get(`/impact/organization/${user.organization_id}`, {
              params: { period_type: periodType, start_date: start, end_date: end }
            }).catch(() => ({ data: { report: null } }))
          );
          promises.push(
            api.get(`/impact/organization/${user.organization_id}`, {
              params: { period_type: periodType, start_date: prevRange.start, end_date: prevRange.end }
            }).catch(() => ({ data: { report: null } }))
          );
        }
      } else if (isAdmin) {
        promises.push(
          api.get('/impact/platform', {
            params: { period_type: periodType, start_date: start, end_date: end }
          }).catch(() => ({ data: { report: null } }))
        );
        promises.push(
          api.get('/impact/platform', {
            params: { period_type: periodType, start_date: prevRange.start, end_date: prevRange.end }
          }).catch(() => ({ data: { report: null } }))
        );
      }

      promises.push(
        api.get('/impact/history', { params: { limit: 10 } })
          .catch(() => ({ data: { reports: [] } }))
      );

      const results = await Promise.all(promises);

      if (isVetAdvocate || isClaimsAgent) {
        setReport(results[0]?.data?.report || null);
        setPreviousReport(results[1]?.data?.report || null);
        if (isClaimsAgent && user?.organization_id && results[2]) {
          setOrganizationReport(results[2]?.data?.report || null);
        }
      } else if (isPartner) {
        setReport(results[0]?.data?.report || null);
        setPreviousReport(results[1]?.data?.report || null);
      } else if (isAdmin) {
        setPlatformReport(results[0]?.data?.report || null);
        setReport(results[0]?.data?.report || null);
        setPreviousReport(results[1]?.data?.report || null);
      }

      const historyResult = results[results.length - 1];
      setReportHistory(historyResult?.data?.reports || []);
    } catch (error) {
      console.error('Failed to load impact reports:', error);
    }
  }, [selectedDate, periodType, userId, userRole, isVetAdvocate, isClaimsAgent, isPartner, isAdmin, user?.organization_id]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadProductivity(),
      loadOutcomes(),
      loadFeeCompliance(),
      loadImpactReports()
    ]);
    setLoading(false);
  }, [loadProductivity, loadOutcomes, loadFeeCompliance, loadImpactReports]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (mainTab === 'analytics') {
      loadProductivity();
      loadOutcomes();
      loadFeeCompliance();
    }
  }, [dateRange, mainTab]);

  useEffect(() => {
    if (mainTab === 'impact') {
      loadImpactReports();
    }
  }, [periodType, selectedDate, mainTab]);

  const handleExport = async (type) => {
    try {
      setExporting(true);
      const { start_date, end_date } = getAnalyticsDateRange();
      
      let endpoint = '';
      let filename = '';
      
      switch (type) {
        case 'productivity':
          endpoint = '/analytics/export/productivity';
          filename = 'productivity_report.csv';
          break;
        case 'outcomes':
          endpoint = '/analytics/export/outcomes';
          filename = 'outcomes_report.csv';
          break;
        case 'fee-compliance':
          endpoint = '/analytics/export/fee-compliance';
          filename = 'fee_compliance_report.csv';
          break;
        case 'billing':
          endpoint = '/analytics/export/billing';
          filename = 'billing_data.csv';
          break;
        default:
          return;
      }

      const response = await api.get(`${endpoint}?start_date=${start_date}&end_date=${end_date}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Exported ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleRegenerateImpactReport = async () => {
    try {
      setLoading(true);
      const { start, end } = getImpactDateRange(selectedDate, periodType);

      let endpoint;
      if (isVetAdvocate) {
        endpoint = `/api/impact/advocate/${userId}`;
      } else if (isClaimsAgent) {
        endpoint = `/api/impact/agent/${userId}`;
      } else if (isPartner && user?.organization_id) {
        endpoint = `/api/impact/organization/${user.organization_id}`;
      } else if (isAdmin) {
        endpoint = '/api/impact/platform';
      } else {
        toast.error('Unable to regenerate report for your role');
        return;
      }

      await api.get(endpoint, {
        params: { period_type: periodType, start_date: start, end_date: end, force_regenerate: true }
      });

      toast.success('Report regenerated successfully');
      await loadImpactReports();
    } catch (error) {
      console.error('Failed to regenerate report:', error);
      toast.error('Failed to regenerate report');
    } finally {
      setLoading(false);
    }
  };

  const navigatePeriod = (direction) => {
    const newDate = new Date(selectedDate);
    if (periodType === 'quarterly') {
      newDate.setMonth(newDate.getMonth() + (direction * 3));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
  };

  const formatPeriodLabel = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (periodType === 'quarterly') {
      const quarter = Math.floor(selectedDate.getMonth() / 3) + 1;
      return `Q${quarter} ${selectedDate.getFullYear()}`;
    }
    return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };

  const getRoleDisplayName = () => {
    if (isAdmin) return 'Platform Administrator';
    if (isClaimsAgent) return 'Claims Agent';
    if (isVetAdvocate) return 'Veteran Advocate';
    if (isPartner) return 'Partner Organization';
    return 'User';
  };

  if (loading && !productivityData && !report) {
    return (
      <AgentLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
              <BarChart3 className="h-7 w-7 text-[#1B3A5F]" />
              Metrics & Reports
            </h1>
            <p className="text-muted-foreground">
              {getRoleDisplayName()} - Performance Analytics & Impact Reports
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-4">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="impact" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Impact Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-40">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="180">Last 6 months</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(analyticsTab)}
                      disabled={exporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={analyticsTab} onValueChange={setAnalyticsTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="productivity" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Productivity
                </TabsTrigger>
                <TabsTrigger value="outcomes" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Outcomes
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Fee Compliance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="productivity" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Claims"
                    value={productivityData?.summary?.total_claims || 0}
                    subtitle="In selected period"
                    icon={FileText}
                    color="text-blue-600"
                  />
                  <MetricCard
                    title="Avg Turnaround"
                    value={`${productivityData?.summary?.avg_turnaround_days || 0} days`}
                    subtitle="From creation to submit"
                    icon={Clock}
                    color="text-purple-600"
                  />
                  <MetricCard
                    title="Active Agents"
                    value={productivityData?.summary?.agents_count || 0}
                    subtitle="With assigned claims"
                    icon={Users}
                    color="text-green-600"
                  />
                  <MetricCard
                    title="Date Range"
                    value={`${parseInt(dateRange)} days`}
                    subtitle="Selected period"
                    icon={Calendar}
                    color="text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle>Agent Performance</CardTitle>
                      <CardDescription>Claims processed by agent</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AgentProductivityTable agents={productivityData?.agents} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StatusBreakdownChart data={productivityData?.status_breakdown} />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Daily Activity</CardTitle>
                    <CardDescription>Claims created per day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DailyTrendChart data={productivityData?.daily_trend} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outcomes" className="space-y-6 mt-6">
                <OutcomesSummary data={outcomesData} />
              </TabsContent>

              <TabsContent value="compliance" className="space-y-6 mt-6">
                <FeeComplianceSummary data={feeData} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Period:</span>
                  </div>

                  <Select value={periodType} onValueChange={setPeriodType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigatePeriod(-1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[150px] text-center font-medium">
                      {formatPeriodLabel()}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigatePeriod(1)}
                      disabled={selectedDate >= new Date()}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1" />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerateImpactReport}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.info('PDF export coming soon')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={impactTab} onValueChange={setImpactTab} className="space-y-4">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="claims" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Claims
                </TabsTrigger>
                <TabsTrigger value="satisfaction" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Satisfaction
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {report ? (
                  <ImpactReportCard
                    report={report}
                    previousReport={previousReport}
                    category="all"
                  />
                ) : (
                  <Card className="border-slate-200">
                    <CardContent className="p-8 text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Report Available</h3>
                      <p className="text-muted-foreground mb-4">
                        No impact data found for the selected period.
                      </p>
                      <Button onClick={handleRegenerateImpactReport}>
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {isClaimsAgent && organizationReport && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Organization Report</h3>
                    <ImpactReportCard
                      report={organizationReport}
                      title="Organization-Wide Impact"
                      category="all"
                    />
                  </div>
                )}

                {isAdmin && platformReport && (
                  <div className="grid md:grid-cols-4 gap-4 mt-6">
                    <Card className="border-slate-200">
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto text-[#1B3A5F] mb-2" />
                        <div className="text-2xl font-bold">{platformReport.veterans_served || 0}</div>
                        <div className="text-sm text-muted-foreground">Veterans Served</div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                      <CardContent className="p-4 text-center">
                        <FileText className="h-8 w-8 mx-auto text-[#1B3A5F] mb-2" />
                        <div className="text-2xl font-bold">{platformReport.claims_submitted || 0}</div>
                        <div className="text-sm text-muted-foreground">Claims Submitted</div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                        <div className="text-2xl font-bold">{platformReport.approval_rate || 0}%</div>
                        <div className="text-sm text-muted-foreground">Approval Rate</div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                      <CardContent className="p-4 text-center">
                        <DollarSign className="h-8 w-8 mx-auto text-[#D4A574] mb-2" />
                        <div className="text-2xl font-bold">
                          ${(platformReport.total_back_pay_awarded || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Back Pay Awarded</div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="claims" className="space-y-4">
                {report ? (
                  <>
                    <ImpactReportCard
                      report={report}
                      previousReport={previousReport}
                      title="Claims Performance"
                      category="claims"
                    />
                    <ImpactReportCard
                      report={report}
                      previousReport={previousReport}
                      title="Financial Impact"
                      category="financial"
                    />
                  </>
                ) : (
                  <Card className="border-slate-200">
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No Claims Data Available</h3>
                      <p className="text-muted-foreground">
                        Claims metrics will appear here once data is available.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="satisfaction" className="space-y-4">
                {report ? (
                  <ImpactReportCard
                    report={report}
                    previousReport={previousReport}
                    title="Veteran Satisfaction Scores"
                    category="satisfaction"
                  />
                ) : (
                  <Card className="border-slate-200">
                    <CardContent className="p-8 text-center">
                      <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No Satisfaction Data Available</h3>
                      <p className="text-muted-foreground">
                        Satisfaction scores will appear here once surveys are completed.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Report History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reportHistory.length > 0 ? (
                      <div className="space-y-3">
                        {reportHistory.map((historyItem, index) => (
                          <div
                            key={historyItem.id || index}
                            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-[#1B3A5F]" />
                              <div>
                                <div className="font-medium">
                                  {historyItem.period_type === 'quarterly' ? 'Quarterly' : 'Monthly'} Report
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {historyItem.period_start && new Date(historyItem.period_start).toLocaleDateString()} - {historyItem.period_end && new Date(historyItem.period_end).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{historyItem.report_type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {historyItem.veterans_served || 0} veterans
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No Report History</h3>
                        <p className="text-muted-foreground">
                          Previously generated reports will appear here.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </AgentLayout>
  );
}
