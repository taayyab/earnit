import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Download, 
  FileJson, 
  Shield, 
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  FileText,
  FolderOpen,
  History,
  Bell
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth-context';

export default function DataExportCard() {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id;
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const buildFallbackSummary = async () => {
    const [claimsRes, docsRes] = await Promise.all([
      api.get('/claims/list').catch(() => ({ data: { claims: [] } })),
      api.get('/documents/list').catch(() => ({ data: { documents: [] } }))
    ]);

    const claimsCount = claimsRes?.data?.claims?.length || 0;
    const documentsCount = docsRes?.data?.documents?.length || 0;

    return {
      account_created: user?.created_at || null,
      data_summary: {
        claims_count: claimsCount,
        documents_count: documentsCount,
        consent_records: 0,
        has_profile: Boolean(user?.email)
      },
      export_includes: [
        'Account profile information',
        'Claim records',
        'Uploaded documents metadata'
      ],
      data_retention_policy: 'Some export fields may be unavailable in this environment.'
    };
  };

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users/me/export/summary', {
        params: currentUserId ? { userId: currentUserId } : undefined
      });
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to load export summary:', err);
      try {
        const fallbackSummary = await buildFallbackSummary();
        setSummary(fallbackSummary);
      } catch (fallbackErr) {
        console.error('Fallback summary also failed:', fallbackErr);
        setError('Unable to load data summary. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await api.get('/users/me/export', {
        params: currentUserId ? { userId: currentUserId } : undefined,
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `earnedit_data_export_${new Date().toISOString().split('T')[0]}.json`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) {
          filename = match[1].replace(/['"]/g, '');
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Your data export has been downloaded successfully.');
    } catch (err) {
      console.error('Failed to download data:', err);
      try {
        const [claimsRes, docsRes] = await Promise.all([
          api.get('/claims/list').catch(() => ({ data: { claims: [] } })),
          api.get('/documents/list').catch(() => ({ data: { documents: [] } }))
        ]);
        const fallbackPayload = {
          exported_at: new Date().toISOString(),
          user: {
            id: currentUserId || null,
            email: user?.email || null,
            first_name: user?.first_name || null,
            last_name: user?.last_name || null,
            role: user?.role || null
          },
          claims: claimsRes?.data?.claims || [],
          documents: docsRes?.data?.documents || []
        };
        const blob = new Blob([JSON.stringify(fallbackPayload, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `earnedit_data_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Data export downloaded (fallback mode).');
      } catch (fallbackErr) {
        console.error('Fallback download failed:', fallbackErr);
        toast.error('Failed to download your data. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-500">Loading data summary...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button variant="outline" onClick={loadSummary}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dataSummary = summary?.data_summary || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Download className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle>Export Your Data</CardTitle>
            <CardDescription>
              Download a copy of all your personal data stored in EarnedIT
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {summary?.account_created && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              Account created: <span className="font-medium text-slate-900">{formatDate(summary.account_created)}</span>
            </span>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3">Your Data Summary</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FolderOpen className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-lg font-semibold">{dataSummary.claims_count || 0}</p>
                <p className="text-xs text-slate-500">Claims</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-lg font-semibold">{dataSummary.documents_count || 0}</p>
                <p className="text-xs text-slate-500">Documents</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <History className="h-4 w-4 text-[#1B3A5F]" />
              <div>
                <p className="text-lg font-semibold">{dataSummary.consent_records || 0}</p>
                <p className="text-xs text-slate-500">Consent Records</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-lg font-semibold">{dataSummary.has_profile ? 'Yes' : 'No'}</p>
                <p className="text-xs text-slate-500">Profile Complete</p>
              </div>
            </div>
          </div>
        </div>

        {summary?.export_includes && summary.export_includes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3">What's Included in Your Export</h4>
            <ul className="space-y-2">
              {summary.export_includes.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary?.data_retention_policy && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-800">{summary.data_retention_policy}</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button 
            onClick={handleDownload} 
            disabled={downloading}
            className="w-full"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Download...
              </>
            ) : (
              <>
                <FileJson className="h-4 w-4 mr-2" />
                Download My Data
              </>
            )}
          </Button>
          <p className="text-xs text-slate-500 text-center mt-2">
            Your data will be downloaded as a JSON file
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
