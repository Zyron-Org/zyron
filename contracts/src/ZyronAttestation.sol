// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title ZyronAttestation
 * @dev Cryptographically verifiable EIP-712 on-chain attestation registry for smart contract audit reports.
 */
contract ZyronAttestation is Pausable, EIP712 {
    using ECDSA for bytes32;

    address public admin;
    address public operator; // Authorized backend hot wallet / multi-sig signer

    enum AttestationStatus { AUTOMATED_ONLY, PENDING_REVIEW, MANUALLY_ATTESTED, REVOKED }

    struct AttestationRecord {
        bytes32 auditId;           // keccak256 hash of ticket ID (e.g. keccak256("ZYR-9481"))
        bytes32 merkleRoot;        // Merkle root hash of audited findings
        bytes32 bytecodeHash;      // SHA-256 hash of deployed contract bytecode
        bytes32 sourceHash;        // SHA-256 hash of source code
        bytes32 reportHash;        // SHA-256 hash of PDF report
        address leadAuditor;       // Wallet address of lead auditor
        address peerAuditor;       // Wallet address of peer auditor
        uint256 sloc;              // Lines of code count
        uint256 timestamp;         // Attestation seal timestamp
        string  contractFileName;  // Primary contract name (e.g. "VaultCore.sol")
        AttestationStatus status;  // Attestation status
        bool    isVerified;        // Verification flag
    }

    bytes32 public constant ATTESTATION_TYPEHASH = keccak256(
        "AttestationPayload(bytes32 auditId,bytes32 merkleRoot,bytes32 bytecodeHash,bytes32 sourceHash,address leadAuditor,uint256 sloc,uint8 status,uint256 timestamp)"
    );

    mapping(bytes32 => AttestationRecord) public registry;
    mapping(bytes32 => bytes32) public bytecodeToAuditId;
    mapping(bytes32 => bytes32) public reportToAuditId;
    uint256 public attestationCount;

    event AttestationPublished(
        bytes32 indexed auditId,
        bytes32 indexed merkleRoot,
        bytes32 indexed bytecodeHash,
        address leadAuditor,
        uint256 sloc,
        string contractFileName,
        uint8 status,
        uint256 timestamp
    );

    event AttestationRevoked(bytes32 indexed auditId, string reason, uint256 timestamp);
    event OperatorUpdated(address indexed newOperator);
    event AdminUpdated(address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "ZyronAttestation: Caller is not admin");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator || msg.sender == admin, "ZyronAttestation: Caller is not authorized operator");
        _;
    }

    constructor(address _operator) EIP712("ZyronAttestation", "3.0.0") {
        require(_operator != address(0), "ZyronAttestation: Invalid operator address");
        admin = msg.sender;
        operator = _operator;
    }

    /**
     * @notice Operator direct attestation publication
     */
    function publishAttestation(
        bytes32 auditId,
        bytes32 bytecodeHash,
        bytes32 reportHash,
        address leadAuditor,
        address peerAuditor,
        uint256 sloc,
        string calldata contractFileName
    ) external onlyOperator whenNotPaused {
        require(!registry[auditId].isVerified, "ZyronAttestation: Attestation already exists for this audit ID");
        require(bytecodeHash != bytes32(0), "ZyronAttestation: Invalid bytecode hash");
        require(reportHash != bytes32(0), "ZyronAttestation: Invalid report hash");
        require(leadAuditor != address(0), "ZyronAttestation: Invalid lead auditor address");

        AttestationRecord storage rec = registry[auditId];
        rec.auditId = auditId;
        rec.merkleRoot = reportHash;
        rec.bytecodeHash = bytecodeHash;
        rec.sourceHash = bytes32(0);
        rec.reportHash = reportHash;
        rec.leadAuditor = leadAuditor;
        rec.peerAuditor = peerAuditor;
        rec.sloc = sloc;
        rec.timestamp = block.timestamp;
        rec.contractFileName = contractFileName;
        rec.status = AttestationStatus.AUTOMATED_ONLY;
        rec.isVerified = true;

        bytecodeToAuditId[bytecodeHash] = auditId;
        reportToAuditId[reportHash] = auditId;
        attestationCount++;

        emit AttestationPublished(
            auditId,
            reportHash,
            bytecodeHash,
            leadAuditor,
            sloc,
            contractFileName,
            uint8(AttestationStatus.AUTOMATED_ONLY),
            block.timestamp
        );
    }

    /**
     * @notice Publish verifiable audit attestation signed via EIP-712 typed data
     */
    function publishAttestationWithSignature(
        bytes32 auditId,
        bytes32 merkleRoot,
        bytes32 bytecodeHash,
        bytes32 sourceHash,
        address leadAuditor,
        address peerAuditor,
        uint256 sloc,
        string calldata contractFileName,
        uint8 status,
        uint256 timestamp,
        bytes calldata signature
    ) external whenNotPaused {
        require(!registry[auditId].isVerified, "ZyronAttestation: Attestation already exists for this audit ID");
        require(bytecodeHash != bytes32(0), "ZyronAttestation: Invalid bytecode hash");
        require(status == uint8(AttestationStatus.MANUALLY_ATTESTED), "ZyronAttestation: Must be human-attested");

        bytes32 structHash = keccak256(
            abi.encode(
                ATTESTATION_TYPEHASH,
                auditId,
                merkleRoot,
                bytecodeHash,
                sourceHash,
                leadAuditor,
                sloc,
                status,
                timestamp
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address recoveredSigner = ECDSA.recover(digest, signature);
        require(
            recoveredSigner == leadAuditor || recoveredSigner == operator || recoveredSigner == admin,
            "ZyronAttestation: Invalid EIP-712 signature"
        );

        AttestationRecord storage rec = registry[auditId];
        rec.auditId = auditId;
        rec.merkleRoot = merkleRoot;
        rec.bytecodeHash = bytecodeHash;
        rec.sourceHash = sourceHash;
        rec.reportHash = merkleRoot;
        rec.leadAuditor = leadAuditor;
        rec.peerAuditor = peerAuditor;
        rec.sloc = sloc;
        rec.timestamp = timestamp;
        rec.contractFileName = contractFileName;
        rec.status = AttestationStatus(status);
        rec.isVerified = true;

        if (bytecodeHash != bytes32(0)) bytecodeToAuditId[bytecodeHash] = auditId;
        if (merkleRoot != bytes32(0)) reportToAuditId[merkleRoot] = auditId;
        attestationCount++;

        emit AttestationPublished(auditId, merkleRoot, bytecodeHash, leadAuditor, sloc, contractFileName, status, timestamp);
    }

    /**
     * @notice Revoke a previously published attestation
     */
    function revokeAttestation(bytes32 auditId, string calldata reason) external onlyAdmin {
        require(registry[auditId].isVerified, "ZyronAttestation: Attestation does not exist");
        require(registry[auditId].status != AttestationStatus.REVOKED, "ZyronAttestation: Already revoked");
        registry[auditId].status = AttestationStatus.REVOKED;
        registry[auditId].isVerified = false; // Revoked records fail all verify() calls
        emit AttestationRevoked(auditId, reason, block.timestamp);
    }

    function verifyAttestation(bytes32 auditId) external view returns (AttestationRecord memory) {
        require(registry[auditId].isVerified, "ZyronAttestation: No verified attestation found for this audit ID");
        return registry[auditId];
    }

    function verifyByBytecodeHash(bytes32 bytecodeHash) external view returns (AttestationRecord memory) {
        bytes32 auditId = bytecodeToAuditId[bytecodeHash];
        require(auditId != bytes32(0) && registry[auditId].isVerified, "ZyronAttestation: No attestation found for bytecode hash");
        return registry[auditId];
    }

    function verifyByReportHash(bytes32 reportHash) external view returns (AttestationRecord memory) {
        bytes32 auditId = reportToAuditId[reportHash];
        require(auditId != bytes32(0) && registry[auditId].isVerified, "ZyronAttestation: No attestation found for report hash");
        return registry[auditId];
    }

    function pause() external onlyAdmin { _pause(); }
    function unpause() external onlyAdmin { _unpause(); }

    function setOperator(address _newOperator) external onlyAdmin {
        require(_newOperator != address(0), "ZyronAttestation: Invalid operator");
        operator = _newOperator;
        emit OperatorUpdated(_newOperator);
    }

    // ── Two-step admin transfer ──────────────────────────────────
    address public pendingAdmin;

    event AdminTransferInitiated(address indexed currentAdmin, address indexed pendingAdmin);

    function initiateAdminTransfer(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "ZyronAttestation: Invalid admin");
        pendingAdmin = _newAdmin;
        emit AdminTransferInitiated(admin, _newAdmin);
    }

    function acceptAdminTransfer() external {
        require(msg.sender == pendingAdmin, "ZyronAttestation: Only pending admin can accept");
        admin = pendingAdmin;
        pendingAdmin = address(0);
        emit AdminUpdated(admin);
    }
}
