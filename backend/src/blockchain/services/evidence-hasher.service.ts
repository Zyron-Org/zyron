import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class EvidenceHasherService {
  /**
   * Deterministically serialize any JavaScript object to a canonical JSON string.
   * Object keys are recursively sorted alphabetically so identical structures always yield identical strings.
   */
  canonicalize(value: any): string {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map((item) => this.canonicalize(item)).join(',')}]`;
    }

    const sortedKeys = Object.keys(value).sort();
    const pairs = sortedKeys.map((key) => {
      const val = value[key];
      return `${JSON.stringify(key)}:${this.canonicalize(val)}`;
    });

    return `{${pairs.join(',')}}`;
  }

  /**
   * Compute deterministic SHA-256 evidence hash from canonical payload.
   * Returns a 0x-prefixed 32-byte hex string.
   */
  hashEvidence(payload: any): string {
    const canonical = this.canonicalize(payload);
    const digest = createHash('sha256').update(canonical, 'utf8').digest('hex');
    return `0x${digest}`;
  }

  /**
   * Build structured, canonical claim evidence for smart contract audit attestations.
   */
  buildAuditClaimEvidence(params: {
    auditId: string;
    protocolName: string;
    contractFileName: string;
    gitCommit?: string;
    bytecodeHash?: string;
    merkleRoot: string;
    sloc: number;
    aiAuditorId: string;
    extraMetadata?: Record<string, any>;
  }): {
    auditId: string;
    protocolName: string;
    contractFileName: string;
    gitCommit: string;
    bytecodeHash: string;
    merkleRoot: string;
    sloc: number;
    aiAuditorId: string;
    evidenceHash: string;
    canonicalPayload: Record<string, any>;
  } {
    const canonicalPayload: Record<string, any> = {
      auditId: params.auditId,
      protocolName: params.protocolName,
      contractFileName: params.contractFileName,
      gitCommit: params.gitCommit || '',
      bytecodeHash: params.bytecodeHash || '',
      merkleRoot: params.merkleRoot,
      sloc: params.sloc,
      aiAuditorId: params.aiAuditorId,
      ...(params.extraMetadata || {}),
    };

    const evidenceHash = this.hashEvidence(canonicalPayload);

    return {
      auditId: params.auditId,
      protocolName: params.protocolName,
      contractFileName: params.contractFileName,
      gitCommit: params.gitCommit || '',
      bytecodeHash: params.bytecodeHash || '',
      merkleRoot: params.merkleRoot,
      sloc: params.sloc,
      aiAuditorId: params.aiAuditorId,
      evidenceHash,
      canonicalPayload,
    };
  }
}
