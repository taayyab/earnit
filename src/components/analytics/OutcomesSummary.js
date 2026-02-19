import React from 'react';
import { Target, Activity, Award, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import StatusBreakdownChart from './StatusBreakdownChart';

function OutcomesSummary({ data }) {
  if (!data) return null;

  const { outcome_breakdown, claim_type_breakdown, top_conditions, approval_score_distribution } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Outcome Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatusBreakdownChart data={outcome_breakdown} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            By Claim Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {claim_type_breakdown?.map((ct) => (
              <div key={ct.type} className="flex items-center justify-between">
                <span className="text-sm capitalize">{ct.type}</span>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{ct.total}</Badge>
                  <span className="text-sm text-green-600">{ct.approval_rate}% approved</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Approval Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {approval_score_distribution?.map((bucket) => (
              <div key={bucket.range} className="flex items-center gap-3">
                <span className="text-sm w-16">{bucket.range}</span>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <div 
                    className={`h-full rounded ${
                      bucket.range.startsWith('80') ? 'bg-green-500' :
                      bucket.range.startsWith('60') ? 'bg-blue-500' :
                      bucket.range.startsWith('40') ? 'bg-yellow-500' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${bucket.count * 10}%` }}
                  />
                </div>
                <span className="text-sm w-8 text-right">{bucket.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {top_conditions?.slice(0, 8).map((cond, idx) => (
              <div key={cond.condition} className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">{idx + 1}. {cond.condition}</span>
                <Badge variant="secondary">{cond.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OutcomesSummary;
