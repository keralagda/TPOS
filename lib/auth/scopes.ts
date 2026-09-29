/**
 * Travel Planet (Voyage8) — Data Scope Model & Evaluation Logic
 * 
 * Defines data scoping boundaries:
 * GLOBAL -> ORGANIZATION -> WORKSPACE -> TEAM -> ASSIGNED -> OWN_RECORDS -> OWN_CUSTOMERS -> OWN_VENDOR -> READ_ONLY -> NONE
 */

export type DataScope =
  | 'GLOBAL'
  | 'ORGANIZATION'
  | 'WORKSPACE'
  | 'TEAM'
  | 'ASSIGNED'
  | 'OWN_RECORDS'
  | 'OWN_CUSTOMERS'
  | 'OWN_VENDOR'
  | 'READ_ONLY'
  | 'NONE';

export interface ScopeEvaluationContext {
  userId: string;
  organizationId?: string | null;
  workspaceId?: string | null;
  teamIds?: string[];
  vendorId?: string | null;
}

export interface ResourceScopeTarget {
  ownerUserId?: string | null;
  assignedUserId?: string | null;
  organizationId?: string | null;
  workspaceId?: string | null;
  teamId?: string | null;
  vendorId?: string | null;
}

export class ScopeEvaluator {
  /**
   * Determine whether a user with a given data scope is allowed to access/mutate a target resource
   */
  public static canAccessWithScope(
    scope: DataScope,
    userContext: ScopeEvaluationContext,
    resource?: ResourceScopeTarget
  ): boolean {
    if (scope === 'GLOBAL') {
      return true;
    }

    if (scope === 'NONE') {
      return false;
    }

    // If resource is not supplied (e.g. generalized listing check), scope is permissive if not NONE
    if (!resource) {
      return true;
    }

    switch (scope) {
      case 'ORGANIZATION':
        return !!userContext.organizationId && userContext.organizationId === resource.organizationId;

      case 'WORKSPACE':
        return (
          !!userContext.workspaceId &&
          userContext.workspaceId === resource.workspaceId &&
          (!resource.organizationId || userContext.organizationId === resource.organizationId)
        );

      case 'TEAM':
        return (
          !!resource.teamId &&
          Array.isArray(userContext.teamIds) &&
          userContext.teamIds.includes(resource.teamId)
        );

      case 'ASSIGNED':
        return (
          !!userContext.userId &&
          (userContext.userId === resource.assignedUserId || userContext.userId === resource.ownerUserId)
        );

      case 'OWN_RECORDS':
        return !!userContext.userId && userContext.userId === resource.ownerUserId;

      case 'OWN_CUSTOMERS':
        return (
          !!userContext.userId &&
          (userContext.userId === resource.assignedUserId || userContext.userId === resource.ownerUserId)
        );

      case 'OWN_VENDOR':
        return !!userContext.vendorId && userContext.vendorId === resource.vendorId;

      case 'READ_ONLY':
        // Read-only scope allows access within workspace/organization
        return (
          (!resource.organizationId || userContext.organizationId === resource.organizationId) &&
          (!resource.workspaceId || userContext.workspaceId === resource.workspaceId)
        );

      default:
        return false;
    }
  }

  /**
   * Compare two scopes and return the broader scope (e.g. when a user has multiple roles)
   */
  public static getBroaderScope(scopeA: DataScope, scopeB: DataScope): DataScope {
    const scopeRank: Record<DataScope, number> = {
      GLOBAL: 10,
      ORGANIZATION: 9,
      WORKSPACE: 8,
      TEAM: 7,
      OWN_VENDOR: 6,
      OWN_CUSTOMERS: 5,
      ASSIGNED: 4,
      OWN_RECORDS: 3,
      READ_ONLY: 2,
      NONE: 0,
    };

    return scopeRank[scopeA] >= scopeRank[scopeB] ? scopeA : scopeB;
  }
}
