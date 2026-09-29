/**
 * CRUDE8: PERMISSION RESOLVER
 * Enforces RBAC, Tenant Isolation boundaries, and Data Scope Rules across all CRUD operations.
 */

import { CRUDEntityName, CRUDActionType, UniversalActionType } from './types';
import { UniversalEntityRegistry } from './entity-registry';
import { CRUDCapabilityMatrix } from './capability-matrix';

export interface UserContext {
  userId: string;
  role: string;
  tenantId: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export class CRUDE8PermissionResolver {
  /**
   * Evaluates whether a user context can execute an action on an entity
   */
  static evaluate(
    entity: CRUDEntityName,
    action: CRUDActionType,
    user: UserContext,
    targetRecord?: Record<string, any>
  ): PermissionCheckResult {
    const schema = UniversalEntityRegistry.getSchema(entity);
    if (!schema) {
      return { allowed: false, reason: `Unknown entity: ${entity}` };
    }

    // 1. Super Admin has universal access
    if (user.role === 'SUPER_ADMIN') {
      return { allowed: true };
    }

    // 2. Action Role Validation
    let allowedRoles: string[] = [];
    switch (action) {
      case 'CREATE':
        allowedRoles = schema.permissions.createRoles;
        break;
      case 'READ':
        allowedRoles = schema.permissions.readRoles;
        break;
      case 'UPDATE':
        allowedRoles = schema.permissions.updateRoles;
        break;
      case 'DELETE':
        allowedRoles = schema.permissions.deleteRoles;
        break;
    }

    if (!allowedRoles.includes(user.role)) {
      return {
        allowed: false,
        reason: `Role '${user.role}' lacks permission for '${action}' on '${entity}' (Allowed: ${allowedRoles.join(', ')})`
      };
    }

    // 3. Multi-Tenant Isolation
    if (schema.permissions.tenantScoped && targetRecord) {
      const recordTenant = targetRecord.tenantId;
      if (recordTenant && recordTenant !== user.tenantId) {
        return {
          allowed: false,
          reason: `Tenant isolation violation: user tenant '${user.tenantId}' cannot access record of tenant '${recordTenant}'`
        };
      }
    }

    // 4. Data Scope Rule Check
    if (schema.permissions.dataScopeRule === 'OWN_RECORDS' && targetRecord) {
      const ownerId = targetRecord.userId || targetRecord.customerId || targetRecord.createdBy;
      if (ownerId && ownerId !== user.userId) {
        return {
          allowed: false,
          reason: `Data scope restriction: User may only access their own records`
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Evaluates a universal (matrix-defined) action against the CRUD Capability Matrix.
   * Extended actions resolve roles from the matrix; CRUD verbs delegate to schema policy.
   */
  static evaluateCapability(
    entity: CRUDEntityName,
    action: UniversalActionType,
    user: UserContext,
    targetRecord?: Record<string, any>
  ): PermissionCheckResult {
    const capability = CRUDCapabilityMatrix.getCapability(entity);
    const allowedRoles = capability.actionPermissions[action];

    if (!allowedRoles || allowedRoles.length === 0) {
      return {
        allowed: false,
        reason: `Action '${action}' is not permitted on '${entity}' (no roles granted in Capability Matrix)`
      };
    }

    if (user.role === 'SUPER_ADMIN') {
      return { allowed: true };
    }

    if (!allowedRoles.includes(user.role)) {
      return {
        allowed: false,
        reason: `Role '${user.role}' lacks permission for '${action}' on '${entity}' (Allowed: ${allowedRoles.join(', ')})`
      };
    }

    const schema = UniversalEntityRegistry.getSchema(entity);
    if (schema?.permissions.tenantScoped && targetRecord) {
      const recordTenant = targetRecord.tenantId;
      if (recordTenant && recordTenant !== user.tenantId) {
        return {
          allowed: false,
          reason: `Tenant isolation violation: user tenant '${user.tenantId}' cannot access record of tenant '${recordTenant}'`
        };
      }
    }

    return { allowed: true };
  }
}
