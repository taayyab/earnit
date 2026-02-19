import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import QAChecklist from '../components/QAChecklist';
import PageHeader from '../components/PageHeader';
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
  Save,
  Send,
  Eye,
  Shield
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

  useEffect(() => {
    loadOrGenerateForm();
  }, [claimId]);

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
      navigate(`/claim/${claimId}`);
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
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Generating your VA Form 21-526EZ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader 
          title="VA Form 21-526EZ"
          subtitle="Form Editor"
          backTo={`/claim/${claimId}`}
        />
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
      </div>
    );
  }

  if (!formData) return null;

  const sections = formData.sections || {};
  const section1 = sections.section_1_veteran_info || {};
  const section2 = sections.section_2_service_info || {};
  const section3 = sections.section_3_conditions || {};
  const section5 = sections.section_5_contact || {};
  const section6 = sections.section_6_direct_deposit || {};

  return (
    <div className="min-h-screen bg-white" data-testid="form-editor">
      <PageHeader 
        title="VA Form 21-526EZ"
        subtitle={`Claim: ${formData.claim_id?.slice(-8) || ''} • ${validation?.completion_percentage || 0}% Complete`}
        backTo={`/claim/${claimId}`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />
            <Badge variant="outline">Auto-Populated</Badge>
            {saving && <Badge className="bg-blue-500">Saving...</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              data-testid="toggle-preview-button"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowQADialog(true)}
              className={qaApproved ? 'border-[hsl(var(--success))] text-[hsl(var(--success))]' : ''}
              data-testid="open-qa-button"
            >
              <Shield className="h-4 w-4 mr-2" />
              {qaApproved ? 'QA Passed' : 'Run QA Check'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!validation?.valid || !qaApproved}
              className="bg-[hsl(var(--accent))] hover:bg-[#8F1B29]"
              data-testid="submit-form-button"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit to VA
            </Button>
          </div>
        </div>
      </div>

      {/* QA Checklist Dialog */}
      <QAChecklist
        open={showQADialog}
        onOpenChange={setShowQADialog}
        claimId={claimId}
        onSubmitReady={handleQASubmitReady}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Validation Alerts */}
        {validation && !validation.overall_complete && (
          <Alert className="mb-6 border-orange-500 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription>
              <strong>Form Incomplete:</strong> {validation.missing_fields?.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Editor - Left Side (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeSection} onValueChange={setActiveSection}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="section_1_veteran_info" data-testid="tab-section-1">
                  Veteran Info
                </TabsTrigger>
                <TabsTrigger value="section_2_service_info" data-testid="tab-section-2">
                  Service
                </TabsTrigger>
                <TabsTrigger value="section_3_conditions" data-testid="tab-section-3">
                  Conditions
                </TabsTrigger>
                <TabsTrigger value="section_5_contact" data-testid="tab-section-5">
                  Contact
                </TabsTrigger>
              </TabsList>

              {/* Section 1: Veteran Info */}
              <TabsContent value="section_1_veteran_info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Section I: Veteran Identification
                      {section1.validation?.complete && (
                        <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                          id="first_name"
                          value={section1.first_name || ''}
                          onChange={(e) => handleFieldChange('section_1_veteran_info', 'first_name', e.target.value)}
                          data-testid="input-first-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="middle_name">Middle Name</Label>
                        <Input
                          id="middle_name"
                          value={section1.middle_name || ''}
                          onChange={(e) => handleFieldChange('section_1_veteran_info', 'middle_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input
                          id="last_name"
                          value={section1.last_name || ''}
                          onChange={(e) => handleFieldChange('section_1_veteran_info', 'last_name', e.target.value)}
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ssn">Social Security Number *</Label>
                        <Input
                          id="ssn"
                          value={section1.ssn || ''}
                          onChange={(e) => handleFieldChange('section_1_veteran_info', 'ssn', e.target.value)}
                          placeholder="XXX-XX-XXXX"
                          data-testid="input-ssn"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dob">Date of Birth *</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={section1.dob || ''}
                          onChange={(e) => handleFieldChange('section_1_veteran_info', 'dob', e.target.value)}
                          data-testid="input-dob"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Section 2: Service Info */}
              <TabsContent value="section_2_service_info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Section II: Military Service Information
                      {section2.validation?.complete && (
                        <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="branch">Branch of Service *</Label>
                        <Select
                          value={section2.branch || ''}
                          onValueChange={(value) => handleFieldChange('section_2_service_info', 'branch', value)}
                        >
                          <SelectTrigger data-testid="select-branch">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
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
                        <Label htmlFor="service_number">Service Number *</Label>
                        <Input
                          id="service_number"
                          value={section2.service_number || ''}
                          onChange={(e) => handleFieldChange('section_2_service_info', 'service_number', e.target.value)}
                          data-testid="input-service-number"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="service_start">Service Start Date *</Label>
                        <Input
                          id="service_start"
                          type="date"
                          value={section2.service_start_date || ''}
                          onChange={(e) => handleFieldChange('section_2_service_info', 'service_start_date', e.target.value)}
                          data-testid="input-service-start"
                        />
                      </div>
                      <div>
                        <Label htmlFor="service_end">Service End Date</Label>
                        <Input
                          id="service_end"
                          type="date"
                          value={section2.service_end_date || ''}
                          onChange={(e) => handleFieldChange('section_2_service_info', 'service_end_date', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Section 3: Conditions */}
              <TabsContent value="section_3_conditions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Section III: Disabilities
                      {section3.validation?.complete && (
                        <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {section3.conditions?.length > 0 ? (
                      <div className="space-y-4">
                        {section3.conditions.map((condition, index) => (
                          <div
                            key={index}
                            className="p-4 border border-border rounded-lg"
                            data-testid={`condition-${index}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">Condition #{condition.number}</h4>
                              <Badge variant="outline">{condition.va_code || 'Auto-coded'}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{condition.name}</p>
                            {condition.description && (
                              <p className="text-xs text-muted-foreground">{condition.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No conditions found. Please complete the intake questionnaire first.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Section 5: Contact */}
              <TabsContent value="section_5_contact" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Section V: Contact Information
                      {section5.validation?.complete && (
                        <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        value={section5.mailing_address?.street || ''}
                        onChange={(e) => handleFieldChange('section_5_contact', 'mailing_address', {
                          ...section5.mailing_address,
                          street: e.target.value
                        })}
                        data-testid="input-street"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={section5.mailing_address?.city || ''}
                          onChange={(e) => handleFieldChange('section_5_contact', 'mailing_address', {
                            ...section5.mailing_address,
                            city: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={section5.mailing_address?.state || ''}
                          onChange={(e) => handleFieldChange('section_5_contact', 'mailing_address', {
                            ...section5.mailing_address,
                            state: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code *</Label>
                        <Input
                          id="zip"
                          value={section5.mailing_address?.zip || ''}
                          onChange={(e) => handleFieldChange('section_5_contact', 'mailing_address', {
                            ...section5.mailing_address,
                            zip: e.target.value
                          })}
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          value={section5.phone_primary || ''}
                          onChange={(e) => handleFieldChange('section_5_contact', 'phone_primary', e.target.value)}
                          data-testid="input-phone"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={section5.email || ''}
                          onChange={(e) => handleFieldChange('section_5_contact', 'email', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview - Right Side (1/3 width) */}
          {showPreview && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24" data-testid="form-preview">
                <CardHeader>
                  <CardTitle className="text-sm">Form Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg text-xs space-y-2">
                    <h3 className="font-semibold text-sm mb-2">VA FORM 21-526EZ</h3>
                    <div>
                      <p className="text-muted-foreground">Veteran Name:</p>
                      <p className="font-medium">
                        {section1.first_name} {section1.middle_name} {section1.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">SSN:</p>
                      <p className="font-medium">{section1.ssn || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Service Branch:</p>
                      <p className="font-medium">{section2.branch || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conditions Claimed:</p>
                      <p className="font-medium">{section3.total_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completion:</p>
                      <Progress value={validation?.completion_percentage || 0} className="h-2 mt-1" />
                      <p className="text-xs mt-1">{validation?.completion_percentage || 0}%</p>
                    </div>
                  </div>
                  
                  {validation && validation.missing_fields?.length > 0 && (
                    <Alert className="border-orange-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Missing:</strong>
                        <ul className="mt-1 list-disc list-inside">
                          {validation.missing_fields.map((field, i) => (
                            <li key={i}>{field}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
