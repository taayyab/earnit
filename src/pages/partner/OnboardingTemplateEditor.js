import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Save,
  ArrowLeft,
  GripVertical,
  Shield,
  FileText,
  Target,
  Eye,
  Star,
  CheckCircle2,
  AlertCircle,
  Folder,
  MessageSquare,
  Clock,
  Phone,
  Mail,
  Video,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const DEFAULT_STEPS = [
  { id: 'veteran_info', name: 'Veteran Information', description: 'Collect basic contact information', is_required: true, order: 1 },
  { id: 'consents', name: 'Consent Authorization', description: 'Capture required consents', is_required: true, order: 2 },
  { id: 'poa', name: 'Power of Attorney', description: 'Upload POA documentation', is_required: false, order: 3 },
  { id: 'confirmation', name: 'Confirmation', description: 'Review and confirm', is_required: true, order: 4 }
];

const DEFAULT_CONSENT_TYPES = [
  { id: 'representation', label: 'Representation Consent', description: 'Authorization to represent before the VA', required: true },
  { id: 'phi_access', label: 'PHI Access Authorization', description: 'Access to Protected Health Information', required: true },
  { id: 'communication', label: 'Communication Consent', description: 'Permission to send claim status updates', required: false },
  { id: 'third_party', label: 'Third-Party Information Sharing', description: 'Share with approved providers', required: false }
];

const DEFAULT_CLAIM_PATHWAYS = [
  { id: 'initial', name: 'Initial Claim', description: 'First-time disability claim filing', enabled: true, order: 1 },
  { id: 'increase', name: 'Rating Increase', description: 'Request higher rating for existing condition', enabled: true, order: 2 },
  { id: 'appeal', name: 'Appeal/Supplemental', description: 'Appeal or supplement previous decision', enabled: true, order: 3 },
  { id: 'secondary', name: 'Secondary Condition', description: 'Condition caused by service-connected disability', enabled: true, order: 4 }
];

const DEFAULT_DOCUMENT_CHECKLISTS = {
  initial: [
    { id: 'dd214', name: 'DD-214', description: 'Certificate of Release or Discharge', required: true },
    { id: 'medical_records', name: 'Medical Records', description: 'Service medical records or VA treatment records', required: true },
    { id: 'buddy_statements', name: 'Buddy Statements', description: 'Statements from fellow service members', required: false },
    { id: 'nexus_letter', name: 'Nexus Letter', description: 'Medical opinion linking condition to service', required: false }
  ],
  increase: [
    { id: 'recent_treatment', name: 'Recent Treatment Records', description: 'Medical records from the past 12 months', required: true },
    { id: 'dbq', name: 'DBQ Form', description: 'Disability Benefits Questionnaire for your condition', required: false },
    { id: 'personal_statement', name: 'Personal Statement', description: 'Description of worsening symptoms', required: true }
  ],
  appeal: [
    { id: 'decision_letter', name: 'VA Decision Letter', description: 'The original denial or rating decision', required: true },
    { id: 'new_evidence', name: 'New Evidence', description: 'Evidence not previously submitted', required: true },
    { id: 'imo', name: 'Independent Medical Opinion', description: 'Expert medical opinion supporting claim', required: false }
  ],
  secondary: [
    { id: 'primary_rating', name: 'Primary Rating Letter', description: 'Documentation of service-connected condition', required: true },
    { id: 'nexus_secondary', name: 'Secondary Nexus Letter', description: 'Medical opinion linking secondary to primary condition', required: true },
    { id: 'treatment_records', name: 'Treatment Records', description: 'Medical documentation for secondary condition', required: true }
  ]
};

const DEFAULT_COMMUNICATION_CHANNELS = [
  { id: 'phone', name: 'Phone', icon: 'Phone', enabled: true },
  { id: 'email', name: 'Email', icon: 'Mail', enabled: true },
  { id: 'sms', name: 'Text/SMS', icon: 'MessageSquare', enabled: true },
  { id: 'video', name: 'Video Call', icon: 'Video', enabled: true }
];

const DEFAULT_CONTACT_FREQUENCIES = [
  { id: 'weekly', name: 'Weekly', description: 'Contact at least once per week' },
  { id: 'biweekly', name: 'Bi-weekly', description: 'Contact every two weeks' },
  { id: 'monthly', name: 'Monthly', description: 'Contact once per month' },
  { id: 'as_needed', name: 'As Needed', description: 'Contact only when updates are available' }
];

export default function OnboardingTemplateEditor() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isEditing = Boolean(templateId);
  
  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    is_default: false,
    steps: [...DEFAULT_STEPS],
    consent_types: [...DEFAULT_CONSENT_TYPES],
    objectives: [],
    required_documents: [],
    welcome_message: '',
    completion_message: '',
    logo_url: '',
    primary_color: '#1B3A5F',
    claim_pathways: [...DEFAULT_CLAIM_PATHWAYS],
    document_checklists: JSON.parse(JSON.stringify(DEFAULT_DOCUMENT_CHECKLISTS)),
    communication_channels: [...DEFAULT_COMMUNICATION_CHANNELS],
    contact_frequencies: [...DEFAULT_CONTACT_FREQUENCIES],
    default_contact_frequency: 'biweekly'
  });
  
  const [expandedPathway, setExpandedPathway] = useState(null);
  
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadOrganization();
  }, []);

  useEffect(() => {
    if (organizationId) {
      loadTemplates();
      if (templateId) {
        loadTemplate(templateId);
      }
    }
  }, [organizationId, templateId]);

  const loadOrganization = async () => {
    try {
      const response = await fetch('/api/partner/organization', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to load organization');
      }
      
      const data = await response.json();
      
      if (!data.organization) {
        navigate('/partner/register');
        return;
      }
      
      setOrganizationId(data.organization.id);
    } catch (err) {
      console.error('Failed to load organization:', err);
      setError('Failed to load organization. Please try again.');
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/partner/organization/${organizationId}/onboarding-templates`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async (id) => {
    try {
      const response = await fetch(`/api/partner/organization/${organizationId}/onboarding-templates/${id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplate({
          ...data.template,
          steps: data.template.steps?.length ? data.template.steps : [...DEFAULT_STEPS],
          consent_types: data.template.consent_types?.length ? data.template.consent_types : [...DEFAULT_CONSENT_TYPES],
          claim_pathways: data.template.claim_pathways?.length ? data.template.claim_pathways : [...DEFAULT_CLAIM_PATHWAYS],
          document_checklists: data.template.document_checklists || JSON.parse(JSON.stringify(DEFAULT_DOCUMENT_CHECKLISTS)),
          communication_channels: data.template.communication_channels?.length ? data.template.communication_channels : [...DEFAULT_COMMUNICATION_CHANNELS],
          contact_frequencies: data.template.contact_frequencies?.length ? data.template.contact_frequencies : [...DEFAULT_CONTACT_FREQUENCIES],
          default_contact_frequency: data.template.default_contact_frequency || 'biweekly'
        });
        setShowEditor(true);
      } else {
        setError('Template not found');
      }
    } catch (err) {
      console.error('Failed to load template:', err);
      setError('Failed to load template');
    }
  };

  const handleSave = async () => {
    if (!template.name.trim()) {
      setError('Please enter a template name');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/partner/organization/${organizationId}/onboarding-templates/${templateId}`
        : `/api/partner/organization/${organizationId}/onboarding-templates`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(template)
      });

      if (response.ok) {
        setSuccess(isEditing ? 'Template updated successfully' : 'Template created successfully');
        setTimeout(() => {
          setSuccess(null);
          if (!isEditing) {
            setShowEditor(false);
            loadTemplates();
            resetForm();
          }
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to save template');
      }
    } catch (err) {
      console.error('Failed to save template:', err);
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/partner/organization/${organizationId}/onboarding-templates/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        loadTemplates();
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to delete template');
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
      setError('An error occurred while deleting');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await fetch(`/api/partner/organization/${organizationId}/onboarding-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_default: true })
      });

      if (response.ok) {
        loadTemplates();
      }
    } catch (err) {
      console.error('Failed to set default:', err);
    }
  };

  const resetForm = () => {
    setTemplate({
      name: '',
      description: '',
      is_default: false,
      steps: [...DEFAULT_STEPS],
      consent_types: [...DEFAULT_CONSENT_TYPES],
      objectives: [],
      required_documents: [],
      welcome_message: '',
      completion_message: '',
      logo_url: '',
      primary_color: '#1B3A5F',
      claim_pathways: [...DEFAULT_CLAIM_PATHWAYS],
      document_checklists: JSON.parse(JSON.stringify(DEFAULT_DOCUMENT_CHECKLISTS)),
      communication_channels: [...DEFAULT_COMMUNICATION_CHANNELS],
      contact_frequencies: [...DEFAULT_CONTACT_FREQUENCIES],
      default_contact_frequency: 'biweekly'
    });
    setExpandedPathway(null);
  };

  const addStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      name: 'New Step',
      description: '',
      is_required: false,
      order: template.steps.length + 1
    };
    setTemplate(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (index, field, value) => {
    setTemplate(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeStep = (index) => {
    setTemplate(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const addConsentType = () => {
    const newConsent = {
      id: `consent_${Date.now()}`,
      label: 'New Consent',
      description: '',
      required: false
    };
    setTemplate(prev => ({
      ...prev,
      consent_types: [...prev.consent_types, newConsent]
    }));
  };

  const updateConsentType = (index, field, value) => {
    setTemplate(prev => ({
      ...prev,
      consent_types: prev.consent_types.map((consent, i) => 
        i === index ? { ...consent, [field]: value } : consent
      )
    }));
  };

  const removeConsentType = (index) => {
    setTemplate(prev => ({
      ...prev,
      consent_types: prev.consent_types.filter((_, i) => i !== index)
    }));
  };

  const addObjective = () => {
    const newObjective = {
      id: `obj_${Date.now()}`,
      title: 'New Objective',
      description: ''
    };
    setTemplate(prev => ({
      ...prev,
      objectives: [...(prev.objectives || []), newObjective]
    }));
  };

  const updateObjective = (index, field, value) => {
    setTemplate(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => 
        i === index ? { ...obj, [field]: value } : obj
      )
    }));
  };

  const removeObjective = (index) => {
    setTemplate(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const updateClaimPathway = (pathwayId, field, value) => {
    setTemplate(prev => ({
      ...prev,
      claim_pathways: prev.claim_pathways.map(p => 
        p.id === pathwayId ? { ...p, [field]: value } : p
      )
    }));
  };

  const addDocumentToChecklist = (pathwayId) => {
    const newDoc = {
      id: `doc_${Date.now()}`,
      name: 'New Document',
      description: '',
      required: false
    };
    setTemplate(prev => ({
      ...prev,
      document_checklists: {
        ...prev.document_checklists,
        [pathwayId]: [...(prev.document_checklists[pathwayId] || []), newDoc]
      }
    }));
  };

  const updateDocumentInChecklist = (pathwayId, docIndex, field, value) => {
    setTemplate(prev => ({
      ...prev,
      document_checklists: {
        ...prev.document_checklists,
        [pathwayId]: prev.document_checklists[pathwayId].map((doc, i) => 
          i === docIndex ? { ...doc, [field]: value } : doc
        )
      }
    }));
  };

  const removeDocumentFromChecklist = (pathwayId, docIndex) => {
    setTemplate(prev => ({
      ...prev,
      document_checklists: {
        ...prev.document_checklists,
        [pathwayId]: prev.document_checklists[pathwayId].filter((_, i) => i !== docIndex)
      }
    }));
  };

  const updateCommunicationChannel = (channelId, field, value) => {
    setTemplate(prev => ({
      ...prev,
      communication_channels: prev.communication_channels.map(c => 
        c.id === channelId ? { ...c, [field]: value } : c
      )
    }));
  };

  const getChannelIcon = (iconName) => {
    switch (iconName) {
      case 'Phone': return Phone;
      case 'Mail': return Mail;
      case 'MessageSquare': return MessageSquare;
      case 'Video': return Video;
      default: return MessageSquare;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading templates...</div>
      </div>
    );
  }

  const renderTemplateList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Onboarding Templates</h1>
          <p className="text-slate-600 mt-1">
            Create and manage custom onboarding flows for your veteran clients
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/partner/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            className="bg-[#1B3A5F] hover:bg-[#2c4f7c] text-white"
            onClick={() => {
              resetForm();
              setShowEditor(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Templates Yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first onboarding template to customize the client intake experience.
            </p>
            <Button 
              className="bg-[#1B3A5F] hover:bg-[#2c4f7c] text-white"
              onClick={() => {
                resetForm();
                setShowEditor(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <Card key={t.id} className={t.is_default ? 'border-[#1B3A5F] border-2' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {t.name}
                      {t.is_default && (
                        <Badge className="bg-[#1B3A5F]">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    {t.description && (
                      <p className="text-sm text-slate-500 mt-1">{t.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <span>{t.steps_count} steps</span>
                  <span>{t.consent_types_count} consents</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/partner/templates/${t.id}`)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {!t.is_default && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefault(t.id)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Set Default
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(t.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderEditor = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Template' : 'Create Template'}
          </h1>
          <p className="text-slate-600 mt-1">
            Customize the onboarding experience for your clients
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowEditor(false);
              if (isEditing) navigate('/partner/templates');
            }}
          >
            Cancel
          </Button>
          <Button 
            className="bg-[#1B3A5F] hover:bg-[#2c4f7c] text-white"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'general', label: 'General', icon: Settings },
          { id: 'steps', label: 'Steps', icon: FileText },
          { id: 'consents', label: 'Consents', icon: Shield },
          { id: 'objectives', label: 'Objectives', icon: Target },
          { id: 'pathways', label: 'Pathways', icon: Folder },
          { id: 'communication', label: 'Communication', icon: MessageSquare },
          { id: 'preview', label: 'Preview', icon: Eye }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#1B3A5F] text-[#1B3A5F]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                placeholder="e.g., Standard Intake, Fast-Track Claims"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={template.description || ''}
                onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                rows={2}
                placeholder="Brief description of this template..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={template.is_default}
                onChange={(e) => setTemplate(prev => ({ ...prev, is_default: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
              />
              <label htmlFor="is_default" className="text-sm text-slate-700">
                Set as default template for new clients
              </label>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-slate-900 mb-4">Welcome & Completion Messages</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Welcome Message
                  </label>
                  <textarea
                    value={template.welcome_message || ''}
                    onChange={(e) => setTemplate(prev => ({ ...prev, welcome_message: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                    rows={3}
                    placeholder="Welcome message shown at the start of onboarding..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Completion Message
                  </label>
                  <textarea
                    value={template.completion_message || ''}
                    onChange={(e) => setTemplate(prev => ({ ...prev, completion_message: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                    rows={3}
                    placeholder="Message shown after successful onboarding..."
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-slate-900 mb-4">Branding</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={template.logo_url || ''}
                    onChange={(e) => setTemplate(prev => ({ ...prev, logo_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={template.primary_color || '#1B3A5F'}
                      onChange={(e) => setTemplate(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={template.primary_color || '#1B3A5F'}
                      onChange={(e) => setTemplate(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'steps' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Onboarding Steps</CardTitle>
              <Button variant="outline" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4 mr-1" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {template.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
                  <GripVertical className="w-5 h-5 text-slate-400 mt-2 cursor-move" />
                  <div className="flex-1 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => updateStep(index, 'name', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                        placeholder="Step name"
                      />
                      <input
                        type="text"
                        value={step.description || ''}
                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                        placeholder="Description"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={step.is_required}
                        onChange={(e) => updateStep(index, 'is_required', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                      />
                      <span className="text-sm text-slate-600">Required step</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'consents' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Consent Types</CardTitle>
              <Button variant="outline" size="sm" onClick={addConsentType}>
                <Plus className="w-4 h-4 mr-1" />
                Add Consent
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {template.consent_types.map((consent, index) => (
                <div key={consent.id} className="p-4 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={consent.label}
                        onChange={(e) => updateConsentType(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                        placeholder="Consent label"
                      />
                      <textarea
                        value={consent.description || ''}
                        onChange={(e) => updateConsentType(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                        rows={2}
                        placeholder="Description of what this consent authorizes..."
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={consent.required}
                          onChange={(e) => updateConsentType(index, 'required', e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                        />
                        <span className="text-sm text-slate-600">Required consent</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 ml-2"
                      onClick={() => removeConsentType(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'objectives' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Onboarding Objectives</CardTitle>
              <Button variant="outline" size="sm" onClick={addObjective}>
                <Plus className="w-4 h-4 mr-1" />
                Add Objective
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Define goals and objectives that will be shown to clients during onboarding.
            </p>
            <div className="space-y-4">
              {(template.objectives || []).map((obj, index) => (
                <div key={obj.id} className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
                  <Target className="w-5 h-5 text-[#1B3A5F] mt-2" />
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={obj.title}
                      onChange={(e) => updateObjective(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                      placeholder="Objective title"
                    />
                    <textarea
                      value={obj.description || ''}
                      onChange={(e) => updateObjective(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                      rows={2}
                      placeholder="Describe this objective..."
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => removeObjective(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {(template.objectives || []).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No objectives defined yet. Click "Add Objective" to create one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'pathways' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Claim Pathways</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Configure which claim pathways are available for clients during onboarding and customize their document requirements.
              </p>
              <div className="space-y-4">
                {(template.claim_pathways || []).map(pathway => (
                  <div key={pathway.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100"
                      onClick={() => setExpandedPathway(expandedPathway === pathway.id ? null : pathway.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={pathway.enabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateClaimPathway(pathway.id, 'enabled', e.target.checked);
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                        />
                        <Folder className="w-5 h-5 text-[#1B3A5F]" />
                        <div>
                          <span className="font-medium text-slate-900">{pathway.name}</span>
                          <p className="text-sm text-slate-500">{pathway.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pathway.enabled && (
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        )}
                        {expandedPathway === pathway.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    
                    {expandedPathway === pathway.id && (
                      <div className="p-4 border-t border-slate-200">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Pathway Name
                          </label>
                          <input
                            type="text"
                            value={pathway.name}
                            onChange={(e) => updateClaimPathway(pathway.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={pathway.description || ''}
                            onChange={(e) => updateClaimPathway(pathway.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                            rows={2}
                          />
                        </div>
                        
                        <div className="border-t border-slate-200 pt-4 mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-slate-900">Document Checklist</h4>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addDocumentToChecklist(pathway.id)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Document
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {(template.document_checklists[pathway.id] || []).map((doc, docIndex) => (
                              <div key={doc.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <FileText className="w-4 h-4 text-slate-400 mt-2" />
                                <div className="flex-1 space-y-2">
                                  <div className="grid md:grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={doc.name}
                                      onChange={(e) => updateDocumentInChecklist(pathway.id, docIndex, 'name', e.target.value)}
                                      className="px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-[#1B3A5F]"
                                      placeholder="Document name"
                                    />
                                    <input
                                      type="text"
                                      value={doc.description || ''}
                                      onChange={(e) => updateDocumentInChecklist(pathway.id, docIndex, 'description', e.target.value)}
                                      className="px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-[#1B3A5F]"
                                      placeholder="Description"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={doc.required}
                                      onChange={(e) => updateDocumentInChecklist(pathway.id, docIndex, 'required', e.target.checked)}
                                      className="h-3 w-3 rounded border-slate-300 text-[#1B3A5F]"
                                    />
                                    <span className="text-xs text-slate-600">Required document</span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => removeDocumentFromChecklist(pathway.id, docIndex)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            {(template.document_checklists[pathway.id] || []).length === 0 && (
                              <p className="text-sm text-slate-500 text-center py-4">
                                No documents configured for this pathway.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'communication' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Configure which communication channels are available for client contact preferences.
              </p>
              <div className="space-y-3">
                {(template.communication_channels || []).map(channel => {
                  const IconComponent = getChannelIcon(channel.icon);
                  return (
                    <div key={channel.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-[#1B3A5F]" />
                        <div>
                          <input
                            type="text"
                            value={channel.name}
                            onChange={(e) => updateCommunicationChannel(channel.id, 'name', e.target.value)}
                            className="font-medium text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#1B3A5F] focus:outline-none px-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={channel.enabled}
                            onChange={(e) => updateCommunicationChannel(channel.id, 'enabled', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                          />
                          Available
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Frequency Options</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Set the default contact frequency and available options for clients.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Default Contact Frequency
                </label>
                <select
                  value={template.default_contact_frequency || 'biweekly'}
                  onChange={(e) => setTemplate(prev => ({ ...prev, default_contact_frequency: e.target.value }))}
                  className="w-full md:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5F] focus:border-[#1B3A5F]"
                >
                  {(template.contact_frequencies || DEFAULT_CONTACT_FREQUENCIES).map(freq => (
                    <option key={freq.id} value={freq.id}>{freq.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {(template.contact_frequencies || DEFAULT_CONTACT_FREQUENCIES).map(freq => (
                  <div key={freq.id} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg">
                    <Clock className="w-5 h-5 text-[#1B3A5F]" />
                    <div className="flex-1">
                      <span className="font-medium text-slate-900">{freq.name}</span>
                      <p className="text-sm text-slate-500">{freq.description}</p>
                    </div>
                    {template.default_contact_frequency === freq.id && (
                      <Badge className="bg-[#1B3A5F]">Default</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Template Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {template.welcome_message && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">{template.welcome_message}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-slate-900 mb-3">Steps</h3>
                <div className="flex items-center gap-4">
                  {template.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1B3A5F] text-white text-sm">
                        {index + 1}
                      </div>
                      <span className="ml-2 text-sm text-slate-600">{step.name}</span>
                      {index < template.steps.length - 1 && (
                        <div className="w-8 h-0.5 bg-slate-200 mx-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-slate-900 mb-3">Consents</h3>
                <div className="space-y-2">
                  {template.consent_types.map(consent => (
                    <div key={consent.id} className="flex items-start gap-2 p-3 border border-slate-200 rounded">
                      <input type="checkbox" className="mt-1" disabled />
                      <div>
                        <span className="text-sm font-medium">{consent.label}</span>
                        {consent.required && <span className="text-red-500 ml-1">*</span>}
                        <p className="text-sm text-slate-500">{consent.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {template.completion_message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">{template.completion_message}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {showEditor || isEditing ? renderEditor() : renderTemplateList()}
      </div>
    </div>
  );
}
