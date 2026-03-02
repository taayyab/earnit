import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  MapPin,
  Phone,
  Clock,
  Globe,
  Navigation,
  Building2,
  Heart,
  Briefcase,
  Users,
  Search,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const US_STATES = [
  { value: 'TX', label: 'Texas' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

const FACILITY_TYPES = [
  { value: '', label: 'All Facility Types' },
  { value: 'health', label: 'VA Medical Centers & Clinics', icon: Heart },
  { value: 'benefits', label: 'VA Regional Offices', icon: Briefcase },
  { value: 'vet_center', label: 'Vet Centers', icon: Users }
];

const FACILITY_TYPE_ICONS = {
  health: Heart,
  benefits: Briefcase,
  vet_center: Users,
  cemetery: Building2
};

const FACILITY_TYPE_COLORS = {
  health: 'text-red-600 bg-red-50 border-red-200',
  benefits: 'text-blue-600 bg-blue-50 border-blue-200',
  vet_center: 'text-[#1B3A5F] bg-blue-50 border-blue-200',
  cemetery: 'text-gray-600 bg-gray-50 border-gray-200'
};

export default function FacilityFinder({ defaultState = 'TX', defaultZip = '', compact = false }) {
  const [zipCode, setZipCode] = useState(defaultZip);
  const [state, setState] = useState(defaultState);
  const [facilityType, setFacilityType] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [expandedFacility, setExpandedFacility] = useState(null);

  useEffect(() => {
    if (defaultState === 'TX') {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!zipCode && !state) {
      toast.error('Please enter a ZIP code or select a state');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (zipCode) params.append('zip_code', zipCode);
      if (state) params.append('state', state);
      if (facilityType) params.append('facility_type', facilityType);
      params.append('per_page', '20');

      const response = await api.get(`/facilities/search?${params.toString()}`);
      setFacilities(response.data.facilities || []);
      
      if (response.data.demo_mode) {
        toast.info('Showing demo facilities for Texas');
      }
    } catch (err) {
      console.error('Facility search error:', err);
      setError('Failed to search facilities. Please try again.');
      toast.error('Failed to search facilities');
    } finally {
      setLoading(false);
    }
  };

  const getDirectionsUrl = (facility) => {
    const address = `${facility.address?.line1 || ''}, ${facility.address?.city || ''}, ${facility.address?.state || ''} ${facility.address?.zip || ''}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const formatHours = (hours) => {
    if (!hours) return null;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return hours[today] || 'Hours not available';
  };

  const FacilityTypeIcon = ({ type }) => {
    const Icon = FACILITY_TYPE_ICONS[type] || Building2;
    return <Icon className="h-5 w-5" />;
  };

  const renderFacilityCard = (facility) => {
    const isExpanded = expandedFacility === facility.id;
    const colors = FACILITY_TYPE_COLORS[facility.type] || FACILITY_TYPE_COLORS.cemetery;

    return (
      <Card key={facility.id} className={`overflow-hidden transition-all hover:shadow-md ${compact ? '' : 'mb-4'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg border ${colors}`}>
              <FacilityTypeIcon type={facility.type} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{facility.name}</h3>
                  <Badge variant="outline" className="mt-1 text-xs capitalize">
                    {facility.type?.replace('_', ' ') || 'VA Facility'}
                  </Badge>
                </div>
                {facility.distance_miles && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 shrink-0">
                    {facility.distance_miles.toFixed(1)} mi
                  </Badge>
                )}
              </div>

              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                {facility.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      {facility.address.line1}, {facility.address.city}, {facility.address.state} {facility.address.zip}
                    </span>
                  </div>
                )}
                
                {facility.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <a 
                      href={`tel:${facility.phone}`} 
                      className="text-primary hover:underline font-medium"
                    >
                      {facility.phone}
                    </a>
                  </div>
                )}

                {facility.hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>Today: {formatHours(facility.hours)}</span>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {facility.services && facility.services.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Services Available</h4>
                      <div className="flex flex-wrap gap-2">
                        {facility.services.map((service, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {facility.hours && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Hours of Operation</h4>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        {Object.entries(facility.hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize text-muted-foreground">{day}:</span>
                            <span className="font-medium">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedFacility(isExpanded ? null : facility.id)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Less Info
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      More Info
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  className="bg-[#003366] hover:bg-[#002244]"
                  onClick={() => window.open(getDirectionsUrl(facility), '_blank')}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Get Directions
                </Button>

                {facility.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(facility.website, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={compact ? '' : 'space-y-6'}>
      <Card>
        <CardHeader className={compact ? 'pb-2' : ''}>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#003366]" />
            Find VA Facilities
          </CardTitle>
          {!compact && (
            <p className="text-sm text-muted-foreground">
              Search for VA Medical Centers, Regional Offices, and Vet Centers near you
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facilityType">Facility Type</Label>
                <Select value={facilityType} onValueChange={setFacilityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACILITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={`flex items-end ${compact ? '' : 'md:col-span-3'}`}>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#003366] hover:bg-[#002244]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Facilities
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#003366]" />
        </div>
      )}

      {!loading && searched && facilities.length === 0 && !error && (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No Facilities Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or expanding your search area.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && facilities.length > 0 && (
        <div className={compact ? 'mt-4' : ''}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {facilities.length} {facilities.length === 1 ? 'Facility' : 'Facilities'} Found
            </h3>
          </div>
          <div className={compact ? 'space-y-3' : 'space-y-4'}>
            {facilities.map(renderFacilityCard)}
          </div>
        </div>
      )}
    </div>
  );
}
