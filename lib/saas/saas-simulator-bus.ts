/**
 * TRAVEL PLANET .TOURS — SAAS SIMULATOR & AUDIT EVENT BUS
 * 
 * Provides dry-run simulation of tenant actions without production side-effects (§28),
 * and structured audit event logging for all privileged actions (§29, §30).
 */

import { SaaSEvent, TenantContext } from './types';
import { PlanRegistry } from './plan-registry';
import { PackRegistry } from './pack-registry';
import { EntitlementEngine } from './entitlement-engine';
import { UsageAndLimitEngine } from './usage-limit-engine';
import { SaaSFeatureFlagEngine } from './saas-feature-flag-engine';

export interface SimulationRequest {
  action:
    | 'PROVISION_TENANT'
    | 'ASSIGN_PACK'
    | 'REMOVE_PACK'
    | 'UPGRADE_PLAN'
    | 'DOWNGRADE_PLAN'
    | 'RECORD_USAGE'
    | 'FEATURE_EVALUATION'
    | 'SUSPEND_TENANT';
  tenantId?: string;
  planCode?: string;
  packCodes?: string[];
  meterKey?: string;
  units?: number;
  featureKey?: string;
}

export interface SimulationResult {
  action: string;
  dryRun: true;
  success: boolean;
  projectedState: Record<string, any>;
  diff: {
    addedCapabilities?: string[];
    removedCapabilities?: string[];
    limitsChanged?: Record<string, { before: number; after: number }>;
    financialImpactEstimatedUsd?: number;
  };
  validationIssues: string[];
  eventsGenerated: Partial<SaaSEvent>[];
}

export class SaaSSimulatorAndAuditBus {
  private static auditLogs: SaaSEvent[] = [];

  /**
   * Log an immutable audit event (§30)
   */
  public static logEvent(event: Omit<SaaSEvent, 'eventId' | 'timestamp'>): SaaSEvent {
    const fullEvent: SaaSEvent = {
      ...event,
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(fullEvent);
    // Keep max 5000 in-memory events
    if (this.auditLogs.length > 5000) {
      this.auditLogs.pop();
    }
    return fullEvent;
  }

  /**
   * Query audit logs with tenant and actor filtering
   */
  public static getAuditLogs(filter?: {
    tenantId?: string;
    action?: string;
    limit?: number;
  }): SaaSEvent[] {
    let list = this.auditLogs;
    if (filter?.tenantId) {
      list = list.filter((e) => e.tenantId === filter.tenantId);
    }
    if (filter?.action) {
      list = list.filter((e) => e.action.toLowerCase().includes(filter.action!.toLowerCase()));
    }
    return list.slice(0, filter?.limit || 100);
  }

  /**
   * Run sandbox simulation without committing mutations (§28)
   */
  public static simulate(req: SimulationRequest): SimulationResult {
    const events: Partial<SaaSEvent>[] = [];
    const validationIssues: string[] = [];

    if (req.action === 'ASSIGN_PACK' || req.action === 'REMOVE_PACK') {
      const targetPacks = req.packCodes || [];
      const packVal = PackRegistry.validatePackSelection(targetPacks);

      if (!packVal.valid) {
        if (packVal.missingDependencies.length > 0) {
          validationIssues.push(
            `Missing dependencies: ${packVal.missingDependencies.map((d) => `${d.pack} -> [${d.missing.join(', ')}]`).join('; ')}`
          );
        }
        if (packVal.conflicts.length > 0) {
          validationIssues.push(
            `Conflicts: ${packVal.conflicts.map((c) => `${c.pack} conflicts with ${c.conflictsWith}`).join('; ')}`
          );
        }
      }

      const dummyContext: TenantContext = {
        tenantId: req.tenantId || 'sim_tenant',
        organizationId: 'sim_org',
        userId: 'sim_user',
        roleId: 'sim_role',
        roles: ['TENANT_ADMIN'],
        permissionSet: [],
        dataScope: 'ORGANIZATION',
        planId: req.planCode || 'PLAN_GROWTH',
        packIds: targetPacks,
        policyVersion: 1,
        isPlatformAdmin: false,
      };

      const resolved = EntitlementEngine.resolveAllCapabilities(dummyContext);

      // Estimate pricing impact
      let totalPackCost = 0;
      targetPacks.forEach((code) => {
        const pack = PackRegistry.getByCode(code);
        if (pack && pack.pricingModel !== 'INCLUDED') {
          totalPackCost += pack.price;
        }
      });

      events.push({
        action: req.action,
        resource: 'PACK_ASSIGNMENT',
        payload: { targetPacks, totalPackCost },
      });

      return {
        action: req.action,
        dryRun: true,
        success: validationIssues.length === 0,
        projectedState: {
          activePacks: targetPacks,
          effectiveModules: resolved.allowedModules,
          effectiveWorkspaces: resolved.allowedWorkspaces,
          effectiveLimits: resolved.limits,
        },
        diff: {
          addedCapabilities: resolved.allowedFeatures,
          financialImpactEstimatedUsd: totalPackCost,
        },
        validationIssues,
        eventsGenerated: events,
      };
    }

    if (req.action === 'RECORD_USAGE') {
      const meterKey = req.meterKey || 'bookings';
      const units = req.units || 1;
      const plan = PlanRegistry.getByCode(req.planCode || 'PLAN_GROWTH');
      const baseLimit = plan?.limits[meterKey] || 100;
      const willExceed = units > baseLimit;

      events.push({
        action: 'SIMULATE_USAGE_CONSUMPTION',
        resource: 'USAGE_METER',
        payload: { meterKey, units, baseLimit, willExceed },
      });

      return {
        action: req.action,
        dryRun: true,
        success: true,
        projectedState: {
          meterKey,
          consumedUnits: units,
          limit: baseLimit,
          status: willExceed ? 'OVERAGE' : 'NORMAL',
        },
        diff: {
          limitsChanged: {
            [meterKey]: { before: 0, after: units },
          },
        },
        validationIssues,
        eventsGenerated: events,
      };
    }

    // Default simulation response
    return {
      action: req.action,
      dryRun: true,
      success: true,
      projectedState: { requested: req },
      diff: {},
      validationIssues: [],
      eventsGenerated: events,
    };
  }
}
