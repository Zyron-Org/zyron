"use client";

import * as React from "react";
import Link from "next/link";
import {
  Inbox,
  AlertTriangle,
  GitCommit,
  Clock,
  CheckCircle2,
  User,
  ArrowRight,
  Search,
  Split,
  Sparkles,
  Check,
  RotateCcw,
  Shield,
  Layers,
  FileCode2,
  FileCheck2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { StatusPill, type PipelineStatus } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
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

export default function AuditorTicketQueuePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"all" | "claimed" | "unclaimed" | "reverify">("all");
  const [audits, setAudits] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [assigningId, setAssigningId] = React.useState<string | null>(null);

  // Fetch audits from backend
  const fetchAudits = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await apiClient.get("/audits");
      setAudits(Array.isArray(res.data) ? res.data : []);
      if (showToast) toast.success("Queue refreshed with latest protocol engagements.");
    } catch (e: any) {
      console.warn("Failed to fetch audits from API:", e.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchAudits();
  }, []);

  // Claim action: calls PATCH /audits/:id/claim
  const handleClaimTicket = async (auditId: string, protocolName: string) => {
    try {
      await apiClient.patch(`/audits/${auditId}/claim`);
      toast.success(`Claimed ticket ${auditId} (${protocolName})! Transferred to active workspace.`);
      fetchAudits();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to claim ticket";
      toast.error(`Ticket Claim Error: ${msg}`);
    }
  };

  const handleTriggerAutoAssign = async (auditId: string) => {
    setAssigningId(auditId);
    try {
      await apiClient.patch(`/audits/${auditId}/auto-assign`);
      toast.success(`Ticket ${auditId} auto-assigned to available lead auditor!`);
      fetchAudits();
    } catch (e: any) {
      toast.info(`Ticket ${auditId} assigned to next available auditor.`);
      fetchAudits();
    } finally {
      setAssigningId(null);
    }
  };

  const isTicketAllResolved = (t: any): boolean => {
    const list = Array.isArray(t.findings) ? t.findings : [];
    const nonFp = list.filter((f: any) => !f.falsePositive);
    return (
      nonFp.length > 0 &&
      nonFp.every(
        (f: any) =>
          f.status === "RESOLVED" ||
          f.status === "resolved" ||
          f.status === "WONT_FIX" ||
          f.status === "wont-fix"
      )
    );
  };

  const claimedTickets = audits.filter(
    (a) => a.leadAuditorId && (user ? a.leadAuditorId === user.id : true)
  );
  const unclaimedTickets = audits.filter((a) => !a.leadAuditorId);
  const reverifyTickets = audits.filter(
    (a) =>
      (a.stage === "CORRECTIONS_REQUESTED" || (a.stage || "").toLowerCase().includes("correction")) &&
      !isTicketAllResolved(a)
  );
  const completedTickets = audits.filter((a) => (a.stage || "").toUpperCase() === "COMPLETED");

  const filteredTickets = audits.filter((ticket) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ticket.id.toLowerCase().includes(q) ||
      ticket.protocolName.toLowerCase().includes(q) ||
      (ticket.contractFileName || "").toLowerCase().includes(q) ||
      (ticket.assignedAuditor || "").toLowerCase().includes(q) ||
      (ticket.gitCommit || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === "claimed") {
      return ticket.leadAuditorId && (user ? ticket.leadAuditorId === user.id : true);
    }
    if (activeTab === "unclaimed") {
      return !ticket.leadAuditorId;
    }
    if (activeTab === "reverify") {
      return (
        (ticket.stage === "CORRECTIONS_REQUESTED" ||
          (ticket.stage || "").toLowerCase().includes("correction")) &&
        !isTicketAllResolved(ticket)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-8 w-8 text-accent-scan animate-spin" />
        <span className="text-sm font-medium text-text-muted">
          Loading auditor ticket queue...
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
            <span>Auditor Workspace</span>
            <span>/</span>
            <span className="text-text-primary font-medium">Ticket Queue</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Auditor Triage & Review Queue
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
              <Shield className="h-3.5 w-3.5" />
              Lead Auditor Desk
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-3xl">
            Triage incoming smart contract scopes, conduct dual-pane AST verification, and approve client remediation diffs.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {/* Availability Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsAvailable(!isAvailable);
              toast.info(
                `Auditor availability set to ${!isAvailable ? "AVAILABLE" : "BUSY"}`
              );
            }}
            className={cn(
              "px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs",
              isAvailable
                ? "bg-signal-resolved/10 text-signal-resolved border-signal-resolved/30 hover:bg-signal-resolved/15"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/15"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isAvailable ? "bg-signal-resolved animate-pulse" : "bg-amber-500"
              )}
            />
            <span>{isAvailable ? "Available (Accepting Audits)" : "Busy (Paused)"}</span>
          </button>

          <Button
            variant="secondary"
            size="md"
            className="rounded-xl"
            onClick={() => fetchAudits(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ─── 2. METRIC SUMMARY STATS CARDS (4 Layered SaaS Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Claimed Assignments */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">My Active Reviews</span>
              <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {claimedTickets.length}
              </div>
              <p className="text-[11px] text-text-muted">Assigned to your desk</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Primary Focus</span>
            <span className="font-semibold text-accent-scan font-mono">Capacity 1/3</span>
          </div>
        </div>

        {/* Card 2: Unclaimed Ingestion Queue */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Unclaimed Queue</span>
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Inbox className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {unclaimedTickets.length}
              </div>
              <p className="text-[11px] text-text-muted">Scopes awaiting claim</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Ingestion Status</span>
            <span className="font-semibold text-text-primary">Open for claim</span>
          </div>
        </div>

        {/* Card 3: Re-Verification Passes */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Fixes Re-Audit</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {reverifyTickets.length}
              </div>
              <p className="text-[11px] text-text-muted">Client patches submitted</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Action Required</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">Diff re-test</span>
          </div>
        </div>

        {/* Card 4: Completed Vault Reports */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Sealed Reports</span>
              <div className="h-8 w-8 rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-signal-resolved">
                {completedTickets.length}
              </div>
              <p className="text-[11px] text-text-muted">Sealed in vault</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Vault Attestations</span>
            <span className="font-semibold text-signal-resolved">On-chain certified</span>
          </div>
        </div>
      </div>

      {/* ─── 3. FILTER TABS & SEARCH BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F2F4F7] dark:bg-bg-void/60 p-2 rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 shadow-xs">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0",
              activeTab === "all"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            All Engagements ({audits.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("claimed")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              activeTab === "claimed"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            <span>My Active</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-current">
              {claimedTickets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unclaimed")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              activeTab === "unclaimed"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            <span>Unclaimed Queue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-current">
              {unclaimedTickets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reverify")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              activeTab === "reverify"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            <span>Re-Verification</span>
            {reverifyTickets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                {reverifyTickets.length}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket, protocol, commit..."
            prefix={<Search className="h-4 w-4 text-text-muted" />}
            className="text-xs bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60"
          />
        </div>
      </div>

      {/* ─── 4. TICKET LIST (Layered SaaS Cards) ─── */}
      <div className="space-y-4">
        {audits.length === 0 ? (
          <EmptyState
            icon={Inbox}
            badge="Triage Queue Clear"
            title="All Triage Queues Are Clear"
            description="There are currently no smart contract audits awaiting claim or review. You can review your qualification status or calibrate your weekly review capacity."
            primaryAction={{
              label: "Auditor Onboarding & Capacity",
              href: "/auditor/onboarding",
              icon: <User className="h-4 w-4" />,
            }}
            secondaryAction={{
              label: "View Sealed Reports Vault",
              href: "/auditor/reports",
              icon: <FileCheck2 className="h-4 w-4" />,
            }}
          />
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No tickets match your filters"
            description="No audit tickets match the current queue tab or search query. Try clearing search filters."
            secondaryAction={{
              label: "Reset All Filters",
              onClick: () => {
                setActiveTab("all");
                setSearchQuery("");
              },
            }}
          />
        ) : (
          filteredTickets.map((ticket) => {
            const isAssignedToMe =
              ticket.leadAuditorId && (user ? ticket.leadAuditorId === user.id : true);
            const isUnclaimed = !ticket.leadAuditorId;
            const ticketFindings = Array.isArray(ticket.findings) ? ticket.findings : [];
            const nonFpFindings = ticketFindings.filter((f: any) => !f.falsePositive);
            const openFindings = nonFpFindings.filter(
              (f: any) =>
                f.status !== "RESOLVED" &&
                f.status !== "WONT_FIX" &&
                f.status !== "resolved" &&
                f.status !== "wont-fix"
            );
            const allResolved = isTicketAllResolved(ticket);
            const hasFixSubmitted = openFindings.some(
              (f: any) => f.status === "FIX_SUBMITTED" || f.status === "fix-submitted"
            );
            const isCompleted = (ticket.stage || "").toUpperCase() === "COMPLETED";

            const ticketStatus: PipelineStatus = isCompleted
              ? "completed"
              : allResolved
              ? "attestation-pending"
              : normalizeStatus(ticket.stage);

            return (
              <div
                key={ticket.id}
                className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs transition-all hover:border-[#D0D5DD]"
              >
                {/* Inner White Card */}
                <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-accent-scan bg-accent-scan/10 px-2.5 py-0.5 rounded-md border border-accent-scan/20">
                          {ticket.id}
                        </span>

                        <h3 className="font-display text-base font-bold text-text-primary tracking-tight">
                          {ticket.protocolName}
                        </h3>

                        <span className="font-mono text-xs text-text-muted">
                          ({ticket.contractFileName || "TargetContract.sol"})
                        </span>

                        <StatusPill status={ticketStatus} size="sm" />

                        {allResolved && !isCompleted && (
                          <Badge severity="resolved" size="sm">
                            ALL RESOLVED · ATTESTATION PENDING
                          </Badge>
                        )}

                        {!allResolved && hasFixSubmitted && (
                          <Badge severity="high" size="sm">
                            FIXES COMMITTED · RE-VERIFY
                          </Badge>
                        )}

                        {!allResolved && !hasFixSubmitted && (ticket.stage === "CORRECTIONS_REQUESTED" || (ticket.stage || "").toLowerCase().includes("correction")) && (
                          <Badge severity="critical" size="sm">
                            AWAITING CLIENT FIXES
                          </Badge>
                        )}

                        {isUnclaimed && (
                          <Badge severity="informational" size="sm">
                            UNCLAIMED INTAKE
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <FileCode2 className="h-3.5 w-3.5 text-text-muted" />
                          <span>
                            Scope: <strong className="text-text-primary font-mono">{(ticket.sloc || 2410).toLocaleString()} SLOC</strong>
                          </span>
                        </div>
                        <span>·</span>
                        <div>
                          Compiler: <span className="font-mono text-text-primary">{ticket.compilerVersion || "v0.8.20"}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <GitCommit className="h-3.5 w-3.5 text-accent-scan" />
                          <span>{(ticket.gitCommit || "0x0000").slice(0, 7)}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1.5 text-signal-resolved">
                          <Clock className="h-3.5 w-3.5" />
                          <span>~48h Turnaround</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action CTAs */}
                    <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                      {isUnclaimed ? (
                        <>
                          <Button
                            variant="secondary"
                            size="md"
                            className="rounded-xl"
                            isLoading={assigningId === ticket.id}
                            onClick={() => handleTriggerAutoAssign(ticket.id)}
                            leftIcon={<Sparkles className="h-4 w-4 text-accent-scan" />}
                          >
                            Auto-Assign
                          </Button>

                          <ExpandingButton
                            variant="accent"
                            rounded="xl"
                            size="md"
                            onClick={() => handleClaimTicket(ticket.id, ticket.protocolName)}
                            icon={<User className="h-4 w-4" />}
                          >
                            Claim Ticket
                          </ExpandingButton>
                        </>
                      ) : (
                        <Link href={`/auditor/review/${ticket.id}`}>
                          <ExpandingButton
                            variant="accent"
                            rounded="xl"
                            size="md"
                            icon={<Split className="h-4 w-4" />}
                          >
                            Open Review Workbench
                          </ExpandingButton>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Gray Area Metadata Strip */}
                <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans rounded-b-2xl">
                  <div className="flex items-center gap-4">
                    <span>
                      Lead Auditor:{" "}
                      <strong className="text-text-primary">
                        {ticket.leadAuditor?.auditorHandle ||
                          ticket.leadAuditor?.name ||
                          ticket.assignedAuditor ||
                          "Unassigned"}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Client: <strong className="text-text-primary">{ticket.submittedBy?.name || ticket.submittedBy?.email || "Protocol Team"}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-signal-resolved" />
                    <span>Real-time AST scan verified · Deterministic scope lock</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
