"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  User,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  GitBranch,
  Layers,
  Building,
  Lock,
  Cpu,
  Check,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ONBOARDING_STEPS = [
  { step: 1, title: "Candidate Profile", shortDesc: "Credentials & wallet" },
  { step: 2, title: "Benchmark Test", shortDesc: "Smart contract audit challenge" },
  { step: 3, title: "Governance Review", shortDesc: "Identity verification & approval" },
  { step: 4, title: "Activation & Capacity", shortDesc: "Workload setup & launch" },
];

export default function AuditorOnboardingPage() {
  const [activeStep, setActiveStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Step 1 Form State
  const [candidateName, setCandidateName] = React.useState("0xAuditor_K4");
  const [candidateEmail, setCandidateEmail] = React.useState("auditor@zyron.labs");
  const [walletAddress, setWalletAddress] = React.useState("0x71C2B095C2A4eF4a4805A20C73a98f4a12c09b8");
  const [githubHandle, setGithubHandle] = React.useState("0xAuditorK4");
  const [specialization, setSpecialization] = React.useState("EVM / Solidity / Foundry");
  const [pastReportsUrl, setPastReportsUrl] = React.useState("https://github.com/Uniswap/v2-core");

  // Step 2 Benchmark State
  const [selectedBug1, setSelectedBug1] = React.useState(false);
  const [selectedBug2, setSelectedBug2] = React.useState(false);
  const [benchmarkScore, setBenchmarkScore] = React.useState<number | null>(null);

  // Step 4 Capacity State
  const [maxCapacity, setMaxCapacity] = React.useState(3);
  const [isAvailable, setIsAvailable] = React.useState(true);

  const handleCompleteStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName || !walletAddress || !githubHandle) return;
    toast.success("Application profile saved! Proceeding to benchmark test.");
    setActiveStep(2);
  };

  const handleEvaluateBenchmark = () => {
    let score = 0;
    if (selectedBug1) score += 50;
    if (selectedBug2) score += 50;
    setBenchmarkScore(score);

    if (score >= 50) {
      toast.success(`Benchmark Challenge Passed! Score: ${score}/100.`);
      setTimeout(() => setActiveStep(3), 1000);
    } else {
      toast.error(`Benchmark Failed (${score}/100). Please select all vulnerable lines.`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 font-sans">
      {/* ─── 1. TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
            <span>Auditor Workspace</span>
            <span>/</span>
            <span className="text-text-primary font-medium">Candidate Onboarding</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Auditor Candidate Qualification
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Step {activeStep} of 4
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            4-step verification workflow for prospective lead security reviewers to establish cryptographic identity, verify benchmark triage skills, and configure workload capacity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Link href="/auditor/queue">
            <Button variant="secondary" size="md" className="rounded-xl">
              Back to Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── 2. PROGRESS STEPPER (Layered SaaS Card) ─── */}
      <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
        <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ONBOARDING_STEPS.map((s) => {
              const isPast = activeStep > s.step;
              const isCurrent = activeStep === s.step;

              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStep(s.step as any)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3",
                    isCurrent
                      ? "border-accent-scan bg-accent-scan/5 ring-1 ring-accent-scan/20 shadow-xs"
                      : isPast
                      ? "border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/40"
                      : "border-transparent bg-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors",
                      isPast
                        ? "bg-signal-resolved text-white"
                        : isCurrent
                        ? "bg-accent-scan text-white"
                        : "bg-[#F2F4F7] dark:bg-bg-void text-text-muted"
                    )}
                  >
                    {isPast ? <Check className="h-4 w-4 stroke-[3]" /> : `0${s.step}`}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={cn(
                        "text-xs font-semibold truncate",
                        isCurrent
                          ? "text-accent-scan"
                          : isPast
                          ? "text-text-primary"
                          : "text-text-muted"
                      )}
                    >
                      {s.title}
                    </div>
                    <div className="text-[10px] text-text-muted truncate hidden sm:block">
                      {s.shortDesc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 3. ACTIVE STEP CONTENT (Layered SaaS Card) ─── */}
      {/* STEP 1: CANDIDATE PROFILE */}
      {activeStep === 1 && (
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1 border-b border-border-hairline/60 pb-4">
              <h2 className="font-display text-lg font-bold text-text-primary">
                Step 1: Auditor Candidate Profile Application
              </h2>
              <p className="text-xs text-text-muted">
                Provide your cryptographic signing address, GitHub audit repository, and primary EVM specialization.
              </p>
            </div>

            <form onSubmit={handleCompleteStep1} className="space-y-5 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary block">
                    AUDITOR HANDLE / PSEUDONYM
                  </label>
                  <Input
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    required
                    placeholder="e.g. 0xAuditor_K4"
                    className="text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary block">
                    ENCRYPTED AUDITOR EMAIL
                  </label>
                  <Input
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="auditor@domain.org"
                    className="text-xs font-mono rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary block">
                    EVM WALLET (EIP-712 SIGNER KEY)
                  </label>
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    required
                    className="text-xs font-mono rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary block">
                    GITHUB USERNAME / REPO LINK
                  </label>
                  <Input
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    required
                    placeholder="e.g. 0xAuditorK4"
                    className="text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  PRIMARY SPECIALIZATION & TOOLING
                </label>
                <Input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. EVM / Solidity / Foundry / Slither / Invariant Fuzzing"
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  PAST AUDIT REPORTS / PORTFOLIO LINK
                </label>
                <Input
                  value={pastReportsUrl}
                  onChange={(e) => setPastReportsUrl(e.target.value)}
                  placeholder="https://github.com/yourhandle/audits"
                  className="text-xs rounded-xl"
                />
              </div>
            </form>
          </div>

          {/* Bottom Gray Area Actions */}
          <div className="px-5 py-4 flex items-center justify-between font-sans rounded-b-2xl">
            <span className="text-xs text-text-muted">
              Step 1 of 4 · Identity credentials
            </span>

            <ExpandingButton
              type="button"
              variant="accent"
              rounded="xl"
              size="md"
              onClick={handleCompleteStep1}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Continue to Benchmark Test
            </ExpandingButton>
          </div>
        </div>
      )}

      {/* STEP 2: SECURITY BENCHMARK CHALLENGE */}
      {activeStep === 2 && (
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-hairline/60 pb-4">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-text-primary">
                  Step 2: Smart Contract Security Benchmark Challenge
                </h2>
                <p className="text-xs text-text-muted">
                  Analyze the sample contract snippet below and select all lines containing actionable security vulnerabilities.
                </p>
              </div>

              <Badge severity="informational" size="sm">
                MIN PASSING: 50/100
              </Badge>
            </div>

            {/* Contract Code Box */}
            <div className="rounded-xl border border-[#262B33] bg-[#0B0D10] p-5 space-y-3 font-mono text-xs leading-relaxed text-[#E8EAED]">
              <div className="text-[#8B93A1] text-[11px] pb-2 border-b border-[#262B33] flex items-center justify-between">
                <span>// contracts/StakingPoolBenchmark.sol (Solidity v0.8.20)</span>
                <span className="text-accent-scan">EVM Shanghai Target</span>
              </div>

              <div className="space-y-2">
                <div className="text-[#8B93A1]">1: pragma solidity ^0.8.20;</div>
                <div className="text-[#8B93A1]">2: contract StakingPool &#123;</div>
                <div className="text-[#8B93A1]">3:     mapping(address =&gt; uint256) public userBalances;</div>
                <div className="text-[#8B93A1]">4:     IERC20 public rewardToken;</div>
                <div className="text-[#8B93A1]">5: </div>

                {/* Bug Line 1: Reentrancy */}
                <div
                  onClick={() => setSelectedBug1(!selectedBug1)}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border select-none",
                    selectedBug1
                      ? "bg-[#FF5468]/15 border-[#FF5468]/50 text-[#FF5468] font-bold"
                      : "hover:bg-[#1B1F26] text-[#E8EAED] border-transparent"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedBug1}
                    onChange={() => {}}
                    className="mt-1 rounded bg-[#0B0D10] border-[#384351] text-accent-scan"
                  />
                  <div className="space-y-0.5">
                    <div>6: (bool sent, ) = msg.sender.call&#123;value: amount&#125;("");</div>
                    <div>7: userBalances[msg.sender] -= amount; // State zeroed after low-level call</div>
                    {selectedBug1 && (
                      <span className="text-[10px] text-[#FF5468] font-sans font-medium block">
                        ✓ Flagged SWC-107 Reentrancy (State mutation after low-level msg.sender.call)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[#8B93A1] pl-7">8:     require(sent, "Transfer failed");</div>

                {/* Bug Line 2: Unchecked Transfer */}
                <div
                  onClick={() => setSelectedBug2(!selectedBug2)}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border select-none",
                    selectedBug2
                      ? "bg-[#FF9F43]/15 border-[#FF9F43]/50 text-[#FF9F43] font-bold"
                      : "hover:bg-[#1B1F26] text-[#E8EAED] border-transparent"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedBug2}
                    onChange={() => {}}
                    className="mt-1 rounded bg-[#0B0D10] border-[#384351] text-accent-scan"
                  />
                  <div className="space-y-0.5">
                    <div>9: rewardToken.transfer(msg.sender, rewardAmount); // Unchecked return</div>
                    {selectedBug2 && (
                      <span className="text-[10px] text-[#FF9F43] font-sans font-medium block">
                        ✓ Flagged SWC-104 Unchecked ERC-20 Return Value (Non-standard token silent failure)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[#8B93A1]">10: &#125;</div>
              </div>
            </div>

            <div className="text-xs text-text-muted">
              {selectedBug1 || selectedBug2 ? (
                <span className="text-signal-resolved font-medium">
                  {(selectedBug1 ? 1 : 0) + (selectedBug2 ? 1 : 0)} of 2 vulnerability flags selected.
                </span>
              ) : (
                "Click on the lines above to flag detected security flaws."
              )}
            </div>
          </div>

          {/* Bottom Gray Area Actions */}
          <div className="px-5 py-4 flex items-center justify-between font-sans rounded-b-2xl">
            <Button
              variant="secondary"
              size="md"
              className="rounded-xl"
              onClick={() => setActiveStep(1)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>

            <ExpandingButton
              variant="accent"
              rounded="xl"
              size="md"
              onClick={handleEvaluateBenchmark}
              icon={<Award className="h-4 w-4" />}
            >
              Submit Benchmark Evaluation
            </ExpandingButton>
          </div>
        </div>
      )}

      {/* STEP 3: GOVERNANCE REVIEW & IDENTITY VERIFICATION */}
      {activeStep === 3 && (
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1 border-b border-border-hairline/60 pb-4">
              <h2 className="font-display text-lg font-bold text-text-primary">
                Step 3: Governance Review & Identity Verification
              </h2>
              <p className="text-xs text-text-muted">
                Your application and benchmark score (100/100) are verified by Zyron Security Governance.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-signal-resolved/10 border border-signal-resolved/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-signal-resolved font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>BENCHMARK CHALLENGE PASSED</span>
                </div>
                <Badge severity="resolved" size="sm">
                  SCORE: 100/100 ✓
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <span className="text-text-muted text-[11px] block">CANDIDATE HANDLE:</span>
                  <div className="text-text-primary font-bold text-sm">{candidateName}</div>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">EIP-712 WALLET ADDRESS:</span>
                  <div className="text-accent-scan font-bold font-mono text-xs select-all truncate">{walletAddress}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline text-xs text-text-muted">
                Governance status: <strong className="text-signal-resolved">AUTO-QUALIFIED FOR AUDITOR ROLE</strong>. Proceed below to configure your workload availability.
              </div>
            </div>
          </div>

          {/* Bottom Gray Area Actions */}
          <div className="px-5 py-4 flex items-center justify-between font-sans rounded-b-2xl">
            <Button
              variant="secondary"
              size="md"
              className="rounded-xl"
              onClick={() => setActiveStep(2)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>

            <ExpandingButton
              variant="accent"
              rounded="xl"
              size="md"
              onClick={() => setActiveStep(4)}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Proceed to Activation & Capacity
            </ExpandingButton>
          </div>
        </div>
      )}

      {/* STEP 4: ACTIVATION & WORKLOAD CAPACITY SETUP */}
      {activeStep === 4 && (
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1 border-b border-border-hairline/60 pb-4">
              <h2 className="font-display text-lg font-bold text-text-primary">
                Step 4: Auditor Activation & Capacity Settings
              </h2>
              <p className="text-xs text-text-muted">
                Configure your maximum concurrent review capacity and auto-assignment availability status.
              </p>
            </div>

            <div className="space-y-5 max-w-xl">
              {/* Availability Status Toggle */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-text-primary text-xs">Auto-Assignment Availability</div>
                    <div className="text-[11px] text-text-muted">Receive incoming protocol scopes automatically when available</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer",
                      isAvailable
                        ? "bg-signal-resolved/15 text-signal-resolved border-signal-resolved/30"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    )}
                  >
                    {isAvailable ? "AVAILABLE ✓" : "BUSY / PAUSED"}
                  </button>
                </div>
              </div>

              {/* Max Capacity Slider */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline space-y-2">
                <div className="font-bold text-text-primary text-xs">Maximum Concurrent Ticket Capacity</div>
                <p className="text-[11px] text-text-muted">
                  Limit active audits assigned to your queue at any single time (Default: 3 concurrent tickets).
                </p>

                <div className="flex items-center gap-4 pt-1">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10))}
                    className="w-48 accent-accent-scan cursor-pointer"
                  />
                  <span className="font-bold text-accent-scan text-sm font-mono">{maxCapacity} Concurrent Tickets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Gray Area Actions */}
          <div className="px-5 py-4 flex items-center justify-between font-sans rounded-b-2xl">
            <Button
              variant="secondary"
              size="md"
              className="rounded-xl"
              onClick={() => setActiveStep(3)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>

            <Link href="/auditor/queue">
              <ExpandingButton
                variant="accent"
                rounded="xl"
                size="md"
                onClick={() => toast.success("Auditor profile activated! Welcome to the Auditor Queue.")}
                icon={<ShieldCheck className="h-4 w-4" />}
              >
                Complete Onboarding & Launch Queue
              </ExpandingButton>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
