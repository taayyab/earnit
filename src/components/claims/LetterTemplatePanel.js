import React, { useState, useEffect } from 'react';
import { templatesAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  FileText,
  Send,
  Download,
  Eye,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileCheck,
  Clock,
  Copy,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function LetterTemplatePanel({ claimId }) {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [additionalData, setAdditionalData] = useState({});

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const [templatesRes, categoriesRes] = await Promise.all([
        templatesAPI.list(),
        templatesAPI.getCategories()
      ]);
      
      if (templatesRes.data.success) {
        setTemplates(templatesRes.data.templates || []);
      }
      
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      toast.error('Failed to load letter templates');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLetter = async (template) => {
    if (!claimId) {
      toast.error('No claim ID provided');
      return;
    }

    try {
      setGenerating(true);
      setSelectedTemplate(template);
      
      const res = await templatesAPI.generate(template.id, claimId, additionalData);
      
      if (res.data.success) {
        setGeneratedLetter(res.data);
        setPreviewOpen(true);
        
        if (res.data.validation && !res.data.validation.valid) {
          toast.warning(`Letter generated with ${res.data.validation.errors.length} missing required fields`);
        } else {
          toast.success('Letter generated successfully');
        }
      }
    } catch (err) {
      console.error('Failed to generate letter:', err);
      toast.error('Failed to generate letter: ' + (err.response?.data?.detail || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handlePreviewTemplate = async (template) => {
    try {
      setGenerating(true);
      setSelectedTemplate(template);
      
      const res = await templatesAPI.preview(template.id);
      
      if (res.data.success) {
        setGeneratedLetter({
          ...res.data,
          rendered_content: res.data.rendered_preview,
          template_name: res.data.template?.name || template.name,
          is_preview: true
        });
        setPreviewOpen(true);
      }
    } catch (err) {
      console.error('Failed to preview template:', err);
      toast.error('Failed to preview template');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedTemplate || !claimId) return;

    try {
      setGenerating(true);
      const res = await templatesAPI.downloadPdf(selectedTemplate.id, claimId, additionalData);
      
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      toast.error('Failed to download PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedLetter?.rendered_content) {
      navigator.clipboard.writeText(generatedLetter.rendered_content);
      toast.success('Letter copied to clipboard');
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      toast.error('Please enter a recipient email address');
      return;
    }

    if (!selectedTemplate || !claimId) return;

    try {
      setSending(true);
      const res = await templatesAPI.send(
        selectedTemplate.id, 
        claimId, 
        recipientEmail, 
        additionalData,
        emailSubject || undefined
      );
      
      if (res.data.success) {
        toast.success('Letter sent successfully!');
        setSendDialogOpen(false);
        setRecipientEmail('');
        setEmailSubject('');
      } else if (res.data.queued) {
        toast.info('Letter queued for delivery');
        setSendDialogOpen(false);
      } else {
        toast.error('Failed to send letter');
      }
    } catch (err) {
      console.error('Failed to send letter:', err);
      toast.error('Failed to send letter: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSending(false);
    }
  };

  const openSendDialog = () => {
    if (generatedLetter?.is_preview) {
      toast.warning('Generate the letter with your claim data before sending');
      return;
    }
    setSendDialogOpen(true);
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getCategoryLabel = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || categoryId;
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      'intent_to_file': 'bg-blue-100 text-blue-800',
      'buddy_statement_request': 'bg-blue-50 text-[#1B3A5F]',
      'nexus_letter': 'bg-green-100 text-green-800',
      'buddy_statement': 'bg-blue-50 text-[#1B3A5F]',
      'personal_statement': 'bg-orange-100 text-orange-800',
      'cover_letter': 'bg-gray-100 text-gray-800',
      'evidence_checklist': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading templates...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Letter Templates
              </CardTitle>
              <CardDescription>
                Generate professional letters for your VA claim
              </CardDescription>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No templates available in this category</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">{template.name}</h4>
                      <Badge variant="secondary" className={`text-xs ${getCategoryBadgeColor(template.category)}`}>
                        {getCategoryLabel(template.category)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    {template.va_form_number && (
                      <p className="text-xs text-blue-600 mb-3">
                        VA Form: {template.va_form_number}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePreviewTemplate(template)}
                        disabled={generating}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleGenerateLetter(template)}
                        disabled={generating || !claimId}
                      >
                        {generating && selectedTemplate?.id === template.id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <FileCheck className="h-3 w-3 mr-1" />
                        )}
                        Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {generatedLetter?.template_name || 'Letter Preview'}
              {generatedLetter?.is_preview && (
                <Badge variant="outline" className="ml-2">Sample Data</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {generatedLetter?.is_preview 
                ? 'This preview uses sample data. Generate with your claim to populate with real information.'
                : 'Review your generated letter below'}
            </DialogDescription>
          </DialogHeader>
          
          {generatedLetter?.validation && !generatedLetter.validation.valid && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Missing required fields:</p>
                  <ul className="list-disc list-inside text-yellow-700 mt-1">
                    {generatedLetter.validation.missing_required_fields?.map((field, i) => (
                      <li key={i}>{field.label}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto border rounded-md bg-gray-50 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
              {generatedLetter?.rendered_content}
            </pre>
          </div>

          <DialogFooter className="flex-shrink-0 gap-2">
            <Button variant="outline" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            {!generatedLetter?.is_preview && (
              <>
                <Button variant="outline" onClick={handleDownloadPdf} disabled={generating}>
                  {generating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download PDF
                </Button>
                <Button onClick={openSendDialog}>
                  <Send className="h-4 w-4 mr-2" />
                  Send via Email
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Letter via Email
            </DialogTitle>
            <DialogDescription>
              Enter the recipient's email address to send this letter
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Recipient Email *</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="recipient@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject (optional)</Label>
              <Input
                id="email-subject"
                type="text"
                placeholder="Leave blank for default subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={sending || !recipientEmail}>
              {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Letter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
