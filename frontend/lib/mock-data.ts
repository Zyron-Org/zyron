export type PipelineStage =
  | "pending"
  | "scanning"
  | "in-review"
  | "completed"
  | "failed";

export interface FindingCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  resolved: number;
}

export interface AuditRequest {
  id: string;
  protocolName: string;
  contractFileName: string;
  contractAddress: string;
  gitCommit: string;
  compilerVersion: string;
  sloc: number;
  stage: PipelineStage;
  stageNumber: 1 | 2 | 3 | 4;
  submittedAt: string;
  estimatedCompletion?: string;
  completedAt?: string;
  assignedAuditor?: string;
  peerAuditor?: string;
  findings: FindingCounts;
  bytecodeHash?: string;
  reportPdfUrl?: string;
  pdfSize?: string;
  roundsToResolution?: number;
  failureReason?: string;
  currentActivity?: string;
  onChainTxHash?: string;
  onChainChainId?: number;
}

export const MOCK_AUDIT_REQUESTS: AuditRequest[] = [
  {
    id: "ZYR-9481",
    protocolName: "Aura Liquidity Pool V3",
    contractFileName: "VaultCore.sol",
    contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    gitCommit: "8f9b2d4",
    compilerVersion: "v0.8.20",
    sloc: 2410,
    stage: "scanning",
    stageNumber: 2,
    submittedAt: "2026-08-18 21:30 UTC",
    estimatedCompletion: "2026-08-21 18:00 UTC",
    assignedAuditor: "0xAuditor_K4",
    currentActivity: "Symbolic EVM execution pass 11/14 — reentrancy graph analysis",
    findings: {
      critical: 1,
      high: 1,
      medium: 2,
      low: 0,
      resolved: 0,
    },
  },
  {
    id: "ZYR-9478",
    protocolName: "Nexus Collateral Vault",
    contractFileName: "CollateralManager.sol",
    contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    gitCommit: "3c1a9f0",
    compilerVersion: "v0.8.24",
    sloc: 1180,
    stage: "in-review",
    stageNumber: 3,
    submittedAt: "2026-08-17 14:15 UTC",
    estimatedCompletion: "2026-08-20 12:00 UTC",
    assignedAuditor: "0xAuditor_K4",
    peerAuditor: "0xAuditor_V9",
    currentActivity: "Manual line review: liquidation fee precision & invariant check",
    findings: {
      critical: 0,
      high: 2,
      medium: 1,
      low: 3,
      resolved: 1,
    },
  },
  {
    id: "ZYR-9485",
    protocolName: "PerpetualOrderBook",
    contractFileName: "OrderEngine.sol",
    contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    gitCommit: "e5d28b1",
    compilerVersion: "v0.8.23",
    sloc: 3240,
    stage: "pending",
    stageNumber: 1,
    submittedAt: "2026-08-19 22:45 UTC",
    estimatedCompletion: "2026-08-23 00:00 UTC",
    currentActivity: "Bytecode ingested — compiler version locked, awaiting scanner queue",
    findings: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      resolved: 0,
    },
  },
  {
    id: "ZYR-9462",
    protocolName: "StakingRewardsDistributor",
    contractFileName: "StakingPool.sol",
    contractAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    gitCommit: "7a8e2b9",
    compilerVersion: "v0.8.20",
    sloc: 640,
    stage: "completed",
    stageNumber: 4,
    submittedAt: "2026-08-14 09:00 UTC",
    completedAt: "2026-08-16 16:30 UTC",
    assignedAuditor: "0xAuditor_V9",
    peerAuditor: "0xAuditor_M2",
    bytecodeHash: "0x3e9f4a8b71d6012c8849b209d7c04419f8a32d645e771b",
    reportPdfUrl: "/reports/ZYR-9462-StakingPool.pdf",
    pdfSize: "1.8 MB",
    roundsToResolution: 2,
    findings: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      resolved: 3,
    },
  },
  {
    id: "ZYR-9449",
    protocolName: "YieldAggregatorV2",
    contractFileName: "StrategyRouter.sol",
    contractAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    gitCommit: "1b4c9e8",
    compilerVersion: "v0.8.19",
    sloc: 1890,
    stage: "completed",
    stageNumber: 4,
    submittedAt: "2026-08-10 11:20 UTC",
    completedAt: "2026-08-13 18:00 UTC",
    assignedAuditor: "0xAuditor_K4",
    peerAuditor: "0xAuditor_M2",
    bytecodeHash: "0x9812f84bc0192e471d99482bf47712a884910cf9281729",
    reportPdfUrl: "/reports/ZYR-9449-StrategyRouter.pdf",
    pdfSize: "3.2 MB",
    roundsToResolution: 3,
    findings: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      resolved: 9,
    },
  },
  {
    id: "ZYR-9471",
    protocolName: "CrossChainBridgeRouter",
    contractFileName: "BridgeEndpoint.sol",
    contractAddress: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
    gitCommit: "9c3d4f1",
    compilerVersion: "v0.8.20",
    sloc: 1450,
    stage: "failed",
    stageNumber: 1,
    submittedAt: "2026-08-16 08:30 UTC",
    completedAt: "2026-08-16 08:32 UTC",
    failureReason: "Compilation failed: Missing interface import '@interfaces/IBridgeReceiver.sol' in compilation unit.",
    findings: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      resolved: 0,
    },
  },
];

export interface ClientProfile {
  name: string;
  organization: string;
  address: string;
  tier: string;
  totalAuditedSloc: number;
  activeTickets: number;
  completedTickets: number;
}

export const MOCK_CLIENT_PROFILE: ClientProfile = {
  name: "Aura Core Protocol",
  organization: "Aura Finance DAO",
  address: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
  tier: "Enterprise Protocol Scope",
  totalAuditedSloc: 9370,
  activeTickets: 3,
  completedTickets: 2,
};

export interface SolContractFile {
  path: string;
  fileName: string;
  sloc: number;
  commit: string;
  sourceCode: string;
}

export interface MockRepository {
  id: string;
  name: string;
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string;
  branches: string[];
  lastUpdated: string;
  contractFiles: SolContractFile[];
}

export const MOCK_REPOSITORIES: MockRepository[] = [
  {
    id: "repo-1",
    name: "core-vaults",
    fullName: "aura-finance/core-vaults",
    isPrivate: true,
    defaultBranch: "main",
    branches: ["main", "feat/v3-collateral-fix", "staging"],
    lastUpdated: "2 hours ago",
    contractFiles: [
      {
        path: "contracts/VaultCore.sol",
        fileName: "VaultCore.sol",
        sloc: 1482,
        commit: "8f9b2d4c01e9a37",
        sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title VaultCore - Liquidity collateral vault
/// @notice Manages multi-asset staking deposits and yield distributions
contract VaultCore is ReentrancyGuard, Ownable {
    mapping(address => uint256) public userBalances;
    uint256 public totalVaultCollateral;
    IERC20 public immutable rewardToken;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
    }

    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Zero deposit");
        userBalances[msg.sender] += msg.value;
        totalVaultCollateral += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdrawAll() external nonReentrant {
        uint256 amount = userBalances[msg.sender];
        require(amount > 0, "No balance");

        // Checks-Effects-Interactions
        userBalances[msg.sender] = 0;
        totalVaultCollateral -= amount;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }
}`,
      },
      {
        path: "contracts/CollateralManager.sol",
        fileName: "CollateralManager.sol",
        sloc: 1180,
        commit: "3c1a9f0d8e27a61",
        sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title CollateralManager - Multi-tier liquidation engine
contract CollateralManager is AccessControl {
    using SafeERC20 for IERC20;
    bytes32 public constant LIQUIDATOR_ROLE = keccak256("LIQUIDATOR_ROLE");
    uint256 public constant LIQUIDATION_THRESHOLD = 8000; // 80%

    mapping(address => uint256) public collateralRatios;

    function liquidatePosition(address borrower, uint256 debtToCover) external onlyRole(LIQUIDATOR_ROLE) {
        require(collateralRatios[borrower] < LIQUIDATION_THRESHOLD, "Position healthy");
        // Liquidation logic executed
    }
}`,
      },
    ],
  },
  {
    id: "repo-2",
    name: "staking-rewards",
    fullName: "aura-finance/staking-rewards",
    isPrivate: false,
    defaultBranch: "main",
    branches: ["main", "audit-remediation"],
    lastUpdated: "1 day ago",
    contractFiles: [
      {
        path: "contracts/StakingPool.sol",
        fileName: "StakingPool.sol",
        sloc: 640,
        commit: "7a8e2b9c5d10f34",
        sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingPool is ReentrancyGuard {
    IERC20 public immutable stakingToken;
    uint256 public rewardRate = 100;
    mapping(address => uint256) public stakedBalance;

    constructor(address _token) {
        stakingToken = IERC20(_token);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        stakedBalance[msg.sender] += amount;
    }
}`,
      },
    ],
  },
  {
    id: "repo-3",
    name: "yield-strategies",
    fullName: "aura-finance/yield-strategies",
    isPrivate: true,
    defaultBranch: "master",
    branches: ["master", "v2-balancer-pool"],
    lastUpdated: "3 days ago",
    contractFiles: [
      {
        path: "contracts/StrategyRouter.sol",
        fileName: "StrategyRouter.sol",
        sloc: 1890,
        commit: "1b4c9e8f7a2d309",
        sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract StrategyRouter is Ownable {
    address[] public activeStrategies;
    uint256 public totalAllocatedCapital;

    function rebalanceAll() external onlyOwner {
        // Multi-dex router execution
    }
}`,
      },
    ],
  },
  {
    id: "repo-4",
    name: "cross-chain-router",
    fullName: "aura-finance/cross-chain-router",
    isPrivate: false,
    defaultBranch: "main",
    branches: ["main", "develop"],
    lastUpdated: "5 days ago",
    contractFiles: [
      {
        path: "contracts/BridgeEndpoint.sol",
        fileName: "BridgeEndpoint.sol",
        sloc: 1450,
        commit: "9c3d4f1a2b8e7c0",
        sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BridgeEndpoint {
    mapping(bytes32 => bool) public processedPayloads;
    event CrossChainMessage(address indexed sender, uint256 dstChainId, bytes payload);

    function sendMessage(uint256 dstChainId, bytes calldata payload) external payable {
        emit CrossChainMessage(msg.sender, dstChainId, payload);
    }
}`,
      },
    ],
  },
];
