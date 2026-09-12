"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = React.useState<"crypto" | "invoice">("crypto");
  const [selectedToken, setSelectedToken] = React.useState<"USDC" | "USDT">("USDC");
  const [selectedNetwork, setSelectedNetwork] = React.useState<"ethereum" | "arbitrum">("ethereum");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  // Corporate Billing form state
  const [companyName, setCompanyName] = React.useState("Aura Finance DAO Ltd.");
  const [billingEmail, setBillingEmail] = React.useState("finance@auraprotocol.io");
  const [taxId, setTaxId] = React.useState("EU-948120482");

  // Scoped line items matching New Audit Request
  const scopedSloc = 1482;
  const targetContract = "VaultCore.sol";
  const protocolName = "Aura Liquidity Pool V3";
  const baseSlocFee = 8500;
  const auditorAllocationFee = 4000;
  const totalAmount = baseSlocFee + auditorAllocationFee;

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
              <div className="text-accent-scan font-bold">#ZAM-9486</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">FEE PAID</div>
              <div className="text-text-primary">${totalAmount.toLocaleString()} USDC</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">ASSIGNED LEAD</div>
              <div className="text-text-primary">0xAuditor_K4</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px]">INITIAL TRIAGE SLA</div>
              <div className="text-signal-resolved">36–48 Hours</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/portal/track/ZAM-9481">
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
          TICKET // #ZAM-9486 · SCOPE: {scopedSloc} SLOC
        </div>
      </div>

      <form onSubmit={handleConfirmPayment}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: PAYMENT METHOD & SETTLEMENT DETAILS */}
          <div className="lg:col-span-7 space-y-6">
            {/* Method Selector Tabs */}
            <div className="p-6 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
              <div className="border-b border-border-hairline pb-3">
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Select Settlement Method
                </h2>
                <p className="text-xs text-text-muted font-mono">
                  Funds are secured in multi-sig escrow and released upon milestone completion.
                </p>
              </div>

              {/* Toggle Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMethod("crypto")}
                  className={`p-4 rounded-[4px] border cursor-pointer select-none transition-colors space-y-2 ${
                    paymentMethod === "crypto"
                      ? "bg-bg-panel-raised border-accent-scan"
                      : "bg-bg-void border-border-hairline hover:border-hairline/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-display text-sm font-semibold text-text-primary">
                      <Wallet className="h-4 w-4 text-accent-scan" />
                      <span>Web3 Crypto Escrow</span>
                    </div>
                    {paymentMethod === "crypto" && <Check className="h-4 w-4 text-accent-scan" />}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed font-mono text-[11px]">
                    Instant dispatch via USDC / USDT multi-sig smart contract escrow.
                  </p>
                </div>

                <div
                  onClick={() => setPaymentMethod("invoice")}
                  className={`p-4 rounded-[4px] border cursor-pointer select-none transition-colors space-y-2 ${
                    paymentMethod === "invoice"
                      ? "bg-bg-panel-raised border-accent-scan"
                      : "bg-bg-void border-border-hairline hover:border-hairline/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-display text-sm font-semibold text-text-primary">
                      <Building className="h-4 w-4 text-accent-scan" />
                      <span>Corporate Net-30 Wire</span>
                    </div>
                    {paymentMethod === "invoice" && <Check className="h-4 w-4 text-accent-scan" />}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed font-mono text-[11px]">
                    Formal PDF invoice generation with Net-30 wire transfer terms.
                  </p>
                </div>
              </div>

              {/* Crypto Escrow Configuration */}
              {paymentMethod === "crypto" && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-mono text-xs text-text-muted">ESCROW TOKEN</label>
                      <div className="flex rounded-[4px] border border-border-hairline bg-bg-void p-0.5 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedToken("USDC")}
                          className={`flex-1 py-1.5 rounded-[2px] transition-colors ${
                            selectedToken === "USDC"
                              ? "bg-bg-panel-raised text-accent-scan font-bold"
                              : "text-text-muted hover:text-text-primary"
                          }`}
                        >
                          USDC (USD Coin)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedToken("USDT")}
                          className={`flex-1 py-1.5 rounded-[2px] transition-colors ${
                            selectedToken === "USDT"
                              ? "bg-bg-panel-raised text-accent-scan font-bold"
                              : "text-text-muted hover:text-text-primary"
                          }`}
                        >
                          USDT (Tether)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-xs text-text-muted">SETTLEMENT CHAIN</label>
                      <select
                        value={selectedNetwork}
                        onChange={(e) => setSelectedNetwork(e.target.value as any)}
                        className="w-full h-9 px-3 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs text-text-primary focus:outline-none"
                      >
                        <option value="ethereum">Ethereum Mainnet (ChainID: 1)</option>
                        <option value="arbitrum">Arbitrum One (ChainID: 42161)</option>
                      </select>
                    </div>
                  </div>

                  {/* Connected Wallet Box */}
                  <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-text-muted text-[10px]">
                      <span>CONNECTED PROTOCOL WALLET</span>
                      <span className="text-signal-resolved">BALANCE: 45,200 {selectedToken}</span>
                    </div>
                    <div className="text-text-primary text-[11px] truncate">
                      {(user as any)?.walletAddress || user?.email || "Not connected"}
                    </div>
                  </div>

                  {/* Escrow Terms Notice */}
                  <div className="p-3 rounded-[4px] bg-bg-panel-raised border border-border-hairline flex items-start gap-2.5 text-xs font-mono text-text-muted">
                    <ShieldCheck className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>
                      Escrow Release Terms: 50% allocated upon automated AST ingestion start; 50% final release upon cryptographic attestation delivery.
                    </span>
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
                      placeholder="e.g. Aura Finance DAO Ltd."
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
                  #ZAM-9486
                </span>
              </div>

              {/* Target Scope Context */}
              <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline space-y-1 font-mono text-xs">
                <div className="text-text-muted text-[10px]">AUDITED TARGET CONTRACT</div>
                <div className="text-text-primary font-medium truncate">
                  {protocolName} ({targetContract})
                </div>
                <div className="text-text-muted text-[11px]">
                  Commit SHA: 8f9b2d4 · Solc v0.8.20
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
