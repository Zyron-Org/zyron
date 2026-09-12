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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function AuditorTicketQueuePage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [audits, setAudits] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [claimedToast, setClaimedToast] = React.useState<string | null>(null);

  // Fetch audits from NestJS backend
  const fetchAudits = async () => {
    try {
      const res = await apiClient.get("/audits");
      setAudits(res.data || []);
    } catch (e: any) {
      console.warn("Failed to fetch audits from API:", e.message);
    } finally {
      setLoading(false);
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

  const { user } = useAuth();

  const claimedTickets = audits.filter((a) => a.leadAuditorId && (user ? a.leadAuditorId === user.id : true));
  const unclaimedTickets = audits.filter((a) => !a.leadAuditorId);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* QUEUE HEADER & TELEMETRY */}
      <section className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Eyebrow size="xs" variant="scan" prefix="// AUDITOR_WORKSPACE · ">
                TICKET_QUEUE_TRIAGE
              </Eyebrow>
              <Badge severity="high" size="sm">
                LEAD AUDITOR QUEUE
              </Badge>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
              Internal Ticket Queue Dashboard
            </h1>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-3xl">
              Utilitarian triage workbench for assigned reviews, incoming scope ingestion, and pending client remediation re-verification passes.
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
            <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline space-y-0.5">
              <div className="text-text-muted text-[10px]">MY CLAIMED</div>
              <div className="text-lg font-bold text-accent-scan font-display">
                {claimedTickets.length} Tickets
              </div>
            </div>

            <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline space-y-0.5">
              <div className="text-text-muted text-[10px]">UNCLAIMED INTAKE</div>
              <div className="text-lg font-bold text-text-primary font-display">
                {unclaimedTickets.length} Scopes
              </div>
            </div>
          </div>
        </div>

        {/* Claim Feedback Toast */}
        {claimedToast && (
          <div className="p-3 rounded-[4px] bg-signal-resolved/10 border border-signal-resolved/40 text-signal-resolved font-mono text-xs flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{claimedToast} — Transferred to "My Claimed Tickets".</span>
            </div>
            <span className="text-[10px] text-text-muted">Assigned Lead: Active Auditor</span>
          </div>
        )}
      </section>

      {/* FILTER & SEARCH */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="w-64">
          <Input
            placeholder="Search tickets, commits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
            className="h-8 text-xs bg-bg-void"
          />
        </div>

        <div className="text-[11px] text-text-muted flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-signal-resolved animate-pulse" />
          <span>REAL-TIME API SYNC ACTIVE</span>
        </div>
      </section>

      {/* MY CLAIMED TICKETS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
          <div className="flex items-center gap-2 font-mono text-xs">
            <User className="h-3.5 w-3.5 text-accent-scan" />
            <span className="font-bold text-text-primary uppercase tracking-wider">
              My Claimed Tickets ({claimedTickets.length})
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {claimedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 rounded-[4px] bg-bg-panel border border-border-hairline hover:border-accent-scan/40 transition-colors space-y-3 font-mono text-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-accent-scan font-bold text-sm">
                      {ticket.id}
                    </span>
                    <h3 className="font-display text-base font-semibold text-text-primary">
                      {ticket.protocolName}
                    </h3>
                    <span className="text-text-muted text-xs">
                      ({ticket.contractFileName})
                    </span>
                    <StatusPill status={ticket.stage?.toLowerCase() || "in-review"} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                    <span>SCOPE: {(ticket.sloc || 2410).toLocaleString()} SLOC</span>
                    <span>·</span>
                    <span>COMPILER: {ticket.compilerVersion || "v0.8.20"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/auditor/review/${ticket.id}`}>
                    <Button variant="outline" size="sm" rightIcon={<Split className="h-3.5 w-3.5 text-accent-scan" />}>
                      Open Workbench
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UNCLAIMED INGESTION QUEUE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
          <div className="flex items-center gap-2 font-mono text-xs">
            <Inbox className="h-3.5 w-3.5 text-text-muted" />
            <span className="font-bold text-text-primary uppercase tracking-wider">
              Unclaimed Ingestion Queue ({unclaimedTickets.length})
            </span>
          </div>
        </div>

        {unclaimedTickets.length > 0 ? (
          <div className="space-y-3">
            {unclaimedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-5 rounded-[4px] bg-bg-panel/70 border border-border-hairline hover:border-accent-scan/40 transition-colors space-y-3 font-mono text-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-text-muted font-bold text-sm">
                        {ticket.id}
                      </span>
                      <h3 className="font-display text-base font-semibold text-text-primary">
                        {ticket.protocolName}
                      </h3>
                      <span className="text-text-muted text-xs">
                        ({ticket.contractFileName})
                      </span>
                      <Badge severity="informational" size="sm">
                        UNCLAIMED
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                      <span>SCOPE: {(ticket.sloc || 1800).toLocaleString()} SLOC</span>
                      <span>·</span>
                      <span>COMPILER: {ticket.compilerVersion || "v0.8.20"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleClaimTicket(ticket.id, ticket.protocolName)}
                      leftIcon={<User className="h-3.5 w-3.5" />}
                    >
                      Claim Ticket for Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline text-center font-mono text-xs text-text-muted space-y-1">
            <CheckCircle2 className="h-5 w-5 text-signal-resolved mx-auto" />
            <div>All ingested scopes currently claimed by active auditors.</div>
          </div>
        )}
      </section>
    </div>
  );
}
