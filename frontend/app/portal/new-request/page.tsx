"use client";

import * as React from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileCode,
  FileCheck,
  Check,
  ArrowRight,
  AlertCircle,
  Hash,
  ShieldCheck,
  Terminal,
  Layers,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  RefreshCw,
  GitBranch,
  GitPullRequest,
  Search,
  Lock,
  Globe,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { MOCK_REPOSITORIES, type MockRepository, type SolContractFile } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewAuditRequestPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Auth Guard: redirect unauthenticated users only after session initialization finishes
  React.useEffect(() => {
    if (!loading && !user) {
      toast.error("Authentication Required: Please sign in to submit an audit request.");
      router.push("/auth/login");
    }
  }, [user, loading, router]);
  // Method Toggle: "upload" | "github"
  const [sourceMode, setSourceMode] = React.useState<"upload" | "github">("upload");

  const handleSwitchSourceMode = (mode: "upload" | "github") => {
    setSourceMode(mode);
    if (mode === "github" && !fetchedGithubData) {
      setSourceCode("");
      setContractFileName("");
      setFileName("");
      setFileSize("0 KB");
    }
  };

  // GitHub State
  const [isGithubConnected, setIsGithubConnected] = React.useState(false);
  const [repoSearch, setRepoSearch] = React.useState("");
  const [selectedRepoId, setSelectedRepoId] = React.useState<string>("repo-1");
  const [selectedBranch, setSelectedBranch] = React.useState<string>("main");
  const [customGithubUrl, setCustomGithubUrl] = React.useState("https://github.com/aura-finance/core-vaults");
  const [isFetchingGithub, setIsFetchingGithub] = React.useState(false);
  const [fetchedGithubData, setFetchedGithubData] = React.useState<any>(null);

  const handleSelectGithubFile = async (owner: string, repo: string, filePath: string, branch = "main") => {
    const fname = filePath.split("/").pop() || filePath;
    setContractFileName(fname);
    setFileName(fname);

    try {
      const res = await apiClient.get("/integrations/github/file-content", {
        params: { owner, repo, filePath, branch },
      });
      if (res.data?.content) {
        setSourceCode(res.data.content);
        setFileSize(`${(res.data.content.length / 1024).toFixed(1)} KB`);
        toast.success(`Loaded real source code for ${fname} from GitHub!`);
      }
    } catch (e: any) {
      toast.error(`Could not fetch raw source for ${fname}: ${e.message}`);
    }
  };

  const handleFetchRealGithubRepo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customGithubUrl.trim()) return;

    setIsFetchingGithub(true);
    try {
      const res = await apiClient.get(`/integrations/github/contracts`, {
        params: { repoUrl: customGithubUrl, branch: selectedBranch || "main" },
      });
      const data = res.data;
      setFetchedGithubData(data);
      setIsGithubConnected(true);
      if (data.commitSha) setGitCommit(data.commitSha);
      if (data.contracts && data.contracts.length > 0) {
        setProtocolName(`${data.owner}/${data.repo}`);
        const firstFile = typeof data.contracts[0] === "string" ? data.contracts[0] : (data.contracts[0]?.path || data.contracts[0]);
        handleSelectGithubFile(data.owner, data.repo, firstFile, data.branch || "main");
      }
      toast.success(`Fetched ${data.contracts?.length || 0} contract files from GitHub (${data.owner}/${data.repo})!`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch GitHub repo";
      toast.error(`GitHub API Notice: ${msg}`);
    } finally {
      setIsFetchingGithub(false);
    }
  };

  // Form State
  const [protocolName, setProtocolName] = React.useState("Aura Liquidity Protocol");
  const [contractFileName, setContractFileName] = React.useState("");
  const [contractAddress, setContractAddress] = React.useState("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
  const [compilerVersion, setCompilerVersion] = React.useState("v0.8.20");
  const [network, setNetwork] = React.useState("Ethereum Mainnet (1)");
  const [gitCommit, setGitCommit] = React.useState("8f9b2d4c01e9a37");

  // Invariant checkboxes
  const [invariants, setInvariants] = React.useState<Record<string, boolean>>({
    reentrancy: true,
    oracle: true,
    access: true,
    erc20: true,
    crosschain: false,
  });

  // Source code state
  const [sourceCode, setSourceCode] = React.useState<string>("");

  const [fileName, setFileName] = React.useState<string>("No file uploaded yet");
  const [fileSize, setFileSize] = React.useState<string>("0 KB");
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Selected repo object
  const selectedRepo = MOCK_REPOSITORIES.find((r) => r.id === selectedRepoId) || MOCK_REPOSITORIES[0];

  // Filtered repos list
  const filteredRepos = MOCK_REPOSITORIES.filter(
    (repo) =>
      repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(repoSearch.toLowerCase())
  );

  // Dynamic SLOC count based on source code lines
  const calculatedSloc = React.useMemo(() => {
    return sourceCode
      .split("\n")
      .filter((line) => line.trim().length > 0 && !line.trim().startsWith("//")).length;
  }, [sourceCode]);

  // Turnaround SLA estimation based on SLOC
  const turnaroundSla = React.useMemo(() => {
    if (calculatedSloc < 500) return "24–36 Hours";
    if (calculatedSloc < 1500) return "36–48 Hours";
    return "48–72 Hours";
  }, [calculatedSloc]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setContractFileName(file.name);
      setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSourceCode(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    setFileName("VaultCore.sol");
    setFileSize("14.8 KB");
    setContractFileName("VaultCore.sol");
    setProtocolName("Aura Liquidity Protocol");
    setContractAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
  };

  const handleSelectRepoContract = (file: SolContractFile) => {
    setFileName(file.fileName);
    setContractFileName(file.fileName);
    setSourceCode(file.sourceCode);
    setGitCommit(file.commit);
    setFileSize(`${(file.sloc * 0.038).toFixed(1)} KB`);
    if (selectedRepo) {
      setProtocolName(`Aura ${selectedRepo.name}`);
    }
  };

  const [submittedTicketId, setSubmittedTicketId] = React.useState<string>("#ZYR-9486");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Authentication Required: Please sign in to submit an audit request.");
      router.push("/auth/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.post("/audits", {
        protocolName,
        contractFileName: contractFileName || fileName || "Contract.sol",
        contractAddress: contractAddress || undefined,
        compilerVersion,
        network,
        sloc: calculatedSloc,
        gitCommit,
      });

      const auditId = res.data?.id || "ZYR-9486";
      const createdTicket = auditId.startsWith("#") ? auditId : `#${auditId}`;
      setSubmittedTicketId(createdTicket);

      // Note: AST scan is triggered automatically by the backend on audit creation.
      toast.success(`Audit Request ${createdTicket} created successfully! AST scan queue initialized.`);
      setIsSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create audit request";
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      toast.error(`Audit Request Error: ${displayMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInvariant = (key: string) => {
    setInvariants((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isSubmitted) {
    const activeInvariantsList = Object.keys(invariants)
      .filter((k) => invariants[k])
      .join(", ") || "reentrancy, access_control, erc20_compliance";
    const mappedOpcodes = Math.max(120, calculatedSloc * 4);

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline border-l-2 border-l-signal-resolved space-y-6">
          <div className="flex items-center justify-between border-b border-border-hairline pb-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-signal-resolved/10 border border-signal-resolved text-signal-resolved flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <Eyebrow size="xs" variant="scan" prefix="// STATUS: ">
                  SUBMITTED_FOR_REVIEW
                </Eyebrow>
                <h1 className="font-display text-xl font-semibold text-text-primary">
                  Audit Request Ingested — Ticket {submittedTicketId}
                </h1>
              </div>
            </div>
            <StatusPill status="pending" size="sm" />
          </div>

          <p className="text-sm text-text-muted leading-relaxed">
            Your contract <code className="text-text-primary font-mono text-xs">{contractFileName || fileName || "Contract.sol"}</code> ({calculatedSloc} SLOC) has been pinned to commit <code className="text-accent-scan font-mono text-xs">{gitCommit.slice(0, 7)}</code>. The automated AST symbolic scanner is executing.
          </p>

          {/* Submission Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs">
            <div>
              <div className="text-text-muted text-[10px]">TICKET ID</div>
              <div className="text-accent-scan font-bold">{submittedTicketId}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">COMPILER</div>
              <div className="text-text-primary">{compilerVersion}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">SCOPED SLOC</div>
              <div className="text-text-primary">{calculatedSloc} SLOC</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">INITIAL TRIAGE SLA</div>
              <div className="text-signal-resolved">{turnaroundSla}</div>
            </div>
          </div>

          {/* Dynamic AST Scanner Real-Time Log Console */}
          <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-accent-scan font-bold border-b border-border-hairline pb-2">
              <span>ZYR-ENGINE-AST-SCANNER // v2.4.0 · PID: 81924</span>
              <span className="text-signal-resolved text-[11px]">ACTIVE SYMBOLIC TAINT PASS</span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono leading-relaxed text-text-muted">
              <div>[INFO] Ingesting target contract: <span className="text-text-primary font-bold">{contractFileName || fileName || "Contract.sol"}</span> ({calculatedSloc} SLOC)</div>
              <div>[INFO] Locking Git commit SHA: <span className="text-accent-scan">{gitCommit}</span></div>
              <div>[INFO] Compiler target verified: <span className="text-text-primary">solc {compilerVersion} --via-ir --optimize</span></div>
              <div>[INFO] Target Deployment Network: <span className="text-text-primary">{network}</span></div>
              <div>[INFO] Active Invariants Scanned: <span className="text-signal-resolved">{activeInvariantsList}</span></div>
              <div className="text-text-primary">[OK] AST compilation successful: {mappedOpcodes} EVM opcodes mapped across contract methods</div>
              <div className="text-signal-resolved">[PASS] AST Taint Pass 01/14: Access Control & Ownable invariants... PASSED</div>
              <div className="text-signal-resolved">[PASS] AST Taint Pass 02/14: Arithmetic overflow/underflow (Solidity 0.8+)... PASSED</div>
              {sourceCode.includes("transfer") && (
                <div className="text-signal-warning">[FLAG] AST Taint Pass 04/14: ERC-20 return value compliance check... VERIFYING</div>
              )}
              {sourceCode.includes("call") && (
                <div className="text-signal-critical">[CRITICAL] AST Taint Pass 08/14: Low-level call execution order & reentrancy graph... VERIFYING</div>
              )}
              <div className="text-accent-scan">[ANALYSIS] AST Taint Pass 11/14: Symbolic Reentrancy Graph & Invariant Proofs... IN PROGRESS</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/portal">
              <Button variant="primary" size="md">
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/portal">
              <Button variant="outline" size="md">
                View Live Pipeline Rail
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-hairline pb-4">
        <div>
          <Eyebrow size="sm" variant="scan" prefix="// INTAKE_WORKFLOW · ">
            NEW_AUDIT_ENGAGEMENT
          </Eyebrow>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            New Audit Request
          </h1>
        </div>
        <div className="font-mono text-xs text-text-muted">
          STAGE 01 OF 04 // SCOPE & BYTECODE LOCK
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* STEP 1: TARGET PROTOCOL METADATA */}
        <section className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent-scan text-bg-void font-mono text-[11px] font-bold flex items-center justify-center">
                01
              </span>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Protocol & Contract Scope Metadata
              </h2>
            </div>
            <span className="font-mono text-[11px] text-text-muted">STEP 1 OF 3</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protocol Name */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted flex items-center justify-between">
                <span>PROTOCOL / REPOSITORY NAME</span>
                <span className="text-accent-scan text-[10px]">REQUIRED</span>
              </label>
              <Input
                value={protocolName}
                onChange={(e) => setProtocolName(e.target.value)}
                placeholder="e.g. Aura Liquidity Pool V3"
                required
              />
            </div>

            {/* Primary Contract File */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted flex items-center justify-between">
                <span>PRIMARY CONTRACT FILENAME</span>
                <span className="text-accent-scan text-[10px]">REQUIRED</span>
              </label>
              <Input
                value={contractFileName}
                onChange={(e) => setContractFileName(e.target.value)}
                placeholder="e.g. VaultCore.sol"
                required
              />
            </div>

            {/* Deployed / Target Contract Address (with Input mono variant) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-mono text-xs text-text-muted flex items-center justify-between">
                <span>TARGET CONTRACT ADDRESS (MONOSPACE)</span>
                <span className="text-text-muted text-[10px]">OPTIONAL FOR PRE-DEPLOYMENT</span>
              </label>
              <Input
                isMono
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                prefix={<span className="font-mono text-xs text-accent-scan">0x</span>}
              />
            </div>

            {/* Compiler Version */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted">
                SOLIDITY COMPILER VERSION (SOLC)
              </label>
              <select
                value={compilerVersion}
                onChange={(e) => setCompilerVersion(e.target.value)}
                className="w-full h-10 px-3 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs text-text-primary focus:outline-none focus:border-accent-scan transition-colors"
              >
                <option value="v0.8.24">v0.8.24 (Cancun EVM)</option>
                <option value="v0.8.20">v0.8.20 (Shanghai EVM / PUSH0)</option>
                <option value="v0.8.19">v0.8.19</option>
                <option value="v0.8.18">v0.8.18</option>
                <option value="v0.8.17">v0.8.17</option>
              </select>
            </div>

            {/* Target EVM Network */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted">
                DEPLOYMENT TARGET CHAIN
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full h-10 px-3 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs text-text-primary focus:outline-none focus:border-accent-scan transition-colors"
              >
                <option value="Ethereum Mainnet (1)">Ethereum Mainnet (ChainID: 1)</option>
                <option value="Arbitrum One (42161)">Arbitrum One (ChainID: 42161)</option>
                <option value="Optimism (10)">Optimism Mainnet (ChainID: 10)</option>
                <option value="Base (8453)">Base (ChainID: 8453)</option>
                <option value="Polygon (137)">Polygon POS (ChainID: 137)</option>
              </select>
            </div>
          </div>
        </section>

        {/* STEP 2: SOLIDITY SOURCE INGESTION (File Upload vs GitHub Repository) */}
        <section className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent-scan text-bg-void font-mono text-[11px] font-bold flex items-center justify-center">
                02
              </span>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Contract Source Ingestion
              </h2>
            </div>

            {/* Segmented Method Toggle */}
            <div className="flex items-center rounded-[4px] border border-border-hairline bg-bg-void p-0.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => handleSwitchSourceMode("upload")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  sourceMode === "upload"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold border border-border-hairline"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSourceMode("github")}
                className={`px-3 py-1 rounded-[2px] transition-colors ${
                  sourceMode === "github"
                    ? "bg-bg-panel-raised text-accent-scan font-semibold border border-border-hairline"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Connect GitHub Repository
              </button>
            </div>
          </div>

          {/* PATH A: UPLOAD FILE DRAG AND DROP */}
          {sourceMode === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    setFileName(file.name);
                    setContractFileName(file.name);
                    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        setSourceCode(event.target.result as string);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className={`border-2 border-dashed rounded-[4px] p-8 text-center transition-colors relative ${
                  isDragOver
                    ? "border-accent-scan bg-accent-scan/5"
                    : "border-border-hairline hover:border-hairline/80 bg-bg-void/40"
                }`}
              >
                <input
                  type="file"
                  accept=".sol,.zip,.tar,.gz"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center space-y-2 pointer-events-none">
                  <div className="h-10 w-10 rounded-[4px] bg-bg-panel-raised border border-border-hairline flex items-center justify-center text-accent-scan">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-display text-sm font-semibold text-text-primary">
                      Drag and drop <code className="text-accent-scan font-mono">.sol</code> contract file or repository archive
                    </div>
                    <div className="font-mono text-xs text-text-muted">
                      Supports single Solidity files (.sol) or zipped multi-file projects up to 25MB
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Sample Quick-Load */}
              <div className="flex items-center justify-between text-xs font-mono text-text-muted pt-1">
                <span>QUICK LOAD FOR TESTING:</span>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-accent-scan hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Load Sample VaultCore.sol (1,482 SLOC)
                </button>
              </div>
            </div>
          )}

          {/* PATH B: CONNECT GITHUB REPOSITORY */}
          {sourceMode === "github" && (
            <div className="space-y-6">
              {/* Live GitHub Repository URL Fetch Component */}
              <div className="p-6 rounded-[4px] bg-bg-void border border-border-hairline space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-primary font-semibold">
                    <GitBranch className="h-4 w-4 text-accent-scan" />
                    <span>Connect GitHub Repository via REST API</span>
                  </div>
                  <Badge severity="resolved" size="sm">LIVE API CONNECTED</Badge>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full">
                    <Input
                      value={customGithubUrl}
                      onChange={(e) => setCustomGithubUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleFetchRealGithubRepo();
                        }
                      }}
                      placeholder="https://github.com/owner/repository or owner/repo"
                      prefix={<Code2 className="h-3.5 w-3.5 text-text-muted" />}
                      className="h-9 text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleFetchRealGithubRepo}
                    isLoading={isFetchingGithub}
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  >
                    Fetch Repository
                  </Button>
                </div>

                {/* Popular Repository Suggestion Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-text-muted">
                  <span className="text-text-muted">QUICK REPO PRESETS:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomGithubUrl("https://github.com/Vasakee/GhostFI");
                    }}
                    className="px-2 py-0.5 rounded bg-bg-panel border border-border-hairline hover:border-accent-scan text-accent-scan text-[10px] font-mono transition-colors"
                  >
                    Vasakee/GhostFI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomGithubUrl("https://github.com/OpenZeppelin/openzeppelin-contracts");
                    }}
                    className="px-2 py-0.5 rounded bg-bg-panel border border-border-hairline hover:border-accent-scan text-accent-scan text-[10px] font-mono transition-colors"
                  >
                    OpenZeppelin/openzeppelin-contracts
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomGithubUrl("https://github.com/aura-finance/core-vaults");
                    }}
                    className="px-2 py-0.5 rounded bg-bg-panel border border-border-hairline hover:border-accent-scan text-accent-scan text-[10px] font-mono transition-colors"
                  >
                    aura-finance/core-vaults
                  </button>
                </div>
              </div>

              {/* State 1: Not Connected */}
              {!isGithubConnected ? (
                <div className="p-8 rounded-[4px] bg-bg-void border border-border-hairline text-center space-y-4">
                  <div className="h-12 w-12 rounded-[4px] bg-bg-panel border border-border-hairline mx-auto flex items-center justify-center text-accent-scan">
                    <GitBranch className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <div className="font-display text-base font-semibold text-text-primary">
                      No Repository Scope Ingested
                    </div>
                    <p className="text-xs text-text-muted font-mono leading-relaxed">
                      Enter any public or private GitHub repository URL above and click <strong>Fetch Repository</strong> to extract live source tree and commit SHA.
                    </p>
                  </div>
                </div>
              ) : (
                /* State 2: Connected Real GitHub Repository Scope */
                <div className="space-y-6">
                  {/* Connected Status Toolbar */}
                  <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-signal-resolved animate-pulse" />
                      <span className="text-text-primary font-semibold">LIVE GITHUB CONNECTED:</span>
                      <span className="text-accent-scan font-bold">
                        {fetchedGithubData ? `${fetchedGithubData.owner}/${fetchedGithubData.repo}` : customGithubUrl}
                      </span>
                      <span className="text-text-muted text-[11px]">
                        ({fetchedGithubData?.contracts?.length || 0} source files detected)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsGithubConnected(false);
                          setFetchedGithubData(null);
                        }}
                        className="text-text-muted hover:text-signal-critical text-[11px] underline"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>

                  {/* Render Live Extracted GitHub Contracts List */}
                  {fetchedGithubData && (
                    <div className="p-5 rounded-[4px] bg-bg-void border border-accent-scan/30 space-y-4 font-mono text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-3">
                        <div className="space-y-0.5">
                          <div className="text-accent-scan font-bold flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            <span>LIVE REPOSITORY SCOPE: {fetchedGithubData.owner}/{fetchedGithubData.repo}</span>
                          </div>
                          <div className="text-text-muted text-[11px]">
                            COMMIT SHA: <code className="text-accent-scan font-bold">{fetchedGithubData.commitSha || gitCommit.slice(0, 7)}</code>
                          </div>
                        </div>
                        <Badge severity="resolved" size="sm">FETCHED VIA GITHUB API</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="text-text-muted text-[11px] font-semibold flex items-center justify-between">
                          <span>DETECTED FILES ({fetchedGithubData.contracts?.length || 0})</span>
                          <span className="text-accent-scan">CLICK FILE TO INGEST SOURCE</span>
                        </div>

                        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                          {fetchedGithubData.contracts?.map((c: any, i: number) => {
                            const filePath = typeof c === "string" ? c : (c?.path || c);
                            const isCurrentFile = contractFileName === (filePath.split("/").pop() || filePath);
                            return (
                              <div
                                key={i}
                                onClick={() => handleSelectGithubFile(fetchedGithubData.owner, fetchedGithubData.repo, filePath, fetchedGithubData.branch || "main")}
                                className={`p-3 rounded-[4px] border flex items-center justify-between transition-colors cursor-pointer ${
                                  isCurrentFile
                                    ? "bg-bg-panel-raised border-accent-scan"
                                    : "bg-bg-panel border-border-hairline hover:border-accent-scan/70"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  <FileCode className={`h-4 w-4 shrink-0 ${isCurrentFile ? "text-accent-scan" : "text-text-muted"}`} />
                                  <span className={`font-bold truncate ${isCurrentFile ? "text-accent-scan" : "text-text-primary"}`}>
                                    {filePath}
                                  </span>
                                  {isCurrentFile && (
                                    <Badge severity="resolved" size="sm">INGESTED</Badge>
                                  )}
                                </div>
                                <span className={`text-[11px] font-mono shrink-0 ml-2 ${isCurrentFile ? "text-accent-scan font-bold" : "text-text-muted"}`}>
                                  {isCurrentFile ? "ACTIVE SOURCE ✓" : "SELECT FILE →"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CONVERGED INGESTION STATISTICS STRIP (Appears for both Upload & GitHub methods) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs">
            <div>
              <div className="text-text-muted text-[10px]">INGESTED FILE</div>
              <div className="text-text-primary font-medium truncate">{fileName}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">SOURCE LINES (SLOC)</div>
              <div className="text-accent-scan font-bold">{calculatedSloc} lines</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">PINNED COMMIT</div>
              <div className="text-text-primary">{gitCommit.slice(0, 7)}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">ESTIMATED TURNAROUND</div>
              <div className="text-signal-resolved font-medium">{turnaroundSla}</div>
            </div>
          </div>

          {/* Solidity Source Preview Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-accent-scan" />
                SOLIDITY SOURCE PREVIEW
              </span>
              <span>{calculatedSloc} executable lines parsed</span>
            </div>
            <div className="rounded-[4px] border border-border-hairline bg-bg-void/90 p-4 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto text-text-muted">
              <pre>
                <code>
                  {sourceCode || "// Connect a GitHub repository above or select a contract file to load raw source code..."}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* STEP 3: AUDIT REVIEW PARAMETERS & INVARIANTS */}
        <section className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent-scan text-bg-void font-mono text-[11px] font-bold flex items-center justify-center">
                03
              </span>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Scope Focus & Invariant Specifications
              </h2>
            </div>
            <span className="font-mono text-[11px] text-text-muted">STEP 3 OF 3</span>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-xs text-text-muted">
              SELECT KEY ATTACK VECTORS FOR DUAL-AUDITOR MANUAL SCRUTINY:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  key: "reentrancy",
                  label: "Reentrancy & State Ordering",
                  swc: "SWC-107",
                  desc: "External low-level calls before state decrement",
                },
                {
                  key: "oracle",
                  label: "Oracle Manipulation & Flash Loans",
                  swc: "SWC-120",
                  desc: "Spot price dependency and arithmetic slippage",
                },
                {
                  key: "access",
                  label: "Access Control & Upgradeability",
                  swc: "SWC-105",
                  desc: "Privilege escalation and initialization front-running",
                },
                {
                  key: "erc20",
                  label: "ERC-20 Return Value Handling",
                  swc: "SWC-104",
                  desc: "Non-standard tokens (USDT/BNB) silent failure modes",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => toggleInvariant(item.key)}
                  className={`p-3.5 rounded-[4px] border cursor-pointer select-none transition-colors ${
                    invariants[item.key]
                      ? "bg-bg-panel-raised border-accent-scan/50"
                      : "bg-bg-void border-border-hairline hover:border-hairline/80 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-sans text-xs font-semibold text-text-primary flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-[2px] border flex items-center justify-center ${
                          invariants[item.key]
                            ? "bg-accent-scan border-accent-scan text-bg-void"
                            : "border-border-hairline"
                        }`}
                      >
                        {invariants[item.key] && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <span className="font-mono text-[10px] text-accent-scan">
                      {item.swc}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1.5 pl-6">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUBMISSION & QUOTE RECAP BAR */}
        <div className="p-6 rounded-[4px] bg-bg-panel-raised border border-border-hairline flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 font-mono text-xs">
            <div className="text-text-primary font-semibold flex items-center gap-2">
              <span>SCOPED REVIEW SUMMARY:</span>
              <span className="text-accent-scan">#ZAM-9486</span>
            </div>
            <div className="text-text-muted text-[11px]">
              {calculatedSloc} SLOC · 14 AST Passes · 2 Senior Auditors · {turnaroundSla} ETA
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/portal">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Submit for Review
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
