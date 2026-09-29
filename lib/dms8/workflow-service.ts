/**
 * DMS8 DOCUMENT WORKFLOW ENGINE
 * Enforces strict governed state transitions from CREATE to PURGE with immutable audit logging.
 */

import { DocumentLifecyclePhase, DocumentRegistryItem, DocumentAuditTrailEntry, DocumentVersionEntry } from './types';
import { DMS8VaultService } from './vault-service';

export const VALID_LIFECYCLE_TRANSITIONS: Record<DocumentLifecyclePhase, DocumentLifecyclePhase[]> = {
  CREATE: ['UPLOAD'],
  UPLOAD: ['CLASSIFY', 'ARCHIVE'],
  CLASSIFY: ['EXTRACT', 'ARCHIVE'],
  EXTRACT: ['VERIFY', 'ARCHIVE'],
  VERIFY: ['LINK', 'ARCHIVE'],
  LINK: ['APPROVE', 'USE', 'ARCHIVE'],
  APPROVE: ['USE', 'ARCHIVE'],
  USE: ['ARCHIVE'],
  ARCHIVE: ['RETENTION', 'USE'],
  RETENTION: ['PURGE', 'ARCHIVE'],
  PURGE: []
};

export class DMS8WorkflowService {
  private static auditLogs: DocumentAuditTrailEntry[] = [];
  private static versionHistory: Map<string, DocumentVersionEntry[]> = new Map();

  /**
   * Transition document to next lifecycle state
   */
  static transitionLifecycle(
    documentId: string,
    targetState: DocumentLifecyclePhase,
    actor: { id: string; role: string; tenantId: string },
    reason?: string
  ): DocumentRegistryItem {
    const doc = DMS8VaultService.getDocumentById(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    const allowed = VALID_LIFECYCLE_TRANSITIONS[doc.lifecycleStatus];
    if (!allowed || !allowed.includes(targetState)) {
      throw new Error(`Invalid lifecycle transition from ${doc.lifecycleStatus} to ${targetState}`);
    }

    const updated = DMS8VaultService.updateDocument(documentId, {
      lifecycleStatus: targetState
    });

    // Record audit entry
    this.recordAudit({
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      documentId,
      action: targetState === 'ARCHIVE' ? 'ARCHIVE' : targetState === 'APPROVE' ? 'APPROVE' : 'VERIFY',
      performedBy: actor.id,
      userRole: actor.role,
      tenantId: actor.tenantId,
      timestamp: new Date().toISOString(),
      details: { previousState: doc.lifecycleStatus, nextState: targetState, reason: reason || 'Governed Workflow Transition' }
    });

    return updated;
  }

  /**
   * Record Audit Entry
   */
  static recordAudit(entry: DocumentAuditTrailEntry): void {
    this.auditLogs.unshift(entry);
  }

  /**
   * Get Audit Logs for a Document
   */
  static getAuditLogsForDocument(documentId: string): DocumentAuditTrailEntry[] {
    return this.auditLogs.filter(a => a.documentId === documentId);
  }

  /**
   * Record Document Version Entry
   */
  static recordVersion(entry: DocumentVersionEntry): void {
    const list = this.versionHistory.get(entry.documentId) || [];
    list.unshift(entry);
    this.versionHistory.set(entry.documentId, list);
  }

  /**
   * Get Version History for Document
   */
  static getVersionHistory(documentId: string): DocumentVersionEntry[] {
    return this.versionHistory.get(documentId) || [];
  }
}
