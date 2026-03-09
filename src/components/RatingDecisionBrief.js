import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import {
  Scale,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  FileCheck,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function RatingDecisionBrief({ claimId, claimNumber, onCompletenessChange, refreshKey = 0 }) {
  const [rdb, setRdb] = useState(null);
  const [attestations, setAttestations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (claimId) {
      setLoadError(null);
      loadAll();
    }
  }, [claimId, refreshKey]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [rdbRes, attRes] = await Promise.all([
        api.get(`/rdb/${claimId}`).catch(e => e.response?.status === 404 ? null : Promise.reject(e)),
        api.get(`/rdb/${claimId}/attestations`).catch(() => null),
      ]);
      if (rdbRes) setRdb(rdbRes.data);
      if (attRes?.data?.success) {
        setAttestations(attRes.data);
        if (onCompletenessChange && attRes.data.rdb_completeness) {
          onCompletenessChange(attRes.data.rdb_completeness);
        }
      }
    } catch (err) {
      console.error('Failed to load RDB:', err);
      setLoadError('Failed to load Rating Decision Brief');
    } finally {
      setLoading(false);
    }
  };

  const generateRDB = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/rdb/generate', { claim_id: claimId });
      if (response.data.success) {
        toast.success('Rating Decision Brief generated successfully!');
        await loadAll();
      }
    } catch (err) {
      toast.error('Failed to generate Rating Decision Brief');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/rdb/${claimId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RDB_${claimNumber || claimId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!');
    } catch {
      toast.error('PDF not available yet');
    } finally {
      setDownloading(false);
    }
  };

  const score = attestations?.rdb_completeness?.overall_score || 0;
  const isReady = attestations?.rdb_completeness?.ready_for_submission;
  const conditions = rdb?.conditions || [];

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-56 mt-1" />
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <Card className="border-red-200 shadow-sm">
        <CardContent className="py-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{loadError}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setLoadError(null); loadAll(); }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Not yet generated ───────────────────────────────────────────────────
  if (!rdb) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-[hsl(var(--primary))]" />
            Rating Decision Brief
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Evidence attestation connecting your documents to VA rating criteria</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Scale className="h-6 w-6 text-slate-400" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">No Brief Generated Yet</h4>
            <p className="text-sm text-slate-500 mb-4 max-w-xs mx-auto">
              Generate a brief to analyze your evidence and identify gaps before submission.
            </p>
            <Button
              onClick={generateRDB}
              disabled={generating}
              className="bg-[hsl(var(--primary))] text-white"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing Evidence...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Generate Brief</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Generated state ─────────────────────────────────────────────────────
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3A5F] to-[#2a4f7c] px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-white/80" />
            <h3 className="font-semibold text-white text-base">Rating Decision Brief</h3>
          </div>
          <Badge className={isReady
            ? "bg-green-400/20 text-green-200 border-green-400/30 border"
            : "bg-amber-400/20 text-amber-200 border-amber-400/30 border"
          }>
            {isReady ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" />Ready</>
            ) : (
              <><AlertTriangle className="h-3 w-3 mr-1" />Needs Work</>
            )}
          </Badge>
        </div>
        <p className="text-xs text-white/50 mt-0.5">
          {rdb.generated_at ? `Generated ${new Date(rdb.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Evidence attestation ready'}
        </p>
      </div>

      <CardContent className="pt-4 space-y-4">
        {/* Completeness bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Overall Completeness</span>
            <span className={`text-lg font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {Math.round(score)}%
            </span>
          </div>
          <Progress value={score} className="h-2" />
          <div className="flex justify-between mt-1.5 text-xs text-slate-400">
            <span>{attestations?.rdb_completeness?.conditions_complete || 0} of {attestations?.rdb_completeness?.conditions_analyzed || 0} conditions complete</span>
            <span>{attestations?.rdb_completeness?.critical_issues_count || 0} critical issues</span>
          </div>
        </div>

        {/* Conditions */}
        {conditions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Conditions</p>
            {conditions.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  c.status === 'strong' ? 'bg-green-100' : 'bg-amber-100'
                }`}>
                  <FileCheck className={`h-4 w-4 ${c.status === 'strong' ? 'text-green-600' : 'text-amber-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">
                    {c.rating ? `${c.rating}% rating` : 'Rating pending'} · {c.nexus ? 'Nexus established' : 'Nexus needed'}
                  </p>
                </div>
                {c.nexus
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex-1 bg-[hsl(var(--primary))] text-white"
          >
            {downloading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Downloading...</>
              : <><Download className="h-4 w-4 mr-2" />Download PDF</>}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={generateRDB}
            disabled={generating}
            title="Regenerate"
            className="shrink-0"
          >
            {generating
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
