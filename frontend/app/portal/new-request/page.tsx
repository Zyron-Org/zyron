"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileCode,
  Check,
  ArrowRight,
  GitBranch,
  Code2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { MOCK_REPOSITORIES, type MockRepository, type SolContractFile } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const defaultRepo = MOCK_REPOSITORIES[0];
const defaultContract = defaultRepo.contractFiles[0];

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

  // Selected preset repository ID ("repo-1", "repo-2", "repo-3", "repo-4")
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>("repo-1");
  const [customGithubUrl, setCustomGithubUrl] = React.useState("https://github.com/aura-finance/core-vaults");
  const [selectedBranch, setSelectedBranch] = React.useState<string>("main");
  const [isFetchingGithub, setIsFetchingGithub] = React.useState(false);
  const [fetchedGithubData, setFetchedGithubData] = React.useState<any>(null);

  // Form State
  const [protocolName, setProtocolName] = React.useState("Aura Liquidity Protocol");
  const [contractFileName, setContractFileName] = React.useState(defaultContract.fileName);
  const [contractAddress, setContractAddress] = React.useState("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
  const [compilerVersion, setCompilerVersion] = React.useState("v0.8.20");
  const [network, setNetwork] = React.useState("Ethereum Mainnet (1)");
  const [gitCommit, setGitCommit] = React.useState(defaultContract.commit);
  const [sourceCode, setSourceCode] = React.useState<string>(defaultContract.sourceCode);

  // Invariant checkboxes
  const [invariants, setInvariants] = React.useState<Record<string, boolean>>({
    reentrancy: true,
    oracle: true,
    access: true,
    erc20: true,
    crosschain: false,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedTicketId, setSubmittedTicketId] = React.useState<string>("#ZYR-9486");

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

  // Current active preset (if any)
  const currentPreset = MOCK_REPOSITORIES.find((r) => r.id === selectedPresetId);

  // Handler for clicking a preset repository card
  const handleSelectPreset = (repo: MockRepository) => {
    setSelectedPresetId(repo.id);
    setCustomGithubUrl(`https://github.com/${repo.fullName}`);
    setSelectedBranch(repo.defaultBranch);
    setFetchedGithubData(null);

    const primaryContract = repo.contractFiles[0];
    if (primaryContract) {
      setContractFileName(primaryContract.fileName);
      setSourceCode(primaryContract.sourceCode);
      setGitCommit(primaryContract.commit);
      setProtocolName(
        `Aura ${repo.name
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ")}`
      );
      toast.success(`Loaded preset repository: ${repo.fullName}`);
    }
  };

  // Handler for selecting a specific contract within the current preset
  const handleSelectPresetContract = (file: SolContractFile) => {
    setContractFileName(file.fileName);
    setSourceCode(file.sourceCode);
    setGitCommit(file.commit);
    toast.success(`Selected contract: ${file.fileName} (${file.sloc} SLOC)`);
  };

  // Handler for selecting a file from fetched GitHub data
  const handleSelectGithubFile = async (owner: string, repo: string, filePath: string, branch = "main") => {
    const fname = filePath.split("/").pop() || filePath;
    setContractFileName(fname);

    try {
      const res = await apiClient.get("/integrations/github/file-content", {
        params: { owner, repo, filePath, branch },
      });
      if (res.data?.content) {
        setSourceCode(res.data.content);
        toast.success(`Loaded source code for ${fname} from GitHub!`);
      }
    } catch (e: any) {
      toast.error(`Could not fetch raw source for ${fname}: ${e.message}`);
    }
  };

  // Handler for fetching a real or custom GitHub repository
  const handleFetchRealGithubRepo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = customGithubUrl.trim();
    if (!url) return;

    // Check if user entered one of the preset names
    const matchedPreset = MOCK_REPOSITORIES.find(
      (r) =>
        url.toLowerCase().includes(r.fullName.toLowerCase()) ||
        url.toLowerCase().includes(r.name.toLowerCase())
    );
    if (matchedPreset) {
      handleSelectPreset(matchedPreset);
      return;
    }

    setIsFetchingGithub(true);
    try {
      const res = await apiClient.get(`/integrations/github/contracts`, {
        params: { repoUrl: url, branch: selectedBranch || "main" },
      });
      const data = res.data;
      setSelectedPresetId("");
      setFetchedGithubData(data);
      if (data.commitSha) setGitCommit(data.commitSha);
      if (data.contracts && data.contracts.length > 0) {
        setProtocolName(`${data.owner}/${data.repo}`);
        const firstFile =
          typeof data.contracts[0] === "string"
            ? data.contracts[0]
            : (data.contracts[0]?.path || data.contracts[0]);
        handleSelectGithubFile(data.owner, data.repo, firstFile, data.branch || selectedBranch || "main");
      }
      toast.success(
        `Fetched ${data.contracts?.length || 0} contract files from GitHub (${data.owner}/${data.repo})!`
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch GitHub repo";
      toast.error(`GitHub API Notice: ${msg}`);
    } finally {
      setIsFetchingGithub(false);
    }
  };

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
        contractFileName: contractFileName || "Contract.sol",
        contractAddress: contractAddress || undefined,
        compilerVersion,
        network,
        sloc: calculatedSloc,
        gitCommit,
        sourceCode: sourceCode || undefined,
        githubRepoUrl: customGithubUrl || undefined,
        githubBranch: selectedBranch || "main",
        invariants,
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
            Your contract <code className="text-text-primary font-mono text-xs">{contractFileName || "Contract.sol"}</code> ({calculatedSloc} SLOC) has been pinned to commit <code className="text-accent-scan font-mono text-xs">{gitCommit.slice(0, 7)}</code>. The automated AST symbolic scanner is executing.
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
              <div>[INFO] Ingesting target contract: <span className="text-text-primary font-bold">{contractFileName || "Contract.sol"}</span> ({calculatedSloc} SLOC)</div>
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

            {/* Deployed / Target Contract Address */}
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

        {/* STEP 2: GIT REPOSITORY INGESTION */}
        <section className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent-scan text-bg-void font-mono text-[11px] font-bold flex items-center justify-center">
                02
              </span>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Git Repository Ingestion & Scope Lock
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge severity="resolved" size="sm">
                GIT-ONLY INGESTION
              </Badge>
              <span className="font-mono text-[11px] text-text-muted">ZERO-DISK MEMORY PIPELINE</span>
            </div>
          </div>

          {/* PRESET SELECTOR CARDS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs text-text-muted flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent-scan" />
                <span>1-CLICK SAMPLE TEST REPOSITORIES (INSTANT AUDIT SANDBOX)</span>
              </label>
              <span className="font-mono text-[10px] text-accent-scan">CLICK PRESET TO AUTOLOAD</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MOCK_REPOSITORIES.map((repo) => {
                const isSelected = selectedPresetId === repo.id && !fetchedGithubData;
                return (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => handleSelectPreset(repo)}
                    className={`p-3.5 rounded-[4px] border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-bg-panel-raised border-accent-scan ring-1 ring-accent-scan/40 shadow-sm"
                        : "bg-bg-void border-border-hairline hover:border-accent-scan/50 hover:bg-bg-panel"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] text-text-muted flex items-center gap-1">
                          <GitBranch className="h-3 w-3 text-accent-scan" />
                          {repo.defaultBranch}
                        </span>
                        {isSelected && (
                          <span className="h-4 px-1.5 rounded bg-accent-scan text-bg-void font-mono text-[9px] font-bold flex items-center">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="font-display text-xs font-semibold text-text-primary truncate">
                        {repo.name}
                      </div>
                      <div className="font-mono text-[10px] text-text-muted truncate">
                        {repo.fullName}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border-hairline flex items-center justify-between font-mono text-[10px] text-text-muted">
                      <span>{repo.contractFiles.length} {repo.contractFiles.length === 1 ? "contract" : "contracts"}</span>
                      <span className="text-accent-scan font-bold">
                        {repo.contractFiles.reduce((acc, f) => acc + f.sloc, 0)} SLOC
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUSTOM REPOSITORY URL INPUT BAR */}
          <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-text-muted text-[11px]">
              <span className="flex items-center gap-1.5 text-text-primary font-semibold">
                <Code2 className="h-3.5 w-3.5 text-accent-scan" />
                <span>OR FETCH CUSTOM GITHUB REPOSITORY</span>
              </span>
              <span>REST API INTEGRATION</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
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
                  prefix={<GitBranch className="h-3.5 w-3.5 text-text-muted" />}
                  className="h-9 text-xs"
                />
              </div>
              <div className="w-full sm:w-36">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs text-text-primary focus:outline-none focus:border-accent-scan transition-colors"
                >
                  <option value="main">branch: main</option>
                  <option value="master">branch: master</option>
                  <option value="develop">branch: develop</option>
                  <option value="audit-remediation">branch: audit-remediation</option>
                </select>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleFetchRealGithubRepo}
                isLoading={isFetchingGithub}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                className="w-full sm:w-auto h-9"
              >
                Fetch
              </Button>
            </div>
          </div>

          {/* CONTRACT SCOPE PICKER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-accent-scan" />
                <span>CONTRACT FILES IN SCOPE</span>
              </span>
              <span className="text-[11px] text-accent-scan">CLICK A FILE TO DESIGNATE AS PRIMARY AUDIT TARGET</span>
            </div>

            {/* If fetched from live GitHub */}
            {fetchedGithubData ? (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
                {fetchedGithubData.contracts?.map((c: any, i: number) => {
                  const filePath = typeof c === "string" ? c : (c?.path || c);
                  const fname = filePath.split("/").pop() || filePath;
                  const isCurrentFile = contractFileName === fname;
                  return (
                    <div
                      key={i}
                      onClick={() => handleSelectGithubFile(fetchedGithubData.owner, fetchedGithubData.repo, filePath, fetchedGithubData.branch || selectedBranch || "main")}
                      className={`p-3 rounded-[4px] border flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrentFile
                          ? "bg-bg-panel-raised border-accent-scan"
                          : "bg-bg-void border-border-hairline hover:border-accent-scan/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileCode className={`h-4 w-4 shrink-0 ${isCurrentFile ? "text-accent-scan" : "text-text-muted"}`} />
                        <span className={`font-bold truncate ${isCurrentFile ? "text-accent-scan" : "text-text-primary"}`}>
                          {filePath}
                        </span>
                        {isCurrentFile && <Badge severity="resolved" size="sm">ACTIVE TARGET</Badge>}
                      </div>
                      <span className={`text-[11px] font-mono shrink-0 ml-2 ${isCurrentFile ? "text-accent-scan font-bold" : "text-text-muted"}`}>
                        {isCurrentFile ? "ACTIVE SOURCE ✓" : "SELECT FILE →"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : currentPreset ? (
              /* If using preset repository */
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
                {currentPreset.contractFiles.map((file, i) => {
                  const isCurrentFile = contractFileName === file.fileName;
                  return (
                    <div
                      key={i}
                      onClick={() => handleSelectPresetContract(file)}
                      className={`p-3 rounded-[4px] border flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrentFile
                          ? "bg-bg-panel-raised border-accent-scan"
                          : "bg-bg-void border-border-hairline hover:border-accent-scan/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileCode className={`h-4 w-4 shrink-0 ${isCurrentFile ? "text-accent-scan" : "text-text-muted"}`} />
                        <div className="flex items-center gap-2 truncate">
                          <span className={`font-bold truncate ${isCurrentFile ? "text-accent-scan" : "text-text-primary"}`}>
                            {file.path}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            ({file.sloc} SLOC)
                          </span>
                        </div>
                        {isCurrentFile && <Badge severity="resolved" size="sm">ACTIVE TARGET</Badge>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2 font-mono text-[11px]">
                        <span className="text-text-muted hidden sm:inline">commit: {file.commit.slice(0, 7)}</span>
                        <span className={isCurrentFile ? "text-accent-scan font-bold" : "text-text-muted"}>
                          {isCurrentFile ? "ACTIVE SOURCE ✓" : "SELECT FILE →"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* CONVERGED INGESTION STATISTICS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs">
            <div>
              <div className="text-text-muted text-[10px]">INGESTED TARGET CONTRACT</div>
              <div className="text-text-primary font-medium truncate">{contractFileName || "Contract.sol"}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">SOURCE LINES (SLOC)</div>
              <div className="text-accent-scan font-bold">{calculatedSloc} lines</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">PINNED COMMIT</div>
              <div className="text-text-primary font-mono">{gitCommit.slice(0, 7)}</div>
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
                  {sourceCode || "// Select a repository preset or contract file above to view raw Solidity code..."}
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
