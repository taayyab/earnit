import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  Shield, CheckCircle, AlertTriangle, DollarSign, 
  Clock, FileText, Zap, ArrowRight
} from 'lucide-react';
import api from '../../lib/api';

export default function SSDIStart() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get('claim_id');
  
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (claimId) {
      checkEligibility();
    } else {
      setError('No claim ID provided');
      setLoading(false);
    }
  }, [claimId]);

  const checkEligibility = async () => {
    try {
      const response = await api.get(`/ssdi/eligibility/${claimId}`);
      if (response.data.success) {
        setEligibility(response.data.eligibility);
      }
    } catch (err) {
      setError('Failed to check eligibility');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startApplication = async () => {
    if (!acknowledged) return;
    
    setStarting(true);
    try {
      const response = await api.post('/ssdi/start', {
        claim_id: claimId,
        acknowledge_requirements: acknowledged
      });
      
      if (response.data.success) {
        navigate(`/ssdi/${response.data.ssdi_application.id}/education`);
      } else {
        setError(response.data.error || 'Failed to start application');
      }
    } catch (err) {
      setError('Failed to start SSDI application');
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !eligibility) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="h-6 w-6" />
              <span>{error}</span>
            </div>
            <Button className="mt-4" onClick={() => navigate('/claims')}>
              Return to Claims
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Start Your SSDI Application</h1>
        <p className="text-gray-600 mt-2">
          Social Security Disability Insurance
        </p>
      </div>

      {eligibility?.expedited_eligible && (
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <span className="font-semibold text-purple-900">Expedited Processing Available</span>
                <p className="text-purple-700 text-sm">
                  {eligibility.expedited_reason === 'va_100_pt' 
                    ? 'Your 100% Permanent & Total VA rating qualifies you for faster processing.'
                    : 'You qualify for SSA expedited processing.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Eligibility Assessment</CardTitle>
          <CardDescription>Based on your approved VA disability claim</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">VA Disability Rating</span>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {eligibility?.va_rating}%
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">SSDI Eligibility Score</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(eligibility?.eligibility_score || 0) * 100}%` }}
                  />
                </div>
                <span className="font-semibold">
                  {Math.round((eligibility?.eligibility_score || 0) * 100)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Conditions Documented</span>
              <span className="font-semibold">{eligibility?.conditions_count || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="h-5 w-5" />
            Important: Work Limitations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800">
          <p className="mb-3">
            <strong>SSDI requires that you cannot work at a substantial level.</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>You must earn less than $1,620/month (2025 threshold)</li>
            <li>SSDI is "all-or-nothing" - no partial disability like VA</li>
            <li>If you're currently working above this amount, you may not qualify</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What's Next</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { icon: FileText, title: 'Education Module', desc: 'Learn about SSDI requirements (10 min)' },
              { icon: CheckCircle, title: 'Sign Consents', desc: 'Authorize medical records release' },
              { icon: FileText, title: 'Review Forms', desc: 'We auto-fill SSA forms from your VA data' },
              { icon: Clock, title: 'Submit', desc: 'Apply online or receive print packet' }
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <step.icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{step.title}</div>
                  <div className="text-sm text-gray-600">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Checkbox 
              id="acknowledge" 
              checked={acknowledged}
              onCheckedChange={setAcknowledged}
            />
            <label htmlFor="acknowledge" className="text-sm text-gray-700 cursor-pointer">
              I understand that SSDI requires me to be unable to work at substantial levels. 
              I understand that VA disability approval does not guarantee SSDI approval, and 
              that SSA uses different criteria to evaluate disability.
            </label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/claims')}>
          Cancel
        </Button>
        <Button 
          onClick={startApplication}
          disabled={!acknowledged || starting}
          className="gap-2"
        >
          {starting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Starting...
            </>
          ) : (
            <>
              Start SSDI Application
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
