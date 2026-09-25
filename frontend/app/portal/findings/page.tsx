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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { FindingCodeViewer } from "@/components/finding-code-viewer";
import { toast } from "sonner";

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
  status: "open" | "fix-submitted" | "resolved";
  taxonomy: string;
  location: string;
  impact: string;
  description: string;
  vulnerableCode?: string;
  vulnerableLines?: string;
  remediatedCode?: string;
  sourceCode?: string;
  fuzzTestStatus?: string;
  remediationNote?: string;
  comments: CommentMessage[];
}

export default function OpenFindingsPage() {
  const [filterStatus, setFilterStatus] = React.useState<"all" | "open" | "fix-submitted">("all");
  const [filterSeverity, setFilterSeverity] = React.useState<string>("all");
  const [filterTicket, setFilterTicket] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedFindingId, setExpandedFindingId] = React.useState<string | null>(null);

  // Separate states for normal inquiries vs distinct re-verification submissions
  const [inquiryInputs, setInquiryInputs] = React.useState<Record<string, string>>({});
  const [submittingInquiry, setSubmittingInquiry] = React.useState<Record<string, boolean>>({});

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
            const statusMapped = rawStatus === "FIX_SUBMITTED" ? "fix-submitted" : rawStatus === "RESOLVED" ? "resolved" : "open";

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
              taxonomy: f.taxonomy || "SWC-107 · CWE-841",
              location: f.location || `${audit.contractFileName || "Contract.sol"}:1`,
              impact: f.impact || "POTENTIAL EXPLOIT RISK",
              description: f.description || "",
              vulnerableCode: f.vulnerableCode || undefined,
              vulnerableLines: f.vulnerableLines || undefined,
              remediatedCode: f.remediatedCode || undefined,
              sourceCode: audit.sourceCode || undefined,
              fuzzTestStatus: f.fuzzTestStatus || undefined,
              remediationNote: f.remediationNote || undefined,
              comments: Array.isArray(f.comments)
                ? f.comments.map((c: any) => ({
                    id: c.id,
                    sender: c.sender?.name || c.sender?.email || "User",
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

  const criticalFindings = findings.filter((f) => f.severity === "critical");
  const highFindings = findings.filter((f) => f.severity === "high");
  const criticalCount = criticalFindings.length;
  const highCount = highFindings.length;
  const fixSubmittedCount = findings.filter((f) => f.status === "fix-submitted").length;

  const activeTickets = Array.from(new Set(findings.map((f) => f.ticketId)));

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* HEADER: CROSS-TICKET REMEDIATION REGISTER */}
      <section className="p-6 md:p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <Eyebrow size="xs" variant="scan" prefix="// CLIENT_WORKSPACE · ">
                CROSS_TICKET_REMEDIATION_QUEUE
              </Eyebrow>
              <Badge severity="critical" size="sm">
                {findings.length} ACTIVE ITEMS
              </Badge>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
              Open Findings & Remediation Queue
            </h1>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Aggregated register of all active unmitigated and fix-submitted vulnerabilities across in-flight audit engagements. Resolved findings are archived directly to the Document Vault upon engagement completion.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/portal/vault">
              <Button variant="outline" size="sm">
                View Resolved in Vault
              </Button>
            </Link>
            <Link href="/portal/new-request">
              <Button variant="primary" size="sm">
                New Request
              </Button>
            </Link>
          </div>
        </div>

        {/* 4-Column Diagnostic Telemetry Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border-hairline font-mono text-xs">
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">OPEN CRITICAL (P0)</div>
            <div className="text-2xl font-bold text-signal-critical font-display">
              {loading ? "…" : criticalCount}
            </div>
            <div className="text-[10px] text-text-muted truncate">
              {criticalCount > 0 ? criticalFindings[0].title : "None detected"}
            </div>
          </div>

          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">OPEN HIGH (P1)</div>
            <div className="text-2xl font-bold text-signal-high font-display">
              {loading ? "…" : highCount}
            </div>
            <div className="text-[10px] text-text-muted truncate">
              {highCount > 0 ? highFindings[0].title : "None detected"}
            </div>
          </div>

          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">FIX SUBMITTED</div>
            <div className="text-2xl font-bold text-accent-scan font-display">
              {loading ? "…" : fixSubmittedCount}
            </div>
            <div className="text-[10px] text-text-muted">Awaiting Auditor Re-Verification</div>
          </div>

          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">ACTIVE SCOPES</div>
            <div className="text-2xl font-bold text-text-primary font-display">
              {loading ? "…" : `${activeTickets.length} Ticket${activeTickets.length === 1 ? "" : "s"}`}
            </div>
            <div className="text-[10px] text-text-muted truncate">
              {activeTickets.length > 0 ? activeTickets.join(" · ") : "No active scopes"}
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH CONTROLS */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-hairline pb-3">
          <div className="flex items-center gap-3">
            <Eyebrow size="sm" prefix="">
              AGGREGATED_FINDINGS // ACTIVE_REGISTER
            </Eyebrow>
            <span className="text-xs text-text-muted hidden md:inline">
              · {filteredFindings.length} Items Displayed
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center rounded-[4px] border border-border-hairline bg-bg-panel p-0.5 font-mono text-xs">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  filterStatus === "all"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                ALL ({findings.length})
              </button>
              <button
                onClick={() => setFilterStatus("open")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  filterStatus === "open"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                OPEN ONLY ({findings.filter((f) => f.status === "open").length})
              </button>
              <button
                onClick={() => setFilterStatus("fix-submitted")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  filterStatus === "fix-submitted"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                FIX SUBMITTED ({fixSubmittedCount})
              </button>
            </div>

            {/* Ticket Selector */}
            <select
              value={filterTicket}
              onChange={(e) => setFilterTicket(e.target.value)}
              className="h-8 px-2 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs text-text-primary focus:outline-none"
            >
              <option value="all">All Active Tickets</option>
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} ({a.protocolName || a.contractFileName || "Audit"})
                </option>
              ))}
            </select>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="h-8 px-2 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs text-text-primary focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>

            <div className="w-56">
              <Input
                placeholder="Filter findings, SWC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="p-12 text-center rounded-[4px] bg-bg-panel border border-border-hairline space-y-3 font-mono text-xs text-text-muted">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-accent-scan" />
            <p>Loading active engagements & aggregated findings…</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredFindings.length === 0 && (
          <div className="p-12 rounded-[4px] bg-bg-panel border border-border-hairline text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-signal-resolved/10 border border-signal-resolved/30 text-signal-resolved flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-semibold text-text-primary">
                {findings.length === 0 ? "No Open Findings" : "No Matching Findings"}
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
                {findings.length === 0
                  ? "There are currently no active unmitigated findings across your audit engagements. Findings will appear here once released by the auditor for review."
                  : "No findings match your current filter and search query. Try resetting your search or severity filters."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2 font-mono text-xs">
              <Link href="/portal">
                <Button variant="outline" size="sm">
                  Return to Dashboard
                </Button>
              </Link>
              <Link href="/portal/new-request">
                <Button variant="primary" size="sm">
                  Submit New Audit Request
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* FINDINGS LIST */}
        {!loading && filteredFindings.length > 0 && (
          <div className="space-y-4">
            {filteredFindings.map((finding) => {
              const isExpanded = expandedFindingId === finding.id;

              return (
                <div
                  key={finding.id}
                  id={finding.id}
                  className={`rounded-[4px] border transition-colors bg-bg-panel overflow-hidden ${
                    isExpanded ? "border-accent-scan/50" : "border-border-hairline hover:border-hairline/90"
                  }`}
                >
                  {/* Header Summary Row */}
                  <div
                    onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-bg-void/40 hover:bg-bg-void/70 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Parent Ticket Link */}
                        <Link
                          href={`/portal/track/${finding.ticketId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs font-bold text-accent-scan hover:underline flex items-center gap-1 bg-accent-scan/10 px-2 py-0.5 rounded-[2px] border border-accent-scan/20"
                          title="View in Parent Ticket Status Tracker"
                        >
                          <span>{finding.ticketId}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>

                        <span className="font-mono text-xs text-text-muted font-semibold">
                          {finding.displayId}
                        </span>

                        <Badge severity={finding.severity as any} size="sm">
                          {finding.severity.toUpperCase()} ({finding.cvss})
                        </Badge>

                        <span className="font-mono text-xs text-text-muted truncate max-w-xs">
                          {finding.location}
                        </span>

                        {finding.status === "fix-submitted" ? (
                          <span className="font-mono text-[11px] text-accent-scan bg-accent-scan/10 px-2 py-0.5 rounded-[2px] border border-accent-scan/30 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent-scan animate-pulse" />
                            Fix Submitted — Awaiting Re-Verification
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-signal-critical bg-signal-critical/10 px-2 py-0.5 rounded-[2px] border border-signal-critical/30">
                            OPEN FINDING
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-base font-semibold text-text-primary">
                          {finding.title}
                        </span>
                        <span className="text-xs font-mono text-text-muted">
                          · {finding.protocolName} ({finding.contractFileName})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto shrink-0 font-mono text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {finding.comments.length}
                      </span>

                      <Link
                        href={`/portal/track/${finding.ticketId}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button size="sm" variant="outline" rightIcon={<ExternalLink className="h-3 w-3" />}>
                          Parent Tracker
                        </Button>
                      </Link>

                      <button
                        type="button"
                        className="p-1 rounded text-text-muted hover:text-text-primary"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED FINDING DETAIL */}
                  {isExpanded && (
                    <div className="p-6 border-t border-border-hairline space-y-8 bg-bg-panel">
                      {/* Asymmetric Diagnostics & Code Section Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left 5 cols: Diagnostics Box */}
                        <div className="lg:col-span-5 p-5 rounded-[4px] bg-bg-void border border-border-hairline space-y-4">
                          <div className="space-y-1">
                            <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                              ROOT CAUSE & EXPLOIT PATH
                            </div>
                            <p className="text-xs text-text-muted leading-relaxed">
                              {finding.description || "Detailed vulnerability analysis provided by lead auditor."}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-border-hairline space-y-2 font-mono text-[11px] text-text-muted">
                            <div className="flex justify-between">
                              <span>PARENT TICKET:</span>
                              <Link
                                href={`/portal/track/${finding.ticketId}`}
                                className="text-accent-scan hover:underline"
                              >
                                {finding.ticketId} ({finding.protocolName})
                              </Link>
                            </div>
                            <div className="flex justify-between">
                              <span>TAXONOMY:</span>
                              <span className="text-text-primary">{finding.taxonomy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>LOCATION:</span>
                              <span className="text-accent-scan">{finding.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>EXPLOIT IMPACT:</span>
                              <span className="text-signal-critical font-medium">{finding.impact}</span>
                            </div>
                          </div>

                          {finding.remediationNote && (
                            <div className="p-3 rounded-[2px] bg-bg-panel border border-border-hairline space-y-1">
                              <div className="font-mono text-[10px] text-accent-scan uppercase font-semibold">
                                RECOMMENDED REMEDIATION:
                              </div>
                              <p className="text-xs text-text-muted leading-relaxed">
                                {finding.remediationNote}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right 7 cols: Code Section Showing the Issue */}
                        <div className="lg:col-span-7 space-y-4">
                          <FindingCodeViewer
                            vulnerableCode={finding.vulnerableCode}
                            vulnerableLines={finding.vulnerableLines}
                            remediatedCode={finding.remediatedCode}
                            location={finding.location}
                            sourceCode={finding.sourceCode}
                            fuzzTestStatus={finding.fuzzTestStatus}
                          />
                        </div>
                      </div>

                      {/* PER-FINDING DISCUSSION & ENQUIRIES THREAD */}
                      <div className="p-5 rounded-[4px] bg-bg-void border border-border-hairline space-y-5">
                        <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-text-primary">
                            <MessageSquare className="h-3.5 w-3.5 text-accent-scan" />
                            <span>Discussion & Audit Enquiries Thread</span>
                          </div>
                          <span className="font-mono text-[11px] text-text-muted">
                            {finding.comments.length} message{finding.comments.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        {/* Messages Feed */}
                        <div className="space-y-3">
                          {finding.comments.length === 0 ? (
                            <p className="text-xs text-text-muted font-mono py-2">
                              No discussion messages yet. You can ask a question, request clarification, or discuss fix approaches below.
                            </p>
                          ) : (
                            finding.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className={`p-3.5 rounded-[4px] border space-y-1.5 ${
                                  comment.senderRole === "auditor"
                                    ? "bg-bg-panel border-border-hairline"
                                    : "bg-bg-panel-raised border-accent-scan/30"
                                }`}
                              >
                                <div className="flex items-center justify-between font-mono text-xs">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-semibold ${
                                        comment.senderRole === "auditor" ? "text-accent-scan" : "text-text-primary"
                                      }`}
                                    >
                                      {comment.sender}
                                    </span>
                                    <Badge
                                      severity={comment.senderRole === "auditor" ? "informational" : "resolved"}
                                      size="sm"
                                    >
                                      {comment.senderRole === "auditor" ? "LEAD AUDITOR" : "CLIENT"}
                                    </Badge>
                                  </div>
                                  <span className="text-text-muted text-[10px]">{comment.timestamp}</span>
                                </div>

                                <p className="text-xs text-text-primary leading-relaxed">
                                  {comment.message}
                                </p>

                                {comment.commitRef && (
                                  <div className="pt-1.5 flex items-center gap-2 font-mono text-[11px] text-signal-resolved">
                                    <GitCommit className="h-3.5 w-3.5" />
                                    <span>REMEDIATION COMMIT:</span>
                                    <code className="bg-bg-void px-1.5 py-0.5 rounded border border-signal-resolved/40 font-bold">
                                      {comment.commitRef}
                                    </code>
                                    <span className="text-text-muted text-[10px]">· Pinned to re-verification queue</span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* 1. Normal Comment / Inquiry Input */}
                        <div className="pt-3 border-t border-border-hairline space-y-2">
                          <div className="flex items-center justify-between font-mono text-[11px] text-text-muted">
                            <span>POST AUDIT ENQUIRY / QUESTION:</span>
                            <span className="text-[10px]">Direct auditor channel · Does not trigger re-verification</span>
                          </div>

                          <div className="flex gap-2">
                            <Input
                              placeholder="Ask a question, request clarification, or discuss remediation approach with the auditor..."
                              value={inquiryInputs[finding.id] || ""}
                              onChange={(e) =>
                                setInquiryInputs((prev) => ({
                                  ...prev,
                                  [finding.id]: e.target.value,
                                }))
                              }
                              className="text-xs flex-1"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendInquiry(finding.id);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              isLoading={submittingInquiry[finding.id]}
                              rightIcon={<Send className="h-3.5 w-3.5" />}
                              onClick={() => handleSendInquiry(finding.id)}
                              disabled={!inquiryInputs[finding.id]?.trim()}
                            >
                              Send Comment
                            </Button>
                          </div>
                        </div>

                        {/* 2. DISTINCT FEATURE: SUBMIT REMEDIATION COMMIT FOR RE-VERIFICATION */}
                        <div className="p-4 rounded-[4px] bg-bg-panel border border-border-hairline space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline pb-2.5">
                            <div className="flex items-center gap-2">
                              <GitCommit className="h-4 w-4 text-signal-resolved" />
                              <span className="font-mono text-xs font-semibold text-text-primary">
                                Submit Remediation Fix for Re-Verification
                              </span>
                            </div>
                            {finding.status === "fix-submitted" ? (
                              <Badge severity="resolved" size="sm">
                                AWAITING AUDITOR RE-VERIFICATION
                              </Badge>
                            ) : (
                              <Badge severity="critical" size="sm">
                                FIX PENDING IN CODEBASE
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-text-muted leading-relaxed">
                            When your engineering team has committed the patch to your repository, input the commit SHA below to notify the auditor and queue this finding for re-verification.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                            <div className="sm:col-span-4">
                              <Input
                                isMono
                                placeholder="Commit SHA (e.g. 4b8f10e)"
                                value={commitInputs[finding.id]?.commitSha || ""}
                                onChange={(e) =>
                                  setCommitInputs((prev) => ({
                                    ...prev,
                                    [finding.id]: {
                                      commitSha: e.target.value,
                                      summary: prev[finding.id]?.summary || "",
                                    },
                                  }))
                                }
                                prefix={<GitCommit className="h-3.5 w-3.5 text-accent-scan" />}
                                className="text-xs"
                              />
                            </div>

                            <div className="sm:col-span-8">
                              <Input
                                placeholder="Remediation summary (e.g. Applied Checks-Effects-Interactions pattern)..."
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
                                className="text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <Button
                              type="button"
                              variant="secondary"
                              className="border-signal-resolved/40 text-signal-resolved hover:bg-signal-resolved/10 font-bold"
                              size="sm"
                              isLoading={submittingFix[finding.id]}
                              rightIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                              onClick={() => handleSubmitFix(finding.id)}
                              disabled={!commitInputs[finding.id]?.commitSha?.trim()}
                            >
                              Submit Fix for Re-Verification
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
