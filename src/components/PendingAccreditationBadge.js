import React from 'react';
import { Clock, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function PendingAccreditationBadge({ variant = 'compact', className = '' }) {
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 cursor-help ${className}`}>
              <Clock className="h-3 w-3" />
              Pending VA Accreditation
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>EarnedIT is pending VA accreditation. Claims preparation services are supervised by accredited partners to ensure compliance.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`flex items-center justify-center gap-2 py-1.5 px-4 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm ${className}`}>
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>
          EarnedIT is pending VA accreditation. All claims preparation services are supervised by our accredited partners.
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-amber-600 hover:text-amber-800" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="font-medium mb-1">What does this mean?</p>
              <p className="text-sm">While EarnedIT awaits formal VA accreditation, we partner with accredited claims agents and Veterans Service Organizations to ensure all claim preparation meets VA standards. You receive the same quality assistance under professional oversight.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-lg bg-amber-50 border border-amber-200 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <Clock className="h-5 w-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-1">Pending VA Accreditation</h4>
            <p className="text-sm text-amber-800">
              EarnedIT is currently pursuing VA accreditation. In the meantime, all claims preparation services are supervised by our network of accredited partners, ensuring your claim meets all VA requirements.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function AccreditationDisclaimer({ className = '' }) {
  return (
    <p className={`text-xs text-muted-foreground ${className}`}>
      EarnedIT, LLC is pending VA accreditation. Claims assistance services are provided under the supervision of accredited claims agents and Veterans Service Organizations in compliance with 38 CFR 14.629.
    </p>
  );
}

export default PendingAccreditationBadge;
