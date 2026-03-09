import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import QAChecklist from '../components/QAChecklist';
import VeteranLayout from '../components/VeteranLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Shield,
  ArrowLeft,
  User,
  Briefcase,
  ClipboardList,
  Phone,
  Circle,
  Loader2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function FormEditor() {
  const { claimId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState(null);
  const [activeSection, setActiveSection] = useState('section_1_veteran_info');
  const [showPreview, setShowPreview] = useState(true);
  const [showQADialog, setShowQADialog] = useState(false);
  const [qaApproved, setQaApproved] = useState(false);
  const [submission, setSubmission] = useState(null); // holds GUID + confirmation after submit

  useEffect(() => {
    loadOrGenerateForm();
  }, [claimId]);

  // Recompute validation live as user fills in fields
  useEffect(() => {
    if (!formData) return;
    const s1 = formData.sections?.section_1_veteran_info || {};
    const s2 = formData.sections?.section_2_service_info || {};
    const s5 = formData.sections?.section_5_contact || {};

    const missing = [];
    if (!s1.first_name) missing.push('First Name');
    if (!s1.last_name) missing.push('Last Name');
    if (!s1.ssn) missing.push('SSN');
    if (!s1.dob) missing.push('Date of Birth');
    if (!s2.branch) missing.push('Branch of Service');
    if (!s2.service_number) missing.push('Service Number');
    if (!s2.service_start_date) missing.push('Service Start Date');
    if (!s5.phone_primary) missing.push('Phone');
    if (!s5.email) missing.push('Email');
    if (!s5.mailing_address?.street) missing.push('Street Address');
    if (!s5.mailing_address?.city) missing.push('City');
    if (!s5.mailing_address?.state) missing.push('State');
    if (!s5.mailing_address?.zip) missing.push('ZIP Code');

    const totalFields = 13;
    const percentage = Math.round(((totalFields - missing.length) / totalFields) * 100);

    setValidation({
      overall_complete: missing.length === 0,
      completion_percentage: percentage,
      valid: missing.length === 0,
      errors: [],
      missing_fields: missing,
    });
  }, [formData]);

  const loadOrGenerateForm = async () => {
    try {
      setLoading(true);
      
      const statusRes = await api.get(`/forms/claim/${claimId}/status`);
      
      if (statusRes.data.exists) {
        const formRes = await api.get(`/forms/${statusRes.data.form_id}`);
        setFormData(formRes.data.form);
        setValidation(formRes.data.form.validation);
      } else {
        const genRes = await api.post(`/forms/generate/${claimId}`);
        setFormData(genRes.data.form);
        setValidation(genRes.data.form.validation);
        toast.success('Form auto-populated from your claim data');
      }
    } catch (error) {
      console.error('Form Editor: Failed to load form', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.detail || 'Failed to load form');
      toast.error(error.response?.data?.detail || 'Failed to load form. Please try again.');
      // Don't redirect - show error state instead
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = async (section, field, value) => {
    try {
      // Update local state immediately for responsive UI
      setFormData(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [section]: {
            ...prev.sections[section],
            [field]: value
          }
        }
      }));

      // Show saving indicator
      setSaving(true);
      
      // Auto-save to backend
      await api.put(`/forms/${formData.form_id}/field`, {
        section,
        field,
        value
      });
      
      // Show saved confirmation briefly
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Failed to save field:', error);
      toast.error('Failed to auto-save. Please try again.');
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    try {
      const res = await api.post(`/forms/${formData.form_id}/validate`);
      setValidation(res.data.validation);
      
      if (res.data.validation.valid) {
        toast.success('Form is ready for submission!');
      } else {
        toast.error(`${res.data.validation.errors.length} errors found`);
      }
    } catch (error) {
      toast.error('Validation failed');
    }
  };

  const handleSubmit = async () => {
    // Check if QA has been run and approved
    if (!qaApproved) {
      toast.error('Please run QA checks before submission');
      setShowQADialog(true);
      return;
    }

    try {
      const res = await api.post(`/forms/${formData.form_id}/submit`, {
        form_data: formData,
        signature: user?.email
      });

      toast.success('Form submitted to VA successfully!');
      setSubmission(res.data);
    } catch (error) {
      const errorMsg = error.response?.data?.detail?.message || 'Submission failed';
      toast.error(errorMsg);
    }
  };

  const handleQASubmitReady = () => {
    setQaApproved(true);
    toast.success('QA checks passed! You can now submit your claim.');
  };

  if (loading) {
    return (
      <VeteranLayout>
        <div className="min-h-full bg-white p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Generating your VA Form 21-526EZ...</p>
          </div>
        </div>
      </VeteranLayout>
    );
  }

  if (error) {
    return (
      <VeteranLayout>
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Failed to Load Form</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate(`/claim/${claimId}`)}>
                Back to Claim
              </Button>
              <Button onClick={() => window.location.reload()} className="bg-[hsl(var(--primary))]">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </VeteranLayout>
    );
  }

  // ── Submission confirmation screen ──────────────────────────────────────────
  if (submission) {
    return (
      <VeteranLayout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white border border-green-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Green header */}
            <div className="bg-green-600 px-8 py-6 text-white text-center">
              <CheckCircle2 className="h-14 w-14 mx-auto mb-3 text-white" />
              <h1 className="text-2xl font-bold">Claim Submitted to VA</h1>
              <p className="text-green-100 mt-1 text-sm">Your VA Form 21-526EZ has been received via the Benefits Intake API</p>
            </div>

            <div className="px-8 py-6 space-y-5">
              {/* GUID */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Submission GUID (Benefits Intake API)</p>
                <p className="font-mono text-sm text-blue-900 break-all">{submission.intake_guid}</p>
                <p className="text-xs text-blue-600 mt-1">Use this GUID to track your submission status</p>
              </div>

              {/* Confirmation number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-0.5">Confirmation #</p>
                  <p className="font-semibold text-sm text-slate-800">{submission.confirmation_number}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-0.5">Status</p>
                  <p className="font-semibold text-sm text-green-700 capitalize">{submission.status}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-0.5">Submitted At</p>
                  <p className="font-semibold text-sm text-slate-800">{new Date(submission.submitted_at).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-0.5">VA API</p>
                  <p className="font-semibold text-sm text-slate-800">{submission.va_api}</p>
                </div>
              </div>

              {/* Est. decision */}
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Estimated Decision Date</p>
                  <p className="text-xs text-amber-600">{new Date(submission.estimated_decision_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-[hsl(var(--primary))]" onClick={() => navigate(`/claim/${claimId}`)}>
                  View Claim Status
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate('/my-claims')}>
                  My Claims
                </Button>
              </div>
            </div>
          </div>
        </div>
      </VeteranLayout>
    );
  }

  if (!formData) return null;

  const sections = formData.sections || {};
  const section1 = sections.section_1_veteran_info || {};
  const section2 = sections.section_2_service_info || {};
  const section3 = sections.section_3_conditions || {};
  const section5 = sections.section_5_contact || {};

  const pct = validation?.completion_percentage || 0;
  const s1Complete = !['First Name','Last Name','SSN','Date of Birth'].some(f => validation?.missing_fields?.includes(f));
  const s2Complete = !['Branch of Service','Service Number','Service Start Date'].some(f => validation?.missing_fields?.includes(f));
  const s5Complete = !['Phone','Email','Street Address','City','State','ZIP Code'].some(f => validation?.missing_fields?.includes(f));

  const navSections = [
    { key: 'section_1_veteran_info', label: 'Veteran Info',  Icon: User,          complete: s1Complete },
    { key: 'section_2_service_info', label: 'Service',       Icon: Briefcase,     complete: s2Complete },
    { key: 'section_3_conditions',   label: 'Conditions',    Icon: ClipboardList, complete: true },
    { key: 'section_5_contact',      label: 'Contact',       Icon: Phone,         complete: s5Complete },
  ];

  return (
    <VeteranLayout>
    <div className="min-h-full bg-slate-50" data-testid="form-editor">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: breadcrumb + title */}
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/claim/${claimId}`)} className="text-slate-500 hover:text-slate-900 shrink-0">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="h-4 w-px bg-slate-200 shrink-0" />
              <FileText className="h-5 w-5 text-[hsl(var(--primary))] shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-slate-900 truncate">VA Form 21-526EZ</h1>
                <p className="text-xs text-slate-400 truncate">Claim {formData.claim_id?.slice(-8) || ''}</p>
              </div>
              {saving ? (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 shrink-0"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Saving</Badge>
              ) : (
                <Badge variant="outline" className="text-slate-500 shrink-0">Auto-Populated</Badge>
              )}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} data-testid="toggle-preview-button">
                <Eye className="h-4 w-4 mr-1.5" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => setShowQADialog(true)}
                className={qaApproved ? 'border-green-500 text-green-700 bg-green-50' : ''}
                data-testid="open-qa-button"
              >
                <Shield className="h-4 w-4 mr-1.5" />
                {qaApproved ? 'QA Passed' : 'Run QA Check'}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!validation?.valid || !qaApproved}
                className="bg-[hsl(var(--primary))] text-white"
                data-testid="submit-form-button"
              >
                <Send className="h-4 w-4 mr-1.5" />
                Submit to VA
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <Progress value={pct} className="h-1.5 flex-1" />
              <span className="text-xs font-medium text-slate-600 w-8 text-right">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* QA Checklist Dialog */}
      <QAChecklist open={showQADialog} onOpenChange={setShowQADialog} claimId={claimId} onSubmitReady={handleQASubmitReady} />

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>

          {/* ── Form sections ───────────────────────────────────────────── */}
          <div className={showPreview ? 'lg:col-span-2 space-y-4' : 'space-y-4'}>

            {/* Section nav pills */}
            <div className="flex flex-wrap gap-2">
              {navSections.map(({ key, label, Icon, complete }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all
                    ${activeSection === key
                      ? 'bg-[hsl(var(--primary))] text-white border-transparent shadow-sm'
                      : complete
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {complete && activeSection !== key
                    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                    : <Icon className="h-4 w-4" />}
                  {label}
                </button>
              ))}
            </div>

            {/* Section 1 */}
            {activeSection === 'section_1_veteran_info' && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-[hsl(var(--primary))]" />
                    Section I — Veteran Identification
                    {s1Complete && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="first_name" className="text-xs font-medium text-slate-600">First Name *</Label>
                      <Input id="first_name" value={section1.first_name || ''} onChange={(e) => handleFieldChange('section_1_veteran_info', 'first_name', e.target.value)} className="mt-1" data-testid="input-first-name" />
                    </div>
                    <div>
                      <Label htmlFor="middle_name" className="text-xs font-medium text-slate-600">Middle Name</Label>
                      <Input id="middle_name" value={section1.middle_name || ''} onChange={(e) => handleFieldChange('section_1_veteran_info', 'middle_name', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="last_name" className="text-xs font-medium text-slate-600">Last Name *</Label>
                      <Input id="last_name" value={section1.last_name || ''} onChange={(e) => handleFieldChange('section_1_veteran_info', 'last_name', e.target.value)} className="mt-1" data-testid="input-last-name" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ssn" className="text-xs font-medium text-slate-600">Social Security Number *</Label>
                      <Input id="ssn" value={section1.ssn || ''} onChange={(e) => handleFieldChange('section_1_veteran_info', 'ssn', e.target.value)} placeholder="XXX-XX-XXXX" className="mt-1" data-testid="input-ssn" />
                    </div>
                    <div>
                      <Label htmlFor="dob" className="text-xs font-medium text-slate-600">Date of Birth *</Label>
                      <Input id="dob" type="date" value={section1.dob || ''} onChange={(e) => handleFieldChange('section_1_veteran_info', 'dob', e.target.value)} className="mt-1" data-testid="input-dob" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 2 */}
            {activeSection === 'section_2_service_info' && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Briefcase className="h-4 w-4 text-[hsl(var(--primary))]" />
                    Section II — Military Service Information
                    {s2Complete && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branch" className="text-xs font-medium text-slate-600">Branch of Service *</Label>
                      <Select value={section2.branch || ''} onValueChange={(value) => handleFieldChange('section_2_service_info', 'branch', value)}>
                        <SelectTrigger className="mt-1" data-testid="select-branch"><SelectValue placeholder="Select branch" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Army">Army</SelectItem>
                          <SelectItem value="Navy">Navy</SelectItem>
                          <SelectItem value="Air Force">Air Force</SelectItem>
                          <SelectItem value="Marines">Marines</SelectItem>
                          <SelectItem value="Coast Guard">Coast Guard</SelectItem>
                          <SelectItem value="Space Force">Space Force</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="service_number" className="text-xs font-medium text-slate-600">Service Number *</Label>
                      <Input id="service_number" value={section2.service_number || ''} onChange={(e) => handleFieldChange('section_2_service_info', 'service_number', e.target.value)} className="mt-1" data-testid="input-service-number" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service_start" className="text-xs font-medium text-slate-600">Service Start Date *</Label>
                      <Input id="service_start" type="date" value={section2.service_start_date || ''} onChange={(e) => handleFieldChange('section_2_service_info', 'service_start_date', e.target.value)} className="mt-1" data-testid="input-service-start" />
                    </div>
                    <div>
                      <Label htmlFor="service_end" className="text-xs font-medium text-slate-600">Service End Date</Label>
                      <Input id="service_end" type="date" value={section2.service_end_date || ''} onChange={(e) => handleFieldChange('section_2_service_info', 'service_end_date', e.target.value)} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 3 */}
            {activeSection === 'section_3_conditions' && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-4 w-4 text-[hsl(var(--primary))]" />
                    Section III — Disabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {section3.conditions?.length > 0 ? (
                    <div className="space-y-3">
                      {section3.conditions.map((condition, index) => (
                        <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg" data-testid={`condition-${index}`}>
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-medium text-sm">Condition #{condition.number}</h4>
                            <Badge variant="outline" className="text-xs">{condition.va_code || 'Auto-coded'}</Badge>
                          </div>
                          <p className="text-sm text-slate-600">{condition.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No conditions found.</p>
                      <p className="text-xs text-slate-400 mt-1">Complete the intake questionnaire to populate conditions.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section 5 */}
            {activeSection === 'section_5_contact' && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Phone className="h-4 w-4 text-[hsl(var(--primary))]" />
                    Section V — Contact Information
                    {s5Complete && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="street" className="text-xs font-medium text-slate-600">Street Address *</Label>
                    <Input id="street" value={section5.mailing_address?.street || ''} onChange={(e) => handleFieldChange('section_5_contact', 'mailing_address', { ...section5.mailing_address, street: e.target.value })} className="mt-1" data-testid="input-street" />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-xs font-medium text-slate-600">City *</Label>
                      <Input id="city" value={section5.mailing_address?.city || ''} onChange={(e) => handleFieldChange('section_5_contact', 'mailing_address', { ...section5.mailing_address, city: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-xs font-medium text-slate-600">State *</Label>
                      <Input id="state" value={section5.mailing_address?.state || ''} onChange={(e) => handleFieldChange('section_5_contact', 'mailing_address', { ...section5.mailing_address, state: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="zip" className="text-xs font-medium text-slate-600">ZIP Code *</Label>
                      <Input id="zip" value={section5.mailing_address?.zip || ''} onChange={(e) => handleFieldChange('section_5_contact', 'mailing_address', { ...section5.mailing_address, zip: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-xs font-medium text-slate-600">Phone *</Label>
                      <Input id="phone" value={section5.phone_primary || ''} onChange={(e) => handleFieldChange('section_5_contact', 'phone_primary', e.target.value)} className="mt-1" data-testid="input-phone" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs font-medium text-slate-600">Email *</Label>
                      <Input id="email" type="email" value={section5.email || ''} onChange={(e) => handleFieldChange('section_5_contact', 'email', e.target.value)} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Right panel: Submission Readiness ───────────────────────── */}
          {showPreview && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-slate-200 shadow-sm" data-testid="form-preview">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
                    Submission Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Completion ring-style indicator */}
                  <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                    <div className={`text-3xl font-bold ${pct === 100 ? 'text-green-600' : pct >= 60 ? 'text-amber-600' : 'text-slate-700'}`}>{pct}%</div>
                    <p className="text-xs text-slate-500 mt-0.5">Form Complete</p>
                    <Progress value={pct} className="h-2 mt-3" />
                  </div>

                  {/* Section checklist */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sections</p>
                    {navSections.map(({ key, label, Icon, complete }) => (
                      <button key={key} onClick={() => setActiveSection(key)}
                        className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 transition-colors text-left">
                        {complete
                          ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          : <Circle className="h-4 w-4 text-slate-300 shrink-0" />}
                        <span className={`text-sm ${complete ? 'text-slate-700' : 'text-slate-500'}`}>{label}</span>
                        {activeSection === key && <Badge className="ml-auto text-xs py-0 bg-slate-100 text-slate-600 border-slate-200">Editing</Badge>}
                      </button>
                    ))}
                  </div>

                  {/* Filled-in summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
                    <p className="font-semibold text-slate-700">VA FORM 21-526EZ</p>
                    <div className="space-y-1 text-slate-600">
                      <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="font-medium truncate ml-2 max-w-[120px] text-right">{[section1.first_name, section1.last_name].filter(Boolean).join(' ') || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">SSN</span><span className="font-medium">{section1.ssn || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Branch</span><span className="font-medium">{section2.branch || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Conditions</span><span className="font-medium">{section3.conditions?.length || 0}</span></div>
                    </div>
                  </div>

                  {/* Missing fields */}
                  {validation?.missing_fields?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Still needed
                      </p>
                      <ul className="space-y-0.5">
                        {validation.missing_fields.map((f, i) => (
                          <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                            <Circle className="h-1.5 w-1.5 fill-amber-400 text-amber-400 shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation?.valid && !qaApproved && (
                    <Button className="w-full" variant="outline" onClick={() => setShowQADialog(true)}>
                      <Shield className="h-4 w-4 mr-2" />Run QA Check to Submit
                    </Button>
                  )}
                  {validation?.valid && qaApproved && (
                    <Button className="w-full bg-[hsl(var(--primary))] text-white" onClick={handleSubmit}>
                      <Send className="h-4 w-4 mr-2" />Submit to VA
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
    </VeteranLayout>
  );
}
