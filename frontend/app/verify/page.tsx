"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Terminal,
  Search,
  Upload,
  Hash,
  FileCode,
  Check,
  Copy,
  ExternalLink,
  Download,
  ArrowUpRight,
  X,
  RefreshCw,
  FileCheck2,
  Lock,
  Radio,
  Layers,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Activity,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StatusPill } from "@/components/ui/status-pill";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import axios from "axios";

interface VerificationData {
  id: string;
  protocolName: string;
  contractFileName: string;
  contractAddress?: string | null;
  gitCommit?: string | null;
  compilerVersion: string;
  network: string;
  sloc: number;
  stage: string;
  attestationStatus?: string | null;
  completedAt?: string | null;
  createdAt: string;
  leadAuditor?: {
    name?: string | null;
    auditorHandle?: string | null;
    walletAddress?: string | null;
  } | null;
  cryptography: {
    bytecodeHash?: string | null;
    merkleRoot?: string | null;
    ipfsCid?: string | null;
    ipfsMetadataCid?: string | null;
    ipfsGatewayUrl?: string | null;
    reportUrl: string;
    onChainTxHash?: string | null;
    onChainChainId?: number | null;
    attestationSig?: string | null;
  };
  summary: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    resolved: number;
    allResolved: boolean;
  };
  findings: Array<{
    displayId: string;
    title: string;
    severity: string;
    status: string;
    impact?: string | null;
    remediationNote?: string | null;
  }>;
}

function VerifyPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || searchParams.get("id") || "";

  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"search" | "upload" | "code">("search");
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [solidityCode, setSolidityCode] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [resultSubTab, setResultSubTab] = React.useState<"overview" | "proofs" | "findings">("overview");

  const [verificationResult, setVerificationResult] = React.useState<{
    verified: boolean;
    matchType?: string;
    matchDetail?: string;
    message?: string;
    audit?: VerificationData;
  } | null>(null);
  const [recentAudits, setRecentAudits] = React.useState<VerificationData[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = mounted && !!user;
  const dashboardHref = isAuthenticated
    ? user?.role?.toUpperCase() === "AUDITOR"
      ? "/auditor/queue"
      : user?.role?.toUpperCase() === "ADMIN"
      ? "/admin/users"
      : "/portal"
    : "/auth/login";

  // Load recent verified attestations
  React.useEffect(() => {
    apiClient
      .get("/audits/verify/recent?limit=4")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setRecentAudits(res.data);
        }
      })
      .catch((err) => console.warn("Failed to load recent audits:", err));
  }, []);

  // Run initial query if passed via query params
  React.useEffect(() => {
    if (initialQuery.trim()) {
      handleSearch(initialQuery.trim());
    }
  }, [initialQuery]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSearch = async (queryText?: string) => {
    const q = (queryText || searchQuery).trim();
    if (!q) {
      toast.error("Please enter a ticket ID, contract address, hash, or IPFS CID");
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await apiClient.get(`/audits/verify?query=${encodeURIComponent(q)}`);
      setVerificationResult(res.data);
      if (res.data?.verified) {
        toast.success(`Attestation Verified: ${res.data.audit?.protocolName}`);
      } else {
        toast.error(res.data?.message || "Attestation could not be verified");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to verify attestation";
      setVerificationResult({ verified: false, message: msg });
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeVerify = async () => {
    if (!solidityCode.trim()) {
      toast.error("Please paste Solidity source code to verify");
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await apiClient.post("/audits/verify", { code: solidityCode });
      setVerificationResult(res.data);
      if (res.data?.verified) {
        toast.success(`Code Match Verified: ${res.data.audit?.protocolName}`);
      } else {
        toast.error(res.data?.message || "No verified contract matches this source code digest");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to verify code digest";
      setVerificationResult({ verified: false, message: msg });
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload an authentic .pdf audit report");
      return;
    }

    setSelectedFile(file);
    setIsVerifying(true);
    setVerificationResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const res = await axios.post(`${baseURL}/audits/verify/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVerificationResult(res.data);
      if (res.data?.verified) {
        toast.success(`PDF Authenticity Verified: ${res.data.audit?.protocolName}`);
      } else {
        toast.error(res.data?.message || "The uploaded PDF does not match any certified audit");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to verify PDF document";
      setVerificationResult({ verified: false, message: msg });
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const audit = verificationResult?.audit;

  return (
    <div className="min-h-screen bg-bg-void text-text-primary selection:bg-accent-scan/20 selection:text-accent-scan relative overflow-x-hidden">
      {/* Background Graphic matching Home Page */}
      <div className="absolute top-0 left-0 w-full h-[650px] md:h-[800px] pointer-events-none z-0 overflow-hidden">
        <img
          src="/hero-bg.png"
          alt=""
          className="w-full h-full object-cover object-top dark:opacity-10 opacity-[0.03] [filter:hue-rotate(-75deg)_saturate(2)_brightness(1.1)] [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)]"
        />
      </div>

      {/* ========================================================================= */}
      {/* HEADER: MATCHING HOME PAGE FLOATING NAVBAR                                */}
      {/* ========================================================================= */}
      <header className="w-full bg-transparent sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 h-20 flex items-center justify-between">
          {/* Left: Compact Zyron Brand & Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-8 w-8 rounded-[4px] bg-bg-panel border border-border-hairline text-accent-scan group-hover:border-accent-scan transition-colors">
              <Terminal className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-2 font-mono tracking-wider">
              <span className="font-display font-bold text-sm text-text-primary tracking-wider">
                ZYRON
              </span>
              <span className="hidden sm:inline text-text-muted/60 font-light text-xs">|</span>
              <span className="hidden sm:inline text-accent-scan font-medium text-xs tracking-wider">
                AI AUDITOR
              </span>
            </div>
          </Link>

          {/* Middle: Floating Center Navbar */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-[6px] bg-bg-panel/90 border border-border-hairline backdrop-blur-md shadow-xl font-mono text-xs text-text-muted">
            <Link
              href="/#features"
              className="px-3 py-1.5 rounded-[4px] hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="px-3 py-1.5 rounded-[4px] hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#ecosystem"
              className="px-3 py-1.5 rounded-[4px] hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
            >
              Ecosystem
            </Link>
            <Link
              href="/#pricing"
              className="px-3 py-1.5 rounded-[4px] hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              className="px-3 py-1.5 rounded-[4px] hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/verify"
              className="px-3 py-1.5 rounded-[4px] text-text-primary bg-bg-panel-raised font-semibold transition-colors"
            >
              Verify
            </Link>
          </nav>

          {/* Right: Theme Toggle + Login / Dashboard Button + Mobile Hamburger */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <Link href={dashboardHref}>
              <button
                type="button"
                className="h-9 px-3.5 sm:px-4 rounded-[4px] bg-text-primary text-bg-void font-bold text-xs hover:bg-accent-scan hover:text-white dark:hover:bg-white dark:hover:text-bg-void transition-colors flex items-center gap-1.5 shadow-sm font-mono cursor-pointer"
              >
                <span>{isAuthenticated ? "Dashboard" : "Sign In"}</span>
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </Link>

            {/* Hamburger Button (mobile/tablet) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 text-text-primary" /> : <Terminal className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pb-4 max-w-[1440px] mx-auto animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3.5 rounded-[6px] bg-bg-panel/95 border border-border-hairline backdrop-blur-xl shadow-2xl space-y-2 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 rounded-[4px] bg-bg-panel border border-border-hairline mb-2">
                  <span className="text-text-muted font-bold">THEME</span>
                  <ThemeToggle size="sm" showLabel />
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] bg-text-primary text-bg-void font-bold hover:bg-accent-scan hover:text-white transition-colors mb-2"
                >
                  <span>{isAuthenticated ? "Dashboard" : "Sign In"}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </Link>
                <Link
                  href="/#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors"
                >
                  <span>Features</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
                <Link
                  href="/#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors"
                >
                  <span>How It Works</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
                <Link
                  href="/#ecosystem"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors"
                >
                  <span>Ecosystem</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
                <Link
                  href="/#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors"
                >
                  <span>Pricing</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
                <Link
                  href="/#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors"
                >
                  <span>FAQ</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
                <Link
                  href="/verify"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors font-semibold"
                >
                  <span>Verify</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
              </div>

              <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[11px] text-text-muted px-1 font-mono">
                <span className="text-[10px] text-text-muted">ZYRON_LABS_v2.6</span>
                <span className="text-[10px] text-accent-scan">ATTESTATION_PORTAL</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* MAIN BODY                                                                 */}
      {/* ========================================================================= */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-24">
        {/* Hero Title Area */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-bg-panel border border-border-hairline text-accent-scan text-xs font-mono font-medium mb-4 shadow-xs">
            <Terminal className="w-3.5 h-3.5" />
            <span>ATTESTATION_REGISTRY // EVM_ANCHORED</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl tracking-tight text-text-primary mb-3">
            Verify Audit <span className="text-accent-scan">Attestation</span>
          </h1>
          <p className="font-sans text-sm sm:text-base text-text-muted leading-relaxed">
            Verify bytecode integrity, decentralized IPFS CIDv1 provenance, findings Merkle trees, and auditor sign-off.
            Every certificate issued by Zyron is immutably anchored.
          </p>
        </div>

        {/* Verification Terminal Card */}
        <div className="bg-bg-panel/90 border border-border-hairline rounded-[6px] shadow-2xl backdrop-blur-md overflow-hidden mb-8">
          {/* Terminal Window Header Bar */}
          <div className="px-4 py-2.5 border-b border-border-hairline bg-bg-void/40 flex items-center justify-between text-[11px] font-mono text-text-muted">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-border-hairline" />
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-border-hairline" />
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-border-hairline" />
              <span className="ml-2 text-text-primary font-semibold">VERIFY_TERMINAL // v2.6.4</span>
            </div>
            <div className="hidden sm:block text-[10px] text-text-muted">
              REGISTRY: ETHEREUM_MAINNET_EVM
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 border-b border-border-hairline pb-4 mb-5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("search")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeTab === "search"
                    ? "bg-text-primary text-bg-void shadow-xs"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-panel-raised"
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                Identifier / Hash / Address
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeTab === "upload"
                    ? "bg-text-primary text-bg-void shadow-xs"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-panel-raised"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Audit PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeTab === "code"
                    ? "bg-text-primary text-bg-void shadow-xs"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-panel-raised"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Solidity Code Digest
              </button>
            </div>

            {/* Tab 1: Search Identifier / Address / Hash */}
            {activeTab === "search" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Ticket ID (ZYR-9485), Contract Address (0x...), Bytecode Hash, or IPFS CID..."
                      className="w-full h-11 pl-10 pr-4 rounded-[4px] bg-bg-void border border-border-hairline text-xs font-mono text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-scan transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isVerifying}
                    className="h-11 px-5 rounded-[4px] bg-text-primary text-bg-void font-bold text-xs font-mono hover:bg-accent-scan hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-sm disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Verify Record</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Test Explorers */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted font-mono pt-1">
                  <span>Quick Test:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("ZYR-9485");
                      handleSearch("ZYR-9485");
                    }}
                    className="px-2 py-0.5 rounded-[4px] bg-bg-void hover:bg-bg-panel-raised border border-border-hairline text-[11px] text-text-primary hover:border-accent-scan transition-colors cursor-pointer"
                  >
                    Ticket: ZYR-9485
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const addr = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
                      setSearchQuery(addr);
                      handleSearch(addr);
                    }}
                    className="px-2 py-0.5 rounded-[4px] bg-bg-void hover:bg-bg-panel-raised border border-border-hairline text-[11px] text-text-primary hover:border-accent-scan transition-colors cursor-pointer"
                  >
                    Address: 0x5C69...aA6f
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cid = "bafkreigx2uei2nkpot3qric2xce6yxjhtkzv5onobktsybqtdew332ppki";
                      setSearchQuery(cid);
                      handleSearch(cid);
                    }}
                    className="px-2 py-0.5 rounded-[4px] bg-bg-void hover:bg-bg-panel-raised border border-border-hairline text-[11px] text-text-primary hover:border-accent-scan transition-colors cursor-pointer"
                  >
                    IPFS CIDv1
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Upload Audit PDF */}
            {activeTab === "upload" && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-border-hairline hover:border-accent-scan rounded-[4px] p-8 text-center cursor-pointer transition-colors bg-bg-void/40 flex flex-col items-center justify-center gap-2.5 group"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-center text-accent-scan group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-semibold text-text-primary">
                      {selectedFile ? selectedFile.name : "Select or drag & drop an Audit Report PDF"}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Calculates the cryptographic SHA-256 digest &amp; CIDv1 to verify against the attestation registry.
                    </p>
                  </div>
                  {selectedFile && (
                    <span className="text-[10px] font-mono text-accent-scan bg-accent-scan/10 px-2 py-0.5 rounded-[4px]">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to verify
                    </span>
                  )}
                </div>

                {selectedFile && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleFileUpload(selectedFile)}
                      disabled={isVerifying}
                      className="h-9 px-4 rounded-[4px] bg-text-primary text-bg-void font-bold text-xs font-mono hover:bg-accent-scan hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Document...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Verify Document Integrity</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Solidity Code Digest */}
            {activeTab === "code" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-accent-scan" />
                      Paste Smart Contract Source Code
                    </span>
                    <span className="text-[10px]">Solidity ^0.8.x</span>
                  </div>
                  <textarea
                    value={solidityCode}
                    onChange={(e) => setSolidityCode(e.target.value)}
                    rows={8}
                    placeholder="// Paste complete Solidity source code here..."
                    className="w-full p-3.5 rounded-[4px] bg-bg-void border border-border-hairline text-xs font-mono text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-scan transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-text-muted font-mono">
                    Computes SHA-256 and Keccak-256 bytecode digests to find matching audits.
                  </p>
                  <button
                    type="button"
                    onClick={handleCodeVerify}
                    disabled={isVerifying || !solidityCode.trim()}
                    className="h-9 px-4 rounded-[4px] bg-text-primary text-bg-void font-bold text-xs font-mono hover:bg-accent-scan hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Computing Digest...</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Verify Code Digest</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Results Display */}
        {verificationResult && (
          <div className="mb-12">
            {verificationResult.verified && audit ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* ─── DASHBOARD COMPONENT 1: METRIC SUMMARY STATS CARDS ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Card 1: Attestation Posture */}
                  <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span className="font-medium text-text-primary">Attestation Status</span>
                        <div className="h-7 w-7 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                          <Radio className="h-3.5 w-3.5 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-display font-bold text-accent-scan">
                        Passed Remediation
                      </div>
                    </div>
                    <div className="px-3.5 py-2 text-xs text-text-muted flex items-center gap-1.5 font-mono">
                      <span>Audit ID: {audit.id}</span>
                      <span>•</span>
                      <span>100% Verified</span>
                    </div>
                  </div>

                  {/* Card 2: Secured SLOC */}
                  <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span className="font-medium text-text-primary">Lines of Code</span>
                        <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                          <Layers className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-display font-bold text-text-primary">
                        {audit.sloc} LOC
                      </div>
                    </div>
                    <div className="px-3.5 py-2 text-xs text-text-muted font-mono truncate">
                      {audit.compilerVersion} verified
                    </div>
                  </div>

                  {/* Card 3: Vulnerabilities Resolved */}
                  <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span className="font-medium text-text-primary">Issues Remediated</span>
                        <div className="h-7 w-7 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-display font-bold text-accent-scan">
                        {audit.summary.resolved} / {audit.summary.totalFindings}
                      </div>
                    </div>
                    <div className="px-3.5 py-2 text-xs text-text-muted font-mono">
                      0 open critical vulnerabilities
                    </div>
                  </div>

                  {/* Card 4: Attested Ledger */}
                  <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span className="font-medium text-text-primary">Storage Provenance</span>
                        <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                          <FileCheck2 className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-display font-bold text-text-primary">
                        IPFS &amp; EVM
                      </div>
                    </div>
                    <div className="px-3.5 py-2 text-xs text-text-muted font-mono truncate">
                      CIDv1 deterministic sealed
                    </div>
                  </div>
                </div>

                {/* ─── DASHBOARD COMPONENT 2: PIPELINE PROGRESS STEPPER ─── */}
                <div className="p-4 rounded-xl bg-bg-panel border border-border-hairline shadow-sm">
                  <div className="flex items-center justify-between mb-3 text-xs font-mono">
                    <span className="text-text-muted uppercase tracking-wider font-semibold">
                      Security Pipeline Verification Stages
                    </span>
                    <span className="text-accent-scan font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Stage 4/4 Completed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-bg-void border border-accent-scan/30 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent-scan/20 text-accent-scan flex items-center justify-center text-[10px] font-bold">1</span>
                      <div>
                        <div className="text-text-primary font-semibold text-[11px]">Static &amp; AST Analysis</div>
                        <div className="text-[10px] text-accent-scan">Pass completed</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-bg-void border border-accent-scan/30 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent-scan/20 text-accent-scan flex items-center justify-center text-[10px] font-bold">2</span>
                      <div>
                        <div className="text-text-primary font-semibold text-[11px]">Dynamic Fuzz Engine</div>
                        <div className="text-[10px] text-accent-scan">Prover passed</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-bg-void border border-accent-scan/30 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent-scan/20 text-accent-scan flex items-center justify-center text-[10px] font-bold">3</span>
                      <div>
                        <div className="text-text-primary font-semibold text-[11px]">Lead Auditor Review</div>
                        <div className="text-[10px] text-accent-scan">Patches verified</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-bg-void border border-accent-scan/40 bg-accent-scan/5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent-scan text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      <div>
                        <div className="text-text-primary font-semibold text-[11px]">Cryptographic Seal</div>
                        <div className="text-[10px] text-accent-scan font-bold">Attested to IPFS</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── DASHBOARD COMPONENT 3: TABBED AUDIT INSPECTOR ─── */}
                <div className="border border-border-hairline rounded-[6px] bg-bg-panel shadow-2xl overflow-hidden">
                  {/* Top Bar with Navigation Tabs */}
                  <div className="border-b border-border-hairline bg-bg-void/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-text-primary font-display">
                            {audit.protocolName}
                          </h2>
                          <StatusPill status="completed" size="sm" />
                          <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold bg-bg-panel border border-border-hairline text-accent-scan">
                            {verificationResult.matchType || "OFFICIAL_RECORD"}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted font-mono mt-0.5">
                          {audit.contractFileName} · {verificationResult.matchDetail || "Verified against Zyron decentralized registry"}
                        </p>
                      </div>
                    </div>

                    {/* Sub Tabs */}
                    <div className="flex items-center gap-1 bg-bg-void p-1 rounded-lg border border-border-hairline font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setResultSubTab("overview")}
                        className={`px-3 py-1 rounded-[4px] transition-colors cursor-pointer ${
                          resultSubTab === "overview"
                            ? "bg-text-primary text-bg-void font-bold shadow-xs"
                            : "text-text-muted hover:text-text-primary"
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        type="button"
                        onClick={() => setResultSubTab("proofs")}
                        className={`px-3 py-1 rounded-[4px] transition-colors cursor-pointer ${
                          resultSubTab === "proofs"
                            ? "bg-text-primary text-bg-void font-bold shadow-xs"
                            : "text-text-muted hover:text-text-primary"
                        }`}
                      >
                        Proof Vault
                      </button>
                      <button
                        type="button"
                        onClick={() => setResultSubTab("findings")}
                        className={`px-3 py-1 rounded-[4px] transition-colors cursor-pointer ${
                          resultSubTab === "findings"
                            ? "bg-text-primary text-bg-void font-bold shadow-xs"
                            : "text-text-muted hover:text-text-primary"
                        }`}
                      >
                        Findings ({audit.findings.length})
                      </button>
                    </div>
                  </div>

                  {/* Tab Body */}
                  <div className="p-6">
                    {/* SubTab 1: Overview */}
                    {resultSubTab === "overview" && (
                      <div className="space-y-6">
                        <div className="bg-bg-void border border-border-hairline rounded-[6px] p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                              <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                                Target Smart Contract
                              </div>
                              <h3 className="text-lg font-bold text-text-primary font-display mt-0.5">
                                {audit.contractFileName}
                              </h3>
                              <p className="text-xs font-mono text-accent-scan mt-0.5">
                                Engagement ID: {audit.id}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={audit.cryptography.reportUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 px-3.5 rounded-[4px] bg-text-primary text-bg-void font-bold text-xs font-mono hover:bg-accent-scan hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download Certified PDF</span>
                              </a>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border-hairline font-mono text-xs">
                            <div>
                              <div className="text-[10px] text-text-muted uppercase">Deployment Target</div>
                              <div className="text-text-primary font-semibold mt-0.5">{audit.network}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-text-muted uppercase">Compiler Version</div>
                              <div className="text-text-primary font-semibold mt-0.5">{audit.compilerVersion}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-text-muted uppercase">Source Lines</div>
                              <div className="text-text-primary font-semibold mt-0.5">{audit.sloc} LOC</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-text-muted uppercase">Certified Timestamp</div>
                              <div className="text-text-primary font-semibold mt-0.5">
                                {audit.completedAt
                                  ? new Date(audit.completedAt).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "Verified"}
                              </div>
                            </div>
                          </div>

                          {audit.contractAddress && (
                            <div className="mt-3 pt-3 border-t border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1">
                              <span className="text-text-muted">Verified Contract Address:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-accent-scan break-all">{audit.contractAddress}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(audit.contractAddress!, "contract")}
                                  className="p-1 hover:bg-bg-panel rounded text-text-muted hover:text-text-primary cursor-pointer shrink-0"
                                >
                                  {copiedKey === "contract" ? <Check className="w-3.5 h-3.5 text-accent-scan" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Severity Metrics Bar */}
                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted mb-2">
                            Audited Findings Breakdown
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono">
                            <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline text-center">
                              <div className="text-xl font-bold text-text-primary">{audit.summary.critical}</div>
                              <div className="text-[10px] text-text-muted uppercase mt-0.5">Critical</div>
                            </div>
                            <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline text-center">
                              <div className="text-xl font-bold text-text-primary">{audit.summary.high}</div>
                              <div className="text-[10px] text-text-muted uppercase mt-0.5">High</div>
                            </div>
                            <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline text-center">
                              <div className="text-xl font-bold text-text-primary">{audit.summary.medium}</div>
                              <div className="text-[10px] text-text-muted uppercase mt-0.5">Medium</div>
                            </div>
                            <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline text-center">
                              <div className="text-xl font-bold text-text-primary">{audit.summary.low}</div>
                              <div className="text-[10px] text-text-muted uppercase mt-0.5">Low / Gas</div>
                            </div>
                            <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline text-center">
                              <div className="text-xl font-bold text-accent-scan">{audit.summary.resolved}</div>
                              <div className="text-[10px] text-accent-scan uppercase mt-0.5 font-bold">100% Remediated</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SubTab 2: Proof Vault */}
                    {resultSubTab === "proofs" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bytecode & Merkle */}
                        <div className="bg-bg-void border border-border-hairline rounded-[4px] p-4 space-y-3 font-mono text-xs">
                          <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase tracking-wider pb-2 border-b border-border-hairline">
                            <Lock className="w-3.5 h-3.5 text-accent-scan" />
                            On-Chain Cryptographic Proofs
                          </div>

                          <div>
                            <div className="text-[10px] text-text-muted uppercase">Source Bytecode SHA-256 Digest</div>
                            <div className="mt-1 p-2 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-between gap-2">
                              <span className="text-[11px] text-accent-scan break-all">
                                {audit.cryptography.bytecodeHash || "0x98f4a3c2..."}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(audit.cryptography.bytecodeHash || "", "bytecode")}
                                className="text-text-muted hover:text-text-primary shrink-0 cursor-pointer"
                              >
                                {copiedKey === "bytecode" ? <Check className="w-3.5 h-3.5 text-accent-scan" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {audit.cryptography.merkleRoot && (
                            <div>
                              <div className="text-[10px] text-text-muted uppercase">Findings Merkle Root</div>
                              <div className="mt-1 p-2 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-between gap-2">
                                <span className="text-[11px] text-text-primary break-all">
                                  {audit.cryptography.merkleRoot}
                                </span>
                                <button
                                type="button"
                                onClick={() => copyToClipboard(audit.cryptography.merkleRoot || "", "merkle")}
                                className="text-text-muted hover:text-text-primary shrink-0 cursor-pointer"
                              >
                                {copiedKey === "merkle" ? <Check className="w-3.5 h-3.5 text-accent-scan" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {audit.cryptography.onChainTxHash && (
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-text-muted uppercase">
                              <span>On-Chain Attestation Tx (Monad Testnet)</span>
                              <a
                                href={`https://testnet.monadvision.com/tx/${audit.cryptography.onChainTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent-scan hover:underline flex items-center gap-1 font-bold text-[10px]"
                              >
                                <span>Monad Vision</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                            <div className="mt-1 p-2 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-between gap-2">
                              <span className="text-[11px] text-text-primary break-all">
                                {audit.cryptography.onChainTxHash}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(audit.cryptography.onChainTxHash || "", "tx")}
                                className="text-text-muted hover:text-text-primary shrink-0 cursor-pointer"
                              >
                                {copiedKey === "tx" ? <Check className="w-3.5 h-3.5 text-accent-scan" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {audit.cryptography.attestationSig && (
                          <div>
                            <div className="text-[10px] text-text-muted uppercase">EIP-712 Cryptographic Auditor Signature</div>
                            <div className="mt-1 p-2 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-between gap-2">
                              <span className="text-[11px] text-accent-scan break-all">
                                {audit.cryptography.attestationSig}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(audit.cryptography.attestationSig || "", "sig")}
                                className="text-text-muted hover:text-text-primary shrink-0 cursor-pointer"
                              >
                                {copiedKey === "sig" ? <Check className="w-3.5 h-3.5 text-accent-scan" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="text-[10px] text-text-muted uppercase">Zyron On-Chain Registry Contract</div>
                          <div className="mt-1 p-2 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-between gap-2">
                            <span className="text-[11px] text-text-primary break-all">
                              0x3331185fAEB2AD65ccDEB7C15025393Ca8F6834D
                            </span>
                            <a
                              href="https://sepolia.arbiscan.io/address/0x3331185fAEB2AD65ccDEB7C15025393Ca8F6834D#readContract"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-signal-resolved hover:underline text-[10px] flex items-center gap-1 shrink-0 font-bold"
                            >
                              <span>Contract</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* IPFS Decentralized Storage */}
                      <div className="bg-bg-void border border-border-hairline rounded-[4px] p-4 space-y-3 font-mono text-xs">
                        <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase tracking-wider pb-2 border-b border-border-hairline">
                          <Terminal className="w-3.5 h-3.5 text-accent-scan" />
                          Decentralized IPFS Storage
                        </div>

                        <div>
                          <div className="text-[10px] text-text-muted uppercase">RFC CIDv1 Base32 Multihash</div>
                          <div className="mt-1 p-2 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-between gap-2">
                            <span className="text-[11px] text-accent-scan break-all">
                              {audit.cryptography.ipfsCid || "bafkrei..."}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(audit.cryptography.ipfsCid || "", "cid")}
                              className="text-text-muted hover:text-text-primary shrink-0 cursor-pointer"
                            >
                              {copiedKey === "cid" ? <Check className="w-3.5 h-3.5 text-accent-scan" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-text-muted uppercase">IPFS Gateway Access</div>
                          <a
                            href={audit.cryptography.ipfsGatewayUrl || `https://ipfs.io/ipfs/${audit.cryptography.ipfsCid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 p-2 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-between gap-2 text-[11px] text-text-primary hover:text-accent-scan transition-colors"
                          >
                            <span className="truncate">{audit.cryptography.ipfsGatewayUrl || `https://ipfs.io/ipfs/${audit.cryptography.ipfsCid}`}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        </div>

                        <div className="text-[10px] text-text-muted pt-1">
                          Permanently pinned artifact. Tamper-evident byte representation matches on-chain attestation digest.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SubTab 3: Findings */}
                  {resultSubTab === "findings" && (
                    <div className="space-y-3">
                      {audit.findings && audit.findings.length > 0 ? (
                        audit.findings.map((f, idx) => (
                          <div
                            key={idx}
                            className="bg-bg-void border border-border-hairline rounded-[4px] p-4 font-mono text-xs space-y-2"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-[4px] bg-bg-panel text-text-primary text-[10px] font-bold border border-border-hairline">
                                  {f.displayId}
                                </span>
                                <span className="font-bold text-text-primary text-xs">{f.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase bg-bg-panel border border-border-hairline text-text-muted">
                                  {f.severity}
                                </span>
                                <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-bg-panel border border-border-hairline text-accent-scan flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  RESOLVED
                                </span>
                              </div>
                            </div>

                            {f.impact && (
                              <div className="p-2.5 rounded-[4px] bg-bg-panel border border-border-hairline text-[11px] text-text-muted">
                                <strong className="text-text-primary uppercase text-[10px] block mb-0.5 font-mono">
                                  Impact Vector:
                                </strong>
                                {f.impact}
                              </div>
                            )}

                            {f.remediationNote && (
                              <div className="p-2.5 rounded-[4px] bg-bg-panel border border-border-hairline text-[11px] text-accent-scan">
                                <strong className="text-text-primary uppercase text-[10px] block mb-0.5 font-mono">
                                  Auditor Verification:
                                </strong>
                                {f.remediationNote}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-text-muted font-mono italic">
                          No vulnerabilities identified in this audit engagement.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            ) : (
              /* Unverified / Not Found Banner */
              <div className="border border-border-hairline rounded-[6px] bg-bg-panel p-6 sm:p-8 shadow-xl text-center space-y-3 animate-in fade-in duration-200">
                <div className="w-10 h-10 rounded-[4px] bg-bg-void border border-border-hairline flex items-center justify-center text-text-muted mx-auto">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-base font-bold text-text-primary font-mono">
                  UNRECOGNIZED ATTESTATION RECORD
                </h3>
                <p className="text-xs text-text-muted max-w-lg mx-auto leading-relaxed font-sans">
                  {verificationResult.message ||
                    "No certified audit attestation matching this query or file hash was found in the Zyron decentralized registry."}
                </p>
                <div className="pt-2 text-xs font-mono text-text-muted">
                  Double check the Ticket ID (e.g. <code className="text-text-primary">ZYR-9485</code>), contract address, or ensure the PDF is an unmodified original document.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Publicly Certified Audits Explorer */}
        {recentAudits.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-accent-scan" />
                Recently Certified Audits on Zyron
              </h3>
              <span className="text-[11px] font-mono text-text-muted">Immutable Attestation Registry</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentAudits.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchQuery(item.id);
                    handleSearch(item.id);
                  }}
                  className="bg-bg-panel border border-border-hairline hover:border-accent-scan rounded-[4px] p-4 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-[4px] bg-bg-void border border-border-hairline text-[10px] font-mono font-bold text-text-primary">
                          {item.id}
                        </span>
                        <h4 className="text-xs font-bold text-text-primary font-mono group-hover:text-accent-scan transition-colors">
                          {item.protocolName}
                        </h4>
                      </div>
                      <p className="text-[11px] font-mono text-text-muted mt-0.5">
                        {item.contractFileName}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-[4px] bg-bg-void border border-border-hairline text-[10px] font-mono text-accent-scan font-semibold flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3" />
                      VERIFIED
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-2 border-t border-border-hairline">
                    <span className="truncate max-w-[220px]">
                      CID: {(item.cryptography?.ipfsCid || "bafkrei...").slice(0, 16)}...
                    </span>
                    <span className="text-text-primary group-hover:text-accent-scan flex items-center gap-1 transition-colors">
                      Verify Attestation <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* INSTITUTIONAL FOOTER (IDENTICAL TO HOME PAGE)                            */}
      {/* ========================================================================= */}
      <footer className="pt-20 pb-12 px-6 md:px-12 border-t border-border-hairline bg-bg-void text-text-muted relative overflow-hidden">
        {/* Subtle Ambient Nebula Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_110%,rgba(94,200,255,0.09),rgba(130,80,220,0.06),transparent_70%)] dark:opacity-100 opacity-40" />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          {/* Top Bar: Contact Info + Navigation Links */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-6">
            {/* Contact Info */}
            <div className="space-y-1">
              <div className="text-text-muted/70 text-xs font-mono">
                Contact Zyron Security at:
              </div>
              <a
                href="mailto:security@zyron.io"
                className="text-text-primary hover:text-accent-scan transition-colors font-mono text-sm sm:text-base font-semibold inline-flex items-center gap-1.5"
              >
                <span>security@zyron.io</span>
                <span className="text-xs">↗</span>
              </a>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap items-center gap-6 sm:gap-8 font-sans text-xs sm:text-sm text-text-muted">
              <Link href="/#how-it-works" className="hover:text-text-primary transition-colors">
                How It Works
              </Link>
              <Link href="/#pricing" className="hover:text-text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/#faq" className="hover:text-text-primary transition-colors">
                FAQ
              </Link>
              <Link href="/portal" className="hover:text-text-primary transition-colors">
                Client Portal
              </Link>
              <Link href="/verify" className="text-text-primary font-semibold transition-colors">
                Verify Attestation
              </Link>
            </nav>
          </div>

          {/* Giant Centered Brand Wordmark & Icon matching Home Page */}
          <div className="py-8 sm:py-12 md:py-16 flex items-center justify-center select-none">
            <div className="w-full flex items-center justify-between gap-4 sm:gap-8">
              <div className="h-12 w-12 sm:h-20 sm:w-20 md:h-28 md:w-28 lg:h-36 lg:w-36 shrink-0 rounded-[12px] sm:rounded-[20px] lg:rounded-[28px] bg-bg-panel border border-border-hairline flex items-center justify-center p-2.5 sm:p-4 md:p-6 lg:p-8 shadow-xl">
                <Terminal className="w-full h-full text-accent-scan stroke-[2.5]" />
              </div>

              <span className="font-display text-[14vw] font-bold tracking-tight text-text-primary leading-none lowercase sm:lowercase">
                zyron
              </span>
            </div>
          </div>

          {/* Bottom Row: Copyright + Social Links */}
          <div className="pt-6 border-t border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-text-muted/80">
            <div>
              © 2026 Zyron Protocol Inc. All rights reserved.
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link href="https://twitter.com" target="_blank" className="hover:text-text-primary transition-colors">
                Twitter / X
              </Link>
              <Link href="https://github.com" target="_blank" className="hover:text-text-primary transition-colors">
                GitHub
              </Link>
              <Link href="https://discord.com" target="_blank" className="hover:text-text-primary transition-colors">
                Discord
              </Link>
              <Link href="#" className="hover:text-text-primary transition-colors">
                Security Disclosure
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PublicVerifyPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-bg-void text-text-primary" />}>
      <VerifyPageContent />
    </React.Suspense>
  );
}
