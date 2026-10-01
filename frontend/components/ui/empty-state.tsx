import * as React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  badge?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  iconClassName,
  title,
  description,
  badge,
  primaryAction,
  secondaryAction,
  children,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs transition-all",
        className
      )}
    >
      <div
        className={cn(
          "rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel text-center flex flex-col items-center justify-center shadow-xs",
          compact ? "p-6 sm:p-8" : "p-8 sm:p-12"
        )}
      >
        {/* Icon with glowing backdrop */}
        <div className="relative mb-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-accent-scan/10 border border-accent-scan/20 flex items-center justify-center text-accent-scan shadow-[0_0_20px_rgba(94,200,255,0.15)]">
            <Icon className={cn("h-6 w-6 sm:h-7 sm:w-7 stroke-[1.8]", iconClassName)} />
          </div>
        </div>

        {badge && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20 mb-2.5">
            {badge}
          </span>
        )}

        {/* Title */}
        <h3 className="font-display text-base sm:text-lg font-bold text-text-primary tracking-tight max-w-md">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-text-muted mt-1.5 max-w-md leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {primaryAction &&
              (primaryAction.href ? (
                <Link href={primaryAction.href}>
                  <ExpandingButton
                    variant="accent"
                    rounded="xl"
                    size={compact ? "sm" : "md"}
                    icon={primaryAction.icon}
                  >
                    {primaryAction.label}
                  </ExpandingButton>
                </Link>
              ) : (
                <ExpandingButton
                  variant="accent"
                  rounded="xl"
                  size={compact ? "sm" : "md"}
                  onClick={primaryAction.onClick}
                  icon={primaryAction.icon}
                >
                  {primaryAction.label}
                </ExpandingButton>
              ))}

            {secondaryAction &&
              (secondaryAction.href ? (
                <Link href={secondaryAction.href}>
                  <Button
                    variant="secondary"
                    size={compact ? "sm" : "md"}
                    className="rounded-xl text-xs"
                    leftIcon={secondaryAction.icon}
                  >
                    {secondaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  size={compact ? "sm" : "md"}
                  className="rounded-xl text-xs"
                  onClick={secondaryAction.onClick}
                  leftIcon={secondaryAction.icon}
                >
                  {secondaryAction.label}
                </Button>
              ))}
          </div>
        )}

        {/* Extra children slot (e.g., feature pills, tips, guides) */}
        {children && <div className="mt-6 w-full max-w-2xl">{children}</div>}
      </div>
    </div>
  );
}
