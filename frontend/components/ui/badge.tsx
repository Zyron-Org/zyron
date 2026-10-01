import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-sans text-xs font-medium px-2 py-0.5 rounded-md border transition-colors select-none whitespace-nowrap shrink-0",
  {
    variants: {
      severity: {
        critical:
          "bg-signal-critical/10 text-signal-critical border-signal-critical/30",
        high:
          "bg-signal-high/10 text-signal-high border-signal-high/30",
        medium:
          "bg-signal-medium/10 text-signal-medium border-signal-medium/30",
        low:
          "bg-signal-low/10 text-signal-low border-signal-low/30",
        resolved:
          "bg-signal-resolved/10 text-signal-resolved border-signal-resolved/30",
        informational:
          "bg-panel-raised text-text-muted border-border-hairline",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0",
        md: "text-[11px] px-2 py-0.5",
        lg: "text-xs px-2.5 py-1",
      },
    },
    defaultVariants: {
      severity: "informational",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showIndicator?: boolean;
}

const indicatorColors: Record<string, string> = {
  critical: "bg-signal-critical",
  high: "bg-signal-high",
  medium: "bg-signal-medium",
  low: "bg-signal-low",
  resolved: "bg-signal-resolved",
  informational: "bg-text-muted",
};

export function Badge({
  className,
  severity = "informational",
  size = "md",
  showIndicator = true,
  children,
  ...props
}: BadgeProps) {
  const activeSeverity = severity || "informational";
  const indicatorColor = indicatorColors[activeSeverity] || "bg-text-muted";

  return (
    <div
      className={cn(badgeVariants({ severity: activeSeverity, size, className }))}
      {...props}
    >
      {showIndicator && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", indicatorColor)}
          aria-hidden="true"
        />
      )}
      <span className="whitespace-nowrap">{children}</span>
    </div>
  );
}

export { badgeVariants };
