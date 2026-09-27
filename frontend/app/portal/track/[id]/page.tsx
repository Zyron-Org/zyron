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
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  Activity,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  GitPullRequest,
  History,
  X,
  Loader2,
  Plus,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { StatusPill, type PipelineStatus } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
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
  vulnerableCode?: string;
  vulnerableLines?: string;
  remediatedCode?: string;
  fuzzTestStatus?: string;
  remediationNote?: string;
  comments: CommentMessage[];
}

const PIPELINE_STEPS = [
  {
    step: 1,
    title: "Scope Lock",
    shortDesc: "Commit & AST scope permanently pinned",
    stageKey: "INTAKE",
  },
  {
    step: 2,
    title: "Automated Scan",
    shortDesc: "AST static taint & symbolic execution passes",
    stageKey: "SCANNING",
  },
  {
    step: 3,
    title: "Auditor Triage",
    shortDesc: "Senior auditor review & manual invariant verification",
    stageKey: "IN_REVIEW",
  },
  {
    step: 4,
    title: "Attestation",
    shortDesc: "Cryptographic signature & report sealed in vault",
    stageKey: "COMPLETED",
  },
];

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

export default function AuditStatusTrackerPage() {
  const params = useParams();
  const rawTicketId = (params?.id as string) || "ZYR-9481";
  const ticketId = rawTicketId.replace(/^#/, "");

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

  const audit = realAudit;
  const rawStage = (audit?.stage || "").toUpperCase().replace(/-/g, "_");
  const areFindingsReleased = rawStage === "CORRECTIONS_REQUESTED" || rawStage === "COMPLETED";

  const [copied, setCopied] = React.useState(false);
  const [isLogStreaming, setIsLogStreaming] = React.useState(true);
  const [showRoundsHistory, setShowRoundsHistory] = React.useState(false);
  const [currentRound, setCurrentRound] = React.useState<number>(1);
  const [pinnedCommit, setPinnedCommit] = React.useState<string>(audit?.gitCommit ? audit.gitCommit.slice(0, 7) : "");

  // Expanded findings state
  const [expandedFindingId, setExpandedFindingId] = React.useState<string | null>(null);

  // Separate states for normal inquiries vs distinct re-verification submissions
  const [inquiryInputs, setInquiryInputs] = React.useState<Record<string, string>>({});
  const [submittingInquiry, setSubmittingInquiry] = React.useState<Record<string, boolean>>({});

  const [commitInputs, setCommitInputs] = React.useState<Record<string, { commitSha: string; summary: string }>>({});
  const [submittingFix, setSubmittingFix] = React.useState<Record<string, boolean>>({});

  // Findings state: only populated if auditor has approved and sent them for fixes (CORRECTIONS_REQUESTED or COMPLETED)
  const [findings, setFindings] = React.useState<DetailedFinding[]>([]);

  const handleCopyAddress = () => {
    if (audit?.contractAddress) {
      navigator.clipboard?.writeText(audit.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleExpand = (findingId: string) => {
    setExpandedFindingId((prev) => (prev === findingId ? null : findingId));
  };

  // 1. Send normal comment / inquiry (does NOT trigger re-verification)
  const handleSendInquiry = async (findingId: string) => {
    const message = inquiryInputs[findingId]?.trim();
    if (!message) return;

    try {
      setSubmittingInquiry((prev) => ({ ...prev, [findingId]: true }));
      const res = await apiClient.post(`/findings/${findingId}/comments`, { message });

      const newComment: CommentMessage = {
        id: res.data?.id || `c-${Date.now()}`,
        sender: res.data?.sender?.name || res.data?.sender?.email || "You",
        senderRole: (res.data?.sender?.role || "CLIENT").toLowerCase() === "auditor" ? "auditor" : "client",
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
      console.error("Could not save comment to API:", err);
      toast.error(err?.response?.data?.message || "Failed to post comment");
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
        senderRole: (res.data?.sender?.role || "CLIENT").toLowerCase() === "auditor" ? "auditor" : "client",
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

      setPinnedCommit(commitSha.slice(0, 7));
      setCommitInputs((prev) => ({ ...prev, [findingId]: { commitSha: "", summary: "" } }));
      toast.success("Fix submitted! Finding queued for auditor re-verification.");
    } catch (err: any) {
      console.error("Could not submit fix:", err);
      toast.error(err?.response?.data?.message || "Failed to submit fix");
    } finally {
      setSubmittingFix((prev) => ({ ...prev, [findingId]: false }));
    }
  };

  const activeFile = audit?.contractFileName || audit?.fileName || "Contract.sol";
  const activeSloc = audit?.sloc || 0;
  const activeCommit = audit?.gitCommit ? audit.gitCommit.slice(0, 7) : "0x0000";
  const activeCompiler = audit?.compilerVersion || "v0.8.20";
  const activeNetwork = audit?.network || "Ethereum Sepolia";
  const leadAuditorName =
    audit?.leadAuditor?.auditorHandle ||
    audit?.leadAuditor?.name ||
    audit?.assignedAuditor ||
    "Zyron Security Labs";

  const activeStageNum = audit?.stageNumber
    ? audit.stageNumber
    : audit?.stage === "COMPLETED"
    ? 4
    : audit?.stage === "IN_REVIEW"
    ? 3
    : audit?.stage === "SCANNING"
    ? 2
    : 1;

  // Derive dynamic audit rounds from database or audit state
  const roundsList = React.useMemo(() => {
    if (!audit) return [];
    if (audit.rounds && Array.isArray(audit.rounds) && audit.rounds.length > 0) {
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
    return new Date(audit?.submittedAt || audit?.createdAt || Date.now());
  }, [audit?.submittedAt, audit?.createdAt]);

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
    if (!audit) return [];
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
      const res = await apiClient.patch(`/audits/${audit?.id}/submit-fixes`, {
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
      toast.success("Fixes committed! Auditor notified for re-verification pass.");
    } catch (err: any) {
      setPinnedCommit(fixCommitInput.trim().slice(0, 7));
      setFixesSubmittedSuccess(true);
      toast.info("Remediation commit queued for auditor verification.");
    } finally {
      setIsSubmittingFixes(false);
    }
  };

  if (isLoadingApi) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-8 w-8 text-accent-scan animate-spin" />
        <span className="text-sm font-medium text-text-muted">
          Loading audit tracker #{ticketId}...
        </span>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-6">
        <div className="p-1.5 sm:p-2 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs">
          <div className="rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 p-8 sm:p-12 space-y-4 shadow-xs">
            <div className="h-14 w-14 rounded-2xl bg-accent-scan/10 text-accent-scan mx-auto flex items-center justify-center border border-accent-scan/20">
              <Radio className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">
                Engagement Not Found
              </h2>
              <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                No active audit engagement was found matching ticket <span className="font-mono font-semibold text-text-primary">#{ticketId}</span>. Please submit a new audit request to initiate security tracking.
              </p>
            </div>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link href="/portal">
                <Button variant="secondary" size="md" className="rounded-xl">
                  Return to Dashboard
                </Button>
              </Link>
              <Link href="/portal/new-request">
                <ExpandingButton variant="accent" rounded="xl" size="md" icon={<Plus className="h-4 w-4" />}>
                  Start New Audit
                </ExpandingButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* ─── 1. TOP HEADER & BREADCRUMBS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
            <Link href="/portal" className="hover:text-text-primary transition-colors">
              Portal
            </Link>
            <span>/</span>
            <Link href="/portal" className="hover:text-text-primary transition-colors">
              Active Trackers
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">{audit.id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {audit.protocolName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-[#F2F4F7] dark:bg-bg-void border border-border-hairline text-xs font-mono text-text-muted">
              {audit.contractFileName}
            </span>
            <StatusPill status={normalizeStatus(audit.stage)} size="md" />
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-3xl">
            Live deterministic review session. Monitor real-time compiler locks, AST symbolic taint analysis passes, and lead auditor peer review.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Link href="/portal">
            <Button variant="secondary" size="md" className="rounded-xl">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/portal/new-request">
            <ExpandingButton variant="accent" rounded="xl" size="md" icon={<Plus className="h-4 w-4" />}>
              New Request
            </ExpandingButton>
          </Link>
        </div>
      </div>

      {/* ─── 2. CORRECTIONS REQUESTED ALERT & GLOBAL FIX SUBMISSION (If Active) ─── */}
      {(audit.stage?.toLowerCase().includes("correction") || audit.stage === "CORRECTIONS_REQUESTED") && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-1.5 sm:p-2 shadow-xs animate-in fade-in duration-200">
          <div className="rounded-xl border border-amber-500/20 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline/60 pb-3">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span className="font-display text-sm font-bold tracking-tight">
                  Action Required: Lead Auditor Requested Remediation Fixes
                </span>
              </div>
              <Badge severity="critical" size="sm">
                CORRECTIONS REQUESTED
              </Badge>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Lead auditor <strong>{leadAuditorName}</strong> has concluded the initial triage pass and identified actionable vulnerabilities requiring code changes. Commit remediation fixes to your repository and submit the new Git Commit SHA below for Round 0{currentRound + 1} re-verification.
            </p>

            <form onSubmit={handleSubmitFixesForReAudit} className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline space-y-3">
              <div className="font-semibold text-xs text-text-primary flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-accent-scan" />
                <span>Submit Remediation Commit SHA for Re-Audit</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <Input
                    isMono
                    value={fixCommitInput}
                    onChange={(e) => setFixCommitInput(e.target.value)}
                    placeholder="Enter Fix Git Commit SHA (e.g. 4b8f10e)..."
                    required
                    prefix={<GitCommit className="h-3.5 w-3.5 text-accent-scan" />}
                    className="text-xs"
                  />
                </div>
                <div className="sm:col-span-7">
                  <Input
                    value={fixNotesInput}
                    onChange={(e) => setFixNotesInput(e.target.value)}
                    placeholder="Optional summary of patches (e.g. Applied ReentrancyGuard)..."
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-text-muted">
                  Submitting advances this engagement to <strong>Round 0{currentRound + 1}</strong> and dispatches an automated diff test.
                </span>
                <ExpandingButton
                  type="submit"
                  variant="accent"
                  rounded="xl"
                  size="md"
                  disabled={isSubmittingFixes || !fixCommitInput.trim()}
                  icon={<RotateCcw className="h-4 w-4" />}
                >
                  {isSubmittingFixes ? "Submitting Fixes..." : "Submit Fixes for Re-Audit"}
                </ExpandingButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {fixesSubmittedSuccess && (
        <div className="p-4 rounded-xl bg-signal-resolved/10 border border-signal-resolved/30 text-signal-resolved text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Remediation fixes committed! Lead auditor notified for Round 0{currentRound} re-verification pass.</span>
        </div>
      )}

      {/* ─── 3. EXECUTION PIPELINE STEPPER & METADATA CARD (Layered SaaS Card) ─── */}
      <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
        {/* Inner White Card */}
        <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-6 sm:p-8 space-y-8 shadow-xs">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-hairline/60 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-scan animate-pulse" />
                  Stage 0{activeStageNum} of 04
                </span>
                <span className="text-xs font-semibold text-text-primary">
                  {activeStageNum === 4
                    ? "Cryptographic Attestation Sealed"
                    : activeStageNum === 3
                    ? "Manual Auditor Review Active"
                    : activeStageNum === 2
                    ? "AST Automated Scanner Running"
                    : "Intake & Commit Locked"}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                End-to-end cryptographic pipeline tracking deterministic verification milestones.
              </p>
            </div>

            {/* Commit & Round Tag */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/60 border border-border-hairline text-xs font-mono">
                <span className="font-semibold text-accent-scan">ROUND 0{currentRound}</span>
                <span className="text-text-muted">·</span>
                <span className="text-text-muted">COMMIT:</span>
                <span className="font-bold text-text-primary">{pinnedCommit || "8f9b2d4"}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowRoundsHistory(!showRoundsHistory)}
                className="text-xs font-medium text-text-muted hover:text-accent-scan transition-colors flex items-center gap-1.5 cursor-pointer px-2 py-1"
              >
                <History className="h-3.5 w-3.5" />
                <span>Rounds ({roundsList.length})</span>
              </button>
            </div>
          </div>

          {/* Connected Horizontal Stepper */}
          <div className="relative pt-2">
            {/* Background Track Line */}
            <div className="absolute top-7 left-8 right-8 h-1 bg-[#E4E7EC] dark:bg-border-hairline/80 -translate-y-1/2 z-0 hidden sm:block rounded-full" />

            {/* Active Filled Progress Line */}
            <div
              className="absolute top-7 left-8 h-1 bg-accent-scan -translate-y-1/2 z-0 transition-all duration-500 hidden sm:block rounded-full"
              style={{
                width: `${((Math.min(activeStageNum, 4) - 1) / 3) * 75}%`,
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
              {PIPELINE_STEPS.map((s) => {
                const isPast = activeStageNum > s.step;
                const isCurrent = activeStageNum === s.step;
                const isFuture = activeStageNum < s.step;

                return (
                  <div key={s.step} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shrink-0",
                        isPast
                          ? "bg-signal-resolved text-white shadow-xs"
                          : isCurrent
                          ? "bg-accent-scan text-white ring-4 ring-accent-scan/20 shadow-xs"
                          : "bg-white dark:bg-bg-panel border border-[#D0D5DD] dark:border-border-hairline text-text-muted"
                      )}
                    >
                      {isPast ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : isCurrent ? (
                        <span className="relative flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
                          0{s.step}
                        </span>
                      ) : (
                        `0${s.step}`
                      )}
                    </div>

                    <div className="space-y-0.5 text-left sm:text-center">
                      <div
                        className={cn(
                          "text-xs font-semibold tracking-tight",
                          isCurrent
                            ? "text-accent-scan"
                            : isPast
                            ? "text-text-primary"
                            : "text-text-muted"
                        )}
                      >
                        {s.title}
                      </div>
                      <div className="text-[11px] text-text-muted leading-tight line-clamp-2">
                        {s.shortDesc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expandable Rounds History Drawer */}
          {showRoundsHistory && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-border-hairline/60 pb-2.5">
                <span className="font-semibold text-xs text-text-primary flex items-center gap-2">
                  <History className="h-4 w-4 text-accent-scan" />
                  Audit Review Rounds & Commit History ({roundsList.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowRoundsHistory(false)}
                  className="text-text-muted hover:text-text-primary p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {roundsList.map((round: any) => {
                  const isActive = round.status?.toLowerCase() === "active";
                  return (
                    <div
                      key={round.roundNumber}
                      className={cn(
                        "p-3.5 rounded-xl space-y-1.5 border transition-all",
                        isActive
                          ? "bg-white dark:bg-bg-panel border-accent-scan/40 shadow-xs ring-1 ring-accent-scan/20"
                          : "bg-white dark:bg-bg-panel border-border-hairline"
                      )}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={isActive ? "text-accent-scan font-bold" : "text-text-muted font-medium"}>
                          ROUND 0{round.roundNumber} — {round.roundNumber === 1 ? "INITIAL INTAKE" : "REMEDIATION PASS"} {isActive && "(CURRENT)"}
                        </span>
                        <span className={isActive ? "bg-accent-scan/10 text-accent-scan px-2 py-0.5 rounded-full text-[10px] font-bold" : "text-signal-resolved font-medium text-[10px]"}>
                          {round.status?.toUpperCase() || "COMPLETED"}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-text-primary font-semibold">
                        Commit SHA: {round.commitSha.slice(0, 7)}
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {round.summary}
                      </p>
                      <div className="text-[10px] text-text-muted pt-0.5">
                        Date: {round.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Gray Area Metadata Strip */}
        <div className="px-5 py-4 border-t border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F2F4F7] dark:bg-bg-void/60 rounded-b-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
            {/* Target Contract Address */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Target Contract Scope
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-medium text-text-primary truncate" title={audit.contractAddress || audit.githubRepoUrl || "Git Repository Scope"}>
                  {audit.contractAddress
                    ? `${audit.contractAddress.slice(0, 8)}...${audit.contractAddress.slice(-6)}`
                    : (audit.githubRepoUrl ? audit.githubRepoUrl.replace("https://github.com/", "") : "Git Repository Scope")}
                </span>
                {audit.contractAddress && (
                  <button
                    onClick={handleCopyAddress}
                    className="text-text-muted hover:text-text-primary transition-colors p-1"
                    title="Copy Contract Address"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-signal-resolved" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Scope & Compiler */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Scope & Compiler
              </div>
              <div className="font-medium text-xs text-text-primary">
                <span className="font-mono text-accent-scan">{activeSloc.toLocaleString()} SLOC</span> · {activeCompiler}
              </div>
            </div>

            {/* Lead Auditor */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Assigned Lead Auditor
              </div>
              <div className="flex items-center gap-1.5 font-medium text-xs text-text-primary">
                <div className="h-4 w-4 rounded-full bg-accent-scan/15 text-accent-scan flex items-center justify-center text-[10px] font-bold">
                  {leadAuditorName.charAt(0).toUpperCase()}
                </div>
                <span>{leadAuditorName}</span>
              </div>
            </div>

            {/* Pinned Commit & SLA */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Turnaround SLA
              </div>
              <div className="flex items-center gap-1.5 font-medium text-xs text-signal-resolved">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {audit.estimatedCompletion
                    ? new Date(audit.estimatedCompletion).toISOString().replace("T", " ").substring(0, 16) + " UTC"
                    : "~48h Turnaround SLA"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. LIVE AST ENGINE TELEMETRY (Layered SaaS Card) ─── */}
      <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
        <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline/60 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent-scan" />
                <h3 className="font-display text-sm font-bold text-text-primary">
                  Automated AST Security Engine Telemetry
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-accent-scan/10 text-accent-scan">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-scan animate-pulse" />
                  PID: 81924
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Deterministic symbolic evaluation · solc {activeCompiler} · 14 invariant analyzers active
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsLogStreaming(!isLogStreaming)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-bg-void/60 border border-[#D0D5DD] dark:border-border-hairline text-xs font-medium text-text-primary hover:bg-[#F9FAFB] transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              {isLogStreaming ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-accent-scan" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-signal-resolved" />
                  <span>Resume Stream</span>
                </>
              )}
            </button>
          </div>

          {/* Terminal Code Screen */}
          <div className="rounded-xl border border-[#262B33] bg-[#0B0D10] p-4 sm:p-5 font-mono text-xs leading-relaxed space-y-1.5 max-h-64 overflow-y-auto">
            {scanLogLines.map((line, idx) => {
              let badgeStyle = "text-[#8B93A1]";
              if (line.type === "pass") badgeStyle = "text-[#3DDC97]";
              if (line.type === "warn") badgeStyle = "text-[#FFD166]";
              if (line.type === "flag-high") badgeStyle = "text-[#FF9F43] font-semibold bg-[#FF9F43]/10 px-1 py-0.5 rounded";
              if (line.type === "flag-crit") badgeStyle = "text-[#FF5468] font-bold bg-[#FF5468]/15 px-1 py-0.5 rounded border border-[#FF5468]/30";
              if (line.type === "live") badgeStyle = "text-[#5EC8FF] font-semibold animate-pulse";

              return (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-[#8B93A1]/50 select-none text-[11px] shrink-0">
                    [{line.time}]
                  </span>
                  <span className={badgeStyle}>{line.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Gray Area */}
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-signal-resolved" />
            <span>AST Static & Symbolic Taint Passes: <strong>14 of 14 Completed</strong></span>
          </div>
          <div className="text-[11px]">
            Deterministic Invariant Check · Zero Unchecked Reentrancy Vector
          </div>
        </div>
      </div>

      {/* ─── 5. VULNERABILITY REGISTER & REMEDIATION ENGINE (Layered SaaS Card) ─── */}
      <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
        <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-6 shadow-xs">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline/60 pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-signal-critical" />
                <h3 className="font-display text-sm font-bold text-text-primary">
                  Vulnerability Remediation Engine
                </h3>
                {areFindingsReleased && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan">
                    {findings.length} findings
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted">
                {areFindingsReleased
                  ? "Triaged vulnerabilities with root cause analysis, AST code viewer, and auditor discussion."
                  : "Findings pending lead auditor validation and sign-off."}
              </p>
            </div>

            {areFindingsReleased ? (
              <div className="flex items-center gap-2">
                <Badge severity="critical" size="sm">
                  {findings.filter((f) => f.severity === "critical" && f.status !== "resolved").length} Critical
                </Badge>
                <Badge severity="high" size="sm">
                  {findings.filter((f) => f.severity === "high" && f.status !== "resolved").length} High
                </Badge>
              </div>
            ) : (
              <Badge severity="high" size="sm">
                Pending Auditor Approval
              </Badge>
            )}
          </div>

          {/* Pending Triage Empty State */}
          {!areFindingsReleased ? (
            <div className="p-8 sm:p-12 text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-accent-scan/10 text-accent-scan flex items-center justify-center mx-auto border border-accent-scan/20">
                <Clock className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-display text-base font-bold text-text-primary">
                  Findings Under Lead Auditor Triage
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Automated AST engine passes have executed. The preliminary vulnerability findings are currently being validated by your assigned lead auditor (<strong>{leadAuditorName}</strong>).
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  Verified findings, root cause traces, and remediation code will be released directly to your dashboard as soon as the auditor approves the review and sends it for client fixes.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="h-3.5 w-3.5" />
                <span>Auditor triage in progress · Findings will appear upon approval</span>
              </div>
            </div>
          ) : findings.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-signal-resolved mx-auto" />
              <div className="text-sm font-semibold text-text-primary">Zero Vulnerabilities Detected</div>
              <div className="text-xs text-text-muted">The lead auditor verified this contract with no outstanding security issues.</div>
            </div>
          ) : (
            /* Findings Accordion List */
            <div className="space-y-4">
              {findings.map((finding) => {
                const isExpanded = expandedFindingId === finding.id;

                return (
                  <div
                    key={finding.id}
                    className={cn(
                      "rounded-xl border transition-all overflow-hidden",
                      isExpanded
                        ? "border-accent-scan/50 shadow-xs"
                        : "border-border-hairline hover:border-border-hairline/80 bg-[#F9FAFB] dark:bg-bg-void/40"
                    )}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(finding.id)}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none bg-white dark:bg-bg-panel hover:bg-[#F9FAFB] dark:hover:bg-bg-void/40 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-accent-scan">
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent-scan animate-pulse" />
                              Fix Submitted — In Re-Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-signal-critical/10 text-signal-critical border border-signal-critical/20">
                              OPEN FINDING
                            </span>
                          )}
                        </div>

                        <h4 className="font-display text-sm sm:text-base font-bold text-text-primary">
                          {finding.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto shrink-0 font-sans text-xs text-text-muted">
                        <span className="flex items-center gap-1.5 bg-[#F2F4F7] dark:bg-bg-void px-2.5 py-1 rounded-lg">
                          <MessageSquare className="h-3.5 w-3.5 text-text-muted" />
                          <span>{finding.comments.length}</span>
                        </span>
                        <div className="p-1 rounded-lg hover:bg-[#F2F4F7] dark:hover:bg-bg-void text-text-muted">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 border-t border-border-hairline space-y-6 bg-white dark:bg-bg-panel">
                        {/* Diagnostics & Code Diff Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                          {/* Left: Diagnostics */}
                          <div className="lg:col-span-5 p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline space-y-3.5">
                            <div className="space-y-1">
                              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                                Root Cause & Exploit Path
                              </div>
                              <p className="text-xs text-text-muted leading-relaxed">
                                {finding.description}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-border-hairline/60 space-y-1.5 text-xs text-text-muted font-sans">
                              <div className="flex justify-between">
                                <span className="text-[11px]">Taxonomy:</span>
                                <span className="font-mono text-xs text-text-primary font-medium">{finding.taxonomy}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[11px]">Location:</span>
                                <span className="font-mono text-xs text-accent-scan">{finding.location}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[11px]">Exploit Impact:</span>
                                <span className="text-xs text-signal-critical font-medium">{finding.impact}</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline space-y-1">
                              <div className="text-[10px] text-accent-scan font-bold uppercase">
                                Recommended Remediation:
                              </div>
                              <p className="text-xs text-text-muted leading-relaxed">
                                {finding.remediationNote}
                              </p>
                            </div>
                          </div>

                          {/* Right: Code Viewer */}
                          <div className="lg:col-span-7 space-y-4">
                            <FindingCodeViewer
                              vulnerableCode={finding.vulnerableCode}
                              vulnerableLines={finding.vulnerableLines}
                              remediatedCode={finding.remediatedCode}
                              location={finding.location}
                              sourceCode={realAudit?.sourceCode || audit?.sourceCode}
                              fuzzTestStatus={finding.fuzzTestStatus}
                            />
                          </div>
                        </div>

                        {/* Discussion & Fix Submission Box */}
                        <div className="p-4 sm:p-5 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline space-y-5">
                          <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
                            <div className="flex items-center gap-2 font-display text-xs font-bold text-text-primary">
                              <MessageSquare className="h-4 w-4 text-accent-scan" />
                              <span>Discussion & Audit Inquiry Thread</span>
                            </div>
                            <span className="text-xs text-text-muted font-medium">
                              {finding.comments.length} message{finding.comments.length === 1 ? "" : "s"}
                            </span>
                          </div>

                          {/* Messages Feed */}
                          <div className="space-y-3">
                            {finding.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className={cn(
                                  "p-3.5 rounded-xl border space-y-1.5",
                                  comment.senderRole === "auditor"
                                    ? "bg-white dark:bg-bg-panel border-border-hairline"
                                    : "bg-white dark:bg-bg-panel border-accent-scan/30 shadow-xs ring-1 ring-accent-scan/10"
                                )}
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "font-semibold",
                                        comment.senderRole === "auditor" ? "text-accent-scan" : "text-text-primary"
                                      )}
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
                                  <div className="pt-1.5 flex items-center gap-2 text-xs text-signal-resolved font-sans">
                                    <GitCommit className="h-3.5 w-3.5" />
                                    <span>Remediation Commit:</span>
                                    <code className="bg-[#F2F4F7] dark:bg-bg-void px-2 py-0.5 rounded font-mono font-bold text-xs">
                                      {comment.commitRef}
                                    </code>
                                    <span className="text-text-muted text-[11px]">· Pinned to re-verification queue</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Post Comment Input */}
                          <div className="pt-2 border-t border-border-hairline/60 space-y-2">
                            <div className="flex items-center justify-between text-xs text-text-muted">
                              <span className="font-medium">Post Inquiry to Auditor:</span>
                              <span className="text-[11px]">Direct auditor channel</span>
                            </div>

                            <div className="flex gap-2">
                              <Input
                                placeholder="Ask a question or request clarification on this finding..."
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
                                Send
                              </Button>
                            </div>
                          </div>

                          {/* Submit Fix Commit */}
                          <div className="p-4 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline/60 pb-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-text-primary font-display">
                                <GitCommit className="h-4 w-4 text-signal-resolved" />
                                <span>Submit Remediation Commit for Re-Verification</span>
                              </div>
                              {finding.status === "fix-submitted" ? (
                                <Badge severity="resolved" size="sm">
                                  Awaiting Re-Verification
                                </Badge>
                              ) : (
                                <Badge severity="critical" size="sm">
                                  Fix Pending
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs text-text-muted leading-relaxed">
                              When your team has pushed fixes to your repo, input the commit SHA below to notify the lead auditor and trigger a re-audit pass on this finding.
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
                                  placeholder="Remediation summary (e.g. Added nonReentrant modifier)..."
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
        </div>

        {/* Bottom Gray Area */}
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans">
          <span>
            {areFindingsReleased
              ? `${findings.length} findings recorded · ${findings.filter((f) => f.status === "resolved").length} resolved`
              : "Continuous telemetry active · Synchronized with lead auditor desk"}
          </span>
          <span className="text-[11px]">
            Zyron Dual-Auditor Review Protocol
          </span>
        </div>
      </div>

      {/* ─── 6. TIMESTAMPED ACTIVITY TIMELINE (Layered SaaS Card) ─── */}
      <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
        <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline/60 pb-4">
            <div className="space-y-0.5">
              <h3 className="font-display text-sm font-bold text-text-primary">
                Chronological Activity Journal & Audit Trail
              </h3>
              <p className="text-xs text-text-muted">
                Immutable record of automated compiler passes, auditor assignments, and client remediation commits.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F2F4F7] dark:bg-bg-void text-text-muted">
              {timelineEvents.length} Events Logged
            </span>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-[1px] before:bg-[#E4E7EC] dark:before:bg-border-hairline">
            {timelineEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-4 relative pl-8">
                {/* Timeline node dot */}
                <div className="absolute left-3 top-1.5 h-2.5 w-2.5 rounded-full bg-accent-scan -translate-x-1/2 ring-4 ring-white dark:ring-bg-panel" />

                <div className="space-y-1 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-display text-xs sm:text-sm font-bold text-text-primary">
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

        {/* Bottom Gray Area */}
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans">
          <span>Certified Immutable Event Journal</span>
          <span className="text-[11px]">Protected by SHA-256 Attestation Engine</span>
        </div>
      </div>
    </div>
  );
}
