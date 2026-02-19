import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Heart,
  Brain,
  Eye,
  Ear,
  Activity,
  Stethoscope,
  Loader2,
  ExternalLink,
  FileText,
  RefreshCw,
  Info,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';

const SERVICE_ICONS = {
  primaryCare: Stethoscope,
  mentalHealth: Brain,
  urgentCare: Activity,
  optometry: Eye,
  audiology: Ear,
  podiatry: Activity,
  dental: Activity,
  specialty: Stethoscope,
  womensHealth: Heart,
  physicalTherapy: Activity
};

const STATUS_STYLES = {
  eligible: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
    icon: CheckCircle2
  },
  not_eligible: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    badge: 'bg-gray-100 text-gray-600',
    icon: XCircle
  },
  pending: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  }
};

const REFERRAL_STATUS_STYLES = {
  approved: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800'
  },
  pending: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  completed: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800'
  },
  denied: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800'
  }
};

export default function CommunityCareEligibility({ onReferralCreated, compact = false, initialData = null }) {
  const [loading, setLoading] = useState(!initialData);
  const [eligibilities, setEligibilities] = useState(initialData?.eligibilities || []);
  const [referrals, setReferrals] = useState(initialData?.referrals || []);
  const [summary, setSummary] = useState(initialData?.summary || null);
  const [selectedService, setSelectedService] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [missionActInfo, setMissionActInfo] = useState(initialData?.mission_act_info || null);

  useEffect(() => {
    if (!initialData) {
      loadData();
    }
  }, [initialData]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [eligibilityRes, referralsRes] = await Promise.all([
        api.get('/community-care/eligibility'),
        api.get('/community-care/my-referrals')
      ]);

      if (eligibilityRes.data.success) {
        setEligibilities(eligibilityRes.data.eligibilities || []);
        setSummary(eligibilityRes.data.summary);
        setMissionActInfo(eligibilityRes.data.mission_act_info);
      }

      if (referralsRes.data.success) {
        setReferrals(referralsRes.data.referrals || []);
      }
    } catch (err) {
      console.error('Failed to load community care data:', err);
      setError('Failed to load eligibility data. Please try again.');
      toast.error('Failed to load community care eligibility');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReferral = async () => {
    if (!selectedService) {
      toast.error('Please select a service type');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/community-care/request-referral', {
        service_type: selectedService,
        reason: requestReason || undefined
      });

      if (response.data.success) {
        toast.success('Referral request submitted successfully');
        setShowRequestDialog(false);
        setSelectedService('');
        setRequestReason('');
        
        await loadData();
        
        if (onReferralCreated) {
          onReferralCreated(response.data.referral);
        }
      }
    } catch (err) {
      console.error('Failed to request referral:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to submit referral request';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getEligibleServices = () => {
    return eligibilities.filter(e => e.is_eligible);
  };

  const ServiceIcon = ({ serviceType }) => {
    const Icon = SERVICE_ICONS[serviceType] || Activity;
    return <Icon className="h-5 w-5" />;
  };

  const renderEligibilityCard = (eligibility) => {
    const status = eligibility.is_eligible ? 'eligible' : 'not_eligible';
    const styles = STATUS_STYLES[status];
    const StatusIcon = styles.icon;

    return (
      <Card 
        key={eligibility.service_type} 
        className={`${styles.bg} ${styles.border} border transition-all hover:shadow-sm`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${eligibility.is_eligible ? 'bg-green-100' : 'bg-gray-100'}`}>
              <ServiceIcon serviceType={eligibility.service_type} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm">{eligibility.service_name}</h3>
                <Badge className={styles.badge}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {eligibility.is_eligible ? 'Eligible' : 'Not Eligible'}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {eligibility.reason}
              </p>

              {eligibility.is_eligible && eligibility.va_wait_time_days && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>VA wait: {eligibility.va_wait_time_days} days (standard: {eligibility.access_standard_days} days)</span>
                </div>
              )}

              {eligibility.is_eligible && !compact && (
                <Button
                  size="sm"
                  className="mt-3 bg-[#003366] hover:bg-[#002244]"
                  onClick={() => {
                    setSelectedService(eligibility.service_type);
                    setShowRequestDialog(true);
                  }}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Request Referral
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderReferralCard = (referral) => {
    const styles = REFERRAL_STATUS_STYLES[referral.status] || REFERRAL_STATUS_STYLES.pending;

    return (
      <Card key={referral.id} className={`${styles.bg} ${styles.border} border`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{referral.service_name}</h3>
                <Badge className={styles.badge}>{referral.status_display}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Referral ID: {referral.id}
              </p>
            </div>
          </div>

          {referral.provider && (
            <div className="mt-3 p-3 bg-white/50 rounded-lg space-y-1 text-sm">
              <div className="font-medium">{referral.provider.name}</div>
              <div className="text-muted-foreground">{referral.provider.practice}</div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {referral.provider.address}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3 w-3" />
                <a href={`tel:${referral.provider.phone}`} className="text-primary hover:underline">
                  {referral.provider.phone}
                </a>
              </div>
            </div>
          )}

          {referral.approved_visits && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Visits:</span>{' '}
                <span className="font-medium">{referral.used_visits} / {referral.approved_visits} used</span>
              </div>
              {referral.valid_until && (
                <div>
                  <span className="text-muted-foreground">Valid until:</span>{' '}
                  <span className="font-medium">
                    {new Date(referral.valid_until).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {referral.notes && (
            <p className="mt-2 text-sm text-muted-foreground">{referral.notes}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#003366]" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#003366]" />
                Community Care Eligibility
              </CardTitle>
              <CardDescription>
                Check if you qualify for care from community providers under the MISSION Act
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {missionActInfo && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {missionActInfo.description}{' '}
                <a 
                  href={missionActInfo.learn_more_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Learn more <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          )}

          {summary && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{summary.total_services}</div>
                <div className="text-sm text-muted-foreground">Services Checked</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{summary.eligible_services}</div>
                <div className="text-sm text-green-600">Eligible</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{summary.not_eligible_services}</div>
                <div className="text-sm text-muted-foreground">Not Eligible</div>
              </div>
            </div>
          )}

          <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {eligibilities.map(renderEligibilityCard)}
          </div>
        </CardContent>
      </Card>

      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#003366]" />
              Your Community Care Referrals
            </CardTitle>
            <CardDescription>
              Track your referral requests and approved community care visits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map(renderReferralCard)}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Community Care Referral</DialogTitle>
            <DialogDescription>
              Submit a request to receive care from a community provider for the selected service.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {getEligibleServices().map((service) => (
                    <SelectItem key={service.service_type} value={service.service_type}>
                      {service.service_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                placeholder="Describe why you need this referral..."
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                rows={3}
              />
            </div>

            {selectedService && (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  After submitting, your request will be reviewed within 3 business days. 
                  You'll be notified when a determination is made.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestReferral}
              disabled={!selectedService || submitting}
              className="bg-[#003366] hover:bg-[#002244]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
