import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Plus,
  Search,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  X,
  ClipboardList,
  Play,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { OnboardingQuickStart } from './ClientOnboardingPanel';

const CLAIM_TYPES = [
  { value: 'original', label: 'Original Claim', description: 'First-time disability claim' },
  { value: 'supplemental', label: 'Supplemental Claim', description: 'New evidence for previous denial' },
  { value: 'higher_level_review', label: 'Higher-Level Review', description: 'Request review by senior reviewer' },
  { value: 'board_appeal', label: 'Board Appeal', description: 'Appeal to Board of Veterans Appeals' },
];

const COMMON_CONDITIONS = [
  'PTSD',
  'Tinnitus',
  'Hearing Loss',
  'Back Pain / Lumbar Strain',
  'Knee Condition',
  'Sleep Apnea',
  'Migraines / Headaches',
  'Anxiety',
  'Depression',
  'TBI (Traumatic Brain Injury)',
  'Shoulder Condition',
  'Scars',
];

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function CreateClaimModal({ onClaimCreated }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVeteran, setSelectedVeteran] = useState(null);
  const [isNewVeteran, setIsNewVeteran] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [claimType, setClaimType] = useState('original');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [customCondition, setCustomCondition] = useState('');
  const [notes, setNotes] = useState('');
  
  const [createdClaim, setCreatedClaim] = useState(null);
  
  const [autoPopulateData, setAutoPopulateData] = useState(null);
  const [loadingAutoPopulate, setLoadingAutoPopulate] = useState(false);
  const [hasAutoPopulated, setHasAutoPopulated] = useState(false);

  const searchVeterans = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      
      try {
        setSearchLoading(true);
        const response = await api.get(`/agent/veterans/search?q=${encodeURIComponent(query)}`);
        setSearchResults(response.data.veterans || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchVeterans(searchQuery);
  }, [searchQuery, searchVeterans]);

  const resetForm = () => {
    setStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedVeteran(null);
    setIsNewVeteran(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setClaimType('original');
    setSelectedConditions([]);
    setCustomCondition('');
    setNotes('');
    setCreatedClaim(null);
    setAutoPopulateData(null);
    setHasAutoPopulated(false);
  };

  const fetchAutoPopulateData = async (veteranId) => {
    if (!veteranId) return;
    
    try {
      setLoadingAutoPopulate(true);
      const response = await api.get('/claims-intelligence/auto-populate-data');
      
      if (response.data.success && response.data.has_data) {
        setAutoPopulateData(response.data);
        
        if (response.data.conditions?.length > 0 && !hasAutoPopulated) {
          const conditionNames = response.data.conditions.map(c => c.name).filter(Boolean);
          if (conditionNames.length > 0) {
            setSelectedConditions(prev => {
              const newConditions = [...prev];
              conditionNames.forEach(name => {
                if (!newConditions.includes(name)) {
                  newConditions.push(name);
                }
              });
              return newConditions;
            });
            setHasAutoPopulated(true);
            toast.success(`Auto-filled ${conditionNames.length} condition(s) from your documents`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch auto-populate data:', error);
    } finally {
      setLoadingAutoPopulate(false);
    }
  };

  const applyAutoPopulate = () => {
    if (!autoPopulateData?.conditions) return;
    
    const conditionNames = autoPopulateData.conditions.map(c => c.name).filter(Boolean);
    setSelectedConditions(prev => {
      const newConditions = [...prev];
      conditionNames.forEach(name => {
        if (!newConditions.includes(name)) {
          newConditions.push(name);
        }
      });
      return newConditions;
    });
    setHasAutoPopulated(true);
    toast.success(`Added ${conditionNames.length} condition(s) from document analysis`);
  };

  const handleSelectVeteran = (veteran) => {
    setSelectedVeteran(veteran);
    setFirstName(veteran.name.split(' ')[0] || '');
    setLastName(veteran.name.split(' ').slice(1).join(' ') || '');
    setEmail(veteran.email);
    setIsNewVeteran(false);
    setStep(2);
    fetchAutoPopulateData(veteran.veteran_id || veteran.id);
  };

  const handleNewVeteran = () => {
    setSelectedVeteran(null);
    setIsNewVeteran(true);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setStep(2);
  };

  const toggleCondition = (condition) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions(prev => [...prev, customCondition.trim()]);
      setCustomCondition('');
    }
  };

  const removeCondition = (condition) => {
    setSelectedConditions(prev => prev.filter(c => c !== condition));
  };

  const validateStep2 = () => {
    if (!firstName.trim()) {
      toast.error('Please enter a first name');
      return false;
    }
    if (!lastName.trim()) {
      toast.error('Please enter a last name');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    try {
      setLoading(true);
      const response = await api.post('/agent/claims/create', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        claim_type: claimType,
        initial_conditions: selectedConditions.length > 0 ? selectedConditions : null,
        notes: notes.trim() || null,
      });
      
      setCreatedClaim(response.data);
      setStep(4);
      
      toast.success('Claim created successfully!');
      
      if (onClaimCreated) {
        onClaimCreated(response.data);
      }
    } catch (error) {
      console.error('Failed to create claim:', error);
      toast.error(error.response?.data?.detail || 'Failed to create claim');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClaim = () => {
    setOpen(false);
    navigate(`/agent/claim/${createdClaim.claim_id}`);
  };

  const handleCreateAnother = () => {
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Claim
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#1B3A5F]" />
            {step === 1 && 'Create New Claim - Find Veteran'}
            {step === 2 && 'Create New Claim - Veteran Details'}
            {step === 3 && 'Create New Claim - Claim Details'}
            {step === 4 && 'Claim Created Successfully'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Search for an existing veteran or create a new record'}
            {step === 2 && 'Confirm or enter veteran information'}
            {step === 3 && 'Select claim type and initial conditions'}
            {step === 4 && 'Your new claim has been created and assigned to you'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s < step ? 'bg-green-500 text-white' :
                  s === step ? 'bg-[#1B3A5F] text-white' :
                  'bg-gray-200 text-gray-500'
                }`}
              >
                {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-1 rounded ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-[200px] overflow-auto">
                {searchResults.map((veteran) => (
                  <div
                    key={veteran.id}
                    className="p-3 hover:bg-muted cursor-pointer transition-colors flex items-center justify-between"
                    onClick={() => handleSelectVeteran(veteran)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-[#1B3A5F]" />
                      </div>
                      <div>
                        <div className="font-medium">{veteran.name}</div>
                        <div className="text-sm text-muted-foreground">{veteran.email}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {veteran.claims_count} claim{veteran.claims_count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-4 text-muted-foreground">
                No veterans found matching "{searchQuery}"
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground px-2">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleNewVeteran}
            >
              <UserPlus className="h-4 w-4" />
              Create New Veteran Record
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {selectedVeteran && (
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-[#1B3A5F]" />
                    </div>
                    <div>
                      <div className="font-medium">Existing Veteran</div>
                      <div className="text-sm text-muted-foreground">{selectedVeteran.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  disabled={selectedVeteran && !isNewVeteran}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  disabled={selectedVeteran && !isNewVeteran}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="veteran@email.com"
                disabled={!!selectedVeteran}
              />
              {selectedVeteran && (
                <p className="text-xs text-muted-foreground">Email cannot be changed for existing veterans</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {autoPopulateData?.has_data && autoPopulateData.conditions?.length > 0 && !hasAutoPopulated && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900 text-sm">
                          {autoPopulateData.conditions.length} condition(s) found from documents
                        </div>
                        <div className="text-xs text-blue-700">
                          Auto-fill from prior document analysis
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={applyAutoPopulate}
                      disabled={loadingAutoPopulate}
                    >
                      {loadingAutoPopulate ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Apply
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label>Claim Type *</Label>
              <Select value={claimType} onValueChange={setClaimType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLAIM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Initial Conditions (Optional)</Label>
              <div className="flex flex-wrap gap-2">
                {selectedConditions.map((condition) => (
                  <Badge 
                    key={condition} 
                    className="gap-1 bg-[#1B3A5F] cursor-pointer hover:bg-[#1B3A5F]/80"
                    onClick={() => removeCondition(condition)}
                  >
                    {condition}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {COMMON_CONDITIONS.filter(c => !selectedConditions.includes(c)).map((condition) => (
                  <Badge 
                    key={condition} 
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => toggleCondition(condition)}
                  >
                    + {condition}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add custom condition..."
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomCondition()}
                />
                <Button variant="outline" onClick={addCustomCondition}>
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Agent Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any initial notes about this claim..."
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 4 && createdClaim && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Claim Created!</h3>
              <p className="text-muted-foreground">
                {createdClaim.is_new_veteran ? 'New veteran record created and ' : ''}
                Claim #{createdClaim.claim_number} is ready
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Claim Number</div>
                    <div className="font-mono font-medium">{createdClaim.claim_number}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Veteran</div>
                    <div className="font-medium">{firstName} {lastName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Claim Type</div>
                    <div className="font-medium capitalize">{claimType.replace(/_/g, ' ')}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Conditions</div>
                    <div className="font-medium">{selectedConditions.length || 'None specified'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <OnboardingQuickStart
              claimId={createdClaim.claim_id}
              veteranId={createdClaim.veteran_id}
              veteranName={`${firstName} ${lastName}`}
              conditions={selectedConditions}
              claimType={claimType}
              onComplete={() => toast.success('Client onboarding started!')}
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && step < 4 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          {step === 2 && (
            <Button onClick={() => {
              if (validateStep2()) setStep(3);
            }}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {step === 3 && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Claim
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
          
          {step === 4 && (
            <>
              <Button variant="outline" onClick={handleCreateAnother}>
                <Plus className="h-4 w-4 mr-2" />
                Create Another
              </Button>
              <Button onClick={handleViewClaim}>
                View Claim
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateClaimModal;
