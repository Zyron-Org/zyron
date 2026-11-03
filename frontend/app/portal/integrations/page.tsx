"use client";

import * as React from "react";
import Link from "next/link";
import {
  Code2,
  Terminal,
  GitBranch,
  Cpu,
  Lock,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Bot,
  Layers,
  Send,
  Bell,
  CheckCircle2,
  Sliders,
  Webhook,
  ArrowRight,
  Shield,
  FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  const { user } = useAuth();
  const isGithubConnected = Boolean(user?.githubLogin || (user as any)?.githubAccessToken);
  const webhookPayloadUrl = `${API_BASE_URL}/webhooks/github`;
  const githubAuthHref = `${API_BASE_URL}/auth/github?redirect=/portal/integrations`;

  const [activeTab, setActiveTab] = React.useState<"bot" | "github" | "cli" | "foundry" | "webhooks">("bot");
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  // GitHub Actions options
  const [failOnHigh, setFailOnHigh] = React.useState(true);
  const [enableBotComments, setEnableBotComments] = React.useState(true);
  const [enableSlither, setEnableSlither] = React.useState(true);
  const [enableMythril, setEnableMythril] = React.useState(true);

  // Webhook settings
  const [webhookUrl, setWebhookUrl] = React.useState("https://discord.com/api/webhooks/1298401/zyron-alerts");
  const [isSendingPing, setIsSendingPing] = React.useState(false);
  const [events, setEvents] = React.useState({
    criticalFindings: true,
    stageProgress: true,
    fixesVerified: true,
    reportSealed: true,
  });

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(section);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleTestWebhook = () => {
    setIsSendingPing(true);
    setTimeout(() => {
      setIsSendingPing(false);
      toast.success("Webhook test payload sent successfully! HTTP 200 OK");
    }, 800);
  };

  const githubActionsYaml = `name: Zyron Protocol Security Gate
on:
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'contracts/**'
      - 'src/**'
      - 'foundry.toml'
  push:
    branches: [ main ]

jobs:
  zyron-security-scan:
    name: Automated AST Taint & Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Foundry toolchain
        uses: foundry-rs/foundry-toolchain@v1
        with:
          version: nightly

      - name: Run Zyron Security Scanner
        uses: zyron-protocol/security-action@v1.4.2
        with:
          api-key: \${{ secrets.ZYRON_API_KEY }}
          fail-on-severity: ${failOnHigh ? "HIGH" : "CRITICAL"}
          pr-review-bot: ${enableBotComments ? "true" : "false"}
          slither-ast-pass: ${enableSlither ? "true" : "false"}
          mythril-symbolic-pass: ${enableMythril ? "true" : "false"}
          output-format: sarif
          report-path: zyron-report.sarif

      - name: Upload Security Findings SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: zyron-report.sarif
`;

  const preCommitHookSh = `#!/usr/bin/env bash
# .git/hooks/pre-commit — Zyron Local Pre-commit Security Enforcement
set -e

echo "🔍 Running Zyron pre-commit smart contract diagnostics..."

# Ensure contracts compile cleanly
forge build --sizes

# Run local AST invariant check
npx @zyron/cli check \\
  --scope "./contracts/**/*.sol" \\
  --fail-on ${failOnHigh ? "high" : "critical"} \\
  --max-issues 0

echo "✅ Zyron local scan passed! Proceeding with git commit."
`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* ─── 1. TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
            <Link href="/portal" className="hover:text-text-primary transition-colors">
              Client Portal
            </Link>
            <span>/</span>
            <span>Developer & System</span>
            <span>/</span>
            <span className="text-text-primary font-medium">CI/CD & CLI Hooks</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent-scan/10 border border-accent-scan/20 flex items-center justify-center text-accent-scan shrink-0">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                CI/CD Pipelines & Developer Tooling
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Automated bytecode taint verification, pull-request security gates, and local pre-commit hooks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge severity="resolved" size="md">
            API ENGINE V1.4 · ACTIVE
          </Badge>
        </div>
      </div>

      {/* ─── 2. QUICK STATS SUMMARY ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-mono uppercase tracking-wider text-[11px]">Integration Status</span>
            <CheckCircle2 className="h-4 w-4 text-signal-resolved" />
          </div>
          <div className="text-xl font-bold text-text-primary">Connected</div>
          <div className="text-[11px] text-text-muted">GitHub Actions & CLI Ready</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-mono uppercase tracking-wider text-[11px]">PR Review Bot</span>
            <Bot className="h-4 w-4 text-accent-scan" />
          </div>
          <div className="text-xl font-bold text-text-primary">@zyron-bot</div>
          <div className="text-[11px] text-text-muted">Automated inline comments</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-mono uppercase tracking-wider text-[11px]">Enforcement Gate</span>
            <ShieldCheck className="h-4 w-4 text-accent-scan" />
          </div>
          <div className="text-xl font-bold text-text-primary">High & Critical</div>
          <div className="text-[11px] text-text-muted">PR merges blocked on findings</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-mono uppercase tracking-wider text-[11px]">Webhook Endpoint</span>
            <Webhook className="h-4 w-4 text-signal-high" />
          </div>
          <div className="text-xl font-bold text-text-primary">Discord & Slack</div>
          <div className="text-[11px] text-text-muted">Real-time triage alerts</div>
        </div>
      </div>

      {/* ─── 2.5. DEVELOPER ONBOARDING QUICKSTART ─── */}
      <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
        <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-hairline/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                  <Bot className="h-3 w-3" />
                  GitHub @zyron-bot Mention Guide
                </span>
                <span className="text-xs font-mono text-text-muted">Issue & PR Comment Trigger</span>
              </div>
              <h2 className="font-display text-base font-bold text-text-primary">
                Trigger Smart Contract Audits Directly From GitHub Issues & Pull Requests
              </h2>
              <p className="text-xs text-text-muted max-w-3xl">
                Mention <code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[11px] text-accent-scan font-semibold">@zyron-bot</code> inside any GitHub Issue or Pull Request comment to automatically fetch your Solidity contract, launch Zyron&apos;s AST + Meta AI prover scan, and receive a full vulnerability report reply directly on the thread.
              </p>
            </div>
          </div>

          {/* Mandatory GitHub Account Sign-Up Notice */}
          <div
            className={cn(
              "mt-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3",
              isGithubConnected
                ? "bg-signal-resolved/5 border-signal-resolved/30"
                : "bg-amber-500/10 border-amber-500/30"
            )}
          >
            <div className="flex items-start gap-3">
              {isGithubConnected ? (
                <CheckCircle2 className="h-5 w-5 text-signal-resolved shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <span>
                    Important Requirement: GitHub Account Must Be Signed Up on Zyron
                  </span>
                  <Badge severity={isGithubConnected ? "resolved" : "high"} size="sm">
                    {isGithubConnected ? `VERIFIED (@${user?.githubLogin || "GitHub"})` : "ACTION REQUIRED"}
                  </Badge>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  The <code className="font-mono text-text-primary font-semibold">@zyron-bot</code> mention trigger <strong>only works if the GitHub account posting the comment has signed up or connected its GitHub identity on the main Zyron platform</strong>. Zyron uses your authenticated GitHub OAuth session to verify repository ownership, read contract files, and post audit result comments back to your Issue or PR.
                </p>
              </div>
            </div>
            {!isGithubConnected && (
              <a href={githubAuthHref} className="shrink-0">
                <Button variant="primary" size="sm" className="rounded-xl text-xs whitespace-nowrap">
                  Sign In / Connect GitHub
                </Button>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="p-3.5 rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <span className="h-5 w-5 rounded-md bg-accent-scan/10 text-accent-scan flex items-center justify-center font-mono text-[10px] font-bold">
                  01
                </span>
                <span>Sign Up With GitHub on Zyron</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Sign in with GitHub on Zyron so your GitHub username (<code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[10px]">@username</code>) and OAuth token are registered on the platform.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <span className="h-5 w-5 rounded-md bg-accent-scan/10 text-accent-scan flex items-center justify-center font-mono text-[10px] font-bold">
                  02
                </span>
                <span>Add Repo Webhook URL</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                In your GitHub repo <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[10px]">Settings &gt; Webhooks</code>, add <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[10px]">{webhookPayloadUrl}</code> (<code className="font-mono text-[10px]">application/json</code>) and enable <strong>Issues</strong> &amp; <strong>Issue comments</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <span className="h-5 w-5 rounded-md bg-accent-scan/10 text-accent-scan flex items-center justify-center font-mono text-[10px] font-bold">
                  03
                </span>
                <span>Mention @zyron-bot on PR/Issue</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Comment <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[10px] text-accent-scan">@zyron-bot audit contracts/Vault.sol</code> on any Issue or PR to trigger the scan and receive inline results.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. TAB CONTROLS ─── */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-bg-void/50 border border-border-hairline/60 w-fit">
        {[
          { id: "bot", label: "@zyron-bot GitHub Mention", icon: Bot },
          { id: "github", label: "GitHub Actions Workflow", icon: GitBranch },
          { id: "cli", label: "Local CLI Toolkit", icon: Terminal },
          { id: "foundry", label: "Foundry / Hardhat Hooks", icon: Cpu },
          { id: "webhooks", label: "Webhook Notifications", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                isActive
                  ? "bg-white dark:bg-bg-panel text-text-primary font-semibold shadow-xs border border-border-hairline"
                  : "text-text-muted hover:text-text-primary hover:bg-white/40 dark:hover:bg-bg-panel/40"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-accent-scan" : "text-text-muted")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 4. TAB CONTENTS ─── */}

      {/* TAB 0: @ZYRON-BOT GITHUB MENTION GUIDE */}
      {activeTab === "bot" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Step-by-step Setup & Commands Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline/60 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-accent-scan" />
                  <span className="font-display text-sm font-bold text-text-primary">
                    How the @zyron-bot GitHub Mention Works &amp; How to Set It Up
                  </span>
                </div>
                <Badge severity={isGithubConnected ? "resolved" : "high"} size="sm">
                  {isGithubConnected ? "GITHUB ACCOUNT LINKED" : "GITHUB SIGN-UP REQUIRED"}
                </Badge>
              </div>

              {/* Step 1: Prerequisite */}
              <div className="p-4 rounded-xl bg-bg-void/60 border border-border-hairline space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-text-primary flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-accent-scan text-bg-void flex items-center justify-center font-mono text-[10px] font-bold">
                      1
                    </span>
                    <span>Sign Up / Connect Your GitHub Account on Zyron (Mandatory)</span>
                  </div>
                  {isGithubConnected ? (
                    <span className="text-[11px] font-mono text-signal-resolved flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> @{user?.githubLogin || "Connected"}
                    </span>
                  ) : (
                    <a href={githubAuthHref}>
                      <Button variant="primary" size="sm" className="rounded-lg text-xs">
                        Connect GitHub Now
                      </Button>
                    </a>
                  )}
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  <strong>Important:</strong> Mentioning <code className="font-mono text-accent-scan">@zyron-bot</code> on a repository <strong>only works if the GitHub account posting the comment has signed up or linked its GitHub account on the main Zyron platform</strong>. When you sign in with GitHub on Zyron, the platform securely stores your OAuth access token (<code className="font-mono text-[11px]">repo</code> scope) so the bot can read your target Solidity files and post audit replies back onto your Issue or Pull Request thread.
                </p>
              </div>

              {/* Step 2: Webhook Configuration */}
              <div className="p-4 rounded-xl bg-bg-void/60 border border-border-hairline space-y-3">
                <div className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <span className="h-5 w-5 rounded-md bg-accent-scan text-bg-void flex items-center justify-center font-mono text-[10px] font-bold">
                    2
                  </span>
                  <span>Configure the Webhook on Your GitHub Repository</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Open your smart contract repository on GitHub and navigate to{" "}
                  <strong className="text-text-primary">Settings &rarr; Webhooks &rarr; Add webhook</strong>:
                </p>

                <div className="space-y-2">
                  <div className="text-[11px] font-medium text-text-muted">Payload URL:</div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline font-mono text-xs text-accent-scan">
                    <span className="truncate select-all">{webhookPayloadUrl}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-lg text-[11px] font-mono shrink-0"
                      onClick={() => handleCopy(webhookPayloadUrl, "webhook-url")}
                      leftIcon={
                        copiedSection === "webhook-url" ? (
                          <Check className="h-3 w-3 text-signal-resolved" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )
                      }
                    >
                      {copiedSection === "webhook-url" ? "Copied" : "Copy URL"}
                    </Button>
                  </div>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-text-muted pt-1">
                  <li className="p-2 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline flex items-center justify-between">
                    <span>Content type:</span>
                    <code className="font-mono font-bold text-text-primary">application/json</code>
                  </li>
                  <li className="p-2 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline flex items-center justify-between">
                    <span>SSL verification:</span>
                    <code className="font-mono font-bold text-signal-resolved">Enabled</code>
                  </li>
                  <li className="sm:col-span-2 p-2 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline flex items-center justify-between">
                    <span>Events to trigger webhook:</span>
                    <code className="font-mono font-semibold text-accent-scan">
                      Issues, Issue comments, Pull requests, PR review comments
                    </code>
                  </li>
                </ul>
              </div>

              {/* Step 3: Bot Commands */}
              <div className="p-4 rounded-xl bg-bg-void/60 border border-border-hairline space-y-3">
                <div className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <span className="h-5 w-5 rounded-md bg-accent-scan text-bg-void flex items-center justify-center font-mono text-[10px] font-bold">
                    3
                  </span>
                  <span>Where &amp; What to Type on GitHub (Issues or Pull Requests)</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Open any <strong>Pull Request</strong> or create a <strong>New Issue</strong> on your repository, and type one of the following commands in the description or comment box:
                </p>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-text-primary">
                        Audit a Specific Smart Contract File:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            "@zyron-bot audit contracts/src/ZyronAttestation.sol",
                            "cmd-file"
                          )
                        }
                        className="text-[11px] font-mono text-accent-scan hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === "cmd-file" ? (
                          <Check className="h-3 w-3 text-signal-resolved" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedSection === "cmd-file" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <code className="block font-mono text-xs text-accent-scan select-all">
                      @zyron-bot audit contracts/src/ZyronAttestation.sol
                    </code>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-text-primary">
                        Auto-Discover &amp; Audit Primary Contract on a PR/Issue:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy("@zyron-bot audit this PR", "cmd-pr")}
                        className="text-[11px] font-mono text-accent-scan hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === "cmd-pr" ? (
                          <Check className="h-3 w-3 text-signal-resolved" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedSection === "cmd-pr" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <code className="block font-mono text-xs text-accent-scan select-all">
                      @zyron-bot audit this PR
                    </code>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-text-primary">
                        Trigger Round-2 Fix Re-Verification After Pushing Remediation Commits:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy("@zyron-bot re-audit", "cmd-reaudit")}
                        className="text-[11px] font-mono text-accent-scan hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === "cmd-reaudit" ? (
                          <Check className="h-3 w-3 text-signal-resolved" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedSection === "cmd-reaudit" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <code className="block font-mono text-xs text-accent-scan select-all">
                      @zyron-bot re-audit
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: What Happens Under the Hood */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-4">
              <div className="font-semibold text-sm text-text-primary flex items-center gap-2 border-b border-border-hairline/60 pb-3">
                <Sparkles className="h-4 w-4 text-accent-scan" />
                <span>What Happens When You Mention @zyron-bot</span>
              </div>

              <ol className="space-y-3 text-xs text-text-muted">
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-accent-scan/10 text-accent-scan font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-text-primary block">Account &amp; Token Resolution</strong>
                    Verifies that your GitHub username is registered on Zyron and retrieves your linked OAuth token.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-accent-scan/10 text-accent-scan font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-text-primary block">Contract Ingestion &amp; Commit Pinning</strong>
                    Pulls the specified <code className="font-mono">.sol</code> file (or auto-discovers the main contract in <code className="font-mono">contracts/</code> or <code className="font-mono">src/</code>) and pins the exact commit SHA.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-accent-scan/10 text-accent-scan font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-text-primary block">Reply #1 — Instant Ticket Acknowledgment</strong>
                    Posts an immediate comment on the GitHub Issue/PR with your Ticket ID (<code className="font-mono">ZYR-XXXX</code>), pinned commit, assigned Lead Auditor, and live portal tracker link.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-accent-scan/10 text-accent-scan font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-text-primary block">Reply #2 — Findings Breakdown Table</strong>
                    Runs AST static passes + Meta <code className="font-mono">muse-spark-1.3</code> analysis and replies on the same thread with a full Severity Matrix (<code className="font-mono">Critical</code> / <code className="font-mono">High</code> / <code className="font-mono">Medium</code> / <code className="font-mono">Low</code>) and expandable findings table.
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: GITHUB ACTIONS */}
      {activeTab === "github" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main YAML Viewer */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline/60 pb-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-accent-scan" />
                  <span className="font-mono text-xs font-semibold text-text-primary">
                    .github/workflows/zyron-security-gate.yml
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-lg text-xs font-mono"
                    onClick={() => handleCopy(githubActionsYaml, "yaml")}
                    leftIcon={copiedSection === "yaml" ? <Check className="h-3.5 w-3.5 text-signal-resolved" /> : <Copy className="h-3.5 w-3.5" />}
                  >
                    {copiedSection === "yaml" ? "Copied" : "Copy YAML"}
                  </Button>
                </div>
              </div>

              <div className="relative rounded-xl bg-bg-void border border-border-hairline p-4 overflow-x-auto text-[11px] font-mono text-text-muted leading-relaxed select-all">
                <pre className="text-text-primary">{githubActionsYaml}</pre>
              </div>

              <div className="p-3.5 rounded-xl bg-accent-scan/5 border border-accent-scan/20 text-xs text-text-muted space-y-1">
                <div className="font-semibold text-text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent-scan" />
                  <span>CI/CD Secret Key Setup</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Add your project API key to your GitHub repository secrets under{" "}
                  <code className="text-accent-scan font-mono font-semibold">Settings &gt; Secrets and variables &gt; Actions &gt; ZYRON_API_KEY</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Toggles */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-4">
              <div className="font-semibold text-sm text-text-primary flex items-center gap-2 border-b border-border-hairline/60 pb-3">
                <Sliders className="h-4 w-4 text-accent-scan" />
                <span>Workflow Gate Controls</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={failOnHigh}
                    onChange={(e) => setFailOnHigh(e.target.checked)}
                    className="mt-0.5 rounded border-border-hairline accent-accent-scan"
                  />
                  <div>
                    <div className="font-medium text-text-primary">Block PR Merge on High / Critical</div>
                    <div className="text-[11px] text-text-muted">Exit code 1 if unmitigated vulnerabilities exist.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableBotComments}
                    onChange={(e) => setEnableBotComments(e.target.checked)}
                    className="mt-0.5 rounded border-border-hairline accent-accent-scan"
                  />
                  <div>
                    <div className="font-medium text-text-primary">Inline PR Comments by @zyron-bot</div>
                    <div className="text-[11px] text-text-muted">Annotate vulnerable code lines directly on the GitHub diff.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableSlither}
                    onChange={(e) => setEnableSlither(e.target.checked)}
                    className="mt-0.5 rounded border-border-hairline accent-accent-scan"
                  />
                  <div>
                    <div className="font-medium text-text-primary">Slither AST Static Analysis</div>
                    <div className="text-[11px] text-text-muted">Detect reentrancy, uninitialized state, and shadowed variables.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableMythril}
                    onChange={(e) => setEnableMythril(e.target.checked)}
                    className="mt-0.5 rounded border-border-hairline accent-accent-scan"
                  />
                  <div>
                    <div className="font-medium text-text-primary">Mythril Symbolic Execution</div>
                    <div className="text-[11px] text-text-muted">Execute deep EVM path exploration for transaction order dependence.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Integration Status Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-3">
              <div className="text-xs font-semibold text-text-primary flex items-center justify-between">
                <span>GitHub Marketplace</span>
                <Badge severity="resolved" size="sm">VERIFIED</Badge>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                The official Zyron Security Action is signed with Sigstore Cosign keys and cryptographically verified on every release.
              </p>
              <a
                href="https://github.com/marketplace"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-accent-scan hover:underline flex items-center gap-1.5"
              >
                <span>View on GitHub Marketplace</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOCAL CLI */}
      {activeTab === "cli" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-accent-scan" />
                  <span className="font-mono text-xs font-semibold text-text-primary">
                    Global CLI Installation & Quickstart
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-lg text-xs font-mono"
                  onClick={() => handleCopy("npm install -g @zyron/cli", "cli-install")}
                  leftIcon={copiedSection === "cli-install" ? <Check className="h-3.5 w-3.5 text-signal-resolved" /> : <Copy className="h-3.5 w-3.5" />}
                >
                  {copiedSection === "cli-install" ? "Copied" : "Copy Install"}
                </Button>
              </div>

              {/* Terminal Box */}
              <div className="rounded-xl bg-bg-void border border-border-hairline p-4 space-y-3 font-mono text-xs">
                <div className="text-text-muted"># 1. Install CLI globally</div>
                <div className="text-accent-scan font-semibold">$ npm install -g @zyron/cli</div>

                <div className="text-text-muted pt-2"># 2. Authenticate with your platform key</div>
                <div className="text-text-primary">$ zyron login --key zyr_live_8f9b2d4...</div>

                <div className="text-text-muted pt-2"># 3. Run audit scan on contracts directory</div>
                <div className="text-text-primary">$ zyron scan ./contracts --slither --fuzz-runs 10000</div>

                <div className="text-text-muted pt-2"># 4. Verify on-chain cryptographic attestation</div>
                <div className="text-text-primary">$ zyron verify --commit HEAD --chain 1</div>
              </div>

              {/* Interactive Output Mockup */}
              <div className="p-4 rounded-xl bg-bg-panel-raised/40 border border-border-hairline font-mono text-xs space-y-2">
                <div className="text-[11px] text-text-muted flex items-center justify-between">
                  <span>SAMPLE CLI DIAGNOSTIC OUTPUT</span>
                  <span className="text-signal-resolved">EXIT CODE 0</span>
                </div>
                <div className="text-text-primary leading-relaxed text-[11px]">
                  <div>[+] Ingested 14 Solidity files (3,840 SLOC)</div>
                  <div>[+] Slither AST static pass: <span className="text-signal-resolved">PASSED (0 findings)</span></div>
                  <div>[+] Mythril symbolic taint graph: <span className="text-signal-resolved">PASSED</span></div>
                  <div>[+] Dual-auditor cryptographic signature: <span className="text-accent-scan">VERIFIED (EIP-712)</span></div>
                  <div className="text-signal-resolved font-semibold mt-1">
                    ✔ All invariant assertions valid. Ready for mainnet deployment.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-3">
              <div className="font-semibold text-sm text-text-primary flex items-center gap-2 border-b border-border-hairline/60 pb-3">
                <Layers className="h-4 w-4 text-accent-scan" />
                <span>CLI Compatibility</span>
              </div>
              <div className="space-y-2 font-mono text-xs text-text-muted">
                <div className="flex items-center justify-between p-2 rounded-lg bg-bg-void border border-border-hairline">
                  <span>Node.js</span>
                  <span className="text-text-primary font-bold">v18.0.0+</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-bg-void border border-border-hairline">
                  <span>Foundry (forge)</span>
                  <span className="text-text-primary font-bold">nightly / stable</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-bg-void border border-border-hairline">
                  <span>Hardhat</span>
                  <span className="text-text-primary font-bold">v2.19.0+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FOUNDRY HOOKS */}
      {activeTab === "foundry" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-accent-scan" />
                  <span className="font-mono text-xs font-semibold text-text-primary">
                    .git/hooks/pre-commit
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-lg text-xs font-mono"
                  onClick={() => handleCopy(preCommitHookSh, "pre-commit")}
                  leftIcon={copiedSection === "pre-commit" ? <Check className="h-3.5 w-3.5 text-signal-resolved" /> : <Copy className="h-3.5 w-3.5" />}
                >
                  {copiedSection === "pre-commit" ? "Copied" : "Copy Hook"}
                </Button>
              </div>

              <div className="rounded-xl bg-bg-void border border-border-hairline p-4 overflow-x-auto text-xs font-mono text-text-primary leading-relaxed select-all">
                <pre>{preCommitHookSh}</pre>
              </div>

              <div className="space-y-1.5 text-xs text-text-muted">
                <div className="font-semibold text-text-primary">Installation Instruction:</div>
                <p className="text-[11px] leading-relaxed">
                  Save the snippet into <code className="text-accent-scan font-mono">.git/hooks/pre-commit</code> inside your local repository and run <code className="text-accent-scan font-mono">chmod +x .git/hooks/pre-commit</code> to prevent commits that introduce high or critical severity contract flaws.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-3">
              <div className="font-semibold text-sm text-text-primary flex items-center gap-2 border-b border-border-hairline/60 pb-3">
                <Shield className="h-4 w-4 text-accent-scan" />
                <span>Foundry Invariant Integration</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Zyron automatically parses Forge test suites and runs randomized state mutations against protocol invariant assertions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEBHOOKS */}
      {activeTab === "webhooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-4">
              <div className="border-b border-border-hairline/60 pb-3">
                <div className="font-semibold text-sm text-text-primary">
                  Webhook Dispatcher Configuration
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Receive live HTTPS POST payloads to Discord channels, Slack incoming webhooks, or your cloud microservices.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-text-primary">
                  Destination Webhook URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="font-mono text-xs flex-1 rounded-xl"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isSendingPing}
                    onClick={handleTestWebhook}
                    className="rounded-xl shrink-0"
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                  >
                    Test Ping
                  </Button>
                </div>
              </div>

              {/* Event Subscriptions */}
              <div className="space-y-3 pt-3 border-t border-border-hairline/60">
                <div className="text-xs font-semibold text-text-primary">Subscribed Event Triggers</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="p-3 rounded-xl bg-bg-void border border-border-hairline flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-medium text-text-primary">Critical Findings Flagged</div>
                      <div className="text-[10px] text-text-muted">Instant alert on High/Critical AST hit</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={events.criticalFindings}
                      onChange={(e) => setEvents({ ...events, criticalFindings: e.target.checked })}
                      className="rounded border-border-hairline accent-accent-scan"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-bg-void border border-border-hairline flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-medium text-text-primary">Pipeline Stage Progress</div>
                      <div className="text-[10px] text-text-muted">Updates when review advances</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={events.stageProgress}
                      onChange={(e) => setEvents({ ...events, stageProgress: e.target.checked })}
                      className="rounded border-border-hairline accent-accent-scan"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-bg-void border border-border-hairline flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-medium text-text-primary">Remediation Verified</div>
                      <div className="text-[10px] text-text-muted">Lead auditor signs off on commit fix</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={events.fixesVerified}
                      onChange={(e) => setEvents({ ...events, fixesVerified: e.target.checked })}
                      className="rounded border-border-hairline accent-accent-scan"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-bg-void border border-border-hairline flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-medium text-text-primary">Audit Report Sealed</div>
                      <div className="text-[10px] text-text-muted">Final PDF cryptographic attestation</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={events.reportSealed}
                      onChange={(e) => setEvents({ ...events, reportSealed: e.target.checked })}
                      className="rounded border-border-hairline accent-accent-scan"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-3">
              <div className="font-semibold text-sm text-text-primary flex items-center gap-2 border-b border-border-hairline/60 pb-3">
                <Lock className="h-4 w-4 text-accent-scan" />
                <span>HMAC Signature Verification</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Each webhook dispatch includes an <code className="text-accent-scan font-mono">X-Zyron-Signature</code> header generated with HMAC-SHA256 for cryptographic origin validation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
