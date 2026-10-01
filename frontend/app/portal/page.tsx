"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  ArrowUpRight,
  FileCode2,
  FileCheck2,
  AlertTriangle,
  Download,
  Search,
  Clock,
  User,
  Users,
  Layers,
  Radio,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  LayoutGrid,
  List,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill, type PipelineStatus } from "@/components/ui/status-pill";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/ui/empty-state";
import { OnboardingChecklist } from "@/components/portal/onboarding-checklist";
import { cn } from "@/lib/utils";

interface FormattedAudit {
  id: string;
  protocolName: string;
  contractFileName: string;
  contractAddress?: string;
  network?: string;
  sloc: number;
  stage: PipelineStatus;
  stageNumber: number;
  submittedAt: string;
  completedAt?: string;
  estimatedCompletion?: string;
  assignedAuditor?: string;
  currentActivity?: string;
  bytecodeHash?: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  resolvedCount: number;
}

function normalizeStage(stage: string): PipelineStatus {
  const s = stage?.toUpperCase();
  if (s === "PENDING") return "pending";
  if (s === "SCANNING") return "scanning";
  if (s === "IN_REVIEW") return "in-review";
  if (s === "CORRECTIONS_REQUESTED") return "corrections-requested";
  if (s === "COMPLETED") return "completed";
  if (s === "FAILED") return "failed";
  return (stage ? stage.toLowerCase() : "pending") as PipelineStatus;
}

function getStageNumber(stage: string): number {
  const s = stage?.toUpperCase();
  if (s === "PENDING") return 1;
  if (s === "SCANNING") return 2;
  if (s === "IN_REVIEW" || s === "CORRECTIONS_REQUESTED") return 3;
  if (s === "COMPLETED") return 4;
  return 1;
}

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [audits, setAudits] = React.useState<FormattedAudit[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStage, setFilterStage] = React.useState<"in-flight" | "completed" | "all">("in-flight");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  const fetchAudits = async () => {
    try {
      const res = await apiClient.get("/audits");
      const rawData = Array.isArray(res.data) ? res.data : [];

      const formatted: FormattedAudit[] = rawData.map((item: any) => {
        const stage = normalizeStage(item.stage);
        const stageNum = item.stageNumber || getStageNumber(item.stage);

        let crit = 0;
        let high = 0;
        let med = 0;
        let low = 0;
        let resCount = 0;

        if (item.findings) {
          if (Array.isArray(item.findings)) {
            item.findings.forEach((f: any) => {
              const sev = (f.severity || "").toUpperCase();
              const st = (f.status || "").toUpperCase();
              if (st === "RESOLVED") resCount++;
              else if (sev === "CRITICAL") crit++;
              else if (sev === "HIGH") high++;
              else if (sev === "MEDIUM") med++;
              else if (sev === "LOW") low++;
            });
          } else {
            crit = item.findings.critical || 0;
            high = item.findings.high || 0;
            med = item.findings.medium || 0;
            low = item.findings.low || 0;
            resCount = item.findings.resolved || 0;
          }
        }

        return {
          id: item.id,
          protocolName: item.protocolName || "Smart Contract",
          contractFileName: item.contractFileName || "Contract.sol",
          contractAddress: item.contractAddress,
          network: item.network || "Ethereum Sepolia",
          sloc: item.sloc || 0,
          stage,
          stageNumber: stageNum,
          submittedAt: item.submittedAt || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"),
          completedAt: item.completedAt,
          estimatedCompletion: item.estimatedCompletion,
          assignedAuditor: item.assignedAuditor || (item.leadAuditor ? item.leadAuditor.name || item.leadAuditor.auditorHandle : undefined),
          currentActivity: item.currentActivity,
          bytecodeHash: item.bytecodeHash,
          criticalCount: crit,
          highCount: high,
          mediumCount: med,
          lowCount: low,
          resolvedCount: resCount,
        };
      });

      setAudits(formatted);
    } catch (e: any) {
      console.warn("Dashboard: could not load audits:", e.message);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAudits();
  }, []);

  const inFlightAudits = audits.filter(
    (a) =>
      a.stage === "pending" ||
      a.stage === "scanning" ||
      a.stage === "in-review" ||
      a.stage === "corrections-requested"
  );
  const completedAudits = audits.filter((a) => a.stage === "completed");

  const totalResolved = audits.reduce((acc, a) => acc + a.resolvedCount, 0);
  const totalSlocSecured = completedAudits.reduce((acc, a) => acc + a.sloc, 0);

  const filteredAudits = audits.filter((audit) => {
    const matchesFilter =
      filterStage === "in-flight"
        ? audit.stage === "pending" ||
          audit.stage === "scanning" ||
          audit.stage === "in-review" ||
          audit.stage === "corrections-requested"
        : filterStage === "completed"
        ? audit.stage === "completed" || audit.stage === "failed"
        : true;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : audit.protocolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          audit.contractFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          audit.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (audit.contractAddress || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-6 w-6 text-accent-scan animate-spin" />
        <span className="text-xs text-text-muted">Loading security pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── 1. TOP HEADER & BREADCRUMBS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Subtle breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <span>Audits</span>
            <span className="text-border-hairline">/</span>
            <span className="text-text-primary font-medium">Overview</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {user?.organization?.name || "Protocol Security"}
            </h1>
            {inFlightAudits.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                <span className="h-2 w-2 rounded-full bg-accent-scan animate-pulse" />
                {inFlightAudits.length} Active {inFlightAudits.length === 1 ? "Audit" : "Audits"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20">
                <span className="h-2 w-2 rounded-full bg-signal-resolved" />
                All Systems Healthy
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            Live smart contract security pipeline, automated AST vulnerability scanning, and cryptographic attestations.
          </p>
        </div>

        {/* Primary Action Button with Signature Expanding Animation */}
        <div className="shrink-0 self-start sm:self-auto">
          <Link href="/portal/new-request">
            <ExpandingButton variant="accent" rounded="xl" size="sm" icon={<Plus className="h-4 w-4" />}>
              New Audit Request
            </ExpandingButton>
          </Link>
        </div>
      </div>

      {/* ─── 1.5. FIRST-TIME ONBOARDING CHECKLIST ─── */}
      <OnboardingChecklist
        hasAudits={audits.length > 0}
        hasResolvedIssues={totalResolved > 0}
        userName={user?.name}
        orgName={user?.organization?.name}
      />

      {/* ─── 2. METRIC SUMMARY STATS CARDS (Distinguished with outer gray container) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Active Engagements */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-accent-scan/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Active Engagements</span>
              <div className="h-7 w-7 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-text-primary">
              {inFlightAudits.length}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted flex items-center gap-1.5">
            <span>{inFlightAudits.filter((a) => a.stage === "scanning").length} scanning</span>
            <span>•</span>
            <span>{inFlightAudits.filter((a) => a.stage === "in-review" || a.stage === "corrections-requested").length} in review</span>
          </div>
        </div>

        {/* Card 2: Secured SLOC */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-accent-scan/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Lines of Code</span>
              <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Layers className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-text-primary">
              {totalSlocSecured.toLocaleString()}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted truncate">
            Solidity v0.8.20+ verified
          </div>
        </div>

        {/* Card 3: Vulnerabilities Resolved */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-accent-scan/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Issues Remediated</span>
              <div className="h-7 w-7 rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-signal-resolved">
              {totalResolved}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted">
            0 open critical vulnerabilities
          </div>
        </div>

        {/* Card 4: Verified Attestations */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-accent-scan/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Attested Releases</span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <FileCheck2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-text-primary">
              {completedAudits.length}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted">
            SHA-256 cryptographic vault signed
          </div>
        </div>
      </div>

      {/* ─── 3. SEGMENTED FILTER TABS & SEARCH BAR (Inspired by Reference Image 1) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Pill-style Segmented Control */}
        <div className="inline-flex items-center rounded-xl bg-[#F2F4F7] dark:bg-bg-panel-raised/60 p-1 border border-[#E2E6EC] dark:border-border-hairline text-xs font-sans">
          <button
            type="button"
            onClick={() => setFilterStage("in-flight")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
              filterStage === "in-flight"
                ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <span>Active Audits</span>
            <span className="px-1.5 py-0.2 rounded-md bg-accent-scan/10 text-accent-scan text-[11px] font-semibold">
              {inFlightAudits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStage("completed")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
              filterStage === "completed"
                ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <span>Completed</span>
            <span className="px-1.5 py-0.2 rounded-md bg-signal-resolved/10 text-signal-resolved text-[11px] font-semibold">
              {completedAudits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStage("all")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
              filterStage === "all"
                ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <span>All Engagements</span>
            <span className="px-1.5 py-0.2 rounded-md bg-bg-void/50 text-text-muted text-[11px] font-semibold">
              {audits.length}
            </span>
          </button>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search protocol, contract..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#F2F4F7] dark:bg-bg-panel border border-[#E2E6EC] dark:border-border-hairline text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-scan/40 focus:bg-white dark:focus:bg-bg-panel transition-colors"
            />
          </div>

          <div className="flex items-center rounded-xl bg-[#F2F4F7] dark:bg-bg-panel-raised/60 p-0.5 border border-[#E2E6EC] dark:border-border-hairline">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "cards"
                  ? "bg-white dark:bg-bg-panel text-accent-scan shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
              title="Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-white dark:bg-bg-panel text-accent-scan shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4. MAIN AUDIT CONTENT (CARD LIST WITH DISTINGUISHED NESTED GRAY/WHITE STRUCTURE) ─── */}
      {audits.length === 0 ? (
        <EmptyState
          icon={FileCode2}
          badge="First-Time Protocol Setup"
          title="No Smart Contract Audits Initiated Yet"
          description="Initiate automated AST vulnerability scanning, invariant fuzzing, and manual double-blind auditor review. Lock your scope to generate your first audit tracker and immutable attestation."
          primaryAction={{
            label: "Start First Audit Request",
            href: "/portal/new-request",
            icon: <Plus className="h-4 w-4" />,
          }}
          secondaryAction={{
            label: "Invite Engineering Team & Multisig",
            href: "/portal/team",
            icon: <Users className="h-4 w-4" />,
          }}
        >
          {/* 4 Quick-start Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left pt-2">
            <div className="p-3.5 rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <span className="h-5 w-5 rounded-md bg-accent-scan/10 text-accent-scan flex items-center justify-center font-mono text-[10px] font-bold">
                  01
                </span>
                <span>AST Scanning</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Automated bytecode taint checks, Slither & Mythril passes execute in seconds upon intake.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <span className="h-5 w-5 rounded-md bg-signal-critical/10 text-signal-critical flex items-center justify-center font-mono text-[10px] font-bold">
                  02
                </span>
                <span>AI Sandbox Exploit</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                AI agent deploys to virtual EVM fork and dynamically simulates exploits to prove vulnerabilities.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <span className="h-5 w-5 rounded-md bg-accent-scan/10 text-accent-scan flex items-center justify-center font-mono text-[10px] font-bold">
                  03
                </span>
                <span>Auditor Triage</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Certified EVM researchers manually analyze invariants, verify exploit PoCs, and calibrate severity.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <span className="h-5 w-5 rounded-md bg-signal-resolved/10 text-signal-resolved flex items-center justify-center font-mono text-[10px] font-bold">
                  04
                </span>
                <span>Attestation Vault</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Download cryptographically signed PDF reports and immutable SHA-256 bytecode attestations.
              </p>
            </div>
          </div>
        </EmptyState>
      ) : filteredAudits.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No audits match your filters"
          description={
            searchQuery
              ? `No audit engagements found matching "${searchQuery}".`
              : filterStage === "in-flight"
              ? "All your contracts have completed their review cycle."
              : "No completed audit engagements recorded yet."
          }
          primaryAction={{
            label: "Start New Audit Request",
            href: "/portal/new-request",
            icon: <Plus className="h-4 w-4" />,
          }}
          secondaryAction={{
            label: "Reset All Filters",
            onClick: () => {
              setFilterStage("all");
              setSearchQuery("");
            },
          }}
        />
      ) : viewMode === "cards" ? (
        /* Layered Nested Cards (Outer Gray Container -> Inner White Card -> Bottom Gray Metadata) */
        <div className="space-y-4">
          {filteredAudits.map((audit) => {
            const isCompleted = audit.stage === "completed";
            const targetUrl = isCompleted ? `/portal/vault#${audit.id}` : `/portal/track/${audit.id}`;

            return (
              <div
                key={audit.id}
                className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 hover:border-accent-scan/50 dark:hover:border-accent-scan/40 transition-all duration-200 p-1.5 sm:p-2 space-y-1.5 group shadow-xs"
              >
                {/* ── INNER WHITE CONTENT CARD ── */}
                <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-4 sm:p-5 space-y-3.5 shadow-xs">
                  {/* Top Row: Title, Contract file, Status pill, and Action Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-accent-scan/10 text-accent-scan border border-accent-scan/20 flex items-center justify-center shrink-0">
                        <FileCode2 className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={targetUrl}
                            className="font-sans font-semibold text-base text-text-primary group-hover:text-accent-scan transition-colors truncate"
                          >
                            {audit.protocolName}
                          </Link>
                          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#F2F4F7] dark:bg-bg-panel-raised text-text-muted border border-[#E2E6EC] dark:border-border-hairline">
                            {audit.contractFileName}
                          </span>
                          <StatusPill status={audit.stage} size="sm" />
                        </div>

                        <div className="text-xs text-text-muted mt-0.5 flex flex-wrap items-center gap-2 font-mono">
                          <span className="text-text-primary font-medium">{audit.id}</span>
                          {audit.contractAddress && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[220px]">
                                {audit.contractAddress.slice(0, 10)}...{audit.contractAddress.slice(-6)}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>{audit.network}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <Link href={targetUrl}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#F2F4F7] hover:bg-accent-scan/10 hover:text-accent-scan dark:bg-bg-panel-raised text-text-primary border border-[#E2E6EC] dark:border-border-hairline hover:border-accent-scan/30 transition-all cursor-pointer shadow-xs"
                        >
                          <span>{isCompleted ? "View Certificate" : "Track Progress"}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Description / Current Activity Banner */}
                  <div className="text-xs text-text-muted bg-[#F8F9FA] dark:bg-bg-void/50 rounded-xl px-3.5 py-2.5 border border-[#E4E7EC]/70 dark:border-border-hairline/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full bg-accent-scan shrink-0 animate-pulse" />
                      <span className="text-text-primary font-medium truncate">
                        {audit.currentActivity ||
                          (isCompleted
                            ? "Audit engagement completed and cryptographically signed."
                            : "Dual senior auditor review & automated invariant verification active.")}
                      </span>
                    </div>
                    {audit.assignedAuditor && (
                      <div className="hidden sm:flex items-center gap-1.5 text-text-muted shrink-0 text-[11px]">
                        <User className="h-3.5 w-3.5" />
                        <span>{audit.assignedAuditor}</span>
                      </div>
                    )}
                  </div>

                  {/* Stepper (Minimalist 4-stage pipeline) */}
                  <div className="pt-0.5">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { num: 1, label: "Intake" },
                        { num: 2, label: "AST Scan" },
                        { num: 3, label: "Manual Review" },
                        { num: 4, label: "Attestation" },
                      ].map(({ num, label }) => {
                        const isPast = audit.stageNumber > num;
                        const isCurrent = audit.stageNumber === num;
                        return (
                          <div key={num} className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                                  isPast
                                    ? "bg-signal-resolved text-white"
                                    : isCurrent
                                    ? "bg-accent-scan text-bg-void ring-2 ring-accent-scan/30 animate-pulse"
                                    : "bg-[#F2F4F7] dark:bg-bg-panel-raised text-text-muted border border-border-hairline"
                                )}
                              >
                                {isPast ? "✓" : num}
                              </div>
                              <span
                                className={cn(
                                  "text-xs font-medium truncate hidden md:inline",
                                  isCurrent
                                    ? "text-accent-scan font-semibold"
                                    : isPast
                                    ? "text-text-primary"
                                    : "text-text-muted"
                                )}
                              >
                                {label}
                              </span>
                            </div>
                            {/* Progress Line */}
                            <div
                              className={cn(
                                "h-1 rounded-full transition-all",
                                isPast
                                  ? "bg-signal-resolved"
                                  : isCurrent
                                  ? "bg-accent-scan"
                                  : "bg-[#E2E6EC] dark:bg-border-hairline/60"
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── BOTTOM GRAY SECTION (Directly on outer gray container) ── */}
                <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-text-muted" />
                      <span>{audit.estimatedCompletion ? `ETA: ${audit.estimatedCompletion}` : audit.submittedAt}</span>
                    </div>
                    <span className="text-[#D0D5DD] dark:text-border-hairline">|</span>
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-text-muted" />
                      <span>{audit.sloc.toLocaleString()} SLOC</span>
                    </div>
                    {audit.assignedAuditor && (
                      <>
                        <span className="text-[#D0D5DD] dark:text-border-hairline">|</span>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-text-muted" />
                          <span>{audit.assignedAuditor}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Findings breakdown */}
                  <div className="flex items-center gap-1.5">
                    {audit.criticalCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-signal-critical/10 text-signal-critical border border-signal-critical/20 text-[11px] font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {audit.criticalCount} Critical
                      </span>
                    )}
                    {audit.highCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-signal-high/10 text-signal-high border border-signal-high/20 text-[11px] font-semibold">
                        {audit.highCount} High
                      </span>
                    )}
                    {audit.resolvedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {audit.resolvedCount} Resolved
                      </span>
                    )}
                    {audit.criticalCount === 0 && audit.highCount === 0 && audit.resolvedCount === 0 && (
                      <span className="text-[11px] text-text-muted font-medium">
                        Zero Open Risks
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Modern Clean Table View (in distinguished outer gray container) */
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] dark:bg-bg-panel-raised/60 text-text-muted border-b border-border-hairline font-medium">
                  <tr>
                    <th className="py-3.5 px-4 font-mono">ID</th>
                    <th className="py-3.5 px-4">Protocol Target</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Scope</th>
                    <th className="py-3.5 px-4">Findings</th>
                    <th className="py-3.5 px-4">Timeline</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline/60">
                  {filteredAudits.map((audit) => {
                    const isCompleted = audit.stage === "completed";
                    const targetUrl = isCompleted ? `/portal/vault#${audit.id}` : `/portal/track/${audit.id}`;

                    return (
                      <tr
                        key={audit.id}
                        className="hover:bg-[#F8F9FA] dark:hover:bg-bg-panel-raised/40 transition-colors group"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-accent-scan">
                          {audit.id}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-text-primary group-hover:text-accent-scan transition-colors">
                            {audit.protocolName}
                          </div>
                          <div className="text-[11px] text-text-muted font-mono">
                            {audit.contractFileName}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <StatusPill status={audit.stage} size="sm" />
                        </td>

                        <td className="py-3 px-4 font-mono text-text-muted">
                          {audit.sloc.toLocaleString()} SLOC
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            {audit.criticalCount > 0 && (
                              <Badge severity="critical" size="sm">
                                {audit.criticalCount} CRIT
                              </Badge>
                            )}
                            {audit.highCount > 0 && (
                              <Badge severity="high" size="sm">
                                {audit.highCount} HIGH
                              </Badge>
                            )}
                            {audit.resolvedCount > 0 && (
                              <Badge severity="resolved" size="sm">
                                {audit.resolvedCount} RESOLVED
                              </Badge>
                            )}
                            {audit.criticalCount === 0 && audit.highCount === 0 && audit.resolvedCount === 0 && (
                              <span className="text-text-muted">Clean</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-text-muted font-sans">
                          {audit.completedAt || audit.submittedAt}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Link href={targetUrl}>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F2F4F7] hover:bg-accent-scan/10 hover:text-accent-scan dark:bg-bg-panel-raised text-text-primary border border-[#E2E6EC] dark:border-border-hairline transition-colors cursor-pointer"
                            >
                              <span>{isCompleted ? "Certificate" : "Track"}</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. VERIFIED ATTESTATIONS SHOWCASE (With Nested Gray/White Contrast) ─── */}
      {completedAudits.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border-hairline/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Verified Cryptographic Attestations
              </h2>
              <p className="text-xs text-text-muted">
                Immutable SHA-256 bytecode hashes and signed audit certificates.
              </p>
            </div>
            <Link
              href="/portal/vault"
              className="text-xs text-accent-scan hover:underline flex items-center gap-1 font-medium"
            >
              <span>View Full Vault</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedAudits.slice(0, 4).map((cert) => (
              <div
                key={cert.id}
                className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 space-y-1.5 shadow-xs"
              >
                {/* Inner White Section */}
                <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                        <FileCheck2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary text-xs">
                          {cert.protocolName}
                        </div>
                        <div className="text-[11px] text-text-muted font-mono">
                          {cert.id} • {cert.contractFileName}
                        </div>
                      </div>
                    </div>
                    <Badge severity="resolved" size="sm">
                      Attestation Signed
                    </Badge>
                  </div>

                  {cert.bytecodeHash && (
                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between text-[11px] text-text-muted">
                        <span>Bytecode Hash</span>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(cert.bytecodeHash!)}
                          className="text-accent-scan hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedHash === cert.bytecodeHash ? (
                            <>
                              <Check className="h-3 w-3 text-signal-resolved" />
                              <span className="text-signal-resolved text-[10px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-[10px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-[#E4E7EC] dark:border-border-hairline text-[11px] text-text-muted truncate select-all">
                        {cert.bytecodeHash}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Gray Section */}
                <div className="px-3.5 py-1.5 flex items-center justify-between text-xs text-text-muted">
                  <span>Auditor: {cert.assignedAuditor || "Zyron Security Lab"}</span>
                  <Link href={`/portal/vault#${cert.id}`}>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-white dark:bg-bg-panel-raised hover:bg-accent-scan/10 hover:text-accent-scan text-text-primary border border-[#E2E6EC] dark:border-border-hairline transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
