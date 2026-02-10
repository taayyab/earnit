import { cn } from "../../lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 mb-6 border-b border-slate-200 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-slate-500">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">{children}</div>
      )}
    </div>
  )
}
