# Zyron Threat Model & Security Controls

## 1. Trust Boundaries

1. **Untrusted Model Output (`muse-spark-1.3` / Cloud LLMs)**:
   - The LLM is treated as an untrusted investigator that proposes tool calls and test code.
   - It has **zero** access to host environment variables, private keys (`MODEL_API_KEY`, `OPERATOR_PRIVATE_KEY`), unrestricted shell commands, or network sockets during test execution.
2. **Untrusted Target Smart Contracts**:
   - Submitted repositories and Solidity files may contain adversarial prompt injections in comments/strings or malicious build scripts.
3. **Sandbox Boundary (`zyron-agent` <-> Docker Container)**:
   - Model-generated Solidity tests are compiled and executed inside an isolated container with `--cap-drop=ALL`, `--security-opt=no-new-privileges`, `--pids-limit=256`, CPU/memory limits, and network disabled (`docker network disconnect bridge` + `FOUNDRY_OFFLINE=true`) after workspace bootstrap.
   - If Docker is unavailable, `ProverWorker` **fails closed** rather than silently executing generated code on the host.
4. **Prover-to-Backend Webhook Boundary**:
   - Callbacks to `POST /api/v1/scanner/prover-callback` are authenticated with HMAC-SHA256 (`x-zyron-agent-signature` verified via `crypto.timingSafeEqual`).
5. **Attestation Authorization Boundary**:
   - Only a human reviewer (`AUDITOR` or `ADMIN` wallet) can sign the EIP-712 `AttestationPayload`.
   - The AI agent never holds signing keys and cannot call attestation endpoints.

---

## 2. Threats & Mitigations Matrix

| Threat | Attack Vector | Mitigation in Zyron |
|---|---|---|
| **Hallucinated / Fabricated Proof** | Model claims `PROVEN_EXPLOIT` without a working exploit or by faking state | `HarnessVerifier` (`zyron-verifier/2.0.0`) ignores model prose, bans state-faking cheatcodes (`vm.etch`, `vm.store`, `vm.mockCall`, `vm.ffi`), and runs `forge test` twice independently. |
| **Target Contract Tampering** | Agent edits the target contract in `src/` to make an exploit pass | `tool-policy.ts` restricts `write_file` to `^test/zyron/[A-Za-z0-9_.\-/]+\.sol$` and `HarnessVerifier` verifies SHA-256 hashes of all baseline files. |
| **Arbitrary Command Execution / RCE** | Prompt injection tricks agent into running shell commands | Unrestricted `run_command` tool is removed. Only structured tools (`read_file`, `list_dir`, `search_code`, `write_file`, `forge_build`, `run_forge_test`, `submit_verdict`) exist; `search_code` and `list_dir` run in-process in Node without spawning a shell. |
| **Fake False-Positive Dismissal** | Agent claims `PROVEN_FALSE_POSITIVE` just because its exploit test failed | `HarnessVerifier` requires a verbatim `counterevidenceGuard` present in the unmodified contract source AND a passing counter-test. |
| **Cross-Chain Signature Replay** | Attacker replays a Monad Testnet (`10143`) signature on Base Sepolia (`84532`) | EIP-712 domain binds `chainId` and `verifyingContract`. `EvmChainAdapter.verifyAttestationSignature` verifies both server-side and on-chain in `ZyronAttestation.sol`. |
| **Stale Source Attestation** | Contract code changes after attestation preparation | `AttestationService.approveChainAttestation` compares prepared `repoTreeHash` and `evidenceRoot` against the current audit state and rejects stale payloads. |
| **Fabricated Transaction Hashes** | Backend returns a mock tx hash when `OPERATOR_PRIVATE_KEY` is missing | Removed all mock tx hash fallbacks; `AttestationSubmitterService` throws a clear error if `OPERATOR_PRIVATE_KEY` or registry configuration is missing. |
