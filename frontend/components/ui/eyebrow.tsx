import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const eyebrowVariants = cva(
  "inline-flex items-center font-mono uppercase tracking-widest select-none whitespace-nowrap shrink-0",
  {
    variants: {
      variant: {
        muted: "text-text-muted",
        scan: "text-accent-scan",
        primary: "text-text-primary",
      },
      size: {
        xs: "text-[10px] gap-1",
        sm: "text-[11px] gap-1.5",
        md: "text-xs gap-1.5",
      },
    },
    defaultVariants: {
      variant: "muted",
      size: "sm",
    },
  }
);

export interface EyebrowProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof eyebrowVariants> {
  prefix?: string;
  dot?: boolean;
}

export function Eyebrow({
  className,
  variant,
  size,
  prefix = "//",
  dot = false,
  children,
  ...props
}: EyebrowProps) {
  return (
    <span
      className={cn(eyebrowVariants({ variant, size, className }))}
      {...props}
    >
      {dot && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-scan mr-1 shrink-0" />
      )}
      {prefix && (
        <span className="opacity-50 font-normal shrink-0">{prefix}</span>
      )}
      <span>{children}</span>
    </span>
  );
}

export { eyebrowVariants };
