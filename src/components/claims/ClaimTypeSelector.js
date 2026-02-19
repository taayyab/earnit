import React, { useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  RefreshCw, 
  ArrowUp, 
  Scale,
  CheckCircle2,
  Info,
  AlertTriangle,
  Shield,
  Database
} from 'lucide-react';
import { useContentionTypes } from '../../hooks/useBenefitsReferenceData';

const CLAIM_TYPES = [
  {
    id: 'original',
    name: 'Original Claim',
    description: 'First-time disability claim - never filed before',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-300',
    feeInfo: 'No fees per 38 CFR 14.636',
    feeEligible: false
  },
  {
    id: 'meb_ides',
    name: 'MEB/IDES Claim',
    description: 'Medical Evaluation Board or Integrated Disability Evaluation System',
    icon: Shield,
    color: 'bg-indigo-100 text-indigo-700',
    borderColor: 'border-indigo-300',
    feeInfo: 'No fees for active duty members',
    feeEligible: false,
    isMebIdes: true
  },
  {
    id: 'supplemental',
    name: 'Supplemental Claim',
    description: 'New evidence after a prior VA decision',
    icon: RefreshCw,
    color: 'bg-green-100 text-green-700',
    borderColor: 'border-green-300',
    feeInfo: 'Fees may apply on past-due benefits only',
    feeEligible: true,
    requiresPriorDecision: true
  },
  {
    id: 'higher_level_review',
    name: 'Higher-Level Review',
    description: 'Request senior reviewer examine prior decision',
    icon: ArrowUp,
    color: 'bg-amber-100 text-amber-700',
    borderColor: 'border-amber-300',
    feeInfo: 'Fees may apply on past-due benefits only',
    feeEligible: true,
    requiresPriorDecision: true
  },
  {
    id: 'board_appeal',
    name: 'Board Appeal',
    description: 'Appeal to the Board of Veterans\' Appeals',
    icon: Scale,
    color: 'bg-purple-100 text-purple-700',
    borderColor: 'border-purple-300',
    feeInfo: 'Fees may apply on past-due benefits only',
    feeEligible: true,
    requiresPriorDecision: true
  }
];

const CONTENTION_CODE_TO_CLAIM = {
  NEW: 'original',
  INC: 'supplemental',
  SEC: 'original'
};

export default function ClaimTypeSelector({ 
  selectedType = 'original',
  onTypeSelect,
  priorDecisionDate = null,
  disabled = false
}) {
  const { contentionTypes, loading: contentionLoading, source: contentionSource } = useContentionTypes();

  const contentionsByClaimType = useMemo(() => {
    if (!contentionTypes || contentionTypes.length === 0) return {};
    const map = {};
    contentionTypes.forEach((ct) => {
      const claimId = CONTENTION_CODE_TO_CLAIM[ct.code];
      if (claimId) {
        if (!map[claimId]) map[claimId] = [];
        map[claimId].push(ct);
      }
    });
    return map;
  }, [contentionTypes]);

  const vaDataLoaded = !contentionLoading && contentionTypes.length > 0;

  const handleSelect = (typeId) => {
    if (disabled) return;
    onTypeSelect(typeId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Claim Type</h3>
          {vaDataLoaded && (
            <span 
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
              title={`Contention types loaded from ${contentionSource === 'fallback' ? 'local data' : 'VA reference data'}`}
            >
              <Database className="w-3 h-3" aria-hidden="true" />
              VA Data
            </span>
          )}
        </div>
        <a 
          href="/faq#claim-types" 
          className="text-sm text-[#1B3A5F] hover:underline flex items-center gap-1"
          aria-label="Learn more about claim types"
        >
          <Info className="w-4 h-4" aria-hidden="true" />
          Learn more
        </a>
      </div>

      <div 
        className="grid md:grid-cols-2 gap-4" 
        role="radiogroup" 
        aria-label="Select claim type"
      >
        {CLAIM_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          const needsPriorDecision = type.requiresPriorDecision && !priorDecisionDate;

          return (
            <Card
              key={type.id}
              className={`
                cursor-pointer transition-all
                ${isSelected 
                  ? `border-2 ${type.borderColor} ring-2 ring-offset-2 ring-${type.borderColor.replace('border-', '')}` 
                  : 'border hover:border-slate-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleSelect(type.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(type.id);
                }
              }}
              role="radio"
              aria-checked={isSelected}
              aria-describedby={`${type.id}-description`}
              tabIndex={disabled ? -1 : 0}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{type.name}</p>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                      )}
                    </div>
                    <p id={`${type.id}-description`} className="text-sm text-slate-600 mt-1">
                      {type.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <Badge 
                        className={`text-xs ${type.feeEligible ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}
                      >
                        {type.feeInfo}
                      </Badge>
                      {contentionsByClaimType[type.id]?.map((ct) => (
                        <Badge
                          key={ct.code}
                          className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200"
                          title={ct.name}
                        >
                          {ct.code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {type.requiresPriorDecision && isSelected && !priorDecisionDate && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg flex items-start gap-2" role="alert">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-amber-700">
                      This claim type requires a prior VA decision date. You'll be asked to provide this.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType === 'original' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg" role="status">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium text-green-900">Original Claim Selected</p>
              <p className="text-sm text-green-700 mt-1">
                Per federal law (38 CFR 14.636), no fees may be charged for assistance with original 
                disability claim preparation.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedType === 'meb_ides' && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg" role="status">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium text-indigo-900">MEB/IDES Claim Selected</p>
              <p className="text-sm text-indigo-700 mt-1">
                For active duty service members going through the Medical Evaluation Board or 
                Integrated Disability Evaluation System. We'll help you track IDES milestones 
                and ensure all required documentation is collected.
              </p>
              <ul className="text-sm text-indigo-700 mt-2 space-y-1">
                <li>- Physical Evaluation Board (PEB) findings tracking</li>
                <li>- Line of Duty (LOD) determination documentation</li>
                <li>- IDES timeline and milestone management</li>
                <li>- Coordination with your PEBLO contact</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedType !== 'original' && selectedType !== 'meb_ides' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg" role="status">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium text-blue-900">Fee Disclosure</p>
              <p className="text-sm text-blue-700 mt-1">
                For appeals and supplemental claims, fees may apply per 38 CFR 14.636. Fees are:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>- Capped at 20% (direct-pay) or 33.33% (non-direct-pay)</li>
                <li>- Applied only to past-due benefits, never ongoing payments</li>
                <li>- Contingent on successful claim outcomes</li>
                <li>- Requires signed fee agreement filed with VA</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
