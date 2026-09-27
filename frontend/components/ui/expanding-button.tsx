"use client";

import * as React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExpandingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "light" | "dark" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
  rounded?: "default" | "md" | "lg" | "xl" | "full";
  icon?: React.ReactNode;
}

export const ExpandingButton = React.forwardRef<
  HTMLButtonElement,
  ExpandingButtonProps
>(
  (
    {
      className,
      variant = "light",
      size = "md",
      rounded = "default",
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Sizing
    const containerClasses = {
      sm: "h-9 pl-3.5 pr-1 text-xs gap-2.5",
      md: "h-11 pl-5 pr-1 text-sm gap-3.5",
      lg: "h-12 pl-6 pr-1.5 text-sm md:text-base gap-4",
    }[size];

    const iconBoxWidth = {
      sm: "w-7",
      md: "w-8",
      lg: "w-9",
    }[size];

    const radiusClasses = {
      default: { outer: "rounded-[6px]", inner: "rounded-[4px]" },
      md: { outer: "rounded-[6px]", inner: "rounded-[4px]" },
      lg: { outer: "rounded-lg", inner: "rounded-[6px]" },
      xl: { outer: "rounded-xl", inner: "rounded-[10px]" },
      full: { outer: "rounded-full", inner: "rounded-full" },
    }[rounded];

    // Light Variant (White button -> Dark expanding icon background)
    if (variant === "light") {
      const defaultIcon = icon || <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />;
      return (
        <button
          ref={ref}
          disabled={disabled}
          className={cn(
            "relative group overflow-hidden inline-flex items-center justify-between font-mono font-bold select-none shadow-md",
            radiusClasses.outer,
            "bg-text-primary text-bg-void border border-white/20",
            containerClasses,
            className
          )}
          {...props}
        >
          {/* Expanding Icon Background: exactly 2px margin on all sides, no border */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute right-[2px] top-[2px] bottom-[2px] bg-bg-void/10 pointer-events-none transition-all duration-300 ease-out",
              radiusClasses.inner,
              iconBoxWidth,
              "group-hover:w-[calc(100%-4px)] group-hover:bg-bg-void"
            )}
          />

          {/* Button Text: moves right toward icon on hover */}
          <span className="relative z-10 tracking-tight transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-text-primary">
            {children}
          </span>

          {/* Icon Badge: moves left toward text on hover */}
          <span
            className={cn(
              "relative z-10 flex items-center justify-center shrink-0 transition-all duration-300 ease-out text-bg-void group-hover:-translate-x-1.5 group-hover:text-accent-scan",
              iconBoxWidth
            )}
          >
            {defaultIcon}
          </span>
        </button>
      );
    }

    // Accent Variant
    if (variant === "accent") {
      const defaultIcon = icon || <ArrowRight className="h-4 w-4" />;
      return (
        <button
          ref={ref}
          disabled={disabled}
          className={cn(
            "relative group overflow-hidden inline-flex items-center justify-between font-mono font-bold select-none shadow-md",
            radiusClasses.outer,
            "bg-accent-scan text-bg-void border border-accent-scan/40",
            containerClasses,
            className
          )}
          {...props}
        >
          {/* Expanding Icon Background: exactly 2px margin on all sides, no border */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute right-[2px] top-[2px] bottom-[2px] bg-bg-void/20 pointer-events-none transition-all duration-300 ease-out",
              radiusClasses.inner,
              iconBoxWidth,
              "group-hover:w-[calc(100%-4px)] group-hover:bg-bg-void"
            )}
          />

          {/* Button Text: moves right toward icon on hover */}
          <span className="relative z-10 tracking-tight transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-accent-scan">
            {children}
          </span>

          {/* Icon Badge: moves left toward text on hover */}
          <span
            className={cn(
              "relative z-10 flex items-center justify-center shrink-0 transition-all duration-300 ease-out text-bg-void group-hover:-translate-x-1.5 group-hover:text-accent-scan",
              iconBoxWidth
            )}
          >
            {defaultIcon}
          </span>
        </button>
      );
    }

    // Danger / Red Variant (Dark background with red border -> Solid red expanding on hover)
    if (variant === "danger") {
      const defaultIcon = icon || <ArrowRight className="h-4 w-4" />;
      return (
        <button
          ref={ref}
          disabled={disabled}
          className={cn(
            "relative group overflow-hidden inline-flex items-center justify-between font-mono font-medium select-none shadow-xs transition-all cursor-pointer",
            radiusClasses.outer,
            "bg-bg-void/90 dark:bg-bg-void text-text-primary border border-signal-critical/50 hover:border-signal-critical active:scale-[0.99]",
            containerClasses,
            className
          )}
          {...props}
        >
          {/* Expanding Red Background: exactly 2px margin on all sides, no border */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute right-[2px] top-[2px] bottom-[2px] bg-signal-critical/15 pointer-events-none transition-all duration-300 ease-out",
              radiusClasses.inner,
              iconBoxWidth,
              "group-hover:w-[calc(100%-4px)] group-hover:bg-signal-critical"
            )}
          />

          {/* Button Text: moves right toward icon on hover, turns white on red */}
          <span className="relative z-10 tracking-tight transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-white group-hover:font-semibold">
            {children}
          </span>

          {/* Icon Badge: moves left toward text on hover, turns white on red */}
          <span
            className={cn(
              "relative z-10 flex items-center justify-center shrink-0 transition-all duration-300 ease-out text-signal-critical group-hover:-translate-x-1.5 group-hover:text-white",
              iconBoxWidth
            )}
          >
            {defaultIcon}
          </span>
        </button>
      );
    }

    // Dark Variant (Dark panel button -> Brand Blue expanding icon background)
    const defaultIcon = icon || <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />;
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "relative group overflow-hidden inline-flex items-center justify-between font-mono font-medium select-none shadow-lg",
          radiusClasses.outer,
          "bg-bg-panel text-text-primary border border-border-hairline",
          containerClasses,
          className
        )}
        {...props}
      >
        {/* Expanding Brand Blue Icon Background: exactly 2px margin on all sides, no border */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute right-[2px] top-[2px] bottom-[2px] bg-accent-scan pointer-events-none transition-all duration-300 ease-out",
            radiusClasses.inner,
            iconBoxWidth,
            "group-hover:w-[calc(100%-4px)] group-hover:bg-accent-scan"
          )}
        />

        {/* Button Text: moves right toward icon on hover, turns dark when covered by brand blue */}
        <span className="relative z-10 tracking-tight transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-bg-void group-hover:font-bold">
          {children}
        </span>

        {/* Icon Badge: moves left toward text on hover, text is dark on brand blue */}
        <span
          className={cn(
            "relative z-10 flex items-center justify-center shrink-0 transition-all duration-300 ease-out text-bg-void group-hover:-translate-x-1.5 group-hover:text-bg-void",
            iconBoxWidth
          )}
        >
          {defaultIcon}
        </span>
      </button>
    );
  }
);

ExpandingButton.displayName = "ExpandingButton";
