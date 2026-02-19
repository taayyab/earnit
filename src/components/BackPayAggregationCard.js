import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Calculator, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Scale,
  History,
  AlertCircle,
  XCircle
} from 'lucide-react';
import api from '../lib/api';

export default function BackPayAggregationCard({ veteranId, refreshKey = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [cueItems, setCueItems] = useState([]);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      fetchSummary();
    }
  }, [hasFetched, refreshKey]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [summaryResponse, cueResponse] = await Promise.allSettled([
        api.get('/back-pay-aggregation/summary'),
        api.get('/back-pay-aggregation/cue-candidates')
      ]);

      if (summaryResponse.status === 'fulfilled' && summaryResponse.value?.data) {
        setSummary(summaryResponse.value.data);
      }

      if (cueResponse.status === 'fulfilled' && cueResponse.value?.data) {
        setCueItems(cueResponse.value.data.candidates || []);
      }
    } catch (err) {
      console.error('Back pay aggregation fetch error:', err);
      setError('Unable to load back pay analysis');
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  const runFullAnalysis = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const response = await api.post('/back-pay-aggregation/refresh', {
        include_va_sync: true
      });
      
      if (response.data?.success) {
        setSummary(response.data);
        setCueItems(response.data.cue_candidates || []);
      } else {
        setError(response.data?.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Back pay analysis error:', err);
      setError('Unable to run analysis - please try again');
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '--';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCUESeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCUESeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <XCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading && !hasFetched) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="w-5 h-5 text-blue-600" />
            Back Pay Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">Loading analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = summary?.success || summary?.total_back_pay;
  const hasCUE = cueItems.length > 0;
  const highPriorityCUE = cueItems.filter(c => c.severity === 'high').length;

  return (
    <Card className={`border-l-4 ${hasCUE ? 'border-l-amber-500' : 'border-l-green-500'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="w-5 h-5 text-blue-600" />
            Back Pay Analysis
            {hasCUE && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                {cueItems.length} potential error{cueItems.length !== 1 ? 's' : ''} found
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {!hasData && !error && (
          <div className="text-center py-4">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">
              Run a full analysis to review your claims history and identify potential back pay
            </p>
            <Button 
              onClick={runFullAnalysis} 
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Run Full Analysis
                </>
              )}
            </Button>
          </div>
        )}

        {hasData && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Back Pay</span>
                </div>
                <div className="text-2xl font-bold text-green-800">
                  {formatCurrency(summary?.total_back_pay || summary?.aggregation?.total_amount)}
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Claims Analyzed</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  {summary?.claims_analyzed || summary?.aggregation?.claims_count || 0}
                </div>
              </div>
            </div>

            {hasCUE && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <Scale className="w-4 h-4" />
                  <span className="font-medium">Potential Errors Detected (CUE)</span>
                </div>
                <p className="text-sm text-amber-600 mb-2">
                  {highPriorityCUE > 0 
                    ? `${highPriorityCUE} high-priority issue${highPriorityCUE !== 1 ? 's' : ''} may warrant review`
                    : 'Some past decisions may contain errors worth reviewing'
                  }
                </p>
                {!expanded && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setExpanded(true)}
                    className="text-amber-700 border-amber-300"
                  >
                    View Details
                  </Button>
                )}
              </div>
            )}

            {expanded && (
              <div className="space-y-4 pt-2 border-t">
                {hasCUE && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      CUE Candidates
                    </h4>
                    {cueItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg ${getCUESeverityColor(item.severity)}`}
                      >
                        <div className="flex items-start gap-2">
                          {getCUESeverityIcon(item.severity)}
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {item.rule_name || item.type || 'Potential Error'}
                            </div>
                            <div className="text-sm opacity-80 mt-1">
                              {item.description || item.details}
                            </div>
                            {item.potential_recovery && (
                              <div className="text-sm font-medium mt-2">
                                Potential recovery: {formatCurrency(item.potential_recovery)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {summary?.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {summary.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec.message || rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary?.timeline?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Claims Timeline
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {summary.timeline.slice(0, 5).map((event, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded">
                          <div className="text-gray-400 w-24">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex-1 text-gray-700">{event.description}</div>
                          {event.rating_change && (
                            <div className="text-green-600 font-medium">
                              +{event.rating_change}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={runFullAnalysis}
                    disabled={refreshing}
                    className="w-full"
                  >
                    {refreshing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Re-analyzing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
