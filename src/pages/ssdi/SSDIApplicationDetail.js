import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { 
  FileText, CheckCircle, Clock, AlertCircle, 
  ArrowRight, Shield, DollarSign, Calendar,
  BookOpen, FileCheck, Send, RefreshCw, ArrowLeft,
  ExternalLink, MessageCircle
} from 'lucide-react';
import api from '../../lib/api';

const STATUS_CONFIG = {
  eligible_pending: { label: 'Eligible', color: 'blue', icon: Shield, step: 1 },
  education_completed: { label: 'Education Done', color: 'green', icon: BookOpen, step: 2 },
  consent_pending: { label: 'Awaiting Consent', color: 'yellow', icon: FileText, step: 3 },
  forms_generating: { label: 'Generating Forms', color: 'blue', icon: Clock, step: 4 },
  forms_ready: { label: 'Forms Ready', color: 'green', icon: FileCheck, step: 4 },
  veteran_review: { label: 'Your Review', color: 'yellow', icon: AlertCircle, step: 5 },
  signatures_pending: { label: 'Signatures Needed', color: 'yellow', icon: FileText, step: 5 },
  ready_to_submit: { label: 'Ready to Submit', color: 'green', icon: Send, step: 6 },
  submitted: { label: 'Submitted to SSA', color: 'blue', icon: Clock, step: 7 },
  ssa_processing: { label: 'SSA Processing', color: 'blue', icon: Clock, step: 7 },
  ssa_decision: { label: 'Decision Made', color: 'purple', icon: AlertCircle, step: 8 },
  approved: { label: 'Approved', color: 'green', icon: CheckCircle, step: 8 },
  denied: { label: 'Denied', color: 'red', icon: AlertCircle, step: 8 },
  appeal_pending: { label: 'Appeal Pending', color: 'yellow', icon: Clock, step: 8 }
};

const STEPS = [
  { id: 1, name: 'Eligibility', path: '' },
  { id: 2, name: 'Education', path: 'education' },
  { id: 3, name: 'Consent', path: 'consent' },
  { id: 4, name: 'Forms', path: 'forms' },
  { id: 5, name: 'Review', path: 'forms' },
  { id: 6, name: 'Submit', path: 'forms' },
  { id: 7, name: 'Processing', path: '' },
  { id: 8, name: 'Decision', path: '' }
];

export default function SSDIApplicationDetail() {
  const navigate = useNavigate();
  const { ssdiId } = useParams();
  
  const [application, setApplication] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplicationData();
  }, [ssdiId]);

  const fetchApplicationData = async () => {
    try {
      const [appRes, timelineRes] = await Promise.all([
        api.get(`/ssdi/application/${ssdiId}`),
        api.get(`/ssdi/timeline/${ssdiId}`)
      ]);
      
      if (appRes.data.success) {
        setApplication(appRes.data.application);
      }
      if (timelineRes.data.success) {
        setTimeline(timelineRes.data.timeline);
      }
    } catch (err) {
      setError('Failed to load application details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitStatusUpdate = async () => {
    if (!statusUpdate.trim()) return;
    
    setUpdating(true);
    try {
      await api.post('/ssdi/status-update', {
        ssdi_application_id: ssdiId,
        status_update: statusUpdate,
        notes: ''
      });
      setStatusUpdate('');
      fetchApplicationData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || { label: status, color: 'gray', icon: Clock, step: 1 };
  };

  const getCurrentStep = () => {
    if (!application) return 1;
    return getStatusConfig(application.status).step;
  };

  const getNextAction = () => {
    if (!application) return null;
    const status = application.status;
    
    if (status === 'eligible_pending') {
      return { label: 'Start Education', path: `/ssdi/${ssdiId}/education` };
    }
    if (status === 'education_completed') {
      return { label: 'Sign Consents', path: `/ssdi/${ssdiId}/consent` };
    }
    if (status === 'consent_pending' || status === 'forms_generating' || status === 'forms_ready') {
      return { label: 'Review Forms', path: `/ssdi/${ssdiId}/forms` };
    }
    if (status === 'veteran_review' || status === 'signatures_pending' || status === 'ready_to_submit') {
      return { label: 'Complete Submission', path: `/ssdi/${ssdiId}/forms` };
    }
    if (status === 'submitted' || status === 'ssa_processing') {
      return { label: 'Check Status on mySSA', external: 'https://www.ssa.gov/myaccount/' };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-6 w-6" />
              <span>{error || 'Application not found'}</span>
            </div>
            <Button className="mt-4" onClick={() => navigate('/ssdi')}>
              Back to SSDI Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;
  const currentStep = getCurrentStep();
  const nextAction = getNextAction();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/ssdi')}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to SSDI Dashboard
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{application.application_number}</h1>
          <p className="text-gray-600">SSDI Application</p>
        </div>
        <Badge 
          variant={statusConfig.color === 'green' ? 'success' : 
                   statusConfig.color === 'red' ? 'destructive' : 
                   statusConfig.color === 'yellow' ? 'warning' : 'default'}
          className="text-base px-3 py-1"
        >
          <StatusIcon className="h-4 w-4 mr-2" />
          {statusConfig.label}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            {STEPS.slice(0, 6).map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                {index < 5 && (
                  <div className={`w-12 h-1 mx-1 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            {STEPS.slice(0, 6).map(step => (
              <span key={step.id} className="w-16 text-center">{step.name}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {nextAction && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowRight className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Next Step</span>
              </div>
              {nextAction.external ? (
                <Button 
                  onClick={() => window.open(nextAction.external, '_blank')}
                  className="gap-2"
                >
                  {nextAction.label}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => navigate(nextAction.path)} className="gap-2">
                  {nextAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">VA Claim Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">VA Rating</span>
              <span className="font-semibold">{application.va_rating_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Permanent & Total</span>
              <span className="font-semibold">{application.va_rating_permanent_total ? 'Yes' : 'No'}</span>
            </div>
            {application.expedited_eligible && (
              <div className="flex justify-between">
                <span className="text-gray-600">Expedited</span>
                <Badge variant="outline" className="border-blue-200 text-[#1B3A5F]">
                  {application.expedited_reason === 'va_100_pt' ? '100% P&T' : 'Qualified'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Started</span>
              <span className="font-semibold">{new Date(application.created_at).toLocaleDateString()}</span>
            </div>
            {application.education_completed_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Education</span>
                <span className="font-semibold">{new Date(application.education_completed_at).toLocaleDateString()}</span>
              </div>
            )}
            {application.submitted_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted</span>
                <span className="font-semibold">{new Date(application.submitted_at).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(application.status === 'submitted' || application.status === 'ssa_processing') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Status Check-In
            </CardTitle>
            <CardDescription>
              Check your status on mySSA.gov and record updates here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What did you see on mySSA?
                </label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                >
                  <option value="">Select status...</option>
                  <option value="still_processing">Still Processing - No Update</option>
                  <option value="request_for_info">SSA Requested More Information</option>
                  <option value="medical_review">In Medical Review</option>
                  <option value="decision_pending">Decision Pending</option>
                  <option value="approved">Application Approved!</option>
                  <option value="denied">Application Denied</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://www.ssa.gov/myaccount/', '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open mySSA
                </Button>
                <Button 
                  onClick={submitStatusUpdate}
                  disabled={!statusUpdate || updating}
                >
                  {updating ? 'Saving...' : 'Record Update'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {timeline && timeline.timeline && timeline.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {STATUS_CONFIG[event.status]?.label || event.status}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleString()}
                    </div>
                    {event.notes && (
                      <div className="text-sm text-gray-500 mt-1">{event.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
