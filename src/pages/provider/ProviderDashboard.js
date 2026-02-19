import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  User,
  Building2,
  MapPin,
  Award,
  Stethoscope,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Upload,
  RefreshCw,
  Shield,
  ChevronRight,
  Settings,
  CreditCard,
  Inbox,
  Phone,
  Mail,
  Globe,
  Percent,
  Users,
  ClipboardCheck,
  Loader2,
  ExternalLink,
  Eye,
  BarChart3
} from 'lucide-react';

const FallbackIcon = CheckCircle2;

const VERIFICATION_STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'bg-amber-100 text-amber-800',
    icon: Clock,
    message: 'Your application is waiting for initial review.',
    nextSteps: 'Please ensure all required documents are uploaded.'
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-blue-100 text-blue-800',
    icon: Eye,
    message: 'Our team is reviewing your credentials and documentation.',
    nextSteps: 'You will be notified once the review is complete. This typically takes 3-5 business days.'
  },
  verified: {
    label: 'Verified',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    message: 'Your provider account is verified and active.',
    nextSteps: 'You can now receive and accept service requests from veterans.'
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
    message: 'Your application was not approved.',
    nextSteps: 'Please review the rejection reason and contact support for assistance.'
  },
  suspended: {
    label: 'Suspended',
    color: 'bg-slate-100 text-slate-800',
    icon: Shield,
    message: 'Your provider account has been suspended.',
    nextSteps: 'Contact support immediately to resolve any issues.'
  }
};

const PROVIDER_TIER_CONFIG = {
  verified: {
    label: 'Verified Provider',
    color: 'bg-slate-100 text-slate-700',
    icon: CheckCircle2
  },
  preferred: {
    label: 'Preferred Provider',
    color: 'bg-blue-100 text-blue-800',
    icon: Star
  },
  elite: {
    label: 'Elite Provider',
    color: 'bg-amber-100 text-amber-800',
    icon: Award
  }
};

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [locations, setLocations] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    averageRating: 0,
    responseRate: 0,
    completionRate: 0,
    weeklyAppointments: 0,
    maxWeeklyAppointments: 20
  });
  const [editingLocation, setEditingLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileRes, locationsRes, credentialsRes, servicesRes, availabilityRes] = await Promise.allSettled([
        api.get('/providers/profile'),
        api.get('/providers/locations'),
        api.get('/providers/credentials'),
        api.get('/providers/services'),
        api.get('/providers/availability')
      ]);

      if (profileRes.status === 'fulfilled') {
        const profileData = profileRes.value.data;
        setProfile(profileData.profile || profileData);
        if (profileData.stats) {
          setStats({
            totalEvaluations: profileData.stats.total_evaluations || 0,
            averageRating: profileData.stats.average_rating || 0,
            responseRate: profileData.stats.response_rate || 0,
            completionRate: profileData.stats.completion_rate || 0,
            weeklyAppointments: profileData.stats.weekly_appointments || 0,
            maxWeeklyAppointments: profileData.stats.max_weekly_appointments || 20
          });
        }
      } else {
        setProfile({
          practice_name: 'Loading...',
          verification_status: 'pending',
          provider_tier: 'verified'
        });
      }

      if (locationsRes.status === 'fulfilled') {
        setLocations(locationsRes.value.data.locations || []);
      }

      if (credentialsRes.status === 'fulfilled') {
        setCredentials(credentialsRes.value.data.credentials || []);
      }

      if (servicesRes.status === 'fulfilled') {
        setServices(servicesRes.value.data.services || []);
      }

      if (availabilityRes.status === 'fulfilled') {
        setAvailability(availabilityRes.value.data.slots || availabilityRes.value.data.availability || []);
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (field, value) => {
    try {
      await api.put('/providers/profile', { [field]: value });
      setProfile(prev => ({ ...prev, [field]: value }));
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      await api.delete(`/providers/locations/${locationId}`);
      setLocations(prev => prev.filter(loc => loc.id !== locationId));
      toast.success('Location deleted');
    } catch (err) {
      console.error('Failed to delete location:', err);
      toast.error('Failed to delete location');
    }
  };

  const handleSetPrimaryLocation = async (locationId) => {
    try {
      await api.put(`/providers/locations/${locationId}/primary`);
      setLocations(prev => prev.map(loc => ({
        ...loc,
        is_primary: loc.id === locationId
      })));
      toast.success('Primary location updated');
    } catch (err) {
      console.error('Failed to set primary location:', err);
      toast.error('Failed to set primary location');
    }
  };

  const handleDeleteCredential = async (credentialId) => {
    if (!confirm('Are you sure you want to delete this credential?')) return;
    try {
      await api.delete(`/providers/credentials/${credentialId}`);
      setCredentials(prev => prev.filter(cred => cred.id !== credentialId));
      toast.success('Credential deleted');
    } catch (err) {
      console.error('Failed to delete credential:', err);
      toast.error('Failed to delete credential');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to remove this service offering?')) return;
    try {
      await api.delete(`/providers/services/${serviceId}`);
      setServices(prev => prev.filter(svc => svc.id !== serviceId));
      toast.success('Service removed');
    } catch (err) {
      console.error('Failed to delete service:', err);
      toast.error('Failed to remove service');
    }
  };

  const getProfileCompleteness = () => {
    let complete = 0;
    let total = 5;
    if (profile?.practice_name) complete++;
    if (profile?.npi_number) complete++;
    if (locations.length > 0) complete++;
    if (credentials.length > 0) complete++;
    if (services.length > 0) complete++;
    return Math.round((complete / total) * 100);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-amber-200 text-amber-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-slate-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1B3A5F] mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-700 mb-4">{error}</p>
          <Button onClick={loadDashboardData} className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const verificationStatus = profile?.verification_status || 'pending';
  const statusConfig = VERIFICATION_STATUS_CONFIG[verificationStatus] || VERIFICATION_STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon || FallbackIcon;
  
  const providerTier = profile?.provider_tier || 'verified';
  const tierConfig = PROVIDER_TIER_CONFIG[providerTier] || PROVIDER_TIER_CONFIG.verified;
  const TierIcon = tierConfig.icon || FallbackIcon;

  const profileCompleteness = getProfileCompleteness();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1B3A5F] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Provider Dashboard</h1>
              <p className="text-blue-100 mt-1">
                {profile?.practice_name || 'Your Practice'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={tierConfig.color}>
                <TierIcon className="w-3 h-3 mr-1" />
                {tierConfig.label}
              </Badge>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => navigate('/provider/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#1B3A5F]" />
                    Profile Status
                  </CardTitle>
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-3">{statusConfig.message}</p>
                <p className="text-sm text-slate-500 mb-4">{statusConfig.nextSteps}</p>
                
                {profileCompleteness < 100 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-amber-800">Profile Completeness</span>
                      <span className="text-sm font-bold text-amber-800">{profileCompleteness}%</span>
                    </div>
                    <Progress value={profileCompleteness} className="h-2" />
                    <Button 
                      variant="outline" 
                      className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                      onClick={() => document.getElementById('profile-management')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Complete Profile
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ClipboardCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.totalEvaluations}</p>
                      <p className="text-sm text-slate-500">Evaluations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <Star className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {renderStars(stats.averageRating)}
                      </div>
                      <p className="text-sm text-slate-500">{stats.averageRating.toFixed(1)} avg rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Percent className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.responseRate}%</p>
                      <p className="text-sm text-slate-500">Response Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.completionRate}%</p>
                      <p className="text-sm text-slate-500">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2 lg:col-span-2">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-slate-500">Weekly Appointments</p>
                        <p className="text-sm font-medium text-slate-700">
                          {stats.weeklyAppointments} / {stats.maxWeeklyAppointments}
                        </p>
                      </div>
                      <Progress 
                        value={(stats.weeklyAppointments / stats.maxWeeklyAppointments) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div id="profile-management" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#1B3A5F]" />
                      Practice Information
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-500 text-sm">Practice Name</Label>
                      <p className="font-medium">{profile?.practice_name || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500 text-sm">Practice Type</Label>
                      <p className="font-medium capitalize">{profile?.practice_type?.replace('_', ' ') || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500 text-sm">NPI Number</Label>
                      <p className="font-medium font-mono">{profile?.npi_number || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500 text-sm">Business Phone</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {profile?.business_phone || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-500 text-sm">Business Email</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {profile?.business_email || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-500 text-sm">Website</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Globe className="w-4 h-4 text-slate-400" />
                        {profile?.website || 'Not set'}
                      </p>
                    </div>
                  </div>
                  {profile?.serves_telehealth && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Telehealth Services Available
                      </p>
                      {profile.telehealth_states?.length > 0 && (
                        <p className="text-sm text-blue-600 mt-1">
                          States: {profile.telehealth_states.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#1B3A5F]" />
                      Locations
                    </CardTitle>
                    <Button 
                      size="sm" 
                      className="bg-[#1B3A5F] hover:bg-[#152d4a]"
                      onClick={() => {
                        setEditingLocation(null);
                        setShowLocationModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Location
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {locations.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No locations added yet</p>
                      <p className="text-sm">Add your practice locations to appear in search results</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {locations.map((location) => (
                        <div 
                          key={location.id} 
                          className={`border rounded-lg p-4 ${location.is_primary ? 'border-[#1B3A5F] bg-blue-50' : 'border-slate-200'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{location.address_line1}</p>
                                {location.is_primary && (
                                  <Badge className="bg-[#1B3A5F] text-white text-xs">Primary</Badge>
                                )}
                              </div>
                              {location.address_line2 && (
                                <p className="text-slate-600">{location.address_line2}</p>
                              )}
                              <p className="text-slate-600">
                                {location.city}, {location.state} {location.zip_code}
                              </p>
                              {location.phone && (
                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {location.phone}
                                </p>
                              )}
                              {location.wheelchair_accessible && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  Wheelchair Accessible
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!location.is_primary && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSetPrimaryLocation(location.id)}
                                >
                                  Set Primary
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingLocation(location);
                                  setShowLocationModal(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteLocation(location.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#1B3A5F]" />
                      Credentials
                    </CardTitle>
                    <Button 
                      size="sm" 
                      className="bg-[#1B3A5F] hover:bg-[#152d4a]"
                      onClick={() => {
                        setEditingCredential(null);
                        setShowCredentialModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Credential
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {credentials.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No credentials added yet</p>
                      <p className="text-sm">Add your medical licenses and certifications</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {credentials.map((credential) => {
                        const isExpiring = credential.expiration_date && 
                          new Date(credential.expiration_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                        const isExpired = credential.expiration_date && 
                          new Date(credential.expiration_date) < new Date();
                        
                        return (
                          <div 
                            key={credential.id} 
                            className={`border rounded-lg p-4 ${isExpired ? 'border-red-300 bg-red-50' : isExpiring ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium capitalize">
                                  {credential.credential_type?.replace('_', ' ') || 'Unknown Type'}
                                </p>
                                <p className="text-sm text-slate-600 font-mono">{credential.credential_number}</p>
                                {credential.issuing_authority && (
                                  <p className="text-sm text-slate-500">{credential.issuing_authority}</p>
                                )}
                                {credential.state && (
                                  <Badge variant="outline" className="mt-1 text-xs">{credential.state}</Badge>
                                )}
                                <p className={`text-sm mt-2 flex items-center gap-1 ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-slate-500'}`}>
                                  <Clock className="w-3 h-3" />
                                  {isExpired ? 'Expired: ' : isExpiring ? 'Expiring: ' : 'Expires: '}
                                  {credential.expiration_date ? new Date(credential.expiration_date).toLocaleDateString() : 'Not set'}
                                </p>
                                {credential.document_url && (
                                  <a 
                                    href={credential.document_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline mt-2 flex items-center gap-1"
                                  >
                                    <FileText className="w-3 h-3" />
                                    View Document
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingCredential(credential);
                                    setShowCredentialModal(true);
                                  }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteCredential(credential.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-[#1B3A5F]" />
                      Service Offerings
                    </CardTitle>
                    <Button 
                      size="sm" 
                      className="bg-[#1B3A5F] hover:bg-[#152d4a]"
                      onClick={() => {
                        setEditingService(null);
                        setShowServiceModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {services.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Stethoscope className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No services added yet</p>
                      <p className="text-sm">Add the services you offer to veterans</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <div key={service.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium">{service.service_name || service.service_type}</p>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingService(service);
                                  setShowServiceModal(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-600"
                                onClick={() => handleDeleteService(service.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Price</span>
                            <span className="font-medium text-green-600">${service.price}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-slate-500">Turnaround</span>
                            <span>{service.turnaround_days} days</span>
                          </div>
                          {service.accepts_va_community_care && (
                            <Badge className="mt-2 bg-green-100 text-green-700 text-xs">
                              VA Community Care
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#1B3A5F]" />
                      Availability Schedule
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Update Schedule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {availability.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No availability schedule set</p>
                      <p className="text-sm">Set your weekly availability for appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availability.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="font-medium">{slot.day}</span>
                          <span className="text-slate-600">
                            {slot.closed ? 'Closed' : `${slot.open} - ${slot.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-[#1B3A5F]" />
                  Service Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-slate-700">Coming Soon</p>
                  <p className="text-sm text-slate-500 mt-1">
                    View and manage incoming veteran service requests, 
                    matched evaluations, and scheduled appointments.
                  </p>
                  <Badge className="mt-4 bg-blue-100 text-blue-700">
                    <Clock className="w-3 h-3 mr-1" />
                    In Development
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#1B3A5F]" />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-slate-700">Coming Soon</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Track your earnings, view payment history, 
                    and manage your payout settings.
                  </p>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      Powered by Stripe Connect
                    </p>
                  </div>
                  <Badge className="mt-4 bg-blue-100 text-blue-700">
                    <Clock className="w-3 h-3 mr-1" />
                    In Development
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#1B3A5F]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={loadDashboardData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Dashboard
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
