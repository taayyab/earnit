import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../ui/dialog';
import {
  FileText,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  Package,
  FileCheck,
  Upload,
  FolderOpen,
  Send,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pending: { icon: Circle, color: 'text-gray-400', label: 'Pending' },
  in_progress: { icon: Loader2, color: 'text-blue-500', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Completed' },
  uploaded: { icon: CheckCircle2, color: 'text-green-500', label: 'Uploaded' },
  not_applicable: { icon: Circle, color: 'text-gray-300', label: 'N/A' },
  missing: { icon: AlertCircle, color: 'text-red-500', label: 'Missing' },
};

const CATEGORY_LABELS = {
  primary: 'Primary Forms',
  medical_authorization: 'Medical Authorization',
  supporting: 'Supporting Documents',
  service: 'Service Records',
  medical: 'Medical Records',
  evidence: 'Evidence Documents',
};

export function FormPacketBuilder({ claimId, onPacketReady }) {
  const [packet, setPacket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimTypes, setClaimTypes] = useState([]);
  const [selectedClaimType, setSelectedClaimType] = useState('original_claim');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (claimId) {
      loadPacket();
      loadClaimTypes();
    } else {
      setLoading(false);
    }
  }, [claimId]);

  const loadPacket = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/form-packets/${claimId}`);
      if (response.data.exists) {
        setPacket(response.data.packet);
      } else {
        setPacket(null);
      }
    } catch (err) {
      console.error('Failed to load form packet:', err);
      setError('Unable to load form packet data');
    } finally {
      setLoading(false);
    }
  };

  const loadClaimTypes = async () => {
    try {
      const response = await api.get('/form-packets/claim-types');
      setClaimTypes(response.data.claim_types || []);
    } catch (error) {
      console.error('Failed to load claim types:', error);
    }
  };

  const createPacket = async () => {
    try {
      setCreating(true);
      await api.post('/form-packets/create', {
        claim_id: claimId,
        claim_type: selectedClaimType,
      });
      toast.success('Form packet created');
      setShowCreateDialog(false);
      loadPacket();
    } catch (error) {
      console.error('Failed to create packet:', error);
      toast.error('Failed to create form packet');
    } finally {
      setCreating(false);
    }
  };

  const updateFormStatus = async (formId, status, notes) => {
    try {
      setUpdating(true);
      await api.put(`/form-packets/${claimId}/form`, {
        form_id: formId,
        status,
        notes,
      });
      loadPacket();
    } catch (error) {
      console.error('Failed to update form status:', error);
      toast.error('Failed to update form');
    } finally {
      setUpdating(false);
    }
  };

  const updateDocumentStatus = async (documentId, status, notes) => {
    try {
      setUpdating(true);
      await api.put(`/form-packets/${claimId}/document`, {
        document_id: documentId,
        status,
        notes,
      });
      loadPacket();
    } catch (error) {
      console.error('Failed to update document status:', error);
      toast.error('Failed to update document');
    } finally {
      setUpdating(false);
    }
  };

  const finalizePacket = async () => {
    try {
      setUpdating(true);
      const response = await api.post(`/form-packets/${claimId}/finalize`);
      if (response.data.ready) {
        toast.success('Packet finalized and ready for submission!');
        loadPacket();
        if (onPacketReady) {
          onPacketReady();
        }
      } else {
        toast.error(`Cannot finalize: Missing ${response.data.missing_forms?.length || 0} forms and ${response.data.missing_documents?.length || 0} documents`);
      }
    } catch (error) {
      console.error('Failed to finalize packet:', error);
      toast.error('Failed to finalize packet');
    } finally {
      setUpdating(false);
    }
  };

  const renderStatusIcon = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 ${config.color} ${status === 'in_progress' ? 'animate-spin' : ''}`} />;
  };

  const groupByCategory = (items) => {
    const groups = {};
    items.forEach((item) => {
      const category = item.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  };

  if (!claimId) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex items-center gap-3 py-8">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-medium text-red-700">{error}</p>
            <p className="text-sm text-red-600">Please try again or contact support.</p>
          </div>
          <Button variant="outline" onClick={loadPacket} className="ml-auto">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!packet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            VA Form Packet Builder
          </CardTitle>
          <CardDescription>
            Create a checklist of required forms and documents for this claim
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <ClipboardList className="h-4 w-4 mr-2" />
                Start Form Packet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Form Packet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Claim Type</Label>
                  <Select value={selectedClaimType} onValueChange={setSelectedClaimType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {claimTypes.map((ct) => (
                        <SelectItem key={ct.id} value={ct.id}>
                          <div className="flex flex-col">
                            <span>{ct.name}</span>
                            <span className="text-xs text-muted-foreground">{ct.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createPacket} disabled={creating}>
                  {creating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  Create Packet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  const formGroups = groupByCategory(packet.form_checklist || []);
  const docGroups = groupByCategory(packet.document_checklist || []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Form Packet
            </CardTitle>
            <CardDescription className="mt-1">
              {packet.claim_type === 'original_claim' ? 'Original Claim' :
               packet.claim_type === 'supplemental_claim' ? 'Supplemental Claim' : 'Board Appeal'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadPacket}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {packet.is_ready_for_submission ? (
              <Badge className="bg-green-100 text-green-800">Ready</Badge>
            ) : (
              <Badge variant="outline">{packet.completion_percentage}% Complete</Badge>
            )}
          </div>
        </div>
        <Progress value={packet.completion_percentage} className="h-2 mt-3" />
        {(packet.required_forms_pending > 0 || packet.required_docs_pending > 0) && (
          <div className="flex gap-3 mt-2 text-sm">
            {packet.required_forms_pending > 0 && (
              <span className="text-yellow-600">{packet.required_forms_pending} required forms pending</span>
            )}
            {packet.required_docs_pending > 0 && (
              <span className="text-yellow-600">{packet.required_docs_pending} required docs pending</span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Accordion type="multiple" defaultValue={['forms', 'documents']}>
          <AccordionItem value="forms">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                VA Forms ({packet.form_checklist?.filter(f => f.status === 'completed').length}/{packet.form_checklist?.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {Object.entries(formGroups).map(([category, forms]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {CATEGORY_LABELS[category] || category}
                    </h4>
                    <div className="space-y-2">
                      {forms.map((form) => (
                        <FormChecklistItem
                          key={form.id}
                          item={form}
                          type="form"
                          onStatusChange={(status, notes) => updateFormStatus(form.id, status, notes)}
                          updating={updating}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="documents">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Supporting Documents ({packet.document_checklist?.filter(d => ['completed', 'uploaded'].includes(d.status)).length}/{packet.document_checklist?.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {Object.entries(docGroups).map(([category, docs]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {CATEGORY_LABELS[category] || category}
                    </h4>
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <FormChecklistItem
                          key={doc.id}
                          item={doc}
                          type="document"
                          onStatusChange={(status, notes) => updateDocumentStatus(doc.id, status, notes)}
                          updating={updating}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="pt-4 border-t">
          <Button 
            className="w-full" 
            onClick={finalizePacket}
            disabled={updating || !packet.is_ready_for_submission}
          >
            {updating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {packet.is_ready_for_submission ? 'Finalize Packet' : 'Complete Required Items First'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FormChecklistItem({ item, type, onStatusChange, updating }) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');
  
  const isCompleted = item.status === 'completed' || item.status === 'uploaded';
  
  const handleToggle = () => {
    const newStatus = isCompleted ? 'pending' : (type === 'document' ? 'uploaded' : 'completed');
    onStatusChange(newStatus, notes);
  };

  const handleNotApplicable = () => {
    onStatusChange('not_applicable', notes);
  };

  return (
    <div className={`p-3 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : item.status === 'not_applicable' ? 'bg-gray-50 border-gray-200' : 'bg-white'}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggle}
          disabled={updating}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {item.name}
            </span>
            {item.required && (
              <Badge variant="outline" className="text-xs border-red-300 text-red-700">Required</Badge>
            )}
            {item.status === 'not_applicable' && (
              <Badge variant="outline" className="text-xs">N/A</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
          
          {item.notes && (
            <p className="text-xs text-blue-600 mt-1 italic">{item.notes}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {!item.required && item.status !== 'not_applicable' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={handleNotApplicable}
              disabled={updating}
            >
              N/A
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormPacketBuilder;
