/**
 * Travel Planet (Voyage8) — Authentication & Security Audit Logger
 * 
 * Strictly adheres to Section 19 & 20:
 * Records lifecycle authentication events with zero sensitive data leakage.
 * Passwords, tokens, and credentials are automatically sanitized/redacted.
 */

export type AuthAuditEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'FAILED_LOGIN'
  | 'ACCOUNT_CREATED'
  | 'EMAIL_VERIFIED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'PASSWORD_CHANGED'
  | 'EMAIL_CHANGED'
  | 'SESSION_REVOKED'
  | 'SECURITY_ALERT';

export interface AuthAuditEntry {
  userId?: string | null;
  authUserId?: string | null;
  tenantId?: string | null;
  branchId?: string | null;
  action: AuthAuditEventType;
  result: 'SUCCESS' | 'FAILURE' | 'CHALLENGE' | 'RATE_LIMITED';
  timestamp: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// Redacted key fragments
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'credentials',
  'hash',
  'resettoken',
  'verificationtoken',
];

/**
 * Deep redaction of sensitive objects before audit persistence
 */
export function sanitizeAuditMetadata(data?: Record<string, any>): Record<string, any> | undefined {
  if (!data) return undefined;

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Authentication Audit Logger
 */
export class AuthAuditLogger {
  private static inMemoryAuditLogs: AuthAuditEntry[] = [];

  /**
   * Record an authentication audit event
   */
  public static log(entry: Omit<AuthAuditEntry, 'timestamp'>): AuthAuditEntry {
    const sanitizedEntry: AuthAuditEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      metadata: sanitizeAuditMetadata(entry.metadata),
    };

    // Store in memory ring-buffer (max 1000 items in development/runtime memory)
    this.inMemoryAuditLogs.push(sanitizedEntry);
    if (this.inMemoryAuditLogs.length > 1000) {
      this.inMemoryAuditLogs.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH_AUDIT] ${sanitizedEntry.action} [${sanitizedEntry.result}] - user: ${sanitizedEntry.authUserId || sanitizedEntry.userId || 'anonymous'}`);
    }

    return sanitizedEntry;
  }

  /**
   * Retrieve recent in-memory audit logs for security inspections
   */
  public static getRecentLogs(limit = 50): AuthAuditEntry[] {
    return [...this.inMemoryAuditLogs].reverse().slice(0, limit);
  }

  /**
   * Clear in-memory audit logs (useful for unit testing)
   */
  public static clearLogs(): void {
    this.inMemoryAuditLogs = [];
  }
}
