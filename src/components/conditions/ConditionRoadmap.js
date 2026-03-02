import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Circle, AlertTriangle, Clock, FileText, Calendar, ChevronRight, Shield, Info, Download, ExternalLink, HelpCircle, Lightbulb, Upload, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../lib/api';
import { toast } from 'sonner';

const EVIDENCE_GUIDANCE = {
  current_diagnosis: {
    title: 'How to Get a Current Medical Diagnosis',
    steps: [
      'Schedule an appointment with your primary care physician or specialist',
      'Request a formal written diagnosis that includes the specific medical condition',
      'Ensure the diagnosis is dated within the last year for best results',
      'Ask your doctor to document how the condition affects your daily life'
    ],
    tips: [
      'VA healthcare providers can provide diagnoses at no cost if enrolled',
      'Community health centers offer low-cost medical evaluations',
      'Telehealth appointments can expedite the diagnosis process'
    ],
    vaForm: null,
    templateType: 'dbq'
  },
  service_treatment: {
    title: 'How to Obtain Service Treatment Records',
    steps: [
      'Submit SF-180 form to the National Personnel Records Center (NPRC)',
      'Request records through eBenefits or va.gov',
      'Contact your branch\'s personnel office for expedited requests',
      'Allow 2-4 weeks for standard processing'
    ],
    tips: [
      'Keep copies of any "sick call" or medical visit records you may have',
      'Request "all medical and dental records" to be thorough',
      'If records were lost in the 1973 NPRC fire, submit NA Form 13055'
    ],
    vaForm: 'SF-180',
    templateType: null
  },
  nexus_letter: {
    title: 'Understanding Nexus Letters',
    steps: [
      'Find a qualified medical professional familiar with VA claims',
      'Provide them with your service records and medical history',
      'Ask them to write a letter connecting your condition to military service',
      'Ensure they use the phrase "at least as likely as not" (50% or greater probability)'
    ],
    tips: [
      'EarnedIT can generate AI-assisted nexus letter drafts for your doctor to review',
      'Independent Medical Opinions (IMOs) from specialists carry significant weight',
      'VA-employed doctors can also provide nexus statements during C&P exams'
    ],
    vaForm: null,
    templateType: 'nexus'
  },
  dd214: {
    title: 'Obtaining Your DD-214',
    steps: [
      'Request through eVetRecs (archives.gov/veterans)',
      'Submit SF-180 to NPRC for official copy',
      'Check with your state veterans affairs office for expedited service',
      'Contact your county recorder if you filed a copy after discharge'
    ],
    tips: [
      'Many states have "DD-214 on Demand" programs for faster access',
      'Veterans Service Organizations (VSOs) can help retrieve records',
      'Emergency requests can be processed in 24-72 hours'
    ],
    vaForm: 'SF-180',
    templateType: null
  },
  buddy_statement: {
    title: 'Getting Effective Buddy Statements',
    steps: [
      'Reach out to fellow service members who witnessed your condition/injury',
      'Ask them to describe specific events, dates, and locations',
      'Have them sign and date the statement',
      'Include their contact information and service dates'
    ],
    tips: [
      'Statements don\'t need to be notarized but should be signed under penalty of perjury',
      'Family members can also provide statements about condition impact',
      'EarnedIT provides a buddy statement template to guide the format'
    ],
    vaForm: '21-10210',
    templateType: 'buddy'
  },
  personal_statement: {
    title: 'Writing Your Personal Statement',
    steps: [
      'Describe how and when your condition began or worsened during service',
      'Explain specific incidents, injuries, or exposures',
      'Detail how the condition affects your daily life and work',
      'Include any treatment or medications you use'
    ],
    tips: [
      'Be honest and specific - dates and details strengthen your claim',
      'Focus on functional limitations (what you can\'t do)',
      'EarnedIT provides a personal statement template with guided questions'
    ],
    vaForm: '21-4138',
    templateType: 'personal'
  }
};

const VA_REQUIREMENTS = {
  default: [
    { id: 'current_diagnosis', title: 'Current Medical Diagnosis', description: 'A diagnosis of the condition from a qualified medical professional', mandatory: true, category: 'medical' },
    { id: 'service_treatment', title: 'Service Treatment Records', description: 'Medical records from during your military service', mandatory: true, category: 'military' },
    { id: 'nexus_letter', title: 'Nexus Letter/Medical Opinion', description: 'A medical opinion connecting your condition to service', mandatory: true, category: 'medical' },
    { id: 'dd214', title: 'DD-214 Discharge Papers', description: 'Proof of military service and discharge status', mandatory: true, category: 'military' },
    { id: 'buddy_statement', title: 'Buddy Statements', description: 'Written statements from fellow service members', mandatory: false, category: 'supporting' },
    { id: 'personal_statement', title: 'Personal Statement', description: 'Your own account of the condition and its impact', mandatory: false, category: 'supporting' },
  ],
  presumptive: [
    { id: 'current_diagnosis', title: 'Current Medical Diagnosis', description: 'A diagnosis of the presumptive condition', mandatory: true, category: 'medical' },
    { id: 'dd214', title: 'DD-214 Discharge Papers', description: 'Proof of qualifying service period/location', mandatory: true, category: 'military' },
    { id: 'personal_statement', title: 'Personal Statement', description: 'Statement about condition impact on daily life', mandatory: false, category: 'supporting' },
  ]
};

const AVERAGE_DELAY_DAYS = {
  missing_one: 45,
  missing_two: 90,
  missing_three_plus: 180
};

const getGuidanceKey = (req) => {
  if (req.requirement_key && EVIDENCE_GUIDANCE[req.requirement_key]) {
    return req.requirement_key;
  }
  if (req.type && EVIDENCE_GUIDANCE[req.type]) {
    return req.type;
  }
  if (EVIDENCE_GUIDANCE[req.id]) {
    return req.id;
  }
  const titleToKey = {
    'current medical diagnosis': 'current_diagnosis',
    'medical diagnosis': 'current_diagnosis',
    'diagnosis': 'current_diagnosis',
    'service treatment records': 'service_treatment',
    'service records': 'service_treatment',
    'treatment records': 'service_treatment',
    'nexus letter': 'nexus_letter',
    'medical opinion': 'nexus_letter',
    'nexus': 'nexus_letter',
    'dd-214': 'dd214',
    'dd214': 'dd214',
    'discharge papers': 'dd214',
    'buddy statement': 'buddy_statement',
    'buddy statements': 'buddy_statement',
    'lay statement': 'buddy_statement',
    'personal statement': 'personal_statement',
    'statement in support': 'personal_statement'
  };
  const lowerTitle = (req.title || '').toLowerCase();
  for (const [pattern, key] of Object.entries(titleToKey)) {
    if (lowerTitle.includes(pattern)) {
      return key;
    }
  }
  return null;
};

export default function ConditionRoadmap({ 
  condition, 
  isOpen, 
  onClose, 
  onSave,
  claimId 
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploadingReqId, setUploadingReqId] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [pendingOverrideId, setPendingOverrideId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGuidance, setShowGuidance] = useState(null);

  const handleUploadClick = (reqId) => {
    setUploadingReqId(reqId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset so the same file can be re-selected if needed
    e.target.value = '';

    const formData = new FormData();
    formData.append('file', file);
    if (claimId) formData.append('claim_id', claimId);
    if (uploadingReqId) formData.append('requirement_id', uploadingReqId);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`"${file.name}" uploaded successfully`);
      // Refresh requirements so the status updates in the modal
      await loadRequirements();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingReqId(null);
    }
  };

  useEffect(() => {
    if (isOpen && condition) {
      loadRequirements();
    }
  }, [isOpen, condition]);

  const loadRequirements = async () => {
    setLoading(true);
    
    // If no database ID, use local template requirements only
    if (!condition.id) {
      const templateReqs = condition.is_presumptive ? VA_REQUIREMENTS.presumptive : VA_REQUIREMENTS.default;
      setRequirements(templateReqs.map((req, idx) => ({
        ...req,
        id: req.id || `req_${idx}`,
        status: 'missing',
        is_overridden: false
      })));
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.get(`/conditions/condition/${condition.id}/requirements`);
      if (response.data.requirements?.length > 0) {
        setRequirements(response.data.requirements);
        const existingOverrides = {};
        response.data.requirements.forEach(req => {
          if (req.is_overridden) {
            existingOverrides[req.id] = true;
          }
        });
        setOverrides(existingOverrides);
      } else {
        const templateReqs = condition.is_presumptive ? VA_REQUIREMENTS.presumptive : VA_REQUIREMENTS.default;
        setRequirements(templateReqs.map((req, idx) => ({
          ...req,
          id: req.id || `req_${idx}`,
          status: 'missing',
          is_overridden: false
        })));
      }
    } catch (err) {
      const templateReqs = condition.is_presumptive ? VA_REQUIREMENTS.presumptive : VA_REQUIREMENTS.default;
      setRequirements(templateReqs.map((req, idx) => ({
        ...req,
        id: req.id || `req_${idx}`,
        status: 'missing',
        is_overridden: false
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideClick = (reqId) => {
    setPendingOverrideId(reqId);
    setShowDisclaimer(true);
  };

  const confirmOverride = () => {
    if (pendingOverrideId) {
      setOverrides(prev => ({
        ...prev,
        [pendingOverrideId]: !prev[pendingOverrideId]
      }));
    }
    setShowDisclaimer(false);
    setPendingOverrideId(null);
  };

  const cancelOverride = () => {
    setShowDisclaimer(false);
    setPendingOverrideId(null);
  };

  const getCompletionStats = () => {
    const mandatoryReqs = requirements.filter(r => r.mandatory);
    const completedOrOverridden = mandatoryReqs.filter(r => 
      r.status === 'received' || r.status === 'reviewed' || overrides[r.id]
    );
    const missingCount = mandatoryReqs.length - completedOrOverridden.length;
    
    let estimatedDelay = 0;
    if (missingCount === 1) estimatedDelay = AVERAGE_DELAY_DAYS.missing_one;
    else if (missingCount === 2) estimatedDelay = AVERAGE_DELAY_DAYS.missing_two;
    else if (missingCount >= 3) estimatedDelay = AVERAGE_DELAY_DAYS.missing_three_plus;
    
    return {
      total: mandatoryReqs.length,
      completed: completedOrOverridden.length,
      missing: missingCount,
      overrideCount: Object.values(overrides).filter(Boolean).length,
      estimatedDelay,
      progress: Math.round((completedOrOverridden.length / mandatoryReqs.length) * 100)
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const overrideIds = Object.entries(overrides)
        .filter(([_, val]) => val)
        .map(([id]) => id);
      
      // Only call API if condition has a database ID
      if (condition.id) {
        await api.put(`/conditions/condition/${condition.id}/overrides`, {
          overrides: overrideIds,
          justification: overrideIds.length > 0 
            ? 'Veteran acknowledged missing requirements and wishes to proceed' 
            : null
        });
        toast.success('Requirements updated');
      } else {
        // For non-persisted conditions, just close with local stats
        toast.success('Progress saved locally');
      }
      
      const stats = getCompletionStats();
      onSave?.({
        requirements,
        overrides,
        stats: {
          completed: stats.completed,
          total: stats.total,
          percentage: stats.progress,
          complete: stats.missing === 0
        }
      });
      onClose();
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const stats = getCompletionStats();

  const getStatusIcon = (req) => {
    if (overrides[req.id]) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
    if (req.status === 'received' || req.status === 'reviewed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Circle className="h-5 w-5 text-neutral-300" />;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medical': return <FileText className="h-4 w-4" />;
      case 'military': return <Shield className="h-4 w-4" />;
      case 'supporting': return <Info className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Hidden file input — triggered programmatically by Upload Document buttons */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.txt"
        className="hidden"
        onChange={handleFileSelected}
      />
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{condition.condition_name || condition.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {condition.is_presumptive && (
                <Badge className="bg-blue-50 text-[#1B3A5F] border-0">
                  <Shield className="h-3 w-3 mr-1" />
                  Presumptive
                </Badge>
              )}
              {condition.va_diagnostic_code && (
                <span className="text-sm text-neutral-500">VA Code: {condition.va_diagnostic_code}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-700">Requirements Progress</span>
            <span className="text-sm text-neutral-600">{stats.completed}/{stats.total} complete</span>
          </div>
          <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                stats.overrideCount > 0 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          
          {stats.overrideCount > 0 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {stats.overrideCount} requirement(s) overridden
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Estimated processing delay: <strong>{stats.estimatedDelay} days</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-3xl mb-2">⏳</div>
              <p className="text-neutral-500">Loading requirements...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Evidence Requirements</h3>
              
              {requirements.map((req) => (
                <div 
                  key={req.id}
                  className={`p-4 rounded-lg border transition-all ${
                    overrides[req.id] 
                      ? 'border-amber-300 bg-amber-50'
                      : req.status === 'received' || req.status === 'reviewed'
                        ? 'border-green-200 bg-green-50'
                        : 'border-neutral-200 bg-white hover:border-[#1B3A5F]/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(req)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-neutral-900">{req.title}</h4>
                        {req.mandatory && (
                          <Badge variant="outline" className="text-xs border-red-300 text-red-600">Required</Badge>
                        )}
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          {getCategoryIcon(req.category)}
                          {req.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600">{req.description}</p>
                      
                      {overrides[req.id] && (
                        <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Proceeding without this may delay your claim
                        </p>
                      )}
                      
                      {req.status !== 'received' && req.status !== 'reviewed' && !overrides[req.id] && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {getGuidanceKey(req) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowGuidance(getGuidanceKey(req))}
                              className="text-[#1B3A5F] border-[#1B3A5F]/30 hover:bg-[#1B3A5F]/5"
                            >
                              <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                              How to Get This
                            </Button>
                          )}
                          {getGuidanceKey(req) && EVIDENCE_GUIDANCE[getGuidanceKey(req)]?.templateType && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('/forms-library', '_blank')}
                              className="text-[#1B3A5F] border-[#1B3A5F]/30 hover:bg-[#1B3A5F]/5"
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              Get Template
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={uploadingReqId === req.id}
                            onClick={() => handleUploadClick(req.id)}
                            className="text-green-700 border-green-300 hover:bg-green-50"
                          >
                            {uploadingReqId === req.id ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <Upload className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            {uploadingReqId === req.id ? 'Uploading...' : 'Upload Document'}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {req.mandatory && req.status !== 'received' && req.status !== 'reviewed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOverrideClick(req.id)}
                        className={overrides[req.id] ? 'text-amber-600' : 'text-neutral-500'}
                      >
                        {overrides[req.id] ? 'Undo Override' : 'Override'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[hsl(var(--primary))]"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </div>

      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                Override Requirement?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-700">
                Submitting your claim without providing the required documentation, evidence, or attestation may result in:
              </p>
              <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                <li>Delayed processing of your claim</li>
                <li>Request for additional information from the VA</li>
                <li>Potential denial requiring re-submission</li>
              </ul>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Average delay:</strong> Claims missing required evidence take an average of <strong>45-180 additional days</strong> to process.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={cancelOverride}>
                  Keep Requirement
                </Button>
                <Button 
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  onClick={confirmOverride}
                >
                  Override Anyway
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showGuidance && EVIDENCE_GUIDANCE[showGuidance] && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-lg w-full my-8">
            <CardHeader className="border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[#1B3A5F]">
                  <Lightbulb className="h-5 w-5" />
                  {EVIDENCE_GUIDANCE[showGuidance].title}
                </CardTitle>
                <button 
                  onClick={() => setShowGuidance(null)}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[#1B3A5F]" />
                  Steps to Obtain
                </h4>
                <ol className="space-y-2">
                  {EVIDENCE_GUIDANCE[showGuidance].steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-neutral-700">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B3A5F] text-white flex items-center justify-center text-xs font-medium">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Pro Tips
                </h4>
                <ul className="space-y-1.5">
                  {EVIDENCE_GUIDANCE[showGuidance].tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-blue-700 flex gap-2">
                      <span className="text-blue-500">-</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {(EVIDENCE_GUIDANCE[showGuidance].vaForm || EVIDENCE_GUIDANCE[showGuidance].templateType) && (
                <div className="p-4 bg-[#1B3A5F]/5 border border-[#1B3A5F]/20 rounded-lg">
                  <h4 className="text-sm font-semibold text-[#1B3A5F] mb-3">Related Forms & Templates</h4>
                  <p className="text-xs text-neutral-500 mb-3">Opens in new tab to keep your progress</p>
                  <div className="flex flex-wrap gap-2">
                    {EVIDENCE_GUIDANCE[showGuidance].vaForm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/forms-library', '_blank')}
                        className="text-[#1B3A5F] border-[#1B3A5F]/30"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        VA Form {EVIDENCE_GUIDANCE[showGuidance].vaForm}
                      </Button>
                    )}
                    {EVIDENCE_GUIDANCE[showGuidance].templateType && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/forms-library', '_blank')}
                        className="text-[#1B3A5F] border-[#1B3A5F]/30"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Download Template
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowGuidance(null)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-[#1B3A5F] hover:bg-[#1B3A5F]/90"
                  onClick={() => {
                    setShowGuidance(null);
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
