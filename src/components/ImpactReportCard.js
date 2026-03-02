import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Users,
  MessageSquare,
  FileText,
  CheckCircle2,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Clock,
  BarChart3,
} from 'lucide-react';

const MetricItem = ({ label, value, icon: Icon, previousValue, format = 'number', highlight = false }) => {
  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    
    switch (format) {
      case 'percent':
        return `${val}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'score':
        return val.toFixed(1);
      case 'nps':
        return val > 0 ? `+${val}` : val.toString();
      case 'days':
        return `${val} days`;
      default:
        return typeof val === 'number' ? val.toLocaleString() : val;
    }
  };

  const getTrend = () => {
    if (previousValue === null || previousValue === undefined || value === null || value === undefined) {
      return null;
    }
    
    const diff = value - previousValue;
    if (diff > 0) return 'up';
    if (diff < 0) return 'down';
    return 'neutral';
  };

  const trend = getTrend();

  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-[#1B3A5F]/5 border-[#1B3A5F]/20' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-[#1B3A5F]" />}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'
          }`}>
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend === 'neutral' && <Minus className="h-3 w-3" />}
          </div>
        )}
      </div>
      <div className={`mt-2 text-2xl font-bold ${highlight ? 'text-[#1B3A5F]' : 'text-foreground'}`}>
        {formatValue(value)}
      </div>
      {previousValue !== undefined && previousValue !== null && (
        <div className="mt-1 text-xs text-muted-foreground">
          Previous: {formatValue(previousValue)}
        </div>
      )}
    </div>
  );
};

export default function ImpactReportCard({ report, previousReport, title, category = 'all' }) {
  if (!report) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPeriodHeader = () => {
    if (!report.period_start || !report.period_end) return 'Report Period';
    
    const start = new Date(report.period_start);
    const periodType = report.period_type === 'quarterly' ? 'Quarterly Report' : 'Monthly Report';
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    if (report.period_type === 'quarterly') {
      const quarter = Math.floor(start.getMonth() / 3) + 1;
      return `Q${quarter} ${start.getFullYear()} - ${periodType}`;
    }
    
    return `${monthNames[start.getMonth()]} ${start.getFullYear()} - ${periodType}`;
  };

  const getReportTypeBadge = () => {
    const types = {
      platform: { label: 'Platform', color: 'bg-blue-50 text-[#1B3A5F]' },
      organization: { label: 'Organization', color: 'bg-blue-100 text-blue-800' },
      agent: { label: 'Agent', color: 'bg-green-100 text-green-800' },
      advocate: { label: 'Advocate', color: 'bg-amber-100 text-amber-800' },
    };
    const config = types[report.report_type] || { label: 'Report', color: 'bg-slate-100 text-slate-800' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const renderVeteransMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricItem
        label="Veterans Served"
        value={report.veterans_served}
        previousValue={previousReport?.veterans_served}
        icon={Users}
        highlight
      />
      <MetricItem
        label="New Veterans"
        value={report.new_veterans}
        previousValue={previousReport?.new_veterans}
        icon={Users}
      />
      <MetricItem
        label="Active Assignments"
        value={report.active_assignments}
        previousValue={previousReport?.active_assignments}
        icon={Users}
      />
    </div>
  );

  const renderTouchpointMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricItem
        label="Touchpoints Completed"
        value={report.touchpoints_completed}
        previousValue={previousReport?.touchpoints_completed}
        icon={MessageSquare}
        highlight
      />
      <MetricItem
        label="Touchpoints Scheduled"
        value={report.touchpoints_scheduled}
        previousValue={previousReport?.touchpoints_scheduled}
        icon={Clock}
      />
      <MetricItem
        label="Avg per Veteran"
        value={report.avg_touchpoints_per_veteran}
        previousValue={previousReport?.avg_touchpoints_per_veteran}
        icon={BarChart3}
        format="score"
      />
    </div>
  );

  const renderClaimsMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricItem
        label="Claims Created"
        value={report.claims_created}
        previousValue={previousReport?.claims_created}
        icon={FileText}
      />
      <MetricItem
        label="Claims Submitted"
        value={report.claims_submitted}
        previousValue={previousReport?.claims_submitted}
        icon={FileText}
        highlight
      />
      <MetricItem
        label="Claims Approved"
        value={report.claims_approved}
        previousValue={previousReport?.claims_approved}
        icon={CheckCircle2}
      />
      <MetricItem
        label="Claims Denied"
        value={report.claims_denied}
        previousValue={previousReport?.claims_denied}
        icon={FileText}
      />
      <MetricItem
        label="Approval Rate"
        value={report.approval_rate}
        previousValue={previousReport?.approval_rate}
        icon={TrendingUp}
        format="percent"
        highlight
      />
      <MetricItem
        label="Avg Processing Time"
        value={report.avg_processing_time_days}
        previousValue={previousReport?.avg_processing_time_days}
        icon={Clock}
        format="days"
      />
    </div>
  );

  const renderFinancialMetrics = () => (
    <div className="grid grid-cols-2 gap-4">
      <MetricItem
        label="Total Back Pay Awarded"
        value={report.total_back_pay_awarded}
        previousValue={previousReport?.total_back_pay_awarded}
        icon={DollarSign}
        format="currency"
        highlight
      />
      <MetricItem
        label="Avg Back Pay per Claim"
        value={report.avg_back_pay_per_claim}
        previousValue={previousReport?.avg_back_pay_per_claim}
        icon={DollarSign}
        format="currency"
      />
    </div>
  );

  const renderSatisfactionMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricItem
        label="Overall Satisfaction"
        value={report.overall_satisfaction_score}
        previousValue={previousReport?.overall_satisfaction_score}
        icon={Star}
        format="score"
        highlight
      />
      <MetricItem
        label="NPS Score"
        value={report.nps_score}
        previousValue={previousReport?.nps_score}
        icon={TrendingUp}
        format="nps"
        highlight
      />
      <MetricItem
        label="Surveys Completed"
        value={report.surveys_completed}
        previousValue={previousReport?.surveys_completed}
        icon={FileText}
      />
      <MetricItem
        label="Claim Progress Score"
        value={report.avg_claim_progress_score}
        previousValue={previousReport?.avg_claim_progress_score}
        icon={BarChart3}
        format="score"
      />
      <MetricItem
        label="Quality of Life Score"
        value={report.avg_quality_of_life_score}
        previousValue={previousReport?.avg_quality_of_life_score}
        icon={Star}
        format="score"
      />
      <MetricItem
        label="Platform Ease Score"
        value={report.avg_platform_ease_score}
        previousValue={previousReport?.avg_platform_ease_score}
        icon={Star}
        format="score"
      />
    </div>
  );

  const renderCategoryContent = () => {
    switch (category) {
      case 'veterans':
        return renderVeteransMetrics();
      case 'touchpoints':
        return renderTouchpointMetrics();
      case 'claims':
        return renderClaimsMetrics();
      case 'financial':
        return renderFinancialMetrics();
      case 'satisfaction':
        return renderSatisfactionMetrics();
      case 'all':
      default:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Veterans & Engagement</h4>
              {renderVeteransMetrics()}
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Claims Performance</h4>
              {renderClaimsMetrics()}
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Satisfaction Scores</h4>
              {renderSatisfactionMetrics()}
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title || formatPeriodHeader()}</CardTitle>
            {report.generated_at && (
              <p className="text-sm text-muted-foreground mt-1">
                Generated: {new Date(report.generated_at).toLocaleDateString()}
              </p>
            )}
          </div>
          {getReportTypeBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {renderCategoryContent()}
      </CardContent>
    </Card>
  );
}
