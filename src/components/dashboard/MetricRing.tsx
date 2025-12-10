import { cn } from "@/lib/utils";

interface MetricRingProps {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "warning" | "info";
  className?: string;
}

const variantColors = {
  primary: "hsl(215, 70%, 45%)",
  success: "hsl(160, 50%, 42%)",
  warning: "hsl(35, 85%, 50%)",
  info: "hsl(200, 70%, 48%)",
};

const sizes = {
  sm: { size: 80, stroke: 6, fontSize: "text-lg" },
  md: { size: 120, stroke: 8, fontSize: "text-2xl" },
  lg: { size: 160, stroke: 10, fontSize: "text-3xl" },
};

export function MetricRing({
  value,
  max = 100,
  label,
  sublabel,
  size = "md",
  variant = "primary",
  className,
}: MetricRingProps) {
  const { size: dimensions, stroke, fontSize } = sizes[size];
  const radius = (dimensions - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const color = variantColors[variant];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative" style={{ width: dimensions, height: dimensions }}>
        <svg className="transform -rotate-90" width={dimensions} height={dimensions}>
          {/* Background circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/50"
          />
          
          {/* Progress circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-semibold", fontSize)}>
            {value}
          </span>
          {sublabel && (
            <span className="text-xs text-muted-foreground">{sublabel}</span>
          )}
        </div>
      </div>
      
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
