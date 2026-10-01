"use client";

import * as React from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Key,
  ShieldCheck,
  Cpu,
  Bell,
  Save,
  CheckCircle2,
  Terminal,
  User,
  ArrowLeft,
  Shield,
  Lock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AuditorSettingsPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedFeedback, setSavedFeedback] = React.useState(false);

  const [signingAddress, setSigningAddress] = React.useState(
    user?.walletAddress || "0x71C...8942 (EIP-712 Attestation Key)"
  );
  const [compilerTarget, setCompilerTarget] = React.useState("solc v0.8.20 / v0.8.24");
  const [fuzzRuns, setFuzzRuns] = React.useState("10000");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedFeedback(true);
      toast.success("Auditor workbench settings saved and synchronized.");
      setTimeout(() => setSavedFeedback(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 font-sans">
      {/* ─── 1. TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
            <span>Auditor Workspace</span>
            <span>/</span>
            <span className="text-text-primary font-medium">Settings</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Auditor Workbench & Signing Configuration
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Operational Profile
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            Configure EIP-712 attestation signing keys, deterministic AST compiler passes, and personal reviewer credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Badge severity="resolved" size="sm">
            HSM Key Sealed
          </Badge>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-4 rounded-xl bg-signal-resolved/10 border border-signal-resolved/30 text-signal-resolved text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Auditor settings saved and synchronized with local workspace environment.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ─── CARD 1: PROFILE & IDENTITY ─── */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-accent-scan" />
                <h3 className="font-display text-sm font-bold text-text-primary">
                  Auditor Identity & Role Credentials
                </h3>
              </div>
              <Badge severity="informational" size="sm">
                SESSION ACTIVE
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">
                  AUDITOR IDENTIFIER / HANDLE
                </label>
                <Input
                  value={user?.name || user?.auditorHandle || "0xAuditor_K4"}
                  disabled
                  className="text-xs bg-[#F8F9FA] dark:bg-bg-void/50 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">
                  VERIFIED AUDITOR EMAIL
                </label>
                <Input
                  value={user?.email || "auditor@zyron.labs"}
                  disabled
                  className="text-xs bg-[#F8F9FA] dark:bg-bg-void/50 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          <div className="px-5 py-3 text-xs text-text-muted font-sans rounded-b-2xl">
            Identity verified under senior security auditor credential registry.
          </div>
        </div>

        {/* ─── CARD 2: CRYPTOGRAPHIC SIGNING KEY (EIP-712) ─── */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-accent-scan" />
                <h3 className="font-display text-sm font-bold text-text-primary">
                  Attestation Signing Key (EIP-712)
                </h3>
              </div>
              <Badge severity="resolved" size="sm">
                SEALED IN HARDWARE HSM
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary block">
                PUBLIC SIGNER ADDRESS
              </label>
              <Input
                value={signingAddress}
                onChange={(e) => setSigningAddress(e.target.value)}
                className="text-xs font-mono rounded-xl"
              />
              <p className="text-xs text-text-muted leading-relaxed">
                This public key is permanently bound to report PDF checksums and on-chain attestation certificates published to the Zyron registry.
              </p>
            </div>
          </div>

          <div className="px-5 py-3 text-xs text-text-muted font-sans rounded-b-2xl flex items-center justify-between">
            <span>Cryptographic Spec: EIP-712 Structured Data</span>
            <span className="text-[11px] font-semibold text-signal-resolved">Hardware Protected</span>
          </div>
        </div>

        {/* ─── CARD 3: AST SCANNER & INVARIANT RUNTIME DEFAULTS ─── */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-accent-scan" />
                <h3 className="font-display text-sm font-bold text-text-primary">
                  AST Engine & Foundry Invariant Defaults
                </h3>
              </div>
              <span className="text-xs text-text-muted font-medium">LOCAL RUNTIME</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  DEFAULT SOLC COMPILER TARGET
                </label>
                <Input
                  value={compilerTarget}
                  onChange={(e) => setCompilerTarget(e.target.value)}
                  className="text-xs font-mono rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  FOUNDRY FUZZ RUNS PER TARGET
                </label>
                <Input
                  value={fuzzRuns}
                  onChange={(e) => setFuzzRuns(e.target.value)}
                  className="text-xs font-mono rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="px-5 py-3 text-xs text-text-muted font-sans rounded-b-2xl flex items-center justify-between">
            <span>Deterministic Bytecode Verification Passes</span>
            <span className="text-[11px] text-accent-scan font-semibold">14 Taint Analyzers</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <ExpandingButton
            type="submit"
            variant="accent"
            rounded="xl"
            size="md"
            disabled={isSaving}
            icon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          >
            {isSaving ? "Saving Configuration..." : "Save Configuration"}
          </ExpandingButton>
        </div>
      </form>
    </div>
  );
}
