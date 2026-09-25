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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";

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
  const [activeTab, setActiveTab] = React.useState<"profile" | "connected" | "api" | "notifications">("connected");

  // Org data
  const [org, setOrg] = React.useState<OrgData | null>(null);
  const [orgLoading, setOrgLoading] = React.useState(true);
  const [repositories, setRepositories] = React.useState<Repository[]>([]);

  // Profile Form State
  const [orgName, setOrgName] = React.useState("");
  const [daoLegalName, setDaoLegalName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState(user?.email || "");
  const [isSaved, setIsSaved] = React.useState(false);

  // Connected Accounts State
  const [isGithubConnected, setIsGithubConnected] = React.useState(false);
  const [copiedWallet, setCopiedWallet] = React.useState(false);
  const [copiedApiKey, setCopiedApiKey] = React.useState(false);

  // API Tokens (local management only — no backend token API yet)
  const [apiTokens, setApiTokens] = React.useState([
    {
      id: "tok-1",
      name: "GitHub Actions CI/CD Scanner",
      secret: "zam_sec_8f9b2d4c01e9a37",
      created: "2026-08-10",
      lastUsed: "2 hours ago",
    },
    {
      id: "tok-2",
      name: "Foundry Local Pre-commit Hook",
      secret: "zam_sec_3c1a9f0d8e27a61",
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
    discordWebhook: "",
  });

  React.useEffect(() => {
    // Fetch org data
    apiClient
      .get("/organizations/me")
      .then((res) => {
        const o = res.data;
        setOrg(o);
        setOrgName(o.name || "");
        setDaoLegalName(o.legalName || "");
      })
      .catch((e) => {
        console.warn("Settings: org fetch error", e.message);
      })
      .finally(() => setOrgLoading(false));

    // Fetch GitHub repos if connected
    apiClient
      .get("/integrations/github/repos")
      .then((res) => {
        if (res.data?.length) {
          setRepositories(res.data);
          setIsGithubConnected(true);
        }
      })
      .catch(() => {
        // GitHub not connected — that's fine
      });
  }, []);

  const walletAddress = (user as any)?.walletAddress || "";

  const handleCopyWallet = () => {
    navigator.clipboard?.writeText(walletAddress);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleCopyApiKey = (secret: string) => {
    navigator.clipboard?.writeText(secret);
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org?.id) return;
    try {
      await apiClient.patch(`/organizations/${org.id}`, {
        name: orgName,
        legalName: daoLegalName,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      console.error("Settings: save error", err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-hairline pb-4">
        <div>
          <Eyebrow size="sm" variant="scan" prefix="// CLIENT_WORKSPACE · ">
            ORGANIZATION_SETTINGS
          </Eyebrow>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            Account & Security Settings
          </h1>
        </div>
        <div className="font-mono text-xs text-text-muted">
          TIER // {orgLoading ? "…" : (org?.tier || "ENTERPRISE").toUpperCase()}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-border-hairline font-mono text-xs overflow-x-auto pb-px">
        {[
          { id: "connected", label: "CONNECTED ACCOUNTS", icon: GitBranch },
          { id: "profile", label: "ORGANIZATION PROFILE", icon: Building },
          { id: "api", label: "API & CI/CD TOKENS", icon: Key },
          { id: "notifications", label: "NOTIFICATION WEBHOOKS", icon: Bell },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "border-accent-scan text-accent-scan bg-bg-panel/40"
                  : "border-transparent text-text-muted hover:text-text-primary hover:bg-bg-panel/20"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CONNECTED ACCOUNTS */}
      {activeTab === "connected" && (
        <div className="space-y-6">
          {/* GitHub Organization Integration */}
          <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-display text-base font-semibold text-text-primary">
                  <GitBranch className="h-4 w-4 text-accent-scan" />
                  <span>GitHub Organization Integration</span>
                </div>
                <p className="text-xs text-text-muted font-mono">
                  Repository tree access and automatic commit hash pinning for audit requests.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                {isGithubConnected ? (
                  <Badge severity="resolved" size="sm">CONNECTED ✓</Badge>
                ) : (
                  <Badge severity="informational" size="sm">DISCONNECTED</Badge>
                )}
              </div>
            </div>

            {isGithubConnected ? (
              <div className="space-y-4">
                <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1">
                    <div className="text-text-primary font-semibold flex items-center gap-2">
                      <span>REPOSITORIES:</span>
                      <span className="text-accent-scan">{repositories.length} synced</span>
                    </div>
                    <div className="text-text-muted text-[11px]">
                      {repositories.length} active smart contract repositories synchronized
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" onClick={() => setIsGithubConnected(false)}>
                      Disconnect Organization
                    </Button>
                  </div>
                </div>

                {repositories.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-mono text-xs text-text-muted">SYNCHRONIZED AUDIT REPOSITORIES:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                      {repositories.map((repo) => (
                        <div
                          key={repo.id}
                          className="p-3 rounded-[4px] bg-bg-void border border-border-hairline flex items-center justify-between"
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
              <div className="p-6 rounded-[4px] bg-bg-void border border-border-hairline text-center space-y-3">
                <p className="text-xs font-mono text-text-muted">
                  No GitHub organization currently linked. Connect to automatically select repositories
                  during new audit intake.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsGithubConnected(true)}
                  rightIcon={<ExternalLink className="h-3 w-3" />}
                >
                  Connect GitHub Organization
                </Button>
              </div>
            )}
          </div>

          {/* Web3 Protocol Signer Account */}
          <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-display text-base font-semibold text-text-primary">
                  <Wallet className="h-4 w-4 text-accent-scan" />
                  <span>Protocol Web3 Signer Address</span>
                </div>
                <p className="text-xs text-text-muted font-mono">
                  Primary EIP-712 cryptographic signer authorized for scope submissions and attestation approvals.
                </p>
              </div>
              <Badge severity="resolved" size="sm">VERIFIED SIGNER</Badge>
            </div>

            <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-1">
                <div className="text-text-muted text-[10px]">AUTHORIZED SIGNER WALLET</div>
                <div className="text-text-primary font-semibold truncate select-all">
                  {walletAddress || user?.email || "No wallet linked"}
                </div>
              </div>
              {walletAddress && (
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleCopyWallet}
                    className="px-2.5 py-1 rounded-[2px] bg-bg-panel border border-border-hairline text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 text-[11px]"
                  >
                    {copiedWallet ? (
                      <>
                        <Check className="h-3 w-3 text-signal-resolved" />
                        <span className="text-signal-resolved">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORGANIZATION PROFILE */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6"
        >
          <div className="border-b border-border-hairline pb-3">
            <h2 className="font-display text-base font-semibold text-text-primary">
              Organization & Protocol Profile
            </h2>
            <p className="text-xs text-text-muted font-mono">
              Manage organization billing identity, contact channels, and protocol metadata.
            </p>
          </div>

          {orgLoading ? (
            <div className="flex items-center gap-2 text-text-muted font-mono text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading organization profile…
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-muted">PROTOCOL DISPLAY NAME</label>
                <Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. My Protocol"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-muted">DAO / LEGAL ENTITY</label>
                <Input
                  value={daoLegalName}
                  onChange={(e) => setDaoLegalName(e.target.value)}
                  placeholder="e.g. Protocol Labs Ltd."
                  required
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-mono text-xs text-text-muted">PRIMARY SECURITY CONTACT EMAIL</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. security@protocol.io"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border-hairline font-mono text-xs">
            {isSaved ? (
              <span className="text-signal-resolved flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                Profile updated successfully.
              </span>
            ) : (
              <span className="text-text-muted text-[11px]">
                Tier: {org?.tier || "Enterprise"} Protocol Scope
              </span>
            )}
            <Button type="submit" variant="primary" size="md" disabled={orgLoading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: API & CI/CD TOKENS */}
      {activeTab === "api" && (
        <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-3">
            <div>
              <h2 className="font-display text-base font-semibold text-text-primary">
                API & CI/CD Ingestion Tokens
              </h2>
              <p className="text-xs text-text-muted font-mono">
                Tokens used by GitHub Actions and Foundry hooks for automated pre-deployment scanning.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => {
                const newToken = {
                  id: `tok-${Date.now()}`,
                  name: "Automated Deployment Hook",
                  secret: `zam_sec_${Math.random().toString(36).slice(2, 14)}`,
                  created: "Today",
                  lastUsed: "Never",
                };
                setApiTokens((prev) => [...prev, newToken]);
              }}
            >
              Generate New Token
            </Button>
          </div>

          <div className="space-y-3">
            {apiTokens.map((token) => (
              <div
                key={token.id}
                className="p-4 rounded-[4px] bg-bg-void border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs"
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
                  <button
                    onClick={() => handleCopyApiKey(token.secret)}
                    className="px-2.5 py-1 rounded-[2px] bg-bg-panel border border-border-hairline text-text-muted hover:text-text-primary transition-colors text-[11px]"
                  >
                    Copy Token
                  </button>
                  <button
                    onClick={() => setApiTokens((prev) => prev.filter((t) => t.id !== token.id))}
                    className="p-1 rounded text-text-muted hover:text-signal-critical transition-colors"
                    title="Revoke Token"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATION WEBHOOKS */}
      {activeTab === "notifications" && (
        <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-3">
            <h2 className="font-display text-base font-semibold text-text-primary">
              Audit Telemetry & Alert Webhooks
            </h2>
            <p className="text-xs text-text-muted font-mono">
              Configure real-time automated dispatch for vulnerability candidate detections and stage transitions.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted">DISCORD / SLACK ALERT WEBHOOK URL</label>
              <Input
                value={notifications.discordWebhook}
                onChange={(e) => setNotifications((prev) => ({ ...prev, discordWebhook: e.target.value }))}
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>

            <div className="space-y-3 pt-2 font-mono text-xs">
              {[
                {
                  key: "criticalAlerts" as const,
                  label: "Critical (P0) & High (P1) Vulnerability Detections",
                  desc: "Immediate webhook dispatch upon AST flag or lead auditor candidate triage",
                },
                {
                  key: "fixVerified" as const,
                  label: "Remediation Commit Re-Verification Updates",
                  desc: "Alerts when auditor verifies and resolves a submitted commit hash",
                },
                {
                  key: "stageProgress" as const,
                  label: "Pipeline Stage & Milestone Progression",
                  desc: "Transitions between Intake, Scanning, Manual Review, and Attestation",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() =>
                    setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                  }
                  className="p-3 rounded-[4px] bg-bg-void border border-border-hairline flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="space-y-0.5">
                    <div className="text-text-primary font-semibold">{item.label}</div>
                    <div className="text-[11px] text-text-muted">{item.desc}</div>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-[2px] border flex items-center justify-center ${
                      notifications[item.key]
                        ? "bg-accent-scan border-accent-scan text-bg-void"
                        : "border-border-hairline"
                    }`}
                  >
                    {notifications[item.key] && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
