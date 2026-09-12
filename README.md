# Zyron Security Protocol — Autonomous Smart Contract Audit & Attestation Platform

Zyron Protocol (`zamaron-revamped`) is an enterprise-grade autonomous smart contract security audit, AST taint analysis, and cryptographic attestation platform. It combines static analysis, local AI reasoning, dual-pane auditor code review workbenches, dynamic GitHub repository scope ingestion, and EIP-712 on-chain attestation publishing on Arbitrum & Ethereum.

---

## 🏗️ Architecture & Technology Stack

### **Backend (`/backend`)**
- **Framework**: NestJS (TypeScript) with Modular Sub-Services Architecture (< 100 LOC per sub-service file).
- **Database & ORM**: SQLite (`prisma/dev.db`) with Prisma ORM.
- **Web3 & Cryptography**: Ethers.js v6 (EIP-712 Attestation Signing, Bytecode SHA-256 Hashing, Merkle Tree Construction, On-Chain Attestation Broadcasting).
- **Integrations**: GitHub REST API (`github-parser.service.ts` for full multi-language code parsing: `.sol`, `.rs`, `.vy`, `.move`, `.cairo`, `.ts`, `.py`, `.go`, etc.).
- **Testing**: Vitest test runner (57+ unit & integration tests).

### **Frontend (`/frontend`)**
- **Framework**: Next.js 14 (App Router) with React 18 & TypeScript.
- **Styling**: Modern dark-mode aesthetic with CSS Design Tokens, Glassmorphism, and Tailwind CSS.
- **State & Auth**: Custom Auth Context, Role-Based Route Guards (`middleware.ts`), Central `apiClient` for backend REST endpoints.
- **Web3**: Wagmi & Viem with Sign-In With Ethereum (SIWE / EIP-4361).

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js** v18+ or v20+
- **npm** v9+

### 1. Repository Setup & Environment
Clone the repository and install dependencies:

```bash
# Navigate into the project directory
cd zamaron-revamped

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Configuration

#### **Backend Environment (`backend/.env`)**
Create `backend/.env` (or verify defaults):
```env
PORT=4000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="zyron_dev_jwt_secret_key_2026_super_secure!"
JWT_EXPIRES_IN="7d"
DEFAULT_ATTESTATION_CHAIN_ID=421614
# Optional: Set GITHUB_TOKEN for higher GitHub REST API rate limits
# GITHUB_TOKEN=ghp_...
# OPERATOR_PRIVATE_KEY=0x...
```

#### **Frontend Environment (`frontend/.env.local`)**
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

### 3. Database Initialization & Credentials
Initialize the SQLite database schema:

```bash
cd backend
npx prisma db push
```

The database includes pre-configured test accounts for testing role-based access control:

| Role | Email | Password | Handle |
| :--- | :--- | :--- | :--- |
| **AUDITOR** | `k4@zyron.labs` | `AuditorPass123!` | `0xAuditor_K4` |
| **ADMIN** | `admin@zyron.labs` | `AdminPass123!` | `0xAdmin_Root` |
| **CLIENT** | `security@auraprotocol.io` | `SecurePassword123!` | `AuraSecurity` |

---

### 4. Running Development Servers

#### **Option A: Run Backend & Frontend in Parallel**
In Terminal 1 (Backend):
```bash
cd backend
npm run start:dev
# Running on http://localhost:4000
```

In Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

---

## 🧪 Testing & Verification Commands

### **Backend Test Suite (Vitest)**
Run all 57 backend unit & integration tests:
```bash
cd backend
npx vitest run
```

### **Frontend Typecheck (TypeScript)**
Verify zero TypeScript compilation errors:
```bash
cd frontend
npx tsc --noEmit
```

---

## 🔄 End-to-End User Flow & Walkthrough

1. **Client Portal Audit Submission (`/portal/new-request`)**:
   - Log in as Client (`security@auraprotocol.io`).
   - Select a GitHub repository preset (e.g. `Vasakee/GhostFI` or `OpenZeppelin/openzeppelin-contracts`) or enter a custom repository.
   - Click **Submit Audit Request** to launch intake scanning.

2. **Auditor Queue & Ticket Claiming (`/auditor/queue`)**:
   - Switch persona or log in as Lead Auditor (`k4@zyron.labs` / `AuditorPass123!`).
   - Locate the ticket under **Unclaimed Ingestion Queue** and click **Claim Ticket for Review**.

3. **Dual-Pane Code Review & Vulnerability Triage (`/auditor/review/[id]`)**:
   - Inspect dual-pane workspace: contract diff vs full source code, dynamic commit SHA telemetry, SWC taxonomy flags, and live discussion thread.
   - Review findings, input auditor re-verification notes, and click **Approve & Mark Finding Resolved**.

4. **Sign & Finalize Attestation Report**:
   - Once all findings are 100% resolved, click **Generate Final Attestation Report**.
   - Click **Sign & Finalize Attestation Report**.
   - The platform generates an immutable bytecode SHA-256 hash, signs the EIP-712 deliverable, broadcasts the on-chain attestation record (`onChainTxHash`), and displays the **Sealed Attestation Certificate**.

5. **Client Document Vault (`/portal/vault`) & Reports Vault (`/auditor/reports`)**:
   - View sealed certificates, download text/PDF attestations, export JSON metadata, or verify the on-chain transaction record on Arbitrum Sepolia explorer.

---

## 📁 Repository Structure

```
zamaron-revamped/
├── backend/                  # NestJS API Server (Port 4000)
│   ├── prisma/               # Database Schema & SQLite DB
│   │   ├── schema.prisma
│   │   └── dev.db
│   ├── src/
│   │   ├── audit/            # Audit Request & Finding Management
│   │   ├── auth/             # Authentication & SIWE Service
│   │   ├── aws/              # Storage & Contract Validation
│   │   ├── blockchain/       # EIP-712 Signing & On-Chain Attestation
│   │   ├── common/           # Decorators, Guards, Enums, Utilities
│   │   ├── database/         # Prisma Module & Service
│   │   ├── integrations/     # GitHub API & Code Parsing Service
│   │   ├── organization/     # Team & Organization Management
│   │   ├── payment/          # Escrow & Corporate Wire Invoice Services
│   │   └── scanner/          # AST Rule Scanner & AI Reasoning Engine
│   └── test/                 # Vitest Test Specifications
├── frontend/                 # Next.js 14 App Router (Port 3000)
│   ├── app/
│   │   ├── auditor/          # Auditor Queue, Workbench & Reports
│   │   ├── portal/           # Client Portal, Submissions & Vault
│   │   └── auth/             # Login & Registration Screens
│   ├── components/           # UI Design System & RequireAuth Guard
│   └── lib/                  # Central API Client & Auth Context
└── README.md                 # System Documentation
```

---

## 🛡️ Security & Anti-Tampering Standards

- **Commit Immutability**: Once an audit ticket is signed and set to `COMPLETED`, its findings and bytecode hash are sealed. Modifications are strictly rejected by `FindingsService`.
- **Role-Based Guards**: NestJS `@Roles(UserRole.AUDITOR, UserRole.ADMIN)` strictly decodes JWT claims to protect sensitive auditor routes.
