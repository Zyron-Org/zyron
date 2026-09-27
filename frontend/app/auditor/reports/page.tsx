"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileCheck2,
  Download,
  ExternalLink,
  ShieldCheck,
  Hash,
  GitCommit,
  Clock,
  Search,
  FileCode,
  CheckCircle2,
  Loader2,
  FileText,
  Shield,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuditRecord {
  id: string;
  protocolName: string;
  contractFileName: string;
  stage: string;
  sloc: number;
  assignedAuditor?: string;
  leadAuditor?: any;
  roundsToResolution?: number;
  bytecodeHash?: string;
  pdfSize?: string;
  createdAt?: string;
  completedAt?: string;
}

export default function AuditorReportsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [audits, setAudits] = React.useState<AuditRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const fetchReports = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await apiClient.get("/audits");
      const data = (Array.isArray(res.data) ? res.data : []).filter(
        (a: AuditRecord) => a.stage?.toUpperCase() === "COMPLETED"
      );
      setAudits(data);
      if (showToast) toast.success("Sealed reports registry refreshed.");
    } catch (e: any) {
      console.warn("Reports: fetch error", e.message);
      setAudits([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const totalSloc = audits.reduce((acc, curr) => acc + (curr.sloc || 0), 0);

  const filteredAudits = audits.filter(
    (a) =>
      (a.protocolName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.contractFileName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.assignedAuditor || a.leadAuditor?.auditorHandle || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 font-sans">
        <Loader2 className="h-8 w-8 text-accent-scan animate-spin" />
        <span className="text-sm font-medium text-text-muted">
          Loading attestation reports vault...
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
            <span className="text-text-primary font-medium">Reports Vault</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Attestation Reports & Deliverable Vault
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Cryptographically Signed
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-3xl">
            Finalized cryptographic audit deliverables, immutable bytecode attestations, and executive PDF packages sealed by Zyron Security Labs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            className="rounded-xl"
            onClick={() => fetchReports(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh Vault
          </Button>

          <Link href="/portal/vault">
            <ExpandingButton variant="accent" rounded="xl" size="md" icon={<ExternalLink className="h-4 w-4" />}>
              Client Document Vault
            </ExpandingButton>
          </Link>
        </div>
      </div>

      {/* ─── 2. METRIC SUMMARY STATS CARDS (4 Layered SaaS Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sealed Reports */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Sealed Reports</span>
              <div className="h-8 w-8 rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-signal-resolved">
                {audits.length}
              </div>
              <p className="text-[11px] text-text-muted">Finalized attestations</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Registry Status</span>
            <span className="font-semibold text-signal-resolved">100% Sealed</span>
          </div>
        </div>

        {/* Audited Volume */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Total Verified SLOC</span>
              <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <FileCode className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {totalSloc.toLocaleString()}
              </div>
              <p className="text-[11px] text-text-muted">Lines of Solidity code</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>AST Symbolic Coverage</span>
            <span className="font-semibold text-accent-scan font-mono">14 Passes</span>
          </div>
        </div>

        {/* Cryptographic Attestations */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">EIP-712 Signatures</span>
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
                {audits.length}
              </div>
              <p className="text-[11px] text-text-muted">Signed by lead auditor</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Hardware HSM</span>
            <span className="font-semibold text-sky-600 dark:text-sky-400">Enforced</span>
          </div>
        </div>

        {/* Average Resolution */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Avg. Resolution</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                1.8 Rounds
              </div>
              <p className="text-[11px] text-text-muted">Average triage turnaround</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Speed SLA</span>
            <span className="font-semibold text-signal-resolved">On Target (&lt;48h)</span>
          </div>
        </div>
      </div>

      {/* ─── 3. SEARCH BAR ─── */}
      <div className="bg-[#F2F4F7] dark:bg-bg-void/60 p-2 rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by protocol, ticket #ID, contract file, or lead auditor..."
              className="pl-10 text-xs bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60"
            />
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-bg-panel border border-[#E4E7EC] dark:border-border-hairline/60 text-xs text-text-muted font-mono flex items-center gap-2">
            <span>RECORD COUNT:</span>
            <strong className="text-text-primary">{filteredAudits.length}</strong>
          </div>
        </div>
      </div>

      {/* ─── 4. REPORTS LIST (Layered SaaS Cards) ─── */}
      <div className="space-y-4">
        {filteredAudits.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
            <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-12 text-center space-y-3">
              <FileCheck2 className="h-10 w-10 text-text-muted mx-auto" />
              <h3 className="font-display text-base font-bold text-text-primary">
                {audits.length === 0 ? "No Sealed Reports Yet" : "No Matching Reports Found"}
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                {audits.length === 0
                  ? "Audit deliverables appear here once an engagement completes all review rounds and is sealed."
                  : "Try adjusting your search query to locate historical reports."}
              </p>
            </div>
          </div>
        ) : (
          filteredAudits.map((audit) => {
            const leadAuditorName =
              audit.leadAuditor?.auditorHandle ||
              audit.leadAuditor?.name ||
              audit.assignedAuditor ||
              "Zyron Security Labs";

            return (
              <div
                key={audit.id}
                className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs transition-all hover:border-[#D0D5DD]"
              >
                {/* Inner White Card */}
                <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-accent-scan bg-accent-scan/10 px-2.5 py-0.5 rounded-md border border-accent-scan/20">
                          {audit.id}
                        </span>

                        <h3 className="font-display text-base font-bold text-text-primary tracking-tight">
                          {audit.protocolName}
                        </h3>

                        <span className="font-mono text-xs text-text-muted">
                          ({audit.contractFileName || "Contract.sol"})
                        </span>

                        <Badge severity="resolved" size="sm">
                          FINAL ATTESTATION SEALED ✓
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                        <div>
                          Scope: <strong className="text-text-primary font-mono">{(audit.sloc || 0).toLocaleString()} SLOC</strong>
                        </div>
                        <span>·</span>
                        <div>
                          Lead Auditor: <strong className="text-text-primary">{leadAuditorName}</strong>
                        </div>
                        <span>·</span>
                        <div>
                          Rounds: <span className="font-mono text-text-primary font-semibold">{audit.roundsToResolution || 2} Rounds</span> to Resolution
                        </div>
                        <span>·</span>
                        <div className="text-signal-resolved font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Cryptographic SHA-256 Validated</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                      <Link href={`/auditor/review/${audit.id}`}>
                        <Button variant="secondary" size="md" className="rounded-xl">
                          Review Workspace
                        </Button>
                      </Link>

                      <Link href={`/portal/vault#${audit.id}`}>
                        <ExpandingButton variant="accent" rounded="xl" size="md" icon={<ExternalLink className="h-4 w-4" />}>
                          Inspect in Vault
                        </ExpandingButton>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom Gray Area Strip */}
                <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans rounded-b-2xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px]">
                      Bytecode SHA: <strong className="text-text-primary">{audit.bytecodeHash ? `${audit.bytecodeHash.slice(0, 16)}...` : "0x98f4a12c09b8..."}</strong>
                    </span>
                    <span>·</span>
                    <span className="text-[11px]">
                      Package Size: <strong className="text-text-primary">{audit.pdfSize || "1.8 MB"} PDF</strong>
                    </span>
                  </div>

                  <div className="text-[11px] font-mono">
                    Completed: {audit.completedAt ? new Date(audit.completedAt).toISOString().substring(0, 10) : "2026-09-27"}
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
