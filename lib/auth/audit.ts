/**
 * Travel Planet (Voyage8) — Authorization & RBAC Audit Logger
 * 
 * Records privileged security events:
 * - AUTHORIZED
 * - DENIED
 * - ROLE_CHANGED
 * - PERMISSION_CHANGED
 * - SESSION_REVOKED
 * - SUPPORT_ACCESS_INITIATED
 */

export type AuditActionResult =
  | 'AUTHORIZED'
  | 'DENIED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_CHANGED'
  | 'SESSION_REVOKED'
  | 'SUPPORT_ACCESS_INITIATED';

export interface AuditEventEntry {
  id?: string;
  timestamp?: string;
  userId?: string | null;
  organizationId?: string | null;
  workspaceId?: string | null;
  action: string;
  permission?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  result: AuditActionResult;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  metadata?: Record<string, any>;
}

export class RbacAuditLogger {
  private static memoryLog: AuditEventEntry[] = [];
  private static readonly MAX_MEMORY_LOGS = 500;

  /**
   * Record an authorization or RBAC event with automated credential redaction
   */
  public static log(entry: AuditEventEntry): AuditEventEntry {
    const sanitizedMetadata = this.sanitizeMetadata(entry.metadata);

    const record: AuditEventEntry = {
      id: entry.id || `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      userId: entry.userId || 'system',
      organizationId: entry.organizationId || null,
      workspaceId: entry.workspaceId || null,
      action: entry.action,
      permission: entry.permission || null,
      resourceType: entry.resourceType || null,
      resourceId: entry.resourceId || null,
      result: entry.result,
      ipAddress: entry.ipAddress || '127.0.0.1',
      userAgent: entry.userAgent || 'TravelPlanet-Kernel/2.0',
      requestId: entry.requestId || `req_${Date.now()}`,
      metadata: sanitizedMetadata,
    };

    // Store in circular memory buffer for real-time inspection & API
    this.memoryLog.unshift(record);
    if (this.memoryLog.length > this.MAX_MEMORY_LOGS) {
      this.memoryLog.pop();
    }

    return record;
  }

  /**
   * Query recent audit logs with filters
   */
  public static query(filters?: {
    userId?: string;
    organizationId?: string;
    workspaceId?: string;
    result?: AuditActionResult;
    limit?: number;
  }): AuditEventEntry[] {
    let result = [...this.memoryLog];

    if (filters) {
      if (filters.userId) result = result.filter(r => r.userId === filters.userId);
      if (filters.organizationId) result = result.filter(r => r.organizationId === filters.organizationId);
      if (filters.workspaceId) result = result.filter(r => r.workspaceId === filters.workspaceId);
      if (filters.result) result = result.filter(r => r.result === filters.result);
      if (filters.limit) result = result.slice(0, filters.limit);
    }

    return result;
  }

  /**
   * Redact sensitive credentials (passwords, tokens, api keys)
   */
  private static sanitizeMetadata(meta?: Record<string, any>): Record<string, any> | undefined {
    if (!meta) return undefined;
    const sanitized = { ...meta };
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'apiKey', 'creditCard', 'cvv'];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeMetadata(sanitized[key]);
      }
    }

    return sanitized;
  }
}
