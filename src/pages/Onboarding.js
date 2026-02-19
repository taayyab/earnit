import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import {
  Heart,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Shield,
  Sliders,
  Star,
  Phone,
  MapPin,
  Loader2,
  UserPlus,
  Calendar,
  Target,
  Map,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import ClaimTypeSelector from '../components/claims/ClaimTypeSelector';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import logoImage from '../assets/logo.webp';

const SERVICE_BRANCHES = [
  'Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force'
];

const SERVICE_ERAS = [
  'Post-9/11 (2001-Present)',
  'Gulf War (1990-2001)',
  'Post-Vietnam (1975-1990)',
  'Vietnam Era (1964-1975)',
  'Korean War (1950-1953)',
  'World War II (1941-1945)'
];

const DISCHARGE_STATUSES = [
  { value: 'honorable', label: 'Honorable' },
  { value: 'general', label: 'General (Under Honorable Conditions)' },
  { value: 'other_than_honorable', label: 'Other Than Honorable' },
  { value: 'bad_conduct', label: 'Bad Conduct' },
  { value: 'dishonorable', label: 'Dishonorable' },
  { value: 'uncharacterized', label: 'Uncharacterized' }
];

const INTERACTION_STYLES = [
  { value: 'supportive', label: 'Supportive & Encouraging', description: 'I prefer gentle guidance and emotional support' },
  { value: 'direct', label: 'Direct & Straightforward', description: 'I prefer clear, no-nonsense communication' },
  { value: 'detailed', label: 'Detailed & Thorough', description: 'I like step-by-step explanations' },
  { value: 'flexible', label: 'Flexible / No Preference', description: 'I\'m open to any style' }
];

const FOCUS_AREAS = [
  { value: 'military_transition', label: 'Military Transition', description: 'Adjusting to civilian life' },
  { value: 'va_claims', label: 'VA Claims Process', description: 'Navigating disability claims' },
  { value: 'peer_connection', label: 'Peer Connection & Friendship', description: 'Building veteran community' },
  { value: 'quality_of_life', label: 'Quality of Life', description: 'Health, wellness, and daily living' },
  { value: 'employment', label: 'Employment & Career', description: 'Job search and career development' },
  { value: 'education', label: 'Education & Training', description: 'GI Bill, certifications, skills' },
  { value: 'family_support', label: 'Family Support', description: 'Resources for veteran families' },
  { value: 'financial', label: 'Financial Wellness', description: 'Benefits, budgeting, planning' }
];

const CADENCE_OPTIONS = [
  { value: 'weekly', label: 'Weekly', description: 'Touch base every week' },
  { value: 'biweekly', label: 'Bi-Weekly', description: 'Check in every two weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Meet once a month' },
  { value: 'as_needed', label: 'As Needed', description: 'Reach out when I have questions' }
];

const GOAL_OPTIONS = [
  { value: 'file_initial_claim', label: 'File my initial VA disability claim' },
  { value: 'increase_rating', label: 'Increase my current disability rating' },
  { value: 'appeal_decision', label: 'Appeal a VA decision' },
  { value: 'secondary_conditions', label: 'Add secondary conditions to my claim' },
  { value: 'understand_benefits', label: 'Better understand my VA benefits' },
  { value: 'mental_health_support', label: 'Get mental health support' },
  { value: 'connect_peers', label: 'Connect with other veterans' },
  { value: 'employment_help', label: 'Find employment assistance' }
];

const TOUCHPOINT_TYPES = [
  { value: 'video_call', label: 'Video Call' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'in_person', label: 'In Person' }
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [useWizardMode, setUseWizardMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [advocates, setAdvocates] = useState([]);
  const [loadingAdvocates, setLoadingAdvocates] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    claimType: 'original',
    personal_info: {
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: ''
    },
    service_data: {
      service_branch: '',
      service_era: '',
      discharge_status: ''
    },
    story: '',
    dependents: {
      has_spouse: false,
      num_children: 0,
      num_school_age_children: 0,
      num_dependent_parents: 0,
      smc_eligible: false,
      smc_type: ''
    },
    advocate_preferences: {
      same_service_branch: false,
      same_era: false,
      specific_conditions: false
    },
    matching_preferences: {
      interaction_style: '',
      focus_areas: [],
      preferred_cadence: ''
    },
    selected_advocate_id: null,
    first_touchpoint: {
      date: '',
      time: '',
      type: 'video_call'
    },
    goals: []
  });

  const steps = [
    { id: 'welcome', title: 'Welcome to EarnedIT', subtitle: "You've earned every benefit. We're here to help you get them.", icon: Heart },
    { id: 'personal_info', title: 'Personal Information', subtitle: 'Help us reach you and connect you with local resources', icon: User },
    { id: 'service_data', title: 'Your Service', subtitle: 'Tell us about your military service', icon: Shield },
    { id: 'claim_type', title: 'Claim Type', subtitle: 'Select the type of claim you are filing', icon: FileText },
    { id: 'dependents', title: 'Your Family Information', subtitle: 'This helps us calculate your potential benefits', icon: UserPlus },
    { id: 'matching_preferences', title: 'Matching Preferences', subtitle: 'Help us find the right peer advocate for you', icon: Sliders },
    { id: 'advocate_selection', title: 'Choose Your Advocate', subtitle: 'Select a peer advocate to guide your journey', icon: Users },
    { id: 'schedule', title: 'Schedule Your First Touchpoint', subtitle: 'Pick a time for your first conversation', icon: Calendar },
    { id: 'goals', title: 'Set Your Goals', subtitle: 'What do you hope to achieve?', icon: Target },
    { id: 'resources', title: 'Community Resources', subtitle: 'See what support is available', icon: Map },
    { id: 'complete', title: "You're All Set!", subtitle: "Let's start your journey", icon: CheckCircle2 }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const Icon = currentStepData.icon;

  useEffect(() => {
    if (currentStepData.id === 'advocate_selection') {
      fetchAdvocates();
    }
  }, [currentStep]);

  const fetchAdvocates = async () => {
    setLoadingAdvocates(true);
    try {
      const params = new URLSearchParams();
      if (onboardingData.service_data.service_branch) {
        params.append('service_branch', onboardingData.service_data.service_branch);
      }
      if (onboardingData.service_data.service_era) {
        params.append('service_era', onboardingData.service_data.service_era);
      }
      if (onboardingData.matching_preferences.focus_areas.length > 0) {
        params.append('focus_areas', onboardingData.matching_preferences.focus_areas.join(','));
      }
      const response = await api.get(`/peer-support/available-advocates?${params.toString()}`);
      setAdvocates(response.data.advocates || []);
    } catch (error) {
      console.error('Failed to fetch advocates:', error);
      setAdvocates([]);
    } finally {
      setLoadingAdvocates(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const completeOnboarding = () => {
    // Mark complete and navigate immediately — don't wait for API
    localStorage.setItem('onboarding_completed', 'true');
    toast.success("Welcome to EarnedIT! Let's get started.");
    navigate('/dashboard');

    // Fire API calls in background (non-blocking)
    const { dependents, ...onboardingPayload } = onboardingData;
    api.post('/veteran-profile/dependents', onboardingData.dependents).catch(() => {});
    api.post('/users/complete-onboarding', {
      ...onboardingPayload,
      completed_at: new Date().toISOString()
    }).catch(() => {});
  };

  const updatePersonalInfo = (field, value) => {
    setOnboardingData(prev => ({
      ...prev,
      personal_info: { ...prev.personal_info, [field]: value }
    }));
  };

  const updateServiceData = (field, value) => {
    setOnboardingData(prev => ({
      ...prev,
      service_data: { ...prev.service_data, [field]: value }
    }));
  };

  const updateDependents = (field, value) => {
    setOnboardingData(prev => ({
      ...prev,
      dependents: { ...prev.dependents, [field]: value }
    }));
  };

  const updateAdvocatePreferences = (field, value) => {
    setOnboardingData(prev => ({
      ...prev,
      advocate_preferences: { ...prev.advocate_preferences, [field]: value }
    }));
  };

  const updateMatchingPreferences = (field, value) => {
    setOnboardingData(prev => ({
      ...prev,
      matching_preferences: { ...prev.matching_preferences, [field]: value }
    }));
  };

  const updateFirstTouchpoint = (field, value) => {
    setOnboardingData(prev => ({
      ...prev,
      first_touchpoint: { ...prev.first_touchpoint, [field]: value }
    }));
  };

  const toggleFocusArea = (area) => {
    setOnboardingData(prev => {
      const current = prev.matching_preferences.focus_areas;
      const updated = current.includes(area)
        ? current.filter(a => a !== area)
        : [...current, area];
      return {
        ...prev,
        matching_preferences: { ...prev.matching_preferences, focus_areas: updated }
      };
    });
  };

  const toggleGoal = (goal) => {
    setOnboardingData(prev => {
      const current = prev.goals;
      const updated = current.includes(goal)
        ? current.filter(g => g !== goal)
        : [...current, goal];
      return { ...prev, goals: updated };
    });
  };

  const selectAdvocate = (advocateId) => {
    setOnboardingData(prev => ({
      ...prev,
      selected_advocate_id: advocateId
    }));
  };

  const renderStepContent = () => {
    const step = currentStepData.id;
    
    if (step === 'welcome') {
      return (
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C97B63] flex items-center justify-center">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-[hsl(var(--success))] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold">Welcome Home, {user?.first_name || 'Veteran'}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Thank you for your service. EarnedIT is here to help you navigate the VA disability claims process.
            In the next few steps, we'll gather some information to match you with the perfect peer advocate.
          </p>
        </div>
      );
    }
    
    if (step === 'personal_info') {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                This information helps us connect you with local resources and reach you when needed.
              </p>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={onboardingData.personal_info.phone}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="mt-2"
                data-testid="phone-input"
              />
            </div>
            
            <div className="pt-4 border-t">
              <Label className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4" /> Mailing Address
              </Label>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="address1" className="text-sm text-muted-foreground">Street Address</Label>
                  <Input
                    id="address1"
                    value={onboardingData.personal_info.address_line1}
                    onChange={(e) => updatePersonalInfo('address_line1', e.target.value)}
                    placeholder="123 Main Street"
                    className="mt-1"
                    data-testid="address1-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address2" className="text-sm text-muted-foreground">Apt, Suite, Unit (optional)</Label>
                  <Input
                    id="address2"
                    value={onboardingData.personal_info.address_line2}
                    onChange={(e) => updatePersonalInfo('address_line2', e.target.value)}
                    placeholder="Apt 4B"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-3">
                    <Label htmlFor="city" className="text-sm text-muted-foreground">City</Label>
                    <Input
                      id="city"
                      value={onboardingData.personal_info.city}
                      onChange={(e) => updatePersonalInfo('city', e.target.value)}
                      placeholder="City"
                      className="mt-1"
                      data-testid="city-input"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="state" className="text-sm text-muted-foreground">State</Label>
                    <Input
                      id="state"
                      value={onboardingData.personal_info.state}
                      onChange={(e) => updatePersonalInfo('state', e.target.value)}
                      placeholder="TX"
                      maxLength={2}
                      className="mt-1"
                      data-testid="state-input"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="zip" className="text-sm text-muted-foreground">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={onboardingData.personal_info.zip_code}
                      onChange={(e) => updatePersonalInfo('zip_code', e.target.value)}
                      placeholder="78701"
                      className="mt-1"
                      data-testid="zip-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (step === 'service_data') {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Your service information helps us match you with advocates who share similar experiences.
              </p>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="branch">Branch of Service</Label>
              <select
                id="branch"
                value={onboardingData.service_data.service_branch}
                onChange={(e) => updateServiceData('service_branch', e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                data-testid="branch-select"
              >
                <option value="">Select branch</option>
                {SERVICE_BRANCHES.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="era">Service Era</Label>
              <select
                id="era"
                value={onboardingData.service_data.service_era}
                onChange={(e) => updateServiceData('service_era', e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                data-testid="era-select"
              >
                <option value="">Select era</option>
                {SERVICE_ERAS.map(era => (
                  <option key={era} value={era}>{era}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="discharge">Discharge Status</Label>
              <select
                id="discharge"
                value={onboardingData.service_data.discharge_status}
                onChange={(e) => updateServiceData('discharge_status', e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                data-testid="discharge-select"
              >
                <option value="">Select discharge status</option>
                {DISCHARGE_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                This helps us understand your eligibility for VA benefits.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (step === 'claim_type') {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Select the type of VA claim you are filing. This determines fees, required documents, and next steps.
              </p>
            </CardContent>
          </Card>
          <ClaimTypeSelector
            selectedType={onboardingData.claimType}
            onTypeSelect={(type) => setOnboardingData(prev => ({ ...prev, claimType: type }))}
            disabled={false}
          />
        </div>
      );
    }

    if (step === 'dependents') {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                VA benefits are calculated based on your dependents. This information helps us estimate your potential benefits accurately.
              </p>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Checkbox
                id="has-spouse"
                checked={onboardingData.dependents.has_spouse}
                onCheckedChange={(checked) => updateDependents('has_spouse', checked)}
                data-testid="has-spouse-checkbox"
              />
              <Label htmlFor="has-spouse" className="cursor-pointer text-base">
                I have a spouse
              </Label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="num-children">Number of Dependent Children</Label>
                <Input
                  id="num-children"
                  type="number"
                  min="0"
                  max="20"
                  value={onboardingData.dependents.num_children}
                  onChange={(e) => updateDependents('num_children', parseInt(e.target.value) || 0)}
                  className="mt-2"
                  data-testid="num-children-input"
                />
                <p className="text-xs text-muted-foreground mt-1">Children under 18 or in school</p>
              </div>
              <div>
                <Label htmlFor="school-children">Children Over 18 in School</Label>
                <Input
                  id="school-children"
                  type="number"
                  min="0"
                  max="20"
                  value={onboardingData.dependents.num_school_age_children}
                  onChange={(e) => updateDependents('num_school_age_children', parseInt(e.target.value) || 0)}
                  className="mt-2"
                  data-testid="school-children-input"
                />
                <p className="text-xs text-muted-foreground mt-1">Ages 18-23 attending school full-time</p>
              </div>
            </div>
            <div>
              <Label htmlFor="dependent-parents">Number of Dependent Parents</Label>
              <Input
                id="dependent-parents"
                type="number"
                min="0"
                max="2"
                value={onboardingData.dependents.num_dependent_parents}
                onChange={(e) => updateDependents('num_dependent_parents', parseInt(e.target.value) || 0)}
                className="mt-2 max-w-xs"
                data-testid="dependent-parents-input"
              />
              <p className="text-xs text-muted-foreground mt-1">Parents who depend on you for financial support</p>
            </div>
            <Card className="border-[#D4A574]/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="smc-eligible"
                    checked={onboardingData.dependents.smc_eligible}
                    onCheckedChange={(checked) => updateDependents('smc_eligible', checked)}
                    data-testid="smc-eligible-checkbox"
                  />
                  <div>
                    <Label htmlFor="smc-eligible" className="cursor-pointer text-base">
                      I may qualify for Special Monthly Compensation (SMC)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      For loss of use of limb, blindness, need for aid and attendance, or housebound status
                    </p>
                  </div>
                </div>
                {onboardingData.dependents.smc_eligible && (
                  <div className="mt-4 pl-8">
                    <Label htmlFor="smc-type">SMC Type</Label>
                    <select
                      id="smc-type"
                      value={onboardingData.dependents.smc_type}
                      onChange={(e) => updateDependents('smc_type', e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                      data-testid="smc-type-select"
                    >
                      <option value="">Select type</option>
                      <option value="SMC-K">SMC-K (Loss of use)</option>
                      <option value="SMC-L">SMC-L (Aid and Attendance)</option>
                      <option value="SMC-S">SMC-S (Housebound)</option>
                      <option value="SMC-R">SMC-R (Higher level A&A)</option>
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
    if (step === 'matching_preferences') {
      return (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                These preferences help us find an advocate whose style matches your needs.
              </p>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h4 className="font-semibold mb-4">Advocate Matching Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="same-branch"
                      checked={onboardingData.advocate_preferences.same_service_branch}
                      onCheckedChange={(checked) => updateAdvocatePreferences('same_service_branch', checked)}
                      data-testid="pref-same-branch"
                    />
                    <Label htmlFor="same-branch" className="cursor-pointer">
                      Prefer advocate from same service branch
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="same-era"
                      checked={onboardingData.advocate_preferences.same_era}
                      onCheckedChange={(checked) => updateAdvocatePreferences('same_era', checked)}
                      data-testid="pref-same-era"
                    />
                    <Label htmlFor="same-era" className="cursor-pointer">
                      Prefer advocate from same service era
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="specific-conditions"
                      checked={onboardingData.advocate_preferences.specific_conditions}
                      onCheckedChange={(checked) => updateAdvocatePreferences('specific_conditions', checked)}
                      data-testid="pref-specific-conditions"
                    />
                    <Label htmlFor="specific-conditions" className="cursor-pointer">
                      Prefer advocate with experience in my specific conditions
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div>
              <Label className="text-base font-semibold mb-3 block">Interaction Style</Label>
              <p className="text-sm text-muted-foreground mb-3">How do you prefer to receive guidance?</p>
              <div className="grid md:grid-cols-2 gap-3">
                {INTERACTION_STYLES.map(style => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateMatchingPreferences('interaction_style', style.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      onboardingData.matching_preferences.interaction_style === style.value
                        ? 'border-[#D4A574] bg-[#D4A574]/10'
                        : 'border-border hover:border-[#D4A574]/50'
                    }`}
                    data-testid={`style-${style.value}`}
                  >
                    <p className="font-medium">{style.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-base font-semibold mb-3 block">Area of Focus</Label>
              <p className="text-sm text-muted-foreground mb-3">What type of support do you need? (Select all that apply)</p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map(area => (
                  <button
                    key={area.value}
                    type="button"
                    onClick={() => toggleFocusArea(area.value)}
                    className={`px-4 py-2 border-2 rounded-full text-sm transition-all ${
                      onboardingData.matching_preferences.focus_areas.includes(area.value)
                        ? 'border-[#D4A574] bg-[#D4A574] text-white'
                        : 'border-border hover:border-[#D4A574]/50'
                    }`}
                    data-testid={`focus-${area.value}`}
                  >
                    {onboardingData.matching_preferences.focus_areas.includes(area.value) && '✓ '}
                    {area.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-base font-semibold mb-3 block">Preferred Cadence</Label>
              <p className="text-sm text-muted-foreground mb-3">How often would you like to connect with your advocate?</p>
              <div className="grid md:grid-cols-4 gap-3">
                {CADENCE_OPTIONS.map(cadence => (
                  <button
                    key={cadence.value}
                    type="button"
                    onClick={() => updateMatchingPreferences('preferred_cadence', cadence.value)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      onboardingData.matching_preferences.preferred_cadence === cadence.value
                        ? 'border-[#D4A574] bg-[#D4A574]/10'
                        : 'border-border hover:border-[#D4A574]/50'
                    }`}
                    data-testid={`cadence-${cadence.value}`}
                  >
                    <p className="font-medium">{cadence.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cadence.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (step === 'advocate_selection') {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-[#D4A574]/20 to-[#8B9D83]/20 mb-4">
              <Users className="h-12 w-12 text-[#D4A574]" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">You Don't Have to Do This Alone</h3>
            <p className="text-muted-foreground">
              Based on your preferences, here are peer advocates who can guide you through your claims journey.
            </p>
          </div>
          
          {loadingAdvocates ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4A574]" />
              <span className="ml-3 text-muted-foreground">Finding advocates...</span>
            </div>
          ) : advocates.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {advocates.map(advocate => (
                <Card
                  key={advocate.id}
                  className={`cursor-pointer transition-all ${
                    onboardingData.selected_advocate_id === advocate.id
                      ? 'ring-2 ring-[#D4A574] border-[#D4A574]'
                      : 'hover:border-[#D4A574]/50'
                  }`}
                  onClick={() => selectAdvocate(advocate.id)}
                  data-testid={`advocate-${advocate.id}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1B3A5F] to-[#2a4a6f] flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {advocate.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{advocate.name}</h4>
                          {onboardingData.selected_advocate_id === advocate.id && (
                            <Badge className="bg-[#D4A574] text-white">Selected</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          {advocate.service_branch && (
                            <span>{advocate.service_branch}</span>
                          )}
                          {advocate.service_era && (
                            <>
                              <span>•</span>
                              <span>{advocate.service_era}</span>
                            </>
                          )}
                        </div>
                        {advocate.average_rating > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{advocate.average_rating.toFixed(1)}</span>
                            {advocate.total_veterans_helped > 0 && (
                              <span className="text-sm text-muted-foreground">
                                ({advocate.total_veterans_helped} veterans helped)
                              </span>
                            )}
                          </div>
                        )}
                        {advocate.bio && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{advocate.bio}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-[#E8C9A1]/10 to-[#B5C4AE]/10">
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  We're working on finding advocates that match your preferences.
                  You can continue and we'll match you with an advocate soon.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }
    
    if (step === 'schedule') {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Schedule your first conversation with your peer advocate. This is a great opportunity to get to know each other and discuss your goals.
              </p>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="touchpoint-type">Meeting Type</Label>
              <select
                id="touchpoint-type"
                value={onboardingData.first_touchpoint.type}
                onChange={(e) => updateFirstTouchpoint('type', e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                data-testid="touchpoint-type-select"
              >
                {TOUCHPOINT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="touchpoint-date">Preferred Date</Label>
                <Input
                  id="touchpoint-date"
                  type="date"
                  value={onboardingData.first_touchpoint.date}
                  onChange={(e) => updateFirstTouchpoint('date', e.target.value)}
                  className="mt-2"
                  data-testid="touchpoint-date-input"
                />
              </div>
              <div>
                <Label htmlFor="touchpoint-time">Preferred Time</Label>
                <Input
                  id="touchpoint-time"
                  type="time"
                  value={onboardingData.first_touchpoint.time}
                  onChange={(e) => updateFirstTouchpoint('time', e.target.value)}
                  className="mt-2"
                  data-testid="touchpoint-time-input"
                />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Don't worry if the time doesn't work - your advocate will reach out to confirm a time that works for both of you.
            </p>
          </div>
        </div>
      );
    }
    
    if (step === 'goals') {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                What would you like to accomplish? Select all that apply - this helps us personalize your experience.
              </p>
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            {GOAL_OPTIONS.map(goal => (
              <button
                key={goal.value}
                type="button"
                onClick={() => toggleGoal(goal.value)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all flex items-center gap-3 ${
                  onboardingData.goals.includes(goal.value)
                    ? 'border-[#D4A574] bg-[#D4A574]/10'
                    : 'border-border hover:border-[#D4A574]/50'
                }`}
                data-testid={`goal-${goal.value}`}
              >
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  onboardingData.goals.includes(goal.value)
                    ? 'border-[#D4A574] bg-[#D4A574]'
                    : 'border-muted-foreground'
                }`}>
                  {onboardingData.goals.includes(goal.value) && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="font-medium">{goal.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    if (step === 'resources') {
      return (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Here are some resources available to you as part of the EarnedIT community.
              </p>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-[#D4A574]/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#D4A574]/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#D4A574]" />
                  </div>
                  <h4 className="font-semibold">Veteran Advocate Community</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect with fellow veterans who understand your journey. Share experiences and get advice.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-[#D4A574]/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#D4A574]/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[#D4A574]" />
                  </div>
                  <h4 className="font-semibold">Claims Assistance</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Expert help navigating the VA claims process from start to finish.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-[#D4A574]/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#D4A574]/20 flex items-center justify-center">
                    <Target className="h-5 w-5 text-[#D4A574]" />
                  </div>
                  <h4 className="font-semibold">Benefits Calculator</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Estimate your potential VA disability benefits based on your conditions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-[#D4A574]/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#D4A574]/20 flex items-center justify-center">
                    <Map className="h-5 w-5 text-[#D4A574]" />
                  </div>
                  <h4 className="font-semibold">Local Resources</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Find VA facilities, VSOs, and veteran support organizations near you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
    if (step === 'complete') {
      return (
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#10B981] to-[#8B9D83] flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold">You're All Set!</h2>
          <p className="text-lg text-muted-foreground">
            {onboardingData.selected_advocate_id 
              ? "Your advocate will be in touch soon to schedule your first conversation."
              : "We're matching you with the perfect peer advocate. You'll receive a notification once we find your match."
            }
          </p>
          {onboardingData.goals.length > 0 && (
            <Card className="bg-gradient-to-br from-[#E8C9A1]/10 to-[#B5C4AE]/10 text-left">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Your Goals</h4>
                <ul className="space-y-2">
                  {onboardingData.goals.map(goalValue => {
                    const goal = GOAL_OPTIONS.find(g => g.value === goalValue);
                    return goal ? (
                      <li key={goalValue} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                        {goal.label}
                      </li>
                    ) : null;
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }
    
    return <div className="text-center">Step content coming soon...</div>;
  };

  if (useWizardMode) {
    return (
      <OnboardingWizard
        onComplete={() => {
          localStorage.setItem('onboarding_completed', 'true');
          setUseWizardMode(false);
          navigate('/dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="onboarding-page">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoImage} alt="EarnedIT" className="h-20 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-[#1B3A5F]">EarnedIT</h1>
              <p className="text-xs text-slate-500">Let's get you set up</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
            <span className="font-medium text-[#D4A574]">{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-[#D4A574]/10 to-[#8B9D83]/10 mb-4">
            <Icon className="h-8 w-8 text-[hsl(var(--primary))]" />
          </div>
          <h2 className="text-3xl font-bold mb-2">{currentStepData.title}</h2>
          <p className="text-muted-foreground text-lg">{currentStepData.subtitle}</p>
        </div>

        {renderStepContent()}

        <div className="flex items-center justify-between mt-12 max-w-3xl mx-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            data-testid="onboarding-back-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={
                  `h-2 rounded-full transition-all ${
                    index === currentStep ? 'w-8 bg-[#D4A574]' : index < currentStep ? 'w-2 bg-[#D4A574]' : 'w-2 bg-neutral-300'
                  }`
                }
              />
            ))}
          </div>
          <Button
            onClick={handleNext}
            disabled={loading}
            className="bg-[hsl(var(--accent))] hover:bg-[#8F1B29]"
            data-testid="onboarding-next-button"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>Go to Dashboard<ArrowRight className="h-4 w-4 ml-2" /></>
            ) : (
              <>Continue<ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
