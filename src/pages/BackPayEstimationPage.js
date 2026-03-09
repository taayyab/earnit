import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import VeteranLayout from '../components/VeteranLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  DollarSign, Calendar, TrendingUp, Info, ArrowLeft,
  Shield, RefreshCw, AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';

const VA_RATE_TABLE = [
  { rating: 10, monthly: 175 },
  { rating: 20, monthly: 346 },
  { rating: 30, monthly: 537 },
  { rating: 40, monthly: 774 },
  { rating: 50, monthly: 1102 },
  { rating: 60, monthly: 1395 },
  { rating: 70, monthly: 1759 },
  { rating: 80, monthly: 2044 },
  { rating: 90, monthly: 2297 },
  { rating: 100, monthly: 3737 },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function BackPayEstimationPage() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (claimId) fetchEstimation();
  }, [claimId]);

  const fetchEstimation = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get(`/back-pay/estimate/${claimId}`);
      const d = res.data;
      setEstimation({
        monthly: d.estimate?.monthly_amount || 0,
        total: d.estimate?.estimated_total || 0,
        months: d.estimate?.retroactive_months || 0,
        rating: d.estimate?.combined_rating || 0,
        effectiveDate: d.estimate?.effective_date || null,
        basis: d.estimate?.calculation_basis || '',
        confidence: d.confidence_level || 'low',
        disclaimer: d.disclaimer || '',
      });
    } catch {
      setEstimation(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const hasData = estimation && estimation.rating > 0;

  if (loading) {
    return (
      <VeteranLayout>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </VeteranLayout>
    );
  }

  return (
    <VeteranLayout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchEstimation(true)}
            disabled={refreshing}
            className="text-slate-600"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Back Pay Estimation</h1>
            <p className="text-sm text-slate-500">Retroactive compensation breakdown for your claim</p>
          </div>
        </div>

        {!hasData ? (
          /* Empty State */
          <Card className="border-2 border-dashed border-slate-200">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-slate-300" />
              </div>
              <h2 className="text-lg font-semibold text-slate-700 mb-2">No Estimate Available Yet</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                Your back pay estimate requires rated conditions on your claim. Once you add conditions with disability ratings, we'll calculate your estimated retroactive compensation.
              </p>
              <Button onClick={() => navigate('/claim-review')} className="bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white">
                Add Conditions to Your Claim
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {/* Hero metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" /> Estimated Back Pay
                  </p>
                  <div className="text-3xl font-bold text-green-700 mb-0.5">
                    {formatCurrency(estimation.total)}
                  </div>
                  <p className="text-xs text-slate-400">
                    {estimation.months} months × {formatCurrency(estimation.monthly)}/mo
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Monthly Benefit
                  </p>
                  <div className="text-3xl font-bold text-blue-700 mb-0.5">
                    {formatCurrency(estimation.monthly)}
                  </div>
                  <p className="text-xs text-slate-400">Tax-free ongoing income</p>
                </CardContent>
              </Card>
            </div>

            {/* Rating + effective date */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#1B3A5F]" />
                  Calculation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Combined Disability Rating</span>
                  <Badge className="bg-[#1B3A5F] text-white">{estimation.rating}%</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Monthly VA Rate ({estimation.rating}%)</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(estimation.monthly)}/mo</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Retroactive Period</span>
                  <span className="font-semibold text-slate-800">{estimation.months} months</span>
                </div>
                {estimation.effectiveDate && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Effective Date</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(estimation.effectiveDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-600">Estimated Total Back Pay</span>
                  <span className="font-bold text-green-700 text-lg">{formatCurrency(estimation.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* VA Rate Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  VA Monthly Disability Rate Table (2025)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-1.5">
                  {VA_RATE_TABLE.map(({ rating, monthly }) => (
                    <div
                      key={rating}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                        rating === estimation.rating
                          ? 'bg-green-100 border border-green-300 font-semibold'
                          : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {rating === estimation.rating && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                        {rating}% rating
                      </span>
                      <span>{formatCurrency(monthly)}/mo</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Rates shown are for a single veteran with no dependents. Your actual rate may differ.
                </p>
              </CardContent>
            </Card>

            {/* Confidence + disclaimer */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 space-y-1">
                <p className="font-medium">Estimate Only</p>
                <p>{estimation.disclaimer || 'These estimates are based on VA rating tables and your claim data. Actual back pay and monthly benefits are determined by the VA after a formal rating decision.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </VeteranLayout>
  );
}
