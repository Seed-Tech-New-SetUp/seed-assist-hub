import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InsightCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "info";
  delay?: number;
  className?: string;
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export function InsightCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = "primary",
  delay = 0,
  className,
}: InsightCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg bg-card border border-border p-5 transition-all duration-200",
        "hover:shadow-md hover:border-border/80",
        "animate-fade-in-up opacity-0",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            variantStyles[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md",
              isPositive && "bg-success/10 text-success",
              isNegative && "bg-destructive/10 text-destructive",
              !isPositive && !isNegative && "bg-muted text-muted-foreground"
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {changeLabel && (
          <p className="text-xs text-muted-foreground">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}
