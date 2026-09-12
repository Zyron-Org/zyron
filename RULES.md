# Zyron AST Static Security Analysis Rules Catalog

This document details the 14 Abstract Syntax Tree (AST) & Control-Flow Graph (CFG) analysis passes implemented in the Zyron Security Engine.

---

## 14 Analysis Passes Overview

| Pass | Name & Category | SWC / CWE Mapping | Default Confidence |
| :--- | :--- | :--- | :--- |
| **Pass 01** | Access Control & Invariant Protections | SWC-105, SWC-106, CWE-284 | `HIGH_CONFIDENCE` |
| **Pass 02** | Arithmetic & Unchecked Block Analysis | SWC-101, CWE-190 | `HIGH_CONFIDENCE` |
| **Pass 03** | Oracle & Flash-Loan Price Manipulation | SWC-115, CWE-682 | `NEEDS_MANUAL_REVIEW` |
| **Pass 04** | ERC-20 / NFT Return Compliance | SWC-104, CWE-252 | `HIGH_CONFIDENCE` |
| **Pass 05** | Front-Running & MEV Slippage Protection | SWC-114, CWE-362 | `NEEDS_MANUAL_REVIEW` |
| **Pass 06** | Timestamp Dependency & Block Number Drift | SWC-116, CWE-829 | `HIGH_CONFIDENCE` |
| **Pass 07** | Denial of Service & Gas Griefing | SWC-128, CWE-400 | `HIGH_CONFIDENCE` |
| **Pass 08** | Reentrancy Vectors (State & Callbacks) | SWC-107, CWE-841 | `HIGH_CONFIDENCE` |
| **Pass 09** | Proxy & Storage Layout Collisions | SWC-124, CWE-665 | `HIGH_CONFIDENCE` |
| **Pass 10** | Token Specific Risks & Honeypot Taxes | SWC-135, CWE-269 | `HIGH_CONFIDENCE` |
| **Pass 11** | Assembly / Yul Memory & Dangerous Opcodes | SWC-127, CWE-78 | `HIGH_CONFIDENCE` |
| **Pass 12** | Centralization & Privileged Owner Key Risks | SWC-105, CWE-269 | `NEEDS_MANUAL_REVIEW` |
| **Pass 13** | Inter-Procedural Taint Dataflow Tracking | SWC-107, CWE-20 | `NEEDS_MANUAL_REVIEW` |
| **Pass 14** | Symbolic Execution & Invariant Path Solver | SWC-100 | `INFORMATIONAL` |

---

## Detailed Pass Specifications

### Pass 01: Access Control & Invariant Protections
- **SWC Mapping**: SWC-105 (Unprotected Ether Withdrawal), SWC-106 (Unprotected SELFDESTRUCT), CWE-284 (Improper Access Control).
- **Rule Description**: Detects state-modifying or fund-withdrawing functions that lack access control modifiers (`onlyOwner`, `onlyRole`). Identifies use of `tx.origin` for authentication and uninitialized proxy implementation contracts missing `_disableInitializers()`.
- **Remediation**: Apply OpenZeppelin `Ownable` / `AccessControl` modifiers; replace `tx.origin` with `msg.sender`.

### Pass 02: Arithmetic & Unchecked Block Analysis
- **SWC Mapping**: SWC-101 (Integer Overflow and Underflow), CWE-190.
- **Rule Description**: Detects arithmetic operations inside `unchecked { ... }` blocks or Yul assembly that lack explicit boundary guards, as well as division performed before multiplication causing rounding precision loss.
- **Remediation**: Use Solidity 0.8+ default checked math or OpenZeppelin `Math.mulDiv`.

### Pass 03: Oracle & Flash-Loan Price Manipulation
- **SWC Mapping**: SWC-115 (Authorization through tx.origin / Spot Price Manipulation), CWE-682.
- **Rule Description**: Flags direct queries to DEX spot reserves (`getReserves()`, `slot0`) without Time-Weighted Average Price (TWAP) or decentralized oracle validation (Chainlink/Pyth).
- **Remediation**: Implement Chainlink Price Feeds or minimum 30-minute Uniswap V3 TWAP windows.

### Pass 04: ERC-20 / NFT Return Compliance
- **SWC Mapping**: SWC-104 (Unchecked Call Return Value), CWE-252.
- **Rule Description**: Identifies raw `.transfer()` or `.transferFrom()` calls on ERC-20 tokens that do not return a boolean value (e.g. USDT), leading to silent transfer failures.
- **Remediation**: Use OpenZeppelin `SafeERC20` wrapper (`safeTransfer`, `safeTransferFrom`).

### Pass 05: Front-Running & MEV Slippage Protection
- **SWC Mapping**: SWC-114 (Transaction-Ordering Dependence), CWE-362.
- **Rule Description**: Flags DEX swap calls or liquidity additions lacking user-specified minimum output parameters (`amountOutMin`) or deadline constraints.
- **Remediation**: Require `minAmountOut` parameters and enforce `block.timestamp <= deadline`.

### Pass 06: Timestamp Dependency & Block Number Drift
- **SWC Mapping**: SWC-116 (Timestamp Dependence), CWE-829.
- **Rule Description**: Flags reliance on `block.timestamp` or `block.number` for pseudo-random number generation or strict time windows < 15 seconds (manipulable by validators).
- **Remediation**: Use Chainlink VRF for randomness; allow 15-second timestamp tolerances.

### Pass 07: Denial of Service & Gas Griefing
- **SWC Mapping**: SWC-128 (DoS with Block Gas Limit), CWE-400.
- **Rule Description**: Detects unbounded `for`/`while` loops iterating over dynamic storage arrays, and push-based ether transfer loops to arbitrary addresses.
- **Remediation**: Implement pull-over-push withdrawal patterns and cap maximum array iteration bounds.

### Pass 08: Reentrancy Vectors
- **SWC Mapping**: SWC-107 (Reentrancy), CWE-841.
- **Rule Description**: Identifies external calls (`.call{value: ...}`) executed before updating internal accounting state variables, as well as ERC-777 / ERC-1820 token transfer hook callbacks.
- **Remediation**: Apply Checks-Effects-Interactions (CEI) pattern or OpenZeppelin `ReentrancyGuard` (`nonReentrant`).

### Pass 09: Proxy & Storage Layout Collisions
- **SWC Mapping**: SWC-124 (Write to Arbitrary Storage Location), CWE-665.
- **Rule Description**: Flags upgradeable proxy contracts with state variable declarations in constructors, missing `__gap` storage padding, or unprotected `initialize()` functions.
- **Remediation**: Use OpenZeppelin `@openzeppelin/contracts-upgradeable` with `initializer` and `__gap`.

### Pass 10: Token Specific Risks & Honeypot Vectors
- **SWC Mapping**: SWC-135 (Code With No Effects / Honeypot), CWE-269.
- **Rule Description**: Detects transfer fee multipliers > 5%, uncapped admin minting functions, blacklist censorship methods, and arbitrary transfer pause controls.
- **Remediation**: Cap maximum transfer tax <= 3%, enforce immutable `MAX_SUPPLY`, and use multi-sig timelocks.

### Pass 11: Assembly / Yul Memory Safety
- **SWC Mapping**: SWC-127 (Fallback Function Security), CWE-78.
- **Rule Description**: Flags low-level `delegatecall` to user-supplied target addresses, `selfdestruct` usage, and raw inline assembly writing over free memory pointer slot `0x40`.
- **Remediation**: Avoid `delegatecall` to dynamic input and maintain 64-byte free memory pointer alignment.

### Pass 12: Centralization & Privileged Key Risks
- **SWC Mapping**: SWC-105, CWE-269.
- **Rule Description**: Flags critical protocol governance functions (fee rate updates, vault withdrawals) governed by a single EOA address without timelock or multi-sig requirement.
- **Remediation**: Transfer contract ownership to OpenZeppelin `TimelockController` or Gnosis Safe.

### Pass 13: Inter-Procedural Taint Dataflow Tracking
- **SWC Mapping**: SWC-107, CWE-20.
- **Rule Description**: Traces parameter propagation from entry point sources (`msg.sender`, `msg.value`, `calldata`) through internal function calls to sensitive state-mutating sinks.
- **Confidence**: `NEEDS_MANUAL_REVIEW` (Heuristic static taint analysis).

### Pass 14: Symbolic Execution & Path Constraint Engine
- **SWC Mapping**: SWC-100.
- **Rule Description**: Evaluates path constraint reachability for critical invariants and generates confidence scoring for the overall audit engagement. Provides CLI hooks for Slither / Mythril / Halmos formal verification engines.
- **Confidence**: `INFORMATIONAL`.
