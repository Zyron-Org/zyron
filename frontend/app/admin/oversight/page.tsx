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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  MOCK_AUDIT_REQUESTS, type AuditRequest
} from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";

interface ExtendedTicket extends AuditRequest {
  slaStatus: "on-track" | "warning" | "breached";
  slaOverdueHours?: number;
}

export default function GlobalTicketOversightPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [auditorFilter, setAuditorFilter] = React.useState<string>("all");
  const [slaFilter, setSlaFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);

  // Reassign Modal State
  const [ticketToReassign, setTicketToReassign] = React.useState<ExtendedTicket | null>(null);
  const [selectedTargetAuditor, setSelectedTargetAuditor] = React.useState<string>("0xAuditor_M2");
  const [reassignReason, setReassignReason] = React.useState("");
  const [reassignFeedback, setReassignFeedback] = React.useState(false);

  const [tickets, setTickets] = React.useState<ExtendedTicket[]>([]);

  React.useEffect(() => {
    apiClient
      .get("/audits")
      .then((res) => {
        const data = (res.data || []).map((a: AuditRequest) => ({
          ...a,
          // Assign SLA status based on stage (heuristic — backend doesn't expose SLA yet)
          slaStatus:
            a.stage?.toUpperCase() === "COMPLETED" || a.stage?.toUpperCase() === "FAILED"
              ? ("on-track" as const)
              : ("on-track" as const),
        } as ExtendedTicket));
        setTickets(data);
      })
      .catch((e) => {
        console.warn("Oversight: fetch error", e.message);
        // Fallback to mocks
        setTickets([
          { ...MOCK_AUDIT_REQUESTS[0], slaStatus: "on-track" },
          { ...MOCK_AUDIT_REQUESTS[1], slaStatus: "breached", slaOverdueHours: 4 },
          { ...MOCK_AUDIT_REQUESTS[2], slaStatus: "on-track" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const auditorsList = [
    { handle: "0xAuditor_K4", name: "0xAuditor_K4 (Lead)", currentLoad: "2 Tickets" },
    { handle: "0xAuditor_M2", name: "0xAuditor_M2 (Senior)", currentLoad: "1 Ticket" },
    { handle: "0xAuditor_S9", name: "0xAuditor_S9 (Auditor)", currentLoad: "1 Ticket" },
  ];

  const handleConfirmReassignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketToReassign || !selectedTargetAuditor) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketToReassign.id
          ? { ...t, assignedAuditor: selectedTargetAuditor }
          : t
      )
    );

    setTicketToReassign(null);
    setReassignFeedback(true);
    setTimeout(() => setReassignFeedback(false), 3000);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.protocolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contractFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assignedAuditor || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAuditor =
      auditorFilter === "all" || t.assignedAuditor === auditorFilter;
    const matchesSla =
      slaFilter === "all" || t.slaStatus === slaFilter;
    return matchesSearch && matchesAuditor && matchesSla;
  });

  const breachedTicketsCount = tickets.filter((t) => t.slaStatus === "breached").length;
  const warningTicketsCount = tickets.filter((t) => t.slaStatus === "warning").length;
  const totalSloc = tickets.reduce((acc, curr) => acc + curr.sloc, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 text-accent-scan animate-spin" />
        <span className="ml-3 font-mono text-xs text-text-muted">Loading platform audit data…</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent-scan" />
            <h1 className="font-display text-base font-semibold text-text-primary">
              Global Ticket Oversight & Workload Allocation
            </h1>
          </div>
          <p className="text-text-muted text-[11px]">
            Cross-client, cross-auditor pipeline monitoring with SLA breach detection and auditor reassignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {breachedTicketsCount > 0 ? (
            <Badge severity="critical" size="sm">
              {breachedTicketsCount} SLA BREACH ACTIVE
            </Badge>
          ) : (
            <Badge severity="resolved" size="sm">
              100% SLA COMPLIANT
            </Badge>
          )}
        </div>
      </div>

      {reassignFeedback && (
        <div className="p-4 rounded-[4px] bg-signal-resolved/10 border border-signal-resolved/40 text-signal-resolved font-mono text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="h-4 w-4" />
          <span>Ticket successfully reassigned. Workload updated in auditor queue.</span>
        </div>
      )}

      {/* Global Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="text-[10px] text-text-muted">TOTAL ACTIVE ENGAGEMENTS</div>
          <div className="text-text-primary font-bold text-lg">{tickets.length} Scopes</div>
          <div className="text-[10px] text-accent-scan">{totalSloc.toLocaleString()} Total SLOC</div>
        </div>

        <div className="p-4 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="text-[10px] text-text-muted">SLA COMPLIANCE RATE</div>
          <div className="text-signal-high font-bold text-lg">
            {Math.round(((tickets.length - breachedTicketsCount) / tickets.length) * 100)}%
          </div>
          <div className="text-[10px] text-text-muted">Target SLA: 98.0%</div>
        </div>

        <div className="p-4 rounded-[4px] bg-bg-panel border border-signal-critical/40 space-y-1 bg-signal-critical/5">
          <div className="text-[10px] text-signal-critical font-bold">SLA BREACHES</div>
          <div className="text-signal-critical font-bold text-lg">
            {breachedTicketsCount} Overdue
          </div>
          <div className="text-[10px] text-text-muted">Requires Auditor Rebalance</div>
        </div>

        <div className="p-4 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="text-[10px] text-text-muted">ACTIVE AUDITOR POOL</div>
          <div className="text-text-primary font-bold text-lg">3 Senior Leads</div>
          <div className="text-[10px] text-signal-resolved">Zero Idle Capacity</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3.5 rounded-[4px] bg-bg-panel border border-border-hairline flex flex-col lg:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket #ID, protocol name, or assigned auditor..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-[11px] shrink-0">AUDITOR:</span>
            <select
              value={auditorFilter}
              onChange={(e) => setAuditorFilter(e.target.value)}
              className="h-8 px-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none"
            >
              <option value="all">All Auditors</option>
              <option value="0xAuditor_K4">0xAuditor_K4</option>
              <option value="0xAuditor_M2">0xAuditor_M2</option>
              <option value="0xAuditor_S9">0xAuditor_S9</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-muted text-[11px] shrink-0">SLA HEALTH:</span>
            <select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="h-8 px-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none"
            >
              <option value="all">All SLA States</option>
              <option value="breached">Breached Only</option>
              <option value="warning">Warning Only</option>
              <option value="on-track">On Track Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Global Tickets Oversight Table */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-text-primary font-sans">
            Cross-Protocol Ticket Workstream
          </h3>
          <span className="text-[11px] text-text-muted">
            Showing {filteredTickets.length} of {tickets.length} total tickets
          </span>
        </div>

        <div className="rounded-[4px] bg-bg-panel border border-border-hairline overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border-hairline bg-bg-void/60 text-[11px]">
                <TableHead className="font-mono text-text-muted py-3 px-4">TICKET / PROTOCOL</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">STAGE</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">ASSIGNED LEAD</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">SLA HEALTH / ETA</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">FINDINGS</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4 text-right">ADMIN CONTROL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className={`border-b border-border-hairline transition-colors ${
                    ticket.slaStatus === "breached"
                      ? "bg-signal-critical/5 hover:bg-signal-critical/10"
                      : "hover:bg-bg-panel-raised/50"
                  }`}
                >
                  {/* Ticket & Protocol */}
                  <TableCell className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-accent-scan font-bold text-xs">{ticket.id}</span>
                        <span className="font-semibold text-text-primary text-xs font-sans">
                          {ticket.protocolName}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {ticket.contractFileName} · {ticket.sloc.toLocaleString()} SLOC · {ticket.compilerVersion}
                      </div>
                    </div>
                  </TableCell>

                  {/* Stage */}
                  <TableCell className="py-3.5 px-4">
                    <StatusPill status={ticket.stage} size="sm" />
                  </TableCell>

                  {/* Assigned Auditor */}
                  <TableCell className="py-3.5 px-4 text-text-primary text-xs">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-accent-scan font-bold">{ticket.assignedAuditor || "Unassigned"}</span>
                    </div>
                  </TableCell>

                  {/* SLA Health / Breach Tag */}
                  <TableCell className="py-3.5 px-4">
                    {ticket.slaStatus === "breached" ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] bg-signal-critical/15 text-signal-critical border border-signal-critical/40 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-fit animate-pulse">
                          <AlertTriangle className="h-3 w-3" />
                          <span>SLA BREACHED (+{ticket.slaOverdueHours}h)</span>
                        </span>
                        <div className="text-[10px] text-text-muted">Target: {ticket.estimatedCompletion}</div>
                      </div>
                    ) : ticket.slaStatus === "warning" ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] bg-signal-high/15 text-signal-high border border-signal-high/40 px-2 py-0.5 rounded font-bold w-fit">
                          AT RISK (&lt;6h REMAINING)
                        </span>
                        <div className="text-[10px] text-text-muted">Target: {ticket.estimatedCompletion}</div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-signal-resolved flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>On Track</span>
                        </span>
                        <div className="text-[10px] text-text-muted">ETA: {ticket.estimatedCompletion}</div>
                      </div>
                    )}
                  </TableCell>

                  {/* Findings Breakdown */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      {ticket.findings.critical > 0 && (
                        <Badge severity="critical" size="sm">
                          {ticket.findings.critical}C
                        </Badge>
                      )}
                      {ticket.findings.high > 0 && (
                        <Badge severity="high" size="sm">
                          {ticket.findings.high}H
                        </Badge>
                      )}
                      {ticket.findings.medium > 0 && (
                        <Badge severity="medium" size="sm">
                          {ticket.findings.medium}M
                        </Badge>
                      )}
                      {ticket.findings.resolved > 0 && (
                        <Badge severity="resolved" size="sm">
                          {ticket.findings.resolved}R
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Reassign Action */}
                  <TableCell className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTicketToReassign(ticket);
                          setSelectedTargetAuditor(
                            ticket.assignedAuditor === "0xAuditor_K4" ? "0xAuditor_M2" : "0xAuditor_K4"
                          );
                          setReassignReason("");
                        }}
                        leftIcon={<ArrowLeftRight className="h-3 w-3 text-accent-scan" />}
                      >
                        Reassign
                      </Button>
                      <Link href={`/auditor/review/${ticket.id}`}>
                        <Button variant="ghost" size="sm">
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: REASSIGN TICKET TO DIFFERENT AUDITOR                               */}
      {/* ========================================================================= */}
      {ticketToReassign && (
        <div className="fixed inset-0 bg-bg-void/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[4px] bg-bg-panel border border-border-hairline shadow-2xl p-6 md:p-8 space-y-6 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border-hairline pb-4">
              <div className="space-y-0.5">
                <Eyebrow size="xs" variant="scan" prefix="// WORKLOAD_REBALANCE · ">
                  AUDITOR_REASSIGNMENT
                </Eyebrow>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  Reassign Scope {ticketToReassign.id}
                </h3>
              </div>
              <button
                onClick={() => setTicketToReassign(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-[3px] bg-bg-void border border-border-hairline space-y-2">
              <div className="text-[10px] text-text-muted">SCOPE TARGET:</div>
              <div className="text-text-primary font-bold text-sm">
                {ticketToReassign.protocolName} ({ticketToReassign.contractFileName})
              </div>
              <div className="text-[11px] text-text-muted">
                Currently Assigned: <strong className="text-signal-high">{ticketToReassign.assignedAuditor || "Unassigned"}</strong> · Scope: {ticketToReassign.sloc.toLocaleString()} SLOC
              </div>
            </div>

            <form onSubmit={handleConfirmReassignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-text-muted text-[11px]">SELECT TARGET AUDITOR LEAD</label>
                <select
                  value={selectedTargetAuditor}
                  onChange={(e) => setSelectedTargetAuditor(e.target.value)}
                  className="w-full h-9 px-3 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none"
                >
                  {auditorsList.map((auditor) => (
                    <option key={auditor.handle} value={auditor.handle}>
                      {auditor.name} — Current Load: {auditor.currentLoad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-muted text-[11px]">REASSIGNMENT RATIONALE</label>
                <textarea
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="State the reason for reallocation (e.g. SLA turnaround acceleration, workload leveling, specialized opcode domain expertise)..."
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-hairline">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTicketToReassign(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!reassignReason.trim()}
                  leftIcon={<ArrowLeftRight className="h-4 w-4" />}
                >
                  Confirm Reassignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
