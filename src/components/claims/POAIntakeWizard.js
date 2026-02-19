import React, { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  FileText,
  Shield,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PenTool,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Scale,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

const WIZARD_STEPS = [
  { id: 1, name: 'POA Form', icon: FileText, description: 'Select Power of Attorney form' },
  { id: 2, name: 'Fee Agreement', icon: DollarSign, description: 'Set up fee agreement (if applicable)' },
  { id: 3, name: 'Consents', icon: Shield, description: 'Capture required consents' },
  { id: 4, name: 'Signature', icon: PenTool, description: 'E-signature capture' },
  { id: 5, name: 'Confirm', icon: CheckCircle2, description: 'Review and submit' },
];

export function POAIntakeWizard({ claimId, claimType, veteranName, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formTypes, setFormTypes] = useState([]);
  const [feeAgreementTypes, setFeeAgreementTypes] = useState([]);
  const [consentRequirements, setConsentRequirements] = useState([]);
  const [existingData, setExistingData] = useState(null);
  
  const [poaFormType, setPoaFormType] = useState('21-22a');
  const [feeAgreementType, setFeeAgreementType] = useState('direct_pay');
  const [feePercentage, setFeePercentage] = useState(20);
  const [priorDecisionDate, setPriorDecisionDate] = useState('');
  const [consents, setConsents] = useState({});
  const [signatureName, setSignatureName] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const [isFeeEligible, setIsFeeEligible] = useState(false);
  const [feeEligibilityReason, setFeeEligibilityReason] = useState('');
  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    loadFormTypes();
    loadExistingData();
  }, [claimId]);

  useEffect(() => {
    checkFeeEligibility();
  }, [claimType, priorDecisionDate]);

  const loadFormTypes = async () => {
    try {
      const response = await api.get('/poa-agreements/form-types');
      setFormTypes(response.data.poa_forms || []);
      setFeeAgreementTypes(response.data.fee_agreement_types || []);
      setConsentRequirements(response.data.consent_requirements || []);
      
      const initialConsents = {};
      (response.data.consent_requirements || []).forEach(c => {
        initialConsents[c.id] = false;
      });
      setConsents(initialConsents);
    } catch (error) {
      console.error('Failed to load form types:', error);
      toast.error('Failed to load form configuration');
    }
  };

  const loadExistingData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/poa-agreements/claim/${claimId}`);
      setExistingData(response.data);
      
      if (response.data.fee_eligibility) {
        setIsFeeEligible(response.data.fee_eligibility.is_eligible);
        setFeeEligibilityReason(response.data.fee_eligibility.reason);
      }
      
      if (response.data.consents?.length > 0) {
        const existingConsents = {};
        response.data.consents.forEach(c => {
          existingConsents[c.consent_type] = c.granted;
        });
        setConsents(prev => ({ ...prev, ...existingConsents }));
      }
    } catch (error) {
      console.error('Failed to load existing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFeeEligibility = () => {
    const nonOriginalTypes = ['supplemental_claim', 'supplemental', 'appeal', 'board_appeal', 'higher_level_review'];
    const isNonOriginal = nonOriginalTypes.includes(claimType);
    
    if (!isNonOriginal) {
      setIsFeeEligible(false);
      setFeeEligibilityReason('Fees cannot be charged on original claims per 38 CFR 14.636');
    } else if (!priorDecisionDate) {
      setIsFeeEligible(false);
      setFeeEligibilityReason('Prior VA decision date required for fee agreement');
    } else {
      setIsFeeEligible(true);
      setFeeEligibilityReason('Claim is eligible for fees under 38 CFR 14.636');
    }
  };

  const handleConsentChange = (consentId, value) => {
    setConsents(prev => ({ ...prev, [consentId]: value }));
  };

  const validateStep = (stepNum) => {
    switch (stepNum) {
      case 1:
        return !!poaFormType;
      case 2:
        if (!isFeeEligible) return true;
        const maxPct = feeAgreementTypes.find(f => f.id === feeAgreementType)?.max_percentage || 20;
        return feePercentage > 0 && feePercentage <= maxPct && priorDecisionDate;
      case 3:
        const requiredConsents = consentRequirements.filter(c => c.required);
        return requiredConsents.every(c => consents[c.id]);
      case 4:
        return signatureData && signatureName.trim().length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step === 2 && !isFeeEligible) {
        setStep(3);
      } else {
        setStep(Math.min(step + 1, 5));
      }
    } else {
      toast.error('Please complete all required fields');
    }
  };

  const prevStep = () => {
    if (step === 3 && !isFeeEligible) {
      setStep(1);
    } else {
      setStep(Math.max(step - 1, 1));
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  };

  useEffect(() => {
    if (step === 4) {
      setTimeout(initCanvas, 100);
    }
  }, [step]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        setSignatureData(canvas.toDataURL('image/png'));
      }
    }
  };

  const clearSignature = () => {
    setSignatureData('');
    initCanvas();
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Please provide signature');
      return;
    }

    setSubmitting(true);
    try {
      const consentsList = consentRequirements.map(c => ({
        consent_id: c.id,
        required: c.required,
        granted: consents[c.id] || false
      }));

      const payload = {
        claim_id: claimId,
        claim_type: claimType,
        poa_form_type: poaFormType,
        consents: consentsList,
        veteran_signature: signatureData,
        veteran_name: signatureName || veteranName
      };

      if (isFeeEligible) {
        payload.fee_agreement_type = feeAgreementType;
        payload.fee_percentage = feePercentage;
        payload.prior_va_decision_date = priorDecisionDate;
      }

      const response = await api.post('/poa-agreements/intake', payload);
      
      if (response.data.success) {
        toast.success('POA and agreements captured successfully!');
        if (onComplete) {
          onComplete(response.data);
        }
      } else {
        toast.error('Failed to save intake package');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit intake package');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6 px-2">
      {WIZARD_STEPS.map((s, idx) => {
        const isSkipped = s.id === 2 && !isFeeEligible;
        const Icon = s.icon;
        const isCurrent = s.id === step;
        const isComplete = s.id < step;
        
        return (
          <React.Fragment key={s.id}>
            <div className={`flex flex-col items-center ${isSkipped ? 'opacity-40' : ''}`}>
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isCurrent ? 'bg-primary text-primary-foreground' : 
                  isComplete ? 'bg-green-500 text-white' : 
                  'bg-muted text-muted-foreground'}
              `}>
                {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`text-xs mt-1 text-center max-w-[80px] ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                {s.name}
              </span>
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${s.id < step ? 'bg-green-500' : 'bg-muted'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Select Power of Attorney Form</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the appropriate VA form to establish representation authority.
        </p>
      </div>
      
      <RadioGroup value={poaFormType} onValueChange={setPoaFormType}>
        {formTypes.map((form) => (
          <div key={form.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value={form.id} id={form.id} className="mt-1" />
            <Label htmlFor={form.id} className="flex-1 cursor-pointer">
              <div className="font-medium">{form.name}</div>
              <div className="text-sm text-muted-foreground">{form.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{form.description}</div>
              <Badge variant="outline" className="mt-2">
                {form.for_type === 'vso' ? 'For VSOs' : 'For Individual Representatives'}
              </Badge>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const renderStep2 = () => {
    const selectedType = feeAgreementTypes.find(f => f.id === feeAgreementType);
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Fee Agreement</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure fee agreement per 38 CFR 14.636 requirements.
          </p>
        </div>

        {!isFeeEligible ? (
          <Alert>
            <Scale className="h-4 w-4" />
            <AlertTitle>Fees Not Applicable</AlertTitle>
            <AlertDescription>{feeEligibilityReason}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-3">
              <Label>Prior VA Decision Date</Label>
              <Input
                type="date"
                value={priorDecisionDate}
                onChange={(e) => setPriorDecisionDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Date of the VA decision being appealed or supplemented
              </p>
            </div>

            <div className="space-y-3">
              <Label>Agreement Type</Label>
              <RadioGroup value={feeAgreementType} onValueChange={setFeeAgreementType}>
                {feeAgreementTypes.map((type) => (
                  <div key={type.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value={type.id} id={`fee-${type.id}`} className="mt-1" />
                    <Label htmlFor={`fee-${type.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                      <div className="text-xs mt-1">
                        <Badge variant="outline">Max: {type.max_percentage}%</Badge>
                        {type.va_assessment && (
                          <Badge variant="outline" className="ml-2">VA 5% assessment applies</Badge>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Fee Percentage</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(parseFloat(e.target.value) || 0)}
                  min={1}
                  max={selectedType?.max_percentage || 20}
                  step={0.5}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
                <span className="text-sm text-muted-foreground">
                  (Max: {selectedType?.max_percentage || 20}%)
                </span>
              </div>
            </div>

            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Fee Compliance Notice</AlertTitle>
              <AlertDescription className="text-amber-700">
                Per 38 CFR 14.636, fees apply only to past-due (retroactive) benefits, NOT ongoing monthly payments.
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Required Consents</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The following authorizations are needed to proceed with representation.
        </p>
      </div>

      <div className="space-y-3">
        {consentRequirements.map((consent) => (
          <div 
            key={consent.id} 
            className={`p-4 border rounded-lg ${consents[consent.id] ? 'bg-green-50 border-green-200' : ''}`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={`consent-${consent.id}`}
                checked={consents[consent.id] || false}
                onCheckedChange={(checked) => handleConsentChange(consent.id, checked)}
              />
              <div className="flex-1">
                <Label htmlFor={`consent-${consent.id}`} className="flex items-center gap-2 cursor-pointer">
                  <span className="font-medium">{consent.name}</span>
                  {consent.required && (
                    <Badge variant="outline" className="text-xs border-red-300 text-red-700">Required</Badge>
                  )}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{consent.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">E-Signature</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please have the veteran sign below to authorize representation.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Full Legal Name</Label>
        <Input
          value={signatureName}
          onChange={(e) => setSignatureName(e.target.value)}
          placeholder="Enter veteran's full legal name"
        />
      </div>

      <div className="space-y-2">
        <Label>Signature</Label>
        <div className="border-2 border-dashed rounded-lg p-2 bg-white">
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={clearSignature}>
            Clear Signature
          </Button>
        </div>
      </div>

      {signatureData && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Signature captured successfully
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          By signing, the veteran confirms they have read and agree to the POA, fee agreement (if applicable), and all consents.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Review & Confirm</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please review the information before submitting.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" /> Power of Attorney
          </h4>
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Form:</span> VA Form {poaFormType}</p>
            <p><span className="text-muted-foreground">Veteran:</span> {signatureName || veteranName}</p>
          </div>
        </div>

        {isFeeEligible && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4" /> Fee Agreement
            </h4>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Type:</span> {feeAgreementType === 'direct_pay' ? 'Direct Pay' : 'Non-Direct Pay'}</p>
              <p><span className="text-muted-foreground">Percentage:</span> {feePercentage}%</p>
              <p><span className="text-muted-foreground">Prior Decision:</span> {priorDecisionDate}</p>
            </div>
          </div>
        )}

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" /> Consents
          </h4>
          <div className="text-sm space-y-1">
            {consentRequirements.map(c => (
              <div key={c.id} className="flex items-center gap-2">
                {consents[c.id] ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-300" />
                )}
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {signatureData && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <PenTool className="h-4 w-4" /> Signature
            </h4>
            <img src={signatureData} alt="Signature" className="max-h-20 border rounded" />
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (existingData?.is_complete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Intake Complete
          </CardTitle>
          <CardDescription>
            POA and agreements have already been captured for this claim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>POA Status: {existingData.poa?.status}</span>
            </div>
            {existingData.fee_agreement?.exists && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Fee Agreement: {existingData.fee_agreement.fee_percentage}% {existingData.fee_agreement.agreement_type}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onCancel}>Close</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          POA & Agreement Intake
        </CardTitle>
        <CardDescription>
          Capture Power of Attorney, fee agreement, and required consents
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {renderStepIndicator()}
        
        <div className="min-h-[300px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={step === 1 ? onCancel : prevStep}
          disabled={submitting}
        >
          {step === 1 ? 'Cancel' : (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </>
          )}
        </Button>
        
        {step < 5 ? (
          <Button onClick={nextStep} disabled={!validateStep(step)}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Intake
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function POAIntakeDialog({ claimId, claimType, veteranName, trigger, onComplete }) {
  const [open, setOpen] = useState(false);

  const handleComplete = (data) => {
    setOpen(false);
    if (onComplete) {
      onComplete(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <FileCheck className="h-4 w-4 mr-2" />
          Start POA Intake
        </Button>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <POAIntakeWizard
          claimId={claimId}
          claimType={claimType}
          veteranName={veteranName}
          onComplete={handleComplete}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export default POAIntakeWizard;
