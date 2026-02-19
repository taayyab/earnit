import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, TrendingUp, Heart, Star } from 'lucide-react';

const ENCOURAGEMENTS = {
  document_uploaded: [
    "Great job! That's one more piece of evidence for your claim.",
    "Nice! Your claim is getting stronger with each document.",
    "Excellent! You're making real progress."
  ],
  dd214_uploaded: [
    "Your DD-214 is the foundation of your claim. Well done!",
    "Perfect! Your service record is now part of your claim package."
  ],
  medical_uploaded: [
    "Medical evidence is crucial - great work adding these records!",
    "These medical records will help prove your current conditions."
  ],
  analysis_complete: [
    "We've found conditions you may be able to claim!",
    "Your documents have been analyzed - let's see what you've earned."
  ],
  condition_selected: [
    "Good choice! We'll build the strongest case possible for this condition.",
    "Selected! This condition has been added to your claim."
  ],
  claim_approved: [
    "Congratulations! Your claim package is ready.",
    "You did it! Your claim is assembled and ready for the next step."
  ],
  step_complete: [
    "Step complete! You're moving forward.",
    "Great progress! Keep going - you've got this."
  ]
};

export default function StepFeedback({ type, show, onHide, customMessage }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onHide?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!isVisible) return null;

  const messages = ENCOURAGEMENTS[type] || ENCOURAGEMENTS.step_complete;
  const message = customMessage || messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-sm">
        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p className="text-green-800 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function ProgressMilestone({ milestone, description }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="font-semibold text-gray-900">{milestone}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

export function EncouragementBanner({ variant = 'default' }) {
  const banners = {
    default: {
      icon: Heart,
      title: "You're doing great!",
      message: "Every step you take brings you closer to the benefits you've earned.",
      color: 'blue'
    },
    progress: {
      icon: TrendingUp,
      title: "Making Progress!",
      message: "You're further along than most veterans at this stage.",
      color: 'green'
    },
    almost_done: {
      icon: Star,
      title: "Almost There!",
      message: "Just a few more steps and your claim will be ready.",
      color: 'purple'
    }
  };

  const banner = banners[variant] || banners.default;
  const Icon = banner.icon;

  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
    green: 'from-green-50 to-green-100 border-green-200 text-green-900',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900'
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[banner.color]} border rounded-lg p-4 flex items-center gap-4`}>
      <Icon className="h-8 w-8 flex-shrink-0" />
      <div>
        <p className="font-semibold">{banner.title}</p>
        <p className="text-sm opacity-90">{banner.message}</p>
      </div>
    </div>
  );
}
