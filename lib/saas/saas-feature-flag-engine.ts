/**
 * TRAVEL PLANET .TOURS — SAAS ADVANCED FEATURE FLAG ENGINE
 * 
 * Integrates with existing FeatureFlagsEngine while adding full multi-tenant,
 * plan-based, pack-based, percentage rollout, and killswitch capabilities.
 */

import { SaaSFeatureFlag, FeatureScope, FeatureRolloutStrategy } from './types';

export const CANONICAL_FEATURE_FLAGS: SaaSFeatureFlag[] = [
  {
    id: 'flag_new_dashboards',
    key: 'new_dashboards',
    name: 'Composable Dashboard OS',
    description: 'Enable 16 role-specific workspace dashboards across travel ops',
    scope: 'GLOBAL',
    state: 'ACTIVE',
    defaultValue: true,
    rolloutStrategy: 'BIG_BANG',
    rolloutPercentage: 100,
    allowedTenants: [],
    allowedPlans: [],
    allowedPacks: ['CORE_PLATFORM'],
    allowedRoles: [],
    allowedRegions: [],
    killSwitchEnabled: false,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00Z',
  },
  {
    id: 'flag_new_booking_engine',
    key: 'new_booking_engine',
    name: 'Voyage8 Unified Booking Runtime',
    description: 'Multi-item flight + hotel + transfer booking engine',
    scope: 'PACK',
    state: 'ACTIVE',
    defaultValue: true,
    rolloutStrategy: 'PERCENTAGE',
    rolloutPercentage: 100,
    allowedTenants: [],
    allowedPlans: ['PLAN_GROWTH', 'PLAN_PROFESSIONAL', 'PLAN_ENTERPRISE'],
    allowedPacks: ['BOOKING_ENGINE'],
    allowedRoles: [],
    allowedRegions: [],
    killSwitchEnabled: false,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00Z',
  },
  {
    id: 'flag_connectors_ndc',
    key: 'connectors_ndc',
    name: 'Direct Airline NDC Connectors',
    description: 'Direct airline API ticketing bypass',
    scope: 'PACK',
    state: 'ACTIVE',
    defaultValue: true,
    rolloutStrategy: 'PERCENTAGE',
    rolloutPercentage: 100,
    allowedTenants: [],
    allowedPlans: ['PLAN_GROWTH', 'PLAN_PROFESSIONAL', 'PLAN_ENTERPRISE'],
    allowedPacks: ['BOOKING_ENGINE'],
    allowedRoles: [],
    allowedRegions: [],
    killSwitchEnabled: false,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00Z',
  },
  {
    id: 'flag_ai_copilot_assistant',
    key: 'ai_copilot_assistant',
    name: 'Voyage8 AI Copilot & Voice Assistant',
    description: 'Generative AI trip synthesis, smart lead assist, and voice navigation',
    scope: 'PACK',
    state: 'ACTIVE',
    defaultValue: true,
    rolloutStrategy: 'PERCENTAGE',
    rolloutPercentage: 100,
    allowedTenants: [],
    allowedPlans: ['PLAN_GROWTH', 'PLAN_PROFESSIONAL', 'PLAN_ENTERPRISE'],
    allowedPacks: ['AI_COPILOT_ASSISTANT'],
    allowedRoles: [],
    allowedRegions: [],
    killSwitchEnabled: false,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00Z',
  },
  {
    id: 'flag_b2b2c_partner_portal',
    key: 'b2b2c_partner_portal',
    name: 'B2B2C Partner Wallet & White-labeling',
    description: 'Sub-agent wallet drawdown, dynamic markup, and white-labeled checkout',
    scope: 'PACK',
    state: 'ACTIVE',
    defaultValue: true,
    rolloutStrategy: 'PLAN_BATCH',
    rolloutPercentage: 100,
    allowedTenants: [],
    allowedPlans: ['PLAN_PROFESSIONAL', 'PLAN_ENTERPRISE'],
    allowedPacks: ['WHITE_LABEL', 'SUPPLIER_MANAGEMENT'],
    allowedRoles: [],
    allowedRegions: [],
    killSwitchEnabled: false,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00Z',
  },
  {
    id: 'flag_corporate_travel_approvals',
    key: 'corporate_travel_approvals',
    name: 'Corporate Business Travel Hub',
    description: 'Employee travel policy compliance and GST invoice consolidation',
    scope: 'PACK',
    state: 'ACTIVE',
    defaultValue: true,
    rolloutStrategy: 'PLAN_BATCH',
    rolloutPercentage: 100,
    allowedTenants: [],
    allowedPlans: ['PLAN_ENTERPRISE'],
    allowedPacks: ['CORPORATE_TRAVEL'],
    allowedRoles: [],
    allowedRegions: [],
    killSwitchEnabled: false,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00Z',
  },
  {
    id: 'flag_supplier_marketplace',
    key: 'supplier_marketplace',
    name: 'Direct Supplier Bidding Marketplace',
    description: 'Direct contracting for local destination DMCs and resorts',
    scope: 'PACK',
    state: 'ACTIVE',
    defaultValue: true,
    rolloutStrategy: 'PERCENTAGE',
    rolloutPercentage: 100,
    allowedTenants: [],
    allowedPlans: ['PLAN_PROFESSIONAL', 'PLAN_ENTERPRISE'],
    allowedPacks: ['SUPPLIER_MANAGEMENT'],
    allowedRoles: [],
    allowedRegions: [],
    killSwitchEnabled: false,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00Z',
  },
  {
    id: 'flag_alpha_fintech_hedging',
    key: 'alpha_fintech_hedging',
    name: 'Experimental FinTech Alpha & FX Hedging',
    description: 'Forward foreign exchange currency hedging for international tours',
    scope: 'TENANT',
    state: 'STAGED',
    defaultValue: false,
    rolloutStrategy: 'CANARY',
    rolloutPercentage: 5,
    allowedTenants: ['tenant_tp_hq'],
    allowedPlans: ['PLAN_ENTERPRISE'],
    allowedPacks: ['FINANCE_ACCOUNTING'],
    allowedRoles: ['PLATFORM_SUPER_ADMIN'],
    allowedRegions: ['us-east-1'],
    killSwitchEnabled: false,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00Z',
  },
];

export class SaaSFeatureFlagEngine {
  private static flags: Map<string, SaaSFeatureFlag> = new Map(
    CANONICAL_FEATURE_FLAGS.map((f) => [f.key, f])
  );

  public static getAllFlags(): SaaSFeatureFlag[] {
    return Array.from(this.flags.values());
  }

  public static getFlag(key: string): SaaSFeatureFlag | undefined {
    return this.flags.get(key);
  }

  public static updateFlag(key: string, updates: Partial<SaaSFeatureFlag>): SaaSFeatureFlag {
    const existing = this.flags.get(key);
    if (!existing) {
      throw new Error(`Feature flag ${key} not found.`);
    }
    const updated = {
      ...existing,
      ...updates,
      version: existing.version + 1,
    };
    this.flags.set(key, updated);
    return updated;
  }

  /**
   * Comprehensive feature evaluation following §07
   * TENANT -> PLAN -> PACK -> TARGETING -> ROLLOUT -> KILLSWITCH -> FINAL VALUE
   */
  public static isFeatureActive(
    key: string,
    context: {
      tenantId?: string;
      planId?: string;
      packIds?: string[];
      role?: string;
      dataRegion?: string;
      isPlatformAdmin?: boolean;
    }
  ): { active: boolean; reason: string } {
    const flag = this.flags.get(key);
    if (!flag) {
      return { active: false, reason: 'Flag not found in registry' };
    }

    // 1. KillSwitch check
    if (flag.killSwitchEnabled) {
      return { active: false, reason: 'Flag is disabled by emergency killswitch' };
    }

    // 2. Platform Admin Bypass (for testing and previews)
    if (context.isPlatformAdmin) {
      return { active: true, reason: 'Platform admin elevation preview' };
    }

    // 3. Status check
    if (flag.state !== 'ACTIVE' && flag.state !== 'STAGED') {
      return { active: false, reason: `Flag state is ${flag.state}` };
    }

    // 4. Tenant allowlist
    if (flag.allowedTenants.length > 0 && context.tenantId) {
      if (flag.allowedTenants.includes(context.tenantId)) {
        return { active: true, reason: 'Explicitly allowed for tenant' };
      }
    }

    // 5. Pack check
    if (flag.allowedPacks.length > 0 && context.packIds) {
      const hasPack = flag.allowedPacks.some((p) => context.packIds!.includes(p));
      if (!hasPack && flag.scope === 'PACK') {
        return { active: false, reason: `Requires pack(s): ${flag.allowedPacks.join(', ')}` };
      }
    }

    // 6. Plan check
    if (flag.allowedPlans.length > 0 && context.planId) {
      if (!flag.allowedPlans.includes(context.planId) && flag.scope === 'PLAN') {
        return { active: false, reason: `Requires plan(s): ${flag.allowedPlans.join(', ')}` };
      }
    }

    // 7. Role check
    if (flag.allowedRoles.length > 0 && context.role) {
      if (!flag.allowedRoles.includes(context.role)) {
        return { active: false, reason: `Restricted to roles: ${flag.allowedRoles.join(', ')}` };
      }
    }

    // 8. Rollout percentage check
    if (flag.rolloutPercentage < 100 && context.tenantId) {
      // Deterministic hash based on tenantId and flag key
      let hash = 0;
      const str = `${context.tenantId}:${flag.key}`;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const score = Math.abs(hash) % 100;
      if (score >= flag.rolloutPercentage) {
        return { active: false, reason: `Tenant not in ${flag.rolloutPercentage}% canary rollout cohort` };
      }
    }

    return { active: flag.defaultValue, reason: 'Resolved from default value and rollout criteria' };
  }
}
