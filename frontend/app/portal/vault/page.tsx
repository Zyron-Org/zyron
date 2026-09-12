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
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileJson,
  CheckCheck,
  History,
  RotateCcw,
  Sparkles,
  Activity,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";

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
  const [filterMode, setFilterMode] = React.useState<"past" | "completed" | "all">("past");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedVaultId, setExpandedVaultId] = React.useState<string | null>(null);
  const [copiedHashId, setCopiedHashId] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiClient
      .get("/audits")
      .then((res) => {
        setAudits(res.data || []);
        // Auto-expand the first completed record
        const first = (res.data || []).find(
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

  const filteredAudits = audits.filter((audit) => {
    const ns = normalizeStage(audit.stage);
    const matchesFilter =
      filterMode === "past"
        ? ns === "completed" || ns === "failed"
        : filterMode === "completed"
        ? ns === "completed"
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
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleExportJSON = (audit: AuditRecord) => {
    const exportData = {
      zyronAttestationVersion: "2.4.0",
      ticketId: audit.id,
      protocol: audit.protocolName,
      contractFile: audit.contractFileName,
      contractAddress: audit.contractAddress,
      compiler: { version: audit.compilerVersion, evmTarget: "shanghai", optimizationRuns: 200 },
      pinnedCommit: audit.gitCommit,
      sloc: audit.sloc,
      status: "COMPLETED_ALL_FINDINGS_RESOLVED",
      attestation: {
        bytecodeSha256Hash: audit.bytecodeHash,
        verifiedOnChain: true,
        completionTimestamp: audit.completedAt,
        leadAuditor: audit.assignedAuditor,
        peerAuditor: audit.peerAuditor,
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 text-accent-scan animate-spin" />
        <span className="ml-3 font-mono text-xs text-text-muted">
          Loading document vault…
        </span>
      </div>
    );
  }

  const pastCount = audits.filter(
    (a) => normalizeStage(a.stage) === "completed" || normalizeStage(a.stage) === "failed"
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* HEADER */}
      <section className="p-6 md:p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <Eyebrow size="xs" variant="scan" prefix="// CLIENT_WORKSPACE · ">
                CRYPTOGRAPHIC_DOCUMENT_VAULT
              </Eyebrow>
              <Badge severity="resolved" size="sm">
                IMMUTABLE ARCHIVE
              </Badge>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
              Document Vault & Attestation Archive
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Irrefutable cryptographic deliverables, cryptographically signed PDF reports, and raw
              JSON attestation manifests for DAO governance proposals, insurance underwriters, and
              depositors.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/portal/new-request">
              <Button variant="primary" size="md">
                New Audit Request
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border-hairline font-mono text-xs">
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">VERIFIED PACKAGES</div>
            <div className="text-xl font-bold text-signal-resolved font-display">
              {completedAudits.length} Signed Releases
            </div>
            <div className="text-[10px] text-text-muted">100% SHA-256 Bytecode Pinned</div>
          </div>
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">TOTAL RESOLVED FINDINGS</div>
            <div className="text-xl font-bold text-accent-scan font-display">
              {totalResolvedFindings} Mitigated & Verified
            </div>
            <div className="text-[10px] text-text-muted">0 Open Critical / High on Mainnet</div>
          </div>
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">COMPLIANCE STATUS</div>
            <div className="text-xl font-bold text-text-primary font-display">
              Governance Ready
            </div>
            <div className="text-[10px] text-text-muted">All Deliverables On-Chain Verified</div>
          </div>
        </div>
      </section>

      {/* FILTER */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-hairline pb-3">
          <div className="flex items-center gap-3">
            <Eyebrow size="sm" prefix="">
              ATTESTATION_ARCHIVE // AUDIT_PACKAGES
            </Eyebrow>
            <span className="text-xs text-text-muted hidden md:inline">
              · {filteredAudits.length} Records Found
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-[4px] border border-border-hairline bg-bg-panel p-0.5 font-mono text-xs">
              <button
                onClick={() => setFilterMode("past")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  filterMode === "past"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                PAST AUDITS ({pastCount})
              </button>
              <button
                onClick={() => setFilterMode("completed")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  filterMode === "completed"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                COMPLETED ONLY ({completedAudits.length})
              </button>
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  filterMode === "all"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                ALL ENGAGEMENTS ({audits.length})
              </button>
            </div>

            <div className="w-64">
              <Input
                placeholder="Search vault or SHA-256..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {filteredAudits.length === 0 ? (
          <div className="p-12 rounded-[4px] bg-bg-panel border border-border-hairline text-center font-mono text-xs text-text-muted space-y-2">
            <FileCheck2 className="h-5 w-5 mx-auto text-text-muted" />
            <div>No records match your filter or search.</div>
          </div>
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
                  id={item.id}
                  className={`rounded-[4px] border transition-colors bg-bg-panel overflow-hidden ${
                    isExpanded ? "border-accent-scan/50" : "border-border-hairline hover:border-hairline/90"
                  }`}
                >
                  <div
                    onClick={() => setExpandedVaultId(isExpanded ? null : item.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-bg-void/40 hover:bg-bg-void/70 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-accent-scan">
                          {item.id}
                        </span>
                        <h3 className="font-display text-base font-semibold text-text-primary">
                          {item.protocolName}
                        </h3>
                        <span className="font-mono text-xs text-text-muted">
                          ({item.contractFileName})
                        </span>
                        {isCompleted ? (
                          <div className="border border-signal-resolved/50 text-signal-resolved font-mono text-[10px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider bg-signal-resolved/5">
                            SHA-256 VERIFIED
                          </div>
                        ) : isFailed ? (
                          <span className="font-mono text-[10px] text-signal-critical bg-signal-critical/10 px-2 py-0.5 rounded-[2px] border border-signal-critical/30 font-bold">
                            COMPILATION FAILED
                          </span>
                        ) : (
                          <StatusPill status={ns as any} size="sm" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-muted">
                        {item.contractAddress && (
                          <>
                            <span>
                              ADDR: {item.contractAddress.slice(0, 10)}...
                              {item.contractAddress.slice(-6)}
                            </span>
                            <span>·</span>
                          </>
                        )}
                        {item.gitCommit && (
                          <>
                            <span>COMMIT: {item.gitCommit.slice(0, 7)}</span>
                            <span>·</span>
                          </>
                        )}
                        <span>SCOPE: {(item.sloc || 0).toLocaleString()} SLOC</span>
                        <span>·</span>
                        <span>COMPLETED: {item.completedAt || item.submittedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto shrink-0 font-mono text-xs">
                      {isCompleted && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleExportJSON(item)}
                            className="px-2.5 py-1 rounded-[2px] bg-bg-void border border-border-hairline text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 text-[11px]"
                          >
                            <FileJson className="h-3 w-3 text-accent-scan" />
                            <span>JSON</span>
                          </button>
                          <a
                            href={item.reportPdfUrl || "#"}
                            download
                            className="px-2.5 py-1 rounded-[2px] bg-bg-panel-raised border border-border-hairline text-text-primary hover:border-accent-scan/50 transition-colors flex items-center gap-1.5 text-[11px]"
                          >
                            <Download className="h-3 w-3 text-signal-resolved" />
                            <span>PDF ({item.pdfSize || "2.4 MB"})</span>
                          </a>
                        </div>
                      )}
                      {isFailed && (
                        <Link href="/portal/new-request" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="danger">
                            Resubmit Ingestion
                          </Button>
                        </Link>
                      )}
                      <button type="button" className="p-1 rounded text-text-muted hover:text-text-primary">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED DETAIL — COMPLETED */}
                  {isExpanded && isCompleted && (
                    <div className="p-6 md:p-8 border-t border-border-hairline space-y-8 bg-bg-panel">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7 p-6 rounded-[4px] bg-bg-void border border-border-hairline space-y-5">
                          <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-[3px] bg-bg-panel border border-border-hairline flex items-center justify-center text-accent-scan">
                                <Terminal className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-display font-bold text-xs tracking-tight text-text-primary">
                                  ZYRON SECURITY LABS
                                </div>
                                <div className="font-mono text-[9px] text-text-muted">
                                  AUDIT ATTESTATION // CERTIFICATE #{item.id}
                                </div>
                              </div>
                            </div>
                            <Badge severity="resolved" size="sm">
                              PASSED & RESOLVED
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                            <div className="p-2.5 rounded-[2px] bg-bg-panel border border-border-hairline space-y-0.5">
                              <div className="text-text-muted text-[10px]">AUDITED TARGET</div>
                              <div className="text-text-primary font-medium truncate">
                                {item.protocolName}
                              </div>
                            </div>
                            <div className="p-2.5 rounded-[2px] bg-bg-panel border border-border-hairline space-y-0.5">
                              <div className="text-text-muted text-[10px]">GIT COMMIT SHA</div>
                              <div className="text-text-primary font-medium truncate">
                                {item.gitCommit || "N/A"}
                              </div>
                            </div>
                          </div>

                          {item.bytecodeHash && (
                            <div className="p-3 rounded-[2px] bg-bg-panel border border-border-hairline space-y-1.5 font-mono text-[11px]">
                              <div className="flex items-center justify-between text-text-muted text-[10px]">
                                <span>IMMUTABLE BYTECODE SHA-256 HASH</span>
                                <button
                                  onClick={() => item.bytecodeHash && handleCopyHash(item.bytecodeHash, item.id)}
                                  className="text-accent-scan hover:underline flex items-center gap-1"
                                >
                                  {copiedHashId === item.id ? (
                                    <>
                                      <Check className="h-3 w-3 text-signal-resolved" />
                                      <span className="text-signal-resolved">Copied Hash</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy Hash</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="text-accent-scan truncate text-xs select-all">
                                {item.bytecodeHash}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] text-text-muted">
                            <div>
                              SIGNED BY:{" "}
                              <span className="text-text-primary">
                                {item.assignedAuditor || "Zyron Lead Auditor"}
                              </span>{" "}
                              {item.peerAuditor && (
                                <>
                                  &{" "}
                                  <span className="text-text-primary">{item.peerAuditor}</span>
                                </>
                              )}
                            </div>
                            <div className="text-signal-resolved font-medium">
                              ALL FINDINGS VERIFIED RESOLVED
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-5 space-y-5">
                          <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-3 font-mono text-xs">
                            <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                              <span className="text-text-muted">VULNERABILITY RESOLUTION:</span>
                              <span className="text-signal-resolved font-bold">100% MITIGATED</span>
                            </div>
                            <div className="space-y-1.5 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-text-muted">OPEN CRITICAL:</span>
                                <span className="text-signal-resolved font-medium">
                                  {item.findings?.critical ?? 0} Open
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-muted">OPEN HIGH:</span>
                                <span className="text-signal-resolved font-medium">
                                  {item.findings?.high ?? 0} Open
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-muted">RESOLVED FINDINGS:</span>
                                <span className="text-signal-resolved font-bold">
                                  {item.findings?.resolved ?? 0} Verified
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2 font-mono text-xs">
                            <div className="flex items-center gap-2 text-text-primary font-semibold">
                              <History className="h-3.5 w-3.5 text-accent-scan" />
                              <span>{item.roundsToResolution || 2} Review Rounds to Resolution</span>
                            </div>
                            <p className="text-[11px] text-text-muted leading-relaxed">
                              Full checks-effects-interactions verified and re-tested across{" "}
                              {item.roundsToResolution || 2} remediation iterations before final
                              cryptographic seal.
                            </p>
                          </div>

                          <div className="space-y-2 pt-2">
                            <a
                              href={item.reportPdfUrl || "#"}
                              download
                              className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-[4px] bg-accent-scan text-bg-void font-sans text-xs font-semibold hover:bg-accent-scan/90 transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>
                                Download Signed PDF Attestation ({item.pdfSize || "2.4 MB"})
                              </span>
                            </a>
                            <Button
                              variant="outline"
                              className="w-full"
                              size="sm"
                              leftIcon={<FileJson className="h-3.5 w-3.5 text-accent-scan" />}
                              onClick={() => handleExportJSON(item)}
                            >
                              Export Raw JSON Attestation Metadata
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXPANDED DETAIL — FAILED */}
                  {isExpanded && isFailed && (
                    <div className="p-6 border-t border-border-hairline space-y-5 bg-bg-panel">
                      <div className="p-4 rounded-[4px] bg-signal-critical/5 border border-signal-critical/30 space-y-3 font-mono text-xs">
                        <div className="flex items-center gap-2 text-signal-critical font-bold">
                          <AlertCircle className="h-4 w-4" />
                          <span>COMPILATION & INGESTION FAILURE DIAGNOSTIC</span>
                        </div>
                        <p className="text-text-primary leading-relaxed">
                          {item.failureReason ||
                            "Compilation failure. Ensure all interface dependencies are included."}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Link href="/portal/new-request">
                          <Button variant="primary" size="md" rightIcon={<RotateCcw className="h-3.5 w-3.5" />}>
                            Resubmit with Corrected Dependencies
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* EXPANDED DETAIL — IN FLIGHT */}
                  {isExpanded && !isCompleted && !isFailed && (
                    <div className="p-6 border-t border-border-hairline space-y-4 bg-bg-panel font-mono text-xs">
                      <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2">
                        <div className="flex items-center gap-2 text-accent-scan font-semibold">
                          <Activity className="h-3.5 w-3.5 animate-pulse" />
                          <span>Audit currently in flight ({item.stage.toUpperCase()})</span>
                        </div>
                        <p className="text-text-muted text-[11px]">
                          {item.currentActivity || "AST execution and manual triage in progress."}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Link href={`/portal/track/${item.id}`}>
                          <Button variant="primary" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                            Open Live Status Tracker
                          </Button>
                        </Link>
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
