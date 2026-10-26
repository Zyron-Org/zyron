"use client";

import * as React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  Terminal,
  Copy,
  Check,
  Sparkles,
  Code2,
  ArrowRight,
  Flame,
  Radio,
  FileCode,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AgentFlowDrawer } from "@/components/agent-flow-drawer";

export interface TraceStep {
  stepIndex: number;
  type: string; // 'CALL' | 'STATICCALL' | 'DELEGATECALL' | 'REVERT' | 'REENTRANT_CALL' | 'DRAIN_COMPLETE' | 'SETUP'
  from: string;
  to: string;
  functionCalled: string;
  valueWei?: string;
  gasUsed?: number;
  success: boolean;
  stateChangeSummary: string;
}

export interface EvmTraceStepperProps {
  findingId?: string;
  title?: string;
  findingSeverity?: string;
  verdict?: "PROVEN_EXPLOIT" | "PROVEN_FALSE_POSITIVE" | "CANNOT_REPRODUCE" | "QUEUED" | "RUNNING" | string;
  fundsDrainedEth?: number;
  traceSteps?: TraceStep[] | string;
  synthesizedPoC?: string;
  onRunProver?: () => void;
  isRunningProver?: boolean;
  showAgentFlow?: boolean;
}

export function EvmTraceStepper({
  findingId,
  title,
  findingSeverity,
  verdict,
  fundsDrainedEth,
  traceSteps,
  synthesizedPoC,
  onRunProver,
  isRunningProver = false,
  showAgentFlow = true,
}: EvmTraceStepperProps) {
  const [activeTab, setActiveTab] = React.useState<"stepper" | "poc">("stepper");
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLogsOpen, setIsLogsOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Parse steps if JSON string and normalize naming - returns empty array if no real trace recorded
  const steps: TraceStep[] = React.useMemo(() => {
    if (!traceSteps) return [];

    const normalize = (rawList: any[]): TraceStep[] => {
      return rawList.map((s: any, idx: number) => ({
        stepIndex: s.stepIndex ?? s.step ?? idx + 1,
        type: s.type ?? (s.status === "REVERT" || s.success === false ? "REVERT" : "CALL"),
        from: s.from ?? s.caller ?? "0xAttacker",
        to: s.to ?? s.target ?? "0xTarget",
        functionCalled: s.functionCalled ?? s.functionName ?? "execute()",
        valueWei: s.valueWei ?? s.value ?? "0",
        gasUsed: s.gasUsed ?? 21000,
        success: s.success !== undefined ? Boolean(s.success) : s.status !== "REVERT",
        stateChangeSummary: s.stateChangeSummary ?? s.stateChange ?? s.detail ?? "EVM state transition executed.",
      }));
    };

    if (Array.isArray(traceSteps)) {
      return traceSteps.length > 0 ? normalize(traceSteps) : [];
    }

    try {
      const parsed = JSON.parse(traceSteps);
      return Array.isArray(parsed) && parsed.length > 0 ? normalize(parsed) : [];
    } catch {
      return [];
    }
  }, [traceSteps]);

  // Keep index within range
  const currentStep = steps[currentStepIndex] || steps[0];

  // Auto-play timer
  React.useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && steps.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, steps.length]);

  const handleCopyPoC = () => {
    if (!synthesizedPoC) return;
    navigator.clipboard.writeText(synthesizedPoC);
    setCopied(true);
    toast.success("Synthesized exploit PoC copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getCallTypeBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case "REENTRANT_CALL":
        return <Badge severity="critical" size="sm">REENTRANT CALL</Badge>;
      case "DRAIN_COMPLETE":
        return <Badge severity="critical" size="sm">FUNDS DRAINED</Badge>;
      case "REVERT":
        return <Badge severity="resolved" size="sm">REVERTED SAFELY</Badge>;
      case "STATICCALL":
        return <Badge severity="low" size="sm">STATICCALL</Badge>;
      case "DELEGATECALL":
        return <Badge severity="high" size="sm">DELEGATECALL</Badge>;
      case "SETUP":
        return <Badge severity="informational" size="sm">STATE SETUP</Badge>;
      default:
        return <Badge severity="medium" size="sm">CALL</Badge>;
    }
  };

  const formatEthValue = (weiStr?: string) => {
    if (!weiStr || weiStr === "0") return "0 ETH";
    try {
      const val = BigInt(weiStr);
      const eth = Number(val) / 1e18;
      return `${eth.toFixed(2)} ETH`;
    } catch {
      return "0 ETH";
    }
  };

  const isExploitProven = verdict === "PROVEN_EXPLOIT";
  const isFalsePositive = verdict === "PROVEN_FALSE_POSITIVE";
  const isCannotReproduce = verdict === "CANNOT_REPRODUCE";
  const isSimulating = verdict === "QUEUED" || verdict === "RUNNING" || isRunningProver;

  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-border-hairline bg-white dark:bg-bg-panel overflow-hidden shadow-xs">
      {/* Top Banner / Prover Status */}
      <div className="p-3 sm:p-3.5 bg-gray-50/90 dark:bg-bg-panel-raised/50 border-b border-gray-200/80 dark:border-border-hairline flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent-scan/10 border border-accent-scan/30 flex items-center justify-center text-accent-scan">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-text-primary font-sans">
                Autonomous AI Prover & Sandbox
              </span>
              <span className="text-[10px] text-text-muted font-mono">
                (EVM Sandbox Engine)
              </span>
            </div>
            <div className="text-[11px] text-text-muted flex items-center gap-2 font-mono">
              {isSimulating ? (
                <span className="text-accent-scan flex items-center gap-1 font-bold animate-pulse">
                  <Radio className="h-3 w-3 animate-spin" />
                  SIMULATING IN VIRTUAL EVM SANDBOX...
                </span>
              ) : isExploitProven ? (
                <span className="text-signal-critical flex items-center gap-1 font-bold">
                  <ShieldAlert className="h-3 w-3" />
                  PROVEN EXPLOITABLE {fundsDrainedEth ? `(+${fundsDrainedEth} ETH DRAINED)` : ""}
                </span>
              ) : isFalsePositive ? (
                <span className="text-signal-resolved flex items-center gap-1 font-bold">
                  <ShieldCheck className="h-3 w-3" />
                  PROVEN FALSE POSITIVE (EXECUTION REVERTED)
                </span>
              ) : isCannotReproduce ? (
                <span className="text-text-muted flex items-center gap-1 font-medium">
                  <Layers className="h-3 w-3" />
                  UNREPRODUCIBLE IN SANDBOX
                </span>
              ) : (
                <span className="text-text-muted flex items-center gap-1">
                  <Terminal className="h-3 w-3" />
                  Awaiting Autonomous Verification
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Actions: Tabs & Manual Run */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-gray-200/60 dark:bg-bg-void rounded-lg p-0.5 text-xs font-sans">
            <button
              onClick={() => setActiveTab("stepper")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeTab === "stepper"
                  ? "bg-white dark:bg-bg-panel text-accent-scan shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Trace Replay {steps.length > 0 && `(${steps.length})`}
            </button>
            <button
              onClick={() => setActiveTab("poc")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeTab === "poc"
                  ? "bg-white dark:bg-bg-panel text-accent-scan shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              PoC Contract {synthesizedPoC && "✓"}
            </button>
          </div>

          {findingId && showAgentFlow && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLogsOpen(true)}
              className="h-7 text-[11px] px-2.5 text-text-primary border-gray-300 dark:border-border-hairline hover:bg-gray-100 dark:hover:bg-white/5 font-sans"
              leftIcon={<Brain className="h-3 w-3 text-purple-400" />}
            >
              Agent Flow
            </Button>
          )}

          {onRunProver && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRunProver}
              disabled={isSimulating}
              className="h-7 text-[11px] px-2.5 text-accent-scan border-accent-scan/30 hover:bg-accent-scan/10 font-sans"
              leftIcon={<Sparkles className="h-3 w-3" />}
            >
              {isSimulating ? "Proving..." : "Re-Prove"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area: Stepper Tab */}
      {activeTab === "stepper" && (
        <div className="p-3 sm:p-4">
          {steps.length > 0 ? (
            <div className="space-y-4">
              {/* Stepper Timeline Navigation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-semibold text-text-primary flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-accent-scan" />
                    <span>Execution Step {currentStepIndex + 1} of {steps.length}</span>
                  </span>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-text-muted hover:text-text-primary"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIndex(0);
                      }}
                      title="Reset to Step 1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-text-muted hover:text-text-primary"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                      }}
                      disabled={currentStepIndex === 0}
                      title="Previous Step"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={isPlaying ? "primary" : "outline"}
                      size="sm"
                      className={`h-7 px-2.5 text-xs font-bold ${
                        isPlaying
                          ? "bg-accent-scan text-bg-void"
                          : "text-accent-scan border-accent-scan/40"
                      }`}
                      onClick={() => setIsPlaying(!isPlaying)}
                      leftIcon={isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-text-muted hover:text-text-primary"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
                      }}
                      disabled={currentStepIndex === steps.length - 1}
                      title="Next Step"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Step Progress Dots */}
                <div className="grid grid-flow-col auto-cols-fr gap-1.5 pt-1">
                  {steps.map((st, idx) => {
                    const isActive = idx === currentStepIndex;
                    const isPassed = idx < currentStepIndex;
                    const isCriticalStep = st.type === "REENTRANT_CALL" || st.type === "DRAIN_COMPLETE";

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentStepIndex(idx);
                        }}
                        className={`h-2 rounded-full transition-all ${
                          isActive
                            ? isCriticalStep
                              ? "bg-signal-critical ring-2 ring-signal-critical/30"
                              : "bg-accent-scan ring-2 ring-accent-scan/30"
                            : isPassed
                            ? "bg-accent-scan/60"
                            : "bg-gray-200 dark:bg-border-hairline hover:bg-gray-300"
                        }`}
                        title={`Step ${idx + 1}: ${st.type} - ${st.functionCalled}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Active Step Visual Card */}
              {currentStep && (
                <div className="rounded-xl border border-gray-200/80 dark:border-border-hairline bg-gray-50/50 dark:bg-bg-void/60 p-3 sm:p-4 space-y-3 font-mono text-xs">
                  {/* Step Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/70 dark:border-border-hairline pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-accent-scan font-bold text-xs">
                        STEP #{currentStep.stepIndex}
                      </span>
                      {getCallTypeBadge(currentStep.type)}
                      <span className="text-text-primary font-bold font-sans text-xs">
                        {currentStep.functionCalled}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-text-muted">
                      {currentStep.gasUsed && (
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-signal-high" />
                          {currentStep.gasUsed.toLocaleString()} gas
                        </span>
                      )}
                      {currentStep.success ? (
                        <span className="text-signal-resolved flex items-center gap-1 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          SUCCESS
                        </span>
                      ) : (
                        <span className="text-signal-critical flex items-center gap-1 font-bold">
                          <XCircle className="h-3.5 w-3.5" />
                          REVERTED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Caller -> Target Flow */}
                  <div className="p-3 rounded-lg bg-white dark:bg-bg-panel border border-gray-200/70 dark:border-border-hairline space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-2 text-xs">
                      {/* Caller */}
                      <div className="md:col-span-5 p-2 rounded-md bg-gray-50 dark:bg-bg-void/80 border border-gray-200/60 dark:border-border-hairline space-y-1">
                        <div className="text-[10px] text-text-muted uppercase font-sans font-semibold">FROM (CALLER)</div>
                        <div className="font-mono text-text-primary truncate font-medium">
                          {currentStep.from}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="md:col-span-1 flex justify-center text-accent-scan">
                        <ArrowRight className="h-4 w-4" />
                      </div>

                      {/* Target */}
                      <div className="md:col-span-5 p-2 rounded-md bg-gray-50 dark:bg-bg-void/80 border border-gray-200/60 dark:border-border-hairline space-y-1">
                        <div className="text-[10px] text-text-muted uppercase font-sans font-semibold">TO (TARGET)</div>
                        <div className="font-mono text-text-primary truncate font-medium">
                          {currentStep.to}
                        </div>
                      </div>
                    </div>

                    {/* Value attached */}
                    {currentStep.valueWei && currentStep.valueWei !== "0" && (
                      <div className="flex items-center justify-between text-xs px-1 text-signal-high font-medium">
                        <span>Attached Value:</span>
                        <span className="font-bold">{formatEthValue(currentStep.valueWei)}</span>
                      </div>
                    )}
                  </div>

                  {/* State Change Delta Explanation */}
                  <div className="p-2.5 rounded-lg bg-accent-scan/5 border border-accent-scan/20 space-y-1 font-sans">
                    <div className="text-[10px] font-bold text-accent-scan uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      <span>State Transition & EVM Memory Effect</span>
                    </div>
                    <p className="text-xs text-text-primary leading-relaxed">
                      {currentStep.stateChangeSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Step Sequence Preview */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-text-muted font-sans font-medium uppercase tracking-wider">
                  Execution Trace Steps:
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {steps.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIndex(i);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-md border text-left text-xs font-mono transition-colors ${
                        i === currentStepIndex
                          ? "bg-accent-scan/10 border-accent-scan/40 text-text-primary"
                          : "bg-white dark:bg-bg-panel border-gray-200/70 dark:border-border-hairline text-text-muted hover:text-text-primary"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-accent-scan font-bold">#{s.stepIndex}</span>
                        <span className="truncate">{s.functionCalled}</span>
                      </span>
                      <span className="text-[10px] shrink-0 font-sans text-text-muted">
                        {s.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : isSimulating ? (
            /* Simulation In-Progress State */
            <div className="py-10 px-4 text-center space-y-3">
              <div className="h-10 w-10 mx-auto rounded-xl bg-accent-scan/10 border border-accent-scan/30 flex items-center justify-center text-accent-scan">
                <Radio className="h-5 w-5 animate-spin" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-text-primary font-sans">
                  Autonomous AI EVM Sandbox Prover Executing...
                </div>
                <p className="text-[11px] text-text-muted max-w-md mx-auto leading-relaxed">
                  The AI agent is constructing an executable Foundry test suite in an isolated Docker container to mathematically verify or disprove this finding. Traces will appear here once simulation completes.
                </p>
              </div>
            </div>
          ) : isFalsePositive ? (
            /* False Positive Confirmed State */
            <div className="py-10 px-4 text-center space-y-3">
              <div className="h-10 w-10 mx-auto rounded-xl bg-signal-resolved/10 border border-signal-resolved/30 flex items-center justify-center text-signal-resolved">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-signal-resolved font-sans">
                  Proven False Positive (Execution Reverted Safely)
                </div>
                <p className="text-[11px] text-text-muted max-w-md mx-auto leading-relaxed">
                  The autonomous prover attempted to exploit this finding in the EVM sandbox. All state-changing invocations reverted with mutex locked or invariant held. 0 ETH at risk.
                </p>
              </div>
            </div>
          ) : isCannotReproduce ? (
            /* Cannot Reproduce State */
            <div className="py-10 px-4 text-center space-y-3">
              <div className="h-10 w-10 mx-auto rounded-xl bg-gray-500/10 border border-gray-500/30 flex items-center justify-center text-text-muted">
                <Layers className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-text-primary font-sans">
                  Could Not Reproduce Exploit
                </div>
                <p className="text-[11px] text-text-muted max-w-md mx-auto leading-relaxed">
                  The autonomous agent was unable to synthesize a valid attack sequence or trigger an invariant violation under sandboxed EVM conditions.
                </p>
              </div>
            </div>
          ) : (
            /* Awaiting Prover State */
            <div className="py-10 px-4 text-center space-y-3">
              <div className="h-10 w-10 mx-auto rounded-xl bg-gray-200/60 dark:bg-bg-void border border-border-hairline flex items-center justify-center text-text-muted">
                <Terminal className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-text-primary font-sans">
                  No EVM Trace Recorded Yet
                </div>
                <p className="text-[11px] text-text-muted max-w-md mx-auto leading-relaxed">
                  This finding has not been simulated in the autonomous EVM sandbox yet. Run the prover to synthesize a Foundry proof and capture transaction traces.
                </p>
              </div>
              {onRunProver && (
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRunProver}
                    disabled={isSimulating}
                    className="text-xs text-accent-scan border-accent-scan/30 hover:bg-accent-scan/10 font-sans"
                    leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                  >
                    Run Autonomous AI Prover
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PoC Contract Tab */}
      {activeTab === "poc" && (
        <div className="p-3 sm:p-4 space-y-3 font-mono text-xs">
          {synthesizedPoC ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-text-primary font-sans font-medium">
                  <Code2 className="h-3.5 w-3.5 text-accent-scan" />
                  <span>Synthesized Foundry Test PoC</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPoC}
                  className="h-7 text-xs text-text-muted hover:text-text-primary"
                  leftIcon={copied ? <Check className="h-3 w-3 text-signal-resolved" /> : <Copy className="h-3 w-3" />}
                >
                  {copied ? "Copied" : "Copy PoC"}
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-bg-void border border-gray-200/80 dark:border-border-hairline max-h-72 overflow-y-auto overflow-x-auto text-[11px] leading-relaxed text-text-primary">
                <pre className="font-mono whitespace-pre">{synthesizedPoC}</pre>
              </div>
            </>
          ) : isSimulating ? (
            <div className="py-10 px-4 text-center space-y-2 font-sans">
              <div className="h-8 w-8 mx-auto rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <Radio className="h-4 w-4 animate-spin" />
              </div>
              <div className="text-xs font-bold text-text-primary">
                Synthesizing Foundry Test PoC...
              </div>
              <p className="text-[11px] text-text-muted max-w-md mx-auto">
                The agent is generating and validating the Solidity test contract in the sandbox environment.
              </p>
            </div>
          ) : isFalsePositive ? (
            <div className="py-10 px-4 text-center space-y-2 font-sans">
              <div className="h-8 w-8 mx-auto rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold text-signal-resolved">
                Attack Invariant Preserved
              </div>
              <p className="text-[11px] text-text-muted max-w-md mx-auto">
                The simulated attack reverted safely in the EVM sandbox. No exploit test contract was generated.
              </p>
            </div>
          ) : (
            <div className="py-10 px-4 text-center space-y-2 font-sans">
              <div className="h-8 w-8 mx-auto rounded-lg bg-gray-200/60 dark:bg-bg-void text-text-muted flex items-center justify-center">
                <FileCode className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold text-text-primary">
                No PoC Contract Available
              </div>
              <p className="text-[11px] text-text-muted max-w-md mx-auto">
                Run the autonomous prover to synthesize an executable Foundry exploit test for this finding.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Autonomous AI Agent Execution Flow Drawer */}
      {showAgentFlow && (
        <AgentFlowDrawer
          isOpen={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
          findingId={findingId}
          findingTitle={title}
          findingSeverity={findingSeverity}
          verdict={verdict}
          fundsDrainedEth={fundsDrainedEth}
        />
      )}
    </div>
  );
}
