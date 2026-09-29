/**
 * Travel Planet (Voyage8) — Master Role Based Access Control (RBAC)
 * Governing: Master Architecture, Security Compliance & Admin OS
 * 
 * Super Admin Principal: Amal Babu
 */

import { SYSTEM_ROLES } from './roles';
import { PERMISSION_DEFINITIONS } from './permissions';
import { AuthorizationEngine, AuthUser } from './rbac-engine';
import { ScopeEvaluator, ResourceScopeTarget, DataScope } from './scopes';
import { RbacAuditLogger, AuditActionResult } from './audit';
import { TestFixturesManager } from './test-fixtures';

// Re-exports
export * from './roles';
export * from './permissions';
export * from './scopes';
export * from './audit';
export * from './rbac-engine';
export * from './test-fixtures';

// Backwards-compatible Role type
export type Role =
  | 'PLATFORM_SUPER_ADMIN'
  | 'ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'TRAVEL_AGENT'
  | 'SALES_MANAGER'
  | 'CRM_MANAGER'
  | 'FINANCE_MANAGER'
  | 'ACCOUNTANT'
  | 'SUPPLIER_MANAGER'
  | 'VENDOR_ADMIN'
  | 'VENDOR_OPERATOR'
  | 'CUSTOMER_SUPPORT'
  | 'CONTENT_MANAGER'
  | 'MARKETING_MANAGER'
  | 'INTEGRATION_MANAGER'
  | 'AI_OPERATOR'
  | 'ANALYST'
  | 'CUSTOMER'
  | 'PARTNER'
  // Legacy aliases
  | 'SUPER_ADMIN'
  | 'CRM_AGENT'
  | 'PARTNER_AGENT'
  | 'CONSUMER';

export type Permission = string;

export interface AuthContext {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  roles?: string[];
  organizationId?: string | null;
  workspaceId?: string | null;
  teamIds?: string[];
  vendorId?: string | null;
  isSuperAdmin: boolean;
  supportSession?: {
    active: boolean;
    impersonatedByUserId: string;
    reason: string;
    expiresAt: string;
  };
}

export const SUPER_ADMIN_PRINCIPAL: AuthContext = {
  userId: 'usr_super_admin_amal',
  email: 'amal.babu@travelplanet.com',
  fullName: 'Amal Babu',
  role: 'PLATFORM_SUPER_ADMIN',
  roles: ['PLATFORM_SUPER_ADMIN'],
  organizationId: 'org_tp_hq',
  workspaceId: 'ws_hq_main',
  isSuperAdmin: true,
};

/**
 * Backwards compatible hasPermission checker
 */
export function hasPermission(roleOrUser: Role | AuthUser, permission: string): boolean {
  if (typeof roleOrUser === 'string') {
    const role = roleOrUser;
    if (role === 'SUPER_ADMIN' || role === 'PLATFORM_SUPER_ADMIN') return true;

    // Check mapping
    const normalizedRole = role === 'CRM_AGENT' ? 'TRAVEL_AGENT'
      : role === 'PARTNER_AGENT' ? 'PARTNER'
      : role === 'CONSUMER' ? 'CUSTOMER'
      : role;

    const roleDef = SYSTEM_ROLES[normalizedRole];
    if (!roleDef) return false;

    // Handle legacy colon format mapping (e.g. 'booking:cancel' -> 'bookings.cancel')
    const normalizedPermission = permission.replace(':', '.');
    return roleDef.permissions.includes('*') ||
      roleDef.permissions.includes(permission) ||
      roleDef.permissions.includes(normalizedPermission);
  }

  return AuthorizationEngine.hasPermission(roleOrUser, permission);
}

/**
 * Authorize action with exception throw
 */
export function authorizeAction(
  context: AuthContext,
  permission: string,
  resource?: ResourceScopeTarget
): void {
  const authUser: AuthUser = {
    id: context.userId,
    email: context.email,
    fullName: context.fullName,
    organizationId: context.organizationId,
    workspaceId: context.workspaceId,
    teamIds: context.teamIds,
    vendorId: context.vendorId,
    roles: context.roles || [context.role],
    supportSession: context.supportSession,
  };

  const evalResult = AuthorizationEngine.canPerform(authUser, permission, resource);
  if (!evalResult.authorized) {
    throw new Error(evalResult.reason || `Unauthorized: Access denied for permission '${permission}'`);
  }
}

/**
 * Singleton RbacService
 */
export class RbacService {
  private static instance: RbacService;

  private constructor() {}

  public static getInstance(): RbacService {
    if (!RbacService.instance) {
      RbacService.instance = new RbacService();
    }
    return RbacService.instance;
  }

  public hasPermission(role: string, permission: string): boolean {
    return hasPermission(role as Role, permission);
  }

  public canPerform(user: AuthUser, permission: string, resource?: ResourceScopeTarget) {
    return AuthorizationEngine.canPerform(user, permission, resource);
  }

  public getDataScope(user: AuthUser, resourceType?: string): DataScope {
    return AuthorizationEngine.getDataScope(user, resourceType);
  }

  public getEffectivePermissions(user: AuthUser) {
    return AuthorizationEngine.getEffectivePermissions(user);
  }

  public authorizeAction(context: AuthContext, permission: string, resource?: ResourceScopeTarget): void {
    authorizeAction(context, permission, resource);
  }
}
