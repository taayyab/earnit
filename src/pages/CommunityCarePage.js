import React, { useState, useEffect } from 'react';
import VeteranLayout from '../components/VeteranLayout';
import CommunityCareEligibility from '../components/community-care/CommunityCareEligibility';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import {
  Building2, CheckCircle, Loader2, Lock, Wifi, Database,
  Shield, Brain, AlertTriangle, ChevronRight, RefreshCw,
  Activity, Zap, MapPin, Phone, Clock, Heart
} from 'lucide-react';

const APP_NAVY = '#1B3A5F';
const APP_RED  = '#DC2626';

const OAUTH_STEPS = [
  { id: 1, label: 'Generating client assertion JWT',                                    ms: 600 },
  { id: 2, label: 'Requesting access token (scope: community_care.read)',               ms: 900 },
  { id: 3, label: 'Token validated by VA Identity Service',                             ms: 700 },
  { id: 4, label: 'Calling GET /community-care/v0/eligibility/NonUrgentCare',          ms: 1100 },
  { id: 5, label: 'MISSION Act criteria evaluated — response received',                 ms: 500 },
];

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
        const isActive = currentStep === idx + 1;
        const isDone   = currentStep > idx + 1 || done;
        return (
          <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
            isDone ? 'bg-green-50 border-green-200' : isActive ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-100 opacity-40'
          }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDone ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {isDone   ? <CheckCircle className="h-4 w-4 text-green-600" /> :
               isActive ? <Loader2 className="h-4 w-4 text-blue-600 animate-spin" /> :
                          <Lock className="h-4 w-4 text-gray-400" />}
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

function ApiCallPanel() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-900 text-green-400 font-mono text-xs overflow-x-auto">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700 rounded-t-xl">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-gray-400 font-sans text-xs">VA Community Care API Request</span>
      </div>
      <div className="p-4 space-y-1">
        <p><span className="text-blue-400">GET</span> <span className="text-white">/services/community-care/v0/eligibility/NonUrgentCare</span></p>
        <p className="text-gray-500">Host: sandbox-api.va.gov</p>
        <p className="mt-2 text-gray-500">Authorization: <span className="text-yellow-300">Bearer {'<'}access_token{'>'}</span></p>
        <p className="text-gray-500">apikey: <span className="text-yellow-300">{'<'}VA_API_KEY{'>'}</span></p>
        <p className="mt-2 text-gray-400">{'// OAuth2 Client Credentials Grant (CCG)'}</p>
        <p className="text-gray-400">{'// Scope: community_care.read'}</p>
        <p className="text-gray-400">{'// MISSION Act — 38 U.S.C. § 1703'}</p>
        <p className="mt-3 text-green-300">200 OK  ·  ~221ms  ·  sandbox</p>
        <p className="text-gray-400 mt-1">{'{'}</p>
        <p className="text-gray-400 pl-4">"eligible": true, "criteria_met": "drive_time",</p>
        <p className="text-gray-400 pl-4">"drive_time_minutes": 52, "threshold": 30,</p>
        <p className="text-gray-400 pl-4">"eligibility_types": {'{'} "mental_health": true, "general": true {'}'}</p>
        <p className="text-gray-400">{'}'}</p>
      </div>
    </div>
  );
}

export default function CommunityCarePage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState('idle');

  return (
    <VeteranLayout>
      <div className="min-h-full bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Community Care</h1>
              <p className="mt-1 text-gray-500">
                MISSION Act eligibility via <span className="font-medium text-gray-700">VA Community Care API v0</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-medium">Sandbox</span>
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
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Scenario 10 — Community Care Eligibility</p>
                <p className="text-white/80 text-sm mt-0.5">
                  VA API: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">community-care/v0</code>
                  &nbsp;·&nbsp;Auth: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">OAuth2 CCG</code>
                  &nbsp;·&nbsp;Scope: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">community_care.read</code>
                </p>
                <p className="text-white/70 text-xs mt-2">
                  Drive time · Wait time · MISSION Act criteria → Private providers paid by VA · Mental health therapists · Urgent care clinics
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left — OAuth + API panel */}
            <div className="space-y-4">

              {phase === 'idle' && (
                <div className="bg-white rounded-xl border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" style={{ color: APP_NAVY }} />
                    <h3 className="font-semibold text-gray-900">Community Care Eligibility Check</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Under the MISSION Act, veterans meeting drive time or wait time thresholds can see private providers
                    paid by VA. EarnedIT checks all 6 MISSION Act criteria automatically — no forms, no phone calls.
                  </p>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-700 space-y-1">
                    <p><strong>Endpoint:</strong> GET /services/community-care/v0/eligibility/NonUrgentCare</p>
                    <p><strong>Auth standard:</strong> OAuth2 CCG</p>
                    <p><strong>Scope:</strong> community_care.read</p>
                    <p><strong>Data returned:</strong> Eligibility status, drive time, covered service types</p>
                  </div>
                  <button
                    onClick={() => setPhase('connecting')}
                    className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ background: APP_NAVY }}
                  >
                    <Zap className="h-4 w-4" />
                    Check Community Care Eligibility
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {phase === 'connecting' && (
                <div className="bg-white rounded-xl border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Evaluating MISSION Act Criteria...</h3>
                  </div>
                  <OAuthFlowPanel onComplete={() => setPhase('connected')} />
                </div>
              )}

              {phase === 'connected' && (
                <div className="bg-white rounded-xl border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Community Care Eligible</h3>
                    <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      MISSION Act Criteria Met
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
                  <h3 className="font-semibold text-gray-900">EarnedIT AI Engine</h3>
                  <span className="ml-auto text-xs text-gray-400">MISSION Act analysis</span>
                </div>
                <p className="text-xs text-gray-500">
                  EarnedIT checks all 6 MISSION Act criteria simultaneously and identifies which private providers
                  the veteran can see today — without a VA appointment.
                </p>
                <div className="space-y-2">
                  {[
                    { icon: CheckCircle, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', title: '52-min drive → automatic eligibility', detail: 'James A. Haley VAMC is 52 min away. MISSION Act threshold is 30 min. Eligibility confirmed since June 2019.' },
                    { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', title: 'PTSD therapy with private therapists now', detail: 'Mental health community care enabled. Veteran can see a private CBT therapist today — no 6-month VA wait list.' },
                    { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: '70% of eligible veterans don\'t know', detail: 'Most veterans waiting for VA appointments are eligible for community care but were never told. EarnedIT surfaces this automatically.' },
                  ].map((ins, i) => {
                    const Icon = ins.icon;
                    return (
                      <div key={i} className={`rounded-lg border p-3 ${ins.bg}`}>
                        <div className="flex items-start gap-2">
                          <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${ins.color}`} />
                          <div>
                            <p className={`text-xs font-semibold ${ins.color}`}>{ins.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{ins.detail}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right — CommunityCareEligibility component */}
            <div>
              <CommunityCareEligibility />
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
                '70% of veterans who qualify for community care don\'t know they\'re eligible — they wait for VA appointments unnecessarily.',
                'PTSD veterans can see private CBT therapists immediately instead of waiting 6+ months on VA mental health wait lists.',
                'Drive time is calculated from the veteran\'s actual address to the nearest appropriate VA facility — automatic, no forms.',
                'MISSION Act created 6 community care criteria. EarnedIT checks all 6 simultaneously.',
                'Pharmacy benefit: CVS and Walgreens accept VA prescriptions under the community care pharmacy program.',
                'Referral tracking built in — EarnedIT shows how many visits remain and when the authorization expires.',
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
