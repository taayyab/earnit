import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const VA_APIS = [
  {
    id: 'veteran-confirmation',
    label: 'Veteran Confirmation',
    method: 'GET',
    path: '/va/veteran-confirmation',
    workflow: 'Verifies veteran status after ID.me authentication',
    category: 'Identity',
  },
  {
    id: 'service-history',
    label: 'Service History & Eligibility',
    method: 'GET',
    path: '/va/service-history',
    workflow: 'Retrieves military service history, branches, dates, and discharge status',
    category: 'Identity',
  },
  {
    id: 'benefits-reference',
    label: 'Benefits Reference Data',
    method: 'GET',
    path: '/va/benefits-reference/disabilities',
    workflow: 'Looks up disability codes and rating criteria for claims filing',
    category: 'Claims',
  },
  {
    id: 'benefits-claims',
    label: 'Benefits Claims',
    method: 'GET',
    path: '/va/benefits-claims',
    workflow: 'Checks status of existing disability compensation claims',
    category: 'Claims',
  },
  {
    id: 'benefits-intake-initiate',
    label: 'Benefits Intake (Upload)',
    method: 'POST',
    path: '/va/benefits-intake',
    body: { fileNumber: '123456789', zipCode: '20420', source: 'EarnedIT', docType: '21-526EZ', businessLine: 'compensation' },
    workflow: 'Submits claim documents to VA and returns a submission GUID',
    category: 'Claims',
  },
  {
    id: 'benefits-intake-status',
    label: 'Benefits Intake (Status)',
    method: 'GET',
    path: '/va/benefits-intake/mock-intake-guid-abc123',
    workflow: 'Tracks upload submission status by GUID',
    category: 'Claims',
  },
  {
    id: 'appealable-issues',
    label: 'Appealable Issues',
    method: 'GET',
    path: '/va/appealable-issues',
    workflow: 'Identifies which denied claim decisions can be appealed',
    category: 'Appeals',
  },
  {
    id: 'appeals-status',
    label: 'Appeals Status',
    method: 'GET',
    path: '/va/appeals-status',
    workflow: 'Tracks active appeals through BVA docket stages',
    category: 'Appeals',
  },
  {
    id: 'legacy-appeals',
    label: 'Legacy Appeals',
    method: 'GET',
    path: '/va/legacy-appeals',
    workflow: 'Accesses pre-AMA appeals for complete appeal history',
    category: 'Appeals',
  },
  {
    id: 'patient-health',
    label: 'Patient Health (FHIR)',
    method: 'GET',
    path: '/va/patient-health',
    workflow: 'Accesses veteran health records via FHIR for condition and medication data',
    category: 'Health',
  },
  {
    id: 'community-care-eligibility',
    label: 'Community Care Eligibility',
    method: 'GET',
    path: '/va/community-care-eligibility',
    workflow: 'Checks if veteran qualifies for care outside VA facilities',
    category: 'Health',
  },
  {
    id: 'facilities',
    label: 'Facilities',
    method: 'GET',
    path: '/va/facilities',
    workflow: 'Finds nearby VA medical centers and clinics',
    category: 'Facilities',
  },
  {
    id: 'forms',
    label: 'VA Forms',
    method: 'GET',
    path: '/va/forms',
    workflow: 'Retrieves current VA form metadata and versions',
    category: 'Forms',
  },
];

const CATEGORY_COLORS = {
  Identity: 'text-blue-700 bg-blue-50',
  Claims: 'text-amber-700 bg-amber-50',
  Appeals: 'text-purple-700 bg-purple-50',
  Health: 'text-green-700 bg-green-50',
  Facilities: 'text-slate-700 bg-slate-100',
  Forms: 'text-orange-700 bg-orange-50',
};

function StatusBadge({ status, ms }) {
  if (status === 'idle') {
    return <Badge variant="outline" className="text-slate-500 text-xs">Not tested</Badge>;
  }
  if (status === 'loading') {
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Testing...
      </Badge>
    );
  }
  if (status === 'pass') {
    return (
      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Pass {ms && <span className="ml-1 opacity-70">{ms}ms</span>}
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-700 border-0 text-xs">
      <XCircle className="h-3 w-3 mr-1" />
      Fail {ms && <span className="ml-1 opacity-70">{ms}ms</span>}
    </Badge>
  );
}

function ModeBadge({ mode }) {
  if (!mode) return null;
  if (mode === 'live') {
    return <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Live</Badge>;
  }
  return <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">Mock</Badge>;
}

async function callApi(apiDef) {
  if (apiDef.method === 'POST') {
    const res = await api.post(apiDef.path, apiDef.body ?? {});
    return res.data;
  }
  const res = await api.get(apiDef.path);
  return res.data;
}

export default function VAApiStatusPanel() {
  const [results, setResults] = useState({});
  const [runningAll, setRunningAll] = useState(false);
  const [expanded, setExpanded] = useState({});

  const setResult = useCallback((id, update) => {
    setResults((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...update } }));
  }, []);

  const testOne = useCallback(async (apiDef) => {
    setResult(apiDef.id, { status: 'loading', mode: null, error: null, ms: null });
    const start = Date.now();
    try {
      const data = await callApi(apiDef);
      const ms = Date.now() - start;
      setResult(apiDef.id, {
        status: data?.status === 'success' ? 'pass' : 'fail',
        mode: data?.mode ?? null,
        error: data?.status !== 'success' ? (data?.message ?? 'Unexpected response') : null,
        ms,
      });
    } catch (err) {
      const ms = Date.now() - start;
      const msg = err?.response?.data?.message ?? err?.message ?? 'Request failed';
      setResult(apiDef.id, { status: 'fail', mode: null, error: msg, ms });
    }
  }, [setResult]);

  const testAll = useCallback(async () => {
    setRunningAll(true);
    for (const apiDef of VA_APIS) {
      await testOne(apiDef);
    }
    setRunningAll(false);
    toast.success('All API tests completed');
  }, [testOne]);

  const passing = Object.values(results).filter((r) => r.status === 'pass').length;
  const failing = Object.values(results).filter((r) => r.status === 'fail').length;
  const tested = passing + failing;

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Card className="border border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">VA API Health Check</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            {tested > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-700 font-medium">{passing} pass</span>
                {failing > 0 && <span className="text-red-600 font-medium">{failing} fail</span>}
                <span className="text-slate-400">/ {VA_APIS.length}</span>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={testAll}
              disabled={runningAll}
              className="text-sm"
            >
              {runningAll ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1.5" />
              )}
              Run All Tests
            </Button>
          </div>
        </div>

        {tested > 0 && (
          <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(passing / VA_APIS.length) * 100}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {VA_APIS.map((apiDef) => {
            const result = results[apiDef.id] ?? { status: 'idle' };
            const isExpanded = expanded[apiDef.id];
            const hasDetail = result.error;

            return (
              <div
                key={apiDef.id}
                className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {/* Method badge */}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    apiDef.method === 'POST'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {apiDef.method}
                  </span>

                  {/* Category */}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded hidden sm:inline ${CATEGORY_COLORS[apiDef.category]}`}>
                    {apiDef.category}
                  </span>

                  {/* Name */}
                  <span className="text-sm font-medium text-slate-800 flex-1 min-w-0 truncate">
                    {apiDef.label}
                  </span>

                  {/* Mode + Status */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ModeBadge mode={result.mode} />
                    <StatusBadge status={result.status} ms={result.ms} />
                  </div>

                  {/* Test button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-slate-500 hover:text-slate-800 shrink-0"
                    disabled={result.status === 'loading' || runningAll}
                    onClick={() => testOne(apiDef)}
                  >
                    {result.status === 'loading' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    <span className="ml-1">Test</span>
                  </Button>

                  {/* Expand toggle if there's detail */}
                  {hasDetail && (
                    <button
                      className="text-slate-400 hover:text-slate-600"
                      onClick={() => toggleExpand(apiDef.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  )}
                </div>

                {/* Workflow description */}
                <p className="text-[11px] text-slate-500 mt-1 pl-0">{apiDef.workflow}</p>

                {/* Error detail (expandable) */}
                {hasDetail && isExpanded && (
                  <div className="mt-2 rounded bg-red-50 border border-red-100 px-2 py-1.5 text-xs text-red-700 font-mono">
                    {result.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
