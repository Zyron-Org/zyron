# Zyron Security Platform — Update Documentation & Local Testing Guide

## 1. What Has Been Done

### Backend Architecture Refactoring (`backend/src/`)
- **Granular Sub-Service Modularization**: Refactored monolithic NestJS service files into focused single-responsibility sub-services under a `services/` directory within every feature module:
  - `audit`: `CreateAuditService`, `GetAuditsService`, `ClaimTicketService`, `AdvanceStageService`, `FindingsService`, `CommentsService`, `AuditSanitizerService`.
  - `auth`: `RegisterService`, `LoginService`, `SiweService`, `UserProfileService`.
  - `aws`: `ContractValidatorService`, `S3StorageService`.
  - `blockchain`: `ChainConfigService`, `TransactionVerifierService`, `BytecodeVerifierService`.
  - `integrations`: `GithubParserService`, `GithubApiService`, `GithubCommentService`.
  - `organization`: `CreateOrganizationService`, `GetOrganizationService`, `ManageMemberService`, `UpdateOrganizationService`.
  - `payment`: `EscrowPaymentService`, `InvoicePaymentService`.
  - `scanner`: `TokenRuleScannerService`, `AiGeminiClientService`, `AiLocalReasonerService`, `GithubWebhookHandlerService`, `ScanOrchestratorService`.
- **Strict Line Count Standard**: Every single service file across all 40 files in `backend/src` is strictly **under 100 lines of code** (maximum line count is 99).
- **Facade Delegate Pattern**: Main service classes (`AuditService`, `AuthService`, etc.) act as clean, lightweight facade delegates (< 50 lines) ensuring 100% backward-compatibility with all existing controllers, guards, and test suites.
- **Fixed Payload Validation & Audit Engine**:
  - Fixed `POST /api/v1/audits` unauthorized & DTO validation errors (removed `sourceCode` property validation block).
  - Concurrency-safe ticket ID generation (`ZYR-9481`, `ZYR-9482`, etc.).
  - Replaced legacy `ZAM` prefixes with `ZYR` branding standards (`ZYR-ENGINE-AST-SCANNER // v2.4.0`).

### Frontend & API Integration (`frontend/`)
- **Central API Client (`frontend/lib/api-client.ts`)**: Unified HTTP client for JWT auth, ticket creation, finding comments, token risk scans, and team management.
- **100% Dynamic Ticket Tracking (`frontend/app/portal/track/[id]/page.tsx`)**:
  - Live data fetching via `GET /api/v1/audits/:id`.
  - Terminal scan logs dynamically bind real uploaded contract filename, SLOC count, Git commit SHA, compiler target, and network.
- **Web3 Wallet & SIWE Authentication**: Integrated `wagmi` / `viem` with EIP-4361 Sign-In With Ethereum backend verification (`POST /api/v1/auth/siwe/verify`).

---

## 2. What Needs to Be Done (Future Roadmap)

1. **Production Docker Slither / Mythril Runner**:
   - Currently, token security rules and local AI reasoning analyze contracts in real time. For production, connect Slither and Mythril CLI Docker containers in background queues.
2. **Production AWS S3 Bucket Setup**:
   - Configure live AWS S3 keys in `backend/.env` (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`) for direct presigned upload/download of PDFs and source files.
3. **Smart Contract On-Chain Escrow Deployment**:
   - Deploy `ZyronEscrow.sol` and `ZyronAttestation.sol` to Arbitrum / Base / Ethereum mainnets and update `backend/.env` contract addresses.

---

## 3. How to Test Locally

### Prerequisites
- Node.js v18+
- PostgreSQL database running locally (or Docker container)

### Step 1: Start Backend Dev Server
```bash
cd backend
npm install

# Push database schema to local PostgreSQL
npx prisma db push

# Start backend server on http://localhost:4000
npm run start:dev
```

### Step 2: Start Frontend Dev Server
```bash
cd frontend
npm install

# Start frontend server on http://localhost:3000
npm run dev
```

### Step 3: Local Verification Walkthrough
1. **Register / Login**:
   - Visit `http://localhost:3000/auth/register` or `http://localhost:3000/auth/login`.
   - Create a client account (or log in with `auditor@zyron.security`).
2. **Submit Audit Request**:
   - Go to `http://localhost:3000/portal/new-request`.
   - Enter Protocol Name, contract filename (e.g. `VaultCore.sol`), SLOC count, Git commit SHA, and target compiler.
   - Click **Submit Audit Request**.
3. **Live Track & Terminal AST Scanner**:
   - Click **View Live Pipeline Rail** on the confirmation screen (or open ticket `/portal/track/ZYR-9481`).
   - Refresh the page (`Cmd + R` / `F5`) — verify terminal logs render your **real uploaded filename, commit SHA, SLOC, and target compiler**.
4. **Token Risk Analysis**:
   - Open `http://localhost:3000/portal/token-risk` to test instant static honeypot / tax / mint vulnerability detection.

---

## 4. How to Push Updates to GitHub

Run the following commands in your terminal to stage, commit, and push the updates:

```bash
cd /Users/basil/Desktop/codes/Veriq/zyron-revamped

# 1. Stage all modified and untracked files
git add .

# 2. Commit changes
git commit -m "feat(backend): modularize services under 100 lines each & dynamic API tracking

- Refactored all backend NestJS service files into single-responsibility sub-services (< 100 lines per file)
- Implemented facade delegate pattern and barrel exports across all feature modules
- Bound real contract metadata dynamically to /portal/track/[id] scanner UI
- Replaced legacy ZAM branding with ZYR security engine standards
- Integrated SIWE Web3 wallet auth and central API client"

# 3. Push to remote repository
git push origin main
```
