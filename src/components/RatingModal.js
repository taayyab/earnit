import React, { useState } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Star, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { toast } from 'sonner';

function StarRating({ value, onChange, label }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hover || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdvocateRatingModal({ 
  advocateId, 
  advocateName, 
  touchpointId, 
  onClose, 
  onSubmitted 
}) {
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({
    communication: 0,
    knowledge: 0,
    responsiveness: 0,
    empathy: 0,
    overall: 0
  });
  const [feedback, setFeedback] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(null);

  const categories = [
    { key: 'communication', label: 'Communication' },
    { key: 'knowledge', label: 'Knowledge' },
    { key: 'responsiveness', label: 'Responsiveness' },
    { key: 'empathy', label: 'Empathy & Understanding' },
    { key: 'overall', label: 'Overall Experience' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.values(ratings).some(r => r === 0)) {
      toast.error('Please rate all categories');
      return;
    }

    setLoading(true);
    try {
      await api.post('/ratings/advocate', {
        advocate_id: advocateId,
        touchpoint_id: touchpointId,
        ratings,
        feedback: feedback.trim() || null,
        would_recommend: wouldRecommend
      });

      toast.success('Thank you for your feedback!');
      if (onSubmitted) onSubmitted();
      if (onClose) onClose();
    } catch (err) {
      toast.error('Failed to submit rating');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Rate Your Experience</CardTitle>
            <CardDescription>How has your experience been with {advocateName}?</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {categories.map((cat) => (
              <StarRating
                key={cat.key}
                label={cat.label}
                value={ratings[cat.key]}
                onChange={(value) => setRatings({ ...ratings, [cat.key]: value })}
              />
            ))}

            <div className="space-y-2 pt-2">
              <Label>Would you recommend this advocate?</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWouldRecommend(true)}
                  className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    wouldRecommend === true 
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 hover:border-green-300'
                  }`}
                >
                  <ThumbsUp className="h-5 w-5" />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend(false)}
                  className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    wouldRecommend === false 
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 hover:border-red-300'
                  }`}
                >
                  <ThumbsDown className="h-5 w-5" />
                  No
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Share any additional thoughts about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function ServiceRatingModal({ 
  supportCaseId, 
  providerName, 
  serviceCategory, 
  onClose, 
  onSubmitted 
}) {
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({
    timeliness: 0,
    quality: 0,
    helpfulness: 0,
    professionalism: 0,
    overall: 0
  });
  const [feedback, setFeedback] = useState('');
  const [outcome, setOutcome] = useState('');
  const [wouldUseAgain, setWouldUseAgain] = useState(null);

  const categories = [
    { key: 'timeliness', label: 'Timeliness' },
    { key: 'quality', label: 'Quality of Service' },
    { key: 'helpfulness', label: 'Helpfulness' },
    { key: 'professionalism', label: 'Professionalism' },
    { key: 'overall', label: 'Overall Experience' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.values(ratings).some(r => r === 0)) {
      toast.error('Please rate all categories');
      return;
    }

    setLoading(true);
    try {
      await api.post('/ratings/service', {
        support_case_id: supportCaseId,
        provider_name: providerName,
        service_category: serviceCategory,
        ratings,
        feedback: feedback.trim() || null,
        outcome: outcome.trim() || null,
        would_use_again: wouldUseAgain
      });

      toast.success('Thank you for rating this service!');
      if (onSubmitted) onSubmitted();
      if (onClose) onClose();
    } catch (err) {
      toast.error('Failed to submit rating');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Rate This Service</CardTitle>
            <CardDescription>How was your experience with {providerName}?</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {categories.map((cat) => (
              <StarRating
                key={cat.key}
                label={cat.label}
                value={ratings[cat.key]}
                onChange={(value) => setRatings({ ...ratings, [cat.key]: value })}
              />
            ))}

            <div className="space-y-2 pt-2">
              <Label>Would you use this service again?</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWouldUseAgain(true)}
                  className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    wouldUseAgain === true 
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 hover:border-green-300'
                  }`}
                >
                  <ThumbsUp className="h-5 w-5" />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWouldUseAgain(false)}
                  className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    wouldUseAgain === false 
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 hover:border-red-300'
                  }`}
                >
                  <ThumbsDown className="h-5 w-5" />
                  No
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">What was the outcome? (Optional)</Label>
              <Textarea
                id="outcome"
                placeholder="e.g., Received housing assistance, got job interview..."
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Share any additional thoughts..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function RatingPrompt({ type, data, onRate, onDismiss }) {
  return (
    <Card className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/5">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[hsl(var(--primary))]/10">
              <Star className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <p className="font-medium">
                {type === 'advocate' 
                  ? 'How was your session?' 
                  : 'How was this service?'}
              </p>
              <p className="text-sm text-muted-foreground">
                {type === 'advocate' 
                  ? `Rate your experience with ${data.advocateName}`
                  : `Rate ${data.providerName}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onDismiss}>
              Later
            </Button>
            <Button size="sm" onClick={onRate}>
              Rate Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
