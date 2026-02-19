import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Calculator, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Upload
} from 'lucide-react';
import api from '../lib/api';

export default function ClaimForecastCard({ claim, conditions = [], refreshKey = 0, onNavigate, verificationData = null }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [dataError, setDataError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [lastFetchKey, setLastFetchKey] = useState('');

  const conditionsHash = conditions
    .map(c => `${c.id || c.name || ''}-${c.completion_percentage || c.percentage || 0}`)
    .join(',');
  
  const currentFetchKey = `${claim?.id}-${conditionsHash}-${refreshKey}`;

  useEffect(() => {
    if (currentFetchKey !== lastFetchKey) {
      setLastFetchKey(currentFetchKey);
      setHasFetched(false);
      setForecast(null);
      setDataError(null);
    }
  }, [currentFetchKey, lastFetchKey]);

  useEffect(() => {
    if (claim?.id && !hasFetched) {
      fetchForecast();
    }
  }, [claim?.id, hasFetched]);

  const fetchForecast = async () => {
    if (!claim?.id) return;
    
    setLoading(true);
    setDataError(null);
    
    try {
      const response = await api.get(`/claims/${claim.id}/forecast`);
      setForecast(response.data);
    } catch (err) {
      console.error('Forecast fetch error:', err);
      if (err.response?.status === 404) {
        setDataError('Claim not found');
      } else {
        setDataError('Unable to load forecast data');
      }
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  const handleRefresh = () => {
    setDataError(null);
    setHasFetched(false);
  };

  const getReadinessLabel = () => {
    if (!forecast?.readiness_level) return null;
    const labels = {
      'submission_ready': { text: 'Ready for Submission', color: 'text-green-600' },
      'needs_minor_work': { text: 'Needs Minor Work', color: 'text-blue-600' },
      'needs_significant_work': { text: 'Needs More Evidence', color: 'text-amber-600' },
      'not_ready': { text: 'Not Ready', color: 'text-red-600' }
    };
    return labels[forecast.readiness_level] || null;
  };

  const getApprovalContext = () => {
    const context = {
      drivers: forecast?.approval_drivers || [],
      gaps: forecast?.approval_gaps || [],
      nextActions: [],
      summary: ''
    };

    const score = forecast?.approval_score;
    const canCalculate = forecast?.can_calculate_forecast;

    if (!forecast?.has_conditions) {
      context.nextActions.push('Add conditions you are claiming');
      context.summary = 'Start by adding the conditions you want to claim.';
    } else if (!forecast?.has_documents) {
      context.nextActions.push('Upload medical documents to analyze your claim');
      context.summary = 'Upload your medical records to get an accurate approval estimate.';
    } else if (!canCalculate) {
      context.nextActions.push('Upload medical documents to analyze your claim');
      context.summary = 'We need more documents to analyze your claim strength.';
    } else if (score !== null && score !== undefined) {
      if (score >= 80) {
        context.summary = 'Your claim has strong evidence support and is well-positioned for approval.';
        context.nextActions.push('Review your claim for final submission');
      } else if (score >= 60) {
        context.summary = 'Your claim shows promise but could be strengthened with additional evidence.';
        context.nextActions.push('Review your Rating Decision Brief for suggestions');
        context.nextActions.push('Consider adding buddy statements');
      } else if (score >= 40) {
        context.summary = 'Your claim needs more supporting evidence to improve approval chances.';
        if (context.gaps.length > 0) {
          context.nextActions.push('Address the evidence gaps listed above');
        }
        context.nextActions.push('Upload nexus letters from medical providers');
      } else {
        context.summary = 'Critical evidence is missing. Focus on addressing the gaps below before submission.';
        context.nextActions.push('Address critical issues first');
        context.nextActions.push('Upload supporting medical documents');
      }
    }

    return context;
  };

  const calculateNetBenefit = () => {
    if (!forecast?.entitlement_amount) return null;
    
    const grossBackPay = forecast.entitlement_amount;
    const claimType = claim?.submission_type || 'original';
    
    let feePercentage = 0;
    if (claimType !== 'original') {
      feePercentage = 0.20;
    }
    
    const platformFee = grossBackPay * feePercentage;
    const netBenefit = grossBackPay - platformFee;
    
    return {
      gross: grossBackPay,
      fee: platformFee,
      feePercentage: feePercentage * 100,
      net: netBenefit,
      monthlyRate: forecast.monthly_rate || 0
    };
  };

  const approvalScore = forecast?.can_calculate_forecast ? forecast.approval_score : null;
  const timelineDays = forecast?.timeline_days || 125;
  const netBenefit = calculateNetBenefit();
  const approvalContext = getApprovalContext();

  const getApprovalColor = (score) => {
    if (score === null || score === undefined) return 'text-slate-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getApprovalBg = (score) => {
    if (score === null || score === undefined) return 'bg-slate-50 border-slate-200';
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Card className="border-2 border-slate-100 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Claim Forecast
          </CardTitle>
          <div className="flex items-center gap-2">
            {loading && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-slate-500"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {dataError && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">{dataError}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
              className="text-amber-600 hover:text-amber-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div 
            className={`p-4 rounded-lg border ${getApprovalBg(approvalScore)} ${onNavigate ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={() => onNavigate?.('rdb')}
            role={onNavigate ? 'button' : undefined}
            tabIndex={onNavigate ? 0 : undefined}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate?.('rdb')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Approval Likelihood</span>
              </div>
              {onNavigate && <ExternalLink className="h-3 w-3 text-slate-400" />}
            </div>
            {approvalScore !== null && approvalScore !== undefined ? (
              <>
                <div className={`text-2xl font-bold ${getApprovalColor(approvalScore)}`}>
                  {Math.round(approvalScore)}%
                </div>
                <Progress value={approvalScore} className="h-2 mt-2" />
                {getReadinessLabel() ? (
                  <p className={`text-xs mt-1 font-medium ${getReadinessLabel().color}`}>
                    {getReadinessLabel().text}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Based on RDB analysis</p>
                )}
              </>
            ) : (
              <>
                <div className="text-lg font-medium text-slate-400">--</div>
                <p className="text-xs text-slate-500 mt-2">
                  {!forecast?.has_conditions 
                    ? 'Add conditions to start'
                    : !forecast?.has_documents 
                      ? 'Upload documents to calculate'
                      : 'Analyzing your documents...'}
                </p>
              </>
            )}
          </div>

          <div 
            className={`p-4 rounded-lg border bg-slate-50 border-slate-200 ${onNavigate ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={() => onNavigate?.('timeline')}
            role={onNavigate ? 'button' : undefined}
            tabIndex={onNavigate ? 0 : undefined}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate?.('timeline')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Timeline Estimate</span>
              </div>
              {onNavigate && <ExternalLink className="h-3 w-3 text-slate-400" />}
            </div>
            <div className="text-2xl font-bold text-slate-700">
              {timelineDays} days
            </div>
            <p className="text-xs text-slate-500 mt-2">
              VA processing goal for {claim?.submission_type || 'original'} claims
            </p>
          </div>

          <div 
            className={`p-4 rounded-lg border bg-emerald-50 border-emerald-200 ${onNavigate ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={() => onNavigate?.('backpay')}
            role={onNavigate ? 'button' : undefined}
            tabIndex={onNavigate ? 0 : undefined}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate?.('backpay')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-slate-600">Your Entitlement</span>
              </div>
              {onNavigate && <ExternalLink className="h-3 w-3 text-slate-400" />}
            </div>
            {netBenefit ? (
              <>
                <div className="text-2xl font-bold text-emerald-600">
                  ${netBenefit.net.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Click to view back pay details
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-medium text-slate-400">--</div>
                <p className="text-xs text-slate-500 mt-2">
                  {!forecast?.has_conditions 
                    ? 'Add conditions to estimate'
                    : 'Upload documents to calculate'}
                </p>
              </>
            )}
          </div>
        </div>

        {(forecast?.has_conditions || conditions.length > 0) && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-700 mb-2">{approvalContext.summary}</p>
            {approvalContext.gaps.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {approvalContext.gaps.map((gap, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {gap}
                  </span>
                ))}
              </div>
            )}
            {approvalContext.drivers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {approvalContext.drivers.map((driver, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {driver}
                  </span>
                ))}
              </div>
            )}
            {approvalContext.nextActions.length > 0 && !expanded && (
              <div className="text-xs text-slate-600">
                <span className="font-medium">Next step:</span> {approvalContext.nextActions[0]}
              </div>
            )}
          </div>
        )}

        {expanded && (
          <div className="border-t pt-4 mt-2 space-y-4">
            {approvalContext.nextActions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Recommended Next Steps
                </h4>
                <ul className="space-y-1">
                  {approvalContext.nextActions.map((action, idx) => (
                    <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Benefit Breakdown
                </h4>
                {netBenefit ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Estimated Back Pay</span>
                      <span className="font-medium">${netBenefit.gross.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        Platform Fee ({netBenefit.feePercentage}%)
                        {netBenefit.feePercentage === 0 && (
                          <span className="ml-1 text-green-600">(No fee for original claims)</span>
                        )}
                      </span>
                      <span className="font-medium text-red-600">-${netBenefit.fee.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">Your Net Entitlement</span>
                      <span className="font-bold text-emerald-600">${netBenefit.net.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-sm">
                      <span className="text-slate-600">Monthly Benefit (ongoing)</span>
                      <span className="font-medium">${netBenefit.monthlyRate.toLocaleString()}/mo</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Complete your claim to see breakdown</p>
                )}
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Claim Status
                </h4>
                <div className="space-y-2">
                  <div 
                    className={`flex items-center justify-between text-sm ${onNavigate ? 'cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded' : ''}`}
                    onClick={() => onNavigate?.('conditions')}
                  >
                    <span className="text-slate-600 flex items-center gap-1">
                      Conditions identified
                      {onNavigate && <ExternalLink className="h-3 w-3 text-slate-400" />}
                    </span>
                    <span className="font-medium">{forecast?.conditions_count || conditions.length}</span>
                  </div>
                  <div 
                    className={`flex items-center justify-between text-sm ${onNavigate ? 'cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded' : ''}`}
                    onClick={() => onNavigate?.('documents')}
                  >
                    <span className="text-slate-600 flex items-center gap-1">
                      Documents uploaded
                      {onNavigate && <Upload className="h-3 w-3 text-slate-400" />}
                    </span>
                    <span className="font-medium">{forecast?.documents_count || claim?.documents_count || 0}</span>
                  </div>
                  {forecast?.can_calculate_forecast && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">RDB Analysis</span>
                        <span className="font-medium text-green-600">Complete</span>
                      </div>
                      {forecast.approval_score !== null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Approval Score</span>
                          <span className={`font-medium ${getApprovalColor(forecast.approval_score)}`}>
                            {Math.round(forecast.approval_score)}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700 flex items-start gap-2">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    {forecast?.recommendation || 'Upload documents to generate approval readiness analysis'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Disclaimer</p>
                <p className="mt-1">
                  These estimates are based on VA processing goals and typical approval patterns. 
                  Actual results may vary. Per 38 CFR 14.636, no fees are charged for original claims.
                </p>
              </div>
            </div>
          </div>
        )}

        {!expanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            View detailed breakdown
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
