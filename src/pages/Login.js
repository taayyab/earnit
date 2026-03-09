import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { idmeAPI, authAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield, AlertCircle, ExternalLink, User, Users, Briefcase, Building, ArrowLeft, LogIn, Play, ChevronRight, Eye, EyeOff } from 'lucide-react';
import logoImage from '../assets/logo.webp';
import { toast } from 'sonner';
import IDmeFlowModal from '../components/IDmeFlowModal';

export default function Login() {
  const [mode, setMode] = useState('environment');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [idmeLoading, setIdmeLoading] = useState(false);
  const [idmeAvailable, setIdmeAvailable] = useState(false);
  const [idmeChecked, setIdmeChecked] = useState(false);
  const [showIdmeModal, setShowIdmeModal] = useState(false);
  const [selectedDemoAccount, setSelectedDemoAccount] = useState(null);
  const { login, demoLogin: authDemoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    checkIdmeStatus();
    handleIdmeCallback();
  }, []);

  const roleRoutes = {
    'veteran': '/dashboard',
    'peer_mentor': '/mentor',
    'peer_supporter': '/mentor',
    'veteran_advocate': '/mentor',
    'advocate': '/mentor',
    'claims_agent': '/agent',
    'agent': '/agent',
    'partner_admin': '/partner/dashboard',
    'provider': '/provider/dashboard',
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(roleRoutes[user.role] || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const checkIdmeStatus = async () => {
    try {
      const response = await idmeAPI.getStatus();
      setIdmeAvailable(response.data.configured);
    } catch (err) {
      setIdmeAvailable(false);
    } finally {
      setIdmeChecked(true);
    }
  };

  const handleIdmeCallback = async () => {
    const idmeSuccess = searchParams.get('idme_success') === 'true';
    const isNewUser = searchParams.get('is_new_user') === 'true';
    const userId = searchParams.get('user_id');
    const vaStatus = searchParams.get('va_status'); // 'confirmed' | 'not_confirmed'

    if (!idmeSuccess || !userId) return;

    try {
      // Temporarily store the user_id so the axios interceptor sends x-user-id header
      // when calling getSession() below.
      localStorage.setItem('user', JSON.stringify({ user_id: userId }));

      const response = await authAPI.getSession();

      if (response.data.authenticated && response.data.user) {
        const serverUser = response.data.user;

        const userData = {
          ...serverUser,
          user_id: serverUser.id || userId,
          idme_verified: true,
          va_verified: vaStatus === 'confirmed',
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('mfaVerified', 'true');
        localStorage.removeItem('onboarding_completed');

        // Show VA verification result
        if (vaStatus === 'confirmed') {
          toast.success('Veteran status confirmed by VA. Welcome to EarnedIT!');
        } else {
          toast.warning(
            'Signed in with ID.me. VA verification is pending — you can retry from your profile settings.'
          );
        }

        if (isNewUser) {
          navigate('/document-onboarding', { replace: true });
        } else {
          navigate(roleRoutes[serverUser.role] || '/dashboard', { replace: true });
        }

        window.location.reload();
      } else {
        // Clean up temp storage
        localStorage.removeItem('user');
        toast.error('ID.me authentication failed. Please try again.');
      }
    } catch (err) {
      localStorage.removeItem('user');
      console.error('Session validation failed:', err);
      toast.error('Failed to complete ID.me login. Please try again.');
    }
  };

  const handleIdmeLogin = async () => {
    // If real API isn't configured, show the demo modal flow
    if (!idmeAvailable) {
      setShowIdmeModal(true);
      return;
    }

    setIdmeLoading(true);
    setError('');

    try {
      const response = await idmeAPI.getLoginUrl();
      if (response.data.login_url) {
        window.location.href = response.data.login_url;
      }
    } catch (err) {
      setError('Failed to connect to ID.me. Please try again.');
      setIdmeLoading(false);
    }
  };

  const handleIdmeDemoSuccess = async (fullName) => {
    setShowIdmeModal(false);
    setDemoLoading(true);
    try {
      const nameParts = (fullName || 'Veteran User').trim().split(' ');
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(' ') || null;

      const response = await authAPI.idmeVerify({ first_name, last_name });
      const userData = {
        ...response.data,
        id: response.data.user_id,
        idme_verified: true,
        va_verified: true,
      };
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('mfaVerified', 'true');
      localStorage.setItem('mfaRequired', 'false');
      localStorage.removeItem('onboarding_completed');
      toast.success(`Welcome, ${fullName}! Verified via ID.me.`);
      navigate('/document-onboarding', { replace: true });
      window.location.reload();
    } catch {
      setError('ID.me verification failed. Please try again.');
      setDemoLoading(false);
    }
  };

  const demoAccounts = [
    {
      type: 'veteran',
      label: 'Demo Veteran',
      name: 'Marcus Johnson',
      icon: User,
      description: 'Experience the full claims journey with pre-loaded documents, veteran advocate support, and claim tracking.',
      color: 'bg-blue-500',
      route: '/dashboard'
    },
    {
      type: 'veteran_advocate',
      label: 'Veteran Advocate',
      name: 'Sarah Mitchell',
      icon: Users,
      description: 'View the supporter dashboard with assigned veterans and pending connection requests.',
      color: 'bg-emerald-500',
      route: '/mentor'
    },
    {
      type: 'claims_agent',
      label: 'Claims Agent',
      name: 'David Chen',
      icon: Briefcase,
      description: 'Access the claims agent workflow with client management and case processing.',
      color: 'bg-blue-500',
      route: '/agent'
    },
    {
      type: 'partner_admin',
      label: 'Partner Admin',
      name: 'Jennifer Williams',
      icon: Building,
      description: 'Manage VSO organization settings, team members, and client referrals.',
      color: 'bg-amber-500',
      route: '/partner/dashboard'
    }
  ];

  const handleDemoLogin = async (accountType) => {
    setDemoLoading(true);
    setSelectedDemoAccount(accountType);
    setError('');

    try {
      await authDemoLogin(accountType);

      const account = demoAccounts.find(a => a.type === accountType);
      toast.success(`Welcome, ${account?.name}!`);
      // Navigation handled by the useEffect that watches isAuthenticated
    } catch (err) {
      setError('Failed to start demo. Please try again.');
      setDemoLoading(false);
      setSelectedDemoAccount(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);

      if (userData.mfa_required) {
        navigate('/mfa-verify', { replace: true });
        return;
      }

      navigate(roleRoutes[userData.role] || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError('');
    if (mode === 'production' || mode === 'demo') {
      setMode('environment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" data-testid="login-page">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImage} alt="EarnedIT" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-[#1B3A5F]">EarnedIT</h1>
              <p className="text-xs text-slate-500">Veteran Benefits Platform</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 min-h-[calc(100vh-80px)]">
        {/* Initial View */}
        {mode === 'initial' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="mb-8">
              <img src={logoImage} alt="EarnedIT" className="h-24 w-auto mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-[#1B3A5F] mb-2">EarnedIT</h1>
              <p className="text-lg text-slate-600">Veteran Benefits Platform</p>
            </div>

            <div className="max-w-md mb-8">
              <p className="text-slate-600 leading-relaxed">
                Streamline your VA disability claims with AI-powered analysis,
                veteran advocate support, and expert guidance every step of the way.
              </p>
            </div>

            <Button
              size="lg"
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-12 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={() => setMode('environment')}
              data-testid="initial-sign-in"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>

            <p className="mt-6 text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#DC2626] font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>
        )}

        {/* Environment Selector */}
        {mode === 'environment' && (
          <div className="w-full max-w-2xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#1B3A5F] mb-2">Choose Your Environment</h2>
              <p className="text-slate-600">Select how you'd like to access the platform</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card
                className="cursor-pointer border-2 border-transparent hover:border-[#DC2626] hover:shadow-lg transition-all group"
                onClick={() => setMode('production')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setMode('production')}
                role="button"
                aria-label="Continue with production login"
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#DC2626]/10 flex items-center justify-center mb-4 group-hover:bg-[#DC2626] transition-colors">
                    <Shield className="h-8 w-8 text-[#DC2626] group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-xl">Production Login</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 text-sm mb-4">
                    Access your real account with secure authentication.
                    Use your credentials or ID.me for VA-verified login.
                  </p>
                  <div className="flex items-center justify-center text-[#DC2626] font-medium text-sm">
                    Continue
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border-2 border-transparent hover:border-amber-500 hover:shadow-lg transition-all group"
                onClick={() => setMode('demo')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setMode('demo')}
                role="button"
                aria-label="Explore demo environment"
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                    <Play className="h-8 w-8 text-amber-600 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-xl">Demo Environment</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 text-sm mb-4">
                    Explore the platform with pre-loaded sample data.
                    Try different user roles without creating an account.
                  </p>
                  <div className="flex items-center justify-center text-amber-600 font-medium text-sm">
                    Explore Demo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Production Login Form */}
        {mode === 'production' && (
          <div className="w-full max-w-md mx-auto px-4">
            <button
              onClick={goBack}
              className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>

            <Card>
              <CardHeader className="space-y-1 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#DC2626]/10 flex items-center justify-center mb-2">
                  <Shield className="h-6 w-6 text-[#DC2626]" />
                </div>
                <CardTitle className="text-2xl font-bold">Production Login</CardTitle>
                <CardDescription>
                  Sign in to your EarnedIT account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50" data-testid="login-error">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {idmeChecked && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mb-3 border-2 border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-all"
                      onClick={handleIdmeLogin}
                      disabled={idmeLoading}
                    >
                      {idmeLoading ? (
                        'Connecting to ID.me...'
                      ) : (
                        <>
                          <img
                            src="https://cdn.id.me/images/logos/idme-logo-compact.svg"
                            alt="ID.me"
                            className="h-5 mr-2"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          Sign in with ID.me
                          {!idmeAvailable && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Demo</span>
                          )}
                        </>
                      )}
                    </Button>

                    {!idmeAvailable && (
                      <p className="text-xs text-center text-slate-400 mb-3">
                        Simulates the full ID.me verification flow
                      </p>
                    )}

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-500">
                          Or use email
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      data-testid="email-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        data-testid="password-input"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#DC2626] hover:bg-[#B91C1C]"
                    disabled={loading}
                    data-testid="login-submit-button"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <p className="text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[#DC2626] hover:underline font-medium">
                      Register here
                    </Link>
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Demo Account Gallery */}
        {mode === 'demo' && (
          <div className="w-full max-w-4xl mx-auto px-4">
            <button
              onClick={goBack}
              className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>

            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Play className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1B3A5F] mb-2">Demo Environment</h2>
              <p className="text-slate-600">Select an account to explore the platform</p>
            </div>

            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 max-w-md mx-auto">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {demoAccounts.map((account) => {
                const IconComponent = account.icon;
                const isLoading = demoLoading && selectedDemoAccount === account.type;
                const isDisabled = demoLoading && selectedDemoAccount !== account.type;

                return (
                  <Card
                    key={account.type}
                    className={`cursor-pointer border-2 transition-all ${
                      isLoading
                        ? 'border-[#1B3A5F] shadow-lg'
                        : isDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'border-transparent hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => !demoLoading && handleDemoLogin(account.type)}
                    tabIndex={demoLoading ? -1 : 0}
                    onKeyDown={(e) => e.key === 'Enter' && !demoLoading && handleDemoLogin(account.type)}
                    role="button"
                    aria-label={`Login as ${account.label}`}
                    aria-disabled={demoLoading}
                    data-testid={`demo-login-${account.type}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full ${account.color} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-slate-900">{account.label}</h3>
                            {isLoading && (
                              <span className="text-xs text-[#1B3A5F] animate-pulse">Loading...</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mb-2">{account.name}</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{account.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <p className="text-center text-sm text-slate-500 mt-6">
              All demo accounts use simulated data. No real veteran information is stored.
            </p>
          </div>
        )}
      </div>

      <IDmeFlowModal
        open={showIdmeModal}
        onClose={() => setShowIdmeModal(false)}
        onSuccess={handleIdmeDemoSuccess}
      />
    </div>
  );
}
