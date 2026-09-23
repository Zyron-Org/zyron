"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Wallet,
  Building,
  Check,
  ArrowRight,
  Lock,
  Layers,
  Clock,
  Terminal,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketParam = searchParams.get("ticketId") || searchParams.get("auditId") || searchParams.get("id") || "";

  const { user } = useAuth();
  const [audit, setAudit] = React.useState<any>(null);
  const [loadingAudit, setLoadingAudit] = React.useState(true);

  const [paymentMethod, setPaymentMethod] = React.useState<"crypto" | "invoice">("crypto");
  const [selectedToken, setSelectedToken] = React.useState<"USDC" | "USDT">("USDC");
  const [selectedNetwork, setSelectedNetwork] = React.useState<"ethereum" | "arbitrum">("ethereum");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  // Corporate Billing form state
  const [companyName, setCompanyName] = React.useState("");
  const [billingEmail, setBillingEmail] = React.useState("");
  const [taxId, setTaxId] = React.useState("EU-948120482");

  React.useEffect(() => {
    if (user) {
      if (user.organization?.name) setCompanyName(user.organization.name);
      else if (user.name) setCompanyName(`${user.name} Organization`);
      if (user.email) setBillingEmail(user.email);
    }
  }, [user]);

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
        console.warn("Could not load audit for checkout:", err.message);
      } finally {
        setLoadingAudit(false);
      }
    }
    loadAudit();
  }, [ticketParam]);

  // Scoped line items matching real audit request
  const currentTicketId = audit?.id || ticketParam || "ZYR-9481";
  const scopedSloc = audit?.sloc || 1482;
  const targetContract = audit?.contractFileName || "Contract.sol";
  const protocolName = audit?.protocolName || user?.organization?.name || "Smart Contract Protocol";
  const gitCommit = audit?.gitCommit ? audit.gitCommit.slice(0, 7) : "8f9b2d4";
  const compilerVersion = audit?.compilerVersion || "v0.8.20";
  const assignedLead = audit?.leadAuditor?.name || "0xAuditor_K4";

  const baseSlocFee = Math.round(scopedSloc * 5.7) || 8500;
  const auditorAllocationFee = 4000;
  const totalAmount = audit?.payment?.amountUsd || (baseSlocFee + auditorAllocationFee);

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmed(true);
    }, 1500);
  };

  if (isConfirmed) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 py-10">
        <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline border-l-2 border-l-signal-resolved space-y-6">
          <div className="flex items-center justify-between border-b border-border-hairline pb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-signal-resolved/10 border border-signal-resolved text-signal-resolved flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div>
                <Eyebrow size="xs" variant="scan" prefix="// PAYMENT_STATUS: ">
                  ESCROW_DEPOSIT_CONFIRMED
                </Eyebrow>
                <h1 className="font-display text-xl font-semibold text-text-primary">
                  Audit Engagement Funded & Dispatched
                </h1>
              </div>
            </div>
            <Badge severity="resolved" size="sm">
              PAID & DISPATCHED
            </Badge>
          </div>

          <p className="text-sm text-text-muted leading-relaxed">
            Deposit of <strong className="text-text-primary">${totalAmount.toLocaleString()} USDC</strong> held in multi-sig escrow (<code className="text-accent-scan font-mono text-xs">0x71C...8e92</code>). Target contract <code className="text-text-primary font-mono text-xs">{targetContract}</code> ({scopedSloc} SLOC) has been dispatched to the automated AST engine queue.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs">
            <div>
              <div className="text-text-muted text-[10px]">TICKET ID</div>
              <div className="text-accent-scan font-bold">#{currentTicketId}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">FEE PAID</div>
              <div className="text-text-primary">${totalAmount.toLocaleString()} USDC</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">ASSIGNED LEAD</div>
              <div className="text-text-primary">{assignedLead}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">INITIAL TRIAGE SLA</div>
              <div className="text-signal-resolved">36–48 Hours</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={`/portal/track/${currentTicketId}`}>
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Open Live Status Tracker
              </Button>
            </Link>
            <Link href="/portal">
              <Button variant="outline" size="md">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-hairline pb-4">
        <div>
          <Eyebrow size="sm" variant="scan" prefix="// CHECKOUT_GATEWAY · ">
            ENGAGEMENT_ESCROW_SETTLEMENT
          </Eyebrow>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            Audit Review Checkout
          </h1>
        </div>
        <div className="font-mono text-xs text-text-muted">
          TICKET // #{currentTicketId} · SCOPE: {scopedSloc} SLOC
        </div>
      </div>

      <form onSubmit={handleConfirmPayment}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: PAYMENT INSTRUMENT SELECTOR */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
              <div className="border-b border-border-hairline pb-3">
                <h3 className="font-display text-base font-semibold text-text-primary">
                  Select Settlement Method
                </h3>
                <p className="text-xs text-text-muted font-mono">
                  Funds held in on-chain dual-sign escrow until automated pass completes.
                </p>
              </div>

              {/* Payment Type Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  className={`p-4 rounded-[4px] border text-left flex items-start gap-3 transition-colors ${
                    paymentMethod === "crypto"
                      ? "border-accent-scan bg-accent-scan/5 text-text-primary"
                      : "border-border-hairline bg-bg-void hover:border-hairline/90 text-text-muted"
                  }`}
                >
                  <Wallet className="h-5 w-5 text-accent-scan shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-xs text-text-primary">Direct Crypto Escrow</div>
                    <div className="text-[11px] text-text-muted">USDC / USDT on Ethereum or Arbitrum</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("invoice")}
                  className={`p-4 rounded-[4px] border text-left flex items-start gap-3 transition-colors ${
                    paymentMethod === "invoice"
                      ? "border-accent-scan bg-accent-scan/5 text-text-primary"
                      : "border-border-hairline bg-bg-void hover:border-hairline/90 text-text-muted"
                  }`}
                >
                  <Building className="h-5 w-5 text-accent-scan shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-xs text-text-primary">Enterprise Invoice</div>
                    <div className="text-[11px] text-text-muted">NET-15 Wire / ACH for DAO Treasuries</div>
                  </div>
                </button>
              </div>

              {/* Crypto Escrow Configuration */}
              {paymentMethod === "crypto" && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    {/* Token Selection */}
                    <div className="space-y-1.5">
                      <label className="text-text-muted text-[11px]">PAYMENT TOKEN</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["USDC", "USDT"] as const).map((token) => (
                          <button
                            key={token}
                            type="button"
                            onClick={() => setSelectedToken(token)}
                            className={`p-2 rounded-[2px] border text-center font-bold ${
                              selectedToken === token
                                ? "border-accent-scan bg-accent-scan/10 text-accent-scan"
                                : "border-border-hairline bg-bg-void text-text-muted"
                            }`}
                          >
                            {token}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Network Selection */}
                    <div className="space-y-1.5">
                      <label className="text-text-muted text-[11px]">SETTLEMENT NETWORK</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["ethereum", "arbitrum"] as const).map((net) => (
                          <button
                            key={net}
                            type="button"
                            onClick={() => setSelectedNetwork(net)}
                            className={`p-2 rounded-[2px] border text-center capitalize font-medium ${
                              selectedNetwork === net
                                ? "border-accent-scan bg-accent-scan/10 text-accent-scan"
                                : "border-border-hairline bg-bg-void text-text-muted"
                            }`}
                          >
                            {net}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-text-muted text-[11px]">
                      <span>MULTI-SIG ESCROW REPOSITORY:</span>
                      <span className="text-accent-scan font-bold">0x71C829034...382E92</span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Upon confirmation, funds are locked in the smart contract escrow. Auditor payouts are released on milestone attestation signatures.
                    </p>
                  </div>
                </div>
              )}

              {/* Corporate Invoice Configuration */}
              {paymentMethod === "invoice" && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="font-mono text-xs text-text-muted">CORPORATE / DAO LEGAL ENTITY</label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Protocol Labs Ltd."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-mono text-xs text-text-muted">FINANCE EMAIL</label>
                      <Input
                        type="email"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        placeholder="finance@protocol.io"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-mono text-xs text-text-muted">VAT / TAX ID</label>
                      <Input
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="e.g. EU-948120482"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 5 COLS: SCOPED REVIEW SUMMARY (CONSUMED FROM NEW AUDIT REQUEST) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
              <div className="border-b border-border-hairline pb-3 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-text-primary">
                  Scoped Review Summary
                </h3>
                <span className="font-mono text-[11px] text-accent-scan font-bold">
                  #{currentTicketId}
                </span>
              </div>

              {/* Target Scope Context */}
              <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline space-y-1 font-mono text-xs">
                <div className="text-text-muted text-[10px]">AUDITED TARGET CONTRACT</div>
                <div className="text-text-primary font-medium truncate">
                  {protocolName} ({targetContract})
                </div>
                <div className="text-text-muted text-[11px]">
                  Commit SHA: {gitCommit} · Solc {compilerVersion}
                </div>
              </div>

              {/* Line Items Consuming Scoped Output */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-text-muted">
                  <span>SLOC Base Review ({scopedSloc.toLocaleString()} lines)</span>
                  <span className="text-text-primary font-medium">${baseSlocFee.toLocaleString()} USDC</span>
                </div>

                <div className="flex justify-between items-center text-text-muted">
                  <span>Dual-Auditor Allocation (Lead + Peer)</span>
                  <span className="text-text-primary font-medium">${auditorAllocationFee.toLocaleString()} USDC</span>
                </div>

                <div className="flex justify-between items-center text-text-muted">
                  <span>Automated AST Engine (14 Passes)</span>
                  <span className="text-signal-resolved font-medium">INCLUDED</span>
                </div>

                <div className="flex justify-between items-center text-text-muted">
                  <span>Foundry Invariant Fuzz Tests</span>
                  <span className="text-signal-resolved font-medium">INCLUDED</span>
                </div>

                <div className="flex justify-between items-center text-text-muted">
                  <span>Initial Triage Turnaround SLA</span>
                  <span className="text-accent-scan font-medium">36–48 Hours</span>
                </div>
              </div>

              {/* Total Settlement Amount */}
              <div className="pt-4 border-t border-border-hairline space-y-2">
                <div className="flex justify-between items-baseline font-mono">
                  <span className="text-xs text-text-muted uppercase">TOTAL ESCROW AMOUNT:</span>
                  <span className="text-2xl font-bold font-display text-text-primary">
                    ${totalAmount.toLocaleString()} <span className="text-xs text-accent-scan font-mono">{selectedToken}</span>
                  </span>
                </div>
                <p className="text-[10px] font-mono text-text-muted leading-tight">
                  Deterministic rate calculated from AST complexity metrics and dual-auditor review hours.
                </p>
              </div>

              {/* Primary Action Button */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  size="lg"
                  isLoading={isProcessing}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {paymentMethod === "crypto"
                    ? `Deposit ${totalAmount.toLocaleString()} ${selectedToken} Escrow`
                    : "Generate Invoice & Dispatch Review"}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-text-muted">
                  <Lock className="h-3 w-3 text-signal-resolved" />
                  <span>256-BIT ENCRYPTED AUDIT DISPATCH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-12 text-center text-text-muted font-mono text-xs">
          Loading checkout...
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
