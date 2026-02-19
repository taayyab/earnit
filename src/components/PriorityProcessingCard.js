import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Zap, 
  Shield, 
  Heart, 
  Home, 
  DollarSign, 
  FileCheck, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const REASON_DISPLAY = {
  purple_heart: {
    label: 'Purple Heart Recipient',
    icon: Heart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  homeless: {
    label: 'Experiencing Homelessness',
    icon: Home,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  terminal_illness: {
    label: 'Terminal Illness',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  financial_hardship: {
    label: 'Extreme Financial Hardship',
    icon: DollarSign,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
};

export function PriorityProcessingCard({ claimId, veteranId, showRequestButton = true }) {
  const [status, setStatus] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [generatingForm, setGeneratingForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPriorityStatus();
  }, [claimId, veteranId]);

  const loadPriorityStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const promises = [];
      
      if (claimId) {
        promises.push(api.get(`/priority-processing/status/${claimId}`).catch(() => ({ data: null })));
      } else {
        promises.push(Promise.resolve({ data: null }));
      }
      
      if (veteranId) {
        promises.push(api.get(`/priority-processing/eligibility/${veteranId}`).catch(() => ({ data: null })));
      } else {
        promises.push(api.get('/priority-processing/eligibility').catch(() => ({ data: null })));
      }
      
      const [statusRes, eligibilityRes] = await Promise.all(promises);
      
      if (statusRes.data && statusRes.data.success !== false) {
        setStatus(statusRes.data);
      }
      
      if (eligibilityRes.data) {
        setEligibility(eligibilityRes.data);
      }
    } catch (err) {
      console.error('Failed to load priority processing status:', err);
      setError('Failed to load priority processing status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateForm = async () => {
    if (!claimId) {
      toast.error('No claim selected for form generation');
      return;
    }
    
    try {
      setGeneratingForm(true);
      const res = await api.post(`/priority-processing/generate-form/${claimId}`);
      
      if (res.data.success) {
        toast.success('VA Form 20-10207 generated successfully');
        loadPriorityStatus();
      } else {
        toast.error(res.data.message || 'Failed to generate form');
      }
    } catch (err) {
      toast.error('Failed to generate priority processing form');
    } finally {
      setGeneratingForm(false);
    }
  };

  const handleRequestPriority = async () => {
    if (!claimId) {
      toast.error('No claim selected for priority processing');
      return;
    }
    
    try {
      setRequesting(true);
      const res = await api.post(`/priority-processing/request/${claimId}`);
      
      if (res.data.success) {
        toast.success('Priority processing activated for your claim');
        loadPriorityStatus();
      } else {
        toast.error(res.data.message || 'Unable to activate priority processing');
      }
    } catch (err) {
      toast.error('Failed to request priority processing');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Checking eligibility...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <Button variant="ghost" size="sm" onClick={loadPriorityStatus}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const isPriorityActive = status?.priority_processing;
  const reason = isPriorityActive ? status?.reason : eligibility?.reason;
  const isEligible = eligibility?.eligible;
  const reasonConfig = REASON_DISPLAY[reason] || null;
  
  const allCategories = Object.entries(REASON_DISPLAY);
  const eligibleCategories = eligibility?.eligible_categories || [];

  if (isPriorityActive) {
    const ReasonIcon = reasonConfig?.icon || Zap;
    return (
      <Card className={`${reasonConfig?.borderColor || 'border-green-200'} ${reasonConfig?.bgColor || 'bg-green-50'} border-2`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-yellow-500" />
            Priority Processing Active
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <ReasonIcon className={`h-4 w-4 ${reasonConfig?.color || 'text-green-600'}`} />
            <span className="text-sm font-medium">
              {reasonConfig?.label || 'Qualifying Status'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600">
            Your claim is being expedited based on your qualifying status. VA Form 20-10207 will be included with your submission.
          </p>
          
          <div className="space-y-2 pt-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Eligibility Categories</div>
            {allCategories.map(([key, config]) => {
              const CategoryIcon = config.icon;
              const isQualified = key === reason || eligibleCategories.includes(key);
              return (
                <div key={key} className={`flex items-center gap-2 p-2 rounded ${isQualified ? config.bgColor : 'bg-gray-50'}`}>
                  <CategoryIcon className={`h-4 w-4 ${isQualified ? config.color : 'text-gray-400'}`} />
                  <span className={`text-sm ${isQualified ? 'font-medium' : 'text-gray-500'}`}>{config.label}</span>
                  {isQualified && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {status?.form_generated ? (
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                <FileCheck className="h-3 w-3 mr-1" />
                Form 20-10207 Ready
              </Badge>
            ) : (
              <>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Form 20-10207 Pending
                </Badge>
                {claimId && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleGenerateForm}
                    disabled={generatingForm}
                  >
                    {generatingForm ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-3 w-3 mr-1" />
                        Generate Form
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
            
            {status?.auto_triggered && (
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                Auto-Detected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEligible && showRequestButton && claimId) {
    const ReasonIcon = reasonConfig?.icon || Zap;
    return (
      <Card className={`${reasonConfig?.borderColor || 'border-blue-200'} border-2`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-500" />
            Priority Processing Available
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <ReasonIcon className={`h-4 w-4 ${reasonConfig?.color || 'text-blue-600'}`} />
            <span className="text-sm font-medium">
              {reasonConfig?.label || 'You may qualify'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600">
            {eligibility?.recommendation || 'Based on your profile, you may qualify for expedited claim processing.'}
          </p>
          
          <Button 
            onClick={handleRequestPriority} 
            disabled={requesting}
            className="w-full"
          >
            {requesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Activate Priority Processing
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export function PriorityProcessingBadge({ claimId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (claimId) {
      loadStatus();
    }
  }, [claimId]);

  const loadStatus = async () => {
    try {
      const res = await api.get(`/priority-processing/status/${claimId}`);
      if (res.data && res.data.success !== false) {
        setStatus(res.data);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status?.priority_processing) {
    return null;
  }

  return (
    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
      <Zap className="h-3 w-3 mr-1" />
      Priority
    </Badge>
  );
}

export default PriorityProcessingCard;
