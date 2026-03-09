import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { 
  RefreshCw, 
  CheckCircle, 
  Shield,
  Award,
  Calendar,
  MapPin,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Star,
  Target,
  FileCheck
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const BRANCH_ICONS = {
  'Army': '🪖',
  'Navy': '⚓',
  'Air Force': '✈️',
  'Marine Corps': '🦅',
  'Coast Guard': '⚓',
  'Space Force': '🚀',
  'Army National Guard': '🪖',
  'Air National Guard': '✈️'
};

const DISCHARGE_BADGE_COLORS = {
  'Honorable': 'bg-green-100 text-green-700 border-green-300',
  'General (Under Honorable Conditions)': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Other Than Honorable': 'bg-orange-100 text-orange-700 border-orange-300',
  'Bad Conduct': 'bg-red-100 text-red-700 border-red-300',
  'Dishonorable': 'bg-red-200 text-red-800 border-red-400',
  'Uncharacterized': 'bg-slate-100 text-slate-700 border-slate-300'
};

function ServiceEpisodeCard({ episode }) {
  const [expanded, setExpanded] = useState(false);
  const branchIcon = BRANCH_ICONS[episode.branch] || '🎖️';
  const dischargeColor = DISCHARGE_BADGE_COLORS[episode.discharge_name] || DISCHARGE_BADGE_COLORS['Honorable'];
  
  const startDate = new Date(episode.start_date).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
  const endDate = new Date(episode.end_date).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{branchIcon}</span>
          <div>
            <h4 className="font-semibold text-slate-800">{episode.branch}</h4>
            <p className="text-sm text-slate-600">
              {episode.pay_grade} - {episode.pay_grade_title}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              <Calendar className="inline h-3 w-3 mr-1" />
              {startDate} - {endDate}
            </p>
          </div>
        </div>
        <Badge className={`${dischargeColor} border`}>
          {episode.discharge_name}
        </Badge>
      </div>

      {episode.mos && episode.mos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {episode.mos.map((m, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {m.code}: {m.title}
            </Badge>
          ))}
        </div>
      )}

      {(episode.deployments?.length > 0 || episode.awards?.length > 0) && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full text-slate-600 hover:text-slate-800"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Deployments & Awards
            </>
          )}
        </Button>
      )}

      {expanded && (
        <div className="mt-4 space-y-4">
          {episode.deployments && episode.deployments.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-slate-700 flex items-center gap-1 mb-2">
                <Target className="h-4 w-4" />
                Deployments ({episode.deployments.length})
              </h5>
              <div className="space-y-2">
                {episode.deployments.map((dep, idx) => (
                  <div key={idx} className="text-sm bg-slate-50 p-2 rounded">
                    <p className="font-medium text-slate-700">{dep.campaign}</p>
                    <p className="text-slate-600">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {dep.location} ({dep.theater})
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(dep.start_date).toLocaleDateString()} - {new Date(dep.end_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {episode.awards && episode.awards.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-slate-700 flex items-center gap-1 mb-2">
                <Award className="h-4 w-4" />
                Awards & Decorations
              </h5>
              <div className="flex flex-wrap gap-1">
                {episode.awards.map((award, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-amber-50 border-amber-200">
                    <Star className="h-3 w-3 mr-1 text-amber-500" />
                    {award}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {episode.duty_stations && episode.duty_stations.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-slate-700 flex items-center gap-1 mb-2">
                <MapPin className="h-4 w-4" />
                Duty Stations
              </h5>
              <div className="flex flex-wrap gap-1">
                {episode.duty_stations.map((station, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {station.name} ({station.dates})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DisabilityRatingCard({ rating }) {
  if (!rating) return null;

  const combinedRating = rating.combined_rating || 0;
  const ratingColor = 
    combinedRating >= 70 ? 'text-[#1B3A5F]' :
    combinedRating >= 50 ? 'text-blue-600' :
    combinedRating >= 30 ? 'text-amber-600' :
    'text-slate-600';

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          VA Disability Rating
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-4xl font-bold ${ratingColor}`}>{combinedRating}%</p>
            <p className="text-sm text-slate-500">Combined Rating</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">
              Effective: {new Date(rating.combined_effective_date).toLocaleDateString()}
            </p>
            {rating.individual_ratings && (
              <p className="text-xs text-slate-500">
                {rating.individual_ratings.length} rated conditions
              </p>
            )}
            {rating.monthly_payment_estimate && (
              <p className="text-sm font-semibold text-green-700 mt-1">
                ~${rating.monthly_payment_estimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo
              </p>
            )}
          </div>
        </div>

        <Progress value={combinedRating} className="h-3 mb-4" />

        {rating.individual_ratings && rating.individual_ratings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700">Service-Connected Conditions</h4>
            {rating.individual_ratings.map((condition, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{condition.condition}</p>
                  <p className="text-xs text-slate-500">
                    DC {condition.diagnostic_code} | Effective {new Date(condition.effective_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={condition.static ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                  {condition.rating_percentage}%
                </Badge>
              </div>
            ))}
          </div>
        )}

        {(rating.special_monthly_compensation || rating.total_disability_individual_unemployability) && (
          <div className="mt-4 p-2 bg-blue-50 rounded border border-blue-200">
            {rating.special_monthly_compensation && (
              <Badge className="bg-blue-50 text-[#1B3A5F] mr-2">SMC</Badge>
            )}
            {rating.total_disability_individual_unemployability && (
              <Badge className="bg-blue-50 text-[#1B3A5F]">TDIU</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VeteranStatusBadge({ status }) {
  if (!status) return null;

  const isConfirmed = status.confirmed_veteran;
  const isEligible = status.character_of_discharge_status === 'eligible';

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border">
      {isConfirmed ? (
        <CheckCircle className="h-5 w-5 text-green-600" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-amber-600" />
      )}
      <div className="flex-1">
        <p className="font-medium text-slate-800">
          {isConfirmed ? 'Verified Veteran' : 'Verification Pending'}
        </p>
        <p className="text-xs text-slate-500">
          {isEligible ? 'Eligible for VA benefits' : 'Benefits eligibility under review'}
        </p>
      </div>
      {isConfirmed && (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          <FileCheck className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      )}
    </div>
  );
}

export function ServiceHistoryCard({ onDataLoaded, compact = false, initialData = null }) {
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [serviceHistory, setServiceHistory] = useState(initialData?.service_history || null);
  const [disabilityRating, setDisabilityRating] = useState(initialData?.disability_rating || null);
  const [veteranStatus, setVeteranStatus] = useState(initialData?.veteran_status || null);
  const [demoMode, setDemoMode] = useState(initialData?.demo_mode || false);
  const [dataSource, setDataSource] = useState(initialData?.data_source || null);
  const [retrievedAt, setRetrievedAt] = useState(initialData?.retrieved_at || null);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [historyRes, ratingRes, statusRes] = await Promise.all([
        api.get('/service-history'),
        api.get('/service-history/disability-rating'),
        api.get('/service-history/verify')
      ]);

      if (historyRes.data?.success) {
        setServiceHistory(historyRes.data.service_history);
        setDemoMode(historyRes.data.demo_mode || false);
        setDataSource(historyRes.data.data_source || null);
        setRetrievedAt(historyRes.data.retrieved_at || null);
      }

      if (ratingRes.data?.success) {
        setDisabilityRating(ratingRes.data.disability_rating);
      }

      if (statusRes.data?.success) {
        setVeteranStatus(statusRes.data.veteran_status);
      }

      if (onDataLoaded) {
        onDataLoaded({
          serviceHistory: historyRes.data?.service_history,
          disabilityRating: ratingRes.data?.disability_rating,
          veteranStatus: statusRes.data?.veteran_status
        });
      }
    } catch (err) {
      console.error('Failed to load service history:', err);
      setError('Unable to load service history');
      toast.error('Failed to load service history');
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded]);

  useEffect(() => {
    if (!initialData) {
      loadData();
    }
  }, [loadData, initialData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Service history refreshed');
  };

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-500">Loading service history...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
          <p className="text-slate-600">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    const totalYears = serviceHistory?.total_service_years || 0;
    const combinedRating = disabilityRating?.combined_rating || 0;
    const isVerified = veteranStatus?.confirmed_veteran;
    const primaryBranch = serviceHistory?.service_episodes?.[0]?.branch || 'Unknown';

    return (
      <div className="p-4 bg-slate-50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{BRANCH_ICONS[primaryBranch] || '🎖️'}</span>
            <div>
              <p className="font-medium text-slate-800">{primaryBranch}</p>
              <p className="text-sm text-slate-500">{totalYears} years of service</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {combinedRating > 0 && (
              <Badge className="bg-blue-100 text-blue-700">{combinedRating}% Rating</Badge>
            )}
            {isVerified && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Military Service History</h2>
          <p className="text-sm text-slate-500">
            Verified service information for VA claims
          </p>
        </div>
        <div className="flex items-center gap-2">
          {demoMode && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Demo Mode
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* VA API Source Banner */}
      {dataSource && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1B3A5F]/5 border border-[#1B3A5F]/20 text-xs text-[#1B3A5F]">
          <Shield className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-medium">{dataSource}</span>
          {retrievedAt && (
            <span className="ml-auto text-[#1B3A5F]/60">
              {new Date(retrievedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      <VeteranStatusBadge status={veteranStatus} />

      {serviceHistory && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              Service Episodes
            </CardTitle>
            <CardDescription>
              {serviceHistory.total_service_years} years, {serviceHistory.total_service_months || 0} months total service
              {serviceHistory.combat_veteran && (
                <Badge className="ml-2 bg-red-100 text-red-700">Combat Veteran</Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {serviceHistory.service_episodes?.map((episode, idx) => (
              <ServiceEpisodeCard key={idx} episode={episode} />
            ))}
          </CardContent>
        </Card>
      )}

      <DisabilityRatingCard rating={disabilityRating} />

      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
        <strong>Use Case:</strong> This verified service history is used to pre-populate claim forms, 
        identify potential service-connected conditions, and verify eligibility for specific VA benefits.
      </div>
    </div>
  );
}

export default ServiceHistoryCard;
