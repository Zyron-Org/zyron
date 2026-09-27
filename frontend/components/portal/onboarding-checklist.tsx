"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  GitBranch,
  Users,
  Code2,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  FileCode2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: boolean;
}

interface OnboardingChecklistProps {
  hasAudits: boolean;
  userName?: string;
  orgName?: string;
  className?: string;
}

export function OnboardingChecklist({
  hasAudits,
  userName,
  orgName,
  className,
}: OnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = React.useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    try {
      const dismissed = localStorage.getItem("zyron_onboarding_dismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
      }

      const saved = localStorage.getItem("zyron_onboarding_steps");
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // If user already has audits, step 1 is automatically marked complete
  React.useEffect(() => {
    if (hasAudits) {
      setCompletedSteps((prev) => {
        if (prev["submit_audit"]) return prev;
        const updated = { ...prev, submit_audit: true };
        try {
          localStorage.setItem("zyron_onboarding_steps", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [hasAudits]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const updated = { ...prev, [stepId]: !prev[stepId] };
      try {
        localStorage.setItem("zyron_onboarding_steps", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("zyron_onboarding_dismissed", "true");
    } catch {}
  };

  const steps: OnboardingStep[] = [
    {
      id: "submit_audit",
      title: "Request your first smart contract audit",
      description: "Upload Solidity contracts or provide a repository commit to launch automated AST scans.",
      actionText: "New Request",
      actionHref: "/portal/new-request",
      icon: Plus,
      isComplete: hasAudits || !!completedSteps["submit_audit"],
    },
    {
      id: "configure_cicd",
      title: "Set up CI/CD GitHub Action & developer tooling",
      description: "Embed automated pull-request security gates and local pre-commit invariant checks.",
      actionText: "Configure",
      actionHref: "/portal/integrations",
      icon: Code2,
      isComplete: !!completedSteps["configure_cicd"],
    },
    {
      id: "invite_team",
      title: "Invite engineering team & multisig signers",
      description: "Grant role-based access to protocol developers and security team members.",
      actionText: "Manage Team",
      actionHref: "/portal/team",
      icon: Users,
      isComplete: !!completedSteps["invite_team"],
    },
    {
      id: "explore_demo",
      title: "Explore the live deterministic tracker demo",
      description: "See how multi-stage AST scans, auditor triage, and attestation sealing works in real time.",
      actionText: "View Live Demo",
      actionHref: "/portal/track/ZYR-9481",
      icon: ShieldCheck,
      isComplete: !!completedSteps["explore_demo"],
    },
  ];

  const completedCount = steps.filter((s) => s.isComplete).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // If dismissed or all completed and user chose to hide
  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs transition-all",
        className
      )}
    >
      <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 shadow-xs">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                <Sparkles className="h-3 w-3" />
                First-Time Onboarding
              </span>
              <span className="text-xs font-mono text-text-muted">
                {completedCount} of {steps.length} completed ({progressPercent}%)
              </span>
            </div>

            <h2 className="font-display text-lg font-bold tracking-tight text-text-primary">
              Welcome to Zyron Protocol Security{orgName ? `, ${orgName}` : userName ? `, ${userName}` : ""}
            </h2>
            <p className="text-xs text-text-muted max-w-2xl">
              Complete these foundational steps to audit-lock your protocol, integrate CI/CD guardrails, and prepare for mainnet attestation.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void transition-colors cursor-pointer"
              title={isCollapsed ? "Expand onboarding checklist" : "Collapse"}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void transition-colors cursor-pointer"
              title="Dismiss checklist"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 mb-2">
          <div className="h-2 w-full bg-[#E4E7EC] dark:bg-border-hairline/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-scan rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(94,200,255,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List (Collapsible) */}
        {!isCollapsed && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-hairline/60">
            {steps.map((step) => {
              const StepIcon = step.icon;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all flex items-start gap-3",
                    step.isComplete
                      ? "border-signal-resolved/20 bg-signal-resolved/5"
                      : "border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/40 hover:border-accent-scan/40"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className="shrink-0 mt-0.5 cursor-pointer text-text-muted hover:text-accent-scan transition-colors"
                    title={step.isComplete ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {step.isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-signal-resolved fill-signal-resolved/20" />
                    ) : (
                      <Circle className="h-5 w-5 text-text-muted hover:text-accent-scan" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold tracking-tight",
                          step.isComplete ? "line-through text-text-muted" : "text-text-primary"
                        )}
                      >
                        {step.title}
                      </span>
                    </div>

                    <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                      {step.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <Link
                        href={step.actionHref}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-scan hover:underline"
                        onClick={() => {
                          if (!step.isComplete) {
                            toggleStep(step.id);
                          }
                        }}
                      >
                        <span>{step.actionText}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>

                      {step.isComplete && (
                        <span className="text-[10px] font-mono text-signal-resolved font-medium">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
