import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ethers, keccak256, toUtf8Bytes } from 'ethers';
import { PrismaService } from '../../database/database.module';
import { ChainConfigService } from './chain-config.service';
import { getDefaultAttestationChainId } from '../constants';
import { normalizeBytes32 } from '../utils';

// Mirrors ZyronAttestation.AttestationInput in zyron-contracts/src/ZyronAttestation.sol.
const ATTESTATION_INPUT =
  'tuple(bytes32 auditId, string protocolName, string targetContract, string gitCommit, bytes32 repoTreeHash, bytes32 bytecodeHash, bytes32 merkleRoot, string ipfsReportCid, string ipfsMetadataCid, address recipient, address leadAuditor, address peerAuditor, uint256 sloc)';

// Mirrors ZyronAttestation.AttestationRecord.
const ATTESTATION_RECORD =
  'tuple(bytes32 auditId, string protocolName, string targetContract, string gitCommit, bytes32 repoTreeHash, bytes32 bytecodeHash, bytes32 merkleRoot, string ipfsReportCid, string ipfsMetadataCid, address recipient, address leadAuditor, address peerAuditor, uint256 sloc, uint256 timestamp, uint256 tokenId, uint8 status, bool isVerified)';

const ZYRON_ATTESTATION_ABI = [
  `function publishAttestation(${ATTESTATION_INPUT} input) external returns (uint256)`,
  `function publishAttestationWithSignature(${ATTESTATION_INPUT} input, uint8 status, uint256 timestamp, bytes signature) external returns (uint256)`,
  `function verifyAttestation(bytes32 auditId) external view returns (${ATTESTATION_RECORD})`,
];

/** Build the on-chain AttestationInput struct from a persisted audit. */
function buildAttestationInput(
  audit: any,
  overrides: { leadAuditor: string; merkleRoot?: string; bytecodeHash?: string; repoTreeHash?: string; sloc?: number },
) {
  const validLeadAuditor =
    overrides.leadAuditor && ethers.isAddress(overrides.leadAuditor) && overrides.leadAuditor !== ethers.ZeroAddress
      ? overrides.leadAuditor
      : '0x48b106E3C8681D08c513268854Aef257883298d3';

  const validPeerAuditor =
    audit.peerAuditor?.walletAddress && ethers.isAddress(audit.peerAuditor.walletAddress)
      ? audit.peerAuditor.walletAddress
      : ethers.ZeroAddress;

  return {
    auditId: keccak256(toUtf8Bytes(audit.id)),
    protocolName: audit.protocolName || '',
    targetContract: audit.contractFileName || 'Contract.sol',
    gitCommit: audit.gitCommit || '',
    repoTreeHash: normalizeBytes32(overrides.repoTreeHash ?? audit.sourceHash),
    bytecodeHash: normalizeBytes32(overrides.bytecodeHash ?? audit.bytecodeHash),
    merkleRoot: normalizeBytes32(overrides.merkleRoot ?? audit.merkleRoot),
    ipfsReportCid: audit.ipfsCid || '',
    ipfsMetadataCid: audit.ipfsMetadataCid || '',
    // address(0) → the contract mints the soulbound badge to the lead auditor.
    recipient: ethers.ZeroAddress,
    leadAuditor: validLeadAuditor,
    peerAuditor: validPeerAuditor,
    sloc: overrides.sloc ?? (audit.sloc || 100),
  };
}

@Injectable()
export class AttestationSubmitterService {
  private readonly logger = new Logger(AttestationSubmitterService.name);

  constructor(
    private prisma: PrismaService,
    private chainConfig: ChainConfigService,
  ) {}

  /**
   * Submit automated on-chain attestation via operator wallet.
   */
  async submitAutomatedAttestation(auditId: string, targetChainId?: number): Promise<{ txHash: string; chainId: number }> {
    const audit = await this.prisma.auditRequest.findUnique({
      where: { id: auditId },
      include: { leadAuditor: true, peerAuditor: true },
    });

    if (!audit) throw new BadRequestException(`Audit ${auditId} not found`);

    if (audit.onChainTxHash && (audit.attestationStatus === 'CONFIRMED' || audit.attestationStatus === 'AUTOMATED_ONLY' || audit.attestationStatus === 'MANUALLY_ATTESTED')) {
      throw new BadRequestException(`Audit ${auditId} has already been attested on-chain.`);
    }

    const chainId = targetChainId || audit.onChainChainId || getDefaultAttestationChainId();
    const config = this.chainConfig.getChainConfig(chainId);
    if (!config) throw new BadRequestException(`Chain ID ${chainId} not supported`);

    const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY;
    if (!operatorPrivateKey || operatorPrivateKey.trim() === '') {
      this.logger.warn(`OPERATOR_PRIVATE_KEY not set. Generating dev mock on-chain tx for audit ${auditId}`);
      const mockTxHash = `0x${keccak256(toUtf8Bytes(auditId + Date.now().toString())).substring(2, 66)}`;
      await this.prisma.auditRequest.update({
        where: { id: auditId },
        data: {
          onChainTxHash: mockTxHash,
          onChainChainId: chainId,
          attestationStatus: 'AUTOMATED_ONLY',
        },
      });
      return { txHash: mockTxHash, chainId };
    }

    if (!config.attestationAddress) {
      throw new BadRequestException(`Attestation contract address not configured for chain ${chainId}`);
    }

    const provider = this.chainConfig.getProvider(chainId);
    const wallet = new ethers.Wallet(operatorPrivateKey, provider);
    const contract = this.getContractInstance(config.attestationAddress, ZYRON_ATTESTATION_ABI, wallet);

    let leadAuditorAddr = audit.leadAuditor?.walletAddress || wallet.address;
    if (!leadAuditorAddr || !ethers.isAddress(leadAuditorAddr) || leadAuditorAddr === ethers.ZeroAddress) {
      leadAuditorAddr = wallet.address;
    }
    const input = buildAttestationInput(audit, { leadAuditor: leadAuditorAddr });

    this.logger.log(`Broadcasting publishAttestation to chain ${chainId} for ${auditId}...`);
    try {
      const tx = await contract.publishAttestation(input);

      const receipt = await tx.wait(1);
      const txHash = receipt.hash;

      await this.prisma.auditRequest.update({
        where: { id: auditId },
        data: {
          onChainTxHash: txHash,
          onChainChainId: chainId,
          attestationStatus: 'AUTOMATED_ONLY',
        },
      });

      this.logger.log(`On-chain attestation confirmed: ${txHash} on chain ${chainId}`);
      return { txHash, chainId };
    } catch (err: any) {
      this.logger.error(`Failed to publish attestation: ${err.message}`);
      throw new BadRequestException(`Attestation transaction failed: ${err.message}`);
    }
  }

  protected getContractInstance(address: string, abi: any, signerOrProvider: any): any {
    return new ethers.Contract(address, abi, signerOrProvider);
  }

  /**
   * Submit human-attested on-chain attestation with EIP-712 auditor signature.
   */
  async submitSignedAttestation(
    auditId: string,
    signature: string,
    signerAddress: string,
    payloadMessage: any,
    targetChainId?: number,
  ): Promise<{ txHash: string; chainId: number; isRelayed: boolean }> {
    const audit = await this.prisma.auditRequest.findUnique({
      where: { id: auditId },
      include: { leadAuditor: true, peerAuditor: true },
    });

    if (!audit) throw new BadRequestException(`Audit ${auditId} not found`);

    const chainId = targetChainId || audit.onChainChainId || getDefaultAttestationChainId();
    const config = this.chainConfig.getChainConfig(chainId);
    if (!config) throw new BadRequestException(`Chain ID ${chainId} not supported`);

    const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY;
    if (!operatorPrivateKey || operatorPrivateKey.trim() === '') {
      this.logger.warn(`OPERATOR_PRIVATE_KEY not set. Generating dev mock on-chain tx for signed attestation ${auditId}`);
      const mockTxHash = `0x${keccak256(toUtf8Bytes(auditId + signature + Date.now().toString())).substring(2, 66)}`;
      await this.prisma.auditRequest.update({
        where: { id: auditId },
        data: {
          onChainTxHash: mockTxHash,
          onChainChainId: chainId,
          attestationStatus: 'MANUALLY_ATTESTED',
          attestationSig: signature,
        },
      });
      return { txHash: mockTxHash, chainId, isRelayed: false };
    }

    if (!config.attestationAddress) {
      throw new BadRequestException(`Attestation contract address not configured for chain ${chainId}`);
    }

    const provider = this.chainConfig.getProvider(chainId);
    const wallet = new ethers.Wallet(operatorPrivateKey, provider);
    const contract = new ethers.Contract(config.attestationAddress, ZYRON_ATTESTATION_ABI, wallet);

    let leadAuditorAddr = signerAddress || audit.leadAuditor?.walletAddress || wallet.address;
    if (!leadAuditorAddr || !ethers.isAddress(leadAuditorAddr) || leadAuditorAddr === ethers.ZeroAddress) {
      leadAuditorAddr = wallet.address;
    }
    const input = buildAttestationInput(audit, {
      leadAuditor: leadAuditorAddr,
      merkleRoot: payloadMessage?.merkleRoot,
      bytecodeHash: payloadMessage?.bytecodeHash,
      repoTreeHash: payloadMessage?.repoTreeHash,
      sloc: payloadMessage?.sloc || audit.sloc || 100,
    });
    const status = payloadMessage?.status || 2; // MANUALLY_ATTESTED
    const timestamp = payloadMessage?.timestamp || Math.floor(Date.now() / 1000);

    this.logger.log(`Relaying attestation to chain ${chainId} for ${auditId}...`);
    try {
      let tx: any;
      try {
        tx = await contract.publishAttestationWithSignature(input, status, timestamp, signature);
      } catch (sigErr: any) {
        this.logger.warn(`publishAttestationWithSignature fallback to operator publishAttestation: ${sigErr.message}`);
        tx = await contract.publishAttestation(input);
      }

      const receipt = await tx.wait(1);
      const txHash = receipt.hash;

      await this.prisma.auditRequest.update({
        where: { id: auditId },
        data: {
          onChainTxHash: txHash,
          onChainChainId: chainId,
          attestationStatus: 'MANUALLY_ATTESTED',
          attestationSig: signature,
        },
      });

      this.logger.log(`On-chain signed attestation confirmed: ${txHash} on chain ${chainId}`);
      return { txHash, chainId, isRelayed: true };
    } catch (err: any) {
      this.logger.error(`Failed to broadcast attestation on-chain: ${err.message}`);
      throw new BadRequestException(`On-chain transaction failed: ${err.message}`);
    }
  }

  /**
   * Directly verify audit attestation on-chain by calling ZyronAttestation.verifyAttestation(auditIdBytes32)
   */
  async verifyOnChain(auditId: string, targetChainId?: number): Promise<any> {
    const chainId = targetChainId || getDefaultAttestationChainId();
    const config = this.chainConfig.getChainConfig(chainId);
    if (!config || !config.attestationAddress) {
      return { isVerified: false, reason: 'Attestation contract not configured for this chain' };
    }

    try {
      const provider = this.chainConfig.getProvider(chainId);
      const contract = new ethers.Contract(config.attestationAddress, ZYRON_ATTESTATION_ABI, provider);
      const auditIdBytes32 = keccak256(toUtf8Bytes(auditId));

      const record = await contract.verifyAttestation(auditIdBytes32);
      return {
        isVerified: Boolean(record.isVerified),
        auditId,
        merkleRoot: record.merkleRoot,
        bytecodeHash: record.bytecodeHash,
        repoTreeHash: record.repoTreeHash,
        ipfsReportCid: record.ipfsReportCid,
        ipfsMetadataCid: record.ipfsMetadataCid,
        protocolName: record.protocolName,
        targetContract: record.targetContract,
        gitCommit: record.gitCommit,
        recipient: record.recipient,
        leadAuditor: record.leadAuditor,
        peerAuditor: record.peerAuditor,
        sloc: Number(record.sloc),
        timestamp: Number(record.timestamp),
        tokenId: Number(record.tokenId),
        status: Number(record.status),
        chainId,
        contractAddress: config.attestationAddress,
        explorerUrl: `${config.explorerUrl}/address/${config.attestationAddress}`,
      };
    } catch (err: any) {
      this.logger.warn(`On-chain verification query failed for ${auditId}: ${err.message}`);
      return {
        isVerified: false,
        reason: err.message?.includes('No verified attestation')
          ? 'No verified attestation found on-chain'
          : err.message,
      };
    }
  }
}
