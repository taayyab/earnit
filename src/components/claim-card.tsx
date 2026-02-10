import { FileText, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"

type ClaimStatus = "pending" | "in_review" | "approved" | "denied" | "draft"

interface ClaimCardProps {
  id: string
  title: string
  status: ClaimStatus
  submissionDate?: string
  lastUpdated: string
  conditions?: string[]
  rating?: number
  onClick?: () => void
}

const statusConfig: Record<
  ClaimStatus,
  { label: string; variant: "success" | "warning" | "error" | "info" | "secondary"; icon: typeof CheckCircle2 }
> = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  in_review: { label: "In Review", variant: "info", icon: FileText },
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  denied: { label: "Denied", variant: "error", icon: AlertCircle },
  draft: { label: "Draft", variant: "secondary", icon: FileText },
}

export function ClaimCard({
  id,
  title,
  status,
  submissionDate,
  lastUpdated,
  conditions = [],
  rating,
  onClick,
}: ClaimCardProps) {
  const { label, variant, icon: StatusIcon } = statusConfig[status]

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:border-blue-200",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {label}
              </Badge>
              {rating !== undefined && (
                <Badge variant="default" className="bg-slate-800">
                  {rating}% Rating
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 truncate">
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Claim ID: {id}
            </p>
            {conditions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {conditions.slice(0, 3).map((condition, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {condition}
                  </Badge>
                ))}
                {conditions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{conditions.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm text-slate-500">
              {submissionDate ? (
                <>
                  <p>Submitted</p>
                  <p className="font-medium text-slate-800">{submissionDate}</p>
                </>
              ) : (
                <>
                  <p>Last Updated</p>
                  <p className="font-medium text-slate-800">{lastUpdated}</p>
                </>
              )}
            </div>
            {onClick && (
              <Button variant="ghost" size="sm" className="mt-2">
                View Details
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
