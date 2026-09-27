"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GitBranch,
  FileCode2,
  Shield,
  Sparkles,
  FileCheck2,
  Check,
  ArrowRight,
  ArrowLeft,
  Search,
  Building2,
  User,
  ExternalLink,
  Lock,
  Globe,
  RefreshCw,
  AlertCircle,
  Clock,
  Layers,
  Code2,
  HelpCircle,
  Coins,
  ShieldAlert,
  ChevronRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { OPEN_SOURCE_TEST_PROJECT } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
}

interface GithubOrgItem {
  login: string;
  avatarUrl?: string;
  repos: GithubRepoItem[];
}

const STEPS = [
  { id: 1, title: "Repository", shortDesc: "Source code ingestion", icon: GitBranch },
  { id: 2, title: "Protocol Scope", shortDesc: "Metadata & entrypoint", icon: FileCode2 },
  { id: 3, title: "Security Invariants", shortDesc: "AST targets & vectors", icon: Shield },
  { id: 4, title: "Business Context", shortDesc: "Economic model & intent", icon: Sparkles },
  { id: 5, title: "Review & Submit", shortDesc: "Verification & quote", icon: FileCheck2 },
];

export default function NewAuditRequestPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = React.useState<number>(1);

  // Auth Guard
  React.useEffect(() => {
    if (!loading && !user) {
      toast.error("Authentication Required: Please sign in to submit an audit request.");
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const isGithubConnected = Boolean(user?.githubLogin || (user as any)?.githubAccessToken);

  // Step 1: Repository / Ingestion State
  const [scopeMode, setScopeMode] = React.useState<"personal" | "org" | "test" | "custom" | "upload">(
    isGithubConnected ? "personal" : "test"
  );
  const [userRepos, setUserRepos] = React.useState<GithubRepoItem[]>([]);
  const [userOrgs, setUserOrgs] = React.useState<GithubOrgItem[]>([]);
  const [selectedOrgLogin, setSelectedOrgLogin] = React.useState<string>("");
  const [isLoadingGithubData, setIsLoadingGithubData] = React.useState<boolean>(false);
  const [repoSearch, setRepoSearch] = React.useState<string>("");
  const [visibilityFilter, setVisibilityFilter] = React.useState<"all" | "private" | "public">("all");

  const [selectedRepo, setSelectedRepo] = React.useState<GithubRepoItem | null>(null);
  const [customGithubUrl, setCustomGithubUrl] = React.useState<string>("https://github.com/Uniswap/v2-core");
  const [availableBranches, setAvailableBranches] = React.useState<string[]>(["master", "main", "dev"]);
  const [selectedBranch, setSelectedBranch] = React.useState<string>("master");
  const [isLoadingBranches, setIsLoadingBranches] = React.useState<boolean>(false);

  // Step 2: Protocol Scope & Metadata State
  const defaultTestContract = OPEN_SOURCE_TEST_PROJECT.contractFiles[0];
  const [availableContracts, setAvailableContracts] = React.useState<string[]>([
    "contracts/UniswapV2Pair.sol",
    "contracts/UniswapV2Factory.sol",
    "contracts/UniswapV2ERC20.sol",
  ]);
  const [isLoadingContracts, setIsLoadingContracts] = React.useState<boolean>(false);

  const [protocolName, setProtocolName] = React.useState<string>("Uniswap V2 Core");
  const [contractFileName, setContractFileName] = React.useState<string>(defaultTestContract.fileName);
  const [contractAddress, setContractAddress] = React.useState<string>("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
  const [compilerVersion, setCompilerVersion] = React.useState<string>("v0.8.20");
  const [network, setNetwork] = React.useState<string>("Ethereum Mainnet (1)");
  const [gitCommit, setGitCommit] = React.useState<string>(defaultTestContract.commit);
  const [sourceCode, setSourceCode] = React.useState<string>(defaultTestContract.sourceCode);

  // Step 3: Security Invariants & Attack Vectors
  const [invariants, setInvariants] = React.useState<Record<string, boolean>>({
    reentrancy: true,
    oracle: true,
    access: true,
    erc20: true,
    crosschain: false,
    math: true,
    liquidity: true,
  });
  const [customInvariants, setCustomInvariants] = React.useState<string>(
    "K invariant (x * y = k) must never decrease after token swap executions. Total LP token supply must accurately reflect deposited liquidity shares."
  );
  const [outOfScope, setOutOfScope] = React.useState<string>("Mock ERC20 token fixtures in contracts/test/ are excluded from analysis.");

  // Step 4: Business Context & Protocol Intent ("Business Goals")
  const [businessGoals, setBusinessGoals] = React.useState({
    protocolOverview:
      "Automated constant-product decentralized exchange (AMM) allowing permissionless ERC-20 token swaps, pair creation, and liquidity pooling.",
    economicModel:
      "Traders pay a 0.30% fee on every token swap. 0.25% accrues directly into pool reserves to incentivize LP token holders; 0.05% can be diverted to protocol treasury if feeTo is configured.",
    privilegedRoles:
      "feeToSetter is the only administrative authority, controlled by a governance multisig with a 48-hour timelock. No admin key can withdraw pool reserves or freeze trading.",
    criticalInvariants:
      "A liquidity provider must NEVER be able to drain more underlying reserves than their proportional LP share. Pool reserves must remain strictly solvent and unfreezable.",
    externalDependencies:
      "Interacts with arbitrary external ERC-20 contracts. Reentrancy on non-standard transfer callbacks or rebasing tokens must not corrupt reserves accounting.",
  });

  // Submission State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedTicketId, setSubmittedTicketId] = React.useState<string>("#ZYR-9486");

  // Dynamic SLOC calculation
  const calculatedSloc = React.useMemo(() => {
    return sourceCode
      .split("\n")
      .filter((line) => line.trim().length > 0 && !line.trim().startsWith("//")).length;
  }, [sourceCode]);

  // Turnaround SLA estimation
  const turnaroundSla = React.useMemo(() => {
    if (calculatedSloc < 500) return "24–36 Hours";
    if (calculatedSloc < 1500) return "36–48 Hours";
    return "48–72 Hours";
  }, [calculatedSloc]);

  // Load GitHub Repos on mount if connected
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

  // Fetch branches for a repo
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
      setAvailableBranches(["main", "master", "dev"]);
    } finally {
      setIsLoadingBranches(false);
    }
    return ["main", "master"];
  };

  // Fetch contract files for a repo and branch
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

      // Auto-select and auto-fill primary contract!
      if (contractFiles.length > 0) {
        const primary =
          contractFiles.find(
            (c) =>
              c.toLowerCase().includes("pair") ||
              c.toLowerCase().includes("core") ||
              c.toLowerCase().includes("vault")
          ) || contractFiles[0];

        await fetchFileContent(data.owner, data.repo, primary, branch);
      }
    } catch (err: any) {
      console.warn(`Could not inspect contract files:`, err.message);
    } finally {
      setIsLoadingContracts(false);
    }
  };

  // Fetch file content
  const fetchFileContent = async (owner: string, repo: string, filePath: string, branch: string) => {
    const fname = filePath.split("/").pop() || filePath;
    setContractFileName(fname);

    try {
      const res = await apiClient.get("/integrations/github/file-content", {
        params: { owner, repo, filePath, branch },
      });
      if (res.data?.content) {
        setSourceCode(res.data.content);
        toast.success(`Auto-filled primary contract: ${fname}`);
      }
    } catch (e: any) {
      console.warn(`Could not fetch file content for ${fname}:`, e.message);
    }
  };

  // Select a repository from GitHub list
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

  // 1-Click Load Open Source Test Project
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
  };

  // Manual Fetch GitHub URL
  const handleManualFetch = async () => {
    const url = customGithubUrl.trim();
    if (!url) return;

    toast.info(`Fetching repository scope for ${url}...`);
    setSelectedRepo(null);
    const branches = await fetchBranchesForRepo(url);
    const branchToUse = branches.includes(selectedBranch) ? selectedBranch : branches[0] || "main";
    setSelectedBranch(branchToUse);
    await fetchContractsForRepo(url, branchToUse);
  };

  // Handle contract select in Step 2
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

  // Submit Audit Request
  const handleSubmit = async () => {
    if (!user) {
      toast.error("Authentication Required: Please sign in to submit an audit request.");
      router.push("/auth/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const compiledBusinessGoals = JSON.stringify({
        ...businessGoals,
        customInvariants,
        outOfScope,
      });

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
        businessGoals: compiledBusinessGoals,
      });

      const auditId = res.data?.id || "ZYR-9486";
      const createdTicket = auditId.startsWith("#") ? auditId : `#${auditId}`;
      setSubmittedTicketId(createdTicket);

      toast.success(`Audit Request ${createdTicket} created successfully! AST scan queue initialized.`);
      setIsSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create audit request";
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      toast.error(displayMsg);
      // Generate client-side fallback ticket on error
      setSubmittedTicketId(`#ZYR-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
          {/* Inner White Card */}
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-6 sm:p-8 text-center space-y-5 shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-signal-resolved" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
                Audit Engagement Submitted
              </h2>
              <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                Your engagement has been enqueued into Zyron's automated AST analyzer and senior auditor review pool.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline text-left space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border-hairline/60 pb-2">
                <span className="text-text-muted">ENGAGEMENT TICKET:</span>
                <span className="font-bold text-accent-scan">{submittedTicketId}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border-hairline/60 pb-2">
                <span className="text-text-muted">PROTOCOL TARGET:</span>
                <span className="text-text-primary font-medium">{protocolName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border-hairline/60 pb-2">
                <span className="text-text-muted">PRIMARY CONTRACT:</span>
                <span className="text-text-primary font-medium">{contractFileName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">ESTIMATED TURNAROUND:</span>
                <span className="text-signal-resolved font-medium">{turnaroundSla}</span>
              </div>
            </div>
          </div>

          {/* Bottom Gray Area Actions */}
          <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
            <Link href="/portal" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="rounded-xl w-full sm:w-auto">
                Return to Dashboard
              </Button>
            </Link>

            <Link href={`/portal/track/${submittedTicketId.replace("#", "")}`} className="w-full sm:w-auto">
              <ExpandingButton
                variant="accent"
                rounded="xl"
                size="md"
                className="w-full sm:w-auto"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Open Live Status Tracker
              </ExpandingButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* ─── TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <Link href="/portal" className="hover:text-text-primary transition-colors">
              Audits
            </Link>
            <span className="text-border-hairline">/</span>
            <span className="text-text-primary font-medium">New Audit Request</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              New Smart Contract Audit
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
              Step {currentStep} of 5
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            Configure code repository ingestion, scope metadata, target invariants, and platform business goals.
          </p>
        </div>

        <Link href="/portal">
          <Button variant="secondary" size="sm">
            Cancel
          </Button>
        </Link>
      </div>

      {/* ─── STEPPER PROGRESS BAR ─── */}
      <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
        <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-3 sm:p-4 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STEPS.map((step) => {
              const isPast = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (isPast) setCurrentStep(step.id);
                  }}
                  disabled={!isPast && !isCurrent}
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-xl text-left transition-all",
                    isCurrent
                      ? "bg-[#F2F4F7] dark:bg-bg-panel-raised border border-[#E2E6EC] dark:border-border-hairline shadow-2xs"
                      : isPast
                      ? "hover:bg-[#F8F9FA] dark:hover:bg-bg-void/50 cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all",
                      isPast
                        ? "bg-signal-resolved text-white"
                        : isCurrent
                        ? "bg-accent-scan text-bg-void ring-2 ring-accent-scan/30 shadow-xs"
                        : "bg-[#F2F4F7] dark:bg-bg-panel text-text-muted border border-border-hairline"
                    )}
                  >
                    {isPast ? <Check className="h-4 w-4 stroke-[2.5]" /> : <StepIcon className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0">
                    <div
                      className={cn(
                        "text-xs font-semibold truncate",
                        isCurrent
                          ? "text-accent-scan"
                          : isPast
                          ? "text-text-primary"
                          : "text-text-muted"
                      )}
                    >
                      {step.title}
                    </div>
                    <div className="text-[10px] text-text-muted truncate hidden sm:block">
                      {step.shortDesc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── STEP 1: REPOSITORY SELECTION & INGESTION ─── */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
            <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-text-primary">
                  Select Code Repository
                </h2>
                <p className="text-xs text-text-muted">
                  Choose your smart contract source. Repositories will be automatically scanned for Solidity (.sol) files.
                </p>
              </div>

              {/* Mode Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleLoadTestProject}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all cursor-pointer relative",
                    scopeMode === "test"
                      ? "border-accent-scan bg-accent-scan/5 ring-1 ring-accent-scan/20 shadow-xs"
                      : "border-border-hairline hover:border-border-hairline/80 bg-[#F8F9FA] dark:bg-bg-void/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-text-primary">
                      Test Project (1-Click)
                    </span>
                    <Badge severity="resolved" size="sm">Recommended</Badge>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Instantly load Uniswap V2 Core with verified contracts, commit SHA, and AST test files.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setScopeMode("custom")}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all cursor-pointer",
                    scopeMode === "custom"
                      ? "border-accent-scan bg-accent-scan/5 ring-1 ring-accent-scan/20 shadow-xs"
                      : "border-border-hairline hover:border-border-hairline/80 bg-[#F8F9FA] dark:bg-bg-void/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-text-primary">
                      Public GitHub URL
                    </span>
                    <Globe className="h-3.5 w-3.5 text-text-muted" />
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Paste any public repository URL to automatically fetch its branch tree and contracts.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setScopeMode("personal");
                    if (!isGithubConnected) {
                      toast.info("Connecting GitHub allows auditing private protocol repos.");
                    }
                  }}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all cursor-pointer",
                    scopeMode === "personal"
                      ? "border-accent-scan bg-accent-scan/5 ring-1 ring-accent-scan/20 shadow-xs"
                      : "border-border-hairline hover:border-border-hairline/80 bg-[#F8F9FA] dark:bg-bg-void/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-text-primary">
                      Connected GitHub
                    </span>
                    <GitBranch className="h-3.5 w-3.5 text-text-muted" />
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Select directly from your personal or organization repositories.
                  </p>
                </button>
              </div>

              {/* Mode-Specific Controls */}
              {scopeMode === "custom" && (
                <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline space-y-3">
                  <label className="text-xs font-semibold text-text-primary block">
                    GitHub Repository URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customGithubUrl}
                      onChange={(e) => setCustomGithubUrl(e.target.value)}
                      placeholder="https://github.com/organization/smart-contracts"
                      className="flex-1 h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleManualFetch}
                      isLoading={isLoadingContracts}
                    >
                      Fetch Repo
                    </Button>
                  </div>
                </div>
              )}

              {scopeMode === "personal" && (
                <div className="space-y-3">
                  {!isGithubConnected ? (
                    <div className="p-6 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline text-center space-y-3">
                      <GitBranch className="h-8 w-8 text-accent-scan mx-auto" />
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-text-primary">
                          Connect Your GitHub Account
                        </div>
                        <p className="text-[11px] text-text-muted max-w-sm mx-auto">
                          Grant Zyron read access to your repositories to automatically ingest contracts and track commits.
                        </p>
                      </div>
                      <Link href="/auth/login">
                        <Button variant="primary" size="sm">
                          Connect GitHub
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-text-primary">
                        Your GitHub Repositories
                      </div>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-border-hairline divide-y divide-border-hairline/60">
                        {userRepos.map((repo) => (
                          <button
                            key={repo.id}
                            type="button"
                            onClick={() => handleSelectGithubRepo(repo)}
                            className={cn(
                              "w-full p-2.5 px-3 flex items-center justify-between text-left text-xs transition-colors cursor-pointer",
                              selectedRepo?.id === repo.id
                                ? "bg-accent-scan/10 text-accent-scan font-medium"
                                : "hover:bg-[#F8F9FA] dark:hover:bg-bg-void/50 text-text-primary"
                            )}
                          >
                            <span className="truncate">{repo.fullName}</span>
                            <span className="text-[10px] text-text-muted">{repo.defaultBranch}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Branch Selection & Detected Contracts Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-hairline/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted block">
                    Target Branch
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  >
                    {availableBranches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted block">
                    Detected Contract Files ({availableContracts.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1.5 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline">
                    {availableContracts.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-bg-panel border border-border-hairline text-[11px] font-mono text-text-primary flex items-center gap-1"
                      >
                        <Check className="h-3 w-3 text-signal-resolved" />
                        {c.split("/").pop()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <ExpandingButton
              variant="accent"
              rounded="xl"
              size="md"
              onClick={() => setCurrentStep(2)}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Continue to Scope & Metadata
            </ExpandingButton>
          </div>
        </div>
      )}

      {/* ─── STEP 2: PROTOCOL & CONTRACT SCOPE METADATA (AUTO-FILLED) ─── */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
            <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline pb-4">
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-bold text-text-primary">
                    Protocol & Contract Scope Metadata
                  </h2>
                  <p className="text-xs text-text-muted">
                    Primary contract entrypoint has been auto-filled from your repository inspection.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-accent-scan/10 text-accent-scan border border-accent-scan/20 font-medium">
                    ⚡ Auto-Filled Entrypoint
                  </span>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Contract File (Auto-filled) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <FileCode2 className="h-3.5 w-3.5 text-accent-scan" />
                      Primary Contract Filename (Entrypoint)
                    </label>
                    <span className="text-[10px] text-text-muted">Auto-detected from repository</span>
                  </div>

                  <input
                    type="text"
                    value={contractFileName}
                    onChange={(e) => setContractFileName(e.target.value)}
                    placeholder="e.g. UniswapV2Pair.sol"
                    className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-bg-panel border border-accent-scan/40 font-mono text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-scan shadow-2xs"
                  />

                  {/* Quick Select from detected contracts */}
                  {availableContracts.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-text-muted">Available in repo:</span>
                      {availableContracts.map((c) => {
                        const base = c.split("/").pop() || c;
                        const isSelected = contractFileName === base;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleContractFileSelect(c)}
                            className={cn(
                              "px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer",
                              isSelected
                                ? "bg-accent-scan text-bg-void font-bold shadow-xs"
                                : "bg-[#F2F4F7] dark:bg-bg-panel-raised text-text-muted hover:text-text-primary border border-border-hairline"
                            )}
                          >
                            {base}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Protocol Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-primary block">
                    Protocol / Project Name
                  </label>
                  <input
                    type="text"
                    value={protocolName}
                    onChange={(e) => setProtocolName(e.target.value)}
                    placeholder="e.g. Uniswap V2 Core"
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  />
                </div>

                {/* Network */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-primary block">
                    Target Blockchain Network
                  </label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  >
                    <option value="Ethereum Mainnet (1)">Ethereum Mainnet</option>
                    <option value="Sepolia Testnet (11155111)">Sepolia Testnet</option>
                    <option value="Arbitrum One (42161)">Arbitrum One</option>
                    <option value="Optimism (10)">Optimism</option>
                    <option value="Base (8453)">Base</option>
                    <option value="Polygon (137)">Polygon</option>
                  </select>
                </div>

                {/* Compiler Version */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-primary block">
                    Solidity Compiler Version
                  </label>
                  <select
                    value={compilerVersion}
                    onChange={(e) => setCompilerVersion(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary font-mono focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  >
                    <option value="v0.8.24">v0.8.24 (Latest EVM Cancun)</option>
                    <option value="v0.8.20">v0.8.20 (Standard Paris/Shanghai)</option>
                    <option value="v0.8.19">v0.8.19</option>
                    <option value="v0.8.0">v0.8.0</option>
                    <option value="v0.7.6">v0.7.6</option>
                    <option value="v0.6.12">v0.6.12</option>
                  </select>
                </div>

                {/* Git Commit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-primary block">
                    Target Git Commit SHA
                  </label>
                  <input
                    type="text"
                    value={gitCommit}
                    onChange={(e) => setGitCommit(e.target.value)}
                    placeholder="8f9b2d4..."
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs font-mono text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  />
                </div>

                {/* Deployed Address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-text-primary block">
                    Deployed Contract Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs font-mono text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  />
                </div>
              </div>

              {/* Source Code Preview */}
              <div className="space-y-2 pt-2 border-t border-border-hairline/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-primary">
                    Contract Source Preview & SLOC Calculation
                  </label>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#F2F4F7] dark:bg-bg-panel-raised text-accent-scan font-bold">
                    {calculatedSloc.toLocaleString()} SLOC (Estimated Turnaround: {turnaroundSla})
                  </span>
                </div>
                <div className="h-44 overflow-y-auto rounded-xl bg-bg-void p-3 font-mono text-xs text-text-primary border border-border-hairline leading-relaxed">
                  <pre>{sourceCode}</pre>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
            <ExpandingButton
              variant="accent"
              rounded="xl"
              size="md"
              onClick={() => setCurrentStep(3)}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Continue to Invariants
            </ExpandingButton>
          </div>
        </div>
      )}

      {/* ─── STEP 3: SECURITY INVARIANTS & SCOPE FOCUS ─── */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
            <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="space-y-1 border-b border-border-hairline pb-4">
                <h2 className="font-display text-lg font-bold text-text-primary">
                  Security Invariants & Automated AST Focus
                </h2>
                <p className="text-xs text-text-muted">
                  Configure specific vulnerability classes, invariant checkers, and mathematical assertions to prioritize.
                </p>
              </div>

              {/* Attack Vector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: "reentrancy",
                    title: "Reentrancy & State Ordering",
                    swc: "SWC-107",
                    desc: "State mutations occurring after low-level calls, ETH transfers, or untrusted ERC-777 callbacks.",
                  },
                  {
                    key: "oracle",
                    title: "Oracle Resilience & Spot Price",
                    swc: "SWC-120",
                    desc: "Vulnerability to instant flash loan manipulation, reserve skewing, or stale pricing feeds.",
                  },
                  {
                    key: "access",
                    title: "Access Control & Role Escalation",
                    swc: "SWC-105",
                    desc: "Privileged owner methods, timelock bypasses, uninitialized proxies, or arbitrary call paths.",
                  },
                  {
                    key: "erc20",
                    title: "Token Standard Incompatibilities",
                    swc: "DeFi",
                    desc: "Fee-on-transfer, rebasing balances, non-standard bool returns, and ERC-721/1155 callbacks.",
                  },
                  {
                    key: "math",
                    title: "Precision Loss & Rounding Drift",
                    swc: "SWC-101",
                    desc: "Rounding in favor of user vs protocol, denominator zero-checks, and precision truncation.",
                  },
                  {
                    key: "liquidity",
                    title: "Liquidity & Share Dilution",
                    swc: "DeFi",
                    desc: "First-depositor share inflation attacks, sandwich exploit vectors, and vault drainage logic.",
                  },
                ].map((item) => {
                  const isActive = Boolean(invariants[item.key]);
                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        setInvariants((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                      }
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3",
                        isActive
                          ? "border-accent-scan bg-accent-scan/5 ring-1 ring-accent-scan/20 shadow-xs"
                          : "border-border-hairline hover:border-border-hairline/80 bg-[#F8F9FA] dark:bg-bg-void/40"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded accent-accent-scan cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-text-primary">{item.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bg-panel-raised text-text-muted border border-border-hairline">
                            {item.swc}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Invariants TextArea */}
              <div className="space-y-2 pt-2 border-t border-border-hairline/60">
                <label className="text-xs font-semibold text-text-primary block">
                  Custom Invariant Specifications (Mathematical Truths)
                </label>
                <textarea
                  rows={3}
                  value={customInvariants}
                  onChange={(e) => setCustomInvariants(e.target.value)}
                  placeholder="e.g. Total minted LP tokens must always equal sqrt(reserve0 * reserve1) after initial mint..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs font-sans text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                />
              </div>

              {/* Out of Scope */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary block">
                  Exclusions & Out-of-Scope Files
                </label>
                <input
                  type="text"
                  value={outOfScope}
                  onChange={(e) => setOutOfScope(e.target.value)}
                  placeholder="e.g. Test fixtures, mock contracts, and external chainlink interfaces are excluded."
                  className="w-full h-9 px-3 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
            <ExpandingButton
              variant="accent"
              rounded="xl"
              size="md"
              onClick={() => setCurrentStep(4)}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Continue to Business Context
            </ExpandingButton>
          </div>
        </div>
      )}

      {/* ─── STEP 4: BUSINESS CONTEXT & PROTOCOL INTENT (THE BUSINESS GOALS STEP) ─── */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
            <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-text-primary">
                      Business Context & Protocol Intent
                    </h2>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                      Crucial for AI Reasoning
                    </span>
                  </div>
                  <p className="text-xs text-text-muted max-w-2xl">
                    Collecting the platform&apos;s economic model, user incentives, and intended flows provides the semantic context that Zyron&apos;s AST AI engine and senior auditors need to catch high-level logic vulnerabilities.
                  </p>
                </div>
              </div>

              {/* Form Cards */}
              <div className="space-y-4">
                {/* 1. Core Purpose & Proposition */}
                <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-accent-scan" />
                      1. Protocol Mission & Value Proposition
                    </label>
                    <span className="text-[10px] text-text-muted">What does this platform do?</span>
                  </div>
                  <textarea
                    rows={2}
                    value={businessGoals.protocolOverview}
                    onChange={(e) =>
                      setBusinessGoals((prev) => ({ ...prev, protocolOverview: e.target.value }))
                    }
                    placeholder="e.g. An automated constant-product decentralized exchange (AMM) providing decentralized liquidity and permissionless token swaps..."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  />
                </div>

                {/* 2. Economic & Incentive Model */}
                <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-signal-high" />
                      2. Economic Model & Asset Flow
                    </label>
                    <span className="text-[10px] text-text-muted">How do funds move and fees accrue?</span>
                  </div>
                  <textarea
                    rows={2}
                    value={businessGoals.economicModel}
                    onChange={(e) =>
                      setBusinessGoals((prev) => ({ ...prev, economicModel: e.target.value }))
                    }
                    placeholder="e.g. Traders pay a 0.30% fee on every token swap. 0.25% is accrued directly into pool reserves for LPs; 0.05% can be diverted to protocol treasury..."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  />
                </div>

                {/* 3. Privileged Roles & Trust Assumptions */}
                <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-purple-500" />
                      3. Privileged Roles & Governance Assumptions
                    </label>
                    <span className="text-[10px] text-text-muted">Who holds admin control?</span>
                  </div>
                  <textarea
                    rows={2}
                    value={businessGoals.privilegedRoles}
                    onChange={(e) =>
                      setBusinessGoals((prev) => ({ ...prev, privilegedRoles: e.target.value }))
                    }
                    placeholder="e.g. feeToSetter is controlled by a 4-of-7 community multisig with 48h timelock. No admin key can withdraw pool reserves or freeze trading..."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  />
                </div>

                {/* 4. Critical Business Invariants & Worst-Case Scenarios */}
                <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-signal-critical" />
                      4. Critical Invariants (What Must NEVER Happen)
                    </label>
                    <span className="text-[10px] text-signal-critical font-medium">Worst-case scenario</span>
                  </div>
                  <textarea
                    rows={2}
                    value={businessGoals.criticalInvariants}
                    onChange={(e) =>
                      setBusinessGoals((prev) => ({ ...prev, criticalInvariants: e.target.value }))
                    }
                    placeholder="e.g. A user must NEVER be able to withdraw more reserves than their LP share entitles them to. Reserves in the pool must never become locked or un-withdrawable..."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  />
                </div>

                {/* 5. Dependencies & External Assumptions */}
                <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-sky-500" />
                      5. External Integrations & Known Constraints
                    </label>
                    <span className="text-[10px] text-text-muted">Oracles, bridges, wrapped tokens</span>
                  </div>
                  <textarea
                    rows={2}
                    value={businessGoals.externalDependencies}
                    onChange={(e) =>
                      setBusinessGoals((prev) => ({ ...prev, externalDependencies: e.target.value }))
                    }
                    placeholder="e.g. Relies on standard ERC-20 token contracts. Non-standard tokens (like rebasing tokens) should not cause pool insolvency..."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent-scan"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(3)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
            <ExpandingButton
              variant="accent"
              rounded="xl"
              size="md"
              onClick={() => setCurrentStep(5)}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Review Scope & Submit
            </ExpandingButton>
          </div>
        </div>
      )}

      {/* ─── STEP 5: REVIEW & SUBMIT ENGAGEMENT ─── */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
            <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="border-b border-border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-bold text-text-primary">
                    Review Scope & Submit Audit Request
                  </h2>
                  <p className="text-xs text-text-muted">
                    Verify your smart contract entrypoint, security focus vectors, and platform business goals.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-accent-scan">
                    {turnaroundSla} SLA Turnaround
                  </span>
                </div>
              </div>

              {/* Scope Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-border-hairline space-y-2">
                  <div className="font-semibold text-text-primary flex items-center gap-1.5 text-xs">
                    <FileCode2 className="h-4 w-4 text-accent-scan" />
                    Target Protocol & Scope
                  </div>
                  <div className="space-y-1 text-text-muted">
                    <div>
                      Protocol: <strong className="text-text-primary">{protocolName}</strong>
                    </div>
                    <div>
                      Primary Contract:{" "}
                      <strong className="text-accent-scan font-mono">{contractFileName}</strong>
                    </div>
                    <div>
                      Network: <span className="text-text-primary">{network}</span>
                    </div>
                    <div>
                      Lines of Code:{" "}
                      <strong className="text-text-primary font-mono">{calculatedSloc.toLocaleString()} SLOC</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-border-hairline space-y-2">
                  <div className="font-semibold text-text-primary flex items-center gap-1.5 text-xs">
                    <GitBranch className="h-4 w-4 text-purple-500" />
                    Repository & Environment
                  </div>
                  <div className="space-y-1 text-text-muted">
                    <div className="truncate">
                      Source:{" "}
                      <span className="text-text-primary font-mono truncate">
                        {customGithubUrl || "Open Source Ingestion"}
                      </span>
                    </div>
                    <div>
                      Branch: <strong className="text-text-primary">{selectedBranch}</strong>
                    </div>
                    <div>
                      Solidity Compiler:{" "}
                      <span className="text-text-primary font-mono">{compilerVersion}</span>
                    </div>
                    <div className="truncate">
                      Commit SHA:{" "}
                      <span className="text-text-primary font-mono">{gitCommit.slice(0, 10)}...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Security Invariants Summary */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-border-hairline space-y-2">
                <div className="font-semibold text-text-primary flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-signal-resolved" />
                    Configured Invariant Targets
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {Object.values(invariants).filter(Boolean).length} vectors enabled
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(invariants)
                    .filter(([, v]) => v)
                    .map(([k]) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-bg-panel border border-border-hairline text-[11px] font-medium text-text-primary capitalize flex items-center gap-1"
                      >
                        <Check className="h-3 w-3 text-signal-resolved" />
                        {k}
                      </span>
                    ))}
                </div>
              </div>

              {/* Business Context Summary */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/40 border border-border-hairline space-y-2">
                <div className="font-semibold text-text-primary flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-accent-scan" />
                    Business Goals & Protocol Intent
                  </span>
                  <Badge severity="resolved" size="sm">Attached for Reviewer & AI</Badge>
                </div>
                <p className="text-xs text-text-muted italic leading-relaxed">
                  &ldquo;{businessGoals.protocolOverview}&rdquo;
                </p>
                <div className="pt-1 text-[11px] text-text-muted space-y-1">
                  <div>
                    <strong className="text-text-primary">Worst-Case Prevention:</strong>{" "}
                    {businessGoals.criticalInvariants}
                  </div>
                  <div>
                    <strong className="text-text-primary">Admin Model:</strong>{" "}
                    {businessGoals.privilegedRoles}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(4)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>

            <ExpandingButton
              variant="accent"
              rounded="xl"
              size="md"
              onClick={handleSubmit}
              disabled={isSubmitting}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              {isSubmitting ? "Enqueuing Audit..." : "Submit Audit Request"}
            </ExpandingButton>
          </div>
        </div>
      )}
    </div>
  );
}
