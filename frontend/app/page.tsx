"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Plus,
  CreditCard,
  Layers,
  Terminal,
  Shield,
  ShieldAlert,
  ShieldCheck,
  FileCode2,
  Check,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  X,
  Menu,
  Sparkles,
  Cpu,
  Boxes,
  Flame,
  Zap,
  Activity,
  Lock,
  AlertTriangle,
  TrendingUp,
  Radio,
  Bug,
  Code2,
  Crosshair,
  Binary,
  GitPullRequest,
  FileText,
  FileCheck2,
  Fingerprint,
  FileSignature,
  History,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { ChainLogo } from "@/components/ui/chain-logos";
import { InteractiveDashboardDemo } from "@/components/interactive-dashboard-demo";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Supported Chains Data Rows for Parallax Marquee
const row1Chains = [
  "Ethereum",
  "Arbitrum",
  "Optimism",
  "Polygon",
  "Base",
  "Avalanche",
  "BNB Chain",
  "Linea",
  "Scroll",
  "Blast",
  "zkSync Era",
];

const row2Chains = [
  "Solana",
  "Sui",
  "Aptos",
  "Near Protocol",
  "Cosmos Hub",
  "Injective",
  "Celestia",
  "Mantle",
  "Sei Network",
  "Fantom",
  "Polkadot",
  "Tron",
];

const row3Chains = [
  "Berachain",
  "Monad",
  "Starknet",
  "Taiko",
  "Gnosis",
  "Ronin",
  "Flow",
  "Moonbeam",
  "Celo",
  "Kava",
  "Fraxtal",
  "Metis",
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = mounted && !!user;

  const dashboardHref = isAuthenticated
    ? user?.role?.toUpperCase() === "AUDITOR"
      ? "/auditor/queue"
      : user?.role?.toUpperCase() === "ADMIN"
      ? "/admin/users"
      : "/portal"
    : "/auth/login";

  const [activeTab, setActiveTab] = React.useState<"all" | "in_progress" | "completed" | "failed" | "drafts">("all");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(0);
  const [billingCycle, setBillingCycle] = React.useState<"engagement" | "continuous">("engagement");
  const [stats, setStats] = React.useState<any>(null);
  const [searchScans, setSearchScans] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;
    apiClient
      .get("/audits/stats/overview")
      .then((res) => {
        if (isMounted && res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => console.warn("Failed to load overview stats:", err.message));
    return () => {
      isMounted = false;
    };
  }, []);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const demoRef = React.useRef<HTMLDivElement>(null);
  const [demoScale, setDemoScale] = React.useState(1);

  const handleRequestAudit = () => {
    if (!user) {
      toast.error("Authentication Required: Please sign in or register to submit an audit request.");
      router.push("/auth/login");
    } else {
      router.push("/portal/new-request");
    }
  };

  const handleViewDashboard = () => {
    if (!user) {
      router.push("/auth/login");
    } else {
      router.push("/portal");
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (!demoRef.current) return;
      const width = demoRef.current.offsetWidth;
      // Fixed canvas design width is 1024px
      const scaleVal = Math.min(1, Math.max(0.28, width / 1024));
      setDemoScale(scaleVal);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // GSAP Entrance, Counters & ScrollTrigger Timeline Orchestration (FOUC-Proofed with autoAlpha)
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Full-screen background image expansion & opacity entrance
      tl.fromTo(
        ".hero-bg-anim",
        { autoAlpha: 0, scale: 1.06 },
        { autoAlpha: 1, scale: 1, duration: 1.4, ease: "power2.out" }
      );

      // 2. Floating Header Drop-in
      tl.fromTo(
        ".hero-header-anim",
        { y: -30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8 },
        "-=1.1"
      );

      // 3. Liquid Glass AI-Powered Badge Pop
      tl.fromTo(
        ".hero-badge-anim",
        { y: 20, scale: 0.88, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.7, ease: "back.out(1.6)" },
        "-=0.6"
      );

      // 4. Headline Smooth Upward Reveal
      tl.fromTo(
        ".hero-title-anim",
        { y: 35, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.9 },
        "-=0.5"
      );

      // 5. Subheading & CTA Buttons
      tl.fromTo(
        ".hero-subhead-anim",
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7 },
        "-=0.6"
      );

      tl.fromTo(
        ".hero-cta-anim",
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.12, duration: 0.7 },
        "-=0.5"
      );

      // 6. Floating Dashboard Card Entrance
      tl.fromTo(
        ".hero-card-anim",
        { y: 50, scale: 0.96, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 1.1 },
        "-=0.5"
      );

      // 7. Stagger Dashboard Metric Cards
      tl.fromTo(
        ".hero-metric-anim",
        { y: 15, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.6, ease: "power2.out" },
        "-=0.5"
      );

      // 8. General ScrollTrigger reveals for any section marked .reveal-on-scroll
      const scrollSections = gsap.utils.toArray<HTMLElement>(".reveal-on-scroll");
      scrollSections.forEach((elem) => {
        gsap.fromTo(
          elem,
          { y: 35, autoAlpha: 0 },
          {
            scrollTrigger: {
              trigger: elem,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            ease: "power3.out",
          }
        );
      });

      // 9. Parallax 3-Row Blockchain Stream (Scroll Direction Controlled with Scrub)
      gsap.to(".chain-row-1", {
        x: -280,
        ease: "none",
        scrollTrigger: {
          trigger: ".chains-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(".chain-row-2", {
        x: 280,
        ease: "none",
        scrollTrigger: {
          trigger: ".chains-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(".chain-row-3", {
        x: -220,
        ease: "none",
        scrollTrigger: {
          trigger: ".chains-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      // 10. High-Impact Animated Number Count-Up
      const statsObj = { stolen: 0, secured: 0, vulns: 0, speed: 0 };
      ScrollTrigger.create({
        trigger: ".metrics-section",
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(statsObj, {
            stolen: 4.28,
            secured: 14.6,
            vulns: 1842,
            speed: 4.2,
            duration: 2.2,
            ease: "power2.out",
            onUpdate: () => {
              const elStolen = document.getElementById("counter-stolen");
              const elSecured = document.getElementById("counter-secured");
              const elVulns = document.getElementById("counter-vulns");
              const elSpeed = document.getElementById("counter-speed");

              if (elStolen) elStolen.textContent = `$${statsObj.stolen.toFixed(2)}B+`;
              if (elSecured) elSecured.textContent = `$${statsObj.secured.toFixed(1)}B+`;
              if (elVulns) elVulns.textContent = Math.round(statsObj.vulns).toLocaleString();
              if (elSpeed) elSpeed.textContent = `${statsObj.speed.toFixed(1)}s`;
            },
          });
        },
      });
    },
    { scope: containerRef }
  );

  const fallbackScans = [
    {
      id: "ZYR-9482",
      protocolName: "Beetrade Orderbook",
      contractFileName: "BeeTradeOrderbook.sol",
      stage: "CORRECTIONS_REQUESTED",
      sloc: 159,
      createdAt: "2026-09-23T13:06:49.964Z",
      findings: [{}, {}],
    },
    {
      id: "ZYR-9481",
      protocolName: "Aura Liquidity Protocol",
      contractFileName: "VaultCore.sol",
      stage: "CORRECTIONS_REQUESTED",
      sloc: 29,
      createdAt: "2026-09-22T12:59:16.710Z",
      findings: [{}, {}],
    },
  ];

  const recentAuditsList = (stats?.recentAudits && stats.recentAudits.length > 0)
    ? stats.recentAudits
    : fallbackScans;

  const scansToRender = recentAuditsList.filter((a: any) => {
    if (activeTab === "in_progress" && a.stage === "COMPLETED") return false;
    if (activeTab === "completed" && a.stage !== "COMPLETED") return false;
    if (searchScans.trim() !== "") {
      const q = searchScans.toLowerCase();
      return (
        a.contractFileName?.toLowerCase().includes(q) ||
        a.protocolName?.toLowerCase().includes(q) ||
        a.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-bg-void text-text-primary selection:bg-accent-scan/20 selection:text-accent-scan relative"
    >
      {/* Full Width & Height Hero Background Image with True Dark Blue Hue Shift */}
      <div className="hero-bg-anim absolute top-0 left-0 w-full h-[950px] md:h-[1150px] pointer-events-none z-0 overflow-hidden">
        <img
          src="/hero-bg.png"
          alt=""
          className="w-full h-full object-cover object-top dark:opacity-10 opacity-[0.03] [filter:hue-rotate(-75deg)_saturate(2)_brightness(1.1)] [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)]"
        />
      </div>

      {/* ========================================================================= */}
      {/* HEADER: FLOATING ON TOP OF HERO WITH NO LINE                             */}
      {/* ========================================================================= */}
      <header className="hero-header-anim w-full bg-transparent sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 h-20 flex items-center justify-between">
          {/* Left: Compact Zyron Brand & Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-8 w-8 rounded-[4px] bg-bg-panel border border-border-hairline text-accent-scan group-hover:border-accent-scan transition-colors">
              <Terminal className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-2 font-mono tracking-wider">
              <span className="font-display font-bold text-sm text-text-primary tracking-wider">
                ZYRON
              </span>
              <span className="hidden sm:inline text-text-muted/60 font-light text-xs">|</span>
              <span className="hidden sm:inline text-accent-scan font-medium text-xs tracking-wider">
                AI AUDITOR
              </span>
            </div>
          </Link>

          {/* Middle: Floating Center Navbar (Aligned with Page Sections) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-[6px] bg-bg-panel/90 border border-border-hairline backdrop-blur-md shadow-xl font-mono text-xs text-text-muted">
            <Link
              href="#features"
              className="px-3 py-1.5 rounded-[4px] hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="px-3 py-1.5 rounded-[4px] hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#ecosystem"
              className="px-3 py-1.5 rounded-[4px] hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
            >
              Ecosystem
            </Link>
            <Link
              href="#pricing"
              className="px-3 py-1.5 rounded-[4px] hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="px-3 py-1.5 rounded-[4px] hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Right: Theme Toggle + Globe + Login Button + Mobile Hamburger */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Sign In / Dashboard ↗ Button */}
            <Link href={dashboardHref}>
              <button
                type="button"
                className="h-9 px-3.5 sm:px-4 rounded-[4px] bg-text-primary text-bg-void font-bold text-xs hover:bg-accent-scan hover:text-white dark:hover:bg-white dark:hover:text-bg-void transition-colors flex items-center gap-1.5 shadow-sm font-mono cursor-pointer"
              >
                <span>{isAuthenticated ? "Dashboard" : "Sign In"}</span>
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </Link>

            {/* Hamburger Button (Visible only on mobile/tablet) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-[4px] bg-bg-panel border border-border-hairline flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-hairline/80 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4 text-text-primary" />
              ) : (
                <Menu className="h-4 w-4 text-text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pb-4 max-w-[1440px] mx-auto animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3.5 rounded-[6px] bg-bg-panel/95 border border-border-hairline backdrop-blur-xl shadow-2xl space-y-2 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 rounded-[4px] bg-bg-panel border border-border-hairline mb-2">
                  <span className="text-text-muted font-bold">THEME</span>
                  <ThemeToggle size="sm" showLabel />
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] bg-text-primary text-bg-void font-bold hover:bg-accent-scan hover:text-white dark:hover:bg-white dark:hover:text-bg-void transition-colors mb-2"
                >
                  <span>{isAuthenticated ? "Dashboard" : "Sign In"}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </Link>
                <Link
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors"
                >
                  <span>Features</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
                <Link
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors"
                >
                  <span>How It Works</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
                <Link
                  href="#ecosystem"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors"
                >
                  <span>Ecosystem</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
                <Link
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors"
                >
                  <span>Pricing</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
                <Link
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] text-text-primary hover:bg-bg-panel-raised transition-colors"
                >
                  <span>FAQ</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
                </Link>
              </div>

              {/* Mobile Quick Controls Bar */}
              <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[11px] text-text-muted px-1 font-mono">
                <span className="text-[10px] text-text-muted">ZYRON_LABS_v2.6</span>
                <span className="text-[10px] text-accent-scan">ZYRON_OS</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION                                                             */}
      {/* ========================================================================= */}
      <main id="hero" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-0 space-y-12 overflow-hidden">
        {/* Hero Copy */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Liquid Glass AI-Powered Pill Badge */}
          <div className="hero-badge-anim relative inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-bg-panel/80 backdrop-blur-xl border border-border-hairline shadow-sm group overflow-hidden cursor-default">
            {/* Top Specular Rim Reflection */}
            <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-accent-scan/30 to-transparent pointer-events-none" />

            {/* Subtle Liquid Shimmer Layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-scan/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            {/* Badge Text */}
            <span className="relative z-10 text-xs font-mono font-medium text-text-primary tracking-wide">
              AI-Powered Security Engine
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-title-anim font-display text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-text-primary leading-[1.12]">
            Securing the future of
            <br />
            <span className="text-accent-scan font-normal">decentralized finance.</span>
          </h1>

          {/* Subheading */}
          <p className="hero-subhead-anim text-sm sm:text-base text-text-muted max-w-xl mx-auto leading-relaxed">
            Instantly audit smart contracts with AI. Detect vulnerabilities, triage risks, and ship safer code in minutes.
          </p>

          {/* Dual Interactive Expanding CTA Buttons */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-sm sm:max-w-none mx-auto">
              {/* Button 1: Request an Audit */}
              <div onClick={handleRequestAudit} className="hero-cta-anim w-full sm:w-auto cursor-pointer">
                <ExpandingButton
                  variant="light"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<ArrowUpRight className="h-4 w-4 stroke-[2.5]" />}
                >
                  Request an Audit
                </ExpandingButton>
              </div>

              {/* Button 2: Explore Dashboard */}
              <div onClick={handleViewDashboard} className="hero-cta-anim w-full sm:w-auto cursor-pointer">
                <ExpandingButton
                  variant="dark"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<ArrowUpRight className="h-4 w-4 stroke-[2.5]" />}
                >
                  Explore Dashboard
                </ExpandingButton>
              </div>
            </div>

            <p className="hero-subhead-anim text-xs text-text-muted/70 font-mono">
              Connect your repository and start auditing in seconds.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HERO SHOWCASE CARD: LIVE INTERACTIVE DASHBOARD WORKBENCH                  */}
        {/* ========================================================================= */}
        <div
          ref={demoRef}
          className="hero-card-anim relative max-w-5xl mx-auto pt-4 w-full"
        >
          {/* Deep atmospheric wide outer glow */}
          <div className="absolute -inset-6 sm:-inset-12 bg-accent-scan/15 rounded-[40px] blur-3xl animate-glow-pulse pointer-events-none -z-10" />
          <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-b from-accent-scan/20 via-accent-scan/5 to-transparent rounded-[24px] blur-xl pointer-events-none -z-10" />

          {/* Interactive Live Dashboard Component */}
          <InteractiveDashboardDemo />
        </div>
      </main>

      {/* ========================================================================= */}
      {/* SECTION 2: 3-ROW PARALLAX SUPPORTED BLOCKCHAINS & RUNTIMES               */}
      {/* ========================================================================= */}
      <section id="ecosystem" className="chains-section relative py-20 border-t border-border-hairline bg-bg-void/80 overflow-hidden">
        {/* Section Header */}
        <div className="reveal-on-scroll max-w-4xl mx-auto px-4 text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-bg-panel border border-border-hairline text-accent-scan font-mono text-xs">
            <Cpu className="h-3.5 w-3.5 text-accent-scan" />
            <span>CROSS-CHAIN SECURITY LAB</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-text-primary">
            Securing smart contracts across{" "}
            <span className="text-accent-scan">40+ blockchains.</span>
          </h2>

          <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto font-sans leading-relaxed">
            Continuous automated AST rules and manual audit triage calibrated for EVM, SVM, Move VM, and CosmWasm execution runtimes.
          </p>
        </div>

        {/* 3-Row Parallax Marquee Wrapper with Side Cut-out Fade Vignettes */}
        <div className="relative w-full overflow-hidden space-y-3.5 py-4">
          {/* Left & Right Edge Cut-Out Gradient Masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-44 bg-gradient-to-r from-bg-void via-bg-void/80 to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-44 bg-gradient-to-l from-bg-void via-bg-void/80 to-transparent z-20" />

          {/* ROW 1: Scrolls Left on Scroll Down, Right on Scroll Up */}
          <div className="chain-row-1 flex items-center gap-3.5 whitespace-nowrap will-change-transform">
            {[...row1Chains, ...row1Chains].map((name, index) => (
              <div
                key={`r1-${name}-${index}`}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-[6px] bg-bg-panel border border-border-hairline shadow-sm dark:shadow-black/60 shadow-black/5 hover:bg-bg-panel-raised transition-all group shrink-0 select-none cursor-default"
              >
                <ChainLogo name={name} className="h-5 w-5 shrink-0" />
                <span className="font-display font-medium text-xs text-text-primary group-hover:text-accent-scan transition-colors">
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* ROW 2: Scrolls Right on Scroll Down, Left on Scroll Up */}
          <div className="chain-row-2 flex items-center gap-3.5 whitespace-nowrap will-change-transform -translate-x-64">
            {[...row2Chains, ...row2Chains].map((name, index) => (
              <div
                key={`r2-${name}-${index}`}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-[6px] bg-bg-panel border border-border-hairline shadow-sm dark:shadow-black/60 shadow-black/5 hover:bg-bg-panel-raised transition-all group shrink-0 select-none cursor-default"
              >
                <ChainLogo name={name} className="h-5 w-5 shrink-0" />
                <span className="font-display font-medium text-xs text-text-primary group-hover:text-accent-scan transition-colors">
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* ROW 3: Scrolls Left on Scroll Down, Right on Scroll Up */}
          <div className="chain-row-3 flex items-center gap-3.5 whitespace-nowrap will-change-transform -translate-x-20">
            {[...row3Chains, ...row3Chains].map((name, index) => (
              <div
                key={`r3-${name}-${index}`}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-[6px] bg-bg-panel border border-border-hairline shadow-sm dark:shadow-black/60 shadow-black/5 hover:bg-bg-panel-raised transition-all group shrink-0 select-none cursor-default"
              >
                <ChainLogo name={name} className="h-5 w-5 shrink-0" />
                <span className="font-display font-medium text-xs text-text-primary group-hover:text-accent-scan transition-colors">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: ON-CHAIN SECURITY BENCHMARKS (CURATED MULTI-TONE CARDS)        */}
      {/* ========================================================================= */}
      <section className="metrics-section relative py-28 border-t border-border-hairline bg-bg-void overflow-hidden">
        {/* Subtle Ambient Scanline Grid Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[500px] bg-accent-scan/[0.03] blur-[160px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
          {/* Section Header */}
          <div className="reveal-on-scroll max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-bg-panel border border-border-hairline text-accent-scan font-mono text-xs">
              <Activity className="h-3.5 w-3.5 text-accent-scan animate-pulse" />
              <span>SECURITY PARITY BENCHMARK & THREAT METRICS</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-text-primary leading-[1.12]">
              The cost of unverified bytecode vs.{" "}
              <span className="text-accent-scan">the Zyron standard.</span>
            </h2>

            <p className="text-sm sm:text-base text-text-muted font-sans leading-relaxed">
              Exploits drain billions in decentralized liquidity annually. Our hybrid AST engine and whitehat verification triad turn critical attack vectors into protected TVL.
            </p>
          </div>

          {/* Clean Rounded Stat Cards (Matching Reference Aesthetic) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Stolen Capital (Deep Dark Void / Signal) */}
            <div className="reveal-on-scroll rounded-[22px] bg-bg-panel p-7 min-h-[200px] flex flex-col justify-between text-text-primary shadow-sm border border-border-hairline relative overflow-hidden group hover:border-signal-critical/40 transition-all">
              <div className="flex flex-col items-start gap-3.5">
                <div id="counter-stolen" className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-text-primary shrink-0 leading-none">
                  $0.00B+
                </div>
                <p className="text-xs sm:text-[13px] text-text-muted font-medium leading-snug max-w-[135px] text-left pt-0.5">
                  Stolen across unverified smart contracts
                </p>
              </div>

              <div className="pt-6">
                <span className="inline-block px-3.5 py-1.5 rounded-[8px] bg-bg-void text-text-muted group-hover:text-text-primary text-[11px] font-mono font-medium border border-border-hairline transition-colors">
                  Web3 Exploits
                </span>
              </div>
            </div>

            {/* Card 2: Secured TVL (High-Contrast Bone / Off-White Accent) */}
            <div className="reveal-on-scroll rounded-[22px] bg-bg-panel-raised dark:bg-[#EAE7DF] p-7 min-h-[200px] flex flex-col justify-between text-text-primary dark:text-[#111317] shadow-sm border border-border-hairline dark:border-transparent relative overflow-hidden group hover:border-accent-scan/40 transition-all">
              <div className="flex flex-col items-start gap-3.5">
                <div id="counter-secured" className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-text-primary dark:text-[#111317] shrink-0 leading-none">
                  $0.0B+
                </div>
                <p className="text-xs sm:text-[13px] text-text-muted dark:text-[#111317]/80 font-medium leading-snug max-w-[135px] text-left pt-0.5">
                  Total value secured across audited protocols
                </p>
              </div>

              <div className="pt-6">
                <span className="inline-block px-3.5 py-1.5 rounded-[8px] bg-accent-scan/10 text-accent-scan dark:bg-black/[0.08] dark:text-[#111317] text-[11px] font-mono font-semibold border border-accent-scan/20 dark:border-black/[0.04]">
                  Protected TVL
                </span>
              </div>
            </div>

            {/* Card 3: Zero-Days Intercepted (Muted Charcoal / Slate) */}
            <div className="reveal-on-scroll rounded-[22px] bg-bg-panel p-7 min-h-[200px] flex flex-col justify-between text-text-primary shadow-sm border border-border-hairline relative overflow-hidden group hover:border-signal-high/40 transition-all">
              <div className="flex flex-col items-start gap-3.5">
                <div id="counter-vulns" className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-text-primary shrink-0 leading-none">
                  0
                </div>
                <p className="text-xs sm:text-[13px] text-text-muted font-medium leading-snug max-w-[135px] text-left pt-0.5">
                  Zero-days intercepted before mainnet genesis
                </p>
              </div>

              <div className="pt-6">
                <span className="inline-block px-3.5 py-1.5 rounded-[8px] bg-bg-void text-text-muted group-hover:text-text-primary text-[11px] font-mono font-medium border border-border-hairline transition-colors">
                  Zero-Day Triage
                </span>
              </div>
            </div>

            {/* Card 4: Mean Scan Speed (Deep Steel / Terminal Dark) */}
            <div className="reveal-on-scroll rounded-[22px] bg-bg-panel p-7 min-h-[200px] flex flex-col justify-between text-text-primary shadow-sm border border-border-hairline relative overflow-hidden group hover:border-accent-scan/40 transition-all">
              <div className="flex flex-col items-start gap-3.5">
                <div id="counter-speed" className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-text-primary shrink-0 leading-none">
                  0.0s
                </div>
                <p className="text-xs sm:text-[13px] text-text-muted font-medium leading-snug max-w-[135px] text-left pt-0.5">
                  Average AST static syntax inference pass
                </p>
              </div>

              <div className="pt-6">
                <span className="inline-block px-3.5 py-1.5 rounded-[8px] bg-bg-void text-text-muted group-hover:text-text-primary text-[11px] font-mono font-medium border border-border-hairline transition-colors">
                  Inference Latency
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: PLATFORM FEATURES (2-TOP / 3-BOTTOM GRID MATCHING REFERENCE)   */}
      {/* ========================================================================= */}
      <section id="features" className="relative py-28 border-t border-border-hairline bg-bg-void">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          {/* Section Header */}
          <div className="reveal-on-scroll max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-bg-panel border border-border-hairline text-accent-scan font-mono text-xs">
              <span className="text-accent-scan font-bold">|</span>
              <span>FEATURES</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-text-primary leading-[1.12]">
              Powerful features to simplify your{" "}
              <span className="text-accent-scan">Web3 security experience</span>
            </h2>

            <p className="text-sm sm:text-base text-text-muted font-sans leading-relaxed">
              Pairing deterministic AST verification, real-time threat telemetry, and adversarial human triage in a unified diagnostic platform.
            </p>
          </div>

          {/* Top Row: 2 Large Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Smart Contract Audit & Review */}
            <div className="reveal-on-scroll rounded-[18px] bg-bg-panel border border-border-hairline shadow-sm p-6 flex flex-col justify-between">
              {/* Image Container with Top-only Radius and Padding */}
              <div className="rounded-t-[14px] rounded-b-none bg-bg-panel-raised border-b border-border-hairline pt-3 sm:pt-3.5 px-3 sm:px-3.5 pb-0 h-[220px] sm:h-[240px] mb-6 relative overflow-hidden flex items-end justify-center">
                {/* Bordered Inner Image Frame with Top-only Radius cutting off at bottom */}
                <div className="w-full h-full rounded-t-[10px] rounded-b-none border-t border-x border-b-0 border-border-hairline overflow-hidden relative flex items-center justify-center bg-bg-void">
                  <img
                    src="/audit-review.png"
                    alt="Smart Contract Audit & Review Workspace"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Bottom Soft Blur / Fade */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-bg-panel-raised via-bg-panel-raised/60 to-transparent backdrop-blur-[1px]" />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h3 className="font-display text-lg sm:text-xl font-medium text-text-primary tracking-tight">
                  Smart Contract Audit & Review
                </h3>
                <p className="text-xs sm:text-[13px] text-text-muted font-sans leading-relaxed">
                  Pair automated AST formal verification with seasoned whitehat adversarial review to catch zero-day vulnerabilities and ship safe code effortlessly.
                </p>
              </div>
            </div>

            {/* Card 2: Token Risk Analyzer */}
            <div className="reveal-on-scroll rounded-[18px] bg-bg-panel border border-border-hairline shadow-sm p-6 flex flex-col justify-between">
              {/* Image Container with Top-only Radius and Padding */}
              <div className="rounded-t-[14px] rounded-b-none bg-bg-panel-raised border-b border-border-hairline pt-3 sm:pt-3.5 px-3 sm:px-3.5 pb-0 h-[220px] sm:h-[240px] mb-6 relative overflow-hidden flex items-end justify-center">
                {/* Bordered Inner Image Frame with Top-only Radius cutting off at bottom */}
                <div className="w-full h-full rounded-t-[10px] rounded-b-none border-t border-x border-b-0 border-border-hairline overflow-hidden relative flex items-center justify-center bg-bg-void">
                  <img
                    src="/token-scan.png"
                    alt="Token Risk Analyzer Diagnostic Workspace"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Bottom Soft Blur / Fade */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-bg-panel-raised via-bg-panel-raised/60 to-transparent backdrop-blur-[1px]" />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h3 className="font-display text-lg sm:text-xl font-medium text-text-primary tracking-tight">
                  Token Risk Analyzer
                </h3>
                <p className="text-xs sm:text-[13px] text-text-muted font-sans leading-relaxed">
                  Instant automated risk assessment for ERC-20, SPL, and cross-chain tokens. Detect honeypots, hidden burn triggers, and proxy backdoors in milliseconds.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row: 3 Smaller Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 3: Incident Monitor */}
            <div className="reveal-on-scroll rounded-[18px] bg-bg-panel border border-border-hairline shadow-sm p-6 flex flex-col justify-between">
              {/* Image Container with Top-only Radius and Padding */}
              <div className="rounded-t-[14px] rounded-b-none bg-bg-panel-raised border-b border-border-hairline pt-3 px-3 pb-0 h-[190px] sm:h-[200px] mb-6 relative overflow-hidden flex items-end justify-center">
                {/* Bordered Inner Image Frame with Top-only Radius cutting off at bottom */}
                <div className="w-full h-full rounded-t-[10px] rounded-b-none border-t border-x border-b-0 border-border-hairline overflow-hidden relative flex items-center justify-center bg-bg-void">
                  <img
                    src="/incident-monitor.png"
                    alt="Incident Monitor Mempool Telemetry Workspace"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Bottom Soft Blur / Fade */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg-panel-raised to-transparent backdrop-blur-[1px]" />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h3 className="font-display text-base sm:text-lg font-medium text-text-primary tracking-tight">
                  Incident Monitor
                </h3>
                <p className="text-xs sm:text-[13px] text-text-muted font-sans leading-relaxed">
                  24/7 on-chain threat telemetry and mempool radar alerting teams instantly on anomalous volume spikes or oracle breaches.
                </p>
              </div>
            </div>

            {/* Card 4: Security Vaults */}
            <div className="reveal-on-scroll rounded-[18px] bg-bg-panel border border-border-hairline shadow-sm p-6 flex flex-col justify-between">
              {/* Image Container with Top-only Radius and Padding */}
              <div className="rounded-t-[14px] rounded-b-none bg-bg-panel-raised border-b border-border-hairline pt-3 px-3 pb-0 h-[190px] sm:h-[200px] mb-6 relative overflow-hidden flex items-end justify-center">
                {/* Bordered Inner Image Frame with Top-only Radius cutting off at bottom */}
                <div className="w-full h-full rounded-t-[10px] rounded-b-none border-t border-x border-b-0 border-border-hairline overflow-hidden relative flex items-center justify-center bg-bg-void">
                  <img
                    src="/document-vault.png"
                    alt="Cryptographic Document Vault & Attestation Registry"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Bottom Soft Blur / Fade */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg-panel-raised to-transparent backdrop-blur-[1px]" />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h3 className="font-display text-base sm:text-lg font-medium text-text-primary tracking-tight">
                  Security Vaults
                </h3>
                <p className="text-xs sm:text-[13px] text-text-muted font-sans leading-relaxed">
                  Seal audit deliverables and remediation diffs with immutable cryptographic hashes timestamped on-chain for institutional LPs.
                </p>
              </div>
            </div>

            {/* Card 5: Learning Platform */}
            <div className="reveal-on-scroll rounded-[18px] bg-bg-panel border border-border-hairline shadow-sm p-6 flex flex-col justify-between">
              {/* Image Container with Top-only Radius and Padding */}
              <div className="rounded-t-[14px] rounded-b-none bg-bg-panel-raised border-b border-border-hairline pt-3 px-3 pb-0 h-[190px] sm:h-[200px] mb-6 relative overflow-hidden flex items-end justify-center">
                {/* Bordered Inner Image Frame with Top-only Radius cutting off at bottom */}
                <div className="w-full h-full rounded-t-[10px] rounded-b-none border-t border-x border-b-0 border-border-hairline overflow-hidden relative flex items-center justify-center bg-bg-void">
                  <img
                    src="/learning.png"
                    alt="Security Learning Platform and Interactive Course Academy"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Bottom Soft Blur / Fade */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg-panel-raised to-transparent backdrop-blur-[1px]" />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h3 className="font-display text-base sm:text-lg font-medium text-text-primary tracking-tight">
                  Learning Platform
                </h3>
                <p className="text-xs sm:text-[13px] text-text-muted font-sans leading-relaxed">
                  Master smart contract security through interactive exploit courses, knowledge checks, and certified auditor curriculum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: HOW IT WORKS (STICKY SCROLL STACKING CARD DECK)               */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="relative py-28 border-t border-border-hairline bg-bg-void">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
          {/* Section Header */}
          <div className="reveal-on-scroll max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-bg-panel border border-border-hairline text-accent-scan font-mono text-xs">
              <span className="text-accent-scan font-bold">|</span>
              <span>HOW IT WORKS · AUDIT LIFECYCLE</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-text-primary leading-[1.12]">
              Deterministic pipeline from bytecode to{" "}
              <span className="text-accent-scan">signed attestation.</span>
            </h2>

            <p className="text-sm sm:text-base text-text-muted font-sans leading-relaxed">
              Our 4-stage verification lifecycle guarantees cryptographic parity and transparent milestone releases at every step.
            </p>
          </div>

          {/* Sticky Stacking Cards Container */}
          <div className="relative pb-44 space-y-12">
            {/* ================================================================= */}
            {/* STACK CARD 1: INSTANT AST GRAMMAR PARSER                          */}
            {/* ================================================================= */}
            <div className="sticky top-[100px] z-10 rounded-[16px] bg-bg-panel border border-border-hairline shadow-xl dark:shadow-black/80 shadow-black/5 overflow-hidden backdrop-blur-xl">
              {/* Top Tab Bar Header (Visible when stacked) */}
              <div className="px-6 sm:px-8 py-3.5 bg-bg-panel-raised border-b border-border-hairline flex items-center justify-between font-mono text-xs text-text-muted">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-accent-scan" />
                  <span className="font-semibold text-text-primary">01 PARSE</span>
                  <span className="text-text-muted/40">·</span>
                  <span className="text-[11px]">Static AST verification & bytecode linting</span>
                </div>
                <span className="text-[10px] text-accent-scan uppercase tracking-wider hidden sm:inline">
                  AST_ENGINE_v4.2
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Column: Headline & Bullets */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight leading-snug">
                      Instant AST grammar parsing, before code hits testnets.
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
                      Compile and parse Solidity & Vyper abstract syntax trees in milliseconds. The engine evaluates 120+ formal invariant verification rules to intercept zero-day reentrancy, access control leaks, and precision loss before manual triage begins.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs sm:text-[13px] text-text-muted">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Deterministic SWC taxonomy classification across EVM, SVM & Move VM</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Automated PR webhook linting with line-level GitHub annotations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Gas optimization diagnostics with opcode execution estimations</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Diagnostic Mockup UI */}
                <div className="lg:col-span-6 rounded-[10px] bg-bg-void p-4 space-y-3 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-border-hairline/60 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-accent-scan" />
                      <span className="text-text-primary font-semibold">AST_SYNTAX_PARSER</span>
                    </div>
                    <span className="text-signal-resolved text-[10px] px-2 py-0.5 rounded bg-signal-resolved/10">
                      120 RULES ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="text-text-muted flex items-center gap-2">
                      <span className="text-accent-scan">▸ ContractDefinition:</span>
                      <span className="text-text-primary font-bold">StakingRouter.sol</span>
                    </div>

                    <div className="pl-4 space-y-1.5 text-[10px]">
                      <div className="flex items-center justify-between text-text-muted">
                        <span>├─ StateVariable [isLocked]: Boolean</span>
                        <span className="text-signal-resolved font-bold">✓ SAFE</span>
                      </div>
                      <div className="flex items-center justify-between bg-signal-critical/10 p-2 rounded text-signal-critical font-medium">
                        <span>├─ FunctionDefinition [emergencyWithdraw]</span>
                        <span>⚠ REENTRANCY RISKS</span>
                      </div>
                      <div className="pl-4 text-[9px] text-text-muted">
                        └─ LowLevelCall [msg.sender.call] violates CEI pattern
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-bg-panel/60 flex items-center justify-between text-[10px] text-text-muted">
                    <span className="flex items-center gap-1.5 text-signal-resolved">
                      <CheckCircle2 className="h-3 w-3" />
                      Inference Complete (1.4ms)
                    </span>
                    <span>Solidity AST v0.8.28</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* STACK CARD 2: DUAL-PANE CODE REVIEW & RED-TEAM WORKSPACE          */}
            {/* ================================================================= */}
            <div className="sticky top-[148px] z-20 rounded-[16px] bg-bg-panel border border-border-hairline shadow-xl dark:shadow-black/80 shadow-black/5 overflow-hidden backdrop-blur-xl">
              {/* Top Tab Bar Header (Visible when stacked) */}
              <div className="px-6 sm:px-8 py-3.5 bg-bg-panel-raised border-b border-border-hairline flex items-center justify-between font-mono text-xs text-text-muted">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-signal-high" />
                  <span className="font-semibold text-text-primary">02 REVIEW</span>
                  <span className="text-text-muted/40">·</span>
                  <span className="text-[11px]">Dual-pane auditor workspace & red-team triage</span>
                </div>
                <span className="text-[10px] text-signal-high uppercase tracking-wider hidden sm:inline">
                  MANUAL_TRIAGE_ACTIVE
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Column: Headline & Bullets */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight leading-snug">
                      Adversarial review from auditors who've broken protocols.
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
                      Automated scanning is paired with human auditors. Review decompiled bytecode, inspect symbolic execution traces, and collaborate on vulnerability triage in a dual-pane editor built specifically for smart contracts.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs sm:text-[13px] text-text-muted">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Side-by-side AST vulnerability diffs with real-time markdown notes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Severity scoring: Critical, High, Medium, Low, Informational</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Multi-auditor consensus sign-off with cryptographic signatures</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Dual-Pane Review Workspace UI */}
                <div className="lg:col-span-6 rounded-[10px] bg-bg-void p-4 space-y-3 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-border-hairline/60 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5 text-accent-scan" />
                      <span className="text-text-primary font-semibold">DUAL_PANE_WORKSPACE</span>
                    </div>
                    <span className="text-signal-high text-[10px] px-2 py-0.5 rounded bg-signal-high/10">
                      MANUAL REVIEW ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Left Sub-Pane */}
                    <div className="p-2.5 rounded bg-bg-panel-raised border border-border-hairline/60 space-y-1.5 text-[10px]">
                      <div className="text-text-muted font-bold text-[9px] uppercase border-b border-border-hairline/50 pb-1">
                        Contract Bytecode
                      </div>
                      <div className="space-y-1 font-mono text-text-muted/80 text-[9px]">
                        <div>141 uint256 bal = userBal;</div>
                        <div className="bg-signal-critical/15 text-signal-critical px-1 py-0.5 rounded">
                          142 msg.sender.call&#123;val&#125;();
                        </div>
                        <div>143 userBal = 0;</div>
                      </div>
                    </div>

                    {/* Right Sub-Pane */}
                    <div className="p-2.5 rounded bg-bg-panel-raised border border-border-hairline/60 space-y-1.5 text-[10px]">
                      <div className="flex items-center justify-between text-[9px] border-b border-border-hairline/50 pb-1">
                        <span className="text-signal-critical font-bold">[CRITICAL]</span>
                        <span className="text-text-muted">auditor.eth</span>
                      </div>
                      <p className="text-text-primary font-sans leading-relaxed text-[10px]">
                        Reentrancy confirmed. State balance must be zeroed before dispatch.
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline/60 flex items-center justify-between text-[10px] text-text-muted">
                    <span>Consensus: 2/2 Signed</span>
                    <span className="text-accent-scan font-bold">Severity: Critical</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* STACK CARD 3: 4-STAGE PIPELINE & MILESTONE ESCROW                 */}
            {/* ================================================================= */}
            <div className="sticky top-[196px] z-30 rounded-[16px] bg-bg-panel border border-border-hairline shadow-xl dark:shadow-black/80 shadow-black/5 overflow-hidden backdrop-blur-xl">
              {/* Top Tab Bar Header (Visible when stacked) */}
              <div className="px-6 sm:px-8 py-3.5 bg-bg-panel-raised border-b border-border-hairline flex items-center justify-between font-mono text-xs text-text-muted">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-accent-scan animate-pulse" />
                  <span className="font-semibold text-text-primary">03 PIPELINE</span>
                  <span className="text-text-muted/40">·</span>
                  <span className="text-[11px]">Live milestone escrow & stage tracking</span>
                </div>
                <span className="text-[10px] text-accent-scan uppercase tracking-wider hidden sm:inline">
                  ESCROW_TELEMETRY
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Column: Headline & Bullets */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight leading-snug">
                      Real-time visibility from upload to final attestation.
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
                      Follow your security engagement live. Engineering, finance, and compliance teams get continuous visibility into review milestones, remediation patch evaluations, and automated escrow milestone disbursements.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs sm:text-[13px] text-text-muted">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Deterministic 4-stage pipeline with real-time status webhooks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Smart escrow milestones released strictly upon verified stage sign-off</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>SLA-guaranteed turnaround times with countdown telemetry</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Status Tracker UI */}
                <div className="lg:col-span-6 rounded-[10px] bg-bg-void p-4 space-y-3 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-border-hairline/60 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-accent-scan" />
                      <span className="text-text-primary font-semibold">PIPELINE // TKT-8942</span>
                    </div>
                    <span className="text-accent-scan text-[10px] px-2 py-0.5 rounded bg-accent-scan/10">
                      STAGE 03 ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2 text-[10px]">
                    <div className="flex items-center justify-between text-signal-resolved">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" />
                        01 · Scope Ingestion & Invariant Setup
                      </span>
                      <span className="text-text-muted text-[9px]">DONE</span>
                    </div>

                    <div className="flex items-center justify-between text-signal-resolved">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" />
                        02 · AST Grammar & Formal Scan
                      </span>
                      <span className="text-text-muted text-[9px]">DONE</span>
                    </div>

                    <div className="flex items-center justify-between bg-bg-panel-raised border border-border-hairline/60 p-1.5 rounded text-accent-scan font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-scan animate-pulse" />
                        03 · Manual Adversarial Triage
                      </span>
                      <span className="text-[9px] font-bold">IN PROGRESS</span>
                    </div>

                    <div className="flex items-center justify-between text-text-muted/60">
                      <span>04 · Final Signed Attestation</span>
                      <span className="text-[9px]">PENDING</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline/60 flex items-center justify-between text-[10px] text-text-muted">
                    <span>Escrow: 50% Released</span>
                    <span className="text-text-primary font-bold">Target ETA: 24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* STACK CARD 4: IMMUTABLE DOCUMENT VAULT & VERIFIED PROOFS          */}
            {/* ================================================================= */}
            <div className="sticky top-[244px] z-40 rounded-[16px] bg-bg-panel border border-border-hairline shadow-xl dark:shadow-black/80 shadow-black/5 overflow-hidden backdrop-blur-xl">
              {/* Top Tab Bar Header (Visible when stacked) */}
              <div className="px-6 sm:px-8 py-3.5 bg-bg-panel-raised border-b border-border-hairline flex items-center justify-between font-mono text-xs text-text-muted">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-signal-resolved" />
                  <span className="font-semibold text-text-primary">04 ATTEST</span>
                  <span className="text-text-muted/40">·</span>
                  <span className="text-[11px]">Immutable document vault & verified proofs</span>
                </div>
                <span className="text-[10px] text-signal-resolved uppercase tracking-wider hidden sm:inline">
                  SHA-256_SEALED
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Column: Headline & Bullets */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight leading-snug">
                      Verifiable trust for exchanges, LPs, and launchpads.
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
                      Every audit report, remediation diff, and scope manifest is sealed with SHA-256 cryptographic hashes and timestamped on-chain for tamper-evident validation and stakeholder peace of mind.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs sm:text-[13px] text-text-muted">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Cryptographically signed PDF and markdown reports with on-chain proofs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Embeddable public verification badges and live security scorecards</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-accent-scan shrink-0" />
                      <span>Historical version tracking for upgradeable proxy contracts</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Certificate Vault UI */}
                <div className="lg:col-span-6 rounded-[10px] bg-bg-void p-4 space-y-3 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-border-hairline/60 text-[11px]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-signal-resolved" />
                      <span className="text-text-primary font-semibold">CERTIFICATE_VAULT</span>
                    </div>
                    <span className="text-signal-resolved text-[10px] px-2 py-0.5 rounded bg-signal-resolved/10">
                      SHA-256 VERIFIED
                    </span>
                  </div>

                  <div className="p-3 rounded bg-bg-panel-raised border border-border-hairline/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary font-bold text-xs">
                        {stats?.recentAudits?.[0]?.contractFileName
                          ? `${stats.recentAudits[0].contractFileName.replace(/\.sol$/, '')}-Audit.pdf`
                          : "BeeTrade-Orderbook-Audit.pdf"}
                      </span>
                      <span className="text-[10px] text-text-muted">4.8 MB</span>
                    </div>

                    <div className="p-2 rounded bg-bg-void space-y-0.5 text-[9px]">
                      <div className="text-text-muted">Cryptographic Seal:</div>
                      <div className="text-accent-scan font-mono break-all">
                        0x7f9a3c2e11894db091c5a772f3e8b4912cd
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-signal-resolved flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Zero Open Vulnerabilities
                      </span>
                      <button className="px-2.5 py-1 rounded bg-text-primary text-bg-void font-bold text-[10px] flex items-center gap-1 hover:opacity-90 transition-opacity">
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline/60 flex items-center justify-between text-[10px] text-text-muted">
                    <span>Public Proof: <span className="text-text-primary">zyron.io/verify/8942</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: TRANSPARENT SCOPED PRICING                                    */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-24 px-6 md:px-12 border-t border-border-hairline bg-bg-void relative">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Centered Section Header Matching Reference */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-text-primary leading-[1.1]">
              Simple pricing,<br />serious results
            </h2>
            <p className="text-sm sm:text-base text-text-muted font-sans leading-relaxed pt-1">
              Track and verify your smart contracts across all major EVM & SVM protocols.<br className="hidden sm:inline" />
              No hidden agency retainers, milestone escrow protected.
            </p>
          </div>

          {/* 3-Card Layout Matching Reference Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* CARD 1: STARTER */}
            <div className="rounded-[22px] bg-bg-panel p-7 sm:p-8 border border-border-hairline flex flex-col justify-between space-y-7 shadow-sm hover:border-accent-scan/40 transition-colors">
              <div className="space-y-6">
                {/* Header & Subtitle */}
                <div className="space-y-2">
                  <div className="font-display text-xl sm:text-2xl font-medium text-text-primary">
                    Starter
                  </div>
                  <p className="text-xs sm:text-[13px] text-text-muted font-sans leading-relaxed min-h-[40px]">
                    For solo developers and teams trying out automated AST formal verification and basic repo monitoring.
                  </p>
                </div>

                {/* Price Display */}
                <div className="space-y-3">
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="font-display text-4xl sm:text-5xl font-medium text-text-primary">
                      {billingCycle === "continuous" ? "$89" : "$890"}
                    </span>
                    <span className="text-xs text-text-muted">
                      {billingCycle === "continuous" ? "/monthly" : "/month"}
                    </span>
                  </div>

                  {/* Inline Toggle Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
                      <button
                        onClick={() => setBillingCycle(billingCycle === "continuous" ? "engagement" : "continuous")}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
                          billingCycle === "continuous" ? "bg-signal-resolved" : "bg-text-muted/20"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            billingCycle === "continuous" ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-text-primary text-xs">Annually</span>
                    </div>

                    <span className="px-2 py-0.5 rounded-[4px] bg-signal-resolved/15 text-signal-resolved border border-signal-resolved/30 font-mono text-[11px] font-bold">
                      Save $480
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Link href="/portal/integrations" className="block w-full">
                  <button className="w-full py-3 px-4 rounded-[10px] bg-bg-panel-raised border border-border-hairline text-text-primary hover:bg-bg-panel hover:border-accent-scan/50 transition-colors font-mono text-xs font-semibold flex items-center justify-center gap-2">
                    <span>Start for Free</span>
                    <span>→</span>
                  </button>
                </Link>

                {/* Feature List */}
                <div className="space-y-3 text-xs sm:text-[13px] font-sans text-text-muted pt-2 border-t border-border-hairline">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Access to 120+ SWC AST invariant rules</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Line-level GitHub PR webhook annotations</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Sub-second execution on every git push</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Gas profiling & opcode execution trace</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Unlimited repositories</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Unlimited seats</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Email Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: PRO (MOST POPULAR) */}
            <div className="rounded-[22px] bg-bg-panel p-7 sm:p-8 border-2 border-accent-scan/50 flex flex-col justify-between space-y-7 shadow-xl relative">
              <div className="space-y-6">
                {/* Header & Subtitle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-display text-xl sm:text-2xl font-medium text-text-primary">
                      Pro
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-signal-resolved/15 text-signal-resolved border border-signal-resolved/30 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span>✦</span>
                      <span>Most Popular</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-text-muted font-sans leading-relaxed min-h-[40px]">
                    For agile protocol teams wanting deeper manual review into their smart contracts and faster mainnet deployment.
                  </p>
                </div>

                {/* Price Display */}
                <div className="space-y-3">
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="font-display text-4xl sm:text-5xl font-medium text-text-primary">
                      {billingCycle === "continuous" ? "$18,000" : "$18,000"}
                    </span>
                    <span className="text-xs text-text-muted">
                      /per scope
                    </span>
                  </div>

                  {/* Inline Toggle Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
                      <button
                        onClick={() => setBillingCycle(billingCycle === "continuous" ? "engagement" : "continuous")}
                        className="w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center bg-signal-resolved"
                      >
                        <div className="w-4 h-4 rounded-full bg-white translate-x-4 transition-transform" />
                      </button>
                      <span className="text-text-primary text-xs">50/50 Escrow</span>
                    </div>

                    <span className="px-2 py-0.5 rounded-[4px] bg-signal-resolved/15 text-signal-resolved border border-signal-resolved/30 font-mono text-[11px] font-bold">
                      Save $4,800
                    </span>
                  </div>
                </div>

                {/* Dark Solid Action Button */}
                <Link href="/portal/new-request" className="block w-full">
                  <button className="w-full py-3 px-4 rounded-[10px] bg-text-primary text-bg-void hover:opacity-90 hover:shadow-lg transition-all font-mono text-xs font-bold flex items-center justify-center gap-2">
                    <span>Request Scoped Quote</span>
                    <span>→</span>
                  </button>
                </Link>

                {/* Feature List */}
                <div className="space-y-3 text-xs sm:text-[13px] font-sans text-text-muted pt-2 border-t border-border-hairline">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span className="text-text-primary font-medium">Dual-pane collaborative auditor workspace</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Adversarial exploit reproduction on Anvil forks</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Non-custodial 50/50 milestone escrow</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Signed SHA-256 PDF report & L1 certificate</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Free 14-day remediation verification re-audit</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Unlimited seats</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Email + Dedicated Slack Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: ENTERPRISE */}
            <div className="rounded-[22px] bg-bg-panel p-7 sm:p-8 border border-border-hairline flex flex-col justify-between space-y-7 shadow-sm hover:border-accent-scan/40 transition-colors">
              <div className="space-y-6">
                {/* Header & Subtitle */}
                <div className="space-y-2">
                  <div className="font-display text-xl sm:text-2xl font-medium text-text-primary">
                    Enterprise
                  </div>
                  <p className="text-xs sm:text-[13px] text-text-muted font-sans leading-relaxed min-h-[40px]">
                    For enterprises needing advanced threat tracking, custom fuzzing suites, and 24/7 war room incident response.
                  </p>
                </div>

                {/* Price Display */}
                <div className="space-y-3">
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="font-display text-4xl sm:text-5xl font-medium text-text-primary">
                      Custom
                    </span>
                  </div>

                  {/* Spacer to align buttons */}
                  <div className="h-6 flex items-center font-mono text-xs text-text-muted">
                    <span>Dedicated Retainer & SLAs</span>
                  </div>
                </div>

                {/* Action Button */}
                <Link href="/portal/new-request" className="block w-full">
                  <button className="w-full py-3 px-4 rounded-[10px] bg-bg-panel-raised border border-border-hairline text-text-primary hover:bg-bg-panel hover:border-accent-scan/50 transition-colors font-mono text-xs font-semibold flex items-center justify-center gap-2">
                    <span>Request Personalized Demo</span>
                    <span>→</span>
                  </button>
                </Link>

                {/* Feature List */}
                <div className="space-y-3 text-xs sm:text-[13px] font-sans text-text-muted pt-2 border-t border-border-hairline">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Dedicated lead whitehat auditor on retainer</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>24/7 Mempool Radar anomaly detection</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Custom Medusa & Foundry invariant suite</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Emergency 15-minute response War Room SLA</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Single sign-on (SSO) & role-based access</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Unlimited seats</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-signal-resolved shrink-0 mt-0.5" />
                    <span>Dedicated Security Lead & Rep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: FREQUENTLY ASKED QUESTIONS (FAQ)                               */}
      {/* ========================================================================= */}
      <section id="faq" className="py-24 px-6 md:px-12 border-t border-border-hairline bg-bg-void relative">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-accent-scan">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-scan" />
              <span>KNOWLEDGE BASE // FREQUENTLY ASKED</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-text-primary">
              Frequently asked questions.
            </h2>
            <p className="text-sm sm:text-base text-text-muted font-sans max-w-xl mx-auto">
              Clear technical answers on scoping algorithms, escrow milestones, and verifiable deliverables.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-3 font-mono text-xs">
            {[
              {
                id: 0,
                q: "How is audit pricing calculated?",
                a: "Pricing is computed deterministically using Normalized Source Lines of Code (nSLOC) after stripping comments, imports, and interface boilerplate, factored by architectural complexity (such as cross-contract calls, inline assembly opcodes, and custom AMM math). You receive an exact binding quote in seconds upon uploading your .sol contract manifest.",
              },
              {
                id: 1,
                q: "How does the milestone escrow mechanism protect our treasury?",
                a: "When an engagement begins, 50% of the audit fee is locked in a non-custodial smart contract escrow. The first tranche is only released when preliminary findings are delivered to your dual-pane triage portal. The remaining 50% is released only after remediation verification is approved and the cryptographic SHA-256 seal is minted on-chain.",
              },
              {
                id: 2,
                q: "What is the standard turnaround timeline?",
                a: "Automated AST invariant scans and syntax linting execute in milliseconds. Comprehensive manual red-team reviews typically range from 3 to 7 business days for codebases under 2,500 nSLOC, and 8 to 14 days for complex multi-protocol architectures.",
              },
              {
                id: 3,
                q: "What chains and smart contract languages are supported?",
                a: "We support Solidity and Vyper across all EVM networks (Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BNB Chain), Solana SVM (Rust/Anchor), Move VM (Aptos/Sui), as well as cross-chain messaging layers like LayerZero and Chainlink CCIP.",
              },
              {
                id: 4,
                q: "How are audit deliverables verified by exchanges, launchpads, and institutional LPs?",
                a: "Every final report is hashed using SHA-256 and anchored to the Zyron Document Vault on L1. Anyone can verify the exact git commit, bytecode hash, auditor signatures, and passing test invariants by entering the engagement ID (e.g., ZYR-9481) or scanning the on-chain verification badge.",
              },
            ].map((faq) => {
              const isOpen = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-[12px] bg-bg-panel border border-border-hairline overflow-hidden transition-colors shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 text-text-primary hover:text-accent-scan transition-colors"
                  >
                    <span className="font-display text-base font-medium">{faq.q}</span>
                    <span className="h-6 w-6 rounded-[6px] bg-bg-void border border-border-hairline flex items-center justify-center text-text-muted shrink-0">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-text-muted font-sans text-xs sm:text-[13px] leading-relaxed border-t border-border-hairline">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: FINAL HIGH-IMPACT CALL TO ACTION (CTA)                         */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 md:px-12 border-t border-border-hairline bg-bg-void relative">
        <div className="max-w-7xl mx-auto rounded-[24px] sm:rounded-[28px] overflow-hidden relative border border-border-hairline bg-bg-panel p-8 sm:p-14 lg:p-16 min-h-[420px] flex flex-col justify-center shadow-2xl dark:shadow-black/80 shadow-black/5">
          {/* Hero Background Layer with Hue-Rotate and Vignette */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src="/hero-bg.png"
              alt=""
              className="w-full h-full object-cover object-center [filter:hue-rotate(-75deg)_saturate(2)_brightness(1.15)] scale-105 dark:opacity-30 opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-r dark:from-[#0B0D10]/90 dark:via-[#0B0D10]/60 dark:to-transparent from-bg-panel/95 via-bg-panel/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t dark:from-[#0B0D10]/70 dark:via-transparent dark:to-transparent from-bg-panel/60 via-transparent to-transparent" />
          </div>

          {/* Left-Aligned Banner Content Matching Reference */}
          <div className="relative z-10 space-y-6 max-w-2xl">
            {/* Social Proof Eyebrow with Avatar Cluster */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs sm:text-sm font-sans text-text-primary/90 font-medium">
                Join 500+ protocol teams on Zyron
              </span>
              <div className="flex items-center -space-x-2">
                <div className="h-7 w-7 rounded-full bg-accent-scan/15 border-2 border-bg-panel flex items-center justify-center text-[10px] font-mono font-bold text-accent-scan shadow-sm">
                  0x
                </div>
                <div className="h-7 w-7 rounded-full bg-signal-resolved/15 border-2 border-bg-panel flex items-center justify-center text-[10px] font-mono font-bold text-signal-resolved shadow-sm">
                  Z
                </div>
                <div className="h-7 w-7 rounded-full bg-signal-high/15 border-2 border-bg-panel flex items-center justify-center text-[10px] font-mono font-bold text-signal-high shadow-sm">
                  Ξ
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-text-primary leading-[1.12]">
              Ship contracts you&#39;d stake your own funds on.
            </h2>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-text-muted font-sans leading-relaxed max-w-xl">
              Zyron pairs automated vulnerability scanning with manual review from auditors who&#39;ve broken production protocols. Upgrade your security pipeline to 24/7 deterministic protection today.
            </p>

            {/* Dual Hero Expanding Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Link href="/portal/new-request" className="w-full sm:w-auto">
                <ExpandingButton
                  variant="light"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<ArrowUpRight className="h-4 w-4 stroke-[2.5]" />}
                >
                  Request an Audit
                </ExpandingButton>
              </Link>
              <Link href="/portal" className="w-full sm:w-auto">
                <ExpandingButton
                  variant="dark"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<ArrowUpRight className="h-4 w-4 stroke-[2.5]" />}
                >
                  Explore Dashboard
                </ExpandingButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: INSTITUTIONAL FOOTER (REFERENCE CONCEPT)                       */}
      {/* ========================================================================= */}
      <footer className="pt-20 pb-12 px-6 md:px-12 border-t border-border-hairline bg-bg-void text-text-muted relative overflow-hidden">
        {/* Subtle Ambient Nebula Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_110%,rgba(94,200,255,0.09),rgba(130,80,220,0.06),transparent_70%)] dark:opacity-100 opacity-40" />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          {/* Top Bar: Contact Info + Navigation Links */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-6">
            {/* Contact Info */}
            <div className="space-y-1">
              <div className="text-text-muted/70 text-xs font-mono">
                Contact Zyron Security at:
              </div>
              <a
                href="mailto:security@zyron.io"
                className="text-text-primary hover:text-accent-scan transition-colors font-mono text-sm sm:text-base font-semibold inline-flex items-center gap-1.5"
              >
                <span>security@zyron.io</span>
                <span className="text-xs">↗</span>
              </a>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap items-center gap-6 sm:gap-8 font-sans text-xs sm:text-sm text-text-muted">
              <Link href="#how-it-works" className="hover:text-text-primary transition-colors">
                How It Works
              </Link>
              <Link href="#pricing" className="hover:text-text-primary transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="hover:text-text-primary transition-colors">
                FAQ
              </Link>
              <Link href="/portal" className="hover:text-text-primary transition-colors">
                Client Portal
              </Link>
            </nav>
          </div>

          {/* Giant Centered Brand Wordmark & Icon */}
          <div className="py-8 sm:py-12 md:py-16 flex items-center justify-center select-none">
            <div className="w-full flex items-center justify-between gap-4 sm:gap-8">
              {/* Brand Terminal Icon matching header */}
              <div className="h-12 w-12 sm:h-20 sm:w-20 md:h-28 md:w-28 lg:h-36 lg:w-36 shrink-0 rounded-[12px] sm:rounded-[20px] lg:rounded-[28px] bg-bg-panel border border-border-hairline flex items-center justify-center p-2.5 sm:p-4 md:p-6 lg:p-8 shadow-xl">
                <Terminal className="w-full h-full text-accent-scan stroke-[2.5]" />
              </div>

              {/* Massive Wordmark */}
              <span className="font-display text-[14vw] font-bold tracking-tight text-text-primary leading-none lowercase sm:lowercase">
                zyron
              </span>
            </div>
          </div>

          {/* Bottom Row: Copyright + Social Links */}
          <div className="pt-6 border-t border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-text-muted/80">
            <div>
              © 2026 Zyron Protocol Inc. All rights reserved.
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link href="https://twitter.com" target="_blank" className="hover:text-text-primary transition-colors">
                Twitter / X
              </Link>
              <Link href="https://github.com" target="_blank" className="hover:text-text-primary transition-colors">
                GitHub
              </Link>
              <Link href="https://discord.com" target="_blank" className="hover:text-text-primary transition-colors">
                Discord
              </Link>
              <Link href="#" className="hover:text-text-primary transition-colors">
                Security Disclosure
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
