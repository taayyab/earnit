import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  BarChart3,
  Sparkles
} from 'lucide-react';
import api, { predictionsAPI } from '../../lib/api';
import { toast } from 'sonner';

export default function RatingPredictionCard({ claimId, conditions = [], documents = [], onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrediction = useCallback(async () => {
    if (!claimId || conditions.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const conditionData = conditions.map(c => ({
        name: typeof c === 'string' ? c : (c.name || c.condition_name),
        diagnostic_code: c.va_diagnostic_code || c.code || null,
        severity: c.severity || 'moderate',
        is_presumptive: c.is_presumptive || false,
        dbq_complete: c.dbq_complete || false,
        functional_impact: c.functional_impact || 50
      }));
      
      const documentData = documents.map(d => ({
        id: d.id,
        type: d.category || d.document_type || 'other',
        filename: d.filename,
        analyzed: d.analyzed || false
      }));
      
      const response = await predictionsAPI.getRatingPrediction(
        claimId, 
        conditionData, 
        documentData
      );
      
      if (response.data.success) {
        setPrediction(response.data.prediction);
        
        try {
          const explainRes = await predictionsAPI.explainPrediction(claimId);
          if (explainRes.data.success) {
            setExplanation(explainRes.data.explanation);
          }
        } catch (explainErr) {
          console.log('Explanation not available');
        }
      }
    } catch (err) {
      console.error('Failed to fetch rating prediction:', err);
      setError('Unable to generate rating prediction');
    } finally {
      setLoading(false);
    }
  }, [claimId, conditions, documents]);

  useEffect(() => {
    if (claimId && conditions.length > 0) {
      fetchPrediction();
    }
  }, [claimId, conditions.length]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-blue-600';
    if (confidence >= 0.4) return 'text-amber-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Moderate Confidence';
    if (confidence >= 0.4) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'bg-blue-50 border-blue-200';
    if (confidence >= 0.4) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getRatingColor = (rating) => {
    if (rating >= 70) return 'text-green-600';
    if (rating >= 50) return 'text-blue-600';
    if (rating >= 30) return 'text-amber-600';
    return 'text-slate-600';
  };

  if (!claimId || conditions.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-200 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#1B3A5F]" />
            Rating Prediction
          </CardTitle>
          <div className="flex items-center gap-2">
            {loading && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPrediction}
              disabled={loading}
              className="text-[#1B3A5F] hover:text-[#1B3A5F]"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
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
        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">{error}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchPrediction}
              disabled={loading}
              className="text-amber-600 hover:text-amber-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}

        {loading && !prediction && (
          <div className="py-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-[#2a4a6f] mx-auto mb-3" />
            <p className="text-sm text-slate-600">Analyzing your claim for rating prediction...</p>
          </div>
        )}

        {prediction && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className={`p-4 rounded-lg border ${getConfidenceBg(prediction.confidence || 0.7)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Predicted Combined Rating</span>
                </div>
                <div className={`text-3xl font-bold ${getRatingColor(prediction.combined_rating || 0)}`}>
                  {prediction.combined_rating || 0}%
                </div>
                {prediction.rating_range && (
                  <div className="mt-2 text-sm text-slate-600">
                    Range: {prediction.rating_range.low}% - {prediction.rating_range.high}%
                  </div>
                )}
                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1B3A5F] rounded-full transition-all"
                    style={{ width: `${prediction.combined_rating || 0}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Prediction Confidence</span>
                </div>
                <div className={`text-2xl font-bold ${getConfidenceColor(prediction.confidence || 0.7)}`}>
                  {Math.round((prediction.confidence || 0.7) * 100)}%
                </div>
                <Badge className={`mt-2 ${
                  (prediction.confidence || 0.7) >= 0.7 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {getConfidenceLabel(prediction.confidence || 0.7)}
                </Badge>
                <Progress 
                  value={(prediction.confidence || 0.7) * 100} 
                  className="h-2 mt-2" 
                />
              </div>
            </div>

            {prediction.condition_predictions && prediction.condition_predictions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#1B3A5F]" />
                  Per-Condition Breakdown
                </h4>
                <div className="space-y-2">
                  {prediction.condition_predictions.map((cond, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{cond.condition_name}</p>
                          {cond.diagnostic_code && (
                            <p className="text-xs text-slate-500">VA Code: {cond.diagnostic_code}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-xl font-bold ${getRatingColor(cond.predicted_rating || 0)}`}>
                            {cond.predicted_rating || 0}%
                          </span>
                          <p className={`text-xs ${getConfidenceColor(cond.confidence || 0.7)}`}>
                            {Math.round((cond.confidence || 0.7) * 100)}% confident
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#2a4a6f] rounded-full transition-all"
                          style={{ width: `${cond.predicted_rating || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {prediction.factors && prediction.factors.length > 0 && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Key Factors Affecting Prediction
                </h4>
                <div className="space-y-2">
                  {prediction.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      {factor.impact === 'positive' ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className={factor.impact === 'positive' ? 'text-green-700' : 'text-amber-700'}>
                          {factor.factor}
                        </span>
                        {factor.description && (
                          <p className="text-slate-500 text-xs mt-0.5">{factor.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expanded && (
              <div className="border-t pt-4 mt-2 space-y-4">
                {prediction.formula_explanation && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-[#1B3A5F] mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      VA Combined Rating Formula
                    </h4>
                    <p className="text-sm text-[#1B3A5F]">
                      {prediction.formula_explanation}
                    </p>
                  </div>
                )}

                {(explanation?.recommendations || prediction.recommendations) && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Recommendations to Improve Rating
                    </h4>
                    <ul className="space-y-1">
                      {(explanation?.recommendations || prediction.recommendations || []).map((rec, idx) => (
                        <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {prediction.rating_probabilities && (
                  <div className="p-3 bg-white rounded-lg border">
                    <h4 className="font-medium text-slate-700 mb-3">Rating Probabilities</h4>
                    <div className="space-y-2">
                      {Object.entries(prediction.rating_probabilities)
                        .sort(([a], [b]) => parseInt(b) - parseInt(a))
                        .map(([rating, probability]) => (
                          <div key={rating} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-600 w-12">{rating}%</span>
                            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#2a4a6f] rounded-full transition-all"
                                style={{ width: `${probability * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-500 w-12 text-right">
                              {Math.round(probability * 100)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Disclaimer</p>
                    <p className="mt-1">
                      This prediction is based on typical VA rating patterns and your current evidence. 
                      Actual ratings are determined by VA raters and may differ. Use this as a guide to 
                      strengthen your claim before submission.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!expanded && (prediction.factors?.length > 0 || explanation?.recommendations?.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(true)}
                className="w-full text-[#1B3A5F] hover:text-[#1B3A5F] hover:bg-blue-50"
              >
                View detailed breakdown & recommendations
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
