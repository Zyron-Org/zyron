# Zyron Platform — Engineering TODO & Architecture Roadmap

This document outlines planned architectural refactors, feature enhancements, and system upgrades for the Zyron Smart Contract Security platform.

---

## 1. Multi-Organization & Organization-Scoped RBAC Architecture

### Problem Statement & Motivation
Currently, each registered user can only have at most one `organizationId` foreign key directly on their `User` model, and organization creation is tightly coupled to client registration. 

In a production enterprise workflow:
1. Users should have independent personal accounts (one identity, email, wallet, and login).
2. Users should be able to belong to multiple organizations simultaneously (e.g. security consultants, DAO multisig signers, developers contributing to multiple protocols).
3. Organizations must feature **Organization-Level RBAC** (Role-Based Access Control) with roles such as `OWNER`, `ADMIN`, `DEV` (Developer), and `VIEWER`.
4. The `OWNER` role must have administrative authority to manage memberships and configure granular permissions controlling what actions and resources `DEV` or other roles can access.

---

### Technical Specification & Design

#### A. Database Schema Refactor (`schema.prisma`)

1. **Decouple `organizationId` from `User`**:
   - Remove `organizationId` from `model User`.
   - A user account exists independently with personal credentials, API keys, and notification settings.

2. **Introduce `OrganizationMember` Join Model (Many-to-Many)**:
   ```prisma
   enum OrganizationRole {
     OWNER
     ADMIN
     DEV
     VIEWER
   }

   model Organization {
     id           String               @id @default(cuid())
     name         String
     slug         String               @unique
     tier         String               @default("standard")
     billingEmail String?
     taxId        String?
     createdAt    DateTime             @default(now())
     updatedAt    DateTime             @updatedAt

     members      OrganizationMember[]
     audits       AuditRequest[]
     invitations  OrganizationInvitation[]
   }

   model OrganizationMember {
     id             String           @id @default(cuid())
     organizationId String
     organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
     userId         String
     user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)
     role           OrganizationRole @default(DEV)
     
     // Granular permission overrides configured by Owner
     permissions    String?          // JSON: { "canSubmitAudit": true, "canTriggerScan": false, "canManageEscrow": false }
     
     joinedAt       DateTime         @default(now())
     updatedAt      DateTime         @updatedAt

     @@unique([organizationId, userId])
     @@index([userId])
     @@index([organizationId])
   }

   model OrganizationInvitation {
     id             String           @id @default(cuid())
     organizationId String
     organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
     email          String
     role           OrganizationRole @default(DEV)
     token          String           @unique
     invitedById    String
     expiresAt      DateTime
     acceptedAt     DateTime?
     createdAt      DateTime         @default(now())

     @@index([email])
     @@index([token])
   }
   ```

3. **Organization Role Matrix & Permissions**:
   | Permission / Capability | OWNER | ADMIN | DEV | VIEWER |
   |---|:---:|:---:|:---:|:---:|
   | Delete Organization | ✅ | ❌ | ❌ | ❌ |
   | Manage Billing & Invoices | ✅ | ✅ | ❌ | ❌ |
   | Configure Dev Role Permissions | ✅ | ❌ | ❌ | ❌ |
   | Invite / Remove Members | ✅ | ✅ | ❌ | ❌ |
   | Submit New Smart Contract Audit | ✅ | ✅ | Configurable (Default: ✅) | ❌ |
   | Trigger Automated AST Scans | ✅ | ✅ | Configurable (Default: ✅) | ❌ |
   | Submit Findings Remediation / Fixes | ✅ | ✅ | Configurable (Default: ✅) | ❌ |
   | View Audits, Reports & Findings | ✅ | ✅ | ✅ | ✅ |

---

#### B. Backend API Refactor (`backend/src/organization/`)

- [ ] **Decoupled User Registration**: Update `RegisterService` so signing up creates a clean personal user account without requiring an organization name.
- [ ] **Create Organization Endpoint**: `POST /api/v1/organizations` creates a new organization and sets the creator's role to `OWNER` in `OrganizationMember`.
- [ ] **List User Organizations**: `GET /api/v1/organizations` returns all organizations the current authenticated user belongs to, including their role in each.
- [ ] **Active Context Switcher**: Accept an `x-organization-id` request header (or active context query param) to scope audit queries, finding submissions, and telemetry to the selected organization.
- [ ] **Owner Permission Controls**:
  - `PATCH /api/v1/organizations/:id/members/:memberId/permissions`: Allows an `OWNER` to restrict or grant specific capabilities to `DEV` members (e.g. toggle audit submission rights or escrow signing).
  - `PATCH /api/v1/organizations/:id/members/:memberId/role`: Allows upgrading/downgrading member roles.
- [ ] **Org-Scoped Guards & Decorators**:
  - Implement `@RequireOrgRole(OrganizationRole.OWNER)` guard.
  - Implement `@RequireOrgPermission('canSubmitAudit')` guard.

---

#### C. Frontend UI & UX (`frontend/`)

- [ ] **Organization Switcher Dropdown**: Add an organization switcher to the client navigation header (similar to GitHub / Vercel team switchers).
- [ ] **Organization Settings & Member Management View**:
  - Page: `/portal/settings/team`
  - Member table displaying Name, Email, Role badge (`OWNER`, `ADMIN`, `DEV`, `VIEWER`), and Date Joined.
  - **Owner Controls Modal**: Interactive permission checkboxes for `DEV` role members:
    - `[x] Can submit new audit requests`
    - `[x] Can initiate on-demand AST vulnerability scans`
    - `[ ] Can sign escrow release or approve invoices`
- [ ] **Invitation Workflow**: Email invitation link dispatching an invite token that lets existing or new users join an organization with an assigned role.
- [ ] **Independent Onboarding**: Simplify `/auth/register` to create a personal user, followed by an optional "Create a Team / Organization" or "Continue as Individual" onboarding step.

---

## 2. Multi-Contract Repository Scope & Batch AST Scanning

### Problem Statement & Motivation
In production Web3 protocols, architectures are almost never contained in a single contract or a single inheritance graph. A repository often houses multiple standalone, independently deployable contracts (e.g., Uniswap `Factory.sol` + `Router.sol`, or Aura `VaultCore.sol` + `CollateralManager.sol` + `StakingPool.sol`) that do not import one another.

Currently:
1. The audit intake flow locks onto a single `contractFileName` entrypoint (`CreateAuditDto.contractFileName`).
2. The automated AST scanner runs solely against that primary contract and its direct import graph.
3. Completely separate, unlinked contracts in the same repository are excluded from the initial automated AST scanning pass, requiring manual file creation or individual single-file audits.

### Technical Specification & Design

#### A. Database Schema Refactor (`schema.prisma`)
1. **Support Multi-Contract Scope in `AuditRequest`**:
   - Add `scopedFiles String?` (JSON array of relative paths: `["contracts/VaultCore.sol", "contracts/CollateralManager.sol"]`).
   - Retain `contractFileName` as the primary entrypoint or protocol descriptor, or derive from scope.
   - Aggregate total `sloc` across all scoped contract files.
2. **Finding Attribution**:
   - Ensure all finding records (`Finding.location`) explicitly tag the relative contract file path (e.g. `contracts/CollateralManager.sol:142-146`) so findings from multiple root files map cleanly into the review suite.

#### B. Backend Ingestion & Scanner Refactor (`backend/src/scanner/` & `backend/src/audit/`)
- [ ] **Extend `CreateAuditDto`**:
  - Accept `scopedFiles?: string[]` and optionally a map of virtual source files or file paths.
- [ ] **Batch AST Orchestrator in `ScanOrchestratorService`**:
  - Iterate through all distinct root contracts in `scopedFiles`.
  - For each contract, invoke `ASTEngineRunnerService` with its virtual dependency tree.
  - Consolidate all detected AST and legacy findings into the single audit ticket (`#ZYR-xxxx`).
  - Calculate unified attestation Merkle root and `sourceHash` covering all scoped files.
- [ ] **Import Deduplication**:
  - Shared dependencies (e.g., `@openzeppelin/contracts/token/ERC20/IERC20.sol`) should only be parsed once in the shared `virtualFiles` AST context to avoid duplicate findings.

#### C. Frontend Intake UI Refactor (`frontend/app/portal/new-request/page.tsx`)
- [ ] **Multi-Select Scope Checkboxes**:
  - Replace the single-select file radio list with multi-select checkboxes for all detected `.sol` files in the repository.
  - Add a **"Select All Repository Contracts"** toggle button.
- [ ] **Aggregate SLOC & SLA Calculator**:
  - Dynamically sum SLOC and recalculate estimated turnaround SLA across all checked contracts.
- [ ] **Multi-File Source Code Preview**:
  - Provide tabs or a file selector dropdown above the source code preview box to inspect any selected contract's code before submitting.

---

## 3. Additional Roadmap Items

- [ ] **Fine-Grained Audit Ticket Assignments**: Organization owners can assign specific audits to designated internal developers.
- [ ] **Audit Trail & Governance Logs**: Log every membership change, permission mutation, and audit action taken within an organization for compliance.

