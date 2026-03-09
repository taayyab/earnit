import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield, Play, AlertCircle, CheckCircle, User, Users, Briefcase, Building, Stethoscope, ArrowRight } from 'lucide-react';
import logoImage from '../assets/logo.webp';
import { toast } from 'sonner';
import api from '../lib/api';

const DEMO_ACCOUNTS = [
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Marcus Johnson - Sample veteran profile with claims',
    icon: User,
    dashboard: '/dashboard'
  },
  {
    id: 'provider',
    name: 'Healthcare Provider',
    description: 'Dr. Michael Rodriguez - Community care provider',
    icon: Stethoscope,
    dashboard: '/provider/dashboard'
  },
  {
    id: 'veteran_advocate',
    name: 'Veteran Advocate',
    description: 'Sarah Mitchell - Support veterans with claims',
    icon: Users,
    dashboard: '/mentor'
  },
  {
    id: 'claims_agent',
    name: 'Claims Agent',
    description: 'David Chen - Process and review claims',
    icon: Briefcase,
    dashboard: '/agent'
  },
  {
    id: 'partner_admin',
    name: 'Partner Admin',
    description: 'Jennifer Williams - Partner organization admin',
    icon: Building,
    dashboard: '/partner/dashboard'
  }
];

export default function DemoLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('veteran');
  // Name prompt for veteran
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { isAuthenticated, user, demoLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const account = DEMO_ACCOUNTS.find(a => a.id === selectedAccount);
      navigate(`${account?.dashboard || '/dashboard'}?demo=true`, { replace: true });
    }
  }, [isAuthenticated, user, navigate, selectedAccount]);

  const handleDemoAccess = async (accountType) => {
    // For veteran, ask for name first
    if (accountType === 'veteran' && !showNamePrompt) {
      setSelectedAccount(accountType);
      setShowNamePrompt(true);
      return;
    }
    setLoading(true);
    setError('');
    setSelectedAccount(accountType);

    try {
      const userData = await demoLogin(accountType);

      // Update veteran name if provided
      if (accountType === 'veteran' && (firstName.trim() || lastName.trim())) {
        try {
          await api.patch('/users/me/name', {
            first_name: firstName.trim() || userData.first_name,
            last_name: lastName.trim() || userData.last_name,
          });
          localStorage.setItem('demo_display_name', `${firstName.trim()} ${lastName.trim()}`.trim());
        } catch (nameErr) {
          // Name update is best-effort; don't block login
          localStorage.setItem('demo_display_name', `${firstName.trim()} ${lastName.trim()}`.trim());
        }
      }

      setSuccess(true);
      const displayName = firstName.trim() || userData.first_name;
      toast.success(`Welcome to the EarnedIT Demo, ${displayName}!`);

      const account = DEMO_ACCOUNTS.find(a => a.id === accountType);
      setTimeout(() => {
        navigate(`${account?.dashboard || '/dashboard'}?demo=true`, { replace: true });
      }, 1000);
    } catch (err) {
      console.error('Demo login failed:', err);
      setError('Failed to access demo. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-6">
            <img src={logoImage} alt="EarnedIT" className="h-16 w-auto mx-auto" />
          </div>
          <div className="mx-auto w-20 h-20 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-[#1B3A5F]" />
          </div>
          <CardTitle className="text-2xl text-[#1B3A5F]">VA Lighthouse Demo Access</CardTitle>
          <CardDescription className="text-base mt-2">
            Select an account type to explore the EarnedIT platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8 pb-8">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Demo access granted. Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          {/* Name prompt for Demo Veteran */}
          {showNamePrompt ? (
            <div className="border border-[#1B3A5F]/20 rounded-xl p-5 bg-[#1B3A5F]/3 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-[#1B3A5F]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1B3A5F]">What's your name?</p>
                  <p className="text-xs text-slate-500">This name will appear throughout the platform</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="e.g. James"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5F]/30"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && firstName.trim() && handleDemoAccess('veteran')}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="e.g. Wilson"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5F]/30"
                    onKeyDown={e => e.key === 'Enter' && firstName.trim() && handleDemoAccess('veteran')}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNamePrompt(false)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-[#1B3A5F] hover:bg-[#0f2340] text-white"
                  onClick={() => handleDemoAccess('veteran')}
                  disabled={!firstName.trim() || loading}
                >
                  {loading ? (
                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />Entering Demo...</>
                  ) : (
                    <>Continue <ArrowRight className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              return (
                <Button
                  key={account.id}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-start text-left hover:bg-gray-50 hover:border-gray-300 transition-all ${
                    selectedAccount === account.id && loading ? 'border-[#1B3A5F] bg-[#1B3A5F]/5' : ''
                  }`}
                  onClick={() => handleDemoAccess(account.id)}
                  disabled={loading || success}
                >
                  <div className="flex items-center gap-3 w-full mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-[#1B3A5F]" />
                    </div>
                    <span className="font-semibold text-[#1B3A5F]">{account.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-13">{account.description}</p>
                  {loading && selectedAccount === account.id && (
                    <div className="mt-2 flex items-center gap-2 text-[#1B3A5F]">
                      <div className="animate-spin h-4 w-4 border-2 border-[#1B3A5F] border-t-transparent rounded-full" />
                      <span className="text-xs">Logging in...</span>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">Demo Environment Features:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Pre-loaded sample data for each role</li>
              <li>Full platform access for review</li>
              <li>No real credentials required</li>
              <li>All VA Lighthouse integrations in sandbox mode</li>
            </ul>
          </div>

          <p className="text-center text-sm text-slate-500 pt-2">
            This demo environment is for VA Lighthouse evaluation only.
            <br />
            <a href="/login" className="text-[#1B3A5F] hover:underline">
              Return to standard login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
