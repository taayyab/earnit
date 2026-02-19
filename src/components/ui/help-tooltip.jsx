import * as React from "react"
import { HelpCircle, Info, AlertCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

const iconMap = {
  help: HelpCircle,
  info: Info,
  warning: AlertCircle,
}

export function HelpTooltip({ 
  content, 
  type = 'help', 
  side = 'top',
  className = '',
  iconSize = 'default'
}) {
  const Icon = iconMap[type] || HelpCircle
  const iconSizes = {
    small: 'h-4 w-4',
    default: 'h-5 w-5',
    large: 'h-6 w-6',
  }

  const iconColors = {
    help: 'text-gray-400 hover:text-gray-600',
    info: 'text-blue-400 hover:text-blue-600',
    warning: 'text-amber-400 hover:text-amber-600',
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full ${className}`}
            aria-label="Help information"
          >
            <Icon 
              className={`${iconSizes[iconSize]} ${iconColors[type]} transition-colors`} 
              aria-hidden="true"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs text-sm bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg"
          role="tooltip"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function FormFieldWithHelp({ 
  label, 
  helpText, 
  required = false, 
  htmlFor,
  children,
  error,
  description
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label 
          htmlFor={htmlFor} 
          className="text-base font-medium text-gray-900"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </label>
        {helpText && (
          <HelpTooltip content={helpText} />
        )}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600" id={`${htmlFor}-description`}>
          {description}
        </p>
      )}
      
      {children}
      
      {error && (
        <p 
          className="text-sm text-red-600 flex items-center gap-1" 
          role="alert"
          id={`${htmlFor}-error`}
        >
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

export const formHelpTexts = {
  ssn: "Your Social Security Number is encrypted and only used to verify your identity with the VA.",
  dateOfBirth: "Enter your date of birth exactly as it appears on your military records.",
  serviceNumber: "Your service number may be different from your SSN. Check your DD-214.",
  dd214: "Your DD-214 is your official discharge document. If you don't have a copy, we can help you request one.",
  nexusLetter: "A nexus letter connects your current condition to your military service. It should be written by a qualified medical professional.",
  buddyStatement: "A buddy statement is a written account from someone who witnessed your condition or service-related incident.",
  medicalRecords: "Include any medical records that document your condition, including VA and private medical records.",
  primaryCondition: "Your primary condition is the main disability you're claiming is related to your service.",
  secondaryCondition: "A secondary condition is a disability that was caused or made worse by your primary service-connected condition.",
  effectiveDate: "The effective date determines when your benefits begin. This is usually the date you filed your Intent to File or claim.",
  rating: "VA disability ratings range from 0% to 100% and determine your monthly compensation amount.",
}

export default HelpTooltip
