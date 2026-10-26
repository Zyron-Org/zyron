"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Terminal,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketParam = searchParams.get("ticketId") || searchParams.get("auditId") || searchParams.get("id") || "";

  const { user } = useAuth();
  const [audit, setAudit] = React.useState<any>(null);
  const [loadingAudit, setLoadingAudit] = React.useState(true);

  React.useEffect(() => {
    async function loadAudit() {
      try {
        setLoadingAudit(true);
        if (ticketParam) {
          const res = await apiClient.get(`/audits/${ticketParam}`);
          if (res.data) setAudit(res.data);
        } else {
          const res = await apiClient.get("/audits");
          if (Array.isArray(res.data) && res.data.length > 0) {
            setAudit(res.data[0]);
          }
        }
      } catch (err: any) {
        console.warn("Could not load audit:", err.message);
      } finally {
        setLoadingAudit(false);
      }
    }
    loadAudit();
  }, [ticketParam]);

  const currentTicketId = audit?.id || ticketParam || "ZYR-9481";
  const protocolName = audit?.protocolName || user?.organization?.name || "Smart Contract Protocol";

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-hairline pb-4">
        <div>
          <Eyebrow size="sm" variant="scan" prefix="// ACCESS_MODEL · ">
            FREE_PUBLIC_BETA
          </Eyebrow>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            100% Free Public Beta Access
          </h1>
        </div>
        <div className="font-mono text-xs text-text-muted">
          TICKET // #{currentTicketId} · PROTOCOL: {protocolName}
        </div>
      </div>

      {/* Main Free Beta Card */}
      <div className="p-8 rounded-2xl bg-white dark:bg-bg-panel border border-border-hairline shadow-sm space-y-6 text-center">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-signal-resolved/10 border border-signal-resolved/20 flex items-center justify-center text-signal-resolved">
          <Sparkles className="h-8 w-8" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
            No Payment or Escrow Required
          </h2>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            During our current release phase, Zyron smart contract audits, autonomous AI prover simulations, and on-chain Monad Testnet cryptographic attestations are completely complimentary.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 text-left">
          <div className="p-4 rounded-xl bg-bg-void border border-border-hairline space-y-1.5">
            <div className="flex items-center gap-2 text-signal-resolved font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>Full AST Scan</span>
            </div>
            <p className="text-[11px] text-text-muted">
              120+ SWC invariant static rules and compiler diagnostics.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bg-void border border-border-hairline space-y-1.5">
            <div className="flex items-center gap-2 text-signal-resolved font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>AI Sandbox Prover</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Automated Anvil EVM fork exploit synthesis and invariant replay.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bg-void border border-border-hairline space-y-1.5">
            <div className="flex items-center gap-2 text-signal-resolved font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>On-Chain Seal</span>
            </div>
            <p className="text-[11px] text-text-muted">
              EIP-712 cryptographic attestation minted on Monad Testnet.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link href={ticketParam ? `/portal/track/${ticketParam}` : "/portal/track"}>
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Open Live Status Tracker
            </Button>
          </Link>
          <Link href="/portal/new-request">
            <Button variant="outline" size="md">
              Start New Audit Request
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Loading access details...</div>}>
      <CheckoutContent />
    </React.Suspense>
  );
}
