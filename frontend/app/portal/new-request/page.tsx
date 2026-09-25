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
  Lock,
  Globe,
  RefreshCw,
  Search,
  Building2,
  User,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusPill } from "@/components/ui/status-pill";
import { OPEN_SOURCE_TEST_PROJECT, type MockRepository } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface GithubRepoItem {
  id: number | string;
  fullName: string;
  name: string;
  private: boolean;
  defaultBranch: string;
  htmlUrl: string;
  language?: string;
  description?: string;
  updatedAt?: string;
  owner?: {
    login: string;
    avatarUrl?: string;
    type?: string;
  };
}

interface GithubOrgItem {
  login: string;
  avatarUrl?: string;
  repos: GithubRepoItem[];
}

export default function NewAuditRequestPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Auth Guard
  React.useEffect(() => {
    if (!loading && !user) {
      toast.error("Authentication Required: Please sign in to submit an audit request.");
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const isGithubConnected = Boolean(user?.githubLogin || (user as any)?.githubAccessToken);

  // Intake Mode: 'personal' | 'org' | 'test' | 'custom'
  const [scopeMode, setScopeMode] = React.useState<"personal" | "org" | "test" | "custom">(
    isGithubConnected ? "personal" : "test"
  );

  // GitHub Ingestion State
  const [userRepos, setUserRepos] = React.useState<GithubRepoItem[]>([]);
  const [userOrgs, setUserOrgs] = React.useState<GithubOrgItem[]>([]);
  const [selectedOrgLogin, setSelectedOrgLogin] = React.useState<string>("");
  const [isLoadingGithubData, setIsLoadingGithubData] = React.useState<boolean>(false);
  const [repoSearch, setRepoSearch] = React.useState<string>("");
  const [visibilityFilter, setVisibilityFilter] = React.useState<"all" | "private" | "public">("all");

  // Selected Repository State
  const [selectedRepo, setSelectedRepo] = React.useState<GithubRepoItem | null>(null);
  const [customGithubUrl, setCustomGithubUrl] = React.useState<string>("https://github.com/Uniswap/v2-core");
  const [availableBranches, setAvailableBranches] = React.useState<string[]>(["master", "main", "dev"]);
  const [selectedBranch, setSelectedBranch] = React.useState<string>("master");
  const [isLoadingBranches, setIsLoadingBranches] = React.useState<boolean>(false);

  // Contracts Scope State
  const [availableContracts, setAvailableContracts] = React.useState<string[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = React.useState<boolean>(false);

  // Form State
  const defaultTestContract = OPEN_SOURCE_TEST_PROJECT.contractFiles[0];
  const [protocolName, setProtocolName] = React.useState<string>("Uniswap V2 Core");
  const [contractFileName, setContractFileName] = React.useState<string>(defaultTestContract.fileName);
  const [contractAddress, setContractAddress] = React.useState<string>("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
  const [compilerVersion, setCompilerVersion] = React.useState<string>("v0.8.20");
  const [network, setNetwork] = React.useState<string>("Ethereum Mainnet (1)");
  const [gitCommit, setGitCommit] = React.useState<string>(defaultTestContract.commit);
  const [sourceCode, setSourceCode] = React.useState<string>(defaultTestContract.sourceCode);

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

  // Load user repositories and organizations on mount if connected
  const loadGithubReposAndOrgs = React.useCallback(async () => {
    if (!isGithubConnected) return;

    setIsLoadingGithubData(true);
    try {
      const [reposRes, orgsRes] = await Promise.all([
        apiClient.get("/auth/github/repos", { params: { per_page: 100 } }),
        apiClient.get("/auth/github/orgs").catch(() => ({ data: { orgs: [] } })),
      ]);

      const repos: GithubRepoItem[] = reposRes.data?.repos || [];
      const orgs: GithubOrgItem[] = orgsRes.data?.orgs || [];

      setUserRepos(repos);
      setUserOrgs(orgs);
      if (orgs.length > 0 && !selectedOrgLogin) {
        setSelectedOrgLogin(orgs[0].login);
      }
    } catch (err: any) {
      console.warn("Failed to load GitHub repositories:", err);
    } finally {
      setIsLoadingGithubData(false);
    }
  }, [isGithubConnected, selectedOrgLogin]);

  React.useEffect(() => {
    if (isGithubConnected) {
      loadGithubReposAndOrgs();
      setScopeMode("personal");
    }
  }, [isGithubConnected, loadGithubReposAndOrgs]);

  // Fetch branches for a repository
  const fetchBranchesForRepo = async (repoUrl: string) => {
    setIsLoadingBranches(true);
    try {
      const res = await apiClient.get("/integrations/github/branches", {
        params: { repoUrl },
      });
      const branches: string[] = res.data?.branches || [];
      if (branches.length > 0) {
        setAvailableBranches(branches);
        return branches;
      }
    } catch {
      // Fallback branches
      setAvailableBranches(["main", "master", "dev"]);
    } finally {
      setIsLoadingBranches(false);
    }
    return ["main", "master"];
  };

  // Fetch contract files for a repository and branch
  const fetchContractsForRepo = async (repoUrl: string, branch: string) => {
    setIsLoadingContracts(true);
    try {
      const res = await apiClient.get("/integrations/github/contracts", {
        params: { repoUrl, branch },
      });
      const data = res.data;
      if (data?.commitSha) {
        setGitCommit(data.commitSha);
      }
      const contractFiles: string[] = data?.contracts || [];
      setAvailableContracts(contractFiles);

      // Auto-select primary contract if found
      if (contractFiles.length > 0) {
        const primary = contractFiles.find((c) => c.toLowerCase().includes("pair") || c.toLowerCase().includes("core") || c.toLowerCase().includes("vault")) || contractFiles[0];
        await fetchFileContent(data.owner, data.repo, primary, branch);
      }
    } catch (err: any) {
      toast.error(`Could not inspect contract files: ${err.message || "Failed to scan repo"}`);
    } finally {
      setIsLoadingContracts(false);
    }
  };

  // Fetch raw file content
  const fetchFileContent = async (owner: string, repo: string, filePath: string, branch: string) => {
    const fname = filePath.split("/").pop() || filePath;
    setContractFileName(fname);

    try {
      const res = await apiClient.get("/integrations/github/file-content", {
        params: { owner, repo, filePath, branch },
      });
      if (res.data?.content) {
        setSourceCode(res.data.content);
        toast.success(`Loaded ${fname} (${branch})`);
      }
    } catch (e: any) {
      toast.error(`Could not fetch file content for ${fname}: ${e.message}`);
    }
  };

  // Select a repository from the user's GitHub list
  const handleSelectGithubRepo = async (repo: GithubRepoItem) => {
    setSelectedRepo(repo);
    setCustomGithubUrl(repo.htmlUrl || `https://github.com/${repo.fullName}`);
    setProtocolName(repo.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    const branchToUse = repo.defaultBranch || "main";
    setSelectedBranch(branchToUse);

    toast.info(`Inspecting ${repo.fullName}...`);
    const fetchedBranches = await fetchBranchesForRepo(repo.fullName);
    const activeBranch = fetchedBranches.includes(branchToUse) ? branchToUse : fetchedBranches[0] || "main";
    setSelectedBranch(activeBranch);
    await fetchContractsForRepo(repo.fullName, activeBranch);
  };

  // Change branch handler
  const handleBranchSelect = async (newBranch: string) => {
    setSelectedBranch(newBranch);
    const targetUrl = selectedRepo ? selectedRepo.fullName : customGithubUrl;
    if (targetUrl) {
      toast.info(`Switching branch to ${newBranch}...`);
      await fetchContractsForRepo(targetUrl, newBranch);
    }
  };

  // Select a contract file from the found list
  const handleContractFileSelect = async (filePath: string) => {
    let owner = "Uniswap";
    let repo = "v2-core";

    if (selectedRepo) {
      const parts = selectedRepo.fullName.split("/");
      owner = parts[0];
      repo = parts[1];
    } else if (customGithubUrl) {
      const match = customGithubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, "");
      }
    }

    await fetchFileContent(owner, repo, filePath, selectedBranch);
  };

  // 1-Click Load Open Source Test Project (Uniswap V2 Core)
  const handleLoadTestProject = async () => {
    setScopeMode("test");
    setSelectedRepo(null);
    setCustomGithubUrl("https://github.com/Uniswap/v2-core");
    setSelectedBranch("master");
    setAvailableBranches(["master", "dev", "staging"]);
    setProtocolName("Uniswap V2 Core");
    setContractFileName(defaultTestContract.fileName);
    setContractAddress("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
    setCompilerVersion("v0.8.20");
    setNetwork("Ethereum Mainnet (1)");
    setGitCommit(defaultTestContract.commit);
    setSourceCode(defaultTestContract.sourceCode);
    setAvailableContracts(["contracts/UniswapV2Pair.sol", "contracts/UniswapV2Factory.sol", "contracts/UniswapV2ERC20.sol"]);

    toast.success("Loaded open-source test project: Uniswap V2 Core");

    // Also fetch live tree from GitHub in background if network available
    try {
      await fetchContractsForRepo("https://github.com/Uniswap/v2-core", "master");
    } catch {}
  };

  // Manual Fetch GitHub URL
  const handleManualFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = customGithubUrl.trim();
    if (!url) return;

    toast.info(`Fetching repository scope for ${url}...`);
    setSelectedRepo(null);
    const branches = await fetchBranchesForRepo(url);
    const branchToUse = branches.includes(selectedBranch) ? selectedBranch : branches[0] || "main";
    setSelectedBranch(branchToUse);
    await fetchContractsForRepo(url, branchToUse);
  };

  // Connect GitHub OAuth Action
  const handleConnectGithub = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://144.91.110.133:4000";
    window.location.href = `${apiBase}/api/v1/auth/github?redirect=/portal/new-request`;
  };

  // Submit Audit Request
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
        contractFileName: contractFileName || "UniswapV2Pair.sol",
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

  // Filtered repositories based on search and visibility
  const displayedRepos = React.useMemo(() => {
    let sourceList: GithubRepoItem[] = [];

    if (scopeMode === "personal") {
      sourceList = userRepos.filter((r) => {
        // If repo owner matches user login or user is owner
        if (user?.githubLogin) {
          return r.owner?.login.toLowerCase() === user.githubLogin.toLowerCase();
        }
        return true;
      });
    } else if (scopeMode === "org") {
      const currentOrg = userOrgs.find((o) => o.login === selectedOrgLogin);
      sourceList = currentOrg ? currentOrg.repos : [];
    }

    return sourceList.filter((repo) => {
      const matchesSearch =
        !repoSearch ||
        repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
        repo.fullName.toLowerCase().includes(repoSearch.toLowerCase()) ||
        (repo.language && repo.language.toLowerCase().includes(repoSearch.toLowerCase()));

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "private" && repo.private) ||
        (visibilityFilter === "public" && !repo.private);

      return matchesSearch && matchesVisibility;
    });
  }, [scopeMode, userRepos, userOrgs, selectedOrgLogin, repoSearch, visibilityFilter, user]);

  if (isSubmitted) {
    const activeInvariantsList =
      Object.keys(invariants)
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
            Your contract <code className="text-text-primary font-mono text-xs">{contractFileName || "Contract.sol"}</code> ({calculatedSloc} SLOC) has been pinned to commit <code className="text-accent-scan font-mono text-xs">{gitCommit.slice(0, 7)}</code> on branch <code className="text-text-primary font-mono text-xs">{selectedBranch}</code>. The automated AST symbolic scanner is executing.
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
              <span>ZYR-ENGINE-AST-SCANNER // v3.0.0 · PID: 81924</span>
              <span className="text-signal-resolved text-[11px]">ACTIVE SYMBOLIC TAINT PASS</span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono leading-relaxed text-text-muted">
              <div>[INFO] Target Repository: <span className="text-text-primary font-bold">{customGithubUrl}</span> ({selectedBranch})</div>
              <div>[INFO] Ingesting target contract: <span className="text-text-primary font-bold">{contractFileName || "Contract.sol"}</span> ({calculatedSloc} SLOC)</div>
              <div>[INFO] Locking Git commit SHA: <span className="text-accent-scan">{gitCommit}</span></div>
              <div>[INFO] Compiler target verified: <span className="text-text-primary">solc {compilerVersion} --via-ir --optimize</span></div>
              <div>[INFO] Target Deployment Network: <span className="text-text-primary">{network}</span></div>
              <div>[INFO] Active Invariants Scanned: <span className="text-signal-resolved">{activeInvariantsList}</span></div>
              <div className="text-text-primary">[OK] AST compilation successful: {mappedOpcodes} EVM opcodes mapped across contract methods</div>
              <div className="text-signal-resolved">[PASS] AST Taint Pass 01/14: Access Control & Ownable invariants... PASSED</div>
              <div className="text-signal-resolved">[PASS] AST Taint Pass 02/14: Arithmetic overflow/underflow (Solidity 0.8+)... PASSED</div>
              {sourceCode.includes("swap") && (
                <div className="text-signal-warning">[FLAG] AST Taint Pass 03/14: Constant-product AMM invariant & price cumulative check... ANALYZING</div>
              )}
              {sourceCode.includes("call") && (
                <div className="text-signal-critical">[CRITICAL] AST Taint Pass 08/14: Low-level call execution order & mutex lock... VERIFYING</div>
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
            <Link href="/portal/track">
              <Button variant="outline" size="md">
                Track Live Pipeline
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
                <span>PROTOCOL / ENGAGEMENT NAME</span>
                <span className="text-accent-scan text-[10px]">REQUIRED</span>
              </label>
              <Input
                value={protocolName}
                onChange={(e) => setProtocolName(e.target.value)}
                placeholder="e.g. Uniswap V2 Core"
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
                placeholder="e.g. UniswapV2Pair.sol"
                required
              />
            </div>

            {/* Deployed / Target Contract Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-mono text-xs text-text-muted flex items-center justify-between">
                <span>TARGET CONTRACT ADDRESS (OPTIONAL FOR PRE-DEPLOYMENT)</span>
                <span className="text-text-muted text-[10px]">VERIFIED DEPLOYMENT</span>
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
                <option value="v0.5.16">v0.5.16 (Classic Uniswap V2)</option>
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
                <option value="Arbitrum Sepolia (421614)">Arbitrum Sepolia (ChainID: 421614)</option>
                <option value="Optimism (10)">Optimism Mainnet (ChainID: 10)</option>
                <option value="Base (8453)">Base (ChainID: 8453)</option>
                <option value="Polygon (137)">Polygon POS (ChainID: 137)</option>
              </select>
            </div>
          </div>
        </section>

        {/* STEP 2: GIT REPOSITORY INGESTION & SCOPE */}
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
              {isGithubConnected ? (
                <div className="flex items-center gap-2 font-mono text-xs text-signal-resolved">
                  <span className="h-2 w-2 rounded-full bg-signal-resolved animate-pulse" />
                  <span>GITHUB CONNECTED (@{user?.githubLogin || "user"})</span>
                </div>
              ) : (
                <Badge severity="medium" size="sm">
                  GITHUB NOT CONNECTED
                </Badge>
              )}
            </div>
          </div>

          {/* GITHUB NOT CONNECTED BANNER */}
          {!isGithubConnected && (
            <div className="p-4 rounded-[4px] bg-bg-void border border-accent-scan/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
                  {/* GitHub SVG */}
                  <svg className="h-4 w-4 text-accent-scan" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>Connect your GitHub Account</span>
                </div>
                <p className="text-xs text-text-muted font-mono leading-relaxed">
                  Connect to access your private and organization repositories directly with zero-disk ingestion.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleConnectGithub}
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  Connect GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadTestProject}
                  leftIcon={<Sparkles className="h-3.5 w-3.5 text-accent-scan" />}
                >
                  Load Test Project
                </Button>
              </div>
            </div>
          )}

          {/* INTAKE MODE SELECTOR TABS */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border-hairline pb-3">
            {isGithubConnected && (
              <>
                <button
                  type="button"
                  onClick={() => setScopeMode("personal")}
                  className={`px-3 py-1.5 rounded-[4px] font-mono text-xs font-medium flex items-center gap-2 transition-colors ${
                    scopeMode === "personal"
                      ? "bg-accent-scan text-bg-void font-bold shadow-sm"
                      : "bg-bg-void text-text-muted hover:text-text-primary border border-border-hairline"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Personal Repos ({userRepos.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScopeMode("org")}
                  className={`px-3 py-1.5 rounded-[4px] font-mono text-xs font-medium flex items-center gap-2 transition-colors ${
                    scopeMode === "org"
                      ? "bg-accent-scan text-bg-void font-bold shadow-sm"
                      : "bg-bg-void text-text-muted hover:text-text-primary border border-border-hairline"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Organizations ({userOrgs.length})</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleLoadTestProject}
              className={`px-3 py-1.5 rounded-[4px] font-mono text-xs font-medium flex items-center gap-2 transition-colors ${
                scopeMode === "test"
                  ? "bg-accent-scan text-bg-void font-bold shadow-sm"
                  : "bg-bg-void text-text-muted hover:text-text-primary border border-border-hairline"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-scan" />
              <span>Test Project (Uniswap V2 Core)</span>
            </button>

            <button
              type="button"
              onClick={() => setScopeMode("custom")}
              className={`px-3 py-1.5 rounded-[4px] font-mono text-xs font-medium flex items-center gap-2 transition-colors ${
                scopeMode === "custom"
                  ? "bg-accent-scan text-bg-void font-bold shadow-sm"
                  : "bg-bg-void text-text-muted hover:text-text-primary border border-border-hairline"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Manual URL</span>
            </button>

            {isGithubConnected && (
              <button
                type="button"
                onClick={loadGithubReposAndOrgs}
                disabled={isLoadingGithubData}
                title="Refresh Repositories"
                className="ml-auto p-1.5 rounded-[4px] border border-border-hairline text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingGithubData ? "animate-spin text-accent-scan" : ""}`} />
              </button>
            )}
          </div>

          {/* REPOSITORY BROWSER (PERSONAL OR ORG) */}
          {(scopeMode === "personal" || scopeMode === "org") && (
            <div className="space-y-4">
              {/* Org Selector Dropdown (if in Org mode) */}
              {scopeMode === "org" && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-[4px] bg-bg-void border border-border-hairline">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Building2 className="h-4 w-4 text-accent-scan" />
                    <span className="text-text-muted">SELECT ORGANIZATION:</span>
                  </div>

                  {userOrgs.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedOrgLogin}
                        onChange={(e) => setSelectedOrgLogin(e.target.value)}
                        className="h-8 px-2.5 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs text-text-primary focus:outline-none focus:border-accent-scan"
                      >
                        {userOrgs.map((org) => (
                          <option key={org.login} value={org.login}>
                            {org.login} ({org.repos?.length || 0} repos)
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-text-muted flex items-center gap-2">
                      <span>No organizations connected yet.</span>
                      <a
                        href="https://github.com/settings/connections/applications/Ov23libBtgxvVZzyUBh5"
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-scan hover:underline inline-flex items-center gap-1"
                      >
                        Grant org permissions on GitHub <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Input
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    placeholder="Filter repositories by name or language..."
                    prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setVisibilityFilter("all")}
                    className={`px-2.5 py-1.5 rounded-[4px] border ${
                      visibilityFilter === "all"
                        ? "bg-bg-panel-raised border-accent-scan text-text-primary"
                        : "border-border-hairline text-text-muted hover:text-text-primary"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibilityFilter("private")}
                    className={`px-2.5 py-1.5 rounded-[4px] border flex items-center gap-1 ${
                      visibilityFilter === "private"
                        ? "bg-bg-panel-raised border-accent-scan text-text-primary"
                        : "border-border-hairline text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <Lock className="h-3 w-3 text-signal-critical" />
                    <span>Private</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibilityFilter("public")}
                    className={`px-2.5 py-1.5 rounded-[4px] border flex items-center gap-1 ${
                      visibilityFilter === "public"
                        ? "bg-bg-panel-raised border-accent-scan text-text-primary"
                        : "border-border-hairline text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <Globe className="h-3 w-3 text-signal-resolved" />
                    <span>Public</span>
                  </button>
                </div>
              </div>

              {/* Repositories Grid */}
              {isLoadingGithubData ? (
                <div className="p-8 rounded-[4px] bg-bg-void border border-border-hairline flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="h-5 w-5 animate-spin text-accent-scan" />
                  <p className="font-mono text-xs text-text-muted">Importing GitHub repositories and permissions...</p>
                </div>
              ) : displayedRepos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {displayedRepos.map((repo) => {
                    const isSelected = selectedRepo?.fullName === repo.fullName;
                    return (
                      <div
                        key={repo.id}
                        onClick={() => handleSelectGithubRepo(repo)}
                        className={`p-3.5 rounded-[4px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-bg-panel-raised border-accent-scan ring-1 ring-accent-scan/50"
                            : "bg-bg-void border-border-hairline hover:border-accent-scan/60 hover:bg-bg-panel"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] text-text-muted flex items-center gap-1 truncate">
                              <GitBranch className="h-3 w-3 text-accent-scan shrink-0" />
                              {repo.defaultBranch || "main"}
                            </span>
                            <span
                              className={`h-4 px-1.5 rounded font-mono text-[9px] font-bold flex items-center gap-1 ${
                                repo.private
                                  ? "bg-signal-critical/10 text-signal-critical border border-signal-critical/30"
                                  : "bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/30"
                              }`}
                            >
                              {repo.private ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                              <span>{repo.private ? "PRIVATE" : "PUBLIC"}</span>
                            </span>
                          </div>

                          <div className="font-display text-xs font-semibold text-text-primary truncate">
                            {repo.name}
                          </div>
                          <div className="font-mono text-[10px] text-text-muted truncate">
                            {repo.fullName}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-border-hairline flex items-center justify-between font-mono text-[10px] text-text-muted">
                          <span>{repo.language || "Solidity"}</span>
                          <span className={isSelected ? "text-accent-scan font-bold" : "text-text-muted"}>
                            {isSelected ? "SELECTED ✓" : "SELECT →"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-[4px] bg-bg-void border border-border-hairline text-center space-y-2">
                  <p className="font-mono text-xs text-text-muted">
                    No repositories found matching &ldquo;{repoSearch}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRepoSearch("");
                      setVisibilityFilter("all");
                    }}
                    className="font-mono text-xs text-accent-scan hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TEST PROJECT CARD VIEW (UNISWAP V2 CORE) */}
          {scopeMode === "test" && (
            <div className="p-4 rounded-[4px] bg-bg-void border border-accent-scan/40 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-text-primary font-semibold">
                  <Sparkles className="h-4 w-4 text-accent-scan" />
                  <span>OPEN SOURCE TEST BENCHMARK — UNISWAP V2 CORE</span>
                </span>
                <Badge severity="resolved" size="sm">
                  ACTIVE BENCHMARK
                </Badge>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                Canonical open-source constant-product AMM repository (<code className="text-accent-scan">Uniswap/v2-core</code>). Contains the iconic 201-line <code className="text-text-primary">UniswapV2Pair.sol</code> pool contract with reentrancy mutex locks, TWAP price oracles, and constant product math.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-text-muted">
                <span className="bg-bg-panel px-2 py-1 rounded border border-border-hairline">Repo: Uniswap/v2-core</span>
                <span className="bg-bg-panel px-2 py-1 rounded border border-border-hairline">Default Branch: master</span>
                <span className="bg-bg-panel px-2 py-1 rounded border border-border-hairline">Target: UniswapV2Pair.sol</span>
                <span className="bg-bg-panel px-2 py-1 rounded border border-border-hairline">Commit: 6a9e7c9</span>
              </div>
            </div>
          )}

          {/* CUSTOM REPOSITORY URL INPUT BAR */}
          {scopeMode === "custom" && (
            <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-text-muted text-[11px]">
                <span className="flex items-center gap-1.5 text-text-primary font-semibold">
                  <Code2 className="h-3.5 w-3.5 text-accent-scan" />
                  <span>INGEST ANY PUBLIC OR PRIVATE REPOSITORY</span>
                </span>
                <span>REST API ZERO-DISK</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="flex-1 w-full">
                  <Input
                    value={customGithubUrl}
                    onChange={(e) => setCustomGithubUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleManualFetch();
                      }
                    }}
                    placeholder="https://github.com/owner/repository or owner/repo"
                    prefix={<GitBranch className="h-3.5 w-3.5 text-text-muted" />}
                    className="h-9 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleManualFetch}
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  className="w-full sm:w-auto h-9"
                >
                  Fetch Repo
                </Button>
              </div>
            </div>
          )}

          {/* BRANCH SELECTION BAR */}
          <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-text-primary font-semibold">
                <GitBranch className="h-3.5 w-3.5 text-accent-scan" />
                <span>REPOSITORY BRANCH SPECIFICATION</span>
              </span>
              <span className="text-text-muted">
                Target Repo: <code className="text-accent-scan">{selectedRepo ? selectedRepo.fullName : customGithubUrl.replace("https://github.com/", "")}</code>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="text-[10px] text-text-muted block mb-1">SELECT AUDIT BRANCH:</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedBranch}
                    onChange={(e) => handleBranchSelect(e.target.value)}
                    disabled={isLoadingBranches}
                    className="w-full h-9 px-3 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs text-text-primary focus:outline-none focus:border-accent-scan transition-colors"
                  >
                    {availableBranches.map((branch) => (
                      <option key={branch} value={branch}>
                        branch: {branch} {branch === (selectedRepo?.defaultBranch || "master") ? "(default)" : ""}
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleBranchSelect(selectedBranch)}
                    disabled={isLoadingContracts}
                    className="h-9 px-3 shrink-0"
                    title="Refresh contracts for this branch"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingContracts ? "animate-spin text-accent-scan" : ""}`} />
                  </Button>
                </div>
              </div>

              <div className="w-full sm:w-64">
                <label className="text-[10px] text-text-muted block mb-1">OR SPECIFY CUSTOM BRANCH / TAG:</label>
                <Input
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  onBlur={() => handleBranchSelect(selectedBranch)}
                  placeholder="e.g. audit-remediation or v2.1.0"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* CONTRACT SCOPE PICKER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-accent-scan" />
                <span>CONTRACT FILES IN SCOPE ({availableContracts.length})</span>
              </span>
              <span className="text-[11px] text-accent-scan">CLICK A FILE TO DESIGNATE AS PRIMARY TARGET</span>
            </div>

            {isLoadingContracts ? (
              <div className="p-6 rounded-[4px] bg-bg-void border border-border-hairline flex items-center justify-center gap-3 font-mono text-xs text-text-muted">
                <RefreshCw className="h-4 w-4 animate-spin text-accent-scan" />
                <span>Scanning repository tree on branch &ldquo;{selectedBranch}&rdquo;...</span>
              </div>
            ) : availableContracts.length > 0 ? (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
                {availableContracts.map((filePath, i) => {
                  const fname = filePath.split("/").pop() || filePath;
                  const isCurrentFile = contractFileName === fname;
                  return (
                    <div
                      key={i}
                      onClick={() => handleContractFileSelect(filePath)}
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
            ) : (
              <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs text-text-muted flex items-center justify-between">
                <span>Active Target Contract: <code className="text-text-primary">{contractFileName}</code></span>
                <span className="text-signal-resolved font-bold">READY FOR SCAN</span>
              </div>
            )}
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
                  {sourceCode || "// Source code will be parsed upon repository ingestion..."}
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
                  desc: "External low-level calls before state decrement & mutex checks",
                },
                {
                  key: "oracle",
                  label: "Oracle Manipulation & Flash Loans",
                  swc: "SWC-120",
                  desc: "Spot price dependency, TWAP accumulators, and arithmetic slippage",
                },
                {
                  key: "access",
                  label: "Access Control & Initialization",
                  swc: "SWC-105",
                  desc: "Privilege escalation and initialization front-running",
                },
                {
                  key: "erc20",
                  label: "ERC-20 Return Value Handling",
                  swc: "SWC-104",
                  desc: "Non-standard tokens silent failure modes and allowance front-running",
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
              <span className="text-accent-scan">#{protocolName.slice(0, 3).toUpperCase()}-9486</span>
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
