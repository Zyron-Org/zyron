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
  FileText,
  DollarSign,
  Activity,
  Award,
  Search,
  CheckSquare,
  Crosshair,
  Volume2,
  VolumeX,
  User,
  Globe,
  HelpCircle,
  Target,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- PITCH DECK SLIDE DEFINITIONS WITH CONVERSATIONAL INVESTOR PRESENTATION SCRIPT ---
interface SlideData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  category: "Vision" | "Market" | "Product" | "Business" | "Traction";
  script: string;
}

const SLIDES_META: SlideData[] = [
  {
    id: "cover",
    badge: "Monad Metropolis • Trust, Identity & Data Ownership for AI",
    title: "ZYRON: ON-CHAIN TRUST PRIMITIVE",
    subtitle: "Transforming Web3 security from a 6-week, $100k manual consulting bottleneck into 48-hour automated proof and composable on-chain trust.",
    category: "Vision",
    script:
      "Welcome to Zairon. We are transforming Web3 smart contract security from a slow, six-week, one-hundred-thousand-dollar consulting bottleneck into forty-eight-hour automated mathematical proof and composable on-chain trust on Mow-nad. By replacing speculative linters and unlinked P-D-F reports with automated E-V-M attack proving and permanent on-chain attestations, Zairon unlocks rapid time-to-market and institutional trust for protocols and autonomous AI agents.",
  },
  {
    id: "problem",
    badge: "The Problem",
    title: "The $1.8B Web3 Security Bottleneck",
    subtitle: "Smart contracts secure over $100B, yet security relies on noisy linters, slow $50k+ manual audits, and unlinked PDFs.",
    category: "Market",
    script:
      "Smart contracts secure over one hundred billion dollars in T-V-L, yet over one point eight billion dollars was lost to hacks in the last year alone. In over seventy percent of these incidents, the protocol had already paid for an audit. Today's security model is broken: teams spend fifty to one hundred fifty thousand dollars and wait four to eight weeks, only to receive a static P-D-F that has zero cryptographic connection to the bytecode running on-chain. In an ecosystem moving at ten thousand T-P-S, static P-D-Fs fail completely.",
  },
  {
    id: "solution",
    badge: "The Solution",
    title: "Automated Proof & Composable On-Chain Trust",
    subtitle: "Dual-Engine AI Invariant Verification + Autonomous Red-Team Exploit Prover + On-Chain Trust Primitive on Monad.",
    category: "Product",
    script:
      "Zairon solves this by replacing manual guesswork with automated mathematical proof and composable on-chain trust. Our dual-engine architecture combines deterministic invariant modeling with an autonomous red-team agent that actively attacks contract forks in an E-V-M sandbox. Crucially, Zairon anchors every audit directly on Mow-nad testnet at zero-x-B-d-two-four, providing the Guarded By Zairon modifier so protocols can programmatically enforce audit status before executing transactions.",
  },
  {
    id: "technology",
    badge: "Capital Protection",
    title: "Guarding $100B in Protocol Capital",
    subtitle: "Automated mathematical verification of the 5 fatal vulnerability classes causing 92% of all DeFi exploits.",
    category: "Product",
    script:
      "Instead of generic syntax linting, Zairon focuses on the critical economic invariants that protect protocol capital. We automatically verify collateral solvency, share dilution, oracle manipulation, reentrancy guards, and proxy storage layouts. These five vulnerability classes account for ninety-two percent of all capital stolen in DeFi. By verifying these invariants mathematically, protocols protect their T-V-L before risking customer funds.",
  },
  {
    id: "human-review",
    badge: "Prover Advantage",
    title: "Proof Over Prediction: Zero Noise Tax",
    subtitle: "Generic AI linters produce 80%+ false positive alerts. Zyron proves exploit viability before reporting it.",
    category: "Product",
    script:
      "The biggest hidden cost in Web3 security is false-positive noise. Generic linters flood engineering teams with eighty percent false alarms, wasting weeks of developer time. Zairon introduces proof over prediction: our red-team agent acts as an autonomous adversary, synthesizing multi-step flash loan exploits in an E-V-M sandbox. Every confirmed vulnerability includes an executable Foundry test suite dot-t-dot-sol. If an exploit cannot be mathematically proven, it is discarded—guaranteeing zero false positives.",
  },
  {
    id: "attestation",
    badge: "The On-Chain Moat",
    title: "GuardedByZyron: Composable Runtime Security",
    subtitle: "Live on Monad Testnet: Soulbound ERC-721 Security Seals, Bytecode Proofs, and On-Chain Gatekeeping.",
    category: "Product",
    script:
      "Zairon creates an on-chain commercial moat through our attestation registry on Mow-nad testnet. We link the exact compiled bytecode hash and findings Merkle root to a non-transferable Soulbound E-R-C seven-twenty-one security seal. Through our Guarded By Zairon developer primitive, DeFi vaults and lending pools can gate interactions on-chain using onlyAttestedTarget. This creates a powerful network effect: to integrate with leading protocols, third-party contracts must be attested by Zairon.",
  },
  {
    id: "how-it-works",
    badge: "Customer Journey",
    title: "10x Faster Time-to-Market: 48-Hour Workflow",
    subtitle: "Replacing the 8-week manual consulting ordeal with an automated 48-hour audit and attestation pipeline.",
    category: "Product",
    script:
      "Our delivery model accelerates protocol time-to-market by ten-x. Traditional firms require six to eight weeks of waiting and back-and-forth email reviews. Zairon processes contract code in forty-eight to seventy-two hours: our dual AI engines perform invariant analysis and active attack proving in four hours, senior auditors verify traces and sign off via biometric P two fifty-six passkeys in twenty-four hours, and immutable on-chain attestations deploy instantly.",
  },
  {
    id: "market",
    badge: "Market Opportunity",
    title: "$3.5B Market Opportunity & AI Agent Boom",
    subtitle: "10,000 TPS parallel EVM throughput meets machine-speed autonomous AI agent contract deployment.",
    category: "Market",
    script:
      "The smart contract security market is expanding into a three point five billion dollar industry. High-throughput parallel execution on Mow-nad is accelerating contract deployments, while the rise of autonomous AI agents on E-R-C eight thousand and four creates unprecedented demand for machine-speed security validation. AI agents deploying code at machine speed cannot wait six weeks for a human review. They require real-time, programmatic on-chain trust.",
  },
  {
    id: "business-model",
    badge: "Business Model",
    title: "High-Margin Recurring Revenue Model",
    subtitle: "Fixed-price audit engagements ($10k-$25k) + continuous CI/CD PR subscriptions ($1.5k-$4.5k/mo ARR) at 85% gross margins.",
    category: "Business",
    script:
      "We operate a high-margin hybrid commercial model: charging fixed audit fees of ten to twenty-five thousand dollars, alongside recurring monthly subscriptions of fifteen hundred to forty-five hundred dollars for continuous C-I C-D pull-request scanning and attestation maintenance. Because our AI automates ninety percent of the upfront verification, Zairon operates at eighty-five percent gross margins compared to thirty-five percent for legacy consulting firms.",
  },
  {
    id: "competition",
    badge: "Competitive Advantage",
    title: "Defensible Edges Over Legacy Firms & Linters",
    subtitle: "48h speed, 70% cost reduction, zero false positives, and composable on-chain runtime protection.",
    category: "Business",
    script:
      "Against legacy firms like CertiK and OpenZeppelin, Zairon delivers in forty-eight hours instead of six weeks at seventy percent lower cost, while replacing unlinked P-D-Fs with on-chain bytecode proof. Against static linters like Slither, Zairon eliminates the eighty percent noise tax with executable Foundry exploit proofs. Zairon is the only solution offering on-chain runtime protection through Guarded By Zairon and machine-speed validation for autonomous AI agents.",
  },
  {
    id: "roadmap",
    badge: "Strategic Roadmap",
    title: "Verified Execution & Future Implementations",
    subtitle: "Live on Monad Testnet (Chain ID 10143) scaling to $1.2M ARR on Mainnet alongside design partner protocols.",
    category: "Traction",
    script:
      "We are already live on Mow-nad testnet at zero-x-B-d-two-four with gas-sponsored relaying, our dual-engine prover, and the Guarded By Zairon modifier. In the fourth quarter, we are onboarding our first ten design partner protocols and launching our continuous GitHub C-I C-D bot. By the first half of twenty-twenty-seven, we are targeting one point two million dollars in annual recurring revenue across thirty-five protocols alongside Mow-nad mainnet.",
  },
  {
    id: "vision",
    badge: "Future & Expansion",
    title: "Future Implementations & Ecosystem Expansions",
    subtitle: "ERC-8004 Agent Trust, Parallel Mempool Guard Rails, Cross-Chain Relays, and Staked Verifier Networks.",
    category: "Vision",
    script:
      "Looking ahead, Zairon is implementing four transformative expansions. First, our E-R-C eight-thousand-and-four protocol enables autonomous A-I agents to verify contract safety onchain before executing trades. Second, Mow-nad parallel mempool guard rails intercept invariant-breaking exploits before block finalization. Third, cross-chain attestation relays bridge verified proofs to Ethereum and layer-twos. And fourth, a decentralized staked verifier network unlocks automated bug bounty escrow payouts. We invite partners and investors to build this standard with us.",
  },
];

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = React.useState<number>(0);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [isOverviewOpen, setIsOverviewOpen] = React.useState<boolean>(false);
  const [isAfricanVoiceGuideOpen, setIsAfricanVoiceGuideOpen] = React.useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = React.useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = React.useState<boolean>(false);
  const [currentCaption, setCurrentCaption] = React.useState<string>("");
  const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = React.useState<string>("");
  const [hasAfricanVoice, setHasAfricanVoice] = React.useState<boolean>(false);
  const deckContainerRef = React.useRef<HTMLDivElement>(null);
  const selectedVoiceRef = React.useRef<SpeechSynthesisVoice | null>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  const totalSlides = SLIDES_META.length;

  // Helper to check if a voice is African
  const isAfricanVoice = (v: SpeechSynthesisVoice) => {
    const lang = v.lang.toLowerCase();
    const name = v.name.toLowerCase();
    return (
      lang.includes("ng") ||
      lang.includes("za") ||
      lang.includes("gh") ||
      lang.includes("ke") ||
      lang.includes("tz") ||
      lang.includes("ug") ||
      lang.includes("zw") ||
      name.includes("nigeria") ||
      name.includes("south africa") ||
      name.includes("ghana") ||
      name.includes("kenya") ||
      name.includes("tanzania") ||
      name.includes("uganda") ||
      name.includes("zimbabwe") ||
      name.includes("africa") ||
      name.includes("ekaette") ||
      name.includes("lesedi") ||
      name.includes("wanjiku") ||
      name.includes("sibusiso") ||
      name.includes("lwandle")
    );
  };

  // Helper to test if a voice is female
  const isFemaleVoice = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    return (
      name.includes("female") ||
      name.includes("voice 2") ||
      name.includes("samantha") ||
      name.includes("victoria") ||
      name.includes("karen") ||
      name.includes("moira") ||
      name.includes("fiona") ||
      name.includes("veena") ||
      name.includes("kate") ||
      name.includes("serena") ||
      name.includes("tessa") ||
      name.includes("allison") ||
      name.includes("ava") ||
      name.includes("susan") ||
      name.includes("stephanie") ||
      name.includes("ekaette") ||
      (name.includes("siri") && !name.includes("voice 1"))
    );
  };

  // Helper to test if a voice is male
  const isMaleVoice = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    if (isFemaleVoice(v)) return false;
    return (
      name.includes("male") ||
      name.includes("voice 1") ||
      name.includes("daniel") ||
      name.includes("george") ||
      name.includes("arthur") ||
      name.includes("david") ||
      name.includes("aaron") ||
      name.includes("marcus") ||
      name.includes("alex") ||
      name.includes("bruce") ||
      name.includes("fred") ||
      name.includes("oliver") ||
      name.includes("thomas") ||
      name.includes("gordon") ||
      name.includes("rishi") ||
      name.includes("tariq") ||
      name.includes("lesedi") ||
      name.includes("sibusiso") ||
      name.includes("lwandle")
    );
  };

  // Initialize SpeechSynthesis voice selection prioritizing strong male African & English voices
  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Sort Male & African voices first
        const sorted = [...voices].sort((a, b) => {
          const aAfMale = isAfricanVoice(a) && isMaleVoice(a);
          const bAfMale = isAfricanVoice(b) && isMaleVoice(b);
          if (aAfMale && !bAfMale) return -1;
          if (!aAfMale && bAfMale) return 1;

          const aMale = isMaleVoice(a);
          const bMale = isMaleVoice(b);
          if (aMale && !bMale) return -1;
          if (!aMale && bMale) return 1;

          return 0;
        });

        setAvailableVoices(sorted);

        const africanFound = voices.some((v) => isAfricanVoice(v));
        setHasAfricanVoice(africanFound);

        const preferredVoice =
          // 1. Male African voice (e.g. South Africa Siri Voice 1, Sibusiso, Google Nigeria Male)
          voices.find((v) => isAfricanVoice(v) && isMaleVoice(v)) ||
          // 2. Male English voice (e.g. Daniel, Arthur, Alex, Fred, George, David)
          voices.find((v) => v.lang.startsWith("en") && isMaleVoice(v)) ||
          // 3. Any Male voice
          voices.find((v) => isMaleVoice(v)) ||
          // 4. Any African voice (fallback only if no male voice exists)
          voices.find((v) => isAfricanVoice(v)) ||
          voices[0];

        if (preferredVoice) {
          selectedVoiceRef.current = preferredVoice;
          setSelectedVoiceURI(preferredVoice.voiceURI);
        }
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Format script for teleprompter display (reverting phonetic spellings for visual reading)
  const formatCaptionForDisplay = (text: string) => {
    return text
      .replace(/Zairon/g, "Zyron")
      .replace(/Zai-ron/g, "Zyron")
      .replace(/Mow-nad/g, "Monad")
      .replace(/E-R-C eight-thousand-and-four/g, "ERC-8004")
      .replace(/E-R-C eight thousand and four/g, "ERC-8004")
      .replace(/E-R-C seven-twenty-one/g, "ERC-721")
      .replace(/A-S-T/g, "AST")
      .replace(/E-I-P seven twelve/g, "EIP-712")
      .replace(/S-H-A two fifty-six/g, "SHA-256")
      .replace(/P two fifty-six/g, "P-256")
      .replace(/E-V-M/g, "EVM")
      .replace(/T-V-L/g, "TVL")
      .replace(/T-P-S/g, "TPS")
      .replace(/A-R-R/g, "ARR")
      .replace(/C-I C-D/g, "CI/CD")
      .replace(/ten-x/g, "10x")
      .replace(/P-D-Fs/g, "PDFs")
      .replace(/P-D-F/g, "PDF")
      .replace(/P-o-Cs/g, "PoCs")
      .replace(/P-o-C/g, "PoC")
      .replace(/dot-t-dot-sol/g, ".t.sol")
      .replace(/A-I/g, "AI")
      .replace(/layer-twos/g, "Layer-2s")
      .replace(/zero-x-B-d-two-four/g, "0xBd24...");
  };

  // Function to handle speaking current slide presentation script (with MP3 audio file support)
  const speakCurrentSlide = React.useCallback(
    (slideIndex: number, autoAdvance: boolean) => {
      if (typeof window === "undefined") return;

      // Stop any existing audio or Web Speech
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (!isVoiceEnabled) {
        setIsSpeaking(false);
        setCurrentCaption("");
        return;
      }

      const slide = SLIDES_META[slideIndex];
      if (!slide || !slide.script) return;

      const fallbackWebSpeech = () => {
        if (!("speechSynthesis" in window)) return;
        const utterance = new SpeechSynthesisUtterance(slide.script);
        utterance.rate = 1.08;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const activeVoice =
          (selectedVoiceURI && voices.find((v) => v.voiceURI === selectedVoiceURI)) ||
          selectedVoiceRef.current ||
          voices.find((v) => isAfricanVoice(v) && isMaleVoice(v)) ||
          voices.find((v) => isMaleVoice(v) && v.lang.startsWith("en")) ||
          voices.find((v) => isMaleVoice(v)) ||
          voices[0];

        if (activeVoice) utterance.voice = activeVoice;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setCurrentCaption(formatCaptionForDisplay(slide.script));
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          if (autoAdvance && slideIndex < totalSlides - 1) {
            setCurrentSlide((prev) => prev + 1);
          } else if (slideIndex === totalSlides - 1) {
            setIsAutoPlaying(false);
          }
        };

        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      };

      // Try pre-rendered studio MP3 audio file if present
      const mp3Url = `/audio/pitchdeck/slide-${slideIndex + 1}.mp3`;
      const audio = new Audio(mp3Url);

      audio.oncanplaythrough = () => {
        audioPlayerRef.current = audio;
        setIsSpeaking(true);
        setCurrentCaption(formatCaptionForDisplay(slide.script));
        audio.play().catch(() => fallbackWebSpeech());
        audio.onended = () => {
          setIsSpeaking(false);
          if (autoAdvance && slideIndex < totalSlides - 1) {
            setCurrentSlide((prev) => prev + 1);
          } else if (slideIndex === totalSlides - 1) {
            setIsAutoPlaying(false);
          }
        };
      };

      audio.onerror = () => {
        fallbackWebSpeech();
      };
    },
    [isVoiceEnabled, selectedVoiceURI, totalSlides]
  );

  // Playback effect when slide changes or autoplay is toggled
  React.useEffect(() => {
    if (isAutoPlaying) {
      speakCurrentSlide(currentSlide, true);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setCurrentCaption("");
    }
  }, [currentSlide, isAutoPlaying, speakCurrentSlide]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  const handleStartPresentation = () => {
    setCurrentSlide(0);
    setIsAutoPlaying(true);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        if (isAfricanVoiceGuideOpen) setIsAfricanVoiceGuideOpen(false);
      } else if (e.key === "o" || e.key === "O" || e.key === "g" || e.key === "G") {
        e.preventDefault();
        setIsOverviewOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isOverviewOpen, isAfricanVoiceGuideOpen]);

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
        "min-h-screen bg-bg-void text-text-primary flex flex-col justify-between selection:bg-accent-scan/30 relative overflow-hidden font-sans border-hairline",
        isFullscreen ? "h-screen w-screen p-4 sm:p-8" : "p-3 sm:p-6 md:p-8"
      )}
    >
      {/* Structural Hairline Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#262B33_1px,transparent_1px),linear-gradient(to_bottom,#262B33_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-20 -z-10" />

      {/* Top Deck Navigation Bar */}
      <header className="flex items-center justify-between gap-4 pb-4 border-b border-border-hairline shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
            title="Return to Zyron Portal"
          >
            <div className="h-8 w-8 rounded bg-bg-panel border border-border-hairline flex items-center justify-center text-accent-scan group-hover:border-accent-scan/50 transition-colors">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold text-xs tracking-wider text-text-primary flex items-center gap-2">
                ZYRON <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bg-panel-raised text-accent-scan border border-border-hairline">FOUNDER PITCH DECK</span>
              </span>
              <span className="text-[10px] text-text-muted font-mono hidden sm:inline">Cryptographic Protocol Security</span>
            </div>
          </Link>
        </div>

        {/* Center Pill: Current Slide & Title */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-bg-panel border border-border-hairline text-xs font-mono">
          <span className="text-accent-scan font-bold">
            SLIDE {String(currentSlide + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </span>
          <span className="text-text-muted">•</span>
          <span className="text-text-primary truncate max-w-xs">{SLIDES_META[currentSlide].title}</span>
          <span className="text-text-muted">•</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-panel-raised text-signal-resolved border border-border-hairline">⏱️ ~3m 45s Pitch</span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* African Voice Guide Button if no African voice detected */}
          {!hasAfricanVoice && (
            <button
              type="button"
              onClick={() => setIsAfricanVoiceGuideOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-panel border border-accent-scan/40 hover:border-accent-scan text-accent-scan font-mono text-xs transition-colors cursor-pointer"
              title="How to enable African system voice on macOS or Chrome"
            >
              <span>🌍 Add African Voice</span>
              <HelpCircle className="h-3 w-3" />
            </button>
          )}

          {/* System Voice Selection Dropdown */}
          {availableVoices.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-bg-panel border border-border-hairline">
              <User className="h-3.5 w-3.5 text-accent-scan shrink-0" />
              <select
                value={selectedVoiceURI}
                onChange={(e) => {
                  const uri = e.target.value;
                  setSelectedVoiceURI(uri);
                  const voice = availableVoices.find((v) => v.voiceURI === uri);
                  if (voice) {
                    selectedVoiceRef.current = voice;
                    if (isAutoPlaying) {
                      speakCurrentSlide(currentSlide, true);
                    }
                  }
                }}
                className="bg-transparent text-text-primary text-xs font-mono border-none outline-none max-w-[150px] truncate cursor-pointer"
                title="Select Presentation Voice"
              >
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI} className="bg-bg-panel text-text-primary">
                    {isAfricanVoice(v) ? (v.lang.toLowerCase().includes("za") ? "🇿🇦 " : "🇳🇬 ") : ""}{v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Voiceover Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextVoiceState = !isVoiceEnabled;
              setIsVoiceEnabled(nextVoiceState);
              if (!nextVoiceState && typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setCurrentCaption("");
              }
            }}
            className={cn(
              "px-2.5 py-1.5 rounded text-xs font-mono border transition-colors flex items-center gap-1.5 cursor-pointer",
              isVoiceEnabled
                ? "bg-bg-panel-raised border-accent-scan/50 text-accent-scan"
                : "bg-bg-panel border-border-hairline text-text-muted hover:text-text-primary"
            )}
            title={isVoiceEnabled ? "Voiceover Audio Enabled" : "Voiceover Audio Muted"}
          >
            {isVoiceEnabled ? <Volume2 className="h-3.5 w-3.5 text-accent-scan" /> : <VolumeX className="h-3.5 w-3.5 text-text-muted" />}
            <span className="hidden sm:inline font-mono text-[11px]">{isVoiceEnabled ? "Voice On" : "Muted"}</span>
          </button>

          {/* Auto Presentation Play/Pause */}
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-mono border transition-colors flex items-center gap-1.5 cursor-pointer font-bold",
              isAutoPlaying
                ? "bg-bg-panel-raised border-signal-resolved text-signal-resolved"
                : "bg-accent-scan text-bg-void border-accent-scan hover:bg-accent-scan/90"
            )}
            title="Auto-Present Deck with Investor Audio Presentation"
          >
            {isAutoPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-bg-void" />}
            <span>{isAutoPlaying ? "Pause Presentation" : "Play Presentation"}</span>
          </button>

          {/* Slide Overview Toggle */}
          <button
            type="button"
            onClick={() => setIsOverviewOpen(!isOverviewOpen)}
            className={cn(
              "px-2.5 py-1.5 rounded text-xs font-mono border transition-colors flex items-center gap-1.5 cursor-pointer",
              isOverviewOpen
                ? "bg-bg-panel-raised border-accent-scan text-accent-scan"
                : "bg-bg-panel border-border-hairline text-text-muted hover:text-text-primary"
            )}
            title="Slide Overview (Press 'O' or 'G')"
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-bg-panel border border-border-hairline text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title="Fullscreen Toggle (Press 'F')"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Print / Save Deck */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-1.5 rounded bg-bg-panel border border-border-hairline text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title="Print or Save Deck (PDF)"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </header>


      {/* Main Slide Presentation Stage */}
      <main className="flex-1 flex flex-col justify-center items-center py-6 sm:py-8 max-w-5xl w-full mx-auto relative z-10">
        <div className="w-full transition-all duration-200">
          {currentSlide === 0 && <SlideCover onNext={nextSlide} onStart={handleStartPresentation} />}
          {currentSlide === 1 && <SlideProblem />}
          {currentSlide === 2 && <SlideSolution />}
          {currentSlide === 3 && <SlideTechnology />}
          {currentSlide === 4 && <SlideHumanReview />}
          {currentSlide === 5 && <SlideAttestation />}
          {currentSlide === 6 && <SlideHowItWorks />}
          {currentSlide === 7 && <SlideMarket />}
          {currentSlide === 8 && <SlideBusinessModel />}
          {currentSlide === 9 && <SlideCompetition />}
          {currentSlide === 10 && <SlideRoadmap />}
          {currentSlide === 11 && <SlideVision onRestart={() => handleStartPresentation()} />}
        </div>
      </main>

      {/* Bottom Deck Navigation Bar */}
      <footer className="shrink-0 pt-4 border-t border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        {/* Progress Bar & Indicators */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-xs font-mono text-text-muted">
            <span className="text-text-primary font-bold">{String(currentSlide + 1).padStart(2, "0")}</span>
            <span className="text-text-muted"> / {String(totalSlides).padStart(2, "0")}</span>
          </div>
          <div className="h-1.5 w-32 sm:w-48 bg-bg-panel border border-border-hairline rounded-none overflow-hidden">
            <div
              className="h-full bg-accent-scan transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-text-muted uppercase hidden md:inline">
            [{SLIDES_META[currentSlide].category}]
          </span>
        </div>

        {/* Keyboard Shortcuts Tip */}
        <div className="text-[11px] font-mono text-text-muted hidden lg:flex items-center gap-2">
          <span>Navigation:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-bg-panel border border-border-hairline text-[10px] font-mono text-text-primary">
            ←
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-bg-panel border border-border-hairline text-[10px] font-mono text-text-primary">
            →
          </kbd>
          <span>or</span>
          <kbd className="px-1.5 py-0.5 rounded bg-bg-panel border border-border-hairline text-[10px] font-mono text-text-primary">
            Space
          </kbd>
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end font-mono">
          <button
            type="button"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded text-xs bg-bg-panel hover:bg-bg-panel-raised disabled:opacity-30 disabled:pointer-events-none border border-border-hairline text-text-primary transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Prev</span>
          </button>
          <button
            type="button"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded text-xs bg-accent-scan text-bg-void hover:bg-accent-scan/90 disabled:opacity-30 disabled:pointer-events-none font-bold transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {/* Grid Overview Modal */}
      {isOverviewOpen && (
        <div className="fixed inset-0 z-50 bg-bg-void/95 backdrop-blur-sm flex flex-col p-4 sm:p-8 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-border-hairline max-w-5xl mx-auto w-full">
            <div>
              <h2 className="font-mono text-lg font-bold text-text-primary">DECK OVERVIEW</h2>
              <p className="text-xs text-text-muted">Select a slide to jump directly to its content</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOverviewOpen(false)}
              className="px-3 py-1.5 rounded bg-bg-panel border border-border-hairline hover:bg-bg-panel-raised text-xs font-mono text-text-primary transition-colors cursor-pointer"
            >
              Close (Esc)
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SLIDES_META.map((meta, idx) => (
              <button
                key={meta.id}
                type="button"
                onClick={() => jumpToSlide(idx)}
                className={cn(
                  "text-left p-3.5 rounded border transition-colors flex flex-col justify-between h-32 group cursor-pointer font-sans",
                  idx === currentSlide
                    ? "bg-bg-panel-raised border-accent-scan text-text-primary"
                    : "bg-bg-panel border-border-hairline hover:border-text-muted text-text-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent-scan">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-void text-text-muted border border-border-hairline">
                    {meta.category}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-xs text-text-primary line-clamp-1 group-hover:text-accent-scan transition-colors">
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

      {/* African Voice Guide Modal */}
      {isAfricanVoiceGuideOpen && (
        <div className="fixed inset-0 z-50 bg-bg-void/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-bg-panel border border-border-hairline max-w-lg w-full rounded p-6 space-y-4 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="flex items-center gap-2 text-accent-scan font-bold text-sm">
                <span>🇿🇦 HOW TO ENABLE AFRICAN SYSTEM VOICE ON MAC</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAfricanVoiceGuideOpen(false)}
                className="text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs text-text-muted leading-relaxed">
              <p className="text-text-primary">
                On macOS, Apple provides <strong>English (South Africa)</strong> voices directly in system settings:
              </p>

              <div className="p-3 rounded bg-bg-panel-raised border border-border-hairline space-y-2 font-mono text-[11px]">
                <div className="text-accent-scan font-bold"> On macOS (Mac):</div>
                <ol className="list-decimal list-inside space-y-1 text-text-primary">
                  <li>Open <strong>System Settings → Accessibility</strong></li>
                  <li>Click <strong>Spoken Content → System Voice</strong></li>
                  <li>Select <strong>Manage Voices...</strong></li>
                  <li>Scroll to <strong>English (South Africa)</strong></li>
                  <li>Click the cloud download icon for <strong>Voice 1</strong> (Male) or <strong>Voice 2 / Tessa</strong>!</li>
                </ol>
              </div>

              <div className="p-3 rounded bg-bg-panel-raised border border-border-hairline space-y-2 font-mono text-[11px]">
                <div className="text-accent-scan font-bold">🌐 On Google Chrome:</div>
                <p className="text-text-primary">
                  Google Chrome includes <strong>Google English (Nigeria)</strong> and <strong>Google English (South Africa)</strong> automatically in the voice selector dropdown above!
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAfricanVoiceGuideOpen(false)}
                className="px-4 py-2 rounded bg-accent-scan text-bg-void font-bold cursor-pointer"
              >
                Got It!
              </button>
            </div>
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
function SlideCover({ onNext, onStart }: { onNext: () => void; onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-4 max-w-4xl mx-auto">
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-bg-panel border border-accent-scan/40 text-accent-scan text-xs font-mono">
        <Sparkles className="h-3.5 w-3.5" />
        <span>MONAD METROPOLIS • TRUST, IDENTITY & DATA OWNERSHIP FOR AI</span>
      </div>

      {/* Hero Headline */}
      <div className="space-y-3">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight">
          ZYRON: ON-CHAIN <span className="text-accent-scan">TRUST PRIMITIVE</span>
        </h1>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-3xl mx-auto font-sans">
          Transforming Web3 smart contract security from a 6-week, $100k manual consulting bottleneck into 48-hour automated mathematical proof and composable on-chain trust on Monad.
        </p>
      </div>

      {/* Monad Testnet Live Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-signal-resolved/10 border border-signal-resolved/30 text-signal-resolved text-xs font-mono">
        <span className="h-2 w-2 rounded-full bg-signal-resolved animate-pulse" />
        <span className="font-bold">LIVE ON MONAD TESTNET (CHAIN ID 10143)</span>
        <span className="text-text-muted">•</span>
        <span className="text-text-primary">0xBd24...9c4D3</span>
        <span className="text-text-muted">•</span>
        <span className="text-accent-scan font-bold">GAS SPONSORED</span>
      </div>

      {/* 4 Differentiators Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-1">
        {[
          { label: "48-Hour Turnaround", desc: "vs. 4–8 week industry waitlist", icon: Clock, highlight: "10x Faster" },
          { label: "70% Cost Reduction", desc: "$10k–$25k vs. $50k–$150k quotes", icon: DollarSign, highlight: "SaaS Pricing" },
          { label: "0% False Positives", desc: "Foundry .t.sol exploit proofs", icon: ShieldCheck, highlight: "No Noise Tax" },
          { label: "Composable Moat", desc: "GuardedByZyron.sol on Monad", icon: Lock, highlight: "Runtime Guard" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded bg-bg-panel border border-border-hairline text-left space-y-1.5 hover:border-accent-scan/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="h-7 w-7 rounded bg-bg-panel-raised text-accent-scan flex items-center justify-center border border-border-hairline">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-scan/10 text-accent-scan font-bold">
                  {item.highlight}
                </span>
              </div>
              <div className="font-mono text-xs font-bold text-text-primary">{item.label}</div>
              <div className="text-[11px] text-text-muted">{item.desc}</div>
            </div>
          );
        })}
      </div>

      {/* CTA Buttons */}
      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-accent-scan text-bg-void font-mono font-bold text-xs hover:bg-accent-scan/90 transition-colors cursor-pointer"
        >
          <Play className="h-4 w-4 fill-bg-void" />
          <span>PLAY LIVE PRESENTATION</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-bg-panel border border-border-hairline text-text-primary font-mono text-xs hover:bg-bg-panel-raised transition-colors cursor-pointer"
        >
          <span>MANUAL SLIDES</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// --- SLIDE 2: PROBLEM ---
function SlideProblem() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SlideHeader
        badge="Slide 2 – The Problem"
        title="The $1.8B Web3 Security Bottleneck"
        description="Smart contracts secure over $100B in value, yet Web3 security remains trapped between noisy linters, slow $50k+ manual audits, and unlinked PDFs:"
      />

      {/* Key Problems Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-signal-high font-bold">PROBLEM 01</span>
            <AlertTriangle className="h-4 w-4 text-signal-high" />
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">The $1.8B Exploit Epidemic</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Immunefi loss reports document over <strong className="text-text-primary">$1.8B stolen annually</strong> across DeFi. In <strong className="text-text-primary">over 70% of major exploits</strong>, the protocol had already completed an audit. Static audits fail to protect protocol TVL.
          </p>
        </div>

        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-signal-high font-bold">PROBLEM 02</span>
            <Clock className="h-4 w-4 text-signal-high" />
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">4–8 Week Launch Freeze & Capital Burn</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Legacy consulting firms (CertiK, Trail of Bits, OpenZeppelin) quote <strong className="text-text-primary">$50,000 to $150,000+</strong> with 4-to-8 week waitlists. Fast-moving protocols burn runway and miss crucial go-to-market windows.
          </p>
        </div>

        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-signal-high font-bold">PROBLEM 03</span>
            <ShieldAlert className="h-4 w-4 text-signal-high" />
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">The $15,000 Alert Noise Tax</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Generic static linters average <strong className="text-text-primary">60% to 85% false positive alerts</strong>. Engineering teams waste over 100 dev hours (~$15,000 in payroll) per audit chasing harmless syntax flags without execution context.
          </p>
        </div>

        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-signal-high font-bold">PROBLEM 04</span>
            <FileText className="h-4 w-4 text-signal-high" />
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">The Disconnected PDF Trust Gap</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Audits produce static PDF reports with zero cryptographic link to deployed bytecode. Protocols say &ldquo;we were audited,&rdquo; but users, smart contracts, and AI agents cannot verify the claim on-chain.
          </p>
        </div>
      </div>

      {/* Result Callout */}
      <div className="p-3.5 rounded bg-bg-panel-raised border border-signal-critical/40 flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-signal-critical/10 text-signal-critical flex items-center justify-center shrink-0 border border-signal-critical/20">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="font-mono text-xs">
          <span className="text-signal-critical font-bold">The Monad Speed Mismatch: </span>
          <span className="text-text-primary font-sans">On 10,000 TPS parallel EVMs and in the ERC-8004 AI agent economy, contracts deploy and compose in seconds. Human consulting cannot scale to machine speed.</span>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 3: SOLUTION ---
function SlideSolution() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SlideHeader
        badge="Slide 3 – The Solution"
        title="Automated Proof & Composable On-Chain Trust"
        description="Zyron replaces manual guesswork with dual-engine AI invariant verification, autonomous red-team proving, and on-chain trust primitives:"
      />

      {/* 3 Solution Layers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4.5 rounded bg-bg-panel border border-border-hairline space-y-3 hover:border-accent-scan/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-accent-scan">LAYER 01</span>
            <Scale className="h-4 w-4 text-accent-scan" />
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">Deterministic Invariant Modeling</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Evaluates protocol economic invariants (collateral solvency, share dilution, oracle bounds) in minutes—replacing subjective guesswork with mathematical formal verification.
          </p>
          <div className="pt-2 border-t border-border-hairline text-[11px] font-mono text-accent-scan">
            Deterministic Formal Checks
          </div>
        </div>

        <div className="p-4.5 rounded bg-bg-panel border border-border-hairline space-y-3 hover:border-accent-scan/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-accent-scan">LAYER 02</span>
            <Cpu className="h-4 w-4 text-accent-scan" />
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">Autonomous Red-Team Prover</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            <code className="text-accent-scan">zyron-agent</code> forks EVM state via Anvil, synthesizes multi-step flash loan exploits, and produces executable Foundry <code className="text-accent-scan">.t.sol</code> proofs. 0% false positives.
          </p>
          <div className="pt-2 border-t border-border-hairline text-[11px] font-mono text-signal-resolved">
            Runnable Foundry Exploit PoCs
          </div>
        </div>

        <div className="p-4.5 rounded bg-bg-panel border border-border-hairline space-y-3 hover:border-accent-scan/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-accent-scan">LAYER 03</span>
            <FileCheck2 className="h-4 w-4 text-accent-scan" />
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">Composable On-Chain Trust</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Live on Monad Testnet (<code className="text-accent-scan">0xBd24...</code>): registers bytecode hashes, mints Soulbound ERC-721 seals, and enables <code className="text-accent-scan">GuardedByZyron.sol</code> runtime gating.
          </p>
          <div className="pt-2 border-t border-border-hairline text-[11px] font-mono text-text-primary">
            On-Chain Runtime Protection
          </div>
        </div>
      </div>

      {/* Bottom Summary Banner */}
      <div className="p-3.5 rounded bg-bg-panel border border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        <span className="text-text-muted">From Subjective Opinion to Cryptographic Proof:</span>
        <span className="text-accent-scan font-bold">Immutable proof lives on Monad, not buried in a static PDF.</span>
      </div>
    </div>
  );
}

// --- SLIDE 4: CAPITAL PROTECTION (WHAT WE PROTECT) ---
function SlideTechnology() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SlideHeader
        badge="Slide 4 – Capital Protection"
        title="Guarding $100B in Protocol Capital"
        description="Automated mathematical verification of the 5 fatal vulnerability classes causing 92% of all DeFi exploit losses:"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pass List with Loss Stats */}
        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-3">
          <div className="font-mono text-xs font-bold text-accent-scan flex items-center justify-between border-b border-border-hairline pb-2">
            <span>FATAL VULNERABILITY VECTORS</span>
            <span>HISTORICAL LOSSES</span>
          </div>
          <div className="grid grid-cols-1 gap-2 font-mono text-xs text-text-primary">
            {[
              { name: "1. Collateral Solvency & Bad Debt", loss: "$850M+", detail: "Liquidation math, LTV invariants & oracle arbitrage" },
              { name: "2. Share Dilution & Inflation Attacks", loss: "$210M+", detail: "ERC-4626 vault inflation & rounding precision flaws" },
              { name: "3. Oracle Manipulation & TWAP Staleness", loss: "$430M+", detail: "Flash loan spot skew & multi-hop heartbeat staleness" },
              { name: "4. Reentrancy & State Ordering Faults", loss: "$320M+", detail: "CEI violations & cross-function read-write races" },
              { name: "5. Storage Collisions & Upgrade Drift", loss: "$180M+", detail: "Proxy storage slot alignment & uninitialized logic" },
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-text-primary">{item.name}</span>
                  <span className="text-signal-high">{item.loss}</span>
                </div>
                <div className="text-[10px] text-text-muted font-sans">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Capital Preservation Metrics Card */}
        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-3 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] text-text-muted border-b border-border-hairline pb-2">
              <span className="flex items-center gap-1.5 text-accent-scan font-bold">
                <Target className="h-3.5 w-3.5" /> CAPITAL PRESERVATION METRICS
              </span>
              <span className="text-signal-resolved font-bold">DETERMINISTIC</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-3">
              <div className="p-3 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
                <div className="text-2xl font-bold font-display text-accent-scan">92%</div>
                <div className="text-[11px] text-text-muted leading-tight font-sans">
                  Of historical DeFi exploit vectors deterministically covered
                </div>
              </div>
              <div className="p-3 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
                <div className="text-2xl font-bold font-display text-signal-resolved">100%</div>
                <div className="text-[11px] text-text-muted leading-tight font-sans">
                  Reported vulnerabilities verified via sandbox execution
                </div>
              </div>
              <div className="p-3 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
                <div className="text-2xl font-bold font-display text-text-primary">4h</div>
                <div className="text-[11px] text-text-muted leading-tight font-sans">
                  Automated invariant pass runtime vs. 3 weeks manual reading
                </div>
              </div>
              <div className="p-3 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
                <div className="text-2xl font-bold font-display text-accent-scan">$0</div>
                <div className="text-[11px] text-text-muted leading-tight font-sans">
                  Developer gas fee (fully sponsored by Zyron relayer)
                </div>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded bg-bg-void border border-border-hairline space-y-1 text-[11px]">
              <div className="text-signal-resolved font-bold flex items-center gap-1.5">
                <Check className="h-3 w-3" /> FORMAL VERIFICATION GUARANTEE
              </div>
              <p className="text-text-muted text-[10px] font-sans leading-relaxed">
                If an invariant mathematically holds across fuzz runs, the code is provably protected against that exploit vector. No subjective guesswork.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border-hairline text-[11px] text-text-muted font-sans">
            Guarding protocol TVL before contracts touch mainnet liquidity.
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 5: PROVER ADVANTAGE (PROOF OVER PREDICTION) ---
function SlideHumanReview() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SlideHeader
        badge="Slide 5 – Prover Advantage"
        title="Proof Over Prediction: Zero Noise Tax"
        description="Generic AI linters produce 80%+ false positive alerts. Zyron proves exploit viability before reporting it:"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: The Linter Problem */}
        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-3">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <span className="font-mono text-xs font-bold text-signal-critical flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> STATIC PREDICTION (LINTERS)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-signal-critical/10 text-signal-critical font-bold">
              80%+ NOISE
            </span>
          </div>

          <ul className="space-y-2.5 text-xs font-sans text-text-muted">
            <li className="flex items-start gap-2">
              <span className="text-signal-critical font-mono font-bold shrink-0">✕</span>
              <span><strong>Regex pattern matching:</strong> Guesses syntax patterns without running the code.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-signal-critical font-mono font-bold shrink-0">✕</span>
              <span><strong>No EVM state or fork context:</strong> Cannot determine if an exploit is economically profitable.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-signal-critical font-mono font-bold shrink-0">✕</span>
              <span><strong>$15,000 alert fatigue tax:</strong> Developers waste weeks triaging harmless alerts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-signal-critical font-mono font-bold shrink-0">✕</span>
              <span><strong>Theoretical notes only:</strong> No executable test case to verify fixes.</span>
            </li>
          </ul>
        </div>

        {/* Right: The Zyron Prover */}
        <div className="p-4 rounded bg-bg-panel border border-accent-scan/50 space-y-3">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <span className="font-mono text-xs font-bold text-accent-scan flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> EMPIRICAL PROOF (ZYRON PROVER)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-signal-resolved/10 text-signal-resolved font-bold">
              0% FALSE POSITIVES
            </span>
          </div>

          <ul className="space-y-2.5 text-xs font-sans text-text-primary">
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
              <span><strong>Ephemeral EVM sandbox:</strong> Anvil microservice forks live chain state instantly.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
              <span><strong>Autonomous attack synthesis:</strong> Synthesizes flash loan capital and multi-step exploit calls.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
              <span><strong>Foundry .t.sol PoC:</strong> Every verified issue includes an executable test proving exploit viability.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
              <span><strong>P256 Biometric sign-off:</strong> Senior auditors inspect traces and sign on Monad via TouchID.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 4-Step Adversarial Pipeline */}
      <div className="p-3.5 rounded bg-bg-panel border border-border-hairline space-y-2">
        <div className="font-mono text-xs font-bold text-text-primary flex items-center justify-between">
          <span>THE ZYRON-AGENT EXPLOIT VERIFICATION PIPELINE</span>
          <span className="text-accent-scan text-[11px]">DISCARD UNPROVEN CANDIDATES</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
          <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline text-center">
            <span className="text-text-muted">1. Invariant Breach</span>
          </div>
          <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline text-center">
            <span className="text-text-muted">2. Anvil State Fork</span>
          </div>
          <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline text-center">
            <span className="text-text-muted">3. Exploit Synthesis</span>
          </div>
          <div className="p-2 rounded bg-bg-panel-raised border border-accent-scan/40 text-center text-accent-scan font-bold">
            <span>4. Foundry .t.sol PoC</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 6: THE ON-CHAIN MOAT (GUARDEDBYZYRON) ---
function SlideAttestation() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SlideHeader
        badge="Slide 6 – The On-Chain Moat"
        title="GuardedByZyron: Composable Runtime Security"
        description="Live on Monad Testnet: Soulbound ERC-721 Security Seals, Bytecode Proofs, and On-Chain Gatekeeping:"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: Monad Primitives */}
        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-3">
          <div className="font-mono text-xs font-bold text-accent-scan border-b border-border-hairline pb-2 flex items-center justify-between">
            <span>ON-CHAIN DEFENSE PRIMITIVES</span>
            <span className="text-signal-resolved font-bold">MONAD 10143</span>
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
              <div className="text-text-primary font-bold flex items-center justify-between">
                <span>1. GuardedByZyron.sol Modifier</span>
                <span className="text-[10px] text-accent-scan font-normal">Composable</span>
              </div>
              <div className="text-[10px] text-text-muted font-sans">
                DeFi vaults & lending pools use <code className="text-accent-scan font-mono">onlyAttestedTarget</code> to reject calls from unverified smart contracts.
              </div>
            </div>

            <div className="p-2.5 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
              <div className="text-text-primary font-bold flex items-center justify-between">
                <span>2. Soulbound ERC-721 Security Seal</span>
                <span className="text-[10px] text-signal-resolved font-normal">Non-Transferable</span>
              </div>
              <div className="text-[10px] text-text-muted font-sans">
                Minted directly to protocol owner wallet with IPFS report CID, findings Merkle root, and expiration date.
              </div>
            </div>

            <div className="p-2.5 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
              <div className="text-text-primary font-bold flex items-center justify-between">
                <span>3. Cryptographic Bytecode Binding</span>
                <span className="text-[10px] text-accent-scan font-normal">Tamper-Proof</span>
              </div>
              <div className="text-[10px] text-text-muted font-sans">
                SHA-256 bytecode hash registered on Monad. Any post-audit bytecode alteration breaks the attestation seal instantly.
              </div>
            </div>

            <div className="p-2.5 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
              <div className="text-text-primary font-bold flex items-center justify-between">
                <span>4. Zero-Gas Developer Sponsorship</span>
                <span className="text-[10px] text-signal-resolved font-normal">Relayed</span>
              </div>
              <div className="text-[10px] text-text-muted font-sans">
                Operator hot wallet sponsors 100% of transaction fees on Monad testnet so clients experience zero gas friction.
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Live Contract on Monad Testnet */}
        <div className="p-4 rounded bg-bg-panel border border-accent-scan/50 space-y-3 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] text-text-muted border-b border-border-hairline pb-2">
              <span className="text-accent-scan font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> LIVE ON MONAD TESTNET
              </span>
              <span className="px-1.5 py-0.5 rounded bg-signal-resolved/10 text-signal-resolved font-bold text-[10px] border border-signal-resolved/20">
                CHAIN ID 10143
              </span>
            </div>

            <div className="space-y-2 text-[11px] pt-1">
              <div>
                <div className="text-text-muted text-[10px]">Registry Contract:</div>
                <div className="text-accent-scan break-all font-bold text-[10px] select-all">
                  0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3
                </div>
              </div>
              <div>
                <div className="text-text-muted text-[10px]">Gas Sponsor Operator:</div>
                <div className="text-text-primary break-all text-[10px]">
                  0x48b106E3C8681D08c513268854Aef257883298d3
                </div>
              </div>
              <div>
                <div className="text-text-muted text-[10px]">Runtime Primitive:</div>
                <div className="text-text-primary text-[10px] font-mono">
                  GuardedByZyron.sol (onlyAttestedTarget)
                </div>
              </div>
              <div>
                <div className="text-text-muted text-[10px]">Audit Artifact:</div>
                <div className="text-text-primary text-[10px] font-mono">
                  Soulbound ERC-721 + Bytecode SHA-256
                </div>
              </div>
              <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline flex items-center justify-between text-[10px]">
                <span className="text-text-muted">Network Moat:</span>
                <span className="text-signal-resolved font-bold">B2B PROTOCOL GATEKEEPING</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border-hairline flex items-center justify-between">
            <a
              href="https://testnet.monadvision.com/address/0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent-scan hover:underline"
            >
              <span>View Contract on MonadVision</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-[10px] text-text-muted">Verified Bytecode</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 7: CUSTOMER JOURNEY (48-HOUR WORKFLOW) ---
function SlideHowItWorks() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SlideHeader
        badge="Slide 7 – Customer Journey"
        title="10x Faster Time-to-Market: 48-Hour Workflow"
        description="Replacing the 8-week manual consulting ordeal with an automated 48-hour audit and attestation pipeline:"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Legacy 8-Week Ordeal */}
        <div className="p-4 rounded bg-bg-panel border border-signal-critical/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <span className="font-bold text-signal-critical flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> LEGACY AUDIT ORDEAL (4–8 WEEKS)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-signal-critical/10 text-signal-critical">
              $50k–$150k+
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline space-y-0.5">
              <div className="text-signal-critical font-bold">Week 1: Scoping & Sales Calls</div>
              <div className="text-text-muted text-[10px] font-sans">Negotiating pricing quotes, NDAs, and waiting on auditor availability.</div>
            </div>
            <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline space-y-0.5">
              <div className="text-signal-critical font-bold">Weeks 2–4: Scheduling Backlog</div>
              <div className="text-text-muted text-[10px] font-sans">Protocol sits idle on waitlist while burning engineering runway.</div>
            </div>
            <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline space-y-0.5">
              <div className="text-signal-critical font-bold">Weeks 5–6: Manual Code Reading</div>
              <div className="text-text-muted text-[10px] font-sans">Junior auditors manually read code; subjective notes without execution proofs.</div>
            </div>
            <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline space-y-0.5">
              <div className="text-signal-critical font-bold">Weeks 7–8: Static PDF Report Delivery</div>
              <div className="text-text-muted text-[10px] font-sans">Emailed PDF report with zero cryptographic binding to on-chain bytecode.</div>
            </div>
          </div>
        </div>

        {/* Right: Zyron 48-Hour Pipeline */}
        <div className="p-4 rounded bg-bg-panel border border-accent-scan/50 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <span className="font-bold text-accent-scan flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> ZYRON 48-HOUR PIPELINE
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-scan/10 text-accent-scan font-bold">
              $10k–$25k
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline space-y-0.5">
              <div className="text-accent-scan font-bold">Hour 0: Git Ingestion & Scope</div>
              <div className="text-text-muted text-[10px] font-sans">Self-serve submission of Git commit SHA and core invariant definitions.</div>
            </div>
            <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline space-y-0.5">
              <div className="text-accent-scan font-bold">Hours 1–4: Dual-Engine Prover</div>
              <div className="text-text-muted text-[10px] font-sans">AST invariant pass + zyron-agent Anvil EVM attack simulation and Foundry PoCs.</div>
            </div>
            <div className="p-2 rounded bg-bg-panel-raised border border-border-hairline space-y-0.5">
              <div className="text-accent-scan font-bold">Hours 5–24: Senior Auditor Sign-Off</div>
              <div className="text-text-muted text-[10px] font-sans">Senior auditors verify execution traces and sign via P256 biometric passkey.</div>
            </div>
            <div className="p-2 rounded bg-bg-panel-raised border border-accent-scan/40 space-y-0.5">
              <div className="text-signal-resolved font-bold">Hour 48+: Monad Attestation Live</div>
              <div className="text-text-muted text-[10px] font-sans">Soulbound seal minted, bytecode hash registered, and GuardedByZyron active.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded bg-bg-panel border border-border-hairline font-mono text-xs text-text-muted flex items-center justify-between">
        <span>Business Impact:</span>
        <span className="text-accent-scan font-bold">Launch 6 weeks earlier • Save 70% in capital • Permanent on-chain proof.</span>
      </div>
    </div>
  );
}

// --- SLIDE 8: MARKET OPPORTUNITY & AI AGENT BOOM ---
function SlideMarket() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SlideHeader
        badge="Slide 8 – Market Opportunity"
        title="$3.5B Market Opportunity & AI Agent Boom"
        description="10,000 TPS parallel EVM throughput meets machine-speed autonomous AI agent contract deployment:"
      />

      {/* TAM / SAM / SOM */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-1.5 text-center">
          <span className="font-mono text-xs text-text-muted">GLOBAL TAM (2028)</span>
          <div className="font-display text-3xl font-bold text-accent-scan">$3.5B</div>
          <p className="text-[11px] text-text-muted font-sans">
            Smart contract security & DeFi assurance market growing at 32% CAGR.
          </p>
        </div>

        <div className="p-4 rounded bg-bg-panel border border-accent-scan/40 space-y-1.5 text-center">
          <span className="font-mono text-xs text-accent-scan font-bold">PARALLEL EVM SAM</span>
          <div className="font-display text-3xl font-bold text-text-primary">$850M</div>
          <p className="text-[11px] text-text-muted font-sans">
            High-throughput L1/L2 ecosystems (Monad, MegaETH, EVM rollups).
          </p>
        </div>

        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-1.5 text-center">
          <span className="font-mono text-xs text-signal-resolved font-bold">MONAD INITIAL SOM</span>
          <div className="font-display text-3xl font-bold text-signal-resolved">$65M</div>
          <p className="text-[11px] text-text-muted font-sans">
            Monad ecosystem initial target: 200+ protocols, vaults & AI agents.
          </p>
        </div>
      </div>

      {/* 2 Secular Tailwinds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-2 hover:border-accent-scan/50 transition-colors">
          <div className="flex items-center justify-between font-mono text-xs text-accent-scan">
            <span className="font-bold">TAILWIND 01</span>
            <Zap className="h-4 w-4" />
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">10,000 TPS Parallel Execution</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Sub-second finality on Monad means protocols deploy and upgrade code weekly rather than yearly. Security must shift from annual consulting into continuous automated CI/CD validation.
          </p>
        </div>

        <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-2 hover:border-accent-scan/50 transition-colors">
          <div className="flex items-center justify-between font-mono text-xs text-accent-scan">
            <span className="font-bold">TAILWIND 02</span>
            <Cpu className="h-4 w-4" />
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">ERC-8004 Autonomous AI Agent Boom</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Autonomous AI agents deploying and composing contracts cannot read a PDF report or wait 6 weeks. They require machine-speed, programmatic on-chain trust validation before signing transactions.
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded bg-bg-panel border border-border-hairline font-mono text-xs text-text-muted flex items-center justify-between">
        <span>Market Convergence:</span>
        <span className="text-accent-scan font-bold">Zyron is the verifiable trust primitive for the autonomous agent economy.</span>
      </div>
    </div>
  );
}

// --- SLIDE 9: BUSINESS MODEL & RECURRING ARR ---
function SlideBusinessModel() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SlideHeader
        badge="Slide 9 – Business Model"
        title="High-Margin Recurring Revenue Model"
        description="Fixed-price audit engagements ($10k-$25k) + continuous CI/CD PR subscriptions ($1.5k-$4.5k/mo ARR) at 85% gross margins:"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4.5 rounded bg-bg-panel border border-border-hairline space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-accent-scan font-bold">STREAM 01</span>
            <span className="text-text-muted">PROJECT</span>
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">Full Protocol Audits</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Fixed-price security reviews for major releases: full AST scan, <code className="text-accent-scan">zyron-agent</code> EVM sandbox PoCs, senior auditor sign-off, and Soulbound seal on Monad.
          </p>
          <div className="pt-2 border-t border-border-hairline font-mono text-xs font-bold text-text-primary flex items-center justify-between">
            <span>$10,000 – $25,000</span>
            <span className="text-[10px] text-text-muted font-normal">Per Audit</span>
          </div>
        </div>

        <div className="p-4.5 rounded bg-bg-panel border border-accent-scan/50 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-accent-scan font-bold">STREAM 02</span>
            <span className="text-signal-resolved font-bold">RECURRING ARR</span>
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">Continuous CI/CD Bot</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            GitHub Actions bot scanning every pull request on commit, continuous invariant regression testing, and automated on-chain attestation renewal.
          </p>
          <div className="pt-2 border-t border-border-hairline font-mono text-xs font-bold text-accent-scan flex items-center justify-between">
            <span>$1,500 – $4,500 / mo</span>
            <span className="text-[10px] text-accent-scan font-normal">SaaS Subscription</span>
          </div>
        </div>

        <div className="p-4.5 rounded bg-bg-panel border border-border-hairline space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-text-muted font-bold">STREAM 03</span>
            <span className="text-text-muted">ENTERPRISE</span>
          </div>
          <h3 className="font-mono text-sm font-bold text-text-primary">Enterprise Telemetry & API</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Programmatic API access for institutional allocators, DeFi insurance risk underwriting feeds, and custom protocol invariant suites.
          </p>
          <div className="pt-2 border-t border-border-hairline font-mono text-xs font-bold text-text-primary flex items-center justify-between">
            <span>$25,000 – $50,000 / yr</span>
            <span className="text-[10px] text-text-muted font-normal">Annual License</span>
          </div>
        </div>
      </div>

      {/* Unit Economics Metrics */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded bg-bg-panel border border-border-hairline font-mono text-xs text-center">
        <div>
          <span className="text-text-muted text-[10px]">GROSS MARGINS</span>
          <div className="font-display text-xl font-bold text-accent-scan">85%+</div>
          <span className="text-[10px] text-text-muted font-sans">vs. 35% legacy firms</span>
        </div>
        <div>
          <span className="text-text-muted text-[10px]">LTV / CAC RATIO</span>
          <div className="font-display text-xl font-bold text-signal-resolved">&gt; 5.2x</div>
          <span className="text-[10px] text-text-muted font-sans">Sticky CI/CD workflows</span>
        </div>
        <div>
          <span className="text-text-muted text-[10px]">ONBOARDING FRICTION</span>
          <div className="font-display text-xl font-bold text-text-primary">0 Gas</div>
          <span className="text-[10px] text-text-muted font-sans">Relayed sponsorship</span>
        </div>
      </div>
    </div>
  );
}

// --- SLIDE 10: COMPETITIVE ADVANTAGE (DEFENSIBLE EDGES) ---
function SlideCompetition() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SlideHeader
        badge="Slide 10 – Competitive Advantage"
        title="Defensible Edges Over Legacy Firms & Linters"
        description="Side-by-side comparison across delivery speed, verification rigor, cost, and on-chain defensibility:"
      />

      <div className="rounded border border-border-hairline overflow-x-auto bg-bg-panel font-mono text-xs">
        <table className="w-full text-left min-w-[620px]">
          <thead className="bg-bg-panel-raised text-text-primary font-bold border-b border-border-hairline">
            <tr>
              <th className="py-2.5 px-3">Dimension</th>
              <th className="py-2.5 px-3 text-text-muted font-normal">Static Linters (Slither)</th>
              <th className="py-2.5 px-3 text-text-muted font-normal">Legacy Firms (CertiK/OZ)</th>
              <th className="py-2.5 px-3 text-text-muted font-normal">Crowdsourced (C4)</th>
              <th className="py-2.5 px-3 text-accent-scan font-bold bg-accent-scan/5">Zyron on Monad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline text-text-primary text-[11px]">
            <tr>
              <td className="py-2 px-3 font-bold">Turnaround Time</td>
              <td className="py-2 px-3 text-signal-resolved">Seconds (Static)</td>
              <td className="py-2 px-3 text-signal-critical">4–8 Weeks</td>
              <td className="py-2 px-3 text-signal-high">2–3 Weeks</td>
              <td className="py-2 px-3 text-accent-scan font-bold bg-accent-scan/5">48–72 Hours</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold">Pricing / Cost</td>
              <td className="py-2 px-3 text-signal-resolved">Free / Low</td>
              <td className="py-2 px-3 text-signal-critical">$50k–$150k+</td>
              <td className="py-2 px-3 text-signal-high">$30k–$80k</td>
              <td className="py-2 px-3 text-accent-scan font-bold bg-accent-scan/5">$10k–$25k (70% less)</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold">False Positive Rate</td>
              <td className="py-2 px-3 text-signal-critical">80%+ Noise Tax</td>
              <td className="py-2 px-3 text-signal-resolved">Low (Human Filtered)</td>
              <td className="py-2 px-3 text-signal-high">High (Contest Spam)</td>
              <td className="py-2 px-3 text-accent-scan font-bold bg-accent-scan/5">0% (EVM Proven PoCs)</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold">Vulnerability Proof</td>
              <td className="py-2 px-3 text-signal-critical">Theoretical Notes</td>
              <td className="py-2 px-3 text-signal-high">Subjective Text</td>
              <td className="py-2 px-3 text-text-muted">Issue Writeups</td>
              <td className="py-2 px-3 text-accent-scan font-bold bg-accent-scan/5">Foundry .t.sol Executable</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold">Audit Artifact</td>
              <td className="py-2 px-3 text-text-muted">CLI Terminal Logs</td>
              <td className="py-2 px-3 text-signal-critical">Static PDF Report</td>
              <td className="py-2 px-3 text-text-muted">GitHub Issue List</td>
              <td className="py-2 px-3 text-accent-scan font-bold bg-accent-scan/5">Soulbound NFT + Bytecode Hash</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold">Runtime Defense</td>
              <td className="py-2 px-3 text-signal-critical">None</td>
              <td className="py-2 px-3 text-signal-critical">None</td>
              <td className="py-2 px-3 text-signal-critical">None</td>
              <td className="py-2 px-3 text-accent-scan font-bold bg-accent-scan/5">GuardedByZyron.sol Modifier</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold">AI Agent Identity</td>
              <td className="py-2 px-3 text-signal-critical">None</td>
              <td className="py-2 px-3 text-signal-critical">None</td>
              <td className="py-2 px-3 text-signal-critical">None</td>
              <td className="py-2 px-3 text-accent-scan font-bold bg-accent-scan/5">ERC-8004 Registry Ready</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold">Gross Margin</td>
              <td className="py-2 px-3 text-text-muted">N/A</td>
              <td className="py-2 px-3 text-signal-critical">35%–45% (Headcount)</td>
              <td className="py-2 px-3 text-signal-high">20%–30% (Prizes)</td>
              <td className="py-2 px-3 text-accent-scan font-bold bg-accent-scan/5">85%+ (Automated SaaS)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- SLIDE 11: ROADMAP & TRACTION ---
function SlideRoadmap() {
  const [viewMode, setViewMode] = React.useState<"milestones" | "expansions">("milestones");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <SlideHeader
          badge="Slide 11 – Strategic Roadmap"
          title="Verified Execution & Future Implementations"
          description="Strategic milestone breakdown from live Monad Testnet foundation to $1.2M ARR and future architectural expansions:"
        />

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded bg-bg-panel border border-border-hairline shrink-0 font-mono text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("milestones")}
            className={cn(
              "px-3 py-1.5 rounded transition-colors cursor-pointer",
              viewMode === "milestones"
                ? "bg-accent-scan text-bg-void font-bold shadow-sm"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            Timeline Milestones
          </button>
          <button
            type="button"
            onClick={() => setViewMode("expansions")}
            className={cn(
              "px-3 py-1.5 rounded transition-colors cursor-pointer",
              viewMode === "expansions"
                ? "bg-accent-scan text-bg-void font-bold shadow-sm"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            Future Implementations
          </button>
        </div>
      </div>

      {viewMode === "milestones" ? (
        /* 4-Phase Timeline Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Phase 1 */}
          <div className="p-3.5 rounded bg-bg-panel border border-accent-scan/50 space-y-2.5 font-mono">
            <div className="flex items-center justify-between text-xs font-bold border-b border-border-hairline pb-2">
              <span className="text-accent-scan">PHASE 1 (NOW • LIVE)</span>
              <span className="px-1.5 py-0.5 rounded bg-bg-panel-raised text-signal-resolved text-[10px]">MONAD 10143</span>
            </div>
            <ul className="space-y-1.5 text-xs font-sans text-text-primary">
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>Registry live at <code className="text-accent-scan font-mono text-[10px]">0xBd24...</code></span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>Gas-sponsored relayer (<code className="text-text-muted font-mono text-[10px]">0x48b1...</code>)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>Dual-Engine prover & Anvil sandbox</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>P256 passkeys & <code className="text-accent-scan font-mono text-[10px]">GuardedByZyron</code></span>
              </li>
            </ul>
          </div>

          {/* Phase 2 */}
          <div className="p-3.5 rounded bg-bg-panel border border-border-hairline space-y-2.5 font-mono">
            <div className="flex items-center justify-between text-xs font-bold border-b border-border-hairline pb-2">
              <span className="text-text-primary">PHASE 2 (Q4 2026)</span>
              <span className="px-1.5 py-0.5 rounded bg-bg-panel-raised text-accent-scan text-[10px]">IN PROGRESS</span>
            </div>
            <ul className="space-y-1.5 text-xs font-sans text-text-muted">
              <li className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>First 10 Monad protocol design partners</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>GitHub Actions automated PR security bot</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>MonadVision verified Trust Passport</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>Self-serve audit scoping portal</span>
              </li>
            </ul>
          </div>

          {/* Phase 3 */}
          <div className="p-3.5 rounded bg-bg-panel border border-border-hairline space-y-2.5 font-mono">
            <div className="flex items-center justify-between text-xs font-bold border-b border-border-hairline pb-2">
              <span className="text-text-primary">PHASE 3 (H1 2027)</span>
              <span className="px-1.5 py-0.5 rounded bg-bg-panel-raised text-signal-resolved text-[10px]">$1.2M ARR</span>
            </div>
            <ul className="space-y-1.5 text-xs font-sans text-text-muted">
              <li className="flex items-start gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>Monad Mainnet genesis deployment</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>35 recurring protocols on CI/CD ARR</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>ERC-8004 AI Agent Registry live</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent-scan shrink-0 mt-0.5" />
                <span>DeFi insurance underwriting API</span>
              </li>
            </ul>
          </div>

          {/* Phase 4 */}
          <div className="p-3.5 rounded bg-bg-panel border border-border-hairline space-y-2.5 font-mono">
            <div className="flex items-center justify-between text-xs font-bold border-b border-border-hairline pb-2">
              <span className="text-text-muted">PHASE 4 (H2 2027+)</span>
              <span className="px-1.5 py-0.5 rounded bg-bg-panel-raised text-text-muted text-[10px]">EXPANSION</span>
            </div>
            <ul className="space-y-1.5 text-xs font-sans text-text-muted">
              <li className="flex items-start gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-text-muted shrink-0 mt-0.5" />
                <span>Parallel mempool guard rails</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-text-muted shrink-0 mt-0.5" />
                <span>Cross-chain attestation relays</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-text-muted shrink-0 mt-0.5" />
                <span>Decentralized staked verifier network</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-text-muted shrink-0 mt-0.5" />
                <span>Automated exploit bounty escrow</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        /* Future Implementations Deep-Dive Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded bg-bg-panel border border-accent-scan/40 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-accent-scan font-bold flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> 1. ERC-8004 AGENT TRUST PROTOCOL
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-scan/10 text-accent-scan font-bold">
                MACHINE-TO-MACHINE
              </span>
            </div>
            <h4 className="font-mono text-sm font-bold text-text-primary">Programmatic Validation for AI Agents</h4>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Autonomous AI agents executing swaps or liquidity management cannot read PDFs. Zyron provides an on-chain boolean verification oracle (<code className="text-accent-scan font-mono">isAttestedTarget</code>) before agents commit treasury capital to unknown contracts.
            </p>
          </div>

          <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-2.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-accent-scan font-bold flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> 2. PARALLEL MEMPOOL GUARD RAILS
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-panel-raised text-signal-resolved font-bold">
                PRE-EXECUTION
              </span>
            </div>
            <h4 className="font-mono text-sm font-bold text-text-primary">Pre-Execution Invariant Interception</h4>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Monad&apos;s 10,000 TPS parallel EVM pipeline enables pre-execution transaction inspection. Invariant-breaking exploit calls (flash loans, oracle skew) are detected in the mempool and trigger circuit breaker signals before block finality.
            </p>
          </div>

          <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-2.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-accent-scan font-bold flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5" /> 3. EXPLOIT PROOF BOUNTY ESCROW
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-panel-raised text-text-primary font-bold">
                TRUSTLESS PAYOUTS
              </span>
            </div>
            <h4 className="font-mono text-sm font-bold text-text-primary">Zero-Friction Bug Bounty Resolution</h4>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              White-hats submit reproducible Foundry <code className="text-accent-scan font-mono">.t.sol</code> exploit tests instead of text reports. Zyron&apos;s sandbox runs the test on an Anvil fork; if proven, the on-chain escrow pays the bounty instantly without weeks of mediation.
            </p>
          </div>

          <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-2.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-accent-scan font-bold flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" /> 4. SELF-HEALING CODE REMEDIATION
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-scan/10 text-accent-scan font-bold">
                AUTO-PATCH PRs
              </span>
            </div>
            <h4 className="font-mono text-sm font-bold text-text-primary">Automated Solidity Fix Synthesis</h4>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Beyond flagging invariant breaches, the Zyron CI/CD bot synthesizes the exact Solidity patch code, verifies that all invariants hold across fuzz runs, and submits a ready-to-merge GitHub pull request to the protocol team.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Summary Callout */}
      <div className="p-3.5 rounded bg-bg-panel border border-border-hairline font-mono text-xs text-text-muted flex items-center justify-between">
        <span>Strategic Target:</span>
        <span className="text-accent-scan font-bold">Scaling from Monad Testnet to $1.2M ARR & cross-chain verification.</span>
      </div>
    </div>
  );
}

// --- SLIDE 12: VISION & NEXT STEPS (THE OPPORTUNITY & ASK) ---
function SlideVision({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SlideHeader
        badge="Slide 12 – Future & Expansion"
        title="Building the Trust Standard for the Autonomous Economy"
        description="How Zyron scales from Monad's on-chain primitive to the universal trust layer for Web3 and autonomous AI:"
      />

      {/* 4 Long-Term Expansion Horizons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded bg-bg-panel border border-border-hairline space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[10px] text-accent-scan font-bold">
            <span>HORIZON 01</span>
            <Layers className="h-3.5 w-3.5" />
          </div>
          <div className="font-mono text-xs font-bold text-text-primary">Cross-Chain Relays</div>
          <p className="text-[11px] text-text-muted font-sans leading-relaxed">
            Audited once on Monad, verified everywhere. Relaying bytecode proofs to Ethereum, Arbitrum, Base & MegaETH via LayerZero state proofs.
          </p>
        </div>

        <div className="p-3 rounded bg-bg-panel border border-border-hairline space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[10px] text-accent-scan font-bold">
            <span>HORIZON 02</span>
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div className="font-mono text-xs font-bold text-text-primary">Continuous CI/CD</div>
          <p className="text-[11px] text-text-muted font-sans leading-relaxed">
            Transforming static PDF snapshots into live continuous security subscriptions embedded directly in protocol developer pull requests.
          </p>
        </div>

        <div className="p-3 rounded bg-bg-panel border border-border-hairline space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[10px] text-accent-scan font-bold">
            <span>HORIZON 03</span>
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <div className="font-mono text-xs font-bold text-text-primary">ERC-8004 AI Safety</div>
          <p className="text-[11px] text-text-muted font-sans leading-relaxed">
            Equipping autonomous AI agents with machine-to-machine validation so autonomous capital can safely allocate across DeFi.
          </p>
        </div>

        <div className="p-3 rounded bg-bg-panel border border-border-hairline space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[10px] text-accent-scan font-bold">
            <span>HORIZON 04</span>
            <Scale className="h-3.5 w-3.5" />
          </div>
          <div className="font-mono text-xs font-bold text-text-primary">Staked Verifiers</div>
          <p className="text-[11px] text-text-muted font-sans leading-relaxed">
            Economic staking where security researchers back invariant proofs with capital bonds, decentralizing verification at institutional scale.
          </p>
        </div>
      </div>

      {/* Welcoming Partners Card */}
      <div className="p-4 rounded bg-bg-panel border border-border-hairline space-y-3 font-mono text-xs">
        <div className="font-bold text-accent-scan">WE ARE ACTIVELY WELCOMING:</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
            <div className="font-bold text-text-primary font-sans">1. Protocol Design Partners</div>
            <div className="text-[11px] text-text-muted font-sans">DeFi protocols and vaults launching on Monad wanting 48-hour audits and GuardedByZyron protection.</div>
          </div>
          <div className="p-2.5 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
            <div className="font-bold text-text-primary font-sans">2. Strategic Seed Backers</div>
            <div className="text-[11px] text-text-muted font-sans">Investors who believe verifiable on-chain security infrastructure is foundational to scaling parallel EVMs.</div>
          </div>
          <div className="p-2.5 rounded bg-bg-panel-raised border border-border-hairline space-y-1">
            <div className="font-bold text-text-primary font-sans">3. AI Agent Creators</div>
            <div className="text-[11px] text-text-muted font-sans">Engineering teams integrating ERC-8004 on-chain trust validation before deploying autonomous capital.</div>
          </div>
        </div>
      </div>

      {/* Monad Testnet Verification Box */}
      <div className="p-4 rounded bg-bg-panel border border-accent-scan/40 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-signal-resolved shrink-0" />
          <div>
            <div className="text-text-primary font-bold">Monad Testnet Registry (Chain ID 10143)</div>
            <div className="text-[11px] text-accent-scan break-all">0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3</div>
          </div>
        </div>
        <a
          href="https://testnet.monadvision.com/address/0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-bg-panel-raised hover:bg-bg-panel-raised/80 border border-border-hairline text-accent-scan font-bold shrink-0 transition-colors"
        >
          <span>View on MonadVision</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* CTA Box */}
      <div className="p-4 sm:p-5 rounded bg-bg-panel-raised border border-accent-scan/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left font-mono">
          <div className="text-sm font-bold text-text-primary">Let&apos;s make smart contract security verifiable and composable on-chain.</div>
          <div className="text-xs text-text-muted font-sans">Submit your contract for an audit or integrate GuardedByZyron into your protocol today.</div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
          <Link href="/portal/new-request">
            <button
              type="button"
              className="px-4 py-2 rounded bg-accent-scan text-bg-void font-bold hover:bg-accent-scan/90 transition-colors cursor-pointer"
            >
              Start Audit Request
            </button>
          </Link>
          <button
            type="button"
            onClick={onRestart}
            className="px-3.5 py-2 rounded bg-bg-panel hover:bg-bg-panel border border-border-hairline text-text-primary transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-text-primary" />
            <span>Replay Presentation</span>
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
    <div className="space-y-1 text-left">
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bg-panel text-accent-scan border border-border-hairline">
        <Sparkles className="h-3 w-3" />
        <span>{badge}</span>
      </div>
      <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-text-muted max-w-2xl font-sans leading-relaxed">{description}</p>
    </div>
  );
}
