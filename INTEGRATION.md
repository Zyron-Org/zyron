# 🔌 Developer Integration Guide: Building on the Zyron Primitive

Zyron is designed from the ground up as an **open on-chain trust and verification primitive** for the Monad ecosystem. Any smart contract, DeFi protocol, or autonomous AI agent (ERC-8004) can query and compose with Zyron directly on Monad Testnet without relying on proprietary Web2 APIs.

---

## 1. On-Chain Smart Contract Integration (Solidity)

### Deployed Contract Details
- **Network**: Monad Testnet
- **Chain ID**: `10143`
- **Contract Address**: [`0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3`](https://testnet.monadvision.com/address/0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3)
- **Interface**: [`IZyronAttestation.sol`](./contracts/src/interfaces/IZyronAttestation.sol)

### Pattern A: Guarded Vaults & Security Gates (`GuardedByZyron`)
If you are building a DeFi protocol, yield aggregator, or lending pool that accepts external tokens, flash-loan receivers, or strategy plugins, inherit `GuardedByZyron` to prevent un-audited or malicious bytecode from being registered:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { GuardedByZyron } from "@zyron/contracts/examples/GuardedByZyron.sol";

contract MonadYieldVault is GuardedByZyron {
    constructor() GuardedByZyron(0xBd24D2BFFbc69a17aCe69aaF930fC4e0d979c4D3) {}

    // Only allow strategy contracts whose bytecode carries an active on-chain Zyron attestation
    function registerStrategy(address strategyContract) external onlyAttestedTarget(strategyContract) {
        // Safe to route capital!
    }
}
```

### Pattern B: Direct On-Chain Querying (`IZyronAttestation`)
Query the registry directly using `bytecodeHash` or `auditId`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IZyronAttestation } from "@zyron/contracts/interfaces/IZyronAttestation.sol";

contract SecurityInspector {
    IZyronAttestation public immutable zyron;

    constructor(address _zyron) {
        zyron = IZyronAttestation(_zyron);
    }

    function checkContractSafety(address target) external view returns (bool isAudited, string memory ipfsReport) {
        bytes32 codeHash = target.codehash;
        try zyron.verifyByBytecodeHash(codeHash) returns (IZyronAttestation.AttestationRecord memory rec) {
            return (rec.isVerified, rec.ipfsReportCid);
        } catch {
            return (false, "");
        }
    }
}
```

---

## 2. Autonomous AI Agent Integration (ERC-8004 Alignment)

Under the **ERC-8004 Trustless Agent standard**, AI agents rely on three decoupled registries:
1. **Identity Registry** (ERC-721 agent NFT)
2. **Reputation Registry** (feedback and history)
3. **Validation Registry** (independent verification of high-stakes task outputs)

**Zyron serves as the Validation Registry on Monad:**
- When an AI agent generates and compiles smart contract bytecode, it submits the source code and invariants to the Zyron validation engine.
- Zyron synthesizes targeted Foundry invariant tests in an isolated sandbox, executing `forge test -vvvv` against state invariants.
- If verified, the attestation is sealed on-chain to `0xBd24...` on Monad.
- Peer AI agents inspect `verifyByBytecodeHash(bytecodeHash)` before trusting the contract or invoking its methods.

---

## 3. Off-Chain REST & TypeScript API Integration

Zyron provides a full REST API for CI/CD pipelines, GitHub Actions, and agent orchestrators.

### Base URL
- Local: `http://localhost:4000/api/v1`
- Swagger Docs: `http://localhost:4000/docs` (HTTP Basic Auth: `admin` / `zyron2026`)

### Example: Verify Bytecode via TypeScript
```typescript
import axios from "axios";

async function verifyContract(auditId: string) {
  // Query live Monad on-chain verification endpoint
  const response = await axios.get(
    `http://localhost:4000/api/v1/audits/${auditId}/attestation/onchain?chainId=10143`
  );

  const { isVerified, bytecodeHash, merkleRoot, ipfsReportCid, explorerUrl } = response.data;

  if (isVerified) {
    console.log(`✅ Contract verified on Monad!`);
    console.log(`Explorer: ${explorerUrl}`);
    console.log(`IPFS Report: ipfs://${ipfsReportCid}`);
  } else {
    console.warn(`❌ Unverified contract: Do not execute.`);
  }
}

verifyContract("ZYR-9481");
```

---

## 4. Trust Passport Resolution API

Query any developer or auditor's on-chain trust profile:

```bash
# Query by auditor handle
curl -s http://localhost:4000/api/v1/passport/0xBasil_Auditor

# Query by wallet address
curl -s http://localhost:4000/api/v1/passport/0x48b106E3C8681D08c513268854Aef257883298d3
```

Returns:
- Canonical reputation score
- Cryptographic claim history (`AUDIT_COMPLETED`, `DEVELOPER_VERIFIED`, `AI_AGENT_VERIFIED`)
- Evidence hashes & Monad Testnet transaction IDs
