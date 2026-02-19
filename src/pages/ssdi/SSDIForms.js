import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  FileText, CheckCircle, AlertCircle, Download, 
  ExternalLink, ArrowRight, RefreshCw
} from 'lucide-react';
import api from '../../lib/api';

const FORM_CONFIG = {
  ssa_16: {
    name: 'SSA-16',
    title: 'Application for Disability Insurance Benefits',
    description: 'Main SSDI application form'
  },
  ssa_3368: {
    name: 'SSA-3368',
    title: 'Adult Disability Report',
    description: 'Detailed disability and medical information'
  },
  ssa_3373: {
    name: 'SSA-3373',
    title: 'Function Report',
    description: 'How your conditions affect daily activities'
  },
  ssa_827: {
    name: 'SSA-827',
    title: 'Medical Release Authorization',
    description: 'Authorize SSA to obtain medical records'
  },
  ssa_1696: {
    name: 'SSA-1696',
    title: 'Representative Appointment',
    description: 'Appoint EarnedIt as your representative'
  }
};

export default function SSDIForms() {
  const navigate = useNavigate();
  const { ssdiId } = useParams();
  
  const [forms, setForms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('ssa_16');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForms();
  }, [ssdiId]);

  const fetchForms = async () => {
    try {
      const response = await api.get(`/api/ssdi/forms/${ssdiId}`);
      if (response.data.success) {
        setForms(response.data.forms);
      }
    } catch (err) {
      if (err.response?.status === 404 || !forms) {
        await generateForms();
      } else {
        setError('Failed to load forms');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateForms = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await api.post(`/api/ssdi/forms/generate/${ssdiId}`);
      if (response.data.success) {
        setForms(response.data.forms);
      } else {
        setError('Failed to generate forms');
      }
    } catch (err) {
      setError('Failed to generate forms');
      console.error(err);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const renderFormSection = (formKey) => {
    const formData = forms?.[formKey];
    const config = FORM_CONFIG[formKey];
    
    if (!formData) {
      return (
        <div className="text-center py-8 text-gray-500">
          Form data not available
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{config.name}: {config.title}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
          <Badge variant={formData.completion_percentage >= 70 ? 'success' : 'warning'}>
            {formData.completion_percentage || 0}% Complete
          </Badge>
        </div>

        {formData.sections && Object.entries(formData.sections).map(([sectionKey, section]) => (
          <Card key={sectionKey}>
            <CardHeader className="py-3">
              <CardTitle className="text-base capitalize">
                {sectionKey.replace(/_/g, ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              {typeof section === 'object' && section !== null ? (
                <div className="space-y-2">
                  {Object.entries(section).map(([fieldKey, fieldData]) => {
                    if (fieldKey === 'confidence' || fieldKey === 'source') return null;
                    
                    const isObject = typeof fieldData === 'object' && fieldData !== null;
                    const value = isObject ? fieldData.value : fieldData;
                    const confidence = isObject ? fieldData.confidence : null;
                    const note = isObject ? fieldData.note : null;
                    
                    return (
                      <div key={fieldKey} className="flex items-start justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {fieldKey.replace(/_/g, ' ')}
                          </span>
                          {note && (
                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3" />
                              {note}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                            {value !== null && value !== undefined && value !== '' 
                              ? (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value))
                              : 'Not provided'}
                          </span>
                          {confidence !== null && (
                            <div className="flex items-center justify-end gap-1 mt-1">
                              {confidence >= 0.8 ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : confidence >= 0.5 ? (
                                <AlertCircle className="h-3 w-3 text-amber-500" />
                              ) : (
                                <AlertCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span className="text-xs text-gray-500">
                                {Math.round(confidence * 100)}% confident
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-gray-600">{String(section)}</span>
              )}
            </CardContent>
          </Card>
        ))}

        {formData.manual_fields_required && formData.manual_fields_required.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Fields Requiring Your Input</h4>
                  <ul className="text-sm text-amber-700 mt-2 list-disc list-inside">
                    {formData.manual_fields_required.map((field, i) => (
                      <li key={i} className="capitalize">{field.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (loading || generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">
          {generating ? 'Generating your SSA forms using AI...' : 'Loading forms...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Pre-Filled SSA Forms</h1>
            </div>
            <p className="text-gray-600">
              Review the forms we've pre-populated from your VA claim data
            </p>
          </div>
          <Button variant="outline" onClick={generateForms} disabled={generating} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>

      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <span className="font-medium text-blue-900">AI-Powered Form Filling</span>
              <p className="text-blue-700 text-sm">
                We've automatically populated these forms using your VA claim data. 
                Review each section and note any fields marked as needing your input.
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          {Object.entries(FORM_CONFIG).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              {config.name}
              {forms?.[key]?.completion_percentage >= 70 && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.keys(FORM_CONFIG).map((key) => (
          <TabsContent key={key} value={key} className="mt-6">
            {renderFormSection(key)}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Next Steps</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">1</div>
              <span>Review all pre-filled information for accuracy</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">2</div>
              <span>Note fields requiring your input (highlighted in amber)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">3</div>
              <span>Choose submission method: online guided or print packet</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => navigate(`/ssdi/${ssdiId}/consent`)}
        >
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF Packet
          </Button>
          <Button className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Start Online Submission
          </Button>
        </div>
      </div>
    </div>
  );
}
