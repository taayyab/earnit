import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Pill, 
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  Plus,
  Info,
  FileText
} from 'lucide-react';

export default function MedicationAnalysisCard({ 
  medicationAnalysis = null, 
  medicationOpportunities = [],
  onAddCondition
}) {
  const [expanded, setExpanded] = useState(false);

  if (!medicationAnalysis && medicationOpportunities.length === 0) {
    return null;
  }

  const rawOpportunities = medicationAnalysis?.secondary_condition_opportunities || medicationOpportunities;
  
  const opportunities = rawOpportunities.filter(opp => {
    const conditionName = opp?.condition || opp?.condition_name || opp?.secondary_condition;
    return conditionName && typeof conditionName === 'string' && conditionName.trim().length > 0;
  });

  if (opportunities.length === 0) {
    return null;
  }

  const getConditionName = (opp) => {
    return opp?.condition || opp?.condition_name || opp?.secondary_condition || 'Unknown Condition';
  };

  const getRiskLevel = (opp) => {
    return opp?.risk_level || opp?.priority || 'moderate';
  };

  const getSourceMedication = (opp) => {
    return opp?.source_medication || opp?.medication_name || opp?.from_medication;
  };

  const highPriorityCount = medicationAnalysis?.high_priority_count || 
    opportunities.filter(o => getRiskLevel(o) === 'high').length;
  const summary = medicationAnalysis?.summary;
  const nextSteps = medicationAnalysis?.next_steps || [];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLabel = (risk) => {
    switch (risk) {
      case 'high': return 'High Priority';
      case 'moderate': return 'Moderate';
      case 'low': return 'Low Priority';
      default: return 'Review';
    }
  };

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const riskOrder = { high: 0, moderate: 1, low: 2 };
    return (riskOrder[getRiskLevel(a)] || 3) - (riskOrder[getRiskLevel(b)] || 3);
  });

  const handleAddCondition = (opp) => {
    const conditionName = getConditionName(opp);
    if (onAddCondition && conditionName && conditionName !== 'Unknown Condition') {
      onAddCondition(conditionName);
    }
  };

  const canAddCondition = (opp) => {
    const conditionName = getConditionName(opp);
    return onAddCondition && conditionName && conditionName !== 'Unknown Condition';
  };

  return (
    <Card className="border-2 border-blue-200 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-[#1B3A5F] to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-[#1B3A5F]" />
            Medication Side Effects Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            {highPriorityCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                {highPriorityCount} High Priority
              </span>
            )}
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
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-[#1B3A5F] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#1B3A5F]">
              <p className="font-medium">Secondary Condition Opportunities Found</p>
              <p className="mt-1 text-[#1B3A5F]">
                {summary || `We found ${opportunities.length} potential secondary conditions based on your medications that may be VA-claimable under 38 CFR §3.310.`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-700">{opportunities.length}</div>
            <div className="text-xs text-slate-500">Opportunities</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
            <div className="text-xs text-slate-500">High Priority</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {opportunities.filter(o => getRiskLevel(o) === 'moderate').length}
            </div>
            <div className="text-xs text-slate-500">Moderate</div>
          </div>
        </div>

        {!expanded && sortedOpportunities.slice(0, 3).map((opp, idx) => {
          const riskLevel = getRiskLevel(opp);
          const conditionName = getConditionName(opp);
          return (
            <div 
              key={idx}
              className={`flex items-center justify-between p-2 mb-2 rounded-lg border ${getRiskColor(riskLevel)}`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium text-sm">{conditionName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">{getRiskLabel(riskLevel)}</span>
                {canAddCondition(opp) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => handleAddCondition(opp)}
                    title="Add as secondary condition"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {!expanded && opportunities.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            className="w-full text-[#1B3A5F] hover:text-[#1B3A5F] hover:bg-blue-50"
          >
            View all {opportunities.length} opportunities
          </Button>
        )}

        {expanded && (
          <div className="space-y-4">
            <div className="space-y-2">
              {sortedOpportunities.map((opp, idx) => {
                const riskLevel = getRiskLevel(opp);
                const conditionName = getConditionName(opp);
                const sourceMedication = getSourceMedication(opp);
                
                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${getRiskColor(riskLevel)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">{conditionName}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getRiskColor(riskLevel)}`}>
                            {getRiskLabel(riskLevel)}
                          </span>
                        </div>
                        {sourceMedication && (
                          <p className="text-xs mt-1 opacity-80">
                            From: {sourceMedication}
                          </p>
                        )}
                        {opp.timeframe && (
                          <p className="text-xs mt-1 opacity-80">
                            Timeframe: {opp.timeframe}
                          </p>
                        )}
                        {(opp.rationale || opp.reason) && (
                          <p className="text-xs mt-2 opacity-90">
                            {opp.rationale || opp.reason}
                          </p>
                        )}
                        {opp.nexus_evidence && (
                          <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                            <span className="font-medium flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Nexus Evidence:
                            </span>
                            <p className="mt-1 opacity-90">{opp.nexus_evidence}</p>
                          </div>
                        )}
                        {opp.supporting_findings && Array.isArray(opp.supporting_findings) && opp.supporting_findings.length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Supporting Findings:</span>
                            <ul className="mt-1 ml-3 list-disc opacity-90">
                              {opp.supporting_findings.slice(0, 3).map((finding, fidx) => (
                                <li key={fidx}>{finding}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {canAddCondition(opp) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="ml-2 flex-shrink-0"
                          onClick={() => handleAddCondition(opp)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {nextSteps && nextSteps.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Recommended Next Steps
                </h4>
                <ul className="space-y-1">
                  {nextSteps.map((step, idx) => (
                    <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-1 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium">38 CFR §3.310 Secondary Service Connection</p>
                  <p className="mt-1">
                    Secondary conditions caused by medications prescribed for a service-connected 
                    disability may be eligible for VA compensation. Medical documentation linking 
                    the medication to the secondary condition is required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
