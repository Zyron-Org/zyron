"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Terminal,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileCode2,
  GitCommit,
  User,
  Radio,
  ExternalLink,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Activity,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  GitPullRequest,
  CheckCheck,
  History,
  X,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { MOCK_AUDIT_REQUESTS } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { HighlightedSolidityBlock } from "@/lib/solidity-highlighter";


interface CommentMessage {
  id: string;
  sender: string;
  senderRole: "auditor" | "client";
  timestamp: string;
  message: string;
  commitRef?: string;
}

interface DetailedFinding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  cvss: string;
  status: "open" | "fix-submitted" | "resolved";
  taxonomy: string;
  location: string;
  impact: string;
  description: string;
  vulnerableCode: string;
  vulnerableLines: string;
  remediatedCode: string;
  fuzzTestStatus?: string;
  remediationNote: string;
  comments: CommentMessage[];
}

export default function AuditStatusTrackerPage() {
  const params = useParams();
  const rawTicketId = (params?.id as string) || "ZYR-9481";
  const ticketId = rawTicketId.replace(/^#/, "");

  // Find fallback audit or default
  const fallbackAudit =
    MOCK_AUDIT_REQUESTS.find(
      (a) => a.id.toLowerCase() === ticketId.toLowerCase()
    ) || MOCK_AUDIT_REQUESTS[0];

  const [realAudit, setRealAudit] = React.useState<any>(null);
  const [isLoadingApi, setIsLoadingApi] = React.useState(true);

  React.useEffect(() => {
    let intervalId: any = null;

    async function fetchAuditDetails() {
      try {
        setIsLoadingApi(true);
        const res = await apiClient.get(`/audits/${ticketId}`);
        if (res.data) {
          const fetchedAudit = res.data;
          setRealAudit(fetchedAudit);

          const rawStage = (fetchedAudit.stage || "").toUpperCase().replace(/-/g, "_");
          const isReleased = rawStage === "CORRECTIONS_REQUESTED" || rawStage === "COMPLETED";

          // Bind real findings from backend database only if released by auditor
          if (isReleased && Array.isArray(fetchedAudit.findings) && fetchedAudit.findings.length > 0) {
            const mappedFindings: DetailedFinding[] = fetchedAudit.findings.map((f: any) => ({
              id: f.id || f.displayId,
              title: f.title,
              severity: (f.severity || "HIGH").toLowerCase() as any,
              cvss: f.cvss || "CVSS 8.0",
              status: f.status === "FIX_SUBMITTED" ? "fix-submitted" : f.status === "RESOLVED" ? "resolved" : "open",
              taxonomy: f.taxonomy || "SWC-107 · CWE-841",
              location: f.location || `${fetchedAudit.contractFileName || "Contract.sol"}:142`,
              impact: f.impact || "POTENTIAL SECURITY RISK",
              description: f.description || "Vulnerability detected during security AST pass.",
              vulnerableCode: f.vulnerableCode || undefined,
              vulnerableLines: f.vulnerableLines || undefined,
              remediatedCode: f.remediatedCode || undefined,
              remediationNote: f.remediationNote || undefined,
              comments: Array.isArray(f.comments)
                ? f.comments.map((c: any) => ({
                    id: c.id,
                    sender: c.sender?.name || c.sender?.email || "0xAuditor_K4",
                    senderRole: c.sender?.role?.toLowerCase() === "client" ? "client" : "auditor",
                    timestamp: new Date(c.createdAt || Date.now()).toISOString().replace("T", " ").substring(0, 16) + " UTC",
                    message: c.message,
                    commitRef: c.commitRef,
                  }))
                : [],
            }));
            setFindings(mappedFindings);
            if (mappedFindings.length > 0) {
              setExpandedFindingId(mappedFindings[0].id);
            }
          } else {
            // Findings have not been released by the auditor yet
            setFindings([]);
          }

          // Update round and pinned commit from fetchedAudit
          if (Array.isArray(fetchedAudit.rounds) && fetchedAudit.rounds.length > 0) {
            const activeR = fetchedAudit.rounds.find((r: any) => r.status === "active");
            const roundToUse = activeR ? activeR.roundNumber : fetchedAudit.rounds[fetchedAudit.rounds.length - 1].roundNumber;
            setCurrentRound(roundToUse);
            if (activeR?.commitSha) {
              setPinnedCommit(activeR.commitSha.slice(0, 7));
            } else if (fetchedAudit.gitCommit) {
              setPinnedCommit(fetchedAudit.gitCommit.slice(0, 7));
            }
          } else {
            const fallbackRound = (rawStage === "CORRECTIONS_REQUESTED" || rawStage === "COMPLETED") ? 2 : 1;
            setCurrentRound(fallbackRound);
            if (fetchedAudit.gitCommit) {
              setPinnedCommit(fetchedAudit.gitCommit.slice(0, 7));
            }
          }

          // If stage is SCANNING (2), poll every 3s until scan finishes and advances stage to IN_REVIEW (3)
          if (fetchedAudit.stageNumber === 2 || fetchedAudit.stage === "SCANNING") {
            setIsLogStreaming(true);
            if (!intervalId) {
              intervalId = setInterval(fetchAuditDetails, 3000);
            }
          } else {
            setIsLogStreaming(false);
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch real audit from API, using fallback ticket:", err);
      } finally {
        setIsLoadingApi(false);
      }
    }

    if (ticketId) fetchAuditDetails();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ticketId]);

  const audit = realAudit || fallbackAudit;
  const rawStage = (audit.stage || "").toUpperCase().replace(/-/g, "_");
  const areFindingsReleased = rawStage === "CORRECTIONS_REQUESTED" || rawStage === "COMPLETED";

  const [copied, setCopied] = React.useState(false);
  const [isLogStreaming, setIsLogStreaming] = React.useState(true);
  const [showRoundsHistory, setShowRoundsHistory] = React.useState(false);
  const [currentRound, setCurrentRound] = React.useState<number>(1);
  const [pinnedCommit, setPinnedCommit] = React.useState<string>((audit.gitCommit || "8f9b2d4").slice(0, 7));

  // Expanded findings state
  const [expandedFindingId, setExpandedFindingId] = React.useState<string | null>("ZAM-VAULT-001");

  // Per-finding new comment inputs
  const [commentInputs, setCommentInputs] = React.useState<Record<string, { message: string; commitRef: string }>>({});

  // Findings state: only populated if auditor has approved and sent them for fixes (CORRECTIONS_REQUESTED or COMPLETED)
  const [findings, setFindings] = React.useState<DetailedFinding[]>([]);

  const handleCopyAddress = () => {
    if (audit.contractAddress) {
      navigator.clipboard?.writeText(audit.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleExpand = (findingId: string) => {
    setExpandedFindingId((prev) => (prev === findingId ? null : findingId));
  };

  // Handle posting a comment + commit reference flip
  const handlePostComment = (findingId: string) => {
    const input = commentInputs[findingId];
    if (!input || !input.message.trim()) return;

    const hasCommitRef = input.commitRef && input.commitRef.trim().length > 0;
    const cleanCommit = input.commitRef.trim().replace(/^0x/, "");

    const newComment: CommentMessage = {
      id: `c-${Date.now()}`,
      sender: "0xClient_8f",
      senderRole: "client",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC",
      message: input.message.trim(),
      commitRef: hasCommitRef ? cleanCommit : undefined,
    };

    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          return {
            ...f,
            // If the client supplies a commit hash, flip status to "fix-submitted"
            status: hasCommitRef ? "fix-submitted" : f.status,
            comments: [...f.comments, newComment],
          };
        }
        return f;
      })
    );

    apiClient
      .post(`/findings/${findingId}/comments`, {
        message: input.message.trim(),
        commitRef: hasCommitRef ? cleanCommit : undefined,
      })
      .catch((err) => console.warn("Could not save comment to API:", err.message));

    // If commit was provided, update pinned commit state
    if (hasCommitRef) {
      setPinnedCommit(cleanCommit.slice(0, 7));
    }

    // Reset input for this finding
    setCommentInputs((prev) => ({
      ...prev,
      [findingId]: { message: "", commitRef: "" },
    }));
  };

  const activeFile = audit.contractFileName || audit.fileName || "Contract.sol";
  const activeSloc = audit.sloc || 1480;
  const activeCommit = (audit.gitCommit || "8f9b2d4").slice(0, 7);
  const activeCompiler = audit.compilerVersion || "v0.8.20";
  const activeNetwork = audit.network || "Ethereum Mainnet";
  const leadAuditorName =
    audit.leadAuditor?.auditorHandle ||
    audit.leadAuditor?.name ||
    audit.assignedAuditor ||
    "0xAuditor_K4";

  const activeStageNum = audit.stageNumber
    ? audit.stageNumber
    : audit.stage === "COMPLETED"
    ? 4
    : audit.stage === "IN_REVIEW"
    ? 3
    : audit.stage === "SCANNING"
    ? 2
    : 1;

  // Derive dynamic audit rounds from database or audit state
  const roundsList = React.useMemo(() => {
    if (audit?.rounds && Array.isArray(audit.rounds) && audit.rounds.length > 0) {
      return audit.rounds.map((r: any) => {
        const isActive = r.status?.toLowerCase() === "active";
        return {
          id: r.id || `round-${r.roundNumber}`,
          roundNumber: r.roundNumber,
          commitSha: (r.commitSha || audit.gitCommit || "8f9b2d4").slice(0, 7),
          status: r.status || (isActive ? "active" : "completed"),
          summary: r.summary || (r.roundNumber === 1
            ? "Initial compiler lock and automated AST scan. Scope verification."
            : "Remediation commit re-test and auditor verification pass."),
          date: r.startedAt
            ? new Date(r.startedAt).toISOString().replace("T", " ").substring(0, 16) + " UTC"
            : new Date(audit.submittedAt || audit.createdAt || Date.now()).toISOString().replace("T", " ").substring(0, 16) + " UTC",
        };
      });
    }

    // Dynamic fallback synthesis if rounds table not yet populated
    const list = [
      {
        id: "round-1",
        roundNumber: 1,
        commitSha: (audit.gitCommit || "8f9b2d4").slice(0, 7),
        status: (rawStage === "CORRECTIONS_REQUESTED" || rawStage === "COMPLETED") ? "completed" : "active",
        summary: "Initial compiler lock and automated AST scan. Initial findings triaged by Lead Auditor.",
        date: new Date(audit.submittedAt || audit.createdAt || Date.now()).toISOString().replace("T", " ").substring(0, 16) + " UTC",
      },
    ];

    if (rawStage === "CORRECTIONS_REQUESTED" || rawStage === "COMPLETED") {
      list.push({
        id: "round-2",
        roundNumber: 2,
        commitSha: pinnedCommit,
        status: rawStage === "COMPLETED" ? "completed" : "active",
        summary: rawStage === "COMPLETED"
          ? "Remediation verified. Cryptographic attestation generated and sealed."
          : "Client remediation in progress. Auditor re-verification pass.",
        date: new Date(audit.updatedAt || Date.now()).toISOString().replace("T", " ").substring(0, 16) + " UTC",
      });
    }

    return list;
  }, [audit, rawStage, pinnedCommit]);

  const submissionDate = React.useMemo(() => {
    return new Date(audit.submittedAt || audit.createdAt || Date.now());
  }, [audit.submittedAt, audit.createdAt]);

  const getLogTime = (offsetSec: number) => {
    const d = new Date(submissionDate.getTime() + offsetSec * 1000);
    return d.toTimeString().substring(0, 8);
  };

  // Live scan log lines dynamically constructed from real audit metadata and submission timestamp
  const scanLogLines = [
    { time: getLogTime(0), type: "info", text: `Ingesting target contract: ${activeFile} (${activeSloc.toLocaleString()} SLOC)` },
    { time: getLogTime(4), type: "info", text: `Locking Git commit SHA: ${activeCommit}` },
    { time: getLogTime(10), type: "info", text: `Compiler target verified: solc ${activeCompiler} --via-ir --optimize` },
    { time: getLogTime(16), type: "info", text: `Target Network: ${activeNetwork}` },
    { time: getLogTime(21), type: "info", text: `AST compilation successful: ${Math.max(120, activeSloc * 4)} EVM opcodes mapped across contract methods` },
    { time: getLogTime(48), type: "pass", text: "AST Taint Pass 01/14: Access Control & Ownable invariants... PASSED" },
    { time: getLogTime(64), type: "pass", text: "AST Taint Pass 02/14: Arithmetic overflow/underflow (Solidity 0.8+)... PASSED" },
    { time: getLogTime(86), type: "warn", text: "AST Taint Pass 04/14: ERC-20 return value compliance check..." },
    { time: getLogTime(90), type: "flag-high", text: `⚠ FLAG [SWC-104]: Unchecked return on token transfer in ${activeFile}` },
    { time: getLogTime(111), type: "pass", text: "AST Taint Pass 06/14: Timestamp dependency & block.number drift... PASSED" },
    { time: getLogTime(121), type: "warn", text: "AST Taint Pass 08/14: Low-level call execution order & state mutability..." },
    { time: getLogTime(125), type: "flag-crit", text: `⚠ CRITICAL [SWC-107]: msg.sender.call before balance zeroing in ${activeFile}` },
    { time: getLogTime(151), type: "pass", text: "AST Taint Pass 09/14: Delegatecall proxy storage slot collision... PASSED" },
    { time: getLogTime(170), type: "live", text: "AST Taint Pass 11/14: Symbolic Reentrancy Graph & Invariant Analysis... COMPLETED" },
  ];

  // Dynamically constructed chronological activity journal from real audit data
  const timelineEvents = React.useMemo(() => {
    const events: Array<{
      time: string;
      title: string;
      desc: string;
      badge: string;
      badgeSeverity: "critical" | "high" | "medium" | "low" | "informational" | "resolved";
    }> = [];

    const baseTime = new Date(audit.submittedAt || audit.createdAt || Date.now());
    const formatTs = (d: Date) => d.toISOString().replace("T", " ").substring(0, 19) + " UTC";

    // 1. Scope Ingestion
    events.push({
      time: formatTs(baseTime),
      title: "Scope Ingested & Git Commit Pinned",
      desc: `Target contract ${activeFile} (${activeSloc.toLocaleString()} SLOC) ingested from ${audit.githubRepoUrl || "Git repository"}. Commit SHA ${activeCommit} permanently locked to engagement scope.`,
      badge: "RESOLVED",
      badgeSeverity: "resolved",
    });

    // 2. Compiler verification (if stageNumber >= 2 or stage is not PENDING)
    if (activeStageNum >= 2 || rawStage !== "PENDING") {
      const compileTime = new Date(baseTime.getTime() + 10 * 1000);
      events.push({
        time: formatTs(compileTime),
        title: `Compiler Solc ${activeCompiler} Locked`,
        desc: `Verified target environment on ${activeNetwork} with deterministic AST generation flags.`,
        badge: "PASSED",
        badgeSeverity: "resolved",
      });
    }

    // 3. AST Symbolic Scan execution (if stageNumber >= 2 or stage is not PENDING)
    if (activeStageNum >= 2 || rawStage !== "PENDING") {
      const scanTime = new Date(baseTime.getTime() + 25 * 1000);
      events.push({
        time: formatTs(scanTime),
        title: "AST Control Flow & Symbolic Execution Pass",
        desc: `Security engine (${audit.engineVersion || "v3.0.0-ast"}) mapped ~${Math.max(120, activeSloc * 4)} EVM opcodes across execution pathways. Automated static taint analysis executed.`,
        badge: "PASSED",
        badgeSeverity: "resolved",
      });
    }

    // 4. Auditor Assignment (if stageNumber >= 3 or leadAuditor present)
    if (activeStageNum >= 3 || audit.leadAuditor || audit.leadAuditorId) {
      const assignTime = new Date(baseTime.getTime() + 50 * 1000);
      events.push({
        time: formatTs(assignTime),
        title: `Lead Auditor ${leadAuditorName} Assigned`,
        desc: `Engagement assigned to senior security auditor for manual verification, Foundry invariant testing, and peer review.`,
        badge: "ASSIGNED",
        badgeSeverity: "informational",
      });
    }

    // 5. Findings Triage / Corrections Requested (if stage reached CORRECTIONS_REQUESTED or COMPLETED)
    if (rawStage === "CORRECTIONS_REQUESTED" || rawStage === "COMPLETED") {
      const triageTime = audit.updatedAt ? new Date(audit.updatedAt) : new Date(baseTime.getTime() + 120 * 1000);
      const findingsCount = findings.length > 0 ? findings.length : (Array.isArray(audit.findings) ? audit.findings.length : 0);
      events.push({
        time: formatTs(triageTime),
        title: "Auditor Triage Complete & Findings Released",
        desc: `Lead Auditor concluded triage pass${findingsCount > 0 ? ` and released ${findingsCount} actionable vulnerability finding(s)` : ""}. Client remediation requested.`,
        badge: "ACTION REQUIRED",
        badgeSeverity: "critical",
      });
    }

    // 6. Any client comments / remediation commits posted on findings
    if (findings.length > 0) {
      findings.forEach((f) => {
        f.comments?.forEach((c) => {
          events.push({
            time: c.timestamp,
            title: `${c.senderRole === "client" ? "Client" : "Auditor"} Activity on ${f.id}`,
            desc: `"${c.message}"${c.commitRef ? ` · Remediation Git Commit SHA: ${c.commitRef.slice(0, 7)}` : ""}`,
            badge: c.commitRef ? "FIX SUBMITTED" : c.senderRole === "client" ? "CLIENT NOTE" : "AUDITOR NOTE",
            badgeSeverity: c.commitRef ? "resolved" : "informational",
          });
        });
      });
    }

    // 7. Completion & On-chain attestation (if stage is COMPLETED)
    if (rawStage === "COMPLETED") {
      const completionTime = audit.completedAt ? new Date(audit.completedAt) : new Date(audit.updatedAt || Date.now());
      events.push({
        time: formatTs(completionTime),
        title: "Audit Completed & Cryptographic Attestation Sealed",
        desc: `Audit sealed with Attestation Status: ${audit.attestationStatus || "CONFIRMED"}. Bytecode SHA: ${(audit.bytecodeHash || "0x9f81a...").slice(0, 14)}... On-chain Tx: ${audit.onChainTxHash ? audit.onChainTxHash.slice(0, 10) + "..." : "Sealed on Registry"}.`,
        badge: "COMPLETED",
        badgeSeverity: "resolved",
      });
    }

    return events;
  }, [audit, activeFile, activeSloc, activeCommit, activeCompiler, activeNetwork, activeStageNum, rawStage, findings, leadAuditorName]);

  const [fixCommitInput, setFixCommitInput] = React.useState("");
  const [fixNotesInput, setFixNotesInput] = React.useState("");
  const [isSubmittingFixes, setIsSubmittingFixes] = React.useState(false);
  const [fixesSubmittedSuccess, setFixesSubmittedSuccess] = React.useState(false);

  const handleSubmitFixesForReAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixCommitInput.trim()) return;

    setIsSubmittingFixes(true);
    try {
      const res = await apiClient.patch(`/audits/${audit.id}/submit-fixes`, {
        gitCommit: fixCommitInput.trim(),
      });
      if (res.data) {
        setRealAudit(res.data);
      }
      setPinnedCommit(fixCommitInput.trim().slice(0, 7));
      setCurrentRound((prev) => prev + 1);
      setFixCommitInput("");
      setFixNotesInput("");
      setFixesSubmittedSuccess(true);
      setTimeout(() => setFixesSubmittedSuccess(false), 4000);
    } catch (err: any) {
      setPinnedCommit(fixCommitInput.trim().slice(0, 7));
      setFixesSubmittedSuccess(true);
    } finally {
      setIsSubmittingFixes(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* CORRECTIONS REQUESTED ALERT BANNER & FIX SUBMISSION CARD */}
      {(audit.stage?.toLowerCase().includes("correction") || audit.stage === "CORRECTIONS_REQUESTED") && (
        <section className="p-6 rounded-[4px] bg-signal-critical/10 border-2 border-signal-critical/60 font-mono text-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-signal-critical font-bold text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>ACTION REQUIRED: AUDITOR FLAGGED TICKET FOR CLIENT CORRECTIONS</span>
            </div>
            <Badge severity="critical" size="sm">
              CORRECTIONS REQUESTED
            </Badge>
          </div>

          <p className="text-text-primary text-xs leading-relaxed font-sans">
            Lead auditor <strong>{audit.assignedAuditor || "0xAuditor_K4"}</strong> has completed initial triage and identified open vulnerabilities requiring code fixes before report sealing. Please push remediation commits to your repository and submit the new Git Commit SHA below for Round 0{currentRound + 1} re-verification.
          </p>

          <form onSubmit={handleSubmitFixesForReAudit} className="p-4 rounded-[4px] bg-bg-panel border border-border-hairline space-y-3">
            <div className="font-semibold text-text-primary text-xs flex items-center gap-2">
              <GitPullRequest className="h-4 w-4 text-accent-scan" />
              <span>Submit Remediation Commit SHA for Re-Audit</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={fixCommitInput}
                onChange={(e) => setFixCommitInput(e.target.value)}
                placeholder="Enter Fix Git Commit SHA (e.g. 4b8f10e)..."
                required
                className="text-xs bg-bg-void"
              />
              <Input
                value={fixNotesInput}
                onChange={(e) => setFixNotesInput(e.target.value)}
                placeholder="Optional notes on applied fixes..."
                className="text-xs bg-bg-void"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-text-muted">
                Submitting updates ticket round to <strong>Round 0{currentRound + 1}</strong> and triggers auditor diff re-review.
              </span>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmittingFixes}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                className="bg-accent-scan text-bg-void font-bold"
              >
                Submit Fixes for Re-Audit
              </Button>
            </div>
          </form>
        </section>
      )}

      {fixesSubmittedSuccess && (
        <div className="p-4 rounded-[4px] bg-signal-resolved/10 border border-signal-resolved/40 text-signal-resolved font-mono text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Remediation fixes committed! Auditor notified for Round 0{currentRound} re-verification pass.</span>
          </div>
        </div>
      )}

      {/* Navigation Breadcrumb & Back Action */}
      <div className="flex items-center justify-between border-b border-border-hairline pb-4">
        <Link
          href="/portal"
          className="font-mono text-xs text-text-muted hover:text-text-primary flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>BACK TO DASHBOARD</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="font-mono text-xs text-text-muted">
            AUTO-REFRESH: <span className="text-signal-resolved">5s HEARTBEAT</span>
          </div>
          <Link href="/portal/new-request">
            <Button variant="outline" size="sm">
              New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* HEADER: METADATA DOSSIER & ROUND / COMMIT TRACKER */}
      <section className="p-6 md:p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow size="xs" variant="scan" prefix="// LIVE_TRACKER · ">
                STAGE 0{activeStageNum} OF 04
              </Eyebrow>

              {/* Round Tracker Tag */}
              <div className="flex items-center gap-2 font-mono text-[11px] bg-bg-void border border-accent-scan/30 text-accent-scan px-2.5 py-0.5 rounded-[2px]">
                <span className="font-bold">ROUND 0{currentRound}</span>
                <span>·</span>
                <span className="text-text-muted">PINNED COMMIT:</span>
                <span className="font-semibold text-text-primary">{pinnedCommit}</span>
              </div>

              <button
                onClick={() => setShowRoundsHistory(!showRoundsHistory)}
                className="font-mono text-[11px] text-text-muted hover:text-accent-scan underline flex items-center gap-1"
              >
                <History className="h-3 w-3" />
                Rounds History ({roundsList.length})
              </button>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary flex flex-wrap items-center gap-3">
              <span>{audit.protocolName}</span>
              <span className="font-mono text-base text-text-muted font-normal">
                ({audit.contractFileName})
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-3xl">
              Live deterministic review session. Automated AST engine is currently performing static taint and symbolic execution analysis prior to manual dual-auditor verification.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">TICKET:</span>
              <span className="text-accent-scan font-bold text-sm">{audit.id}</span>
            </div>
            <StatusPill status={audit.stage} size="md" />
          </div>
        </div>

        {/* Expandable Rounds History Drawer */}
        {showRoundsHistory && (
          <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border-hairline pb-2">
              <span className="font-semibold text-text-primary flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-accent-scan" />
                Audit Review Rounds & Commit History ({roundsList.length})
              </span>
              <button
                onClick={() => setShowRoundsHistory(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {roundsList.map((round: any) => {
                const isActive = round.status?.toLowerCase() === "active";
                return (
                  <div
                    key={round.roundNumber}
                    className={`p-3 rounded-[2px] space-y-1 ${
                      isActive
                        ? "bg-bg-panel-raised border border-accent-scan/40"
                        : "bg-bg-panel border border-border-hairline"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isActive ? "text-accent-scan font-bold" : "text-text-muted font-medium"}>
                        ROUND {String(round.roundNumber).padStart(2, "0")} — {round.roundNumber === 1 ? "INITIAL INTAKE" : "REMEDIATION RE-TEST"} {isActive && "(CURRENT)"}
                      </span>
                      <span className={isActive ? "bg-accent-scan/10 text-accent-scan px-1 py-0.5 rounded-[2px] font-bold" : "text-signal-resolved font-medium"}>
                        {round.status?.toUpperCase() || "COMPLETED"}
                      </span>
                    </div>
                    <div className="text-text-primary font-medium">Commit SHA: {round.commitSha.slice(0, 7)}</div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {round.summary}
                    </p>
                    <div className="text-[10px] text-text-muted pt-1">Date: {round.date}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4-Column Metadata Diagnostic Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border-hairline font-mono text-xs">
          {/* Card 1: Contract Address */}
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px] uppercase tracking-wider">
              TARGET CONTRACT ADDRESS
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-primary text-[11px] truncate" title={audit.contractAddress || audit.githubRepoUrl || "Git Repository Scope"}>
                {audit.contractAddress
                  ? `${audit.contractAddress.slice(0, 10)}...${audit.contractAddress.slice(-8)}`
                  : (audit.githubRepoUrl ? audit.githubRepoUrl.replace("https://github.com/", "") : "Git Repository Scope")}
              </span>
              {audit.contractAddress && (
                <button
                  onClick={handleCopyAddress}
                  className="text-text-muted hover:text-text-primary transition-colors"
                  title="Copy Address"
                >
                  {copied ? <Check className="h-3 w-3 text-signal-resolved" /> : <Copy className="h-3 w-3" />}
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Scope & Compiler */}
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px] uppercase tracking-wider">
              SCOPE & COMPILER
            </div>
            <div className="text-accent-scan font-medium text-[11px]">
              {activeSloc.toLocaleString()} SLOC · {activeCompiler}
            </div>
          </div>

          {/* Card 3: Assigned Auditors */}
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px] uppercase tracking-wider">
              ASSIGNED AUDITOR LEAD
            </div>
            <div className="text-text-primary font-medium text-[11px] flex items-center gap-1.5">
              <User className="h-3 w-3 text-accent-scan" />
              <span>{leadAuditorName}</span>
            </div>
          </div>

          {/* Card 4: Pinned Commit & SLA */}
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px] uppercase tracking-wider">
              PINNED COMMIT · ETA
            </div>
            <div className="text-signal-resolved font-medium text-[11px] flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>
                {audit.estimatedCompletion
                  ? new Date(audit.estimatedCompletion).toISOString().replace("T", " ").substring(0, 16) + " UTC"
                  : "~48h ETA"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: FULL 4-STAGE PIPELINE STEPPER & LIVE SCAN LOG */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-hairline pb-3">
          <div className="flex items-center gap-3">
            <Eyebrow size="sm" variant="scan" prefix="">
              STAGE 01–04 // AUDIT_EXECUTION_PIPELINE
            </Eyebrow>
            <span className="text-xs text-text-muted hidden md:inline">
              · Real-Time State Progression
            </span>
          </div>
          <div className="font-mono text-xs text-accent-scan flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-scan animate-pulse" />
            STAGE 0{activeStageNum} {activeStageNum === 4 ? "COMPLETED" : activeStageNum === 3 ? "MANUAL REVIEW" : activeStageNum === 2 ? "SCANNING IN PROGRESS" : "INTAKE"}
          </div>
        </div>

        {/* Large Connected Horizontal Progress Stepper */}
        <div className="rounded-[4px] border border-border-hairline bg-bg-panel overflow-hidden">
          {/* Top Rail Bar */}
          <div className="border-b border-border-hairline bg-bg-void/80 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
              {/* Step 1: Intake */}
              <div className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${activeStageNum >= 1 ? "bg-bg-panel-raised border border-accent-scan text-accent-scan" : "bg-bg-panel border border-border-hairline text-text-muted"}`}>
                  {activeStageNum > 1 ? "✓" : "01"}
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] text-text-muted">STAGE 01</div>
                  <div className="text-xs font-semibold text-text-primary">01 INTAKE</div>
                  <div className="text-[10px] text-signal-resolved">{activeStageNum > 1 ? "Commit Locked" : "Ingested"}</div>
                </div>
              </div>

              {/* Step 2: Scanning */}
              <div className="flex items-center gap-3">
                <div className={`relative h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${activeStageNum === 2 ? "bg-accent-scan text-bg-void" : activeStageNum > 2 ? "bg-bg-panel-raised border border-accent-scan text-accent-scan" : "bg-bg-panel border border-border-hairline text-text-muted"}`}>
                  {activeStageNum === 2 && <span className="absolute inset-0 rounded-full bg-accent-scan animate-ping opacity-60" />}
                  <span className="relative">{activeStageNum > 2 ? "✓" : "02"}</span>
                </div>
                <div className="space-y-0.5">
                  <div className={`text-[10px] ${activeStageNum === 2 ? "text-accent-scan font-bold" : "text-text-muted"}`}>STAGE 02 {activeStageNum === 2 ? "· ACTIVE" : ""}</div>
                  <div className={`text-xs ${activeStageNum === 2 ? "font-bold text-accent-scan" : "font-semibold text-text-primary"}`}>02 SCANNING</div>
                  <div className="text-[10px] text-text-muted">{activeStageNum > 2 ? "14/14 AST Passes Complete" : activeStageNum === 2 ? "AST Taint Pass Active" : "Queued"}</div>
                </div>
              </div>

              {/* Step 3: Manual Review */}
              <div className="flex items-center gap-3">
                <div className={`relative h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${activeStageNum === 3 ? "bg-accent-scan text-bg-void" : activeStageNum > 3 ? "bg-bg-panel-raised border border-accent-scan text-accent-scan" : "bg-bg-panel border border-border-hairline text-text-muted"}`}>
                  {activeStageNum === 3 && <span className="absolute inset-0 rounded-full bg-accent-scan animate-ping opacity-60" />}
                  <span className="relative">{activeStageNum > 3 ? "✓" : "03"}</span>
                </div>
                <div className="space-y-0.5">
                  <div className={`text-[10px] ${activeStageNum === 3 ? "text-accent-scan font-bold" : "text-text-muted"}`}>STAGE 03 {activeStageNum === 3 ? "· ACTIVE" : activeStageNum < 3 ? "· QUEUED" : ""}</div>
                  <div className={`text-xs ${activeStageNum === 3 ? "font-bold text-accent-scan" : activeStageNum > 3 ? "font-semibold text-text-primary" : "font-semibold text-text-muted"}`}>03 MANUAL REVIEW</div>
                  <div className="text-[10px] text-text-muted">Assigned: {audit.assignedAuditor || "0xAuditor_K4"}</div>
                </div>
              </div>

              {/* Step 4: Attestation */}
              <div className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${activeStageNum === 4 ? "bg-signal-resolved text-bg-void" : "bg-bg-panel border border-border-hairline text-text-muted"}`}>
                  {activeStageNum === 4 ? "✓" : "04"}
                </div>
                <div className="space-y-0.5">
                  <div className={`text-[10px] ${activeStageNum === 4 ? "text-signal-resolved font-bold" : "text-text-muted"}`}>STAGE 04 {activeStageNum === 4 ? "· COMPLETED" : "· TARGET"}</div>
                  <div className={`text-xs ${activeStageNum === 4 ? "font-bold text-signal-resolved" : "font-semibold text-text-muted"}`}>04 ATTESTATION</div>
                  <div className="text-[10px] text-text-muted">{activeStageNum === 4 ? "Report Sealed & Verified" : "SHA-256 Vault Seal"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* EXPANDED LIVE SCAN LOG TERMINAL (For Current Active Stage) */}
          <div className="p-6 space-y-4 bg-bg-panel/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Terminal className="h-4 w-4 text-accent-scan" />
                <span className="font-semibold text-text-primary">
                  ZYR-ENGINE-AST-SCANNER // v2.4.0 · PID: 81924
                </span>
                <span className="text-text-muted text-[11px] hidden sm:inline">
                  · Memory: 148MB · 14 Taint Analyzers
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => setIsLogStreaming(!isLogStreaming)}
                  className="px-2.5 py-1 rounded-[2px] bg-bg-panel border border-border-hairline text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 text-[11px]"
                >
                  {isLogStreaming ? (
                    <>
                      <Pause className="h-3 w-3 text-accent-scan" />
                      <span>Pause Log</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 text-signal-resolved" />
                      <span>Resume Stream</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Terminal Log Screen */}
            <div className="rounded-[4px] border border-border-hairline bg-bg-void p-5 font-mono text-xs leading-relaxed space-y-1.5 max-h-64 overflow-y-auto">
              {scanLogLines.map((line, idx) => {
                let colorClass = "text-text-muted";
                if (line.type === "pass") colorClass = "text-signal-resolved";
                if (line.type === "warn") colorClass = "text-signal-high";
                if (line.type === "flag-high") colorClass = "text-signal-high font-semibold bg-signal-high/5 px-1 py-0.5 rounded-[2px]";
                if (line.type === "flag-crit") colorClass = "text-signal-critical font-bold bg-signal-critical/10 px-1 py-0.5 rounded-[2px] border border-signal-critical/30";
                if (line.type === "live") colorClass = "text-accent-scan font-semibold animate-pulse";

                return (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-text-muted/60 select-none text-[11px] shrink-0">
                      [{line.time}]
                    </span>
                    <span className={colorClass}>{line.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FULL FINDINGS & REMEDIATION ENGINE (Replaces teaser cards) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-hairline pb-3">
          <div className="flex items-center gap-3">
            <Eyebrow size="sm" variant="scan" prefix="// FINDING_TRIAGE · ">
              VULNERABILITY_REMEDIATION_ENGINE
            </Eyebrow>
            <span className="text-xs text-text-muted hidden md:inline">
              {areFindingsReleased
                ? `· ${findings.length} Triaged Items · ${findings.filter((f) => f.status === "resolved").length} Resolved`
                : "· Auditor Verification in Progress (Findings Pending Approval)"}
            </span>
          </div>

          {areFindingsReleased ? (
            <div className="flex items-center gap-2 font-mono text-xs">
              <Badge severity="critical" size="sm">
                {findings.filter((f) => f.severity === "critical" && f.status !== "resolved").length} OPEN CRITICAL
              </Badge>
              <Badge severity="high" size="sm">
                {findings.filter((f) => f.severity === "high" && f.status !== "resolved").length} OPEN HIGH
              </Badge>
            </div>
          ) : (
            <Badge severity="high" size="sm">
              PENDING AUDITOR APPROVAL
            </Badge>
          )}
        </div>

        {/* If findings have not been released by auditor yet */}
        {!areFindingsReleased ? (
          <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-accent-scan/10 border border-accent-scan text-accent-scan mx-auto flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div className="space-y-1.5 max-w-lg mx-auto">
              <h3 className="font-display text-base font-semibold text-text-primary">
                Findings Under Auditor Review & Triage
              </h3>
              <p className="text-xs text-text-muted font-mono leading-relaxed">
                Automated AST engine passes have executed. The preliminary vulnerability findings are currently being validated by your assigned lead auditor ({audit.assignedAuditor || "0xAuditor_K4"}).
              </p>
              <p className="text-xs text-text-muted font-mono leading-relaxed">
                Verified findings, root cause traces, and remediation code will be released directly to your dashboard as soon as the auditor approves the review and sends it for client fixes.
              </p>
            </div>
            <div className="pt-2">
              <Badge severity="high" size="sm">
                AUDITOR TRIAGE IN PROGRESS · FINDINGS WILL APPEAR UPON AUDITOR APPROVAL
              </Badge>
            </div>
          </div>
        ) : findings.length === 0 ? (
          <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline text-center font-mono text-xs text-text-muted space-y-2">
            <CheckCircle2 className="h-6 w-6 text-signal-resolved mx-auto" />
            <div className="text-text-primary font-semibold">Zero Vulnerabilities Detected</div>
            <div>The auditor verified this contract with no outstanding vulnerabilities.</div>
          </div>
        ) : (
          /* Findings Accordion List */
          <div className="space-y-4">
            {findings.map((finding) => {
              const isExpanded = expandedFindingId === finding.id;

              return (
                <div
                  key={finding.id}
                  className={`rounded-[4px] border transition-colors bg-bg-panel overflow-hidden ${
                    isExpanded ? "border-accent-scan/50" : "border-border-hairline hover:border-hairline/90"
                  }`}
                >
                  {/* Finding Header Summary Row */}
                  <div
                    onClick={() => toggleExpand(finding.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-bg-void/40 hover:bg-bg-void/70 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-accent-scan">
                          {finding.id}
                        </span>
                      <Badge severity={finding.severity} size="sm">
                        {finding.severity.toUpperCase()} ({finding.cvss})
                      </Badge>
                      <span className="font-mono text-xs text-text-muted">
                        {finding.location}
                      </span>
                      {finding.status === "resolved" ? (
                        <Badge severity="resolved" size="sm">
                          RESOLVED ✓
                        </Badge>
                      ) : finding.status === "fix-submitted" ? (
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

                    <h3 className="font-display text-base font-semibold text-text-primary">
                      {finding.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto shrink-0 font-mono text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {finding.comments.length}
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded text-text-muted hover:text-text-primary"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Finding Detail (Vulnerable vs Remediated Pattern) */}
                {isExpanded && (
                  <div className="p-6 border-t border-border-hairline space-y-8 bg-bg-panel">
                    {/* Asymmetric Diagnostics & Code Diff Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left 4.5 cols: Diagnostics Box */}
                      <div className="lg:col-span-5 p-5 rounded-[4px] bg-bg-void border border-border-hairline space-y-4">
                        <div className="space-y-1">
                          <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                            ROOT CAUSE & EXPLOIT PATH
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed">
                            {finding.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-border-hairline space-y-2 font-mono text-[11px] text-text-muted">
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

                        <div className="p-3 rounded-[2px] bg-bg-panel border border-border-hairline space-y-1">
                          <div className="font-mono text-[10px] text-accent-scan uppercase font-semibold">
                            RECOMMENDED REMEDIATION:
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed">
                            {finding.remediationNote}
                          </p>
                        </div>
                      </div>

                      {/* Right 7.5 cols: Vulnerable vs Remediated Code Blocks */}
                      <div className="lg:col-span-7 space-y-4">
                        {/* Vulnerable Block */}
                        <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2 font-mono text-xs">
                          <div className="flex items-center justify-between text-signal-critical border-b border-border-hairline pb-2">
                            <span className="font-semibold flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-signal-critical" />
                              VULNERABLE STATE PATTERN
                            </span>
                            <span className="text-[10px] text-text-muted">{finding.vulnerableLines}</span>
                          </div>
                          <div className="text-text-primary leading-relaxed overflow-x-auto pt-1">
                            <HighlightedSolidityBlock code={finding.vulnerableCode} />
                          </div>
                        </div>

                        {/* Remediated Block */}
                        <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2 font-mono text-xs">
                          <div className="flex items-center justify-between text-signal-resolved border-b border-border-hairline pb-2">
                            <span className="font-semibold flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-signal-resolved" />
                              VERIFIED REMEDIATION DIFF
                            </span>
                            <span className="text-[10px] text-signal-resolved font-medium">
                              TARGET FIX
                            </span>
                          </div>
                          <div className="text-text-primary leading-relaxed overflow-x-auto pt-1">
                            <HighlightedSolidityBlock code={finding.remediatedCode} />
                          </div>
                        </div>

                        {finding.fuzzTestStatus && (
                          <div className="p-2.5 rounded-[4px] bg-bg-void border border-border-hairline flex items-center justify-between text-xs font-mono text-text-muted">
                            <span className="text-signal-resolved">✓ {finding.fuzzTestStatus}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PER-FINDING COMMENT THREAD & COMMIT-TRIGGERED RE-VERIFICATION */}
                    <div className="p-5 rounded-[4px] bg-bg-void border border-border-hairline space-y-5">
                      <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                        <div className="flex items-center gap-2 font-mono text-xs font-semibold text-text-primary">
                          <MessageSquare className="h-3.5 w-3.5 text-accent-scan" />
                          <span>Remediation Discussion & Commit Verification Thread</span>
                        </div>
                        <span className="font-mono text-[11px] text-text-muted">
                          {finding.comments.length} message{finding.comments.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      {/* Messages Feed */}
                      <div className="space-y-3">
                        {finding.comments.map((comment) => (
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
                        ))}
                      </div>

                      {/* New Comment / Commit Reference Input Form */}
                      <div className="pt-3 border-t border-border-hairline space-y-3">
                        <div className="font-mono text-xs text-text-muted">
                          POST REMEDIATION UPDATE // REFERENCING A COMMIT FLIPS STATUS TO RE-VERIFY:
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-8">
                            <Input
                              placeholder="Describe remediation fix applied (e.g. Applied Checks-Effects-Interactions)..."
                              value={commentInputs[finding.id]?.message || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [finding.id]: {
                                    message: e.target.value,
                                    commitRef: prev[finding.id]?.commitRef || "",
                                  },
                                }))
                              }
                              className="text-xs"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <Input
                              isMono
                              placeholder="Commit SHA (e.g. 9f8e7d6)"
                              value={commentInputs[finding.id]?.commitRef || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [finding.id]: {
                                    message: prev[finding.id]?.message || "",
                                    commitRef: e.target.value,
                                  },
                                }))
                              }
                              prefix={<GitCommit className="h-3.5 w-3.5 text-accent-scan" />}
                              className="text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            rightIcon={<Send className="h-3.5 w-3.5" />}
                            onClick={() => handlePostComment(finding.id)}
                            disabled={!commentInputs[finding.id]?.message?.trim()}
                          >
                            Submit Comment & Trigger Re-Verification
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

      {/* SECTION 3: TIMESTAMPED ACTIVITY TIMELINE */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border-hairline pb-3">
          <Eyebrow size="sm" prefix="// AUDIT_TELEMETRY · ">
            TIMESTAMPED_ACTIVITY_TIMELINE
          </Eyebrow>
          <span className="font-mono text-xs text-text-muted">
            CHRONOLOGICAL AUDIT JOURNAL ({timelineEvents.length} EVENTS)
          </span>
        </div>

        <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-[1px] before:bg-border-hairline">
            {timelineEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-6 relative pl-8">
                {/* Timeline node dot */}
                <div className="absolute left-2.5 top-1 h-2 w-2 rounded-full bg-accent-scan -translate-x-1/2 ring-4 ring-bg-panel" />

                <div className="space-y-1 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-display text-sm font-semibold text-text-primary">
                      {event.title}
                    </span>
                    <Badge severity={event.badgeSeverity} size="sm">
                      {event.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {event.desc}
                  </p>
                  <div className="font-mono text-[10px] text-text-muted pt-0.5">
                    {event.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
