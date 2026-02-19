import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  Shield,
  Loader2
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

export default function VAStatusSyncCard({ claimId }) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [vaStatus, setVaStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (claimId) {
      loadVAStatus();
    }
  }, [claimId]);

  const loadVAStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/va/claim/${claimId}/status`);
      if (response.data?.status) {
        setVaStatus(response.data.status);
        setLastSync(response.data.last_updated);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const syncWithVA = async () => {
    setSyncing(true);
    try {
      const response = await api.post(`/va/claim/${claimId}/refresh-status`);
      if (response.data?.success) {
        setVaStatus(response.data.status);
        setLastSync(new Date().toISOString());
        toast.success('Status synced with VA');
      }
    } catch (err) {
      toast.error('Unable to sync with VA at this time');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusConfig = {
      'pending': { label: 'Pending', color: 'bg-slate-100 text-slate-700', icon: Clock },
      'uploading': { label: 'Uploading', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
      'submitted': { label: 'Submitted to VA', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      'received': { label: 'Received by VA', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'processing': { label: 'In Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
      'success': { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'error': { label: 'Issue Found', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
      'vbms_error': { label: 'VBMS Error', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
    };
    return statusConfig[status] || statusConfig['pending'];
  };

  if (loading) {
    return (
      <Card className="border-2 border-slate-100">
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  if (!vaStatus) {
    return (
      <Card className="border-2 border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            VA Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-slate-600 mb-3">
              Your claim hasn't been submitted to the VA yet
            </p>
            <Badge variant="outline" className="text-slate-500">
              Pre-submission
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusDisplay = getStatusDisplay(vaStatus);
  const StatusIcon = statusDisplay.icon;

  return (
    <Card className="border-2 border-slate-100">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            VA Status
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={syncWithVA}
            disabled={syncing}
            className="text-blue-600"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1 text-sm">Sync</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <Badge className={statusDisplay.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusDisplay.label}
          </Badge>
        </div>

        {lastSync && (
          <p className="text-xs text-slate-500">
            Last synced: {new Date(lastSync).toLocaleString()}
          </p>
        )}

        <div className="mt-4 pt-3 border-t">
          <a
            href="https://www.va.gov/track-claims/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View on VA.gov
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
