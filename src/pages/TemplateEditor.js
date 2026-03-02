import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, Download, Sparkles, FileText, CheckCircle, 
  AlertTriangle, Clock, Eye, Edit2, RefreshCw, Info
} from 'lucide-react';

export default function TemplateEditor() {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [instance, setInstance] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [populating, setPopulating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [renderedContent, setRenderedContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (instanceId) {
      loadInstance();
    } else if (location.state?.templateId) {
      createNewInstance(location.state.templateId, location.state.conditionId, location.state.claimId);
    }
  }, [instanceId]);

  const loadInstance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/templates/instances/${instanceId}`);
      if (response.data.success) {
        setInstance(response.data.instance);
        const savedValues = response.data.instance.field_values || {};
        const aiValues = response.data.instance.ai_generated_content || {};
        const merged = { ...aiValues };
        Object.keys(savedValues).forEach(key => {
          if (savedValues[key] !== undefined && savedValues[key] !== '') {
            merged[key] = savedValues[key];
          }
        });
        setFieldValues(merged);
      }
    } catch (err) {
      toast.error('Failed to load template');
      navigate('/forms-library');
    } finally {
      setLoading(false);
    }
  };

  const createNewInstance = async (templateId, conditionId, claimId) => {
    try {
      setLoading(true);
      const response = await api.post('/templates/instances', {
        template_id: templateId,
        condition_id: conditionId,
        claim_id: claimId,
        auto_populate: true
      });
      if (response.data.success) {
        navigate(`/template-editor/${response.data.instance.id}`, { replace: true });
      }
    } catch (err) {
      toast.error('Failed to create template');
      navigate('/forms-library');
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/templates/instances/${instanceId}`, {
        field_values: fieldValues
      });
      setHasChanges(false);
      toast.success('Template saved');
    } catch (err) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handlePopulateWithAI = async () => {
    try {
      setPopulating(true);
      const response = await api.post(`/templates/instances/${instanceId}/populate`);
      if (response.data.success) {
        setInstance(response.data.instance);
        const values = response.data.instance.ai_generated_content || {};
        setFieldValues(prev => ({ ...prev, ...values }));
        toast.success('AI populated your template with relevant information');
      }
    } catch (err) {
      toast.error('AI population failed. Please fill in the fields manually.');
    } finally {
      setPopulating(false);
    }
  };

  const handlePreview = async () => {
    if (hasChanges) {
      await handleSave();
    }
    try {
      const response = await api.get(`/templates/instances/${instanceId}/render`);
      if (response.data.success) {
        setRenderedContent(response.data.rendered_content);
        setPreviewMode(true);
      }
    } catch (err) {
      toast.error('Failed to generate preview');
    }
  };

  const handleDownload = async () => {
    if (hasChanges) {
      await handleSave();
    }
    try {
      setDownloading(true);
      const response = await api.get(`/templates/instances/${instanceId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${instance?.title || 'template'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const renderField = (fieldId, fieldDef) => {
    const value = fieldValues[fieldId] || '';
    const hasAIValue = instance?.ai_generated_content?.[fieldId];
    
    return (
      <div key={fieldId} className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          {fieldDef.label}
          {fieldDef.required && <span className="text-red-500">*</span>}
          {hasAIValue && (
            <Badge className="bg-blue-50 text-[#1B3A5F] border-0 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </label>
        
        {fieldDef.help && (
          <p className="text-xs text-neutral-500 flex items-center gap-1">
            <Info className="h-3 w-3" />
            {fieldDef.help}
          </p>
        )}
        
        {fieldDef.type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
            placeholder={fieldDef.placeholder || `Enter ${fieldDef.label.toLowerCase()}...`}
            rows={4}
            className="resize-y"
          />
        ) : fieldDef.type === 'select' ? (
          <select
            value={value}
            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B3A5F]/20"
          >
            <option value="">Select {fieldDef.label}</option>
            {fieldDef.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : fieldDef.type === 'checkbox' ? (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(fieldId, e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
            />
            <span className="text-sm text-neutral-600">{fieldDef.description || ''}</span>
          </div>
        ) : (
          <Input
            type={fieldDef.type || 'text'}
            value={value}
            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
            placeholder={fieldDef.placeholder || `Enter ${fieldDef.label.toLowerCase()}...`}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#1B3A5F] mx-auto mb-4" />
          <p className="text-neutral-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-4" />
          <p className="text-neutral-600">Template not found</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/forms-library')}
            className="mt-4"
          >
            Back to Forms Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/forms-library')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">{instance.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-xs">
                  {instance.template_category?.replace('_', ' ')}
                </Badge>
                {instance.ai_population_status === 'completed' && (
                  <Badge className="bg-blue-50 text-[#1B3A5F] border-0 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
                {hasChanges && (
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Unsaved
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePopulateWithAI}
              disabled={populating}
              className="text-[#1B3A5F] border-blue-200 hover:bg-blue-50"
            >
              {populating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {populating ? 'Analyzing...' : 'AI Populate'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
            
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="bg-[#1B3A5F] hover:bg-[#1B3A5F]/90"
            >
              {downloading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6">
        {previewMode ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#1B3A5F]" />
                  Document Preview
                </CardTitle>
                <CardDescription>
                  Review your document before downloading
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPreviewMode(false)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
                {renderedContent}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {instance.ai_confidence_score > 0 && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-[#1B3A5F] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1B3A5F]">
                        AI has pre-filled this template based on your records
                      </p>
                      <p className="text-xs text-[#1B3A5F] mt-1">
                        Confidence: {Math.round(instance.ai_confidence_score * 100)}% - 
                        Please review and edit as needed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#1B3A5F]" />
                  Template Fields
                </CardTitle>
                <CardDescription>
                  Fill in the required information. Fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {instance.fields_schema && Object.entries(instance.fields_schema).map(([fieldId, fieldDef]) => 
                  renderField(fieldId, fieldDef)
                )}
              </CardContent>
            </Card>
            
            {instance.template?.compliance_requirements?.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="h-5 w-5" />
                    VA Compliance Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {instance.template.compliance_requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
