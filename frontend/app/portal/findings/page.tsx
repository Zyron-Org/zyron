"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  GitCommit,
  Send,
  AlertTriangle,
  FileCode,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";

interface CommentMessage {
  id: string;
  sender: string;
  senderRole: "auditor" | "client";
  timestamp: string;
  message: string;
  commitRef?: string;
}

interface AggregatedFinding {
  id: string;
  ticketId: string;
  protocolName: string;
  contractFileName: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  cvss: string;
  status: "open" | "fix-submitted";
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

export default function OpenFindingsPage() {
  const [filterStatus, setFilterStatus] = React.useState<"all" | "open" | "fix-submitted">("all");
  const [filterSeverity, setFilterSeverity] = React.useState<string>("all");
  const [filterTicket, setFilterTicket] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedFindingId, setExpandedFindingId] = React.useState<string | null>("ZYR-VAULT-001");

  // Per-finding new comment inputs
  const [commentInputs, setCommentInputs] = React.useState<Record<string, { message: string; commitRef: string }>>({});

  // Aggregated Open and Fix-Submitted findings across active engagements (resolved findings are excluded)
  const [findings, setFindings] = React.useState<AggregatedFinding[]>([
    {
      id: "ZYR-VAULT-001",
      ticketId: "ZYR-9481",
      protocolName: "Aura Liquidity Pool V3",
      contractFileName: "VaultCore.sol",
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
      id: "ZYR-9481-002",
      ticketId: "ZYR-9481",
      protocolName: "Aura Liquidity Pool V3",
      contractFileName: "VaultCore.sol",
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
          message: "Applied SafeERC20 wrapper and updated tests in commit 4b8f10e.",
          commitRef: "4b8f10e",
        },
      ],
    },
    {
      id: "ZYR-9481-004",
      ticketId: "ZYR-9481",
      protocolName: "Aura Liquidity Pool V3",
      contractFileName: "VaultCore.sol",
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
          id: "c4",
          sender: "0xAuditor_K4",
          senderRole: "auditor",
          timestamp: "2026-08-18 21:45 UTC",
          message: "Recommend locking solc version before mainnet deployment.",
        },
      ],
    },
    {
      id: "ZYR-COLLAT-001",
      ticketId: "ZYR-9478",
      protocolName: "Nexus Collateral Vault",
      contractFileName: "CollateralManager.sol",
      title: "Liquidation precision rounding error in collateral factor calculation",
      severity: "high",
      cvss: "CVSS 8.2",
      status: "open",
      taxonomy: "SWC-101 · CWE-682",
      location: "contracts/CollateralManager.sol:88",
      impact: "UNDERCOLLATERALIZED LOAN LIQUIDATION DRAIN",
      description:
        "Integer division before multiplication in `calculateCollateralFactor()` causes premature truncation of liquidation incentive multipliers for sub-18 decimal assets like WBTC/USDC.",
      vulnerableCode: `// ❌ VULNERABLE: Division before multiplication truncates precision
uint256 incentive = (baseFee / 10000) * collateralPrice;`,
      vulnerableLines: "Line 88",
      remediatedCode: `// ✅ SECURED: Full precision fixed-point arithmetic
uint256 incentive = (baseFee * collateralPrice) / 10000;`,
      fuzzTestStatus: "FOUNDRY INVARIANT: 5,000 RUNS PASSED",
      remediationNote: "Perform multiplication prior to division and maintain 18-decimal fixed-point precision throughout calculation.",
      comments: [
        {
          id: "c5",
          sender: "0xAuditor_K4",
          senderRole: "auditor",
          timestamp: "2026-08-17 16:30 UTC",
          message: "Truncation causes liquidation transactions with WBTC collateral to under-calculate debt recovery by up to 4.2%.",
        },
      ],
    },
    {
      id: "ZYR-COLLAT-002",
      ticketId: "ZYR-9478",
      protocolName: "Nexus Collateral Vault",
      contractFileName: "CollateralManager.sol",
      title: "Missing caller validation on liquidatePosition()",
      severity: "high",
      cvss: "CVSS 7.5",
      status: "open",
      taxonomy: "SWC-105 · CWE-284",
      location: "contracts/CollateralManager.sol:114",
      impact: "UNAUTHORIZED LIQUIDATOR EXECUTION",
      description:
        "External function `liquidatePosition()` does not enforce `onlyRole(LIQUIDATOR_ROLE)` in test build configuration, allowing arbitrary callers to trigger collateral repossessions.",
      vulnerableCode: `// ❌ VULNERABLE: Missing role enforcement
function liquidatePosition(address borrower, uint256 debtToCover) external {
    // Unrestricted liquidation caller
}`,
      vulnerableLines: "Line 114–116",
      remediatedCode: `// ✅ SECURED: Enforces LIQUIDATOR_ROLE modifier
function liquidatePosition(address borrower, uint256 debtToCover) external onlyRole(LIQUIDATOR_ROLE) {
    // Role-protected execution
}`,
      remediationNote: "Apply onlyRole(LIQUIDATOR_ROLE) access control modifier to liquidatePosition().",
      comments: [
        {
          id: "c6",
          sender: "0xAuditor_K4",
          senderRole: "auditor",
          timestamp: "2026-08-17 18:00 UTC",
          message: "Ensure LIQUIDATOR_ROLE modifier is added to production liquidation engine.",
        },
      ],
    },
    {
      id: "ZYR-COLLAT-003",
      ticketId: "ZYR-9478",
      protocolName: "Nexus Collateral Vault",
      contractFileName: "CollateralManager.sol",
      title: "Front-running vulnerability on oracle price update window",
      severity: "medium",
      cvss: "CVSS 6.4",
      status: "fix-submitted",
      taxonomy: "SWC-114 · CWE-362",
      location: "contracts/CollateralManager.sol:62",
      impact: "MEV ARBITRAGE ON STALE ORACLE FEEDS",
      description:
        "Oracle price consumer accepts prices older than `maxStaleness` without checking heartbeat timestamp diff against `block.timestamp`.",
      vulnerableCode: `// ❌ VULNERABLE: Missing updatedAt timestamp check
(, int256 price, , , ) = priceFeed.latestRoundData();
require(price > 0, "Invalid price");`,
      vulnerableLines: "Line 62–64",
      remediatedCode: `// ✅ SECURED: Validates heartbeat timestamp freshness
(, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
require(price > 0, "Invalid price");
require(block.timestamp - updatedAt <= MAX_ORACLE_DELAY, "Stale price");`,
      fuzzTestStatus: "CHAINLINK ADAPTER UNIT TESTS PASSED",
      remediationNote: "Enforce block.timestamp - updatedAt <= MAX_ORACLE_DELAY timestamp bounds on all price reads.",
      comments: [
        {
          id: "c7",
          sender: "0xAuditor_K4",
          senderRole: "auditor",
          timestamp: "2026-08-17 19:10 UTC",
          message: "Missing staleness bounds allows MEV bots to front-run liquidation transactions during oracle delay windows.",
        },
        {
          id: "c8",
          sender: "0xClient_8f",
          senderRole: "client",
          timestamp: "2026-08-18 11:30 UTC",
          message: "Added MAX_ORACLE_DELAY = 3600 heartbeat threshold in commit 3c1a9f0.",
          commitRef: "3c1a9f0",
        },
      ],
    },
  ]);

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

    // Reset input for this finding
    setCommentInputs((prev) => ({
      ...prev,
      [findingId]: { message: "", commitRef: "" },
    }));
  };

  // Filtered list
  const filteredFindings = findings.filter((f) => {
    const matchesStatus =
      filterStatus === "all" ? true : f.status === filterStatus;

    const matchesSeverity =
      filterSeverity === "all" ? true : f.severity === filterSeverity;

    const matchesTicket =
      filterTicket === "all" ? true : f.ticketId === filterTicket;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.taxonomy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.protocolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSeverity && matchesTicket && matchesSearch;
  });

  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const highCount = findings.filter((f) => f.severity === "high").length;
  const fixSubmittedCount = findings.filter((f) => f.status === "fix-submitted").length;

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* HEADER: CROSS-TICKET REMEDIATION REGISTER */}
      <section className="p-6 md:p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <Eyebrow size="xs" variant="scan" prefix="// CLIENT_WORKSPACE · ">
                CROSS_TICKET_REMEDIATION_QUEUE
              </Eyebrow>
              <Badge severity="critical" size="sm">
                {findings.length} ACTIVE ITEMS
              </Badge>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
              Open Findings & Remediation Queue
            </h1>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Aggregated register of all active unmitigated and fix-submitted vulnerabilities across in-flight audit engagements. Resolved findings are archived directly to the Document Vault upon engagement completion.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/portal/vault">
              <Button variant="outline" size="sm">
                View Resolved in Vault
              </Button>
            </Link>
            <Link href="/portal/new-request">
              <Button variant="primary" size="sm">
                New Request
              </Button>
            </Link>
          </div>
        </div>

        {/* 4-Column Diagnostic Telemetry Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border-hairline font-mono text-xs">
          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">OPEN CRITICAL (P0)</div>
            <div className="text-2xl font-bold text-signal-critical font-display">
              {criticalCount}
            </div>
            <div className="text-[10px] text-text-muted">Reentrancy on VaultCore</div>
          </div>

          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">OPEN HIGH (P1)</div>
            <div className="text-2xl font-bold text-signal-high font-display">
              {highCount}
            </div>
            <div className="text-[10px] text-text-muted">Liquidation & Token Handling</div>
          </div>

          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">FIX SUBMITTED</div>
            <div className="text-2xl font-bold text-accent-scan font-display">
              {fixSubmittedCount}
            </div>
            <div className="text-[10px] text-text-muted">Awaiting Auditor Re-Verification</div>
          </div>

          <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1">
            <div className="text-text-muted text-[10px]">ACTIVE SCOPES</div>
            <div className="text-2xl font-bold text-text-primary font-display">
              2 Tickets
            </div>
            <div className="text-[10px] text-text-muted">ZAM-9481 · ZAM-9478</div>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH CONTROLS */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-hairline pb-3">
          <div className="flex items-center gap-3">
            <Eyebrow size="sm" prefix="">
              AGGREGATED_FINDINGS // ACTIVE_REGISTER
            </Eyebrow>
            <span className="text-xs text-text-muted hidden md:inline">
              · {filteredFindings.length} Items Displayed
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center rounded-[4px] border border-border-hairline bg-bg-panel p-0.5 font-mono text-xs">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  filterStatus === "all"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                ALL ({findings.length})
              </button>
              <button
                onClick={() => setFilterStatus("open")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  filterStatus === "open"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                OPEN ONLY ({findings.filter((f) => f.status === "open").length})
              </button>
              <button
                onClick={() => setFilterStatus("fix-submitted")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  filterStatus === "fix-submitted"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                FIX SUBMITTED ({fixSubmittedCount})
              </button>
            </div>

            {/* Ticket Selector */}
            <select
              value={filterTicket}
              onChange={(e) => setFilterTicket(e.target.value)}
              className="h-8 px-2 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs text-text-primary focus:outline-none"
            >
              <option value="all">All Active Tickets</option>
              <option value="ZYR-9481">#ZYR-9481 (Aura Vault)</option>
              <option value="ZYR-9478">#ZYR-9478 (Nexus Collateral)</option>
            </select>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="h-8 px-2 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs text-text-primary focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>

            <div className="w-56">
              <Input
                placeholder="Filter findings, SWC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* FINDINGS LIST */}
        <div className="space-y-4">
          {filteredFindings.map((finding) => {
            const isExpanded = expandedFindingId === finding.id;

            return (
              <div
                key={finding.id}
                id={finding.id}
                className={`rounded-[4px] border transition-colors bg-bg-panel overflow-hidden ${
                  isExpanded ? "border-accent-scan/50" : "border-border-hairline hover:border-hairline/90"
                }`}
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-bg-void/40 hover:bg-bg-void/70 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Parent Ticket Link */}
                      <Link
                        href={`/portal/track/${finding.ticketId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-xs font-bold text-accent-scan hover:underline flex items-center gap-1 bg-accent-scan/10 px-2 py-0.5 rounded-[2px] border border-accent-scan/20"
                        title="View in Parent Ticket Status Tracker"
                      >
                        <span>{finding.ticketId}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>

                      <span className="font-mono text-xs text-text-muted font-semibold">
                        {finding.id}
                      </span>

                      <Badge severity={finding.severity} size="sm">
                        {finding.severity.toUpperCase()} ({finding.cvss})
                      </Badge>

                      <span className="font-mono text-xs text-text-muted truncate max-w-xs">
                        {finding.location}
                      </span>

                      {finding.status === "fix-submitted" ? (
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

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-semibold text-text-primary">
                        {finding.title}
                      </span>
                      <span className="text-xs font-mono text-text-muted">
                        · {finding.protocolName} ({finding.contractFileName})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto shrink-0 font-mono text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {finding.comments.length}
                    </span>

                    <Link
                      href={`/portal/track/${finding.ticketId}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="sm" variant="outline" rightIcon={<ExternalLink className="h-3 w-3" />}>
                        Parent Tracker
                      </Button>
                    </Link>

                    <button
                      type="button"
                      className="p-1 rounded text-text-muted hover:text-text-primary"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* EXPANDED FINDING DETAIL (Reusing Vulnerable vs Remediated Pattern) */}
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
                            <span>PARENT TICKET:</span>
                            <Link
                              href={`/portal/track/${finding.ticketId}`}
                              className="text-accent-scan hover:underline"
                            >
                              {finding.ticketId} ({finding.protocolName})
                            </Link>
                          </div>
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

                    {/* PER-FINDING DISCUSSION & COMMIT VERIFICATION THREAD */}
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

                      {/* Client Reply Form with Commit Reference */}
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
    </div>
  );
}
