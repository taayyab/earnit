import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { cn } from "../lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-800">{value}</p>
              {trend && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.isPositive
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {trend.isPositive ? "+" : "-"}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-blue-50">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
