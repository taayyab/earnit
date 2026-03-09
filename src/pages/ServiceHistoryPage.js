import React, { useState, useEffect } from 'react';
import VeteranLayout from '../components/VeteranLayout';
import { ServiceHistoryCard } from '../components/veteran/ServiceHistoryCard';
import {
  Shield, CheckCircle, Loader2, Lock, Wifi, Database,
  Brain, AlertTriangle, ChevronRight, RefreshCw, Activity,
  Zap, MapPin, Clock
} from 'lucide-react';

const APP_NAVY = '#1B3A5F';
const APP_RED  = '#DC2626';

// ── Simulated OAuth CCG flow steps shown to the audience ─────────────────────
const OAUTH_STEPS = [
  { id: 1, label: 'Generating client credentials (CCG)',       icon: Lock,     ms: 600 },
  { id: 2, label: 'Requesting access token (scope: service_history.read)', icon: Shield, ms: 900 },
  { id: 3, label: 'Token validated by VA Identity Service',    icon: CheckCircle, ms: 700 },
  { id: 4, label: 'Calling GET /services/veteran_service_history/v1/service-history', icon: Wifi, ms: 1100 },
  { id: 5, label: 'Response received & normalized',            icon: Database, ms: 500 },
];

// ── What the AI engine infers from service history ────────────────────────────
const AI_INSIGHTS = [
  {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    title: 'High-probability conditions detected',
    detail: 'OIF deployment (Baghdad 2004–05) + IED blast exposure → PTSD (DC 9411), TBI, Tinnitus (DC 6260)',
  },
  {
    icon: MapPin,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    title: 'Theater hazard flags',
    detail: 'Iraq burn pit exposure triggers automatic screening for constrictive bronchiolitis, sleep apnea, and respiratory conditions under PACT Act.',
  },
  {
    icon: Activity,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    title: 'MOS load-bearing analysis',
    detail: '11B Infantryman with 4+ years active duty → high likelihood of musculoskeletal conditions (lumbar strain DC 5237, knee, shoulder).',
  },
  {
    icon: Clock,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    title: 'Eligibility window confirmed',
    detail: 'Honorable discharge Apr 2003 – Oct 2007 fully covers all claimed condition onset dates. No eligibility gaps.',
  },
];

// ── The API call details panel ────────────────────────────────────────────────
function ApiCallPanel() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-900 text-green-400 font-mono text-xs overflow-x-auto">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700 rounded-t-xl">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-gray-400 font-sans text-xs">VA Lighthouse API Request</span>
      </div>
      <div className="p-4 space-y-1">
        <p><span className="text-blue-400">GET</span> <span className="text-white">/services/veteran_service_history/v1/service-history</span></p>
        <p className="text-gray-500">Host: sandbox-api.va.gov</p>
        <p className="mt-2 text-gray-500">Authorization: <span className="text-yellow-300">Bearer {'<'}access_token{'>'}</span></p>
        <p className="text-gray-500">apikey: <span className="text-yellow-300">{'<'}VA_API_KEY{'>'}</span></p>
        <p className="mt-2 text-gray-400">{'// OAuth2 Client Credentials Grant (CCG)'}</p>
        <p className="text-gray-400">{'// Scope: service_history.read'}</p>
        <p className="text-gray-400">{'// Standard: NIST 800-63-3 IAL2'}</p>
        <p className="mt-3 text-green-300">200 OK  ·  ~312ms  ·  sandbox</p>
        <p className="text-gray-400 mt-1">{'{'}</p>
        <p className="text-gray-400 pl-4">"data": {'{'} "type": "service_history_episodes",</p>
        <p className="text-gray-400 pl-4">  "attributes": {'{'} "service_history": [ ... ] {'}'},</p>
        <p className="text-gray-400 pl-4">  "icn": "1013127591V428144" {'}'}</p>
        <p className="text-gray-400">{'}'}</p>
      </div>
    </div>
  );
}

// ── Animated OAuth flow ───────────────────────────────────────────────────────
function OAuthFlowPanel({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let delay = 300;
    OAUTH_STEPS.forEach((step, idx) => {
      delay += step.ms;
      setTimeout(() => {
        setCurrentStep(idx + 1);
        if (idx === OAUTH_STEPS.length - 1) {
          setTimeout(() => { setDone(true); onComplete(); }, 400);
        }
      }, delay);
    });
  }, []); // eslint-disable-line

  return (
    <div className="space-y-2">
      {OAUTH_STEPS.map((step, idx) => {
        const StepIcon = step.icon;
        const isActive  = currentStep === idx + 1;
        const isDone    = currentStep > idx + 1 || done;
        const isPending = currentStep <= idx;
        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
              isDone    ? 'bg-green-50 border-green-200'  :
              isActive  ? 'bg-blue-50 border-blue-300'    :
              'bg-gray-50 border-gray-100 opacity-40'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDone ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {isDone ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              ) : (
                <StepIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <p className={`text-sm ${isDone ? 'text-green-700' : isActive ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function ServiceHistoryPage() {
  const [phase, setPhase] = useState('idle'); // idle | connecting | connected
  const [serviceData, setServiceData] = useState(null);

  const handleConnect = () => {
    if (phase !== 'idle') return;
    setPhase('connecting');
  };

  const handleOAuthComplete = () => {
    setPhase('connected');
  };

  return (
    <VeteranLayout>
      <div className="min-h-full bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

          {/* Page Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Service History & Eligibility</h1>
              <p className="mt-1 text-gray-500">
                Pulled directly from <span className="font-medium text-gray-700">VA Veteran Service History API v1</span> via OAuth2 CCG
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-medium">
                Sandbox
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 font-medium flex items-center gap-1">
                <Wifi className="h-3 w-3" /> VA Connected
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
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Scenario 2 — Service History & Eligibility</p>
                <p className="text-white/80 text-sm mt-0.5">
                  VA API: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">veteran_service_history/v1</code>
                  &nbsp;·&nbsp;Auth: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">OAuth2 CCG</code>
                  &nbsp;·&nbsp;Scope: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">service_history.read</code>
                </p>
                <p className="text-white/70 text-xs mt-2">
                  Service dates → eligibility windows · Deployments → in-service events · Branch/MOS → AI condition identification
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left — OAuth flow + API call */}
            <div className="space-y-4">

              {/* Connect Button / OAuth Flow */}
              {phase === 'idle' && (
                <div className="bg-white rounded-xl border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" style={{ color: APP_NAVY }} />
                    <h3 className="font-semibold text-gray-900">VA OAuth2 Authorization</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Once the veteran authorizes access, EarnedIT calls the VA Service History API using
                    Client Credentials Grant (CCG). No password sharing — the VA token is scoped to
                    read-only service history.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 space-y-1">
                    <p><strong>Endpoint:</strong> GET /services/veteran_service_history/v1/service-history</p>
                    <p><strong>Auth standard:</strong> SMART on FHIR / OAuth2 CCG</p>
                    <p><strong>Scope:</strong> service_history.read</p>
                    <p><strong>Data returned:</strong> Service periods, deployments, discharge status, MOS</p>
                  </div>
                  <button
                    onClick={handleConnect}
                    className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ background: APP_NAVY }}
                  >
                    <Zap className="h-4 w-4" />
                    Simulate VA API Call
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {phase === 'connecting' && (
                <div className="bg-white rounded-xl border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Connecting to VA Lighthouse...</h3>
                  </div>
                  <OAuthFlowPanel onComplete={handleOAuthComplete} />
                </div>
              )}

              {phase === 'connected' && (
                <div className="bg-white rounded-xl border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">VA API Connected</h3>
                    <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      Live Data
                    </span>
                  </div>
                  <ApiCallPanel />
                  <button
                    onClick={() => setPhase('idle')}
                    className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reset Demo
                  </button>
                </div>
              )}

              {/* AI Insights */}
              <div className="bg-white rounded-xl border p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5" style={{ color: APP_RED }} />
                  <h3 className="font-semibold text-gray-900">AI Engine Insights</h3>
                  <span className="ml-auto text-xs text-gray-400">from service history data</span>
                </div>
                <p className="text-xs text-gray-500">
                  Once service history is pulled, EarnedIT's AI automatically cross-references
                  deployment locations, MOS, and dates to identify likely service-connected conditions.
                </p>
                <div className="space-y-2">
                  {AI_INSIGHTS.map((insight, idx) => {
                    const Icon = insight.icon;
                    return (
                      <div key={idx} className={`rounded-lg border p-3 ${insight.bg}`}>
                        <div className="flex items-start gap-2">
                          <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${insight.color}`} />
                          <div>
                            <p className={`text-xs font-semibold ${insight.color}`}>{insight.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{insight.detail}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right — Service History Data */}
            <div>
              <ServiceHistoryCard />
            </div>
          </div>

          {/* Presentation talking points */}
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
                'Once authorized, we pull complete service history directly from VA records — branch, active duty dates, deployments, character of discharge, disability rating.',
                'This eliminates manual data entry errors. Veterans don\'t need to remember exact dates or locations.',
                'Our AI uses Iraq deployment (2004–2006) to automatically flag tinnitus, TBI, and respiratory issues from burn pit exposure.',
                'Honorable discharge confirmed instantly — no manual verification step, no eligibility guesswork.',
                'Current 70% combined rating shown upfront — veterans understand their baseline and can see exactly what new conditions would raise it.',
                'OAuth2 CCG means no password sharing. The VA token is scoped to read-only service history — zero security risk.',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-green-600" />
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </VeteranLayout>
  );
}
