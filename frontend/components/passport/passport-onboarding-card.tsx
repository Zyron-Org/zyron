"use client";

import * as React from "react";
import { ShieldCheck, Sparkles, Key, Bot, Shield, CheckCircle2 } from "lucide-react";
import { PrivyConnectButton } from "./privy-connect-button";

export function PassportOnboardingCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-bg-panel to-bg-void p-6 md:p-8 shadow-xl">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-accent-scan/10 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-mono font-medium text-purple-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Monad Metropolis Identity</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-semibold text-text-primary tracking-tight">
            Create your Zyron Trust Passport
          </h2>

          <p className="text-sm text-text-muted leading-relaxed">
            One-click identity verified by Privy with an instant embedded wallet on Monad Testnet.
            Anchor your smart contracts, security audits, AI auditor credentials, and cryptographic evidence directly on-chain.
          </p>

          {/* Value Props */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-signal-success shrink-0" />
              <span>Embedded Monad Wallet</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-signal-success shrink-0" />
              <span>AI Auditor #001 Provenance</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-signal-success shrink-0" />
              <span>Soulbound Seal (ERC-721)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-2">
          <PrivyConnectButton
            label="Continue with Privy"
            variant="dark"
            size="lg"
            className="w-full sm:w-auto px-6 cursor-pointer"
          />
          <span className="text-[11px] text-text-muted/70 font-mono">
            No browser extension or gas required
          </span>
        </div>
      </div>
    </div>
  );
}
