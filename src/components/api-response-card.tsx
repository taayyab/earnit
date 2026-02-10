import { useState } from "react"
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { cn } from "../lib/utils"

interface ApiResponseCardProps {
  label: string
  mode: "live" | "mock" | null
  response: unknown
  loading: boolean
  defaultExpanded?: boolean
}

export function ApiResponseCard({
  label,
  mode,
  response,
  loading,
  defaultExpanded = true,
}: ApiResponseCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (response) {
      await navigator.clipboard.writeText(JSON.stringify(response, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!response) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">{label}</CardTitle>
            {mode && (
              <Badge variant={mode === "live" ? "live" : "mock"}>
                {mode.toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 px-2"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          expanded ? "max-h-[500px]" : "max-h-0"
        )}
      >
        <CardContent>
          <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto max-h-[400px] text-xs font-mono text-slate-800">
            {JSON.stringify(response, null, 2)}
          </pre>
        </CardContent>
      </div>
    </Card>
  )
}
