import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 font-sans text-xs font-medium px-2.5 py-0.5 rounded-full border select-none transition-colors whitespace-nowrap shrink-0",
  {
    variants: {
      status: {
        pending: "bg-bg-panel-raised/70 text-text-muted border-border-hairline",
        scanning: "bg-accent-scan/10 text-accent-scan border-accent-scan/25",
        "in-review": "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
        "corrections-requested": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
        "remediation-verified": "bg-signal-resolved/10 text-signal-resolved border-signal-resolved/25",
        "attestation-pending": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
        completed: "bg-signal-resolved/10 text-signal-resolved border-signal-resolved/25",
        failed: "bg-signal-critical/10 text-signal-critical border-signal-critical/25",
      },
      size: {
        sm: "text-[11px] px-2 py-0.5 gap-1",
        md: "text-xs px-2.5 py-0.5 gap-1.5",
        lg: "text-xs px-3 py-1 gap-2",
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
  | "remediation-verified"
  | "attestation-pending"
  | "completed"
  | "failed";

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusPillVariants> {
  status: PipelineStatus;
  showPulse?: boolean;
}

const statusLabels: Record<PipelineStatus, string> = {
  pending: "Pending Intake",
  scanning: "Automated Scan",
  "in-review": "In Review",
  "corrections-requested": "Fixes Needed",
  "remediation-verified": "Remediation Verified",
  "attestation-pending": "Attestation Pending",
  completed: "Completed",
  failed: "Failed",
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
            status === "remediation-verified" && "bg-signal-resolved",
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
