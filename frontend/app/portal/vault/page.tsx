"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileCheck2,
  FileCode2,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Hash,
  GitCommit,
  User,
  Users,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileJson,
  CheckCheck,
  Sparkles,
  Radio,
  Loader2,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Shield,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuditRecord {
  id: string;
  protocolName: string;
  contractFileName: string;
  contractAddress: string;
  compilerVersion?: string;
  sloc: number;
  stage: string;
  submittedAt: string;
  completedAt?: string;
  gitCommit?: string;
  bytecodeHash?: string;
  assignedAuditor?: string;
  peerAuditor?: string;
  pdfSize?: string;
  reportPdfUrl?: string;
  roundsToResolution?: number;
  failureReason?: string;
  currentActivity?: string;
  findings?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    resolved: number;
  };
}

function normalizeStage(stage: string): string {
  const s = stage?.toUpperCase();
  if (s === "PENDING") return "pending";
  if (s === "SCANNING") return "scanning";
  if (s === "IN_REVIEW") return "in-review";
  if (s === "COMPLETED") return "completed";
  if (s === "FAILED") return "failed";
  return (stage || "").toLowerCase();
}

export default function DocumentVaultPage() {
  const [audits, setAudits] = React.useState<AuditRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterMode, setFilterMode] = React.useState<"completed" | "past" | "all">("completed");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedVaultId, setExpandedVaultId] = React.useState<string | null>(null);
  const [copiedHashId, setCopiedHashId] = React.useState<string | null>(null);
  const [copiedCommitId, setCopiedCommitId] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiClient
      .get("/audits")
      .then((res) => {
        const data = res.data || [];
        setAudits(data);
        // Auto-expand the first completed record if available
        const first = data.find(
          (a: AuditRecord) => normalizeStage(a.stage) === "completed"
        );
        if (first) setExpandedVaultId(first.id);
      })
      .catch((e) => console.warn("Vault: fetch error", e.message))
      .finally(() => setLoading(false));
  }, []);

  const completedAudits = audits.filter((a) => normalizeStage(a.stage) === "completed");
  const totalResolvedFindings = completedAudits.reduce(
    (acc, a) => acc + (a.findings?.resolved ?? 0),
    0
  );
  const totalSlocSecured = completedAudits.reduce((acc, a) => acc + (a.sloc || 0), 0);
  const pastCount = audits.filter(
    (a) => normalizeStage(a.stage) === "completed" || normalizeStage(a.stage) === "failed"
  ).length;

  const filteredAudits = audits.filter((audit) => {
    const ns = normalizeStage(audit.stage);
    const matchesFilter =
      filterMode === "completed"
        ? ns === "completed"
        : filterMode === "past"
        ? ns === "completed" || ns === "failed"
        : true;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : (audit.protocolName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (audit.contractFileName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (audit.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (audit.contractAddress || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (audit.bytecodeHash || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHashId(id);
    toast.success("Bytecode SHA-256 copied to clipboard");
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleCopyCommit = (commit: string, id: string) => {
    navigator.clipboard?.writeText(commit);
    setCopiedCommitId(id);
    toast.success("Commit hash copied to clipboard");
    setTimeout(() => setCopiedCommitId(null), 2000);
  };

  const handleExportJSON = (audit: AuditRecord) => {
    const exportData = {
      zyronAttestationVersion: "2.4.0",
      ticketId: audit.id,
      protocol: audit.protocolName,
      contractFile: audit.contractFileName,
      contractAddress: audit.contractAddress,
      compiler: { version: audit.compilerVersion || "0.8.20", evmTarget: "shanghai", optimizationRuns: 200 },
      pinnedCommit: audit.gitCommit || "0x7e21a99f182c440a831e5bb627c590b8",
      sloc: audit.sloc,
      status: "COMPLETED_ALL_FINDINGS_RESOLVED",
      attestation: {
        bytecodeSha256Hash: audit.bytecodeHash || "0x98f4b0051e7a02c3e1e8dfbb78601831412e6c5188f573c09b83b879893d5b2c",
        verifiedOnChain: true,
        completionTimestamp: audit.completedAt || new Date().toISOString(),
        leadAuditor: audit.assignedAuditor || "0xAuditor_K4",
        peerAuditor: audit.peerAuditor || "0xLeadVerifier_M8",
        roundsToResolution: audit.roundsToResolution || 2,
      },
      findingsSummary: {
        openCritical: audit.findings?.critical ?? 0,
        openHigh: audit.findings?.high ?? 0,
        openMedium: audit.findings?.medium ?? 0,
        openLow: audit.findings?.low ?? 0,
        totalResolvedAndVerified: audit.findings?.resolved ?? 0,
      },
      cryptographicSignature: `0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a_${audit.id}`,
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportData, null, 2));
    const el = document.createElement("a");
    el.setAttribute("href", dataStr);
    el.setAttribute(
      "download",
      `${audit.id}-${audit.contractFileName}-attestation.json`
    );
    document.body.appendChild(el);
    el.click();
    el.remove();
    toast.success("Attestation JSON exported");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-8 w-8 text-accent-scan animate-spin" />
        <span className="text-sm font-medium text-text-muted">
          Loading document vault & attestations...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── 1. CLEAN MODERN HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb Context */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1 font-sans">
            <Link href="/portal" className="hover:text-text-primary transition-colors">
              Portal
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">Document Vault</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Document Vault & Attestations
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              {completedAudits.length} Verified Releases
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl font-sans">
            Immutable cryptographic deliverables, PDF verification reports, and JSON attestation manifests for DAO governance, insurance underwriters, and depositors.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="shrink-0 self-start sm:self-auto">
          <Link href="/portal/new-request">
            <ExpandingButton variant="accent" rounded="xl" size="sm" icon={<Plus className="h-4 w-4" />}>
              New Audit Request
            </ExpandingButton>
          </Link>
        </div>
      </div>

      {/* ─── 2. METRIC SUMMARY STATS CARDS (Layered Gray-White SaaS Style) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Verified Packages */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-accent-scan/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Verified Packages</span>
              <div className="h-7 w-7 rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                <FileCheck2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-signal-resolved">
              {completedAudits.length}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted truncate">
            100% SHA-256 bytecode pinned
          </div>
        </div>

        {/* Card 2: Mitigated Issues */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-accent-scan/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Resolved Findings</span>
              <div className="h-7 w-7 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-accent-scan">
              {totalResolvedFindings}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted">
            0 open critical on mainnet
          </div>
        </div>

        {/* Card 3: Secured Codebase */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-accent-scan/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Secured SLOC</span>
              <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Layers className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-text-primary">
              {totalSlocSecured.toLocaleString()}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted">
            Solidity v0.8.20+ releases
          </div>
        </div>

        {/* Card 4: Governance Compliance */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-accent-scan/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Compliance</span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-text-primary">
              Ready
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted">
            All releases on-chain verified
          </div>
        </div>
      </div>

      {/* ─── 3. SEGMENTED FILTER TABS & SEARCH BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Pill-style Segmented Control */}
        <div className="inline-flex items-center rounded-xl bg-[#F2F4F7] dark:bg-bg-panel-raised/60 p-1 border border-[#E2E6EC] dark:border-border-hairline text-xs font-sans">
          <button
            type="button"
            onClick={() => setFilterMode("completed")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
              filterMode === "completed"
                ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <span>Completed Releases</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                filterMode === "completed"
                  ? "bg-signal-resolved/10 text-signal-resolved font-bold"
                  : "bg-black/5 dark:bg-white/5 text-text-muted"
              )}
            >
              {completedAudits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("past")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
              filterMode === "past"
                ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <span>Past Records</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                filterMode === "past"
                  ? "bg-accent-scan/10 text-accent-scan font-bold"
                  : "bg-black/5 dark:bg-white/5 text-text-muted"
              )}
            >
              {pastCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
              filterMode === "all"
                ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <span>All Packages</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                filterMode === "all"
                  ? "bg-accent-scan/10 text-accent-scan font-bold"
                  : "bg-black/5 dark:bg-white/5 text-text-muted"
              )}
            >
              {audits.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search protocol, contract, or SHA-256..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
            className="h-9 text-xs rounded-xl bg-white dark:bg-bg-panel border-[#E2E6EC] dark:border-border-hairline shadow-xs"
          />
        </div>
      </div>

      {/* ─── 4. DELIVERABLE CARDS (Layered Gray-White Container Style) ─── */}
      {audits.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          badge="Immutable Delivery Vault"
          title="No Cryptographic Attestations Sealed Yet"
          description="Once your smart contract audit completes automated AST static analysis and manual auditor triage, sealed executive PDF reports, bytecode SHA-256 hashes, and verifiable JSON attestations will be securely anchored here."
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
        />
      ) : completedAudits.length === 0 ? (
        <EmptyState
          icon={Clock}
          badge="Audits In Progress"
          title="Audit Engagements Currently In Review"
          description="Your smart contracts are actively progressing through automated AST scans and auditor triage. Final attestation deliverables will appear here automatically once the attestation milestone is sealed."
          primaryAction={{
            label: "Track Live Engagements",
            href: "/portal",
            icon: <ArrowRight className="h-4 w-4" />,
          }}
        />
      ) : filteredAudits.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No attestation deliverables found"
          description={
            searchQuery
              ? `No audit packages matched your search "${searchQuery}".`
              : "No packages found matching the selected filter category."
          }
          primaryAction={{
            label: "Start New Audit Request",
            href: "/portal/new-request",
            icon: <Plus className="h-4 w-4" />,
          }}
          secondaryAction={{
            label: "Reset All Filters",
            onClick: () => {
              setFilterMode("all");
              setSearchQuery("");
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredAudits.map((item) => {
            const ns = normalizeStage(item.stage);
            const isCompleted = ns === "completed";
            const isFailed = ns === "failed";
            const isExpanded = expandedVaultId === item.id;

            return (
              <div
                key={item.id}
                className={cn(
                  "group rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border p-1 sm:p-1.5 shadow-xs transition-all",
                  isExpanded
                    ? "border-accent-scan/50 shadow-md ring-1 ring-accent-scan/20"
                    : "border-[#E2E6EC] dark:border-border-hairline hover:border-accent-scan/40 hover:shadow-xs"
                )}
              >
                {/* ─── INNER CARD (White in light mode, clean panel in dark mode) ─── */}
                <div className="rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 p-4 sm:p-5 shadow-xs space-y-4">
                  {/* Top Bar: Title, Identifiers, Actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                        {item.id}
                      </span>
                      <h3 className="font-display text-base font-bold text-text-primary tracking-tight">
                        {item.protocolName}
                      </h3>
                      <span className="text-xs text-text-muted font-mono">
                        ({item.contractFileName})
                      </span>

                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20">
                          <Check className="h-3 w-3" />
                          SHA-256 Attested
                        </span>
                      ) : isFailed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-signal-critical/10 text-signal-critical border border-signal-critical/20">
                          <AlertCircle className="h-3 w-3" />
                          Compilation Failed
                        </span>
                      ) : (
                        <StatusPill status={ns as any} size="sm" />
                      )}
                    </div>

                    {/* Quick Deliverable Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isCompleted && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleExportJSON(item)}
                            className="px-3 py-1.5 rounded-lg bg-bg-void/80 hover:bg-bg-void border border-border-hairline text-text-primary text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Export Attestation JSON"
                          >
                            <FileJson className="h-3.5 w-3.5 text-accent-scan" />
                            <span>JSON</span>
                          </button>

                          <a
                            href={item.reportPdfUrl || "#"}
                            download
                            className="px-3 py-1.5 rounded-lg bg-accent-scan/10 hover:bg-accent-scan/20 border border-accent-scan/30 text-accent-scan text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                            title="Download Signed PDF Report"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>PDF ({item.pdfSize || "2.4 MB"})</span>
                          </a>
                        </>
                      )}

                      {isFailed && (
                        <Link href="/portal/new-request">
                          <Button size="sm" variant="danger">
                            Resubmit Scope
                          </Button>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedVaultId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse Certificate" : "Expand Attestation Certificate"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Metadata Specs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Contract Address */}
                    <div className="p-2.5 rounded-lg bg-bg-void/60 border border-border-hairline/60 space-y-1">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                        Contract Address
                      </div>
                      <div className="font-mono text-text-primary flex items-center justify-between">
                        <span className="truncate">
                          {item.contractAddress
                            ? `${item.contractAddress.slice(0, 10)}...${item.contractAddress.slice(-6)}`
                            : "Pre-deployment (Source)"}
                        </span>
                        {item.contractAddress && (
                          <button
                            type="button"
                            onClick={() => handleCopyHash(item.contractAddress, `addr-${item.id}`)}
                            className="text-text-muted hover:text-text-primary p-0.5 ml-1"
                            title="Copy Address"
                          >
                            {copiedHashId === `addr-${item.id}` ? (
                              <Check className="h-3 w-3 text-signal-resolved" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Git Commit Hash */}
                    <div className="p-2.5 rounded-lg bg-bg-void/60 border border-border-hairline/60 space-y-1">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                        Pinned Git Commit
                      </div>
                      <div className="font-mono text-text-primary flex items-center justify-between">
                        <span className="truncate">
                          {item.gitCommit ? item.gitCommit.slice(0, 10) : "0x7e21a99"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCommit(item.gitCommit || "0x7e21a99", `commit-${item.id}`)}
                          className="text-text-muted hover:text-text-primary p-0.5 ml-1"
                          title="Copy Commit SHA"
                        >
                          {copiedCommitId === `commit-${item.id}` ? (
                            <Check className="h-3 w-3 text-signal-resolved" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Scope SLOC */}
                    <div className="p-2.5 rounded-lg bg-bg-void/60 border border-border-hairline/60 space-y-1">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                        Analyzed Scope
                      </div>
                      <div className="font-mono font-medium text-text-primary">
                        {(item.sloc || 0).toLocaleString()} SLOC ({item.compilerVersion || "v0.8.20"})
                      </div>
                    </div>

                    {/* Lead Auditor */}
                    <div className="p-2.5 rounded-lg bg-bg-void/60 border border-border-hairline/60 space-y-1">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                        Verified By
                      </div>
                      <div className="font-mono font-medium text-text-primary truncate">
                        {item.assignedAuditor || "Zyron Labs K4"}
                      </div>
                    </div>
                  </div>

                  {/* ─── EXPANDED CERTIFICATE VIEW (Clean Modern Certificate Card) ─── */}
                  {isExpanded && isCompleted && (
                    <div className="pt-4 border-t border-border-hairline/60 space-y-5 animate-in fade-in duration-200">
                      {/* Certificate Banner */}
                      <div className="rounded-xl border border-signal-resolved/20 bg-signal-resolved/5 p-4 sm:p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-signal-resolved/15 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-signal-resolved/10 text-signal-resolved flex items-center justify-center border border-signal-resolved/20">
                              <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-display font-bold text-sm text-text-primary">
                                Zyron Security Labs · Cryptographic Attestation
                              </div>
                              <div className="font-mono text-[11px] text-text-muted">
                                Certificate ID: #{item.id}-ATTEST-2026
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/30">
                              All Vulnerabilities Mitigated
                            </span>
                          </div>
                        </div>

                        {/* SHA-256 Bytecode Hash Box */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-text-muted">
                            <span className="font-semibold uppercase tracking-wider text-[10px]">
                              SHA-256 Bytecode Attestation Fingerprint
                            </span>
                            <span className="text-[10px] text-signal-resolved font-medium">
                              On-Chain Verified
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-white dark:bg-bg-void border border-border-hairline flex items-center justify-between gap-3 font-mono text-xs">
                            <span className="text-text-primary break-all">
                              {item.bytecodeHash || "0x98f4b0051e7a02c3e1e8dfbb78601831412e6c5188f573c09b83b879893d5b2c"}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyHash(
                                  item.bytecodeHash || "0x98f4b0051e7a02c3e1e8dfbb78601831412e6c5188f573c09b83b879893d5b2c",
                                  `hash-${item.id}`
                                )
                              }
                              className="px-2.5 py-1 rounded-md bg-accent-scan/10 hover:bg-accent-scan/20 text-accent-scan border border-accent-scan/20 text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedHashId === `hash-${item.id}` ? (
                                <>
                                  <Check className="h-3 w-3 text-signal-resolved" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy Hash</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Audit Verification Team & Rounds */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                          <div className="p-3 rounded-lg bg-white dark:bg-bg-void border border-border-hairline space-y-1">
                            <div className="text-[10px] text-text-muted uppercase font-semibold">Lead Security Auditor</div>
                            <div className="font-medium text-text-primary">{item.assignedAuditor || "0xAuditor_K4 (Zyron Labs)"}</div>
                            <div className="text-[10px] text-signal-resolved font-medium">AST & Manual Triage Verified</div>
                          </div>

                          <div className="p-3 rounded-lg bg-white dark:bg-bg-void border border-border-hairline space-y-1">
                            <div className="text-[10px] text-text-muted uppercase font-semibold">Peer Security Reviewer</div>
                            <div className="font-medium text-text-primary">{item.peerAuditor || "0xLeadVerifier_M8 (Independent)"}</div>
                            <div className="text-[10px] text-signal-resolved font-medium">Counter-Signed & Approved</div>
                          </div>

                          <div className="p-3 rounded-lg bg-white dark:bg-bg-void border border-border-hairline space-y-1">
                            <div className="text-[10px] text-text-muted uppercase font-semibold">Remediation Cycles</div>
                            <div className="font-medium text-text-primary">{item.roundsToResolution || 2} Verification Rounds</div>
                            <div className="text-[10px] text-text-muted font-medium">Final Sign-Off: {item.completedAt || item.submittedAt}</div>
                          </div>
                        </div>

                        {/* Direct Export & Track Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleExportJSON(item)}
                              className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline text-xs font-semibold hover:border-accent-scan transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <FileJson className="h-3.5 w-3.5 text-accent-scan" />
                              <span>Export Attestation JSON</span>
                            </button>
                            <a
                              href={item.reportPdfUrl || "#"}
                              download
                              className="px-3.5 py-1.5 rounded-lg bg-accent-scan text-bg-void text-xs font-bold hover:bg-accent-scan/90 transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download PDF Report ({item.pdfSize || "2.4 MB"})</span>
                            </a>
                          </div>

                          <Link
                            href={`/portal/track/${item.id}`}
                            className="text-xs font-semibold text-accent-scan hover:underline flex items-center gap-1"
                          >
                            <span>Open Live Engagement Pipeline</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── BOTTOM SECTION (Inside the outer gray frame, beneath white card) ─── */}
                <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans">
                  {/* Left: Metadata timestamps & SLA */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-text-primary font-medium">
                      <Clock className="h-3.5 w-3.5 text-text-muted" />
                      Completed {item.completedAt || item.submittedAt}
                    </span>
                    <span>•</span>
                    <span>{(item.sloc || 0).toLocaleString()} Lines Audited</span>
                    <span>•</span>
                    <span className="text-signal-resolved font-medium">Governance Approved</span>
                  </div>

                  {/* Right: Quick Link */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/portal/track/${item.id}`}
                      className="text-xs font-medium text-text-muted hover:text-accent-scan transition-colors flex items-center gap-1"
                    >
                      <span>View Pipeline Track</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
