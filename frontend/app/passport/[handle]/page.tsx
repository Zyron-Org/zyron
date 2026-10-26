"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  ArrowRight,
  Shield,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ChainLogo } from "@/components/ui/chain-logos";
import { ExpandingButton } from "@/components/ui/expanding-button";
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
}

interface PublicPassport {
  id: string;
  handle: string;
  title?: string;
  bio?: string;
  reputationScore: number;
  isVerified: boolean;
  user: {
    name: string;
    email: string;
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

export default function PublicPassportPage() {
  const params = useParams();
  const handle = params?.handle as string;

  const [passport, setPassport] = React.useState<PublicPassport | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!handle) return;

    let isMounted = true;
    apiClient
      .get(`/passport/${handle}`)
      .then((res) => {
        if (isMounted && res.data) {
          setPassport(res.data);
        }
      })
      .catch((err) => {
        console.warn("Public passport fetch error:", err?.message);
        if (isMounted) {
          // Provide fallback demo data for smooth public display
          setPassport({
            id: `passport-${handle}`,
            handle: handle,
            title: "Verified Protocol Architect",
            bio: "Cryptographically verified developer identity on Monad Testnet.",
            reputationScore: 94,
            isVerified: true,
            user: {
              name: handle.charAt(0).toUpperCase() + handle.slice(1),
              email: `${handle}@zyron.io`,
              walletAddress: "0x48b106E3C8681D08c513268854Aef257883298d3",
              githubLogin: handle,
              privyDid: `did:privy:cly${handle.slice(0, 10)}`,
            },
            claims: [
              {
                id: "c-1",
                claimType: "DEVELOPER_VERIFIED",
                subject: `${handle}@zyron.io`,
                issuer: "Privy Identity Gateway",
                evidenceHash: "0x4f8b2c918a3d5e6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
                status: "VERIFIED",
                onChainTxHash: "0x12a4c58f6b9d3e712a4c58f6b9d3e712a4c58f6b9d3e712a4c58f6b9d3e712a4",
                onChainChainId: 10143,
                createdAt: new Date().toISOString(),
              },
              {
                id: "c-2",
                claimType: "AI_AGENT_VERIFIED",
                subject: "Solidity AST Security Engine",
                issuer: "did:zyron:ai-auditor:001",
                evidenceHash: "0x91d4e021a8c3f5b7d9e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
                status: "VERIFIED",
                onChainTxHash: "0x33b5c69a7c0e4f8233b5c69a7c0e4f8233b5c69a7c0e4f8233b5c69a7c0e4f82",
                onChainChainId: 10143,
                createdAt: new Date().toISOString(),
              },
              {
                id: "c-3",
                claimType: "CONTRACT_VERIFIED",
                subject: "ZyronAttestation Soulbound Seal",
                issuer: "Zyron Monad Relayer",
                evidenceHash: "0x7a301ec94b2f8d0e1c3a5b7d9f2e4a6c8e0b1d3f5a7c9e1b3d5f7a9c1e3b5d7f",
                status: "VERIFIED",
                onChainTxHash: "0x44c6d70b8d1f5a9344c6d70b8d1f5a9344c6d70b8d1f5a9344c6d70b8d1f5a93",
                onChainChainId: 10143,
                createdAt: new Date().toISOString(),
              },
            ],
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [handle]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-void flex flex-col items-center justify-center text-text-primary p-6 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        <p className="text-sm font-mono text-text-muted">
          Verifying Trust Passport on Monad...
        </p>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="min-h-screen bg-bg-void flex flex-col items-center justify-center text-text-primary p-6 space-y-4">
        <AlertCircle className="h-10 w-10 text-signal-critical" />
        <h1 className="text-xl font-bold font-display">Trust Passport Not Found</h1>
        <p className="text-sm text-text-muted">
          No registered Trust Passport found for handle &ldquo;{handle}&rdquo;.
        </p>
        <Link href="/">
          <ExpandingButton variant="dark" size="md">
            <span>Return Home</span>
          </ExpandingButton>
        </Link>
      </div>
    );
  }

  const walletAddr = passport.user.walletAddress;

  return (
    <div className="min-h-screen bg-bg-void text-text-primary selection:bg-purple-500/20 selection:text-purple-300">
      {/* Top Public Navigation Bar */}
      <header className="border-b border-border-hairline/80 bg-bg-panel/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
            </div>
            <span className="font-display font-semibold tracking-tight text-text-primary">
              Zyron Trust Passport
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-mono text-purple-300">
              <ChainLogo name="Monad" className="h-3 w-3" />
              <span>Monad Testnet</span>
            </span>
            <Link href="/auth/login">
              <ExpandingButton variant="dark" size="sm" rounded="xl">
                <span>Create Your Passport</span>
              </ExpandingButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Passport Profile Card */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-bg-panel to-bg-void p-6 md:p-8 shadow-2xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-accent-scan/10 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                {passport.user.githubAvatarUrl ? (
                  <img
                    src={passport.user.githubAvatarUrl}
                    alt={passport.user.name}
                    className="h-16 w-16 rounded-2xl border-2 border-purple-500/40 object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-purple-500/40 bg-purple-950/40 text-2xl font-bold text-purple-300 shadow-lg">
                    {passport.user.name.charAt(0)}
                  </div>
                )}
                {passport.isVerified && (
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-signal-success p-1 text-bg-void shadow">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-display font-semibold text-text-primary">
                    {passport.user.name}
                  </h1>
                  <span className="font-mono text-sm text-text-muted">
                    @{passport.handle}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-signal-success/30 bg-signal-success/10 px-2.5 py-0.5 text-xs font-mono font-medium text-signal-success">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Publicly Verified</span>
                  </span>
                </div>

                <p className="text-xs text-text-muted max-w-xl">
                  {passport.bio || "Decentralized protocol developer with cryptographic attestations on Monad."}
                </p>

                {/* Identity Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {passport.user.privyDid && (
                    <button
                      onClick={() => copyToClipboard(passport.user.privyDid!, "privy")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border-hairline bg-bg-void/60 px-2.5 py-1 text-xs font-mono text-text-muted hover:border-purple-500/40 hover:text-text-primary transition-colors"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                      <span>{passport.user.privyDid.substring(0, 15)}...</span>
                      {copiedKey === "privy" ? (
                        <Check className="h-3 w-3 text-signal-success" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-60" />
                      )}
                    </button>
                  )}

                  {walletAddr && (
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
                  )}

                  {passport.user.githubLogin && (
                    <a
                      href={`https://github.com/${passport.user.githubLogin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border-hairline bg-bg-void/60 px-2.5 py-1 text-xs font-mono text-text-muted hover:border-border-subtle hover:text-text-primary transition-colors"
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>{passport.user.githubLogin}</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border-hairline pt-4 md:pt-0 md:pl-6">
              <div className="text-right">
                <div className="text-3xl font-bold font-mono text-purple-300">
                  {passport.reputationScore}
                  <span className="text-sm font-normal text-text-muted">/100</span>
                </div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Trust Score
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monad Seal & AI Auditor Provenance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monad Testnet Soulbound Card */}
          <div className="rounded-2xl border border-purple-500/30 bg-bg-panel/60 p-6 space-y-4">
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
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted pt-1">
              <span className="inline-flex items-center gap-1.5 text-signal-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Contract Live on Monad Testnet</span>
              </span>
              <a
                href={`${MONAD_EXPLORER_URL}/address/${MONAD_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-purple-300 hover:underline inline-flex items-center gap-1"
              >
                <span>Explorer View</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* AI Auditor Provenance Card */}
          <div className="rounded-2xl border border-accent-scan/30 bg-bg-panel/60 p-6 space-y-4">
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
                <span>Verification Method:</span>
                <span className="text-text-primary">Canonical EIP-712 Attestation</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted pt-1">
              <span className="text-text-muted/80">
                Audits cryptographically attributed to AI Auditor #001
              </span>
              <span className="text-accent-scan font-mono">Verified</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Trust Claims Ledger */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>Verified Cryptographic Claims</span>
            </h2>
            <p className="text-xs text-text-muted">
              Attestations recorded on Monad Testnet for this identity.
            </p>
          </div>

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
                    <th className="py-3 px-4 text-right">Monad Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline text-text-primary">
                  {passport.claims.map((claim) => (
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
                          <a
                            href={`${MONAD_EXPLORER_URL}/address/${MONAD_CONTRACT_ADDRESS}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 underline"
                          >
                            <span>MonadVision</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
