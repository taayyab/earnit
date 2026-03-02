import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  Target,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  Clock
} from 'lucide-react';

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild', description: 'Occasional symptoms, minimal impact' },
  { value: 'moderate', label: 'Moderate', description: 'Regular symptoms, some daily impact' },
  { value: 'severe', label: 'Severe', description: 'Frequent symptoms, significant daily impact' },
  { value: 'total', label: 'Total', description: 'Constant symptoms, prevents normal activities' }
];

export default function ClaimAssemblyReview({
  serviceProfile,
  conditions,
  conditionScores,
  approvalReadiness,
  onConfirm,
  loading
}) {
  const [serviceConfirmed, setServiceConfirmed] = useState(false);
  const [conditionConfirmations, setConditionConfirmations] = useState(() => {
    if (!conditions || conditions.length === 0) return [];
    
    return conditions.map((c, idx) => {
      const matchingScore = conditionScores?.find(
        s => s.condition_name === (c.name || c.condition_name)
      ) || conditionScores?.[idx];
      
      return {
        condition_id: c.id || `cond-${idx}`,
        condition_name: c.name || c.condition_name,
        confirmed: true,
        severity_level: c.severity_level || c.severity || c.severity_documented || null,
        diagnostic_code: c.diagnostic_code || null
      };
    });
  });
  const [expandedCondition, setExpandedCondition] = useState(null);
  const [contactPrefs, setContactPrefs] = useState({
    preferred_contact: 'email',
    phone_number: '',
    email: '',
    best_time_to_call: ''
  });

  const handleConditionToggle = (index, confirmed) => {
    setConditionConfirmations(prev => 
      prev.map((c, i) => i === index ? { ...c, confirmed } : c)
    );
  };

  const handleSeverityChange = (index, severity) => {
    setConditionConfirmations(prev =>
      prev.map((c, i) => i === index ? { ...c, severity_level: severity } : c)
    );
  };

  const getScoreForCondition = (conditionName) => {
    if (!conditionScores || conditionScores.length === 0) return null;
    return conditionScores.find(s => 
      s.condition_name === conditionName || 
      s.diagnostic_code === conditionName
    ) || null;
  };

  const handleSubmit = () => {
    const hasValidContact = 
      contactPrefs.preferred_contact === 'email' || 
      (contactPrefs.preferred_contact === 'phone' && contactPrefs.phone_number?.trim()) ||
      (contactPrefs.preferred_contact === 'text' && contactPrefs.phone_number?.trim());
    
    const submissionData = {
      service_info_confirmed: serviceConfirmed,
      conditions: conditionConfirmations
    };
    
    if (hasValidContact && (contactPrefs.phone_number?.trim() || contactPrefs.email?.trim())) {
      submissionData.contact_preferences = {
        preferred_contact: contactPrefs.preferred_contact,
        ...(contactPrefs.phone_number?.trim() && { phone_number: contactPrefs.phone_number.trim() }),
        ...(contactPrefs.email?.trim() && { email: contactPrefs.email.trim() }),
        ...(contactPrefs.best_time_to_call?.trim() && { best_time_to_call: contactPrefs.best_time_to_call.trim() })
      };
    }
    
    onConfirm(submissionData);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getReadinessColor = (level) => {
    switch (level) {
      case 'submission_ready': return 'bg-green-500';
      case 'needs_minor_work': return 'bg-yellow-500';
      case 'needs_significant_work': return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  const confirmedCount = conditionConfirmations.filter(c => c.confirmed).length;
  const allConfirmed = serviceConfirmed && confirmedCount > 0;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Approval Readiness Score
          </CardTitle>
          <CardDescription>
            This score indicates how ready your claim is for VA approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Progress 
                value={approvalReadiness?.overall_score || 0} 
                className="h-4"
              />
            </div>
            <span className={`text-2xl font-bold ${getScoreColor(approvalReadiness?.overall_score || 0)}`}>
              {approvalReadiness?.overall_score || 0}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getReadinessColor(approvalReadiness?.readiness_level)}>
              {approvalReadiness?.readiness_level?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {approvalReadiness?.recommendation || 'Complete the review below.'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Service Information
            {serviceConfirmed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </CardTitle>
          <CardDescription>
            We extracted this from your DD-214. Please confirm it's correct.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-slate-100">
            <div>
              <p className="text-sm text-muted-foreground">Branch</p>
              <p className="font-medium">{serviceProfile?.branch || 'Not found'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entry Date</p>
              <p className="font-medium">{serviceProfile?.entry_date || 'Not found'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Separation Date</p>
              <p className="font-medium">{serviceProfile?.separation_date || 'Not found'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Discharge Type</p>
              <p className="font-medium">{serviceProfile?.discharge_type || 'Not found'}</p>
            </div>
          </div>
          
          {serviceProfile?.mos && (
            <div className="p-4 bg-white rounded-lg border border-slate-100">
              <p className="text-sm text-muted-foreground">MOS/Rating</p>
              <p className="font-medium">{serviceProfile.mos}</p>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Switch
              id="confirm-service"
              checked={serviceConfirmed}
              onCheckedChange={setServiceConfirmed}
            />
            <Label htmlFor="confirm-service" className="text-base cursor-pointer">
              I confirm this service information is correct
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#1B3A5F]" />
            Identified Conditions
            <Badge variant="outline">{confirmedCount} of {conditions?.length || 0} confirmed</Badge>
          </CardTitle>
          <CardDescription>
            Our AI identified these conditions from your medical records. 
            Toggle off any that don't apply, and select your current severity level.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {conditions?.map((condition, index) => {
            const conditionName = condition.name || condition.condition_name;
            const score = getScoreForCondition(conditionName) || {};
            const confirmation = conditionConfirmations[index] || {};
            const isExpanded = expandedCondition === index;
            
            return (
              <div 
                key={index}
                className={`border rounded-lg transition-all ${
                  confirmation.confirmed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Switch
                        checked={confirmation.confirmed}
                        onCheckedChange={(checked) => handleConditionToggle(index, checked)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{condition.name || condition.condition_name}</h4>
                          {condition.is_presumptive && (
                            <Badge className="bg-blue-500 text-xs">Presumptive</Badge>
                          )}
                          {score.overall_score >= 80 && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        {condition.diagnostic_code && (
                          <p className="text-sm text-muted-foreground">
                            VA Code: {condition.diagnostic_code}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getScoreColor(score.overall_score || 0)}`}>
                        {score.overall_score || 0}% ready
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedCondition(isExpanded ? null : index)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {confirmation.confirmed && (
                    <div className="mt-4 pl-10">
                      <Label className="text-sm font-medium mb-2 block">Current Severity Level</Label>
                      <RadioGroup
                        value={confirmation.severity_level}
                        onValueChange={(v) => handleSeverityChange(index, v)}
                        className="grid grid-cols-2 md:grid-cols-4 gap-2"
                      >
                        {SEVERITY_OPTIONS.map(opt => (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`severity-${index}-${opt.value}`} />
                            <Label 
                              htmlFor={`severity-${index}-${opt.value}`}
                              className="text-sm cursor-pointer"
                            >
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t mt-2 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Evidence Summary</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            {condition.current_diagnosis ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                            <span>Current diagnosis</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {condition.in_service_documentation ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                            <span>In-service documentation</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {condition.medical_nexus ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                            <span>Medical nexus opinion</span>
                          </div>
                        </div>
                      </div>
                      
                      {score.specific_gaps?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Evidence Gaps
                          </h5>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {score.specific_gaps.map((gap, gi) => (
                              <li key={gi}>{gap.description}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-600" />
            Contact Preferences
          </CardTitle>
          <CardDescription>
            How should we contact you about your claim?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Contact Method</Label>
            <RadioGroup
              value={contactPrefs.preferred_contact}
              onValueChange={(v) => setContactPrefs(p => ({ ...p, preferred_contact: v }))}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="contact-email" />
                <Label htmlFor="contact-email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="contact-phone" />
                <Label htmlFor="contact-phone">Phone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="contact-text" />
                <Label htmlFor="contact-text">Text Message</Label>
              </div>
            </RadioGroup>
          </div>

          {contactPrefs.preferred_contact === 'phone' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={contactPrefs.phone_number}
                  onChange={(e) => setContactPrefs(p => ({ ...p, phone_number: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="best-time">Best Time to Call</Label>
                <Select
                  value={contactPrefs.best_time_to_call}
                  onValueChange={(v) => setContactPrefs(p => ({ ...p, best_time_to_call: v }))}
                >
                  <SelectTrigger id="best-time">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8am-12pm)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                    <SelectItem value="evening">Evening (5pm-8pm)</SelectItem>
                    <SelectItem value="anytime">Anytime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-slate-200">
        <div>
          <p className="font-medium">Ready to submit?</p>
          <p className="text-sm text-muted-foreground">
            {allConfirmed 
              ? `${confirmedCount} condition(s) confirmed and ready for review.`
              : 'Please confirm your service information and at least one condition.'}
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!allConfirmed || loading}
          className="bg-[#1B3A5F] hover:bg-[#2a4a6f]"
        >
          {loading ? 'Submitting...' : 'Confirm & Continue'}
        </Button>
      </div>
    </div>
  );
}
