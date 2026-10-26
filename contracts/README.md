# 📜 Zyron Smart Contracts (Monad Testnet)

Cryptographically verifiable on-chain attestation registry and Soulbound NFT security badges for smart contract audits and ERC-8004 autonomous AI agents on Monad.

---

## 📌 Deployed Contract Details

| Field | Value |
|---|---|
| **Network** | Monad Testnet |
| **Chain ID** | `10143` |
| **Contract Address** | [`0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3`](https://testnet.monadvision.com/address/0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3) |
| **Deployment Transaction** | `0xe7e706c56c781c5fe66bf13c13b177484094568bcd8625c8f9458001063ed356` |
| **Monad Vision Explorer** | [https://testnet.monadvision.com/address/0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3](https://testnet.monadvision.com/address/0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3) |
| **Operator / Relayer Wallet** | `0x48b106E3C8681D08c513268854Aef257883298d3` |

---

## 📁 Architecture & Contracts

- **[`src/ZyronAttestation.sol`](./src/ZyronAttestation.sol)**: Core registry contract. Stores verifiable attestation records (audit ID, Git commit SHA, repo tree hash, bytecode SHA-256 hash, Merkle root of findings, and IPFS report CIDs). Mints non-transferable Soulbound ERC-721 security seal badges. Supports direct operator publishing and EIP-712 typed auditor signatures.
- **[`src/interfaces/IZyronAttestation.sol`](./src/interfaces/IZyronAttestation.sol)**: Canonical developer interface for querying attestation status by `auditId`, `bytecodeHash`, `gitCommit`, or `ipfsReportCid`.
- **[`src/examples/GuardedByZyron.sol`](./src/examples/GuardedByZyron.sol)**: Abstract security primitive that any Monad DeFi protocol or ERC-8004 AI Agent can inherit to programmatically reject interactions with un-audited or revoked contract bytecodes.

---

## ⚡ Quickstart: Gating Monad Protocols with Zyron

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./examples/GuardedByZyron.sol";

contract MonadYieldVault is GuardedByZyron {
    constructor() GuardedByZyron(0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3) {}

    // Only allow strategy contracts whose bytecode carries an active on-chain Zyron attestation
    function registerStrategy(address strategyContract) external onlyAttestedTarget(strategyContract) {
        // Safe to execute: Bytecode is verified on Monad!
    }
}
```

---

## 🧪 Testing & Deployment

```bash
# Build contracts
forge build

# Run invariant & unit test suites
forge test -vvv

# Deploy to Monad Testnet
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $OPERATOR_PRIVATE_KEY \
  --broadcast
```
