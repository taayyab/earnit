import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import {
  Home,
  Briefcase,
  Heart,
  DollarSign,
  Scale,
  GraduationCap,
  Activity,
  Users,
  Phone,
  Globe,
  MapPin,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  UserPlus,
  ExternalLink,
  Loader2,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_ICONS = {
  housing: Home,
  employment: Briefcase,
  mental_health: Heart,
  financial: DollarSign,
  legal: Scale,
  education: GraduationCap,
  healthcare: Activity,
  family: Users
};

const CATEGORY_COLORS = {
  housing: 'text-blue-500',
  employment: 'text-green-500',
  mental_health: 'text-[#1B3A5F]',
  financial: 'text-yellow-600',
  legal: 'text-gray-600',
  education: 'text-[#1B3A5F]',
  healthcare: 'text-red-500',
  family: 'text-pink-500'
};

export default function WraparoundServices({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [crisisResources, setCrisisResources] = useState([]);
  const [creatingCase, setCreatingCase] = useState(false);
  const [caseCreated, setCaseCreated] = useState(null);
  const [requestingService, setRequestingService] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const [questionsRes, crisisRes] = await Promise.all([
        api.get('/wraparound/assessment/questions'),
        api.get('/wraparound/crisis-resources')
      ]);
      setQuestions(questionsRes.data.questions || []);
      setCrisisResources(crisisRes.data.resources || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
      toast.error('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId, value, checked) => {
    setResponses(prev => {
      const current = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, value] };
      } else {
        return { ...prev, [questionId]: current.filter(v => v !== value) };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const formattedResponses = Object.entries(responses).map(([questionId, answer]) => ({
        question_id: questionId,
        answer: answer
      }));

      const response = await api.post('/wraparound/assessment/submit', {
        responses: formattedResponses
      });

      setResult(response.data.result);
      toast.success('Assessment completed!');
      if (onComplete) onComplete(response.data.result);
    } catch (err) {
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAdvocateHelp = async () => {
    if (!result) return;
    
    try {
      setCreatingCase(true);
      const response = await api.post('/support-cases/create', {
        assessment_result: result
      });
      
      if (response.data.success) {
        setCaseCreated(response.data);
        toast.success('Support case created! An advocate will reach out to help you.');
      } else {
        toast.error('Failed to create support case');
      }
    } catch (err) {
      console.error('Failed to create support case:', err);
      toast.error('Failed to request advocate help. Please try again.');
    } finally {
      setCreatingCase(false);
    }
  };

  const handleRequestServiceHelp = async (service) => {
    if (caseCreated) {
      toast.info(`Your advocate will help connect you with ${service.name}`);
      return;
    }
    
    setRequestingService(service.name);
    
    try {
      const caseResponse = await api.post('/support-cases/create', {
        assessment_result: {
          ...result,
          priority_service: service.name
        }
      });
      
      if (caseResponse.data.success) {
        setCaseCreated(caseResponse.data);
        toast.success(`Support case created! An advocate will help connect you with ${service.name}.`);
      }
    } catch (err) {
      console.error('Failed to request service help:', err);
      toast.error('Failed to request help. Please try again.');
    } finally {
      setRequestingService(null);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[#D4A574] border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card className="border-2 border-[#8B9D83]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#C97B63]" />
            Support Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <Heart className="h-12 w-12 text-[#C97B63] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">We're Here to Help</h3>
            <p className="text-muted-foreground mb-4">
              Connect with resources for housing, employment, mental health, and more.
            </p>
            <Button 
              onClick={loadQuestions}
              className="bg-gradient-to-r from-[#D4A574] to-[#C97B63] hover:from-[#B8895E] hover:to-[#A85F4A] text-white"
            >
              Start Assessment
            </Button>
          </div>
          
          {crisisResources.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 text-sm">Need immediate help?</p>
                  <p className="text-sm text-red-700">
                    Veterans Crisis Line: <strong>988 (Press 1)</strong> - Available 24/7
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className="border-2 border-[#8B9D83]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Assessment Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`p-4 rounded-lg ${
            result.urgency_level === 'crisis' ? 'bg-red-100 border-red-300' :
            result.urgency_level === 'urgent' ? 'bg-orange-100 border-orange-300' :
            result.urgency_level === 'moderate' ? 'bg-yellow-100 border-yellow-300' :
            'bg-green-100 border-green-300'
          } border`}>
            <p className="font-semibold">
              {result.urgency_level === 'crisis' ? 'Immediate Support Available' :
               result.urgency_level === 'urgent' ? 'Priority Support Recommended' :
               result.urgency_level === 'moderate' ? 'Services Available' :
               'Resources Available'}
            </p>
            {result.urgency_level === 'crisis' && (
              <p className="text-sm mt-2">
                If you're in immediate crisis, please call the Veterans Crisis Line: 988 (Press 1)
              </p>
            )}
          </div>

          {caseCreated ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800">Support Case Created</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Case #{caseCreated.case_id?.slice(0, 8)}... has been created. 
                    A veteran advocate will review your needs and reach out within 24 hours 
                    to help connect you with the right services.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <ClipboardList className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Your advocate will coordinate with community partners on your behalf
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <UserPlus className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-800">Get Personalized Help</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Request an advocate to help you navigate these services. They'll connect 
                    you with community partners and ensure you get the support you need.
                  </p>
                  <Button
                    onClick={handleRequestAdvocateHelp}
                    disabled={creatingCase}
                    className="mt-3 bg-[#1B3A5F] hover:bg-[#2a4a6f] text-white"
                  >
                    {creatingCase ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Case...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Request Advocate Help
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {result.identified_needs?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Identified Needs</h4>
              <div className="space-y-2">
                {result.identified_needs.map((need, i) => {
                  const Icon = CATEGORY_ICONS[need.category] || Heart;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-lg">
                      <Icon className={`h-5 w-5 ${CATEGORY_COLORS[need.category]} mt-0.5`} />
                      <div>
                        <p className="font-medium text-sm">{need.response}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {need.urgency}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.recommended_services?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Recommended Services</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {caseCreated 
                  ? "Your advocate will help connect you with these services:"
                  : "Click 'Get Help' on any service to have an advocate assist you:"}
              </p>
              <div className="grid gap-4">
                {result.recommended_services.slice(0, 6).map((service, i) => {
                  const Icon = CATEGORY_ICONS[service.category] || Heart;
                  const isRequesting = requestingService === service.name;
                  return (
                    <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-white border border-slate-100 ${CATEGORY_COLORS[service.category]}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold">{service.name}</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              {service.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {service.contact_phone && (
                                <a
                                  href={`tel:${service.contact_phone}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                                >
                                  <Phone className="h-3 w-3" />
                                  Call Now
                                </a>
                              )}
                              {service.website && (
                                <a
                                  href={service.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Visit Website
                                </a>
                              )}
                              {!caseCreated && (
                                <button
                                  onClick={() => handleRequestServiceHelp(service)}
                                  disabled={isRequesting}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-[#1B3A5F] rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
                                >
                                  {isRequesting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <UserPlus className="h-3 w-3" />
                                  )}
                                  Get Help
                                </button>
                              )}
                              {service.location && (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white text-gray-600 rounded-full">
                                  <MapPin className="h-3 w-3" />
                                  {service.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {result.follow_up_date && (
            <p className="text-sm text-muted-foreground text-center">
              Follow-up recommended by: {new Date(result.follow_up_date).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#8B9D83]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-[#C97B63]" />
          Wraparound Services Assessment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Let us help connect you with additional support services
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4A574] to-[#8B9D83] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {crisisResources.length > 0 && currentQuestion?.category === 'mental_health' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Need immediate help?</p>
                <p className="text-sm text-red-700">
                  Veterans Crisis Line: <strong>988 (Press 1)</strong> - Available 24/7
                </p>
              </div>
            </div>
          </div>
        )}

        {currentQuestion && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              {(() => {
                const Icon = CATEGORY_ICONS[currentQuestion.category] || Heart;
                return (
                  <div className={`p-2 rounded-lg bg-white border border-slate-100 ${CATEGORY_COLORS[currentQuestion.category]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                );
              })()}
              <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
            </div>

            {currentQuestion.type === 'radio' && (
              <RadioGroup
                value={responses[currentQuestion.id] || ''}
                onValueChange={(value) => handleResponse(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      responses[currentQuestion.id] === option.value
                        ? 'border-[#D4A574] bg-[#D4A574]/5'
                        : 'border-border hover:border-[#D4A574]/50'
                    }`}
                    onClick={() => handleResponse(currentQuestion.id, option.value)}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'checkbox' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      (responses[currentQuestion.id] || []).includes(option.value)
                        ? 'border-[#D4A574] bg-[#D4A574]/5'
                        : 'border-border hover:border-[#D4A574]/50'
                    }`}
                    onClick={() => {
                      const isChecked = (responses[currentQuestion.id] || []).includes(option.value);
                      handleCheckboxChange(currentQuestion.id, option.value, !isChecked);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={(responses[currentQuestion.id] || []).includes(option.value)}
                        onCheckedChange={(checked) => handleCheckboxChange(currentQuestion.id, option.value, checked)}
                      />
                      <Label className="cursor-pointer flex-1">
                        {option.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          {currentStep === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-[#D4A574] to-[#C97B63] hover:from-[#B8895E] hover:to-[#A85F4A] text-white"
            >
              {submitting ? 'Submitting...' : 'Complete Assessment'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#D4A574] to-[#C97B63] hover:from-[#B8895E] hover:to-[#A85F4A] text-white"
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
