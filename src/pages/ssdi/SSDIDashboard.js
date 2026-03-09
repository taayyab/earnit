import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VeteranLayout from '../../components/VeteranLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  FileText, CheckCircle, Clock, AlertCircle, 
  ChevronRight, Shield, DollarSign, Calendar
} from 'lucide-react';
import api from '../../lib/api';

const STATUS_CONFIG = {
  eligible_pending: { label: 'Eligible', color: 'blue', icon: Shield },
  education_completed: { label: 'Education Done', color: 'green', icon: CheckCircle },
  consent_pending: { label: 'Awaiting Consent', color: 'yellow', icon: FileText },
  forms_generating: { label: 'Generating Forms', color: 'blue', icon: Clock },
  forms_ready: { label: 'Forms Ready', color: 'green', icon: FileText },
  veteran_review: { label: 'Your Review', color: 'yellow', icon: AlertCircle },
  signatures_pending: { label: 'Signatures Needed', color: 'yellow', icon: FileText },
  ready_to_submit: { label: 'Ready to Submit', color: 'green', icon: CheckCircle },
  submitted: { label: 'Submitted', color: 'blue', icon: Clock },
  ssa_processing: { label: 'SSA Processing', color: 'blue', icon: Clock },
  ssa_decision: { label: 'Decision Made', color: 'purple', icon: AlertCircle },
  approved: { label: 'Approved', color: 'green', icon: CheckCircle },
  denied: { label: 'Denied', color: 'red', icon: AlertCircle },
  appeal_pending: { label: 'Appeal Pending', color: 'yellow', icon: Clock }
};

export default function SSDIDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/ssdi/my-applications');
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (err) {
      setError('Failed to load SSDI applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || { label: status, color: 'gray', icon: Clock };
  };

  const getProgress = (status) => {
    const stages = [
      'eligible_pending', 'education_completed', 'consent_pending',
      'forms_ready', 'veteran_review', 'ready_to_submit',
      'submitted', 'ssa_processing', 'ssa_decision', 'approved'
    ];
    const index = stages.indexOf(status);
    return index >= 0 ? ((index + 1) / stages.length) * 100 : 0;
  };

  if (loading) {
    return (
      <VeteranLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </VeteranLayout>
    );
  }

  return (
    <VeteranLayout>
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SSDI Applications</h1>
        <p className="text-gray-600 mt-2">
          Social Security Disability Insurance applications linked to your VA claims
        </p>
      </div>

      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Additional Monthly Income</h3>
              <p className="text-gray-600 text-sm mt-1">
                SSDI provides monthly benefits based on your work history. Average payment is $1,580/month 
                (2025). You can receive both VA disability and SSDI simultaneously.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No SSDI Applications Yet</h3>
            <p className="text-gray-600 mb-6">
              When you have an approved VA disability claim, you may be eligible for SSDI benefits.
              Check your approved claims to see if you qualify.
            </p>
            <Button onClick={() => navigate('/claims')}>
              View My Claims
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{app.application_number}</h3>
                        <Badge variant={statusConfig.color === 'green' ? 'success' : 
                                       statusConfig.color === 'red' ? 'destructive' : 
                                       statusConfig.color === 'yellow' ? 'warning' : 'default'}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {app.expedited_eligible && (
                          <Badge variant="outline" className="border-blue-200 text-[#1B3A5F]">
                            Expedited
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          VA Rating: {app.va_rating_percentage}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Started: {new Date(app.created_at).toLocaleDateString()}
                        </span>
                        {app.submitted_at && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900 font-medium">{Math.round(getProgress(app.status))}%</span>
                        </div>
                        <Progress value={getProgress(app.status)} className="h-2" />
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate(`/ssdi/${app.id}`)}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </VeteranLayout>
  );
}
