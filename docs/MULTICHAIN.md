# Zyron Multichain Attestation Architecture

## Overview

Zyron separates **chain-agnostic smart contract security verification** (AST scanning, Meta AI `muse-spark-1.3` investigation, isolated Foundry execution, and `zyron.evidence/v1` hashing) from **chain-specific on-chain attestation** via the `ChainAdapter` interface (`backend/src/blockchain/adapters/`).

---

## Supported Chain Matrix

| Network | Chain ID | Type | Native Token | RPC Env Var | Default RPC | Attestation Registry (`ZyronAttestation.sol`) | Explorer |
|---|---|---|---|---|---|---|---|
| **Monad Testnet** | `10143` | Testnet (Primary) | `MON` | `MONAD_TESTNET_RPC_URL` | `https://testnet-rpc.monad.xyz` | `0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3` ([`contracts/deployments/10143.json`](../contracts/deployments/10143.json)) | `https://testnet.monadvision.com` |
| **Base Sepolia** | `84532` | Testnet (Secondary) | `ETH` | `BASE_SEPOLIA_RPC_URL` | `https://sepolia.base.org` | `0xc242125A0b342E045Cf0E1c2e02C95D1EAEEC5c4` ([`contracts/deployments/84532.json`](../contracts/deployments/84532.json)) | `https://sepolia.basescan.org` |

---

## Chain-Scoped Identity & Replay Protection

1. **Chain-Scoped Contract Identity**:
   - Every target contract is identified as `${chainId}:${address.toLowerCase()}` via `formatChainScopedIdentity(chainId, address)`.
   - Identical contract addresses deployed on Monad Testnet (`10143:0x...`) and Base Sepolia (`84532:0x...`) are stored and verified as distinct `ChainAttestation` records (`@@unique([auditId, chainId])`).
2. **EIP-712 Domain Separation**:
   - Each chain's `ChainAdapter` constructs an EIP-712 domain bound to:
     - `name: "ZyronAttestation"`
     - `version: "3.0.0"`
     - `chainId: <10143 | 84532>`
     - `verifyingContract: <chain-specific ZyronAttestation address>`
   - Signatures created for Monad Testnet (`10143`) are cryptographically invalid on Base Sepolia (`84532`) and rejected both by `EvmChainAdapter.verifyAttestationSignature` and by `ZyronAttestation.publishAttestationWithSignature`.
3. **Testnet-Only Safety Guard**:
   - `EvmChainAdapter` checks `this.isTestnet` before preparing or broadcasting any transaction and refuses automatic mainnet transactions.

---

## Deploying `ZyronAttestation` to Base Sepolia (`84532`)

```bash
cd contracts
forge script script/DeployBaseSepolia.s.sol:DeployBaseSepoliaScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $OPERATOR_PRIVATE_KEY \
  --broadcast
```

Then set `BASE_SEPOLIA_ATTESTATION_ADDRESS=<deployed_address>` in `backend/.env`.
