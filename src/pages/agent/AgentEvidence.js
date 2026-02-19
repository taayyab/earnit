import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import api from '../../lib/api';
import AgentLayout from '../../components/AgentLayout';
import EvidenceMatrix from '../../components/claims/EvidenceMatrix';
import DeficiencyTracker from '../../components/claims/DeficiencyTracker';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  FileText,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AgentEvidence() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('matrix');
  const [claims, setClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agent/claims').catch(() => 
        ({ data: { claims: [] } })
      );
      const claimsList = response.data.claims || response.data || [];
      setClaims(claimsList);
      if (claimsList.length > 0 && !selectedClaimId) {
        setSelectedClaimId(claimsList[0].id);
        setSelectedClaim(claimsList[0]);
      }
    } catch (error) {
      console.error('Failed to load claims:', error);
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSelect = (claimId) => {
    setSelectedClaimId(claimId);
    const claim = claims.find(c => c.id === claimId);
    setSelectedClaim(claim);
  };

  const handleRequestEvidence = (details) => {
    toast.info(`Evidence request for: ${details.document_type || 'document'}`);
  };

  return (
    <AgentLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evidence & Documents</h1>
            <p className="text-muted-foreground">Review evidence matrix and track deficiencies for claims</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedClaimId} onValueChange={handleClaimSelect}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a claim..." />
              </SelectTrigger>
              <SelectContent>
                {claims.map((claim) => (
                  <SelectItem key={claim.id} value={claim.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{claim.id?.slice(-8)}</span>
                      <span className="text-muted-foreground">-</span>
                      <span>{claim.veteran?.name || claim.veteran_name || claim.conditions?.[0] || 'Claim'}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadClaims} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {!selectedClaimId ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Claim</h3>
              <p className="text-muted-foreground">
                Choose a claim from the dropdown above to view its evidence matrix and deficiencies.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="matrix" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Evidence Matrix
              </TabsTrigger>
              <TabsTrigger value="deficiencies" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Deficiency Tracker
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matrix" className="mt-6">
              <EvidenceMatrix 
                claimId={selectedClaimId} 
                onRefresh={loadClaims}
              />
            </TabsContent>

            <TabsContent value="deficiencies" className="mt-6">
              <DeficiencyTracker 
                claimId={selectedClaimId}
                onRequestEvidence={handleRequestEvidence}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AgentLayout>
  );
}
