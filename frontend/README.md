# Zyron — Smart Contract Security & Audit Platform

A clinical, precise smart contract security & auditing platform pairing automated vulnerability scanning with manual review from senior security researchers.

## Features

### 1. Public Marketing Site
- **Terminal Simulation Hero**: Real-time live-typing terminal AST vulnerability scan.
- **Pipeline Architecture Rail**: 4-stage sequential security pipeline (Pending $\rightarrow$ Scanning $\rightarrow$ In Manual Review $\rightarrow$ Completed).
- **Interactive Dual-Pane Code Review Demo**: Real Solidity vulnerability case study (SWC-107 reentrancy).
- **Cryptographic Attestations**: SHA-256 bytecode hash verification.

### 2. Client Portal (`/portal`)
- **Client Security Dashboard**: Active engagement telemetry, in-flight steppers, and attestation quick vault.
- **New Audit Intake Request**: Drag-and-drop `.sol` upload, GitHub repository ingestion with branch selector, SLOC estimator, and attack invariant checklist.
- **Live Status Tracker**: AST terminal stream, multi-round commit tracker (`ROUND 02`), timestamped activity log, and per-finding commit-triggered re-verification loops.
- **Open Findings Register**: Cross-ticket register of all active unmitigated vulnerabilities across active scopes.
- **Document Vault**: Signed PDF reports, SHA-256 hashes with 1-click copy, and raw JSON export downloads.
- **Payment & Checkout**: Web3 multi-sig escrow (`USDC`/`USDT`) and Net-30 invoice settlement.
- **Account Settings**: GitHub connection, Web3 signer address management, and CI/CD webhook configuration.

### 3. Auditor Workspace (`/auditor`)
- **Ticket Queue Dashboard**: High-visibility "Awaiting Re-Verification" priority queue with client fix commits, claimed workstream, and unclaimed ingestion tickets with interactive claim actions.
- **Dual-Pane Code Review & Vulnerability Triage**: Solidity source code gutter, Commit Diff View (`8f9b2d4` $\rightarrow$ `4b8f10e`), automated AI candidate triage (accept/refuse), manual custom finding creation, and multi-file project tree.
- **Report Generation**: Finding resolution-gated attestation report compilation with direct synchronization to the client's Document Vault.
- **AST Taint Rules Engine**: 14 symbolic taint execution passes with pattern matchers and toggle controls.
- **Foundry Invariant Proof Suite**: Property-based fuzzing with execution simulation.
- **Auditor Settings**: Hardware HSM EIP-712 attestation signing key configuration.

### 4. Platform Administration (`/admin`)
- **User & Role Governance**: Unified account register with consequential role mutation confirmation modal and visible append-only audit trail.
- **Global Ticket Oversight**: Cross-client, cross-auditor pipeline monitoring, SLA breach detection, and ticket reassignment.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Design Tokens**: Custom clinical palette (`bg-void #0B0D10`, `bg-panel #14171C`, `bg-panel-raised #1B1F26`, `border-hairline #262B33`, `accent-scan #5EC8FF`)

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
