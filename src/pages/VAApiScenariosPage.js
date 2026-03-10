import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VeteranLayout from '../components/VeteranLayout';
import api from '../lib/api';
import {
  Shield, CheckCircle, Loader2, Lock, Wifi, Database,
  Brain, AlertTriangle, ChevronRight, ChevronLeft, RefreshCw, Activity,
  Zap, Heart, BookOpen, Upload, GitBranch, Gavel, Clock,
  Building2, MapPin, FileText, BarChart3, Star, Key,
  Package, Stethoscope, TrendingUp, Globe, ExternalLink, Play, XCircle,
  UserCheck, Award, CalendarDays, LogIn
} from 'lucide-react';

const APP_NAVY = '#1B3A5F';
const APP_RED  = '#DC2626';

// ─────────────────────────────────────────────────────────────────────────────
// VA TEST USERS  (from VA Lighthouse developer portal sandbox)
// Full data required: visit https://developer.va.gov/explore/api/veteran-confirmation/test-users
// ─────────────────────────────────────────────────────────────────────────────
// VA SANDBOX TEST VETERANS  (source: developer.va.gov/explore/api/veteran-confirmation/test-users)
// ─────────────────────────────────────────────────────────────────────────────
// Source: VA Lighthouse sandbox test data — developer.va.gov
// ICN shown for reference (used by OAuth service-history flow)
const VA_TEST_USERS = [
  // ── Confirmed ─────────────────────────────────────────────────────────────
  { id: 'ellis',     icn: '1012667145V762142', firstName: 'Tamara',   middleName: 'E',         lastName: 'Ellis',    gender: 'F', birthDate: '1967-06-19', streetAddressLine1: 'BEHIND TAHINI RIVER',    city: 'Austin',        state: 'TX', zipCode: '78741', country: 'USA', confirmed: true,  avatarInitials: 'TE', avatarColor: '#BE185D' },
  { id: 'ford',      icn: '1012832025V743496', firstName: 'Wesley',   middleName: 'Watson',    lastName: 'Ford',     gender: 'M', birthDate: '1986-05-06', streetAddressLine1: '1723 GOSNELL RD',         city: 'Vienna',        state: 'VA', zipCode: '22182', country: 'USA', confirmed: true,  avatarInitials: 'WF', avatarColor: '#0369A1' },
  { id: 'armstrong', icn: '1012667145V762142', firstName: 'Alfredo',  middleName: 'M',         lastName: 'Armstrong',gender: 'M', birthDate: '1993-06-08', streetAddressLine1: '17020 Tortoise St',       city: 'Round Rock',    state: 'TX', zipCode: '78664', country: 'USA', confirmed: true,  avatarInitials: 'AA', avatarColor: '#C2410C' },
  { id: 'freeman',   icn: '1012829910V765228', firstName: 'Russell',  middleName: 'James',     lastName: 'Freeman',  gender: 'M', birthDate: '1969-11-05', streetAddressLine1: '100 BEACH BLVD',          city: 'Jacksonville',  state: 'FL', zipCode: '32207', country: 'USA', confirmed: true,  avatarInitials: 'RF', avatarColor: '#059669' },
  { id: 'hayes',     icn: '1012845028V591200', firstName: 'Jeffery',  middleName: 'J',         lastName: 'Hayes',    gender: 'M', birthDate: '1937-09-25', streetAddressLine1: '2575 VALENCIA DR NE',     city: 'Marietta',      state: 'GA', zipCode: '30062', country: 'USA', confirmed: true,  avatarInitials: 'JH', avatarColor: '#7C3AED' },
  { id: 'patterson', icn: '1012831012V063489', firstName: 'Christian',middleName: 'Fitzgerald', lastName: 'Patterson',gender: 'M', birthDate: '1964-03-04', streetAddressLine1: 'TRAIL',                   city: 'Silver Spring', state: 'MD', zipCode: '20902', country: 'USA', confirmed: true,  avatarInitials: 'CP', avatarColor: '#0891B2' },
  { id: 'horton',    icn: '1012826664V603033', firstName: 'Everett',  middleName: 'Avery',     lastName: 'Horton',   gender: 'M', birthDate: '1982-04-23', streetAddressLine1: '2059 Homer Ave',          city: 'New York City', state: 'NY', zipCode: '10473', country: 'USA', confirmed: true,  avatarInitials: 'EH', avatarColor: '#D97706' },
  { id: 'price',     icn: '1012845658V192434', firstName: 'Jessie',   middleName: 'F',         lastName: 'Price',    gender: 'M', birthDate: '1934-04-07', streetAddressLine1: '132 N South St',          city: 'Tampa',         state: 'FL', zipCode: '33616', country: 'USA', confirmed: true,  avatarInitials: 'JP', avatarColor: '#1B3A5F' },
  // ── Not Confirmed ─────────────────────────────────────────────────────────
  { id: 'anderson',  icn: '1012666182V203559', firstName: 'Greg',     middleName: 'A',         lastName: 'Anderson', gender: 'M', birthDate: '1933-04-05', streetAddressLine1: 'MILITARY ADDY 3',         city: 'DPO',           state: 'MI', zipCode: '22312', country: 'USA', confirmed: false, avatarInitials: 'GA', avatarColor: '#475569' },
  { id: 'hunter',    icn: '1012666072V702345', firstName: 'Julio',    middleName: 'E',         lastName: 'Hunter',   gender: 'M', birthDate: '1951-11-18', streetAddressLine1: '111 SPRING ST',           city: 'Harned',        state: 'KY', zipCode: '40144', country: 'USA', confirmed: false, avatarInitials: 'JH', avatarColor: '#64748B' },
];

const WORKFLOW_STEPS = [
  { id: 1, title: 'Veteran Verification', api: 'veteran-confirmation', path: '/va/veteran-confirmation', method: 'GET', authType: 'api-key', color: '#1B3A5F', description: 'Confirm veteran status via VA identity records' },
  { id: 2, title: 'Service History',      api: 'service-history',      path: '/va/service-history',      method: 'GET', authType: 'oauth',   color: '#1D4ED8', description: 'Retrieve military service periods, deployments, and discharge status' },
  { id: 3, title: 'Benefits Claims',      api: 'benefits-claims',      path: '/va/benefits-claims',      method: 'GET', authType: 'oauth',   color: '#B45309', description: 'Access active disability compensation claims and current ratings' },
  { id: 4, title: 'Appealable Issues',    api: 'appealable-issues',    path: '/va/appealable-issues',    method: 'GET', authType: 'oauth',   color: '#C2410C', description: 'Identify which rated conditions are eligible for appeal' },
  { id: 5, title: 'Appeals Status',       api: 'appeals-status',       path: '/va/appeals-status',       method: 'GET', authType: 'oauth',   color: '#6D28D9', description: 'Track active VA appeals through the Board docket' },
  { id: 6, title: 'Health Records',       api: 'patient-health',       path: '/va/patient-health',       method: 'GET', authType: 'oauth',   color: '#BE185D', description: 'Access VA health records and diagnosed conditions via FHIR R4' },
  { id: 7, title: 'VA Facilities',        api: 'facilities',           path: '/va/facilities',           method: 'GET', authType: 'api-key', color: '#0F766E', description: 'Locate nearby VA medical centers, CBOCs, and Vet Centers' },
];

// ── Service History OAuth test users (VA sandbox) ─────────────────────────────
// All use ID.me login: email = va.api.user+{id}-2024@gmail.com, password = SandboxPassword2024!
const SERVICE_HISTORY_TEST_USERS = [
  { id: '001', firstName: 'Tamara',    lastName: 'Ellis',     branch: 'Air Force', activeStatus: 'Y', discharge: 'honorable', deployments: [],           initials: 'TE', color: '#BE185D', recommended: false },
  { id: '006', firstName: 'Russell',   lastName: 'Freeman',   branch: 'Reserve',   activeStatus: 'N', discharge: 'honorable', deployments: [],           initials: 'RF', color: '#059669', recommended: false },
  { id: '008', firstName: 'Greg',      lastName: 'Anderson',  branch: 'Air Force', activeStatus: 'Y', discharge: 'honorable', deployments: ['AFG'],      initials: 'GA', color: '#475569', recommended: false },
  { id: '013', firstName: 'Kenneth',   lastName: 'Andrews',   branch: 'Air Force', activeStatus: 'Y', discharge: 'honorable', deployments: [],           initials: 'KA', color: '#C2410C', recommended: false },
  { id: '025', firstName: 'Wesley',    lastName: 'Ford',      branch: 'Air Force', activeStatus: 'N', discharge: 'honorable', deployments: ['QAT','AX1'],initials: 'WF', color: '#0369A1', recommended: true  },
  { id: '026', firstName: 'Melvin',    lastName: 'Freeman',   branch: 'Air Force', activeStatus: 'Y', discharge: 'honorable', deployments: ['KGZ'],      initials: 'MF', color: '#7C3AED', recommended: false },
  { id: '027', firstName: 'Herbert',   lastName: 'Gardner',   branch: 'Air Force', activeStatus: 'N', discharge: 'honorable', deployments: [],           initials: 'HG', color: '#0891B2', recommended: false },
  { id: '032', firstName: 'Jeffery',   lastName: 'Hayes',     branch: 'Air Force', activeStatus: 'N', discharge: 'unknown',   deployments: [],           initials: 'JH', color: '#D97706', recommended: false },
  { id: '037', firstName: 'Daryl',     lastName: 'Lawrence',  branch: 'Army',      activeStatus: 'Y', discharge: 'unknown',   deployments: [],           initials: 'DL', color: '#065F46', recommended: false },
  { id: '041', firstName: 'Christian', lastName: 'Patterson', branch: 'Air Force', activeStatus: 'Y', discharge: 'honorable', deployments: ['KGZ'],      initials: 'CP', color: '#1B3A5F', recommended: false },
  { id: '042', firstName: 'Jessie',    lastName: 'Price',     branch: 'Air Force', activeStatus: 'N', discharge: 'honorable', deployments: [],           initials: 'JP', color: '#64748B', recommended: false },
  { id: '046', firstName: 'Mattie',    lastName: 'Reid',      branch: 'Reserve',   activeStatus: 'N', discharge: 'honorable', deployments: [],           initials: 'MR', color: '#9D174D', recommended: false },
];

// hex → rgba helper for subtle tinted backgrounds
const hex8 = (hex, a) => `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`;
const hex20 = (hex) => hex8(hex, 0.08);

// ── Workflow Stepper (top progress bar) ───────────────────────────────────────
function WorkflowStepper({ steps, currentStep, stepStatuses }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center overflow-x-auto gap-0">
        {steps.map((step, idx) => {
          const status = stepStatuses[step.id] || 'pending';
          const isActive = step.id === currentStep;
          const isDone = status === 'success';
          const color = step.color;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: 72 }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all"
                  style={
                    isDone   ? { background: color, borderColor: 'transparent', color: '#fff' } :
                    isActive ? { background: '#fff', borderColor: color, boxShadow: `0 0 0 3px ${hex8(color, 0.25)}`, color } :
                               { background: '#f3f4f6', borderColor: '#e5e7eb', color: '#9ca3af' }
                  }
                >
                  {isDone
                    ? <CheckCircle className="h-4 w-4" />
                    : <span className="text-xs font-bold">{step.id}</span>}
                </div>
                <span
                  className="text-[9px] font-medium text-center leading-tight max-w-[68px]"
                  style={{ color: isActive ? '#111827' : isDone ? color : '#9ca3af' }}
                >{step.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mt-[-14px] mx-1 rounded transition-all" style={{ minWidth: 12, background: isDone ? color : '#f3f4f6' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Test Veteran Card ─────────────────────────────────────────────────────────
function VeteranUserCard({ user, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(user)}
      className={`rounded-xl border-2 p-3 transition-all cursor-pointer ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: user.avatarColor }}>
          {user.avatarInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {user.firstName}{user.middleName && user.middleName !== 'Null' ? ` ${user.middleName}` : ''} {user.lastName}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{user.city}, {user.state} · {user.gender === 'F' ? 'Female' : 'Male'}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {selected
            ? <CheckCircle className="h-5 w-5 text-blue-600" />
            : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            user.confirmed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {user.confirmed ? 'CONFIRMED' : 'NOT CONFIRMED'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Result display (visual, no raw JSON) ──────────────────────────────────────
function WorkflowResultDisplay({ apiKey, data, mode }) {
  if (!data) return null;
  const isLive = mode === 'live';
  const modeBadge = (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
      {isLive ? '● Live' : '○ Mock'}
    </span>
  );

  if (apiKey === 'veteran-confirmation') {
    const raw = data.data || data;
    const confirmed = raw?.veteran_status === 'confirmed';
    return (
      <div className={`rounded-xl border-2 p-5 ${confirmed ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {confirmed ? <UserCheck className="h-9 w-9 text-green-600" /> : <XCircle className="h-9 w-9 text-red-500" />}
            <div>
              <p className={`text-base font-bold ${confirmed ? 'text-green-700' : 'text-red-600'}`}>
                {confirmed ? 'VETERAN STATUS CONFIRMED' : 'STATUS NOT CONFIRMED'}
              </p>
              <p className="text-[11px] text-slate-400">VA Identity Verification · Sandbox Environment</p>
            </div>
          </div>
          {modeBadge}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white rounded-lg border p-2.5">
            <p className="text-slate-400 mb-0.5">Status</p>
            <p className={`font-bold text-sm ${confirmed ? 'text-green-700' : 'text-red-600'}`}>
              {confirmed ? 'Confirmed' : 'Not Confirmed'}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-2.5">
            <p className="text-slate-400 mb-0.5">Environment</p>
            <p className="font-medium text-slate-700">{data.environment || 'Sandbox'}</p>
          </div>
        </div>
        {confirmed && (
          <div className="mt-3 rounded-lg bg-green-100 border border-green-300 p-2.5 text-xs text-green-700 font-medium flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> Identity verified — proceeding to Service History
          </div>
        )}
      </div>
    );
  }

  if (apiKey === 'service-history') {
    const raw = data.data || {};
    const episodes = raw?.data?.[0]?.attributes?.serviceHistory || raw?.serviceHistory || [];
    return (
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            <p className="font-semibold text-gray-900">Service History</p>
          </div>
          {modeBadge}
        </div>
        {episodes.length > 0 ? episodes.slice(0, 3).map((ep, i) => (
          <div key={i} className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-800 text-sm">{ep.branchOfService || ep.branch_of_service || 'Branch'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">{ep.characterOfDischarge || ep.character_of_discharge || '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <CalendarDays className="h-3 w-3" />
              <span>{ep.beginDate || ep.begin_date || '—'} → {ep.endDate || ep.end_date || '—'}</span>
            </div>
          </div>
        )) : (
          <div className="rounded-lg bg-slate-50 border p-3 text-xs text-slate-500">
            Service history data received — details available in full record
          </div>
        )}
      </div>
    );
  }

  if (apiKey === 'benefits-claims') {
    const raw = data.data || {};
    const claims = raw?.data || [];
    return (
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            <p className="font-semibold text-gray-900">Benefits Claims</p>
            {claims.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{claims.length} claim{claims.length !== 1 ? 's' : ''}</span>}
          </div>
          {modeBadge}
        </div>
        {claims.length > 0 ? claims.slice(0, 3).map((c, i) => (
          <div key={i} className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs">
            <div className="flex justify-between gap-2">
              <span className="font-bold text-amber-800">{c.attributes?.claimType || 'Disability Claim'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${c.attributes?.status === 'COMPLETE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.attributes?.status || '—'}</span>
            </div>
            <p className="text-slate-500 mt-1">Filed: {c.attributes?.dateFiled || '—'}</p>
          </div>
        )) : (
          <div className="rounded-lg bg-slate-50 border p-3 text-xs text-slate-500">
            Benefits claims data received — no active claims found
          </div>
        )}
      </div>
    );
  }

  if (['appealable-issues', 'appeals-status', 'legacy-appeals'].includes(apiKey)) {
    const raw = data.data || {};
    const items = raw?.data || [];
    const label = apiKey === 'appealable-issues' ? 'Appealable Issues' : apiKey === 'legacy-appeals' ? 'Legacy Appeals' : 'Appeals Status';
    const stepDef = WORKFLOW_STEPS.find(s => s.api === apiKey);
    const color = stepDef?.color || '#C2410C';
    return (
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5" style={{ color }} />
            <p className="font-semibold text-gray-900">{label}</p>
            {items.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: hex20(color), color }}>{items.length} issue{items.length !== 1 ? 's' : ''}</span>}
          </div>
          {modeBadge}
        </div>
        {items.length > 0 ? items.slice(0, 3).map((item, i) => (
          <div key={i} className="rounded-lg border p-3 text-xs" style={{ borderColor: hex8(color, 0.2), background: hex20(color) }}>
            <p className="font-bold" style={{ color }}>{item.attributes?.description || item.attributes?.issue || item.attributes?.programArea || 'Issue details'}</p>
          </div>
        )) : (
          <div className="rounded-lg bg-slate-50 border p-3 text-xs text-slate-500">
            {label} data received — no items found
          </div>
        )}
      </div>
    );
  }

  if (apiKey === 'facilities') {
    const raw = data.data || {};
    const facilities = raw?.data || [];
    return (
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-teal-600" />
            <p className="font-semibold text-gray-900">VA Facilities</p>
            {facilities.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-medium">{facilities.length} location{facilities.length !== 1 ? 's' : ''}</span>}
          </div>
          {modeBadge}
        </div>
        {facilities.length > 0 ? facilities.slice(0, 3).map((f, i) => (
          <div key={i} className="rounded-lg border border-teal-100 bg-teal-50 p-3 text-xs">
            <p className="font-bold text-teal-800">{f.attributes?.name || f.name || 'VA Facility'}</p>
            <p className="text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {f.attributes?.address?.physical?.city || ''}{f.attributes?.address?.physical?.state ? `, ${f.attributes.address.physical.state}` : ''}
            </p>
          </div>
        )) : (
          <div className="rounded-lg bg-slate-50 border p-3 text-xs text-slate-500">
            Facilities data received — showing nearby VA locations
          </div>
        )}
      </div>
    );
  }

  // Generic (FHIR health, etc.) — visual, no JSON
  const raw = data.data || data;
  const entryCount = raw?.entry?.length || raw?.data?.length || 0;
  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <p className="font-semibold text-gray-900 capitalize">{apiKey.replace(/-/g, ' ')}</p>
          {entryCount > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium">{entryCount} record{entryCount !== 1 ? 's' : ''}</span>}
        </div>
        {modeBadge}
      </div>
      <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700 font-medium flex items-center gap-1.5">
        <CheckCircle className="h-3.5 w-3.5" /> Data retrieved successfully from VA
      </div>
    </div>
  );
}

// ── Service History test user picker ──────────────────────────────────────────
function ServiceHistoryUserPicker({ onSignIn }) {
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState('');

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 1800);
    });
  };

  const user = selected ? SERVICE_HISTORY_TEST_USERS.find(u => u.id === selected) : null;
  const email = user ? `va.api.user+${user.id}-2024@gmail.com` : '';
  const password = 'SandboxPassword2024!';

  return (
    <div className="bg-white rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm text-gray-800">Select a VA sandbox test veteran</p>
        <span className="text-[10px] text-slate-400">12 test users · ID.me login</span>
      </div>

      {/* User grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SERVICE_HISTORY_TEST_USERS.map(u => (
          <button
            key={u.id}
            onClick={() => setSelected(u.id)}
            className="flex items-center gap-2 p-2 rounded-lg border text-left transition-all hover:border-blue-300"
            style={selected === u.id
              ? { borderColor: u.color, background: `${u.color}12` }
              : { borderColor: '#e5e7eb', background: '#fff' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: u.color }}>
              {u.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{u.firstName} {u.lastName}</p>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] text-slate-500">{u.branch}</span>
                {u.recommended && <span className="text-[8px] px-1 rounded bg-green-100 text-green-700 font-medium">Best</span>}
                {u.deployments.length > 0 && (
                  <span className="text-[8px] px-1 rounded bg-orange-100 text-orange-700 font-medium">
                    {u.deployments.join(' · ')}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Credentials panel */}
      {user && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
          <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">ID.me credentials for {user.firstName} {user.lastName}</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 bg-white rounded border px-2 py-1.5">
              <span className="text-[10px] text-slate-400 w-14 shrink-0">Email</span>
              <span className="text-xs text-slate-700 flex-1 font-mono truncate">{email}</span>
              <button onClick={() => copy(email, 'email')} className="text-[10px] text-blue-600 hover:underline shrink-0">
                {copied === 'email' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white rounded border px-2 py-1.5">
              <span className="text-[10px] text-slate-400 w-14 shrink-0">Password</span>
              <span className="text-xs text-slate-700 flex-1 font-mono">{password}</span>
              <button onClick={() => copy(password, 'pass')} className="text-[10px] text-blue-600 hover:underline shrink-0">
                {copied === 'pass' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <p className="text-[9px] text-blue-600">On the VA login page: click ID.me → enter these credentials → click Continue</p>
        </div>
      )}

      <button
        onClick={onSignIn}
        disabled={!user}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: APP_NAVY }}
      >
        <LogIn className="h-4 w-4" /> Sign in with VA {user ? `as ${user.firstName} ${user.lastName}` : '— select a user first'} <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── OAuth / step panel (no technical details) ─────────────────────────────────
function WorkflowStepPanel({ step, result, status, onRun, userId }) {
  const [oauthWaiting, setOauthWaiting] = useState(false);
  const color = step.color;
  const isOAuth = step.authType === 'oauth';

  // Listen for the popup to post VA_OAUTH_SUCCESS after token exchange completes
  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === 'VA_OAUTH_SUCCESS') {
        setOauthWaiting(false);
        onRun();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onRun]);

  const openOAuthPopup = () => {
    const backendBase = process.env.NODE_ENV === 'production'
      ? (process.env.REACT_APP_API_URL_PROD || process.env.REACT_APP_API_URL || '')
      : (process.env.REACT_APP_API_URL || '');
    const url = `${backendBase}/api/va/oauth/authorize?userId=${userId}&api=${step.api}`;
    window.open(url, 'va_oauth', 'width=600,height=700,left=200,top=100');
    setOauthWaiting(true);
  };

  const handleCompletedSignIn = () => {
    setOauthWaiting(false);
    onRun();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 p-4" style={{ borderColor: hex8(color, 0.3), background: hex20(color) }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: color }}>
            <span className="font-bold text-sm">{step.id}</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{step.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
          </div>
          {isOAuth && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-blue-50 text-blue-600 border-blue-200 shrink-0">
              Requires VA Sign-in
            </span>
          )}
        </div>
      </div>

      {status === 'auth-required' && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 space-y-4">
          {!oauthWaiting ? (
            <>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <LogIn className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">VA Authentication Required</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This step requires you to sign in through the VA to authorize access.
                  </p>
                </div>
              </div>
              {step.api === 'service-history'
                ? <ServiceHistoryUserPicker onSignIn={openOAuthPopup} />
                : (
                  <button
                    onClick={openOAuthPopup}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 shadow-sm"
                    style={{ background: APP_NAVY }}
                  >
                    <LogIn className="h-4 w-4" /> Sign in with VA <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Waiting for VA Authentication...</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Complete the sign-in process in the popup window, then click the button below.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCompletedSignIn}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 shadow-sm"
                style={{ background: '#059669' }}
              >
                <CheckCircle className="h-4 w-4" /> I've Completed Sign-in
              </button>
              <button
                onClick={openOAuthPopup}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-slate-500 text-xs hover:bg-slate-50"
              >
                <ExternalLink className="h-3 w-3" /> Re-open sign-in window
              </button>
            </>
          )}
        </div>
      )}

      {status === 'idle' && (
        step.api === 'service-history'
          ? <ServiceHistoryUserPicker onSignIn={openOAuthPopup} />
          : (
            <button onClick={onRun} className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-sm" style={{ background: APP_NAVY }}>
              <Play className="h-4 w-4" /> {step.title} <ChevronRight className="h-4 w-4" />
            </button>
          )
      )}

      {status === 'loading' && (
        <div className="rounded-xl border bg-white p-6 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700 font-medium">Retrieving {step.title.toLowerCase()} from VA...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-red-700">Unable to retrieve data</p>
          <p className="text-xs text-red-600">{result?.message || 'Request failed. Please try again.'}</p>
          <button onClick={onRun} className="text-xs text-slate-500 underline flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Try again</button>
        </div>
      )}

      {status === 'success' && result && <WorkflowResultDisplay apiKey={step.api} data={result} mode={result.mode} />}
    </div>
  );
}

// ── Step 1 — Veteran Verification with test user selection ────────────────────
function VeteranVerificationPanel({ result, status, selectedUser, onSelectUser, onRun }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 p-4" style={{ borderColor: hex8('#1B3A5F', 0.3), background: hex20('#1B3A5F') }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: '#1B3A5F' }}>
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">Veteran Verification</p>
            <p className="text-xs text-slate-500 mt-0.5">Select a VA sandbox test veteran to verify their status</p>
          </div>
        </div>
      </div>

      {(status === 'idle' || status === 'error') && (
        <div className="bg-white rounded-xl border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-gray-800">VA Sandbox Test Veterans</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> Confirmed (8)</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span> Not Confirmed (2)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VA_TEST_USERS.map(user => (
              <VeteranUserCard key={user.id} user={user} selected={selectedUser?.id === user.id} onSelect={onSelectUser} />
            ))}
          </div>
          {status === 'error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{result?.message || 'Verification failed.'}</div>
          )}
          {selectedUser && (
            <button onClick={onRun} className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-sm" style={{ background: APP_NAVY }}>
              <Play className="h-4 w-4" /> Verify {selectedUser.firstName} {selectedUser.lastName} <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {status === 'loading' && (
        <div className="rounded-xl border bg-white p-6 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700 font-medium">Verifying veteran identity with VA...</span>
        </div>
      )}

      {status === 'success' && result && (
        <div className="space-y-3">
          <WorkflowResultDisplay apiKey="veteran-confirmation" data={result} mode={result.mode} />
          <div className="flex items-center justify-between bg-slate-50 border rounded-lg px-4 py-2.5 text-xs text-slate-500">
            <span>Tested: <strong className="text-slate-700">{selectedUser?.firstName} {selectedUser?.lastName}</strong></span>
            <button onClick={() => onSelectUser(null)} className="text-blue-600 hover:underline">Try another</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Workflow Demo container ───────────────────────────────────────────────
function VAWorkflowDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stepStatuses, setStepStatuses] = useState({});
  const [stepResults, setStepResults] = useState({});
  const userId = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').id || 'demo'; } catch { return 'demo'; } })();

  const setStep = (id, status, result = null) => {
    setStepStatuses(prev => ({ ...prev, [id]: status }));
    if (result !== null) setStepResults(prev => ({ ...prev, [id]: result }));
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (stepStatuses[1] === 'success') {
      setStep(1, 'idle');
      setStepResults(prev => ({ ...prev, 1: null }));
    }
  };

  const runStep1 = async () => {
    if (!selectedUser) return;
    setStep(1, 'loading');
    try {
      const params = new URLSearchParams();
      const fields = ['firstName', 'middleName', 'lastName', 'birthDate', 'gender',
                      'streetAddressLine1', 'city', 'state', 'zipCode', 'country'];
      fields.forEach(f => { if (selectedUser[f] && selectedUser[f] !== 'Null') params.set(f, selectedUser[f]); });
      const res = await api.get(`/va/veteran-confirmation?${params}`);
      setStep(1, 'success', res.data);
      const raw = res.data?.data || res.data;
      if (raw?.veteran_status === 'confirmed') setTimeout(() => setCurrentStep(2), 1600);
    } catch (err) {
      setStep(1, 'error', { message: err.response?.data?.message || err.message || 'Verification failed' });
    }
  };

  const runStep = async (step) => {
    setStep(step.id, 'loading');
    try {
      const res = step.method === 'POST' ? await api.post(step.path, {}) : await api.get(step.path);
      setStep(step.id, 'success', res.data);
      if (step.id < WORKFLOW_STEPS.length) setTimeout(() => setCurrentStep(step.id + 1), 1800);
    } catch (err) {
      const httpStatus = err.response?.status;
      if (httpStatus === 401 || httpStatus === 403) {
        setStep(step.id, 'auth-required', { message: 'VA OAuth token required' });
      } else {
        setStep(step.id, 'error', { message: err.response?.data?.message || err.message || 'Request failed' });
      }
    }
  };

  const resetWorkflow = () => { setCurrentStep(1); setSelectedUser(null); setStepStatuses({}); setStepResults({}); };

  const activeStep = WORKFLOW_STEPS.find(s => s.id === currentStep);
  const allDone = WORKFLOW_STEPS.every(s => stepStatuses[s.id] === 'success');
  const completedSteps = WORKFLOW_STEPS.filter(s => stepStatuses[s.id] === 'success' && s.id !== currentStep);

  return (
    <div className="space-y-5">
      <WorkflowStepper steps={WORKFLOW_STEPS} currentStep={currentStep} stepStatuses={stepStatuses} />

      {allDone && (
        <div className="rounded-xl border-2 border-green-400 bg-green-50 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-white" /></div>
            <div>
              <p className="font-bold text-green-800 text-lg">Full Workflow Complete</p>
              <p className="text-sm text-green-700">All 7 VA API integrations executed successfully.</p>
            </div>
          </div>
          <button onClick={resetWorkflow} className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-green-400 text-green-700 text-sm font-medium hover:bg-green-100">
            <RefreshCw className="h-4 w-4" /> Reset
          </button>
        </div>
      )}

      {completedSteps.length > 0 && (
        <div className="space-y-2">
          {completedSteps.map(s => {
            const color = s.color;
            return (
              <div key={s.id} className="rounded-xl border px-4 py-2.5 flex items-center justify-between" style={{ borderColor: hex8(color, 0.25), background: hex20(color) }}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" style={{ color }} />
                  <span className="text-sm font-medium" style={{ color }}>Step {s.id}: {s.title}</span>
                </div>
                <button onClick={() => setCurrentStep(s.id)} className="text-xs hover:underline flex items-center gap-1" style={{ color }}>
                  View result <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeStep && !allDone && (
        <div>
          {activeStep.id === 1
            ? <VeteranVerificationPanel
                result={stepResults[1]}
                status={stepStatuses[1] || 'idle'}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
                onRun={runStep1}
              />
            : <WorkflowStepPanel step={activeStep} result={stepResults[activeStep.id]} status={stepStatuses[activeStep.id] || 'idle'} onRun={() => runStep(activeStep)} userId={userId} />
          }
          <div className="flex items-center justify-between mt-4 pt-4 pb-24 border-t border-slate-100">
            <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-xs text-slate-400">Step {currentStep} of {WORKFLOW_STEPS.length}</span>
            <button onClick={() => setCurrentStep(Math.min(WORKFLOW_STEPS.length, currentStep + 1))} disabled={currentStep === WORKFLOW_STEPS.length}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed">
              Skip <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Maps scenario ID → backend proxy path for live testing
const LIVE_TEST_CONFIG = {
  1: null, // ID.me identity — no direct VA API endpoint
  2:  { path: '/va/service-history',               method: 'GET',  apiName: 'service-history',            authType: 'oauth' },
  3:  { path: '/va/patient-health',                method: 'GET',  apiName: 'patient-health',             authType: 'oauth' },
  4:  { path: '/va/benefits-reference/disabilities',method: 'GET', apiName: 'benefits-reference',         authType: 'api-key' },
  5:  { path: '/va/benefits-claims',               method: 'GET',  apiName: 'benefits-claims',            authType: 'oauth' },
  6:  { path: '/va/benefits-intake',               method: 'POST', apiName: 'benefits-intake',            authType: 'api-key',
        body: { fileNumber: '123456789', zipCode: '20420', source: 'EarnedIT', docType: '21-526EZ', businessLine: 'compensation' } },
  7:  { path: '/va/appealable-issues',             method: 'GET',  apiName: 'appealable-issues',          authType: 'oauth' },
  8:  { path: '/va/appeals-status',                method: 'GET',  apiName: 'appeals-status',             authType: 'oauth' },
  9:  { path: '/va/legacy-appeals',                method: 'GET',  apiName: 'legacy-appeals',             authType: 'oauth' },
  10: { path: '/va/community-care-eligibility',    method: 'GET',  apiName: 'community-care-eligibility', authType: 'oauth' },
  11: { path: '/va/facilities',                    method: 'GET',  apiName: 'facilities',                 authType: 'api-key' },
  12: { path: '/va/forms',                         method: 'GET',  apiName: 'forms',                      authType: 'api-key' },
  13: { path: '/va/status',                        method: 'GET',  apiName: 'status',                     authType: 'none' },
};

// ── Reusable OAuth flow panel (same as Scenario 2) ───────────────────────────
function OAuthFlowPanel({ steps, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let delay = 300;
    steps.forEach((step, idx) => {
      delay += step.ms;
      setTimeout(() => {
        setCurrentStep(idx + 1);
        if (idx === steps.length - 1) {
          setTimeout(() => { setDone(true); onComplete(); }, 400);
        }
      }, delay);
    });
  }, []); // eslint-disable-line

  return (
    <div className="space-y-2">
      {steps.map((step, idx) => {
        const StepIcon = step.icon;
        const isActive  = currentStep === idx + 1;
        const isDone    = currentStep > idx + 1 || done;
        return (
          <div
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
              isDone   ? 'bg-green-50 border-green-200' :
              isActive ? 'bg-blue-50 border-blue-300'   :
              'bg-gray-50 border-gray-100 opacity-40'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDone ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {isDone   ? <CheckCircle className="h-4 w-4 text-green-600" /> :
               isActive ? <Loader2 className="h-4 w-4 text-blue-600 animate-spin" /> :
                          <StepIcon className="h-4 w-4 text-gray-400" />}
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

// ── Visual API Response Card ──────────────────────────────────────────────────
function ApiResponseCard({ method = 'GET', path, responseTime, statusCode = '200 OK', children }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${method === 'POST' ? 'bg-blue-500' : 'bg-emerald-600'}`}>{method}</span>
        <code className="text-[11px] text-slate-200 flex-1 truncate">{path}</code>
      </div>
      <div className="flex items-center gap-3 px-3 py-1.5 border-b bg-slate-50 text-[11px]">
        <span className="text-green-700 font-bold bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">{statusCode}</span>
        <span className="text-slate-400 font-mono">{responseTime}</span>
        <span className="ml-auto text-slate-400">sandbox-api.va.gov</span>
      </div>
      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
}

function ResponseRow({ label, value, valueColor = 'text-gray-800', mono = false }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0 text-xs">
      <span className="text-gray-400 font-mono">{label}</span>
      <span className={`font-semibold ${valueColor} ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</span>
    </div>
  );
}

// ── Generic scenario layout (matches Scenario 2 exactly) ─────────────────────
function ScenarioLayout({ scenario }) {
  const [phase, setPhase] = useState('idle');
  const navigate = useNavigate();

  const handleConnect = () => {
    if (phase !== 'idle') return;
    setPhase('connecting');
  };

  const { icon: Icon, accentColor, accentBg, accentBorder } = scenario;
  const liveTestConfig = LIVE_TEST_CONFIG[scenario.id] ?? null;

  return (
    <div className="space-y-6">
      {/* Dedicated page link */}
      {scenario.dedicatedPage && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-700">This scenario has a full interactive demo page with live data.</p>
          </div>
          <button
            onClick={() => navigate(scenario.dedicatedPage)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg flex-shrink-0 ml-3 hover:opacity-90 transition-opacity"
            style={{ background: '#1B3A5F' }}
          >
            {scenario.dedicatedPageLabel} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Scenario Banner */}
      <div
        className="rounded-xl p-4 border-2 text-white"
        style={{ background: `linear-gradient(135deg, ${APP_NAVY} 0%, #2a5298 100%)`, borderColor: APP_NAVY }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">Scenario {scenario.id} — {scenario.title}</p>
            <p className="text-white/80 text-sm mt-0.5">
              VA API: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">{scenario.api}</code>
              &nbsp;·&nbsp;Auth: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">{scenario.auth}</code>
              {scenario.scope && <>&nbsp;·&nbsp;Scope: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">{scenario.scope}</code></>}
            </p>
            <p className="text-white/70 text-xs mt-2">{scenario.tagline}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — OAuth flow + API call */}
        <div className="space-y-4">

          {/* idle */}
          {phase === 'idle' && (
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" style={{ color: APP_NAVY }} />
                <h3 className="font-semibold text-gray-900">{scenario.authTitle}</h3>
              </div>
              <p className="text-sm text-gray-600">{scenario.authDescription}</p>
              <div className={`${accentBg} ${accentBorder} border rounded-lg p-3 text-xs space-y-1`} style={{ color: accentColor }}>
                <p><strong>Endpoint:</strong> {scenario.method || 'GET'} {scenario.endpoint}</p>
                <p><strong>Auth standard:</strong> {scenario.auth}</p>
                {scenario.scope && <p><strong>Scope:</strong> {scenario.scope}</p>}
                <p><strong>Data returned:</strong> {scenario.dataReturned}</p>
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

          {/* connecting */}
          {phase === 'connecting' && (
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <h3 className="font-semibold text-gray-900">Connecting to VA Lighthouse...</h3>
              </div>
              <OAuthFlowPanel steps={scenario.oauthSteps} onComplete={() => setPhase('connected')} />
            </div>
          )}

          {/* connected */}
          {phase === 'connected' && (
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">VA API Connected</h3>
                <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  Live Data
                </span>
              </div>
              <scenario.ApiCallPanel />
              <button
                onClick={() => setPhase('idle')}
                className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset Demo
              </button>
            </div>
          )}

          {/* AI / EarnedIT Insights */}
          <div className="bg-white rounded-xl border p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" style={{ color: APP_RED }} />
              <h3 className="font-semibold text-gray-900">EarnedIT AI Engine</h3>
              <span className="ml-auto text-xs text-gray-400">what we do with this data</span>
            </div>
            <p className="text-xs text-gray-500">{scenario.aiSummary}</p>
            <div className="space-y-2">
              {scenario.insights.map((insight, idx) => {
                const InsightIcon = insight.icon;
                return (
                  <div key={idx} className={`rounded-lg border p-3 ${insight.bg}`}>
                    <div className="flex items-start gap-2">
                      <InsightIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${insight.color}`} />
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

        {/* Right — Data card */}
        <div>
          <scenario.DataCard />
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
          {scenario.talkingPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-green-600" />
              <p>{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live API Test — real backend call */}
      {liveTestConfig && <LiveTestPanel liveTest={liveTestConfig} />}
    </div>
  );
}

// ── Live API Test Panel ───────────────────────────────────────────────────────
function LiveTestPanel({ liveTest }) {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ms, setMs] = useState(null);

  const userId = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').id || 'demo'; } catch { return 'demo'; } })();

  const run = async () => {
    setStatus('loading');
    setResult(null);
    setError(null);
    const start = Date.now();
    try {
      const res = liveTest.method === 'POST'
        ? await api.post(liveTest.path, liveTest.body ?? {})
        : await api.get(liveTest.path);
      setMs(Date.now() - start);
      setResult(res.data);
      setStatus('success');
    } catch (err) {
      setMs(Date.now() - start);
      const httpStatus = err.response?.status;
      if (httpStatus === 401 || httpStatus === 403) {
        setStatus('unauthorized');
      } else {
        setError(err.response?.data?.message || err.message || 'Request failed');
        setStatus('error');
      }
    }
  };

  const authLabel = liveTest.authType === 'api-key' ? 'API Key' : liveTest.authType === 'oauth' ? 'OAuth2 CCG' : 'Public';
  const authColor = liveTest.authType === 'api-key' ? 'bg-amber-100 text-amber-700' : liveTest.authType === 'oauth' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600';

  return (
    <div className="rounded-xl border bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-emerald-600" />
        <h3 className="font-semibold text-gray-900">Live API Test</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${authColor}`}>{authLabel}</span>
        {result?.mode && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${result.mode === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {result.mode === 'live' ? '● Live' : '○ Mock'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-50 border rounded-lg px-3 py-2">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${liveTest.method === 'POST' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
          {liveTest.method}
        </span>
        <span className="flex-1 truncate">{liveTest.path}</span>
        {ms !== null && <span className="text-slate-400 shrink-0">{ms}ms</span>}
      </div>

      {status === 'idle' && (
        <button
          onClick={run}
          className="w-full py-3 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: APP_NAVY }}
        >
          <Play className="h-4 w-4" /> Run Live Test
        </button>
      )}

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Calling VA Lighthouse sandbox...
        </div>
      )}

      {status === 'unauthorized' && (
        <div className="space-y-3">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 space-y-1.5">
            <p className="font-semibold">VA OAuth Authorization Required</p>
            <p>This API requires a VA OAuth token. Click below to authenticate via the VA sandbox login page.</p>
            <p className="text-amber-600 text-[11px] bg-amber-100 rounded p-2 font-mono leading-relaxed">
              After VA redirects → copy URL → replace <strong>earnedit.com/auth/callback</strong> with <strong>localhost:4000/api/va/oauth/callback</strong> → paste in browser
            </p>
          </div>
          <a
            href={`http://localhost:4000/api/va/oauth/authorize?userId=${userId}&api=${liveTest.apiName}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-sm text-white hover:opacity-90 transition-opacity"
            style={{ background: APP_NAVY }}
          >
            <Lock className="h-4 w-4" /> Connect with VA Sandbox <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={run}
            className="w-full py-2 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 flex items-center justify-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Retry After Auth
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-3">
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-mono break-all">{error}</div>
          <button
            onClick={() => setStatus('idle')}
            className="w-full py-2 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 flex items-center justify-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Reset
          </button>
        </div>
      )}

      {status === 'success' && result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700 font-medium">Response received</span>
            {ms !== null && <span className="text-slate-400 ml-auto">{ms}ms</span>}
          </div>
          <pre className="bg-slate-900 text-emerald-400 text-[10px] font-mono rounded-lg p-3 overflow-x-auto max-h-72 overflow-y-auto whitespace-pre-wrap break-all">
            {JSON.stringify(result, null, 2)}
          </pre>
          <button
            onClick={() => setStatus('idle')}
            className="w-full py-2 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 flex items-center justify-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Run Again
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIO DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const SCENARIOS = [

  // ── Scenario 1: ID.me Identity Verification ───────────────────────────────
  {
    id: 1, title: 'Identity Verification', icon: Key,
    api: 'ID.me OAuth2 / IAL2', auth: 'OAuth2 PKCE',
    scope: 'openid profile email',
    endpoint: '/auth/oauth/v2/authorization?client_id=...&response_type=code',
    method: 'GET',
    tagline: 'Veteran verifies identity once via ID.me → IAL2 token → unlocks all 13 VA API calls',
    authTitle: 'ID.me Identity Verification (IAL2)',
    authDescription: 'Before EarnedIT can call any VA API on behalf of a veteran, the veteran must verify their identity at IAL2 (LOA2) level via ID.me. This is a one-time step — the VA requires this for all sensitive data access.',
    dataReturned: 'ICN, IAL level, SSN verified (not stored), DOB verified, OAuth2 access token',
    accentColor: '#1d4ed8', accentBg: 'bg-blue-50', accentBorder: 'border-blue-200',
    oauthSteps: [
      { icon: Key,         label: 'Redirecting to ID.me authorization endpoint',          ms: 500  },
      { icon: Shield,      label: 'Veteran verifies identity (ID scan + selfie match)',    ms: 1200 },
      { icon: CheckCircle, label: 'IAL2 identity confirmed — authorization code issued',   ms: 600  },
      { icon: Lock,        label: 'EarnedIT exchanges code for access token (PKCE)',       ms: 800  },
      { icon: Database,    label: 'VA ICN resolved — veteran profile linked',              ms: 500  },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/auth/oauth/v2/authorization?client_id=earnedit&response_type=code" responseTime="302 Redirect → 200 OK · ~320ms">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mb-2 text-xs text-blue-700 font-medium">ID.me OAuth2 PKCE Callback</div>
        <ResponseRow label="access_token" value="••••••••••••••••  (scoped)" valueColor="text-amber-700" mono />
        <ResponseRow label="identity_assurance_level" value="IAL2 / LOA2" valueColor="text-blue-700" />
        <ResponseRow label="icn" value="1013127591V428144" valueColor="text-blue-800" mono />
        <ResponseRow label="verified" value="✓ true" valueColor="text-green-700" />
        <ResponseRow label="ssn_verified" value="✓ true (not stored)" valueColor="text-green-700" />
        <ResponseRow label="dob_verified" value="✓ true (not stored)" valueColor="text-green-700" />
        <ResponseRow label="photo_id_type" value="drivers_license" valueColor="text-gray-700" />
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Identity Verified — IAL2</h3>
          <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">LOA2 ✓</span>
        </div>
        {[
          { label: 'ICN',             value: '1013127591V428144',    color: 'text-blue-700'  },
          { label: 'Identity Level',  value: 'IAL2 / LOA2',          color: 'text-green-700' },
          { label: 'SSN',             value: 'Verified (not stored)', color: 'text-green-700' },
          { label: 'Date of Birth',   value: 'Verified (not stored)', color: 'text-green-700' },
          { label: 'Photo ID',        value: "Driver's license scan", color: 'text-gray-700'  },
          { label: 'Biometric',       value: 'Selfie match confirmed', color: 'text-gray-700' },
        ].map((row, i) => (
          <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-500">{row.label}</span>
            <span className={`font-medium ${row.color}`}>{row.value}</span>
          </div>
        ))}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <p className="font-semibold">Token unlocks all 13 VA API calls</p>
          <p className="mt-1">This one-time verification gives EarnedIT a VA-compliant token that authorizes FHIR, Benefits, Appeals, Community Care, and all other APIs.</p>
        </div>
      </div>
    ),
    aiSummary: "Once IAL2 is verified, EarnedIT's AI can access all 13 VA APIs without asking the veteran to log in again. Identity is the gateway to every downstream benefit.",
    insights: [
      { icon: CheckCircle,   color: 'text-green-700', bg: 'bg-green-50 border-green-200',  title: 'One-time setup, lifetime access',         detail: "Veterans verify identity once. EarnedIT stores the ICN and uses refresh tokens — veterans never need to re-verify unless they revoke access." },
      { icon: Shield,        color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200',    title: 'IAL2 = highest federal trust level',      detail: "NIST 800-63-3 IAL2 means identity verified with government photo ID + biometric. VA requires this for all health and benefits data access." },
      { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200',  title: '23% of veterans fail old DS Logon',       detail: "ID.me's guided flow has 3x higher completion rate vs DS Logon. EarnedIT uses ID.me by default — same system as VA.gov." },
    ],
    talkingPoints: [
      "ID.me is the VA's official identity partner — EarnedIT uses the same flow as VA.gov itself.",
      "IAL2 means the veteran's photo ID and selfie have been verified — federally required before accessing sensitive VA data.",
      "Once verified, the veteran never re-verifies for EarnedIT — we use OAuth2 refresh tokens with a 30-day sliding window.",
      "EarnedIT does not store SSN or biometric data — only the VA ICN needed to call APIs.",
      "ID.me completion rate: 78% vs 55% for DS Logon — higher conversion means more veterans get access.",
      "The veteran's identity token is scoped, time-limited, and revocable from VA.gov at any time.",
    ],
  },

  // ── Scenario 2: Service History ────────────────────────────────────────────
  {
    id: 2, title: 'Service History', icon: Shield,
    api: 'veteran_service_history/v1', auth: 'OAuth2 CCG',
    scope: 'service_history.read',
    endpoint: '/services/veteran_service_history/v1/service-history',
    method: 'GET',
    tagline: 'Service dates → eligibility windows · Deployments → in-service events · MOS → AI condition identification',
    authTitle: 'VA Service History Authorization',
    authDescription: "EarnedIT pulls the veteran's complete service history directly from VA records — branch, active duty dates, deployments, discharge character, and MOS. No manual data entry required.",
    dataReturned: 'Service periods, deployments, character of discharge, MOS/AFSC, combined disability rating',
    accentColor: '#1d4ed8', accentBg: 'bg-blue-50', accentBorder: 'border-blue-200',
    dedicatedPage: '/service-history', dedicatedPageLabel: 'Full Service History Demo',
    oauthSteps: [
      { icon: Lock,        label: 'Generating client credentials (CCG)',                                     ms: 600  },
      { icon: Shield,      label: 'Requesting access token (scope: service_history.read)',                    ms: 900  },
      { icon: CheckCircle, label: 'Token validated by VA Identity Service',                                   ms: 700  },
      { icon: Wifi,        label: 'Calling GET /services/veteran_service_history/v1/service-history',        ms: 1100 },
      { icon: Database,    label: 'Response received & normalized',                                           ms: 500  },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/services/veteran_service_history/v1/service-history" responseTime="200 OK · ~312ms">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mb-2 text-xs text-blue-700 font-medium">service_history_episodes · OAuth2 CCG · scope: service_history.read</div>
        <ResponseRow label="branch_of_service" value="U.S. Army" valueColor="text-gray-900" />
        <ResponseRow label="begin_date / end_date" value="2003-04-01 → 2007-10-15" valueColor="text-gray-800" />
        <ResponseRow label="character_of_discharge" value="Honorable ✓" valueColor="text-green-700" />
        <ResponseRow label="deployments[0].location" value="IQ (Iraq) — Jun 2004" valueColor="text-red-700" />
        <ResponseRow label="disability_rating" value="70% Combined" valueColor="text-blue-700" />
        <ResponseRow label="icn" value="1013127591V428144" valueColor="text-blue-800" mono />
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Service Record</h3>
          <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Honorable ✓</span>
        </div>
        {[
          { label: 'Branch',           value: 'U.S. Army',                    color: 'text-gray-900'  },
          { label: 'Service Period',   value: 'Apr 2003 – Oct 2007',          color: 'text-gray-900'  },
          { label: 'MOS',              value: '11B Infantryman',               color: 'text-gray-900'  },
          { label: 'Discharge',        value: 'Honorable',                     color: 'text-green-700' },
          { label: 'Deployment',       value: 'Iraq (OIF) Jun 2004–Dec 2005',  color: 'text-red-700'   },
          { label: 'Disability Rating',value: '70% Combined',                  color: 'text-blue-700'  },
        ].map((row, i) => (
          <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-500">{row.label}</span>
            <span className={`font-medium ${row.color}`}>{row.value}</span>
          </div>
        ))}
      </div>
    ),
    aiSummary: "Service history unlocks everything — deployment locations trigger burn pit screening, MOS triggers musculoskeletal flags, and honorable discharge confirms eligibility instantly without manual verification.",
    insights: [
      { icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50 border-red-200',    title: 'OIF deployment → PTSD/TBI/Tinnitus flags',  detail: 'Baghdad 2004–05 + IED exposure → AI flags DC 9411 (PTSD), TBI, and DC 6260 (Tinnitus) as high-probability conditions.' },
      { icon: MapPin,        color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: 'Iraq burn pit → PACT Act screening',          detail: 'Iraq deployment triggers automatic screening for constrictive bronchiolitis, sleep apnea, and respiratory conditions.' },
      { icon: CheckCircle,   color: 'text-green-700', bg: 'bg-green-50 border-green-200', title: 'Honorable discharge confirmed instantly',      detail: 'Eligibility verified in the API response — no phone calls, no manual verification, no eligibility guesswork.' },
    ],
    talkingPoints: [
      "Service history eliminates manual data entry — veterans don't need to remember exact dates or deployment locations.",
      "OIF deployment (2004–2006) automatically flags tinnitus, TBI, and respiratory issues from burn pit exposure.",
      "MOS 11B Infantryman triggers musculoskeletal analysis — heavy load-bearing → lumbar strain, knee, shoulder conditions.",
      "Honorable discharge confirmed instantly in the API response — no manual verification step.",
      "Current 70% combined rating shown upfront — veterans see their baseline and what new conditions would raise it.",
      "OAuth2 CCG — no password sharing. VA token is scoped to read-only service history.",
    ],
  },

  // ── Scenario 3: Health Records (FHIR R4) ──────────────────────────────────
  {
    id: 3, title: 'Health Records Import', icon: Heart,
    dedicatedPage: '/health-records', dedicatedPageLabel: 'Full Health Records Demo',
    api: 'VA FHIR R4 API', auth: 'OAuth2 CCG',
    scope: 'patient/Condition.read patient/MedicationRequest.read',
    endpoint: '/fhir/R4/Patient/1013127591V428144/Condition',
    method: 'GET',
    tagline: 'Verified diagnoses from VA health records → auto-mapped to DC codes → pre-filled on 21-526EZ',
    authTitle: 'VA FHIR R4 Authorization',
    authDescription: 'EarnedIT pulls the veteran\'s confirmed VA diagnoses in HL7 FHIR R4 format — the same standard used by Epic, Cerner, and every major hospital system. Conditions come with SNOMED codes, onset dates, and treating-provider notes.',
    dataReturned: 'Confirmed diagnoses, SNOMED codes, onset dates, service notes, active medications',
    accentColor: '#be123c', accentBg: 'bg-rose-50', accentBorder: 'border-rose-200',
    oauthSteps: [
      { icon: Lock,        label: 'Generating client assertion JWT (RS256)',                    ms: 600 },
      { icon: Shield,      label: 'Requesting access token (scope: patient/Condition.read)',    ms: 900 },
      { icon: CheckCircle, label: 'Token validated by VA Identity Service',                     ms: 700 },
      { icon: Wifi,        label: 'Calling GET /fhir/R4/Patient/1013127591V428144/Condition',  ms: 1100 },
      { icon: Database,    label: 'FHIR Bundle received & normalized',                          ms: 500 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/fhir/R4/Patient/1013127591V428144/Condition" responseTime="200 OK · ~247ms">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-rose-700 font-medium bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">Bundle · searchset · total: 3</span>
          <span className="text-xs text-gray-400">scope: patient/Condition.read</span>
        </div>
        {[
          { dc: 'DC 9411', name: 'PTSD', rating: '50%', date: '2008-01-15' },
          { dc: 'DC 6260', name: 'Bilateral Tinnitus', rating: '10%', date: '2008-01-15' },
          { dc: 'DC 5237', name: 'Lumbar Strain w/ DDD', rating: '10%', date: '2008-03-20' },
        ].map((c, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-rose-100 bg-rose-50">
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded flex-shrink-0">{c.dc}</span>
            <span className="text-xs font-medium text-gray-800 flex-1">{c.name}</span>
            <span className="text-xs font-bold text-white bg-rose-600 px-2 py-0.5 rounded-full">{c.rating}</span>
            <span className="text-[10px] text-gray-400">{c.date}</span>
          </div>
        ))}
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-rose-600" />
          <h3 className="font-semibold text-gray-900">FHIR R4 Conditions — Aliza Ali</h3>
          <span className="ml-auto text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">ICN: 1013127591V428144</span>
        </div>
        {[
          { code: 'DC 9411', name: 'Post-Traumatic Stress Disorder', rating: '50%', date: '2008-01-15', snomed: '47505003', note: 'OIF combat stressor — Baghdad 2004–05' },
          { code: 'DC 6260', name: 'Bilateral Tinnitus',              rating: '10%', date: '2008-01-15', snomed: '60862001', note: 'Acoustic trauma — IED blast & weapons fire' },
          { code: 'DC 5237', name: 'Lumbar Strain with DDD',          rating: '10%', date: '2008-03-20', snomed: '279039007', note: 'Heavy load-bearing infantry service (11B)' },
        ].map((c, i) => (
          <div key={i} className="rounded-lg border border-rose-100 bg-rose-50 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700">{c.code}</span>
              <span className="text-xs font-semibold text-white bg-rose-600 px-2 py-0.5 rounded-full">{c.rating}</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{c.name}</p>
            <p className="text-xs text-gray-500">SNOMED: {c.snomed} · recordedDate: {c.date}</p>
            <p className="text-xs text-gray-600 italic">"{c.note}"</p>
          </div>
        ))}
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Active Medications (MedicationRequest)</p>
          <p className="text-xs text-gray-700">• Sertraline (Zoloft) 100mg — PTSD/MDD</p>
          <p className="text-xs text-gray-700">• Prazosin 2mg — PTSD nightmares</p>
        </div>
      </div>
    ),
    aiSummary: 'FHIR conditions are auto-mapped to VA diagnostic codes, onset dates pre-fill the 21-526EZ, and medications cross-reference conditions to strengthen nexus letters.',
    insights: [
      { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50 border-green-200', title: 'Zero manual data entry', detail: '3 confirmed diagnoses pulled in 247ms — DC codes, dates, and provider notes auto-filled into the claim form.' },
      { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: 'recordedDate = onset date', detail: '2008-01-15 for PTSD — this date goes directly into Box 21 of the 21-526EZ, no guessing required.' },
      { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', title: 'Medications confirm conditions', detail: 'Sertraline + Prazosin = PTSD treatment. AI uses active prescriptions to corroborate condition claims.' },
    ],
    talkingPoints: [
      'HL7 FHIR R4 is the same standard used by Epic, Cerner, and Apple Health Records — VA adopted it mandatorily in 2023.',
      'Conditions arrive with SNOMED codes that map directly to VA DC codes — no manual lookup.',
      'recordedDate from VA health records is legally valid as the onset date — eliminates the #1 reason claims are delayed.',
      'Medications automatically cross-reference conditions — Prazosin for PTSD nightmares strengthens the PTSD nexus.',
      'Bundle includes all conditions ever documented at any VA facility — veterans can\'t accidentally forget a diagnosis.',
      'OAuth scope is patient-specific and read-only — VA tokens cannot write or modify any records.',
    ],
  },

  // ── Scenario 4: Benefits Reference ────────────────────────────────────────
  {
    id: 4, title: 'Benefits Reference Data', icon: BookOpen,
    api: 'benefits-reference-data/v1', auth: 'API Key',
    scope: null, endpoint: '/services/benefits-reference-data/v1/disabilities',
    method: 'GET',
    tagline: '887 VA diagnostic codes with CFR citations — the backbone of AI condition-to-DC-code mapping',
    authTitle: 'VA Benefits Reference — API Key Auth',
    authDescription: 'This is a public-tier VA API requiring only an API key — no OAuth needed. EarnedIT indexes all 887 disability codes at startup, enabling instant AI mapping from document keywords to DC codes without a live API call during claim processing.',
    dataReturned: '887 disability codes, diagnostic names, CFR citations, active status',
    accentColor: '#6d28d9', accentBg: 'bg-violet-50', accentBorder: 'border-violet-200',
    oauthSteps: [
      { icon: Key,         label: 'Loading VA API key from secure vault',                       ms: 400 },
      { icon: Wifi,        label: 'Calling GET /services/benefits-reference-data/v1/disabilities', ms: 800 },
      { icon: Database,    label: 'Response received — 887 disability codes indexed',            ms: 500 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/services/benefits-reference-data/v1/disabilities" responseTime="200 OK · ~183ms">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-violet-700">total_disabilities: 887</span>
          <span className="text-xs text-gray-400">Auth: API Key</span>
        </div>
        {[
          { id: 9411, name: 'Post Traumatic Stress Disorder', cfr: '38 C.F.R. § 4.130' },
          { id: 6260, name: 'Tinnitus', cfr: '38 C.F.R. § 4.87' },
          { id: 5237, name: 'Lumbosacral or Cervical Strain', cfr: '38 C.F.R. § 4.71a' },
          { id: 8045, name: 'Traumatic Brain Injury (TBI)', cfr: '38 C.F.R. § 4.124a' },
        ].map((c, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-violet-100 bg-violet-50">
            <span className="w-10 text-center text-[10px] font-bold text-white bg-violet-600 py-0.5 rounded flex-shrink-0">{c.id}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{c.name}</p>
              <p className="text-[10px] text-gray-400">{c.cfr}</p>
            </div>
            <CheckCircle className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
          </div>
        ))}
        <p className="text-[10px] text-gray-400 text-center">+ 883 more disability codes indexed</p>
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">VA Disability Code Library</h3>
          <span className="ml-auto text-xs text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">887 codes</span>
        </div>
        {[
          { id: 9411, name: 'Post Traumatic Stress Disorder (PTSD)', cfr: '38 C.F.R. § 4.130', matched: true },
          { id: 6260, name: 'Tinnitus',                               cfr: '38 C.F.R. § 4.87',  matched: true },
          { id: 5237, name: 'Lumbosacral or Cervical Strain',         cfr: '38 C.F.R. § 4.71a', matched: true },
          { id: 8045, name: 'Traumatic Brain Injury (TBI)',            cfr: '38 C.F.R. § 4.124a', matched: false },
          { id: 6100, name: 'Hearing Loss (Bilateral)',                cfr: '38 C.F.R. § 4.85',  matched: false },
          { id: 6602, name: 'Asthma, Bronchial',                       cfr: '38 C.F.R. § 4.97',  matched: false },
          { id: 7101, name: 'Hypertensive Vascular Disease',           cfr: '38 C.F.R. § 4.104', matched: false },
        ].map((code, i) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${code.matched ? 'bg-violet-50 border-violet-200' : 'bg-gray-50 border-gray-100'}`}>
            <div className={`w-12 text-center text-xs font-bold px-1 py-0.5 rounded ${code.matched ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {code.id}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{code.name}</p>
              <p className="text-xs text-gray-500">{code.cfr}</p>
            </div>
            {code.matched && <CheckCircle className="h-4 w-4 text-violet-600 flex-shrink-0" />}
          </div>
        ))}
        <p className="text-xs text-gray-400 text-center">Highlighted = matched to Aliza Ali's claim conditions</p>
      </div>
    ),
    aiSummary: 'EarnedIT pre-indexes all 887 codes at startup. When a document says "ringing in ears", AI resolves it to DC 6260 in milliseconds — no manual lookup, no typos.',
    insights: [
      { icon: Brain, color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', title: 'AI condition resolution', detail: '"Ringing in ears" → DC 6260 Tinnitus. "Back pain" → DC 5237 Lumbar Strain. Resolved in <10ms from indexed cache.' },
      { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', title: 'CFR citations auto-attached', detail: 'Every identified condition gets its 38 C.F.R. citation — legal basis for rating included automatically in the claim package.' },
      { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 border-green-200', title: 'New VA codes auto-available', detail: 'VA adds codes without notice (e.g., new PACT Act conditions). API-indexed library updates automatically — no manual maintenance.' },
    ],
    talkingPoints: [
      '887 VA diagnostic codes — EarnedIT knows every one of them. Veterans don\'t need to know DC numbers.',
      'AI maps free-text symptoms from documents to the exact VA code used for rating — no human transcription.',
      'CFR citations are included — when VA tries to deny on legal grounds, EarnedIT already has the citation ready.',
      'PACT Act added new presumptive conditions in 2022 — API-indexed library picked them up automatically.',
      'This is the same reference library VA raters use internally — EarnedIT operates from VA\'s own source of truth.',
      'API Key auth (no OAuth) — can be called freely at startup to keep local index fresh without veteran interaction.',
    ],
  },

  // ── Scenario 5: Benefits Intake ────────────────────────────────────────────
  {
    id: 5, title: 'Claims Pre-Assembly & Submission', icon: Upload,
    api: 'benefits-intake/v2', auth: 'OAuth2 CCG',
    scope: 'benefits_documents.write',
    endpoint: '/services/benefits-intake/v2/uploads',
    method: 'POST',
    tagline: 'Digitally assemble, validate, and submit full claim packages directly to VA — no fax, no mail, no lost documents',
    authTitle: 'Benefits Intake — Document Submission',
    authDescription: 'EarnedIT packages all claim documents (21-526EZ, DD-214, medical records, nexus letters, buddy statements) into a single validated PDF bundle and submits directly to VA via the Benefits Intake API. A GUID is returned immediately for tracking.',
    dataReturned: 'Upload GUID, status (received → processing → success), document manifest, polling URL',
    accentColor: '#1d4ed8', accentBg: 'bg-blue-50', accentBorder: 'border-blue-200',
    oauthSteps: [
      { icon: Lock,        label: 'Generating client assertion JWT',                             ms: 600 },
      { icon: Shield,      label: 'Requesting access token (scope: benefits_documents.write)',  ms: 900 },
      { icon: CheckCircle, label: 'Token validated by VA Identity Service',                     ms: 700 },
      { icon: Package,     label: 'Assembling 6-document claim package (14 pages)',              ms: 1200 },
      { icon: Wifi,        label: 'POST /services/benefits-intake/v2/uploads → VA received',   ms: 800 },
      { icon: Database,    label: 'GUID returned — tracking active',                            ms: 400 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="POST" path="/services/benefits-intake/v2/uploads" responseTime="200 OK · ~618ms">
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-green-700">document_upload — RECEIVED</p>
            <p className="text-[10px] text-green-600">Claim package accepted by VA</p>
          </div>
        </div>
        <ResponseRow label="type" value="document_upload" valueColor="text-gray-700" />
        <ResponseRow label="guid" value="a1b2c3d4-e5f6-7890..." valueColor="text-blue-700" mono />
        <ResponseRow label="status" value="✓ received" valueColor="text-green-700" />
        <ResponseRow label="detail" value="6 documents · 14 pages" valueColor="text-gray-800" />
        <ResponseRow label="scope" value="benefits_documents.write" valueColor="text-gray-500" />
        <p className="text-[10px] text-gray-400 mt-1">Poll: /services/benefits-intake/v2/uploads/a1b2c3d4</p>
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Claim Package Submitted</h3>
          <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Received by VA
          </span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1 text-xs">
          <p className="font-semibold text-blue-700">Submission Receipt</p>
          <p className="text-gray-700">GUID: <code className="text-blue-800">a1b2c3d4-e5f6-7890-abcd-ef1234567890</code></p>
          <p className="text-gray-700">Veteran: Aliza Ali · ICN: 1013127591V428144</p>
          <p className="text-gray-700">Submitted: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          <p className="text-gray-700">Status: <span className="font-semibold text-green-700">RECEIVED</span></p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents Uploaded (14 pages)</p>
          {[
            { name: '21-526EZ_Disability_Compensation.pdf', pages: 4, type: 'Form', color: 'text-blue-600' },
            { name: 'DD-214_Certificate_of_Release.pdf',    pages: 2, type: 'Military Record', color: 'text-green-600' },
            { name: 'Medical_Diagnosis_PTSD.pdf',           pages: 3, type: 'Medical Evidence', color: 'text-rose-600' },
            { name: 'Nexus_Letter_Dr_Chen.pdf',             pages: 2, type: 'Medical Opinion',  color: 'text-violet-600' },
            { name: 'Service_Treatment_Records.pdf',        pages: 2, type: 'Service Record',   color: 'text-amber-600' },
            { name: 'Buddy_Statement_SGT_Rodriguez.pdf',    pages: 1, type: 'Lay Evidence',     color: 'text-orange-600' },
          ].map((doc, i) => (
            <div key={i} className="flex items-center gap-2 text-xs border rounded p-2">
              <FileText className={`h-3.5 w-3.5 flex-shrink-0 ${doc.color}`} />
              <span className="flex-1 font-medium text-gray-800 truncate">{doc.name}</span>
              <span className="text-gray-500 flex-shrink-0">{doc.pages}pg</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full bg-gray-100 ${doc.color} flex-shrink-0`}>{doc.type}</span>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 border rounded-lg p-2 text-xs text-gray-600">
          <p className="font-semibold text-gray-700 mb-1">Status Polling</p>
          <p>EarnedIT checks daily: received → processing → success/error</p>
          <p className="text-gray-400 mt-1">Poll: /services/benefits-intake/v2/uploads/a1b2c3d4</p>
        </div>
      </div>
    ),
    aiSummary: 'After AI analysis and veteran review, EarnedIT auto-assembles the full claim package — completed 21-526EZ, all supporting docs, nexus letters — and submits in one API call.',
    insights: [
      { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50 border-green-200', title: 'One-click submission', detail: 'All 6 documents, 14 pages — assembled, validated, and submitted in a single API call. No printing, no faxing, no mailing.' },
      { icon: Database, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', title: 'Auditable GUID receipt', detail: 'Every submission gets a GUID logged in EarnedIT. If VA says they never received it — we have proof with timestamp.' },
      { icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', title: 'Automatic status polling', detail: 'EarnedIT polls the GUID daily and notifies veteran when status changes from "received" to "processing" to "success".' },
    ],
    talkingPoints: [
      'The #1 reason VA claims are delayed: lost or incomplete paperwork submitted by mail or fax. This API eliminates that.',
      'GUID receipt is legally timestamped proof of submission — critical if VA claims they didn\'t receive documents.',
      '21-526EZ is auto-generated and pre-populated from data EarnedIT already collected — veteran just reviews and approves.',
      'Document validation happens before submission — EarnedIT catches missing signatures or illegible scans before VA does.',
      'Status transitions: received → processing → success | error. Veterans get push notifications at each stage.',
      'Write scope (benefits_documents.write) is the most privileged token we use — stored in encrypted vault, never in client.',
    ],
  },

  // ── Scenario 6: Claims Status ──────────────────────────────────────────────
  {
    id: 6, title: 'Claims Status Tracking', icon: Activity,
    api: 'claims/v2', auth: 'OAuth2 CCG',
    scope: 'claim.read',
    endpoint: '/services/claims/v2/veterans/{icn}/claims/{id}',
    method: 'GET',
    tagline: '8-phase claim lifecycle tracked in real time — veterans always know exactly where their claim stands',
    authTitle: 'Claims API — Real-Time Status',
    authDescription: 'Instead of calling 1-800-827-1000 and waiting on hold, EarnedIT pulls live claim status from VA every 24 hours. Tracked items show exactly what VA still needs — EarnedIT prompts the veteran to respond before the deadline.',
    dataReturned: 'Claim phase (1–8), tracked items with due dates, supporting documents received, phase change dates',
    accentColor: '#047857', accentBg: 'bg-emerald-50', accentBorder: 'border-emerald-200',
    oauthSteps: [
      { icon: Lock,        label: 'Generating client assertion JWT',                              ms: 600 },
      { icon: Shield,      label: 'Requesting access token (scope: claim.read)',                 ms: 900 },
      { icon: CheckCircle, label: 'Token validated by VA Identity Service',                      ms: 700 },
      { icon: Wifi,        label: 'Calling GET /services/claims/v2/veterans/{icn}/claims/{id}', ms: 1100 },
      { icon: Database,    label: 'Claim status received & parsed',                              ms: 500 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/services/claims/v2/veterans/{icn}/claims/VA-CL-20260305-001" responseTime="200 OK · ~301ms">
        <ResponseRow label="claim_id" value="VA-CL-20260305-001" valueColor="text-blue-700" mono />
        <ResponseRow label="status" value="INITIAL_REVIEW" valueColor="text-amber-700" />
        <ResponseRow label="phase" value="Claim Development (2 of 8)" valueColor="text-gray-800" />
        <ResponseRow label="phase_change_date" value="2026-03-06" valueColor="text-gray-600" />
        <div className="mt-2 space-y-1">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">tracked_items</p>
          {[
            { status: 'NEEDED', label: 'Buddy Statement', due: 'due 2026-04-01', color: 'text-red-700 bg-red-50 border-red-200' },
            { status: 'RECEIVED', label: 'VA Form 21-526EZ', due: null, color: 'text-green-700 bg-green-50 border-green-200' },
            { status: 'RECEIVED', label: 'DD-214', due: null, color: 'text-green-700 bg-green-50 border-green-200' },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded border text-xs ${item.color}`}>
              <span className="font-bold text-[10px]">{item.status}</span>
              <span className="flex-1">{item.label}</span>
              {item.due && <span className="text-[10px] font-semibold">{item.due}</span>}
            </div>
          ))}
        </div>
      </ApiResponseCard>
    ),
    DataCard: () => {
      const phases = [
        { n: 1, name: 'Claim Received',               done: true,  date: '2026-03-05' },
        { n: 2, name: 'Under Review',                  done: true,  date: '2026-03-06' },
        { n: 3, name: 'Gathering Evidence',             done: false, date: null },
        { n: 4, name: 'Review of Evidence',             done: false, date: null },
        { n: 5, name: 'Preparation for Decision',       done: false, date: null },
        { n: 6, name: 'Pending Decision Approval',      done: false, date: null },
        { n: 7, name: 'Preparation for Notification',   done: false, date: null },
        { n: 8, name: 'Complete',                       done: false, date: null },
      ];
      return (
        <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Claim VA-CL-20260305-001</h3>
            <span className="ml-auto text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Phase 2 of 8</span>
          </div>
          <div className="space-y-2">
            {phases.map((p) => (
              <div key={p.n} className={`flex items-center gap-3 p-2 rounded-lg ${p.done ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.done ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{p.n}</div>
                <span className={`text-xs flex-1 ${p.done ? 'text-emerald-800 font-medium' : 'text-gray-400'}`}>{p.name}</span>
                {p.date && <span className="text-xs text-emerald-600">{p.date}</span>}
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold text-red-700 mb-1">⚠ Action Required</p>
            <p className="text-xs text-gray-700">Buddy/Lay Statement needed — due <strong>April 1, 2026</strong></p>
            <p className="text-xs text-gray-500">EarnedIT sent reminder 14 days in advance</p>
          </div>
        </div>
      );
    },
    aiSummary: 'EarnedIT polls claim status daily, parses tracked items, and sends proactive alerts when VA needs something — before the due date passes and the claim stalls.',
    insights: [
      { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', title: 'Tracked item alert', detail: 'VA needs a Buddy Statement by April 1. EarnedIT sent the veteran a reminder 14 days early with a pre-filled template.' },
      { icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', title: 'Phase 2 of 8 — 14 days since filing', detail: 'Phase change date tracked — EarnedIT flags if a claim stays in one phase beyond the average processing time.' },
      { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', title: 'No phone calls needed', detail: 'The VA 1-800 number has a 45-minute average hold time. EarnedIT replaces every status check with an API call.' },
    ],
    talkingPoints: [
      'VA\'s 1-800-827-1000 has a 45-minute average hold time. Every claim status check is now an API call — instant.',
      'Tracked items show exactly what VA still needs. Most veterans miss due dates because they don\'t know what\'s missing.',
      'EarnedIT sends deadline reminders 30, 14, and 7 days before tracked item due dates — automated, not manual.',
      'Phase change dates are logged — builds a complete timeline that can be used in appeals if VA delays are unreasonable.',
      'Average VA claim takes 161 days. EarnedIT real-time tracking reduces surprise delays by keeping claims complete.',
      '8-phase VA claim lifecycle shown visually — veterans understand their position without reading legal documents.',
    ],
  },

  // ── Scenario 7: Appealable Issues ─────────────────────────────────────────
  {
    id: 7, title: 'Appealable Issues & Decision Reviews', icon: GitBranch,
    api: 'appeals/v1', auth: 'OAuth2 CCG',
    scope: 'appeals.read',
    endpoint: '/services/appeals/v1/appealable-issues/higher_level_review',
    method: 'GET',
    tagline: 'Identify under-rated conditions and recommend the optimal appeal lane — HLR, Supplemental, or Board',
    authTitle: 'Appeals API — Appealable Issues',
    authDescription: 'EarnedIT pulls every condition that was rated below the veteran\'s expected level and recommends the best AMA appeal pathway: Higher Level Review for clear errors, Supplemental Claim for new evidence, or Board Appeal for complex issues.',
    dataReturned: 'Appealable issues, current ratings, decision dates, timely status, recommended appeal lane',
    accentColor: '#d97706', accentBg: 'bg-amber-50', accentBorder: 'border-amber-200',
    oauthSteps: [
      { icon: Lock,        label: 'Generating client assertion JWT',                                  ms: 600 },
      { icon: Shield,      label: 'Requesting access token (scope: appeals.read)',                   ms: 900 },
      { icon: CheckCircle, label: 'Token validated by VA Identity Service',                          ms: 700 },
      { icon: Wifi,        label: 'Calling GET /appeals/v1/appealable-issues/higher_level_review',  ms: 1100 },
      { icon: Database,    label: 'Appealable issues received — AI scoring appeal lanes',            ms: 500 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/services/appeals/v1/appealable-issues/higher_level_review" responseTime="200 OK · ~289ms">
        <div className="text-xs font-medium text-amber-700 mb-2">appealableIssue — 2 issues · scope: appeals.read</div>
        {[
          { condition: 'Tinnitus', rating: '10%', lane: 'supplemental_claim', timely: true, reason: 'New audiological evidence available' },
          { condition: 'Lumbar Strain with DDD', rating: '10%', lane: 'higher_level_review', timely: true, reason: 'Clear & unmistakable error in ROM' },
        ].map((issue, i) => (
          <div key={i} className="rounded-lg border border-amber-100 bg-amber-50 p-2.5 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-900">{issue.condition}</span>
              <span className="text-[10px] font-bold text-white bg-amber-600 px-1.5 py-0.5 rounded-full">{issue.rating}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{issue.lane}</span>
              {issue.timely && <span className="text-green-600 flex items-center gap-0.5"><CheckCircle className="h-3 w-3" />timely</span>}
            </div>
            <p className="text-[10px] text-gray-500 italic">"{issue.reason}"</p>
          </div>
        ))}
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900">AMA Appeal Opportunities</h3>
          <span className="ml-auto text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">2 issues</span>
        </div>
        {[
          {
            condition: 'Tinnitus', current: '10%', target: '10%→30%',
            lane: 'Supplemental Claim', laneColor: 'bg-blue-100 text-blue-700',
            reason: 'New audiological evidence — bilateral audiogram shows worsening hearing loss',
            timely: true, deadline: 'Jan 15, 2025 (within 1-year AMA window)',
          },
          {
            condition: 'Lumbar Strain with DDD', current: '10%', target: '10%→40%',
            lane: 'Higher Level Review', laneColor: 'bg-amber-100 text-amber-700',
            reason: 'Clear & unmistakable error — VA measured ROM incorrectly (flexion 45° vs actual 25°)',
            timely: true, deadline: 'Mar 20, 2025 (within 1-year AMA window)',
          },
        ].map((issue, i) => (
          <div key={i} className="rounded-lg border border-amber-100 p-3 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-semibold text-gray-900 text-sm">{issue.condition}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${issue.laneColor}`}>{issue.lane}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Current: <strong>{issue.current}</strong></span>
              <span>→</span>
              <span className="text-green-600 font-bold">{issue.target}</span>
              {issue.timely && <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Timely</span>}
            </div>
            <p className="text-xs text-gray-600 italic">"{issue.reason}"</p>
            <p className="text-xs text-gray-400">Deadline: {issue.deadline}</p>
          </div>
        ))}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs">
          <p className="font-semibold text-green-700">Potential Rating Increase</p>
          <p className="text-gray-700">If both appeals succeed: 70% → 90% combined = $2,318/mo (+$655/mo)</p>
        </div>
      </div>
    ),
    aiSummary: 'EarnedIT compares each rated condition against evidence in the veteran\'s file to identify under-ratings, then recommends the AMA appeal lane with the highest probability of success.',
    insights: [
      { icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50 border-green-200', title: '$655/mo increase if both appeals succeed', detail: 'Tinnitus 10%→30% + Lumbar 10%→40% = combined rating jump to 90% = $2,318/mo.' },
      { icon: GitBranch, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: 'Lane selection matters', detail: 'Higher Level Review averages 4–5 months. Supplemental Claim averages 5–7 months. Board averages 12–24 months.' },
      { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', title: '1-year AMA deadline tracked', detail: 'Both issues are within the 1-year AMA window. EarnedIT tracks this deadline and alerts veteran before it closes.' },
    ],
    talkingPoints: [
      'Tinnitus at 10% is the most commonly under-rated condition in the VA — the audiological standard changed in 2021.',
      'Higher Level Review is the fastest path for clear errors (ROM measurement mistakes, math errors in ratings).',
      'Supplemental Claim is the right lane when new medical evidence exists — audiogram, MRI, DBQ from private doctor.',
      'EarnedIT calculates the dollar impact of every appeal before filing — veterans understand what they\'re fighting for.',
      '1-year AMA window is tracked automatically — veteran gets 90, 60, and 30-day alerts before the deadline expires.',
      'AI scores appeal success probability based on condition type, evidence available, and historical VA outcomes.',
    ],
  },

  // ── Scenario 8: BVA Appeals ────────────────────────────────────────────────
  {
    id: 8, title: 'BVA Appeals Tracking', icon: Gavel,
    api: 'appeals/v1', auth: 'OAuth2 CCG',
    scope: 'appeals.read',
    endpoint: '/services/appeals/v1/appeals',
    method: 'GET',
    tagline: 'Board of Veterans\' Appeals docket tracking — hearing dates, issue list, and VLJ assignment',
    authTitle: 'Board of Veterans\' Appeals API',
    authDescription: 'For veterans who chose to appeal to the Board of Veterans\' Appeals, EarnedIT tracks their position on the docket, monitors for hearing date assignments, and alerts them 30 days before their hearing.',
    dataReturned: 'Appeal status, docket type (direct/evidence/hearing), issues before Board, VLJ assignment, estimated hearing date',
    accentColor: '#475569', accentBg: 'bg-slate-50', accentBorder: 'border-slate-200',
    oauthSteps: [
      { icon: Lock,        label: 'Generating client assertion JWT',                         ms: 600 },
      { icon: Shield,      label: 'Requesting access token (scope: appeals.read)',          ms: 900 },
      { icon: CheckCircle, label: 'Token validated by VA Identity Service',                 ms: 700 },
      { icon: Wifi,        label: 'Calling GET /services/appeals/v1/appeals',              ms: 1100 },
      { icon: Database,    label: 'BVA appeal record received — docket parsed',             ms: 500 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/services/appeals/v1/appeals" responseTime="200 OK · ~334ms">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-2">
          <p className="text-[10px] text-slate-500 font-medium">Board of Veterans' Appeals — 1 active appeal</p>
        </div>
        <ResponseRow label="id" value="BVA-2024-ALI-001" valueColor="text-slate-700" mono />
        <ResponseRow label="type" value="appeal" valueColor="text-gray-700" />
        <ResponseRow label="status" value="on_docket" valueColor="text-amber-700" />
        <ResponseRow label="docket_type" value="hearing" valueColor="text-blue-700" />
        <ResponseRow label="aoj" value="RO38 — St. Petersburg FL" valueColor="text-gray-700" />
        <ResponseRow label="hearing_scheduled" value="false — awaiting assignment" valueColor="text-gray-500" />
        <ResponseRow label="estimated_decision_date" value="2027-06-01" valueColor="text-gray-600" />
        <div className="mt-2 p-2 rounded border border-amber-100 bg-amber-50 text-xs">
          <span className="font-semibold text-amber-700">issue: </span>
          <span className="text-gray-800">Tinnitus — Higher Rating (10% → 30%)</span>
          <span className="ml-2 text-amber-600 font-medium">[pending]</span>
        </div>
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <Gavel className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-gray-900">Board of Veterans' Appeals</h3>
          <span className="ml-auto text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">On Docket</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1 text-xs">
          <p><span className="font-semibold text-gray-700">Appeal ID:</span> BVA-2024-ALI-001</p>
          <p><span className="font-semibold text-gray-700">Docket Lane:</span> Hearing Request</p>
          <p><span className="font-semibold text-gray-700">AOJ:</span> RO38 — St. Petersburg, FL</p>
          <p><span className="font-semibold text-gray-700">Status:</span> <span className="text-amber-600 font-semibold">On Docket — Awaiting Hearing Assignment</span></p>
          <p><span className="font-semibold text-gray-700">Est. Decision:</span> June 2027</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Issues Before Board</p>
          <div className="flex items-center gap-2 p-2 rounded border border-amber-200 bg-amber-50 text-xs">
            <Gavel className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
            <span className="font-medium text-gray-800">Tinnitus — Higher Rating (10% → 30%)</span>
            <span className="ml-auto text-amber-600">Pending</span>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-1">
          <p className="font-semibold text-blue-700">EarnedIT Actions</p>
          <p className="text-gray-700">• Hearing prep package ready (audiologist letters, lay statements)</p>
          <p className="text-gray-700">• 30-day pre-hearing reminder configured</p>
          <p className="text-gray-700">• VLJ assignment alert when assigned</p>
        </div>
      </div>
    ),
    aiSummary: 'BVA appeals average 12–24 months. EarnedIT tracks docket position, prepares hearing materials automatically, and ensures veterans don\'t miss their hearing date.',
    insights: [
      { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', title: 'Estimated decision: June 2027', detail: 'Hearing-lane BVA appeals average 18 months. EarnedIT tracks estimated date and alerts veteran at 6-month, 3-month, and 1-month marks.' },
      { icon: Gavel, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: 'Hearing prep auto-generated', detail: 'EarnedIT prepares the hearing binder: audiologist letters, buddy statements, and a written brief for the VLJ — 30 days before the hearing.' },
      { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', title: 'Hearing lane wins at higher rates', detail: 'Veterans who request hearings and show up win at a 43% higher rate than those who choose the direct review lane.' },
    ],
    talkingPoints: [
      'Board of Veterans\' Appeals receives 80,000+ appeals per year — most veterans have no representation at their hearing.',
      'EarnedIT generates the hearing binder automatically — VLJ brief, evidence summary, issue-by-issue argument.',
      'Hearing lane average: 18 months. Direct review: 12 months. Evidence lane: 14 months. EarnedIT models the trade-off.',
      'VLJ assignment is tracked — when assigned, EarnedIT researches the VLJ\'s prior decisions on similar conditions.',
      '30-day pre-hearing reminder with checklist: bring VA ID, confirm representative, review issue list.',
      'This API also covers legacy appeals still in the pre-AMA pipeline — 300,000+ veterans still in the old system.',
    ],
  },

  // ── Scenario 9: Legacy Appeals ─────────────────────────────────────────────
  {
    id: 9, title: 'Legacy Appeals Management', icon: Clock,
    api: 'appeals/v1', auth: 'OAuth2 CCG',
    scope: 'appeals.read',
    endpoint: '/services/appeals/v1/legacy-appeals',
    method: 'GET',
    tagline: 'Pre-AMA legacy appeals — identify opt-in opportunities and track SOC/SSOC certification status',
    authTitle: 'Legacy Appeals API',
    authDescription: '300,000+ veterans are still in the pre-AMA legacy system — many don\'t know they can opt into the faster AMA process. EarnedIT identifies legacy appeals, models the AMA opt-in impact, and guides veterans through the SOC → SSOC → BVA pipeline.',
    dataReturned: 'Legacy appeal status, SOC/SSOC dates, location in pipeline, AMA opt-in eligibility',
    accentColor: '#c2410c', accentBg: 'bg-orange-50', accentBorder: 'border-orange-200',
    oauthSteps: [
      { icon: Lock,        label: 'Generating client assertion JWT',                        ms: 600 },
      { icon: Shield,      label: 'Requesting access token (scope: appeals.read)',         ms: 900 },
      { icon: CheckCircle, label: 'Token validated by VA Identity Service',                ms: 700 },
      { icon: Wifi,        label: 'Calling GET /services/appeals/v1/legacy-appeals',      ms: 1100 },
      { icon: Database,    label: 'Legacy appeal records received — AMA opt-in modeled',  ms: 500 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/services/appeals/v1/legacy-appeals" responseTime="200 OK · ~267ms">
        <ResponseRow label="id" value="LEGACY-RO38-2019-001" valueColor="text-orange-700" mono />
        <ResponseRow label="summary" value="Lumbar Strain — 10% → 40%" valueColor="text-gray-800" />
        <ResponseRow label="location" value="BVA Docket — Washington DC" valueColor="text-gray-700" />
        <ResponseRow label="aoj" value="RO38 — St. Petersburg FL" valueColor="text-gray-700" />
        <ResponseRow label="soc_date" value="2020-03-15" valueColor="text-gray-600" />
        <ResponseRow label="ssoc_date" value="2021-08-22" valueColor="text-gray-600" />
        <ResponseRow label="ama_opt_in_eligible" value="✓ true" valueColor="text-green-700" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border bg-orange-50 border-orange-200 p-2 text-center">
            <p className="text-[10px] text-gray-500">Legacy wait</p>
            <p className="text-xl font-bold text-orange-600">36</p>
            <p className="text-[10px] text-gray-400">months</p>
          </div>
          <div className="rounded-lg border bg-green-50 border-green-300 p-2 text-center">
            <p className="text-[10px] text-gray-500">AMA opt-in</p>
            <p className="text-xl font-bold text-green-600">14</p>
            <p className="text-[10px] text-gray-400">months</p>
          </div>
        </div>
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Legacy Appeal — Pre-AMA System</h3>
          <span className="ml-auto text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Legacy</span>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-1 text-xs">
          <p><span className="font-semibold text-gray-700">Issue:</span> Lumbar Strain — Rating increase (10% → 40%)</p>
          <p><span className="font-semibold text-gray-700">AOJ:</span> RO38 — St. Petersburg, FL</p>
          <p><span className="font-semibold text-gray-700">SOC Issued:</span> March 15, 2020</p>
          <p><span className="font-semibold text-gray-700">SSOC Issued:</span> August 22, 2021</p>
          <p><span className="font-semibold text-gray-700">Current Location:</span> BVA Docket — Washington DC</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 space-y-2 text-xs">
          <p className="font-semibold text-green-700">AMA Opt-In Analysis</p>
          <div className="flex gap-4">
            <div className="flex-1 bg-white rounded p-2 text-center border">
              <p className="text-gray-500">Legacy system</p>
              <p className="text-2xl font-bold text-orange-600">36</p>
              <p className="text-gray-500">months remaining</p>
            </div>
            <div className="flex-1 bg-white rounded p-2 text-center border border-green-300">
              <p className="text-gray-500">If opt into AMA</p>
              <p className="text-2xl font-bold text-green-600">14</p>
              <p className="text-gray-500">months remaining</p>
            </div>
          </div>
          <p className="text-gray-700 font-medium">Recommendation: <span className="text-green-700">Opt into AMA → save ~22 months</span></p>
        </div>
      </div>
    ),
    aiSummary: 'EarnedIT identifies legacy appeals and runs a time-to-decision model comparing legacy vs AMA opt-in — then guides veterans through the opt-in paperwork automatically.',
    insights: [
      { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', title: 'Save 22 months by opting into AMA', detail: 'Legacy system estimate: 36 months. AMA Supplemental Claim estimate: 14 months. EarnedIT files the opt-in automatically.' },
      { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', title: '300,000 veterans stuck in legacy', detail: 'Most don\'t know AMA exists or how to opt in. This API lets EarnedIT identify them and make the recommendation.' },
      { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', title: 'SOC/SSOC tracking automated', detail: 'Statement of Case and Supplemental SOC dates are tracked — certified appeal certified to Board without gaps or missed deadlines.' },
    ],
    talkingPoints: [
      '300,000+ veterans are in the legacy appeals system — average wait time is 3–5 years to reach the Board.',
      'AMA opt-in can cut that to 12–18 months for most cases — but veterans have to actively opt in.',
      'EarnedIT identifies legacy appeals via API, models the AMA trade-off, and files the opt-in paperwork in one click.',
      'SOC and SSOC dates are critical — missing the 60-day response window forfeits the appeal right.',
      'EarnedIT tracks the full pipeline: NOD → SOC → SSOC → VA Form 9 → BVA → with deadline alerts at every step.',
      'Legacy appeals are also in the CAVC pipeline — Court of Appeals for Veterans Claims. EarnedIT tracks that too.',
    ],
  },

  // ── Scenario 10: Community Care ────────────────────────────────────────────
  {
    id: 10, title: 'Community Care Eligibility', icon: Building2,
    dedicatedPage: '/community-care', dedicatedPageLabel: 'Full Community Care Demo',
    api: 'community-care/v0', auth: 'OAuth2 CCG',
    scope: 'community_care.read',
    endpoint: '/services/community-care/v0/eligibility/NonUrgentCare',
    method: 'GET',
    tagline: 'MISSION Act eligibility check — see private providers, mental health therapists, and specialists covered by VA',
    authTitle: 'Community Care Eligibility API',
    authDescription: 'Under the MISSION Act, veterans meeting drive time or wait time criteria can see private providers paid by VA. EarnedIT checks eligibility automatically — no forms, no phone calls. Veterans with PTSD can see private therapists without navigating VA wait lists.',
    dataReturned: 'Eligibility status, drive time, wait time criteria, covered service types, nearest qualifying facility',
    accentColor: '#0f766e', accentBg: 'bg-teal-50', accentBorder: 'border-teal-200',
    oauthSteps: [
      { icon: Lock,        label: 'Generating client assertion JWT',                                  ms: 600 },
      { icon: Shield,      label: 'Requesting access token (scope: community_care.read)',            ms: 900 },
      { icon: CheckCircle, label: 'Token validated by VA Identity Service',                          ms: 700 },
      { icon: Wifi,        label: 'Calling GET /community-care/v0/eligibility/NonUrgentCare',       ms: 1100 },
      { icon: Database,    label: 'Eligibility response received — MISSION Act criteria evaluated', ms: 500 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/services/community-care/v0/eligibility/NonUrgentCare" responseTime="200 OK · ~221ms">
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-2 mb-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-teal-700">eligible: true — MISSION Act criteria met</p>
            <p className="text-[10px] text-teal-600">criteria_met: drive_time · eligible_since: 2019-06-07</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="rounded-lg border bg-orange-50 border-orange-200 p-2 text-center">
            <p className="text-[10px] text-gray-500">Veteran's drive time</p>
            <p className="text-xl font-bold text-orange-600">52 <span className="text-xs font-normal text-gray-500">min</span></p>
          </div>
          <div className="rounded-lg border bg-teal-50 border-teal-300 p-2 text-center">
            <p className="text-[10px] text-gray-500">MISSION Act threshold</p>
            <p className="text-xl font-bold text-teal-600">30 <span className="text-xs font-normal text-gray-500">min</span></p>
          </div>
        </div>
        {['general', 'mental_health', 'urgent_care', 'pharmacy'].map((t) => (
          <div key={t} className="flex items-center gap-2 text-xs py-0.5">
            <CheckCircle className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
            <span className="text-gray-700 font-mono">{t}: </span>
            <span className="text-green-700 font-bold">true</span>
          </div>
        ))}
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-teal-600" />
          <h3 className="font-semibold text-gray-900">Community Care — MISSION Act</h3>
          <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Eligible
          </span>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 space-y-2 text-xs">
          <p className="font-semibold text-teal-700">Eligibility Criteria Met</p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-gray-600">Drive time to nearest VA</p>
              <p className="text-2xl font-bold text-orange-600">52 <span className="text-sm font-normal text-gray-500">min</span></p>
            </div>
            <div className="text-gray-400">vs</div>
            <div className="flex-1 text-right">
              <p className="text-gray-600">MISSION Act threshold</p>
              <p className="text-2xl font-bold text-teal-600">30 <span className="text-sm font-normal text-gray-500">min</span></p>
            </div>
          </div>
          <p className="text-green-700 font-medium">52 min {'>'} 30 min threshold → Community Care eligible since June 2019</p>
        </div>
        {[
          { type: 'Mental Health (PTSD therapy)', eligible: true,  note: 'Private therapists accepted by VA network' },
          { type: 'General Medical / Specialists', eligible: true,  note: 'Orthopedics, neurology, pulmonology' },
          { type: 'Urgent Care',                   eligible: true,  note: 'Retail urgent care clinics (CareNow, MinuteClinic)' },
          { type: 'Pharmacy',                      eligible: true,  note: 'CVS, Walgreens fill VA prescriptions' },
        ].map((svc, i) => (
          <div key={i} className="flex items-center gap-2 text-xs p-2 rounded border border-teal-100 bg-teal-50">
            <CheckCircle className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-medium text-gray-800">{svc.type}</span>
              <span className="text-gray-500"> — {svc.note}</span>
            </div>
          </div>
        ))}
      </div>
    ),
    aiSummary: 'Community care eligibility is confirmed in milliseconds via API — EarnedIT surfaces this to veterans who are unknowingly waiting months for VA appointments when they could see a private provider today.',
    insights: [
      { icon: CheckCircle, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', title: 'PTSD therapy with private therapists', detail: 'Mental health community care is the highest-impact eligibility. PTSD veterans can see private CBT therapists paid by VA — no 6-month VA wait list.' },
      { icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: '52-min drive = automatic eligibility', detail: 'James A. Haley VAMC is 52 minutes away. MISSION Act threshold is 30 minutes. Eligibility is automatic — no application required.' },
      { icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', title: 'Urgent care at retail clinics', detail: 'MinuteClinic, CareNow, and similar retail urgent care are covered. Veterans can walk in without an appointment and VA pays.' },
    ],
    talkingPoints: [
      '70% of veterans who qualify for community care don\'t know they\'re eligible — they wait for VA appointments unnecessarily.',
      'PTSD veterans can see private CBT therapists immediately instead of waiting 6+ months on VA mental health wait lists.',
      'Drive time is calculated from the veteran\'s actual address to the nearest appropriate VA facility — automatic, no forms.',
      'MISSION Act created 6 community care criteria: drive time, wait time, best medical interest, service unavailability, state residency, and grandfathered choice.',
      'EarnedIT checks all 6 criteria simultaneously — most veterans qualify under at least one without knowing.',
      'Pharmacy benefit: CVS and Walgreens accept VA prescriptions under the community care pharmacy program.',
    ],
  },

  // ── Scenario 11: Facilities ────────────────────────────────────────────────
  {
    id: 11, title: 'VA Facilities Finder', icon: MapPin,
    dedicatedPage: '/facilities', dedicatedPageLabel: 'Full Facilities Finder Demo',
    api: 'va_facilities/v1', auth: 'API Key',
    scope: null,
    endpoint: '/services/va_facilities/v1/facilities',
    method: 'GET',
    tagline: '1,200+ VA facilities with real-time wait times — nearest medical center, CBOC, and Vet Center in one API call',
    authTitle: 'VA Facilities API — Location Services',
    authDescription: 'EarnedIT uses the veteran\'s address to surface the nearest VA medical centers, community-based outpatient clinics (CBOCs), and Vet Centers — with real-time mental health wait times so veterans choose the facility with the shortest wait.',
    dataReturned: 'Facility name, address, phone, services offered, drive distance, mental health wait times',
    accentColor: '#0e7490', accentBg: 'bg-cyan-50', accentBorder: 'border-cyan-200',
    oauthSteps: [
      { icon: Key,      label: 'Loading VA API key from secure vault',                ms: 400 },
      { icon: Wifi,     label: 'Calling GET /services/va_facilities/v1/facilities',  ms: 900 },
      { icon: Database, label: 'Facility records received — distances calculated',    ms: 400 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/services/va_facilities/v1/facilities?lat=28.04&lng=-82.49&radius=50" responseTime="200 OK · ~198ms">
        <div className="text-xs text-gray-500 mb-2">Near St. Petersburg, FL 33704 · Auth: API Key · 2 results</div>
        {[
          { id: 'vha_673', name: 'James A. Haley VAMC — Tampa', type: 'va_health_facility', dist: '31.4 mi', wait: '18 days', phone: '813-972-2000' },
          { id: 'vha_038', name: 'St. Petersburg CBOC', type: 'va_health_facility', dist: '5.1 mi', wait: '9 days', phone: '727-398-6661' },
          { id: 'vba_38', name: 'St. Petersburg Vet Center', type: 'vet_center', dist: '4.2 mi', wait: 'walk-in', phone: '727-549-3600' },
        ].map((f, i) => (
          <div key={i} className="rounded-lg border border-cyan-100 bg-cyan-50 p-2.5 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-900">{f.name}</span>
              <span className="text-[10px] text-cyan-600 bg-cyan-100 px-1.5 py-0.5 rounded font-mono">{f.id}</span>
            </div>
            <div className="flex gap-3 text-[10px] text-gray-600">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{f.dist}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />MH wait: {f.wait}</span>
              <span>{f.phone}</span>
            </div>
          </div>
        ))}
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-cyan-600" />
          <h3 className="font-semibold text-gray-900">Nearby VA Facilities</h3>
          <span className="ml-auto text-xs text-gray-500">Near St. Petersburg, FL 33704</span>
        </div>
        {[
          { type: 'VAMC', name: 'James A. Haley VAMC — Tampa', dist: '31.4 mi', wait: '18 days', phone: '813-972-2000', tag: 'Full Services', tagColor: 'bg-blue-100 text-blue-700' },
          { type: 'CBOC', name: 'St. Petersburg CBOC',          dist: '5.1 mi',  wait: '9 days',  phone: '727-398-6661', tag: 'Primary Care', tagColor: 'bg-green-100 text-green-700' },
          { type: 'Vet Center', name: 'St. Petersburg Vet Center', dist: '4.2 mi', wait: 'Walk-in', phone: '727-549-3600', tag: 'No Enrollment', tagColor: 'bg-amber-100 text-amber-700' },
        ].map((f, i) => (
          <div key={i} className="rounded-lg border border-cyan-100 p-3 space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{f.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${f.tagColor}`}>{f.tag}</span>
            </div>
            <div className="flex gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{f.dist}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />MH wait: {f.wait}</span>
              <span>{f.phone}</span>
            </div>
          </div>
        ))}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
          <p className="font-semibold text-amber-700">Vet Center Highlight</p>
          <p className="text-gray-700">St. Pete Vet Center: walk-in readjustment counseling — no VA enrollment required. Many veterans don't know this exists.</p>
        </div>
      </div>
    ),
    aiSummary: 'EarnedIT surfaces the nearest VA facilities with real-time wait times, prioritizing mental health access for veterans with PTSD who need immediate care rather than the closest full VAMC.',
    insights: [
      { icon: MapPin, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200', title: 'CBOC 5 miles away — 9-day wait', detail: 'St. Petersburg CBOC is 5 miles from home. Mental health wait is 9 days vs 18 days at the main VAMC.' },
      { icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: 'Vet Center — no enrollment, walk-in', detail: 'St. Pete Vet Center is 4 miles away. No VA enrollment required — walk-in counseling for readjustment and PTSD.' },
      { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', title: 'Wait times inform community care decision', detail: 'If mental health wait exceeds 20 days, MISSION Act wait time criteria kick in → automatic community care eligibility.' },
    ],
    talkingPoints: [
      '1,200+ VA facilities nationwide — EarnedIT surfaces the 3 most relevant based on veteran\'s condition and location.',
      'Vet Centers offer readjustment counseling and PTSD treatment with no VA enrollment required — most veterans never find them.',
      'Mental health wait times are the trigger for community care eligibility — EarnedIT tracks both simultaneously.',
      'CBOC (Community-Based Outpatient Clinic) vs VAMC: CBOCs are smaller but often have shorter wait times for primary care.',
      'Phone numbers, addresses, and hours are included — veteran can call directly from the EarnedIT interface.',
      'API Key auth only — no veteran data sent to VA. This is a pure lookup call with no PHI involved.',
    ],
  },

  // ── Scenario 12: VA Forms ──────────────────────────────────────────────────
  {
    id: 12, title: 'VA Forms Library', icon: FileText,
    api: 'va_forms/v0', auth: 'API Key',
    scope: null,
    endpoint: '/services/va_forms/v0/forms',
    method: 'GET',
    tagline: 'Always-current VA forms — auto-populated from veteran data and submitted directly without printing',
    authTitle: 'VA Forms API — Current Versions',
    authDescription: 'VA updates forms without announcement. Using the Forms API guarantees EarnedIT always uses the current version — veterans never submit an outdated form that gets rejected. The 21-526EZ, DBQ forms, and buddy statement templates are all pre-populated from data already in EarnedIT.',
    dataReturned: 'Form name, title, URL, current version, valid dates, number of pages',
    accentColor: '#4f46e5', accentBg: 'bg-indigo-50', accentBorder: 'border-indigo-200',
    oauthSteps: [
      { icon: Key,      label: 'Loading VA API key from secure vault',           ms: 400 },
      { icon: Wifi,     label: 'Calling GET /services/va_forms/v0/forms',       ms: 800 },
      { icon: Database, label: 'Form library received — versions verified',      ms: 400 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/services/va_forms/v0/forms?query=21-526" responseTime="200 OK · ~164ms">
        <div className="text-xs text-gray-500 mb-2">VA Forms Library · Auth: API Key · always-current versions</div>
        {[
          { form: '21-526EZ', title: 'Application for Disability Compensation', pages: 14, revised: '2024-09-01' },
          { form: '21-0781',  title: 'Statement in Support of Claim for PTSD',  pages: 6,  revised: '2023-04-12' },
          { form: '21-4142',  title: 'Authorization to Disclose Information',   pages: 2,  revised: '2022-11-01' },
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-indigo-100 bg-indigo-50">
            <span className="text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded flex-shrink-0">{f.form}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 leading-tight truncate">{f.title}</p>
              <p className="text-[10px] text-gray-400">{f.pages} pages · last_revision: {f.revised}</p>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />Always current — no outdated form rejections
        </p>
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">VA Forms — Aliza Ali's Claim</h3>
        </div>
        {[
          { form: '21-526EZ',  title: 'Application for Disability Compensation',     pages: 14, status: 'Pre-filled', statusColor: 'bg-green-100 text-green-700', note: 'Auto-populated from FHIR + service history data' },
          { form: '21-0781',   title: 'Statement in Support of Claim for PTSD',      pages: 6,  status: 'Pre-filled', statusColor: 'bg-green-100 text-green-700', note: 'Combat stressor details from service history' },
          { form: '21-4142',   title: 'Authorization to Disclose Information to VA', pages: 2,  status: 'Signed',     statusColor: 'bg-blue-100 text-blue-700',   note: 'ROI signed during onboarding' },
          { form: 'DBQ-PTSD',  title: 'Disability Benefits Questionnaire — PTSD',   pages: 8,  status: 'Sent to MD',  statusColor: 'bg-amber-100 text-amber-700',  note: 'Sent to Dr. Chen for completion' },
          { form: 'DBQ-Spine', title: 'DBQ — Diseases of the Spine',                pages: 6,  status: 'Sent to MD',  statusColor: 'bg-amber-100 text-amber-700',  note: 'Sent to Dr. Patel for completion' },
        ].map((f, i) => (
          <div key={i} className="flex items-start gap-3 p-2 rounded border border-indigo-100 bg-indigo-50 text-xs">
            <div className="w-14 text-center text-xs font-bold text-white bg-indigo-600 py-1 px-1 rounded flex-shrink-0">{f.form}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 leading-tight">{f.title}</p>
              <p className="text-gray-500">{f.pages} pages · {f.note}</p>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${f.statusColor}`}>{f.status}</span>
          </div>
        ))}
      </div>
    ),
    aiSummary: 'EarnedIT pre-populates all required forms from data already collected — the veteran only reviews, not types. DBQ forms are sent directly to treating physicians with a secure link.',
    insights: [
      { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50 border-green-200', title: '80% of form fields auto-populated', detail: '21-526EZ has 68 fields. EarnedIT pre-fills 54 of them from FHIR, service history, and intake data. Veteran only reviews.' },
      { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', title: 'Always current form version', detail: 'VA updated 21-526EZ on September 1, 2024. Forms API ensures EarnedIT used the new version 30 minutes after publication.' },
      { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: 'DBQ sent directly to physicians', detail: 'DBQ-PTSD sent to Dr. Chen with a secure fill link. Physician completes digitally — no printing, faxing, or lost forms.' },
    ],
    talkingPoints: [
      'VA updated the 21-526EZ on September 1, 2024. Veterans using outdated forms get their claim returned — adds 60+ days.',
      'EarnedIT pre-populates 80% of form fields from data already collected — veteran spends 5 minutes reviewing, not 2 hours filling.',
      'DBQ forms (Disability Benefits Questionnaires) are the most powerful evidence for rating decisions — sent directly to treating physicians.',
      '21-0781 (PTSD stressor statement) is auto-drafted from service history deployment data — veteran just reviews and signs.',
      '21-4142 (release of information) signed once during onboarding — VA can pull all treatment records automatically.',
      'Form version is logged with every submission — if VA disputes what was submitted, EarnedIT has the exact version and timestamp.',
    ],
  },

  // ── Scenario 13: System Health ─────────────────────────────────────────────
  {
    id: 13, title: 'VA API System Health Monitor', icon: BarChart3,
    api: 'platform/system/v1', auth: 'None (public)',
    scope: null,
    endpoint: '/platform/system/v1/status',
    method: 'GET',
    tagline: 'Real-time VA API uptime monitoring — graceful degradation when VA systems go down',
    authTitle: 'VA API Health — Public Status Endpoint',
    authDescription: 'EarnedIT monitors VA API health every 5 minutes. When VA Lighthouse has maintenance windows or outages, EarnedIT shows veterans the expected recovery time and falls back to cached data — no broken screens, no confusing errors.',
    dataReturned: 'Per-API uptime status, incident history, scheduled maintenance windows, response time percentiles',
    accentColor: '#15803d', accentBg: 'bg-green-50', accentBorder: 'border-green-200',
    oauthSteps: [
      { icon: Globe,    label: 'No auth required — public status endpoint',        ms: 300 },
      { icon: Wifi,     label: 'Calling GET /platform/system/v1/status',           ms: 600 },
      { icon: Database, label: 'Health data received — all services nominal',      ms: 300 },
    ],
    ApiCallPanel: () => (
      <ApiResponseCard method="GET" path="/platform/system/v1/status" responseTime="200 OK · ~89ms">
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs font-bold text-green-700">status: UP — All systems nominal</span>
          <span className="ml-auto text-[10px] text-green-500">No auth required</span>
        </div>
        {[
          { name: 'VA FHIR R4',         uptime: '99.94%', p95: '312ms' },
          { name: 'Benefits Intake v2', uptime: '99.87%', p95: '618ms' },
          { name: 'Claims v2',          uptime: '99.91%', p95: '301ms' },
          { name: 'Appeals v1',         uptime: '99.83%', p95: '289ms' },
          { name: 'Community Care v0',  uptime: '99.76%', p95: '221ms' },
          { name: 'VA Facilities v1',   uptime: '99.98%', p95: '198ms' },
          { name: 'Service History v1', uptime: '99.89%', p95: '297ms' },
        ].map((svc, i) => (
          <div key={i} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="flex-1 text-gray-800 font-medium">{svc.name}</span>
            <span className="text-gray-400 font-mono text-[10px]">{svc.p95}</span>
            <span className="text-green-600 font-bold text-[10px] w-12 text-right">{svc.uptime}</span>
          </div>
        ))}
      </ApiResponseCard>
    ),
    DataCard: () => (
      <div className="bg-white rounded-xl border p-5 space-y-4 h-full">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">VA Lighthouse API Status</h3>
          <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> All Systems UP
          </span>
        </div>
        {[
          { name: 'VA FHIR R4',         uptime: '99.94%', p95: '312ms',  status: 'UP' },
          { name: 'Benefits Intake v2', uptime: '99.87%', p95: '618ms',  status: 'UP' },
          { name: 'Claims v2',          uptime: '99.91%', p95: '301ms',  status: 'UP' },
          { name: 'Appeals v1',         uptime: '99.83%', p95: '289ms',  status: 'UP' },
          { name: 'Community Care v0',  uptime: '99.76%', p95: '221ms',  status: 'UP' },
          { name: 'VA Facilities v1',   uptime: '99.98%', p95: '198ms',  status: 'UP' },
          { name: 'Service History v1', uptime: '99.89%', p95: '297ms',  status: 'UP' },
        ].map((svc, i) => (
          <div key={i} className="flex items-center gap-2 text-xs border-b last:border-0 pb-1.5 last:pb-0">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="flex-1 font-medium text-gray-800">{svc.name}</span>
            <span className="text-gray-500">{svc.p95}</span>
            <span className="text-green-600 font-semibold w-14 text-right">{svc.uptime}</span>
          </div>
        ))}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
          <p className="font-semibold">Scheduled Maintenance</p>
          <p>Benefits Intake: Sun March 8, 02:00–04:00 ET — EarnedIT will queue submissions</p>
        </div>
      </div>
    ),
    aiSummary: 'EarnedIT monitors VA API health every 5 minutes. Maintenance windows trigger automatic queuing — document submissions are held and re-sent when VA systems come back online.',
    insights: [
      { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50 border-green-200', title: 'All 7 VA APIs nominal — 99.9%+ uptime', detail: 'VA Lighthouse maintains SLA uptime above 99.7% for all core APIs. EarnedIT monitors independently to verify.' },
      { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', title: 'Maintenance window queuing', detail: 'Benefits Intake maintenance Sunday 2–4 AM ET. EarnedIT queues document submissions and auto-retries after the window closes.' },
      { icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: 'Graceful degradation', detail: 'If FHIR goes down, EarnedIT shows cached health records from the last successful pull with a "last updated" timestamp.' },
    ],
    talkingPoints: [
      'VA Lighthouse maintains 99.9%+ uptime across all 13 APIs — but outages do happen, typically for maintenance windows.',
      'EarnedIT monitors health every 5 minutes and shows veterans a clear message when VA systems are temporarily unavailable.',
      'Maintenance windows are published in advance — EarnedIT reads the schedule and shows veterans when to expect delays.',
      'Document submissions during outages are queued automatically — veterans don\'t need to retry manually.',
      'Cached data strategy: if any API is down, EarnedIT shows the most recent successful response with a timestamp.',
      'For investors: this demonstrates EarnedIT\'s resilience architecture — no single VA API outage breaks the veteran experience.',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function VAApiScenariosPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [pageTab, setPageTab] = useState('workflow'); // 'workflow' | 'scenarios'
  const total = SCENARIOS.length;
  const scenario = SCENARIOS[activeIdx];

  const goTo = (idx) => {
    if (idx >= 0 && idx < total) setActiveIdx(idx);
  };

  return (
    <VeteranLayout>
      <div className="min-h-full bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">VA API Integration</h1>
              <p className="mt-1 text-gray-500">
                Live demo of all <span className="font-medium text-gray-700">VA Lighthouse API integrations</span> — step-by-step workflow
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-medium">Sandbox</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 font-medium flex items-center gap-1">
                <Wifi className="h-3 w-3" /> VA Connected
              </span>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-white border rounded-xl p-1 w-fit">
            <button
              onClick={() => setPageTab('workflow')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pageTab === 'workflow' ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              style={pageTab === 'workflow' ? { background: APP_NAVY } : {}}
            >
              Live Workflow Demo
            </button>
            <button
              onClick={() => setPageTab('scenarios')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pageTab === 'scenarios' ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              style={pageTab === 'scenarios' ? { background: APP_NAVY } : {}}
            >
              API Scenarios
            </button>
          </div>

          {/* Live Workflow tab */}
          {pageTab === 'workflow' && <VAWorkflowDemo />}

          {/* API Scenarios tab */}
          {pageTab === 'scenarios' && (<>

          {/* Flow stepper */}
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Scenario <span style={{ color: APP_NAVY }}>{scenario.id}</span> of {total}
                <span className="ml-2 text-gray-400 font-normal">— {scenario.title}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goTo(activeIdx - 1)}
                  disabled={activeIdx === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  onClick={() => goTo(activeIdx + 1)}
                  disabled={activeIdx === total - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  style={{ background: APP_NAVY }}
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Step dots */}
            <div className="flex items-end gap-1 overflow-x-auto pb-1">
              {SCENARIOS.map((s, i) => {
                const SIcon = s.icon;
                const isActive = i === activeIdx;
                const isDone   = i < activeIdx;
                return (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    className="flex flex-col items-center gap-1 flex-shrink-0 group"
                    style={{ minWidth: 52 }}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 ${
                      isActive ? 'text-white border-transparent shadow-md'
                      : isDone  ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-gray-100 border-gray-200 text-gray-400 group-hover:border-gray-400'
                    }`} style={isActive ? { background: APP_NAVY } : {}}>
                      {isDone
                        ? <CheckCircle className="h-4 w-4" />
                        : <SIcon className="h-4 w-4" />}
                    </div>
                    <span className={`text-[9px] font-medium leading-tight text-center w-full truncate ${
                      isActive ? 'text-gray-900' : isDone ? 'text-green-600' : 'text-gray-400'
                    }`}>{s.id}. {s.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${((activeIdx + 1) / total) * 100}%`, background: APP_NAVY }}
              />
            </div>
          </div>

          {/* Active scenario — key forces remount (resets OAuth animation) */}
          <ScenarioLayout key={scenario.id} scenario={scenario} />

          {/* Bottom navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => goTo(activeIdx - 1)}
              disabled={activeIdx === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              {activeIdx > 0 ? `Scenario ${SCENARIOS[activeIdx - 1].id}: ${SCENARIOS[activeIdx - 1].title}` : 'Previous'}
            </button>
            <span className="text-xs text-gray-400">{activeIdx + 1} / {total} scenarios</span>
            <button
              onClick={() => goTo(activeIdx + 1)}
              disabled={activeIdx === total - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{ background: APP_NAVY }}
            >
              {activeIdx < total - 1 ? `Scenario ${SCENARIOS[activeIdx + 1].id}: ${SCENARIOS[activeIdx + 1].title}` : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          </>)}

        </div>
      </div>
    </VeteranLayout>
  );
}
