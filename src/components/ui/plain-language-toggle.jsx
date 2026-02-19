import React from 'react';
import { Switch } from './switch';
import { useLanguageMode } from '../../context/PlainLanguageContext';
import { cn } from '@/lib/utils';

export function PlainLanguageToggle({ className, showLabel = true, size = 'default' }) {
  const { usePlainLanguage, toggleLanguageMode } = useLanguageMode();

  return (
    <div className={cn(
      "flex items-center gap-2",
      size === 'small' && "gap-1.5",
      className
    )}>
      {showLabel && (
        <span className={cn(
          "text-slate-600 select-none",
          size === 'small' ? "text-xs" : "text-sm"
        )}>
          {usePlainLanguage ? 'Plain' : 'VA Terms'}
        </span>
      )}
      <Switch
        checked={usePlainLanguage}
        onCheckedChange={toggleLanguageMode}
        aria-label="Toggle plain language mode"
        className={cn(
          size === 'small' && "h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
        )}
      />
      {showLabel && (
        <span className={cn(
          "text-slate-500 select-none",
          size === 'small' ? "text-xs" : "text-sm"
        )}>
          {usePlainLanguage ? 'Language' : ''}
        </span>
      )}
    </div>
  );
}

export function PlainLanguagePill({ className }) {
  const { usePlainLanguage, toggleLanguageMode } = useLanguageMode();

  return (
    <button
      onClick={toggleLanguageMode}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
        "border hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1",
        usePlainLanguage
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-slate-100 border-slate-200 text-slate-600",
        className
      )}
      aria-label={usePlainLanguage ? "Switch to VA Terms" : "Switch to Plain Language"}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        usePlainLanguage ? "bg-blue-500" : "bg-slate-400"
      )} />
      {usePlainLanguage ? 'Plain Language' : 'VA Terms'}
    </button>
  );
}

export default PlainLanguageToggle;
