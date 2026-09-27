import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-scan disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-scan text-void hover:bg-accent-scan/90 active:bg-accent-scan/80 border border-transparent",
        secondary:
          "bg-panel border border-hairline text-text-primary hover:bg-panel-raised hover:border-hairline/80 active:bg-panel-raised/90",
        outline:
          "bg-transparent border border-hairline text-text-primary hover:bg-panel hover:border-text-muted/40 active:bg-panel-raised",
        ghost:
          "bg-transparent text-text-muted hover:text-text-primary hover:bg-panel-raised active:bg-panel",
        danger:
          "bg-panel border border-signal-critical/40 text-signal-critical hover:bg-signal-critical/10 active:bg-signal-critical/20",
      },
      size: {
        sm: "h-7 px-2.5 text-xs gap-1.5",
        md: "h-9 px-3.5 text-sm gap-2",
        lg: "h-11 px-5 text-sm gap-2.5",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
