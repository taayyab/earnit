import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { DollarSign, TrendingUp, Calendar, ChevronRight, Info, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BackPayEstimationCard({ claimId, veteranId, className = '' }) {
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (claimId) {
      fetchEstimation();
    }
  }, [claimId]);

  const fetchEstimation = async () => {
    if (!claimId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/back-pay/estimate/${claimId}`);
      setEstimation(response.data);
    } catch (err) {
      console.error('Error fetching back pay estimation:', err);
      setError('Unable to calculate estimation');
      setEstimation({
        estimated_monthly: 0,
        estimated_total_back_pay: 0,
        months_of_back_pay: 0,
        effective_date_scenario: 'intent_to_file',
        confidence_level: 'low'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getConfidenceBadge = (level) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-green-100 text-green-700">High Confidence</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-700">Medium Confidence</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-600">Estimate</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={`border-2 border-green-200 bg-gradient-to-br from-green-50 to-white ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            <span className="ml-2 text-slate-600">Calculating your estimated benefits...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBackPay = estimation?.estimated_total_back_pay || 0;
  const monthlyAmount = estimation?.estimated_monthly || 0;
  const months = estimation?.months_of_back_pay || 0;

  return (
    <Card className={`border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-all ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Your Estimated Benefits</CardTitle>
              <p className="text-sm text-slate-500">Based on your claim data</p>
            </div>
          </div>
          {estimation && getConfidenceBadge(estimation.confidence_level)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-slate-600">Estimated Back Pay</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(totalBackPay)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Based on {months} months
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm text-slate-600">Monthly Benefit</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(monthlyAmount)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tax-free income
            </p>
          </div>
        </div>

        {estimation?.rating_breakdown && (
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Predicted Combined Rating</span>
              <Badge className="bg-green-600 text-white">
                {estimation.predicted_combined_rating}%
              </Badge>
            </div>
            <Progress 
              value={estimation.predicted_combined_rating} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
          <Info className="w-4 h-4 flex-shrink-0" />
          <p>
            This estimate is based on your claimed conditions and VA rating tables. 
            Actual benefits depend on your final VA decision.
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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
