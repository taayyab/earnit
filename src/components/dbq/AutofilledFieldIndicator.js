import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { 
  Sparkles, 
  Pencil, 
  Check, 
  X, 
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';

export function AutofilledFieldIndicator({
  fieldName,
  value,
  confidence = 0,
  source = null,
  isEditable = true,
  onChange,
  multiline = false,
  className = ''
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  const getConfidenceLevel = () => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  };

  const getConfidenceStyles = () => {
    const level = getConfidenceLevel();
    switch (level) {
      case 'high':
        return {
          badge: 'bg-green-100 text-green-700 border-green-200',
          border: 'border-green-200',
          bg: 'bg-green-50',
          icon: CheckCircle2,
          iconColor: 'text-green-500'
        };
      case 'medium':
        return {
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          border: 'border-amber-200',
          bg: 'bg-amber-50',
          icon: AlertTriangle,
          iconColor: 'text-amber-500'
        };
      default:
        return {
          badge: 'bg-red-100 text-red-700 border-red-200',
          border: 'border-red-200',
          bg: 'bg-red-50',
          icon: AlertTriangle,
          iconColor: 'text-red-500'
        };
    }
  };

  const styles = getConfidenceStyles();
  const ConfidenceIcon = styles.icon;

  const handleSave = () => {
    if (onChange) {
      onChange(editValue);
    }
    setHasBeenEdited(true);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const confidencePercent = Math.round(confidence * 100);

  return (
    <TooltipProvider>
      <div className={`relative ${className}`}>
        <div className={`rounded-lg border-2 ${hasBeenEdited ? 'border-blue-200 bg-blue-50' : styles.border} ${hasBeenEdited ? '' : styles.bg} p-3`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-700 text-sm">{fieldName}</span>
              
              {!hasBeenEdited && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={`text-xs gap-1 ${styles.badge}`}>
                      <Sparkles className="w-3 h-3" />
                      Auto-filled
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This field was auto-filled from your documents</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {hasBeenEdited && (
                <Badge className="text-xs gap-1 bg-blue-100 text-blue-700 border-blue-200">
                  <Pencil className="w-3 h-3" />
                  Edited
                </Badge>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${styles.badge}`}
                  >
                    <ConfidenceIcon className={`w-3 h-3 mr-1 ${styles.iconColor}`} />
                    {confidencePercent}% confidence
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Confidence: {getConfidenceLevel().toUpperCase()}</p>
                    <p className="text-slate-400">
                      {getConfidenceLevel() === 'high' && 'Value extracted with high certainty'}
                      {getConfidenceLevel() === 'medium' && 'Please verify this value'}
                      {getConfidenceLevel() === 'low' && 'Manual review recommended'}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>

            {isEditable && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-7 px-2"
              >
                <Pencil className="w-3 h-3" />
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              {multiline ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="min-h-[80px] bg-white"
                  autoFocus
                />
              ) : (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="bg-white"
                  autoFocus
                />
              )}
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave} className="h-8">
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} className="h-8">
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-slate-900 font-medium">
              {value || <span className="text-slate-400 italic">No value</span>}
            </div>
          )}

          {source && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 mt-2 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                  <FileText className="w-3 h-3" />
                  Source: {source.name || source}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="font-medium">Source Document</span>
                  </div>
                  <p className="text-sm text-slate-600">{source.name || source}</p>
                  {source.excerpt && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600 max-h-32 overflow-y-auto">
                      "{source.excerpt}"
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function AutofilledFieldGroup({ 
  title, 
  fields = [], 
  onChange,
  className = '' 
}) {
  const handleFieldChange = (fieldId, newValue) => {
    if (onChange) {
      onChange(fieldId, newValue);
    }
  };

  if (fields.length === 0) return null;

  const highConfidenceCount = fields.filter(f => f.confidence >= 0.8).length;
  const needsReviewCount = fields.filter(f => f.confidence < 0.5).length;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <div className="flex items-center gap-2 text-sm">
          {highConfidenceCount > 0 && (
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {highConfidenceCount} verified
            </span>
          )}
          {needsReviewCount > 0 && (
            <span className="text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {needsReviewCount} need review
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <AutofilledFieldIndicator
            key={field.id || field.name}
            fieldName={field.label || field.name}
            value={field.value}
            confidence={field.confidence}
            source={field.source}
            isEditable={field.editable !== false}
            multiline={field.multiline}
            onChange={(newValue) => handleFieldChange(field.id || field.name, newValue)}
          />
        ))}
      </div>
    </div>
  );
}

export function AutofillLegend({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 p-3 bg-slate-50 rounded-lg ${className}`}>
      <span className="text-sm font-medium text-slate-600">Confidence levels:</span>
      <div className="flex items-center gap-1">
        <Badge className="text-xs bg-green-100 text-green-700">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          High (80%+)
        </Badge>
      </div>
      <div className="flex items-center gap-1">
        <Badge className="text-xs bg-amber-100 text-amber-700">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Medium (50-79%)
        </Badge>
      </div>
      <div className="flex items-center gap-1">
        <Badge className="text-xs bg-red-100 text-red-700">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Low (&lt;50%)
        </Badge>
      </div>
    </div>
  );
}
