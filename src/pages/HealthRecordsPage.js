import React, { useState, useEffect } from 'react';
import VeteranLayout from '../components/VeteranLayout';
import HealthRecordsSync from '../components/HealthRecordsSync';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import {
  Heart, CheckCircle, Loader2, Lock, Wifi, Database,
  Shield, Brain, AlertTriangle, ChevronRight, RefreshCw,
  Activity, Zap, Pill, Stethoscope, FileText, ArrowRight,
  Server, Cpu, ClipboardCheck, GitMerge
} from 'lucide-react';

const APP_NAVY = '#1B3A5F';
const APP_RED  = '#DC2626';

const FHIR_CONDITIONS = [
  { id: 'cond-ptsd-001',    name: 'Post-Traumatic Stress Disorder', code: 'DC 9411', snomed: '47505003',  date: '2008-01-15', rating: '50%', note: 'OIF combat stressor — Baghdad 2004–05.', color: 'border-rose-200 bg-rose-50',   badgeColor: 'bg-rose-600 text-white',   dot: 'bg-rose-500' },
  { id: 'cond-tinnitus-002',name: 'Bilateral Tinnitus',              code: 'DC 6260', snomed: '60862001',  date: '2008-01-15', rating: '10%', note: 'Acoustic trauma from IED blast & weapons fire.', color: 'border-amber-200 bg-amber-50', badgeColor: 'bg-amber-600 text-white', dot: 'bg-amber-500' },
  { id: 'cond-lumbar-003',  name: 'Lumbar Strain with DDD',          code: 'DC 5237', snomed: '279039007', date: '2008-03-20', rating: '10%', note: 'Heavy load-bearing infantry service (11B).', color: 'border-blue-200 bg-blue-50',   badgeColor: 'bg-blue-600 text-white',   dot: 'bg-blue-500' },
];

const FHIR_MEDICATIONS = [
  { name: 'Sertraline (Zoloft) 100mg', indication: 'PTSD / MDD',      prescribed: '2023-04-01', links: 'DC 9411' },
  { name: 'Prazosin 2mg',              indication: 'PTSD nightmares',  prescribed: '2023-04-01', links: 'DC 9411' },
  { name: 'Ibuprofen 600mg PRN',       indication: 'Lumbar pain',      prescribed: '2023-08-15', links: 'DC 5237' },
];

// ── Visual flow steps ────────────────────────────────────────────────────────
const FLOW_STEPS = [
  {
    icon: Server,
    label: 'VA FHIR R4',
    sub: 'sandbox-api.va.gov',
    detail: 'HL7 FHIR R4\npatient/Condition.read',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    ms: 700,
  },
  {
    icon: Lock,
    label: 'OAuth2 CCG',
    sub: 'Client Credentials Grant',
    detail: 'RS256 JWT assertion\nAccess token issued',
    color: 'bg-violet-50 border-violet-200',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-100',
    ms: 900,
  },
  {
    icon: Database,
    label: 'FHIR Bundle',
    sub: '3 Conditions · 2 Meds',
    detail: 'SNOMED codes\nOnset dates · Notes',
    color: 'bg-teal-50 border-teal-200',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-100',
    ms: 1100,
  },
  {
    icon: Brain,
    label: 'AI Engine',
    sub: 'DC code mapping',
    detail: 'SNOMED → DC codes\nNexus letter drafted',
    color: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100',
    ms: 800,
  },
  {
    icon: ClipboardCheck,
    label: '21-526EZ',
    sub: '54 of 68 fields filled',
    detail: 'Onset dates · DC codes\nService connection noted',
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    ms: 500,
  },
];

// ── Visual pipeline component ────────────────────────────────────────────────
function VisualFlow({ phase, onComplete }) {
  const [reached, setReached] = useState(0); // how many steps are done

  useEffect(() => {
    if (phase !== 'connecting') return;
    let delay = 200;
    FLOW_STEPS.forEach((step, idx) => {
      delay += step.ms;
      setTimeout(() => {
        setReached(idx + 1);
        if (idx === FLOW_STEPS.length - 1) {
          setTimeout(onComplete, 400);
        }
      }, delay);
    });
  }, [phase]); // eslint-disable-line

  useEffect(() => {
    if (phase === 'idle') setReached(0);
  }, [phase]);

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <GitMerge className="h-5 w-5" style={{ color: APP_NAVY }} />
        <h3 className="font-semibold text-gray-900">Data Flow — VA FHIR R4 → EarnedIT → Claim</h3>
        {phase === 'connected' && (
          <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Complete
          </span>
        )}
      </div>

      {/* Horizontal flow nodes */}
      <div className="flex items-start w-full">
        {FLOW_STEPS.map((step, idx) => {
          const Icon      = step.icon;
          const isDone    = reached > idx;
          const isActive  = phase === 'connecting' && reached === idx;
          const isPending = !isDone && !isActive;
          const isLast    = idx === FLOW_STEPS.length - 1;

          return (
            <div key={idx} className="flex items-center flex-1 min-w-0">
              {/* Node */}
              <div className={`flex flex-col items-center gap-1.5 flex-1 min-w-0 transition-all duration-500`}>
                {/* Icon circle */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isDone   ? 'bg-green-100 border-green-400 shadow-md shadow-green-100' :
                  isActive ? `${step.iconBg} border-current ${step.iconColor} shadow-md` :
                  'bg-gray-100 border-gray-200 opacity-40'
                }`}>
                  {isDone   ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                   isActive ? <Loader2 className={`h-6 w-6 animate-spin ${step.iconColor}`} /> :
                              <Icon className={`h-5 w-5 ${isPending ? 'text-gray-300' : step.iconColor}`} />}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p className={`text-xs font-semibold leading-tight transition-colors ${
                    isDone ? 'text-green-700' : isActive ? 'text-gray-900' : 'text-gray-300'
                  }`}>{step.label}</p>
                  <p className={`text-[10px] leading-tight mt-0.5 transition-colors ${
                    isDone ? 'text-green-600' : isActive ? 'text-gray-500' : 'text-gray-200'
                  }`}>{step.sub}</p>
                </div>

                {/* Detail tooltip-style box (shows when active/done) */}
                {(isDone || isActive) && (
                  <div className={`w-full rounded-lg border px-2 py-1.5 text-[10px] leading-snug text-center transition-all duration-300 ${
                    isDone ? 'bg-green-50 border-green-200 text-green-700' : `${step.color} ${step.iconColor}`
                  }`}>
                    {step.detail.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                  </div>
                )}
              </div>

              {/* Arrow connector */}
              {!isLast && (
                <div className="flex-shrink-0 px-1">
                  <ArrowRight className={`h-5 w-5 transition-colors duration-500 ${reached > idx ? 'text-green-500' : 'text-gray-200'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats row — shown after completion */}
      {phase === 'connected' && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
          {[
            { value: '247ms', label: 'Response time' },
            { value: '3',     label: 'Conditions' },
            { value: '54/68', label: 'Fields pre-filled' },
          ].map((stat, i) => (
            <div key={i} className="text-center bg-green-50 rounded-lg py-2">
              <p className="text-lg font-bold text-green-700">{stat.value}</p>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── OAuth animation (connecting phase, shows below flow) ─────────────────────
const OAUTH_STEPS = [
  { label: 'Generating client assertion JWT (RS256)',                      ms: 700 },
  { label: 'Requesting access token (scope: patient/Condition.read)',       ms: 900 },
  { label: 'Token validated by VA Identity Service',                        ms: 700 },
  { label: 'Calling GET /fhir/R4/Patient/1013127591V428144/Condition',     ms: 1100 },
  { label: 'FHIR R4 Bundle received & normalized',                          ms: 500 },
];

function OAuthSteps() {
  const [current, setCurrent] = useState(0);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    let delay = 200;
    OAUTH_STEPS.forEach((step, idx) => {
      delay += step.ms;
      setTimeout(() => {
        setCurrent(idx + 1);
        if (idx === OAUTH_STEPS.length - 1) setTimeout(() => setDone(true), 400);
      }, delay);
    });
  }, []); // eslint-disable-line

  return (
    <div className="bg-white rounded-xl border p-4 space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">OAuth2 CCG Handshake</p>
      {OAUTH_STEPS.map((step, idx) => {
        const isDone   = current > idx + 1 || done;
        const isActive = current === idx + 1;
        return (
          <div key={idx} className={`flex items-center gap-2.5 p-2 rounded-lg text-xs transition-all duration-400 ${
            isDone ? 'bg-green-50' : isActive ? 'bg-blue-50' : 'opacity-30'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDone ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {isDone   ? <CheckCircle className="h-3 w-3 text-green-600" /> :
               isActive ? <Loader2 className="h-3 w-3 text-blue-600 animate-spin" /> :
                          <Lock className="h-3 w-3 text-gray-300" />}
            </div>
            <span className={isDone ? 'text-green-700' : isActive ? 'text-blue-700 font-medium' : 'text-gray-300'}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function HealthRecordsPage() {
  const { user } = useAuth();
  const [phase, setPhase]   = useState('idle');
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    api.get('/claims/list').then(r => setClaims(r.data?.claims || [])).catch(() => {});
  }, []);

  const veteranIcn = user?.icn || '1013127591V428144';
  const activeClaim = claims[0];

  return (
    <VeteranLayout>
      <div className="min-h-full bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Health Records</h1>
              <p className="mt-1 text-gray-500">
                Pulled directly from <span className="font-medium text-gray-700">VA FHIR R4 API</span> via OAuth2 CCG
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-medium">Sandbox</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 font-medium flex items-center gap-1">
                <Wifi className="h-3 w-3" /> FHIR Connected
              </span>
            </div>
          </div>

          {/* Scenario Banner */}
          <div
            className="rounded-xl p-4 border-2 text-white"
            style={{ background: `linear-gradient(135deg, ${APP_NAVY} 0%, #2a5298 100%)`, borderColor: APP_NAVY }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Scenario 3 — Health Records Import (FHIR R4)</p>
                <p className="text-white/80 text-sm mt-0.5">
                  VA API: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">VA FHIR R4</code>
                  &nbsp;·&nbsp;Auth: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">OAuth2 CCG</code>
                  &nbsp;·&nbsp;Scope: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">patient/Condition.read</code>
                </p>
                <p className="text-white/70 text-xs mt-2">
                  VA diagnoses → DC codes → pre-filled on 21-526EZ · Medications → confirm conditions · Onset dates → claim form dates
                </p>
              </div>
            </div>
          </div>

          {/* ── Visual Flow (full width) ── */}
          <VisualFlow phase={phase} onComplete={() => setPhase('connected')} />

          {/* ── Trigger / OAuth steps / Reset ── */}
          {phase === 'idle' && (
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" style={{ color: APP_NAVY }} />
                <h3 className="font-semibold text-gray-900">VA FHIR R4 Authorization</h3>
              </div>
              <p className="text-sm text-gray-600">
                EarnedIT pulls the veteran's confirmed VA diagnoses in HL7 FHIR R4 format — the same standard
                used by Epic, Cerner, and Apple Health Records. Conditions include SNOMED codes, onset dates, and provider notes.
              </p>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 space-y-1">
                <p><strong>Endpoint:</strong> GET /fhir/R4/Patient/{'{icn}'}/Condition</p>
                <p><strong>Auth standard:</strong> OAuth2 CCG / SMART on FHIR</p>
                <p><strong>Scope:</strong> patient/Condition.read · patient/MedicationRequest.read</p>
                <p><strong>Data returned:</strong> Conditions with SNOMED codes, medications, onset dates</p>
              </div>
              <button
                onClick={() => setPhase('connecting')}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: APP_NAVY }}
              >
                <Zap className="h-4 w-4" />
                Import VA Health Records
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {phase === 'connecting' && <OAuthSteps />}

          {phase === 'connected' && (
            <div className="flex justify-end">
              <button
                onClick={() => setPhase('idle')}
                className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset Demo
              </button>
            </div>
          )}

          {/* ── Data display (conditions + medications) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Conditions */}
            <div className="bg-white rounded-xl border p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-rose-600" />
                <h3 className="font-semibold text-gray-900">VA Health Conditions</h3>
                <span className="ml-auto text-xs text-gray-400 font-mono">ICN: 1013127591V428144</span>
              </div>

              {/* FHIR resource type badge */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                <Database className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-500 font-mono">resourceType: Condition · total: 3</span>
              </div>

              {FHIR_CONDITIONS.map((c) => (
                <div key={c.id} className={`rounded-xl border p-4 space-y-2 transition-all duration-300 ${c.color} ${phase === 'connected' ? 'shadow-sm' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                      <span className="text-xs font-bold text-gray-700">{c.code}</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${c.badgeColor}`}>{c.rating}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span>SNOMED: {c.snomed}</span>
                    <span>·</span>
                    <span>recordedDate: {c.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 italic border-l-2 border-gray-300 pl-2">"{c.note}"</p>
                  {phase === 'connected' && (
                    <div className="flex items-center gap-1.5 bg-white/70 rounded-lg px-2 py-1">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-xs text-green-700 font-medium">Onset date + DC code pre-filled on 21-526EZ</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Medications + AI mapping */}
            <div className="space-y-4">
              {/* Medications */}
              <div className="bg-white rounded-xl border p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-violet-600" />
                  <h3 className="font-semibold text-gray-900">Active Medications</h3>
                  <span className="ml-auto text-xs text-gray-400 font-mono">MedicationRequest</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                  <Database className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 font-mono">resourceType: MedicationRequest · total: 3</span>
                </div>
                {FHIR_MEDICATIONS.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Pill className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-600">{m.indication}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-violet-700 font-mono">{m.links}</span>
                      <p className="text-xs text-green-600">Active</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI mapping result */}
              <div className="bg-white rounded-xl border p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5" style={{ color: APP_RED }} />
                  <h3 className="font-semibold text-gray-900">AI Mapping Result</h3>
                  <span className="ml-auto text-xs text-gray-400">EarnedIT Engine</span>
                </div>
                {[
                  { from: 'SNOMED 47505003',  to: 'DC 9411 PTSD',             arrow: true,  color: 'bg-rose-50 border-rose-200' },
                  { from: 'SNOMED 60862001',  to: 'DC 6260 Tinnitus',          arrow: true,  color: 'bg-amber-50 border-amber-200' },
                  { from: 'SNOMED 279039007', to: 'DC 5237 Lumbar Strain',      arrow: true,  color: 'bg-blue-50 border-blue-200' },
                  { from: 'Sertraline Rx',    to: 'Confirms PTSD nexus',        arrow: true,  color: 'bg-violet-50 border-violet-200' },
                  { from: 'recordedDate',     to: '21-526EZ Box 21 onset',      arrow: true,  color: 'bg-green-50 border-green-200' },
                ].map((row, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${row.color}`}>
                    <code className="text-gray-700 flex-shrink-0">{row.from}</code>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{row.to}</span>
                    {phase === 'connected' && <CheckCircle className="h-3 w-3 text-green-600 ml-auto flex-shrink-0" />}
                  </div>
                ))}
              </div>

              {/* Link to claim */}
              {phase === 'connected' && activeClaim && (
                <div className="bg-white rounded-xl border p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" style={{ color: APP_NAVY }} />
                    <h3 className="font-semibold text-gray-900">Link to Active Claim</h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    These FHIR conditions can be imported as evidence directly into your active claim.
                  </p>
                  <HealthRecordsSync veteranIcn={veteranIcn} claimId={activeClaim?.id} />
                </div>
              )}
            </div>
          </div>

          {/* Talking points */}
          <div
            className="rounded-xl border p-5 space-y-3"
            style={{ background: `${APP_NAVY}08`, borderColor: `${APP_NAVY}30` }}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" style={{ color: APP_NAVY }} />
              <h3 className="font-semibold text-sm" style={{ color: APP_NAVY }}>Presentation Talking Points</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
              {[
                'HL7 FHIR R4 is the mandated federal interoperability standard — VA adopted it in 2023, same as Epic, Cerner, Apple Health.',
                'Conditions arrive with SNOMED codes that map directly to VA DC codes — no manual lookup, no transcription errors.',
                'recordedDate from VA health records is legally valid as the onset date for the 21-526EZ — eliminates a major delay cause.',
                'Active medications cross-reference conditions — Sertraline for PTSD, Prazosin for nightmares — AI uses these in nexus letters.',
                'Bundle includes all conditions documented at any VA facility nationwide — veterans can\'t accidentally omit a diagnosis.',
                'Read-only OAuth scope — VA tokens cannot write or modify any health record. HIPAA-compliant with encryption at rest.',
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-green-600" />
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </VeteranLayout>
  );
}
