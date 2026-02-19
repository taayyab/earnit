import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  DBQAutofillButton, 
  AutofillConfidenceSummary 
} from '../components/dbq';
import { 
  AutofilledFieldIndicator, 
  AutofilledFieldGroup, 
  AutofillLegend 
} from '../components/dbq/AutofilledFieldIndicator';
import { 
  Stethoscope, 
  FileText, 
  ArrowLeft, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Download,
  Save,
  Upload,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { dbqAPI, documentsAPI } from '../lib/api';
import { toast } from 'sonner';

export default function DBQFormViewer() {
  const { dbqType } = useParams();
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get('claimId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [autofillData, setAutofillData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dbqType) {
      loadTemplate();
      loadDocuments();
    }
  }, [dbqType, claimId]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const response = await dbqAPI.getBlank(dbqType);
      if (response.data.success) {
        setTemplate(response.data.dbq);
        initializeFormData(response.data.dbq);
      }
    } catch (err) {
      console.error('Failed to load DBQ template:', err);
      toast.error('Failed to load DBQ template');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await documentsAPI.list(claimId);
      if (response.data.documents) {
        setDocuments(response.data.documents);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const initializeFormData = (dbqTemplate) => {
    const data = {};
    if (dbqTemplate?.sections) {
      dbqTemplate.sections.forEach(section => {
        section.fields?.forEach(field => {
          data[field.id] = {
            value: field.default_value || '',
            confidence: null,
            source: null,
            isAutofilled: false
          };
        });
      });
    }
    setFormData(data);
  };

  const handleAutofillComplete = (result) => {
    setAutofillData(result);
    
    if (result.dbq?.sections) {
      const newFormData = { ...formData };
      result.dbq.sections.forEach(section => {
        section.fields?.forEach(field => {
          if (field.value !== undefined && field.value !== null && field.value !== '') {
            newFormData[field.id] = {
              value: field.value,
              confidence: field.confidence || 0.5,
              source: field.source || null,
              isAutofilled: true
            };
          }
        });
      });
      setFormData(newFormData);
    }
  };

  const handleFieldChange = (fieldId, newValue) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        value: newValue,
        isAutofilled: false
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const validation = await dbqAPI.validate({ 
        dbq_type: dbqType, 
        form_data: formData 
      });
      
      if (validation.data.validation?.is_valid) {
        toast.success('DBQ data saved successfully');
      } else {
        toast.info('DBQ saved with some missing required fields');
      }
    } catch (err) {
      console.error('Failed to save DBQ:', err);
      toast.error('Failed to save DBQ data');
    } finally {
      setIsSaving(false);
    }
  };

  const getFilledFieldsCount = () => {
    return Object.values(formData).filter(f => f.value && f.value.trim()).length;
  };

  const getAutofilledFieldsCount = () => {
    return Object.values(formData).filter(f => f.isAutofilled).length;
  };

  const getTotalFieldsCount = () => {
    return Object.keys(formData).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/forms-library')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forms Library
        </Button>

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {template?.form_name || 'DBQ Form'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{template?.va_form_number || dbqType}</Badge>
                {template?.version && (
                  <span className="text-sm text-slate-500">Version: {template.version}</span>
                )}
              </div>
            </div>
          </div>

          {template?.pdf_url && (
            <Button 
              variant="outline" 
              onClick={() => window.open(template.pdf_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Official Form
            </Button>
          )}
        </div>

        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">AI-Powered Auto-Fill</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Automatically extract information from your uploaded medical documents to pre-fill this DBQ form.
                  Review and edit any auto-filled values before saving.
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <DBQAutofillButton
                    dbqType={dbqType}
                    documents={documents}
                    existingData={formData}
                    onAutofillComplete={handleAutofillComplete}
                    showStats={false}
                    variant="default"
                    className="inline-block"
                  />
                  
                  {loadingDocs && (
                    <span className="text-sm text-slate-500 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading documents...
                    </span>
                  )}
                  
                  {!loadingDocs && documents.length === 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(claimId ? `/claim/${claimId}/documents` : '/documents')}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Documents
                    </Button>
                  )}
                  
                  {!loadingDocs && documents.length > 0 && (
                    <span className="text-sm text-slate-600">
                      <FileText className="w-4 h-4 inline mr-1" />
                      {documents.length} document(s) available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {autofillData && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Auto-fill completed</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-700">
                    <strong>{getAutofilledFieldsCount()}</strong> fields auto-filled
                  </span>
                  <span className="text-slate-600">
                    <strong>{getFilledFieldsCount()}</strong> / {getTotalFieldsCount()} total filled
                  </span>
                </div>
              </div>
              
              {autofillData.validation?.low_confidence_fields?.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-amber-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {autofillData.validation.low_confidence_fields.length} field(s) need review - marked in yellow below
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <AutofillLegend className="mb-6" />

        {template?.sections?.map((section, sectionIdx) => (
          <Card key={sectionIdx} className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{section.name}</CardTitle>
              {section.description && (
                <p className="text-sm text-slate-600">{section.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields?.map((field, fieldIdx) => {
                const fieldData = formData[field.id] || {};
                
                if (fieldData.isAutofilled) {
                  return (
                    <AutofilledFieldIndicator
                      key={field.id}
                      fieldName={field.label || field.name}
                      value={fieldData.value}
                      confidence={fieldData.confidence || 0.5}
                      source={fieldData.source}
                      isEditable={true}
                      multiline={field.type === 'textarea'}
                      onChange={(newValue) => handleFieldChange(field.id, newValue)}
                    />
                  );
                }
                
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      {field.label || field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        value={fieldData.value || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="min-h-[100px]"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={fieldData.value || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt, optIdx) => (
                          <option key={optIdx} value={opt.value || opt}>
                            {opt.label || opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type={field.type || 'text'}
                        value={fieldData.value || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                    {field.help_text && (
                      <p className="text-xs text-slate-500">{field.help_text}</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <div className="text-sm text-slate-600">
            {getFilledFieldsCount()} of {getTotalFieldsCount()} fields completed
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/forms-library')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save DBQ Data
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
