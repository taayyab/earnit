import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import {
  Users,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageSquare,
  UserPlus,
  Building2,
  RefreshCw,
  ChevronRight,
  Home,
  Briefcase,
  Heart,
  DollarSign,
  Scale,
  GraduationCap,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_ICONS = {
  housing: Home,
  employment: Briefcase,
  mental_health: Heart,
  financial: DollarSign,
  legal: Scale,
  education: GraduationCap,
  healthcare: Activity,
  family: Users
};

const PRIORITY_COLORS = {
  crisis: 'bg-red-100 text-red-800 border-red-200',
  urgent: 'bg-orange-100 text-orange-800 border-orange-200',
  high: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  low: 'bg-white text-gray-800 border-gray-200'
};

const STATUS_COLORS = {
  new: 'bg-blue-50 text-[#1B3A5F]',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  pending_partner: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-white text-gray-800'
};

export default function SupportCaseDashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [referralPartner, setReferralPartner] = useState(null);
  const [referralNotes, setReferralNotes] = useState('');
  const [noteText, setNoteText] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'all' ? null : activeTab;
      const response = await api.get('/support-cases/advocate/dashboard', {
        params: { status: statusFilter }
      });
      
      if (response.data.success) {
        setCases(response.data.cases || []);
        setStatistics(response.data.statistics);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      toast.error('Failed to load support cases');
    } finally {
      setLoading(false);
    }
  };

  const handleSelfAssign = async (caseId) => {
    try {
      setProcessing(true);
      const response = await api.post(`/support-cases/case/${caseId}/self-assign`);
      
      if (response.data.success) {
        toast.success('Case assigned to you');
        loadDashboard();
      }
    } catch (err) {
      console.error('Failed to assign case:', err);
      toast.error('Failed to assign case');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (caseId, newStatus) => {
    try {
      setProcessing(true);
      const response = await api.put(`/support-cases/case/${caseId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success(`Case status updated to ${newStatus.replace('_', ' ')}`);
        loadDashboard();
        if (selectedCase?.case_id === caseId) {
          setSelectedCase(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update case status');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateReferral = async () => {
    if (!selectedCase || !referralPartner) return;
    
    try {
      setProcessing(true);
      const response = await api.post(`/support-cases/case/${selectedCase.case_id}/referral`, {
        partner_info: referralPartner,
        notes: referralNotes
      });
      
      if (response.data.success) {
        toast.success(`Referral sent to ${referralPartner.name}`);
        setShowReferralDialog(false);
        setReferralPartner(null);
        setReferralNotes('');
        loadDashboard();
      }
    } catch (err) {
      console.error('Failed to create referral:', err);
      toast.error('Failed to create referral');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCase || !noteText.trim()) return;
    
    try {
      setProcessing(true);
      const response = await api.post(`/support-cases/case/${selectedCase.case_id}/note`, {
        note_text: noteText
      });
      
      if (response.data.success) {
        toast.success('Note added to case');
        setShowNoteDialog(false);
        setNoteText('');
        const updatedCase = await api.get(`/support-cases/case/${selectedCase.case_id}`);
        if (updatedCase.data.success) {
          setSelectedCase(updatedCase.data.case);
        }
      }
    } catch (err) {
      console.error('Failed to add note:', err);
      toast.error('Failed to add note');
    } finally {
      setProcessing(false);
    }
  };

  const openReferralDialog = (service) => {
    setReferralPartner(service);
    setShowReferralDialog(true);
  };

  if (loading && !cases.length) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader title="Support Cases" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-[#1B3A5F] mb-4" />
            <p className="text-lg text-slate-500">Loading support cases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Support Case Management" 
        showBackButton={true}
        backTo="/agent"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-[#1B3A5F]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Cases</p>
                    <p className="text-2xl font-bold">{statistics.new_cases || 0}</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-[#1B3A5F] opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{statistics.in_progress || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Partner</p>
                    <p className="text-2xl font-bold">{statistics.pending_partner || 0}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-orange-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold">{statistics.resolved || 0}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Support Cases
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadDashboard}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="new">New</TabsTrigger>
                    <TabsTrigger value="assigned">Assigned</TabsTrigger>
                    <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                    <TabsTrigger value="pending_partner">Pending</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-0">
                    {cases.length === 0 ? (
                      <div className="text-center py-12">
                        <ClipboardList className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">No cases found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cases.map((supportCase) => (
                          <div
                            key={supportCase.case_id}
                            onClick={() => setSelectedCase(supportCase)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedCase?.case_id === supportCase.case_id
                                ? 'border-[#1B3A5F] bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{supportCase.veteran_name || 'Veteran'}</span>
                                  <Badge className={PRIORITY_COLORS[supportCase.priority]}>
                                    {supportCase.priority}
                                  </Badge>
                                  <Badge className={STATUS_COLORS[supportCase.status]}>
                                    {supportCase.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {supportCase.identified_needs?.length || 0} needs identified
                                  {supportCase.partner_referrals?.length > 0 && 
                                    ` • ${supportCase.partner_referrals.length} referrals`}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Created {new Date(supportCase.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-slate-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {selectedCase ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Case Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">{selectedCase.veteran_name}</p>
                    {selectedCase.veteran_email && (
                      <a 
                        href={`mailto:${selectedCase.veteran_email}`}
                        className="flex items-center gap-1 text-sm text-[#1B3A5F] hover:underline"
                      >
                        <Mail className="h-3 w-3" />
                        {selectedCase.veteran_email}
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Badge className={PRIORITY_COLORS[selectedCase.priority]}>
                      {selectedCase.priority} priority
                    </Badge>
                    <Badge className={STATUS_COLORS[selectedCase.status]}>
                      {selectedCase.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {selectedCase.status === 'new' && (
                    <Button 
                      onClick={() => handleSelfAssign(selectedCase.case_id)}
                      disabled={processing}
                      className="w-full bg-[#1B3A5F] hover:bg-[#2a4a6f]"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Take This Case
                    </Button>
                  )}

                  {selectedCase.identified_needs?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Identified Needs</h4>
                      <div className="space-y-1">
                        {selectedCase.identified_needs.map((need, i) => {
                          const Icon = CATEGORY_ICONS[need.category] || Heart;
                          return (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Icon className="h-4 w-4 text-slate-500" />
                              <span>{need.response || need.category}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedCase.recommended_services?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recommended Services</h4>
                      <div className="space-y-2">
                        {selectedCase.recommended_services.slice(0, 4).map((service, i) => (
                          <div key={i} className="p-2 bg-white rounded border border-slate-100">
                            <p className="font-medium text-sm">{service.name}</p>
                            <div className="flex gap-2 mt-1">
                              {service.contact_phone && (
                                <a
                                  href={`tel:${service.contact_phone}`}
                                  className="text-xs text-[#1B3A5F] hover:underline flex items-center gap-1"
                                >
                                  <Phone className="h-3 w-3" />
                                  Call
                                </a>
                              )}
                              <button
                                onClick={() => openReferralDialog(service)}
                                className="text-xs text-[#1B3A5F] hover:underline flex items-center gap-1"
                              >
                                <Building2 className="h-3 w-3" />
                                Create Referral
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCase.partner_referrals?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Partner Referrals</h4>
                      <div className="space-y-2">
                        {selectedCase.partner_referrals.map((ref, i) => (
                          <div key={i} className="flex items-center justify-between text-sm p-2 bg-orange-50 rounded">
                            <span>{ref.partner_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {ref.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowNoteDialog(true)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                    
                    {selectedCase.status !== 'resolved' && selectedCase.status !== 'closed' && (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedCase.status !== 'in_progress' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(selectedCase.case_id, 'in_progress')}
                            disabled={processing}
                          >
                            Start Working
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleUpdateStatus(selectedCase.case_id, 'resolved')}
                          disabled={processing}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>

                  {selectedCase.notes?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Notes</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedCase.notes.map((note, i) => (
                          <div key={i} className="text-sm p-2 bg-white rounded">
                            <p>{note.text}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {note.author_name} - {new Date(note.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <ClipboardList className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">Select a case to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Partner Referral</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {referralPartner && (
              <div className="p-3 bg-white rounded-lg">
                <p className="font-medium">{referralPartner.name}</p>
                <p className="text-sm text-muted-foreground">{referralPartner.description}</p>
                {referralPartner.contact_phone && (
                  <p className="text-sm text-[#1B3A5F] mt-1">{referralPartner.contact_phone}</p>
                )}
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Referral Notes</label>
              <Textarea
                value={referralNotes}
                onChange={(e) => setReferralNotes(e.target.value)}
                placeholder="Add any specific notes for this referral..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReferralDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReferral} disabled={processing}>
              {processing ? 'Creating...' : 'Create Referral'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Case Note</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={processing || !noteText.trim()}>
              {processing ? 'Adding...' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
