import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, AlertCircle, AlertTriangle, Info, ArrowRight, Shield, Star, Brain } from 'lucide-react';

const MENTAL_HEALTH_KEYWORDS = [
  'ptsd', 'post-traumatic', 'posttraumatic', 'depression', 'depressive',
  'anxiety', 'panic', 'bipolar', 'schizophrenia', 'psychosis', 'psychotic',
  'adjustment disorder', 'mood disorder', 'ocd', 'obsessive', 'phobia',
  'trauma', 'dissociative', 'somatoform', 'conversion disorder', 'mental'
];

const isMentalHealthCondition = (condition) => {
  const name = (condition.condition_name || condition.name || '').toLowerCase();
  const category = (condition.category || '').toLowerCase();
  
  if (category.includes('mental') || category.includes('psychiatric')) {
    return true;
  }
  
  return MENTAL_HEALTH_KEYWORDS.some(keyword => name.includes(keyword));
};

export default function ConditionSelectionPanel({ 
  conditions = [], 
  onSelect,
  loading = false 
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [showInfo, setShowInfo] = useState(null);
  const [showMentalHealthInfo, setShowMentalHealthInfo] = useState(false);

  const mentalHealthConditions = useMemo(() => {
    return conditions.filter(isMentalHealthCondition);
  }, [conditions]);

  const selectedMentalHealthConditions = useMemo(() => {
    return conditions.filter(c => {
      const conditionId = c.id || c.condition_name;
      return selectedIds.includes(conditionId) && isMentalHealthCondition(c);
    });
  }, [conditions, selectedIds]);

  const hasMentalHealthConflict = selectedMentalHealthConditions.length > 1;

  const recommendedPrimaryCondition = useMemo(() => {
    if (selectedMentalHealthConditions.length <= 1) return null;
    
    const sorted = [...selectedMentalHealthConditions].sort((a, b) => 
      (b.estimated_rating || 0) - (a.estimated_rating || 0)
    );
    return sorted[0];
  }, [selectedMentalHealthConditions]);

  const toggleCondition = (conditionId) => {
    setSelectedIds(prev => 
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleSubmit = () => {
    if (onSelect && selectedIds.length > 0) {
      onSelect(selectedIds);
    }
  };

  const getEvidenceStrengthColor = (strength) => {
    switch (strength) {
      case 'strong': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-amber-600 bg-amber-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <h3 className="font-medium text-neutral-900 mb-2">Select Conditions to Claim</h3>
        <p className="text-sm text-neutral-600">
          Review the conditions identified in your records. Select the ones you want to include in your VA disability claim. 
          We'll guide you through gathering the required evidence for each.
        </p>
      </div>

      {mentalHealthConditions.length > 1 && (
        <Alert className="border-amber-200 bg-amber-50">
          <Brain className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Multiple Mental Health Conditions Detected</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">
              You have {mentalHealthConditions.length} mental health conditions. Under VA regulations (38 CFR 4.130), 
              all mental health conditions share the <strong>same rating criteria</strong>. The VA will only rate 
              <strong> one mental health condition</strong> - whichever results in the highest evaluation.
            </p>
            <button 
              onClick={() => setShowMentalHealthInfo(!showMentalHealthInfo)}
              className="text-amber-800 underline text-sm font-medium"
            >
              {showMentalHealthInfo ? 'Hide details' : 'Learn more about mental health ratings'}
            </button>
            
            {showMentalHealthInfo && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200">
                <h4 className="font-semibold text-neutral-800 mb-2">Why This Matters:</h4>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>PTSD, depression, anxiety, and other mental health conditions all use identical rating percentages (0%, 10%, 30%, 50%, 70%, or 100%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>Filing multiple mental health claims will NOT increase your total rating - only the highest applies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Instead, describe ALL symptoms from all mental health conditions on your DBQ - they'll be evaluated together</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Focus on the condition with strongest evidence for maximum rating</span>
                  </li>
                </ul>
                <p className="mt-3 text-xs text-neutral-500">
                  Reference: 38 CFR 4.130 - General Rating Formula for Mental Disorders; 38 CFR 4.14 - Avoidance of Pyramiding
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {hasMentalHealthConflict && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Rating Conflict Warning</AlertTitle>
          <AlertDescription className="text-red-700">
            <p className="mb-2">
              You've selected {selectedMentalHealthConditions.length} mental health conditions: {' '}
              <strong>{selectedMentalHealthConditions.map(c => c.condition_name).join(', ')}</strong>
            </p>
            {recommendedPrimaryCondition && (
              <p className="mb-2">
                <strong>Recommendation:</strong> Focus on "{recommendedPrimaryCondition.condition_name}" 
                as your primary mental health claim (highest estimated rating: {recommendedPrimaryCondition.estimated_rating || 'TBD'}%).
              </p>
            )}
            <p className="text-sm">
              During your C&P exam, describe symptoms from ALL conditions - they will be evaluated together under one rating.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {conditions.map((condition) => {
          const conditionId = condition.id || condition.condition_name;
          const isSelected = selectedIds.includes(conditionId);
          const isMental = isMentalHealthCondition(condition);
          
          return (
            <Card 
              key={conditionId}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))]/20'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => toggleCondition(conditionId)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleCondition(conditionId)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-neutral-900">{condition.condition_name}</h4>
                      {isMental && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          <Brain className="h-3 w-3 mr-1" />
                          Mental Health
                        </Badge>
                      )}
                      {condition.is_presumptive && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Presumptive
                        </Badge>
                      )}
                      {condition.claimable && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ready to Claim
                        </Badge>
                      )}
                    </div>
                    
                    {condition.va_diagnostic_code && (
                      <p className="text-sm text-neutral-500 mt-1">
                        VA Code: {condition.va_diagnostic_code} - {condition.category}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getEvidenceStrengthColor(condition.evidence_strength)}`}>
                        {condition.evidence_strength?.charAt(0).toUpperCase() + condition.evidence_strength?.slice(1)} Evidence
                      </span>
                      
                      {condition.estimated_rating && (
                        <span className="text-xs text-neutral-600">
                          Est. Rating: {condition.estimated_rating}%
                        </span>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowInfo(showInfo === conditionId ? null : conditionId);
                        }}
                        className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                      >
                        <Info className="h-3 w-3" />
                        What's needed?
                      </button>
                    </div>
                    
                    {showInfo === conditionId && (
                      <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-sm">
                        <p className="font-medium text-neutral-700 mb-2">Requirements for this condition:</p>
                        <ul className="space-y-1 text-neutral-600">
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            Current medical diagnosis
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            Evidence of in-service event or injury
                          </li>
                          {!condition.is_presumptive && (
                            <li className="flex items-start gap-2">
                              <span className="text-amber-500">○</span>
                              Medical nexus statement (linking condition to service)
                            </li>
                          )}
                        </ul>
                        {condition.is_presumptive && (
                          <p className="mt-2 text-xs text-purple-600">
                            As a presumptive condition, the VA assumes this is service-connected if you served in a qualifying location/period.
                          </p>
                        )}
                        {isMental && (
                          <p className="mt-2 text-xs text-blue-600">
                            This mental health condition uses the General Rating Formula (38 CFR 4.130). 
                            All mental health symptoms are combined into one rating.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    {condition.approval_score && (
                      <div className="text-lg font-semibold text-[hsl(var(--primary))]">
                        {condition.approval_score}%
                      </div>
                    )}
                    <div className="text-xs text-neutral-500">Approval Likelihood</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {conditions.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          <p>No conditions identified yet. Upload your documents to get started.</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div className="text-sm text-neutral-600">
          {selectedIds.length} condition{selectedIds.length !== 1 ? 's' : ''} selected
          {hasMentalHealthConflict && (
            <span className="text-amber-600 ml-2">
              (includes {selectedMentalHealthConditions.length} mental health)
            </span>
          )}
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={selectedIds.length === 0 || loading}
          className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
        >
          {loading ? 'Processing...' : 'Continue with Selected Conditions'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
