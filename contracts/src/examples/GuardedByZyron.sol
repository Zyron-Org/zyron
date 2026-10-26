// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IZyronAttestation.sol";

/**
 * @title GuardedByZyron
 * @notice Developer infrastructure primitive: Inherit this contract or use its modifier
 * in any Monad protocol, DeFi vault, or ERC-8004 AI Agent to automatically enforce that
 * external contracts, collateral adapters, or strategy plugins possess an active,
 * non-revoked cryptographic audit attestation on Monad Testnet before execution.
 *
 * Example Integration:
 * ```solidity
 * contract SafeLendingPool is GuardedByZyron {
 *     constructor(address _zyron) GuardedByZyron(_zyron) {}
 *
 *     function addCollateralToken(address tokenContract) external onlyAttestedTarget(tokenContract) {
 *         // Guaranteed to be audited and invariant-verified by Zyron!
 *     }
 * }
 * ```
 */
abstract contract GuardedByZyron {
    IZyronAttestation public immutable zyronRegistry;

    error TargetContractNotAttested(address targetContract, bytes32 bytecodeHash);
    error TargetContractRevoked(address targetContract, bytes32 auditId);

    event SecurityCheckPassed(address indexed targetContract, bytes32 indexed auditId, uint256 timestamp);

    constructor(address _zyronRegistry) {
        require(_zyronRegistry != address(0), "GuardedByZyron: Invalid registry address");
        zyronRegistry = IZyronAttestation(_zyronRegistry);
    }

    /**
     * @notice Ensures that the given contract address has its deployed bytecode
     * cryptographically verified and attested in the Zyron Monad registry.
     */
    modifier onlyAttestedTarget(address targetContract) {
        require(targetContract.code.length > 0, "GuardedByZyron: Target has no code");
        bytes32 codeHash = targetContract.codehash;

        try zyronRegistry.verifyByBytecodeHash(codeHash) returns (IZyronAttestation.AttestationRecord memory record) {
            if (!record.isVerified || record.status == IZyronAttestation.AttestationStatus.REVOKED) {
                revert TargetContractRevoked(targetContract, record.auditId);
            }
            emit SecurityCheckPassed(targetContract, record.auditId, block.timestamp);
        } catch {
            revert TargetContractNotAttested(targetContract, codeHash);
        }
        _;
    }

    /**
     * @notice Helper to check attestation status off-chain or in view functions.
     */
    function isContractAttested(address targetContract) external view returns (bool, IZyronAttestation.AttestationRecord memory) {
        if (targetContract.code.length == 0) {
            return (false, IZyronAttestation.AttestationRecord({
                auditId: bytes32(0),
                protocolName: "",
                targetContract: "",
                gitCommit: "",
                repoTreeHash: bytes32(0),
                bytecodeHash: bytes32(0),
                merkleRoot: bytes32(0),
                ipfsReportCid: "",
                ipfsMetadataCid: "",
                recipient: address(0),
                leadAuditor: address(0),
                peerAuditor: address(0),
                sloc: 0,
                timestamp: 0,
                tokenId: 0,
                status: IZyronAttestation.AttestationStatus.AUTOMATED_ONLY,
                isVerified: false
            }));
        }

        try zyronRegistry.verifyByBytecodeHash(targetContract.codehash) returns (IZyronAttestation.AttestationRecord memory record) {
            return (record.isVerified, record);
        } catch {
            return (false, IZyronAttestation.AttestationRecord({
                auditId: bytes32(0),
                protocolName: "",
                targetContract: "",
                gitCommit: "",
                repoTreeHash: bytes32(0),
                bytecodeHash: bytes32(0),
                merkleRoot: bytes32(0),
                ipfsReportCid: "",
                ipfsMetadataCid: "",
                recipient: address(0),
                leadAuditor: address(0),
                peerAuditor: address(0),
                sloc: 0,
                timestamp: 0,
                tokenId: 0,
                status: IZyronAttestation.AttestationStatus.AUTOMATED_ONLY,
                isVerified: false
            }));
        }
    }
}
