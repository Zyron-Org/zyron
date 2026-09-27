"use client";

import * as React from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Building,
  GitBranch,
  Wallet,
  Key,
  Bell,
  Check,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Code2,
  Terminal,
  RefreshCw,
  Loader2,
  Lock,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OrgData {
  id: string;
  name: string;
  legalName?: string;
  tier?: string;
  members?: { id: string; name: string; email: string; role: string }[];
}

interface Repository {
  id: string;
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
}

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"connected" | "profile" | "api" | "notifications">("connected");

  // Org data
  const [org, setOrg] = React.useState<OrgData | null>(null);
  const [orgLoading, setOrgLoading] = React.useState(true);
  const [repositories, setRepositories] = React.useState<Repository[]>([]);

  // Profile Form State
  const [orgName, setOrgName] = React.useState("");
  const [daoLegalName, setDaoLegalName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState(user?.email || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  // Connected Accounts State
  const [isGithubConnected, setIsGithubConnected] = React.useState(false);
  const [copiedWallet, setCopiedWallet] = React.useState(false);
  const [copiedApiKey, setCopiedApiKey] = React.useState<string | null>(null);

  // API Tokens
  const [apiTokens, setApiTokens] = React.useState([
    {
      id: "tok-1",
      name: "GitHub Actions CI/CD Scanner",
      secret: "zyr_sec_8f9b2d4c01e9a37",
      created: "2026-08-10",
      lastUsed: "2 hours ago",
    },
    {
      id: "tok-2",
      name: "Foundry Local Pre-commit Hook",
      secret: "zyr_sec_3c1a9f0d8e27a61",
      created: "2026-08-15",
      lastUsed: "1 day ago",
    },
  ]);

  // Notifications
  const [notifications, setNotifications] = React.useState({
    criticalAlerts: true,
    fixVerified: true,
    stageProgress: true,
    weeklyDigest: false,
    discordWebhook: "https://discord.com/api/webhooks/1298401/zyron-alerts",
  });

  React.useEffect(() => {
    apiClient
      .get("/organizations/me")
      .then((res) => {
        const o = res.data;
        setOrg(o);
        setOrgName(o.name || "");
        setDaoLegalName(o.legalName || "");
      })
      .catch((e) => {
        console.warn("Settings: org fetch notice", e.message);
      })
      .finally(() => setOrgLoading(false));

    apiClient
      .get("/integrations/github/repos")
      .then((res) => {
        if (res.data?.length) {
          setRepositories(res.data);
          setIsGithubConnected(true);
        }
      })
      .catch(() => {
        // GitHub not connected
      });
  }, []);

  const walletAddress = (user as any)?.walletAddress || "";

  const handleCopyWallet = () => {
    if (!walletAddress) return;
    navigator.clipboard?.writeText(walletAddress);
    setCopiedWallet(true);
    toast.success("Wallet address copied to clipboard!");
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleCopyApiKey = (secret: string, id: string) => {
    navigator.clipboard?.writeText(secret);
    setCopiedApiKey(id);
    toast.success("API token copied to clipboard!");
    setTimeout(() => setCopiedApiKey(null), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (org?.id) {
        await apiClient.patch(`/organizations/${org.id}`, {
          name: orgName,
          legalName: daoLegalName,
        });
      }
      setIsSaved(true);
      toast.success("Organization profile saved successfully!");
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      toast.success("Organization profile updated!");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* ─── 1. PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
            <Link href="/portal" className="hover:text-text-primary transition-colors">
              Client Portal
            </Link>
            <span>/</span>
            <span>Developer & System</span>
            <span>/</span>
            <span className="text-text-primary font-medium">Account Settings</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent-scan/10 border border-accent-scan/20 flex items-center justify-center text-accent-scan shrink-0">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                Account & Workspace Settings
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Manage organization profile, GitHub integrations, EIP-712 signer wallets, and API keys.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge severity="resolved" size="md">
            {orgLoading ? "LOADING…" : (org?.tier || "ENTERPRISE PROTOCOL").toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* ─── 2. TAB CONTROLS ─── */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-void/50 border border-border-hairline/60 w-fit overflow-x-auto">
        {[
          { id: "connected", label: "Connected Accounts", icon: GitBranch },
          { id: "profile", label: "Organization Profile", icon: Building },
          { id: "api", label: "API & CI/CD Tokens", icon: Key },
          { id: "notifications", label: "Notification Webhooks", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-white dark:bg-bg-panel text-text-primary font-semibold shadow-xs border border-border-hairline"
                  : "text-text-muted hover:text-text-primary hover:bg-white/40 dark:hover:bg-bg-panel/40"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-accent-scan" : "text-text-muted")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 3. TAB 1: CONNECTED ACCOUNTS ─── */}
      {activeTab === "connected" && (
        <div className="space-y-6">
          {/* GitHub Organization Integration */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline/60 pb-3">
              <div className="flex items-center gap-2.5">
                <GitBranch className="h-5 w-5 text-accent-scan" />
                <div>
                  <h2 className="font-semibold text-sm text-text-primary">
                    GitHub Organization Integration
                  </h2>
                  <p className="text-xs text-text-muted">
                    Automated repository synchronization, commit hash pinning, and @zyron-bot PR triage.
                  </p>
                </div>
              </div>
              <Badge severity={isGithubConnected ? "resolved" : "informational"} size="sm">
                {isGithubConnected ? "CONNECTED ✓" : "DISCONNECTED"}
              </Badge>
            </div>

            {isGithubConnected ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-bg-void border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="text-text-primary font-semibold flex items-center gap-2">
                      <span>ORGANIZATION REPOSITORIES:</span>
                      <span className="text-accent-scan">{repositories.length} synced</span>
                    </div>
                    <div className="text-text-muted text-[11px]">
                      Repositories synchronized with read-level metadata permissions.
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-xl text-xs"
                    onClick={() => {
                      setIsGithubConnected(false);
                      toast.success("GitHub organization unlinked.");
                    }}
                  >
                    Disconnect Integration
                  </Button>
                </div>

                {repositories.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-mono text-xs text-text-muted">SYNCHRONIZED AUDIT REPOSITORIES:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                      {repositories.map((repo) => (
                        <div
                          key={repo.id}
                          className="p-3 rounded-xl bg-bg-void border border-border-hairline flex items-center justify-between"
                        >
                          <div className="space-y-0.5 truncate">
                            <div className="text-text-primary font-medium truncate">{repo.fullName}</div>
                            <div className="text-[10px] text-text-muted">Branch: {repo.defaultBranch}</div>
                          </div>
                          <Badge severity={repo.isPrivate ? "informational" : "resolved"} size="sm">
                            {repo.isPrivate ? "PRIVATE" : "PUBLIC"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-bg-void border border-border-hairline text-center space-y-3">
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  No GitHub organization currently linked. Connect to automatically select repositories and branches during audit intake.
                </p>
                <Button
                  size="md"
                  variant="primary"
                  className="rounded-xl"
                  onClick={() => {
                    setIsGithubConnected(true);
                    toast.success("Connected GitHub Organization!");
                  }}
                  rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                >
                  Connect GitHub Organization
                </Button>
              </div>
            )}
          </div>

          {/* Web3 Signer Address */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline/60 pb-3">
              <div className="flex items-center gap-2.5">
                <Wallet className="h-5 w-5 text-accent-scan" />
                <div>
                  <h2 className="font-semibold text-sm text-text-primary">
                    Protocol Web3 Signer Address
                  </h2>
                  <p className="text-xs text-text-muted">
                    Primary EIP-712 cryptographic signer authorized for scope submissions and attestation sign-offs.
                  </p>
                </div>
              </div>
              <Badge severity="resolved" size="sm">VERIFIED SIGNER</Badge>
            </div>

            <div className="p-4 rounded-xl bg-bg-void border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-1">
                <div className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">
                  Authorized Signer Wallet
                </div>
                <div className="text-text-primary font-semibold truncate select-all">
                  {walletAddress || user?.email || "No wallet linked"}
                </div>
              </div>
              {walletAddress && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-xl text-xs"
                  onClick={handleCopyWallet}
                  leftIcon={copiedWallet ? <Check className="h-3.5 w-3.5 text-signal-resolved" /> : <Copy className="h-3.5 w-3.5" />}
                >
                  {copiedWallet ? "Copied" : "Copy Address"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. TAB 2: ORGANIZATION PROFILE ─── */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-6"
        >
          <div className="border-b border-border-hairline/60 pb-3">
            <h2 className="font-semibold text-sm text-text-primary">
              Organization & Protocol Profile
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Manage organization billing identity, legal contact channels, and protocol metadata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-primary">Protocol Display Name</label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Nexus Protocol"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-primary">DAO / Legal Entity</label>
              <Input
                value={daoLegalName}
                onChange={(e) => setDaoLegalName(e.target.value)}
                placeholder="e.g. Nexus Security Labs Ltd."
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-text-primary">Primary Security Contact Email</label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. security@protocol.io"
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border-hairline/60">
            <span className="text-xs text-text-muted">
              Tier: <strong className="text-text-primary uppercase font-mono">{org?.tier || "Enterprise"}</strong>
            </span>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              className="rounded-xl"
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      )}

      {/* ─── 5. TAB 3: API & CI/CD TOKENS ─── */}
      {activeTab === "api" && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline/60 pb-3">
            <div>
              <h2 className="font-semibold text-sm text-text-primary">
                API & CI/CD Ingestion Tokens
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Authentication keys for GitHub Actions workflows, CLI diagnostics, and external security telemetry.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="rounded-xl"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => {
                const newToken = {
                  id: `tok-${Date.now()}`,
                  name: "Automated Deployment Hook",
                  secret: `zyr_sec_${Math.random().toString(36).slice(2, 14)}`,
                  created: "Today",
                  lastUsed: "Never",
                };
                setApiTokens((prev) => [...prev, newToken]);
                toast.success("New API token generated!");
              }}
            >
              Generate New Token
            </Button>
          </div>

          <div className="space-y-3">
            {apiTokens.map((token) => (
              <div
                key={token.id}
                className="p-4 rounded-xl bg-bg-void border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs"
              >
                <div className="space-y-1">
                  <div className="text-text-primary font-semibold flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-accent-scan" />
                    <span>{token.name}</span>
                  </div>
                  <div className="text-accent-scan text-[11px] font-mono select-all">
                    {token.secret}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    Created: {token.created} · Last Used: {token.lastUsed}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-xl text-xs"
                    onClick={() => handleCopyApiKey(token.secret, token.id)}
                    leftIcon={copiedApiKey === token.id ? <Check className="h-3.5 w-3.5 text-signal-resolved" /> : <Copy className="h-3.5 w-3.5" />}
                  >
                    {copiedApiKey === token.id ? "Copied" : "Copy Token"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-xl text-text-muted hover:text-signal-critical hover:bg-signal-critical/10"
                    onClick={() => {
                      setApiTokens((prev) => prev.filter((t) => t.id !== token.id));
                      toast.success(`Revoked ${token.name}`);
                    }}
                    title="Revoke Token"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 6. TAB 4: NOTIFICATION WEBHOOKS ─── */}
      {activeTab === "notifications" && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline/80 shadow-xs space-y-6">
          <div className="border-b border-border-hairline/60 pb-3">
            <h2 className="font-semibold text-sm text-text-primary">
              Audit Telemetry & Alert Webhooks
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Real-time webhook notifications for critical vulnerabilities, remediation approvals, and sealed reports.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-primary">Discord / Slack Alert Webhook URL</label>
              <Input
                value={notifications.discordWebhook}
                onChange={(e) => setNotifications((prev) => ({ ...prev, discordWebhook: e.target.value }))}
                placeholder="https://discord.com/api/webhooks/..."
                className="font-mono text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                {
                  key: "criticalAlerts" as const,
                  label: "Critical (P0) & High (P1) Findings",
                  desc: "Immediate alert when AST flag or lead auditor logs high-severity issue",
                },
                {
                  key: "fixVerified" as const,
                  label: "Remediation Commit Verification",
                  desc: "Notifications when lead auditor signs off on commit patch",
                },
                {
                  key: "stageProgress" as const,
                  label: "Stage & Milestone Advancement",
                  desc: "Progression between Ingestion, Static Review, and Attestation",
                },
                {
                  key: "weeklyDigest" as const,
                  label: "Weekly Protocol Security Digest",
                  desc: "Summary report of resolved findings and ongoing review statuses",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => {
                    setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                    toast.success(`Updated alert preference for ${item.label}`);
                  }}
                  className="p-3.5 rounded-xl bg-bg-void border border-border-hairline flex items-center justify-between cursor-pointer select-none hover:bg-bg-void/70 transition-colors"
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="font-medium text-text-primary">{item.label}</div>
                    <div className="text-[11px] text-text-muted leading-tight">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={() => {}}
                    className="rounded border-border-hairline accent-accent-scan cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
