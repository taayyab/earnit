import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Shield,
  Clock,
  LogOut,
  FileText,
  Scale,
  Users,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Upload,
} from 'lucide-react';
import logoImage from '../assets/logo.webp';
import { toast } from 'sonner';

const ACCREDITATION_TYPE_LABELS = {
  va_attorney: 'VA Attorney',
  va_claims_agent: 'VA Claims Agent',
  vso_representative: 'VSO Representative',
};

const ACCREDITATION_TYPE_ICONS = {
  va_attorney: Scale,
  va_claims_agent: FileCheck,
  vso_representative: Users,
};

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

export default function AccreditationPending() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResubmitForm, setShowResubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [accreditationType, setAccreditationType] = useState('');
  const [ogcNumber, setOgcNumber] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [barState, setBarState] = useState('');
  const [vsoOrganization, setVsoOrganization] = useState('');
  const [vsoRepId, setVsoRepId] = useState('');
  const [credentialFile, setCredentialFile] = useState(null);
  const [credentialAttestation, setCredentialAttestation] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadAccreditationStatus();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get('/accreditation/status');
        const newStatus = response.data.accreditation_status;
        const prevStatus = status?.accreditation_status;
        
        setStatus(response.data);
        
        if (newStatus === 'approved') {
          toast.success('Your accreditation has been approved!');
          navigate('/agent');
        } else if (newStatus === 'rejected' && prevStatus !== 'rejected') {
          toast.error('Your accreditation was not approved. Please see details below.');
          setShowResubmitForm(false);
        }
      } catch (error) {
        console.error('Failed to poll accreditation status:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate, status?.accreditation_status]);

  const loadAccreditationStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accreditation/status');
      setStatus(response.data);
      
      if (response.data.accreditation_status === 'approved') {
        navigate('/agent');
      }
      
      if (response.data.current_submission) {
        setAccreditationType(response.data.current_submission.accreditation_type || '');
      }
    } catch (error) {
      console.error('Failed to load accreditation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCredentialFile(e.target.files[0]);
    }
  };

  const handleResubmit = async () => {
    if (!accreditationType || !credentialAttestation) {
      toast.error('Please complete all required fields and accept the attestation');
      return;
    }

    if (accreditationType === 'va_attorney' && (!ogcNumber || !barNumber || !barState)) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (accreditationType === 'va_claims_agent' && !ogcNumber) {
      toast.error('Please fill in your OGC number');
      return;
    }
    if (accreditationType === 'vso_representative' && (!vsoOrganization || !vsoRepId)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const credentials = {
        ogc_number: ogcNumber || null,
        bar_number: accreditationType === 'va_attorney' ? barNumber : null,
        bar_state: accreditationType === 'va_attorney' ? barState : null,
        vso_org_id: accreditationType === 'vso_representative' ? vsoOrganization : null,
        vso_rep_id: accreditationType === 'vso_representative' ? vsoRepId : null
      };

      const response = await api.post('/accreditation/submit', {
        accreditation_type: accreditationType,
        credentials: credentials,
        attestation_accepted: true
      });

      const submissionId = response.data.submission_id;

      if (credentialFile && submissionId) {
        const documentTypeMap = {
          'va_attorney': 'bar_license',
          'va_claims_agent': 'ogc_certificate',
          'vso_representative': 'vso_authorization'
        };
        const documentType = documentTypeMap[accreditationType] || 'other';
        
        const formData = new FormData();
        formData.append('file', credentialFile);
        
        await api.post(
          `/accreditation/upload?document_type=${documentType}&submission_id=${submissionId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      toast.success('Credentials resubmitted successfully');
      setShowResubmitForm(false);
      await loadAccreditationStatus();
    } catch (error) {
      console.error('Failed to resubmit credentials:', error);
      toast.error(error.response?.data?.detail || 'Failed to resubmit credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCredentials = (credentials) => {
    if (!credentials) return [];
    const items = [];
    if (credentials.ogc_number) items.push({ label: 'OGC Number', value: credentials.ogc_number });
    if (credentials.bar_number) items.push({ label: 'Bar Number', value: credentials.bar_number });
    if (credentials.bar_state) items.push({ label: 'Bar State', value: credentials.bar_state });
    if (credentials.vso_org_id) items.push({ label: 'VSO Organization ID', value: credentials.vso_org_id });
    if (credentials.vso_rep_id) items.push({ label: 'Representative ID', value: credentials.vso_rep_id });
    return items;
  };

  const submission = status?.current_submission;
  const isRejected = status?.accreditation_status === 'rejected';
  const AccreditationIcon = submission?.accreditation_type 
    ? ACCREDITATION_TYPE_ICONS[submission.accreditation_type] || Shield
    : Shield;

  const renderCredentialsForm = () => {
    if (accreditationType === 'va_attorney') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ogc_number">OGC Accreditation Number *</Label>
            <Input
              id="ogc_number"
              type="text"
              placeholder="Enter your OGC accreditation number"
              value={ogcNumber}
              onChange={(e) => setOgcNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bar_number">Bar Number *</Label>
            <Input
              id="bar_number"
              type="text"
              placeholder="Enter your bar number"
              value={barNumber}
              onChange={(e) => setBarNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bar_state">Bar State *</Label>
            <select
              id="bar_state"
              value={barState}
              onChange={(e) => setBarState(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">Select state...</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (accreditationType === 'va_claims_agent') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ogc_number">OGC Accreditation Number *</Label>
            <Input
              id="ogc_number"
              type="text"
              placeholder="Enter your OGC accreditation number"
              value={ogcNumber}
              onChange={(e) => setOgcNumber(e.target.value)}
              required
            />
          </div>
        </div>
      );
    }

    if (accreditationType === 'vso_representative') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vso_organization">VSO Organization Name *</Label>
            <Input
              id="vso_organization"
              type="text"
              placeholder="e.g., American Legion, DAV, VFW"
              value={vsoOrganization}
              onChange={(e) => setVsoOrganization(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vso_rep_id">VSO Representative ID *</Label>
            <Input
              id="vso_rep_id"
              type="text"
              placeholder="Enter your VSO representative ID"
              value={vsoRepId}
              onChange={(e) => setVsoRepId(e.target.value)}
              required
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B3A5F] to-[#2d5a8a] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <img src={logoImage} alt="EarnedIT" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            {isRejected ? 'Accreditation Not Approved' : 'Accreditation Under Review'}
          </h1>
          <p className="text-white/80">
            {isRejected 
              ? 'Your accreditation submission was not approved'
              : 'Your VA claims agent accreditation is being verified'
            }
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full" />
            </CardContent>
          </Card>
        ) : showResubmitForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-[hsl(var(--primary))]" />
                Resubmit Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Accreditation Type</Label>
                  <select
                    value={accreditationType}
                    onChange={(e) => setAccreditationType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select type...</option>
                    <option value="va_attorney">VA Attorney</option>
                    <option value="va_claims_agent">VA Claims Agent</option>
                    <option value="vso_representative">VSO Representative</option>
                  </select>
                </div>

                {accreditationType && renderCredentialsForm()}

                {accreditationType && (
                  <>
                    <div className="space-y-2">
                      <Label>Supporting Document (Optional)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {credentialFile ? credentialFile.name : 'Upload Document'}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="attestation"
                        checked={credentialAttestation}
                        onChange={(e) => setCredentialAttestation(e.target.checked)}
                        className="mt-1"
                      />
                      <Label htmlFor="attestation" className="text-sm text-muted-foreground">
                        I attest that the information provided is accurate and complete. I understand that providing false information may result in denial of accreditation.
                      </Label>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResubmitForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResubmit}
                  disabled={submitting || !accreditationType || !credentialAttestation}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Credentials'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isRejected ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500" />
                  )}
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    {isRejected ? (
                      <>
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                          <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Not Approved
                        </Badge>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                          <Clock className="h-10 w-10 text-amber-600" />
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          Pending Review
                        </Badge>
                      </>
                    )}
                    <p className="mt-4 text-muted-foreground">
                      {isRejected 
                        ? 'Your accreditation submission was not approved.'
                        : 'Your accreditation credentials are being reviewed by our team.'
                      }
                    </p>
                  </div>
                </div>

                {isRejected && submission?.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Rejection Reason</h4>
                        <p className="text-sm text-red-700">{submission.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {isRejected && (
                  <Button
                    onClick={() => setShowResubmitForm(true)}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resubmit Credentials
                  </Button>
                )}

                {!isRejected && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Estimated Review Time</h4>
                        <p className="text-sm text-blue-700">
                          Most accreditation reviews are completed within 1-3 business days.
                          We'll notify you by email once your review is complete.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {submission && !isRejected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AccreditationIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
                    Your Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Accreditation Type</p>
                      <p className="font-medium">
                        {ACCREDITATION_TYPE_LABELS[submission.accreditation_type] || submission.accreditation_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted On</p>
                      <p className="font-medium">{formatDate(submission.created_at)}</p>
                    </div>
                  </div>

                  {submission.credentials && formatCredentials(submission.credentials).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Credentials Submitted</p>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {formatCredentials(submission.credentials).map((cred, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{cred.label}</span>
                            <span className="font-medium">{cred.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {submission.documents && submission.documents.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Documents Uploaded</p>
                      <div className="space-y-2">
                        {submission.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{doc.original_filename}</span>
                            <Badge variant="outline" className="ml-auto">
                              {doc.document_type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    {isRejected 
                      ? 'You can resubmit your credentials with corrected information.'
                      : "You'll be able to access the Claims Agent Dashboard once your accreditation is approved."
                    }
                  </p>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-white/60 text-sm">
              Questions? Contact us at support@earnedit.com
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
