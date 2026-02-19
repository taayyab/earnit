import React, { useState } from 'react';
import { X, Star, ThumbsUp, MessageSquare, Heart, TrendingUp } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const ASSESSMENT_QUESTIONS = [
  {
    id: 'helpfulness',
    question: 'How helpful was this session with your peer advocate?',
    type: 'rating',
    icon: Star,
    options: [1, 2, 3, 4, 5],
    labels: ['Not helpful', 'Slightly helpful', 'Helpful', 'Very helpful', 'Extremely helpful']
  },
  {
    id: 'confidence',
    question: 'Do you feel more confident about your VA claim after this session?',
    type: 'choice',
    icon: TrendingUp,
    options: [
      { value: 'yes', label: 'Yes, much more confident' },
      { value: 'somewhat', label: 'Somewhat more confident' },
      { value: 'same', label: 'About the same' },
      { value: 'no', label: 'No, still unsure' }
    ]
  },
  {
    id: 'wellbeing',
    question: 'How has your overall well-being been affected by our support?',
    type: 'rating',
    icon: Heart,
    options: [1, 2, 3, 4, 5],
    labels: ['Much worse', 'Slightly worse', 'No change', 'Improved', 'Much improved']
  },
  {
    id: 'recommend',
    question: 'How likely are you to recommend EarnedIt to another Veteran?',
    type: 'rating',
    icon: ThumbsUp,
    options: [1, 2, 3, 4, 5],
    labels: ['Very unlikely', 'Unlikely', 'Neutral', 'Likely', 'Very likely']
  },
  {
    id: 'highlight',
    question: 'What stood out most from this session? (Optional)',
    type: 'text',
    icon: MessageSquare,
    placeholder: 'Share what made the biggest impact...'
  }
];

export default function TouchpointAssessment({ 
  touchpointId, 
  advocateName,
  isOpen, 
  onClose, 
  onComplete 
}) {
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRatingSelect = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleChoiceSelect = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleTextChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/touchpoints/assessment', {
        touchpoint_id: touchpointId,
        responses: Object.entries(responses).map(([question_id, answer]) => ({
          question_id,
          answer
        }))
      });
      toast.success('Thank you for your feedback!');
      onComplete?.(responses);
      onClose();
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete?.(null);
    onClose();
  };

  const question = ASSESSMENT_QUESTIONS[currentQuestion];
  const Icon = question.icon;
  const isLastQuestion = currentQuestion === ASSESSMENT_QUESTIONS.length - 1;
  const canProceed = question.type === 'text' || responses[question.id] !== undefined;
  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Quick Feedback</h2>
            <button 
              onClick={handleSkip}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-blue-100">
            Help us improve by answering {ASSESSMENT_QUESTIONS.length} quick questions about your session
            {advocateName && ` with ${advocateName}`}
          </p>
          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-blue-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-blue-200 mt-1">
            Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
          </p>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">{question.question}</h3>
          </div>

          {/* Rating Type */}
          {question.type === 'rating' && (
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                {question.options.map((value, idx) => (
                  <button
                    key={value}
                    onClick={() => handleRatingSelect(question.id, value)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all ${
                      responses[question.id] === value
                        ? 'bg-blue-600 text-white scale-110 shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-2">
                <span>{question.labels[0]}</span>
                <span>{question.labels[question.labels.length - 1]}</span>
              </div>
            </div>
          )}

          {/* Choice Type */}
          {question.type === 'choice' && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChoiceSelect(question.id, option.value)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    responses[question.id] === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Text Type */}
          {question.type === 'text' && (
            <textarea
              value={responses[question.id] || ''}
              onChange={(e) => handleTextChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          {currentQuestion > 0 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          )}
          
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            Skip
          </button>

          <button
            onClick={isLastQuestion ? handleSubmit : handleNext}
            disabled={(!canProceed && question.type !== 'text') || submitting}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              canProceed || question.type === 'text'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Submitting...' : isLastQuestion ? 'Submit Feedback' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useTouchpointAssessment() {
  const [isOpen, setIsOpen] = useState(false);
  const [touchpointData, setTouchpointData] = useState(null);

  const openAssessment = (touchpointId, advocateName = null) => {
    setTouchpointData({ touchpointId, advocateName });
    setIsOpen(true);
  };

  const closeAssessment = () => {
    setIsOpen(false);
    setTouchpointData(null);
  };

  return {
    isOpen,
    touchpointData,
    openAssessment,
    closeAssessment
  };
}
