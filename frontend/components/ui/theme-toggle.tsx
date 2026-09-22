"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  size?: "sm" | "md";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  size = "md",
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme, isMounted } = useTheme();

  // Prevent hydration mismatch during SSR
  if (!isMounted) {
    return (
      <button
        type="button"
        className={cn(
          "rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-center text-text-muted transition-colors opacity-50 cursor-default",
          size === "sm" ? "h-7 w-7" : "h-9 w-9",
          className
        )}
        aria-label="Toggle theme"
        disabled
      >
        <span className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      </button>
    );
  }

  const isLight = resolvedTheme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent-scan/50 active:bg-bg-panel-raised transition-colors group select-none cursor-pointer",
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
        showLabel && "w-auto px-2.5 gap-2",
        className
      )}
      title={isLight ? "Switch to Dark Mode (Lab Void)" : "Switch to Light Mode (Clinical Paper)"}
      aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {isLight ? (
        <Moon className={cn("transition-transform group-hover:rotate-12 text-accent-scan", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      ) : (
        <Sun className={cn("transition-transform group-hover:rotate-45 text-signal-medium", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      )}
      {showLabel && (
        <span className="font-mono text-xs text-text-primary">
          {isLight ? "LIGHT" : "DARK"}
        </span>
      )}
    </button>
  );
}
