// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title ZyronAttestation
 * @notice Cryptographically verifiable on-chain attestation registry and Soulbound NFT Badge for smart contract audits.
 *
 * Capabilities:
 *  1. Multi-File & Repository Support: Git commit SHA, repo source tree Merkle root, target contract, and protocol name.
 *  2. Native IPFS Integration: Permanent binding to decentralized report PDF and ERC-721 metadata CIDs.
 *  3. Soulbound Security Seal: Non-transferable ERC-721 NFT minted to the protocol team displaying audit status in Web3 wallets.
 *  4. Flexible Attestation: Direct operator/admin publication and EIP-712 cryptographic auditor signature validation.
 */
contract ZyronAttestation is ERC721URIStorage, Pausable, EIP712 {
    using ECDSA for bytes32;

    address public admin;
    address public operator; // Hot wallet / multi-sig authorized for operator publications

    enum AttestationStatus { AUTOMATED_ONLY, PENDING_REVIEW, MANUALLY_ATTESTED, REVOKED }

    struct AttestationInput {
        bytes32 auditId;           // keccak256 hash of ticket ID (e.g. keccak256("ZYR-9481"))
        string  protocolName;      // Name of audited protocol (e.g. "Zyron Test Protocol")
        string  targetContract;    // Primary contract name (e.g. "VaultCore.sol")
        string  gitCommit;         // Git commit SHA (e.g. "f402090c...")
        bytes32 repoTreeHash;      // Merkle tree root or hash of repository source tree
        bytes32 bytecodeHash;      // SHA-256 hash of deployed contract bytecode
        bytes32 merkleRoot;        // Merkle root hash of audited findings
        string  ipfsReportCid;     // IPFS CID of compiled PDF audit report
        string  ipfsMetadataCid;   // IPFS CID of ERC-721 metadata JSON
        address recipient;         // Protocol owner / recipient of soulbound badge
        address leadAuditor;       // Lead human auditor wallet
        address peerAuditor;       // Peer reviewer wallet (address(0) if none)
        uint256 sloc;              // Lines of code reviewed
    }

    struct AttestationRecord {
        bytes32 auditId;
        string  protocolName;
        string  targetContract;
        string  gitCommit;
        bytes32 repoTreeHash;
        bytes32 bytecodeHash;
        bytes32 merkleRoot;
        string  ipfsReportCid;
        string  ipfsMetadataCid;
        address recipient;
        address leadAuditor;
        address peerAuditor;
        uint256 sloc;
        uint256 timestamp;
        uint256 tokenId;
        AttestationStatus status;
        bool    isVerified;
    }

    bytes32 public constant ATTESTATION_TYPEHASH = keccak256(
        "AttestationPayload(bytes32 auditId,bytes32 merkleRoot,bytes32 repoTreeHash,bytes32 bytecodeHash,address leadAuditor,uint256 sloc,uint8 status,uint256 timestamp)"
    );

    mapping(bytes32 => AttestationRecord) public registry;
    mapping(bytes32 => bytes32) public bytecodeToAuditId;
    mapping(string => bytes32) public reportCidToAuditId;
    mapping(string => bytes32) public gitCommitToAuditId;
    mapping(uint256 => bytes32) public tokenToAuditId;

    uint256 public attestationCount;

    event AttestationPublished(
        bytes32 indexed auditId,
        bytes32 indexed merkleRoot,
        bytes32 indexed bytecodeHash,
        address leadAuditor,
        address recipient,
        uint256 tokenId,
        string  ipfsReportCid,
        uint8   status,
        uint256 timestamp
    );

    event AttestationRevoked(bytes32 indexed auditId, string reason, uint256 timestamp);
    event OperatorUpdated(address indexed newOperator);
    event AdminUpdated(address indexed newAdmin);
    event AdminTransferInitiated(address indexed currentAdmin, address indexed pendingAdmin);

    address public pendingAdmin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "ZyronAttestation: Caller is not admin");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator || msg.sender == admin, "ZyronAttestation: Caller is not authorized operator");
        _;
    }

    constructor(address _operator)
        ERC721("Zyron Security Seal", "ZYRON-SEAL")
        EIP712("ZyronAttestation", "3.0.0")
    {
        require(_operator != address(0), "ZyronAttestation: Invalid operator address");
        admin = msg.sender;
        operator = _operator;
    }

    // ─── SOULBOUND NON-TRANSFERABLE HOOK ───────────────────────

    /**
     * @dev Enforces Soulbound behavior: tokens can be minted or burned, but cannot be transferred.
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("ZyronAttestation: Soulbound attestation badge cannot be transferred");
        }
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ─── DIRECT OPERATOR ATTESTATION PUBLICATION ───────────────

    /**
     * @notice Direct attestation publication by authorized operator or admin
     */
    function publishAttestation(AttestationInput calldata input)
        external
        onlyOperator
        whenNotPaused
        returns (uint256)
    {
        require(!registry[input.auditId].isVerified, "ZyronAttestation: Attestation already exists for this audit ID");
        require(input.leadAuditor != address(0), "ZyronAttestation: Invalid lead auditor address");

        return _recordAttestation(input, AttestationStatus.MANUALLY_ATTESTED, block.timestamp);
    }

    // ─── EIP-712 CRYPTOGRAPHIC AUDITOR ATTESTATION ────────────

    /**
     * @notice Verifiable EIP-712 typed data signed attestation publication
     */
    function publishAttestationWithSignature(
        AttestationInput calldata input,
        uint8 status,
        uint256 timestamp,
        bytes calldata signature
    )
        external
        whenNotPaused
        returns (uint256)
    {
        require(!registry[input.auditId].isVerified, "ZyronAttestation: Attestation already exists for this audit ID");
        require(status == uint8(AttestationStatus.MANUALLY_ATTESTED), "ZyronAttestation: Must be human-attested");

        bytes32 structHash = keccak256(
            abi.encode(
                ATTESTATION_TYPEHASH,
                input.auditId,
                input.merkleRoot,
                input.repoTreeHash,
                input.bytecodeHash,
                input.leadAuditor,
                input.sloc,
                status,
                timestamp
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address recoveredSigner = ECDSA.recover(digest, signature);
        require(
            recoveredSigner == input.leadAuditor || recoveredSigner == operator || recoveredSigner == admin,
            "ZyronAttestation: Invalid EIP-712 signature"
        );

        return _recordAttestation(input, AttestationStatus(status), timestamp);
    }

    // ─── INTERNAL ATTESTATION RECORDING & BADGE MINT ──────────

    function _recordAttestation(
        AttestationInput calldata input,
        AttestationStatus status,
        uint256 timestamp
    ) internal returns (uint256) {
        uint256 tokenId = ++attestationCount;

        AttestationRecord storage rec = registry[input.auditId];
        rec.auditId = input.auditId;
        rec.protocolName = input.protocolName;
        rec.targetContract = input.targetContract;
        rec.gitCommit = input.gitCommit;
        rec.repoTreeHash = input.repoTreeHash;
        rec.bytecodeHash = input.bytecodeHash;
        rec.merkleRoot = input.merkleRoot;
        rec.ipfsReportCid = input.ipfsReportCid;
        rec.ipfsMetadataCid = input.ipfsMetadataCid;
        rec.recipient = input.recipient;
        rec.leadAuditor = input.leadAuditor;
        rec.peerAuditor = input.peerAuditor;
        rec.sloc = input.sloc;
        rec.timestamp = timestamp;
        rec.tokenId = tokenId;
        rec.status = status;
        rec.isVerified = true;

        if (input.bytecodeHash != bytes32(0)) bytecodeToAuditId[input.bytecodeHash] = input.auditId;
        if (bytes(input.ipfsReportCid).length > 0) reportCidToAuditId[input.ipfsReportCid] = input.auditId;
        if (bytes(input.gitCommit).length > 0) gitCommitToAuditId[input.gitCommit] = input.auditId;
        tokenToAuditId[tokenId] = input.auditId;

        // Mint Soulbound NFT badge to protocol recipient
        address badgeOwner = input.recipient != address(0) ? input.recipient : input.leadAuditor;
        _safeMint(badgeOwner, tokenId);

        if (bytes(input.ipfsMetadataCid).length > 0) {
            _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", input.ipfsMetadataCid)));
        }

        emit AttestationPublished(
            input.auditId,
            input.merkleRoot,
            input.bytecodeHash,
            input.leadAuditor,
            badgeOwner,
            tokenId,
            input.ipfsReportCid,
            uint8(status),
            timestamp
        );

        return tokenId;
    }

    // ─── REVOCATION & VERIFICATION ────────────────────────────

    /**
     * @notice Revoke a previously published attestation (Admin only)
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

    function verifyByReportCid(string calldata ipfsReportCid) external view returns (AttestationRecord memory) {
        bytes32 auditId = reportCidToAuditId[ipfsReportCid];
        require(auditId != bytes32(0) && registry[auditId].isVerified, "ZyronAttestation: No attestation found for report CID");
        return registry[auditId];
    }

    function verifyByGitCommit(string calldata gitCommit) external view returns (AttestationRecord memory) {
        bytes32 auditId = gitCommitToAuditId[gitCommit];
        require(auditId != bytes32(0) && registry[auditId].isVerified, "ZyronAttestation: No attestation found for git commit");
        return registry[auditId];
    }

    // ─── ADMIN CONTROLS ───────────────────────────────────────

    function pause() external onlyAdmin { _pause(); }
    function unpause() external onlyAdmin { _unpause(); }

    function setOperator(address _newOperator) external onlyAdmin {
        require(_newOperator != address(0), "ZyronAttestation: Invalid operator");
        operator = _newOperator;
        emit OperatorUpdated(_newOperator);
    }

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
