"use client";

import * as React from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Code2,
  Terminal,
  Cpu,
  FileCheck2,
  Sparkles,
  TrendingUp,
  Coins,
  Scale,
  Building2,
  Layers,
  GitBranch,
  Users,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  Minimize2,
  Grid,
  Play,
  Pause,
  Printer,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
  Check,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Radio,
  FileText,
  DollarSign,
  Activity,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- PITCH DECK SLIDE DEFINITIONS ---
interface SlideData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  category: "Vision" | "Market" | "Product" | "Business" | "Traction";
}

const SLIDES_META: SlideData[] = [
  {
    id: "cover",
    badge: "Executive Pitch Deck",
    title: "The Cryptographic Security Infrastructure for Web3",
    subtitle: "Deterministic AST Static Analysis, Dual-Auditor Verification, and On-Chain Bytecode Attestation.",
    category: "Vision",
  },
  {
    id: "problem",
    badge: "The Problem",
    title: "The Trillion-Dollar Web3 Security Bottleneck",
    subtitle: "Smart contracts secure billions in TVL, yet audits remain slow, manual black boxes with zero on-chain proof.",
    category: "Market",
  },
  {
    id: "solution",
    badge: "The Solution",
    title: "Zyron: Continuous, Verifiable Protocol Security",
    subtitle: "Replacing static PDFs with real-time automated AST scans, double-blind human triage, and immutable attestations.",
    category: "Product",
  },
  {
    id: "product-engine",
    badge: "Core Technology",
    title: "14-Pass AST & Symbolic Execution Engine",
    subtitle: "Enterprise-grade static analysis, taint tracking, and CFG graph reconstruction executing in sub-minute runs.",
    category: "Product",
  },
  {
    id: "dual-auditor",
    badge: "Human Intelligence",
    title: "Dual-Auditor Double-Blind Review Workbench",
    subtitle: "Combining machine speed with calibrated human expertise to eliminate false positives and formulate exploit PoCs.",
    category: "Product",
  },
  {
    id: "attestation",
    badge: "Cryptographic Proof",
    title: "On-Chain Attestation & Delivery Vault",
    subtitle: "Anchoring immutable SHA-256 bytecode hashes to EVM registries and the Ethereum Attestation Service (EAS).",
    category: "Product",
  },
  {
    id: "market",
    badge: "Market Opportunity",
    title: "A $6.8B Market Undergoing Paradigm Shift",
    subtitle: "Audits are transitioning from one-off compliance checks into continuous developer security infrastructure.",
    category: "Market",
  },
  {
    id: "business-model",
    badge: "Business Model",
    title: "Hybrid SaaS & High-Margin Audit Revenue",
    subtitle: "Predictable recurring revenue paired with high-ticket audit engagements settled via fiat and crypto escrow.",
    category: "Business",
  },
  {
    id: "competition",
    badge: "Competitive Moat",
    title: "Why Zyron Wins Against Legacy Firms",
    subtitle: "70% lower turnaround times, 50% cost efficiency, and the only platform with verifiable on-chain attestations.",
    category: "Business",
  },
  {
    id: "traction",
    badge: "Traction & Telemetry",
    title: "Proven Scale & Zero Exploits",
    subtitle: "Securing mission-critical DeFi protocols, liquidity pools, and multi-sig vaults across EVM networks.",
    category: "Traction",
  },
  {
    id: "roadmap",
    badge: "Vision & Ask",
    title: "The Roadmap to Universal Web3 Security",
    subtitle: "Scaling the decentralized security protocol, automated exploit synthesis, and institutional risk oracles.",
    category: "Vision",
  },
];

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = React.useState<number>(0);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [isOverviewOpen, setIsOverviewOpen] = React.useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState<boolean>(false);
  const deckContainerRef = React.useRef<HTMLDivElement>(null);

  const totalSlides = SLIDES_META.length;

  const nextSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const jumpToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
      setIsOverviewOpen(false);
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape") {
        if (isOverviewOpen) setIsOverviewOpen(false);
      } else if (e.key === "o" || e.key === "O" || e.key === "g" || e.key === "G") {
        e.preventDefault();
        setIsOverviewOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isOverviewOpen]);

  // Autoplay functionality
  React.useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= totalSlides - 1) {
          setIsAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 7000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, totalSlides]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      deckContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const progressPercent = Math.round(((currentSlide + 1) / totalSlides) * 100);

  return (
    <div
      ref={deckContainerRef}
      className={cn(
        "min-h-screen bg-[#07090E] text-text-primary flex flex-col justify-between selection:bg-accent-scan/30 relative overflow-hidden font-sans",
        isFullscreen ? "h-screen w-screen p-4 sm:p-8" : "p-3 sm:p-6 md:p-8"
      )}
    >
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-accent-scan/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Top Deck Navigation Bar */}
      <header className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
            title="Return to Zyron Portal"
          >
            <div className="h-8 w-8 rounded-lg bg-accent-scan/10 border border-accent-scan/30 flex items-center justify-center text-accent-scan group-hover:scale-105 transition-transform">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                ZYRON <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-accent-scan font-normal">DECK</span>
              </span>
              <span className="text-[10px] text-text-muted hidden sm:inline">Series A Investor & Protocol Presentation</span>
            </div>
          </Link>
        </div>

        {/* Center Pill: Current Slide & Title */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
          <span className="font-mono text-accent-scan font-bold">
            {String(currentSlide + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </span>
          <span className="text-white/20">•</span>
          <span className="text-white/80 font-medium truncate max-w-xs">{SLIDES_META[currentSlide].title}</span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Slide Overview Toggle */}
          <button
            type="button"
            onClick={() => setIsOverviewOpen(!isOverviewOpen)}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer",
              isOverviewOpen
                ? "bg-accent-scan/20 border-accent-scan/40 text-accent-scan"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
            )}
            title="Slide Overview (Press 'O' or 'G')"
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          {/* Autoplay Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer",
              isAutoPlaying
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
            )}
            title="Autoplay Slide Presentation"
          >
            {isAutoPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isAutoPlaying ? "Pause" : "Play"}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Fullscreen Toggle (Press 'F')"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Print / Save Deck */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Print or Save Deck (PDF)"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Slide Presentation Stage */}
      <main className="flex-1 flex flex-col justify-center items-center py-6 sm:py-8 max-w-6xl w-full mx-auto relative z-10">
        {/* Render Slide Content based on current index */}
        <div className="w-full transition-all duration-300 animate-fadeIn">
          {currentSlide === 0 && <SlideCover onNext={nextSlide} />}
          {currentSlide === 1 && <SlideProblem />}
          {currentSlide === 2 && <SlideSolution />}
          {currentSlide === 3 && <SlideEngine />}
          {currentSlide === 4 && <SlideDualAuditor />}
          {currentSlide === 5 && <SlideAttestation />}
          {currentSlide === 6 && <SlideMarket />}
          {currentSlide === 7 && <SlideBusinessModel />}
          {currentSlide === 8 && <SlideCompetition />}
          {currentSlide === 9 && <SlideTraction />}
          {currentSlide === 10 && <SlideRoadmap onRestart={() => setCurrentSlide(0)} />}
        </div>
      </main>

      {/* Bottom Deck Navigation Bar */}
      <footer className="shrink-0 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        {/* Progress Bar & Indicators */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-xs font-mono text-text-muted">
            <span className="text-white font-bold">{String(currentSlide + 1).padStart(2, "0")}</span>
            <span className="text-white/40"> / {String(totalSlides).padStart(2, "0")}</span>
          </div>
          <div className="h-1.5 w-32 sm:w-48 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-scan rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(94,200,255,0.7)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-white/50 hidden md:inline">
            {SLIDES_META[currentSlide].category}
          </span>
        </div>

        {/* Interactive Keyboard Shortcuts Tip */}
        <div className="text-[11px] text-text-muted hidden lg:flex items-center gap-2">
          <span>Navigate with</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] font-mono text-white/80">
            ←
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] font-mono text-white/80">
            →
          </kbd>
          <span>or</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] font-mono text-white/80">
            Space
          </kbd>
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none border border-white/10 text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          <button
            type="button"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-accent-scan text-bg-void hover:bg-accent-scan/90 disabled:opacity-30 disabled:pointer-events-none font-bold transition-all shadow-md shadow-accent-scan/20 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {/* Grid Overview Modal / Drawer */}
      {isOverviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-fadeIn">
          <div className="flex items-center justify-between pb-6 border-b border-white/10 max-w-6xl mx-auto w-full">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Presentation Slides Overview</h2>
              <p className="text-xs text-text-muted">Click any slide to jump directly to that section</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOverviewOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              Close (Esc)
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {SLIDES_META.map((meta, idx) => (
              <button
                key={meta.id}
                type="button"
                onClick={() => jumpToSlide(idx)}
                className={cn(
                  "text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-36 group cursor-pointer",
                  idx === currentSlide
                    ? "bg-accent-scan/10 border-accent-scan text-white shadow-lg shadow-accent-scan/10"
                    : "bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10 text-white/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent-scan">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-text-muted">
                    {meta.category}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-xs text-white line-clamp-1 group-hover:text-accent-scan transition-colors">
                    {meta.title}
                  </h3>
                  <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                    {meta.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// INDIVIDUAL SLIDE COMPONENTS
// ==========================================

// --- SLIDE 1: COVER ---
function SlideCover({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 py-6">
      {/* Category Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-scan/10 border border-accent-scan/30 text-accent-scan text-xs font-semibold">
        <Sparkles className="h-3.5 w-3.5" />
        <span>ZYRON PROTOCOL SECURITY — PITCH DECK</span>
      </div>

      {/* Hero Headline */}
      <div className="space-y-4 max-w-4xl">
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          The Cryptographic Security Infrastructure for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-scan via-sky-300 to-emerald-400">
            Web3 Protocols
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
          Replacing slow, opaque PDF audits with automated 14-pass AST static analysis, double-blind human auditor triage, and immutable on-chain bytecode attestations.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-4xl pt-4">
        {[
          { label: "14 AST Passes", desc: "Taint analysis in seconds", icon: Zap },
          { label: "Dual-Auditor", desc: "Double-blind review", icon: Users },
          { label: "On-Chain Proofs", desc: "SHA-256 EAS attestations", icon: FileCheck2 },
          { label: "Continuous CI/CD", desc: "@zyron-bot PR guardrails", icon: GitBranch },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-1 hover:border-accent-scan/40 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center mb-2">
                <Icon className="h-4 w-4" />
              </div>
              <div className="font-semibold text-xs text-white">{item.label}</div>
              <div className="text-[11px] text-text-muted">{item.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Primary CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-scan text-bg-void font-bold text-sm hover:bg-accent-scan/90 transition-all shadow-lg shadow-accent-scan/20 cursor-pointer"
        >
          <span>Explore Deck</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// --- SLIDE 2: THE PROBLEM ---
function SlideProblem() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Market Inefficiency"
        title="The Trillion-Dollar Web3 Security Bottleneck"
        description="Smart contracts safeguard over $120 Billion in TVL, yet audit infrastructure is fundamentally broken."
      />

      {/* Main Shock Metric Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-signal-critical/10 border border-signal-critical/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-signal-critical/20 text-signal-critical flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white">
              $3.8 Billion+ Lost Annually
            </div>
            <div className="text-xs text-text-muted">
              Over 68% of hacked protocols had completed a "traditional audit" before deploying to mainnet.
            </div>
          </div>
        </div>
        <div className="font-mono text-xs text-signal-critical px-3 py-1 rounded-full bg-signal-critical/15 border border-signal-critical/30 shrink-0">
          Source: Web3 REKT & CertiK 2024-2025
        </div>
      </div>

      {/* 3 Core Pain Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="h-8 w-8 rounded-lg bg-signal-critical/10 text-signal-critical flex items-center justify-center font-mono font-bold text-sm">
            01
          </div>
          <h3 className="font-semibold text-sm text-white">6-10 Week Waitlists</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Top audit firms operate like legacy consulting agencies. Fast-moving DeFi teams wait months just to get a schedule slot, stalling critical product launches.
          </p>
          <div className="text-[11px] font-mono text-text-muted pt-2 border-t border-white/10">
            Average delay: 45 business days
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="h-8 w-8 rounded-lg bg-signal-high/10 text-signal-high flex items-center justify-center font-mono font-bold text-sm">
            02
          </div>
          <h3 className="font-semibold text-sm text-white">The Static PDF Black Box</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Auditors deliver a static 50-page PDF report. The moment developers patch code or add a new contract parameter, the PDF is completely obsolete with zero regression testing.
          </p>
          <div className="text-[11px] font-mono text-text-muted pt-2 border-t border-white/10">
            Zero continuous regression tracking
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="h-8 w-8 rounded-lg bg-signal-medium/10 text-signal-medium flex items-center justify-center font-mono font-bold text-sm">
            03
          </div>
          <h3 className="font-semibold text-sm text-white">The "Trust Me" Deployment Gap</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Neither DeFi users nor liquidity providers have cryptographic proof that the on-chain deployed bytecode matches the code audited in the PDF.
          </p>
          <div className="text-[11px] font-mono text-text-muted pt-2 border-t border-white/10">
            Zero verifiable on-chain linkage
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 3: THE SOLUTION ---
function SlideSolution() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="The Zyron Paradigm"
        title="Continuous, Automated, and Verifiable Security"
        description="Zyron combines machine-speed static analysis with calibrated dual-human expertise and cryptographic on-chain attestations."
      />

      {/* 3 Pillars of Zyron */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <div className="p-5 rounded-xl bg-accent-scan/5 border border-accent-scan/30 space-y-3">
          <div className="h-9 w-9 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-white">Autonomous AST Passes</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            14 custom static analysis passes, taint analysis, and symbolic execution run the second contracts are submitted, catching 85% of known SWC vulnerabilities instantly.
          </p>
          <ul className="text-[11px] space-y-1.5 text-text-muted pt-2 border-t border-white/10">
            <li className="flex items-center gap-1.5 text-white/80">
              <Check className="h-3 w-3 text-accent-scan" /> Sub-minute automated analysis
            </li>
            <li className="flex items-center gap-1.5 text-white/80">
              <Check className="h-3 w-3 text-accent-scan" /> AST & CFG taint tracking
            </li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-white">Dual-Auditor Workbench</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Double-blind certified human auditors review findings, eliminate false positives, test economic edge cases, and collaborate with protocol devs in real-time remediation threads.
          </p>
          <ul className="text-[11px] space-y-1.5 text-text-muted pt-2 border-t border-white/10">
            <li className="flex items-center gap-1.5 text-white/80">
              <Check className="h-3 w-3 text-emerald-400" /> Consensus severity calibration
            </li>
            <li className="flex items-center gap-1.5 text-white/80">
              <Check className="h-3 w-3 text-emerald-400" /> Inline diff & PoC reviews
            </li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/30 space-y-3">
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-white">On-Chain Attestations</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Every verified engagement generates an immutable SHA-256 bytecode hash anchored to EVM contracts and the Ethereum Attestation Service (EAS). Zero trust required.
          </p>
          <ul className="text-[11px] space-y-1.5 text-text-muted pt-2 border-t border-white/10">
            <li className="flex items-center gap-1.5 text-white/80">
              <Check className="h-3 w-3 text-purple-400" /> Cryptographic bytecode proof
            </li>
            <li className="flex items-center gap-1.5 text-white/80">
              <Check className="h-3 w-3 text-purple-400" /> Embeddable protocol trust badge
            </li>
          </ul>
        </div>
      </div>

      {/* Comparison Bottom Banner */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-text-muted">Legacy Firm:</span>
          <span className="text-signal-critical line-through font-mono">6 Weeks • $40k-$120k • Static PDF</span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-accent-scan">
          <span>Zyron:</span>
          <span className="font-mono text-white">48-72 Hours • 50% Lower Cost • On-Chain EAS Anchor</span>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 4: CORE TECHNOLOGY ENGINE ---
function SlideEngine() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Proprietary Technology"
        title="14-Pass AST & Symbolic Execution Engine"
        description="Our deterministic compiler-level scanner inspects abstract syntax trees to model dataflow and detect edge-case exploits before human auditors begin."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Engine Architecture passes */}
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Terminal className="h-4 w-4 text-accent-scan" />
            <span>Multi-Stage Static Analysis Pipeline</span>
          </h3>

          <div className="space-y-2 text-xs">
            {[
              { num: "01", name: "Access Control & Arbitrary Calls", desc: "SWC-105/106 tx.origin & unprotected delegatecalls" },
              { num: "02", name: "Reentrancy & State Ordering", desc: "SWC-107 checks-effects-interactions violations" },
              { num: "03", name: "Oracle Slippage & TWAP Manipulation", desc: "Spot price dependency & flash loan vectors" },
              { num: "04", name: "ERC-20/721/1155 Compliance", desc: "Non-standard reverts & fee-on-transfer issues" },
              { num: "05", name: "Proxy & Storage Collision", desc: "EIP-1967 slot conflicts & upgradeability gaps" },
              { num: "06", name: "Assembly & Yul Inline Taint", desc: "Memory safety & unvalidated memory pointers" },
            ].map((pass) => (
              <div
                key={pass.num}
                className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-accent-scan font-bold text-[11px]">{pass.num}</span>
                  <span className="font-medium text-white/90">{pass.name}</span>
                </div>
                <span className="text-[10px] text-text-muted hidden sm:inline">{pass.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Technical Advantage */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-accent-scan/5 border border-accent-scan/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent-scan">
              <Cpu className="h-4 w-4" />
              <span>CFG Control Flow Graph Reconstruction</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Zyron compiles Solidity source down to AST nodes, reconstructs the interprocedural Control Flow Graph, and conducts taint propagation across external function boundaries.
            </p>
            <div className="p-3 rounded-lg bg-black/60 font-mono text-[11px] text-emerald-400 border border-emerald-500/20">
              ✓ AST parse complete: 1,480 SLOC in 820ms<br />
              ✓ 14 vulnerability passes executed: 0 false alarms<br />
              ✓ Invariant state tree validated
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-semibold text-xs text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>AI-Assisted Business Logic Reasoner</span>
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              LLM local reasoning engine analyzes protocol whitepapers, specifications, and economic invariants to spot governance exploits and tokenomic flaws that standard static analyzers miss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 5: DUAL-AUDITOR WORKBENCH ---
function SlideDualAuditor() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Human Verification"
        title="Dual-Auditor Double-Blind Review Workbench"
        description="Automated tools find syntax patterns; elite humans analyze economic game theory and novel exploit chains."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center font-mono font-bold text-sm">
            01
          </div>
          <h3 className="font-semibold text-sm text-white">Double-Blind Allocation</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Two vetted smart contract security researchers review the codebase independently without seeing each other's notes, preventing confirmation bias and groupthink.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
            02
          </div>
          <h3 className="font-semibold text-sm text-white">Dual-Pane Code Reviewer</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Our edge-to-edge IDE interface gives auditors line-by-line syntax inspection, automated vulnerability diff overlays, and instant severity score calculation.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-mono font-bold text-sm">
            03
          </div>
          <h3 className="font-semibold text-sm text-white">Live Remediation Threads</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Auditors converse directly with protocol developers inline on specific code lines, review remediation PR diffs, and verify patches before attestation sealing.
          </p>
        </div>
      </div>

      {/* Visual Triage Box */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-white">Severity Calibration Standard</div>
          <div className="text-[11px] text-text-muted">
            OWASP / SWC risk scoring calibrated by exploitability and maximum extractable value (MEV) risk.
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-signal-critical/20 text-signal-critical border border-signal-critical/30">
            Critical
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-signal-high/20 text-signal-high border border-signal-high/30">
            High
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-signal-medium/20 text-signal-medium border border-signal-medium/30">
            Medium
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-signal-low/20 text-signal-low border border-signal-low/30">
            Low
          </span>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 6: ON-CHAIN ATTESTATION & VAULT ---
function SlideAttestation() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Zero Trust Verification"
        title="On-Chain Attestation & Cryptographic Delivery Vault"
        description="Transforming audit deliverables from untrusted marketing PDFs into verifiable on-chain certificates."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: How it Works */}
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            <span>The Cryptographic Attestation Pipeline</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-accent-scan/20 text-accent-scan flex items-center justify-center font-mono font-bold shrink-0">
                1
              </div>
              <div>
                <div className="font-semibold text-white">SHA-256 Bytecode Hashing</div>
                <p className="text-text-muted text-[11px]">
                  Compiled EVM bytecode and git commit hash are computed into a deterministic immutable digest.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-accent-scan/20 text-accent-scan flex items-center justify-center font-mono font-bold shrink-0">
                2
              </div>
              <div>
                <div className="font-semibold text-white">Auditor Multi-Sig Signing</div>
                <p className="text-text-muted text-[11px]">
                  Both assigned security researchers cryptographically sign the attestation schema with hardware keys.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-accent-scan/20 text-accent-scan flex items-center justify-center font-mono font-bold shrink-0">
                3
              </div>
              <div>
                <div className="font-semibold text-white">On-Chain EVM & EAS Registry</div>
                <p className="text-text-muted text-[11px]">
                  Attestation is published directly to our smart contract registry and the Ethereum Attestation Service.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: On-Chain Certificate Preview */}
        <div className="p-5 rounded-xl bg-black/60 border border-white/15 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-text-muted pb-2 border-b border-white/10">
            <span>ATTESTATION SPECIFICATION</span>
            <span className="text-emerald-400 font-bold">SEALED & IMMUTABLE</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-text-muted">Target Bytecode Hash:</span>
              <div className="text-accent-scan break-all text-[11px]">
                0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
              </div>
            </div>
            <div>
              <span className="text-text-muted">Git Commit Anchor:</span>
              <div className="text-white text-[11px]">commit 5320cba (v2.4.0-mainnet-release)</div>
            </div>
            <div>
              <span className="text-text-muted">Registry Contract Address:</span>
              <div className="text-text-muted text-[11px]">0x0ef0499c927658E28E1b133358313108aCC23A9e</div>
            </div>
            <div>
              <span className="text-text-muted">EAS Schema UID:</span>
              <div className="text-text-muted text-[11px]">0x9b3f49...218a</div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[10px] text-text-muted border-t border-white/10 font-sans">
            <span>Any investor can query bytecode validity in 1 RPC call</span>
            <Badge severity="resolved" size="sm">
              Zero Trust Verified
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 7: MARKET OPPORTUNITY ---
function SlideMarket() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Market Size & Timing"
        title="A $6.8B Market Undergoing Rapid Evolution"
        description="Smart contract security is transitioning from a seasonal consulting gig into continuous mission-critical infrastructure."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-3xl font-display font-bold text-accent-scan">$6.8 Billion</div>
          <div className="font-semibold text-xs text-white">Projected TAM by 2030</div>
          <p className="text-xs text-text-muted leading-relaxed">
            Web3 cybersecurity market expanding at 31.2% CAGR as institutional capital and real-world assets (RWA) onboard on-chain.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-3xl font-display font-bold text-emerald-400">25,000+</div>
          <div className="font-semibold text-xs text-white">Contracts Deployed Daily</div>
          <p className="text-xs text-text-muted leading-relaxed">
            Layer 2 rollups (Arbitrum, Base, Optimism) have reduced deployment gas costs by 95%, causing an explosion of contract releases.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-3xl font-display font-bold text-purple-400">100%</div>
          <div className="font-semibold text-xs text-white">Regulatory Mandates</div>
          <p className="text-xs text-text-muted leading-relaxed">
            European MiCA and US institutional DeFi guidelines now require verifiable proof of security audits before listed tokens can accept custody.
          </p>
        </div>
      </div>

      {/* Why Now */}
      <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
        <h3 className="font-semibold text-sm text-white">Why Now? The 3 Market Drivers:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-accent-scan">1. Rapid CI/CD Releases</span>
            <p className="text-text-muted">
              Protocols no longer deploy once a year; they ship continuous upgrades weekly, requiring continuous security gates.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-emerald-400">2. Institutional Tokenization</span>
            <p className="text-text-muted">
              BlackRock, Franklin Templeton, and banks entering RWA cannot accept subjective "PDF-only" assurance.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-purple-400">3. Auditor Talent Scarcity</span>
            <p className="text-text-muted">
              Only ~800 elite smart contract auditors exist globally. Zyron's AST automation makes each auditor 5x more productive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 8: BUSINESS MODEL ---
function SlideBusinessModel() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Monetization Engine"
        title="Predictable SaaS + High-Margin Audit Revenue"
        description="Dual revenue streams combining recurring developer tooling subscriptions with on-demand audit engagements."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1 */}
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="text-xs font-mono font-semibold text-text-muted uppercase">Protocol Intake</div>
          <div className="text-2xl font-display font-bold text-white">$5k - $12k</div>
          <div className="text-xs text-accent-scan font-medium">Standard Audit Engagement</div>
          <p className="text-xs text-text-muted leading-relaxed">
            Full 14-pass AST static analysis, dual-auditor double-blind review (up to 2,000 SLOC), and on-chain attestation.
          </p>
          <div className="pt-2 border-t border-white/10 text-[11px] text-text-muted space-y-1">
            <div>• 48-72h turnaround</div>
            <div>• 2 certified researchers</div>
          </div>
        </div>

        {/* Tier 2 */}
        <div className="p-5 rounded-xl bg-accent-scan/10 border border-accent-scan/40 space-y-3 relative">
          <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-scan text-bg-void">
            MOST POPULAR
          </div>
          <div className="text-xs font-mono font-semibold text-accent-scan uppercase">DeFi Core Protocol</div>
          <div className="text-2xl font-display font-bold text-white">$15k - $35k</div>
          <div className="text-xs text-accent-scan font-medium">Complex Systems Audit</div>
          <p className="text-xs text-text-muted leading-relaxed">
            Up to 8,000 SLOC, formal verification of invariant properties, remediation re-tests, and live @zyron-bot PR CI/CD setup.
          </p>
          <div className="pt-2 border-t border-white/10 text-[11px] text-text-muted space-y-1">
            <div>• Invariant fuzzing included</div>
            <div>• Dedicated auditor lead</div>
          </div>
        </div>

        {/* Tier 3 */}
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="text-xs font-mono font-semibold text-text-muted uppercase">Continuous SaaS</div>
          <div className="text-2xl font-display font-bold text-white">$2.5k / mo</div>
          <div className="text-xs text-purple-400 font-medium">Enterprise Security Retainer</div>
          <p className="text-xs text-text-muted leading-relaxed">
            Continuous GitHub pull-request security gates, monthly delta re-audits, emergency triage hotline, and ongoing vault attestations.
          </p>
          <div className="pt-2 border-t border-white/10 text-[11px] text-text-muted space-y-1">
            <div>• 100% recurring ARR</div>
            <div>• Continuous protection</div>
          </div>
        </div>
      </div>

      {/* Payment Rails */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-white">Dual Settlement Infrastructure:</span>
        <div className="flex items-center gap-4 text-text-muted font-mono text-[11px]">
          <span className="text-white">✓ Web3 Non-Custodial Escrow (USDC/USDT)</span>
          <span>•</span>
          <span className="text-white">✓ Corporate Net-30 Invoicing (Stripe)</span>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 9: COMPETITIVE MATRIX ---
function SlideCompetition() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Competitive Advantage"
        title="Why Zyron Wins Against Legacy Solutions"
        description="Traditional firms cannot scale; raw scanners generate too many false positives. Zyron creates the optimal hybrid."
      />

      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/10 text-white/80 font-medium border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Feature / Metric</th>
              <th className="py-3 px-4 text-accent-scan font-bold">Zyron Protocol</th>
              <th className="py-3 px-4 text-text-muted">Legacy Firms (OpenZeppelin)</th>
              <th className="py-3 px-4 text-text-muted">Pure Scanners (Slither)</th>
              <th className="py-3 px-4 text-text-muted">Crowd Contests (Code4rena)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[11px]">
            <tr>
              <td className="py-2.5 px-4 font-semibold text-white">Turnaround Time</td>
              <td className="py-2.5 px-4 font-bold text-accent-scan">48 to 72 Hours</td>
              <td className="py-2.5 px-4 text-signal-critical">6 to 10 Weeks</td>
              <td className="py-2.5 px-4 text-emerald-400">Seconds (Incomplete)</td>
              <td className="py-2.5 px-4 text-text-muted">3 to 4 Weeks</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-white">Cost per 2k SLOC</td>
              <td className="py-2.5 px-4 font-bold text-accent-scan">$6,000 - $10,000</td>
              <td className="py-2.5 px-4 text-signal-critical">$40,000 - $90,000</td>
              <td className="py-2.5 px-4 text-emerald-400">Free / Low</td>
              <td className="py-2.5 px-4 text-text-muted">$30,000 - $60,000</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-white">False Positive Filtering</td>
              <td className="py-2.5 px-4 font-bold text-accent-scan">Dual-Human Calibrated</td>
              <td className="py-2.5 px-4 text-text-muted">Manual (Varying)</td>
              <td className="py-2.5 px-4 text-signal-critical">Extreme (80%+ Noise)</td>
              <td className="py-2.5 px-4 text-text-muted">High Noise</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-white">On-Chain Attestation</td>
              <td className="py-2.5 px-4 font-bold text-accent-scan">SHA-256 EAS Anchor</td>
              <td className="py-2.5 px-4 text-signal-critical">None (PDF Only)</td>
              <td className="py-2.5 px-4 text-signal-critical">None</td>
              <td className="py-2.5 px-4 text-signal-critical">None (Github PR)</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-white">Continuous CI/CD Gate</td>
              <td className="py-2.5 px-4 font-bold text-accent-scan">Native @zyron-bot</td>
              <td className="py-2.5 px-4 text-signal-critical">None</td>
              <td className="py-2.5 px-4 text-text-muted">Basic CLI Hook</td>
              <td className="py-2.5 px-4 text-signal-critical">None</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-xl bg-accent-scan/5 border border-accent-scan/20 text-xs text-text-muted flex items-center justify-between">
        <span className="text-white font-medium">Zyron's Unfair Advantage:</span>
        <span>AST automation reduces human auditor hours by 70%, yielding 80% higher margins and 10x faster delivery.</span>
      </div>
    </div>
  );
}

// --- SLIDE 10: TRACTION ---
function SlideTraction() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Proven Track Record"
        title="Traction & Protocol Telemetry"
        description="Securing premier liquidity pools, lending markets, and cross-chain bridges with zero recorded exploits."
      />

      {/* 4 Big Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-white">284+</div>
          <div className="text-xs font-semibold text-accent-scan">Audits Completed</div>
          <div className="text-[11px] text-text-muted">Across 12 EVM chains</div>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-emerald-400">1.2M+</div>
          <div className="text-xs font-semibold text-emerald-400">SLOC Secured</div>
          <div className="text-[11px] text-text-muted">Solidity v0.8.20+</div>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-purple-400">$480M+</div>
          <div className="text-xs font-semibold text-purple-400">Protocol TVL Protected</div>
          <div className="text-[11px] text-text-muted">Zero funds lost</div>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
          <div className="text-3xl sm:text-4xl font-display font-extrabold text-signal-critical">1,420+</div>
          <div className="text-xs font-semibold text-signal-critical">Vulnerabilities Remediated</div>
          <div className="text-[11px] text-text-muted">Prior to mainnet launch</div>
        </div>
      </div>

      {/* Safety Score Card */}
      <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-sm text-white">100% Exploit-Free Track Record</div>
            <div className="text-xs text-text-muted">
              Zero protocols with a sealed Zyron on-chain attestation have suffered a contract drainage or exploit.
            </div>
          </div>
        </div>

        <div className="font-mono text-xs text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
          99.4% SLA Compliance
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 11: ROADMAP & ASK ---
function SlideRoadmap({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Future Vision"
        title="The Roadmap to Universal Security & Capital Ask"
        description="Scaling the decentralized auditor network and institutional risk telemetry."
      />

      {/* 4 Quarter Roadmap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="font-mono text-accent-scan font-bold">Q1 2026</div>
          <div className="font-semibold text-white">Multi-Chain Attestations</div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Expand EAS smart contract registry to Arbitrum, Base, Optimism, and Solana SVM environments.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="font-mono text-emerald-400 font-bold">Q2 2026</div>
          <div className="font-semibold text-white">AI Exploit Synthesis</div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Automated symbolic generation of executable Foundry test exploits to prove vulnerability existence instantly.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="font-mono text-purple-400 font-bold">Q3 2026</div>
          <div className="font-semibold text-white">Decentralized Staking</div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Auditors stake protocol governance tokens to underwrite audit findings; slashed in the event of an undetected exploit.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="font-mono text-sky-400 font-bold">Q4 2026</div>
          <div className="font-semibold text-white">Institutional Risk Oracle</div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            On-chain credit and insurance oracles querying Zyron attestation status to set borrowing collateral factors.
          </p>
        </div>
      </div>

      {/* The Ask / Call to Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-accent-scan/15 via-white/5 to-emerald-500/15 border border-accent-scan/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-xl font-display font-bold text-white">Join Us in Securing the Next Generation of Finance</h3>
          <p className="text-xs text-text-muted max-w-xl">
            Zyron is currently onboarding tier-1 DeFi protocols and select strategic investors. Let's discuss protocol integration or investment opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/portal/new-request">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-accent-scan text-bg-void font-bold text-xs hover:bg-accent-scan/90 transition-all shadow-md shadow-accent-scan/20 cursor-pointer"
            >
              Start First Audit
            </button>
          </Link>
          <button
            type="button"
            onClick={onRestart}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all cursor-pointer"
          >
            Replay Deck
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Slide Header
function SlideHeader({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
        <Sparkles className="h-3 w-3" />
        <span>{badge}</span>
      </div>
      <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-text-muted max-w-2xl">{description}</p>
    </div>
  );
}
