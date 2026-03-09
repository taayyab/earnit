import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../lib/api';

// This page lives at /auth/callback
// VA redirects here after OAuth login: https://earnedit.com/auth/callback?code=xxx&state=xxx
// It calls the backend to complete the token exchange, then closes the popup.
export default function VAOAuthCallback() {
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      setStatus('error');
      setMessage(`VA declined access: ${error}`);
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setMessage('Missing OAuth parameters.');
      return;
    }

    // Call backend to exchange code for token
    api.post('/va/oauth/exchange', { code, state })
      .then(() => {
        setStatus('success');
        setMessage('Authentication complete!');
        // Notify the opener window and close this popup after a short delay
        if (window.opener) {
          window.opener.postMessage({ type: 'VA_OAUTH_SUCCESS' }, '*');
        }
        setTimeout(() => window.close(), 1500);
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
