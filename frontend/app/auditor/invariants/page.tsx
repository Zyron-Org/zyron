"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  Cpu,
  Clock,
  Sparkles,
  Check,
  Search,
  Zap,
  Shield,
  FileCode2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InvariantProof {
  id: string;
  name: string;
  targetScope: string;
  category: "Solvency" | "Access Control" | "Reentrancy" | "Oracle Bounds";
  fuzzRuns: number;
  status: "passed" | "running" | "failed";
  runtimeMs: number;
  assertionSnippet: string;
  description: string;
}

export default function InvariantProofSuitePage() {
  const [isRunningAll, setIsRunningAll] = React.useState(false);
  const [fuzzRunMultiplier, setFuzzRunMultiplier] = React.useState("10000");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  const [invariants, setInvariants] = React.useState<InvariantProof[]>([
    {
      id: "INV-PROOF-01",
      name: "Invariant: Vault Collateral Solvency Guarantee",
      targetScope: "VaultCore.sol::userBalances",
      category: "Solvency",
      fuzzRuns: 10000,
      status: "passed",
      runtimeMs: 1420,
      assertionSnippet: "assertEq(address(vault).balance, sumUserBalances(allUsers));",
      description: "Asserts that total ETH & ERC-20 assets locked inside the contract strictly match the ledger sum across 10,000 randomized state actions.",
    },
    {
      id: "INV-PROOF-02",
      name: "Invariant: Non-Reentrant Checks-Effects Ordering",
      targetScope: "VaultCore.sol::withdrawAll",
      category: "Reentrancy",
      fuzzRuns: 10000,
      status: "passed",
      runtimeMs: 880,
      assertionSnippet: "assertEq(vault.reentrancyGuardState(), GUARD_UNLOCKED_OR_ZEROED);",
      description: "Asserts that external low-level transfer callbacks cannot re-enter deposit or withdraw state before caller balances are wiped.",
    },
    {
      id: "INV-PROOF-03",
      name: "Invariant: Oracle Timestamp Max Delay Bound",
      targetScope: "CollateralVault.sol::latestRoundData",
      category: "Oracle Bounds",
      fuzzRuns: 10000,
      status: "passed",
      runtimeMs: 640,
      assertionSnippet: "assertTrue(block.timestamp - updatedAt <= MAX_ORACLE_DELAY);",
      description: "Asserts that oracle price data older than 3,600s or containing zero price reverts immediately prior to liquidation evaluation.",
    },
    {
      id: "INV-PROOF-04",
      name: "Invariant: Strategy Router Whitelist Boundary",
      targetScope: "StrategyRouter.sol::executeRebalance",
      category: "Access Control",
      fuzzRuns: 10000,
      status: "passed",
      runtimeMs: 910,
      assertionSnippet: "assertTrue(approvedStrategies[strategy] && msg.sender == owner);",
      description: "Fuzz tests randomized delegatecall targets to guarantee execution is strictly constrained to DAO-approved strategy contracts.",
    },
  ]);

  const handleRunAll = () => {
    setIsRunningAll(true);
    setInvariants((prev) => prev.map((inv) => ({ ...inv, status: "running" })));
    toast.info(`Executing formal state invariant fuzz suite across ${invariants.length} targets...`);

    setTimeout(() => {
      setIsRunningAll(false);
      setInvariants((prev) =>
        prev.map((inv) => ({
          ...inv,
          status: "passed",
          fuzzRuns: Number(fuzzRunMultiplier) || 10000,
          runtimeMs: Math.floor(600 + Math.random() * 800),
        }))
      );
      toast.success("All 4 Formal Invariant Proofs Passed! Zero state drift detected.");
    }, 1800);
  };

  const handleRunSingle = (id: string) => {
    setInvariants((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "running" } : inv))
    );
    setTimeout(() => {
      setInvariants((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? { ...inv, status: "passed", fuzzRuns: Number(fuzzRunMultiplier) || 10000 }
            : inv
        )
      );
      toast.success(`Proof ${id} re-verified successfully!`);
    }, 1200);
  };

  const totalRuns = invariants.reduce((acc, curr) => acc + curr.fuzzRuns, 0);

  const filteredInvariants = invariants.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      inv.id.toLowerCase().includes(q) ||
      inv.name.toLowerCase().includes(q) ||
      inv.targetScope.toLowerCase().includes(q) ||
      inv.description.toLowerCase().includes(q);
    const matchesCat = categoryFilter === "all" || inv.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* ─── 1. TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
            <span>Auditor Workspace</span>
            <span>/</span>
            <span className="text-text-primary font-medium">Formal Invariants</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Foundry Formal Invariant Proof Suite
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
              <Zap className="h-3.5 w-3.5" />
              State Machine Fuzzer
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-3xl">
            Property-based fuzz testing and symbolic invariant assertions executed across target contract methods to mathematically disprove exploit sequences.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <ExpandingButton
            variant="accent"
            rounded="xl"
            size="md"
            disabled={isRunningAll}
            onClick={handleRunAll}
            icon={isRunningAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          >
            {isRunningAll ? "Fuzzing State Graph..." : "Run All Invariant Proofs"}
          </ExpandingButton>
        </div>
      </div>

      {/* ─── 2. METRIC SUMMARY STATS CARDS (4 Layered SaaS Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invariants */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Total Invariants</span>
              <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {invariants.length} Registered
              </div>
              <p className="text-[11px] text-text-muted">Formal state assertions</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Pass Rate</span>
            <span className="font-semibold text-signal-resolved font-mono">100% Passing</span>
          </div>
        </div>

        {/* Fuzz Runs */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Total Fuzz Runs</span>
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 font-mono">
                {totalRuns.toLocaleString()}
              </div>
              <p className="text-[11px] text-text-muted">Randomized call sequences</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>State Depth</span>
            <span className="font-semibold text-sky-600 dark:text-sky-400">128 Call Stacks</span>
          </div>
        </div>

        {/* Invariant Coverage */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Proof Categories</span>
              <div className="h-8 w-8 rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-signal-resolved">
                4 Vectors
              </div>
              <p className="text-[11px] text-text-muted">Solvency · Reentrancy · Oracle</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Security Model</span>
            <span className="font-semibold text-signal-resolved">Dual Formal Check</span>
          </div>
        </div>

        {/* Execution Speed */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Avg. Runtime</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary font-mono">
                960 ms
              </div>
              <p className="text-[11px] text-text-muted">EVM bytecode execution</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Engine Speed</span>
            <span className="font-semibold text-accent-scan">Hardware Native</span>
          </div>
        </div>
      </div>

      {/* ─── 3. FILTER TABS & FUZZ RUN MULTIPLIER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F2F4F7] dark:bg-bg-void/60 p-2 rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 shadow-xs">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 shadow-xs">
          {["all", "Solvency", "Reentrancy", "Oracle Bounds", "Access Control"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 capitalize",
                categoryFilter === cat
                  ? "bg-accent-scan text-white shadow-xs"
                  : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
              )}
            >
              {cat === "all" ? `All Proofs (${invariants.length})` : cat}
            </button>
          ))}
        </div>

        {/* Fuzz Multiplier & Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium bg-white dark:bg-bg-panel px-3 py-1.5 rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60">
            <span>Runs:</span>
            <select
              value={fuzzRunMultiplier}
              onChange={(e) => setFuzzRunMultiplier(e.target.value)}
              className="bg-transparent font-bold text-accent-scan font-mono focus:outline-none cursor-pointer"
            >
              <option value="5000">5,000</option>
              <option value="10000">10,000</option>
              <option value="50000">50,000</option>
              <option value="100000">100,000</option>
            </select>
          </div>

          <div className="w-full sm:w-64">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invariant proof..."
              prefix={<Search className="h-4 w-4 text-text-muted" />}
              className="text-xs bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60"
            />
          </div>
        </div>
      </div>

      {/* ─── 4. INVARIANT PROOFS LIST (Layered SaaS Cards) ─── */}
      <div className="space-y-4">
        {filteredInvariants.map((inv) => {
          const isRunning = inv.status === "running";

          return (
            <div
              key={inv.id}
              className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs transition-all hover:border-[#D0D5DD]"
            >
              {/* Inner White Card */}
              <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-hairline/60 pb-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-accent-scan bg-accent-scan/10 px-2.5 py-0.5 rounded-md border border-accent-scan/20">
                        {inv.id}
                      </span>

                      <h3 className="font-display text-base font-bold text-text-primary tracking-tight">
                        {inv.name}
                      </h3>

                      <Badge severity="informational" size="sm">
                        {inv.category}
                      </Badge>

                      {inv.status === "passed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20">
                          <Check className="h-3 w-3 stroke-[3]" />
                          PASSED ({inv.fuzzRuns.toLocaleString()} Runs)
                        </span>
                      ) : isRunning ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                          <span className="h-2 w-2 rounded-full bg-accent-scan animate-pulse" />
                          FUZZING ACTIVE
                        </span>
                      ) : (
                        <Badge severity="critical" size="sm">
                          COUNTEREXAMPLE FOUND
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed">
                      {inv.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                    <Button
                      variant="secondary"
                      size="md"
                      className="rounded-xl"
                      isLoading={isRunning}
                      disabled={isRunning}
                      onClick={() => handleRunSingle(inv.id)}
                      leftIcon={<Play className="h-3.5 w-3.5" />}
                    >
                      {isRunning ? "Testing..." : "Re-Fuzz Target"}
                    </Button>
                  </div>
                </div>

                {/* Assertion Snippet Terminal */}
                <div className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#262B33] text-xs font-mono text-[#E8EAED] space-y-1">
                  <div className="text-[10px] text-[#8B93A1] uppercase tracking-wider flex items-center justify-between">
                    <span>FORMAL ASSERTION SPECIFICATION</span>
                    <span className="text-accent-scan">Solidity / Foundry</span>
                  </div>
                  <div className="text-signal-resolved font-semibold text-xs overflow-x-auto py-0.5">
                    {inv.assertionSnippet}
                  </div>
                </div>
              </div>

              {/* Bottom Gray Area Strip */}
              <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans rounded-b-2xl">
                <div className="flex items-center gap-3">
                  <span>
                    Target: <strong className="font-mono text-text-primary">{inv.targetScope}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Runtime: <strong className="font-mono text-text-primary">{inv.runtimeMs} ms</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-signal-resolved font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>State Invariant Preserved</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
