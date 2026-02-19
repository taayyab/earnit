import * as React from "react"

const AriaLiveContext = React.createContext(null)

export function AriaLiveProvider({ children }) {
  const [announcements, setAnnouncements] = React.useState({
    polite: '',
    assertive: ''
  })

  const announce = React.useCallback((message, priority = 'polite') => {
    setAnnouncements(prev => ({
      ...prev,
      [priority]: ''
    }))
    
    setTimeout(() => {
      setAnnouncements(prev => ({
        ...prev,
        [priority]: message
      }))
    }, 50)
  }, [])

  const announcePolite = React.useCallback((message) => {
    announce(message, 'polite')
  }, [announce])

  const announceAssertive = React.useCallback((message) => {
    announce(message, 'assertive')
  }, [announce])

  return (
    <AriaLiveContext.Provider value={{ announce, announcePolite, announceAssertive }}>
      {children}
      
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements.polite}
      </div>
      
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements.assertive}
      </div>
    </AriaLiveContext.Provider>
  )
}

export function useAriaLive() {
  const context = React.useContext(AriaLiveContext)
  if (!context) {
    return {
      announce: () => {},
      announcePolite: () => {},
      announceAssertive: () => {}
    }
  }
  return context
}

export function AriaDescription({ id, children }) {
  return (
    <span id={id} className="sr-only">
      {children}
    </span>
  )
}

export function VisuallyHidden({ children, as: Component = 'span', ...props }) {
  return (
    <Component className="sr-only" {...props}>
      {children}
    </Component>
  )
}

export default AriaLiveProvider
