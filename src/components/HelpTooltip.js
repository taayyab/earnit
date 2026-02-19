import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { HelpCircle } from 'lucide-react';

export default function HelpTooltip({ content, children }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <button
              type="button"
              className="inline-flex items-center justify-center h-5 w-5 rounded-full hover:bg-slate-100 transition-colors"
              data-testid="help-tooltip-trigger"
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-xs bg-[hsl(var(--primary))] text-white p-4"
        >
          <p className="text-sm leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
