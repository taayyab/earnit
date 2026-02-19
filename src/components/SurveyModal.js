import React, { useState } from 'react';
import api from '../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

function StarRating({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`p-1 transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => !disabled && onChange(star)}
          aria-label={`Rate ${star} out of 5 stars`}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              (hovered || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function SurveyModal({ isOpen, onClose, survey, onComplete }) {
  const [responses, setResponses] = useState({
    q1_claim_progress: 0,
    q2_quality_of_life: 0,
    q3_advocate_interaction: 0,
    q4_platform_ease: 0,
    q5_open_feedback: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    { key: 'q1_claim_progress', label: 'How satisfied are you with your claim progress?' },
    { key: 'q2_quality_of_life', label: 'How would you rate your current quality of life?' },
    { key: 'q3_advocate_interaction', label: 'How helpful was your veteran advocate?' },
    { key: 'q4_platform_ease', label: 'How easy is the platform to use?' }
  ];

  const handleSubmit = async () => {
    if (!survey?.id) return;
    
    const hasRatings = responses.q1_claim_progress > 0 || 
                       responses.q2_quality_of_life > 0 || 
                       responses.q3_advocate_interaction > 0 || 
                       responses.q4_platform_ease > 0;
    
    if (!hasRatings && !responses.q5_open_feedback.trim()) {
      toast.error('Please provide at least one rating or feedback');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        q1_claim_progress: responses.q1_claim_progress || null,
        q2_quality_of_life: responses.q2_quality_of_life || null,
        q3_advocate_interaction: responses.q3_advocate_interaction || null,
        q4_platform_ease: responses.q4_platform_ease || null,
        q5_open_feedback: responses.q5_open_feedback || null
      };
      
      await api.post(`/surveys/${survey.id}/submit`, payload);
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      setTimeout(() => {
        onComplete?.();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Survey submission error:', err);
      toast.error(err.response?.data?.detail || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!survey?.id) return;
    
    setSubmitting(true);
    try {
      await api.post(`/surveys/skip/${survey.id}`);
      toast.info('Survey skipped');
      onComplete?.();
      handleClose();
    } catch (err) {
      console.error('Survey skip error:', err);
      toast.error('Failed to skip survey');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setResponses({
      q1_claim_progress: 0,
      q2_quality_of_life: 0,
      q3_advocate_interaction: 0,
      q4_platform_ease: 0,
      q5_open_feedback: ''
    });
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Thank You!</h3>
            <p className="text-slate-600 text-center">Your feedback helps us improve our service for all veterans.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Share Your Feedback</DialogTitle>
          <DialogDescription>
            Your responses help us improve our services for veterans.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {questions.map((question, idx) => (
            <div key={question.key} className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                {idx + 1}. {question.label}
              </label>
              <StarRating
                value={responses[question.key]}
                onChange={(val) => setResponses(prev => ({ ...prev, [question.key]: val }))}
                disabled={submitting}
              />
            </div>
          ))}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900">
              5. Any additional feedback?
            </label>
            <Textarea
              placeholder="Share your thoughts, suggestions, or concerns..."
              value={responses.q5_open_feedback}
              onChange={(e) => setResponses(prev => ({ ...prev, q5_open_feedback: e.target.value }))}
              disabled={submitting}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto bg-[#1B3A5F] hover:bg-[#2C5282]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
