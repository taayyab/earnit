import * as React from "react"

export function SkipToContent({ targetId = "main-content" }) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-to-content"
    >
      Skip to main content
    </a>
  )
}
