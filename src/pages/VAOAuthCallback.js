import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../lib/api';

// This page lives at /auth/callback
// Two flows arrive here:
//
// Flow A (primary): Backend redirects here after completing token exchange with VA.
//   URL: /auth/callback?va_auth=success&api=service-history&access_token=xxx&expires_in=3600&scope=xxx
//   This page saves the token to localStorage, posts VA_OAUTH_SUCCESS to the opener, and closes.
//
// Flow B (fallback): VA redirects here with code+state, frontend calls backend /va/oauth/exchange.
//   URL: /auth/callback?code=xxx&state=xxx
//
// Being on the SAME ORIGIN as the parent window guarantees window.opener.postMessage works.
export default function VAOAuthCallback() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const vaAuth = params.get('va_auth');
    const code = params.get('code');
    const state = params.get('state');

    if (error) {
      setStatus('error');
      setMessage(`VA declined access: ${error}`);
      return;
    }

    // ── Flow A: Backend already exchanged the token and redirected here ──
    if (vaAuth === 'success') {
      const access_token = params.get('access_token');
      const expires_in = parseInt(params.get('expires_in') || '3600', 10);
      const scope = params.get('scope') || '';
      const apiName = params.get('api') || '';

      // Save to localStorage
      if (access_token) {
        localStorage.setItem('va_token', JSON.stringify({
          access_token,
          expires_at: Date.now() + expires_in * 1000,
          scope,
          api: apiName,
        }));
      }

      setStatus('success');
      setMessage('Authentication complete!');

      // Notify parent window — same origin so window.opener is guaranteed
      if (window.opener) {
        window.opener.postMessage({
          type: 'VA_OAUTH_SUCCESS',
          access_token,
          expires_in,
          scope,
          apiName,
        }, '*');
      }
      setTimeout(() => window.close(), 1200);
      return;
    }

    // ── Flow B: code+state present — call backend to exchange ──
    if (!code || !state) {
      setStatus('error');
      setMessage('Missing OAuth parameters.');
      return;
    }

    api.post('/va/oauth/exchange', { code, state })
      .then((res) => {
        const { access_token, expires_in, scope, api: apiName } = res.data;

        if (access_token) {
          localStorage.setItem('va_token', JSON.stringify({
            access_token,
            expires_at: Date.now() + (expires_in || 3600) * 1000,
            scope: scope || '',
            api: apiName || '',
          }));
        }

        setStatus('success');
        setMessage('Authentication complete!');

        if (window.opener) {
          window.opener.postMessage({
            type: 'VA_OAUTH_SUCCESS',
            access_token,
            expires_in,
            scope,
            apiName,
          }, '*');
        }
        setTimeout(() => window.close(), 1200);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Token exchange failed';
        setStatus('error');
        setMessage(msg);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8 max-w-sm w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: status === 'success' ? '#dcfce7' : status === 'error' ? '#fee2e2' : '#eff6ff' }}>
          {status === 'loading' && <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />}
          {status === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
          {status === 'error' && <XCircle className="h-8 w-8 text-red-600" />}
        </div>

        <div>
          <p className="font-bold text-gray-900 text-lg">
            {status === 'loading' && 'Completing VA Sign-In...'}
            {status === 'success' && 'Signed In Successfully'}
            {status === 'error' && 'Sign-In Failed'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {status === 'loading' && 'Exchanging authorization code with VA...'}
            {status === 'success' && 'This window will close automatically.'}
            {status === 'error' && message}
          </p>
        </div>

        {status === 'success' && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700">
            Return to EarnedIT to continue the workflow.
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => window.close()}
            className="w-full py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50"
          >
            Close Window
          </button>
        )}
      </div>
    </div>
  );
}
