import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { mfaAPI } from '../lib/api';
import PageHeader from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield, CheckCircle2, Copy, AlertCircle, Smartphone, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function MFASetup() {
  const [step, setStep] = useState('intro');
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaStatus, setMfaStatus] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadMfaStatus();
  }, []);

  const loadMfaStatus = async () => {
    try {
      const response = await mfaAPI.getStatus();
      setMfaStatus(response.data.mfa);
    } catch (err) {
      console.error('Failed to load MFA status:', err);
    }
  };

  const handleStartSetup = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await mfaAPI.setup();
      setSetupData(response.data);
      setStep('scan');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await mfaAPI.verifySetup(verificationCode);
      if (response.data.success) {
        setStep('backup');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleComplete = () => {
    toast.success('MFA setup complete! Your account is now more secure.');
    navigate('/dashboard');
  };

  if (mfaStatus?.enabled) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <div className="mx-auto max-w-2xl px-4 py-12">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>MFA is Already Enabled</CardTitle>
              <CardDescription>
                Your account is protected with two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Backup codes remaining:</strong> {mfaStatus.backup_codes_remaining}
                </p>
                {mfaStatus.last_used_at && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Last used:</strong> {new Date(mfaStatus.last_used_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      <div className="mx-auto max-w-2xl px-4 py-12">
        {step === 'intro' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                <Shield className="h-8 w-8 text-[hsl(var(--primary))]" />
              </div>
              <CardTitle className="text-2xl">Secure Your Account</CardTitle>
              <CardDescription>
                Add an extra layer of security with two-factor authentication (2FA)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-lg">
                  <Smartphone className="h-6 w-6 text-[hsl(var(--primary))] mt-1" />
                  <div>
                    <h3 className="font-medium">Authenticator App Required</h3>
                    <p className="text-sm text-muted-foreground">
                      You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-lg">
                  <Key className="h-6 w-6 text-[hsl(var(--primary))] mt-1" />
                  <div>
                    <h3 className="font-medium">Backup Codes</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll provide backup codes in case you lose access to your authenticator.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <Alert className="border-[hsl(var(--destructive))] bg-red-50">
                  <AlertCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleStartSetup} className="w-full" disabled={loading}>
                {loading ? 'Setting up...' : 'Set Up Two-Factor Authentication'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'scan' && setupData && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>
                Scan this QR code with your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border">
                  <img
                    src={`data:image/png;base64,${setupData.qr_code}`}
                    alt="QR Code for MFA setup"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Or enter this code manually:</Label>
                <div className="flex gap-2">
                  <Input
                    value={setupData.manual_entry_key}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(setupData.manual_entry_key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>

                {error && (
                  <Alert className="border-[hsl(var(--destructive))] bg-red-50">
                    <AlertCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading || verificationCode.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify and Enable'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'backup' && setupData && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Save Your Backup Codes</CardTitle>
              <CardDescription>
                Store these codes in a safe place. You can use them if you lose access to your authenticator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Each backup code can only be used once. Keep them secure!
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2 p-4 bg-white border border-slate-200 rounded-lg font-mono text-sm">
                {setupData.backup_codes.map((code, index) => (
                  <div key={index} className="p-2 bg-background rounded border text-center">
                    {code}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => copyToClipboard(setupData.backup_codes.join('\n'))}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Codes
              </Button>

              <Button onClick={handleComplete} className="w-full">
                I've Saved My Codes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
