import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  ExternalLink, 
  Loader2,
  Shield,
  FileText,
  Lightbulb,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../lib/api';
import { toast } from 'sonner';

const CONNECTION_TYPES = {
  caused_by: {
    label: 'Caused By',
    description: 'The secondary condition was directly caused by the primary condition',
    color: 'bg-blue-100 text-blue-700'
  },
  aggravated_by: {
    label: 'Aggravated By',
    description: 'The primary condition made an existing condition worse',
    color: 'bg-amber-100 text-amber-700'
  }
};

export default function SecondaryConditionPanel({ 
  condition, 
  claimId,
  onSecondaryAdded
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [connectionType, setConnectionType] = useState('caused_by');
  const [adding, setAdding] = useState(false);
  const [vaInfoUrl, setVaInfoUrl] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const fetchRecommendations = async () => {
    if (!condition?.id) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/conditions/condition/${condition.id}/secondary-recommendations`);
      if (response.data?.recommendations) {
        setRecommendations(response.data.recommendations);
        setVaInfoUrl(response.data.va_info_url || '');
      }
    } catch (error) {
      console.error('Failed to fetch secondary recommendations:', error);
      toast.error('Unable to load secondary condition recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && recommendations.length === 0) {
      fetchRecommendations();
    }
  }, [isExpanded, condition?.id]);

  const handleAddSecondary = async () => {
    if (!selectedRecommendation || !claimId) return;
    
    setAdding(true);
    try {
      const response = await api.post('/conditions/link-secondary', {
        primary_condition_id: condition.id,
        secondary_condition_name: selectedRecommendation.condition,
        connection_type: connectionType,
        claim_id: claimId,
        va_diagnostic_code: selectedRecommendation.va_diagnostic_code,
        medical_rationale: selectedRecommendation.medical_rationale
      });
      
      if (response.data?.success) {
        toast.success(`Added "${selectedRecommendation.condition}" as secondary condition`);
        setSelectedRecommendation(null);
        setRecommendations(prev => 
          prev.filter(r => r.condition !== selectedRecommendation.condition)
        );
        onSecondaryAdded?.(response.data.condition);
      }
    } catch (error) {
      console.error('Failed to add secondary condition:', error);
      toast.error(error.response?.data?.detail || 'Failed to add secondary condition');
    } finally {
      setAdding(false);
    }
  };

  if (condition?.is_secondary) {
    return null;
  }

  return (
    <Card className="border-neutral-200 mt-3">
      <div 
        className="px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span className="font-medium text-neutral-900 text-sm">Secondary Conditions</span>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            38 CFR 3.310
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {recommendations.length > 0 && !isExpanded && (
            <Badge className="bg-green-100 text-green-700 border-0">
              {recommendations.length} potential
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <CardContent className="pt-0 pb-4">
          <div className="border-t border-neutral-100 pt-4">
            <div className="flex items-start gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Secondary conditions</strong> are disabilities that were caused or worsened by a service-connected condition. 
                These can significantly increase your combined rating.
                {vaInfoUrl && (
                  <a 
                    href={vaInfoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-2 text-blue-700 hover:text-blue-900 underline"
                  >
                    Learn more at VA.gov <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
                <span className="ml-2 text-neutral-600">Analyzing potential secondary conditions...</span>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Recommended Secondary Conditions for {condition?.condition_name}
                </h4>
                
                {recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`p-3 border rounded-lg transition-all cursor-pointer ${
                      selectedRecommendation?.condition === rec.condition 
                        ? 'border-[hsl(var(--primary))] bg-blue-50 ring-2 ring-[hsl(var(--primary))]/20' 
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                    onClick={() => setSelectedRecommendation(
                      selectedRecommendation?.condition === rec.condition ? null : rec
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-neutral-900">{rec.condition}</span>
                          {rec.va_diagnostic_code && (
                            <Badge variant="outline" className="text-xs">
                              Code: {rec.va_diagnostic_code}
                            </Badge>
                          )}
                          <Badge className={CONNECTION_TYPES[rec.connection_type]?.color || 'bg-neutral-100'}>
                            {CONNECTION_TYPES[rec.connection_type]?.label || rec.connection_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600">{rec.medical_rationale}</p>
                        
                        {rec.evidence_needed && rec.evidence_needed.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-neutral-500">Evidence needed:</span>
                            <ul className="mt-1 text-xs text-neutral-600 list-disc list-inside">
                              {rec.evidence_needed.slice(0, 2).map((evidence, i) => (
                                <li key={i}>{evidence}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          {rec.confidence && (
                            <div className="flex items-center gap-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                rec.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                                rec.confidence >= 0.6 ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {Math.round(rec.confidence * 100)}% confidence
                              </span>
                            </div>
                          )}
                          {rec.source && (
                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                              <Shield className="h-3 w-3" />
                              {rec.source === 'va_knowledge_base' ? 'VA-recognized relationship' : 'AI-identified based on evidence'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-3">
                        {selectedRecommendation?.condition === rec.condition ? (
                          <CheckCircle className="h-5 w-5 text-[hsl(var(--primary))]" />
                        ) : (
                          <Plus className="h-5 w-5 text-neutral-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {selectedRecommendation && (
                  <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <h5 className="font-medium text-neutral-900 mb-3">
                      Add "{selectedRecommendation.condition}" as Secondary Condition
                    </h5>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Connection Type
                      </label>
                      <div className="flex gap-3">
                        {Object.entries(CONNECTION_TYPES).map(([type, config]) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setConnectionType(type)}
                            className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${
                              connectionType === type
                                ? 'border-[hsl(var(--primary))] bg-blue-50'
                                : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <div className="font-medium text-sm">{config.label}</div>
                            <div className="text-xs text-neutral-600 mt-1">{config.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleAddSecondary}
                        disabled={adding}
                        className="bg-[hsl(var(--primary))]"
                      >
                        {adding ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Secondary Condition
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedRecommendation(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                <p className="text-neutral-600">
                  No secondary condition recommendations found for this condition.
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  You can still add secondary conditions manually if you have medical evidence.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
                  About Secondary Conditions
                </CardTitle>
                <button 
                  onClick={() => setShowInfoModal(false)}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-4 text-sm">
                <p>
                  <strong>38 CFR 3.310</strong> allows you to claim disability compensation 
                  for conditions that are caused or aggravated by your already 
                  service-connected disabilities.
                </p>
                <div>
                  <h4 className="font-medium mb-2">Types of Secondary Connection:</h4>
                  <ul className="list-disc list-inside space-y-1 text-neutral-600">
                    <li><strong>Caused By:</strong> The primary condition directly caused the secondary condition</li>
                    <li><strong>Aggravated By:</strong> The primary condition made an existing condition worse</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Common Examples:</h4>
                  <ul className="list-disc list-inside space-y-1 text-neutral-600">
                    <li>PTSD causing sleep apnea or depression</li>
                    <li>Diabetes causing peripheral neuropathy</li>
                    <li>Knee condition causing hip problems due to altered gait</li>
                    <li>Back pain causing radiculopathy</li>
                  </ul>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800">
                    <strong>Important:</strong> You need a medical professional to 
                    provide a nexus letter linking your secondary condition to your 
                    primary service-connected condition.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}
