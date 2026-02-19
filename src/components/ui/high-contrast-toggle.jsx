import * as React from "react"
import { Moon, Sun, Eye } from "lucide-react"
import { Button } from "./button"

export function HighContrastToggle() {
  const [highContrast, setHighContrast] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('highContrastMode') === 'true'
    }
    return false
  })

  React.useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
      localStorage.setItem('highContrastMode', 'true')
    } else {
      document.documentElement.classList.remove('high-contrast')
      localStorage.setItem('highContrastMode', 'false')
    }
  }, [highContrast])

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setHighContrast(!highContrast)}
      aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
      aria-pressed={highContrast}
      className="relative"
    >
      <Eye className="h-5 w-5" aria-hidden="true" />
      {highContrast && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" aria-hidden="true" />
      )}
      <span className="sr-only">
        {highContrast ? "High contrast mode enabled" : "High contrast mode disabled"}
      </span>
    </Button>
  )
}

export default HighContrastToggle
