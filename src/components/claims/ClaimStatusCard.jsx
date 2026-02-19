import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const PHASE_CONFIG = {
  1: { name: 'Claim Received', color: 'bg-blue-100 text-blue-700', progress: 10 },
  2: { name: 'Initial Review', color: 'bg-blue-100 text-blue-700', progress: 25 },
  3: { name: 'Evidence Gathering', color: 'bg-amber-100 text-amber-700', progress: 45 },
  4: { name: 'Evidence Review', color: 'bg-amber-100 text-amber-700', progress: 65 },
  5: { name: 'Rating', color: 'bg-purple-100 text-purple-700', progress: 80 },
  6: { name: 'Preparing Decision', color: 'bg-green-100 text-green-700', progress: 90 },
  7: { name: 'Complete', color: 'bg-green-100 text-green-700', progress: 100 }
};

const STATUS_CONFIG = {
  'Claim Received': { icon: Clock, color: 'bg-blue-100 text-blue-700' },
  'Initial Review': { icon: Clock, color: 'bg-blue-100 text-blue-700' },
  'Evidence Gathering': { icon: FileText, color: 'bg-amber-100 text-amber-700' },
  'Evidence Review': { icon: Clock, color: 'bg-amber-100 text-amber-700' },
  'Rating': { icon: Clock, color: 'bg-purple-100 text-purple-700' },
  'Preparing Decision Letter': { icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  'Complete': { icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  'default': { icon: Clock, color: 'bg-slate-100 text-slate-700' }
};

function ClaimStatusBadge({ status, phase }) {
  const phaseInfo = PHASE_CONFIG[phase] || {};
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG['default'];
  const StatusIcon = statusInfo.icon;
  const badgeColor = phaseInfo.color || statusInfo.color;

  return (
    <Badge className={`${badgeColor} flex items-center gap-1`}>
      <StatusIcon className="h-3 w-3" />
      {status || phaseInfo.name || 'Unknown'}
    </Badge>
  );
}

function TrackedItemsList({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-3 border-t pt-3">
      <p className="text-sm font-medium text-slate-700 mb-2">Tracked Items</p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div 
            key={item.id || idx} 
            className="flex items-start gap-2 text-sm bg-slate-50 p-2 rounded"
          >
            {item.status === 'ACCEPTED' ? (
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            ) : item.status === 'NEEDED' ? (
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            ) : (
              <Clock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-slate-700">{item.description}</p>
              {item.requested_date && (
                <p className="text-xs text-slate-500">
                  Requested: {new Date(item.requested_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClaimStatusCard({ claim, onSync, compact = false }) {
  const [syncing, setSyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const phaseInfo = PHASE_CONFIG[claim?.phase] || {};
  const progress = claim?.progress_percent || phaseInfo.progress || 0;

  const handleSync = async () => {
    if (!claim?.id || syncing) return;
    
    setSyncing(true);
    try {
      const response = await api.post('/claims-status/sync', null, {
        params: { claim_id: claim.id }
      });
      if (response.data?.success) {
        toast.success('Claim status synced with VA');
        if (onSync) onSync(response.data);
      }
    } catch (err) {
      toast.error('Unable to sync with VA at this time');
    } finally {
      setSyncing(false);
    }
  };

  if (!claim) return null;

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <ClaimStatusBadge status={claim.status} phase={claim.phase} />
          <span className="text-sm text-slate-600">
            {claim.claim_type || 'Compensation'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {progress}%
          </span>
          <Progress value={progress} className="w-20 h-2" />
        </div>
      </div>
    );
  }

  return (
    <Card className="border border-slate-200 hover:border-slate-300 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              {claim.claim_type || 'Compensation Claim'}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Claim ID: {claim.id}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="text-blue-600 hover:text-blue-700"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1 text-xs">Sync</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <ClaimStatusBadge status={claim.status} phase={claim.phase} />
          {claim.documents_needed && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Documents Needed
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium text-slate-700">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Received</span>
            <span>Complete</span>
          </div>
        </div>

        {claim.contention_list && claim.contention_list.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Conditions</p>
            <div className="flex flex-wrap gap-1">
              {claim.contention_list.slice(0, 3).map((condition, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {condition}
                </Badge>
              ))}
              {claim.contention_list.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{claim.contention_list.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
          <div>
            {claim.claim_date && (
              <span>Filed: {new Date(claim.claim_date).toLocaleDateString()}</span>
            )}
          </div>
          {claim.phase_change_date && (
            <span>Updated: {new Date(claim.phase_change_date).toLocaleDateString()}</span>
          )}
        </div>

        {claim.tracked_items && claim.tracked_items.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-slate-600 hover:text-slate-800"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Details ({claim.tracked_items.length} items)
                </>
              )}
            </Button>
            {expanded && <TrackedItemsList items={claim.tracked_items} />}
          </div>
        )}

        <div className="pt-2 border-t">
          <a
            href="https://www.va.gov/track-claims/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View on VA.gov
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export function ClaimsStatusList({ onClaimSelect }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const loadClaims = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/claims-status');
      if (response.data?.success) {
        setClaims(response.data.claims || []);
        setLastUpdated(response.data.last_updated);
        setDemoMode(response.data.demo_mode || false);
      }
    } catch (err) {
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const syncAllClaims = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/claims-status/sync');
      if (response.data?.success) {
        setClaims(response.data.claims || []);
        setLastUpdated(response.data.synced_at);
        toast.success('All claims synced with VA');
      }
    } catch (err) {
      toast.error('Unable to sync with VA at this time');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-500">Loading claims...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">VA Claims Status</h2>
          {lastUpdated && (
            <p className="text-xs text-slate-500">
              Last synced: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {demoMode && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Demo Mode
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={syncAllClaims}
            disabled={syncing}
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Sync with VA
          </Button>
        </div>
      </div>

      {claims.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No Claims Found</p>
            <p className="text-sm text-slate-500 mt-1">
              You don't have any claims on file with the VA yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {claims.map((claim) => (
            <ClaimStatusCard 
              key={claim.id} 
              claim={claim}
              onSync={() => loadClaims()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ClaimStatusCard;
