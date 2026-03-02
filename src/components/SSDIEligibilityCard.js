import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DollarSign, ArrowRight, Shield, Zap, AlertCircle, CheckCircle
} from 'lucide-react';
import api from '../lib/api';

export default function SSDIEligibilityCard({ claimId, claimStatus, vaRating }) {
  const navigate = useNavigate();
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [checked, setChecked] = useState(false);

  const isApprovedClaim = claimStatus === 'approved' || claimStatus === 'APPROVED';
  const meetsRatingThreshold = vaRating >= 70;

  useEffect(() => {
    if (isApprovedClaim && meetsRatingThreshold && !checked) {
      checkEligibility();
    }
  }, [claimId, claimStatus, vaRating]);

  const checkEligibility = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/ssdi/eligibility/${claimId}`);
      if (response.data.success) {
        setEligibility(response.data.eligibility);
        if (response.data.eligibility.existing_application_id) {
          setExistingApplication(response.data.eligibility.existing_application_id);
        }
      }
    } catch (err) {
      console.error('Failed to check SSDI eligibility:', err);
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };

  if (!isApprovedClaim) {
    return null;
  }

  if (!meetsRatingThreshold) {
    return null;
  }

  if (loading) {
    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-700">Checking SSDI eligibility...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (existingApplication) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">SSDI Application In Progress</h4>
                <p className="text-sm text-green-700">You've already started an SSDI application for this claim</p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate(`/ssdi/${existingApplication}`)}
              className="gap-2"
            >
              View Application
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!eligibility?.eligible) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900">Eligible for SSDI Benefits</CardTitle>
              <CardDescription className="text-blue-700">
                Additional monthly income based on your work history
              </CardDescription>
            </div>
          </div>
          {eligibility.expedited_eligible && (
            <Badge className="bg-blue-50 text-[#1B3A5F] border-blue-200">
              <Zap className="h-3 w-3 mr-1" />
              Expedited
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">VA Rating: <strong>{vaRating}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-gray-700">
                Eligibility Score: <strong>{Math.round((eligibility.eligibility_score || 0) * 100)}%</strong>
              </span>
            </div>
          </div>
          
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <strong>What is SSDI?</strong> Social Security Disability Insurance provides monthly income 
              (avg. $1,580/month) to people who can't work due to disability. You can receive both 
              VA disability and SSDI simultaneously.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4" />
              <span>Requires inability to work at substantial levels</span>
            </div>
            <Button 
              onClick={() => navigate(`/ssdi/start?claim_id=${claimId}`)}
              className="gap-2"
            >
              Learn More & Apply
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
