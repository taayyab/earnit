import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Star, Trophy, Medal } from 'lucide-react';
import { feedback } from '../lib/uxFeedback';

const CONFETTI_COLORS = ['#1B3A5F', '#C41E3A', '#FFD700', '#4CAF50', '#FF6B6B', '#9C27B0'];

const Confetti = ({ count = 50 }) => {
  const [pieces, setPieces] = useState([]);
  
  useEffect(() => {
    const newPieces = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360
    }));
    setPieces(newPieces);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`
          }}
        />
      ))}
    </div>
  );
};

const CELEBRATION_CONFIGS = {
  claim_submitted: {
    icon: CheckCircle,
    title: "Claim Submitted!",
    subtitle: "You've taken a big step forward, soldier.",
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    confetti: true
  },
  claim_approved: {
    icon: Trophy,
    title: "Victory!",
    subtitle: "Your claim has been approved. Mission accomplished.",
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    confetti: true
  },
  document_uploaded: {
    icon: CheckCircle,
    title: "Evidence Secured",
    subtitle: "Document uploaded successfully.",
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    confetti: false
  },
  milestone_reached: {
    icon: Star,
    title: "Milestone Reached!",
    subtitle: "Keep pushing forward.",
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    confetti: false
  },
  profile_complete: {
    icon: Medal,
    title: "Profile Complete!",
    subtitle: "You're ready to start your claim.",
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    confetti: true
  }
};

export function Celebration({ type = 'milestone_reached', message, onComplete, autoClose = 4000 }) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  
  const config = CELEBRATION_CONFIGS[type] || CELEBRATION_CONFIGS.milestone_reached;
  const Icon = config.icon;

  useEffect(() => {
    feedback('success');
    
    if (autoClose) {
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setVisible(false);
          onComplete?.();
        }, 300);
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onComplete]);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 300);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <>
      {config.confetti && <Confetti count={60} />}
      
      <div 
        className="fixed inset-0 z-[99] flex items-center justify-center bg-black/20 backdrop-blur-sm"
        onClick={handleDismiss}
      >
        <div 
          className={`
            ${config.bgColor} ${config.borderColor} border-2 
            rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center
            transform transition-all duration-300
            ${exiting ? 'scale-90 opacity-0' : 'scale-100 opacity-100 animate-celebration-pop'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`inline-flex p-4 rounded-full ${config.bgColor} mb-4`}>
            <Icon className={`h-12 w-12 ${config.color} animate-bounce-gentle`} />
          </div>
          
          <h2 className={`text-2xl font-bold ${config.color} mb-2`}>
            {config.title}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {message || config.subtitle}
          </p>
          
          <button
            onClick={handleDismiss}
            className="px-6 py-2 bg-[#1B3A5F] text-white rounded-lg font-medium hover:bg-[#2a4a6f] transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes confetti-fall {
          0% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 1;
          }
          100% { 
            transform: translateY(100vh) rotate(720deg); 
            opacity: 0;
          }
        }
        @keyframes celebration-pop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-confetti-fall {
          animation: confetti-fall ease-out forwards;
        }
        .animate-celebration-pop {
          animation: celebration-pop 0.4s ease-out;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export function useCelebration() {
  const [celebration, setCelebration] = useState(null);

  const celebrate = useCallback((type, message) => {
    setCelebration({ type, message, key: Date.now() });
  }, []);

  const clearCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const CelebrationComponent = celebration ? (
    <Celebration
      key={celebration.key}
      type={celebration.type}
      message={celebration.message}
      onComplete={clearCelebration}
    />
  ) : null;

  return { celebrate, CelebrationComponent };
}

export default Celebration;
