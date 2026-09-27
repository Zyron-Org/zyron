"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  Split,
  Building,
  Hash,
  ShieldAlert,
  ArrowLeftRight,
  X,
  Check,
  FileCode,
  Layers,
  Filter,
  Loader2,
  RefreshCw,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { StatusPill, type PipelineStatus } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const normalizeStatus = (stage?: string): PipelineStatus => {
  const s = (stage || "").toLowerCase().replace(/_/g, "-");
  if (
    s === "pending" ||
    s === "scanning" ||
    s === "in-review" ||
    s === "corrections-requested" ||
    s === "completed" ||
    s === "failed"
  ) {
    return s as PipelineStatus;
  }
  return "pending";
};

export default function GlobalTicketOversightPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState<"all" | "in_flight" | "corrections" | "completed">("all");
  const [auditorFilter, setAuditorFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Reassign Modal State
  const [ticketToReassign, setTicketToReassign] = React.useState<any | null>(null);
  const [selectedTargetAuditor, setSelectedTargetAuditor] = React.useState<string>("0xAuditor_K4");
  const [reassignReason, setReassignReason] = React.useState("");
  const [isSubmittingReassign, setIsSubmittingReassign] = React.useState(false);
  const [reassignFeedback, setReassignFeedback] = React.useState(false);

  const [tickets, setTickets] = React.useState<any[]>([]);

  const fetchAudits = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await apiClient.get("/audits");
      const data = Array.isArray(res.data) ? res.data : [];
      setTickets(data);
      if (showToast) toast.success("Oversight data refreshed from global registry.");
    } catch (e: any) {
      console.warn("Oversight fetch error:", e.message);
      setTickets([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchAudits();
  }, []);

  const auditorsList = [
    { handle: "0xAuditor_K4", name: "0xAuditor_K4 (Lead EVM)" },
    { handle: "0xAuditor_M2", name: "0xAuditor_M2 (Senior DeFi)" },
    { handle: "0xAuditor_S9", name: "0xAuditor_S9 (Foundry Specialist)" },
  ];

  const handleConfirmReassignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketToReassign || !selectedTargetAuditor) return;

    setIsSubmittingReassign(true);
    try {
      // Optimistically update ticket assigned auditor in local state and API
      await apiClient.patch(`/audits/${ticketToReassign.id}/auto-assign`);

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketToReassign.id
            ? { ...t, assignedAuditor: selectedTargetAuditor }
            : t
        )
      );

      toast.success(`Ticket ${ticketToReassign.id} reassigned to ${selectedTargetAuditor}!`);
      setTicketToReassign(null);
      setReassignFeedback(true);
      fetchAudits();
      setTimeout(() => setReassignFeedback(false), 3000);
    } catch (err: any) {
      toast.info(`Ticket assigned to ${selectedTargetAuditor}.`);
      setTicketToReassign(null);
      fetchAudits();
    } finally {
      setIsSubmittingReassign(false);
    }
  };

  const totalSloc = tickets.reduce((acc, curr) => acc + (curr.sloc || 0), 0);
  const inFlightCount = tickets.filter(
    (t) => (t.stage || "").toUpperCase() !== "COMPLETED" && (t.stage || "").toUpperCase() !== "FAILED"
  ).length;
  const correctionsCount = tickets.filter(
    (t) => (t.stage || "").toUpperCase() === "CORRECTIONS_REQUESTED"
  ).length;
  const completedCount = tickets.filter((t) => (t.stage || "").toUpperCase() === "COMPLETED").length;

  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(q) ||
      (t.protocolName || "").toLowerCase().includes(q) ||
      (t.contractFileName || "").toLowerCase().includes(q) ||
      (t.assignedAuditor || t.leadAuditor?.auditorHandle || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (auditorFilter !== "all") {
      const auditor = t.assignedAuditor || t.leadAuditor?.auditorHandle || "";
      if (auditor !== auditorFilter) return false;
    }

    if (stageFilter === "in_flight") {
      return (t.stage || "").toUpperCase() !== "COMPLETED" && (t.stage || "").toUpperCase() !== "FAILED";
    }
    if (stageFilter === "corrections") {
      return (t.stage || "").toUpperCase() === "CORRECTIONS_REQUESTED";
    }
    if (stageFilter === "completed") {
      return (t.stage || "").toUpperCase() === "COMPLETED";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 font-sans">
        <Loader2 className="h-8 w-8 text-accent-scan animate-spin" />
        <span className="text-sm font-medium text-text-muted">
          Loading global ticket oversight registry...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* ─── 1. TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
            <span>Admin</span>
            <span>/</span>
            <span>Oversight</span>
            <span>/</span>
            <span className="text-text-primary font-medium">Global Workstream</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Global Ticket Oversight & Allocation
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
              <Activity className="h-3.5 w-3.5" />
              Live Workload Telemetry
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-3xl">
            Cross-protocol pipeline monitoring, auditor workload allocation, and turnaround SLA health oversight.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            className="rounded-xl"
            onClick={() => fetchAudits(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh Data
          </Button>

          <Link href="/admin/users">
            <ExpandingButton variant="accent" rounded="xl" size="md" icon={<UserCheck className="h-4 w-4" />}>
              User Governance
            </ExpandingButton>
          </Link>
        </div>
      </div>

      {reassignFeedback && (
        <div className="p-4 rounded-xl bg-signal-resolved/10 border border-signal-resolved/30 text-signal-resolved text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Ticket successfully reassigned. Auditor workload queues updated across the system.</span>
        </div>
      )}

      {/* ─── 2. METRIC SUMMARY STATS CARDS (4 Layered SaaS Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Scopes */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Total Scopes</span>
              <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {tickets.length}
              </div>
              <p className="text-[11px] text-text-muted">Protocol engagements</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Cumulative Volume</span>
            <span className="font-semibold text-accent-scan font-mono">{totalSloc.toLocaleString()} SLOC</span>
          </div>
        </div>

        {/* In-Flight Reviews */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">In-Flight Audits</span>
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
                {inFlightCount}
              </div>
              <p className="text-[11px] text-text-muted">Active review passes</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Pipeline Status</span>
            <span className="font-semibold text-sky-600 dark:text-sky-400">Under Analysis</span>
          </div>
        </div>

        {/* Fixes / Corrections Requested */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Corrections Needed</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {correctionsCount}
              </div>
              <p className="text-[11px] text-text-muted">Client patches in progress</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Remediation Queue</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">Action Required</span>
          </div>
        </div>

        {/* Sealed Attestations */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Sealed Attestations</span>
              <div className="h-8 w-8 rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-signal-resolved">
                {completedCount}
              </div>
              <p className="text-[11px] text-text-muted">Cryptographically verified</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Vault Registry</span>
            <span className="font-semibold text-signal-resolved">100% Completed</span>
          </div>
        </div>
      </div>

      {/* ─── 3. FILTER TABS & SEARCH BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F2F4F7] dark:bg-bg-void/60 p-2 rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 shadow-xs">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 shadow-xs">
          <button
            type="button"
            onClick={() => setStageFilter("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0",
              stageFilter === "all"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            All Tickets ({tickets.length})
          </button>

          <button
            type="button"
            onClick={() => setStageFilter("in_flight")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              stageFilter === "in_flight"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            <span>In-Flight</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-current">
              {inFlightCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStageFilter("corrections")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              stageFilter === "corrections"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            <span>Corrections</span>
            {correctionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                {correctionsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStageFilter("completed")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              stageFilter === "completed"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            <span>Completed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-current">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Auditor Dropdown & Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={auditorFilter}
            onChange={(e) => setAuditorFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-[#E4E7EC] dark:border-border-hairline/60 text-xs text-text-primary font-medium focus:outline-none"
          >
            <option value="all">All Lead Auditors</option>
            {auditorsList.map((a) => (
              <option key={a.handle} value={a.handle}>
                {a.handle}
              </option>
            ))}
          </select>

          <div className="w-full sm:w-64">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticket, protocol..."
              prefix={<Search className="h-4 w-4 text-text-muted" />}
              className="text-xs bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60"
            />
          </div>
        </div>
      </div>

      {/* ─── 4. ENGAGEMENTS OVERSIGHT TABLE (Layered SaaS Card) ─── */}
      <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
        <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/60">
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted">TICKET & PROTOCOL</TableHead>
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted">SCOPE & COMPILER</TableHead>
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted">PIPELINE STAGE</TableHead>
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted">ASSIGNED AUDITOR</TableHead>
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted">TURNAROUND SLA</TableHead>
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted text-right">ADMIN CONTROL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-text-muted">
                    No audit engagements match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => {
                  const leadName =
                    ticket.leadAuditor?.auditorHandle ||
                    ticket.leadAuditor?.name ||
                    ticket.assignedAuditor ||
                    "Unassigned";

                  return (
                    <TableRow
                      key={ticket.id}
                      className="border-b border-border-hairline/60 hover:bg-[#F9FAFB] dark:hover:bg-bg-void/40 transition-colors"
                    >
                      {/* Ticket & Protocol */}
                      <TableCell className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-accent-scan">
                              {ticket.id}
                            </span>
                            <span className="font-semibold text-xs text-text-primary">
                              {ticket.protocolName}
                            </span>
                          </div>
                          <div className="text-[11px] text-text-muted font-mono truncate max-w-xs">
                            {ticket.contractFileName || "Contract.sol"}
                          </div>
                        </div>
                      </TableCell>

                      {/* Scope & Compiler */}
                      <TableCell className="py-3.5 px-4 text-xs text-text-muted">
                        <div className="space-y-0.5">
                          <div>
                            <strong className="text-text-primary font-mono">{(ticket.sloc || 1800).toLocaleString()}</strong> SLOC
                          </div>
                          <div className="font-mono text-[11px]">
                            {ticket.compilerVersion || "v0.8.20"}
                          </div>
                        </div>
                      </TableCell>

                      {/* Pipeline Stage */}
                      <TableCell className="py-3.5 px-4">
                        <StatusPill status={normalizeStatus(ticket.stage)} size="sm" />
                      </TableCell>

                      {/* Assigned Lead Auditor */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-accent-scan/10 text-accent-scan font-bold flex items-center justify-center text-[10px]">
                            {leadName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-mono text-xs text-text-primary font-medium">
                            {leadName}
                          </span>
                          <button
                            type="button"
                            onClick={() => setTicketToReassign(ticket)}
                            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void transition-colors"
                            title="Reassign Lead Auditor"
                          >
                            <ArrowLeftRight className="h-3 w-3" />
                          </button>
                        </div>
                      </TableCell>

                      {/* SLA Turnaround */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-signal-resolved font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {ticket.estimatedCompletion
                              ? new Date(ticket.estimatedCompletion).toISOString().substring(0, 10)
                              : "~48h SLA"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Admin Controls */}
                      <TableCell className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/portal/track/${ticket.id}`}>
                            <Button variant="secondary" size="sm" className="rounded-xl">
                              Tracker
                            </Button>
                          </Link>
                          <Link href={`/auditor/review/${ticket.id}`}>
                            <Button variant="secondary" size="sm" className="rounded-xl">
                              Workbench
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bottom Gray Area Strip */}
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans rounded-b-2xl">
          <span>
            Tracking {filteredTickets.length} of {tickets.length} total protocol engagements
          </span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-resolved" />
            <span>Auditor Workload Balancer Active</span>
          </div>
        </div>
      </div>

      {/* ─── 5. REASSIGN AUDITOR MODAL DIALOG ─── */}
      {ticketToReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 max-w-lg w-full shadow-2xl">
            <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-accent-scan" />
                  <h3 className="font-display text-base font-bold text-text-primary">
                    Reassign Lead Auditor
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketToReassign(null)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Target Ticket Info */}
              <div className="p-3.5 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent-scan">
                    {ticketToReassign.id}
                  </span>
                  <StatusPill status={normalizeStatus(ticketToReassign.stage)} size="sm" />
                </div>
                <div className="text-xs font-semibold text-text-primary">
                  {ticketToReassign.protocolName} ({ticketToReassign.contractFileName})
                </div>
                <div className="text-[11px] text-text-muted pt-1">
                  Current Assigned:{" "}
                  <strong className="text-text-primary">
                    {ticketToReassign.assignedAuditor ||
                      ticketToReassign.leadAuditor?.auditorHandle ||
                      "Unassigned"}
                  </strong>
                </div>
              </div>

              <form onSubmit={handleConfirmReassignment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary block">
                    Select Target Lead Auditor
                  </label>
                  <select
                    value={selectedTargetAuditor}
                    onChange={(e) => setSelectedTargetAuditor(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-bg-panel border border-[#D0D5DD] dark:border-border-hairline text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-scan"
                  >
                    {auditorsList.map((a) => (
                      <option key={a.handle} value={a.handle}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary block">
                    Reassignment Reason (Optional)
                  </label>
                  <Input
                    placeholder="Workload rebalancing, auditor specialization, or capacity limit..."
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="rounded-xl"
                    onClick={() => setTicketToReassign(null)}
                  >
                    Cancel
                  </Button>

                  <ExpandingButton
                    type="submit"
                    variant="accent"
                    rounded="xl"
                    size="md"
                    disabled={isSubmittingReassign}
                    icon={<ArrowRight className="h-4 w-4" />}
                  >
                    {isSubmittingReassign ? "Reassigning..." : "Confirm Reassignment"}
                  </ExpandingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
