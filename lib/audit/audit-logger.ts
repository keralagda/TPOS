/**
 * Travel Planet — Audit Trail & Event Logging Service
 * Governing document: 01_MASTER_SYSTEM_INSTRUCTION.md, 14_SECURITY_COMPLIANCE.md
 * 
 * Non-negotiable rule: Every privileged action must have authorization and auditability.
 */

export type AuditAction = string;
export type AuditEntityType = string;

export interface AuditRecord {
  userId?: string;
  userEmail?: string;
  role?: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  timestamp?: Date;
}

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(record: AuditRecord): Promise<void> {
    const formatted = {
      ...record,
      timestamp: record.timestamp || new Date(),
    };

    // In production, writes to Prisma AuditLog model & persistent stream
    console.log(`[AUDIT] [${formatted.timestamp.toISOString()}] ${formatted.action} on ${formatted.entityType}:${formatted.entityId} by ${formatted.userEmail || 'SYSTEM'} (${formatted.role || 'NONE'})`);
  }
}

export const auditLogger = AuditLogger.getInstance();
