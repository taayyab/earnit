import * as React from "react"
import { Phone, MessageCircle, X, User, Clock, HelpCircle } from "lucide-react"
import { Button } from "./button"

export function TalkToPersonButton() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState(null)

  const supportOptions = [
    {
      id: 'call',
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with a support specialist',
      action: 'tel:+18005551234',
      availability: 'Mon-Fri 8am-6pm CT'
    },
    {
      id: 'chat',
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our team now',
      action: '/messages',
      availability: 'Available now'
    },
    {
      id: 'callback',
      icon: Clock,
      title: 'Request Callback',
      description: "We'll call you back",
      action: 'callback',
      availability: 'Within 24 hours'
    }
  ]

  const handleOptionClick = (option) => {
    if (option.action === 'callback') {
      setSelectedOption('callback')
    } else if (option.action.startsWith('tel:')) {
      window.location.href = option.action
    } else {
      window.location.href = option.action
    }
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          size="icon"
          className={`rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white h-12 w-12 sm:h-14 sm:w-14 ${isOpen ? 'rotate-0' : ''}`}
          aria-label="Talk to a person - get human support"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          {isOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          ) : (
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          )}
        </Button>
        {isHovered && !isOpen && (
          <div className="absolute right-16 bottom-2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            Need help?
          </div>
        )}
      </div>

      {isOpen && (
        <div 
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-xs bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          role="dialog"
          aria-label="Support options"
        >
          <div className="bg-[hsl(var(--primary))] text-white p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold">How can we help?</h2>
            <p className="text-xs sm:text-sm opacity-90">Choose how you'd like to connect</p>
          </div>

          {selectedOption === 'callback' ? (
            <div className="p-4">
              <h3 className="font-medium mb-3">Request a Callback</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                alert('Callback requested! We will call you within 24 hours.')
                setSelectedOption(null)
                setIsOpen(false)
              }}>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="callback-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="callback-phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                      placeholder="(555) 123-4567"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label htmlFor="callback-time" className="block text-sm font-medium text-gray-700 mb-1">
                      Best Time to Call
                    </label>
                    <select
                      id="callback-time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                      aria-required="true"
                    >
                      <option value="morning">Morning (8am-12pm)</option>
                      <option value="afternoon">Afternoon (12pm-5pm)</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Request Callback
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setSelectedOption(null)}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-2">
              {supportOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className="w-full p-3 flex items-start gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  aria-label={`${option.title}: ${option.description}. ${option.availability}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-[hsl(var(--primary))]/10 rounded-full flex items-center justify-center">
                    <option.icon className="h-5 w-5 text-[hsl(var(--primary))]" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.title}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.availability}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="bg-gray-50 p-3 text-center text-sm text-gray-600 border-t">
            <span className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></span>
              Veterans are our priority
            </span>
          </div>
        </div>
      )}
    </>
  )
}

export default TalkToPersonButton
