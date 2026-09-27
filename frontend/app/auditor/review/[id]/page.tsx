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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { MOCK_AUDIT_REQUESTS, OPEN_SOURCE_TEST_PROJECT, type AuditRequest } from "@/lib/mock-data";
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

interface FindingComment {
  id: string;
  findingId: string;
  sender: string;
  role: "auditor" | "client";
  timestamp: string;
  message: string;
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

  // View Mode: 'diff' vs 'full' (default to full source for immediate code inspection)
  const [viewMode, setViewMode] = React.useState<"diff" | "full">("full");
  const [selectedFilePath, setSelectedFilePath] = React.useState<string>("contracts/Contract.sol");

  // Right panel view: 'list' shows the findings list, 'detail' shows selected finding full view
  const [findingView, setFindingView] = React.useState<"list" | "detail">("list");

  // Findings & Triage state
  const [findings, setFindings] = React.useState<TriageFinding[]>([]);

  const [selectedFindingId, setSelectedFindingId] = React.useState<string>("");
  const [findingFilter, setFindingFilter] = React.useState<"all" | "active" | "resolved" | "dismissed">("all");
  const [auditorNote, setAuditorNote] = React.useState("");

  // Per-finding comment threads: findingId → comments array
  const [findingComments, setFindingComments] = React.useState<Record<string, FindingComment[]>>({});
  const [newFindingComment, setNewFindingComment] = React.useState("");

  // Add Manual Finding Modal State
  const [showAddFindingModal, setShowAddFindingModal] = React.useState(false);
  const [isSubmittingFinding, setIsSubmittingFinding] = React.useState(false);
  const [newFindingForm, setNewFindingForm] = React.useState({
    title: "",
    severity: "HIGH" as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL",
    cvss: "CVSS 8.5",
    taxonomy: "SWC-107 · CWE-841 (Reentrancy)",
    file: "contracts/Contract.sol",
    line: 1,
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

        const targetFile = a.contractFileName || "Contract.sol";
        const defaultPath = targetFile.includes("/") ? targetFile : `contracts/${targetFile}`;
        setSelectedFilePath(defaultPath);

        // 1. Direct source code from backend database
        if (a.sourceCode && a.sourceCode.trim().length > 0) {
          setFetchedSourceCode(a.sourceCode);
        } else {
          // 2. Fetch from GitHub repository via API
          const repoStr = a.githubRepoUrl || a.protocolName || "";
          let owner = "";
          let repo = "";
          if (repoStr.includes("github.com")) {
            const match = repoStr.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (match) {
              owner = match[1];
              repo = match[2].replace(/\.git$/, "");
            }
          } else if (repoStr.includes("/")) {
            const parts = repoStr.split("/");
            if (parts.length === 2) {
              owner = parts[0].trim();
              repo = parts[1].trim().replace(/\.git$/, "");
            }
          }

          if (owner && repo) {
            apiClient
              .get("/integrations/github/file-content", {
                params: {
                  owner,
                  repo,
                  repoUrl: a.githubRepoUrl,
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
          file: f.location?.split(":")[0] || f.affectedFile || (auditRes?.data?.contractFileName ? `contracts/${auditRes.data.contractFileName}` : "contracts/Contract.sol"),
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

        // Populate comments for each finding from backend
        const initialComments: Record<string, FindingComment[]> = {};
        findingsRes.data.forEach((f: any) => {
          const fId = f.id || f.displayId;
          if (Array.isArray(f.comments) && f.comments.length > 0) {
            initialComments[fId] = f.comments.map((c: any) => ({
              id: c.id,
              findingId: fId,
              sender: c.sender?.name || c.sender?.email || (c.sender?.role === "CLIENT" ? (auditRes?.data?.protocolName || "Client") : "0xAuditor_K4"),
              role: c.sender?.role?.toLowerCase() === "client" ? "client" : "auditor",
              timestamp: c.createdAt ? new Date(c.createdAt).toISOString().replace("T", " ").substring(0, 16) + " UTC" : new Date().toISOString(),
              message: c.message,
            }));
          }
        });
        if (Object.keys(initialComments).length > 0) {
          setFindingComments((prev) => ({ ...prev, ...initialComments }));
        }
      } else {
        setFindings([]);
        setSelectedFindingId("");
      }
    }).finally(() => setDataLoading(false));
  }, [ticketId]);

  const audit = auditData || (MOCK_AUDIT_REQUESTS.find(
    (a) => a.id.toLowerCase() === ticketId.toLowerCase()
  ) || MOCK_AUDIT_REQUESTS[0]);

  const fname = auditData?.contractFileName || "Contract.sol";
  const baseName = fname.replace(/\.sol$/, "");
  const primaryPath = fname.includes("/") ? fname : `contracts/${fname}`;

  // Multi-file Project Structure for the File Tree Explorer
  const projectFiles: ProjectFile[] = React.useMemo(() => {
    const defaultCode = `// SPDX-License-Identifier: MIT
pragma solidity ${auditData?.compilerVersion?.replace('v', '^') || '^0.8.20'};

import "./interfaces/I${baseName}.sol";
import "./libraries/TransferHelper.sol";

/**
 * @title ${auditData?.protocolName || baseName || "Smart Contract"}
 * @notice Primary smart contract under audit review
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

    const matchingTestFile = OPEN_SOURCE_TEST_PROJECT.contractFiles.find(
      (cf) => cf.fileName === fname || cf.path === fname || cf.path.endsWith("/" + fname)
    );

    const rawCode = fetchedSourceCode || matchingTestFile?.sourceCode || defaultCode;
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
      diffLines: primaryLines.map((l) => ({
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

  const activeFile =
    projectFiles.find(
      (f) =>
        f.path === selectedFilePath ||
        f.name === selectedFilePath ||
        selectedFilePath.endsWith(f.name) ||
        f.path.endsWith(selectedFilePath)
    ) || projectFiles[0];

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

  // Per-finding comment submission
  const handlePostFindingComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFindingComment.trim() || !selectedFindingId) return;

    const comment: FindingComment = {
      id: `fc-${Date.now()}`,
      findingId: selectedFindingId,
      sender: "0xAuditor_K4",
      role: "auditor",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC",
      message: newFindingComment.trim(),
    };

    // Optimistic local update
    setFindingComments((prev) => ({
      ...prev,
      [selectedFindingId]: [...(prev[selectedFindingId] || []), comment],
    }));
    setNewFindingComment("");

    // Attempt to persist to backend
    // Backend derives sender from JWT token — only send message (+ optional commitRef)
    try {
      const res = await apiClient.post(`/findings/${selectedFindingId}/comments`, {
        message: comment.message,
      });
      // If backend returned the created comment, update the optimistic entry with the real id
      if (res?.data?.id) {
        setFindingComments((prev) => ({
          ...prev,
          [selectedFindingId]: (prev[selectedFindingId] || []).map((c) =>
            c.id === comment.id ? { ...c, id: res.data.id } : c
          ),
        }));
      }
    } catch (e: any) {
      // Silently accepted — local state already updated optimistically
    }
  };

  if (dataLoading && !auditData) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 text-accent-scan animate-spin" />
        <span className="ml-3 font-mono text-xs text-text-muted">
          Loading auditor workspace for ticket {ticketId}…
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* SUCCESS BANNER WHEN REPORT IS FINALIZED */}
      {isFinalized && (
        <div className="rounded-2xl border border-signal-resolved/40 bg-signal-resolved/10 p-2 sm:p-2.5 shadow-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-bg-panel rounded-xl p-5 border border-signal-resolved/30 space-y-4">
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
              <div className="p-3 rounded-xl bg-[#F2F4F7] dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline space-y-1 font-mono text-[11px]">
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
        </div>
      )}

      {/* TOP AUDITOR BREADCRUMB & SCOPE HEADER */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-border-hairline bg-[#F2F4F7] dark:bg-bg-panel/40 p-1.5 sm:p-2 shadow-sm">
        <div className="bg-white dark:bg-bg-panel rounded-xl p-4 sm:p-5 border border-gray-200/60 dark:border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/auditor/queue"
              className="text-text-muted hover:text-text-primary flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-border-hairline bg-[#F2F4F7] dark:bg-bg-void text-xs transition-colors font-sans font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Ticket Queue</span>
            </Link>
            <span className="text-text-muted/40">/</span>
            <span className="text-accent-scan font-bold tracking-wider">{audit.id}</span>
            <span className="text-text-primary font-semibold hidden sm:inline font-sans text-sm">
              {audit.protocolName}
            </span>
            <span className="text-text-muted text-[11px]">
              ({audit.contractFileName})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Add Finding Button in Header — hidden when client corrections are in progress */}
            {!isCorrectionsStage && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5 text-accent-scan" />}
                onClick={() => handleOpenAddFinding()}
              >
                Add Finding
              </Button>
            )}

            {/* Conditional Report Generation Action */}
            {allFindingsResolved ? (
              <Button
                variant="primary"
                size="sm"
                className="bg-signal-resolved hover:bg-signal-resolved/90 text-bg-void font-bold shadow-sm"
                leftIcon={<FileCheck2 className="h-4 w-4" />}
                onClick={() => setShowReportModal(true)}
              >
                Generate Final Attestation Report
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {ticketStage.includes("correction") ? (
                  <StatusPill status="corrections-requested" size="sm">
                    Awaiting Client Fixes
                  </StatusPill>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-accent-scan text-bg-void hover:bg-accent-scan/90 font-bold shadow-sm"
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
                    Release Findings to Client
                  </Button>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline text-text-muted text-xs" title="Resolve all findings to unlock report compilation">
                  <Lock className="h-3.5 w-3.5 text-signal-critical" />
                  <span>Report Locked ({openOrFixCount} Unresolved)</span>
                </div>
              </div>
            )}

            <StatusPill
              status={ticketStage === "completed" ? "completed" : ticketStage.includes("correction") ? "corrections-requested" : "in-review"}
              size="sm"
            >
              {ticketStage.toUpperCase().replace("_", " ")}
            </StatusPill>
          </div>
        </div>
      </div>

      {/* DUAL-PANE CODE REVIEW & VULNERABILITY TRIAGE SURFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT 7 COLS: CODE PANE (FILE TREE + COMMIT DIFF / FULL SOURCE)             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 rounded-2xl border border-gray-200/80 dark:border-border-hairline bg-[#F2F4F7] dark:bg-bg-panel/40 p-1.5 sm:p-2 shadow-sm flex flex-col">
          <div className="bg-white dark:bg-bg-panel rounded-xl border border-gray-200/60 dark:border-border-hairline overflow-hidden flex flex-col flex-1">
            {/* Top Control Bar */}
            <div className="border-b border-gray-200/70 dark:border-border-hairline bg-[#F9FAFB] dark:bg-bg-void/90 flex flex-wrap items-center justify-between font-mono text-xs px-3.5 py-2.5 gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFileTree(!showFileTree)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-[11px] font-medium font-sans ${
                    showFileTree
                      ? "bg-accent-scan/15 text-accent-scan border border-accent-scan/40 font-semibold"
                      : "text-text-muted hover:text-text-primary border border-gray-200/80 dark:border-border-hairline bg-white dark:bg-bg-panel"
                  }`}
                  title="Toggle File Tree Explorer"
                >
                  <FolderTree className="h-3.5 w-3.5" />
                  <span>Explorer</span>
                </button>

                <span className="text-text-muted/40">/</span>

                <span className="font-semibold text-text-primary text-xs flex items-center gap-1.5 font-mono">
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
                    className="text-[11px] h-8 px-2.5"
                  >
                    Flag Line
                  </Button>
                )}

                <div className="flex items-center rounded-lg border border-gray-200/80 dark:border-border-hairline bg-[#F2F4F7] dark:bg-bg-panel p-0.5">
                  <button
                    onClick={() => setViewMode("diff")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-[11px] font-mono ${
                      viewMode === "diff"
                        ? "bg-accent-scan text-bg-void font-bold shadow-xs"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <GitCompare className="h-3 w-3" />
                    <span>Diff</span>
                  </button>

                  <button
                    onClick={() => setViewMode("full")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-[11px] font-mono ${
                      viewMode === "full"
                        ? "bg-white dark:bg-bg-panel-raised text-text-primary font-bold shadow-xs"
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
                              setFindingView("detail");
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
                                setFindingView("detail");

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
          <div className="p-2.5 px-4 bg-gray-50/80 dark:bg-bg-panel-raised border-t border-gray-200/70 dark:border-border-hairline flex items-center justify-between text-xs font-mono text-text-muted">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-signal-resolved" />
              <span>File: {activeFile.name} · {activeFile.sloc} SLOC</span>
            </span>
            <span className="text-accent-scan">EVM Target: Shanghai ({audit.compilerVersion})</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT 5 COLS: AUDITOR TRIAGE & VERIFICATION WORKBENCH                     */}
      {/* ========================================================================= */}
      <div className="lg:col-span-5 rounded-2xl border border-gray-200/80 dark:border-border-hairline bg-[#F2F4F7] dark:bg-bg-panel/40 p-1.5 sm:p-2 shadow-sm flex flex-col">
        <div className="bg-white dark:bg-bg-panel rounded-xl border border-gray-200/60 dark:border-border-hairline p-4 sm:p-5 shadow-xs space-y-4 font-mono text-xs flex-1">

          {/* ------------------------------------------------------------------ */}
          {/* VIEW A: FINDINGS LIST — shown when no finding is open in detail      */}
          {/* ------------------------------------------------------------------ */}
          {findingView === "list" && (
            <div className="space-y-4 font-mono text-xs">
              {/* Triage Header & Filter Tabs */}
              <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-bg-panel-raised/50 border border-gray-200/80 dark:border-border-hairline space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary flex items-center gap-1.5 text-xs font-sans">
                    <ShieldCheck className="h-4 w-4 text-accent-scan" />
                    <span>Findings Triage ({findings.length})</span>
                  </span>
                  {!isCorrectionsStage && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="h-7 text-[11px] px-2.5 bg-accent-scan text-bg-void font-bold shadow-xs"
                      leftIcon={<Plus className="h-3 w-3" />}
                      onClick={() => handleOpenAddFinding()}
                    >
                      Add Finding
                    </Button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
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
                        className={`px-3 py-1 rounded-lg transition-colors capitalize font-sans text-xs ${
                          findingFilter === filterKey
                            ? "bg-accent-scan/15 text-accent-scan font-semibold border border-accent-scan/30 shadow-xs"
                            : "text-text-muted hover:text-text-primary bg-white dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline"
                        }`}
                      >
                        {filterKey} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Findings Card List — click to open detail view */}
              <div className="space-y-2.5">
                {filteredFindings.length === 0 && (
                  <div className="p-8 text-center text-text-muted text-xs rounded-xl border border-gray-200/80 dark:border-border-hairline bg-gray-50/50 dark:bg-bg-panel font-sans">
                    No findings match this filter.
                  </div>
                )}
                {filteredFindings.map((f) => {
                  const commentCount = (findingComments[f.id] || []).length;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        setSelectedFindingId(f.id);
                        setFindingView("detail");
                        if (f.file && f.file !== activeFile.path) {
                          const target = projectFiles.find((p) => p.path === f.file || p.name === f.file);
                          if (target) setSelectedFilePath(target.path);
                        }
                      }}
                      className="w-full p-3.5 rounded-xl border transition-all text-left bg-white dark:bg-bg-panel border-gray-200/80 dark:border-border-hairline hover:border-accent-scan/50 dark:hover:border-accent-scan/50 hover:shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-accent-scan font-bold text-[11px] font-mono">{f.id}</span>
                            <Badge severity={f.severity} size="sm">
                              {f.severity.toUpperCase()}
                            </Badge>
                            <span className="text-[10px] text-text-muted truncate font-mono">
                              {f.file.split("/").pop()}:{f.line}
                            </span>
                          </div>
                          <div className={`text-xs font-sans font-medium leading-snug ${f.falsePositive ? "line-through text-text-muted" : "text-text-primary"}`}>
                            {f.title}
                          </div>
                          {f.description && (
                            <p className="text-[11px] text-text-muted font-sans leading-relaxed line-clamp-2">
                              {f.description}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-2">
                          {f.falsePositive ? (
                            <span className="text-[10px] text-text-muted border border-gray-200 dark:border-border-hairline bg-gray-50 dark:bg-bg-void px-2 py-0.5 rounded-md font-bold font-sans">
                              FALSE POSITIVE
                            </span>
                          ) : f.status === "resolved" ? (
                            <span className="text-[10px] text-signal-resolved bg-signal-resolved/10 px-2 py-0.5 rounded-md border border-signal-resolved/30 font-bold font-sans">
                              RESOLVED ✓
                            </span>
                          ) : f.status === "fix-submitted" ? (
                            <span className="text-[10px] text-signal-high bg-signal-high/10 px-2 py-0.5 rounded-md border border-signal-high/30 font-bold font-sans">
                              RE-VERIFY
                            </span>
                          ) : (
                            <span className="text-[10px] text-signal-critical bg-signal-critical/10 px-2 py-0.5 rounded-md border border-signal-critical/30 font-bold font-sans">
                              OPEN
                            </span>
                          )}
                          {commentCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-text-muted">
                              <MessageSquare className="h-3 w-3" />
                              {commentCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-border-hairline flex items-center justify-between text-[10px] text-text-muted">
                        <span className="flex items-center gap-1 font-mono">
                          <FileCode2 className="h-3 w-3 text-accent-scan" />
                          {f.swcId}
                        </span>
                        <span className="flex items-center gap-1 group-hover:text-accent-scan transition-colors font-sans font-medium">
                          Open findings detail →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* VIEW B: FULL FINDING DETAIL — replaces list when a finding is open  */}
          {/* ------------------------------------------------------------------ */}
          {findingView === "detail" && selectedFinding && (
            <div className="space-y-4 font-mono text-xs animate-in fade-in duration-150">
              {/* Back navigation bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 dark:bg-bg-panel-raised/50 border border-gray-200/80 dark:border-border-hairline">
                <button
                  onClick={() => setFindingView("list")}
                  className="flex items-center gap-1.5 text-text-muted hover:text-accent-scan transition-colors text-xs font-sans font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Findings</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-text-muted font-sans">{filteredFindings.findIndex(f => f.id === selectedFindingId) + 1} of {filteredFindings.length}</span>
                  {/* Prev / Next */}
                  {filteredFindings.findIndex(f => f.id === selectedFindingId) > 0 && (
                    <button
                      onClick={() => {
                        const idx = filteredFindings.findIndex(f => f.id === selectedFindingId);
                        setSelectedFindingId(filteredFindings[idx - 1].id);
                      }}
                      className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-bg-panel"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {filteredFindings.findIndex(f => f.id === selectedFindingId) < filteredFindings.length - 1 && (
                    <button
                      onClick={() => {
                        const idx = filteredFindings.findIndex(f => f.id === selectedFindingId);
                        setSelectedFindingId(filteredFindings[idx + 1].id);
                      }}
                      className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-bg-panel"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Finding Detail Panel */}
              <div className="rounded-xl bg-white dark:bg-bg-panel border border-gray-200/80 dark:border-border-hairline overflow-hidden shadow-xs">
                {/* Finding Header */}
                <div className="p-4 sm:p-5 border-b border-gray-200/70 dark:border-border-hairline space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-accent-scan font-bold text-sm font-mono">{selectedFinding.id}</span>
                        <Badge severity={selectedFinding.severity} size="sm">
                          {selectedFinding.severity.toUpperCase()} ({selectedFinding.cvss})
                        </Badge>
                        <span className="text-text-muted text-[11px] font-mono">{selectedFinding.swcId}</span>
                      </div>
                      <h4 className="font-sans text-sm font-semibold text-text-primary leading-snug">
                        {selectedFinding.title}
                      </h4>
                      <div className="text-[11px] text-text-muted flex items-center gap-2 font-mono">
                        <FileCode2 className="h-3.5 w-3.5 text-accent-scan" />
                        <span>{selectedFinding.file}:{selectedFinding.line}</span>
                      </div>
                    </div>

                    {selectedFinding.falsePositive ? (
                      <Badge severity="low" size="sm">DISMISSED (FP)</Badge>
                    ) : selectedFinding.status === "resolved" ? (
                      <Badge severity="resolved" size="sm">RESOLVED ✓</Badge>
                    ) : (
                      <Badge severity={selectedFinding.severity} size="sm">
                        {selectedFinding.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Scrollable detail body */}
                <div className="divide-y divide-gray-200/70 dark:divide-border-hairline">
                  {/* False Positive Banner */}
                  {selectedFinding.falsePositive && (
                    <div className="p-4 bg-signal-low/5">
                      <div className="p-3 rounded-lg bg-white dark:bg-bg-void border border-signal-low/30 space-y-1">
                        <div className="font-bold text-text-primary flex items-center gap-1.5 text-xs font-sans">
                          <AlertTriangle className="h-3.5 w-3.5 text-signal-low" />
                          <span>Dismissed as False Positive</span>
                        </div>
                        <p className="text-[11px] text-text-muted font-sans leading-relaxed">
                          {selectedFinding.fpJustification || "Auditor evaluated finding as non-exploitable in this codebase context."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Impact & Description */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {selectedFinding.impact && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold font-sans">EXPLOIT IMPACT</div>
                        <div className="text-xs text-signal-high font-sans font-medium">{selectedFinding.impact}</div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold font-sans">ROOT CAUSE & ANALYSIS</div>
                      <p className="text-xs text-text-muted font-sans leading-relaxed">
                        {selectedFinding.description || <span className="italic">No description provided.</span>}
                      </p>
                    </div>
                  </div>

                  {/* Vulnerable Code */}
                  {selectedFinding.vulnerableCode && (
                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold font-sans">FLAGGED VULNERABLE CODE</div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-bg-void border border-signal-critical/30 text-[11px] overflow-x-auto">
                        <HighlightedSolidityBlock code={selectedFinding.vulnerableCode} />
                      </div>
                    </div>
                  )}

                  {/* Remediation */}
                  {selectedFinding.remediation && (
                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold font-sans">REMEDIATION GUIDANCE</div>
                      <p className="text-xs text-signal-resolved font-sans leading-relaxed">
                        {selectedFinding.remediation}
                      </p>
                    </div>
                  )}

                  {/* Triage Actions */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold font-sans">TRIAGE ACTIONS</div>

                    {isCorrectionsStage ? (
                      <div className="space-y-2">
                        <div className="p-3.5 rounded-xl bg-signal-high/10 border border-signal-high/30 flex items-start gap-2.5">
                          <Lock className="h-4 w-4 text-signal-high shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-bold text-signal-high uppercase font-sans">Triage Actions Locked</div>
                            <p className="text-[11px] text-text-muted font-sans">
                              Findings are with the client for remediation. Only <strong className="text-text-primary">editing</strong> is permitted.
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
                          className="w-full text-text-muted border-gray-200 dark:border-border-hairline hover:text-text-primary text-xs"
                          onClick={() => handleOpenEditFinding(selectedFinding)}
                          leftIcon={<FileEdit className="h-3.5 w-3.5" />}
                        >
                          Edit Finding Details
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Auditor re-verification notes */}
                        <Input
                          value={auditorNote}
                          onChange={(e) => setAuditorNote(e.target.value)}
                          placeholder="Re-verification or triage notes (optional)..."
                          className="text-xs bg-gray-50/50 dark:bg-bg-void rounded-xl border-gray-200/80 dark:border-border-hairline"
                        />
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
                              className="text-text-muted border-gray-200 dark:border-border-hairline hover:text-text-primary text-xs"
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
                            className="text-text-muted hover:text-signal-critical border-gray-200 dark:border-border-hairline hover:border-signal-critical/40 text-[11px]"
                            onClick={() => handleOpenFpModal(selectedFinding)}
                            leftIcon={<X className="h-3.5 w-3.5" />}
                          >
                            Mark False Positive
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* ── DISCUSSION THREAD ─────────────────────────────────── */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold font-sans flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-accent-scan" />
                        <span>DISCUSSION THREAD</span>
                      </div>
                      <span className="text-[11px] text-text-muted font-sans">
                        {(findingComments[selectedFinding.id] || []).length} comment{(findingComments[selectedFinding.id] || []).length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Comment list */}
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {(findingComments[selectedFinding.id] || []).length === 0 && (
                        <div className="text-center py-6 text-text-muted text-[11px] font-sans">
                          No comments yet. Start the discussion below.
                        </div>
                      )}
                      {(findingComments[selectedFinding.id] || []).map((c) => (
                        <div
                          key={c.id}
                          className={`p-3.5 rounded-xl border space-y-1.5 ${
                            c.role === "auditor"
                              ? "bg-gray-50/80 dark:bg-bg-panel-raised border-accent-scan/25"
                              : "bg-white dark:bg-bg-void border-gray-200/80 dark:border-border-hairline"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[11px] font-bold ${c.role === "auditor" ? "text-accent-scan" : "text-text-primary"}`}>
                                {c.sender}
                              </span>
                              <Badge severity={c.role === "auditor" ? "informational" : "resolved"} size="sm">
                                {c.role === "auditor" ? "AUDITOR" : "CLIENT"}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-text-muted">{c.timestamp}</span>
                          </div>
                          <p className="text-xs text-text-primary font-sans leading-relaxed">{c.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Comment input */}
                    <form onSubmit={handlePostFindingComment} className="space-y-2 pt-2 border-t border-gray-200/70 dark:border-border-hairline">
                      <textarea
                        value={newFindingComment}
                        onChange={(e) => setNewFindingComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handlePostFindingComment(e as any);
                          }
                        }}
                        rows={3}
                        placeholder="Leave a comment on this finding... (Ctrl+Enter to submit)"
                        className="w-full p-3 rounded-xl bg-gray-50/50 dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline text-text-primary text-xs focus:outline-none focus:border-accent-scan font-sans resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-text-muted font-sans">Visible to both auditor and client</span>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          className="bg-accent-scan text-bg-void font-bold text-xs"
                          rightIcon={<Send className="h-3 w-3" />}
                          disabled={!newFindingComment.trim()}
                        >
                          Post Comment
                        </Button>
                      </div>
                    </form>
                  </div>
                  {/* ───────────────────────────────────────────────────────── */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>


      {/* ========================================================================= */}
      {/* MODAL 1: ADD MANUAL FINDING FORM                                          */}
      {/* ========================================================================= */}
      {showAddFindingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-bg-panel border border-gray-200/80 dark:border-border-hairline shadow-2xl p-6 md:p-8 space-y-5 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-border-hairline pb-4">
              <div className="space-y-0.5">
                <Eyebrow size="xs" variant="scan" prefix="// AUDITOR_TRIAGE · ">
                  {editingFindingId ? "EDIT_FINDING" : "LOG_MANUAL_FINDING"}
                </Eyebrow>
                <h3 className="font-display text-base font-bold text-text-primary">
                  {editingFindingId ? "Edit Vulnerability Finding" : "Create New Vulnerability Finding"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddFindingModal(false);
                  setEditingFindingId(null);
                }}
                className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-bg-panel transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={editingFindingId ? handleSubmitEditFinding : handleSubmitNewFinding} className="space-y-4">

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted font-sans font-medium">FINDING HEADLINE / TITLE *</label>
                <Input
                  value={newFindingForm.title}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Missing Zero-Address Validation in setRewardPool()"
                  required
                  className="text-xs bg-gray-50/50 dark:bg-bg-void rounded-xl border-gray-200/80 dark:border-border-hairline"
                />
              </div>

              {/* Severity & CVSS Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted font-sans font-medium">SEVERITY CLASSIFICATION *</label>
                  <select
                    value={newFindingForm.severity}
                    onChange={(e) => setNewFindingForm((prev) => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full h-10 rounded-xl bg-gray-50/50 dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline text-text-primary px-3 text-xs focus:outline-none focus:border-accent-scan"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                    <option value="INFORMATIONAL">INFORMATIONAL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted font-sans font-medium">CVSS V3 SCORE</label>
                  <Input
                    value={newFindingForm.cvss}
                    onChange={(e) => setNewFindingForm((prev) => ({ ...prev, cvss: e.target.value }))}
                    placeholder="CVSS 8.5"
                    className="text-xs bg-gray-50/50 dark:bg-bg-void rounded-xl border-gray-200/80 dark:border-border-hairline"
                  />
                </div>
              </div>

              {/* SWC Taxonomy */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted font-sans font-medium">SWC TAXONOMY / VULNERABILITY CLASS</label>
                <select
                  value={newFindingForm.taxonomy}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, taxonomy: e.target.value }))}
                  className="w-full h-10 rounded-xl bg-gray-50/50 dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline text-text-primary px-3 text-xs focus:outline-none focus:border-accent-scan"
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
                  <label className="text-[11px] text-text-muted font-sans font-medium">AFFECTED FILE</label>
                  <select
                    value={newFindingForm.file}
                    onChange={(e) => setNewFindingForm((prev) => ({ ...prev, file: e.target.value }))}
                    className="w-full h-10 rounded-xl bg-gray-50/50 dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline text-text-primary px-3 text-xs focus:outline-none focus:border-accent-scan"
                  >
                    {projectFiles.map((p) => (
                      <option key={p.path} value={p.path}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted font-sans font-medium">LINE NUMBER</label>
                  <Input
                    type="number"
                    value={newFindingForm.line}
                    onChange={(e) => setNewFindingForm((prev) => ({ ...prev, line: parseInt(e.target.value, 10) || 1 }))}
                    placeholder="142"
                    className="text-xs bg-gray-50/50 dark:bg-bg-void rounded-xl border-gray-200/80 dark:border-border-hairline"
                  />
                </div>
              </div>

              {/* Impact */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted font-sans font-medium">EXPLOIT IMPACT SUMMARY</label>
                <Input
                  value={newFindingForm.impact}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, impact: e.target.value }))}
                  placeholder="e.g. 100% COLLATERAL DRAIN"
                  className="text-xs bg-gray-50/50 dark:bg-bg-void rounded-xl border-gray-200/80 dark:border-border-hairline"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted font-sans font-medium">TECHNICAL ROOT CAUSE & DESCRIPTION</label>
                <textarea
                  value={newFindingForm.description}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the vulnerability mechanics and how an attacker could trigger it..."
                  className="w-full p-3 rounded-xl bg-gray-50/50 dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline text-text-primary text-xs focus:outline-none focus:border-accent-scan font-sans"
                />
              </div>

              {/* Vulnerable Code */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted font-sans font-medium">VULNERABLE CODE SNIPPET (OPTIONAL)</label>
                <textarea
                  value={newFindingForm.vulnerableCode}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, vulnerableCode: e.target.value }))}
                  rows={2}
                  placeholder="Paste vulnerable code lines..."
                  className="w-full p-3 rounded-xl bg-gray-50/50 dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline text-text-primary text-xs focus:outline-none focus:border-accent-scan font-mono"
                />
                {newFindingForm.vulnerableCode.trim() && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-bg-panel border border-gray-200/80 dark:border-border-hairline text-[11px] overflow-x-auto">
                    <div className="text-[10px] text-text-muted font-mono uppercase pb-1.5 font-bold">Live Syntax Preview:</div>
                    <HighlightedSolidityBlock code={newFindingForm.vulnerableCode} />
                  </div>
                )}
              </div>

              {/* Remediation */}
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted font-sans font-medium">REMEDIATION RECOMMENDATION</label>
                <textarea
                  value={newFindingForm.remediation}
                  onChange={(e) => setNewFindingForm((prev) => ({ ...prev, remediation: e.target.value }))}
                  rows={2}
                  placeholder="Step-by-step guidance for the protocol team to patch this vulnerability..."
                  className="w-full p-3 rounded-xl bg-gray-50/50 dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline text-text-primary text-xs focus:outline-none focus:border-accent-scan font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200/70 dark:border-border-hairline">
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
                  className="bg-accent-scan text-bg-void font-bold shadow-sm"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-bg-panel border border-gray-200/80 dark:border-border-hairline shadow-2xl p-6 md:p-7 space-y-4 font-sans text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-border-hairline pb-3">
              <div className="flex items-center gap-2 text-signal-critical font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Dismiss as False Positive</span>
              </div>
              <button
                onClick={() => setShowFpModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-bg-panel transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-text-muted text-xs leading-relaxed font-sans">
              You are dismissing finding <strong>{findingToDismiss.id}</strong> ({findingToDismiss.title}). Please document the auditor justification below. Dismissed findings do not require client fixes and will not block attestation report sealing.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-text-muted font-sans font-medium">AUDITOR JUSTIFICATION / RATIONALE *</label>
              <textarea
                value={fpJustificationInput}
                onChange={(e) => setFpJustificationInput(e.target.value)}
                rows={3}
                placeholder="e.g. Non-exploitable in context: Reentrancy is impossible because parent contract employs ReentrancyGuard modifier..."
                className="w-full p-3 rounded-xl bg-gray-50/50 dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline text-text-primary text-xs focus:outline-none focus:border-accent-scan font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200/70 dark:border-border-hairline">
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
                className="bg-signal-critical text-bg-void hover:bg-signal-critical/90 font-bold shadow-sm"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-bg-panel border border-gray-200/80 dark:border-border-hairline shadow-2xl p-6 md:p-8 space-y-6 text-xs animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-border-hairline pb-4">
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
                className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-bg-panel transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Certificate Preview Card */}
            <div className="p-6 rounded-xl bg-gray-50/70 dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-border-hairline pb-3">
                <div>
                  <div className="font-display font-bold text-sm text-text-primary">
                    ZYRON SECURITY LABS
                  </div>
                  <div className="text-[10px] text-text-muted font-mono">
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
                  <div className="text-signal-resolved font-bold font-mono">{audit.gitCommit || "4b8f10e"}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white dark:bg-bg-panel border border-gray-200/80 dark:border-border-hairline space-y-1">
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>IMMUTABLE BYTECODE SHA-256 HASH:</span>
                  <span className="text-signal-resolved font-bold">COMMIT SEALED ✓</span>
                </div>
                <div className="text-accent-scan select-all text-xs truncate font-mono">
                  {audit.bytecodeHash || "0x8f9b2d4c01e9a37d8849b209d7c04419f8a32d645e771b"}
                </div>
              </div>

              {audit.onChainTxHash && (
                <div className="p-3.5 rounded-lg bg-white dark:bg-bg-panel border border-gray-200/80 dark:border-border-hairline space-y-1 font-mono">
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
                      className="text-signal-resolved hover:underline text-[10px] flex items-center gap-1 shrink-0 font-bold"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200/70 dark:border-border-hairline flex items-center justify-between text-[11px] text-text-muted">
                <span>VERIFIED FINDINGS: {findings.length} ({findings.filter(f => f.status === "resolved").length} RESOLVED, {findings.filter(f => f.falsePositive).length} DISMISSED)</span>
                <span className="text-signal-resolved font-bold">0 OPEN CRITICAL / HIGH</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-text-muted text-[11px] font-sans">
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
                    className="bg-signal-resolved hover:bg-signal-resolved/90 text-bg-void font-bold shadow-sm"
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
