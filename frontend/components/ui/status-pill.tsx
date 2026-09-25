import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wider px-2 py-0.5 rounded-[4px] border select-none transition-colors whitespace-nowrap shrink-0",
  {
    variants: {
      status: {
        pending: "bg-bg-panel-raised text-text-muted border-border-hairline",
        scanning: "bg-accent-scan/10 text-accent-scan border-accent-scan/30",
        "in-review": "bg-[#6C9EFF]/10 text-signal-low border-signal-low/30",
        "corrections-requested": "bg-signal-critical/10 text-signal-critical border-signal-critical/30",
        completed: "bg-signal-resolved/10 text-signal-resolved border-signal-resolved/30",
        failed: "bg-signal-critical/10 text-signal-critical border-signal-critical/30",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0 gap-1",
        md: "text-[11px] px-2 py-0.5 gap-1.5",
        lg: "text-xs px-2.5 py-1 gap-2",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "md",
    },
  }
);

export type PipelineStatus =
  | "pending"
  | "scanning"
  | "in-review"
  | "corrections-requested"
  | "completed"
  | "failed";

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusPillVariants> {
  status: PipelineStatus;
  showPulse?: boolean;
}

const statusLabels: Record<PipelineStatus, string> = {
  pending: "PENDING",
  scanning: "SCANNING",
  "in-review": "IN MANUAL REVIEW",
  "corrections-requested": "CORRECTIONS REQUESTED",
  completed: "COMPLETED",
  failed: "FAILED",
};

export function StatusPill({
  className,
  status = "pending",
  size = "md",
  showPulse = true,
  children,
  ...props
}: StatusPillProps) {
  const isScanning = status === "scanning";

  return (
    <div
      className={cn(statusPillVariants({ status, size, className }))}
      {...props}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center">
        {isScanning && showPulse && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-scan opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            status === "pending" && "bg-text-muted/60",
            status === "scanning" && "bg-accent-scan",
            status === "in-review" && "bg-signal-low",
            status === "corrections-requested" && "bg-signal-critical",
            status === "completed" && "bg-signal-resolved",
            status === "failed" && "bg-signal-critical"
          )}
        />
      </span>
      <span className="whitespace-nowrap">{children || statusLabels[status]}</span>
    </div>
  );
}

export { statusPillVariants };
