import * as React from "react"
import { CheckCircle, Star, Trophy, Sparkles, PartyPopper } from "lucide-react"
import confetti from 'canvas-confetti'

const celebrationMessages = {
  step_complete: [
    "Great job! You're making excellent progress.",
    "Well done! Every step brings you closer to your goal.",
    "Fantastic work! Keep going, you've got this.",
    "Excellent! That's another step completed.",
  ],
  document_uploaded: [
    "Document received! Your evidence is building a strong case.",
    "Great upload! This documentation will support your claim.",
    "Perfect! Your records have been securely saved.",
  ],
  claim_submitted: [
    "Congratulations! Your claim has been submitted to the VA.",
    "Outstanding! You've completed a major milestone.",
    "Well done, Veteran! Your claim is now with the VA.",
  ],
  milestone: [
    "You've reached a major milestone! Celebrate your progress.",
    "Amazing achievement! You're doing incredible work.",
    "Milestone unlocked! Your dedication is paying off.",
  ]
}

const celebrationIcons = {
  step_complete: CheckCircle,
  document_uploaded: Star,
  claim_submitted: Trophy,
  milestone: PartyPopper,
}

export function ProgressCelebration({ 
  type = 'step_complete', 
  show = false, 
  onClose,
  customMessage,
  showConfetti = false 
}) {
  const [visible, setVisible] = React.useState(false)
  const [message, setMessage] = React.useState('')

  React.useEffect(() => {
    if (show) {
      const messages = celebrationMessages[type] || celebrationMessages.step_complete
      const randomMessage = customMessage || messages[Math.floor(Math.random() * messages.length)]
      setMessage(randomMessage)
      setVisible(true)

      if (showConfetti && type === 'claim_submitted') {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        } catch (e) {
          console.log('Confetti not available')
        }
      }

      const timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [show, type, customMessage, showConfetti, onClose])

  if (!visible) return null

  const Icon = celebrationIcons[type] || CheckCircle
  const bgColors = {
    step_complete: 'bg-green-50 border-green-200',
    document_uploaded: 'bg-blue-50 border-blue-200',
    claim_submitted: 'bg-[hsl(var(--warm-gold-light))] border-[hsl(var(--warm-gold))]',
    milestone: 'bg-blue-50 border-blue-200',
  }
  const iconColors = {
    step_complete: 'text-green-600',
    document_uploaded: 'text-blue-600',
    claim_submitted: 'text-[hsl(var(--warm-gold-dark))]',
    milestone: 'text-[#1B3A5F]',
  }

  return (
    <div 
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={`${bgColors[type]} border-2 rounded-xl shadow-lg px-6 py-4 flex items-center gap-4 max-w-md`}>
        <div className={`flex-shrink-0 ${iconColors[type]}`}>
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{message}</p>
          {type === 'claim_submitted' && (
            <p className="text-sm text-gray-600 mt-1">
              <Sparkles className="inline h-4 w-4 mr-1" aria-hidden="true" />
              Thank you for your service
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setVisible(false)
            if (onClose) onClose()
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss celebration message"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  )
}

export function useCelebration() {
  const [celebration, setCelebration] = React.useState({ show: false, type: 'step_complete' })

  const celebrate = React.useCallback((type = 'step_complete', customMessage = null) => {
    setCelebration({ show: true, type, customMessage })
  }, [])

  const closeCelebration = React.useCallback(() => {
    setCelebration(prev => ({ ...prev, show: false }))
  }, [])

  const CelebrationComponent = React.useCallback(() => (
    <ProgressCelebration 
      show={celebration.show} 
      type={celebration.type}
      customMessage={celebration.customMessage}
      onClose={closeCelebration}
      showConfetti={celebration.type === 'claim_submitted'}
    />
  ), [celebration, closeCelebration])

  return { celebrate, CelebrationComponent }
}

export default ProgressCelebration
