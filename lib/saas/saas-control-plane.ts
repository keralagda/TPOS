/**
 * TRAVEL PLANET .TOURS — SAAS CONTROL PLANE CENTRAL ORCHESTRATOR
 * 
 * Unifies Tenant Provisioning, Plan Management, Pack Assignment,
 * Entitlement Evaluation, Usage Enforcement, Feature Flags, and Audit Logging.
 */

import { Tenant, TenantContext, TenantTemplate, ProvisioningState } from './types';
import { PlanRegistry, CANONICAL_PLANS } from './plan-registry';
import { PackRegistry, CANONICAL_PACKS } from './pack-registry';
import { EntitlementEngine } from './entitlement-engine';
import { UsageAndLimitEngine } from './usage-limit-engine';
import { SaaSFeatureFlagEngine } from './saas-feature-flag-engine';
import { TenantProvisioningEngine, ProvisioningRequest, ProvisioningResult } from './tenant-provisioning-engine';
import { SaaSSimulatorAndAuditBus } from './saas-simulator-bus';

export class SaaSControlPlane {
  private static initialized = false;

  /**
   * Initialize SaaS Plane with canonical templates and demo seeds if empty
   */
  public static async initialize(): Promise<void> {
    if (this.initialized) return;

    // Seed default Travel Planet flagship tenant if not present
    const existing = TenantProvisioningEngine.getTenant('tp_flagship');
    if (!existing) {
      await TenantProvisioningEngine.provisionTenant({
        tenantCode: 'TP_HQ',
        legalName: 'Travel Planet Worldwide Tours Ltd.',
        displayName: 'Travel Planet Worldwide Flagship',
        slug: 'travelplanet',
        tenantType: 'TOUR_OPERATOR',
        industry: 'Experiential Tourism & Destination Management',
        country: 'AE',
        region: 'Middle East',
        timezone: 'Asia/Dubai',
        currency: 'USD',
        planCode: 'PLAN_ENTERPRISE',
        packCodes: [
          'CORE_PLATFORM',
          'CRM_SALES',
          'TRAVEL_MANAGEMENT',
          'BOOKING_ENGINE',
          'TRAVEL_PACKAGES',
          'SUPPLIER_MANAGEMENT',
          'FINANCE_ACCOUNTING',
          'DOCUMENTS_DMS8',
          'COMPLIANCE8',
          'CALENDAR8',
          'MARKETING_CAMPAIGNS',
          'VIBE8_CONTENT_CMS',
          'SOCIAL8_COMMUNITY',
          'AI_COPILOT_ASSISTANT',
          'ANALYTICS_BI',
          'WHITE_LABEL',
          'CRUDE8_AUTOMATION',
        ],
        ownerEmail: 'superadmin@travelplanet.tours',
        ownerFullName: 'Platform Super Admin',
        dataRegion: 'me-central-1',
      });

      // Seed a starter boutique tenant for multi-tenant isolation demonstrations
      await TenantProvisioningEngine.provisionTenant({
        tenantCode: 'APEX_SAFARIS',
        legalName: 'Apex Safaris Ltd.',
        displayName: 'Apex Serengeti Safaris',
        slug: 'apex-safaris',
        tenantType: 'DMC',
        industry: 'Wildlife & Safari Excursions',
        country: 'TZ',
        region: 'East Africa',
        timezone: 'Africa/Dar_es_Salaam',
        currency: 'USD',
        planCode: 'PLAN_STARTER',
        packCodes: ['CORE_PLATFORM', 'TRAVEL_MANAGEMENT', 'DOCUMENTS_DMS8'],
        ownerEmail: 'safari@apex-safaris.com',
        ownerFullName: 'Juma Mwangi',
        dataRegion: 'eu-central-1',
      });
    }

    this.initialized = true;
  }

  // --- Tenants ---
  public static getAllTenants() {
    return TenantProvisioningEngine.getAllTenants();
  }

  public static getTenant(idOrSlug: string) {
    return TenantProvisioningEngine.getTenant(idOrSlug);
  }

  public static provisionTenant(req: ProvisioningRequest) {
    return TenantProvisioningEngine.provisionTenant(req);
  }

  public static suspendTenant(tenantId: string, reason: string) {
    const updated = TenantProvisioningEngine.suspendTenant(tenantId, reason);
    SaaSSimulatorAndAuditBus.logEvent({
      tenantId,
      actor: { userId: 'admin', email: 'admin@travelplanet.tours', role: 'PLATFORM_SUPER_ADMIN' },
      action: 'TENANT_SUSPENDED',
      resource: 'TENANT',
      resourceId: tenantId,
      version: updated.version,
      correlationId: `corr_${Date.now()}`,
      payload: { reason },
      source: 'SAAS_CONTROL_PLANE',
    });
    return updated;
  }

  public static reactivateTenant(tenantId: string) {
    const updated = TenantProvisioningEngine.reactivateTenant(tenantId);
    SaaSSimulatorAndAuditBus.logEvent({
      tenantId,
      actor: { userId: 'admin', email: 'admin@travelplanet.tours', role: 'PLATFORM_SUPER_ADMIN' },
      action: 'TENANT_REACTIVATED',
      resource: 'TENANT',
      resourceId: tenantId,
      version: updated.version,
      correlationId: `corr_${Date.now()}`,
      payload: {},
      source: 'SAAS_CONTROL_PLANE',
    });
    return updated;
  }

  public static updateTenantPlanAndPacks(tenantId: string, newPlanCode?: string, newPackCodes?: string[]) {
    const updated = TenantProvisioningEngine.updateTenantPlanAndPacks(tenantId, newPlanCode, newPackCodes);
    SaaSSimulatorAndAuditBus.logEvent({
      tenantId,
      actor: { userId: 'admin', email: 'admin@travelplanet.tours', role: 'PLATFORM_SUPER_ADMIN' },
      action: 'TENANT_PLAN_PACKS_MODIFIED',
      resource: 'TENANT',
      resourceId: tenantId,
      version: updated.version,
      correlationId: `corr_${Date.now()}`,
      payload: { newPlanCode, newPackCodes },
      source: 'SAAS_CONTROL_PLANE',
    });
    return updated;
  }

  // --- Plans ---
  public static getAllPlans() {
    return PlanRegistry.getAll();
  }

  public static getPlan(code: string) {
    return PlanRegistry.getByCode(code);
  }

  // --- Packs ---
  public static getAllPacks() {
    return PackRegistry.getAll();
  }

  public static getPack(code: string) {
    return PackRegistry.getByCode(code);
  }

  public static validatePacks(packCodes: string[]) {
    return PackRegistry.validatePackSelection(packCodes);
  }

  // --- Entitlements ---
  public static evaluateEntitlement(context: TenantContext, resource: string, capability: string) {
    return EntitlementEngine.evaluate({ tenantContext: context, resource, capability });
  }

  public static resolveAllCapabilities(context: TenantContext) {
    return EntitlementEngine.resolveAllCapabilities(context);
  }

  // --- Feature Flags ---
  public static getAllFeatureFlags() {
    return SaaSFeatureFlagEngine.getAllFlags();
  }

  public static evaluateFeature(
    key: string,
    context: {
      tenantId?: string;
      planId?: string;
      packIds?: string[];
      role?: string;
      isPlatformAdmin?: boolean;
    }
  ) {
    return SaaSFeatureFlagEngine.isFeatureActive(key, context);
  }

  // --- Usage & Limits ---
  public static getTenantMeters(tenantId: string) {
    return UsageAndLimitEngine.getTenantMeters(tenantId);
  }

  public static recordUsage(
    tenantId: string,
    meterKey: string,
    units: number,
    planId: string,
    packIds: string[]
  ) {
    return UsageAndLimitEngine.recordUsage(tenantId, meterKey, units, planId, packIds);
  }

  // --- Simulator & Audits ---
  public static simulate(req: any) {
    return SaaSSimulatorAndAuditBus.simulate(req);
  }

  public static getAuditLogs(filter?: any) {
    return SaaSSimulatorAndAuditBus.getAuditLogs(filter);
  }
}

// Auto-initialize canonical demo state
SaaSControlPlane.initialize();
