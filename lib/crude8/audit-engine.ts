/**
 * CRUDE8: IMMUTABLE AUDIT & PROVENANCE ENGINE
 * Maintains tamper-evident, cryptographic-chained audit logs for all CRUD operations.
 */

import { CRUDEntityName, CRUDActionType } from './types';
import { UniversalEntityRegistry } from './entity-registry';
import crypto from 'crypto';

export interface AuditRecord {
  auditId: string;
  timestamp: string;
  entity: CRUDEntityName;
  recordId: string;
  action: CRUDActionType;
  actor: {
    userId: string;
    role: string;
    tenantId: string;
  };
  previousHash: string;
  entryHash: string;
  diffSummary?: string;
  payloadSnapshot: Record<string, any>;
}

export class CRUDE8AuditEngine {
  private static auditChain: AuditRecord[] = [];
  private static latestHash = '0000000000000000000000000000000000000000000000000000000000000000';

  /**
   * Generates a cryptographic SHA-256 hash for audit chain integrity
   */
  private static hashPayload(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Redacts sensitive fields based on entity schema policy
   */
  private static redactSensitiveData(entity: CRUDEntityName, data: Record<string, any>): Record<string, any> {
    if (!data) return {};
    const schema = UniversalEntityRegistry.getSchema(entity);
    const redactList = schema?.auditPolicy?.redactFields || [];
    const copy = { ...data };

    for (const field of redactList) {
      if (field in copy) {
        copy[field] = '[REDACTED_BY_CRUDE8_POLICY]';
      }
    }
    return copy;
  }

  /**
   * Log a CRUD mutation or access event
   */
  static log(
    entity: CRUDEntityName,
    recordId: string,
    action: CRUDActionType,
    actor: { userId: string; role: string; tenantId: string },
    payload: Record<string, any>,
    diffSummary?: string
  ): AuditRecord {
    const schema = UniversalEntityRegistry.getSchema(entity);
    if (action === 'READ' && schema?.auditPolicy?.logReads === false) {
      // Skipped by policy
      return {
        auditId: 'unlogged-read',
        timestamp: new Date().toISOString(),
        entity,
        recordId,
        action,
        actor,
        previousHash: this.latestHash,
        entryHash: this.latestHash,
        payloadSnapshot: {}
      };
    }

    const auditId = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const cleanPayload = this.redactSensitiveData(entity, payload);

    const serialized = JSON.stringify({
      auditId,
      timestamp,
      entity,
      recordId,
      action,
      actor,
      previousHash: this.latestHash,
      payload: cleanPayload,
      diffSummary
    });

    const entryHash = this.hashPayload(serialized);

    const record: AuditRecord = {
      auditId,
      timestamp,
      entity,
      recordId,
      action,
      actor,
      previousHash: this.latestHash,
      entryHash,
      diffSummary,
      payloadSnapshot: cleanPayload
    };

    this.latestHash = entryHash;
    this.auditChain.unshift(record);

    if (this.auditChain.length > 1000) {
      this.auditChain.pop();
    }

    return record;
  }

  /**
   * Query audit records
   */
  static query(filters?: {
    entity?: CRUDEntityName;
    recordId?: string;
    action?: CRUDActionType;
    tenantId?: string;
    limit?: number;
  }): AuditRecord[] {
    let results = this.auditChain;

    if (filters?.entity) {
      results = results.filter(r => r.entity === filters.entity);
    }
    if (filters?.recordId) {
      results = results.filter(r => r.recordId === filters.recordId);
    }
    if (filters?.action) {
      results = results.filter(r => r.action === filters.action);
    }
    if (filters?.tenantId) {
      results = results.filter(r => r.actor.tenantId === filters.tenantId);
    }

    return results.slice(0, filters?.limit || 50);
  }

  /**
   * Verifies the cryptographic chain integrity
   */
  static verifyChainIntegrity(): { intact: boolean; verifiedCount: number; errorIndex?: number } {
    if (this.auditChain.length <= 1) {
      return { intact: true, verifiedCount: this.auditChain.length };
    }

    // Since items are unshifted (newest first), reverse to verify chronological link
    const chronological = [...this.auditChain].reverse();
    for (let i = 1; i < chronological.length; i++) {
      const prev = chronological[i - 1];
      const curr = chronological[i];

      if (curr.previousHash !== prev.entryHash) {
        return { intact: false, verifiedCount: i, errorIndex: i };
      }
    }

    return { intact: true, verifiedCount: this.auditChain.length };
  }

  /**
   * Reset for tests
   */
  static clear(): void {
    this.auditChain = [];
    this.latestHash = '0000000000000000000000000000000000000000000000000000000000000000';
  }
}
