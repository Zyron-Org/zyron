// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ZyronAttestation.sol";

contract ZyronAttestationTest is Test {
    ZyronAttestation public attestation;

    address public admin = address(this);
    address public operator = address(0x111);
    address public recipient = address(0x222);
    address public leadAuditor = address(0x444);
    address public peerAuditor = address(0x555);
    address public attacker = address(0x666);

    bytes32 public auditId = keccak256(abi.encodePacked("ZYR-9481"));
    bytes32 public bytecodeHash = keccak256(abi.encodePacked("deployed_bytecode_sha256"));
    bytes32 public merkleRoot = keccak256(abi.encodePacked("merkle_root_findings"));
    bytes32 public repoTreeHash = keccak256(abi.encodePacked("repo_tree_hash"));
    string  public gitCommit = "f402090ca289912040bb4129e34012948bbca102";
    string  public ipfsReportCid = "bafkreigjz7t5txj5xdmwgaxjt3yzc7gkzuecygcnq3gar24rhjatiujse4";
    string  public ipfsMetadataCid = "bafkreifhdyyqyfgymh25n4qnjgsqpg3dzzumj4nvkimn4bf46vq36cciu4";

    function setUp() public {
        attestation = new ZyronAttestation(operator);
    }

    function _buildInput() internal view returns (ZyronAttestation.AttestationInput memory) {
        return ZyronAttestation.AttestationInput({
            auditId: auditId,
            protocolName: "Zyron Test Protocol",
            targetContract: "VaultCore.sol",
            gitCommit: gitCommit,
            repoTreeHash: repoTreeHash,
            bytecodeHash: bytecodeHash,
            merkleRoot: merkleRoot,
            ipfsReportCid: ipfsReportCid,
            ipfsMetadataCid: ipfsMetadataCid,
            recipient: recipient,
            leadAuditor: leadAuditor,
            peerAuditor: peerAuditor,
            sloc: 2410
        });
    }

    // ─── PUBLISH TESTS ───────────────────────────────────────

    function test_PublishAttestationSuccess() public {
        ZyronAttestation.AttestationInput memory input = _buildInput();

        vm.prank(operator);
        uint256 tokenId = attestation.publishAttestation(input);

        assertEq(tokenId, 1);
        assertEq(attestation.attestationCount(), 1);

        ZyronAttestation.AttestationRecord memory record = attestation.verifyAttestation(auditId);
        assertEq(record.auditId, auditId);
        assertEq(record.bytecodeHash, bytecodeHash);
        assertEq(record.merkleRoot, merkleRoot);
        assertEq(record.repoTreeHash, repoTreeHash);
        assertEq(record.leadAuditor, leadAuditor);
        assertEq(record.recipient, recipient);
        assertEq(record.sloc, 2410);
        assertEq(keccak256(bytes(record.targetContract)), keccak256(bytes("VaultCore.sol")));
        assertEq(keccak256(bytes(record.gitCommit)), keccak256(bytes(gitCommit)));
        assertEq(keccak256(bytes(record.ipfsReportCid)), keccak256(bytes(ipfsReportCid)));
        assertTrue(record.isVerified);

        // Verify Soulbound NFT badge minting
        assertEq(attestation.balanceOf(recipient), 1);
        assertEq(attestation.ownerOf(tokenId), recipient);
        assertEq(
            attestation.tokenURI(tokenId),
            string(abi.encodePacked("ipfs://", ipfsMetadataCid))
        );
    }

    function test_SoulboundCannotBeTransferred() public {
        ZyronAttestation.AttestationInput memory input = _buildInput();

        vm.prank(operator);
        uint256 tokenId = attestation.publishAttestation(input);

        // Protocol attempts to transfer the soulbound badge to attacker
        vm.prank(recipient);
        vm.expectRevert("ZyronAttestation: Soulbound attestation badge cannot be transferred");
        attestation.transferFrom(recipient, attacker, tokenId);
    }

    function test_PublishDuplicateReverts() public {
        ZyronAttestation.AttestationInput memory input = _buildInput();

        vm.prank(operator);
        attestation.publishAttestation(input);

        vm.prank(operator);
        vm.expectRevert("ZyronAttestation: Attestation already exists for this audit ID");
        attestation.publishAttestation(input);
    }

    function test_PublishZeroLeadAuditorReverts() public {
        ZyronAttestation.AttestationInput memory input = _buildInput();
        input.leadAuditor = address(0);

        vm.prank(operator);
        vm.expectRevert("ZyronAttestation: Invalid lead auditor address");
        attestation.publishAttestation(input);
    }

    // ─── VERIFY LOOKUP TESTS ─────────────────────────────────

    function test_VerifyLookups() public {
        ZyronAttestation.AttestationInput memory input = _buildInput();

        vm.prank(operator);
        attestation.publishAttestation(input);

        // 1. By Audit ID
        ZyronAttestation.AttestationRecord memory r1 = attestation.verifyAttestation(auditId);
        assertTrue(r1.isVerified);

        // 2. By Bytecode Hash
        ZyronAttestation.AttestationRecord memory r2 = attestation.verifyByBytecodeHash(bytecodeHash);
        assertEq(r2.auditId, auditId);

        // 3. By IPFS Report CID
        ZyronAttestation.AttestationRecord memory r3 = attestation.verifyByReportCid(ipfsReportCid);
        assertEq(r3.auditId, auditId);

        // 4. By Git Commit SHA
        ZyronAttestation.AttestationRecord memory r4 = attestation.verifyByGitCommit(gitCommit);
        assertEq(r4.auditId, auditId);
    }

    // ─── REVOCATION TESTS ────────────────────────────────────

    function test_RevokeAttestation() public {
        ZyronAttestation.AttestationInput memory input = _buildInput();

        vm.prank(operator);
        attestation.publishAttestation(input);

        // Admin revokes
        attestation.revokeAttestation(auditId, "Critical vulnerability discovered in production");

        vm.expectRevert("ZyronAttestation: No verified attestation found for this audit ID");
        attestation.verifyAttestation(auditId);
    }

    // ─── MONAD TESTNET TESTS (CHAIN ID 10143) ──────────────────

    function test_MonadTestnetChainId() public {
        vm.chainId(10143);
        assertEq(block.chainid, 10143);

        ZyronAttestation monadAttestation = new ZyronAttestation(operator);
        assertEq(monadAttestation.operator(), operator);
        assertEq(monadAttestation.admin(), address(this));

        (
            bytes1 fields,
            string memory name,
            string memory version,
            uint256 chainId,
            address verifyingContract,
            bytes32 salt,
            uint256[] memory extensions
        ) = monadAttestation.eip712Domain();

        assertEq(chainId, 10143);
        assertEq(verifyingContract, address(monadAttestation));
        assertEq(keccak256(bytes(name)), keccak256(bytes("ZyronAttestation")));
        assertEq(keccak256(bytes(version)), keccak256(bytes("3.0.0")));
    }

    function test_PublishAttestationWithSignature_MonadTestnet() public {
        vm.chainId(10143);
        uint256 auditorPrivateKey = 0xA11CE;
        address auditorAddress = vm.addr(auditorPrivateKey);

        ZyronAttestation monadAttestation = new ZyronAttestation(operator);
        ZyronAttestation.AttestationInput memory input = _buildInput();
        input.leadAuditor = auditorAddress;

        uint8 status = 2; // MANUALLY_ATTESTED
        uint256 timestamp = block.timestamp;

        bytes32 structHash = keccak256(
            abi.encode(
                monadAttestation.ATTESTATION_TYPEHASH(),
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

        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("ZyronAttestation")),
                keccak256(bytes("3.0.0")),
                10143,
                address(monadAttestation)
            )
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(auditorPrivateKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        uint256 tokenId = monadAttestation.publishAttestationWithSignature(input, status, timestamp, signature);
        assertEq(tokenId, 1);
        assertTrue(monadAttestation.verifyAttestation(auditId).isVerified);
    }
}

