"use client";

import * as React from "react";
import {
  X,
  Cpu,
  Terminal,
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Clock,
  Sparkles,
  Brain,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Flame,
  Radio,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface TranscriptEntry {
  timestamp: string;
  stepIndex: number;
  kind: "SYSTEM" | "USER_PROMPT" | "MODEL_THOUGHT" | "TOOL_CALL" | "TOOL_RESULT" | "VERDICT" | "ERROR";
  content?: string;
  toolCall?: {
    name: string;
    arguments: Record<string, any>;
  };
  toolResult?: {
    name: string;
    exitCode?: number;
    durationMs?: number;
    output: string;
    isError?: boolean;
  };
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  metadata?: Record<string, any>;
}

export interface AgentFlowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  findingId?: string;
  findingTitle?: string;
  findingSeverity?: string;
  verdict?: string;
  fundsDrainedEth?: number;
}

export function AgentFlowDrawer({
  isOpen,
  onClose,
  findingId,
  findingTitle,
  findingSeverity,
  verdict,
  fundsDrainedEth,
}: AgentFlowDrawerProps) {
  const [loading, setLoading] = React.useState(false);
  const [entries, setEntries] = React.useState<TranscriptEntry[]>([]);
  const [activeFilter, setActiveFilter] = React.useState<"all" | "commands" | "files" | "thoughts">("all");
  const [expandedSteps, setExpandedSteps] = React.useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Fetch transcript entries when drawer opens
  React.useEffect(() => {
    if (!isOpen || !findingId) {
      setEntries([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    apiClient
      .get(`/scanner/findings/${findingId}/transcript`)
      .then((res) => {
        if (isMounted) {
          const list = Array.isArray(res.data?.entries) ? res.data.entries : [];
          setEntries(list);
          // By default, auto-expand the latest 3 steps
          const autoExpand: Record<number, boolean> = {};
          list.slice(-3).forEach((e: TranscriptEntry) => {
            autoExpand[e.stepIndex] = true;
          });
          setExpandedSteps(autoExpand);
        }
      })
      .catch((err) => {
        console.warn("Failed to load transcript:", err.message);
        if (isMounted) setEntries([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, findingId]);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleExpand = (stepIndex: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepIndex]: !prev[stepIndex],
    }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    if (activeFilter === "commands") {
      return (
        (e.toolCall && e.toolCall.name === "run_command") ||
        (e.toolResult && e.toolResult.name === "run_command")
      );
    }
    if (activeFilter === "files") {
      return (
        (e.toolCall && (e.toolCall.name === "write_file" || e.toolCall.name === "read_file")) ||
        (e.toolResult && (e.toolResult.name === "write_file" || e.toolResult.name === "read_file"))
      );
    }
    if (activeFilter === "thoughts") {
      return e.kind === "MODEL_THOUGHT" || e.kind === "USER_PROMPT" || e.kind === "VERDICT";
    }
    return true;
  });

  const getStepIcon = (entry: TranscriptEntry) => {
    if (entry.kind === "VERDICT") {
      return <ShieldCheck className="h-4 w-4 text-signal-resolved" />;
    }
    if (entry.kind === "MODEL_THOUGHT") {
      return <Brain className="h-4 w-4 text-purple-400" />;
    }
    if (entry.kind === "USER_PROMPT" || entry.kind === "SYSTEM") {
      return <Terminal className="h-4 w-4 text-accent-scan" />;
    }
    if (entry.kind === "TOOL_CALL") {
      switch (entry.toolCall?.name) {
        case "run_command":
          return <Cpu className="h-4 w-4 text-signal-high" />;
        case "write_file":
          return <FileCode className="h-4 w-4 text-blue-400" />;
        case "read_file":
        case "search_code":
          return <Search className="h-4 w-4 text-teal-400" />;
        case "submit_verdict":
          return <Sparkles className="h-4 w-4 text-accent-scan" />;
        default:
          return <Terminal className="h-4 w-4 text-text-muted" />;
      }
    }
    if (entry.kind === "TOOL_RESULT") {
      return entry.toolResult?.isError ? (
        <XCircle className="h-4 w-4 text-signal-critical" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-signal-resolved" />
      );
    }
    return <Layers className="h-4 w-4 text-text-muted" />;
  };

  const getStepBadge = (entry: TranscriptEntry) => {
    if (entry.kind === "VERDICT") {
      return <Badge severity="resolved" size="sm">FINAL VERDICT</Badge>;
    }
    if (entry.kind === "TOOL_CALL") {
      const name = entry.toolCall?.name || "tool";
      if (name === "run_command") return <Badge severity="high" size="sm">FOUNDRY EXECUTION</Badge>;
      if (name === "write_file") return <Badge severity="medium" size="sm">SYNTHESIZE POC</Badge>;
      if (name === "read_file") return <Badge severity="informational" size="sm">READ SOURCE</Badge>;
      if (name === "search_code") return <Badge severity="informational" size="sm">SEARCH CODE</Badge>;
      if (name === "submit_verdict") return <Badge severity="critical" size="sm">SUBMIT VERDICT</Badge>;
      return <Badge severity="low" size="sm">{name}</Badge>;
    }
    if (entry.kind === "TOOL_RESULT") {
      return entry.toolResult?.isError ? (
        <Badge severity="critical" size="sm">REVERT / FAILED</Badge>
      ) : (
        <Badge severity="resolved" size="sm">PASSED</Badge>
      );
    }
    if (entry.kind === "MODEL_THOUGHT") {
      return <Badge severity="low" size="sm">AI REASONING</Badge>;
    }
    return <Badge severity="informational" size="sm">{entry.kind}</Badge>;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-2xl md:max-w-3xl bg-white dark:bg-[#0B0F17] border-l border-gray-200 dark:border-border-hairline h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-border-hairline bg-gray-50/80 dark:bg-bg-panel/40 flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-accent-scan font-bold tracking-wider">
                AI EVM SANDBOX EXECUTION LOGS
              </span>
              {findingSeverity && (
                <Badge
                  severity={
                    findingSeverity.toLowerCase() === "critical"
                      ? "critical"
                      : findingSeverity.toLowerCase() === "high"
                      ? "high"
                      : "medium"
                  }
                  size="sm"
                >
                  {findingSeverity.toUpperCase()}
                </Badge>
              )}
              {verdict && (
                <span
                  className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md ${
                    verdict === "PROVEN_EXPLOIT"
                      ? "bg-signal-critical/15 text-signal-critical border border-signal-critical/30"
                      : verdict === "PROVEN_FALSE_POSITIVE"
                      ? "bg-signal-resolved/15 text-signal-resolved border border-signal-resolved/30"
                      : "bg-gray-200 dark:bg-white/10 text-text-muted"
                  }`}
                >
                  {verdict}
                  {verdict === "PROVEN_EXPLOIT" && fundsDrainedEth && fundsDrainedEth > 0
                    ? ` (+${fundsDrainedEth} ETH)`
                    : ""}
                </span>
              )}
            </div>

            <h2 className="text-sm sm:text-base font-bold text-text-primary truncate">
              {findingTitle || findingId || "Finding Prover Transcript"}
            </h2>
            <p className="text-xs text-text-muted font-sans flex items-center gap-2">
              <span>Finding ID: <code className="font-mono text-[11px] text-text-primary">{findingId}</code></span>
              <span>·</span>
              <span>Total Recorded Steps: <b className="text-text-primary font-mono">{entries.length}</b></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-gray-200/50 dark:hover:bg-white/5 transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-4 py-2.5 border-b border-gray-200 dark:border-border-hairline bg-white dark:bg-bg-panel/20 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-bg-void p-1 rounded-lg">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeFilter === "all"
                  ? "bg-white dark:bg-bg-panel text-accent-scan shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              All Steps ({entries.length})
            </button>
            <button
              onClick={() => setActiveFilter("commands")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeFilter === "commands"
                  ? "bg-white dark:bg-bg-panel text-accent-scan shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Foundry Commands
            </button>
            <button
              onClick={() => setActiveFilter("files")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeFilter === "files"
                  ? "bg-white dark:bg-bg-panel text-accent-scan shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              PoC Files
            </button>
            <button
              onClick={() => setActiveFilter("thoughts")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeFilter === "thoughts"
                  ? "bg-white dark:bg-bg-panel text-accent-scan shadow-xs font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              AI Hypotheses
            </button>
          </div>

          <div className="text-[11px] text-text-muted hidden sm:block font-mono">
            Docker EVM Sandbox
          </div>
        </div>

        {/* Drawer Body: Step Timeline */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 font-sans">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="h-10 w-10 mx-auto rounded-xl bg-accent-scan/10 border border-accent-scan/30 flex items-center justify-center text-accent-scan">
                <Radio className="h-5 w-5 animate-spin" />
              </div>
              <div className="text-xs font-bold text-text-primary">
                Loading Prover Transcript...
              </div>
              <p className="text-[11px] text-text-muted max-w-sm mx-auto">
                Fetching turn-by-turn tool interactions, test compilations, and EVM revert traces from the agent daemon.
              </p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <div className="h-10 w-10 mx-auto rounded-xl bg-gray-200/60 dark:bg-bg-void border border-border-hairline flex items-center justify-center text-text-muted">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-xs font-bold text-text-primary">
                No Prover Logs Available Yet
              </div>
              <p className="text-[11px] text-text-muted max-w-sm mx-auto">
                The agent has not recorded an execution trace for this finding yet. Run the autonomous prover from the audit review page to generate a live trace.
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, idx) => {
              const isExpanded = expandedSteps[entry.stepIndex] ?? false;
              const hasCode =
                (entry.toolCall?.name === "write_file" && entry.toolCall?.arguments?.content) ||
                (entry.toolResult?.output && entry.toolResult.output.length > 0) ||
                (entry.toolCall?.name === "run_command" && entry.toolCall?.arguments?.command);

              return (
                <div
                  key={entry.stepIndex || idx}
                  className="rounded-xl border border-gray-200/80 dark:border-border-hairline bg-gray-50/50 dark:bg-[#0E131F] overflow-hidden transition-all shadow-xs"
                >
                  {/* Step Header */}
                  <div
                    onClick={() => toggleExpand(entry.stepIndex)}
                    className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-gray-100/60 dark:hover:bg-white/5 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-gray-200/60 dark:bg-bg-void flex items-center justify-center shrink-0">
                        {getStepIcon(entry)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-accent-scan">
                            Step #{entry.stepIndex}
                          </span>
                          {getStepBadge(entry)}
                          {entry.timestamp && (
                            <span className="text-[10px] text-text-muted font-mono hidden sm:inline">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>

                        {/* Title / Short preview */}
                        <div className="text-xs font-medium text-text-primary truncate mt-0.5 font-sans">
                          {entry.kind === "TOOL_CALL" && entry.toolCall ? (
                            <span>
                              Executing: <code className="font-mono text-accent-scan">{entry.toolCall.name}</code>
                              {entry.toolCall.name === "run_command" && (
                                <span className="text-text-muted ml-1.5 font-mono text-[11px]">
                                  {entry.toolCall.arguments?.command}
                                </span>
                              )}
                              {entry.toolCall.name === "write_file" && (
                                <span className="text-text-muted ml-1.5 font-mono text-[11px]">
                                  {entry.toolCall.arguments?.filePath}
                                </span>
                              )}
                            </span>
                          ) : entry.kind === "TOOL_RESULT" ? (
                            <span>
                              Result from <code className="font-mono">{entry.toolResult?.name}</code>
                              {entry.toolResult?.isError ? (
                                <span className="text-signal-critical ml-1.5 font-bold font-mono">
                                  [EVM REVERT / FAILED]
                                </span>
                              ) : (
                                <span className="text-signal-resolved ml-1.5 font-bold font-mono">
                                  [SUCCESS]
                                </span>
                              )}
                            </span>
                          ) : entry.kind === "VERDICT" ? (
                            <span className="text-signal-resolved font-bold">
                              Confirmed Verdict: {entry.content}
                            </span>
                          ) : (
                            <span className="text-text-muted italic truncate">
                              {entry.content?.slice(0, 100) || "Agent reasoning state"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-text-muted shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Step Expanded Content */}
                  {isExpanded && (
                    <div className="p-3 sm:p-4 border-t border-gray-200/60 dark:border-border-hairline bg-white dark:bg-bg-void/70 space-y-3 text-xs font-mono">
                      {/* Reason / Thought content */}
                      {entry.content && (
                        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-text-primary space-y-1 font-sans">
                          <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Brain className="h-3.5 w-3.5" />
                            <span>AI Agent Reasoning & Strategy</span>
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-text-primary">
                            {entry.content}
                          </p>
                        </div>
                      )}

                      {/* Tool Arguments (for write_file or run_command) */}
                      {entry.toolCall && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-text-muted font-sans font-medium">
                            <span>Tool Payload: <code className="font-mono text-accent-scan">{entry.toolCall.name}</code></span>
                            {entry.toolCall.arguments?.content && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(entry.toolCall?.arguments?.content, `tool_${entry.stepIndex}`)}
                                className="h-6 text-[10px] px-2 text-text-muted hover:text-text-primary"
                                leftIcon={
                                  copiedId === `tool_${entry.stepIndex}` ? (
                                    <Check className="h-3 w-3 text-signal-resolved" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )
                                }
                              >
                                {copiedId === `tool_${entry.stepIndex}` ? "Copied" : "Copy Code"}
                              </Button>
                            )}
                          </div>

                          {entry.toolCall.name === "write_file" && entry.toolCall.arguments?.content && (
                            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 max-h-80 overflow-auto text-[11px] leading-relaxed">
                              <pre className="font-mono whitespace-pre">{entry.toolCall.arguments.content}</pre>
                            </div>
                          )}

                          {entry.toolCall.name === "run_command" && (
                            <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-accent-scan font-mono text-[11px] flex items-center justify-between">
                              <span>$ {entry.toolCall.arguments?.command}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(entry.toolCall?.arguments?.command, `cmd_${entry.stepIndex}`)}
                                className="h-5 text-[10px] px-1 text-text-muted hover:text-text-primary"
                              >
                                Copy
                              </Button>
                            </div>
                          )}

                          {entry.toolCall.name === "submit_verdict" && (
                            <div className="p-3 rounded-lg bg-accent-scan/10 border border-accent-scan/30 space-y-1 font-sans">
                              <div className="text-xs font-bold text-accent-scan">
                                Verdict: {entry.toolCall.arguments?.verdict}
                              </div>
                              <p className="text-xs text-text-primary leading-relaxed font-sans">
                                {entry.toolCall.arguments?.reasoning}
                              </p>
                              {entry.toolCall.arguments?.fundsDrainedEth !== undefined && (
                                <div className="text-[11px] font-mono text-signal-high pt-1">
                                  Funds Drained: {entry.toolCall.arguments.fundsDrainedEth} ETH
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tool Result / Terminal Output */}
                      {entry.toolResult && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-text-muted font-sans font-medium">
                            <span className="flex items-center gap-1.5">
                              <Terminal className="h-3 w-3 text-accent-scan" />
                              <span>Execution Output ({entry.toolResult.output.length} bytes)</span>
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(entry.toolResult?.output || "", `out_${entry.stepIndex}`)}
                              className="h-6 text-[10px] px-2 text-text-muted hover:text-text-primary"
                              leftIcon={
                                copiedId === `out_${entry.stepIndex}` ? (
                                  <Check className="h-3 w-3 text-signal-resolved" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )
                              }
                            >
                              {copiedId === `out_${entry.stepIndex}` ? "Copied" : "Copy Output"}
                            </Button>
                          </div>

                          <div className="p-3 rounded-lg bg-[#070A0F] border border-gray-800/80 text-gray-200 max-h-80 overflow-auto text-[11px] leading-relaxed">
                            <pre className="font-mono whitespace-pre-wrap">{entry.toolResult.output}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 sm:p-4 border-t border-gray-200 dark:border-border-hairline bg-gray-50/80 dark:bg-bg-panel/40 flex items-center justify-between text-xs text-text-muted font-sans">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-signal-resolved animate-pulse" />
            <span>Zyron Autonomous Prover Daemon · Foundry Sandbox</span>
          </div>

          <Button variant="outline" size="sm" onClick={onClose} className="h-7 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
