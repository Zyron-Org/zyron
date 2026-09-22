"use client";

import React from "react";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-solidity";

// Enhance Prism Solidity grammar with EVM specific variables, security functions, and libraries
if (Prism.languages.solidity && !(Prism.languages.solidity as any).__zyron_enhanced) {
  try {
    Prism.languages.insertBefore("solidity", "keyword", {
      "evm-variable": /\b(?:msg\.(?:sender|value|data|sig)|tx\.(?:origin|gasprice)|block\.(?:timestamp|number|prevrandao|chainid|basefee|gaslimit|coinbase)|address\(this\))\b/,
      "security-call": /\b(?:require|assert|revert)\b(?=\s*\()/,
      "safe-erc20": /\b(?:safeTransfer|safeTransferFrom|safeApprove|safeIncreaseAllowance|safeDecreaseAllowance)\b/,
    });
    (Prism.languages.solidity as any).__zyron_enhanced = true;
  } catch (e) {
    // Graceful fallback if grammar is already locked
  }
}

export interface HighlightToken {
  text: string;
  classes: string[];
}

/**
 * Tokenizes a single line of Solidity code into structured tokens with CSS classes.
 * Accurately handles NatSpec comments, EVM globals, keywords, types, and strings.
 */
export function tokenizeSolidityLine(code: string): HighlightToken[] {
  if (!code) return [{ text: "", classes: [] }];

  const trimmed = code.trim();

  // Handle multi-line docstring/comment lines (e.g., " * @param user Address of user")
  if (trimmed.startsWith("*") || trimmed.startsWith("/**") || trimmed.startsWith("*/")) {
    const tokens: HighlightToken[] = [];
    const indent = code.slice(0, code.indexOf(trimmed));
    if (indent) {
      tokens.push({ text: indent, classes: [] });
    }

    // Parse NatSpec tags like @notice, @param, @return, @dev
    const natspecRegex = /(@(?:notice|param|return|dev|title|author|custom:[a-z-]+))\b/g;
    let lastIdx = 0;
    let match;

    while ((match = natspecRegex.exec(trimmed)) !== null) {
      if (match.index > lastIdx) {
        tokens.push({
          text: trimmed.slice(lastIdx, match.index),
          classes: ["token", "comment"],
        });
      }
      tokens.push({
        text: match[1],
        classes: ["token", "comment", "natspec-tag"],
      });
      lastIdx = match.index + match[1].length;
    }

    if (lastIdx < trimmed.length) {
      tokens.push({
        text: trimmed.slice(lastIdx),
        classes: ["token", "comment"],
      });
    }

    return tokens;
  }

  try {
    const tokens = Prism.tokenize(code, Prism.languages.solidity);
    const result: HighlightToken[] = [];

    const processToken = (tok: Prism.Token | string, parentClasses: string[] = []) => {
      if (typeof tok === "string") {
        result.push({ text: tok, classes: [...parentClasses] });
      } else if (Array.isArray(tok)) {
        tok.forEach((t) => processToken(t, parentClasses));
      } else {
        const classes = [...parentClasses, "token", tok.type];
        if (tok.alias) {
          if (Array.isArray(tok.alias)) {
            classes.push(...tok.alias);
          } else {
            classes.push(tok.alias);
          }
        }

        if (typeof tok.content === "string") {
          result.push({ text: tok.content, classes });
        } else if (Array.isArray(tok.content)) {
          tok.content.forEach((c) => processToken(c, classes));
        } else {
          processToken(tok.content as any, classes);
        }
      }
    };

    tokens.forEach((t) => processToken(t));
    return result;
  } catch {
    return [{ text: code, classes: [] }];
  }
}

/**
 * High-performance syntax-highlighted Solidity code line component.
 */
export const HighlightedSolidityLine = React.memo(function HighlightedSolidityLine({
  code,
  className = "",
}: {
  code: string;
  className?: string;
}) {
  const tokens = React.useMemo(() => tokenizeSolidityLine(code), [code]);

  return (
    <span className={`solidity-code-line ${className}`}>
      {tokens.map((token, i) => (
        <span
          key={i}
          className={token.classes.length > 0 ? token.classes.join(" ") : undefined}
        >
          {token.text}
        </span>
      ))}
    </span>
  );
});

/**
 * Multi-line syntax highlighted Solidity code block component.
 */
export const HighlightedSolidityBlock = React.memo(function HighlightedSolidityBlock({
  code,
  className = "",
}: {
  code: string;
  className?: string;
}) {
  const lines = React.useMemo(() => code.split("\n"), [code]);

  return (
    <div className={`font-mono text-xs leading-relaxed space-y-0.5 ${className}`}>
      {lines.map((line, idx) => (
        <div key={idx} className="whitespace-pre">
          <HighlightedSolidityLine code={line} />
        </div>
      ))}
    </div>
  );
});

