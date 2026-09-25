"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, FileCode2 } from "lucide-react";
import { HighlightedSolidityBlock, HighlightedSolidityLine } from "@/lib/solidity-highlighter";

interface FindingCodeViewerProps {
  vulnerableCode?: string;
  vulnerableLines?: string;
  remediatedCode?: string;
  location?: string;
  sourceCode?: string;
  fuzzTestStatus?: string;
}

export function FindingCodeViewer({
  vulnerableCode,
  vulnerableLines,
  remediatedCode,
  location = "",
  sourceCode,
  fuzzTestStatus,
}: FindingCodeViewerProps) {
  // Determine if we have explicit vulnerableCode or if we extract snippet from sourceCode
  const extracted = React.useMemo(() => {
    if (vulnerableCode && vulnerableCode.trim().length > 0) {
      return null;
    }

    if (!sourceCode || !sourceCode.trim()) {
      return null;
    }

    // Try extracting line number from location (e.g. "BeeTradeOrderbook.sol:82" or "contracts/VaultCore.sol:142:5")
    const match = location.match(/:(\d+)(?::\d+)?$/) || location.match(/^(\d+)$/);
    const targetLine = match ? parseInt(match[1], 10) : 1;

    const allLines = sourceCode.split("\n");
    if (allLines.length === 0) return null;

    // Show 4 lines before and 5 lines after targetLine
    const startLine = Math.max(1, targetLine - 4);
    const endLine = Math.min(allLines.length, targetLine + 5);

    const slice = allLines.slice(startLine - 1, endLine).map((text, idx) => ({
      lineNumber: startLine + idx,
      isTarget: startLine + idx === targetLine,
      text,
    }));

    // Extract filename from location
    const fileName = location.includes(":") ? location.split(":")[0] : location;

    return {
      lines: slice,
      startLine,
      endLine,
      targetLine,
      fileName,
    };
  }, [vulnerableCode, sourceCode, location]);

  return (
    <div className="space-y-4">
      {/* 1. Vulnerable Code Section */}
      {vulnerableCode && vulnerableCode.trim().length > 0 ? (
        <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-signal-critical border-b border-border-hairline pb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-critical" />
              FLAGGED VULNERABLE CODE
            </span>
            <span className="text-[10px] text-text-muted">{vulnerableLines || location}</span>
          </div>
          <div className="text-text-primary leading-relaxed overflow-x-auto pt-1">
            <HighlightedSolidityBlock code={vulnerableCode} />
          </div>
        </div>
      ) : extracted ? (
        <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-signal-critical border-b border-border-hairline pb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-critical" />
              FLAGGED CODE SECTION · {extracted.fileName || "CONTRACT SOURCE"}
            </span>
            <span className="text-[10px] text-text-muted">
              Lines {extracted.startLine}–{extracted.endLine} (Issue on Line {extracted.targetLine})
            </span>
          </div>

          <div className="text-text-primary leading-relaxed overflow-x-auto pt-1 font-mono text-xs space-y-0.5">
            {extracted.lines.map((line) => (
              <div
                key={line.lineNumber}
                className={`flex items-start gap-3 px-2 py-0.5 rounded-[2px] transition-colors ${
                  line.isTarget
                    ? "bg-signal-critical/15 border-l-2 border-signal-critical text-text-primary font-medium"
                    : "hover:bg-bg-panel/40"
                }`}
              >
                <span
                  className={`w-9 shrink-0 text-right select-none text-[11px] ${
                    line.isTarget ? "text-signal-critical font-bold" : "text-text-muted/60"
                  }`}
                >
                  {line.isTarget ? `> ${line.lineNumber}` : line.lineNumber}
                </span>

                <div className="flex-1 whitespace-pre overflow-x-auto">
                  <HighlightedSolidityLine code={line.text || " "} />
                </div>

                {line.isTarget && (
                  <span className="shrink-0 text-[10px] font-bold text-signal-critical uppercase tracking-wider bg-signal-critical/20 px-1.5 py-0.2 rounded">
                    FLAGGED ISSUE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline text-xs font-mono text-text-muted flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-accent-scan" />
            <span>Referenced Location: <strong className="text-accent-scan">{location || "Contract Source"}</strong></span>
          </div>
          <span className="text-[10px] text-text-muted">Full source analysis linked</span>
        </div>
      )}

      {/* 2. Remediated Fix Block */}
      {remediatedCode && (
        <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-signal-resolved border-b border-border-hairline pb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-resolved" />
              VERIFIED REMEDIATION DIFF
            </span>
            <span className="text-[10px] text-signal-resolved font-medium">
              TARGET FIX
            </span>
          </div>
          <div className="text-text-primary leading-relaxed overflow-x-auto pt-1">
            <HighlightedSolidityBlock code={remediatedCode} />
          </div>
        </div>
      )}

      {/* 3. Fuzz Test Status */}
      {fuzzTestStatus && (
        <div className="p-2.5 rounded-[4px] bg-bg-void border border-border-hairline flex items-center justify-between text-xs font-mono text-text-muted">
          <span className="text-signal-resolved flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-signal-resolved" />
            {fuzzTestStatus}
          </span>
        </div>
      )}
    </div>
  );
}
