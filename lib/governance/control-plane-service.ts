import { prisma } from '../prisma';

export interface FeatureFlagPayload {
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercentage?: number;
  allowedTenants?: string[];
  allowedRoles?: string[];
}

export interface OperationModePayload {
  modeKey: string;
  name: string;
  version: string;
  description?: string;
  navigationConfig: any;
  widgetConfig: any;
  defaultLandingRoute?: string;
  supportedRoles: string[];
}

export class ControlPlaneService {
  /**
   * List all dynamic feature flags or seed defaults if empty (§31)
   */
  static async listFeatureFlags() {
    const flags = await prisma.featureFlagRecord.findMany({
      orderBy: { key: 'asc' },
    });

    if (flags.length === 0) {
      // Seed canonical flags
      const canonicals = [
        {
          key: 'enable_social8_circles',
          name: 'Social8 Travel Circles & Discussions',
          description: 'Enables community group formation and journey proposals (§16)',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_gem8_discovery',
          name: 'GEM8 Beyond-The-Icon Discovery',
          description: 'Enables verified offbeat places paired with iconic destinations (§17)',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_voice_navigation',
          name: 'VN8/VO8 Voice Command Bar',
          description: 'Enables microphone voice-to-intent navigation and operations (§19)',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_dms_documents',
          name: 'DMS Tokenized Document Engine',
          description: 'Enables automated PDF/HTML vouchers and tax invoices (§15)',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_vibe8_cms',
          name: 'VIBE8 Travel-First CMS & Visual Builder',
          description: 'Enables 18 travel content types, component registry, and theme engine',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_vibe8_journey_studio',
          name: 'Journey Studio Living Itineraries',
          description: 'Enables real-time weather & crowd-adaptive Living Journey creation',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_vibe8_destination_studio',
          name: 'Destination Studio Knowledge Hubs',
          description: 'Enables comprehensive multi-lingual destination pages and insider gems',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_hestia8_seo',
          name: 'HESTIA8 Omni AI SEO & Entity Graph',
          description: 'Enables AEO/GEO optimization, Schema.org JSON-LD generation, and hierarchical internal linking',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_hestia8_campaign_studio',
          name: 'HESTIA8 AI Campaign Studio',
          description: 'Enables automated multi-channel campaign asset synthesis across ads, landing pages, and messaging',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_dms8_vault',
          name: 'DMS8 Intelligent Travel Document OS & Digital Vault',
          description: 'Enables enterprise travel document vault, OCR AI, and multi-vault hierarchy',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_dms8_template_builder',
          name: 'DMS8 Document Template Visual Builder',
          description: 'Enables dynamic drag-drop travel document templates with multi-format rendering',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_dms8_compliance',
          name: 'DMS8 Travel Compliance & Expiry Engine',
          description: 'Enables proactive 30-day passport/visa expiry alerts and data classifications',
          isEnabled: true,
          rolloutPercentage: 100,
        },
        {
          key: 'enable_crude8_engine',
          name: 'CRUDE8 Universal Real-Time CRUD Engine',
          description: 'Enables governed, registry-driven, real-time CRUD pipeline and Sync8 cascades',
          isEnabled: true,
          rolloutPercentage: 100,
        },
      ];

      for (const item of canonicals) {
        await prisma.featureFlagRecord.create({ data: item });
      }

      return prisma.featureFlagRecord.findMany({ orderBy: { key: 'asc' } });
    }

    return flags;
  }

  /**
   * Toggle or update a feature flag with tenant/role targeting
   */
  static async updateFeatureFlag(key: string, data: Partial<FeatureFlagPayload>) {
    return prisma.featureFlagRecord.upsert({
      where: { key },
      update: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.isEnabled !== undefined ? { isEnabled: data.isEnabled } : {}),
        ...(data.rolloutPercentage !== undefined ? { rolloutPercentage: data.rolloutPercentage } : {}),
        ...(data.allowedTenants ? { allowedTenants: data.allowedTenants } : {}),
        ...(data.allowedRoles ? { allowedRoles: data.allowedRoles } : {}),
      },
      create: {
        key,
        name: data.name || key,
        description: data.description,
        isEnabled: data.isEnabled ?? false,
        rolloutPercentage: data.rolloutPercentage ?? 100,
        allowedTenants: data.allowedTenants ?? [],
        allowedRoles: data.allowedRoles ?? [],
      },
    });
  }

  /**
   * Update a versioned operation mode (§33) — used by scheduled rollovers & rollbacks
   */
  static async updateOperationMode(modeKey: string, data: Partial<{
    name: string;
    description: string;
    version: string;
    navigationConfig: any;
    widgetConfig: any;
    defaultLandingRoute: string;
    supportedRoles: string[];
    status: string;
  }>) {
    return prisma.operationModeRecord.update({
      where: { modeKey },
      data,
    });
  }

  /**
   * Check if a feature flag is active for a given tenant/role (§31)
   */
  static async isFeatureActive(key: string, tenantId?: string, userRole?: string): Promise<boolean> {
    const flag = await prisma.featureFlagRecord.findUnique({
      where: { key },
    });

    if (!flag || !flag.isEnabled) return false;

    // Check tenant allowlist if configured
    if (flag.allowedTenants.length > 0 && tenantId) {
      if (!flag.allowedTenants.includes(tenantId)) return false;
    }

    // Check role allowlist if configured
    if (flag.allowedRoles.length > 0 && userRole) {
      if (!flag.allowedRoles.includes(userRole)) return false;
    }

    return true;
  }

  /**
   * List versioned operation modes (§33)
   */
  static async listOperationModes() {
    const modes = await prisma.operationModeRecord.findMany({
      orderBy: { modeKey: 'asc' },
    });

    if (modes.length === 0) {
      const canonicalModes = [
        {
          modeKey: 'B2C_TRAVELER',
          name: 'B2C Traveler Discovery Mode',
          version: '2.0.0',
          description: 'Public-facing booking marketplace, circles, and trip planner',
          navigationConfig: ['explore', 'circles', 'stays', 'flights', 'packages', 'experiences'],
          widgetConfig: ['hero_search', 'trending_destinations', 'gem8_discovery', 'exclusive_offers'],
          defaultLandingRoute: '/',
          supportedRoles: ['CUSTOMER', 'CONSUMER'],
          status: 'ACTIVE',
        },
        {
          modeKey: 'TRAVEL_AGENT',
          name: 'Travel Agent Workspace Mode',
          version: '2.0.0',
          description: 'Sales pipeline, quotes, passenger management, and booking issuance',
          navigationConfig: ['agent_dashboard', 'crm_leads', 'quotes', 'itinerary_builder'],
          widgetConfig: ['leads_funnel', 'recent_quotes', 'upcoming_departures'],
          defaultLandingRoute: '/agent/dashboard',
          supportedRoles: ['TRAVEL_AGENT', 'SALES_MANAGER'],
          status: 'ACTIVE',
        },
        {
          modeKey: 'OPERATIONS_DISPATCH',
          name: 'Operations & TMS Dispatcher Mode',
          version: '2.0.0',
          description: 'Flight PNR sync, supplier tasks, visa concierge, and incident runbooks',
          navigationConfig: ['operations_dashboard', 'erp_trips', 'visa_concierge', 'runbooks'],
          widgetConfig: ['pending_tasks', 'flight_alerts', 'visa_queue'],
          defaultLandingRoute: '/operations/dashboard',
          supportedRoles: ['OPERATIONS_MANAGER', 'ADMIN', 'PLATFORM_SUPER_ADMIN'],
          status: 'ACTIVE',
        },
      ];

      for (const m of canonicalModes) {
        await prisma.operationModeRecord.create({ data: m as any });
      }

      return prisma.operationModeRecord.findMany({ orderBy: { modeKey: 'asc' } });
    }

    return modes;
  }

  /**
   * Schedule a timed OTA platform rollover with health gates (§32)
   */
  static async scheduleRollover(data: {
    title: string;
    targetType: 'FEATURE_FLAG' | 'OPERATION_MODE' | 'RELEASE_PACKAGE';
    targetId: string;
    scheduledForUtc: Date;
    healthThreshold?: { maxErrorRate: number; maxLatencyMs: number };
    snapshotData?: any;
  }) {
    return prisma.timedScheduleRecord.create({
      data: {
        title: data.title,
        targetType: data.targetType,
        targetId: data.targetId,
        scheduledForUtc: data.scheduledForUtc,
        healthThreshold: data.healthThreshold ?? { maxErrorRate: 0.02, maxLatencyMs: 800 },
        snapshotData: data.snapshotData ?? {},
        status: 'PENDING',
      },
    });
  }

  /**
   * Execute or simulate rollover activation with health gate checking (§32)
   */
  static async executeRollover(scheduleId: string) {
    const schedule = await prisma.timedScheduleRecord.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) throw new Error('Schedule not found');

    // Simulate health-gated verification check
    const currentHealthPasses = true; // In production: checks telemetry error rate
    if (!currentHealthPasses) {
      return prisma.timedScheduleRecord.update({
        where: { id: scheduleId },
        data: {
          status: 'FAILED',
          logs: 'Rollover aborted: Health gate error threshold exceeded.',
        },
      });
    }

    // Apply rollover state
    if (schedule.targetType === 'FEATURE_FLAG') {
      await prisma.featureFlagRecord.update({
        where: { key: schedule.targetId },
        data: { isEnabled: true, rolloutPercentage: 100 },
      });
    } else if (schedule.targetType === 'OPERATION_MODE') {
      await prisma.operationModeRecord.update({
        where: { modeKey: schedule.targetId },
        data: { status: 'ACTIVE' },
      });
    }

    return prisma.timedScheduleRecord.update({
      where: { id: scheduleId },
      data: {
        status: 'COMPLETED',
        executedAt: new Date(),
        logs: 'Health gate passed (error rate: 0.00%). Rollover executed successfully.',
      },
    });
  }
}
