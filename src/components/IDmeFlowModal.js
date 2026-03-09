import React, { useState, useEffect, useRef } from 'react';
import { Shield, Camera, Video, Network, CheckCircle, ArrowRight, ArrowLeft, X, Upload, Eye, EyeOff, AlertCircle, Loader2, Lock, Fingerprint, IdCard, FileCheck } from 'lucide-react';

const APP_RED = '#DC2626';
const APP_NAVY = '#1B3A5F';
const APP_GREEN = '#16A34A';

const steps = ['welcome', 'signin', 'method', 'scan', 'va_check', 'success'];

const VA_CHECK_STEPS = [
  { label: 'Contacting VA database...', duration: 1200 },
  { label: 'Verifying service history...', duration: 1000 },
  { label: 'Confirming veteran status...', duration: 1100 },
  { label: 'Checking disability ratings...', duration: 900 },
];

export default function IDmeFlowModal({ open, onClose, onSuccess, userName = 'Verified Veteran' }) {
  const cardRef = useRef(null);
  const [step, setStep] = useState('welcome');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState(null);
  const [fileDropped, setFileDropped] = useState(false);
  const [selfieCapturing, setSelfieCapturing] = useState(false);
  const [selfieCapture, setSelfieCapture] = useState(false);
  const [vaStepIndex, setVaStepIndex] = useState(0);
  const [vaDone, setVaDone] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('welcome');
      setFullName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setMethod(null);
      setFileDropped(false);
      setSelfieCapturing(false);
      setSelfieCapture(false);
      setVaStepIndex(0);
      setVaDone(false);
    }
  }, [open]);

  // VA check animation
  useEffect(() => {
    if (step !== 'va_check') return;
    let idx = 0;
    const run = () => {
      if (idx >= VA_CHECK_STEPS.length) {
        setVaDone(true);
        return;
      }
      const dur = VA_CHECK_STEPS[idx].duration;
      setVaStepIndex(idx);
      idx++;
      setTimeout(run, dur);
    };
    const t = setTimeout(run, 400);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (vaDone) {
      const t = setTimeout(() => setStep('success'), 800);
      return () => clearTimeout(t);
    }
  }, [vaDone]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      onClose();
    }
  };

  const simulateSelfie = () => {
    setSelfieCapturing(true);
    setTimeout(() => {
      setSelfieCapturing(false);
      setSelfieCapture(true);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={handleBackdropClick}
    >
      <div ref={cardRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* ID.me Header Bar */}
        <div className="relative" style={{ background: APP_RED }}>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              {/* ID.me wordmark style */}
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
                  <Shield className="h-4 w-4" style={{ color: APP_RED }} />
                </div>
                <span className="text-white font-bold text-lg tracking-tight">ID<span className="text-red-200">.</span>me</span>
              </div>
              <span className="text-red-200 text-xs border border-red-300 rounded px-1.5 py-0.5 ml-1">Secure Identity</span>
            </div>
            <button
              onClick={onClose}
              className="text-red-200 hover:text-white transition-colors rounded-full p-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Demo badge */}
          <div className="bg-amber-400 text-amber-900 text-xs font-semibold text-center py-1 px-3">
            DEMO MODE — Simulated ID.me Flow
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">

          {/* ── WELCOME ── */}
          {step === 'welcome' && (
            <div className="text-center space-y-5">
              <div>
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: `${APP_RED}15` }}>
                  <Fingerprint className="h-8 w-8" style={{ color: APP_RED }} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Verify your identity with ID.me</h2>
                <p className="text-sm text-gray-500 mt-2">
                  EarnedIT uses ID.me to securely verify veteran status with the VA.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left space-y-2">
                <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">What ID.me checks:</p>
                {['Government-issued photo ID', 'Selfie liveness check', 'VA veteran status database'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-red-700">
                    <CheckCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="First Last"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => fullName.trim() && setStep('signin')}
                  disabled={!fullName.trim()}
                  className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: APP_RED }}
                >
                  Sign in to ID.me
                </button>
                <button
                  onClick={() => fullName.trim() && setStep('signin')}
                  disabled={!fullName.trim()}
                  className="w-full py-3 rounded-lg font-semibold text-sm border-2 transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderColor: APP_RED, color: APP_RED }}
                >
                  Create an ID.me account
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                By continuing, you agree to ID.me's{' '}
                <span className="underline cursor-pointer" style={{ color: APP_RED }}>Terms of Service</span> and{' '}
                <span className="underline cursor-pointer" style={{ color: APP_RED }}>Privacy Policy</span>.
              </p>
            </div>
          )}

          {/* ── SIGN IN ── */}
          {step === 'signin' && (
            <div className="space-y-4">
              <button onClick={() => setStep('welcome')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 -mt-1 mb-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Sign in to ID.me</h2>
                <p className="text-sm text-gray-500 mt-1">Enter your ID.me credentials</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': APP_RED }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Your ID.me password"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  Remember me
                </label>
                <span className="cursor-pointer text-sm" style={{ color: APP_RED }}>Forgot password?</span>
              </div>

              <button
                onClick={() => setStep('method')}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: APP_RED }}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-gray-400 uppercase">Or verify with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {['USAA', 'TriWest', 'DS Logon', 'CAC Card'].map(net => (
                  <button
                    key={net}
                    onClick={() => setStep('method')}
                    className="py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── METHOD SELECTION ── */}
          {step === 'method' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Choose Verification Method</h2>
                <p className="text-sm text-gray-500 mt-1">How would you like to verify your identity?</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'selfservice',
                    icon: Camera,
                    title: 'Self-Service',
                    desc: 'Photo of your ID + selfie. Takes about 5 minutes.',
                    badge: 'Recommended',
                    badgeColor: 'bg-green-100 text-green-700',
                  },
                  {
                    id: 'video',
                    icon: Video,
                    title: 'Video Call',
                    desc: 'Live verification with an ID.me agent. 10–15 minutes.',
                    badge: 'Most Secure',
                    badgeColor: 'bg-slate-100 text-slate-700',
                  },
                  {
                    id: 'network',
                    icon: Network,
                    title: 'Trusted Network',
                    desc: 'Use existing credentials from USAA, TriWest, or DS Logon.',
                    badge: 'Fastest',
                    badgeColor: 'bg-amber-100 text-amber-700',
                  },
                ].map(opt => {
                  const Icon = opt.icon;
                  const selected = method === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setMethod(opt.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                        selected ? 'border-[#DC2626] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-[#DC2626]' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${selected ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900 text-sm">{opt.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${opt.badgeColor}`}>{opt.badge}</span>
                        </div>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                      {selected && <CheckCircle className="h-5 w-5 text-[#DC2626] flex-shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => method && setStep('scan')}
                disabled={!method}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: APP_RED }}
              >
                Continue with {method === 'selfservice' ? 'Self-Service' : method === 'video' ? 'Video Call' : method === 'network' ? 'Trusted Network' : '...'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── SCAN / UPLOAD ── */}
          {step === 'scan' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {method === 'video' ? 'Joining Video Verification' : method === 'network' ? 'Network Verification' : 'Upload Your ID'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {method === 'selfservice'
                    ? 'Upload a clear photo of your government-issued ID.'
                    : method === 'video'
                    ? 'An ID.me agent will verify your identity on camera.'
                    : 'Connecting to your trusted network credentials.'}
                </p>
              </div>

              {method === 'selfservice' && (
                <>
                  {/* ID Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      fileDropped ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onClick={() => setFileDropped(true)}
                  >
                    {fileDropped ? (
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <FileCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="font-medium text-green-700 text-sm">drivers_license.jpg uploaded</p>
                        <p className="text-xs text-green-600">Clear photo detected ✓</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <IdCard className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-700 text-sm">Tap to upload your ID</p>
                        <p className="text-xs text-gray-400">Driver's license, passport, state ID</p>
                      </div>
                    )}
                  </div>

                  {/* Selfie Section */}
                  <div className="border-2 border-dashed rounded-xl p-5 text-center transition-colors border-gray-300">
                    {selfieCapture ? (
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="font-medium text-green-700 text-sm">Selfie captured</p>
                        <p className="text-xs text-green-600">Liveness check passed ✓</p>
                      </div>
                    ) : selfieCapturing ? (
                      <div className="space-y-2">
                        <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center animate-pulse" style={{ background: APP_RED }}>
                          <Camera className="h-7 w-7 text-white" />
                        </div>
                        <p className="font-medium text-sm" style={{ color: APP_RED }}>Look straight at the camera...</p>
                        <div className="flex justify-center gap-1">
                          {[0,1,2].map(i => (
                            <div key={i} className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={simulateSelfie}
                          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                          style={{ background: APP_RED }}
                        >
                          <Camera className="h-7 w-7 text-white" />
                        </button>
                        <p className="font-medium text-gray-700 text-sm">Take a selfie for liveness check</p>
                        <p className="text-xs text-gray-400">Center your face in the camera</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {method === 'video' && (
                <div className="bg-gray-900 rounded-xl p-8 text-center space-y-3">
                  <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center animate-pulse" style={{ background: APP_RED }}>
                    <Video className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-white font-semibold">Connecting to ID.me agent...</p>
                  <p className="text-gray-400 text-sm">Estimated wait: 2–5 minutes</p>
                  <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Camera and mic ready
                  </div>
                </div>
              )}

              {method === 'network' && (
                <div className="space-y-3">
                  {['USAA', 'TriWest', 'DS Logon'].map(net => (
                    <div key={net} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="font-medium text-sm text-gray-700">{net}</span>
                      <span className="text-xs text-gray-400">Checking credentials...</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep('va_check')}
                disabled={method === 'selfservice' && (!fileDropped || !selfieCapture)}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: APP_RED }}
              >
                {method === 'selfservice' ? 'Submit for Verification' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── VA CHECK ── */}
          {step === 'va_check' && (
            <div className="text-center space-y-5 py-2">
              <div>
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: `${APP_RED}15` }}>
                  {vaDone
                    ? <CheckCircle className="h-8 w-8 text-green-600" />
                    : <Loader2 className="h-8 w-8 animate-spin" style={{ color: APP_RED }} />
                  }
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {vaDone ? 'Verification Complete' : 'Checking VA Records'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {vaDone ? 'Your identity and veteran status have been confirmed.' : 'Securely querying the VA database...'}
                </p>
              </div>

              <div className="text-left space-y-2.5 bg-gray-50 rounded-xl p-4">
                {VA_CHECK_STEPS.map((s, i) => {
                  const done = i < vaStepIndex || vaDone;
                  const active = i === vaStepIndex && !vaDone;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      {done ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : active ? (
                        <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" style={{ color: APP_RED }} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${done ? 'text-gray-700' : active ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Lock className="h-3.5 w-3.5" />
                End-to-end encrypted · NIST 800-63-3 compliant
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <div className="text-center space-y-5 py-2">
              <div>
                <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background: `${APP_RED}15` }}>
                  <CheckCircle className="h-10 w-10" style={{ color: APP_RED }} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Identity Verified!</h2>
                <p className="text-sm text-gray-500 mt-1">Your veteran status has been confirmed by the VA.</p>
              </div>

              {/* Verified Card */}
              <div className="rounded-xl border-2 p-4 text-left space-y-3" style={{ borderColor: `${APP_NAVY}30`, background: `${APP_NAVY}08` }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${APP_NAVY}15` }}>
                    <Shield className="h-6 w-6" style={{ color: APP_NAVY }} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{fullName || userName}</p>
                    <p className="text-sm font-medium" style={{ color: APP_NAVY }}>Verified Veteran · U.S. Army</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: 'ID Verified', value: "✓ Driver's License" },
                    { label: 'Liveness', value: '✓ Selfie Match' },
                    { label: 'VA Status', value: '✓ Confirmed Veteran' },
                    { label: 'Trust Level', value: 'LOA3 (Highest)' },
                  ].map(item => (
                    <div key={item.label} className="bg-white rounded-lg p-2.5">
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSuccess(fullName || userName)}
                className="w-full py-3 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: APP_RED }}
              >
                Continue to EarnedIT
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-xs text-gray-400">
                Your ID.me verification is valid for 24 months. You won't need to reverify unless your information changes.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-center gap-2 text-xs text-gray-400 border-t border-gray-100">
          <Lock className="h-3 w-3" />
          Secured by ID.me · Trusted by 109M+ Americans
        </div>
      </div>
    </div>
  );
}
