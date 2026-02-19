import * as React from "react"
import { AlertCircle, AlertTriangle, XCircle, RefreshCw, Phone, ArrowLeft } from "lucide-react"
import { Button } from "./button"

const errorTemplates = {
  network: {
    title: "Connection Problem",
    message: "We couldn't connect to the server. Please check your internet connection and try again.",
    icon: AlertTriangle,
    color: "amber",
    recoveryActions: ['retry', 'contact']
  },
  validation: {
    title: "Please Check Your Information",
    message: "Some of the information you entered needs to be corrected. Please review the highlighted fields.",
    icon: AlertCircle,
    color: "red",
    recoveryActions: ['back']
  },
  server: {
    title: "Something Went Wrong",
    message: "We're having trouble processing your request. Our team has been notified. Please try again in a few minutes.",
    icon: XCircle,
    color: "red",
    recoveryActions: ['retry', 'contact']
  },
  session: {
    title: "Session Expired",
    message: "For your security, your session has expired. Please sign in again to continue.",
    icon: AlertCircle,
    color: "amber",
    recoveryActions: ['login']
  },
  permission: {
    title: "Access Not Available",
    message: "You don't have permission to access this feature. If you believe this is an error, please contact support.",
    icon: XCircle,
    color: "red",
    recoveryActions: ['contact', 'back']
  },
  notFound: {
    title: "Page Not Found",
    message: "We couldn't find what you're looking for. The page may have been moved or no longer exists.",
    icon: AlertCircle,
    color: "amber",
    recoveryActions: ['back', 'home']
  },
  upload: {
    title: "Upload Problem",
    message: "We couldn't upload your file. Please check that the file is under 10MB and in a supported format (PDF, JPG, PNG).",
    icon: AlertTriangle,
    color: "amber",
    recoveryActions: ['retry']
  },
  timeout: {
    title: "Request Timed Out",
    message: "The request took too long to complete. This might be because of a slow connection. Please try again.",
    icon: AlertTriangle,
    color: "amber",
    recoveryActions: ['retry', 'contact']
  }
}

const colorStyles = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    text: 'text-red-700'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    title: 'text-amber-900',
    text: 'text-amber-700'
  }
}

export function ErrorMessage({ 
  type = 'server', 
  customTitle,
  customMessage,
  onRetry,
  onBack,
  onContact,
  showRecoveryActions = true,
  className = ''
}) {
  const template = errorTemplates[type] || errorTemplates.server
  const colors = colorStyles[template.color]
  const Icon = template.icon

  const title = customTitle || template.title
  const message = customMessage || template.message

  const handleContact = () => {
    if (onContact) {
      onContact()
    } else {
      window.location.href = '/messages'
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      window.history.back()
    }
  }

  return (
    <div 
      className={`${colors.bg} ${colors.border} border rounded-xl p-6 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex gap-4">
        <div className={`flex-shrink-0 ${colors.icon}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${colors.title}`}>
            {title}
          </h3>
          <p className={`mt-2 text-base ${colors.text}`}>
            {message}
          </p>
          
          {showRecoveryActions && (
            <div className="mt-4 flex flex-wrap gap-3">
              {template.recoveryActions.includes('retry') && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try Again
                </Button>
              )}
              
              {template.recoveryActions.includes('back') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Go Back
                </Button>
              )}
              
              {template.recoveryActions.includes('contact') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContact}
                  className="inline-flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Contact Support
                </Button>
              )}
              
              {template.recoveryActions.includes('login') && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In Again
                </Button>
              )}
              
              {template.recoveryActions.includes('home') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/'}
                >
                  Go to Home
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function InlineError({ message, className = '' }) {
  if (!message) return null

  return (
    <p 
      className={`text-sm text-red-600 flex items-center gap-1.5 mt-1.5 ${className}`}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  )
}

export function useErrorHandler() {
  const [error, setError] = React.useState(null)

  const handleError = React.useCallback((err, type = 'server') => {
    console.error('Error:', err)
    
    if (err.message?.includes('network') || err.message?.includes('fetch')) {
      setError({ type: 'network', original: err })
    } else if (err.status === 401 || err.message?.includes('unauthorized')) {
      setError({ type: 'session', original: err })
    } else if (err.status === 403) {
      setError({ type: 'permission', original: err })
    } else if (err.status === 404) {
      setError({ type: 'notFound', original: err })
    } else if (err.status === 422 || err.message?.includes('validation')) {
      setError({ type: 'validation', original: err })
    } else if (err.message?.includes('timeout')) {
      setError({ type: 'timeout', original: err })
    } else {
      setError({ type, original: err })
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}

export default ErrorMessage
