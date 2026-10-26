# Zyron Platform End-to-End (E2E) Test Suite

This directory contains automated browser verification tests for the Zyron Smart Contract Auditing platform using `puppeteer-core`.

---

## 📋 Test Matrix & Persona Coverage

The master test suite (`master-flow.e2e.js`) exercises the entire decentralized protocol security audit lifecycle across three authenticated actor roles:

1. **Client Intake & Scope Definition (`client@zyron.labs`)**:
   - Multi-step intake wizard (Repository, Contracts, Invariants, Business Context, Payment/Tier selection).
   - Dynamic SLOC estimation & ticket generation (`#ZYR-xxxx`).
   - Live tracker telemetry and state inspection.

2. **Auditor Review & Finding Triage (`auditor@zyron.labs`)**:
   - Auditor queue inspection and ticket triage.
   - Code review workspace with diff viewer and AST inspection.
   - Vulnerability finding modal injection (Title, Severity, Description, Remediation steps).
   - "Release Findings to Client" workflow &rarr; stage mutation to `CORRECTIONS_REQUESTED`.

3. **Client Remediation & Fix Resubmission (`client@zyron.labs`)**:
   - Client tracker updates to display released auditor findings.
   - Fix commit SHA submission &rarr; stage returns to `IN_REVIEW` (Round 2).

4. **Auditor Cryptographic Attestation Sealing (`auditor@zyron.labs`)**:
   - Resolution verification of findings.
   - Final attestation generation and on-chain signing &rarr; stage marked `COMPLETED`.

5. **Client Document Vault Verification (`client@zyron.labs`)**:
   - Cryptographically sealed attestation proof and report listed in `/portal/vault`.

6. **Admin Oversight & RBAC Directory (`admin@zyron.labs`)**:
   - Global platform metrics inspection (`/admin/oversight`).
   - Full user governance directory and role mutation capabilities (`/admin/users`).

---

## 🚀 Running the Tests Locally

### Prerequisites

1. **Backend Server** running on `http://localhost:4000`:
   ```bash
   cd zyron-backend
   npm run start:dev   # or node dist/main.js
   ```

2. **Frontend Dev Server** running on `http://localhost:3001`:
   ```bash
   cd zyron-frontend
   npm run dev -- -p 3001
   ```

3. **Google Chrome** installed locally.

### Execute Master E2E Suite

From `zyron-frontend`:

```bash
npm run test:e2e
```

Or directly via Node:

```bash
node tests/e2e/master-flow.e2e.js
```

### Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `FRONTEND_URL` | `http://localhost:3001` | Base URL of frontend web app |
| `BACKEND_API` | `http://localhost:4000/api/v1` | Base URL of NestJS API gateway |
| `CHROME_PATH` | Auto-detected | Custom path to Chrome/Chromium binary |
| `PUPPETEER_EXECUTABLE_PATH` | Auto-detected | Standard CI/CD executable path |

---

## 🛠️ CI / CD Integration (GitHub Actions)

Example GitHub Actions step:

```yaml
- name: Run E2E Verification Flow
  env:
    FRONTEND_URL: http://localhost:3001
    BACKEND_API: http://localhost:4000/api/v1
    PUPPETEER_EXECUTABLE_PATH: /usr/bin/google-chrome
  run: |
    cd zyron-frontend
    node tests/e2e/master-flow.e2e.js
```
