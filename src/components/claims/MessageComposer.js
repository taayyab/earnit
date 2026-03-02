import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import {
  Send,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATE_CATEGORIES = {
  evidence: { label: 'Evidence Requests', color: 'bg-blue-100 text-blue-800' },
  status: { label: 'Status Updates', color: 'bg-green-100 text-green-800' },
  appointment: { label: 'Appointments', color: 'bg-blue-50 text-[#1B3A5F]' },
  onboarding: { label: 'Onboarding', color: 'bg-yellow-100 text-yellow-800' },
  follow_up: { label: 'Follow-ups', color: 'bg-orange-100 text-orange-800' },
};

export function MessageComposer({ claimId, veteranId, veteranName, onMessageSent }) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [requiresResponse, setRequiresResponse] = useState(false);
  const [priority, setPriority] = useState('normal');
  const [sending, setSending] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (open && templates.length === 0) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await api.get('/communications/templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setSubject(template.subject.replace('{veteran_name}', veteranName || 'Veteran'));
      let processedBody = template.body;
      processedBody = processedBody.replace(/{veteran_name}/g, veteranName || 'Veteran');
      processedBody = processedBody.replace(/{agent_signature}/g, 'Your Claims Team');
      setBody(processedBody);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Please provide a subject and message body');
      return;
    }

    try {
      setSending(true);
      await api.post('/communications/send', {
        claim_id: claimId,
        veteran_id: veteranId,
        subject,
        body,
        template_id: selectedTemplate?.id,
        priority,
        requires_response: requiresResponse,
      });
      
      toast.success('Message sent successfully');
      setOpen(false);
      resetForm();
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setSubject('');
    setBody('');
    setRequiresResponse(false);
    setPriority('normal');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Send className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Send Message to Veteran</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-1">
            <div>
              <Label className="text-sm font-medium">Use Template (Optional)</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingTemplates ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{template.name}</span>
                          <Badge className={`text-xs ${TEMPLATE_CATEGORIES[template.category]?.color || 'bg-gray-100'}`}>
                            {TEMPLATE_CATEGORIES[template.category]?.label || template.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="body" className="text-sm font-medium">Message *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter your message..."
                className="mt-1 min-h-[200px]"
              />
              {selectedTemplate?.variables && (
                <p className="text-xs text-muted-foreground mt-1">
                  Variables: {selectedTemplate.variables.join(', ')}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Priority:</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requires-response"
                  checked={requiresResponse}
                  onCheckedChange={setRequiresResponse}
                />
                <Label htmlFor="requires-response" className="text-sm cursor-pointer">
                  Requires response (will create follow-up reminder)
                </Label>
              </div>
            </div>

            {requiresResponse && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Automatic reminders enabled</p>
                  <p className="text-xs mt-1">
                    If no response is received: 7 days - reminder, 14 days - urgent reminder, 21 days - escalation
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !subject.trim() || !body.trim()}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TemplateLibrary({ onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/communications/templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {Object.entries(TEMPLATE_CATEGORIES).map(([key, { label, color }]) => (
          <Badge
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            className={`cursor-pointer ${selectedCategory === key ? '' : color}`}
            onClick={() => setSelectedCategory(key)}
          >
            {label}
          </Badge>
        ))}
      </div>

      <div className="grid gap-3">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectTemplate && onSelectTemplate(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{template.name}</span>
                    <Badge className={`text-xs ${TEMPLATE_CATEGORIES[template.category]?.color || 'bg-gray-100'}`}>
                      {TEMPLATE_CATEGORIES[template.category]?.label || template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MessageComposer;
