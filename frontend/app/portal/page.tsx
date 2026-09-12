"use client";

import * as React from "react";
import Link from "next/link";
import {
  Terminal,
  Plus,
  ArrowRight,
  FileCode2,
  FileCheck2,
  AlertTriangle,
  ExternalLink,
  Download,
  Filter,
  Search,
  Hash,
  ShieldAlert,
  Clock,
  User,
  GitCommit,
  Layers,
  Activity,
  CheckCircle2,
  Radio,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { StatusPill, type PipelineStatus } from "@/components/ui/status-pill";
import { Eyebrow } from "@/components/ui/eyebrow";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface AuditRecord {
  id: string;
  protocolName: string;
  contractFileName: string;
  contractAddress: string;
  compilerVersion: string;
  network: string;
  sloc: number;
  stage: string;
  stageNumber: number;
  gitCommit?: string;
  submittedAt: string;
  completedAt?: string;
  estimatedCompletion?: string;
  assignedAuditor?: string;
  peerAuditor?: string;
  currentActivity?: string;
  bytecodeHash?: string;
  findings?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    resolved: number;
  };
}

function normalizeStage(stage: string): PipelineStatus {
  const s = stage?.toUpperCase();
  if (s === "PENDING") return "pending";
  if (s === "SCANNING") return "scanning";
  if (s === "IN_REVIEW") return "in-review";
  if (s === "COMPLETED") return "completed";
  if (s === "FAILED") return "failed";
  return stage as PipelineStatus;
}

function stageNumber(stage: string): number {
  const s = stage?.toUpperCase();
  if (s === "PENDING") return 1;
  if (s === "SCANNING") return 2;
  if (s === "IN_REVIEW") return 3;
  if (s === "COMPLETED") return 4;
  return 0;
}

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [audits, setAudits] = React.useState<AuditRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStage, setFilterStage] = React.useState<string>("past");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const fetchAudits = async () => {
    try {
      const res = await apiClient.get("/audits");
      setAudits(res.data || []);
    } catch (e: any) {
      console.warn("Dashboard: could not load audits:", e.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAudits();
  }, []);

  const inFlightAudits = audits.filter(
    (a) =>
      normalizeStage(a.stage) === "scanning" ||
      normalizeStage(a.stage) === "in-review" ||
      normalizeStage(a.stage) === "pending"
  );
  const completedAudits = audits.filter((a) => normalizeStage(a.stage) === "completed");
  const pastAudits = audits.filter(
    (a) => normalizeStage(a.stage) === "completed" || normalizeStage(a.stage) === "failed"
  );
  const totalResolved = completedAudits.reduce(
    (acc, a) => acc + (a.findings?.resolved ?? 0),
    0
  );
  const totalSloc = inFlightAudits.reduce((acc, a) => acc + (a.sloc || 0), 0);

  const filteredAudits = audits.filter((audit) => {
    const ns = normalizeStage(audit.stage);
    const matchesFilter =
      filterStage === "past"
        ? ns === "completed" || ns === "failed"
        : filterStage === "in-flight"
        ? ns === "scanning" || ns === "in-review" || ns === "pending"
        : true;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : audit.protocolName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          audit.contractFileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          audit.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (audit.contractAddress || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 text-accent-scan animate-spin" />
        <span className="ml-3 font-mono text-xs text-text-muted">
          Loading audit pipeline…
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* SECTION 1: HEADER & FAST INTAKE BANNER */}
      <div className="p-6 md:p-8 rounded-[4px] bg-bg-panel border border-border-hairline relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <Eyebrow size="xs" variant="scan" prefix="// CLIENT_WORKSPACE · ">
                PROTOCOL_SECURITY_OVERSIGHT
              </Eyebrow>
              <Badge severity="resolved" size="sm">
                PORTFOLIO HEALTHY
              </Badge>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
              {user?.organization?.name || user?.name || "Security Dashboard"}
            </h1>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {inFlightAudits.length} active audit engagement{inFlightAudits.length !== 1 ? "s" : ""} in pipeline (
              {totalSloc.toLocaleString()} SLOC under review).
              All historical production contracts verified with cryptographic SHA-256 attestation hashes.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted">
              <div>
                ACCOUNT: <span className="text-text-primary font-medium">Enterprise</span>
              </div>
              <div>·</div>
              <div>
                TOTAL SECURED:{" "}
                <span className="text-accent-scan font-medium">
                  {completedAudits
                    .reduce((acc, a) => acc + (a.sloc || 0), 0)
                    .toLocaleString()}{" "}
                  SLOC
                </span>
              </div>
            </div>
          </div>

          {/* Quick Intake Action Card */}
          <div className="p-5 rounded-[4px] bg-bg-panel-raised border border-border-hairline space-y-4 shrink-0 lg:w-80">
            <div className="space-y-1">
              <div className="font-mono text-xs font-semibold text-text-primary">
                New Smart Contract Audit
              </div>
              <p className="text-xs text-text-muted">
                Upload .sol files or target Git repository for instant SLOC scoping and review quote.
              </p>
            </div>

            <Link href="/portal/new-request" className="block w-full">
              <Button
                variant="primary"
                className="w-full"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Start New Audit Request
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: TELEMETRY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
            <span>IN-FLIGHT AUDITS</span>
            <Radio className="h-3 w-3 text-accent-scan animate-pulse" />
          </div>
          <div className="text-2xl font-display font-bold text-accent-scan">
            {inFlightAudits.length}
          </div>
          <div className="text-[10px] font-mono text-text-muted">
            {inFlightAudits.filter((a) => normalizeStage(a.stage) === "scanning").length} Scanning ·{" "}
            {inFlightAudits.filter((a) => normalizeStage(a.stage) === "in-review").length} Manual ·{" "}
            {inFlightAudits.filter((a) => normalizeStage(a.stage) === "pending").length} Intake
          </div>
        </div>

        <div className="p-4 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
            <span>SECURED SLOC</span>
            <Layers className="h-3 w-3 text-text-muted" />
          </div>
          <div className="text-2xl font-display font-bold text-text-primary">
            {completedAudits.reduce((acc, a) => acc + (a.sloc || 0), 0).toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-text-muted">
            Solidity v0.8.18–v0.8.24
          </div>
        </div>

        <div className="p-4 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
            <span>VULNERABILITIES RESOLVED</span>
            <CheckCircle2 className="h-3 w-3 text-signal-resolved" />
          </div>
          <div className="text-2xl font-display font-bold text-signal-resolved">
            {totalResolved}
          </div>
          <div className="text-[10px] font-mono text-text-muted">
            0 Open Critical on Deployed Contracts
          </div>
        </div>

        <div className="p-4 rounded-[4px] bg-bg-panel border border-border-hairline space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
            <span>ATTESTED RELEASES</span>
            <FileCheck2 className="h-3 w-3 text-text-muted" />
          </div>
          <div className="text-2xl font-display font-bold text-text-primary">
            {completedAudits.length}
          </div>
          <div className="text-[10px] font-mono text-text-muted">
            Cryptographic SHA-256 Vault Signed
          </div>
        </div>
      </div>

      {/* SECTION 3: IN-FLIGHT ACTIVE AUDIT TRACKERS */}
      <section id="in-flight-cards" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-hairline pb-3">
          <div className="flex items-center gap-3">
            <Eyebrow size="sm" variant="scan" prefix="">
              IN_FLIGHT_ENGAGEMENTS // ACTIVE_PIPELINE
            </Eyebrow>
            <span className="text-xs text-text-muted hidden md:inline">
              · {inFlightAudits.length} Real-Time Trackers
            </span>
          </div>
          <div className="font-mono text-xs text-text-muted">
            AUTOMATED AST ENGINE & DUAL-AUDITOR WORKSPACE
          </div>
        </div>

        {inFlightAudits.length === 0 ? (
          <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline text-center font-mono text-xs text-text-muted space-y-2">
            <CheckCircle2 className="h-5 w-5 text-signal-resolved mx-auto" />
            <div>No active audit engagements in pipeline.</div>
            <Link href="/portal/new-request">
              <Button variant="primary" size="sm" className="mt-2">
                Start New Audit
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {inFlightAudits.map((audit) => {
              const ns = normalizeStage(audit.stage);
              const sn = audit.stageNumber || stageNumber(audit.stage);
              return (
                <div
                  key={audit.id}
                  id={`card-${audit.id}`}
                  className="rounded-[4px] border border-border-hairline bg-bg-panel overflow-hidden transition-colors hover:border-hairline/90"
                >
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-hairline bg-bg-void/40">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-accent-scan">
                          {audit.id}
                        </span>
                        <h3 className="font-display text-base font-semibold text-text-primary">
                          {audit.protocolName}
                        </h3>
                        <span className="font-mono text-xs text-text-muted">
                          ({audit.contractFileName})
                        </span>
                        <StatusPill status={ns} size="sm" />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-muted">
                        {audit.contractAddress && (
                          <span>
                            ADDR: {audit.contractAddress.slice(0, 10)}...
                            {audit.contractAddress.slice(-6)}
                          </span>
                        )}
                        <span>·</span>
                        <span>SCOPE: {(audit.sloc || 0).toLocaleString()} SLOC</span>
                        <span>·</span>
                        <span>SUBMITTED: {audit.submittedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <Link href={`/portal/track/${audit.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          rightIcon={<ExternalLink className="h-3 w-3" />}
                        >
                          Live Status Tracker
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Pipeline Steps */}
                  <div className="border-b border-border-hairline bg-bg-void/70 px-6 py-3.5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { num: 1, label: "01 INTAKE" },
                        { num: 2, label: "02 SCAN" },
                        { num: 3, label: "03 MANUAL" },
                        { num: 4, label: "04 ATTEST" },
                      ].map(({ num, label }) => (
                        <div key={num} className="flex items-center gap-2">
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                              sn === num
                                ? "bg-accent-scan text-bg-void animate-pulse"
                                : sn > num
                                ? "bg-bg-panel-raised border border-accent-scan text-accent-scan"
                                : "bg-bg-panel border border-border-hairline text-text-muted"
                            }`}
                          >
                            {sn > num ? "✓" : `0${num}`}
                          </div>
                          <div
                            className={`font-mono text-[11px] whitespace-nowrap ${
                              sn === num
                                ? "font-bold text-accent-scan"
                                : sn > num
                                ? "font-medium text-text-primary"
                                : "text-text-muted"
                            }`}
                          >
                            {label}
                          </div>
                          {num < 4 && (
                            <div
                              className={`hidden md:block flex-1 h-[2px] ml-2 ${
                                sn > num
                                  ? "bg-accent-scan"
                                  : sn === num
                                  ? "border-b-2 border-dashed border-accent-scan"
                                  : "bg-border-hairline"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono text-text-muted bg-bg-panel/50">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-accent-scan">›</span>
                      <span className="text-text-primary truncate">
                        {audit.currentActivity || "Processing audit pipeline…"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-[11px]">
                      {audit.assignedAuditor && (
                        <div>
                          LEAD:{" "}
                          <span className="text-text-primary">{audit.assignedAuditor}</span>
                        </div>
                      )}
                      {audit.estimatedCompletion && (
                        <div>
                          ETA:{" "}
                          <span className="text-accent-scan">{audit.estimatedCompletion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 4: AUDIT PORTFOLIO & HISTORICAL ARCHIVE TABLE */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-hairline pb-3">
          <div>
            <Eyebrow size="sm" prefix="">
              AUDIT_ARCHIVE // ENGAGEMENT_RECORDS
            </Eyebrow>
            <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary">
              Audit Engagement Records
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center overflow-x-auto rounded-[4px] border border-border-hairline bg-bg-panel p-0.5 font-mono text-xs w-full sm:w-auto">
              {[
                { id: "past", label: `PAST AUDITS (${pastAudits.length})` },
                { id: "in-flight", label: `IN-FLIGHT (${inFlightAudits.length})` },
                { id: "all", label: `ALL (${audits.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStage(tab.id)}
                  className={`px-2.5 py-1 rounded-[2px] transition-colors whitespace-nowrap ${
                    filterStage === tab.id
                      ? "bg-bg-panel-raised text-accent-scan font-semibold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-56">
              <Input
                placeholder="Filter by protocol or 0x..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
              />
            </div>
          </div>
        </div>

        {filteredAudits.length === 0 ? (
          <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline text-center font-mono text-xs text-text-muted">
            No engagements match your filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Ticket ID</TableHead>
                <TableHead>Protocol Target</TableHead>
                <TableHead className="w-28">Scope</TableHead>
                <TableHead className="w-36">Status</TableHead>
                <TableHead className="w-48">Findings</TableHead>
                <TableHead className="w-40">Timeline</TableHead>
                <TableHead className="w-28 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.map((audit) => {
                const ns = normalizeStage(audit.stage);
                const isInFlight =
                  ns === "scanning" || ns === "in-review" || ns === "pending";
                return (
                  <TableRow key={audit.id} className={isInFlight ? "bg-bg-panel/20" : ""}>
                    <TableCell className="font-mono text-xs text-accent-scan font-medium">
                      {audit.id}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-medium text-text-primary flex items-center gap-2">
                          {audit.protocolName}
                          <span className="font-mono text-xs text-text-muted">
                            ({audit.contractFileName})
                          </span>
                        </div>
                        {audit.contractAddress && (
                          <div className="font-mono text-xs text-text-muted truncate max-w-xs">
                            {audit.contractAddress}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-text-muted">
                      {(audit.sloc || 0).toLocaleString()} SLOC
                    </TableCell>

                    <TableCell>
                      <StatusPill status={ns} size="sm" />
                    </TableCell>

                    <TableCell>
                      {ns === "completed" ? (
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          {(audit.findings?.critical ?? 0) > 0 && (
                            <Badge severity="critical" size="sm">
                              {audit.findings!.critical} CRIT
                            </Badge>
                          )}
                          {(audit.findings?.high ?? 0) > 0 && (
                            <Badge severity="high" size="sm">
                              {audit.findings!.high} HIGH
                            </Badge>
                          )}
                          {(audit.findings?.resolved ?? 0) > 0 && (
                            <Badge severity="resolved" size="sm">
                              {audit.findings!.resolved} RESOLVED
                            </Badge>
                          )}
                        </div>
                      ) : ns === "failed" ? (
                        <span className="font-mono text-[11px] text-signal-critical">
                          COMPILATION_ERROR
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-accent-scan flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent-scan animate-pulse" />
                          In-Flight (Active Tracker ↑)
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-text-muted">
                      {audit.completedAt || audit.submittedAt}
                    </TableCell>

                    <TableCell className="text-right">
                      {ns === "completed" ? (
                        <Link href={`/portal/vault#${audit.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            rightIcon={<Download className="h-3 w-3" />}
                          >
                            Report
                          </Button>
                        </Link>
                      ) : ns === "failed" ? (
                        <Link href="/portal/new-request">
                          <Button size="sm" variant="danger">
                            Resubmit
                          </Button>
                        </Link>
                      ) : (
                        <a href={`#card-${audit.id}`}>
                          <Button
                            size="sm"
                            variant="secondary"
                            rightIcon={<ExternalLink className="h-3 w-3" />}
                          >
                            View Card
                          </Button>
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>

      {/* SECTION 5: RECENT ATTESTATIONS QUICK VAULT */}
      {completedAudits.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border-hairline pb-3">
            <Eyebrow size="sm" prefix="// DOCUMENT_VAULT · ">
              VERIFIED_ATTESTATION_REGISTRY
            </Eyebrow>
            <Link href="/portal/vault" className="font-mono text-xs text-accent-scan hover:underline">
              VIEW FULL VAULT →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedAudits.slice(0, 4).map((cert) => (
              <div
                key={cert.id}
                className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-4 relative"
              >
                <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-signal-resolved" />
                    <span className="font-mono text-xs font-semibold text-text-primary">
                      {cert.id} // {cert.protocolName}
                    </span>
                  </div>
                  <Badge severity="resolved" size="sm">
                    SHA-256 VERIFIED
                  </Badge>
                </div>

                {cert.bytecodeHash && (
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-text-muted text-[11px]">
                      <span>DEPLOYED BYTECODE HASH:</span>
                      <span className="text-signal-resolved">IMMUTABLE</span>
                    </div>
                    <div className="p-2 rounded-[2px] bg-bg-void border border-border-hairline text-[11px] text-accent-scan truncate">
                      {cert.bytecodeHash}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-xs font-mono text-text-muted">
                  <span>
                    AUDITED BY: {cert.assignedAuditor || "Zyron Auditor"}{" "}
                    {cert.peerAuditor ? `& ${cert.peerAuditor}` : ""}
                  </span>
                  <Link href={`/portal/vault#${cert.id}`}>
                    <Button size="sm" variant="outline" rightIcon={<Download className="h-3 w-3" />}>
                      Download PDF
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
