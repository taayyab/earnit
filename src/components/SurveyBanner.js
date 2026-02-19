import React from 'react';
import { Button } from './ui/button';
import { ClipboardList, X } from 'lucide-react';

export default function SurveyBanner({ survey, onOpenSurvey, onDismiss }) {
  if (!survey) return null;

  const getSurveyTypeLabel = (type) => {
    switch (type) {
      case 'touchpoint':
        return 'after your recent touchpoint';
      case 'milestone':
        return 'about your milestone progress';
      case 'service_completion':
        return 'about the service you received';
      default:
        return '';
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#1B3A5F] to-[#2C5282] text-white rounded-xl p-4 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
      
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">You have a new survey to complete!</h3>
            <p className="text-white/80 text-sm">
              Share your feedback {getSurveyTypeLabel(survey.survey_type)} to help us improve.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={onOpenSurvey}
            className="bg-white text-[#1B3A5F] hover:bg-white/90 font-semibold flex-1 sm:flex-none"
          >
            Take Survey
          </Button>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Dismiss survey banner"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
