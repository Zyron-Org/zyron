"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  Clock,
  Split,
  MessageSquare,
  Send,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  FileCode2,
  FileEdit,
  Cpu,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FolderTree,
  Folder,
  FolderOpen,
  FileText,
  Building,
  Hash,
  ExternalLink,
  BookOpen,
  Info,
  Sliders,
  CheckCheck,
  Plus,
  Bot,
  User,
  Sparkles,
  GitCompare,
  Eye,
  FileDiff,
  FileCheck2,
  Lock,
  Download,
  FileJson,
  History,
  Trash2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { MOCK_AUDIT_REQUESTS, type AuditRequest } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { HighlightedSolidityLine, HighlightedSolidityBlock } from "@/lib/solidity-highlighter";


interface DiffLine {
  type: "add" | "delete" | "context" | "header";
  oldLine?: number;
  newLine?: number;
  code: string;
}

interface ProjectFile {
  path: string;
  name: string;
  folder: string;
  sloc: number;
  hasFixDiff: boolean;
  additions: number;
  deletions: number;
  diffLines: DiffLine[];
  flags: { line: number; type: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL" | "FIX_APPLIED" | "AI_FLAG"; label: string; findingId?: string }[];
  lines: { line: number; code: string; highlight?: boolean; flag?: string; label?: string; findingId?: string }[];
}

interface TriageFinding {
  id: string;
  swcId: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  cvss: string;
  title: string;
  file: string;
  line: number;
  description: string;
  remediation: string;
  status: "open" | "fix-submitted" | "resolved" | "wont-fix";
  falsePositive?: boolean;
  fpJustification?: string;
  impact?: string;
  vulnerableCode?: string;
}

export default function AuditorCodeReviewPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = (params?.id as string) || "";

  // Real audit data from the backend
  const [auditData, setAuditData] = React.useState<AuditRequest | null>(null);
  const [fetchedSourceCode, setFetchedSourceCode] = React.useState<string | null>(null);
  const [dataLoading, setDataLoading] = React.useState(true);

  // File Tree Explorer visibility
  const [showFileTree, setShowFileTree] = React.useState(true);
  const [expandedFolders, setExpandedFolders] = React.useState<Record<string, boolean>>({
    contracts: true,
    interfaces: true,
    libraries: true,
  });

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  // View Mode: 'diff' vs 'full'
  const [viewMode, setViewMode] = React.useState<"diff" | "full">("diff");
  const [selectedFilePath, setSelectedFilePath] = React.useState<string>("contracts/VaultCore.sol");
  const [activeRightTab, setActiveRightTab] = React.useState<"triage" | "comms">("triage");

  // Findings & Triage state
  const [findings, setFindings] = React.useState<TriageFinding[]>([
    {
      id: "ZYR-9481-002",
      swcId: "SWC-104",
      severity: "high",
      cvss: "CVSS 7.8",
      title: "Unchecked ERC-20 Transfer in Reward Distribution",
      file: "contracts/VaultCore.sol",
      line: 146,
      description: "Raw transfer ignores non-boolean returns on tokens like USDT.",
      remediation: "Import SafeERC20 and use safeTransfer.",
      status: "resolved",
      falsePositive: false,
    },
    {
      id: "ZYR-VAULT-001",
      swcId: "SWC-107",
      severity: "critical",
      cvss: "CVSS 9.1",
      title: "Reentrancy in withdrawAll() allows pool liquidation",
      file: "contracts/VaultCore.sol",
      line: 142,
      description: "External low-level call msg.sender.call executes prior to zeroing userBalances.",
      remediation: "Zero userBalances state before external call (Checks-Effects-Interactions).",
      status: "fix-submitted",
      falsePositive: false,
    },
  ]);

  const [selectedFindingId, setSelectedFindingId] = React.useState<string>("ZYR-VAULT-001");
  const [findingFilter, setFindingFilter] = React.useState<"all" | "active" | "resolved" | "dismissed">("all");
  const [auditorNote, setAuditorNote] = React.useState("");

  // Add Manual Finding Modal State
  const [showAddFindingModal, setShowAddFindingModal] = React.useState(false);
  const [isSubmittingFinding, setIsSubmittingFinding] = React.useState(false);
  const [newFindingForm, setNewFindingForm] = React.useState({
    title: "",
    severity: "HIGH" as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL",
    cvss: "CVSS 8.5",
    taxonomy: "SWC-107 · CWE-841 (Reentrancy)",
    file: "contracts/VaultCore.sol",
    line: 142,
    impact: "Potential protocol liquidity drain or unauthorized state manipulation.",
    description: "",
    vulnerableCode: "",
    remediation: "",
  });

  // False Positive Justification Modal State
  const [showFpModal, setShowFpModal] = React.useState(false);
  const [fpJustificationInput, setFpJustificationInput] = React.useState("");
  const [findingToDismiss, setFindingToDismiss] = React.useState<TriageFinding | null>(null);

  // Edit Finding Modal State (reuses newFindingForm, flagged by editingFindingId)
  const [editingFindingId, setEditingFindingId] = React.useState<string | null>(null);
  const [isEditingFinding, setIsEditingFinding] = React.useState(false);

  // Ticket Completion Status
  const [ticketStage, setTicketStage] = React.useState<string>("in-review");
  const [isFinalized, setIsFinalized] = React.useState(false);

  // Whether audit is in "corrections requested" stage — client is applying fixes, auditor is in read-only review mode
  const isCorrectionsStage = ticketStage.includes("correction");


  // Scope Dossier Drawer
  const [showProjectDossier, setShowProjectDossier] = React.useState(false);

  // Report Compilation Modal State
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [isCompilingReport, setIsCompilingReport] = React.useState(false);
  const [compiledPdfUrl, setCompiledPdfUrl] = React.useState<string | null>(null);

  // Discussion Messages Feed State
  const [discussionMessages, setDiscussionMessages] = React.useState<
    { id: string; sender: string; role: "auditor" | "client"; timestamp: string; message: string; commitRef?: string }[]
  >([
    {
      id: "m-1",
      sender: "0xAuditor_K4",
      role: "auditor",
      timestamp: "2026-08-18 21:35 UTC",
      message:
        "Flagged CRITICAL candidate on line 142 (withdrawAll). low-level call msg.sender.call executes before userBalances[msg.sender] = 0.",
    },
    {
      id: "m-2",
      sender: "Aura Core Protocol",
      role: "client",
      timestamp: "2026-08-19 14:20 UTC",
      message:
        "Applied SafeERC20 wrapper across VaultCore.sol and updated Foundry invariant fuzz test suite in test/VaultCore.t.sol. Pinned commit 4b8f10e for re-verification.",
      commitRef: "4b8f10e",
    },
  ]);

  // Load audit data and findings from API
  React.useEffect(() => {
    if (!ticketId) return;
    Promise.all([
      apiClient.get(`/audits/${ticketId}`).catch(() => null),
      apiClient.get(`/audits/${ticketId}/findings`).catch(() => ({ data: [] })),
    ]).then(([auditRes, findingsRes]) => {
      if (auditRes?.data) {
        const a = auditRes.data;
        const auditObj = {
          id: a.id || ticketId,
          protocolName: a.protocolName || a.contractFileName || ticketId,
          contractFileName: a.contractFileName || "VaultCore.sol",
          contractAddress: a.contractAddress || "0x0000000000000000000000000000000000000000",
          gitCommit: a.gitCommit || "8f9b2d4",
          compilerVersion: a.compilerVersion || "v0.8.20",
          sloc: a.sloc || 0,
          stage: (a.stage || "pending").toLowerCase().replace("_", "-"),
          stageNumber: a.stageNumber || 1,
          submittedAt: a.submittedAt || "",
          estimatedCompletion: a.estimatedCompletion,
          assignedAuditor: a.leadAuditor?.name || a.assignedAuditorId || "0xAuditor_K4",
          peerAuditor: a.peerAuditor?.name,
          currentActivity: a.currentActivity,
          bytecodeHash: a.bytecodeHash,
          reportPdfUrl: a.reportPdfUrl,
          pdfSize: a.pdfSize,
          roundsToResolution: a.roundsToResolution,
          findings: a.findings || { critical: 0, high: 0, medium: 0, low: 0, resolved: 0 },
          failureReason: a.failureReason,
          onChainTxHash: a.onChainTxHash,
          onChainChainId: a.onChainChainId,
        } as AuditRequest;

        setAuditData(auditObj);
        setTicketStage(auditObj.stage);

        const targetFile = a.contractFileName || "VaultCore.sol";
        const defaultPath = targetFile.includes("/") ? targetFile : `contracts/${targetFile}`;
        setSelectedFilePath(defaultPath);

        const repoStr = a.githubRepoUrl || a.protocolName;
        if (repoStr && repoStr.includes("/")) {
          const parts = repoStr.split("/");
          apiClient
            .get("/integrations/github/file-content", {
              params: {
                owner: parts[0],
                repo: parts[1],
                filePath: targetFile,
                branch: a.githubBranch || "main",
              },
            })
            .then((rawRes) => {
              if (rawRes.data?.content) {
                setFetchedSourceCode(rawRes.data.content);
              }
            })
            .catch(() => null);
        }
      } else {
        const fallback = MOCK_AUDIT_REQUESTS.find(
          (x) => x.id.toLowerCase() === ticketId.toLowerCase()
        ) || MOCK_AUDIT_REQUESTS[0];
        setAuditData(fallback);
      }

      // Load real findings into triage panel
      if (Array.isArray(findingsRes?.data) && findingsRes.data.length > 0) {
        const realFindings: TriageFinding[] = findingsRes.data.map((f: any) => ({
          id: f.id || f.displayId,
          swcId: f.taxonomy ? f.taxonomy.split(" ")[0] : (f.swcId || "SWC-107"),
          severity: (f.severity || "medium").toLowerCase() as any,
          cvss: f.cvss || (f.cvssScore ? `CVSS ${f.cvssScore}` : "CVSS 8.0"),
          title: f.title || "Untitled Finding",
          file: f.location?.split(":")[0] || f.affectedFile || (auditRes?.data?.contractFileName ? `contracts/${auditRes.data.contractFileName}` : "contracts/VaultCore.sol"),
          line: parseInt(f.location?.split(":")[1] || "142", 10) || f.lineNumber || 1,
          description: f.description || "",
          remediation: f.remediationNote || f.remediation || "",
          status: (f.status || "open").toLowerCase().replace("_", "-") as any,
          falsePositive: !!f.falsePositive,
          fpJustification: f.fpJustification || "",
          impact: f.impact || "",
          vulnerableCode: f.vulnerableCode || "",
        }));

        setFindings(realFindings);
        setSelectedFindingId(realFindings[0].id);
      }
    }).finally(() => setDataLoading(false));
  }, [ticketId]);

  const audit = auditData || (MOCK_AUDIT_REQUESTS.find(
    (a) => a.id.toLowerCase() === ticketId.toLowerCase()
  ) || MOCK_AUDIT_REQUESTS[0]);

  const fname = auditData?.contractFileName || "VaultCore.sol";
  const baseName = fname.replace(/\.sol$/, "");
  const primaryPath = fname.includes("/") ? fname : `contracts/${fname}`;

  // Multi-file Project Structure for the File Tree Explorer
  const projectFiles: ProjectFile[] = React.useMemo(() => {
    const defaultCode = `// SPDX-License-Identifier: MIT
pragma solidity ${auditData?.compilerVersion?.replace('v', '^') || '^0.8.20'};

import "./interfaces/I${baseName}.sol";
import "./libraries/TransferHelper.sol";

/**
 * @title ${auditData?.protocolName || "VaultCore"}
 * @notice Automated liquidity vault with yield routing
 * @dev Commit SHA: ${auditData?.gitCommit?.slice(0, 7) || "8f9b2d4"}
 */
contract ${baseName} is I${baseName} {
    using TransferHelper for address;

    mapping(address => uint256) public override userBalances;
    mapping(address => bool) public lockedPositions;
    uint256 public override totalLocked;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable override {
        require(msg.value > 0, "Zero deposit");
        userBalances[msg.sender] += msg.value;
        totalLocked += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // Vulnerable function flagged in initial AST scan
    function withdrawAll() external override {
        uint256 amount = userBalances[msg.sender];
        require(amount > 0, "No balance");
        require(!lockedPositions[msg.sender], "Position locked");

        // External low-level call before state update allows reentrancy exploit
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");

        userBalances[msg.sender] = 0;
        totalLocked -= amount;
        emit Withdraw(msg.sender, amount);
    }
}`;

    const rawCode = fetchedSourceCode || defaultCode;
    const rawLines = rawCode.split("\n");

    const getFileFindings = (path: string, name: string) => {
      return findings.filter(
        (f) => (f.file.includes(name) || f.file.includes(path) || (path === primaryPath && !f.file.includes("/")))
      );
    };

    // Primary Contract
    const primaryFindings = getFileFindings(primaryPath, fname);
    const primaryLines = rawLines.map((line, idx) => {
      const lineNum = idx + 1;
      const findingOnLine = primaryFindings.find((f) => f.line === lineNum);
      return {
        line: lineNum,
        code: line,
        highlight: !!findingOnLine && !findingOnLine.falsePositive,
        flag: findingOnLine ? (findingOnLine.severity.toUpperCase() as any) : undefined,
        label: findingOnLine ? `${findingOnLine.swcId} ${findingOnLine.title}` : undefined,
        findingId: findingOnLine?.id,
      };
    });

    const primaryFile: ProjectFile = {
      path: primaryPath,
      name: fname,
      folder: "contracts",
      sloc: auditData?.sloc || rawLines.length,
      hasFixDiff: true,
      additions: 4,
      deletions: 1,
      diffLines: primaryLines.slice(0, 45).map((l) => ({
        type: "context" as const,
        oldLine: l.line,
        newLine: l.line,
        code: l.code,
      })),
      flags: primaryFindings.map((f) => ({
        line: f.line || 1,
        type: (f.severity.toUpperCase() as any) || "HIGH",
        label: `${f.swcId} ${f.title}`,
        findingId: f.id,
      })),
      lines: primaryLines,
    };

    // Interface
    const ifacePath = `contracts/interfaces/I${baseName}.sol`;
    const ifaceName = `I${baseName}.sol`;
    const ifaceFindings = getFileFindings(ifacePath, ifaceName);
    const ifaceRaw = `// SPDX-License-Identifier: MIT
pragma solidity ${auditData?.compilerVersion?.replace('v', '^') || '^0.8.20'};

interface I${baseName} {
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event EmergencyPause(address indexed caller);

    function deposit() external payable;
    function withdrawAll() external;
    function userBalances(address user) external view returns (uint256);
    function totalLocked() external view returns (uint256);
}`;
    const ifaceLines = ifaceRaw.split("\n").map((code, idx) => {
      const lineNum = idx + 1;
      const fOnLine = ifaceFindings.find((f) => f.line === lineNum);
      return {
        line: lineNum,
        code,
        highlight: !!fOnLine && !fOnLine.falsePositive,
        flag: fOnLine ? (fOnLine.severity.toUpperCase() as any) : undefined,
        label: fOnLine ? `${fOnLine.swcId} ${fOnLine.title}` : undefined,
        findingId: fOnLine?.id,
      };
    });
    const ifaceFile: ProjectFile = {
      path: ifacePath,
      name: ifaceName,
      folder: "interfaces",
      sloc: ifaceLines.length,
      hasFixDiff: false,
      additions: 0,
      deletions: 0,
      diffLines: ifaceLines.map((l) => ({ type: "context" as const, oldLine: l.line, newLine: l.line, code: l.code })),
      flags: ifaceFindings.map((f) => ({ line: f.line || 1, type: (f.severity.toUpperCase() as any) || "LOW", label: f.title, findingId: f.id })),
      lines: ifaceLines,
    };

    // Library
    const libPath = `contracts/libraries/TransferHelper.sol`;
    const libName = `TransferHelper.sol`;
    const libFindings = getFileFindings(libPath, libName);
    const libRaw = `// SPDX-License-Identifier: MIT
pragma solidity ${auditData?.compilerVersion?.replace('v', '^') || '^0.8.20'};

library TransferHelper {
    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, "ETH_TRANSFER_FAILED");
    }

    function safeTransfer(address token, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0xa9059cbb, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "SAFE_TRANSFER_FAILED");
    }
}`;
    const libLines = libRaw.split("\n").map((code, idx) => {
      const lineNum = idx + 1;
      const fOnLine = libFindings.find((f) => f.line === lineNum);
      return {
        line: lineNum,
        code,
        highlight: !!fOnLine && !fOnLine.falsePositive,
        flag: fOnLine ? (fOnLine.severity.toUpperCase() as any) : undefined,
        label: fOnLine ? `${fOnLine.swcId} ${fOnLine.title}` : undefined,
        findingId: fOnLine?.id,
      };
    });
    const libFile: ProjectFile = {
      path: libPath,
      name: libName,
      folder: "libraries",
      sloc: libLines.length,
      hasFixDiff: true,
      additions: 2,
      deletions: 0,
      diffLines: libLines.map((l) => ({ type: "context" as const, oldLine: l.line, newLine: l.line, code: l.code })),
      flags: libFindings.map((f) => ({ line: f.line || 1, type: (f.severity.toUpperCase() as any) || "HIGH", label: f.title, findingId: f.id })),
      lines: libLines,
    };

    return [primaryFile, ifaceFile, libFile];
  }, [auditData, fetchedSourceCode, findings, primaryPath, fname, baseName]);

  const activeFile = projectFiles.find((f) => f.path === selectedFilePath) || projectFiles[0];

  // Group files by folder for File Tree Explorer
  const fileTree = React.useMemo(() => {
    const folders: Record<string, ProjectFile[]> = {};
    projectFiles.forEach((file) => {
      const folderKey = file.folder || "contracts";
      if (!folders[folderKey]) folders[folderKey] = [];
      folders[folderKey].push(file);
    });
    return Object.entries(folders).map(([folder, files]) => ({ folder, files }));
  }, [projectFiles]);

  // Selected Finding Reference
  const selectedFinding = findings.find((f) => f.id === selectedFindingId) || findings[0];

  // Filtered findings based on tab filter
  const filteredFindings = React.useMemo(() => {
    if (findingFilter === "active") {
      return findings.filter((f) => !f.falsePositive && f.status !== "resolved" && f.status !== "wont-fix");
    }
    if (findingFilter === "resolved") {
      return findings.filter((f) => f.status === "resolved");
    }
    if (findingFilter === "dismissed") {
      return findings.filter((f) => f.falsePositive || f.status === "wont-fix");
    }
    return findings;
  }, [findings, findingFilter]);

  // Invariant Check: All active non-dismissed findings must be resolved to generate a report
  const activeUnresolvedFindings = findings.filter(
    (f) => !f.falsePositive && f.status !== "resolved" && f.status !== "wont-fix"
  );
  const allFindingsResolved = activeUnresolvedFindings.length === 0;
  const openOrFixCount = activeUnresolvedFindings.length;

  // Active file findings count
  const activeFileFindingsCount = findings.filter(
    (f) => !f.falsePositive && (f.file.includes(activeFile.name) || f.file.includes(activeFile.path))
  ).length;

  // Open Add Finding Modal
  const handleOpenAddFinding = (filePath?: string, line?: number, codeSnippet?: string) => {
    setNewFindingForm((prev) => ({
      ...prev,
      file: filePath || selectedFilePath,
      line: line || prev.line || 1,
      vulnerableCode: codeSnippet || prev.vulnerableCode || "",
    }));
    setShowAddFindingModal(true);
  };

  // Submit New Manual Finding
  const handleSubmitNewFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFindingForm.title.trim()) {
      toast.error("Please provide a title for the finding.");
      return;
    }

    setIsSubmittingFinding(true);
    try {
      const res = await apiClient.post(`/audits/${audit.id}/findings`, {
        title: newFindingForm.title.trim(),
        severity: newFindingForm.severity,
        cvss: newFindingForm.cvss,
        taxonomy: newFindingForm.taxonomy,
        location: `${newFindingForm.file}:${newFindingForm.line}`,
        impact: newFindingForm.impact,
        description: newFindingForm.description,
        vulnerableCode: newFindingForm.vulnerableCode,
        remediationNote: newFindingForm.remediation,
      });

      const created = res.data;
      const mappedNewFinding: TriageFinding = {
        id: created.id || created.displayId,
        swcId: created.taxonomy ? created.taxonomy.split(" ")[0] : "SWC-107",
        severity: (created.severity || newFindingForm.severity).toLowerCase() as any,
        cvss: created.cvss || newFindingForm.cvss,
        title: created.title || newFindingForm.title,
        file: newFindingForm.file,
        line: Number(newFindingForm.line) || 1,
        description: created.description || newFindingForm.description,
        remediation: created.remediationNote || newFindingForm.remediation,
        status: "open",
        falsePositive: false,
        fpJustification: "",
        impact: created.impact || newFindingForm.impact,
        vulnerableCode: created.vulnerableCode || newFindingForm.vulnerableCode,
      };

      setFindings((prev) => [mappedNewFinding, ...prev]);
      setSelectedFindingId(mappedNewFinding.id);
      setSelectedFilePath(newFindingForm.file);
      setShowAddFindingModal(false);
      setNewFindingForm({
        title: "",
        severity: "HIGH",
        cvss: "CVSS 8.5",
        taxonomy: "SWC-107 · CWE-841 (Reentrancy)",
        file: activeFile.path,
        line: 1,
        impact: "Potential protocol liquidity drain or unauthorized state manipulation.",
        description: "",
        vulnerableCode: "",
        remediation: "",
      });
      toast.success(`Finding ${mappedNewFinding.id} logged successfully!`);
    } catch (err: any) {
      console.warn("Failed to create finding on API, adding locally:", err?.message);
      const mockId = `${audit.id}-${String(findings.length + 1).padStart(3, "0")}`;
      const localFinding: TriageFinding = {
        id: mockId,
        swcId: newFindingForm.taxonomy.split(" ")[0] || "SWC-107",
        severity: newFindingForm.severity.toLowerCase() as any,
        cvss: newFindingForm.cvss,
        title: newFindingForm.title,
        file: newFindingForm.file,
        line: Number(newFindingForm.line) || 1,
        description: newFindingForm.description,
        remediation: newFindingForm.remediation,
        status: "open",
        falsePositive: false,
        fpJustification: "",
        impact: newFindingForm.impact,
        vulnerableCode: newFindingForm.vulnerableCode,
      };
      setFindings((prev) => [localFinding, ...prev]);
      setSelectedFindingId(localFinding.id);
      setShowAddFindingModal(false);
      toast.success(`Finding ${localFinding.id} logged locally!`);
    } finally {
      setIsSubmittingFinding(false);
    }
  };

  // Open Edit Finding Modal — pre-populates the Add Finding form with existing finding data
  const handleOpenEditFinding = (finding: TriageFinding) => {
    setEditingFindingId(finding.id);
    setNewFindingForm({
      title: finding.title,
      severity: finding.severity.toUpperCase() as any,
      cvss: finding.cvss || "CVSS 8.5",
      taxonomy: finding.swcId || "SWC-107 · CWE-841 (Reentrancy)",
      file: finding.file,
      line: finding.line,
      impact: finding.impact || "",
      description: finding.description || "",
      vulnerableCode: finding.vulnerableCode || "",
      remediation: finding.remediation || "",
    });
    setShowAddFindingModal(true);
  };

  // Submit Edit Finding — PATCH existing finding instead of creating new one
  const handleSubmitEditFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFindingId || !newFindingForm.title.trim()) {
      toast.error("Please provide a title for the finding.");
      return;
    }

    setIsEditingFinding(true);
    try {
      await apiClient.patch(`/findings/${editingFindingId}`, {
        title: newFindingForm.title.trim(),
        severity: newFindingForm.severity,
        cvss: newFindingForm.cvss,
        taxonomy: newFindingForm.taxonomy,
        location: `${newFindingForm.file}:${newFindingForm.line}`,
        impact: newFindingForm.impact,
        description: newFindingForm.description,
        vulnerableCode: newFindingForm.vulnerableCode,
        remediationNote: newFindingForm.remediation,
      });
    } catch (e: any) {
      console.warn("Could not patch finding on API, applying locally:", e.message);
    }

    setFindings((prev) =>
      prev.map((f) =>
        f.id === editingFindingId
          ? {
              ...f,
              title: newFindingForm.title.trim(),
              severity: newFindingForm.severity.toLowerCase() as any,
              cvss: newFindingForm.cvss,
              swcId: newFindingForm.taxonomy.split(" ")[0] || f.swcId,
              file: newFindingForm.file,
              line: Number(newFindingForm.line),
              impact: newFindingForm.impact,
              description: newFindingForm.description,
              vulnerableCode: newFindingForm.vulnerableCode,
              remediation: newFindingForm.remediation,
            }
          : f
      )
    );

    toast.success(`Finding ${editingFindingId} updated successfully.`);
    setShowAddFindingModal(false);
    setEditingFindingId(null);
    setNewFindingForm({
      title: "",
      severity: "HIGH",
      cvss: "CVSS 8.5",
      taxonomy: "SWC-107 · CWE-841 (Reentrancy)",
      file: activeFile.path,
      line: 1,
      impact: "Potential protocol liquidity drain or unauthorized state manipulation.",
      description: "",
      vulnerableCode: "",
      remediation: "",
    });
    setIsEditingFinding(false);
  };

  // Open False Positive Modal
  const handleOpenFpModal = (finding: TriageFinding) => {
    setFindingToDismiss(finding);
    setFpJustificationInput("");
    setShowFpModal(true);
  };

  // Confirm False Positive Dismissal
  const handleConfirmFalsePositive = async () => {
    if (!findingToDismiss) return;
    const justification = fpJustificationInput.trim() || "Auditor evaluated as non-exploitable / false positive in context.";

    try {
      await apiClient.patch(`/findings/${findingToDismiss.id}`, {
        falsePositive: true,
        fpJustification: justification,
        status: "WONT_FIX",
      });
    } catch (e: any) {
      console.warn("Could not patch finding on API:", e.message);
    }

    setFindings((prev) =>
      prev.map((f) =>
        f.id === findingToDismiss.id
          ? { ...f, falsePositive: true, fpJustification: justification, status: "wont-fix" }
          : f
      )
    );
    setShowFpModal(false);
    setFindingToDismiss(null);
    toast.success(`Finding ${findingToDismiss.id} marked as False Positive (Dismissed).`);
  };

  // Re-open / Confirm finding as active
  const handleConfirmFinding = async (id: string) => {
    try {
      await apiClient.patch(`/findings/${id}`, {
        falsePositive: false,
        status: "OPEN",
      });
    } catch (e: any) {
      console.warn("Could not patch finding on API:", e.message);
    }

    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, falsePositive: false, status: "open" } : f))
    );
    toast.success(`Finding ${id} confirmed as active vulnerability.`);
  };

  // Flag finding for client remediation
  const handleFlagForRemediation = async (id: string) => {
    try {
      await apiClient.patch(`/findings/${id}`, {
        status: "OPEN",
        remediationNote: auditorNote.trim() || undefined,
      });
    } catch (e: any) {
      console.warn("Could not patch finding on API:", e.message);
    }

    setFindings((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: "open", remediation: auditorNote.trim() || f.remediation }
          : f
      )
    );
    toast.success(`Finding ${id} flagged for client remediation.`);
  };

  // Mark finding as resolved
  const handleResolveFinding = async (id: string) => {
    try {
      await apiClient.patch(`/findings/${id}`, {
        status: "RESOLVED",
        remediationNote: auditorNote.trim() || undefined,
      });
    } catch (e: any) {
      console.warn("Could not patch finding on API:", e.message);
    }

    setFindings((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: "resolved", remediation: auditorNote.trim() || f.remediation }
          : f
      )
    );
    toast.success(`Finding ${id} approved & marked resolved!`);
  };

  // Finalize Report
  const handleFinalizeReport = async () => {
    setIsCompilingReport(true);
    try {
      const res = await apiClient.patch(`/audits/${audit.id}/advance-stage`, {
        stage: "COMPLETED",
      });

      const updatedData = res.data;
      const completedAudit: AuditRequest = {
        ...audit,
        stage: "completed",
        completedAt: updatedData?.completedAt || new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC",
        bytecodeHash: updatedData?.bytecodeHash || "0x8f9b2d4c01e9a37d8849b209d7c04419f8a32d645e771b",
        reportPdfUrl: updatedData?.reportPdfUrl || `/reports/${audit.id}-${audit.contractFileName}.pdf`,
        pdfSize: updatedData?.pdfSize || "2.4 MB",
        roundsToResolution: 2,
        onChainTxHash: updatedData?.onChainTxHash,
        onChainChainId: updatedData?.onChainChainId || 421614,
        findings: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          resolved: findings.length,
        },
      };

      setAuditData(completedAudit);
      setTicketStage("completed");
      setIsFinalized(true);
      setCompiledPdfUrl(completedAudit.reportPdfUrl || null);
      toast.success(`Attestation #${audit.id} successfully signed and sealed!`);
    } catch (err: any) {
      console.warn("Failed to advance stage on backend:", err?.message);
      setIsFinalized(true);
      setTicketStage("completed");
      toast.success(`Attestation #${audit.id} signed.`);
    } finally {
      setIsCompilingReport(false);
    }
  };

  // Export Helpers
  const handleExportPDF = (targetAudit: AuditRequest) => {
    const content = `================================================================================
ZYRON SECURITY LABS - CRYPTOGRAPHIC AUDIT ATTESTATION CERTIFICATE
================================================================================
Ticket ID:           ${targetAudit.id}
Protocol Name:       ${targetAudit.protocolName}
Contract File:       ${targetAudit.contractFileName}
Contract Address:    ${targetAudit.contractAddress || "N/A"}
Git Commit:          ${targetAudit.gitCommit}
Compiler Version:    ${targetAudit.compilerVersion}
Scope:               ${targetAudit.sloc} SLOC
Stage:               COMPLETED
Completed At:        ${targetAudit.completedAt || new Date().toISOString()}

--------------------------------------------------------------------------------
CRYPTOGRAPHIC INTEGRITY & VERIFICATION
--------------------------------------------------------------------------------
Bytecode SHA-256:   ${targetAudit.bytecodeHash || "0x8f9b2d4c01e9a37d8849b209d7c04419f8a32d645e771b"}
Attestation Standard: EIP-712 Signed Certificate
Lead Auditor:        0xAuditor_K4 (Zyron Security Labs)
Status:              100% MITIGATED & SEALED

--------------------------------------------------------------------------------
VULNERABILITY RESOLUTION SUMMARY
--------------------------------------------------------------------------------
Total Findings Verified: ${findings.length}
Resolved Findings:       ${findings.filter(f => f.status === "resolved").length}
Dismissed (False Pos):   ${findings.filter(f => f.falsePositive).length}
Open Critical:           0
Open High:               0

Findings Details:
${findings.map((f, i) => `${i + 1}. [${f.swcId}] ${f.title} (${f.severity.toUpperCase()}) - STATUS: ${f.falsePositive ? "FALSE POSITIVE (DISMISSED)" : f.status.toUpperCase()}`).join("\n")}

================================================================================
This document certifies that all detected security vulnerabilities have been
mitigated or verified false positives before production deployment.
================================================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetAudit.id}-${targetAudit.contractFileName}-attestation.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = (targetAudit: AuditRequest) => {
    const jsonStr = JSON.stringify(
      {
        zyronAttestationVersion: "2.4.0",
        certificateId: targetAudit.id,
        protocolName: targetAudit.protocolName,
        contractFileName: targetAudit.contractFileName,
        bytecodeHash: targetAudit.bytecodeHash || "0x8f9b2d4c01e9a37d8849b209d7c04419f8a32d645e771b",
        signedBy: "0xAuditor_K4 (Zyron Security Labs)",
        timestamp: targetAudit.completedAt || new Date().toISOString(),
        findingsSummary: {
          total: findings.length,
          resolved: findings.filter(f => f.status === "resolved").length,
          falsePositive: findings.filter(f => f.falsePositive).length,
          openCritical: 0,
          openHigh: 0,
        },
        findingsList: findings,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetAudit.id}-${targetAudit.contractFileName}-attestation.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Communication Thread Comment Submission
  const [newComment, setNewComment] = React.useState("");
  const handlePostAuditorComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const msg = {
      id: `m-${Date.now()}`,
      sender: "0xAuditor_K4",
      role: "auditor" as const,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC",
      message: newComment.trim(),
    };

    setDiscussionMessages((prev) => [...prev, msg]);
    setNewComment("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* SUCCESS BANNER WHEN REPORT IS FINALIZED */}
      {isFinalized && (
        <div className="p-6 rounded-[4px] bg-signal-resolved/10 border-2 border-signal-resolved font-mono text-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-signal-resolved font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>ATTESTATION REPORT FINALIZED & SEALED</span>
            </div>
            <Badge severity="resolved" size="sm">
              COMPLETED ✓
            </Badge>
          </div>

          <p className="text-text-primary text-xs leading-relaxed font-sans">
            Cryptographic attestation certificate for ticket <strong>#{audit.id}</strong> ({audit.protocolName}) has been sealed for commit <strong>{audit.gitCommit || "4b8f10e"}</strong> with SHA-256 bytecode hash and recorded in the database.
          </p>

          {audit.onChainTxHash && (
            <div className="p-3 rounded-[3px] bg-bg-void border border-border-hairline space-y-1 font-mono text-[11px]">
              <div className="text-text-muted text-[10px]">ON-CHAIN ATTESTATION RECORD (Arbitrum Sepolia):</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-accent-scan select-all text-xs truncate">{audit.onChainTxHash}</span>
                <a
                  href={`https://sepolia.arbiscan.io/tx/${audit.onChainTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-signal-resolved hover:underline text-xs flex items-center gap-1 shrink-0 font-bold"
                >
                  <span>Verify On-Chain Explorer</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={() => handleExportPDF(audit)}
            >
              Download Signed Certificate (.txt)
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileJson className="h-3.5 w-3.5 text-accent-scan" />}
              onClick={() => handleExportJSON(audit)}
            >
              Export JSON Attestation
            </Button>
            <Link href={`/portal/vault#${audit.id}`}>
              <Button variant="outline" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                View in Client Document Vault
              </Button>
            </Link>
            <Link href="/auditor/reports">
              <Button variant="outline" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                View All Sealed Reports
              </Button>
            </Link>
            <Link href="/auditor/queue">
              <Button variant="outline" size="sm">
                Return to Ticket Queue
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* TOP AUDITOR BREADCRUMB & SCOPE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/auditor/queue"
            className="text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>TICKET QUEUE</span>
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-accent-scan font-bold">{audit.id}</span>
          <span className="text-text-primary font-semibold hidden sm:inline">
            {audit.protocolName}
          </span>
          <span className="text-text-muted text-[11px]">
            ({audit.contractFileName})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Add Finding Button in Header — hidden when client corrections are in progress */}
          {!isCorrectionsStage && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5 text-accent-scan" />}
              onClick={() => handleOpenAddFinding()}
              className="border-accent-scan/30 hover:bg-accent-scan/10 text-accent-scan"
            >
              Add Finding
            </Button>
          )}

          {/* Conditional Report Generation Action */}
          {allFindingsResolved ? (
            <Button
              variant="primary"
              size="sm"
              className="bg-signal-resolved hover:bg-signal-resolved/90 text-bg-void font-bold shadow-lg"
              leftIcon={<FileCheck2 className="h-4 w-4" />}
              onClick={() => setShowReportModal(true)}
            >
              Generate Final Attestation Report
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {ticketStage.includes("correction") ? (
                <div className="flex items-center gap-2">
                  <Badge severity="high" size="sm">
                    FINDINGS RELEASED TO CLIENT (AWAITING FIXES)
                  </Badge>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-accent-scan text-bg-void hover:bg-accent-scan/90 font-bold shadow-md"
                  leftIcon={<Check className="h-3.5 w-3.5" />}
                  onClick={async () => {
                    try {
                      await apiClient.patch(`/audits/${audit.id}/flag-corrections`);
                      setTicketStage("corrections-requested");
                      toast.success(`Findings approved! Ticket ${audit.id} released to client for remediation.`);
                    } catch (e: any) {
                      setTicketStage("corrections-requested");
                      toast.success(`Findings approved and released to client for remediation.`);
                    }
                  }}
                >
                  Approve & Send Findings to Client
                </Button>
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-bg-void border border-border-hairline text-text-muted text-[11px]" title="Resolve all findings to unlock report compilation">
                <Lock className="h-3 w-3 text-signal-critical" />
                <span>Report Locked ({openOrFixCount} Unresolved)</span>
              </div>
            </div>
          )}

          <Badge severity={ticketStage === "completed" ? "resolved" : ticketStage.includes("correction") ? "critical" : "high"} size="sm">
            {ticketStage.toUpperCase().replace("_", "-")}
          </Badge>
        </div>
      </div>

      {/* DUAL-PANE CODE REVIEW & VULNERABILITY TRIAGE SURFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT 7 COLS: CODE PANE (FILE TREE + COMMIT DIFF / FULL SOURCE)             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 rounded-[4px] bg-bg-panel border border-border-hairline overflow-hidden flex flex-col">
          {/* Top Control Bar */}
          <div className="border-b border-border-hairline bg-bg-void/90 flex flex-wrap items-center justify-between font-mono text-xs px-3 py-2 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFileTree(!showFileTree)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-[2px] transition-colors text-[11px] ${
                  showFileTree
                    ? "bg-accent-scan/15 text-accent-scan border border-accent-scan/40 font-semibold"
                    : "text-text-muted hover:text-text-primary border border-border-hairline"
                }`}
                title="Toggle File Tree Explorer"
              >
                <FolderTree className="h-3.5 w-3.5" />
                <span>Explorer</span>
              </button>

              <span className="text-text-muted">/</span>

              <span className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                <FileCode2 className="h-3.5 w-3.5 text-accent-scan" />
                <span className="truncate max-w-[200px]">{activeFile.path}</span>
              </span>

              {activeFileFindingsCount > 0 && (
                <Badge severity="critical" size="sm">
                  {activeFileFindingsCount} finding{activeFileFindingsCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isCorrectionsStage && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="h-3 w-3 text-accent-scan" />}
                  onClick={() => handleOpenAddFinding(activeFile.path, 1)}
                  className="text-[11px] h-7 px-2 border-border-hairline"
                >
                  Flag Line
                </Button>
              )}

              <div className="flex items-center rounded-[3px] border border-border-hairline bg-bg-panel p-0.5">
                <button
                  onClick={() => setViewMode("diff")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] transition-colors text-[11px] font-mono ${
                    viewMode === "diff"
                      ? "bg-accent-scan text-bg-void font-bold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <GitCompare className="h-3 w-3" />
                  <span>Diff</span>
                </button>

                <button
                  onClick={() => setViewMode("full")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] transition-colors text-[11px] font-mono ${
                    viewMode === "full"
                      ? "bg-bg-panel-raised text-text-primary font-bold border border-border-hairline"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  <span>Full</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Header Metadata */}
          <div className="p-2.5 px-4 bg-bg-panel-raised/50 border-b border-border-hairline flex flex-wrap items-center justify-between font-mono text-[11px] text-text-muted gap-2">
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-medium">{activeFile.path}</span>
              <span className="text-accent-scan font-medium">({activeFile.sloc} SLOC)</span>
              {activeFile.hasFixDiff && (
                <span className="text-signal-resolved font-bold">
                  (+{activeFile.additions} -{activeFile.deletions} diff)
                </span>
              )}
            </div>
            <span className="text-[10px]">Commit Pinned: {(audit.gitCommit || "8f9b2d4").slice(0, 7)}</span>
          </div>

          {/* Split Container: Collapsible File Tree Sidebar + Code Viewer */}
          <div className="flex flex-col md:flex-row min-h-[580px]">
            {/* FILE TREE EXPLORER SIDEBAR */}
            {showFileTree && (
              <div className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border-hairline bg-bg-void/80 p-2 space-y-2 select-none font-mono text-xs">
                <div className="px-2 py-1 text-[10px] text-text-muted font-bold tracking-wider uppercase flex items-center justify-between border-b border-border-hairline pb-1.5">
                  <span className="flex items-center gap-1">
                    <FolderTree className="h-3 w-3 text-accent-scan" />
                    PROJECT SCOPE
                  </span>
                  <span className="text-accent-scan">{projectFiles.length} files</span>
                </div>

                <div className="space-y-1 pt-1">
                  {fileTree.map(({ folder, files }) => {
                    const isExpanded = expandedFolders[folder] ?? true;
                    return (
                      <div key={folder} className="space-y-0.5">
                        <button
                          onClick={() => toggleFolder(folder)}
                          className="w-full flex items-center gap-1.5 px-1.5 py-1 text-text-muted hover:text-text-primary hover:bg-bg-panel/50 rounded-[2px] text-left text-[11px]"
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                          {isExpanded ? <FolderOpen className="h-3.5 w-3.5 text-accent-scan shrink-0" /> : <Folder className="h-3.5 w-3.5 text-text-muted shrink-0" />}
                          <span className="font-semibold">{folder}</span>
                        </button>

                        {isExpanded && (
                          <div className="pl-4 space-y-0.5">
                            {files.map((file) => {
                              const isSelected = selectedFilePath === file.path;
                              const fileFCount = findings.filter(
                                (f) => !f.falsePositive && (f.file.includes(file.name) || f.file.includes(file.path))
                              ).length;

                              return (
                                <button
                                  key={file.path}
                                  onClick={() => setSelectedFilePath(file.path)}
                                  className={`w-full flex items-center justify-between px-2 py-1 rounded-[2px] text-left text-xs transition-colors ${
                                    isSelected
                                      ? "bg-accent-scan/15 text-accent-scan font-bold border-l-2 border-accent-scan"
                                      : "text-text-muted hover:text-text-primary hover:bg-bg-panel/40"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <FileCode2 className={`h-3 w-3 shrink-0 ${isSelected ? "text-accent-scan" : "text-text-muted"}`} />
                                    <span className="truncate">{file.name}</span>
                                  </div>
                                  {fileFCount > 0 && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-signal-critical/20 text-signal-critical border border-signal-critical/30 shrink-0">
                                      {fileFCount}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CODE VIEWER PANE */}
            <div className="flex-1 overflow-hidden flex flex-col bg-bg-void">
              {/* Diff View */}
              {viewMode === "diff" && (
                <div className="p-4 bg-bg-void font-mono text-xs leading-relaxed overflow-x-auto select-text space-y-0.5 max-h-[580px] overflow-y-auto divide-y divide-border-hairline/20">
                  {activeFile.diffLines.map((row, idx) => {
                    if (row.type === "header") {
                      return (
                        <div
                          key={idx}
                          className="py-1 px-3 bg-bg-panel text-accent-scan text-[11px] font-bold rounded-[2px] my-1"
                        >
                          {row.code}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 py-0.5 px-2 rounded-[2px] transition-colors ${
                          row.type === "add"
                            ? "bg-signal-resolved/10 text-signal-resolved border-l-2 border-l-signal-resolved"
                            : row.type === "delete"
                            ? "bg-signal-critical/10 text-signal-critical border-l-2 border-l-signal-critical"
                            : "text-text-muted hover:bg-bg-panel/40"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-text-muted/40 select-none text-[10px] w-12 shrink-0 font-mono">
                          <span className="w-5 text-right">{row.oldLine || " "}</span>
                          <span className="w-5 text-right">{row.newLine || " "}</span>
                        </div>
                        <span className="select-none font-bold w-3 text-center shrink-0">
                          {row.type === "add" ? "+" : row.type === "delete" ? "-" : " "}
                        </span>
                        <div className="flex-1 whitespace-pre font-mono text-xs overflow-x-auto">
                          <HighlightedSolidityLine code={row.code} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full Source View with Line Gutter & Inline Finding Ribbons */}
              {viewMode === "full" && (
                <div className="p-4 bg-bg-void font-mono text-xs leading-relaxed overflow-x-auto select-text space-y-0.5 max-h-[580px] overflow-y-auto">
                  {activeFile.lines.map((row) => {
                    const lineFindings = findings.filter(
                      (f) => (f.file.includes(activeFile.name) || f.file.includes(activeFile.path)) && f.line === row.line
                    );
                    const hasFinding = lineFindings.length > 0;
                    const isSelectedLineFinding = lineFindings.some((f) => f.id === selectedFindingId);

                    return (
                      <React.Fragment key={row.line}>
                        <div
                          className={`group flex items-start gap-3 py-0.5 px-2 rounded-[2px] transition-colors font-mono text-xs ${
                            hasFinding
                              ? isSelectedLineFinding
                                ? "bg-accent-scan/15 border-l-2 border-accent-scan"
                                : "bg-signal-critical/10 border-l-2 border-signal-critical"
                              : "hover:bg-bg-panel/50"
                          }`}
                        >
                          {/* Gutter with line number and + flag button on hover */}
                          <div className="flex items-center justify-end gap-1 w-12 shrink-0 select-none text-[11px] text-text-muted/60">
                            {!isCorrectionsStage && (
                              <button
                                onClick={() => handleOpenAddFinding(activeFile.path, row.line, row.code)}
                                className="opacity-0 group-hover:opacity-100 hover:text-accent-scan p-0.5 transition-opacity"
                                title={`Add finding on line ${row.line}`}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            )}
                            <span className="w-6 text-right">{row.line}</span>
                          </div>


                          {/* Code Content with Solidity Syntax Highlighting */}
                          <div className="flex-1 whitespace-pre font-mono overflow-x-auto">
                            <HighlightedSolidityLine code={row.code} />
                          </div>
                        </div>

                        {/* In-Editor Inline Finding Ribbon */}
                        {lineFindings.map((f) => (
                          <div
                            key={f.id}
                            onClick={() => {
                              setSelectedFindingId(f.id);
                              setActiveRightTab("triage");
                            }}
                            className={`mx-2 my-1 p-2 rounded-[3px] border cursor-pointer select-none text-xs font-mono flex items-center justify-between gap-3 ${
                              f.falsePositive
                                ? "bg-bg-panel border-border-hairline text-text-muted line-through opacity-70"
                                : f.id === selectedFindingId
                                ? "bg-bg-panel-raised border-accent-scan text-accent-scan shadow-md"
                                : "bg-signal-critical/10 border-signal-critical/30 text-text-primary hover:border-signal-critical/60"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <ShieldAlert className="h-3.5 w-3.5 text-signal-critical shrink-0" />
                              <span className="font-bold text-accent-scan">{f.id}</span>
                              <Badge severity={f.severity} size="sm">
                                {f.severity.toUpperCase()}
                              </Badge>
                              <span className="truncate font-sans font-medium text-text-primary">
                                {f.title}
                              </span>
                              {f.falsePositive && (
                                <span className="text-[10px] text-text-muted font-mono no-underline">
                                  [FALSE POSITIVE]
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-2 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFindingId(f.id);
                                setActiveRightTab("triage");
                              }}
                            >
                              View Triage
                            </Button>
                          </div>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Editor Status Bar */}
          <div className="p-2.5 px-4 bg-bg-panel-raised border-t border-border-hairline flex items-center justify-between text-xs font-mono text-text-muted">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-signal-resolved" />
              <span>File: {activeFile.name} · {activeFile.sloc} SLOC</span>
            </span>
            <span className="text-accent-scan">EVM Target: Shanghai ({audit.compilerVersion})</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT 5 COLS: AUDITOR TRIAGE & VERIFICATION WORKBENCH                     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex rounded-[4px] border border-border-hairline bg-bg-panel p-1 font-mono text-xs">
            <button
              onClick={() => setActiveRightTab("triage")}
              className={`flex-1 py-1.5 px-2 rounded-[2px] transition-colors flex items-center justify-center gap-1.5 ${
                activeRightTab === "triage"
                  ? "bg-bg-panel-raised text-accent-scan font-bold border border-border-hairline"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Split className="h-3.5 w-3.5" />
              <span>Remediation Triage ({findings.length})</span>
            </button>

            <button
              onClick={() => setActiveRightTab("comms")}
              className={`flex-1 py-1.5 px-2 rounded-[2px] transition-colors flex items-center justify-center gap-1.5 ${
                activeRightTab === "comms"
                  ? "bg-bg-panel-raised text-accent-scan font-bold border border-border-hairline"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Comms Thread ({discussionMessages.length})</span>
            </button>
          </div>

          {/* TAB 1: TRIAGE & RESOLUTION */}
          {activeRightTab === "triage" && (
            <div className="space-y-4 font-mono text-xs">
              {/* Triage Header & Filter Tabs */}
              <div className="p-3 rounded-[4px] bg-bg-panel border border-border-hairline space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent-scan" />
                    FINDINGS TRIAGE ({findings.length})
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-6 text-[10px] px-2 bg-accent-scan text-bg-void font-bold"
                    leftIcon={<Plus className="h-3 w-3" />}
                    onClick={() => handleOpenAddFinding()}
                  >
                    + Add Finding
                  </Button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pt-1">
                  {(["all", "active", "resolved", "dismissed"] as const).map((filterKey) => {
                    const count =
                      filterKey === "all"
                        ? findings.length
                        : filterKey === "active"
                        ? findings.filter((f) => !f.falsePositive && f.status !== "resolved" && f.status !== "wont-fix").length
                        : filterKey === "resolved"
                        ? findings.filter((f) => f.status === "resolved").length
                        : findings.filter((f) => f.falsePositive || f.status === "wont-fix").length;

                    return (
                      <button
                        key={filterKey}
                        onClick={() => setFindingFilter(filterKey)}
                        className={`px-2 py-0.5 rounded-[2px] transition-colors uppercase font-mono ${
                          findingFilter === filterKey
                            ? "bg-accent-scan/15 text-accent-scan font-bold border border-accent-scan/30"
                            : "text-text-muted hover:text-text-primary bg-bg-void border border-border-hairline"
                        }`}
                      >
                        {filterKey} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Findings Selector List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {filteredFindings.map((f) => {
                  const isSelected = selectedFindingId === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        setSelectedFindingId(f.id);
                        if (f.file && f.file !== activeFile.path) {
                          const target = projectFiles.find((p) => p.path === f.file || p.name === f.file);
                          if (target) setSelectedFilePath(target.path);
                        }
                      }}
                      className={`w-full p-2.5 rounded-[3px] border transition-colors flex items-center justify-between text-left ${
                        isSelected
                          ? "bg-bg-panel-raised border-accent-scan text-accent-scan shadow-sm"
                          : "bg-bg-panel border-border-hairline text-text-muted hover:text-text-primary hover:bg-bg-panel/70"
                      }`}
                    >
                      <div className="space-y-0.5 truncate flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{f.id}</span>
                          <Badge severity={f.severity} size="sm">
                            {f.severity.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-text-muted truncate">
                            {f.file.split("/").pop()}:{f.line}
                          </span>
                        </div>
                        <div className={`text-xs truncate font-sans ${f.falsePositive ? "line-through text-text-muted" : "text-text-primary"}`}>
                          {f.title}
                        </div>
                      </div>

                      <div className="shrink-0 text-[10px] font-bold">
                        {f.falsePositive ? (
                          <span className="text-text-muted border border-border-hairline px-1.5 py-0.5 rounded-[2px]">
                            FALSE POSITIVE
                          </span>
                        ) : f.status === "resolved" ? (
                          <span className="text-signal-resolved bg-signal-resolved/10 px-1.5 py-0.5 rounded-[2px] border border-signal-resolved/30">
                            RESOLVED ✓
                          </span>
                        ) : f.status === "fix-submitted" ? (
                          <span className="text-signal-high bg-signal-high/10 px-1.5 py-0.5 rounded-[2px] border border-signal-high/30">
                            RE-VERIFY
                          </span>
                        ) : (
                          <span className="text-signal-critical bg-signal-critical/10 px-1.5 py-0.5 rounded-[2px] border border-signal-critical/30">
                            OPEN
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Finding Detail Card & Triage Actions */}
              {selectedFinding && (
                <div className="p-5 rounded-[4px] bg-bg-panel border border-border-hairline space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-border-hairline pb-3 gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-accent-scan font-bold text-sm">{selectedFinding.id}</span>
                        <Badge severity={selectedFinding.severity} size="sm">
                          {selectedFinding.severity.toUpperCase()} ({selectedFinding.cvss})
                        </Badge>
                        <span className="text-text-muted text-[11px]">
                          {selectedFinding.swcId}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-semibold text-text-primary font-sans leading-snug">
                        {selectedFinding.title}
                      </h4>
                      <div className="text-[11px] text-text-muted flex items-center gap-2 pt-0.5">
                        <FileCode2 className="h-3 w-3 text-accent-scan" />
                        <span>{selectedFinding.file}:{selectedFinding.line}</span>
                      </div>
                    </div>

                    {selectedFinding.falsePositive ? (
                      <Badge severity="low" size="sm">
                        DISMISSED (FP)
                      </Badge>
                    ) : selectedFinding.status === "resolved" ? (
                      <Badge severity="resolved" size="sm">
                        RESOLVED ✓
                      </Badge>
                    ) : (
                      <Badge severity={selectedFinding.severity} size="sm">
                        {selectedFinding.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  {/* False Positive Banner if dismissed */}
                  {selectedFinding.falsePositive && (
                    <div className="p-3 rounded-[3px] bg-bg-void border border-border-hairline text-text-muted space-y-1 text-xs">
                      <div className="font-bold text-text-primary flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-signal-low" />
                        <span>DISMISSED AS FALSE POSITIVE</span>
                      </div>
                      <p className="font-sans leading-relaxed text-[11px]">
                        {selectedFinding.fpJustification || "Auditor evaluated finding as non-exploitable in this codebase context."}
                      </p>
                    </div>
                  )}

                  {/* Impact & Description */}
                  <div className="p-3 rounded-[2px] bg-bg-void border border-border-hairline space-y-2">
                    {selectedFinding.impact && (
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-text-muted uppercase">EXPLOIT IMPACT:</div>
                        <div className="text-xs text-signal-high font-sans font-medium">{selectedFinding.impact}</div>
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-text-muted uppercase">ROOT CAUSE & ANALYSIS:</div>
                      <p className="text-xs text-text-muted font-sans leading-relaxed">
                        {selectedFinding.description}
                      </p>
                    </div>
                  </div>

                  {/* Vulnerable Code snippet */}
                  {selectedFinding.vulnerableCode && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-text-muted uppercase">FLAGGED VULNERABLE CODE:</div>
                      <div className="p-2.5 rounded-[2px] bg-bg-void border border-signal-critical/30 text-[11px] overflow-x-auto">
                        <HighlightedSolidityBlock code={selectedFinding.vulnerableCode} />
                      </div>
                    </div>
                  )}

                  {/* Remediation guidance */}
                  {selectedFinding.remediation && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-text-muted uppercase">REMEDIATION GUIDANCE:</div>
                      <p className="text-xs text-signal-resolved font-sans leading-relaxed">
                        {selectedFinding.remediation}
                      </p>
                    </div>
                  )}

                  {/* Auditor Notes Input — only visible in active review mode */}
                  {!isCorrectionsStage && (
                    <div className="space-y-2 pt-1 border-t border-border-hairline">
                      <label className="text-text-muted text-[11px]">AUDITOR TRIAGE & RE-VERIFICATION NOTES:</label>
                      <Input
                        value={auditorNote}
                        onChange={(e) => setAuditorNote(e.target.value)}
                        placeholder="Add remediation notes or verification details..."
                        className="text-xs bg-bg-void"
                      />
                    </div>
                  )}

                  {/* TRIAGE ACTIONS TOOLBAR */}
                  <div className="space-y-2 pt-2 border-t border-border-hairline">
                    {isCorrectionsStage ? (
                      /* CORRECTIONS STAGE: Read-only lock banner + Edit-only access */
                      <div className="space-y-3">
                        <div className="p-3 rounded-[3px] bg-signal-high/10 border border-signal-high/30 flex items-start gap-2.5">
                          <Lock className="h-4 w-4 text-signal-high shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold text-signal-high uppercase tracking-wide">
                              Triage Actions Locked
                            </div>
                            <p className="text-[11px] text-text-muted font-sans leading-relaxed">
                              Findings have been released to the client for remediation. Triage actions (approve, flag, dismiss) are disabled while the client is applying fixes. You may only <strong className="text-text-primary">edit finding details</strong> or communicate via the Comms thread.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-accent-scan border-accent-scan/40 hover:bg-accent-scan/10 text-xs"
                          onClick={() => handleOpenEditFinding(selectedFinding)}
                          leftIcon={<FileEdit className="h-3.5 w-3.5" />}
                        >
                          Edit Finding Details
                        </Button>
                      </div>
                    ) : selectedFinding.falsePositive ? (
                      /* FALSE POSITIVE: Offer re-open + edit */
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full text-accent-scan border-accent-scan/40 hover:bg-accent-scan/10 text-xs"
                          onClick={() => handleConfirmFinding(selectedFinding.id)}
                          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                        >
                          Re-Open Finding as Active Vulnerability
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-text-muted border-border-hairline hover:text-text-primary text-xs"
                          onClick={() => handleOpenEditFinding(selectedFinding)}
                          leftIcon={<FileEdit className="h-3.5 w-3.5" />}
                        >
                          Edit Finding Details
                        </Button>
                      </div>
                    ) : (
                      /* ACTIVE REVIEW MODE: Full triage actions */
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedFinding.status !== "resolved" ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-signal-resolved hover:bg-signal-resolved/90 text-bg-void font-bold text-xs"
                              onClick={() => handleResolveFinding(selectedFinding.id)}
                              leftIcon={<Check className="h-3.5 w-3.5" />}
                            >
                              Approve & Resolve
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-text-muted border-border-hairline hover:text-text-primary text-xs"
                              onClick={() => handleConfirmFinding(selectedFinding.id)}
                              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                            >
                              Re-Open Finding
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-signal-high border-signal-high/40 hover:bg-signal-high/10 text-xs font-semibold"
                            onClick={() => handleFlagForRemediation(selectedFinding.id)}
                            leftIcon={<AlertTriangle className="h-3.5 w-3.5" />}
                          >
                            Flag for Remediation
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-accent-scan border-accent-scan/40 hover:bg-accent-scan/10 text-xs"
                            onClick={() => handleOpenEditFinding(selectedFinding)}
                            leftIcon={<FileEdit className="h-3.5 w-3.5" />}
                          >
                            Edit Finding
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-text-muted hover:text-signal-critical border-border-hairline hover:border-signal-critical/40 text-[11px]"
                            onClick={() => handleOpenFpModal(selectedFinding)}
                            leftIcon={<X className="h-3.5 w-3.5" />}
                          >
                            Mark False Positive
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMMS THREAD */}
          {activeRightTab === "comms" && (
            <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                <div className="flex items-center gap-2 font-semibold text-text-primary">
                  <MessageSquare className="h-4 w-4 text-accent-scan" />
                  <span>Client & Auditor Communication Feed</span>
                </div>
                <span className="text-[10px] text-text-muted">
                  TICKET #{audit.id}
                </span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {discussionMessages.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-[4px] border space-y-1.5 ${
                      item.role === "auditor"
                        ? "bg-bg-panel-raised border-accent-scan/30"
                        : "bg-bg-void border-border-hairline"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${item.role === "auditor" ? "text-accent-scan" : "text-text-primary"}`}>
                          {item.sender}
                        </span>
                        <Badge severity={item.role === "auditor" ? "informational" : "resolved"} size="sm">
                          {item.role === "auditor" ? "LEAD AUDITOR" : "CLIENT"}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-text-muted">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-text-primary font-sans leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handlePostAuditorComment} className="space-y-2 pt-2 border-t border-border-hairline">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post comment to client remediation thread..."
                  className="text-xs bg-bg-void"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-accent-scan text-bg-void font-bold"
                    rightIcon={<Send className="h-3 w-3" />}
                    disabled={!newComment.trim()}
                  >
                    Send to Client
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD MANUAL FINDING FORM                                          */}
      {/* ========================================================================= */}
      {showAddFindingModal && (
        <div className="fixed inset-0 bg-bg-void/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-[4px] bg-bg-panel border border-border-hairline shadow-2xl p-6 space-y-5 font-mono text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="space-y-0.5">
                <Eyebrow size="xs" variant="scan" prefix="// AUDITOR_TRIAGE · ">
                  {editingFindingId ? "EDIT_FINDING" : "LOG_MANUAL_FINDING"}
                </Eyebrow>
                <h3 className="font-display text-base font-bold text-text-primary font-sans">
                  {editingFindingId ? "Edit Vulnerability Finding" : "Create New Vulnerability Finding"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddFindingModal(false);
                  setEditingFindingId(null);
                }}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={editingFindingId ? handleSubmitEditFinding : handleSubmitNewFinding} className="space-y-4">

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted">FINDING HEADLINE / TITLE *</label>
                <Input
                  value={newFindingForm.title}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Missing Zero-Address Validation in setRewardPool()"
                  required
                  className="text-xs bg-bg-void"
                />
              </div>

              {/* Severity & CVSS Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted">SEVERITY CLASSIFICATION *</label>
                  <select
                    value={newFindingForm.severity}
                    onChange={(e) => setNewFindingForm((prev) => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full h-9 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary px-3 text-xs focus:outline-none focus:border-accent-scan"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                    <option value="INFORMATIONAL">INFORMATIONAL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted">CVSS V3 SCORE</label>
                  <Input
                    value={newFindingForm.cvss}
                    onChange={(e) => setNewFindingForm((prev) => ({ ...prev, cvss: e.target.value }))}
                    placeholder="CVSS 8.5"
                    className="text-xs bg-bg-void"
                  />
                </div>
              </div>

              {/* SWC Taxonomy */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted">SWC TAXONOMY / VULNERABILITY CLASS</label>
                <select
                  value={newFindingForm.taxonomy}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, taxonomy: e.target.value }))}
                  className="w-full h-9 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary px-3 text-xs focus:outline-none focus:border-accent-scan"
                >
                  <option value="SWC-107 · CWE-841 (Reentrancy)">SWC-107 · CWE-841 (Reentrancy)</option>
                  <option value="SWC-104 · CWE-252 (Unchecked Return Value)">SWC-104 · CWE-252 (Unchecked Return Value)</option>
                  <option value="SWC-105 · CWE-284 (Unprotected Ether Withdrawal)">SWC-105 · CWE-284 (Unprotected Ether Withdrawal)</option>
                  <option value="SWC-115 · CWE-287 (Authorization through tx.origin)">SWC-115 · CWE-287 (Authorization through tx.origin)</option>
                  <option value="SWC-114 · CWE-703 (Front-Running / Transaction-Ordering)">SWC-114 · CWE-703 (Front-Running / Transaction-Ordering)</option>
                  <option value="SWC-116 · CWE-330 (Timestamp Dependency)">SWC-116 · CWE-330 (Timestamp Dependency)</option>
                  <option value="SWC-120 · CWE-345 (Weak Randomness)">SWC-120 · CWE-345 (Weak Randomness)</option>
                  <option value="CUSTOM · Protocol Logic Flaw">CUSTOM · Protocol Logic Flaw</option>
                </select>
              </div>

              {/* File & Line Number */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted">AFFECTED FILE</label>
                  <select
                    value={newFindingForm.file}
                    onChange={(e) => setNewFindingForm((prev) => ({ ...prev, file: e.target.value }))}
                    className="w-full h-9 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary px-3 text-xs focus:outline-none focus:border-accent-scan"
                  >
                    {projectFiles.map((p) => (
                      <option key={p.path} value={p.path}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted">LINE NUMBER</label>
                  <Input
                    type="number"
                    value={newFindingForm.line}
                    onChange={(e) => setNewFindingForm((prev) => ({ ...prev, line: parseInt(e.target.value, 10) || 1 }))}
                    placeholder="142"
                    className="text-xs bg-bg-void"
                  />
                </div>
              </div>

              {/* Impact */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted">EXPLOIT IMPACT SUMMARY</label>
                <Input
                  value={newFindingForm.impact}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, impact: e.target.value }))}
                  placeholder="e.g. 100% COLLATERAL DRAIN"
                  className="text-xs bg-bg-void"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted">TECHNICAL ROOT CAUSE & DESCRIPTION</label>
                <textarea
                  value={newFindingForm.description}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the vulnerability mechanics and how an attacker could trigger it..."
                  className="w-full p-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none focus:border-accent-scan font-sans"
                />
              </div>

              {/* Vulnerable Code */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted">VULNERABLE CODE SNIPPET (OPTIONAL)</label>
                <textarea
                  value={newFindingForm.vulnerableCode}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, vulnerableCode: e.target.value }))}
                  rows={2}
                  placeholder="Paste vulnerable code lines..."
                  className="w-full p-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none focus:border-accent-scan font-mono"
                />
                {newFindingForm.vulnerableCode.trim() && (
                  <div className="p-2 rounded-[2px] bg-bg-panel border border-border-hairline text-[11px] overflow-x-auto">
                    <div className="text-[9px] text-text-muted font-mono uppercase pb-1">Live Syntax Preview:</div>
                    <HighlightedSolidityBlock code={newFindingForm.vulnerableCode} />
                  </div>
                )}
              </div>

              {/* Remediation */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted">REMEDIATION RECOMMENDATION</label>
                <textarea
                  value={newFindingForm.remediation}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, remediation: e.target.value }))}
                  rows={2}
                  placeholder="Step-by-step guidance for the protocol team to patch this vulnerability..."
                  className="w-full p-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none focus:border-accent-scan font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-hairline">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddFindingModal(false);
                    setEditingFindingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={editingFindingId ? isEditingFinding : isSubmittingFinding}
                  className="bg-accent-scan text-bg-void font-bold"
                  leftIcon={<Check className="h-3.5 w-3.5" />}
                >
                  {editingFindingId ? "Save Changes" : "Log Vulnerability Finding"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FALSE POSITIVE DISMISSAL PROMPT                                  */}
      {/* ========================================================================= */}
      {showFpModal && findingToDismiss && (
        <div className="fixed inset-0 bg-bg-void/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[4px] bg-bg-panel border border-border-hairline shadow-2xl p-6 space-y-4 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="flex items-center gap-2 text-signal-critical font-bold">
                <AlertTriangle className="h-4 w-4" />
                <span>DISMISS AS FALSE POSITIVE</span>
              </div>
              <button
                onClick={() => setShowFpModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-text-muted text-xs leading-relaxed font-sans">
              You are dismissing finding <strong>{findingToDismiss.id}</strong> ({findingToDismiss.title}). Please document the auditor justification below. Dismissed findings do not require client fixes and will not block attestation report sealing.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-text-muted">AUDITOR JUSTIFICATION / RATIONALE *</label>
              <textarea
                value={fpJustificationInput}
                onChange={(e) => setFpJustificationInput(e.target.value)}
                rows={3}
                placeholder="e.g. Non-exploitable in context: Reentrancy is impossible because parent contract employs ReentrancyGuard modifier..."
                className="w-full p-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none focus:border-accent-scan font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-hairline">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFpModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-signal-critical text-bg-void hover:bg-signal-critical/90 font-bold"
                onClick={handleConfirmFalsePositive}
              >
                Confirm Dismissal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REPORT COMPILATION & ATTESTATION PREVIEW MODAL                    */}
      {/* ========================================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 bg-bg-void/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-[4px] bg-bg-panel border border-border-hairline shadow-2xl p-6 md:p-8 space-y-6 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-hairline pb-4">
              <div className="space-y-0.5">
                <Eyebrow size="xs" variant="scan" prefix="// COMPILATION_ENGINE · ">
                  {isFinalized ? "SEALED_ATTESTATION_DELIVERABLE" : "ATTESTATION_DELIVERABLE_PREVIEW"}
                </Eyebrow>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  {isFinalized ? "Final Audit Attestation Certificate" : "Sign & Finalize Audit Attestation"}
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Certificate Preview Card */}
            <div className="p-6 rounded-[4px] bg-bg-void border border-border-hairline space-y-4">
              <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                <div>
                  <div className="font-display font-bold text-sm text-text-primary">
                    ZYRON SECURITY LABS
                  </div>
                  <div className="text-[10px] text-text-muted">
                    FINAL ATTESTATION CERTIFICATE #{audit.id}
                  </div>
                </div>
                <Badge severity="resolved" size="sm">
                  {isFinalized ? "SEALED & CERTIFIED ✓" : "100% MITIGATED ✓"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-text-muted text-[10px]">AUDITED TARGET:</span>
                  <div className="text-text-primary font-medium">{audit.protocolName}</div>
                </div>
                <div>
                  <span className="text-text-muted text-[10px]">PINNED COMMIT SHA:</span>
                  <div className="text-signal-resolved font-bold">{audit.gitCommit || "4b8f10e"}</div>
                </div>
              </div>

              <div className="p-3 rounded-[2px] bg-bg-panel border border-border-hairline space-y-1">
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>IMMUTABLE BYTECODE SHA-256 HASH:</span>
                  <span className="text-signal-resolved font-bold">COMMIT SEALED ✓</span>
                </div>
                <div className="text-accent-scan select-all text-xs truncate">
                  {audit.bytecodeHash || "0x8f9b2d4c01e9a37d8849b209d7c04419f8a32d645e771b"}
                </div>
              </div>

              {audit.onChainTxHash && (
                <div className="p-3 rounded-[2px] bg-bg-panel border border-border-hairline space-y-1 font-mono">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-muted">ON-CHAIN ATTESTATION TX HASH (Arbitrum Sepolia):</span>
                    <span className="text-signal-resolved font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> VERIFIED ON-CHAIN
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-accent-scan select-all truncate">{audit.onChainTxHash}</span>
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${audit.onChainTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-signal-resolved hover:underline text-[10px] flex items-center gap-1 shrink-0"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[11px] text-text-muted">
                <span>VERIFIED FINDINGS: {findings.length} ({findings.filter(f => f.status === "resolved").length} RESOLVED, {findings.filter(f => f.falsePositive).length} DISMISSED)</span>
                <span className="text-signal-resolved font-bold">0 OPEN CRITICAL / HIGH</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-text-muted text-[11px]">
                {isFinalized
                  ? "Attestation is sealed on-chain and registered in the database."
                  : "Finalizing will seal the immutable cryptographic proof and mark ticket COMPLETED."}
              </span>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                >
                  {isFinalized ? "Close" : "Cancel"}
                </Button>

                {!isFinalized && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-signal-resolved hover:bg-signal-resolved/90 text-bg-void font-bold shadow-lg"
                    isLoading={isCompilingReport}
                    leftIcon={<Lock className="h-3.5 w-3.5" />}
                    onClick={handleFinalizeReport}
                  >
                    Seal & Sign Attestation
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
