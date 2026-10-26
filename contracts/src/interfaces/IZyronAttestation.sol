// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IZyronAttestation
 * @notice On-chain developer interface for the Zyron Trust & Attestation Primitive on Monad.
 * Protocols, ERC-8004 AI agents, and DeFi security gates can query this interface to
 * programmatically verify whether target contract bytecodes or commits carry a valid,
 * cryptographically sealed audit attestation before interacting with them.
 */
interface IZyronAttestation {
    enum AttestationStatus {
        AUTOMATED_ONLY,
        PENDING_REVIEW,
        MANUALLY_ATTESTED,
        REVOKED
    }

    struct AttestationInput {
        bytes32 auditId;
        string protocolName;
        string targetContract;
        string gitCommit;
        bytes32 repoTreeHash;
        bytes32 bytecodeHash;
        bytes32 merkleRoot;
        string ipfsReportCid;
        string ipfsMetadataCid;
        address recipient;
        address leadAuditor;
        address peerAuditor;
        uint256 sloc;
    }

    struct AttestationRecord {
        bytes32 auditId;
        string protocolName;
        string targetContract;
        string gitCommit;
        bytes32 repoTreeHash;
        bytes32 bytecodeHash;
        bytes32 merkleRoot;
        string ipfsReportCid;
        string ipfsMetadataCid;
        address recipient;
        address leadAuditor;
        address peerAuditor;
        uint256 sloc;
        uint256 timestamp;
        uint256 tokenId;
        AttestationStatus status;
        bool isVerified;
    }

    // ── Verification Methods ──
    function verifyAttestation(bytes32 auditId) external view returns (AttestationRecord memory);
    function verifyByBytecodeHash(bytes32 bytecodeHash) external view returns (AttestationRecord memory);
    function verifyByReportCid(string calldata ipfsReportCid) external view returns (AttestationRecord memory);
    function verifyByGitCommit(string calldata gitCommit) external view returns (AttestationRecord memory);

    // ── Publishing Methods ──
    function publishAttestation(AttestationInput calldata input) external returns (uint256);
    function publishAttestationWithSignature(
        AttestationInput calldata input,
        uint8 status,
        uint256 timestamp,
        bytes calldata signature
    ) external returns (uint256);

    // ── ERC-721 Soulbound Metadata ──
    function tokenURI(uint256 tokenId) external view returns (string memory);
    function attestationCount() external view returns (uint256);
}
