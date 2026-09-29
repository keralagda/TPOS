/**
 * Travel Planet (Voyage8) — Production-Ready RBAC Authorization Engine
 * 
 * Centralized authorization engine evaluating:
 * USER -> ROLE -> PERMISSION -> DATA SCOPE -> RESOURCE OWNERSHIP -> ORGANIZATION -> WORKSPACE -> RESULT
 */

import { SYSTEM_ROLES } from './roles';
import { DataScope, ScopeEvaluator, ResourceScopeTarget } from './scopes';
import { RbacAuditLogger } from './audit';
import { ALL_PERMISSION_CODES } from './permissions';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  organizationId?: string | null;
  workspaceId?: string | null;
  teamIds?: string[];
  vendorId?: string | null;
  roles: string[];
  supportSession?: {
    active: boolean;
    impersonatedByUserId: string;
    reason: string;
    expiresAt: string;
  };
}

export interface AuthorizationEvaluationResult {
  authorized: boolean;
  reason?: string;
  permissionRequired: string;
  effectiveScope: DataScope;
  evaluatedAt: string;
}

export class AuthorizationEngine {
  /**
   * Check if user has a specific granular permission
   */
  public static hasPermission(user: AuthUser, permission: string): boolean {
    if (!user || !user.roles || user.roles.length === 0) {
      return false;
    }

    // Platform Super Admin has universal wildcard access
    if (user.roles.includes('PLATFORM_SUPER_ADMIN') || user.roles.includes('SUPER_ADMIN')) {
      return true;
    }

    for (const roleCode of user.roles) {
      const roleDef = SYSTEM_ROLES[roleCode];
      if (!roleDef) continue;

      if (roleDef.permissions.includes('*') || roleDef.permissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  public static hasAnyPermission(user: AuthUser, permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(user, p));
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  public static hasAllPermissions(user: AuthUser, permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(user, p));
  }

  /**
   * Get the effective data scope for a user
   */
  public static getDataScope(user: AuthUser, resourceType?: string): DataScope {
    if (!user || !user.roles || user.roles.length === 0) {
      return 'NONE';
    }

    if (user.roles.includes('PLATFORM_SUPER_ADMIN') || user.roles.includes('SUPER_ADMIN')) {
      return 'GLOBAL';
    }

    let broadestScope: DataScope = 'NONE';

    for (const roleCode of user.roles) {
      const roleDef = SYSTEM_ROLES[roleCode];
      if (!roleDef) continue;
      broadestScope = ScopeEvaluator.getBroaderScope(broadestScope, roleDef.defaultScope);
    }

    return broadestScope;
  }

  /**
   * Evaluate whether user can access a specific resource within tenant/workspace bounds
   */
  public static canAccessResource(user: AuthUser, resource?: ResourceScopeTarget): boolean {
    const scope = this.getDataScope(user);
    return ScopeEvaluator.canAccessWithScope(
      scope,
      {
        userId: user.id,
        organizationId: user.organizationId,
        workspaceId: user.workspaceId,
        teamIds: user.teamIds,
        vendorId: user.vendorId,
      },
      resource
    );
  }

  /**
   * Master authorization check: evaluates permission + data scope + resource ownership
   */
  public static canPerform(
    user: AuthUser,
    permission: string,
    resource?: ResourceScopeTarget,
    auditContext?: { ipAddress?: string; userAgent?: string; requestId?: string }
  ): AuthorizationEvaluationResult {
    const hasPerm = this.hasPermission(user, permission);
    const scope = this.getDataScope(user);

    if (!hasPerm) {
      RbacAuditLogger.log({
        userId: user.id,
        organizationId: user.organizationId,
        workspaceId: user.workspaceId,
        action: 'CHECK_PERMISSION',
        permission,
        result: 'DENIED',
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
        requestId: auditContext?.requestId,
        metadata: { reason: 'User lacks required role permission' },
      });

      return {
        authorized: false,
        reason: `Forbidden: User '${user.email}' lacks required permission '${permission}'`,
        permissionRequired: permission,
        effectiveScope: scope,
        evaluatedAt: new Date().toISOString(),
      };
    }

    // Evaluate Data Scope & Tenant Isolation against the resource
    const scopeAllowed = ScopeEvaluator.canAccessWithScope(
      scope,
      {
        userId: user.id,
        organizationId: user.organizationId,
        workspaceId: user.workspaceId,
        teamIds: user.teamIds,
        vendorId: user.vendorId,
      },
      resource
    );

    if (!scopeAllowed) {
      RbacAuditLogger.log({
        userId: user.id,
        organizationId: user.organizationId,
        workspaceId: user.workspaceId,
        action: 'CHECK_DATA_SCOPE',
        permission,
        result: 'DENIED',
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
        requestId: auditContext?.requestId,
        metadata: {
          reason: 'Target resource outside user permitted data scope',
          scope,
          targetResource: resource,
        },
      });

      return {
        authorized: false,
        reason: `Forbidden: Resource falls outside user's data scope '${scope}' (Tenant/Workspace boundary violation)`,
        permissionRequired: permission,
        effectiveScope: scope,
        evaluatedAt: new Date().toISOString(),
      };
    }

    // Record success
    RbacAuditLogger.log({
      userId: user.id,
      organizationId: user.organizationId,
      workspaceId: user.workspaceId,
      action: 'AUTHORIZE',
      permission,
      result: 'AUTHORIZED',
      ipAddress: auditContext?.ipAddress,
      userAgent: auditContext?.userAgent,
      requestId: auditContext?.requestId,
    });

    return {
      authorized: true,
      permissionRequired: permission,
      effectiveScope: scope,
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Compile full effective access matrix for user inspection
   */
  public static getEffectivePermissions(user: AuthUser): {
    permissions: string[];
    scope: DataScope;
    isSuperAdmin: boolean;
    roles: string[];
    supportModeActive: boolean;
  } {
    const isSuperAdmin = user.roles.includes('PLATFORM_SUPER_ADMIN') || user.roles.includes('SUPER_ADMIN');
    const scope = this.getDataScope(user);

    let permissions: string[] = [];
    if (isSuperAdmin) {
      permissions = Array.from(ALL_PERMISSION_CODES);
    } else {
      const permSet = new Set<string>();
      for (const roleCode of user.roles) {
        const roleDef = SYSTEM_ROLES[roleCode];
        if (roleDef) {
          roleDef.permissions.forEach(p => permSet.add(p));
        }
      }
      permissions = Array.from(permSet);
    }

    return {
      permissions,
      scope,
      isSuperAdmin,
      roles: user.roles,
      supportModeActive: !!user.supportSession?.active,
    };
  }
}
