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

          // Bind real findings from backend database if present
          if (Array.isArray(fetchedAudit.findings) && fetchedAudit.findings.length > 0) {
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

  const [copied, setCopied] = React.useState(false);
  const [isLogStreaming, setIsLogStreaming] = React.useState(true);
  const [showRoundsHistory, setShowRoundsHistory] = React.useState(false);
  const [currentRound, setCurrentRound] = React.useState<number>(2);
  const [pinnedCommit, setPinnedCommit] = React.useState<string>((audit.gitCommit || "8f9b2d4").slice(0, 7));

  // Expanded findings state
  const [expandedFindingId, setExpandedFindingId] = React.useState<string | null>("ZAM-VAULT-001");

  // Per-finding new comment inputs
  const [commentInputs, setCommentInputs] = React.useState<Record<string, { message: string; commitRef: string }>>({});

  // Full detailed mock findings for this ticket
  const [findings, setFindings] = React.useState<DetailedFinding[]>([
    {
      id: "ZAM-VAULT-001",
      title: "Reentrancy in withdrawAll() allows pool liquidation prior to balance reset",
      severity: "critical",
      cvss: "CVSS 9.1",
      status: "open",
      taxonomy: "SWC-107 · CWE-841",
      location: "contracts/VaultCore.sol:142",
      impact: "100% COLLATERAL DRAIN",
      description:
        "The contract executes an external low-level transfer (`msg.sender.call{value: amount}(\"\")`) to an untrusted recipient before zeroing internal accounting records in `userBalances[msg.sender]`. A malicious receiver fallback can re-enter `withdrawAll()` and drain the entire vault balance.",
      vulnerableCode: `// ❌ VULNERABLE: External execution invoked before state zeroing
(bool sent, ) = msg.sender.call{value: amount}("");
require(sent, "Transfer failed");
userBalances[msg.sender] = 0; // State mutated after external call`,
      vulnerableLines: "Line 142–144",
      remediatedCode: `// ✅ SECURED: Balance zeroed prior to external control transfer
userBalances[msg.sender] = 0; // State zeroed first
(bool sent, ) = msg.sender.call{value: amount}("");
require(sent, "Transfer failed");`,
      fuzzTestStatus: "FOUNDRY FUZZ: 10,000 RUNS PASSED",
      remediationNote: "Zero internal userBalances state prior to executing low-level msg.sender.call or apply OpenZeppelin nonReentrant modifier on all transfer paths.",
      comments: [
        {
          id: "c1",
          sender: "0xAuditor_K4",
          senderRole: "auditor",
          timestamp: "2026-08-18 21:35 UTC",
          message:
            "Automated AST pass flagged high-risk external call on line 142. Manual trace confirms userBalances[msg.sender] is mutated after low-level call return. High exploitability.",
        },
      ],
    },
    {
      id: "ZAM-9481-002",
      title: "Unchecked return value on raw ERC-20 transfer in reward distribution",
      severity: "high",
      cvss: "CVSS 7.8",
      status: "fix-submitted",
      taxonomy: "SWC-104 · CWE-252",
      location: "contracts/VaultCore.sol:146",
      impact: "SILENT TOKEN DRAIN / REWARD THEFT",
      description:
        "Raw `.transfer()` call on ERC-20 tokens that do not return a boolean (e.g. USDT) will revert or fail silently without reverting the caller frame, leaving state inconsistent.",
      vulnerableCode: `// ❌ VULNERABLE: Raw transfer ignores boolean return or missing return data
rewardToken.transfer(msg.sender, accruedYield);`,
      vulnerableLines: "Line 146",
      remediatedCode: `// ✅ SECURED: Uses SafeERC20 wrapper
using SafeERC20 for IERC20;
rewardToken.safeTransfer(msg.sender, accruedYield);`,
      fuzzTestStatus: "VERIFIED WITH MOCK USDT & NON-STANDARD TOKENS",
      remediationNote: "Import OpenZeppelin SafeERC20 and replace rewardToken.transfer() with rewardToken.safeTransfer().",
      comments: [
        {
          id: "c2",
          sender: "0xAuditor_K4",
          senderRole: "auditor",
          timestamp: "2026-08-18 21:40 UTC",
          message: "Standard tokens like USDT will cause silent reverts on raw .transfer(). Please apply SafeERC20.",
        },
        {
          id: "c3",
          sender: "0xClient_8f",
          senderRole: "client",
          timestamp: "2026-08-19 14:20 UTC",
          message: "Applied SafeERC20 wrapper and updated tests.",
          commitRef: "4b8f10e",
        },
      ],
    },
    {
      id: "ZAM-9481-003",
      title: "Missing zero-address validation for rewardToken in constructor",
      severity: "medium",
      cvss: "CVSS 5.3",
      status: "resolved",
      taxonomy: "SWC-105 · CWE-20",
      location: "contracts/VaultCore.sol:30",
      impact: "CONTRACT DEPLOYMENT LOCKOUT",
      description:
        "Constructor allows passing `address(0)` for `_rewardToken`, which would lock all subsequent yield operations permanently.",
      vulnerableCode: `// ❌ VULNERABLE: No zero address validation
constructor(address _rewardToken) Ownable(msg.sender) {
    rewardToken = IERC20(_rewardToken);
}`,
      vulnerableLines: "Line 29–31",
      remediatedCode: `// ✅ SECURED: Validates address parameter
constructor(address _rewardToken) Ownable(msg.sender) {
    require(_rewardToken != address(0), "Zero address");
    rewardToken = IERC20(_rewardToken);
}`,
      fuzzTestStatus: "VERIFIED IN ROUND 1 RE-TEST",
      remediationNote: "Add require check verifying _rewardToken != address(0).",
      comments: [
        {
          id: "c4",
          sender: "0xClient_8f",
          senderRole: "client",
          timestamp: "2026-08-18 22:10 UTC",
          message: "Added require check in constructor.",
          commitRef: "7e21a99",
        },
        {
          id: "c5",
          sender: "0xAuditor_K4",
          senderRole: "auditor",
          timestamp: "2026-08-19 09:15 UTC",
          message: "Verified fix in commit 7e21a99. Zero address test passed.",
        },
      ],
    },
    {
      id: "ZAM-9481-004",
      title: "Floating compiler pragma statement ^0.8.20",
      severity: "low",
      cvss: "CVSS 3.1",
      status: "open",
      taxonomy: "SWC-103",
      location: "contracts/VaultCore.sol:2",
      impact: "UNTESTED COMPILER DRIFT",
      description:
        "The contract uses floating pragma `^0.8.20` instead of locking to exact version `pragma solidity 0.8.20;`.",
      vulnerableCode: `// ❌ FLOATING PRAGMA:
pragma solidity ^0.8.20;`,
      vulnerableLines: "Line 2",
      remediatedCode: `// ✅ LOCKED PRAGMA:
pragma solidity 0.8.20;`,
      remediationNote: "Lock the pragma version to 0.8.20 for production deployments.",
      comments: [
        {
          id: "c6",
          sender: "0xAuditor_K4",
          senderRole: "auditor",
          timestamp: "2026-08-18 21:45 UTC",
          message: "Recommend locking solc version before mainnet deployment.",
        },
      ],
    },
  ]);

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(audit.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const activeStageNum = audit.stageNumber
    ? audit.stageNumber
    : audit.stage === "COMPLETED"
    ? 4
    : audit.stage === "IN_REVIEW"
    ? 3
    : audit.stage === "SCANNING"
    ? 2
    : 1;

  // Live scan log lines dynamically constructed from real audit metadata
  const scanLogLines = [
    { time: "13:30:14", type: "info", text: `Ingesting target contract: ${activeFile} (${activeSloc.toLocaleString()} SLOC)` },
    { time: "13:30:18", type: "info", text: `Locking Git commit SHA: ${activeCommit}` },
    { time: "13:30:24", type: "info", text: `Compiler target verified: solc ${activeCompiler} --via-ir --optimize` },
    { time: "13:30:30", type: "info", text: `Target Network: ${activeNetwork}` },
    { time: "13:30:35", type: "info", text: `AST compilation successful: ${Math.max(120, activeSloc * 4)} EVM opcodes mapped across contract methods` },
    { time: "13:31:02", type: "pass", text: "AST Taint Pass 01/14: Access Control & Ownable invariants... PASSED" },
    { time: "13:31:18", type: "pass", text: "AST Taint Pass 02/14: Arithmetic overflow/underflow (Solidity 0.8+)... PASSED" },
    { time: "13:31:40", type: "warn", text: "AST Taint Pass 04/14: ERC-20 return value compliance check..." },
    { time: "13:31:44", type: "flag-high", text: `⚠ FLAG [SWC-104]: Unchecked return on token transfer in ${activeFile}` },
    { time: "13:32:05", type: "pass", text: "AST Taint Pass 06/14: Timestamp dependency & block.number drift... PASSED" },
    { time: "13:32:15", type: "warn", text: "AST Taint Pass 08/14: Low-level call execution order & state mutability..." },
    { time: "13:32:19", type: "flag-crit", text: `⚠ CRITICAL [SWC-107]: msg.sender.call before balance zeroing in ${activeFile}` },
    { time: "13:32:45", type: "pass", text: "AST Taint Pass 09/14: Delegatecall proxy storage slot collision... PASSED" },
    { time: "13:33:04", type: "live", text: "AST Taint Pass 11/14: Symbolic Reentrancy Graph & Invariant Analysis... IN PROGRESS" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
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
                STAGE 02 OF 04
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
                Rounds History (2)
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
                Audit Review Rounds & Commit History
              </span>
              <button
                onClick={() => setShowRoundsHistory(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Round 1 */}
              <div className="p-3 rounded-[2px] bg-bg-panel border border-border-hairline space-y-1">
                <div className="flex items-center justify-between text-text-muted text-[10px]">
                  <span>ROUND 01 — INITIAL INTAKE</span>
                  <span className="text-signal-resolved">COMPLETED</span>
                </div>
                <div className="text-text-primary font-medium">Commit SHA: 8f9b2d4</div>
                <p className="text-[11px] text-text-muted">
                  Initial compiler lock and AST scan. 4 findings triaged by Lead Auditor.
                </p>
                <div className="text-[10px] text-text-muted pt-1">Date: 2026-08-18 21:30 UTC</div>
              </div>

              {/* Round 2 */}
              <div className="p-3 rounded-[2px] bg-bg-panel-raised border border-accent-scan/40 space-y-1">
                <div className="flex items-center justify-between text-accent-scan text-[10px] font-bold">
                  <span>ROUND 02 — REMEDIATION RE-TEST (CURRENT)</span>
                  <span className="bg-accent-scan/10 px-1 py-0.5 rounded-[2px]">ACTIVE</span>
                </div>
                <div className="text-text-primary font-medium">Commit SHA: {pinnedCommit}</div>
                <p className="text-[11px] text-text-muted">
                  Client submitted fixes for ZAM-9481-002 and ZAM-9481-003. Re-verification in progress.
                </p>
                <div className="text-[10px] text-text-muted pt-1">Date: 2026-08-20 14:20 UTC</div>
              </div>
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
              <span className="text-text-primary text-[11px] truncate">
                {audit.contractAddress.slice(0, 10)}...{audit.contractAddress.slice(-8)}
              </span>
              <button
                onClick={handleCopyAddress}
                className="text-text-muted hover:text-text-primary transition-colors"
                title="Copy Address"
              >
                {copied ? <Check className="h-3 w-3 text-signal-resolved" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Card 2: Scope & Compiler */}
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px] uppercase tracking-wider">
              SCOPE & COMPILER
            </div>
            <div className="text-accent-scan font-medium text-[11px]">
              {audit.sloc.toLocaleString()} SLOC · {audit.compilerVersion}
            </div>
          </div>

          {/* Card 3: Assigned Auditors */}
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px] uppercase tracking-wider">
              ASSIGNED AUDITOR LEAD
            </div>
            <div className="text-text-primary font-medium text-[11px] flex items-center gap-1.5">
              <User className="h-3 w-3 text-accent-scan" />
              <span>{audit.assignedAuditor || "0xAuditor_K4"}</span>
            </div>
          </div>

          {/* Card 4: Pinned Commit & SLA */}
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px] uppercase tracking-wider">
              PINNED COMMIT · ETA
            </div>
            <div className="text-signal-resolved font-medium text-[11px] flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>{audit.estimatedCompletion || "~48h ETA"}</span>
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
              · {findings.length} Triaged Items · {findings.filter((f) => f.status === "resolved").length} Resolved
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <Badge severity="critical" size="sm">
              {findings.filter((f) => f.severity === "critical" && f.status !== "resolved").length} OPEN CRITICAL
            </Badge>
            <Badge severity="high" size="sm">
              {findings.filter((f) => f.severity === "high" && f.status !== "resolved").length} OPEN HIGH
            </Badge>
          </div>
        </div>

        {/* Findings Accordion List */}
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
                          <pre className="text-text-muted leading-relaxed overflow-x-auto pt-1">
                            <code>{finding.vulnerableCode}</code>
                          </pre>
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
                          <pre className="text-text-muted leading-relaxed overflow-x-auto pt-1">
                            <code>{finding.remediatedCode}</code>
                          </pre>
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
      </section>

      {/* SECTION 3: TIMESTAMPED ACTIVITY TIMELINE */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border-hairline pb-3">
          <Eyebrow size="sm" prefix="// AUDIT_TELEMETRY · ">
            TIMESTAMPED_ACTIVITY_TIMELINE
          </Eyebrow>
          <span className="font-mono text-xs text-text-muted">
            CHRONOLOGICAL AUDIT JOURNAL
          </span>
        </div>

        <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-[1px] before:bg-border-hairline">
            {[
              {
                time: "2026-08-18 21:30:14 UTC",
                title: "Scope Ingested & Git Commit Pinned",
                desc: "Contract VaultCore.sol (2,410 SLOC) ingested. Commit SHA 8f9b2d4 locked to engagement scope.",
                badge: "RESOLVED",
                badgeSeverity: "resolved" as const,
              },
              {
                time: "2026-08-18 21:30:24 UTC",
                title: "Compiler Solc v0.8.20 Locked",
                desc: "Verified Shanghai EVM target flags with --via-ir optimizations (200 runs).",
                badge: "PASSED",
                badgeSeverity: "resolved" as const,
              },
              {
                time: "2026-08-18 21:30:35 UTC",
                title: "AST Control Flow Tree Constructed",
                desc: "Engine mapped 1,842 EVM opcodes and generated 14 isolated execution pathways.",
                badge: "PASSED",
                badgeSeverity: "resolved" as const,
              },
              {
                time: "2026-08-18 21:32:19 UTC",
                title: "Reentrancy Vulnerability Detected on Line 142",
                desc: "Static taint pass flagged unchecked external call before state decrement in withdrawAll(). SWC-107 pattern triggered.",
                badge: "CRITICAL",
                badgeSeverity: "critical" as const,
              },
              {
                time: "2026-08-18 21:33:00 UTC",
                title: "Lead Auditor 0xAuditor_K4 Assigned",
                desc: "Ticket routed to senior protocol auditor queue for manual verification and Foundry PoC reproduction.",
                badge: "ASSIGNED",
                badgeSeverity: "informational" as const,
              },
            ].map((event, i) => (
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
