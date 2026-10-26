"use client";

import * as React from "react";
import {
  ShieldAlert,
  Terminal,
  Search,
  FileCode,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { Eyebrow } from "@/components/ui/eyebrow";

export default function KitchenSinkPage() {
  const [addressInput, setAddressInput] = React.useState(
    "0x71C...9B38"
  );
  const [fileInput, setFileInput] = React.useState("VaultCore.sol");
  const [searchInput, setSearchInput] = React.useState("");
  const [errorInput, setErrorInput] = React.useState("0xInvalidFormat");
  const [isLoadingDemo, setIsLoadingDemo] = React.useState(false);
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-void text-text-primary">
      {/* Top Hairline Header */}
      <header className="sticky top-0 z-50 border-b border-border-hairline bg-bg-void/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-7 w-7 rounded-[4px] bg-bg-panel border border-border-hairline text-accent-scan">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight">
                ZYRON
              </span>
              <span className="ml-2 font-mono text-[11px] text-text-muted">
                // COMPONENT_LAB
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status="scanning" size="sm">
              ENGINE ACTIVE
            </StatusPill>
            <Eyebrow size="xs" prefix="REV //">
              v0.1.0-alpha
            </Eyebrow>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        {/* Hero Title Area */}
        <div className="border-b border-border-hairline pb-8 space-y-3">
          <Eyebrow size="sm" prefix="// SYSTEM_SPEC: ">
            PRIMITIVE_INSPECTION_WORKBENCH
          </Eyebrow>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
            Core UI Primitives & Design Tokens
          </h1>
          <p className="text-text-muted text-sm max-w-3xl leading-relaxed">
            Clinical diagnostic components built exclusively for smart contract security auditing.
            Enforces strict 4px/6px radii, hairline borders, background-layered elevation (no drop shadows),
            functional severity signals, and General Sans display typography.
          </p>
        </div>

        {/* 1. COLOR TOKENS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <Eyebrow size="sm">COLOR_TOKENS // EXACT SPECIFICATION</Eyebrow>
            <span className="font-mono text-[11px] text-text-muted">
              11 CANONICAL TOKENS
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              {
                name: "bg-void",
                hex: "#0B0D10",
                desc: "Page void",
                border: true,
              },
              {
                name: "bg-panel",
                hex: "#14171C",
                desc: "Cards, panels",
                border: true,
              },
              {
                name: "bg-panel-raised",
                hex: "#1B1F26",
                desc: "Modals, hover states",
                border: true,
              },
              {
                name: "border-hairline",
                hex: "#262B33",
                desc: "1px structural dividers",
                border: false,
              },
              {
                name: "text-primary",
                hex: "#E8EAED",
                desc: "Body / headlines",
                border: false,
              },
              {
                name: "text-muted",
                hex: "#8B93A1",
                desc: "Secondary, captions",
                border: false,
              },
              {
                name: "accent-scan",
                hex: "#5EC8FF",
                desc: "The one brand accent",
                border: false,
              },
              {
                name: "signal-critical",
                hex: "#FF5468",
                desc: "Critical severity",
                border: false,
              },
              {
                name: "signal-high",
                hex: "#FF9F43",
                desc: "High severity",
                border: false,
              },
              {
                name: "signal-medium",
                hex: "#FFD166",
                desc: "Medium severity",
                border: false,
              },
              {
                name: "signal-low",
                hex: "#6C9EFF",
                desc: "Low severity",
                border: false,
              },
              {
                name: "signal-resolved",
                hex: "#3DDC97",
                desc: "Passed check / resolved",
                border: false,
              },
            ].map((token) => (
              <div
                key={token.name}
                onClick={() => copyToClipboard(token.hex)}
                className="group p-3 rounded-[4px] bg-bg-panel border border-border-hairline hover:bg-bg-panel-raised transition-all cursor-pointer space-y-2"
              >
                <div
                  className="h-12 w-full rounded-[2px] flex items-end justify-end p-1.5 transition-transform group-hover:scale-[1.02]"
                  style={{
                    backgroundColor: token.hex,
                    border: token.border ? "1px solid #262B33" : "none",
                  }}
                >
                  {copiedToken === token.hex ? (
                    <Check className="h-3.5 w-3.5 text-void bg-white/90 rounded-[2px] p-0.5" />
                  ) : (
                    <Copy className="h-3 w-3 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-xs font-semibold text-text-primary">
                    {token.name}
                  </p>
                  <p className="font-mono text-[10px] text-text-muted">
                    {token.hex}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1 truncate">
                    {token.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. TYPOGRAPHY MATRIX */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <Eyebrow size="sm">TYPOGRAPHY // SPECIFICATION</Eyebrow>
            <span className="font-mono text-[11px] text-text-muted">
              DISPLAY (GENERAL SANS) · BODY (INTER) · MONO (JETBRAINS MONO)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 space-y-3">
              <Eyebrow size="xs" variant="scan">
                DISPLAY // GENERAL SANS
              </Eyebrow>
              <div className="space-y-2">
                <p className="font-display text-2xl font-semibold tracking-tight text-text-primary">
                  Smart Contract Security
                </p>
                <p className="font-display text-lg font-medium text-text-primary">
                  Vulnerability Triage Terminal
                </p>
                <p className="font-display text-sm text-text-muted">
                  Used exclusively for headings with tight tracking.
                </p>
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <Eyebrow size="xs" variant="scan">
                BODY // INTER
              </Eyebrow>
              <div className="space-y-2">
                <p className="font-sans text-sm text-text-primary leading-relaxed">
                  Pairs automated vulnerability bytecode scanning with manual review
                  from auditors who have audited production protocols.
                </p>
                <p className="font-sans text-xs text-text-muted leading-relaxed">
                  Dense UI text, 14–16px sizing, optimized for high legibility and contrast.
                </p>
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <Eyebrow size="xs" variant="scan">
                STRUCTURAL MONO // JETBRAINS MONO
              </Eyebrow>
              <div className="space-y-2 font-mono text-xs">
                <p className="text-accent-scan">
                  0x71C836443ab54c561563d610250005
                </p>
                <p className="text-signal-critical">
                  SIG_CRIT // REENTRANCY_ON_TRANSFER
                </p>
                <p className="text-text-muted">
                  GAS_EST: 2,419,000 · TIMESTAMP: 1723984920
                </p>
                <p className="text-[11px] text-text-muted">
                  Connective tissue of the entire UI (addresses, IDs, eyebrows, severities).
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* 3. EYEBROWS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <Eyebrow size="sm">PRIMITIVE // EYEBROW</Eyebrow>
            <span className="font-mono text-[11px] text-text-muted">
              STRUCTURAL MONO LABELS
            </span>
          </div>

          <Card className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-xs text-text-muted font-mono mb-1">
                  Default Muted Prefix
                </p>
                <Eyebrow prefix="// ">AUDIT_QUEUE_V2</Eyebrow>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-text-muted font-mono mb-1">
                  Scan Accent Variant
                </p>
                <Eyebrow variant="scan" prefix=":: ">
                  LIVE_DIAGNOSTICS
                </Eyebrow>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-text-muted font-mono mb-1">
                  With Dot Beacon
                </p>
                <Eyebrow dot prefix="">
                  BYTECODE_PARSER_ACTIVE
                </Eyebrow>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-text-muted font-mono mb-1">
                  Real Sequence Marker
                </p>
                <Eyebrow variant="primary" prefix="STAGE 02/04 // ">
                  MANUAL_REVIEW
                </Eyebrow>
              </div>
            </div>
          </Card>
        </section>

        {/* 4. BUTTONS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <Eyebrow size="sm">PRIMITIVE // BUTTON</Eyebrow>
            <span className="font-mono text-[11px] text-text-muted">
              5 VARIANTS · 4 SIZES · LOADING & ICON STATES
            </span>
          </div>

          <div className="space-y-6">
            {/* Variants */}
            <Card className="p-6 space-y-4">
              <Eyebrow size="xs">VARIANTS</Eyebrow>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Scan Action</Button>
                <Button variant="secondary">Secondary Panel</Button>
                <Button variant="outline">Outline Hairline</Button>
                <Button variant="ghost">Ghost Action</Button>
                <Button variant="danger">Critical Action</Button>
                <Button disabled>Disabled Action</Button>
              </div>
            </Card>

            {/* Sizes & Icons */}
            <Card className="p-6 space-y-4">
              <Eyebrow size="xs">SIZES & ICON COMPOSITIONS</Eyebrow>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<FileCode className="h-3.5 w-3.5" />}
                >
                  Small Action
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  leftIcon={<Search className="h-4 w-4" />}
                >
                  Medium Action
                </Button>
                <Button
                  size="lg"
                  variant="primary"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Large Primary
                </Button>
                <Button size="icon" variant="secondary" aria-label="Add item">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button size="icon-sm" variant="outline" aria-label="Lock item">
                  <Lock className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="secondary"
                  isLoading={isLoadingDemo}
                  onClick={() => {
                    setIsLoadingDemo(true);
                    setTimeout(() => setIsLoadingDemo(false), 2000);
                  }}
                >
                  {isLoadingDemo ? "Scanning..." : "Click to Test Loading"}
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* 5. SEVERITY BADGES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <Eyebrow size="sm">PRIMITIVE // BADGE (SEVERITY SYSTEM)</Eyebrow>
            <span className="font-mono text-[11px] text-text-muted">
              STRICT FUNCTIONAL SEVERITY COLORS
            </span>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-3">
              <Eyebrow size="xs">SEVERITY TAXONOMY</Eyebrow>
              <div className="flex flex-wrap items-center gap-3">
                <Badge severity="critical">CRITICAL</Badge>
                <Badge severity="high">HIGH</Badge>
                <Badge severity="medium">MEDIUM</Badge>
                <Badge severity="low">LOW</Badge>
                <Badge severity="resolved">RESOLVED</Badge>
                <Badge severity="informational">INFORMATIONAL</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Eyebrow size="xs">SIZES (SM / MD / LG)</Eyebrow>
              <div className="flex flex-wrap items-center gap-3">
                <Badge severity="critical" size="sm">
                  CRITICAL SM
                </Badge>
                <Badge severity="critical" size="md">
                  CRITICAL MD
                </Badge>
                <Badge severity="critical" size="lg">
                  CRITICAL LG
                </Badge>
                <Badge severity="resolved" size="sm" showIndicator={false}>
                  NO INDICATOR
                </Badge>
              </div>
            </div>

            <div className="space-y-3 border-t border-border-hairline pt-4">
              <Eyebrow size="xs">CONTEXTUAL VULNERABILITY TAGS</Eyebrow>
              <div className="flex flex-wrap items-center gap-2">
                <Badge severity="critical">SWC-107 // REENTRANCY</Badge>
                <Badge severity="high">SWC-104 // UNCHECKED_CALL</Badge>
                <Badge severity="medium">SWC-101 // ARITHMETIC_OVERFLOW</Badge>
                <Badge severity="low">GAS // UNCACHED_ARRAY_LENGTH</Badge>
                <Badge severity="resolved">FIX_VERIFIED // PR-41</Badge>
              </div>
            </div>
          </Card>
        </section>

        {/* 6. STATUS PILL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <Eyebrow size="sm">PRIMITIVE // STATUS PILL</Eyebrow>
            <span className="font-mono text-[11px] text-text-muted">
              AUDIT LIFECYCLE INDICATORS (4PX RADIUS)
            </span>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-3">
              <Eyebrow size="xs">PIPELINE STAGES</Eyebrow>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill status="pending" />
                <StatusPill status="scanning" />
                <StatusPill status="in-review" />
                <StatusPill status="completed" />
                <StatusPill status="failed" />
              </div>
            </div>

            <div className="space-y-3">
              <Eyebrow size="xs">SIZES</Eyebrow>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill status="scanning" size="sm">
                  SCANNING SM
                </StatusPill>
                <StatusPill status="scanning" size="md">
                  SCANNING MD
                </StatusPill>
                <StatusPill status="scanning" size="lg">
                  SCANNING LG
                </StatusPill>
              </div>
            </div>
          </Card>
        </section>

        {/* 7. INPUTS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <Eyebrow size="sm">PRIMITIVE // INPUT</Eyebrow>
            <span className="font-mono text-[11px] text-text-muted">
              MONO FORMATS · PREFIXES · ERROR STATES
            </span>
          </div>

          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-xs text-text-muted">
                  Smart Contract Address (Mono with Prefix)
                </label>
                <Input
                  isMono
                  prefix="0x"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="71C836443ab54c561563d610250005"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs text-text-muted">
                  Source File Search (Icon Prefix + Suffix)
                </label>
                <Input
                  prefix={<Search className="h-3.5 w-3.5" />}
                  suffix={<span className="text-[10px] text-text-muted">ESC</span>}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Filter functions or findings..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs text-text-muted">
                  Contract File Specification (Suffix Tag)
                </label>
                <Input
                  isMono
                  suffix={<span className="text-accent-scan">.sol</span>}
                  value={fileInput}
                  onChange={(e) => setFileInput(e.target.value)}
                  placeholder="ContractName"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs text-signal-critical">
                  Validation Error State
                </label>
                <Input
                  isMono
                  isError
                  value={errorInput}
                  onChange={(e) => setErrorInput(e.target.value)}
                  placeholder="Hex string"
                />
                <p className="text-[11px] font-mono text-signal-critical">
                  Invalid hexadecimal checksum: expected 40 hex characters.
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs text-text-muted">
                  Disabled Input
                </label>
                <Input disabled value="LOCKED_AUDIT_TICKET_921" isMono />
              </div>
            </div>
          </Card>
        </section>

        {/* 8. CARDS & DEPTH LAYERING */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <Eyebrow size="sm">PRIMITIVE // CARD & LAYERED DEPTH</Eyebrow>
            <span className="font-mono text-[11px] text-text-muted">
              VOID → PANEL → PANEL-RAISED (ZERO DROP SHADOWS)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Panel Card */}
            <Card variant="default">
              <CardHeader>
                <Eyebrow size="xs">SURFACE // BG-PANEL</Eyebrow>
                <CardTitle>Automated Bytecode Analysis</CardTitle>
                <CardDescription>
                  Static symbolic execution across EVM opcodes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between py-1 border-b border-border-hairline text-xs font-mono">
                  <span className="text-text-muted">AST Depth</span>
                  <span className="text-text-primary">14 Levels</span>
                </div>
                <div className="flex items-center justify-between py-1 text-xs font-mono">
                  <span className="text-text-muted">Scan Engine</span>
                  <span className="text-accent-scan">ZAM-SCAN-v2.4</span>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border-hairline pt-4 flex justify-between">
                <Eyebrow size="xs">SLOC: 1,482</Eyebrow>
                <Button size="sm" variant="outline">
                  Configure
                </Button>
              </CardFooter>
            </Card>

            {/* Raised Panel Card */}
            <Card variant="raised">
              <CardHeader>
                <Eyebrow size="xs" variant="scan">
                  SURFACE // BG-PANEL-RAISED
                </Eyebrow>
                <CardTitle>Manual Auditor Inspection</CardTitle>
                <CardDescription>
                  Lead security auditor allocated for deep protocol review.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between py-1 border-b border-border-hairline text-xs font-mono">
                  <span className="text-text-muted">Assigned Auditor</span>
                  <span className="text-text-primary">0xAuditor_K4</span>
                </div>
                <div className="flex items-center justify-between py-1 text-xs font-mono">
                  <span className="text-text-muted">Status</span>
                  <StatusPill status="in-review" size="sm" />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border-hairline pt-4 flex justify-between">
                <Eyebrow size="xs">ETA: 48h</Eyebrow>
                <Button size="sm" variant="primary">
                  Review Findings
                </Button>
              </CardFooter>
            </Card>

            {/* Interactive Card */}
            <Card variant="interactive">
              <CardHeader>
                <Eyebrow size="xs">INTERACTIVE // HOVER ELEVATION</Eyebrow>
                <CardTitle>Security Finding Summary</CardTitle>
                <CardDescription>
                  Click to drill down into vulnerability trace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge severity="critical">1 CRITICAL</Badge>
                  <Badge severity="high">3 HIGH</Badge>
                  <Badge severity="medium">2 MED</Badge>
                </div>
                <div className="p-2.5 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-[11px] text-text-muted">
                  <code>⚠ Line 142: Unchecked ERC20.transferFrom return</code>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border-hairline pt-4 flex items-center justify-between">
                <span className="font-mono text-xs text-accent-scan flex items-center gap-1">
                  View Triage <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  TICKET #849
                </span>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 9. DATA TABLES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <Eyebrow size="sm">PRIMITIVE // TABLE (CLINICAL DATA GRIDS)</Eyebrow>
            <span className="font-mono text-[11px] text-text-muted">
              HAIRLINE GRID · MONOSPACE HEADERS · HIGH-DENSITY ROWS
            </span>
          </div>

          <div className="space-y-6">
            {/* Table 1: Vulnerability Triage Findings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-text-primary">
                  Active Findings Triage // VaultCore.sol
                </h3>
                <span className="font-mono text-xs text-text-muted">
                  5 DETECTED FINDINGS
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Finding ID</TableHead>
                    <TableHead>Vulnerability Classification</TableHead>
                    <TableHead className="w-32">Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="w-24 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs text-accent-scan">
                      ZAM-001
                    </TableCell>
                    <TableCell className="font-medium">
                      Reentrancy in withdrawAll() before balance update
                    </TableCell>
                    <TableCell>
                      <Badge severity="critical">CRITICAL</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      VaultCore.sol:142
                    </TableCell>
                    <TableCell>
                      <StatusPill status="in-review" size="sm">
                        TRIAGED
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-mono text-xs text-accent-scan">
                      ZAM-002
                    </TableCell>
                    <TableCell className="font-medium">
                      Unchecked return value of external token transfer
                    </TableCell>
                    <TableCell>
                      <Badge severity="high">HIGH</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      PaymentGateway.sol:89
                    </TableCell>
                    <TableCell>
                      <StatusPill status="in-review" size="sm">
                        TRIAGED
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-mono text-xs text-accent-scan">
                      ZAM-003
                    </TableCell>
                    <TableCell className="font-medium">
                      Precision loss in compound fee calculation
                    </TableCell>
                    <TableCell>
                      <Badge severity="medium">MEDIUM</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      YieldEngine.sol:214
                    </TableCell>
                    <TableCell>
                      <StatusPill status="completed" size="sm">
                        ACKNOWLEDGED
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-mono text-xs text-accent-scan">
                      ZAM-004
                    </TableCell>
                    <TableCell className="font-medium">
                      State variable shadow in derived upgradeable proxy
                    </TableCell>
                    <TableCell>
                      <Badge severity="low">LOW</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      ProxyAdmin.sol:56
                    </TableCell>
                    <TableCell>
                      <StatusPill status="completed" size="sm">
                        CONFIRMED
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-mono text-xs text-accent-scan">
                      ZAM-005
                    </TableCell>
                    <TableCell className="font-medium">
                      Missing zero-address validation on admin transfer
                    </TableCell>
                    <TableCell>
                      <Badge severity="resolved">RESOLVED</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      AccessControl.sol:34
                    </TableCell>
                    <TableCell>
                      <StatusPill status="completed" size="sm">
                        FIXED
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        Diff
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Table 2: Pipeline Queue */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-text-primary">
                  Client Audit Requests Queue // Global Overview
                </h3>
                <span className="font-mono text-xs text-text-muted">
                  3 ACTIVE PIPELINE TICKETS
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Ticket</TableHead>
                    <TableHead>Protocol / Contract Target</TableHead>
                    <TableHead className="w-32">Scope</TableHead>
                    <TableHead className="w-36">Pipeline State</TableHead>
                    <TableHead className="w-40">Submitted</TableHead>
                    <TableHead className="w-24 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs text-accent-scan">
                      #ZAM-9481
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Aura Liquidity Pool V3</p>
                        <p className="font-mono text-xs text-text-muted truncate max-w-xs">
                          0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      2,410 SLOC
                    </TableCell>
                    <TableCell>
                      <StatusPill status="scanning" size="sm" />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      2026-08-18 21:30 UTC
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="primary">
                        Track
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-mono text-xs text-accent-scan">
                      #ZAM-9478
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Nexus Collateral Vault</p>
                        <p className="font-mono text-xs text-text-muted truncate max-w-xs">
                          0xdac17f958d2ee523a2206206994597c13d831ec7
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      1,180 SLOC
                    </TableCell>
                    <TableCell>
                      <StatusPill status="in-review" size="sm" />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      2026-08-17 14:15 UTC
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="secondary">
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-mono text-xs text-accent-scan">
                      #ZAM-9462
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">StakingRewardsDistributor</p>
                        <p className="font-mono text-xs text-text-muted truncate max-w-xs">
                          0x2260fac5e5542a773aa44fbcfedf7c193bc2c599
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      640 SLOC
                    </TableCell>
                    <TableCell>
                      <StatusPill status="completed" size="sm" />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      2026-08-16 09:00 UTC
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="secondary">
                        Report
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <footer className="border-t border-border-hairline pt-8 pb-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-text-muted">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-signal-resolved" />
            <span>ZYRON DIAGNOSTIC SUITE // ALL PRIMITIVES VERIFIED</span>
          </div>
          <div>STRICT 1PX HAIRLINE · 4PX RADIUS · BACKGROUND ELEVATION</div>
        </footer>
      </main>
    </div>
  );
}
