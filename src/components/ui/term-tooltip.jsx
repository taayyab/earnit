import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { cn } from '@/lib/utils';
import { useLanguageMode } from '../../context/PlainLanguageContext';
import { plainLanguageTerms, getTermDefinition } from '../../utils/plainLanguageTerms';

export function TermTooltip({ 
  term, 
  children, 
  className,
  showDefinition = true,
  side = 'top'
}) {
  const { usePlainLanguage } = useLanguageMode();
  
  const plainTerm = plainLanguageTerms[term];
  const definition = getTermDefinition(term);
  
  if (!plainTerm && !definition) {
    return <span className={className}>{children || term}</span>;
  }

  const displayTerm = usePlainLanguage && plainTerm ? plainTerm : term;
  const tooltipContent = usePlainLanguage 
    ? (showDefinition && definition ? definition : `VA term: ${term}`)
    : (plainTerm ? `Plain language: ${plainTerm}${showDefinition && definition ? ` — ${definition}` : ''}` : definition);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={cn(
              "border-b border-dotted border-slate-400 cursor-help",
              "hover:border-blue-500 hover:text-blue-700 transition-colors",
              className
            )}
          >
            {children || displayTerm}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-xs text-sm bg-slate-800 text-white"
        >
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function HelpTerm({ term, className }) {
  const { usePlainLanguage } = useLanguageMode();
  const plainTerm = plainLanguageTerms[term];
  const definition = getTermDefinition(term);

  const displayTerm = usePlainLanguage && plainTerm ? plainTerm : term;

  if (!definition) {
    return <span className={className}>{displayTerm}</span>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={cn(
              "inline-flex items-center gap-1 border-b border-dotted border-slate-400",
              "cursor-help hover:border-blue-500 hover:text-blue-700 transition-colors",
              className
            )}
          >
            {displayTerm}
            <svg 
              className="h-3 w-3 text-slate-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top"
          className="max-w-xs text-sm bg-slate-800 text-white"
        >
          <p>{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TranslatedText({ text, className }) {
  const { usePlainLanguage } = useLanguageMode();
  
  if (!usePlainLanguage) {
    return <span className={className}>{text}</span>;
  }

  let translatedText = text;
  Object.entries(plainLanguageTerms).forEach(([vaTerm, plainTerm]) => {
    if (vaTerm.length <= 2) return;
    const escapedTerm = vaTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
    translatedText = translatedText.replace(regex, plainTerm);
  });

  return <span className={className}>{translatedText}</span>;
}

export default TermTooltip;
