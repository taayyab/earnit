import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  FileText, CheckCircle, ArrowRight, Shield, AlertTriangle
} from 'lucide-react';
import api from '../../lib/api';

const CONSENT_ITEMS = [
  {
    id: 'ssdi_education',
    title: 'SSDI Understanding',
    description: 'I have completed the SSDI education module and understand the requirements.',
    required: true
  },
  {
    id: 'work_limitation',
    title: 'Work Limitation Acknowledgment',
    description: 'I understand that SSDI requires inability to perform substantial gainful activity (earning less than $1,620/month in 2025).',
    required: true
  },
  {
    id: 'medical_release',
    title: 'Medical Records Release (SSA-827)',
    description: 'I authorize the Social Security Administration to obtain my medical records from VA and other healthcare providers.',
    required: true
  },
  {
    id: 'va_data_sharing',
    title: 'VA Claim Data Sharing',
    description: 'I authorize EarnedIt to use my VA claim data to pre-populate SSA application forms.',
    required: true
  },
  {
    id: 'representative',
    title: 'Representative Appointment (SSA-1696)',
    description: 'I appoint EarnedIt to act as my representative for this SSDI application.',
    required: false
  },
  {
    id: 'fee_agreement',
    title: 'Fee Agreement',
    description: 'I understand the fee structure: 25% of past-due benefits, capped at $9,200 (SSA maximum).',
    required: false
  }
];

export default function SSDIConsent() {
  const navigate = useNavigate();
  const { ssdiId } = useParams();
  
  const [consents, setConsents] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleConsentChange = (id, checked) => {
    setConsents({ ...consents, [id]: checked });
  };

  const submitConsents = async () => {
    const requiredItems = CONSENT_ITEMS.filter(c => c.required);
    const allRequiredSigned = requiredItems.every(c => consents[c.id]);
    
    if (!allRequiredSigned) {
      setError('Please accept all required consents');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      let lastResponse = null;
      for (const item of CONSENT_ITEMS) {
        if (consents[item.id]) {
          lastResponse = await api.post('/ssdi/consent', {
            ssdi_application_id: ssdiId,
            consent_type: item.id,
            consented: true,
            signature_type: 'checkbox'
          });
        }
      }
      
      if (lastResponse?.data?.should_generate_forms) {
        try {
          await api.post(`/ssdi/forms/generate/${ssdiId}`);
        } catch (genErr) {
          console.warn('Form generation will happen on forms page:', genErr);
        }
      }
      
      navigate(`/ssdi/${ssdiId}/forms`);
    } catch (err) {
      setError('Failed to submit consents');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const requiredCount = CONSENT_ITEMS.filter(c => c.required).length;
  const signedRequiredCount = CONSENT_ITEMS.filter(c => c.required && consents[c.id]).length;
  const allRequiredSigned = signedRequiredCount === requiredCount;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Consent & Authorization</h1>
        </div>
        <p className="text-gray-600">
          Review and accept the required consents to proceed with your SSDI application.
        </p>
      </div>

      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <span className="font-medium text-blue-900">Your Privacy is Protected</span>
              <p className="text-blue-700 text-sm">
                All consents are stored securely and comply with HIPAA requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 mb-6">
        {CONSENT_ITEMS.map((item) => (
          <Card 
            key={item.id} 
            className={`transition-all ${consents[item.id] ? 'border-green-300 bg-green-50' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  id={item.id}
                  checked={consents[item.id] || false}
                  onCheckedChange={(checked) => handleConsentChange(item.id, checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label 
                    htmlFor={item.id} 
                    className="font-medium text-gray-900 cursor-pointer flex items-center gap-2"
                  >
                    {item.title}
                    {item.required && (
                      <span className="text-xs text-red-600 font-normal">Required</span>
                    )}
                    {consents[item.id] && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Required consents signed</span>
            <span className={`font-semibold ${allRequiredSigned ? 'text-green-600' : 'text-gray-600'}`}>
              {signedRequiredCount} of {requiredCount}
            </span>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => navigate(`/ssdi/${ssdiId}/education`)}
        >
          Back
        </Button>
        <Button 
          onClick={submitConsents}
          disabled={!allRequiredSigned || submitting}
          className="gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              Continue to Forms
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
