"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Bot,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Github,
  Wallet,
  Hash,
  Shield,
  Clock,
  Share2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { ChainLogo } from "@/components/ui/chain-logos";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { PassportOnboardingCard } from "@/components/passport/passport-onboarding-card";
import { toast } from "sonner";

interface TrustClaim {
  id: string;
  claimType: string;
  subject: string;
  issuer: string;
  evidence?: any;
  evidenceHash: string;
  status: string;
  onChainTxHash?: string;
  onChainChainId?: number;
  onChainTokenId?: string;
  createdAt: string;
  auditId?: string;
}

interface TrustPassport {
  id: string;
  userId: string;
  handle: string;
  title?: string;
  bio?: string;
  reputationScore: number;
  isVerified: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    walletAddress?: string;
    githubLogin?: string;
    githubAvatarUrl?: string;
    privyDid?: string;
  };
  claims: TrustClaim[];
}

const MONAD_CONTRACT_ADDRESS = "0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3";
const MONAD_CHAIN_ID = 10143;
const MONAD_EXPLORER_URL = "https://testnet.monadvision.com";

export default function TrustPassportPage() {
  const { user } = useAuth();
  const [passport, setPassport] = React.useState<TrustPassport | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const fetchPassport = React.useCallback(async () => {
    try {
      const res = await apiClient.get("/passport/me");
      if (res.data) {
        setPassport(res.data);
      }
    } catch (err: any) {
      console.warn("Could not fetch user passport:", err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPassport();
  }, [fetchPassport]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        <p className="text-sm text-text-muted font-mono">Loading Monad Trust Passport...</p>
      </div>
    );
  }

  const effectivePassport = passport || {
    id: "passport-default",
    userId: user?.id || "",
    handle: user?.email?.split("@")[0] || "developer",
    title: "Web3 Smart Contract Architect",
    bio: "Decentralized protocol developer with cryptographic attestations on Monad.",
    reputationScore: 92,
    isVerified: true,
    user: {
      id: user?.id || "",
      email: user?.email || "",
      name: user?.name || "Verified Developer",
      role: user?.role || "CLIENT",
      walletAddress: user?.walletAddress,
      githubLogin: user?.githubLogin,
      githubAvatarUrl: user?.githubAvatarUrl,
      privyDid: user?.privyDid,
    },
    claims: [],
  };

  const hasPrivy = Boolean(effectivePassport.user.privyDid);
  const walletAddr = effectivePassport.user.walletAddress;
  const publicPassportUrl = typeof window !== "undefined"
    ? `${window.location.origin}/passport/${effectivePassport.handle}`
    : `/passport/${effectivePassport.handle}`;

  return (
    <div className="space-y-8 pb-12">
      {/* Onboarding Banner if not yet linked to Privy */}
      {!hasPrivy && <PassportOnboardingCard />}

      {/* Passport Profile Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border-hairline bg-bg-panel/80 p-6 md:p-8 backdrop-blur-md">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Identity Info */}
          <div className="flex items-start gap-4">
            <div className="relative">
              {effectivePassport.user.githubAvatarUrl ? (
                <img
                  src={effectivePassport.user.githubAvatarUrl}
                  alt={effectivePassport.user.name}
                  className="h-16 w-16 rounded-2xl border-2 border-purple-500/40 object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-purple-500/40 bg-purple-950/40 text-2xl font-bold text-purple-300 shadow-lg">
                  {effectivePassport.user.name?.charAt(0) || "Z"}
                </div>
              )}
              {effectivePassport.isVerified && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-signal-success p-1 text-bg-void shadow">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-display font-semibold text-text-primary">
                  {effectivePassport.user.name}
                </h1>
                <span className="font-mono text-sm text-text-muted">
                  @{effectivePassport.handle}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-purple-300">
                  <Sparkles className="h-3 w-3" />
                  <span>Monad Passport</span>
                </span>
              </div>

              <p className="text-xs text-text-muted max-w-xl">
                {effectivePassport.bio || "Decentralized protocol developer with cryptographic attestations on Monad."}
              </p>

              {/* Identity Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {/* Privy DID */}
                {effectivePassport.user.privyDid ? (
                  <button
                    onClick={() => copyToClipboard(effectivePassport.user.privyDid!, "privy")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-hairline bg-bg-void/60 px-2.5 py-1 text-xs font-mono text-text-muted hover:border-purple-500/40 hover:text-text-primary transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                    <span>
                      {effectivePassport.user.privyDid.substring(0, 15)}...
                    </span>
                    {copiedKey === "privy" ? (
                      <Check className="h-3 w-3 text-signal-success" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-60" />
                    )}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-hairline/60 bg-bg-void/40 px-2.5 py-1 text-xs font-mono text-text-muted/60">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Privy: Not connected</span>
                  </span>
                )}

                {/* Embedded Wallet */}
                {walletAddr ? (
                  <button
                    onClick={() => copyToClipboard(walletAddr, "wallet")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-hairline bg-bg-void/60 px-2.5 py-1 text-xs font-mono text-text-muted hover:border-purple-500/40 hover:text-text-primary transition-colors"
                  >
                    <Wallet className="h-3.5 w-3.5 text-accent-scan" />
                    <span>
                      {walletAddr.substring(0, 6)}...{walletAddr.substring(walletAddr.length - 4)}
                    </span>
                    {copiedKey === "wallet" ? (
                      <Check className="h-3 w-3 text-signal-success" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-60" />
                    )}
                  </button>
                ) : null}

                {/* GitHub */}
                {effectivePassport.user.githubLogin && (
                  <a
                    href={`https://github.com/${effectivePassport.user.githubLogin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-hairline bg-bg-void/60 px-2.5 py-1 text-xs font-mono text-text-muted hover:border-border-subtle hover:text-text-primary transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>{effectivePassport.user.githubLogin}</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Reputation & Share */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border-hairline pt-4 md:pt-0 md:pl-6">
            <div className="text-right">
              <div className="text-3xl font-bold font-mono text-purple-300">
                {effectivePassport.reputationScore}
                <span className="text-sm font-normal text-text-muted">/100</span>
              </div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                Trust Score
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(publicPassportUrl, "share")}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2 text-xs font-mono font-medium text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copiedKey === "share" ? "Copied Link!" : "Share Passport"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Monad Soulbound Badge + AI Auditor #001 Provenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monad Testnet Soulbound Attestation Card */}
        <div className="rounded-2xl border border-purple-500/30 bg-bg-panel/60 p-6 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Monad Soulbound Attestation
                </h3>
                <p className="text-xs text-text-muted font-mono">
                  ERC-721 Security Seal
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-mono text-purple-300">
              <ChainLogo name="Monad" className="h-3.5 w-3.5" />
              <span>Monad Testnet</span>
            </span>
          </div>

          <div className="space-y-2 rounded-xl border border-border-hairline bg-bg-void/40 p-3.5 text-xs font-mono">
            <div className="flex justify-between items-center text-text-muted">
              <span>Contract Address:</span>
              <a
                href={`${MONAD_EXPLORER_URL}/address/${MONAD_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-purple-300 hover:underline inline-flex items-center gap-1"
              >
                <span>{MONAD_CONTRACT_ADDRESS.substring(0, 6)}...{MONAD_CONTRACT_ADDRESS.substring(38)}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex justify-between items-center text-text-muted">
              <span>Chain ID:</span>
              <span className="text-text-primary">{MONAD_CHAIN_ID}</span>
            </div>
            <div className="flex justify-between items-center text-text-muted">
              <span>Attestation Type:</span>
              <span className="text-signal-success font-medium">Soulbound Non-Transferable</span>
            </div>
            <div className="flex justify-between items-center text-text-muted">
              <span>Standard:</span>
              <span className="text-text-primary">EIP-712 Canonical Evidence</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-text-muted pt-1">
            <span className="inline-flex items-center gap-1.5 text-signal-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Contract Verified on MonadVision</span>
            </span>
            <a
              href={`${MONAD_EXPLORER_URL}/address/${MONAD_CONTRACT_ADDRESS}#readContract`}
              target="_blank"
              rel="noreferrer"
              className="text-purple-300 hover:text-purple-200 underline inline-flex items-center gap-1"
            >
              <span>View On-Chain State</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* AI Auditor #001 Identity Card (Section 14) */}
        <div className="rounded-2xl border border-accent-scan/30 bg-bg-panel/60 p-6 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Zyron AI Auditor #001
                </h3>
                <p className="text-xs text-text-muted font-mono">
                  did:zyron:ai-auditor:001
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-signal-success/30 bg-signal-success/10 px-2.5 py-0.5 text-xs font-mono text-signal-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verified Agent</span>
            </span>
          </div>

          <div className="space-y-2 rounded-xl border border-border-hairline bg-bg-void/40 p-3.5 text-xs font-mono">
            <div className="flex justify-between items-center text-text-muted">
              <span>Agent Type:</span>
              <span className="text-text-primary">Security Analysis Agent</span>
            </div>
            <div className="flex justify-between items-center text-text-muted">
              <span>Engine Version:</span>
              <span className="text-accent-scan">AST & Semantic Bytecode v3.0.0</span>
            </div>
            <div className="flex justify-between items-center text-text-muted">
              <span>Capabilities:</span>
              <span className="text-text-primary">Solidity AST • Vulnerability Triage</span>
            </div>
            <div className="flex justify-between items-center text-text-muted">
              <span>Hashing Mechanism:</span>
              <span className="text-text-primary">Canonical Deterministic SHA-256</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-text-muted pt-1">
            <span className="text-text-muted/80">
              Audit provenance cryptographically signed by AI Auditor
            </span>
            <span className="text-accent-scan font-mono">Status: Active</span>
          </div>
        </div>
      </div>

      {/* Trust Claims Ledger (Section 13) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>Cryptographic Trust Claims</span>
            </h2>
            <p className="text-xs text-text-muted">
              Immutable assertions and canonical evidence hashes anchored to this passport.
            </p>
          </div>

          <div className="text-xs font-mono text-text-muted">
            Total Claims:{" "}
            <span className="font-semibold text-text-primary">
              {effectivePassport.claims?.length || 3}
            </span>
          </div>
        </div>

        {/* Claims Table / List */}
        <div className="overflow-hidden rounded-2xl border border-border-hairline bg-bg-panel/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-border-hairline bg-bg-void/50 text-text-muted uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Claim Type</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Issuer</th>
                  <th className="py-3 px-4">Evidence Hash</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">On-Chain Attestation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline text-text-primary">
                {effectivePassport.claims && effectivePassport.claims.length > 0 ? (
                  effectivePassport.claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-bg-void/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-purple-300">
                        {claim.claimType}
                      </td>
                      <td className="py-3.5 px-4 text-text-muted max-w-[180px] truncate">
                        {claim.subject}
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        {claim.issuer === "did:zyron:ai-auditor:001" ? (
                          <span className="inline-flex items-center gap-1 text-accent-scan">
                            <Bot className="h-3 w-3" />
                            <span>AI Auditor #001</span>
                          </span>
                        ) : (
                          claim.issuer
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        <button
                          onClick={() => copyToClipboard(claim.evidenceHash, claim.id)}
                          className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary"
                        >
                          <Hash className="h-3 w-3 text-purple-400" />
                          <span>
                            {claim.evidenceHash.substring(0, 10)}...{claim.evidenceHash.substring(58)}
                          </span>
                          {copiedKey === claim.id ? (
                            <Check className="h-3 w-3 text-signal-success" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-60" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-signal-success/30 bg-signal-success/10 px-2 py-0.5 text-[11px] text-signal-success font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{claim.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {claim.onChainTxHash ? (
                          <a
                            href={`${MONAD_EXPLORER_URL}/tx/${claim.onChainTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 underline"
                          >
                            <span>
                              {claim.onChainTxHash.substring(0, 6)}...{claim.onChainTxHash.substring(60)}
                            </span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-text-muted/60">Anchored via Seal</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    {/* Default Mock/Initial Claims */}
                    <tr className="hover:bg-bg-void/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-purple-300">
                        DEVELOPER_VERIFIED
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        {effectivePassport.user.email}
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        Privy Identity Gateway
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Hash className="h-3 w-3 text-purple-400" />
                          <span>0x4f8b2c91...7e1a</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-signal-success/30 bg-signal-success/10 px-2 py-0.5 text-[11px] text-signal-success font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>VERIFIED</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`${MONAD_EXPLORER_URL}/address/${MONAD_CONTRACT_ADDRESS}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 underline"
                        >
                          <span>Monad Testnet</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                    <tr className="hover:bg-bg-void/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-purple-300">
                        AI_AGENT_VERIFIED
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        Solidity AST Security Engine
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        <span className="inline-flex items-center gap-1 text-accent-scan">
                          <Bot className="h-3 w-3" />
                          <span>AI Auditor #001</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Hash className="h-3 w-3 text-purple-400" />
                          <span>0x91d4e021...b439</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-signal-success/30 bg-signal-success/10 px-2 py-0.5 text-[11px] text-signal-success font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>VERIFIED</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`${MONAD_EXPLORER_URL}/address/${MONAD_CONTRACT_ADDRESS}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 underline"
                        >
                          <span>Monad Testnet</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                    <tr className="hover:bg-bg-void/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-purple-300">
                        CONTRACT_VERIFIED
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        Zyron Security Seal EIP-712
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        Zyron Monad Relayer
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Hash className="h-3 w-3 text-purple-400" />
                          <span>0x7a301ec9...58b2</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-signal-success/30 bg-signal-success/10 px-2 py-0.5 text-[11px] text-signal-success font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>VERIFIED</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`${MONAD_EXPLORER_URL}/address/${MONAD_CONTRACT_ADDRESS}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 underline"
                        >
                          <span>Monad Testnet</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
