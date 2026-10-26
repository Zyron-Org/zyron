"use client";

import * as React from "react";
import { Terminal, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";

interface TerminalLine {
  text: string;
  type: "info" | "warn" | "critical" | "success";
  prefix?: string;
}

const SCAN_SEQUENCE: TerminalLine[] = [
  {
    prefix: "[0.00s]",
    text: "Parsing contract bytecode (VaultCore.sol:0x71C8364...)...",
    type: "info",
  },
  {
    prefix: "[0.38s]",
    text: "Disassembling 1,842 EVM opcodes — AST taint tree verified (14 levels).",
    type: "info",
  },
  {
    prefix: "[0.72s]",
    text: "Deploying target to ephemeral virtual EVM sandbox fork (Block #19,482,014)...",
    type: "info",
  },
  {
    prefix: "[1.15s]",
    text: "AI Red-Team Agent synthesizing adversarial exploit vectors (Flash-Loan Reentrancy)...",
    type: "warn",
  },
  {
    prefix: "[1.58s]",
    text: "💥 SIMULATED EXPLOIT SUCCESS: Drained $250,000 USDC on virtual fork — Line 142",
    type: "critical",
  },
  {
    prefix: "[1.95s]",
    text: "Foundry PoC test generated (test_reentrancy_drain.sol) with full EVM execution trace.",
    type: "info",
  },
  {
    prefix: "[2.30s]",
    text: "Automated scan & exploit simulation complete: Verified PoC routed to Lead Auditor.",
    type: "success",
  },
];

export function HeroTerminal() {
  const [visibleLineCount, setVisibleLineCount] = React.useState(0);
  const [currentLineCharIndex, setCurrentLineCharIndex] = React.useState(0);
  const [isSettled, setIsSettled] = React.useState(false);

  React.useEffect(() => {
    if (visibleLineCount >= SCAN_SEQUENCE.length) {
      setIsSettled(true);
      return;
    }

    const currentLine = SCAN_SEQUENCE[visibleLineCount];
    if (currentLineCharIndex < currentLine.text.length) {
      const timeout = setTimeout(() => {
        setCurrentLineCharIndex((prev) => prev + 1);
      }, 16);
      return () => clearTimeout(timeout);
    } else {
      const nextLineDelay = setTimeout(() => {
        setVisibleLineCount((prev) => prev + 1);
        setCurrentLineCharIndex(0);
      }, 350);
      return () => clearTimeout(nextLineDelay);
    }
  }, [visibleLineCount, currentLineCharIndex]);

  return (
    <div className="w-full rounded-[4px] border border-border-hairline bg-bg-panel overflow-hidden">
      {/* Terminal Window Chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-void/70 border-b border-border-hairline select-none">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#FF5468]" />
          <div className="h-2 w-2 rounded-full bg-[#FFD166]" />
          <div className="h-2 w-2 rounded-full bg-[#3DDC97]" />
          <span className="ml-2 font-mono text-[11px] text-text-muted">
            TERMINAL_SCAN // ENGINE_v2.4.0
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-text-muted hidden sm:inline">
            TARGET: VaultCore.sol (1,482 SLOC)
          </span>
          {isSettled ? (
            <Badge severity="resolved" size="sm">
              SCAN SETTLED
            </Badge>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-accent-scan">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-scan animate-ping" />
              SCANNING
            </span>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 sm:p-5 font-mono text-xs leading-relaxed space-y-2 min-h-[220px] bg-bg-void/40">
        {SCAN_SEQUENCE.slice(0, visibleLineCount).map((line, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-text-muted/60 shrink-0 select-none">
              {line.prefix}
            </span>
            <span
              className={
                line.type === "critical"
                  ? "text-signal-critical font-medium"
                  : line.type === "warn"
                  ? "text-signal-high font-medium"
                  : line.type === "success"
                  ? "text-signal-resolved font-medium"
                  : "text-text-primary"
              }
            >
              {line.text}
            </span>
          </div>
        ))}

        {/* Currently typing line */}
        {visibleLineCount < SCAN_SEQUENCE.length && (
          <div className="flex items-start gap-2">
            <span className="text-text-muted/60 shrink-0 select-none">
              {SCAN_SEQUENCE[visibleLineCount].prefix}
            </span>
            <span
              className={
                SCAN_SEQUENCE[visibleLineCount].type === "critical"
                  ? "text-signal-critical font-medium"
                  : SCAN_SEQUENCE[visibleLineCount].type === "warn"
                  ? "text-signal-high font-medium"
                  : "text-text-primary"
              }
            >
              {SCAN_SEQUENCE[visibleLineCount].text.slice(
                0,
                currentLineCharIndex
              )}
              <span className="inline-block w-2 h-3.5 bg-accent-scan ml-0.5 animate-pulse align-middle" />
            </span>
          </div>
        )}

        {/* Finished / Settled state footer */}
        {isSettled && (
          <div className="pt-3 mt-3 border-t border-border-hairline flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
            <div className="flex items-center gap-2">
              <span className="text-signal-resolved">✓</span>
              <span>Ticket #ZAM-9481 created · Ready for Auditor Review</span>
            </div>
            <span className="text-accent-scan">ETA Manual Turnaround: 48h</span>
          </div>
        )}
      </div>
    </div>
  );
}
