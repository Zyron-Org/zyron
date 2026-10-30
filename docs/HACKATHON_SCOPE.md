# Hackathon Scope — Meta Global AI Developer Hackathon 2026

This file separates what Zyron already had before the hackathon from what was added for it. Each entry is marked with its status, and nothing is listed as "done" unless it is implemented and its tests have actually run.

Legend: ✅ done and tested · 🟡 implemented, needs live credentials / Docker / funded wallet for live network execution

## Pre-existing (before the hackathon)

| Capability | Location |
|---|---|
| 14-pass AST vulnerability scanner | `backend/src/scanner/` |
| Multi-provider AI triage (Gemini, OpenAI, Anthropic, DeepSeek) | `backend/src/scanner/ai-providers/` |
| Autonomous prover agent: tool loop, Foundry test synthesis, verdict submission | `zyron-agent/src/agent/` |
| Gemini LLM provider for the prover | `zyron-agent/src/llm/gemini.provider.ts` |
| Docker / host / mock executors | `zyron-agent/src/sandbox/` |
| git-status anti-tamper check, double test re-run | `zyron-agent/src/agent/verifier.ts` |
| Canonical JSON + SHA-256 evidence hashing, findings Merkle root | `backend/src/blockchain/services/` |
| EIP-712 attestation payloads, operator relayer | `backend/src/blockchain/services/` |
| `ZyronAttestation` registry + soulbound seal, `GuardedByZyron` | `contracts/src/` |
| Monad testnet deployment `0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3` | `contracts/deployment-monad-testnet.json` |
| Next.js portal, auditor workspace, `/verify`, trust passports (Privy) | `frontend/` |
| Deliberately vulnerable fixtures | `zyron-test-protocol/` |

## Added for the hackathon

| # | Capability | Location | Status |
|---|---|---|---|
| 1 | Meta Model API provider (`muse-spark-1.3`, Standard mode, `https://api.meta.ai/v1/chat/completions`, `MODEL_API_KEY`) in both `zyron-agent` and `backend` | `zyron-agent/src/llm/meta.provider.ts`, `backend/src/scanner/ai-providers/meta-provider.service.ts` | ✅ (15 unit tests passed; 🟡 live API smoke via `npm --prefix zyron-agent run smoke:meta` when `MODEL_API_KEY` is set) |
| 2 | Strict tool schemas, argument validation, path policy (`^test/zyron/[A-Za-z0-9_.\-/]+\.sol$`), and shell-free search; replaces unrestricted `run_command` | `zyron-agent/src/agent/tools.ts`, `zyron-agent/src/agent/tool-policy.ts` | ✅ (`test/tool-policy.spec.ts` 6/6 passed) |
| 3 | Fail-closed sandbox: Docker by default, network cut after bootstrap (`lockdownNetwork`), `--cap-drop=ALL`, `--security-opt=no-new-privileges` | `zyron-agent/src/sandbox/docker-executor.ts`, `zyron-agent/src/queue/worker.ts` | ✅ (unit tested; 🟡 requires Docker & Foundry installed on host for live container runs) |
| 4 | Deterministic verifier v2 (`zyron-verifier/2.0.0`): SHA-256 source-hash integrity, banned cheatcodes, explicit rules for `PROVEN_EXPLOIT`, `PROVEN_FALSE_POSITIVE`, and `INCONCLUSIVE` | `zyron-agent/src/agent/verifier.ts` | ✅ (`test/verifier-v2.spec.ts` 5/5 passed, `test/prover-meta-loop.spec.ts` 2/2 passed) |
| 5 | Versioned evidence schema `zyron.evidence/v1` + `ProverEvidence` model + sorted SHA-256 evidence Merkle root bound into EIP-712 `merkleRoot` | `backend/src/blockchain/services/evidence-hasher.service.ts`, `backend/prisma/schema.prisma` | ✅ (`test/phase4-5-evidence-multichain.spec.ts` passed) |
| 6 | Server-side-verified reviewer EIP-712 authorization, HMAC-enforced prover callback, stale-source rejection, removal of fake tx hashes and silent operator fallback | `backend/src/blockchain/services/attestation.service.ts`, `attestation-submitter.service.ts`, `agent-prover-client.service.ts` | ✅ (`test/phase4-5-evidence-multichain.spec.ts` passed) |
| 7 | Per-chain attestation records (`ChainAttestation` Prisma model) and REST endpoints (`/audits/:id/evidence`, `/audits/:id/attestations/:chainId/prepare|approve|submit`) | `backend/prisma/schema.prisma`, `backend/src/audit/audit.controller.ts` | ✅ |
| 8 | Audit lifecycle UI + multichain selector + public `zyron.evidence/v1` inspector on `/verify`, `/auditor/review/[id]`, and `/portal/track/[id]` | `frontend/app/verify/page.tsx`, `frontend/app/auditor/review/[id]/page.tsx`, `frontend/app/portal/track/[id]/page.tsx` | ✅ (`next build` succeeded across all 36 routes) |
| 9 | Multichain `ChainAdapter` architecture: `MonadTestnetAdapter` (`10143`) + `BaseSepoliaAdapter` (`84532`) + deployment manifests | `backend/src/blockchain/adapters/`, `contracts/deployments/10143.json`, `contracts/deployments/84532.json` | ✅ (`10143` live deployed; 🟡 `84532` ready to deploy via `DeployBaseSepolia.s.sol` when funded `OPERATOR_PRIVATE_KEY` is provided) |
| 10 | `ARCHITECTURE.md`, `THREAT_MODEL.md`, `MULTICHAIN.md`, and reproducible E2E demo script (`npm --prefix zyron-agent run demo`) | `docs/`, `zyron-agent/scripts/demo-hackathon.ts` | ✅ |

## Known limitations of the deployed registry

These are documented, not hidden. The Monad deployment (`0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3`) cannot be modified in place.

- The EIP-712 signature covers `auditId, merkleRoot, repoTreeHash, bytecodeHash, leadAuditor, sloc, status, timestamp`. Zyron puts the **canonical evidence root** in `merkleRoot` so the evidence is covered by the signature. `ipfsReportCid` and `recipient` are not signed.
- The contract accepts any signer who is named as `leadAuditor`. Reviewer authorization (`AUDITOR` / `ADMIN` role) is enforced by the Zyron backend before relaying. The public verifier shows the signer address so anyone can check it.
- There is no signature nonce or expiry on-chain. Replay is prevented by per-chain `auditId` uniqueness and the EIP-712 domain (`chainId`, `verifyingContract`). The backend also rejects signatures on prepared payloads older than 24h.
- After `revokeAttestation`, the same `auditId` can be published again.
