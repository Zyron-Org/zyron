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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export default function AuditorSettingsPage() {
  const { user } = useAuth();
  const [savedFeedback, setSavedFeedback] = React.useState(false);

  const [signingAddress, setSigningAddress] = React.useState(
    user?.walletAddress || "0x71C...8942 (EIP-712 Attestation Key)"
  );
  const [compilerTarget, setCompilerTarget] = React.useState("solc v0.8.20 / v0.8.24");
  const [fuzzRuns, setFuzzRuns] = React.useState("10000");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-accent-scan" />
            <h1 className="font-display text-base font-semibold text-text-primary">
              Auditor Workbench & Signing Configuration
            </h1>
          </div>
          <p className="text-text-muted text-[11px]">
            Configure EIP-712 attestation signing keys and automated AST compiler passes.
          </p>
        </div>

        <Badge severity="informational" size="sm">
          OPERATIONAL PROFILE
        </Badge>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border-hairline pb-3">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <User className="h-4 w-4 text-accent-scan" />
              <span>Auditor Persona & Role Credentials</span>
            </div>
            <span className="text-[10px] text-text-muted">SESSION ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-text-muted text-[11px]">AUDITOR IDENTIFIER</label>
              <Input value={user?.name || "Auditor"} disabled className="text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-text-muted text-[11px]">EMAIL / ENCRYPTED COMM</label>
              <Input value={user?.email || "auditor@zyron.org"} disabled className="text-xs" />
            </div>
          </div>
        </div>

        {/* Cryptographic Attestation Key Card */}
        <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border-hairline pb-3">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <Key className="h-4 w-4 text-accent-scan" />
              <span>Attestation Signing Key (EIP-712)</span>
            </div>
            <Badge severity="resolved" size="sm">
              SEALED IN HARDWARE HSM
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-text-muted text-[11px]">PUBLIC SIGNER ADDRESS</label>
            <Input
              value={signingAddress}
              onChange={(e) => setSigningAddress(e.target.value)}
              className="text-xs font-mono"
            />
            <p className="text-[10px] text-text-muted font-sans">
              This cryptographic key is used to sign final SHA-256 PDF & on-chain attestation deliverables.
            </p>
          </div>
        </div>

        {/* Engine Defaults */}
        <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border-hairline pb-3">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <Cpu className="h-4 w-4 text-accent-scan" />
              <span>AST Scanner & Invariant Defaults</span>
            </div>
            <span className="text-[10px] text-text-muted">LOCAL RUNTIME</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-text-muted text-[11px]">DEFAULT SOLC COMPILER</label>
              <Input
                value={compilerTarget}
                onChange={(e) => setCompilerTarget(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-muted text-[11px]">FOUNDRY FUZZ RUNS PER TARGET</label>
              <Input
                value={fuzzRuns}
                onChange={(e) => setFuzzRuns(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {savedFeedback && (
          <div className="p-3 rounded-[3px] bg-signal-resolved/10 border border-signal-resolved/30 text-signal-resolved text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Auditor settings saved and synchronized with local workspace.</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
