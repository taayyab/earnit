import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import {
  Grid3X3,
  AlertCircle,
  Tag,
  FileSearch,
  RefreshCw,
} from 'lucide-react';
import EvidenceMatrix from './EvidenceMatrix';
import DeficiencyTracker from './DeficiencyTracker';
import DocumentTagger from './DocumentTagger';
import { toast } from 'sonner';

function EvidenceOperationsPanel({ claimId, claim, isSheet = false }) {
  const [activeTab, setActiveTab] = useState('matrix');
  const [documents, setDocuments] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const fetchClaimData = async () => {
    if (!claimId) return;
    
    try {
      setLoading(true);
      const [matrixRes, defRes] = await Promise.all([
        api.get(`/api/evidence/matrix/${claimId}`).catch(() => null),
        api.get(`/api/evidence/deficiencies/${claimId}`).catch(() => null),
      ]);
      
      if (matrixRes?.data?.matrix) {
        setConditions(matrixRes.data.matrix.conditions || []);
        const allDocs = [];
        Object.values(matrixRes.data.matrix.documents || {}).forEach(docs => {
          allDocs.push(...docs);
        });
        setDocuments(allDocs);
        setSummary({
          coverage: matrixRes.data.matrix.summary?.overall_coverage || 0,
          deficiencies: defRes?.data?.summary?.total || 0,
          critical: defRes?.data?.summary?.critical || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch claim data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimData();
  }, [claimId]);

  const handleRequestEvidence = (details) => {
    toast.info(`Evidence request for ${details.document_type} - ${details.condition_name}`);
  };

  const handleDocumentTagged = () => {
    fetchClaimData();
  };

  const content = (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{summary.coverage}%</div>
              <div className="text-xs text-muted-foreground">Evidence Coverage</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.deficiencies}</div>
              <div className="text-xs text-muted-foreground">Deficiencies</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
              <div className="text-xs text-muted-foreground">Critical Issues</div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix" className="flex items-center gap-1">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="deficiencies" className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Deficiencies</span>
            {summary?.critical > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {summary.critical}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tagging" className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Tagging</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="matrix" className="mt-4">
          <EvidenceMatrix claimId={claimId} onRefresh={fetchClaimData} />
        </TabsContent>
        
        <TabsContent value="deficiencies" className="mt-4">
          <DeficiencyTracker 
            claimId={claimId} 
            onRequestEvidence={handleRequestEvidence} 
          />
        </TabsContent>
        
        <TabsContent value="tagging" className="mt-4">
          <DocumentTagger 
            claimId={claimId}
            documents={documents}
            conditions={conditions.map(c => ({ id: c.id, name: c.name }))}
            onTagged={handleDocumentTagged}
          />
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isSheet) {
    return content;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Evidence Operations
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchClaimData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}

export function EvidenceOperationsButton({ claimId, claim }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSearch className="h-4 w-4 mr-1" />
          Evidence Ops
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Evidence Operations
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <EvidenceOperationsPanel claimId={claimId} claim={claim} isSheet={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default EvidenceOperationsPanel;
