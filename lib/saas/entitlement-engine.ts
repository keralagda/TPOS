/**
 * TRAVEL PLANET .TOURS — SAAS PLANE ENTITLEMENT RESOLVER ENGINE
 * 
 * Core Doctrine:
 * "ENTITLEMENT ≠ FEATURE FLAG ≠ PERMISSION ≠ CONFIGURATION ≠ USAGE LIMIT."
 * "PLAN DEFINES POSSIBILITY. PACK DEFINES CAPABILITY. ENTITLEMENT DEFINES ACCESS.
 *  FEATURE FLAG DEFINES RELEASE. ROLE DEFINES AUTHORITY. POLICY DEFINES BEHAVIOR."
 * 
 * Precedence Rule (§06):
 * SYSTEM_POLICY -> CONTRACT -> CUSTOM_OVERRIDE -> ADDON -> PACK -> PLAN -> DEFAULT
 * Hard limits and security policies CAN NEVER be overridden.
 */

import { Entitlement, TenantContext } from './types';
import { PlanRegistry } from './plan-registry';
import { PackRegistry } from './pack-registry';

export interface EntitlementEvaluationRequest {
  tenantContext: TenantContext;
  resource: string;
  capability: string;
  action?: string;
}

export interface EntitlementEvaluationResult {
  allowed: boolean;
  reason: string;
  source: string;
  limit?: number;
  evaluatedPacks: string[];
  resolvedEntitlement?: Partial<Entitlement>;
}

export class EntitlementEngine {
  private static customTenantOverrides: Map<string, Entitlement[]> = new Map();

  /**
   * Set custom override for tenant
   */
  public static setTenantOverride(tenantId: string, entitlement: Entitlement): void {
    const list = this.customTenantOverrides.get(tenantId) || [];
    this.customTenantOverrides.set(tenantId, [...list, entitlement]);
  }

  /**
   * Clear overrides
   */
  public static clearTenantOverrides(tenantId: string): void {
    this.customTenantOverrides.delete(tenantId);
  }

  /**
   * Evaluate whether tenant is entitled to a specific capability
   */
  public static evaluate(request: EntitlementEvaluationRequest): EntitlementEvaluationResult {
    const { tenantContext, resource, capability } = request;

    // 1. Super Admin Platform Override check
    if (tenantContext.isPlatformAdmin) {
      return {
        allowed: true,
        reason: 'PLATFORM_SUPER_ADMIN_GLOBAL_OVERRIDE',
        source: 'SYSTEM_POLICY',
        evaluatedPacks: tenantContext.packIds,
      };
    }

    // 2. Custom Tenant Overrides (Contract/Promo precedence)
    const tenantOverrides = this.customTenantOverrides.get(tenantContext.tenantId) || [];
    const matchedOverride = tenantOverrides.find(
      (e) => e.status === 'ACTIVE' && (e.capability === capability || e.capability === '*') && (e.resource === resource || e.resource === '*')
    );

    if (matchedOverride) {
      return {
        allowed: matchedOverride.action === 'ALLOW',
        reason: `Matched custom override with action ${matchedOverride.action}`,
        source: matchedOverride.source,
        limit: matchedOverride.limit,
        evaluatedPacks: tenantContext.packIds,
        resolvedEntitlement: matchedOverride,
      };
    }

    // 3. Resolve Packs assigned to tenant
    const packs = tenantContext.packIds
      .map((code) => PackRegistry.getByCode(code))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    for (const pack of packs) {
      // Check if pack includes module/capability
      const hasModule = pack.includedModules.includes(resource) || pack.includedModules.includes('*');
      const hasFeature = pack.includedFeatures.includes(capability) || pack.includedFeatures.includes('*');
      const hasPermission = pack.includedPermissions.includes(capability) || pack.includedPermissions.includes(`${resource}.${capability}`) || pack.includedPermissions.includes('*');
      const hasAIAbility = pack.includedAIAbilities.includes(capability);

      if (hasModule || hasFeature || hasPermission || hasAIAbility) {
        return {
          allowed: true,
          reason: `Granted by assigned Pack: ${pack.name} (${pack.code})`,
          source: 'PACK',
          limit: pack.includedLimits[resource] || pack.includedLimits[capability],
          evaluatedPacks: tenantContext.packIds,
        };
      }
    }

    // 4. Resolve Plan assigned to tenant
    const plan = PlanRegistry.getByCode(tenantContext.planId);
    if (plan) {
      // Check plan included entitlements and wildcard
      if (
        plan.includedEntitlements.includes('*') ||
        plan.includedEntitlements.includes(capability) ||
        plan.includedEntitlements.includes(`${resource}.${capability}`) ||
        plan.includedFeatures.includes(capability) ||
        plan.includedFeatures.includes('*')
      ) {
        return {
          allowed: true,
          reason: `Granted by assigned Plan: ${plan.name} (${plan.code})`,
          source: 'PLAN',
          limit: plan.limits[resource] || plan.limits[capability],
          evaluatedPacks: tenantContext.packIds,
        };
      }
    }

    // 5. Default Deny
    return {
      allowed: false,
      reason: `No active entitlement found for resource "${resource}" and capability "${capability}" in Plan ${tenantContext.planId} or assigned Packs [${tenantContext.packIds.join(', ')}]`,
      source: 'DEFAULT',
      evaluatedPacks: tenantContext.packIds,
    };
  }

  /**
   * Complete capability matrix resolution for a tenant context
   */
  public static resolveAllCapabilities(tenantContext: TenantContext): {
    allowedModules: string[];
    allowedFeatures: string[];
    allowedPermissions: string[];
    allowedWorkspaces: string[];
    limits: Record<string, number>;
  } {
    const modules = new Set<string>();
    const features = new Set<string>();
    const permissions = new Set<string>();
    const workspaces = new Set<string>();
    const limits: Record<string, number> = {};

    // 1. Ingest Plan baseline
    const plan = PlanRegistry.getByCode(tenantContext.planId);
    if (plan) {
      plan.includedFeatures.forEach((f) => features.add(f));
      plan.allowedWorkspaces.forEach((w) => workspaces.add(w));
      Object.assign(limits, plan.limits);
    }

    // 2. Ingest Packs
    const packs = tenantContext.packIds
      .map((code) => PackRegistry.getByCode(code))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    for (const pack of packs) {
      pack.includedModules.forEach((m) => modules.add(m));
      pack.includedFeatures.forEach((f) => features.add(f));
      pack.includedPermissions.forEach((p) => permissions.add(p));
      pack.includedWorkspaces.forEach((w) => workspaces.add(w));
      Object.assign(limits, pack.includedLimits);
    }

    return {
      allowedModules: Array.from(modules),
      allowedFeatures: Array.from(features),
      allowedPermissions: Array.from(permissions),
      allowedWorkspaces: Array.from(workspaces),
      limits,
    };
  }
}
