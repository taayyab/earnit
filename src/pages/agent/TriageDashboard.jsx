import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import AgentLayout from '../../components/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '../../components/ui/dialog';
import {
  AlertTriangle,
  Phone,
  Shield,
  Clock,
  User,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Heart,
  Home,
  DollarSign,
  Briefcase,
  Scale,
  Brain,
  Users,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const URGENCY_COLORS = {
  crisis: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-green-500 text-white'
};

const URGENCY_LABELS = {
  crisis: 'CRISIS',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const CATEGORY_ICONS = {
  medical: Heart,
  mental_health: Brain,
  housing: Home,
  financial: DollarSign,
  employment: Briefcase,
  legal: Scale,
  claims: FileText,
  family: Users
};

const VETERANS_CRISIS_LINE = {
  phone: "988",
  text: "838255",
  message: "Veterans Crisis Line: Dial 988, then Press 1. Available 24/7."
};

function CrisisAlertBanner({ alerts, onAcknowledge }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold text-lg">
            {alerts.length} Crisis Alert{alerts.length > 1 ? 's' : ''} Require Immediate Attention
          </h3>
          <p className="text-red-700 mt-1">
            <Phone className="inline h-4 w-4 mr-1" />
            {VETERANS_CRISIS_LINE.message}
          </p>
          <div className="mt-3 space-y-2">
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.alert_id} className="flex items-center justify-between bg-white p-3 rounded border border-red-200">
                <div>
                  <span className="font-medium">{alert.veteran_name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {alert.crisis_types?.join(', ') || 'Crisis detected'}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onAcknowledge(alert.alert_id)}
                >
                  Acknowledge
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color = "primary" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}% from last week
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CaseCard({ assessment, onEscalate, onViewRecommendations }) {
  const urgencyColor = URGENCY_COLORS[assessment.urgency_level] || URGENCY_COLORS.medium;
  
  return (
    <Card className={`${assessment.crisis_detected ? 'border-red-500 border-2' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="font-medium">{assessment.veteran_name}</span>
          </div>
          <Badge className={urgencyColor}>
            {assessment.crisis_detected && <AlertTriangle className="h-3 w-3 mr-1" />}
            {URGENCY_LABELS[assessment.urgency_level]}
          </Badge>
        </div>
        
        <div className="mb-3">
          <div className="text-sm text-muted-foreground mb-1">Priority Needs:</div>
          <div className="flex flex-wrap gap-1">
            {assessment.prioritized_needs?.slice(0, 3).map((need, idx) => {
              const Icon = CATEGORY_ICONS[need.category] || FileText;
              return (
                <Badge key={idx} variant="outline" className="text-xs">
                  <Icon className="h-3 w-3 mr-1" />
                  {need.category.replace('_', ' ')}
                  <span className="ml-1 text-muted-foreground">({need.score})</span>
                </Badge>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Score: {assessment.total_score}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(assessment.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1"
            onClick={() => onViewRecommendations(assessment.veteran_id)}
          >
            <FileText className="h-4 w-4 mr-1" />
            View
          </Button>
          {assessment.urgency_level !== 'low' && (
            <Button 
              size="sm" 
              variant={assessment.crisis_detected ? "destructive" : "secondary"}
              className="flex-1"
              onClick={() => onEscalate(assessment)}
            >
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Escalate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NewAssessmentDialog({ open, onOpenChange, onSubmit }) {
  const [veteranId, setVeteranId] = useState('');
  const [responses, setResponses] = useState({});
  const [freeText, setFreeText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && questions.length === 0) {
      loadQuestions();
    }
  }, [open]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/triage/questions');
      setQuestions(res.data.questions || []);
    } catch (err) {
      toast.error('Failed to load assessment questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!veteranId) {
      toast.error('Please enter a veteran ID');
      return;
    }
    
    if (Object.keys(responses).length === 0) {
      toast.error('Please answer at least one question');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit({
        veteran_id: veteranId,
        responses,
        free_text: freeText || null
      });
      
      if (result.crisis_detected) {
        toast.error('Crisis detected! Immediate action required.', {
          description: VETERANS_CRISIS_LINE.message,
          duration: 10000
        });
      } else {
        toast.success('Assessment submitted successfully');
      }
      
      onOpenChange(false);
      setVeteranId('');
      setResponses({});
      setFreeText('');
    } catch (err) {
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>New Needs Assessment</DialogTitle>
          <DialogDescription>
            Conduct a comprehensive needs assessment for a veteran
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Veteran ID</label>
              <Input
                value={veteranId}
                onChange={(e) => setVeteranId(e.target.value)}
                placeholder="Enter veteran ID"
                className="mt-1"
              />
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id} className="border rounded-lg p-4">
                  <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label 
                        key={opt.value}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                          responses[q.id] === opt.value ? 'bg-primary/10 border border-primary' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.value}
                          checked={responses[q.id] === opt.value}
                          onChange={() => setResponses(prev => ({ ...prev, [q.id]: opt.value }))}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          responses[q.id] === opt.value ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                          {responses[q.id] === opt.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className={opt.crisis ? 'text-red-600 font-medium' : ''}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            <div>
              <label className="text-sm font-medium">Additional Notes (Optional)</label>
              <Textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Any additional information about the veteran's situation..."
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This text will be analyzed for crisis indicators
              </p>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Assessment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EscalationDialog({ open, onOpenChange, assessment, onEscalate }) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEscalate = async () => {
    if (!reason) {
      toast.error('Please provide an escalation reason');
      return;
    }

    setSubmitting(true);
    try {
      await onEscalate({
        veteran_id: assessment.veteran_id,
        reason,
        notes
      });
      toast.success('Case escalated successfully');
      onOpenChange(false);
      setReason('');
      setNotes('');
    } catch (err) {
      toast.error('Failed to escalate case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-orange-500" />
            Escalate Case
          </DialogTitle>
          <DialogDescription>
            Escalate this case for supervisor review
          </DialogDescription>
        </DialogHeader>
        
        {assessment && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{assessment.veteran_name}</span>
              <Badge className={URGENCY_COLORS[assessment.urgency_level]}>
                {URGENCY_LABELS[assessment.urgency_level]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Score: {assessment.total_score} | 
              Needs: {assessment.prioritized_needs?.slice(0, 2).map(n => n.category).join(', ')}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Escalation Reason *</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this case being escalated?"
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Additional Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleEscalate}
            disabled={submitting}
          >
            {submitting ? 'Escalating...' : 'Escalate Case'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecommendationsPanel({ veteranId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (veteranId) {
      loadRecommendations();
    }
  }, [veteranId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/triage/recommendations/${veteranId}`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recommendations for Veteran</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
      
      {data.latest_assessment && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Latest Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className={URGENCY_COLORS[data.latest_assessment.urgency_level]}>
                {URGENCY_LABELS[data.latest_assessment.urgency_level]}
              </Badge>
              <span>Score: {data.latest_assessment.total_score}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(data.latest_assessment.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Prioritized Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recommendations?.map((rec, idx) => {
              const Icon = CATEGORY_ICONS[rec.category] || FileText;
              return (
                <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                  <Icon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{rec.resource}</p>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {rec.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {data.crisis_history?.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Crisis History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.crisis_history.map((crisis, idx) => (
                <div key={idx} className="text-sm flex items-center justify-between">
                  <span>{crisis.crisis_types?.join(', ')}</span>
                  <Badge variant="outline">{crisis.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TriageDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cases');
  const [cases, setCases] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVeteranId, setSelectedVeteranId] = useState(null);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [escalationDialogOpen, setEscalationDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [casesRes, alertsRes, statsRes] = await Promise.all([
        api.get('/triage/cases', { params: { limit: 50 } }),
        api.get('/triage/alerts'),
        api.get('/triage/stats')
      ]);
      
      setCases(casesRes.data.cases || []);
      setAlerts(alertsRes.data.alerts || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load triage data:', err);
      toast.error('Failed to load triage data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSubmitAssessment = async (data) => {
    const res = await api.post('/triage/assess', data);
    loadData();
    return res.data;
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await api.post(`/triage/alerts/${alertId}/acknowledge`, {});
      toast.success('Alert acknowledged');
      loadData();
    } catch (err) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleEscalate = async (data) => {
    await api.post('/triage/escalate', data);
    loadData();
  };

  const openEscalationDialog = (assessment) => {
    setSelectedAssessment(assessment);
    setEscalationDialogOpen(true);
  };

  const filteredCases = urgencyFilter === 'all' 
    ? cases 
    : cases.filter(c => c.urgency_level === urgencyFilter);

  const crisisCases = cases.filter(c => c.crisis_detected);

  return (
    <AgentLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Triage Dashboard</h1>
            <p className="text-muted-foreground">
              Veteran needs assessment and crisis management
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setAssessmentDialogOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>

        <CrisisAlertBanner alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Assessments" 
            value={stats?.total_assessments || 0}
            icon={FileText}
          />
          <StatCard 
            title="Crisis Alerts" 
            value={stats?.pending_crisis_alerts || 0}
            icon={AlertTriangle}
            color="red-500"
          />
          <StatCard 
            title="Crisis This Week" 
            value={stats?.crisis_this_week || 0}
            icon={Shield}
            color="orange-500"
          />
          <StatCard 
            title="Today's Assessments" 
            value={stats?.assessments_today || 0}
            icon={Clock}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Triaged Cases</CardTitle>
                  <div className="flex gap-2">
                    {['all', 'crisis', 'high', 'medium', 'low'].map(level => (
                      <Button
                        key={level}
                        variant={urgencyFilter === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUrgencyFilter(level)}
                        className={level === 'crisis' && urgencyFilter !== level ? 'text-red-600' : ''}
                      >
                        {level === 'all' ? 'All' : URGENCY_LABELS[level] || level}
                        {level === 'crisis' && crisisCases.length > 0 && (
                          <Badge variant="destructive" className="ml-1">
                            {crisisCases.length}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredCases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No cases found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCases.map(assessment => (
                      <CaseCard
                        key={assessment.assessment_id}
                        assessment={assessment}
                        onEscalate={openEscalationDialog}
                        onViewRecommendations={setSelectedVeteranId}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            {selectedVeteranId ? (
              <Card>
                <CardContent className="pt-4">
                  <RecommendationsPanel 
                    veteranId={selectedVeteranId} 
                    onClose={() => setSelectedVeteranId(null)}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Veterans Crisis Line
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-700 mb-2">988</p>
                    <p className="text-sm text-red-600">Press 1 for Veterans</p>
                    <Separator className="my-3" />
                    <p className="text-xs text-muted-foreground">
                      Text: {VETERANS_CRISIS_LINE.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available 24/7
                    </p>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Urgency Distribution</h4>
                    {Object.entries(stats?.by_urgency || {}).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between text-sm">
                        <Badge className={URGENCY_COLORS[level] || 'bg-gray-200'}>
                          {URGENCY_LABELS[level] || level}
                        </Badge>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <NewAssessmentDialog
          open={assessmentDialogOpen}
          onOpenChange={setAssessmentDialogOpen}
          onSubmit={handleSubmitAssessment}
        />

        <EscalationDialog
          open={escalationDialogOpen}
          onOpenChange={setEscalationDialogOpen}
          assessment={selectedAssessment}
          onEscalate={handleEscalate}
        />
      </div>
    </AgentLayout>
  );
}
