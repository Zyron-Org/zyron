"use client";

import * as React from "react";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  Zap,
  Users,
  FileCheck2,
  GitBranch,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Grid,
  Play,
  Pause,
  Printer,
  AlertTriangle,
  Check,
  Lock,
  Terminal,
  Cpu,
  Layers,
  TrendingUp,
  Building2,
  Scale,
  CheckCircle2,
  Clock,
  Activity,
  Award,
  Search,
  FileText,
  Eye,
  RefreshCw,
  Target,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
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
    badge: "Slide 1 – Cover",
    title: "ZYRON PROTOCOL SECURITY — PITCH DECK",
    subtitle: "The Cryptographic Security Infrastructure for Web3 Protocols",
    category: "Vision",
  },
  {
    id: "problem",
    badge: "Slide 2 – Problem",
    title: "The Web3 Security Bottleneck",
    subtitle: "Smart contracts secure tens of billions in value, yet the audit process remains slow, expensive, and unverifiable.",
    category: "Market",
  },
  {
    id: "solution",
    badge: "Slide 3 – Solution",
    title: "Continuous, Verifiable Protocol Security",
    subtitle: "Combining automated AST passes, structured human review, and on-chain attestations.",
    category: "Product",
  },
  {
    id: "technology",
    badge: "Slide 4 – Technology",
    title: "14-Pass AST & Control-Flow Analysis Engine",
    subtitle: "Specialized security passes catching high-signal issues before human review begins.",
    category: "Product",
  },
  {
    id: "human-review",
    badge: "Slide 5 – Human Review",
    title: "Dual-Pane Auditor Workbench",
    subtitle: "Automated tools surface candidates. Human experts make the final judgment.",
    category: "Product",
  },
  {
    id: "onchain-attestation",
    badge: "Slide 6 – On-Chain Attestation",
    title: "Verifiable Certificates, Not Just PDFs",
    subtitle: "Immutable certificates containing bytecode hash and findings Merkle root.",
    category: "Product",
  },
  {
    id: "how-it-works",
    badge: "Slide 7 – How It Works",
    title: "Simple Audit Lifecycle",
    subtitle: "Transparent process from start to finish.",
    category: "Product",
  },
  {
    id: "market-opportunity",
    badge: "Slide 8 – Market Opportunity",
    title: "Growing Demand for Better Security Infrastructure",
    subtitle: "Zyron sits at the intersection of security tooling and on-chain trust.",
    category: "Market",
  },
  {
    id: "business-model",
    badge: "Slide 9 – Business Model",
    title: "Hybrid Revenue Model",
    subtitle: "Clear path from project-based revenue to recurring revenue.",
    category: "Business",
  },
  {
    id: "competitive-position",
    badge: "Slide 10 – Competitive Position",
    title: "Feature Comparison",
    subtitle: "Comparing Zyron against Traditional Firms and Pure Scanners.",
    category: "Business",
  },
  {
    id: "current-status-roadmap",
    badge: "Slide 11 – Current Status & Roadmap",
    title: "Current Status & Roadmap",
    subtitle: "From core AST engine today to decentralized validation tomorrow.",
    category: "Vision",
  },
  {
    id: "vision-next-steps",
    badge: "Slide 12 – Vision & Next Steps",
    title: "Building the Trust Layer for Smart Contract Security",
    subtitle: "Let's make security work that can actually be trusted onchain.",
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
                ZYRON <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-accent-scan font-normal">PITCH DECK</span>
              </span>
              <span className="text-[10px] text-text-muted hidden sm:inline">Cryptographic Security Infrastructure for Web3</span>
            </div>
          </Link>
        </div>

        {/* Center Pill: Current Slide & Title */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
          <span className="font-mono text-accent-scan font-bold">
            Slide {currentSlide + 1} of {totalSlides}
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
        <div className="w-full transition-all duration-300 animate-fadeIn">
          {currentSlide === 0 && <Slide1Cover onNext={nextSlide} />}
          {currentSlide === 1 && <Slide2Problem />}
          {currentSlide === 2 && <Slide3Solution />}
          {currentSlide === 3 && <Slide4Technology />}
          {currentSlide === 4 && <Slide5HumanReview />}
          {currentSlide === 5 && <Slide6OnChainAttestation />}
          {currentSlide === 6 && <Slide7HowItWorks />}
          {currentSlide === 7 && <Slide8MarketOpportunity />}
          {currentSlide === 8 && <Slide9BusinessModel />}
          {currentSlide === 9 && <Slide10CompetitivePosition />}
          {currentSlide === 10 && <Slide11CurrentStatusRoadmap />}
          {currentSlide === 11 && <Slide12VisionNextSteps onRestart={() => setCurrentSlide(0)} />}
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

        {/* Keyboard Shortcuts Tip */}
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
                    Slide {idx + 1}
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

// Reusable Slide Header
function SlideHeader({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-2 text-left">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/30">
        <Sparkles className="h-3.5 w-3.5" />
        <span>{badge}</span>
      </div>
      <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs sm:text-sm text-text-muted max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// --- SLIDE 1: COVER ---
function Slide1Cover({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 py-4 sm:py-6">
      {/* Category / Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-scan/10 border border-accent-scan/30 text-accent-scan text-xs font-semibold tracking-wide uppercase">
        <Sparkles className="h-4 w-4" />
        <span>ZYRON PROTOCOL SECURITY — PITCH DECK</span>
      </div>

      {/* Headline & Subtitle */}
      <div className="space-y-4 max-w-4xl">
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          The Cryptographic Security Infrastructure for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-scan via-sky-300 to-emerald-400">
            Web3 Protocols
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-text-muted max-w-3xl mx-auto leading-relaxed">
          Replacing slow, opaque PDF audits with automated AST static analysis, structured human review, and immutable on-chain attestations.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full max-w-4xl pt-2">
        {[
          { label: "14 AST Passes", desc: "Automated static analysis", icon: Zap },
          { label: "Dual-Auditor Review", desc: "Structured human triage", icon: Users },
          { label: "On-Chain Proofs", desc: "Immutable attestations", icon: FileCheck2 },
          { label: "Continuous Security", desc: "Ongoing protocol protection", icon: ShieldCheck },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-1.5 hover:border-accent-scan/40 hover:bg-white/10 transition-all group"
            >
              <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Icon className="h-4 w-4" />
              </div>
              <div className="font-semibold text-sm text-white">{item.label}</div>
              <div className="text-xs text-text-muted">{item.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Primary CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-accent-scan text-bg-void font-bold text-sm hover:bg-accent-scan/90 transition-all shadow-lg shadow-accent-scan/20 cursor-pointer"
        >
          <span>Explore Deck</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// --- SLIDE 2: PROBLEM ---
function Slide2Problem() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 2 – Problem"
        title="The Web3 Security Bottleneck"
        subtitle="Smart contracts secure tens of billions in value, yet the audit process remains slow, expensive, and unverifiable."
      />

      {/* Key Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            num: "01",
            title: "Long Wait Times",
            desc: "Often 6–10 weeks at top audit firms, stalling critical deployments and feature releases.",
            icon: Clock,
            accent: "border-amber-500/30 bg-amber-500/5 text-amber-400",
          },
          {
            num: "02",
            title: "Static PDF Reports",
            desc: "Reports become outdated the moment code changes or new parameters are committed.",
            icon: FileText,
            accent: "border-sky-500/30 bg-sky-500/5 text-sky-400",
          },
          {
            num: "03",
            title: "No Cryptographic Link",
            desc: "Zero cryptographic connection between the audited source code and the deployed on-chain bytecode.",
            icon: AlertTriangle,
            accent: "border-signal-critical/30 bg-signal-critical/5 text-signal-critical",
          },
          {
            num: "04",
            title: "Prohibitive High Cost",
            desc: "Extremely high costs push many emerging project teams to skip or severely under-invest in security.",
            icon: Scale,
            accent: "border-purple-500/30 bg-purple-500/5 text-purple-400",
          },
        ].map((problem) => {
          const Icon = problem.icon;
          return (
            <div
              key={problem.num}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={cn("p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold", problem.accent)}>
                  <Icon className="h-4 w-4" />
                  <span>Problem {problem.num}</span>
                </div>
                <span className="font-mono text-xs text-text-muted">{problem.num} / 04</span>
              </div>
              <div>
                <h3 className="font-semibold text-base text-white mb-1.5">{problem.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{problem.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Callout Card */}
      <div className="p-5 rounded-2xl bg-signal-critical/10 border border-signal-critical/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-signal-critical/20 text-signal-critical flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-mono font-bold text-signal-critical uppercase tracking-wide">
              The Reality
            </div>
            <div className="text-base sm:text-lg font-display font-bold text-white">
              Result: Even audited protocols still get exploited.
            </div>
          </div>
        </div>
        <div className="text-xs text-text-muted bg-black/40 px-3.5 py-2 rounded-xl border border-white/10 text-center sm:text-right shrink-0">
          PDF audits provide no real runtime assurance.
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 3: SOLUTION ---
function Slide3Solution() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 3 – Solution"
        title="Continuous, Verifiable Protocol Security"
        subtitle="Zyron combines three synergistic layers to transform Web3 security:"
      />

      {/* 3 Layers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Layer 1 */}
        <div className="p-6 rounded-2xl bg-accent-scan/5 border border-accent-scan/30 space-y-4 hover:border-accent-scan/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-accent-scan/10 text-accent-scan flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-mono text-xs font-bold text-accent-scan px-2.5 py-1 rounded-full bg-accent-scan/10 border border-accent-scan/20">
              Layer 1
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-base text-white">Automated AST Analysis</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Fast, deterministic static analysis using Abstract Syntax Trees (AST) and Control Flow Graphs (CFG).
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 text-[11px] text-accent-scan font-mono">
            ✓ Instant pass execution
          </div>
        </div>

        {/* Layer 2 */}
        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-4 hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Layer 2
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-base text-white">Structured Human Review</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Professional auditors review automated findings and complex business logic in a dual-pane workbench.
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 text-[11px] text-emerald-400 font-mono">
            ✓ Zero false positive triage
          </div>
        </div>

        {/* Layer 3 */}
        <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/30 space-y-4 hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <span className="font-mono text-xs font-bold text-purple-400 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              Layer 3
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-base text-white">On-Chain Attestations</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Immutable certificates containing source/bytecode SHA-256 hash and findings Merkle root onchain.
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 text-[11px] text-purple-400 font-mono">
            ✓ Cryptographic verification
          </div>
        </div>
      </div>

      {/* Bottom Takeaway Banner */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 hidden sm:block" />
          <span className="text-sm sm:text-base font-display font-semibold text-white">
            Security reviews that can actually be verified onchain.
          </span>
        </div>
        <div className="text-xs font-mono text-accent-scan bg-accent-scan/10 px-3 py-1.5 rounded-lg border border-accent-scan/20 shrink-0">
          True Trust
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 4: TECHNOLOGY ---
function Slide4Technology() {
  const passes = [
    { title: "Access Control", desc: "Unprotected setters & tx.origin vulnerabilities" },
    { title: "Reentrancy & State Ordering", desc: "SWC-107 Checks-Effects-Interactions passes" },
    { title: "Oracle & Price Manipulation", desc: "Spot price dependencies & flash loan vectors" },
    { title: "Proxy & Storage Safety", desc: "Storage collisions & upgradeability slots" },
    { title: "Token Standards Compliance", desc: "ERC-20 / 721 / 1155 edge-case behaviors" },
    { title: "Assembly / Yul Risks", desc: "Inline assembly memory safety & pointers" },
    { title: "Centralization Vectors", desc: "Privileged roles & admin rug-pull vectors" },
    { title: "And More...", desc: "Continuous pass expansion & custom rules" },
  ];

  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 4 – Technology"
        title="14-Pass AST & Control-Flow Analysis Engine"
        subtitle="Our engine parses Solidity into AST, builds Control Flow Graphs, and runs specialized security passes including:"
      />

      {/* Grid of Security Passes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {passes.map((pass, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 hover:border-accent-scan/40 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-accent-scan">Pass #{String(idx + 1).padStart(2, "0")}</span>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-sm text-white">{pass.title}</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">{pass.desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom Takeaway */}
      <div className="p-4 rounded-xl bg-accent-scan/5 border border-accent-scan/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-accent-scan shrink-0" />
          <span className="text-white font-medium">Deterministic AST Parsing</span>
        </div>
        <span className="text-text-muted text-center sm:text-right font-medium">
          Designed to catch high-signal issues before human reviewers begin.
        </span>
      </div>
    </div>
  );
}

// --- SLIDE 5: HUMAN REVIEW ---
function Slide5HumanReview() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 5 – Human Review"
        title="Dual-Pane Auditor Workbench"
        subtitle="Automated tools surface candidates. Human experts make the final judgment."
      />

      {/* 4 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            title: "Side-by-side code and findings view",
            desc: "Auditors view Solidity source files alongside candidate vulnerability alerts for instant contextual audit analysis.",
            icon: Eye,
          },
          {
            title: "Inline comments and severity calibration",
            desc: "Collaborative commenting directly on source lines with standardized severity scoring (Critical, High, Medium, Low).",
            icon: Terminal,
          },
          {
            title: "Clear remediation tracking",
            desc: "Track findings through intake, triage, developer patch, and final re-test verification states.",
            icon: RefreshCw,
          },
          {
            title: "Support for multi-file projects",
            desc: "Seamless cross-contract navigation, inheritance tracing, and dependency mapping across complex protocol repos.",
            icon: Layers,
          },
        ].map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-emerald-500/30 transition-all"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-white">{feat.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{feat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom Goal Callout */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
        <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">Quality Assurance</span>
        <span className="text-white font-medium text-center sm:text-right">
          The goal is higher signal and lower noise than pure automated scanners.
        </span>
      </div>
    </div>
  );
}

// --- SLIDE 6: ON-CHAIN ATTESTATION ---
function Slide6OnChainAttestation() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 6 – On-Chain Attestation"
        title="Verifiable Certificates, Not Just PDFs"
        subtitle="Every completed audit can produce an on-chain attestation that includes:"
      />

      {/* 4 Components Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            title: "SHA-256 Bytecode & Source Hash",
            desc: "Exact SHA-256 hash of the reviewed bytecode / source repository for deterministic verification.",
            icon: Lock,
            tag: "Bytecode Proof",
          },
          {
            title: "Merkle Root of Findings",
            desc: "Cryptographic Merkle tree anchoring all identified vulnerabilities, severities, and remediation statuses.",
            icon: GitBranch,
            tag: "Findings Root",
          },
          {
            title: "Auditor Signatures (EIP-712)",
            desc: "Typed structured EIP-712 cryptographic signatures from certified security auditor keypairs.",
            icon: FileCheck2,
            tag: "EIP-712 Signed",
          },
          {
            title: "Timestamp & Engagement Reference",
            desc: "On-chain timestamp and unique audit engagement reference linked to Arbitrum Sepolia contract registry.",
            icon: Clock,
            tag: "On-Chain Record",
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                  {item.tag}
                </span>
              </div>
              <h3 className="font-semibold text-base text-white">{item.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Takeaway Banner */}
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
        <span className="font-mono text-purple-400 font-bold uppercase">Public Verification</span>
        <span className="text-white font-medium text-center sm:text-right">
          Anyone can independently verify that a specific version of the code was reviewed.
        </span>
      </div>
    </div>
  );
}

// --- SLIDE 7: HOW IT WORKS ---
function Slide7HowItWorks() {
  const steps = [
    { step: "01", title: "Contract Submission", desc: "Client submits contracts or GitHub repository" },
    { step: "02", title: "Automated AST Scanning", desc: "Automated AST scanning runs across 14 security passes" },
    { step: "03", title: "Human Auditor Triage", desc: "Findings are reviewed by expert auditors in workbench" },
    { step: "04", title: "Triage & Remediation", desc: "Issues are triaged and remediated with developer PRs" },
    { step: "05", title: "On-Chain Attestation", desc: "Final attestation is generated and published onchain" },
  ];

  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 7 – How It Works"
        title="Simple Audit Lifecycle"
        subtitle="Transparent process from start to finish."
      />

      {/* 5-Step Process Pipeline */}
      <div className="space-y-3">
        {steps.map((s, idx) => (
          <div
            key={s.step}
            className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-accent-scan/40 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center font-mono font-bold text-xs shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">{s.title}</h3>
                <p className="text-xs text-text-muted">{s.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md shrink-0 self-end sm:self-auto">
              <Check className="h-3.5 w-3.5" />
              <span>Step {idx + 1}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
        <span className="font-mono text-text-muted">Lifecycle Guarantee</span>
        <span className="text-white font-semibold">Transparent process from start to finish.</span>
      </div>
    </div>
  );
}

// --- SLIDE 8: MARKET OPPORTUNITY ---
function Slide8MarketOpportunity() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 8 – Market Opportunity"
        title="Growing Demand for Better Security Infrastructure"
        subtitle="Web3 security is evolving from static manual reviews into verifiable developer infrastructure."
      />

      {/* 4 Market Drivers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            title: "Rapid L2 Deployments",
            desc: "Increasing number of contracts deployed daily across L2s (Arbitrum, Base, Optimism, zkSync).",
            icon: TrendingUp,
          },
          {
            title: "Institutional & RWA Demand",
            desc: "Institutional and Real-World Asset (RWA) interest demanding higher assurance and cryptographic proof.",
            icon: Building2,
          },
          {
            title: "Continuous Security Shift",
            desc: "Shift from one-time point-in-time audits toward continuous security gates across developer CI/CD workflows.",
            icon: RefreshCw,
          },
          {
            title: "Need for Verifiable Trust",
            desc: "Strong need for verifiable (not just claimable) security work anchored on public blockchains.",
            icon: ShieldCheck,
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-accent-scan/30 transition-all"
            >
              <div className="h-9 w-9 rounded-xl bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-white">{item.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom Market Positioning Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-accent-scan/10 via-white/5 to-purple-500/10 border border-accent-scan/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-xs text-accent-scan font-bold uppercase">Strategic Positioning</div>
          <div className="text-sm sm:text-base font-display font-semibold text-white">
            Zyron sits at the intersection of security tooling and on-chain trust.
          </div>
        </div>
        <div className="text-xs font-mono text-white bg-white/10 px-3.5 py-2 rounded-xl shrink-0">
          Infra + Trust Layer
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 9: BUSINESS MODEL ---
function Slide9BusinessModel() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 9 – Business Model"
        title="Hybrid Revenue Model"
        subtitle="Clear path from project-based revenue to recurring revenue."
      />

      {/* 3 Revenue Stream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 hover:border-accent-scan/40 transition-all">
          <div className="h-10 w-10 rounded-xl bg-accent-scan/10 text-accent-scan flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-accent-scan font-bold uppercase tracking-wider">Stream 01</span>
            <h3 className="font-display font-bold text-lg text-white">Audit Engagements</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Fixed-price security reviews with automated AST scanning, human auditor triage, and on-chain attestation certificates.
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 text-xs font-mono text-white/80">
            • Project-based revenue
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-4 hover:border-emerald-500/50 transition-all">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Stream 02</span>
            <h3 className="font-display font-bold text-lg text-white">Continuous Plans</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Ongoing scanning + priority review for active protocols shipping continuous updates, pull-requests, and contract upgrades.
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 text-xs font-mono text-emerald-400">
            • Recurring subscription ARR
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/30 space-y-4 hover:border-purple-500/50 transition-all">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-wider">Stream 03</span>
            <h3 className="font-display font-bold text-lg text-white">Future Features</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Premium verification APIs, continuous monitoring, enterprise risk compliance, and insurance protocol oracle feeds.
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 text-xs font-mono text-purple-400">
            • High-margin expansion
          </div>
        </div>
      </div>

      {/* Summary Callout */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
        <span className="font-mono text-text-muted">Business Trajectory</span>
        <span className="text-white font-semibold">Clear path from project-based revenue to recurring revenue.</span>
      </div>
    </div>
  );
}

// --- SLIDE 10: COMPETITIVE POSITION ---
function Slide10CompetitivePosition() {
  const comparisonData = [
    { feature: "Depth of Analysis", traditional: "High", pure: "Medium", zyron: "High (AST + Human)" },
    { feature: "Speed", traditional: "Slow", pure: "Very Fast", zyron: "Fast" },
    { feature: "Human Expertise", traditional: "Yes", pure: "No", zyron: "Yes" },
    { feature: "On-Chain Attestation", traditional: "No", pure: "No", zyron: "Yes" },
    { feature: "Verifiable Bytecode Link", traditional: "No", pure: "No", zyron: "Yes" },
    { feature: "Continuous Use", traditional: "Limited", pure: "Yes", zyron: "Yes" },
  ];

  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 10 – Competitive Position"
        title="Feature Comparison"
        subtitle="Comparing Zyron against Traditional Firms and Pure Scanners."
      />

      {/* Comparison Matrix Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/10 text-white font-semibold">
              <th className="py-3.5 px-4 sm:px-6">Feature</th>
              <th className="py-3.5 px-4 text-text-muted">Traditional Firms</th>
              <th className="py-3.5 px-4 text-text-muted">Pure Scanners</th>
              <th className="py-3.5 px-4 font-bold text-accent-scan bg-accent-scan/10">Zyron</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {comparisonData.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 sm:px-6 font-semibold text-white">{row.feature}</td>
                <td className="py-3 px-4 text-text-muted">{row.traditional}</td>
                <td className="py-3 px-4 text-text-muted">{row.pure}</td>
                <td className="py-3 px-4 font-bold text-emerald-400 bg-accent-scan/5">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{row.zyron}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- SLIDE 11: CURRENT STATUS & ROADMAP ---
function Slide11CurrentStatusRoadmap() {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 11 – Current Status & Roadmap"
        title="Current Status & Roadmap"
        subtitle="Execution milestones across current, near-term, and future horizons."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current (Now) */}
        <div className="p-5 rounded-2xl bg-accent-scan/5 border border-accent-scan/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-accent-scan px-2.5 py-1 rounded-full bg-accent-scan/10 border border-accent-scan/20">
              Current (Now)
            </span>
            <Activity className="h-4 w-4 text-accent-scan" />
          </div>
          <ul className="space-y-2 text-xs text-text-muted">
            <li className="flex items-start gap-2 text-white/90">
              <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
              <span>Core AST analysis engine with multiple security passes</span>
            </li>
            <li className="flex items-start gap-2 text-white/90">
              <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
              <span>Auditor workbench and finding management</span>
            </li>
            <li className="flex items-start gap-2 text-white/90">
              <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
              <span>On-chain attestation system (Arbitrum Sepolia)</span>
            </li>
            <li className="flex items-start gap-2 text-white/90">
              <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
              <span>End-to-end audit workflow</span>
            </li>
          </ul>
        </div>

        {/* Near Term */}
        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Near Term
            </span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <ul className="space-y-2 text-xs text-text-muted">
            <li className="flex items-start gap-2 text-white/90">
              <ChevronRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Deeper multi-file and inheritance support</span>
            </li>
            <li className="flex items-start gap-2 text-white/90">
              <ChevronRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Improved false positive reduction</span>
            </li>
            <li className="flex items-start gap-2 text-white/90">
              <ChevronRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Better reporting and client dashboard</span>
            </li>
            <li className="flex items-start gap-2 text-white/90">
              <ChevronRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Expanded test coverage and reliability</span>
            </li>
          </ul>
        </div>

        {/* Future */}
        <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-purple-400 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              Future
            </span>
            <Compass className="h-4 w-4 text-purple-400" />
          </div>
          <ul className="space-y-2 text-xs text-text-muted">
            <li className="flex items-start gap-2 text-white/90">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>Auditor reputation and identity (ERC-8004 direction)</span>
            </li>
            <li className="flex items-start gap-2 text-white/90">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>Support for more chains</span>
            </li>
            <li className="flex items-start gap-2 text-white/90">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>Continuous monitoring features</span>
            </li>
            <li className="flex items-start gap-2 text-white/90">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>Stronger agent-based and decentralized validation (longer term)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 12: VISION & NEXT STEPS ---
function Slide12VisionNextSteps({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="space-y-6">
      <SlideHeader
        badge="Slide 12 – Vision & Next Steps"
        title="Building the Trust Layer for Smart Contract Security"
        subtitle="Zyron exists to make professional security reviews more accessible, transparent, and verifiable."
      />

      {/* What We Are Looking For Cards */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-accent-scan uppercase tracking-wider font-semibold">
          We Are Currently Looking For:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-accent-scan/40 transition-all">
            <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="font-semibold text-sm text-white">Early Design Partners</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Protocols and developer teams to run real audits through the Zyron pipeline.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-emerald-500/40 transition-all">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="font-semibold text-sm text-white">Researcher Feedback</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Feedback from smart contract security researchers, auditors, and Web3 founders.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-purple-500/40 transition-all">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="font-semibold text-sm text-white">Strategic Supporters</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Partners who believe verifiable, on-chain security infrastructure matters for Web3.
            </p>
          </div>
        </div>
      </div>

      {/* Final Call to Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-accent-scan/20 via-white/5 to-emerald-500/20 border border-accent-scan/40 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Let's make security work that can actually be trusted onchain.
          </h3>
          <p className="text-xs text-text-muted">
            Connect with the Zyron team today to run your next audit or integrate verifiable security.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/portal/new-request">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-accent-scan text-bg-void font-bold text-xs hover:bg-accent-scan/90 transition-all shadow-md shadow-accent-scan/20 cursor-pointer"
            >
              Start Audit
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
