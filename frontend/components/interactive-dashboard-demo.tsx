"use client";

import * as React from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Layers,
  FileCheck2,
  FileCode2,
  ExternalLink,
  ChevronRight,
  Search,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Clock,
  User,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Download,
  Terminal,
  X,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Eye,
  GitCommit,
  LayoutGrid,
  List,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusPill, type PipelineStatus } from "@/components/ui/status-pill";
import { HighlightedSolidityBlock } from "@/lib/solidity-highlighter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- SAMPLE DATA FOR INTERACTIVE DASHBOARD DEMO ---
interface DemoFinding {
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
  remediatedCode: string;
  comments: {
    sender: string;
    role: "auditor" | "client";
    time: string;
    text: string;
  }[];
}

interface DemoAudit {
  id: string;
  protocolName: string;
  contractFileName: string;
  contractAddress: string;
  gitCommit: string;
  sloc: number;
  stage: PipelineStatus;
  stageStep: number; // 1 to 5
  submittedAt: string;
  estimatedCompletion?: string;
  completedAt?: string;
  assignedAuditor: string;
  peerAuditor?: string;
  bytecodeHash?: string;
  easUid?: string;
  pdfSize?: string;
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    resolved: number;
  };
  findings?: DemoFinding[];
}

const DEMO_AUDITS: DemoAudit[] = [
  {
    id: "ZYR-9481",
    protocolName: "Aura Liquidity Pool V3",
    contractFileName: "VaultCore.sol",
    contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    gitCommit: "8f9b2d4",
    sloc: 2410,
    stage: "in-review",
    stageStep: 3,
    submittedAt: "Yesterday at 14:20 UTC",
    estimatedCompletion: "Tomorrow at 18:00 UTC",
    assignedAuditor: "0xAuditor_K4",
    peerAuditor: "0xAuditor_V9",
    findingsCount: {
      critical: 1,
      high: 1,
      medium: 1,
      low: 0,
      resolved: 1,
    },
    findings: [
      {
        id: "FND-01",
        title: "Cross-Function Reentrancy in withdrawLiquidity()",
        severity: "critical",
        cvss: "CVSS 9.2 · Critical",
        status: "open",
        taxonomy: "SWC-107 · Reentrancy",
        location: "contracts/VaultCore.sol:142-158",
        impact: "Direct drainage of pooled ETH/USDC reserves via untrusted callback during withdrawal execution.",
        description:
          "The withdrawLiquidity function executes an external call to transfer ETH to the caller prior to updating userBalances[msg.sender] and totalPoolShares. A malicious receiver contract can recursively call withdrawLiquidity before balances are cleared, draining pool liquidity in a single transaction block.",
        vulnerableCode: `function withdrawLiquidity(uint256 shareAmount) external {
    require(userBalances[msg.sender] >= shareAmount, "Insufficient shares");
    uint256 ethPayout = (shareAmount * address(this).balance) / totalPoolShares;

    // VULNERABLE: External call executed BEFORE internal balance reduction
    (bool success, ) = msg.sender.call{value: ethPayout}("");
    require(success, "ETH transfer failed");

    userBalances[msg.sender] -= shareAmount;
    totalPoolShares -= shareAmount;
}`,
        remediatedCode: `function withdrawLiquidity(uint256 shareAmount) external nonReentrant {
    require(userBalances[msg.sender] >= shareAmount, "Insufficient shares");
    uint256 ethPayout = (shareAmount * address(this).balance) / totalPoolShares;

    // REMEDIATED: Checks-Effects-Interactions pattern applied before external call
    userBalances[msg.sender] -= shareAmount;
    totalPoolShares -= shareAmount;

    (bool success, ) = msg.sender.call{value: ethPayout}("");
    require(success, "ETH transfer failed");
}`,
        comments: [
          {
            sender: "0xAuditor_K4",
            role: "auditor",
            time: "Yesterday, 15:40 UTC",
            text: "Confirmed reentrancy exploit vector in AST Symbolic pass. State changes must precede the external transfer, and ReentrancyGuard should be inherited.",
          },
          {
            sender: "Aura Tech Lead",
            role: "client",
            time: "Yesterday, 17:15 UTC",
            text: "Applied Checks-Effects-Interactions and added OpenZeppelin ReentrancyGuard in PR #42. Committing patch for re-test.",
          },
          {
            sender: "0xAuditor_K4",
            role: "auditor",
            time: "Today, 09:30 UTC",
            text: "Re-test verified in symbolic pass. State ordering invariant now holds without reversion risk.",
          },
        ],
      },
      {
        id: "FND-02",
        title: "Flash Loan Oracle Slippage via Spot Reserves",
        severity: "high",
        cvss: "CVSS 8.4 · High",
        status: "open",
        taxonomy: "SWC-114 · Price Manipulation",
        location: "contracts/VaultCore.sol:88-102",
        impact: "Collateral valuation manipulation permitting undercollateralized loans within single block.",
        description:
          "The internal share pricing logic evaluates collateral ratios using spot getReserves() from an AMM pair without TWAP averaging or Chainlink heartbeat validation, rendering share pricing susceptible to single-block flash loan skewing.",
        vulnerableCode: `function getCollateralRatio(address user) public view returns (uint256) {
    // VULNERABLE: Direct spot reserves check without TWAP oracle or heartbeat
    (uint112 r0, uint112 r1, ) = IUniswapV2Pair(ammPair).getReserves();
    uint256 spotPrice = (uint256(r1) * 1e18) / uint256(r0);
    return (userDeposits[user] * spotPrice) / userDebt[user];
}`,
        remediatedCode: `function getCollateralRatio(address user) public view returns (uint256) {
    // REMEDIATED: Chainlink AggregatorV3 with updatedAt staleness verification
    (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
    require(price > 0 && block.timestamp - updatedAt <= ORACLE_HEARTBEAT, "Stale price");
    return (userDeposits[user] * uint256(price)) / userDebt[user];
}`,
        comments: [
          {
            sender: "0xAuditor_V9",
            role: "auditor",
            time: "Yesterday, 16:10 UTC",
            text: "Spot reserves are vulnerable to flash loans. Swapping to Chainlink price feed with a max staleness check resolves the vector.",
          },
        ],
      },
      {
        id: "FND-03",
        title: "Unchecked Return Value on ERC-20 transfer()",
        severity: "medium",
        cvss: "CVSS 5.8 · Medium",
        status: "resolved",
        taxonomy: "SWC-104 · Unchecked Call Return",
        location: "contracts/VaultCore.sol:210-218",
        impact: "Silent failure on non-reverting tokens like USDT leading to accounting mismatches.",
        description:
          "The transfer function called standard IERC20(token).transfer() without verifying boolean return status. Tokens that return false instead of reverting on failure could cause phantom deposits.",
        vulnerableCode: `IERC20(underlyingToken).transfer(recipient, amount);`,
        remediatedCode: `SafeERC20.safeTransfer(IERC20(underlyingToken), recipient, amount);`,
        comments: [
          {
            sender: "0xAuditor_K4",
            role: "auditor",
            time: "Yesterday, 14:50 UTC",
            text: "Adopt OpenZeppelin SafeERC20 to ensure non-standard tokens like USDT are safely handled.",
          },
          {
            sender: "Aura Tech Lead",
            role: "client",
            time: "Yesterday, 16:20 UTC",
            text: "SafeERC20 wrapper incorporated. Verified in Foundry test suite.",
          },
        ],
      },
    ],
  },
  {
    id: "ZYR-9478",
    protocolName: "Nexus Collateral Vault",
    contractFileName: "CollateralManager.sol",
    contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    gitCommit: "3c1a9f0",
    sloc: 1180,
    stage: "scanning",
    stageStep: 2,
    submittedAt: "Today at 08:15 UTC",
    estimatedCompletion: "Tomorrow at 12:00 UTC",
    assignedAuditor: "0xAuditor_K4",
    findingsCount: {
      critical: 0,
      high: 1,
      medium: 1,
      low: 2,
      resolved: 0,
    },
    findings: [
      {
        id: "FND-11",
        title: "Liquidation Fee Rounding Error in Favor of Liquidator",
        severity: "high",
        cvss: "CVSS 7.8 · High",
        status: "open",
        taxonomy: "SWC-101 · Arithmetic Precision",
        location: "contracts/CollateralManager.sol:94-110",
        impact: "Small borrow positions liquidated with disproportionate penalty due to premature division.",
        description:
          "Fee computation divides feeBps before multiplication against the liquidated debt amount, discarding lower-order bits and over-penalizing micro-borrowers.",
        vulnerableCode: `uint256 fee = (debtToCover / 10000) * liquidationBonusBps;`,
        remediatedCode: `uint256 fee = (debtToCover * liquidationBonusBps) / 10000;`,
        comments: [
          {
            sender: "0xAuditor_K4",
            role: "auditor",
            time: "Today, 10:20 UTC",
            text: "Multiplication must precede division in integer arithmetic to prevent precision truncations.",
          },
        ],
      },
    ],
  },
  {
    id: "ZYR-9462",
    protocolName: "StakingRewardsDistributor",
    contractFileName: "StakingPool.sol",
    contractAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    gitCommit: "7a8e2b9",
    sloc: 640,
    stage: "completed",
    stageStep: 5,
    submittedAt: "Aug 14, 2026",
    completedAt: "Aug 16, 2026",
    assignedAuditor: "0xAuditor_V9",
    peerAuditor: "0xAuditor_M2",
    bytecodeHash: "0x3e9f4a8b71d6012c8849b209d7c04419f8a32d645e771b00216f91cb94821a",
    easUid: "0x9b3f49c1e7a02241f879685e830b91d293f48a1d7f83b1657ff1fc53b92dc181",
    pdfSize: "1.8 MB",
    findingsCount: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      resolved: 3,
    },
  },
  {
    id: "ZYR-9449",
    protocolName: "YieldAggregatorV2",
    contractFileName: "StrategyRouter.sol",
    contractAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    gitCommit: "1b4c9e8",
    sloc: 1890,
    stage: "completed",
    stageStep: 5,
    submittedAt: "Aug 10, 2026",
    completedAt: "Aug 13, 2026",
    assignedAuditor: "0xAuditor_K4",
    peerAuditor: "0xAuditor_M2",
    bytecodeHash: "0x9812f84bc0192e471d99482bf47712a884910cf92817290192e471d99482bf47",
    easUid: "0x12a884910cf92817290192e471d99482bf47712a884910cf92817290192e471d",
    pdfSize: "3.2 MB",
    findingsCount: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      resolved: 9,
    },
  },
];

export function InteractiveDashboardDemo() {
  const [filterStage, setFilterStage] = React.useState<"in-flight" | "completed" | "all">("in-flight");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");

  // Selected audit for findings modal or attestation report modal
  const [activeFindingsAudit, setActiveFindingsAudit] = React.useState<DemoAudit | null>(null);
  const [activeReportAudit, setActiveReportAudit] = React.useState<DemoAudit | null>(null);
  const [selectedFindingId, setSelectedFindingId] = React.useState<string | null>(null);
  const [copiedHash, setCopiedHash] = React.useState(false);

  // Filtered audits list
  const filteredAudits = React.useMemo(() => {
    return DEMO_AUDITS.filter((audit) => {
      const isCompleted = audit.stage === "completed";
      const matchesStage =
        filterStage === "in-flight"
          ? !isCompleted
          : filterStage === "completed"
          ? isCompleted
          : true;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        audit.protocolName.toLowerCase().includes(q) ||
        audit.contractFileName.toLowerCase().includes(q) ||
        audit.id.toLowerCase().includes(q);

      return matchesStage && matchesSearch;
    });
  }, [filterStage, searchQuery]);

  const inFlightCount = DEMO_AUDITS.filter((a) => a.stage !== "completed").length;
  const completedCount = DEMO_AUDITS.filter((a) => a.stage === "completed").length;

  const handleAuditClick = (audit: DemoAudit) => {
    if (audit.stage === "completed") {
      setActiveReportAudit(audit);
    } else {
      setActiveFindingsAudit(audit);
      if (audit.findings && audit.findings.length > 0) {
        setSelectedFindingId(audit.findings[0].id);
      }
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedHash(true);
    toast.success("SHA-256 Bytecode hash copied to clipboard");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="w-full rounded-t-2xl rounded-b-none border border-b-0 border-[#E2E6EC] dark:border-border-hairline/90 bg-[#F2F4F7] dark:bg-[#080B11] p-1.5 sm:p-2.5 pb-0 sm:pb-0 shadow-2xl relative overflow-hidden">
      {/* ── BROWSER / OS TOP WINDOW BAR ── */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-[#E4E7EC] dark:border-white/10 bg-white/70 dark:bg-bg-panel/70 rounded-t-xl backdrop-blur-xs text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/30 inline-block" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/30 inline-block" />
          <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/30 inline-block" />
          <span className="text-[11px] font-mono text-text-muted ml-2 hidden sm:inline">
            Zyron Security Workbench
          </span>
        </div>

        {/* URL Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F4F7] dark:bg-black/40 border border-[#E2E6EC] dark:border-white/10 text-[11px] font-mono text-text-muted max-w-sm w-full justify-center">
          <Lock className="h-3 w-3 text-emerald-500 shrink-0" />
          <span className="text-text-primary font-medium truncate">zyron.tools</span>
          <span className="text-text-muted truncate hidden sm:inline">/portal</span>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-scan animate-pulse" />
            <span className="hidden sm:inline">Interactive Demo</span>
          </span>
        </div>
      </div>

      {/* ── DASHBOARD MAIN BODY (Reflecting actual /portal) ── */}
      <div className="p-3 sm:p-5 pb-6 sm:pb-8 bg-white dark:bg-bg-panel rounded-t-none rounded-b-none space-y-4">
        {/* 1. TOP HEADER & BREADCRUMBS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E8ECF1] dark:border-border-hairline/60">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted mb-0.5">
              <span>Audits</span>
              <span className="text-border-hairline">/</span>
              <span className="text-text-primary font-medium">Overview</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-text-primary">
                Aura Protocol Security
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-scan animate-pulse" />
                2 Active Audits
              </span>
            </div>
            <p className="text-[11px] text-text-muted max-w-xl">
              Live smart contract security pipeline, automated AST vulnerability scanning, and cryptographic attestations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/portal/new-request">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-scan text-bg-void font-bold text-xs hover:bg-accent-scan/90 transition-all shadow-sm shadow-accent-scan/20 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Audit Request</span>
              </button>
            </Link>
          </div>
        </div>

        {/* 2. METRIC SUMMARY STATS ROW (4 Cards matching signature Zyron nested contrast) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Card 1 */}
          <div className="p-1 rounded-xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs">
            <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span className="font-medium text-text-primary">Active Engagements</span>
                <Radio className="h-3 w-3 text-accent-scan animate-pulse" />
              </div>
              <div className="text-xl sm:text-2xl font-display font-bold text-text-primary">2</div>
            </div>
            <div className="px-2.5 py-1 text-[10px] text-text-muted flex items-center gap-1">
              <span>1 scanning</span>
              <span>•</span>
              <span>1 in review</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-1 rounded-xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs">
            <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span className="font-medium text-text-primary">Lines of Code</span>
                <Layers className="h-3 w-3 text-sky-500" />
              </div>
              <div className="text-xl sm:text-2xl font-display font-bold text-text-primary">24,800</div>
            </div>
            <div className="px-2.5 py-1 text-[10px] text-text-muted truncate">
              Solidity v0.8.20+ verified
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-1 rounded-xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs">
            <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span className="font-medium text-text-primary">Issues Remediated</span>
                <ShieldCheck className="h-3 w-3 text-signal-resolved" />
              </div>
              <div className="text-xl sm:text-2xl font-display font-bold text-signal-resolved">12</div>
            </div>
            <div className="px-2.5 py-1 text-[10px] text-text-muted">
              0 open critical risks
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-1 rounded-xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs">
            <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span className="font-medium text-text-primary">Attested Releases</span>
                <FileCheck2 className="h-3 w-3 text-purple-500" />
              </div>
              <div className="text-xl sm:text-2xl font-display font-bold text-text-primary">5</div>
            </div>
            <div className="px-2.5 py-1 text-[10px] text-text-muted">
              SHA-256 vault signed
            </div>
          </div>
        </div>

        {/* 3. SEGMENTED FILTER TABS & SEARCH */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          {/* Pill Tabs */}
          <div className="inline-flex items-center rounded-xl bg-[#F2F4F7] dark:bg-bg-panel-raised/60 p-0.5 border border-[#E2E6EC] dark:border-border-hairline text-xs font-sans">
            <button
              type="button"
              onClick={() => setFilterStage("in-flight")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer text-xs",
                filterStage === "in-flight"
                  ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <span>Active Audits</span>
              <span className="px-1 py-0.2 rounded-md bg-accent-scan/10 text-accent-scan text-[10px] font-semibold">
                {inFlightCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStage("completed")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer text-xs",
                filterStage === "completed"
                  ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <span>Completed</span>
              <span className="px-1 py-0.2 rounded-md bg-signal-resolved/10 text-signal-resolved text-[10px] font-semibold">
                {completedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStage("all")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer text-xs",
                filterStage === "all"
                  ? "bg-white dark:bg-bg-panel text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <span>All ({DEMO_AUDITS.length})</span>
            </button>
          </div>

          {/* Search Bar & Switcher */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search protocol..."
                className="w-full h-7 pl-7 pr-2.5 rounded-lg bg-[#F2F4F7] dark:bg-bg-panel border border-[#E2E6EC] dark:border-border-hairline text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-scan/40"
              />
            </div>

            <div className="flex items-center rounded-lg bg-[#F2F4F7] dark:bg-bg-panel-raised/60 p-0.5 border border-[#E2E6EC] dark:border-border-hairline">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={cn(
                  "p-1 rounded-md transition-colors cursor-pointer",
                  viewMode === "cards"
                    ? "bg-white dark:bg-bg-panel text-accent-scan shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                )}
                title="Card View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1 rounded-md transition-colors cursor-pointer",
                  viewMode === "table"
                    ? "bg-white dark:bg-bg-panel text-accent-scan shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                )}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. AUDIT ITEMS (Interactive Cards / Table) */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAudits.map((audit) => {
              const isCompleted = audit.stage === "completed";
              const stages = [
                { num: 1, label: "Scope Lock" },
                { num: 2, label: "AST Scan" },
                { num: 3, label: "Triage" },
                { num: 4, label: "Fix Review" },
                { num: 5, label: "Attestation" },
              ];

              return (
                <div
                  key={audit.id}
                  onClick={() => handleAuditClick(audit)}
                  className="rounded-xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1 transition-all hover:border-accent-scan/50 hover:shadow-md cursor-pointer group"
                >
                  {/* Top White Card Section */}
                  <div className="rounded-lg border border-[#E8ECF1] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-3.5 space-y-2.5">
                    {/* Header: ID, Target, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-semibold text-accent-scan">
                            {audit.id}
                          </span>
                          <span className="text-[#D0D5DD] dark:text-border-hairline">•</span>
                          <span className="text-[10px] font-mono text-text-muted truncate">
                            {audit.contractFileName}
                          </span>
                        </div>
                        <h3 className="font-semibold text-xs text-text-primary group-hover:text-accent-scan transition-colors truncate">
                          {audit.protocolName}
                        </h3>
                      </div>

                      <StatusPill status={audit.stage} size="sm" />
                    </div>

                    {/* Finding Severity Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {audit.findingsCount.critical > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-signal-critical/15 text-signal-critical border border-signal-critical/25">
                          {audit.findingsCount.critical} Critical
                        </span>
                      )}
                      {audit.findingsCount.high > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-signal-high/15 text-signal-high border border-signal-high/25">
                          {audit.findingsCount.high} High
                        </span>
                      )}
                      {audit.findingsCount.medium > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-signal-medium/15 text-signal-medium border border-signal-medium/25">
                          {audit.findingsCount.medium} Medium
                        </span>
                      )}
                      {audit.findingsCount.resolved > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-signal-resolved/15 text-signal-resolved border border-signal-resolved/25">
                          ✓ {audit.findingsCount.resolved} Resolved
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/25">
                          SHA-256 Vault Sealed
                        </span>
                      )}
                    </div>

                    {/* 5-Step Pipeline Timeline Bar */}
                    <div className="pt-1.5">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {stages.map((st) => {
                          const isPast = st.num < audit.stageStep;
                          const isCurrent = st.num === audit.stageStep;
                          return (
                            <div key={st.num} className="flex-1 space-y-1">
                              <div
                                className={cn(
                                  "h-1 rounded-full transition-all",
                                  isPast
                                    ? "bg-signal-resolved"
                                    : isCurrent
                                    ? "bg-accent-scan"
                                    : "bg-[#E2E6EC] dark:bg-border-hairline/60"
                                )}
                              />
                              <div
                                className={cn(
                                  "text-[9px] font-mono truncate text-center hidden sm:block",
                                  isCurrent
                                    ? "text-accent-scan font-bold"
                                    : isPast
                                    ? "text-text-primary"
                                    : "text-text-muted"
                                )}
                              >
                                {st.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Gray Meta Strip */}
                  <div className="px-3 py-1.5 flex items-center justify-between gap-2 text-[11px] text-text-muted">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-text-muted" />
                        <span>{isCompleted ? audit.completedAt : audit.estimatedCompletion ? `ETA: ${audit.estimatedCompletion}` : audit.submittedAt}</span>
                      </div>
                      <span>•</span>
                      <span>{audit.sloc.toLocaleString()} SLOC</span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-accent-scan text-[11px] group-hover:underline">
                      <span>{isCompleted ? "View Report" : "Inspect Findings"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="rounded-xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-white dark:bg-bg-panel overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F8F9FA] dark:bg-bg-panel-raised/60 text-text-muted border-b border-border-hairline text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 font-mono">ID</th>
                  <th className="py-2.5 px-3">Protocol Target</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Scope</th>
                  <th className="py-2.5 px-3">Findings</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline/60">
                {filteredAudits.map((audit) => {
                  const isCompleted = audit.stage === "completed";
                  return (
                    <tr
                      key={audit.id}
                      onClick={() => handleAuditClick(audit)}
                      className="hover:bg-[#F8F9FA] dark:hover:bg-bg-panel-raised/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-2 px-3 font-mono font-semibold text-accent-scan text-xs">
                        {audit.id}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-text-primary text-xs group-hover:text-accent-scan transition-colors">
                          {audit.protocolName}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono">{audit.contractFileName}</div>
                      </td>
                      <td className="py-2 px-3">
                        <StatusPill status={audit.stage} size="sm" />
                      </td>
                      <td className="py-2 px-3 font-mono text-text-muted text-xs">
                        {audit.sloc.toLocaleString()} SLOC
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          {audit.findingsCount.critical > 0 && (
                            <span className="text-signal-critical font-bold">{audit.findingsCount.critical}C</span>
                          )}
                          {audit.findingsCount.high > 0 && (
                            <span className="text-signal-high font-bold">{audit.findingsCount.high}H</span>
                          )}
                          {audit.findingsCount.resolved > 0 && (
                            <span className="text-signal-resolved font-bold">✓{audit.findingsCount.resolved}</span>
                          )}
                          {isCompleted && <span className="text-purple-400">Vault Sealed</span>}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-[#F2F4F7] dark:bg-bg-panel-raised hover:bg-accent-scan/10 hover:text-accent-scan text-[11px] font-semibold text-text-primary border border-border-hairline transition-colors"
                        >
                          {isCompleted ? "View Report" : "Inspect"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL 1: INTERACTIVE FINDINGS INSPECTOR (When clicking Active Audit) ── */}
      {activeFindingsAudit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-bg-panel border border-[#E2E6EC] dark:border-border-hairline rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 p-4 border-b border-[#E8ECF1] dark:border-border-hairline/80 bg-[#F8F9FA] dark:bg-bg-panel-raised/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-accent-scan">
                      {activeFindingsAudit.id}
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="text-xs font-semibold text-text-primary">
                      {activeFindingsAudit.protocolName}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      ({activeFindingsAudit.contractFileName})
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Auditor Triage Workbench • {activeFindingsAudit.assignedAuditor} Lead
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveFindingsAudit(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-[#E4E7EC] dark:hover:bg-bg-void transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Left Finding Pills + Right Finding Details */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border-hairline/60">
              {/* Finding Selection Tabs (4 cols) */}
              <div className="col-span-12 md:col-span-4 p-3 space-y-2 bg-[#F8F9FA]/60 dark:bg-bg-void/40 overflow-y-auto">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-1">
                  Detected Findings ({activeFindingsAudit.findings?.length || 0})
                </div>

                {activeFindingsAudit.findings?.map((fnd) => (
                  <button
                    key={fnd.id}
                    type="button"
                    onClick={() => setSelectedFindingId(fnd.id)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl border transition-all space-y-1 cursor-pointer block",
                      selectedFindingId === fnd.id
                        ? "bg-white dark:bg-bg-panel border-accent-scan/50 shadow-sm"
                        : "bg-white/60 dark:bg-bg-panel/40 border-transparent hover:border-border-hairline"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] text-accent-scan font-bold">
                        {fnd.id}
                      </span>
                      <Badge severity={fnd.severity} size="sm">
                        {fnd.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs font-semibold text-text-primary line-clamp-1">
                      {fnd.title}
                    </div>
                    <div className="text-[10px] font-mono text-text-muted truncate">
                      {fnd.location}
                    </div>
                  </button>
                ))}
              </div>

              {/* Finding Active Detail Pane (8 cols) */}
              <div className="col-span-12 md:col-span-8 p-4 sm:p-5 space-y-4 overflow-y-auto">
                {(() => {
                  const fnd =
                    activeFindingsAudit.findings?.find((f) => f.id === selectedFindingId) ||
                    activeFindingsAudit.findings?.[0];

                  if (!fnd) {
                    return (
                      <div className="py-12 text-center text-text-muted text-xs">
                        No finding selected.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {/* Title & Severity Header */}
                      <div className="space-y-1.5 pb-3 border-b border-[#E8ECF1] dark:border-border-hairline/60">
                        <div className="flex items-center gap-2">
                          <Badge severity={fnd.severity} size="md">
                            {fnd.cvss}
                          </Badge>
                          <span className="text-[11px] font-mono text-text-muted">
                            {fnd.taxonomy}
                          </span>
                        </div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-text-primary">
                          {fnd.title}
                        </h3>
                        <div className="text-xs font-mono text-accent-scan">{fnd.location}</div>
                      </div>

                      {/* Description & Impact */}
                      <div className="space-y-2 text-xs">
                        <div className="font-semibold text-text-primary">Vulnerability Summary</div>
                        <p className="text-text-muted leading-relaxed text-xs">{fnd.description}</p>
                        <div className="p-2.5 rounded-lg bg-signal-critical/5 border border-signal-critical/20 text-signal-critical text-[11px]">
                          <strong>Exploit Impact:</strong> {fnd.impact}
                        </div>
                      </div>

                      {/* Vulnerable vs Remediated Code Diffs */}
                      <div className="space-y-3 pt-1">
                        <div>
                          <div className="text-[11px] font-mono font-semibold text-signal-critical flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-signal-critical" />
                              <span>Vulnerable Code Snippet</span>
                            </div>
                            <span className="text-[10px] text-text-muted">{fnd.location}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-black/80 border border-signal-critical/20 overflow-x-auto">
                            <HighlightedSolidityBlock
                              code={fnd.vulnerableCode}
                              className="text-[11px]"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] font-mono font-semibold text-signal-resolved flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-signal-resolved" />
                              <span>Verified Remediated Pattern</span>
                            </div>
                            <span className="text-[10px] text-text-muted">Checks-Effects-Interactions</span>
                          </div>
                          <div className="p-3 rounded-lg bg-black/80 border border-signal-resolved/20 overflow-x-auto">
                            <HighlightedSolidityBlock
                              code={fnd.remediatedCode}
                              className="text-[11px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Auditor Remediation Thread */}
                      <div className="space-y-2 pt-2 border-t border-[#E8ECF1] dark:border-border-hairline/60">
                        <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-accent-scan" />
                          <span>Auditor & Developer Remediation Thread</span>
                        </div>

                        <div className="space-y-2">
                          {fnd.comments.map((c, i) => (
                            <div
                              key={i}
                              className={cn(
                                "p-3 rounded-xl border text-xs space-y-1",
                                c.role === "auditor"
                                  ? "bg-accent-scan/5 border-accent-scan/20"
                                  : "bg-[#F8F9FA] dark:bg-bg-panel-raised border-[#E8ECF1] dark:border-border-hairline"
                              )}
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span
                                  className={cn(
                                    "font-semibold",
                                    c.role === "auditor" ? "text-accent-scan" : "text-text-primary"
                                  )}
                                >
                                  {c.sender} {c.role === "auditor" ? "(Lead Auditor)" : "(Protocol Dev)"}
                                </span>
                                <span className="text-text-muted">{c.time}</span>
                              </div>
                              <p className="text-text-muted text-[11px] leading-relaxed">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#F8F9FA] dark:bg-bg-panel-raised/60 border-t border-[#E8ECF1] dark:border-border-hairline flex items-center justify-between gap-3 text-xs shrink-0">
              <span className="text-text-muted text-[11px]">
                Double-blind human calibration verified
              </span>
              <button
                type="button"
                onClick={() => setActiveFindingsAudit(null)}
                className="px-4 py-1.5 rounded-lg bg-text-primary text-bg-void hover:bg-accent-scan font-bold text-xs transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: INTERACTIVE COMPLETED ATTESTATION REPORT (When clicking Completed Audit) ── */}
      {activeReportAudit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-bg-panel border border-[#E2E6EC] dark:border-border-hairline rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 p-4 border-b border-[#E8ECF1] dark:border-border-hairline/80 bg-[#F8F9FA] dark:bg-bg-panel-raised/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-signal-resolved">
                      {activeReportAudit.id}
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="text-xs font-semibold text-text-primary">
                      {activeReportAudit.protocolName}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Sealed Cryptographic Audit Attestation Report
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveReportAudit(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-[#E4E7EC] dark:hover:bg-bg-void transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Green Verified Banner */}
              <div className="p-4 rounded-xl bg-signal-resolved/10 border border-signal-resolved/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-signal-resolved shrink-0" />
                  <div>
                    <div className="font-semibold text-sm text-text-primary">
                      Immutable On-Chain Attestation Sealed
                    </div>
                    <div className="text-[11px] text-text-muted">
                      100% vulnerabilities verified & remediated. Deployed bytecode anchored on L1.
                    </div>
                  </div>
                </div>

                <Badge severity="resolved" size="md">
                  VERIFIED CLEAN
                </Badge>
              </div>

              {/* Cryptographic Hashes Grid */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-[#E8ECF1] dark:border-border-hairline space-y-3 font-mono">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                    <span>SHA-256 Bytecode Hash Digest</span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(activeReportAudit.bytecodeHash || "")}
                      className="inline-flex items-center gap-1 text-accent-scan hover:underline cursor-pointer"
                    >
                      {copiedHash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedHash ? "Copied" : "Copy Digest"}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/70 text-accent-scan text-[11px] break-all border border-white/10">
                    {activeReportAudit.bytecodeHash}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-text-muted block">EAS Schema UID:</span>
                    <span className="text-text-primary break-all">{activeReportAudit.easUid}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Target Contract File:</span>
                    <span className="text-text-primary">{activeReportAudit.contractFileName} ({activeReportAudit.sloc} SLOC)</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Git Commit Verified:</span>
                    <span className="text-text-primary">commit {activeReportAudit.gitCommit}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Certified Auditor Signatures:</span>
                    <span className="text-text-primary">{activeReportAudit.assignedAuditor} & {activeReportAudit.peerAuditor}</span>
                  </div>
                </div>
              </div>

              {/* Audit Highlights */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-[#E8ECF1] dark:border-border-hairline">
                  <div className="text-xl font-display font-bold text-signal-resolved">14 / 14</div>
                  <div className="text-[10px] text-text-muted">AST Passes Passed</div>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-[#E8ECF1] dark:border-border-hairline">
                  <div className="text-xl font-display font-bold text-signal-resolved">
                    {activeReportAudit.findingsCount.resolved}
                  </div>
                  <div className="text-[10px] text-text-muted">Issues Remediated</div>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-[#E8ECF1] dark:border-border-hairline">
                  <div className="text-xl font-display font-bold text-signal-resolved">0</div>
                  <div className="text-[10px] text-text-muted">Open Criticals</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8ECF1] dark:border-border-hairline/80">
                <button
                  type="button"
                  onClick={() => toast.success(`Downloading Executive PDF (${activeReportAudit.pdfSize})...`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent-scan text-bg-void font-bold text-xs hover:bg-accent-scan/90 transition-all shadow-sm cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Executive PDF ({activeReportAudit.pdfSize})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveReportAudit(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#F2F4F7] dark:bg-bg-panel-raised text-text-primary text-xs font-semibold hover:bg-[#E4E7EC] dark:hover:bg-bg-void transition-colors cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
