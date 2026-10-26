"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  GitCommit,
  Send,
  AlertTriangle,
  FileCode,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Radio,
  Loader2,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Lock,
  Code2,
  Check,
  Sparkles,
  Users,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api-client";
import { FindingCodeViewer } from "@/components/finding-code-viewer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CommentMessage {
  id: string;
  sender: string;
  senderRole: "auditor" | "client";
  timestamp: string;
  message: string;
  commitRef?: string;
}

interface AggregatedFinding {
  id: string;
  displayId: string;
  ticketId: string;
  protocolName: string;
  contractFileName: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  cvss: string;
  status: "open" | "fix-submitted" | "resolved" | "wont-fix";
  taxonomy: string;
  location: string;
  impact: string;
  description: string;
  vulnerableCode?: string;
  vulnerableLines?: string;
  remediatedCode?: string;
  sourceCode?: string;
  fuzzTestStatus?: string;
  fundsDrainedEth?: number;
  remediationNote?: string;
  foundBy?: string;
  traceSteps?: string;
  synthesizedPoC?: string;
  falsePositive?: boolean;
  comments: CommentMessage[];
}

import { FoundByBadge } from "@/components/found-by-badge";
import { EvmTraceStepper } from "@/components/evm-trace-stepper";

export default function OpenFindingsPage() {
  const [filterStatus, setFilterStatus] = React.useState<"all" | "open" | "fix-submitted">("all");
  const [filterSeverity, setFilterSeverity] = React.useState<string>("all");
  const [filterTicket, setFilterTicket] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedFindingId, setExpandedFindingId] = React.useState<string | null>(null);

  // Comments / inquiries state
  const [inquiryInputs, setInquiryInputs] = React.useState<Record<string, string>>({});
  const [submittingInquiry, setSubmittingInquiry] = React.useState<Record<string, boolean>>({});

  // Fix re-verification state
  const [commitInputs, setCommitInputs] = React.useState<Record<string, { commitSha: string; summary: string }>>({});
  const [submittingFix, setSubmittingFix] = React.useState<Record<string, boolean>>({});

  // Real data state
  const [findings, setFindings] = React.useState<AggregatedFinding[]>([]);
  const [audits, setAudits] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch real audits and findings from backend
  const fetchAuditsAndFindings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/audits");
      const fetchedAudits: any[] = Array.isArray(res.data) ? res.data : [];
      setAudits(fetchedAudits);

      const aggregated: AggregatedFinding[] = [];
      fetchedAudits.forEach((audit) => {
        if (Array.isArray(audit.findings)) {
          audit.findings.forEach((f: any) => {
            const rawStatus = (f.status || "OPEN").toUpperCase();
            const statusMapped =
              rawStatus === "FIX_SUBMITTED"
                ? "fix-submitted"
                : rawStatus === "RESOLVED"
                ? "resolved"
                : "open";

            aggregated.push({
              id: f.id,
              displayId: f.displayId || f.id,
              ticketId: audit.id,
              protocolName: audit.protocolName || audit.contractFileName || "Protocol",
              contractFileName: audit.contractFileName || "Contract.sol",
              title: f.title || "Vulnerability Finding",
              severity: (f.severity || "medium").toLowerCase() as any,
              cvss: f.cvss || (f.cvssScore ? `CVSS ${f.cvssScore}` : "CVSS 7.5"),
              status: statusMapped,
              taxonomy: f.taxonomy || "SWC-107 · Reentrancy",
              location: f.location || `${audit.contractFileName || "Contract.sol"}:1`,
              impact: f.impact || "POTENTIAL EXPLOIT RISK",
              description: f.description || "",
              vulnerableCode: f.vulnerableCode || undefined,
              vulnerableLines: f.vulnerableLines || undefined,
              remediatedCode: f.remediatedCode || undefined,
              sourceCode: audit.sourceCode || undefined,
              fuzzTestStatus: f.fuzzTestStatus || undefined,
              fundsDrainedEth: typeof f.fundsDrainedEth === "number" ? f.fundsDrainedEth : 0,
              traceSteps: f.traceSteps || undefined,
              synthesizedPoC: f.synthesizedPoC || undefined,
              remediationNote: f.remediationNote || undefined,
              foundBy: (f.foundBy || (f.ruleId?.startsWith("ZYRON-AI") ? "AI" : (f.ruleId ? "STATIC" : "MANUAL"))).toUpperCase(),
              comments: Array.isArray(f.comments)
                ? f.comments.map((c: any) => ({
                    id: c.id,
                    sender: c.sender?.name || c.sender?.email || "Auditor",
                    senderRole: c.sender?.role?.toLowerCase() === "auditor" ? "auditor" : "client",
                    timestamp: c.createdAt
                      ? new Date(c.createdAt).toISOString().replace("T", " ").substring(0, 16) + " UTC"
                      : new Date().toISOString(),
                    message: c.message,
                    commitRef: c.commitRef,
                  }))
                : [],
            });
          });
        }
      });

      setFindings(aggregated);
      if (aggregated.length > 0 && !expandedFindingId) {
        setExpandedFindingId(aggregated[0].id);
      }
    } catch (err: any) {
      console.warn("Failed to fetch audits & findings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAuditsAndFindings();
  }, []);

  // 1. Send normal comment / inquiry (does NOT trigger re-verification)
  const handleSendInquiry = async (findingId: string) => {
    const message = inquiryInputs[findingId]?.trim();
    if (!message) return;

    try {
      setSubmittingInquiry((prev) => ({ ...prev, [findingId]: true }));
      const res = await apiClient.post(`/findings/${findingId}/comments`, {
        message,
      });

      const newComment: CommentMessage = {
        id: res.data?.id || `c-${Date.now()}`,
        sender: res.data?.sender?.name || res.data?.sender?.email || "You",
        senderRole: res.data?.sender?.role?.toLowerCase() === "auditor" ? "auditor" : "client",
        timestamp: new Date(res.data?.createdAt || Date.now()).toISOString().replace("T", " ").substring(0, 16) + " UTC",
        message: res.data?.message || message,
      };

      setFindings((prev) =>
        prev.map((f) => {
          if (f.id === findingId) {
            return {
              ...f,
              comments: [...f.comments, newComment],
            };
          }
          return f;
        })
      );

      setInquiryInputs((prev) => ({ ...prev, [findingId]: "" }));
      toast.success("Comment sent to auditor thread");
    } catch (err: any) {
      console.error("Failed to post inquiry:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to post comment";
      toast.error(`Comment Error: ${msg}`);
    } finally {
      setSubmittingInquiry((prev) => ({ ...prev, [findingId]: false }));
    }
  };

  // 2. Submit remediation commit for re-verification
  const handleSubmitFix = async (findingId: string) => {
    const input = commitInputs[findingId];
    const commitSha = input?.commitSha?.trim().replace(/^0x/, "");
    if (!commitSha) {
      toast.error("Please enter a valid Commit SHA for the remediation fix");
      return;
    }

    const fixSummary = input?.summary?.trim() || `Remediation fix committed in ${commitSha}`;

    try {
      setSubmittingFix((prev) => ({ ...prev, [findingId]: true }));
      const res = await apiClient.post(`/findings/${findingId}/comments`, {
        message: fixSummary,
        commitRef: commitSha,
      });

      const newComment: CommentMessage = {
        id: res.data?.id || `c-${Date.now()}`,
        sender: res.data?.sender?.name || res.data?.sender?.email || "You",
        senderRole: res.data?.sender?.role?.toLowerCase() === "auditor" ? "auditor" : "client",
        timestamp: new Date(res.data?.createdAt || Date.now()).toISOString().replace("T", " ").substring(0, 16) + " UTC",
        message: res.data?.message || fixSummary,
        commitRef: res.data?.commitRef || commitSha,
      };

      setFindings((prev) =>
        prev.map((f) => {
          if (f.id === findingId) {
            return {
              ...f,
              status: "fix-submitted",
              comments: [...f.comments, newComment],
            };
          }
          return f;
        })
      );

      setCommitInputs((prev) => ({
        ...prev,
        [findingId]: { commitSha: "", summary: "" },
      }));

      toast.success("Fix submitted! Finding queued for auditor re-verification.");
    } catch (err: any) {
      console.error("Failed to submit fix:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to submit fix";
      toast.error(`Submission Error: ${msg}`);
    } finally {
      setSubmittingFix((prev) => ({ ...prev, [findingId]: false }));
    }
  };

  // Filtered list
  const filteredFindings = findings.filter((f) => {
    const matchesStatus =
      filterStatus === "all" ? true : f.status === filterStatus;

    const matchesSeverity =
      filterSeverity === "all" ? true : f.severity === filterSeverity;

    const matchesTicket =
      filterTicket === "all" ? true : f.ticketId === filterTicket;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.taxonomy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.protocolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSeverity && matchesTicket && matchesSearch;
  });

  const openFindings = findings.filter((f) => !f.falsePositive && f.status !== "resolved" && f.status !== "wont-fix");
  const openCriticalFindings = findings.filter((f) => !f.falsePositive && f.severity === "critical" && f.status !== "resolved" && f.status !== "wont-fix");
  const openHighFindings = findings.filter((f) => !f.falsePositive && f.severity === "high" && f.status !== "resolved" && f.status !== "wont-fix");
  const criticalCount = openCriticalFindings.length;
  const highCount = openHighFindings.length;
  const resolvedCount = findings.filter((f) => f.status === "resolved").length;
  const fixSubmittedCount = findings.filter((f) => f.status === "fix-submitted").length;
  const activeTickets = Array.from(new Set(findings.map((f) => f.ticketId)));
  const allFindingsResolved = findings.length > 0 && openFindings.length === 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-8 w-8 text-accent-scan animate-spin" />
        <span className="text-sm font-medium text-text-muted">
          Loading findings & remediation queue...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── 1. CLEAN MODERN HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1 font-sans">
            <Link href="/portal" className="hover:text-text-primary transition-colors">
              Portal
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">Open Findings</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Open Findings & Remediation
            </h1>
            {criticalCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-signal-critical/10 text-signal-critical border border-signal-critical/20">
                <ShieldAlert className="h-3.5 w-3.5" />
                {criticalCount} Critical {criticalCount === 1 ? "Issue" : "Issues"}
              </span>
            ) : allFindingsResolved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All Remediations Verified ✓
              </span>
            ) : findings.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                {findings.length} Active Items
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Zero Open Findings
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl font-sans">
            Aggregated vulnerability register across in-flight audits. Discuss findings with assigned lead auditors and submit fix commit hashes for re-verification.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Link href="/portal/vault">
            <Button variant="secondary" size="sm" className="rounded-xl">
              Document Vault
            </Button>
          </Link>
          <Link href="/portal/new-request">
            <ExpandingButton variant="accent" rounded="xl" size="sm" icon={<Plus className="h-4 w-4" />}>
              New Request
            </ExpandingButton>
          </Link>
        </div>
      </div>

      {/* ─── 2. METRIC SUMMARY STATS CARDS (Layered Gray-White SaaS Style) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Critical (P0) */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-signal-critical/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Open Critical</span>
              <div className="h-7 w-7 rounded-lg bg-signal-critical/10 text-signal-critical flex items-center justify-center">
                <ShieldAlert className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-signal-critical">
              {criticalCount}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted truncate">
            {criticalCount > 0 ? "Highest severity priority" : "Zero open critical issues"}
          </div>
        </div>

        {/* Card 2: High (P1) */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-signal-high/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Open High</span>
              <div className="h-7 w-7 rounded-lg bg-signal-high/10 text-signal-high flex items-center justify-center">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-signal-high">
              {highCount}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted">
            {highCount > 0 ? "Requires mitigation before launch" : "Zero open high issues"}
          </div>
        </div>

        {/* Card 3: Fix Submitted */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-accent-scan/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Fixes Submitted</span>
              <div className="h-7 w-7 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <GitCommit className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-accent-scan">
              {fixSubmittedCount}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted">
            Awaiting auditor re-verification
          </div>
        </div>

        {/* Card 4: Active Engagement Scopes */}
        <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs transition-all hover:border-accent-scan/40">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium text-text-primary">Active Tickets</span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Layers className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-text-primary">
              {activeTickets.length}
            </div>
          </div>
          <div className="px-3.5 py-2 text-xs text-text-muted truncate">
            {activeTickets.length > 0 ? activeTickets.join(" · ") : "All targets clear"}
          </div>
        </div>
      </div>

      {/* ─── 3. SEGMENTED FILTER TABS & SEARCH CONTROLS ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Pill-style Segmented Status Control */}
        <div className="inline-flex items-center rounded-xl bg-[#F2F4F7] dark:bg-bg-panel-raised/60 p-1 border border-[#E2E6EC] dark:border-border-hairline text-xs font-sans">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
              filterStatus === "all"
                ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <span>All Items</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                filterStatus === "all"
                  ? "bg-accent-scan/10 text-accent-scan font-bold"
                  : "bg-black/5 dark:bg-white/5 text-text-muted"
              )}
            >
              {findings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("open")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
              filterStatus === "open"
                ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <span>Open Only</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                filterStatus === "open"
                  ? "bg-signal-critical/10 text-signal-critical font-bold"
                  : "bg-black/5 dark:bg-white/5 text-text-muted"
              )}
            >
              {findings.filter((f) => f.status === "open").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("fix-submitted")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
              filterStatus === "fix-submitted"
                ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <span>Fix Submitted</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                filterStatus === "fix-submitted"
                  ? "bg-accent-scan/10 text-accent-scan font-bold"
                  : "bg-black/5 dark:bg-white/5 text-text-muted"
              )}
            >
              {fixSubmittedCount}
            </span>
          </button>
        </div>

        {/* Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ticket Scope Selector */}
          <select
            value={filterTicket}
            onChange={(e) => setFilterTicket(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-[#E2E6EC] dark:border-border-hairline text-xs font-medium text-text-primary focus:outline-none shadow-xs"
          >
            <option value="all">All Engagement Scopes</option>
            {audits.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} · {a.protocolName || a.contractFileName || "Contract"}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-[#E2E6EC] dark:border-border-hairline text-xs font-medium text-text-primary focus:outline-none shadow-xs"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (P0)</option>
            <option value="high">High (P1)</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Search Input */}
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search finding, SWC, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
              className="h-9 text-xs rounded-xl bg-white dark:bg-bg-panel border-[#E2E6EC] dark:border-border-hairline shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* ─── 4. FINDING CARDS (Layered Gray-White Container Style) ─── */}
      {audits.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          badge="First-Time Protocol Setup"
          title="No Security Findings Recorded Yet"
          description="Once you submit your smart contracts for intake, automated AST static analysis, invariant fuzzing, and manual auditor triage findings will populate here in real time."
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
      ) : findings.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          badge="Clean Security Bill of Health"
          title="Zero Vulnerability Findings Detected"
          description="All contracts within your audited scopes have passed automated AST passes and manual triage without open critical, high, or medium severity issues."
          primaryAction={{
            label: "View Attestation Vault",
            href: "/portal/vault",
            icon: <ArrowRight className="h-4 w-4" />,
          }}
        />
      ) : filteredFindings.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No findings match your criteria"
          description={
            searchQuery || filterSeverity !== "all" || filterTicket !== "all" || filterStatus !== "all"
              ? "No findings found matching the current search query or filter selection."
              : "All flagged vulnerabilities have been mitigated and verified by the auditing team."
          }
          primaryAction={{
            label: "View All Resolved in Vault",
            href: "/portal/vault",
            icon: <ArrowRight className="h-4 w-4" />,
          }}
          secondaryAction={{
            label: "Reset All Filters",
            onClick: () => {
              setFilterStatus("all");
              setFilterSeverity("all");
              setFilterTicket("all");
              setSearchQuery("");
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredFindings.map((finding) => {
            const isExpanded = expandedFindingId === finding.id;
            const isFixSubmitted = finding.status === "fix-submitted";
            const isResolved = finding.status === "resolved";

            return (
              <div
                key={finding.id}
                className={cn(
                  "group rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border p-1 sm:p-1.5 shadow-xs transition-all",
                  isExpanded
                    ? "border-accent-scan/50 shadow-md ring-1 ring-accent-scan/20"
                    : "border-[#E2E6EC] dark:border-border-hairline hover:border-accent-scan/40 hover:shadow-xs"
                )}
              >
                {/* ─── INNER CARD (White in light mode, clean panel in dark mode) ─── */}
                <div className="rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 p-4 sm:p-5 shadow-xs space-y-4">
                  {/* Top Row: Severity, Title, ID, Status, Expand Trigger */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Severity Pill */}
                      <Badge
                        severity={finding.severity}
                        size="sm"
                        className="uppercase tracking-wider font-bold text-[10px] px-2 py-0.5"
                      >
                        {finding.severity}
                      </Badge>

                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-text-muted">
                        {finding.displayId}
                      </span>

                      <FoundByBadge foundBy={finding.foundBy} />

                      <h3 className="font-display text-base font-bold text-text-primary tracking-tight">
                        {finding.title}
                      </h3>

                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-black/5 dark:bg-white/5 text-text-muted">
                        {finding.cvss}
                      </span>

                      {/* Status indicator */}
                      {isFixSubmitted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent-scan animate-pulse" />
                          Fix Submitted
                        </span>
                      ) : isResolved ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20">
                          <Check className="h-3 w-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-signal-critical/10 text-signal-critical border border-signal-critical/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-signal-critical" />
                          Open
                        </span>
                      )}
                    </div>

                    {/* Expand/Collapse Action */}
                    <button
                      type="button"
                      onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                      className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer self-end md:self-auto shrink-0"
                    >
                      <span>{isExpanded ? "Collapse" : "Review & Remediate"}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Taxonomy & Location Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-bg-void/70 border border-border-hairline text-text-primary font-mono text-[11px]">
                      <Lock className="h-3 w-3 text-text-muted" />
                      {finding.taxonomy}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-bg-void/70 border border-border-hairline text-text-primary font-mono text-[11px]">
                      <Code2 className="h-3 w-3 text-text-muted" />
                      {finding.location}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-signal-critical/10 border border-signal-critical/25 text-signal-critical font-mono text-[11px]">
                      <Terminal className="h-3 w-3" />
                      Virtual Sandbox PoC Verified
                    </span>

                    <span className="text-text-muted font-sans text-xs">
                      Impact: <span className="text-text-primary font-medium">{finding.impact}</span>
                    </span>
                  </div>

                  {/* Description Excerpt when collapsed */}
                  {!isExpanded && finding.description && (
                    <p className="text-xs text-text-muted font-sans line-clamp-2 leading-relaxed">
                      {finding.description}
                    </p>
                  )}

                  {/* ─── EXPANDED CONTENT: Full Details, Code Viewer, Remediation & Discussion ─── */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-border-hairline/60 space-y-6 animate-in fade-in duration-200">
                      {/* Autonomous AI Prover & Virtual EVM Sandbox Stepper */}
                      <div className="space-y-2">
                        <EvmTraceStepper
                          findingId={finding.id}
                          title={finding.title}
                          findingSeverity={finding.severity}
                          verdict={finding.fuzzTestStatus || (finding.falsePositive ? "PROVEN_FALSE_POSITIVE" : undefined)}
                          fundsDrainedEth={finding.fundsDrainedEth ?? 0}
                          traceSteps={finding.traceSteps}
                          synthesizedPoC={finding.synthesizedPoC}
                          showAgentFlow={false}
                        />
                      </div>

                      {/* Description & Impact Box */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
                          Vulnerability Description & Impact
                        </div>
                        <div className="p-4 rounded-xl bg-bg-void/60 border border-border-hairline/60 text-xs text-text-primary leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                          {finding.description || "Detailed vulnerability analysis provided by AST ingestion pass."}
                        </div>
                      </div>

                      {/* Code Snippet Viewer */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold uppercase tracking-wider text-text-muted">
                            Code Context & Exploit Location
                          </span>
                          <span className="font-mono text-[11px] text-text-muted">
                            {finding.location}
                          </span>
                        </div>
                        <FindingCodeViewer
                          vulnerableCode={finding.vulnerableCode}
                          vulnerableLines={finding.vulnerableLines}
                          remediatedCode={finding.remediatedCode}
                          location={finding.location}
                          sourceCode={finding.sourceCode}
                          fuzzTestStatus={finding.fuzzTestStatus}
                        />
                      </div>

                      {/* Interactive Discussion Thread with Auditor */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-muted">
                            <MessageSquare className="h-3.5 w-3.5 text-accent-scan" />
                            <span>Auditor Discussion & Remediation Thread</span>
                          </div>
                          <span className="text-xs text-text-muted">
                            {finding.comments.length} Messages
                          </span>
                        </div>

                        {/* Messages List */}
                        <div className="p-4 rounded-xl bg-bg-void/60 border border-border-hairline/60 space-y-3 max-h-80 overflow-y-auto">
                          {finding.comments.length === 0 ? (
                            <div className="text-center py-6 text-xs text-text-muted space-y-1">
                              <div>No messages exchanged yet for this finding.</div>
                              <div className="text-[11px]">
                                Ask the lead auditor a question or submit a fix commit SHA below.
                              </div>
                            </div>
                          ) : (
                            finding.comments.map((comment) => {
                              const isAuditor = comment.senderRole === "auditor";
                              return (
                                <div
                                  key={comment.id}
                                  className={cn(
                                    "p-3 rounded-lg border text-xs space-y-1.5",
                                    isAuditor
                                      ? "bg-accent-scan/5 border-accent-scan/20 mr-4"
                                      : "bg-white dark:bg-bg-panel border-border-hairline ml-4"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-text-primary">
                                        {comment.sender}
                                      </span>
                                      <span
                                        className={cn(
                                          "px-1.5 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                          isAuditor
                                            ? "bg-accent-scan/10 text-accent-scan"
                                            : "bg-black/5 dark:bg-white/5 text-text-muted"
                                        )}
                                      >
                                        {isAuditor ? "Auditor" : "Client"}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-text-muted">
                                      {comment.timestamp}
                                    </span>
                                  </div>

                                  <p className="text-text-primary leading-relaxed font-sans">
                                    {comment.message}
                                  </p>

                                  {comment.commitRef && (
                                    <div className="pt-1 flex items-center gap-1.5 font-mono text-[11px] text-accent-scan font-medium">
                                      <GitCommit className="h-3 w-3" />
                                      <span>Referenced Commit: {comment.commitRef}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Dual Action Columns: Quick Inquiry Form & Commit Submission Form */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                          {/* 1. Send Inquiry / Question */}
                          <div className="p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                              <MessageSquare className="h-3.5 w-3.5 text-accent-scan" />
                              <span>Ask Auditor Clarification</span>
                            </div>
                            <textarea
                              rows={3}
                              value={inquiryInputs[finding.id] || ""}
                              onChange={(e) =>
                                setInquiryInputs((prev) => ({
                                  ...prev,
                                  [finding.id]: e.target.value,
                                }))
                              }
                              placeholder="Type your inquiry or question to the reviewing auditor..."
                              className="w-full p-2.5 rounded-lg bg-bg-void border border-border-hairline text-xs font-sans text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent-scan/50 resize-none"
                            />
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleSendInquiry(finding.id)}
                                disabled={submittingInquiry[finding.id] || !inquiryInputs[finding.id]?.trim()}
                                className="rounded-lg text-xs"
                              >
                                {submittingInquiry[finding.id] ? "Sending..." : "Send Message"}
                              </Button>
                            </div>
                          </div>

                          {/* 2. Remediation Cleared or Submit Fix for Re-verification */}
                          {finding.status === "resolved" ? (
                            <div className="p-4 rounded-xl bg-signal-resolved/5 border border-signal-resolved/20 shadow-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-signal-resolved">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Remediation Cleared & Verified</span>
                                </div>
                                <span className="text-[10px] text-signal-resolved uppercase font-semibold">
                                  Auditor Approved
                                </span>
                              </div>
                              <p className="text-xs text-text-muted leading-relaxed">
                                Lead auditor verified the fixes for this finding. All checks have passed and no additional submission is required.
                              </p>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-accent-scan/5 border border-accent-scan/20 shadow-xs space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-accent-scan">
                                  <GitCommit className="h-3.5 w-3.5" />
                                  <span>Submit Fix for Re-Verification</span>
                                </div>
                                <span className="text-[10px] text-text-muted uppercase font-semibold">
                                  Pipeline Trigger
                                </span>
                              </div>

                              <div className="space-y-2">
                                <Input
                                  placeholder="Git Commit SHA (e.g. 7e21a99)"
                                  value={commitInputs[finding.id]?.commitSha || ""}
                                  onChange={(e) =>
                                    setCommitInputs((prev) => ({
                                      ...prev,
                                      [finding.id]: {
                                        ...prev[finding.id],
                                        commitSha: e.target.value,
                                        summary: prev[finding.id]?.summary || "",
                                      },
                                    }))
                                  }
                                  className="h-8 text-xs font-mono bg-white dark:bg-bg-panel border-border-hairline rounded-lg"
                                />

                                <Input
                                  placeholder="Remediation notes (e.g. Added nonReentrant guard on deposit)"
                                  value={commitInputs[finding.id]?.summary || ""}
                                  onChange={(e) =>
                                    setCommitInputs((prev) => ({
                                      ...prev,
                                      [finding.id]: {
                                        commitSha: prev[finding.id]?.commitSha || "",
                                        summary: e.target.value,
                                      },
                                    }))
                                  }
                                  className="h-8 text-xs font-sans bg-white dark:bg-bg-panel border-border-hairline rounded-lg"
                                />
                              </div>

                              <div className="flex justify-end pt-1">
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleSubmitFix(finding.id)}
                                  disabled={submittingFix[finding.id] || !commitInputs[finding.id]?.commitSha?.trim()}
                                  className="rounded-lg text-xs font-semibold"
                                >
                                  {submittingFix[finding.id] ? "Submitting Fix..." : "Submit Fix for Auditor Sign-Off"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── BOTTOM SECTION (Inside the outer gray frame, beneath white card) ─── */}
                <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans">
                  {/* Left: Metadata Ticket & Contract */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-text-primary font-medium">
                      <span className="text-text-muted">Ticket:</span>
                      <span className="font-mono">{finding.ticketId}</span>
                    </span>
                    <span>•</span>
                    <span className="font-medium text-text-primary">
                      {finding.protocolName}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-text-muted">
                      {finding.contractFileName}
                    </span>
                  </div>

                  {/* Right: Messages count & Live Track Link */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-text-muted">
                      <MessageSquare className="h-3 w-3" />
                      <span>{finding.comments.length} comments</span>
                    </span>
                    <span>•</span>
                    <Link
                      href={`/portal/track/${finding.ticketId}`}
                      className="text-xs font-medium text-accent-scan hover:underline flex items-center gap-1"
                    >
                      <span>View Live Track</span>
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
