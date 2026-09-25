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

export const OPEN_SOURCE_TEST_PROJECT: MockRepository = {
  id: "uniswap-v2-core",
  name: "v2-core",
  fullName: "Uniswap/v2-core",
  isPrivate: false,
  defaultBranch: "master",
  branches: ["master", "dev", "staging"],
  lastUpdated: "Open Source AMM",
  contractFiles: [
    {
      path: "contracts/UniswapV2Pair.sol",
      fileName: "UniswapV2Pair.sol",
      sloc: 201,
      commit: "6a9e7c97860676e0992f22a49665760444c1cdf5",
      sourceCode: `pragma solidity =0.5.16;

import './interfaces/IUniswapV2Pair.sol';
import './UniswapV2ERC20.sol';
import './libraries/Math.sol';
import './libraries/UQ112x112.sol';
import './interfaces/IERC20.sol';
import './interfaces/IUniswapV2Factory.sol';
import './interfaces/IUniswapV2Callee.sol';

contract UniswapV2Pair is IUniswapV2Pair, UniswapV2ERC20 {
    using SafeMath  for uint;
    using UQ112x112 for uint224;

    uint public constant MINIMUM_LIQUIDITY = 10**3;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    address public factory;
    address public token0;
    address public token1;

    uint112 private reserve0;           // uses single storage slot, accessible via getReserves
    uint112 private reserve1;           // uses single storage slot, accessible via getReserves
    uint32  private blockTimestampLast; // uses single storage slot, accessible via getReserves

    uint public price0CumulativeLast;
    uint public price1CumulativeLast;
    uint public kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'UniswapV2: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    function _safeTransfer(address token, address to, uint value) private {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'UniswapV2: TRANSFER_FAILED');
    }

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    constructor() public {
        factory = msg.sender;
    }

    // called once by the factory at time of deployment
    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, 'UniswapV2: FORBIDDEN'); // sufficient check
        token0 = _token0;
        token1 = _token1;
    }

    // update reserves and, on the first call per block, price accumulators
    function _update(uint balance0, uint balance1, uint112 _reserve0, uint112 _reserve1) private {
        require(balance0 <= uint112(-1) && balance1 <= uint112(-1), 'UniswapV2: OVERFLOW');
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
            price0CumulativeLast += uint(UQ112x112.encode(_reserve1).uqdiv(_reserve0)) * timeElapsed;
            price1CumulativeLast += uint(UQ112x112.encode(_reserve0).uqdiv(_reserve1)) * timeElapsed;
        }
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = blockTimestamp;
        emit Sync(reserve0, reserve1);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to) external lock returns (uint liquidity) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        uint amount0 = balance0.sub(_reserve0);
        uint amount1 = balance1.sub(_reserve1);

        bool feeOn = false;
        uint _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);
           _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
        }
        require(liquidity > 0, 'UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED');
        _mint(to, liquidity);

        _update(balance0, balance1, _reserve0, _reserve1);
        emit Mint(msg.sender, amount0, amount1);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external lock {
        require(amount0Out > 0 || amount1Out > 0, 'UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT');
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        require(amount0Out < _reserve0 && amount1Out < _reserve1, 'UniswapV2: INSUFFICIENT_LIQUIDITY');

        uint balance0;
        uint balance1;
        {
        address _token0 = token0;
        address _token1 = token1;
        require(to != _token0 && to != _token1, 'UniswapV2: INVALID_TO');
        if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out);
        if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out);
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));
        }
        uint amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, 'UniswapV2: INSUFFICIENT_INPUT_AMOUNT');

        _update(balance0, balance1, _reserve0, _reserve1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    function sync() external lock {
        _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)), reserve0, reserve1);
    }
}`,
    },
  ],
};

export const MOCK_REPOSITORIES: MockRepository[] = [OPEN_SOURCE_TEST_PROJECT];

