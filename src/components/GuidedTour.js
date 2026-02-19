import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const TOUR_STEPS = {
  dashboard: [
    {
      target: '[data-tour="create-claim"]',
      title: 'Create Your First Claim',
      description: 'Click here to start a new VA disability claim. We\'ll guide you through every step.',
      position: 'bottom'
    },
    {
      target: '[data-tour="advocate"]',
      title: 'Your Peer Advocate',
      description: 'Once matched, your advocate will appear here. They\'ll help you navigate the entire process.',
      position: 'bottom'
    },
    {
      target: '[data-tour="touchpoints"]',
      title: 'Upcoming Touchpoints',
      description: 'Regular check-ins with your advocate keep your claim on track. You\'ll see upcoming meetings here.',
      position: 'left'
    }
  ]
};

export default function GuidedTour({ tourName = 'dashboard', onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetElement, setTargetElement] = useState(null);

  useEffect(() => {
    // Check if user has seen this tour
    const tourKey = `tour_completed_${tourName}`;
    const completed = localStorage.getItem(tourKey);
    
    if (!completed) {
      setIsActive(true);
    }
  }, [tourName]);

  useEffect(() => {
    if (isActive && TOUR_STEPS[tourName]?.[currentStep]) {
      const step = TOUR_STEPS[tourName][currentStep];
      const element = document.querySelector(step.target);
      setTargetElement(element);
      
      // Scroll element into view
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isActive, currentStep, tourName]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS[tourName].length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const tourKey = `tour_completed_${tourName}`;
    localStorage.setItem(tourKey, 'true');
    setIsActive(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isActive || !TOUR_STEPS[tourName]) return null;

  const step = TOUR_STEPS[tourName][currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS[tourName].length) * 100;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 pointer-events-none"
        data-testid="tour-overlay"
      />
      
      {/* Spotlight on target element */}
      {targetElement && (
        <div
          className="fixed z-50 rounded-lg ring-4 ring-[#D4A574] pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8
          }}
        />
      )}
      
      {/* Tour Card */}
      <Card
        className="fixed z-50 w-96 shadow-2xl"
        style={{
          top: targetElement
            ? targetElement.getBoundingClientRect().bottom + 20
            : '50%',
          left: targetElement
            ? targetElement.getBoundingClientRect().left
            : '50%',
          transform: !targetElement ? 'translate(-50%, -50%)' : 'none'
        }}
        data-testid="tour-card"
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} of {TOUR_STEPS[tourName].length}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="-mt-2 -mr-2"
              data-testid="tour-skip-button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-slate-200 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-[#D4A574] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 0}
              data-testid="tour-back-button"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-[#D4A574] hover:bg-[#B8895E]"
              data-testid="tour-next-button"
            >
              {currentStep === TOUR_STEPS[tourName].length - 1 ? (
                <>
                  Got it
                  <Check className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
