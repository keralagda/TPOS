/**
 * TRAVEL PLANET .TOURS — SAAS PLANE CORE TYPES & INTERFACES
 * Doctrine: "PLATFORM OWNS THE SAAS PLANE. TENANTS OWN THEIR BUSINESS."
 * "ENTITLEMENT ≠ FEATURE FLAG ≠ PERMISSION ≠ CONFIGURATION ≠ USAGE LIMIT."
 * "PLAN DEFINES POSSIBILITY. PACK DEFINES CAPABILITY. ENTITLEMENT DEFINES ACCESS.
 *  FEATURE FLAG DEFINES RELEASE. ROLE DEFINES AUTHORITY. POLICY DEFINES BEHAVIOR."
 */

export type TenantType =
  | 'TRAVEL_AGENCY'
  | 'TOUR_OPERATOR'
  | 'DMC'
  | 'CORPORATE_TRAVEL'
  | 'HOTEL_GROUP'
  | 'EXPERIENCE_PROVIDER'
  | 'TRAVEL_MARKETPLACE'
  | 'VISA_AGENCY'
  | 'TRANSPORT_OPERATOR'
  | 'ENTERPRISE'
  | 'FRANCHISE'
  | 'WHITE_LABEL_PARTNER'
  | 'DEVELOPER'
  | 'DEMO'
  | 'INTERNAL';

export type TenantLifecycleStage =
  | 'PROSPECT'
  | 'PROVISIONING'
  | 'PENDING_SETUP'
  | 'TRIAL'
  | 'ACTIVE'
  | 'LIMITED'
  | 'PAST_DUE'
  | 'SUSPENDED'
  | 'GRACE_PERIOD'
  | 'DEACTIVATING'
  | 'DEACTIVATED'
  | 'ARCHIVED';

export type PlanType =
  | 'FREE'
  | 'TRIAL'
  | 'STARTER'
  | 'GROWTH'
  | 'PROFESSIONAL'
  | 'BUSINESS'
  | 'ENTERPRISE'
  | 'CUSTOM'
  | 'INTERNAL';

export type BillingModel =
  | 'PER_TENANT'
  | 'PER_USER'
  | 'PER_SEAT'
  | 'PER_BRANCH'
  | 'PER_BOOKING'
  | 'USAGE_BASED'
  | 'HYBRID'
  | 'CUSTOM_CONTRACT';

export type BillingCycle = 'MONTHLY' | 'ANNUAL' | 'QUARTERLY' | 'CUSTOM';

export type PlanLifecycleStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'RETIRED';

export type PackCategory =
  | 'CORE'
  | 'CRM'
  | 'TRAVEL'
  | 'BOOKING'
  | 'TMS'
  | 'ERP'
  | 'FINANCE'
  | 'SUPPLIER'
  | 'DOCUMENTS'
  | 'COMPLIANCE'
  | 'CALENDAR'
  | 'MARKETING'
  | 'CONTENT'
  | 'COMMUNITY'
  | 'AI'
  | 'ANALYTICS'
  | 'CORPORATE'
  | 'API'
  | 'INTEGRATIONS'
  | 'WHITE_LABEL'
  | 'AUTOMATION'
  | 'ADVANCED'
  | 'INDUSTRY';

export type PackAssignmentType =
  | 'INCLUDED'
  | 'ADD_ON'
  | 'TRIAL'
  | 'PROMOTIONAL'
  | 'CUSTOM'
  | 'MANDATORY'
  | 'INHERITED'
  | 'OVERRIDDEN';

export type EntitlementSource =
  | 'PLAN'
  | 'PACK'
  | 'ADDON'
  | 'CONTRACT'
  | 'PROMOTION'
  | 'TRIAL'
  | 'CUSTOM_OVERRIDE'
  | 'SYSTEM';

export type FeatureScope =
  | 'GLOBAL'
  | 'ENVIRONMENT'
  | 'PLAN'
  | 'PACK'
  | 'TENANT'
  | 'ORGANIZATION'
  | 'BRANCH'
  | 'WORKSPACE'
  | 'ROLE'
  | 'USER'
  | 'COHORT'
  | 'PERCENTAGE';

export type FeatureRolloutStrategy =
  | 'BIG_BANG'
  | 'CANARY'
  | 'PERCENTAGE'
  | 'TENANT_BATCH'
  | 'PLAN_BATCH'
  | 'PACK_BATCH'
  | 'REGION_BATCH'
  | 'ROLE_BATCH'
  | 'SCHEDULED'
  | 'HEALTH_GATED';

export type FeatureFlagState =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'STAGED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'ROLLOVER_PENDING'
  | 'ROLLED_OVER'
  | 'ROLLED_BACK'
  | 'EXPIRED'
  | 'ARCHIVED';

export type LimitType =
  | 'HARD'
  | 'SOFT'
  | 'WARNING'
  | 'BURST'
  | 'DAILY'
  | 'MONTHLY'
  | 'ANNUAL'
  | 'CONCURRENT'
  | 'TOTAL'
  | 'PER_USER'
  | 'PER_BRANCH'
  | 'PER_RESOURCE';

export type UsageState =
  | 'NORMAL'
  | 'WARNING'
  | 'NEAR_LIMIT'
  | 'LIMIT_REACHED'
  | 'OVERAGE'
  | 'BLOCKED';

export type LimitAction =
  | 'NOTIFY'
  | 'WARN'
  | 'THROTTLE'
  | 'ALLOW_OVERAGE'
  | 'CHARGE_OVERAGE'
  | 'REQUIRE_UPGRADE'
  | 'BLOCK'
  | 'ESCALATE';

export type SubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'GRACE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED';

export type ProvisioningState =
  | 'QUEUED'
  | 'VALIDATING'
  | 'PROVISIONING'
  | 'CONFIGURING'
  | 'SEEDING'
  | 'VERIFYING'
  | 'READY'
  | 'FAILED'
  | 'ROLLBACK_PENDING'
  | 'ROLLED_BACK';

export type DomainLifecycleState =
  | 'REQUESTED'
  | 'DNS_PENDING'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'SSL_PENDING'
  | 'ACTIVE'
  | 'FAILED'
  | 'REVOKED';

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';

export type IsolationStrategy =
  | 'SHARED_PARTITIONED'
  | 'SEPARATE_SCHEMA'
  | 'SEPARATE_DATABASE'
  | 'REGIONAL_DATABASE'
  | 'ENTERPRISE_DEDICATED';

export type AITier =
  | 'OFF'
  | 'ASSISTED'
  | 'ADVANCED'
  | 'AUTONOMOUS_WITH_APPROVAL'
  | 'ENTERPRISE_CONTROLLED';

// -------------------------------------------------------------
// CORE ENTITIES
// -------------------------------------------------------------

export interface Tenant {
  id: string;
  tenantCode: string;
  organizationId: string;
  legalName: string;
  displayName: string;
  slug: string;
  tenantType: TenantType;
  industry: string;
  country: string;
  region: string;
  timezone: string;
  currency: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'LIMITED' | 'TRIAL' | 'DEACTIVATED';
  lifecycleStage: TenantLifecycleStage;
  subscriptionId?: string;
  planId: string;
  packIds: string[];
  entitlementProfileId?: string;
  featureProfileId?: string;
  usageProfileId?: string;
  policyProfileId?: string;
  brandingProfileId?: string;
  workspaceProfileId?: string;
  integrationProfileId?: string;
  securityProfileId?: string;
  complianceProfileId?: string;
  billingProfileId?: string;
  supportProfileId?: string;
  aiProfileId?: string;
  dataRegion: string;
  isolationStrategy: IsolationStrategy;
  databaseContext?: string;
  storageContext?: string;
  domain: string;
  customDomains: string[];
  subdomains: string[];
  ownerUserId: string;
  tenantAdminIds: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  activatedAt?: string;
  suspendedAt?: string;
  deletedAt?: string;
  version: number;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string;
  version: number;
  status: PlanLifecycleStatus;
  planType: PlanType;
  billingModel: BillingModel;
  billingCycle: BillingCycle;
  basePrice: number;
  currency: string;
  trialDays: number;
  setupFee: number;
  minimumCommitment: number;
  renewalPolicy: 'AUTO_RENEW' | 'MANUAL' | 'CONTRACT_RENEGOTIATE';
  gracePeriod: number;
  allowedPacks: string[];
  defaultPacks: string[];
  includedEntitlements: string[];
  includedFeatures: string[];
  limits: Record<string, number>;
  overageRules: Record<string, { rate: number; unit: string; maxBurst?: number }>;
  usageMeters: string[];
  allowedRoles: string[];
  allowedWorkspaces: string[];
  allowedBranches: { maxBranches: number; allowsMultiBranch: boolean };
  allowedIntegrations: string[];
  allowedAPIs: string[];
  storageLimitMb: number;
  userLimit: number;
  branchLimit: number;
  customerLimit: number;
  bookingLimit: number;
  documentLimit: number;
  automationLimit: number;
  aiUsageLimitTokens: number;
  apiRequestLimitDaily: number;
  notificationLimitMonthly: number;
  supportTier: 'COMMUNITY' | 'STANDARD' | 'PRIORITY' | 'PREMIUM' | 'ENTERPRISE';
  slaTier: string;
  securityTier: 'STANDARD' | 'ENHANCED' | 'ENTERPRISE_SOC2';
  dataRegionPolicy: string[];
  retentionPolicy: { dataDays: number; auditDays: number };
  brandingPolicy: { allowsCustomLogo: boolean; allowsWhiteLabel: boolean };
  customDomainPolicy: { allowsCustomDomains: boolean; maxDomains: number };
  whiteLabelPolicy: { enabled: boolean; removePoweredBy: boolean };
  sandboxPolicy: { allowed: boolean; maxSandboxes: number };
  backupPolicy: { automatedHourly: boolean; automatedDaily: boolean; retentionDays: number };
  analyticsPolicy: { realTime: boolean; customDashboards: boolean; exportAllowed: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface Pack {
  id: string;
  code: string;
  name: string;
  displayName: string;
  description: string;
  category: PackCategory;
  version: number;
  status: 'ACTIVE' | 'BETA' | 'DEPRECATED' | 'RETIRED';
  icon?: string;
  dependencies: string[]; // Pack codes required
  conflicts: string[];    // Pack codes incompatible
  includedModules: string[];
  includedFeatures: string[];
  includedPermissions: string[];
  includedWorkspaces: string[];
  includedModes: string[];
  includedRoutes: string[];
  includedWidgets: string[];
  includedReports: string[];
  includedIntegrations: string[];
  includedAutomations: string[];
  includedAIAbilities: string[];
  includedUsageMeters: string[];
  includedLimits: Record<string, number>;
  configurationSchema?: Record<string, any>;
  defaultConfiguration?: Record<string, any>;
  eligibilityRules?: Record<string, any>;
  pricingModel: 'INCLUDED' | 'ADD_ON_FLAT' | 'ADD_ON_PER_SEAT' | 'USAGE_BASED';
  price: number;
  billingCycle?: BillingCycle;
  trialPolicy?: { days: number; allowed: boolean };
  upgradePath?: string[];
  downgradePath?: string[];
  effectiveFrom: string;
  effectiveUntil?: string;
  createdBy: string;
}

export interface Entitlement {
  id: string;
  tenantId: string;
  source: EntitlementSource;
  sourceId: string; // Plan ID or Pack ID or Contract ID
  resource: string; // e.g. "crm", "tms", "booking", "api"
  capability: string; // e.g. "ndc_booking", "white_label", "unlimited_invoices"
  action: 'ALLOW' | 'DENY' | 'METERED' | 'CONDITIONAL';
  scope: string; // "GLOBAL", "ORGANIZATION", "BRANCH", "WORKSPACE"
  limit?: number;
  quota?: number;
  configuration?: Record<string, any>;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'OVERRIDDEN';
  effectiveFrom: string;
  effectiveUntil?: string;
  conditions?: Record<string, any>[];
  priority: number; // Higher number = higher precedence
  overridePolicy?: 'NEVER_OVERRIDE' | 'ALLOW_ADMIN_OVERRIDE' | 'ALLOW_CONTRACT_OVERRIDE';
  version: number;
}

export interface SaaSFeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  scope: FeatureScope;
  state: FeatureFlagState;
  defaultValue: any;
  rolloutStrategy: FeatureRolloutStrategy;
  rolloutPercentage: number;
  allowedTenants: string[];
  allowedPlans: string[];
  allowedPacks: string[];
  allowedRoles: string[];
  allowedRegions: string[];
  conditions?: Record<string, any>[];
  dependencies?: string[];
  killSwitchEnabled: boolean;
  version: number;
  effectiveFrom: string;
  effectiveUntil?: string;
}

export interface UsageMeter {
  id: string;
  meterKey: string;
  tenantId: string;
  currentValue: number;
  limitValue: number;
  limitType: LimitType;
  resetPeriod: 'DAILY' | 'MONTHLY' | 'ANNUAL' | 'NEVER';
  lastResetAt: string;
  warningThreshold: number; // e.g. 0.8 (80%)
  hardStopThreshold: number; // e.g. 1.0 (100%)
  overageAllowed: boolean;
  overageRate: number;
  overageUnitsConsumed: number;
  status: UsageState;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  planVersion: number;
  packAssignments: {
    packId: string;
    packCode: string;
    assignmentType: PackAssignmentType;
    assignedAt: string;
    expiresAt?: string;
    price: number;
  }[];
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string;
  renewalDate: string;
  trialStart?: string;
  trialEnd?: string;
  graceEnd?: string;
  cancelAt?: string;
  cancelledAt?: string;
  price: number;
  currency: string;
  discount: number;
  tax: number;
  overage: number;
  seatCount: number;
  branchCount: number;
  paymentMethodReference?: string;
  contractReference?: string;
  autoRenew: boolean;
  version: number;
}

export interface TenantContext {
  tenantId: string;
  organizationId: string;
  branchId?: string;
  workspaceId?: string;
  userId: string;
  roleId: string;
  roles: string[];
  permissionSet: string[];
  dataScope: string;
  subscriptionId?: string;
  planId: string;
  packIds: string[];
  policyVersion: number;
  isPlatformAdmin: boolean;
}

export interface TenantBranding {
  tenantId: string;
  companyName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  accentColor: string;
  textColor?: string;
  backgroundColor?: string;
  typographyFont: string;
  buttonRadius: string;
  customCss?: string;
  emailHeaderHtml?: string;
  emailFooterHtml?: string;
  invoiceTemplateId?: string;
  voucherTemplateId?: string;
  portalWelcomeHeading?: string;
  portalWelcomeSubheading?: string;
  whiteLabelActive: boolean;
  updatedAt: string;
}

export interface TenantDomainRecord {
  id: string;
  tenantId: string;
  domain: string;
  domainType: 'ROOT' | 'SUBDOMAIN' | 'CUSTOM';
  status: DomainLifecycleState;
  dnsTxtVerificationCode: string;
  isVerified: boolean;
  sslActive: boolean;
  requestedAt: string;
  verifiedAt?: string;
}

export interface TenantAIGovernance {
  tenantId: string;
  tier: AITier;
  enabled: boolean;
  allowedModels: string[];
  allowedProviders: string[];
  maxDailyTokens: number;
  maxMonthlyBudgetUsd: number;
  consumedTokensToday: number;
  consumedCostThisMonthUsd: number;
  allowedTools: string[];
  allowedActions: string[];
  humanApprovalRequired: boolean;
  allowAutonomousBooking: boolean;
  dataAccessScope: string;
  allowModelTrainingOnData: boolean; // defaults to strictly false
  retentionDays: number;
  redactPii: boolean;
  updatedAt: string;
}

export interface SaaSEvent {
  eventId: string;
  tenantId: string;
  organizationId?: string;
  actor: {
    userId: string;
    email: string;
    role: string;
    ip?: string;
  };
  action: string;
  resource: string;
  resourceId?: string;
  version: number;
  timestamp: string;
  correlationId: string;
  payload: Record<string, any>;
  source: string;
}

export interface SaaSHealthMetrics {
  tenantId: string;
  overallScore: number; // 0 to 100
  status: HealthStatus;
  components: {
    auth: HealthStatus;
    database: HealthStatus;
    api: HealthStatus;
    search: HealthStatus;
    ai: HealthStatus;
    booking: HealthStatus;
    payments: HealthStatus;
    documents: HealthStatus;
    integrations: HealthStatus;
    storage: HealthStatus;
  };
  latencyMs: number;
  errorRate: number;
  lastCheckedAt: string;
}

export interface TenantTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  industry: TenantType;
  defaultPlanCode: string;
  recommendedPackCodes: string[];
  defaultWorkspaces: string[];
  defaultRoles: string[];
  defaultBranding: Partial<TenantBranding>;
  defaultLimits: Record<string, number>;
  defaultAITier: AITier;
}
