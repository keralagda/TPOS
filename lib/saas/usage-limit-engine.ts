/**
 * TRAVEL PLANET .TOURS — SAAS USAGE & LIMIT ENFORCEMENT ENGINE
 * 
 * Manages usage meters (bookings, customers, leads, storage, AI tokens, api requests),
 * checks hard/soft limits, and calculates overage actions.
 */

import { LimitAction, LimitType, UsageMeter, UsageState } from './types';
import { PlanRegistry } from './plan-registry';
import { PackRegistry } from './pack-registry';

export interface UsageCheckResult {
  allowed: boolean;
  meterKey: string;
  currentValue: number;
  limitValue: number;
  percentageUsed: number;
  state: UsageState;
  action: LimitAction;
  message: string;
  overageCost?: number;
}

export class UsageAndLimitEngine {
  // In-memory meter registry keyed by `${tenantId}:${meterKey}`
  private static meters: Map<string, UsageMeter> = new Map();

  private static getMeterKey(tenantId: string, meterKey: string): string {
    return `${tenantId}:${meterKey}`;
  }

  /**
   * Initialize or retrieve a meter for a tenant
   */
  public static getOrCreateMeter(
    tenantId: string,
    meterKey: string,
    planId: string,
    packIds: string[],
    limitType: LimitType = 'HARD'
  ): UsageMeter {
    const key = this.getMeterKey(tenantId, meterKey);
    let meter = this.meters.get(key);

    if (!meter) {
      // Calculate effective limit from Plan + Packs
      let limitValue = 100; // fallback base

      const plan = PlanRegistry.getByCode(planId);
      if (plan && plan.limits[meterKey] !== undefined) {
        limitValue = plan.limits[meterKey];
      }

      // Add or override from packs
      for (const packCode of packIds) {
        const pack = PackRegistry.getByCode(packCode);
        if (pack && pack.includedLimits[meterKey] !== undefined) {
          // Packs can expand the baseline limit
          limitValue = Math.max(limitValue, pack.includedLimits[meterKey]);
        }
      }

      const overageAllowed = Boolean(plan?.overageRules[meterKey]);
      const overageRate = plan?.overageRules[meterKey]?.rate || 0;

      meter = {
        id: `meter_${tenantId}_${meterKey}`,
        meterKey,
        tenantId,
        currentValue: 0,
        limitValue,
        limitType,
        resetPeriod: 'MONTHLY',
        lastResetAt: new Date().toISOString(),
        warningThreshold: 0.8,
        hardStopThreshold: 1.0,
        overageAllowed,
        overageRate,
        overageUnitsConsumed: 0,
        status: 'NORMAL',
        updatedAt: new Date().toISOString(),
      };

      this.meters.set(key, meter);
    }

    return meter;
  }

  /**
   * Record consumption for a specific meter
   */
  public static recordUsage(
    tenantId: string,
    meterKey: string,
    units: number,
    planId: string,
    packIds: string[]
  ): UsageCheckResult {
    const meter = this.getOrCreateMeter(tenantId, meterKey, planId, packIds);
    meter.currentValue += units;
    meter.updatedAt = new Date().toISOString();

    const check = this.checkLimit(tenantId, meterKey, planId, packIds);
    meter.status = check.state;

    if (check.state === 'OVERAGE' && meter.overageAllowed) {
      meter.overageUnitsConsumed += units;
    }

    return check;
  }

  /**
   * Check limit status without mutating
   */
  public static checkLimit(
    tenantId: string,
    meterKey: string,
    planId: string,
    packIds: string[]
  ): UsageCheckResult {
    const meter = this.getOrCreateMeter(tenantId, meterKey, planId, packIds);
    const percentage = meter.limitValue > 0 ? (meter.currentValue / meter.limitValue) * 100 : 0;

    let state: UsageState = 'NORMAL';
    let action: LimitAction = 'NOTIFY';
    let allowed = true;
    let message = `Usage is normal: ${meter.currentValue}/${meter.limitValue} (${percentage.toFixed(1)}%)`;
    let overageCost = 0;

    if (meter.currentValue >= meter.limitValue) {
      if (meter.overageAllowed) {
        state = 'OVERAGE';
        action = 'CHARGE_OVERAGE';
        allowed = true;
        const overageUnits = meter.currentValue - meter.limitValue;
        overageCost = overageUnits * meter.overageRate;
        message = `Usage limit exceeded by ${overageUnits} units. Overage charging applied: $${overageCost.toFixed(2)}`;
      } else {
        state = 'LIMIT_REACHED';
        action = meter.limitType === 'HARD' ? 'BLOCK' : 'WARN';
        allowed = meter.limitType !== 'HARD';
        message = `Hard limit reached (${meter.currentValue}/${meter.limitValue}). Operation blocked until plan upgrade or limit reset.`;
      }
    } else if (percentage >= 90) {
      state = 'NEAR_LIMIT';
      action = 'WARN';
      message = `Approaching limit: ${percentage.toFixed(1)}% consumed.`;
    } else if (percentage >= 80) {
      state = 'WARNING';
      action = 'NOTIFY';
      message = `Usage warning: ${percentage.toFixed(1)}% consumed.`;
    }

    return {
      allowed,
      meterKey,
      currentValue: meter.currentValue,
      limitValue: meter.limitValue,
      percentageUsed: percentage,
      state,
      action,
      message,
      overageCost,
    };
  }

  /**
   * Get all active meters for a tenant
   */
  public static getTenantMeters(tenantId: string): UsageMeter[] {
    const results: UsageMeter[] = [];
    for (const [key, meter] of this.meters.entries()) {
      if (key.startsWith(`${tenantId}:`)) {
        results.push(meter);
      }
    }
    return results;
  }

  /**
   * Reset meters for a tenant (e.g. at month end)
   */
  public static resetTenantMeters(tenantId: string): void {
    for (const [key, meter] of this.meters.entries()) {
      if (key.startsWith(`${tenantId}:`)) {
        meter.currentValue = 0;
        meter.overageUnitsConsumed = 0;
        meter.status = 'NORMAL';
        meter.lastResetAt = new Date().toISOString();
        meter.updatedAt = new Date().toISOString();
      }
    }
  }
}
