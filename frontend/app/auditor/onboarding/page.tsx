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
  Sparkles,
  GitBranch,
  Layers,
  Building,
  Lock,
  Cpu,
  Check,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AuditorOnboardingPage() {
  const [activeStep, setActiveStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Step 1 Form State
  const [candidateName, setCandidateName] = React.useState("0xAuditor_K4");
  const [candidateEmail, setCandidateEmail] = React.useState("k4@zyron.labs");
  const [walletAddress, setWalletAddress] = React.useState("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
  const [githubHandle, setGithubHandle] = React.useState("0xAuditorK4");
  const [specialization, setSpecialization] = React.useState("EVM / Solidity / Foundry");
  const [pastReportsUrl, setPastReportsUrl] = React.useState("https://github.com/0xAuditorK4/audits");

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
    toast.success("Application Profile saved! Proceed to Security Benchmark Challenge.");
    setActiveStep(2);
  };

  const handleEvaluateBenchmark = () => {
    let score = 0;
    if (selectedBug1) score += 50;
    if (selectedBug2) score += 50;
    setBenchmarkScore(score);

    if (score >= 50) {
      toast.success(`Benchmark Challenge Passed! Score: ${score}/100.`);
      setTimeout(() => setActiveStep(3), 1200);
    } else {
      toast.error(`Benchmark Failed (${score}/100). Please re-examine the vulnerable lines.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-mono text-xs">
      {/* HEADER & PIPELINE TRACKER */}
      <section className="p-6 md:p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Eyebrow size="xs" variant="scan" prefix="// GOVERNANCE · ">
                AUDITOR_ONBOARDING_PIPELINE
              </Eyebrow>
              <Badge severity="high" size="sm">
                VERIFICATION PORTAL
              </Badge>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary font-sans">
              Auditor Candidate Onboarding & Verification
            </h1>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl font-sans">
              4-step qualification workflow for prospective lead reviewers to establish cryptographic identity, verify smart contract security benchmark skills, and configure workload capacity.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge severity={activeStep === 4 ? "resolved" : "informational"} size="sm">
              STEP 0{activeStep} OF 04
            </Badge>
          </div>
        </div>

        {/* 4-Step Stepper Rail */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-border-hairline">
          <button
            onClick={() => setActiveStep(1)}
            className={`p-3 rounded-[4px] border text-left transition-colors ${
              activeStep === 1
                ? "bg-bg-panel-raised border-accent-scan text-accent-scan font-bold"
                : "bg-bg-void border-border-hairline text-text-muted hover:text-text-primary"
            }`}
          >
            <div className="text-[10px]">01 PROFILE</div>
            <div className="font-sans text-xs">Application Info</div>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`p-3 rounded-[4px] border text-left transition-colors ${
              activeStep === 2
                ? "bg-bg-panel-raised border-accent-scan text-accent-scan font-bold"
                : "bg-bg-void border-border-hairline text-text-muted hover:text-text-primary"
            }`}
          >
            <div className="text-[10px]">02 BENCHMARK</div>
            <div className="font-sans text-xs">Security Challenge</div>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`p-3 rounded-[4px] border text-left transition-colors ${
              activeStep === 3
                ? "bg-bg-panel-raised border-accent-scan text-accent-scan font-bold"
                : "bg-bg-void border-border-hairline text-text-muted hover:text-text-primary"
            }`}
          >
            <div className="text-[10px]">03 GOVERNANCE</div>
            <div className="font-sans text-xs">Admin Verification</div>
          </button>

          <button
            onClick={() => setActiveStep(4)}
            className={`p-3 rounded-[4px] border text-left transition-colors ${
              activeStep === 4
                ? "bg-bg-panel-raised border-signal-resolved text-signal-resolved font-bold"
                : "bg-bg-void border-border-hairline text-text-muted hover:text-text-primary"
            }`}
          >
            <div className="text-[10px]">04 ACTIVATION</div>
            <div className="font-sans text-xs">Capacity & Availability</div>
          </button>
        </div>
      </section>

      {/* STEP 1: CANDIDATE APPLICATION PROFILE */}
      {activeStep === 1 && (
        <section className="p-6 md:p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-4 space-y-1">
            <h3 className="font-display text-lg font-semibold text-text-primary font-sans">
              Step 1: Auditor Candidate Profile Application
            </h3>
            <p className="text-text-muted text-xs font-sans">
              Provide your wallet address, ENS handle, GitHub audit repository, and primary EVM specialization.
            </p>
          </div>

          <form onSubmit={handleCompleteStep1} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-text-muted text-[11px]">AUDITOR HANDLE / NAME</label>
                <Input
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  required
                  placeholder="e.g. 0xAuditor_K4"
                  className="bg-bg-void"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-muted text-[11px]">EMAIL ADDRESS</label>
                <Input
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  type="email"
                  required
                  className="bg-bg-void"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-text-muted text-[11px]">EVM WALLET ADDRESS (EIP-712 SIGNING)</label>
                <Input
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required
                  className="bg-bg-void"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-muted text-[11px]">GITHUB USERNAME</label>
                <Input
                  value={githubHandle}
                  onChange={(e) => setGithubHandle(e.target.value)}
                  required
                  placeholder="e.g. 0xAuditorK4"
                  className="bg-bg-void"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-text-muted text-[11px]">PRIMARY SPECIALIZATION & TOOLING</label>
              <Input
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. EVM / Solidity / Foundry / Slither / Vyper"
                className="bg-bg-void"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text-muted text-[11px]">PAST AUDIT REPORTS / PORTFOLIO LINK</label>
              <Input
                value={pastReportsUrl}
                onChange={(e) => setPastReportsUrl(e.target.value)}
                placeholder="https://github.com/yourhandle/audits"
                className="bg-bg-void"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="bg-accent-scan text-bg-void font-bold"
              >
                Save Profile & Take Security Benchmark
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* STEP 2: SECURITY BENCHMARK CHALLENGE */}
      {activeStep === 2 && (
        <section className="p-6 md:p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-semibold text-text-primary font-sans">
                Step 2: Smart Contract Security Benchmark Challenge
              </h3>
              <p className="text-text-muted text-xs font-sans">
                Analyze the sample contract snippet below and select all lines containing security vulnerabilities.
              </p>
            </div>

            <Badge severity="informational" size="sm">
              MIN PASSING SCORE: 50/100
            </Badge>
          </div>

          {/* Sample Contract Code Box */}
          <div className="rounded-[4px] border border-border-hairline bg-bg-void p-5 space-y-3 font-mono text-xs leading-relaxed">
            <div className="text-text-muted text-[10px] pb-2 border-b border-border-hairline flex items-center justify-between">
              <span>// contracts/StakingPoolBenchmark.sol (Solidity v0.8.20)</span>
              <span className="text-accent-scan">EVM Shanghai Target</span>
            </div>

            <div className="space-y-2">
              <div className="text-text-muted">1: pragma solidity ^0.8.20;</div>
              <div className="text-text-muted">2: contract StakingPool &#123;</div>
              <div className="text-text-muted">3:     mapping(address =&gt; uint256) public userBalances;</div>
              <div className="text-text-muted">4:     IERC20 public rewardToken;</div>
              <div className="text-text-muted">5: </div>
              
              {/* Bug Line 1: Reentrancy */}
              <label
                onClick={() => setSelectedBug1(!selectedBug1)}
                className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${
                  selectedBug1
                    ? "bg-signal-critical/20 border border-signal-critical/50 text-signal-critical font-bold"
                    : "hover:bg-bg-panel text-text-primary"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedBug1}
                  onChange={() => {}}
                  className="mt-1 rounded bg-bg-void border-border-hairline text-signal-critical"
                />
                <div className="space-y-0.5">
                  <div>6: (bool sent, ) = msg.sender.call&#123;value: amount&#125;("");</div>
                  <div>7: userBalances[msg.sender] -= amount; // State zeroed after low-level call</div>
                  {selectedBug1 && (
                    <span className="text-[10px] text-signal-critical font-sans">
                      ✓ Flagged SWC-107 Reentrancy (State mutation after low-level msg.sender.call)
                    </span>
                  )}
                </div>
              </label>

              {/* Normal Line */}
              <div className="text-text-muted pl-7">8:     require(sent, "Transfer failed");</div>

              {/* Bug Line 2: Unchecked Transfer */}
              <label
                onClick={() => setSelectedBug2(!selectedBug2)}
                className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${
                  selectedBug2
                    ? "bg-signal-high/20 border border-signal-high/50 text-signal-high font-bold"
                    : "hover:bg-bg-panel text-text-primary"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedBug2}
                  onChange={() => {}}
                  className="mt-1 rounded bg-bg-void border-border-hairline text-signal-high"
                />
                <div className="space-y-0.5">
                  <div>9: rewardToken.transfer(msg.sender, rewardAmount); // Unchecked return</div>
                  {selectedBug2 && (
                    <span className="text-[10px] text-signal-high font-sans">
                      ✓ Flagged SWC-104 Unchecked ERC-20 Return Value (Non-standard token silent failure)
                    </span>
                  )}
                </div>
              </label>

              <div className="text-text-muted">10: &#125;</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="text-[11px] text-text-muted">
              {selectedBug1 || selectedBug2 ? (
                <span className="text-signal-resolved">
                  { (selectedBug1 ? 1 : 0) + (selectedBug2 ? 1 : 0) } of 2 vulnerability flags selected.
                </span>
              ) : (
                "Click on the lines above to flag detected security flaws."
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleEvaluateBenchmark}
              leftIcon={<Award className="h-4 w-4" />}
              className="bg-accent-scan text-bg-void font-bold"
            >
              Submit Benchmark Evaluation
            </Button>
          </div>
        </section>
      )}

      {/* STEP 3: GOVERNANCE & ADMIN APPROVAL */}
      {activeStep === 3 && (
        <section className="p-6 md:p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-4 space-y-1">
            <h3 className="font-display text-lg font-semibold text-text-primary font-sans">
              Step 3: Governance Review & Identity Verification
            </h3>
            <p className="text-text-muted text-xs font-sans">
              Your application and benchmark score (100/100) are under review by Zyron Security Governance Admins.
            </p>
          </div>

          <div className="p-6 rounded-[4px] bg-bg-void border border-signal-resolved/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-signal-resolved font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>BENCHMARK PASSED & VERIFIED</span>
              </div>
              <Badge severity="resolved" size="sm">
                SCORE: 100/100 ✓
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-muted text-[10px]">CANDIDATE HANDLE:</span>
                <div className="text-text-primary font-bold">{candidateName}</div>
              </div>
              <div>
                <span className="text-text-muted text-[10px]">EIP-712 WALLET:</span>
                <div className="text-accent-scan font-bold select-all truncate">{walletAddress}</div>
              </div>
            </div>

            <div className="p-3 rounded bg-bg-panel text-[11px] text-text-muted">
              Governance status: <strong>AUTO-APPROVED FOR AUDITOR ROLE</strong>. Click below to configure your workload availability.
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveStep(4)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="bg-signal-resolved text-bg-void font-bold"
            >
              Proceed to Activation & Capacity Setup
            </Button>
          </div>
        </section>
      )}

      {/* STEP 4: ACTIVATION & WORKLOAD CAPACITY SETUP */}
      {activeStep === 4 && (
        <section className="p-6 md:p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="border-b border-border-hairline pb-4 space-y-1">
            <h3 className="font-display text-lg font-semibold text-text-primary font-sans">
              Step 4: Auditor Activation & Capacity Settings
            </h3>
            <p className="text-text-muted text-xs font-sans">
              Set your maximum concurrent ticket capacity and auto-assignment availability status.
            </p>
          </div>

          <div className="space-y-5 max-w-xl">
            {/* Availability Status Toggle */}
            <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-text-primary text-xs">Auto-Assignment Availability Status</div>
                  <div className="text-[11px] text-text-muted">Receive incoming tickets automatically when available</div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`px-3 py-1.5 rounded-[3px] font-bold text-xs border ${
                    isAvailable
                      ? "bg-signal-resolved/15 text-signal-resolved border-signal-resolved/40"
                      : "bg-signal-high/15 text-signal-high border-signal-high/40"
                  }`}
                >
                  {isAvailable ? "AVAILABLE ✓" : "BUSY / PAUSED"}
                </button>
              </div>
            </div>

            {/* Max Capacity Input */}
            <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2">
              <div className="font-bold text-text-primary text-xs">Maximum Concurrent Ticket Capacity</div>
              <p className="text-[11px] text-text-muted">
                Limit active audits assigned to your queue at any single time (Default: 3 concurrent tickets).
              </p>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10))}
                  className="w-48 accent-accent-scan"
                />
                <span className="font-bold text-accent-scan text-sm">{maxCapacity} Concurrent Tickets</span>
              </div>
            </div>

            <div className="pt-3">
              <Link href="/auditor/queue">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<ShieldCheck className="h-4 w-4" />}
                  className="w-full bg-signal-resolved text-bg-void font-bold"
                  onClick={() => toast.success("Auditor Profile active! Transferred to Auditor Ticket Queue.")}
                >
                  Complete Onboarding & Launch Auditor Queue
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
