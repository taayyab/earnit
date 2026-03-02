import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { 
  Wand2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { dbqAPI } from '../../lib/api';
import { toast } from 'sonner';

export default function DBQAutofillButton({ 
  dbqType, 
  documents = [], 
  existingData = null,
  onAutofillComplete,
  onAutofillError,
  disabled = false,
  variant = 'default',
  size = 'default',
  showStats = true,
  className = ''
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAutofill = async () => {
    if (!dbqType) {
      toast.error('No DBQ type specified');
      return;
    }

    if (!documents || documents.length === 0) {
      toast.error('No documents available for auto-fill. Please upload medical records first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const documentIds = documents.map(doc => doc.id || doc.document_id).filter(Boolean);
      
      if (documentIds.length === 0) {
        throw new Error('No valid document IDs found');
      }

      const response = await dbqAPI.prefill(dbqType, documentIds, existingData);
      
      if (response.data.success) {
        const result = {
          dbq: response.data.dbq,
          validation: response.data.validation,
          message: response.data.message,
          filledFields: response.data.dbq?.completion?.filled_fields || 0,
          totalFields: response.data.dbq?.completion?.total_fields || 0,
          completionPercentage: response.data.dbq?.completion?.percentage || 0
        };
        
        setLastResult(result);
        toast.success(response.data.message || 'DBQ auto-filled successfully!');
        
        if (onAutofillComplete) {
          onAutofillComplete(result);
        }
      } else {
        throw new Error(response.data.error || 'Auto-fill failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to auto-fill DBQ';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (onAutofillError) {
        onAutofillError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing Documents...
        </>
      );
    }

    if (lastResult && !error) {
      return (
        <>
          <RefreshCw className="w-4 h-4" />
          Re-fill from Documents
        </>
      );
    }

    return (
      <>
        <Wand2 className="w-4 h-4" />
        Auto-fill from Documents
      </>
    );
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-700';
    if (confidence >= 0.5) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <div className={className}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleAutofill}
              disabled={disabled || isLoading || !documents.length}
              variant={error ? 'destructive' : variant}
              size={size}
              className={`gap-2 ${lastResult && !error ? 'bg-[#1B3A5F] hover:bg-[#2a4a6f]' : ''}`}
            >
              {getButtonContent()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!documents.length ? (
              <p>Upload medical documents to enable auto-fill</p>
            ) : (
              <p>Analyze {documents.length} document(s) to auto-fill DBQ fields</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showStats && lastResult && !error && (
        <Card className="mt-4 border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Auto-fill Complete</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-xl font-bold text-green-600">{lastResult.filledFields}</div>
                    <div className="text-xs text-slate-600">Fields Filled</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-xl font-bold text-slate-600">{lastResult.totalFields}</div>
                    <div className="text-xs text-slate-600">Total Fields</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{lastResult.completionPercentage}%</div>
                    <div className="text-xs text-slate-600">Complete</div>
                  </div>
                </div>

                {lastResult.validation && (
                  <div className="space-y-2">
                    {lastResult.validation.low_confidence_fields?.length > 0 && (
                      <div className="flex items-center gap-2 text-amber-700 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{lastResult.validation.low_confidence_fields.length} fields need review</span>
                      </div>
                    )}
                    {lastResult.validation.missing_required?.length > 0 && (
                      <div className="flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{lastResult.validation.missing_required.length} required fields missing</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-600 mt-2">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Analyzed {documents.length} document(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function AutofillConfidenceSummary({ fields = [] }) {
  const highConfidence = fields.filter(f => f.confidence >= 0.8).length;
  const mediumConfidence = fields.filter(f => f.confidence >= 0.5 && f.confidence < 0.8).length;
  const lowConfidence = fields.filter(f => f.confidence < 0.5).length;

  if (fields.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {highConfidence > 0 && (
        <Badge className="bg-green-100 text-green-700">
          {highConfidence} High
        </Badge>
      )}
      {mediumConfidence > 0 && (
        <Badge className="bg-amber-100 text-amber-700">
          {mediumConfidence} Medium
        </Badge>
      )}
      {lowConfidence > 0 && (
        <Badge className="bg-red-100 text-red-700">
          {lowConfidence} Low
        </Badge>
      )}
    </div>
  );
}
