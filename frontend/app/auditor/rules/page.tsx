"use client";

import * as React from "react";
import Link from "next/link";
import {
  Cpu,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sliders,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Info,
  Layers,
  ArrowLeft,
  Shield,
  ShieldCheck,
  Zap,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AstRule {
  id: string;
  name: string;
  swcId: string;
  severity: "critical" | "high" | "medium" | "low";
  stage: string;
  confidence: number;
  description: string;
  astPattern: string;
  enabled: boolean;
}

export default function AstTaintRulesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSeverity, setSelectedSeverity] = React.useState<string>("all");

  const [rules, setRules] = React.useState<AstRule[]>([
    {
      id: "AST-PASS-01",
      name: "Reentrancy Call Graph Taint Analysis",
      swcId: "SWC-107",
      severity: "critical",
      stage: "Symbolic EVM Flow",
      confidence: 96,
      description: "Detects low-level external calls (`.call`, `.transfer`, `.send`) executing prior to internal state storage variable mutations.",
      astPattern: "FunctionCall[member='call'] -> StateVariableWrite",
      enabled: true,
    },
    {
      id: "AST-PASS-02",
      name: "Unchecked ERC-20 Return Value Check",
      swcId: "SWC-104",
      severity: "high",
      stage: "Static AST Pass",
      confidence: 94,
      description: "Flags direct `IERC20.transfer` or `transferFrom` calls without SafeERC20 wrapper or boolean return verification.",
      astPattern: "MemberAccess[name='transfer'] != SafeERC20.safeTransfer",
      enabled: true,
    },
    {
      id: "AST-PASS-03",
      name: "Unprotected Delegatecall / Selfdestruct Taint",
      swcId: "SWC-106",
      severity: "critical",
      stage: "Bytecode CFG",
      confidence: 99,
      description: "Identifies arbitrary user-controlled target addresses passed into `delegatecall` opcodes without access control modifier.",
      astPattern: "DelegateCallOpcode[!onlyOwner && !hasRole]",
      enabled: true,
    },
    {
      id: "AST-PASS-04",
      name: "Oracle Staleness & Min/Max Deviation Bounds",
      swcId: "SWC-114",
      severity: "high",
      stage: "Semantic Analysis",
      confidence: 89,
      description: "Validates that `latestRoundData()` consumes `updatedAt` and verifies `answeredInRound >= roundId` and non-zero prices.",
      astPattern: "AggregatorV3Interface.latestRoundData() -> MissingStalenessCheck",
      enabled: true,
    },
    {
      id: "AST-PASS-05",
      name: "Missing Zero-Address Parameter Guard",
      swcId: "SWC-105",
      severity: "medium",
      stage: "Static AST Pass",
      confidence: 91,
      description: "Flags constructor or setter functions accepting storage address pointers without `require(addr != address(0))` validation.",
      astPattern: "Assignment[StorageVariable, address] -> NoZeroCheck",
      enabled: true,
    },
    {
      id: "AST-PASS-06",
      name: "Read-Only Reentrancy across Curve/Uniswap Balances",
      swcId: "SWC-107-B",
      severity: "high",
      stage: "Cross-Contract Graph",
      confidence: 87,
      description: "Checks whether protocol queries external pool `get_virtual_price()` or `balanceOf()` during un-synced intermediate reentrant callback states.",
      astPattern: "ExternalViewCall[Curve/UniV2] -> StateComputation",
      enabled: true,
    },
    {
      id: "AST-PASS-07",
      name: "Block Timestamp Manipulation Drift",
      swcId: "SWC-116",
      severity: "low",
      stage: "Static AST Pass",
      confidence: 72,
      description: "Warns if `block.timestamp` is used for critical lottery randomness or tight deadline bounds under 15 seconds.",
      astPattern: "Identifier[block.timestamp] in RandomnessOrShortLock",
      enabled: true,
    },
    {
      id: "AST-PASS-08",
      name: "Strict Balance Equality Flaw (`address.balance == X`)",
      swcId: "SWC-132",
      severity: "medium",
      stage: "Static AST Pass",
      confidence: 95,
      description: "Flags contract logic depending on exact `address(this).balance == expectedAmount`, vulnerable to forced ETH injection via `selfdestruct`.",
      astPattern: "BinaryOperation[EQ, MemberAccess[balance]]",
      enabled: true,
    },
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextState = !r.enabled;
          toast.info(`Analyzer ${r.swcId} (${r.name}) ${nextState ? "Enabled" : "Disabled"}.`);
          return { ...r, enabled: nextState };
        }
        return r;
      })
    );
  };

  const filteredRules = rules.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(q) ||
      r.swcId.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q);
    const matchesSev = selectedSeverity === "all" || r.severity === selectedSeverity;
    return matchesSearch && matchesSev;
  });

  const enabledCount = rules.filter((r) => r.enabled).length;
  const criticalCount = rules.filter((r) => r.severity === "critical").length;
  const avgConfidence = Math.round(
    rules.reduce((acc, curr) => acc + curr.confidence, 0) / rules.length
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* ─── 1. TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
            <span>Auditor Workspace</span>
            <span>/</span>
            <span className="text-text-primary font-medium">AST Rule Catalog</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Automated AST Taint & Pattern Analyzers
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
              <Cpu className="h-3.5 w-3.5" />
              14 Static & Symbolic Passes
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-3xl">
            Configure AST taint evaluation rules, SWC vulnerability taxonomy bindings, and symbolic execution heuristics for automated contract scans.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Badge severity="resolved" size="sm">
            {enabledCount} of {rules.length} Passes Active
          </Badge>
          <Badge severity="informational" size="sm">
            EVM Bytecode V3 Engine
          </Badge>
        </div>
      </div>

      {/* ─── 2. METRIC SUMMARY STATS CARDS (4 Layered SaaS Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Passes */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Active Analyzers</span>
              <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {enabledCount} / {rules.length}
              </div>
              <p className="text-[11px] text-text-muted">Active in ingestion pipeline</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Pass Status</span>
            <span className="font-semibold text-accent-scan font-mono">100% Operational</span>
          </div>
        </div>

        {/* Avg Confidence */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Avg. Confidence</span>
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 font-mono">
                {avgConfidence}%
              </div>
              <p className="text-[11px] text-text-muted">Zero false-positive target</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Precision Tier</span>
            <span className="font-semibold text-sky-600 dark:text-sky-400">High Assurance</span>
          </div>
        </div>

        {/* Critical Vector Rules */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Critical Passes</span>
              <div className="h-8 w-8 rounded-lg bg-signal-critical/10 text-signal-critical flex items-center justify-center">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-signal-critical">
                {criticalCount} P0 Rules
              </div>
              <p className="text-[11px] text-text-muted">Reentrancy & Delegatecall</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Exploit Severity</span>
            <span className="font-semibold text-signal-critical">Immediate Revert</span>
          </div>
        </div>

        {/* Deterministic CFG */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">AST Depth</span>
              <div className="h-8 w-8 rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-signal-resolved">
                Full AST
              </div>
              <p className="text-[11px] text-text-muted">CFG + Data Flow Taint</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Deterministic</span>
            <span className="font-semibold text-signal-resolved">Compiler Bound</span>
          </div>
        </div>
      </div>

      {/* ─── 3. FILTER TABS & SEARCH BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F2F4F7] dark:bg-bg-void/60 p-2 rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 shadow-xs">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 shadow-xs">
          {["all", "critical", "high", "medium", "low"].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSelectedSeverity(sev)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 uppercase",
                selectedSeverity === sev
                  ? "bg-accent-scan text-white shadow-xs"
                  : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
              )}
            >
              {sev === "all" ? `All Passes (${rules.length})` : sev}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rule ID, SWC, pattern..."
            prefix={<Search className="h-4 w-4 text-text-muted" />}
            className="text-xs bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60"
          />
        </div>
      </div>

      {/* ─── 4. RULES LIST (Layered SaaS Cards) ─── */}
      <div className="space-y-4">
        {filteredRules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={cn(
                "rounded-2xl border transition-all p-1.5 sm:p-2 shadow-xs",
                rule.enabled
                  ? "border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60"
                  : "border-border-hairline/50 bg-[#F8F9FA] dark:bg-bg-void/30 opacity-75"
              )}
            >
              {/* Inner White Card */}
              <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-hairline/60 pb-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-accent-scan bg-accent-scan/10 px-2.5 py-0.5 rounded-md border border-accent-scan/20">
                        {rule.id}
                      </span>

                      <span className="font-mono text-xs font-semibold text-text-muted bg-[#F2F4F7] dark:bg-bg-void px-2 py-0.5 rounded border border-border-hairline">
                        {rule.swcId}
                      </span>

                      <Badge severity={rule.severity} size="sm">
                        {rule.severity.toUpperCase()}
                      </Badge>

                      <span className="text-xs text-text-muted">
                        Stage: <strong className="text-text-primary">{rule.stage}</strong>
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-text-primary tracking-tight">
                      {rule.name}
                    </h3>

                    <p className="text-xs text-text-muted leading-relaxed max-w-4xl">
                      {rule.description}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                    <button
                      type="button"
                      onClick={() => toggleRule(rule.id)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs",
                        rule.enabled
                          ? "bg-signal-resolved/10 text-signal-resolved border-signal-resolved/30 hover:bg-signal-resolved/15"
                          : "bg-text-muted/10 text-text-muted border-border-hairline hover:bg-text-muted/20"
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          rule.enabled ? "bg-signal-resolved" : "bg-text-muted"
                        )}
                      />
                      <span>{rule.enabled ? "Enabled" : "Disabled"}</span>
                    </button>
                  </div>
                </div>

                {/* AST Pattern Block */}
                <div className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#262B33] text-xs font-mono text-[#E8EAED] space-y-1">
                  <div className="text-[10px] text-[#8B93A1] uppercase tracking-wider flex items-center justify-between">
                    <span>AST SYNTAX MATCH PATTERN</span>
                    <span className="text-accent-scan">EVM AST Query</span>
                  </div>
                  <div className="text-[#5EC8FF] font-semibold text-xs overflow-x-auto py-0.5">
                    {rule.astPattern}
                  </div>
                </div>
              </div>

              {/* Bottom Gray Area Strip */}
              <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans rounded-b-2xl">
                <div className="flex items-center gap-3">
                  <span>
                    Confidence Score: <strong className="font-mono text-text-primary">{rule.confidence}%</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Taint Vector: <strong className="text-text-primary">Deterministic AST CFG</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-signal-resolved">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Rule Verified in Zyron Test Suite</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
