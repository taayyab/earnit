import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { claimsAPI } from '../lib/api';
import VeteranLayout from '../components/VeteranLayout';
import { CreateClaimModal } from '../components/claims/CreateClaimModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  FileText, 
  Plus, 
  FolderOpen, 
  Eye, 
  Gavel,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  draft: { label: 'Draft', variant: 'secondary', icon: FileText },
  documents_uploaded: { label: 'Documents Uploaded', variant: 'default', icon: FolderOpen },
  in_review: { label: 'In Review', variant: 'default', icon: Clock },
  analysis_complete: { label: 'Analysis Complete', variant: 'default', icon: CheckCircle2 },
  conditions_selected: { label: 'Conditions Selected', variant: 'default', icon: CheckCircle2 },
  qa_pending: { label: 'QA Pending', variant: 'warning', icon: Clock },
  qa_complete: { label: 'QA Complete', variant: 'default', icon: CheckCircle2 },
  ready_to_submit: { label: 'Ready to Submit', variant: 'success', icon: CheckCircle2 },
  submitted: { label: 'Submitted', variant: 'success', icon: CheckCircle2 },
  approved: { label: 'Approved', variant: 'success', icon: CheckCircle2 },
  denied: { label: 'Denied', variant: 'destructive', icon: AlertCircle },
};

const CLAIM_TYPE_LABELS = {
  original: 'Original Claim',
  supplemental: 'Supplemental Claim',
  higher_level_review: 'Higher-Level Review',
  board_appeal: 'Board Appeal',
};

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function ClaimCard({ claim }) {
  const navigate = useNavigate();
  const statusConfig = STATUS_CONFIG[claim.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;
  const claimType = CLAIM_TYPE_LABELS[claim.claim_type] || claim.claim_type || 'Disability Claim';
  const isDenied = claim.status === 'denied';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{claimType}</CardTitle>
            <CardDescription className="mt-1">
              Created: {formatDate(claim.created_at)}
            </CardDescription>
          </div>
          <Badge 
            variant={statusConfig.variant}
            className="flex items-center gap-1"
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {claim.conditions && claim.conditions.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Conditions:</p>
              <div className="flex flex-wrap gap-1">
                {claim.conditions.slice(0, 3).map((condition, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {typeof condition === 'string' ? condition : condition.name}
                  </Badge>
                ))}
                {claim.conditions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{claim.conditions.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => navigate(`/claim/${claim.id}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate(`/claim/${claim.id}/documents`)}
            >
              <FolderOpen className="h-4 w-4 mr-1" />
              Manage Evidence
            </Button>
            {isDenied && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/appeals')}
              >
                <Gavel className="h-4 w-4 mr-1" />
                View Appeal Status
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VeteranClaimsDashboard() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await claimsAPI.list();
      setClaims(response.data.claims || []);
    } catch (error) {
      console.error('Failed to load claims:', error);
      toast.error('Failed to load your claims');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCreated = (newClaim) => {
    loadClaims();
    if (newClaim?.id) {
      navigate(`/claim/${newClaim.id}`);
    }
  };

  return (
    <VeteranLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">My Claims</h1>
            <p className="text-muted-foreground mt-1">
              Manage your VA disability claims and track their progress
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <CreateClaimModal onClaimCreated={handleClaimCreated} />
            <Button 
              variant="outline" 
              onClick={() => navigate('/appeals')}
            >
              <Gavel className="h-4 w-4 mr-2" />
              Start Appeal
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#1B3A5F]" />
            <span className="ml-2 text-muted-foreground">Loading claims...</span>
          </div>
        ) : claims.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Claims Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first VA disability claim to get the benefits you've earned.
              </p>
              <CreateClaimModal onClaimCreated={handleClaimCreated} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {claims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        )}

        {claims.length > 0 && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#1B3A5F]" />
              Need Help?
            </h3>
            <p className="text-sm text-muted-foreground">
              If you have questions about your claims or need assistance, visit our{' '}
              <Link to="/faq" className="text-[#1B3A5F] hover:underline">FAQ</Link>{' '}
              or contact your assigned advocate through{' '}
              <Link to="/messages" className="text-[#1B3A5F] hover:underline">Messages</Link>.
            </p>
          </div>
        )}
      </div>
    </VeteranLayout>
  );
}
