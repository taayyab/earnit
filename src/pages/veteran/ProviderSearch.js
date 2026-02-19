import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Slider } from '../../components/ui/slider';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import api from '../../lib/api';
import {
  Search,
  MapPin,
  Star,
  Filter,
  CheckCircle2,
  Award,
  Shield,
  Video,
  Phone,
  Globe,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  Stethoscope,
  FileText,
  Calendar,
  ExternalLink,
  X,
  SlidersHorizontal,
  List,
  Grid3X3
} from 'lucide-react';

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington D.C.' }
];

const SERVICE_TYPES = [
  { id: 'diagnostic_evaluation', name: 'Diagnostic Evaluation', category: 'Evaluation' },
  { id: 'nexus_letter', name: 'Nexus Letter', category: 'Documentation' },
  { id: 'dbq_completion', name: 'DBQ Form Completion', category: 'Documentation' },
  { id: 'mental_health', name: 'Mental Health Evaluation', category: 'Mental Health' },
  { id: 'ptsd_eval', name: 'PTSD Evaluation', category: 'Mental Health' },
  { id: 'general_exam', name: 'General Physical Exam', category: 'Primary Care' },
  { id: 'orthopedic', name: 'Orthopedic Consultation', category: 'Specialty' },
  { id: 'audiology', name: 'Audiology Exam', category: 'Specialty' },
  { id: 'cardiology', name: 'Cardiology Consultation', category: 'Specialty' },
  { id: 'neurology', name: 'Neurology Consultation', category: 'Specialty' },
  { id: 'dermatology', name: 'Dermatology Consultation', category: 'Specialty' },
  { id: 'pulmonology', name: 'Pulmonology Consultation', category: 'Specialty' }
];

const PROVIDER_TIER_CONFIG = {
  verified: {
    label: 'Verified',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: CheckCircle2
  },
  preferred: {
    label: 'Preferred',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Star
  },
  elite: {
    label: 'Elite',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Award
  }
};

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) - fullStars >= 0.5;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-amber-200 text-amber-400" />
      );
    } else {
      stars.push(
        <Star key={i} className="h-4 w-4 text-slate-300" />
      );
    }
  }
  return stars;
};

export default function ProviderSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [totalProviders, setTotalProviders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  const [filters, setFilters] = useState({
    serviceType: searchParams.get('service') || '',
    state: searchParams.get('state') || '',
    city: searchParams.get('city') || '',
    zipCode: searchParams.get('zip') || '',
    radiusMiles: parseInt(searchParams.get('radius')) || 50,
    vaEligible: searchParams.get('vaEligible') === 'true',
    tier: searchParams.get('tier') || '',
    telehealthAvailable: searchParams.get('telehealth') === 'true',
    sortBy: searchParams.get('sort') || 'rating'
  });

  const [availableServiceTypes, setAvailableServiceTypes] = useState(SERVICE_TYPES);

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  useEffect(() => {
    searchProviders();
  }, [currentPage, filters.sortBy]);

  const fetchServiceTypes = async () => {
    try {
      const response = await api.get('/providers/service-types');
      if (response.data?.services?.length > 0) {
        setAvailableServiceTypes(response.data.services);
      }
    } catch (error) {
      console.error('Failed to fetch service types:', error);
    }
  };

  const searchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.serviceType) params.append('service_type_id', filters.serviceType);
      if (filters.state) params.append('state', filters.state);
      if (filters.city) params.append('city', filters.city);
      if (filters.zipCode) params.append('zip_code', filters.zipCode);
      if (filters.radiusMiles && filters.zipCode) params.append('radius_miles', filters.radiusMiles);
      if (filters.vaEligible) params.append('accepts_va_community_care', 'true');
      if (filters.tier) params.append('tier', filters.tier);
      params.append('sort_by', filters.sortBy);
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);

      const response = await api.get(`/veteran/providers/search?${params.toString()}`);
      
      if (response.data?.success) {
        setProviders(response.data.providers || []);
        setTotalProviders(response.data.total || 0);
      } else {
        setProviders([]);
        setTotalProviders(0);
      }
    } catch (error) {
      console.error('Provider search failed:', error);
      toast.error('Failed to search providers. Please try again.');
      setProviders([]);
      setTotalProviders(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    
    const newParams = new URLSearchParams();
    if (filters.serviceType) newParams.set('service', filters.serviceType);
    if (filters.state) newParams.set('state', filters.state);
    if (filters.city) newParams.set('city', filters.city);
    if (filters.zipCode) newParams.set('zip', filters.zipCode);
    if (filters.radiusMiles !== 50) newParams.set('radius', filters.radiusMiles.toString());
    if (filters.vaEligible) newParams.set('vaEligible', 'true');
    if (filters.tier) newParams.set('tier', filters.tier);
    if (filters.telehealthAvailable) newParams.set('telehealth', 'true');
    if (filters.sortBy !== 'rating') newParams.set('sort', filters.sortBy);
    
    setSearchParams(newParams);
    searchProviders();
  };

  const handleClearFilters = () => {
    setFilters({
      serviceType: '',
      state: '',
      city: '',
      zipCode: '',
      radiusMiles: 50,
      vaEligible: false,
      tier: '',
      telehealthAvailable: false,
      sortBy: 'rating'
    });
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const handleViewDetails = async (provider) => {
    setSelectedProvider(provider);
    setShowDetailModal(true);
    setLoadingDetails(true);
    
    try {
      const response = await api.get(`/veteran/providers/${provider.id}`);
      if (response.data?.success) {
        setProviderDetails(response.data.provider);
      }
    } catch (error) {
      console.error('Failed to fetch provider details:', error);
      toast.error('Failed to load provider details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRequestService = (provider) => {
    navigate(`/services?provider=${provider.id}`);
  };

  const totalPages = Math.ceil(totalProviders / itemsPerPage);

  const TierBadge = ({ tier }) => {
    const config = PROVIDER_TIER_CONFIG[tier] || PROVIDER_TIER_CONFIG.verified;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const ProviderCard = ({ provider }) => (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{provider.practice_name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {provider.location ? `${provider.location.city}, ${provider.location.state}` : 'Multiple Locations'}
              </span>
            </CardDescription>
          </div>
          <TierBadge tier={provider.tier} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {renderStars(provider.average_rating)}
          </div>
          <span className="text-sm text-muted-foreground">
            ({provider.average_rating?.toFixed(1) || 'N/A'})
          </span>
          {provider.total_evaluations > 0 && (
            <span className="text-xs text-muted-foreground">
              • {provider.total_evaluations} reviews
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {provider.service_offerings?.slice(0, 3).map((offering, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {availableServiceTypes.find(s => s.id === offering.service_type_id)?.name || offering.service_type_id}
            </Badge>
          ))}
          {provider.service_offerings?.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{provider.service_offerings.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {provider.serves_telehealth && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              <Video className="h-3 w-3 mr-1" />
              Telehealth
            </Badge>
          )}
          {provider.service_offerings?.some(o => o.accepts_va_community_care) && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              VA Eligible
            </Badge>
          )}
        </div>

        {provider.service_offerings?.length > 0 && (
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>
              Starting at ${Math.min(...provider.service_offerings.map(o => o.price || 0))}
            </span>
          </div>
        )}

        {provider.availability_summary?.available_slots > 0 && (
          <div className="flex items-center text-sm text-green-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{provider.availability_summary.available_slots} slots available</span>
          </div>
        )}

        <Separator />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleViewDetails(provider)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => handleRequestService(provider)}
          >
            Request Service
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Find Healthcare Providers</h1>
          </div>
          <p className="text-blue-100 max-w-2xl">
            Search for qualified healthcare providers who can assist with your VA disability claim.
            Find specialists for evaluations, nexus letters, and more.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`lg:w-80 flex-shrink-0 ${showFilters ? '' : 'hidden lg:hidden'}`}>
            <Card className="sticky top-4">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Search Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select
                    value={filters.serviceType}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, serviceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Services</SelectItem>
                      {availableServiceTypes.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Location</Label>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">State</Label>
                    <Select
                      value={filters.state}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any State</SelectItem>
                        {US_STATES.map(state => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">City</Label>
                    <Input
                      placeholder="Enter city name"
                      value={filters.city}
                      onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">ZIP Code</Label>
                    <Input
                      placeholder="Enter ZIP code"
                      value={filters.zipCode}
                      maxLength={5}
                      onChange={(e) => setFilters(prev => ({ ...prev, zipCode: e.target.value.replace(/\D/g, '') }))}
                    />
                  </div>

                  {filters.zipCode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Distance Radius</Label>
                        <span className="text-sm font-medium">{filters.radiusMiles} miles</span>
                      </div>
                      <Slider
                        value={[filters.radiusMiles]}
                        onValueChange={([value]) => setFilters(prev => ({ ...prev, radiusMiles: value }))}
                        min={10}
                        max={100}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>10 mi</span>
                        <span>100 mi</span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Preferences</Label>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="va-eligible" className="cursor-pointer">
                      VA Community Care Eligible
                    </Label>
                    <Switch
                      id="va-eligible"
                      checked={filters.vaEligible}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, vaEligible: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="telehealth" className="cursor-pointer">
                      Telehealth Available
                    </Label>
                    <Switch
                      id="telehealth"
                      checked={filters.telehealthAvailable}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, telehealthAvailable: checked }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Provider Tier</Label>
                  <Select
                    value={filters.tier}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, tier: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tiers</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                      <SelectItem value="preferred">Preferred</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="distance">Nearest</SelectItem>
                      <SelectItem value="price">Lowest Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClearFilters}
                  >
                    Clear
                  </Button>
                  <Button className="flex-1" onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {loading ? 'Searching...' : `${totalProviders} Provider${totalProviders !== 1 ? 's' : ''} Found`}
                </h2>
                {filters.serviceType && (
                  <p className="text-sm text-muted-foreground">
                    Showing results for: {availableServiceTypes.find(s => s.id === filters.serviceType)?.name}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <div className="hidden sm:flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : providers.length === 0 ? (
              <Card className="py-16">
                <CardContent className="text-center">
                  <Stethoscope className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Providers Found</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    We couldn't find any providers matching your search criteria.
                    Try adjusting your filters or expanding your search area.
                  </p>
                  <Button onClick={handleClearFilters}>Clear All Filters</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {providers.map(provider => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            className="w-10"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : providerDetails ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl">{providerDetails.practice_name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-2">
                      <TierBadge tier={providerDetails.tier} />
                      {providerDetails.serves_telehealth && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Video className="h-3 w-3 mr-1" />
                          Telehealth
                        </Badge>
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {renderStars(providerDetails.average_rating)}
                    <span className="font-medium">{providerDetails.average_rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  {providerDetails.total_evaluations > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({providerDetails.total_evaluations} reviews)
                    </span>
                  )}
                </div>

                {providerDetails.locations?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Locations
                    </h4>
                    <div className="grid gap-3">
                      {providerDetails.locations.map((location, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">
                                {location.location_name || 'Primary Location'}
                                {location.is_primary && (
                                  <Badge className="ml-2" variant="secondary">Primary</Badge>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {location.address_line1}
                                {location.address_line2 && `, ${location.address_line2}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {location.city}, {location.state} {location.zip_code}
                              </p>
                              {location.phone && (
                                <p className="text-sm mt-1 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {location.phone}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {location.wheelchair_accessible && (
                                <Badge variant="outline" className="text-xs">Wheelchair Accessible</Badge>
                              )}
                              {location.parking_available && (
                                <Badge variant="outline" className="text-xs">Parking</Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {providerDetails.service_offerings?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Services & Pricing
                    </h4>
                    <div className="grid gap-2">
                      {providerDetails.service_offerings.map((offering, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {offering.service_type?.name || offering.service_type_id}
                            </p>
                            {offering.description && (
                              <p className="text-sm text-muted-foreground">{offering.description}</p>
                            )}
                            <div className="flex gap-2 mt-1">
                              {offering.accepts_va_community_care && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  VA Eligible
                                </Badge>
                              )}
                              {offering.typical_turnaround_days && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {offering.typical_turnaround_days} days
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">${offering.price}</p>
                            {offering.veteran_discount_percent > 0 && (
                              <p className="text-xs text-green-600">
                                {offering.veteran_discount_percent}% veteran discount
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {providerDetails.credentials?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Credentials & Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {providerDetails.credentials.map((cred, idx) => (
                        <Badge key={idx} variant="outline" className="py-1.5">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                          {cred.credential_type}
                          {cred.specialty && ` - ${cred.specialty}`}
                          {cred.state && ` (${cred.state})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {providerDetails.availability_slots?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Availability Preview
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {providerDetails.availability_slots.slice(0, 10).map((slot, idx) => (
                        <Badge key={idx} variant="secondary" className="py-1.5">
                          {new Date(slot.slot_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                          {slot.start_time && ` at ${slot.start_time.slice(0, 5)}`}
                        </Badge>
                      ))}
                      {providerDetails.availability_slots.length > 10 && (
                        <Badge variant="outline" className="py-1.5">
                          +{providerDetails.availability_slots.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {providerDetails.website && (
                    <Button variant="outline" asChild>
                      <a href={providerDetails.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  )}
                  {providerDetails.business_phone && (
                    <Button variant="outline" asChild>
                      <a href={`tel:${providerDetails.business_phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowDetailModal(false);
                  handleRequestService(selectedProvider);
                }}>
                  <FileText className="h-4 w-4 mr-2" />
                  Request Service
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Failed to load provider details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
