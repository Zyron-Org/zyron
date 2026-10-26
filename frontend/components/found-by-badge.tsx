import * as React from "react";
import { Sparkles, Cpu, User } from "lucide-react";

export type FindingOrigin = "STATIC" | "AI" | "MANUAL" | string;

interface FoundByBadgeProps {
  foundBy?: FindingOrigin;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function FoundByBadge({
  foundBy,
  size = "sm",
  showLabel = true,
}: FoundByBadgeProps) {
  const origin = (foundBy || "STATIC").toUpperCase();
  const textSize = size === "md" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5";
  const iconSize = size === "md" ? "h-3.5 w-3.5" : "h-2.5 w-2.5";

  if (origin === "AI") {
    return (
      <span
        title="Discovered by Deep Multi-Model Cloud AI Review (Zero-Day Scan)"
        className={`inline-flex items-center gap-1 rounded font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 ${textSize}`}
      >
        <Sparkles className={iconSize} />
        {showLabel && <span>AI</span>}
      </span>
    );
  }

  if (origin === "MANUAL") {
    return (
      <span
        title="Discovered by Human Security Researcher during manual audit review"
        className={`inline-flex items-center gap-1 rounded font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 ${textSize}`}
      >
        <User className={iconSize} />
        {showLabel && <span>Manual</span>}
      </span>
    );
  }

  return (
    <span
      title="Discovered by Automated 14-Pass AST & Semantic Pattern Engine"
      className={`inline-flex items-center gap-1 rounded font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 ${textSize}`}
    >
      <Cpu className={iconSize} />
      {showLabel && <span>Static AST</span>}
    </span>
  );
}
