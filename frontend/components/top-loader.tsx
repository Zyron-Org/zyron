"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Global triggers that can be invoked programmatically from anywhere
 * (e.g., during router.push, form submissions, or manual transitions).
 */
export function startTopLoader() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zyron:navigation-start"));
  }
}

export function stopTopLoader() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zyron:navigation-stop"));
  }
}

function TopLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [visible, setVisible] = React.useState(false);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  };

  const start = React.useCallback(() => {
    clearAllTimers();
    setVisible(true);
    setIsLoading(true);
    setProgress(15);

    // Progressive crawling animation
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 90;
        }
        // Move faster at first, then slow down near 90%
        const diff = (92 - prev) * 0.12;
        return Math.min(prev + Math.max(diff, 0.5), 90);
      });
    }, 120);
  }, []);

  const finish = React.useCallback(() => {
    clearAllTimers();
    setProgress(100);

    fadeTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      resetTimerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
    }, 200);
  }, []);

  // Listen for route changes (App Router pathname/searchParams update)
  React.useEffect(() => {
    finish();
  }, [pathname, searchParams, finish]);

  // Listen for programmatic / global start & stop events
  React.useEffect(() => {
    const handleStart = () => start();
    const handleStop = () => finish();

    window.addEventListener("zyron:navigation-start", handleStart);
    window.addEventListener("zyron:navigation-stop", handleStop);

    return () => {
      window.removeEventListener("zyron:navigation-start", handleStart);
      window.removeEventListener("zyron:navigation-stop", handleStop);
    };
  }, [start, finish]);

  // Intercept all internal Link / <a> clicks
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore right clicks or clicks with modifier keys
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore hash links, external links, javascript/mailto/tel, downloads, or target="_blank"
      if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank" ||
        target.hasAttribute("download")
      ) {
        return;
      }

      // Check if target is internal URL
      try {
        const nextUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Different origin -> ignore
        if (nextUrl.origin !== currentUrl.origin) return;

        // Same exact pathname and search query -> ignore
        if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) {
          return;
        }

        // Internal navigation detected -> start loader immediately!
        start();
      } catch {
        // invalid URL
      }
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      clearAllTimers();
    };
  }, [start]);

  if (!visible) return null;

  return (
    <>
      {/* ─── 1. TOP PROGRESS BAR LINE INDICATOR ─── */}
      <div
        className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3px] overflow-hidden"
        style={{
          opacity: isLoading ? 1 : 0,
          transition: "opacity 250ms ease-out",
        }}
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-accent-scan via-sky-400 to-accent-scan shadow-[0_0_12px_rgba(94,200,255,0.9),0_0_4px_rgba(94,200,255,0.6)] relative"
          style={{
            width: `${progress}%`,
            transition: progress === 100 ? "width 150ms ease-out" : "width 200ms cubic-bezier(0.1, 0.5, 0.1, 1)",
          }}
        >
          {/* Glowing peg on right end */}
          <div className="absolute right-0 top-0 bottom-0 w-24 shadow-[0_0_15px_#5ec8ff,0_0_8px_#5ec8ff] transform rotate-3 translate-x-1 -translate-y-1 opacity-100" />
        </div>
      </div>

      {/* ─── 2. TOP RIGHT LOADING SPINNER ─── */}
      <div
        className="fixed top-3.5 right-4 z-[999999] pointer-events-none flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-bg-panel/90 dark:bg-bg-panel/90 backdrop-blur-md border border-border-hairline shadow-lg"
        style={{
          opacity: isLoading ? 1 : 0,
          transform: isLoading ? "scale(1)" : "scale(0.85)",
          transition: "opacity 200ms ease-out, transform 200ms ease-out",
        }}
        aria-label="Loading page navigation"
      >
        <div className="h-3.5 w-3.5 rounded-full border-2 border-accent-scan/20 border-t-accent-scan border-r-accent-scan animate-spin drop-shadow-[0_0_6px_rgba(94,200,255,0.7)]" />
        <span className="font-mono text-[10px] font-semibold text-accent-scan tracking-wider uppercase select-none">
          Loading…
        </span>
      </div>
    </>
  );
}

export function TopLoader() {
  return (
    <React.Suspense fallback={null}>
      <TopLoaderInner />
    </React.Suspense>
  );
}
