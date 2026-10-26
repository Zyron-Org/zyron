"use client";

import * as React from "react";
import { ChainLogo } from "@/components/ui/chain-logos";
import { ShieldCheck } from "lucide-react";

export function SupportedChainsShowcase() {
  const items = [
    { type: "chain", name: "MONAD", logo: "Monad" },
    { type: "chain", name: "ETHEREUM", logo: "Ethereum" },
    { type: "chain", name: "BASE", logo: "Base" },
    { type: "chain", name: "ROBINHOOD", logo: "Robinhood" },
    { type: "tag", name: "SUPPORTED NETWORKS" },
  ];

  // Repeat sequence so that each half of the marquee is sufficiently wide on ultra-wide screens
  const sequence = [...items, ...items, ...items, ...items];

  const renderItem = (item: (typeof items)[0], index: number, prefix: string) => {
    if (item.type === "tag") {
      return (
        <span
          key={`${prefix}-tag-${index}`}
          className="inline-flex items-center gap-1.5 opacity-90 font-mono font-bold tracking-widest text-xs uppercase shrink-0"
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
          <span>{item.name}</span>
        </span>
      );
    }

    return (
      <span
        key={`${prefix}-chain-${item.name}-${index}`}
        className="inline-flex items-center gap-2 font-mono font-bold tracking-widest text-xs uppercase shrink-0"
      >
        <ChainLogo name={item.logo!} className="h-4 w-4 shrink-0" />
        <span>{item.name}</span>
      </span>
    );
  };

  return (
    <div className="w-full bg-accent-scan text-white dark:text-[#0B0D10] py-2.5 sm:py-3 overflow-hidden whitespace-nowrap select-none border-y border-black/10 dark:border-black/20 z-20 relative">
      <style jsx>{`
        @keyframes ticker-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: ticker-scroll 70s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="ticker-track flex items-center">
        {/* Track 1 */}
        <div className="flex items-center gap-6 sm:gap-8 pr-6 sm:pr-8">
          {sequence.map((item, idx) => (
            <React.Fragment key={`t1-${idx}`}>
              {renderItem(item, idx, "t1")}
              <span className="opacity-50 text-xs select-none">•</span>
            </React.Fragment>
          ))}
        </div>

        {/* Track 2 (Exact duplicate for seamless -50% loop) */}
        <div className="flex items-center gap-6 sm:gap-8 pr-6 sm:pr-8" aria-hidden="true">
          {sequence.map((item, idx) => (
            <React.Fragment key={`t2-${idx}`}>
              {renderItem(item, idx, "t2")}
              <span className="opacity-50 text-xs select-none">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
