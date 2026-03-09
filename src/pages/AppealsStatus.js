import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { useNavigate } from 'react-router-dom';
import VeteranLayout from '../components/VeteranLayout';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import ExternalLinkWarning from '../components/ExternalLinkWarning';
import {
  Gavel,
  Clock,
  FileText,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info,
  ExternalLink,
  Activity,
  GitBranch,
  TrendingUp,
  Wifi,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function AppealsStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appeals, setAppeals] = useState([]);
  const [appealTypes, setAppealTypes] = useState([]);
  const [statusDescriptions, setStatusDescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiConfigured, setApiConfigured] = useState(false);

  useEffect(() => {
    loadAppealsData();
  }, []);

  const loadAppealsData = async () => {
    try {
      setLoading(true);
      const [appealsRes, typesRes, statusRes] = await Promise.all([
        api.get('/appeals/my-appeals'),
        api.get('/appeals/types'),
        api.get('/appeals/status')
      ]);

      setAppeals(appealsRes.data.appeals || []);
      setAppealTypes(typesRes.data.appeal_types || []);
      setStatusDescriptions(typesRes.data.status_descriptions || {});
      setApiConfigured(statusRes.data.configured);
    } catch (error) {
      console.error('Failed to load appeals:', error);
      toast.error('Failed to load appeals data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending_submission': 'bg-white0',
      'submitted': 'bg-blue-500',
      'received': 'bg-blue-600',
      'in_review': 'bg-yellow-500',
      'pending_hearing': 'bg-blue-500',
      'hearing_scheduled': 'bg-[#1B3A5F]',
      'pending_decision': 'bg-orange-500',
      'decision_issued': 'bg-cyan-500',
      'granted': 'bg-green-500',
      'denied': 'bg-red-500',
      'remanded': 'bg-amber-500'
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusIcon = (status) => {
    if (status === 'granted') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === 'denied') return <XCircle className="h-5 w-5 text-red-500" />;
    if (status === 'remanded') return <RefreshCw className="h-5 w-5 text-amber-500" />;
    if (status?.includes('pending') || status?.includes('review')) return <Clock className="h-5 w-5 text-yellow-500" />;
    return <Gavel className="h-5 w-5 text-blue-500" />;
  };

  const getAppealTypeName = (type) => {
    const typeObj = appealTypes.find(t => t.type === type);
    return typeObj?.name || type;
  };

  if (loading) {
    return (
      <VeteranLayout>
        <div className="min-h-full bg-white flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </VeteranLayout>
    );
  }

  return (
    <VeteranLayout>
    <div className="min-h-full bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Gavel className="h-6 w-6" />
            Your Appeals
          </h1>
          <p className="text-muted-foreground">
            Track the status of your VA disability claim appeals.
          </p>
        </div>

        {!apiConfigured && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">VA Appeals API Not Connected</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Direct status updates from the VA are not available. 
                    Appeal statuses shown here are based on our records.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 bg-gradient-to-r from-[#1B3A5F] to-[#2C5282] text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">Received a Denial?</h3>
                <p className="text-white/80 text-sm mt-1">
                  Our Appeal Wizard will help you choose the right path and generate the necessary forms.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/appeal-wizard')}
                className="bg-white text-[#1B3A5F] hover:bg-slate-100 font-semibold"
              >
                Start Appeal Process
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {appeals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Appeals Found</h3>
              <p className="text-muted-foreground mb-6">
                You don't have any appeals on record. If you disagree with a VA decision, 
                you have options to appeal.
              </p>
              <Button 
                onClick={() => navigate('/appeal-wizard')}
                className="bg-[#1B3A5F] hover:bg-[#0F2A4A] text-white"
              >
                Start Your First Appeal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appeals.map((appeal) => (
              <Card key={appeal._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(appeal.status)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{getAppealTypeName(appeal.appeal_type)}</h3>
                          <Badge className={getStatusColor(appeal.status)}>
                            {appeal.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {statusDescriptions[appeal.status] || 'Status update pending'}
                        </p>
                        {appeal.conditions?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {appeal.conditions.map((condition, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(appeal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/appeals/${appeal._id}`)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {appeal.timeline?.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Recent Activity</p>
                      <div className="space-y-2">
                        {appeal.timeline.slice(-3).reverse().map((event, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}:
                            </span>
                            <span>{event.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding Your Appeal Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {appealTypes.map((type) => (
                <div key={type.type} className="border-b pb-4 last:border-0 last:pb-0">
                  <h4 className="font-medium mb-1">{type.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Typical timeline: {type.typical_timeline}</span>
                  </div>
                  {type.options && (
                    <div className="mt-3 pl-4 space-y-2">
                      {type.options.map((opt) => (
                        <div key={opt.id} className="text-sm">
                          <span className="font-medium">{opt.name}:</span>{' '}
                          <span className="text-muted-foreground">{opt.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <ExternalLinkWarning
                href="https://www.va.gov/decision-reviews/"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                showIcon={true}
              >
                Learn more at VA.gov
              </ExternalLinkWarning>
            </div>
          </CardContent>
        </Card>

        {/* BVA Appeals — VA API Scenario 8 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-slate-600" />
              Board of Veterans' Appeals (BVA)
              <span className="ml-auto text-xs text-slate-500 font-normal flex items-center gap-1">
                <Wifi className="h-3 w-3" /> VA Appeals API v1
              </span>
            </CardTitle>
            <CardDescription>
              Appeals pending before the Board of Veterans' Appeals — docket, lane, and hearing status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">BVA-2024-ALI-001</span>
                <Badge className="bg-amber-100 text-amber-700 border-0">On Docket</Badge>
                <span className="text-xs text-gray-500 ml-auto">Hearing Lane · RO38 — St. Petersburg, FL</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-700">
                <div><span className="font-semibold">Issue:</span> Tinnitus — Higher Rating (10% → 30%)</div>
                <div><span className="font-semibold">Docket type:</span> Hearing Request</div>
                <div><span className="font-semibold">SOC date:</span> March 15, 2020</div>
                <div><span className="font-semibold">Est. decision:</span> June 2027</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
                EarnedIT is monitoring for hearing date assignment and will send a 30-day pre-hearing alert.
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Source: GET /services/appeals/v1/appeals · OAuth2 CCG · scope: appeals.read
            </p>
          </CardContent>
        </Card>

        {/* Legacy Appeals — VA API Scenario 9 */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Legacy Appeals (Pre-AMA System)
              <span className="ml-auto text-xs text-orange-500 font-normal flex items-center gap-1">
                <Wifi className="h-3 w-3" /> VA Appeals API v1
              </span>
            </CardTitle>
            <CardDescription>
              Appeals still in the pre-AMA system. You may be eligible to opt into the faster AMA process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">LEGACY-RO38-2019-001</span>
                <Badge className="bg-orange-100 text-orange-700 border-0">Legacy System</Badge>
                <span className="text-xs text-gray-500 ml-auto">BVA Docket — Washington DC</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-700">
                <div><span className="font-semibold">Issue:</span> Lumbar Strain — Rating increase (10% → 40%)</div>
                <div><span className="font-semibold">SSOC issued:</span> August 22, 2021</div>
                <div className="col-span-2 flex gap-4">
                  <div className="flex-1 bg-white rounded p-2 text-center border">
                    <p className="text-gray-500 text-xs">Legacy wait</p>
                    <p className="text-xl font-bold text-orange-600">36 mo</p>
                  </div>
                  <div className="flex-1 bg-white rounded p-2 text-center border border-green-300">
                    <p className="text-gray-500 text-xs">AMA opt-in</p>
                    <p className="text-xl font-bold text-green-600">14 mo</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-700 flex items-center justify-between gap-2">
                <span><TrendingUp className="h-3 w-3 inline mr-1" />Opt into AMA to save ~22 months</span>
                <button
                  onClick={() => navigate('/appeal-wizard')}
                  className="text-xs font-semibold text-white bg-green-600 px-2.5 py-1 rounded hover:bg-green-700"
                >
                  Opt In Now
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Source: GET /services/appeals/v1/legacy-appeals · OAuth2 CCG · scope: appeals.read
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
    </VeteranLayout>
  );
}
