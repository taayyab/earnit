import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Loader2,
  ArrowRight,
  Shield,
  Calendar,
  ChevronRight,
  Upload,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

const IDES_PHASES = [
  { id: 'referral', label: 'IDES Referral', description: 'Initial referral to the IDES process' },
  { id: 'meb_evaluation', label: 'MEB Evaluation', description: 'Medical Evaluation Board assessment' },
  { id: 'meb_findings', label: 'MEB Findings', description: 'MEB fitness determination' },
  { id: 'peb_review', label: 'PEB Review', description: 'Physical Evaluation Board review' },
  { id: 'peb_findings', label: 'PEB Findings', description: 'PEB rating and disposition' },
  { id: 'veteran_election', label: 'Veteran Election', description: 'Choose your benefits path' },
  { id: 'va_rating', label: 'VA Rating', description: 'VA disability rating determination' },
  { id: 'transition', label: 'Transition', description: 'Separation or retirement processing' },
  { id: 'completed', label: 'Completed', description: 'IDES process complete' }
];

const PHASE_STATUS_COLORS = {
  completed: 'bg-green-500',
  current: 'bg-blue-500',
  upcoming: 'bg-gray-300'
};

export default function MEBDashboard({ claimId }) {
  const [mebStatus, setMebStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (claimId) {
      loadMEBStatus();
    } else {
      setLoading(false);
    }
  }, [claimId]);

  const loadMEBStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/claims/${claimId}/meb-status`);
      setMebStatus(response.data);
    } catch (err) {
      console.error('Failed to load MEB status:', err);
      if (err.response?.status === 400) {
        setError('This is not an MEB/IDES claim');
      } else {
        setError('Failed to load MEB status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseTransition = async (newPhase) => {
    try {
      setUpdating(true);
      const response = await api.put(`/claims/${claimId}/meb-phase`, {
        new_phase: newPhase
      });
      
      if (response.data.success) {
        toast.success(`Phase updated to ${IDES_PHASES.find(p => p.id === newPhase)?.label}`);
        loadMEBStatus();
      }
    } catch (err) {
      console.error('Failed to update phase:', err);
      toast.error(err.response?.data?.detail || 'Failed to update phase');
    } finally {
      setUpdating(false);
    }
  };

  const handleEvidenceUpdate = async (evidenceId, status) => {
    try {
      const response = await api.put(`/claims/${claimId}/meb-evidence`, {
        evidence_id: evidenceId,
        status: status
      });
      
      if (response.data.success) {
        toast.success('Evidence status updated');
        loadMEBStatus();
      }
    } catch (err) {
      console.error('Failed to update evidence:', err);
      toast.error('Failed to update evidence');
    }
  };

  const getCurrentPhaseIndex = () => {
    if (!mebStatus?.current_phase) return 0;
    return IDES_PHASES.findIndex(p => p.id === mebStatus.current_phase);
  };

  const getPhaseStatus = (phaseIndex) => {
    const currentIndex = getCurrentPhaseIndex();
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentPhaseIndex();
    return Math.round(((currentIndex + 1) / IDES_PHASES.length) * 100);
  };

  const getNextPhase = () => {
    const currentIndex = getCurrentPhaseIndex();
    if (currentIndex < IDES_PHASES.length - 1) {
      return IDES_PHASES[currentIndex + 1];
    }
    return null;
  };

  if (!claimId) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading MEB/IDES status...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex items-center gap-3 py-8">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-medium text-red-700">{error}</p>
            <p className="text-sm text-red-600">Please try again or contact support.</p>
          </div>
          <Button variant="outline" onClick={loadMEBStatus} className="ml-auto">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!mebStatus) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No MEB/IDES data available for this claim.</p>
        </CardContent>
      </Card>
    );
  }

  const currentPhase = IDES_PHASES.find(p => p.id === mebStatus.current_phase);
  const nextPhase = getNextPhase();
  const evidenceChecklist = mebStatus.evidence_checklist || [];
  const timeline = mebStatus.timeline || [];
  const completedEvidence = evidenceChecklist.filter(e => e.status === 'verified' || e.status === 'uploaded').length;

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                MEB/IDES Claim Status
              </CardTitle>
              <CardDescription>
                Claim #{mebStatus.claim_number || claimId}
              </CardDescription>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {currentPhase?.label || 'Unknown Phase'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {mebStatus.referral_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Referred: {new Date(mebStatus.referral_date).toLocaleDateString()}
              </div>
            )}
            {mebStatus.mtf_name && (
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                MTF: {mebStatus.mtf_name}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">IDES Phase Progress</CardTitle>
          <CardDescription>Track your journey through the Integrated Disability Evaluation System</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {IDES_PHASES.map((phase, index) => {
              const status = getPhaseStatus(index);
              const isLast = index === IDES_PHASES.length - 1;
              
              return (
                <div key={phase.id} className="flex items-start mb-4 last:mb-0">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'current' ? 'bg-blue-500 ring-4 ring-blue-100' :
                      'bg-gray-200'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : status === 'current' ? (
                        <Clock className="h-4 w-4 text-white" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-8 ${
                        status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className={`flex-1 pt-1 ${status === 'upcoming' ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${status === 'current' ? 'text-blue-700' : ''}`}>
                        {phase.label}
                      </h4>
                      {status === 'current' && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {nextPhase && (
            <div className="mt-6 pt-4 border-t">
              <Button 
                onClick={() => handlePhaseTransition(nextPhase.id)}
                disabled={updating}
                className="w-full sm:w-auto"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    Advance to {nextPhase.label}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Evidence Checklist</CardTitle>
              <CardDescription>Required documents for your MEB/IDES claim</CardDescription>
            </div>
            <Badge variant="outline">
              {completedEvidence} / {evidenceChecklist.length} Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {evidenceChecklist.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No evidence items defined yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {evidenceChecklist.map((item, index) => (
                <div 
                  key={item.id || index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.status === 'verified' ? 'bg-green-50 border-green-200' :
                    item.status === 'uploaded' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.status === 'verified' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : item.status === 'uploaded' ? (
                      <Clock className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <span className="font-medium text-sm">{item.name || item.title}</span>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.status === 'verified' ? 'bg-green-100 text-green-700' :
                        item.status === 'uploaded' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.status === 'verified' ? 'Verified' :
                       item.status === 'uploaded' ? 'Uploaded' : 'Missing'}
                    </Badge>
                    {item.status === 'missing' && (
                      <Button size="sm" variant="outline">
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline & Milestones</CardTitle>
          <CardDescription>Key dates and events in your IDES process</CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No timeline events recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                    {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.title || event.event}</span>
                      {event.is_deadline && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                          Deadline
                        </Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>IDES Timeline Note:</strong> The standard IDES process takes approximately 295 days 
                from referral to separation/retirement. Contact your PEBLO if you experience delays.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
