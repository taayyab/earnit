import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DollarSign, TrendingUp, Calendar, ChevronRight, Info, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

export default function BackPayEstimationCard({ claimId, veteranId, className = '' }) {
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (claimId) fetchEstimation();
  }, [claimId]);

  const fetchEstimation = async () => {
    if (!claimId) return;
    setLoading(true);
    try {
      const response = await api.get(`/back-pay/estimate/${claimId}`);
      const d = response.data;
      // Normalize backend shape → component shape
      setEstimation({
        estimated_monthly: d.estimate?.monthly_amount || 0,
        estimated_total_back_pay: d.estimate?.estimated_total || 0,
        months_of_back_pay: d.estimate?.retroactive_months || 0,
        combined_rating: d.estimate?.combined_rating || 0,
        effective_date: d.estimate?.effective_date || null,
        calculation_basis: d.estimate?.calculation_basis || '',
        confidence_level: d.confidence_level || 'low',
      });
    } catch {
      setEstimation(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);

  if (loading) {
    return (
      <Card className={`border-2 border-green-200 bg-gradient-to-br from-green-50 to-white ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
            <span className="ml-2 text-sm text-slate-600">Calculating estimated benefits...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasEstimate = estimation && estimation.combined_rating > 0;
  const totalBackPay = estimation?.estimated_total_back_pay || 0;
  const monthlyAmount = estimation?.estimated_monthly || 0;
  const months = estimation?.months_of_back_pay || 0;

  // Empty state — no conditions rated yet
  if (!hasEstimate) {
    return (
      <Card className={`border-2 border-slate-200 bg-white ${className}`}>
        <CardContent className="flex flex-col items-center justify-center text-center py-8 px-6 space-y-4">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Your Estimated Benefits</h3>
            <p className="text-xs text-slate-500">Based on your claim data</p>
          </div>
          <div className="text-4xl font-bold text-slate-200">$0</div>
          <p className="text-sm text-slate-500 max-w-xs">
            Add rated conditions to your claim to see your estimated monthly benefit and back pay.
          </p>
          <Button
            size="sm"
            onClick={() => navigate(claimId ? `/claim/${claimId}` : '/document-onboarding')}
            className="bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white"
          >
            View My Claim
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Estimates use VA rating tables. Actual benefits depend on your final VA decision.
          </p>
        </CardContent>
      </Card>
    );
  }

  const confidenceBadge = {
    high: <Badge className="bg-green-100 text-green-700 text-xs">High Confidence</Badge>,
    medium: <Badge className="bg-amber-100 text-amber-700 text-xs">Medium Confidence</Badge>,
    low: <Badge className="bg-slate-100 text-slate-600 text-xs">Estimate</Badge>,
  }[estimation.confidence_level] ?? null;

  return (
    <Card className={`border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-all ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-900">Your Estimated Benefits</CardTitle>
              <p className="text-xs text-slate-500">
                {estimation.combined_rating}% combined rating · {months} months retroactive
              </p>
            </div>
          </div>
          {confidenceBadge}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-slate-500">Estimated Back Pay</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totalBackPay)}</div>
            <p className="text-xs text-slate-400 mt-0.5">Based on {months} months</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-slate-500">Monthly Benefit</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(monthlyAmount)}</div>
            <p className="text-xs text-slate-400 mt-0.5">Tax-free income</p>
          </div>
        </div>

        {estimation.effective_date && (
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Effective date: {new Date(estimation.effective_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-slate-500 bg-white/70 p-3 rounded-lg border border-green-100">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p>Estimate based on VA rating tables. Actual benefits depend on your final VA decision.</p>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white text-sm"
            onClick={() => navigate(`/back-pay-estimation/${claimId || ''}`)}
          >
            View Full Breakdown
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchEstimation}
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
