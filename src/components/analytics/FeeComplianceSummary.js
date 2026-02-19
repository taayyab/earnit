import React from 'react';
import { FileText, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import MetricCard from './MetricCard';

function FeeComplianceSummary({ data }) {
  if (!data) return null;

  const { summary, fee_regulations, claim_type_summary, fee_eligible_breakdown } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Original Claims"
          value={summary?.original_claims || 0}
          subtitle="No fees allowed"
          icon={FileText}
          color="text-blue-600"
        />
        <MetricCard
          title="Fee Eligible"
          value={summary?.fee_eligible_claims || 0}
          subtitle="Appeals/Supplemental"
          icon={DollarSign}
          color="text-green-600"
        />
        <MetricCard
          title="POA Signed"
          value={summary?.poa_signed || 0}
          subtitle={`${summary?.poa_missing || 0} missing`}
          icon={CheckCircle2}
          color="text-green-600"
        />
        <MetricCard
          title="Violations"
          value={summary?.compliance_violations || 0}
          subtitle="Requires review"
          icon={AlertTriangle}
          color={summary?.compliance_violations > 0 ? 'text-red-600' : 'text-green-600'}
        />
      </div>

      {fee_regulations && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">38 CFR 14.636 Fee Regulations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm"><strong>Maximum Fee Rate:</strong> {(fee_regulations.max_fee_rate || 0) * 100}%</p>
                <p className="text-sm text-muted-foreground mt-1">{fee_regulations.max_fee_description}</p>
              </div>
              <div>
                <p className="text-sm"><strong>Original Claims:</strong></p>
                <p className="text-sm text-muted-foreground">{fee_regulations.original_claims_note}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Claim Type Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claim_type_summary?.map((ct) => (
                <div key={ct.type} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{ct.type}</span>
                    <Badge variant={ct.fee_eligible ? 'default' : 'secondary'}>
                      {ct.fee_eligible ? 'Fee Eligible' : 'No Fee'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Claims: {ct.count} | With Agreement: {ct.with_fee_agreement}</p>
                    {ct.total_back_pay > 0 && (
                      <p>Total Back Pay: ${ct.total_back_pay.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Fee Eligible Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span>Total Eligible Claims</span>
                <span className="font-bold">{fee_eligible_breakdown?.total_eligible || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span>With Fee Tracking</span>
                <span className="font-bold">{fee_eligible_breakdown?.with_fee_tracking || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span>Total Fees Earned</span>
                <span className="font-bold text-green-600">
                  ${(fee_eligible_breakdown?.total_fees_earned || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span>Total Back Pay Awarded</span>
                <span className="font-bold text-blue-600">
                  ${(fee_eligible_breakdown?.total_back_pay_awarded || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span>Effective Fee Rate</span>
                <span className="font-bold">{fee_eligible_breakdown?.effective_fee_rate || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FeeComplianceSummary;
