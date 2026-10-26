import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  isMono?: boolean;
  isError?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      isMono = false,
      isError = false,
      prefix,
      suffix,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "group relative flex items-center w-full rounded-[4px] border bg-bg-void transition-colors",
          isError
            ? "border-signal-critical focus-within:border-signal-critical"
            : "border-border-hairline focus-within:border-accent-scan",
          disabled && "opacity-40 cursor-not-allowed bg-bg-panel/40",
          className
        )}
      >
        {prefix && (
          <div className="flex items-center pl-3 pr-1 text-text-muted font-mono text-xs select-none shrink-0">
            {prefix}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "w-full bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none disabled:cursor-not-allowed",
            isMono && "font-mono text-xs tracking-tight",
            prefix && "pl-1.5",
            suffix && "pr-1.5"
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        {suffix && (
          <div className="flex items-center pr-3 pl-1 text-text-muted font-mono text-xs select-none shrink-0">
            {suffix}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
