import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { mfaAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield, AlertCircle, Key, Smartphone, ArrowLeft } from 'lucide-react';
import logoImage from '../assets/logo.webp';
import { toast } from 'sonner';

export default function MFAVerification() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const { completeMfaVerification, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleSubmit(null, newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleSubmit(null, pastedData);
    }
  };

  const handleSubmit = async (e, codeOverride = null) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const verificationCode = codeOverride || (useBackupCode ? backupCode : code.join(''));

    if (!verificationCode || (useBackupCode ? verificationCode.length < 8 : verificationCode.length !== 6)) {
      setError(useBackupCode ? 'Please enter your backup code' : 'Please enter the 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const response = await mfaAPI.verify(verificationCode);
      
      if (response.data.success) {
        completeMfaVerification(response.data.access_token);
        toast.success('Verification successful!');
        
        const roleRoutes = {
          'veteran': '/dashboard',
          'peer_mentor': '/mentor',
          'peer_supporter': '/mentor',
          'veteran_advocate': '/mentor',
          'claims_agent': '/agent',
          'partner_admin': '/partner'
        };
        navigate(roleRoutes[user?.role] || from);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Invalid code. Please try again.';
      setError(errorMessage);
      setCode(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white" data-testid="mfa-verification-page">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="EarnedIT" className="h-20 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-[#1B3A5F]">EarnedIT</h1>
              <p className="text-xs text-slate-500">Veteran Benefits Platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
              {useBackupCode ? (
                <Key className="h-8 w-8 text-[hsl(var(--primary))]" />
              ) : (
                <Smartphone className="h-8 w-8 text-[hsl(var(--primary))]" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {useBackupCode ? 'Enter Backup Code' : 'Two-Factor Authentication'}
            </CardTitle>
            <CardDescription>
              {useBackupCode 
                ? 'Enter one of your backup codes to continue'
                : 'Enter the 6-digit code from your authenticator app'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-[hsl(var(--destructive))] bg-red-50">
                <AlertCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {useBackupCode ? (
                <div className="space-y-2">
                  <Label htmlFor="backup-code">Backup Code</Label>
                  <Input
                    id="backup-code"
                    type="text"
                    placeholder="XXXXXXXX"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    className="text-center text-lg tracking-widest font-mono"
                    maxLength={8}
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Backup codes are 8 characters long
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold"
                        autoComplete="off"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Open your authenticator app to view your code
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setError('');
                  setCode(['', '', '', '', '', '']);
                  setBackupCode('');
                }}
                className="w-full text-sm text-[hsl(var(--primary))] hover:underline"
              >
                {useBackupCode ? 'Use authenticator app instead' : 'Lost access? Use a backup code'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Sign in with a different account
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
